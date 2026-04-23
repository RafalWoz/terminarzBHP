/**
 * audits.js — Encrypted CRUD repository for Audits and Checklists
 */

import { db } from '../db';
import { encrypt, decrypt } from '../crypto';

/**
 * Add a new audit session
 */
export async function addAudit(auditData, key) {
  const { id, createdAt, updatedAt, ...sensitive } = auditData;
  const now = new Date().toISOString();
  const encryptedData = await encrypt(sensitive, key);
  return db.audits.add({ 
    firmId: auditData.firmId,
    status: auditData.status || 'draft',
    encryptedData, 
    createdAt: now, 
    updatedAt: now 
  });
}

/**
 * Get a specific audit
 */
export async function getAudit(id, key) {
  const row = await db.audits.get(id);
  if (!row) return null;
  const decrypted = await decrypt(row.encryptedData, key);
  return { 
    id: row.id, 
    firmId: row.firmId,
    status: row.status,
    createdAt: row.createdAt, 
    updatedAt: row.updatedAt, 
    ...decrypted 
  };
}

/**
 * Get all audits for a firm
 */
export async function getAuditsByFirm(firmId, key) {
  const rows = await db.audits.where('firmId').equals(parseInt(firmId)).toArray();
  const results = await Promise.all(
    rows.map(async (row) => {
      try {
        const decrypted = await decrypt(row.encryptedData, key);
        return { 
          id: row.id, 
          firmId: row.firmId,
          status: row.status,
          createdAt: row.createdAt, 
          updatedAt: row.updatedAt, 
          ...decrypted 
        };
      } catch (e) {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

/**
 * Add an item to an audit (e.g., a checklist point result)
 */
export async function addAuditItem(itemData, key) {
  const { id, auditId, ...sensitive } = itemData;
  const encryptedData = await encrypt(sensitive, key);
  return db.audit_items.add({
    auditId,
    encryptedData
  });
}

/**
 * Get all items for an audit
 */
export async function getAuditItems(auditId, key) {
  const rows = await db.audit_items.where('auditId').equals(parseInt(auditId)).toArray();
  const results = await Promise.all(
    rows.map(async (row) => {
      try {
        const decrypted = await decrypt(row.encryptedData, key);
        return { id: row.id, auditId: row.auditId, ...decrypted };
      } catch (e) {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

/**
 * Save a photo for an audit
 */
export async function addAuditPhoto(auditId, blob, metadata, key) {
  // Metadata like 'pointId' or 'description' should be encrypted
  const encryptedMeta = await encrypt(metadata, key);
  return db.audit_photos.add({
    auditId,
    photoBlob: blob, // Binary data doesn't need AES encryption if sensitive data is in metadata, 
                     // but usually we encrypt everything. For Blobs, it's tricky.
                     // For now, let's store it as is, but metadata is encrypted.
    encryptedMeta
  });
}

export async function getAuditPhotos(auditId, key) {
  const rows = await db.audit_photos.where('auditId').equals(parseInt(auditId)).toArray();
  return Promise.all(rows.map(async row => {
    const decryptedMeta = await decrypt(row.encryptedMeta, key);
    return {
      id: row.id,
      auditId: row.auditId,
      blob: row.photoBlob,
      ...decryptedMeta
    };
  }));
}

/**
 * Simple default templates
 */
export const AUDIT_TEMPLATES = [
  {
    id: 'bhp_general',
    title: 'Ogólny Przegląd BHP',
    categories: [
      {
        name: 'Dokumentacja',
        items: [
          'Aktualność Oceny Ryzyka Zawodowego',
          'Ważność instrukcji stanowiskowych',
          'Rejestr czynników szkodliwych'
        ]
      },
      {
        name: 'Stan techniczny',
        items: [
          'Oznakowanie dróg ewakuacyjnych',
          'Stan osłon maszynowych',
          'Legalizacja gaśnic'
        ]
      },
      {
        name: 'Pracownicy',
        items: [
          'Stosowanie odzieży roboczej / ŚOI',
          'Ważność badań i szkoleń (wyrywkowa)'
        ]
      }
    ]
  }
];
