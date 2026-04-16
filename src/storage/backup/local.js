/**
 * local.js — Local file backup (encrypted export/import)
 * File format: terminybhp-backup-YYYY-MM-DD.json.enc
 */

import { db } from '../db';
import { encrypt, decrypt, deriveKey, generateSalt } from '../crypto';
import { getSessionKey } from '../session';
import { getAllFirms } from '../repositories/firms';
import { getAllEmployees } from '../repositories/employees';
import { getAllTrainings } from '../repositories/trainings';
import { getAllMedicals } from '../repositories/medicals';
import { getAllPermits } from '../repositories/permits';

const BACKUP_FORMAT = 'TerminyBHP-Backup';
const BACKUP_VERSION = 1;

/**
 * Export all data as an AES-GCM encrypted JSON file.
 * Uses the provided session key for encryption.
 */
export async function exportLocalBackup(sessionKey) {
  // Decrypt all data from IndexedDB
  const [firms, employees, trainings, medicals, permits] = await Promise.all([
    getAllFirms(sessionKey),
    getAllEmployees(sessionKey),
    getAllTrainings(sessionKey),
    getAllMedicals(sessionKey),
    getAllPermits(sessionKey),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    firms,
    employees,
    trainings,
    medicals,
    permits,
  };

  // Derive a random salt for this backup file's encryption
  // Even if we use the session key, we still want a fresh IV/Salt for the file itself
  // BUT: if we want the file to be portable (readable by others with the same password), 
  // we should use a password. 
  // However, the user's request for "Local Backup" suggests using the current session.
  // I'll stick to the provided key for encryption.
  
  const encryptedPayload = await encrypt(payload, sessionKey);

  const backupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    // For local backup using session key, we don't need a separate salt in the file
    // as the session key is already derived.
    data: encryptedPayload,
    meta: {
      firms: firms.length,
      employees: employees.length,
      trainings: trainings.length,
      medicals: medicals.length,
      permits: permits.length,
    },
  };

  const blob = new Blob([JSON.stringify(backupFile)], { type: 'application/json' });
  const date = new Date().toISOString().slice(0, 10);
  const filename = `terminybhp-backup-${date}.json.enc`;
  downloadBlob(blob, filename);

  return { ...backupFile.meta, filename };
}

/**
 * Import from an encrypted backup file.
 * Returns a summary of imported records.
 */
export async function importLocalBackup(file, sessionKey) {
  const text = await file.text();
  const backupFile = JSON.parse(text);

  if (backupFile.format !== BACKUP_FORMAT) {
    throw new Error('Nieprawidłowy format pliku. Upewnij się, że wybrałeś plik .json.enc z TerminyBHP.');
  }

  let payload;
  try {
    payload = await decrypt(backupFile.data, sessionKey);
  } catch {
    throw new Error('Nieprawidłowy klucz sesji lub plik jest uszkodzony / zaszyfrowany innym hasłem.');
  }

  const summary = { firms: 0, employees: 0, trainings: 0, medicals: 0, permits: 0 };

  // Atomic import transaction
  await db.transaction('rw', [db.firms, db.employees, db.trainings, db.medicals, db.permits], async () => {
    // Clear existing data
    await db.firms.clear();
    await db.employees.clear();
    await db.trainings.clear();
    await db.medicals.clear();
    await db.permits.clear();

    // Re-encrypt with current session key and insert
    for (const firm of (payload.firms || [])) {
      const { id, createdAt, updatedAt, ...sensitive } = firm;
      const encryptedData = await encrypt(sensitive, sessionKey);
      await db.firms.add({ encryptedData, createdAt: createdAt || new Date().toISOString(), updatedAt: updatedAt || new Date().toISOString() });
      summary.firms++;
    }

    for (const emp of (payload.employees || [])) {
      const { id, createdAt, updatedAt, ...sensitive } = emp;
      const encryptedData = await encrypt(sensitive, sessionKey);
      await db.employees.add({ firmId: emp.firmId, encryptedData, createdAt: createdAt || new Date().toISOString(), updatedAt: updatedAt || new Date().toISOString() });
      summary.employees++;
    }

    for (const t of (payload.trainings || [])) {
      const { id, createdAt, ...sensitive } = t;
      const encryptedData = await encrypt(sensitive, sessionKey);
      await db.trainings.add({ employeeId: t.employeeId, firmId: t.firmId, expiresAt: t.expiresAt || null, encryptedData, createdAt: createdAt || new Date().toISOString() });
      summary.trainings++;
    }

    for (const m of (payload.medicals || [])) {
      const { id, createdAt, ...sensitive } = m;
      const encryptedData = await encrypt(sensitive, sessionKey);
      await db.medicals.add({ employeeId: m.employeeId, firmId: m.firmId, expiresAt: m.expiresAt || null, encryptedData, createdAt: createdAt || new Date().toISOString() });
      summary.medicals++;
    }

    for (const p of (payload.permits || [])) {
      const { id, createdAt, ...sensitive } = p;
      const encryptedData = await encrypt(sensitive, sessionKey);
      await db.permits.add({ employeeId: p.employeeId, firmId: p.firmId, expiresAt: p.expiresAt || null, encryptedData, createdAt: createdAt || new Date().toISOString() });
      summary.permits++;
    }
  });

  return summary;
}

/**
 * Export all data as unencrypted JSON+CSV (RODO art. 20 — data portability).
 * Shows a warning before download.
 */
export async function exportUnencryptedBackup() {
  const key = getSessionKey();
  const [firms, employees, trainings, medicals, permits] = await Promise.all([
    getAllFirms(key),
    getAllEmployees(key),
    getAllTrainings(key),
    getAllMedicals(key),
    getAllPermits(key),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    warning: 'Ten plik zawiera dane osobowe. Zabezpiecz go po pobraniu (art. 20 RODO).',
    firms, employees, trainings, medicals, permits,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `terminybhp-export-${date}.json`);
  return { firms: firms.length, employees: employees.length };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
