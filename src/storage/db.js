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

// ─── Version 4 — Sync Settings ──────────────────────────────────────────────
db.version(4).stores({
  firms:          '++id, createdAt, updatedAt',
  employees:      '++id, firmId, createdAt, updatedAt',
  trainings:      '++id, employeeId, firmId, expiresAt, createdAt',
  medicals:       '++id, employeeId, firmId, expiresAt, createdAt',
  permits:        '++id, employeeId, firmId, expiresAt, createdAt',
  auth:           'id',
  settings:       'key',
  secureSettings: 'key',
  sync_settings:  'provider', // Stores: provider ('google'|'local'|'none'), handle, token
});
