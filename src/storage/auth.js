/**
 * auth.js — Master password management
 *
 * Philosophy: the password is NEVER stored. We only store:
 * - a random salt (per-user)
 * - an encrypted "canary" value that proves the password is correct
 *
 * Rate limiting is enforced in-memory (resets on page reload, acceptable
 * for a local-first app where brute-force has no server to hit).
 */

import { db } from './db';
import { deriveKey, generateSalt, encrypt, decrypt } from './crypto';
import { setSessionKey } from './session';
import { addFirm } from './repositories/firms';
import { addEmployee } from './repositories/employees';
import { addTraining } from './repositories/trainings';
import { addMedical } from './repositories/medicals';
import { addAudit, addAuditItem } from './repositories/audits';

const CANARY_VALUE = 'TerminyBHP-auth-canary-2026';

// ─── Rate limiting state ──────────────────────────────────────────────────────
let failedAttempts = 0;
let lockedUntil = null;

function checkRateLimit() {
  if (lockedUntil && Date.now() < lockedUntil) {
    const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
    throw new Error(`RATE_LIMITED:${remaining}`);
  }
}

function recordFailedAttempt() {
  failedAttempts++;
  if (failedAttempts >= 10) {
    lockedUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
  } else if (failedAttempts >= 5) {
    lockedUntil = Date.now() + 30 * 1000; // 30 seconds
  }
}

function resetFailedAttempts() {
  failedAttempts = 0;
  lockedUntil = null;
}

export function getFailedAttempts() {
  return failedAttempts;
}

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * Check if the user has set up a password (first-run detection).
 */
export async function hasPasswordSetUp() {
  const record = await db.auth.get(1);
  return !!record;
}

/**
 * Set up the master password for the first time.
 * Generates salt, derives key, stores canary.
 * Returns the derived CryptoKey (should be placed in session).
 */
export async function setupPassword(password, hint = '') {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);

  const encryptionTest = await encrypt({ canary: CANARY_VALUE }, key);

  await db.auth.put({
    id: 1,
    salt: Array.from(salt),
    encryptionTest,
    hint: hint || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  setSessionKey(key);

  // Seed demo data
  await seedDemoData(key);

  return key;
}

async function seedDemoData(key) {
  try {
    const firmId = await addFirm({
      name: 'Firma Demonstracyjna Sp. z o.o.',
      nip: '0000000000',
      address: 'ul. Przykładowa 1, 00-000 Warszawa',
      phone: '123 456 789',
      email: 'demo@przyklad.pl',
      notes: 'To jest firma demonstracyjna. Możesz ją edytować lub skasować.'
    }, key);

    const empId = await addEmployee({
      firmId,
      firstName: 'Jan',
      lastName: 'Kowalski',
      position: 'Pracownik biurowy',
      department: 'Zarząd'
    }, key);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dateStr = nextMonth.toISOString().split('T')[0];

    await addTraining({
      firmId,
      employeeId: empId,
      type: 'okresowe',
      expiresAt: dateStr
    }, key);

    await addMedical({
      firmId,
      employeeId: empId,
      type: 'okresowe',
      expiresAt: dateStr
    }, key);

    const auditId = await addAudit({
      firmId,
      title: 'Przykładowy Raport z Audytu',
      type: 'okresowy',
      auditor: 'Główny Specjalista BHP',
      location: 'Siedziba Główna',
      scope: ['Ewakuacja i PPOŻ', 'Apteczki'],
      status: 'completed'
    }, key);

    await addAuditItem({
      auditId,
      pointId: 'Ewakuacja i PPOŻ',
      result: 'fail',
      risk: 'high',
      description: 'Zastawiona droga ewakuacyjna na korytarzu obok wejścia do magazynu. Przejście jest zablokowane paletami.',
      recommendation: 'Natychmiast usunąć palety z korytarza. Wyznaczyć w magazynie odpowiednią strefę odkładczą.',
      deadline: dateStr
    }, key);

    await addAuditItem({
      auditId,
      pointId: 'Apteczki',
      result: 'ok'
    }, key);

  } catch (e) {
    console.error('Failed to seed demo data:', e);
  }
}

/**
 * Verify the password and unlock the session.
 * Returns the CryptoKey on success, null on failure.
 * Throws on rate limiting.
 */
export async function verifyPassword(password) {
  checkRateLimit();

  const authRecord = await db.auth.get(1);
  if (!authRecord) throw new Error('NO_PASSWORD_SET');

  const salt = new Uint8Array(authRecord.salt);
  const key = await deriveKey(password, salt);

  try {
    const result = await decrypt(authRecord.encryptionTest, key);
    if (result.canary !== CANARY_VALUE) {
      throw new Error('Bad canary');
    }
    resetFailedAttempts();
    setSessionKey(key);
    return key;
  } catch {
    recordFailedAttempt();
    return null;
  }
}

/**
 * Get the password hint (if user set one).
 */
export async function getPasswordHint() {
  const record = await db.auth.get(1);
  return record?.hint || null;
}

/**
 * Change the master password.
 * Re-encrypts ALL data with the new key — this is a heavy operation.
 * Returns true on success.
 */
export async function changePassword(oldPassword, newPassword) {
  const authRecord = await db.auth.get(1);
  if (!authRecord) throw new Error('NO_PASSWORD_SET');

  // Verify old password first
  const oldSalt = new Uint8Array(authRecord.salt);
  const oldKey = await deriveKey(oldPassword, oldSalt);

  try {
    const test = await decrypt(authRecord.encryptionTest, oldKey);
    if (test.canary !== CANARY_VALUE) throw new Error('Bad canary');
  } catch {
    recordFailedAttempt();
    return false;
  }

  // Derive new key
  const newSalt = generateSalt();
  const newKey = await deriveKey(newPassword, newSalt);

  // Re-encrypt all tables
  await reEncryptTable(db.firms, oldKey, newKey);
  await reEncryptTable(db.employees, oldKey, newKey);
  await reEncryptTable(db.trainings, oldKey, newKey);
  await reEncryptTable(db.medicals, oldKey, newKey);
  await reEncryptTable(db.permits, oldKey, newKey);

  // Re-encrypt secureSettings (OAuth tokens)
  await reEncryptTable(db.secureSettings, oldKey, newKey, 'value');

  // Update auth record with new salt + new canary
  const newCanary = await encrypt({ canary: CANARY_VALUE }, newKey);
  await db.auth.put({
    ...authRecord,
    salt: Array.from(newSalt),
    encryptionTest: newCanary,
    updatedAt: new Date().toISOString(),
  });

  setSessionKey(newKey);
  return true;
}

/**
 * Re-encrypt all records in a table from oldKey to newKey.
 * The field `encryptedData` (or custom fieldName) holds the encrypted blob.
 */
async function reEncryptTable(table, oldKey, newKey, fieldName = 'encryptedData') {
  const rows = await table.toArray();
  const failures = [];
  for (const row of rows) {
    if (!row[fieldName]) continue;
    try {
      const plainData = await decrypt(row[fieldName], oldKey);
      const reEncrypted = await encrypt(plainData, newKey);
      await table.update(row.id, { [fieldName]: reEncrypted });
    } catch (e) {
      failures.push(row.id);
      console.error(`Re-encrypt failed for row ${row.id} in ${table.name}:`, e);
    }
  }
  if (failures.length > 0) {
    throw new Error(`Nie udało się przeszyfrować ${failures.length} rekordów w tabeli ${table.name}.`);
  }
}
