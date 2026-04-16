/**
 * dataErasure.js — RODO Art. 17: Right to erasure ("right to be forgotten")
 *
 * Wipes ALL local data: IndexedDB, localStorage, sessionStorage,
 * Service Workers, and Browser Cache Storage.
 *
 * Does NOT delete Google Drive backups — the user must do that manually.
 */

import { db } from '../db';

/**
 * Erase all data from the application.
 * Requires the user to type the exact phrase "USUŃ WSZYSTKO" as confirmation.
 *
 * @param {string} confirmationPhrase - must equal "USUŃ WSZYSTKO"
 */
export async function eraseAllData(confirmationPhrase) {
  if (confirmationPhrase !== 'USUŃ WSZYSTKO') {
    throw new Error('Nieprawidłowa fraza potwierdzenia. Wpisz dokładnie: USUŃ WSZYSTKO');
  }

  try {
    // 1. Delete IndexedDB database
    await db.delete();
  } catch (e) {
    console.error('Failed to delete IndexedDB:', e);
  }

  try {
    // 2. Clear localStorage (preferences, flags)
    localStorage.clear();
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }

  try {
    // 3. Clear sessionStorage
    sessionStorage.clear();
  } catch (e) {
    console.error('Failed to clear sessionStorage:', e);
  }

  try {
    // 4. Unregister all Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
  } catch (e) {
    console.error('Failed to unregister Service Workers:', e);
  }

  try {
    // 5. Clear all Cache Storage (PWA cache)
    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    console.error('Failed to clear cache storage:', e);
  }

  // 6. Reload — app will start fresh showing SetPasswordScreen
  window.location.reload();
}
