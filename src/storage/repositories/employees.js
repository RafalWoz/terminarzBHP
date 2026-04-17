/**
 * employees.js — Encrypted CRUD repository for employees
 */

import { db } from '../db';
import { encrypt, decrypt } from '../crypto';

export async function addEmployee(data, key) {
  const { id, createdAt, updatedAt, ...sensitive } = data;
  const now = new Date().toISOString();
  const encryptedData = await encrypt(sensitive, key);
  return db.employees.add({ firmId: data.firmId, encryptedData, createdAt: now, updatedAt: now });
}

export async function updateEmployee(id, data, key) {
  if (!id || isNaN(id)) {
    throw new Error('Nieprawidłowy identyfikator pracownika (ID jest NaN lub puste).');
  }
  const encryptedData = await encrypt(data, key);
  return db.employees.update(id, { encryptedData, updatedAt: new Date().toISOString() });
}

export async function getEmployee(id, key) {
  const row = await db.employees.get(id);
  if (!row) return null;
  const decrypted = await decrypt(row.encryptedData, key);
  return { id: row.id, firmId: row.firmId, createdAt: row.createdAt, ...decrypted };
}

export async function getEmployeesByFirm(firmId, key) {
  const rows = await db.employees.where('firmId').equals(firmId).toArray();
  const results = await Promise.all(
    rows.map(async (row) => {
      try {
        const decrypted = await decrypt(row.encryptedData, key);
        return { id: row.id, firmId: row.firmId, createdAt: row.createdAt, ...decrypted };
      } catch (e) {
        console.warn(`[Storage] Skipping employee ${row.id} due to decryption failure:`, e);
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function getAllEmployees(key) {
  const rows = await db.employees.toArray();
  const results = await Promise.all(
    rows.map(async (row) => {
      try {
        const decrypted = await decrypt(row.encryptedData, key);
        return { id: row.id, firmId: row.firmId, createdAt: row.createdAt, ...decrypted };
      } catch (e) {
        console.warn(`[Storage] Skipping employee ${row.id} due to decryption failure:`, e);
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function deleteEmployee(id) {
  await db.transaction('rw', [db.employees, db.trainings, db.medicals, db.permits], async () => {
    await db.trainings.where('employeeId').equals(id).delete();
    await db.medicals.where('employeeId').equals(id).delete();
    await db.permits.where('employeeId').equals(id).delete();
    await db.employees.delete(id);
  });
}
