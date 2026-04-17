/**
 * medicals.js — Encrypted CRUD repository for medical examinations
 */

import { db } from '../db';
import { encrypt, decrypt } from '../crypto';

export async function addMedical(data, key) {
  const { id, createdAt, ...sensitive } = data;
  const now = new Date().toISOString();
  const encryptedData = await encrypt(sensitive, key);
  return db.medicals.add({
    employeeId: data.employeeId,
    firmId: data.firmId,
    expiresAt: data.expiresAt || null,
    encryptedData,
    createdAt: now,
  });
}

export async function updateMedical(id, data, key) {
  const encryptedData = await encrypt(data, key);
  return db.medicals.update(id, {
    encryptedData,
    expiresAt: data.expiresAt || null,
    updatedAt: new Date().toISOString(),
  });
}

export async function getMedical(id, key) {
  const row = await db.medicals.get(id);
  if (!row) return null;
  const decrypted = await decrypt(row.encryptedData, key);
  return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
}

export async function getMedicalsByEmployee(employeeId, key) {
  const rows = await db.medicals.where('employeeId').equals(employeeId).toArray();
  const results = await Promise.all(rows.map(async (row) => {
    try {
      const decrypted = await decrypt(row.encryptedData, key);
      return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
    } catch (e) {
      console.warn(`[Storage] Skipping medical ${row.id} due to decryption failure:`, e);
      return null;
    }
  }));
  return results.filter(Boolean);
}

export async function getAllMedicals(key) {
  const rows = await db.medicals.toArray();
  const results = await Promise.all(rows.map(async (row) => {
    try {
      const decrypted = await decrypt(row.encryptedData, key);
      return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
    } catch (e) {
      console.warn(`[Storage] Skipping medical ${row.id} due to decryption failure:`, e);
      return null;
    }
  }));
  return results.filter(Boolean);
}

export async function getExpiringMedicals(withinDays, key) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  const rows = await db.medicals
    .where('expiresAt')
    .belowOrEqual(cutoff.toISOString())
    .toArray();
  const results = await Promise.all(rows.map(async (row) => {
    try {
      const decrypted = await decrypt(row.encryptedData, key);
      return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, ...decrypted };
    } catch (e) {
      console.warn(`[Storage] Skipping expiring medical ${row.id} due to decryption failure:`, e);
      return null;
    }
  }));
  return results.filter(Boolean);
}

export async function deleteMedical(id) {
  return db.medicals.delete(id);
}
