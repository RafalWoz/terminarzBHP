/**
 * permits.js — Encrypted CRUD repository for work permits (UDT, SEP, etc.)
 */

import { db } from '../db';
import { encrypt, decrypt } from '../crypto';

export async function addPermit(data, key) {
  const { id, createdAt, ...sensitive } = data;
  const now = new Date().toISOString();
  const encryptedData = await encrypt(sensitive, key);
  return db.permits.add({
    employeeId: data.employeeId,
    firmId: data.firmId,
    expiresAt: data.expiresAt || null,
    encryptedData,
    createdAt: now,
  });
}

export async function updatePermit(id, data, key) {
  const encryptedData = await encrypt(data, key);
  return db.permits.update(id, {
    encryptedData,
    expiresAt: data.expiresAt || null,
    updatedAt: new Date().toISOString(),
  });
}

export async function getPermit(id, key) {
  const row = await db.permits.get(id);
  if (!row) return null;
  const decrypted = await decrypt(row.encryptedData, key);
  return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
}

export async function getPermitsByEmployee(employeeId, key) {
  const rows = await db.permits.where('employeeId').equals(employeeId).toArray();
  return Promise.all(rows.map(async (row) => {
    const decrypted = await decrypt(row.encryptedData, key);
    return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
  }));
}

export async function getAllPermits(key) {
  const rows = await db.permits.toArray();
  return Promise.all(rows.map(async (row) => {
    const decrypted = await decrypt(row.encryptedData, key);
    return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, createdAt: row.createdAt, ...decrypted };
  }));
}

export async function getExpiringPermits(withinDays, key) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  const rows = await db.permits
    .where('expiresAt')
    .belowOrEqual(cutoff.toISOString())
    .toArray();
  return Promise.all(rows.map(async (row) => {
    const decrypted = await decrypt(row.encryptedData, key);
    return { id: row.id, employeeId: row.employeeId, firmId: row.firmId, expiresAt: row.expiresAt, ...decrypted };
  }));
}

export async function deletePermit(id) {
  return db.permits.delete(id);
}
