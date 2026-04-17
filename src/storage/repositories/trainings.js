/**
 * trainings.js — Encrypted CRUD repository for BHP trainings
 */

import { db } from '../db';
import { encrypt, decrypt } from '../crypto';

export async function addTraining(data, key) {
  const { id, createdAt, ...sensitive } = data;
  const now = new Date().toISOString();
  const encryptedData = await encrypt(sensitive, key);
  return db.trainings.add({
    employeeId: data.employeeId,
    firmId: data.firmId,
    expiresAt: data.expiresAt || null,
    encryptedData,
    createdAt: now,
  });
}

export async function updateTraining(id, data, key) {
  const encryptedData = await encrypt(data, key);
  return db.trainings.update(id, {
    encryptedData,
    expiresAt: data.expiresAt || null,
    updatedAt: new Date().toISOString(),
  });
}

export async function getTraining(id, key) {
  const row = await db.trainings.get(id);
  if (!row) return null;
  const decrypted = await decrypt(row.encryptedData, key);
  return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
}

export async function getTrainingsByEmployee(employeeId, key) {
  const rows = await db.trainings.where('employeeId').equals(employeeId).toArray();
  const results = await Promise.all(rows.map(async (row) => {
    try {
      const decrypted = await decrypt(row.encryptedData, key);
      return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
    } catch (e) {
      console.warn(`[Storage] Skipping training ${row.id} due to decryption failure:`, e);
      return null;
    }
  }));
  return results.filter(Boolean);
}

export async function getAllTrainings(key) {
  const rows = await db.trainings.toArray();
  const results = await Promise.all(rows.map(async (row) => {
    try {
      const decrypted = await decrypt(row.encryptedData, key);
      return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
    } catch (e) {
      console.warn(`[Storage] Skipping training ${row.id} due to decryption failure:`, e);
      return null;
    }
  }));
  return results.filter(Boolean);
}

export async function getExpiringTrainings(withinDays, key) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  const rows = await db.trainings
    .where('expiresAt')
    .belowOrEqual(cutoff.toISOString())
    .toArray();
  const results = await Promise.all(rows.map(async (row) => {
    try {
      const decrypted = await decrypt(row.encryptedData, key);
      return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, ...decrypted };
    } catch (e) {
      console.warn(`[Storage] Skipping expiring training ${row.id} due to decryption failure:`, e);
      return null;
    }
  }));
  return results.filter(Boolean);
}

export async function deleteTraining(id) {
  return db.trainings.delete(id);
}
