/**
 * db.js — Dexie schema (v4)
 */

import Dexie from 'dexie';

export const db = new Dexie('TerminyBHP');

// ─── Version 1 (legacy) ──────────────────────────────────────────────────────
db.version(1).stores({
  firms: '++id, name, nip, createdAt',
});

// ─── Version 2 (legacy) ──────────────────────────────────────────────────────
db.version(2).stores({
  firms: '++id, name, nip, createdAt',
  employees: '++id, firmId, lastName, [firmId+active]',
  trainings: '++id, employeeId, firmId, type, expiresAt',
  medicals: '++id, employeeId, firmId, type, expiresAt',
});

// ─── Version 3 — encrypted schema ───────────────────────────────────────────
db.version(3).stores({
  firms:          '++id, createdAt, updatedAt',
  employees:      '++id, firmId, createdAt, updatedAt',
  trainings:      '++id, employeeId, firmId, expiresAt, createdAt',
  medicals:       '++id, employeeId, firmId, expiresAt, createdAt',
  permits:        '++id, employeeId, firmId, expiresAt, createdAt',
  auth:           'id',
  settings:       'key',
  secureSettings: 'key',
});

// ─── Version 4 — Sync Settings ──────────────────────────────────────────────
db.version(4).stores({
  sync_settings:  'provider', // Stores: provider ('google'|'local'|'none'), handle, token
});

// ─── Version 5 — Audits & Checklists ─────────────────────────────────────────
db.version(5).stores({
  audits:        '++id, firmId, status, createdAt',
  audit_items:   '++id, auditId',
  audit_photos:  '++id, auditId',
});
