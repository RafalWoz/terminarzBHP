/**
 * syncManager.js — Orchestrates data synchronization between local IndexedDB and external storage (GDrive/LocalFS).
 */

import { db } from '../db';
import { exportLocalBackup, importLocalBackup } from '../backup/local';
import { getSessionKey, isUnlocked } from '../session';
import { FileSystemDriver } from './drivers/FileSystemDriver';

let activeDriver = null;
let syncTimeout = null;
let syncHooksRegistered = false;

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

  if (syncSettings.provider === 'local' && syncSettings.config?.handle) {
    activeDriver = new FileSystemDriver(syncSettings.config.handle);
  }

  if (!syncHooksRegistered) {
    db.tables.forEach(table => {
      table.hook('creating', triggerAutoSync);
      table.hook('updating', triggerAutoSync);
      table.hook('deleting', triggerAutoSync);
    });
    syncHooksRegistered = true;
  }

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
    const blob = await exportLocalBackup(key, true); 
    await activeDriver.save(blob);
    console.log('[Sync] Push successful');
  } catch (e) {
    console.warn('[Sync] Auto-push failed (often normal if background permission missing):', e.message);
  }
}

export function triggerAutoSync() {
  if (!activeDriver || !isUnlocked()) return;
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(() => {
    pushToRemote();
  }, 1500); 
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
      config,
      updatedAt: new Date().toISOString()
    });
  });
  
  await initSyncManager();
  await pushToRemote(); // Immediate push to new provider
}
