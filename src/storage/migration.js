/**
 * migration.js — Handles one-time migration from plaintext (v2) to encrypted (v3) schema
 *
 * Flow:
 * 1. Detect if old plaintext data exists (firms/employees have 'name' column directly)
 * 2. Auto-export plaintext backup to a file (safety net)
 * 3. Re-encrypt all rows with the provided key
 * 4. Clear the migration flag
 */

import { db } from './db';
import { encrypt } from './crypto';

/**
 * Returns true if migration from v2 plaintext schema is needed.
 */
export async function checkNeedsMigration() {
  const flag = await db.settings.get('needsMigration');
  return flag?.value === 'v2_to_v3';
}

/**
 * Count old plaintext records (for UI display).
 */
export async function countLegacyRecords() {
  const [firms, employees, trainings, medicals] = await Promise.all([
    db.firms.count(),
    db.employees.count(),
    db.trainings.count(),
    db.medicals.count(),
  ]);
  return { firms, employees, trainings, medicals };
}

/**
 * Export all existing (plaintext) data to a downloadable JSON file.
 * Called BEFORE migration as a safety net.
 */
export async function exportPlaintextBackup() {
  const [firms, employees, trainings, medicals] = await Promise.all([
    db.firms.toArray(),
    db.employees.toArray(),
    db.trainings.toArray(),
    db.medicals.toArray(),
  ]);

  const backup = {
    format: 'TerminyBHP-PreMigration-Backup',
    exportedAt: new Date().toISOString(),
    warning: 'Ten plik zawiera niezaszyfrowane dane osobowe! Zabezpiecz go po pobraniu.',
    data: { firms, employees, trainings, medicals },
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `terminybhp-premigration-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Main migration: re-encrypt all plaintext rows with the provided CryptoKey.
 * Returns a summary { firms, employees, trainings, medicals }.
 */
export async function runMigration(key) {
  const summary = { firms: 0, employees: 0, trainings: 0, medicals: 0 };

  // Migrate firms
  const firms = await db.firms.toArray();
  for (const row of firms) {
    if (row.encryptedData) continue; // already migrated
    const { id, createdAt, updatedAt, ...sensitive } = row;
    const now = new Date().toISOString();
    const encryptedData = await encrypt(sensitive, key);
    await db.firms.update(id, {
      encryptedData,
      createdAt: createdAt || now,
      updatedAt: updatedAt || createdAt || now,
      // Remove old plaintext fields
      name: undefined, nip: undefined, address: undefined,
      contactPerson: undefined, phone: undefined, email: undefined, notes: undefined,
    });
    summary.firms++;
  }

  // Migrate employees
  const employees = await db.employees.toArray();
  for (const row of employees) {
    if (row.encryptedData) continue;
    const { id, firmId, createdAt, updatedAt, ...sensitive } = row;
    const now = new Date().toISOString();
    const encryptedData = await encrypt(sensitive, key);
    await db.employees.update(id, {
      encryptedData,
      createdAt: createdAt || now,
      updatedAt: updatedAt || createdAt || now,
      firstName: undefined, lastName: undefined, position: undefined,
      hireDate: undefined, active: undefined, notes: undefined,
    });
    summary.employees++;
  }

  // Migrate trainings
  const trainings = await db.trainings.toArray();
  for (const row of trainings) {
    if (row.encryptedData) continue;
    const { id, employeeId, firmId, createdAt, expiresAt, ...sensitive } = row;
    const now = new Date().toISOString();
    const encryptedData = await encrypt(sensitive, key);
    await db.trainings.update(id, {
      encryptedData,
      createdAt: createdAt || now,
      expiresAt: expiresAt || null, // Ensure index is never undefined
      type: undefined, subtype: undefined, date: undefined, notes: undefined,
    });
    summary.trainings++;
  }

  // Migrate medicals
  const medicals = await db.medicals.toArray();
  for (const row of medicals) {
    if (row.encryptedData) continue;
    const { id, employeeId, firmId, createdAt, expiresAt, ...sensitive } = row;
    const now = new Date().toISOString();
    const encryptedData = await encrypt(sensitive, key);
    await db.medicals.update(id, {
      encryptedData,
      createdAt: createdAt || now,
      expiresAt: expiresAt || null, // Ensure index is never undefined
      type: undefined, date: undefined, doctorName: undefined, notes: undefined,
    });
    summary.medicals++;
  }

  // Migrate permits
  const permits = await db.permits.toArray();
  for (const row of permits) {
    if (row.encryptedData) continue;
    const { id, employeeId, firmId, createdAt, expiresAt, ...sensitive } = row;
    const now = new Date().toISOString();
    const encryptedData = await encrypt(sensitive, key);
    await db.permits.update(id, {
      encryptedData,
      createdAt: createdAt || now,
      expiresAt: expiresAt || null, // Ensure index is never undefined
      type: undefined, date: undefined,
    });
    // Add to summary if you want to track it (optional, permits was added later)
  }

  // Clear migration flag
  await db.settings.delete('needsMigration');

  return summary;
}
