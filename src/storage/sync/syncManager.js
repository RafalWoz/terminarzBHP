/**
 * syncManager.js — Orchestrates data synchronization between local IndexedDB and external storage (GDrive/LocalFS).
 */

import { db } from '../db';
import { exportLocalBackup, importLocalBackup } from '../backup/local';
import { getSessionKey, isUnlocked } from '../session';

let activeDriver = null;

/**
 * Initialize the sync manager on app startup.
 * Loads the saved provider and tries to re-establish connection.
 */
export async function initSyncManager() {
  const syncSettings = await db.sync_settings.toCollection().first();
  if (!syncSettings || syncSettings.provider === 'none') {
    activeDriver = null;
    return;
  }

  // Future implementation: load specific driver based on syncSettings.provider
  // For now, we return the settings to the UI
  return syncSettings;
}

/**
 * Perform a full push (Local -> Remote).
 * Usually called after data changes.
 */
export async function pushToRemote() {
  if (!activeDriver || !isUnlocked()) return;
  
  try {
    const key = getSessionKey();
    const blob = await exportLocalBackup(key, true); // Get blob instead of download
    await activeDriver.save(blob);
    console.log('[Sync] Push successful');
  } catch (e) {
    console.error('[Sync] Push failed:', e);
  }
}

/**
 * Perform a full pull (Remote -> Local).
 * Usually called on app start or manual refresh.
 */
export async function pullFromRemote() {
  if (!activeDriver || !isUnlocked()) return;

  try {
    const key = getSessionKey();
    const blob = await activeDriver.load();
    if (blob) {
      await importLocalBackup(blob, key);
      console.log('[Sync] Pull/Import successful');
    }
  } catch (e) {
    console.error('[Sync] Pull failed:', e);
  }
}

/**
 * Setup a new sync provider.
 */
export async function setSyncProvider(provider, config = {}) {
  await db.transaction('rw', db.sync_settings, async () => {
    await db.sync_settings.clear();
    await db.sync_settings.add({
      provider,
      ...config,
      updatedAt: new Date().toISOString()
    });
  });
  
  // Re-init with new driver (to be implemented)
}
