/**
 * firms.js — Encrypted CRUD repository for firms
 */

import { db } from '../db';
import { encrypt, decrypt } from '../crypto';

export async function addFirm(firmData, key) {
  const { id, createdAt, updatedAt, ...sensitive } = firmData;
  const now = new Date().toISOString();
  const encryptedData = await encrypt(sensitive, key);
  return db.firms.add({ encryptedData, createdAt: now, updatedAt: now });
}

export async function updateFirm(id, firmData, key) {
  if (!id || isNaN(id)) {
    throw new Error('Nieprawidłowy identyfikator firmy (ID jest NaN lub puste).');
  }
  const { createdAt, ...sensitive } = firmData;
  const encryptedData = await encrypt(sensitive, key);
  return db.firms.update(id, { encryptedData, updatedAt: new Date().toISOString() });
}

export async function getFirm(id, key) {
  const row = await db.firms.get(id);
  if (!row) return null;
  const decrypted = await decrypt(row.encryptedData, key);
  return { id: row.id, createdAt: row.createdAt, updatedAt: row.updatedAt, ...decrypted };
}

export async function getAllFirms(key) {
  let rows;
  try {
    rows = await db.firms.orderBy('createdAt').toArray();
  } catch (e) {
    console.error('Błąd sortowania IndexedDB (brakujące klucze?), przełączam na tryb bezpieczny:', e);
    // Fallback: get all without ordering and sort in memory
    rows = await db.firms.toArray();
    rows.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }

  return Promise.all(
    rows.map(async (row) => {
      const decrypted = await decrypt(row.encryptedData, key);
      return { id: row.id, createdAt: row.createdAt, updatedAt: row.updatedAt, ...decrypted };
    })
  );
}

export async function deleteFirm(id) {
  // Cascade: delete all employees + their records
  await db.transaction('rw', [db.firms, db.employees, db.trainings, db.medicals, db.permits], async () => {
    const employees = await db.employees.where('firmId').equals(id).toArray();
    for (const emp of employees) {
      await db.trainings.where('employeeId').equals(emp.id).delete();
      await db.medicals.where('employeeId').equals(emp.id).delete();
      await db.permits.where('employeeId').equals(emp.id).delete();
    }
    await db.employees.where('firmId').equals(id).delete();
    await db.firms.delete(id);
  });
}

export async function searchFirms(query, key) {
  const all = await getAllFirms(key);
  const q = query.toLowerCase();
  return all.filter(
    (f) =>
      f.name?.toLowerCase().includes(q) ||
      f.nip?.includes(q) ||
      f.address?.toLowerCase().includes(q)
  );
}
