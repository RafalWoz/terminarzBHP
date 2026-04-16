/**
 * db.js — Dexie schema (v3) with encrypted data support
 *
 * Schema design principles:
 * - Personal data is stored ONLY in `encryptedData` blobs (AES-GCM)
 * - Index fields contain NO personal data (only IDs, timestamps, booleans)
 * - `settings` table stores non-sensitive preferences only
 * - `secureSettings` stores OAuth tokens (encrypted)
 * - `auth` stores salt + canary for password verification
 */

import Dexie from 'dexie';

export const db = new Dexie('TerminyBHP');

// ─── Version 1 (legacy) ──────────────────────────────────────────────────────
db.version(1).stores({
  firms: '++id, name, nip, createdAt',
});

// ─── Version 2 (legacy) with employees/trainings/medicals ───────────────────
db.version(2).stores({
  firms: '++id, name, nip, createdAt',
  employees: '++id, firmId, lastName, [firmId+active]',
  trainings: '++id, employeeId, firmId, type, expiresAt',
  medicals: '++id, employeeId, firmId, type, expiresAt',
});

// ─── Version 3 — encrypted schema ───────────────────────────────────────────
db.version(3).stores({
  // encryptedData: { iv, ciphertext } blob — contains all personal fields
  firms:          '++id, createdAt, updatedAt',
  employees:      '++id, firmId, createdAt, updatedAt',
  trainings:      '++id, employeeId, firmId, expiresAt, createdAt',
  medicals:       '++id, employeeId, firmId, expiresAt, createdAt',
  permits:        '++id, employeeId, firmId, expiresAt, createdAt',

  // Auth — stores salt + canary for password verification (no plaintext password)
  auth:           'id',

  // Settings — non-sensitive preferences (lock timeout, language, etc.)
  settings:       'key',

  // SecureSettings — encrypted blobs (OAuth tokens, etc.)
  secureSettings: 'key',
}).upgrade(async (tx) => {
  // Mark existing plaintext records as needing migration
  // The migration.js module handles the actual re-encryption
  await tx.table('settings').put({
    key: 'needsMigration',
    value: 'v2_to_v3',
  });
});
