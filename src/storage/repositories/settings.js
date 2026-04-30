/**
 * settings.js — Encrypted repository for general app/user settings
 */

import { db } from '../db';
import { encrypt, decrypt } from '../crypto';

export async function getConsultantInfo(key) {
  const row = await db.secureSettings.get('consultant_info');
  if (!row) return null;
  try {
    return await decrypt(row.encryptedData, key);
  } catch (e) {
    console.error('Failed to decrypt consultant info:', e);
    return null;
  }
}

export async function saveConsultantInfo(info, key) {
  const encryptedData = await encrypt(info, key);
  await db.secureSettings.put({ key: 'consultant_info', encryptedData });
}
