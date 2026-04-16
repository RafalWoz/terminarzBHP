/**
 * session.js — In-memory encryption key management
 *
 * SECURITY RULES:
 * - The CryptoKey NEVER leaves this module's memory.
 * - It is NEVER written to localStorage, sessionStorage, or IndexedDB.
 * - All pages/components access it only through getSessionKey().
 */

let sessionKey = null;
let lastActivity = Date.now();
let lockTimeout = 15 * 60 * 1000; // 15 minutes default
let onLockCallback = null;

/**
 * Store the derived CryptoKey in memory after successful login.
 */
export function setSessionKey(key) {
  sessionKey = key;
  lastActivity = Date.now();
}

/**
 * Retrieve the key. Throws if locked or session expired.
 * Also refreshes the last-activity timestamp.
 */
export function getSessionKey() {
  if (!sessionKey) {
    throw new Error('APP_LOCKED');
  }
  if (Date.now() - lastActivity > lockTimeout) {
    lockSession();
    throw new Error('SESSION_EXPIRED');
  }
  lastActivity = Date.now();
  return sessionKey;
}

/**
 * Check if the app is currently unlocked (non-throwing).
 */
export function isUnlocked() {
  if (!sessionKey) return false;
  if (Date.now() - lastActivity > lockTimeout) {
    lockSession();
    return false;
  }
  return true;
}

/**
 * Lock the application. Clears the in-memory key.
 * The user will need to re-enter their password.
 */
export function lockSession() {
  sessionKey = null;
  if (typeof onLockCallback === 'function') {
    onLockCallback();
  }
}

/**
 * Register a callback to be called whenever the app locks.
 * Used by React to trigger a re-render showing the UnlockScreen.
 */
export function onLock(callback) {
  onLockCallback = callback;
}

/**
 * Configure the auto-lock timeout.
 * @param {number|null} minutes — null means "never lock"
 */
export function setLockTimeout(minutes) {
  lockTimeout = minutes === null ? Infinity : minutes * 60 * 1000;
  // Persist preference (not sensitive data)
  localStorage.setItem('terminybhp_lock_timeout', minutes === null ? 'never' : String(minutes));
}

/**
 * Load timeout preference from localStorage.
 */
export function loadLockTimeout() {
  const stored = localStorage.getItem('terminybhp_lock_timeout');
  if (!stored || stored === 'never') {
    lockTimeout = Infinity;
  } else {
    lockTimeout = parseInt(stored, 10) * 60 * 1000;
  }
}

// ─── Activity tracking ────────────────────────────────────────────────────────
// Reset inactivity timer on any user interaction
['click', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach((event) => {
  document.addEventListener(event, () => {
    if (sessionKey) lastActivity = Date.now();
  }, { passive: true });
});

// Check every 60 seconds if session has expired
setInterval(() => {
  if (sessionKey && lockTimeout !== Infinity && Date.now() - lastActivity > lockTimeout) {
    lockSession();
  }
}, 60_000);
