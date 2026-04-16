/**
 * AuthContext.jsx — React context providing authentication state to the entire app.
 *
 * This is the single source of truth for:
 * - Whether a password has been set up
 * - Whether the app is currently unlocked
 * - Whether legacy data migration is needed
 *
 * Usage: wrap <App> with <AuthProvider>, then use useAuth() in any component.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../storage/db';
import { hasPasswordSetUp } from '../storage/auth';
import { isUnlocked, onLock, loadLockTimeout } from '../storage/session';
import { checkNeedsMigration } from '../storage/migration';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'no-password' | 'locked' | 'migrating' | 'unlocked'

  const checkStatus = useCallback(async () => {
    try {
      // 1. Check if storage/sync is configured
      const sync = await db.sync_settings.toCollection().first();
      const hasPassword = await hasPasswordSetUp();

      if (!sync || !hasPassword) {
        setStatus('onboarding');
        return;
      }

      if (!isUnlocked()) {
        setStatus('locked');
        return;
      }

      // Check if migration from plaintext v2 is needed
      const needsMigration = await checkNeedsMigration();
      if (needsMigration) {
        setStatus('migrating');
        return;
      }

      setStatus('unlocked');
    } catch (e) {
      console.error('Auth check failed:', e);
      setStatus('locked');
    }
  }, []);

  useEffect(() => {
    loadLockTimeout();

    // Register lock callback — when auto-lock fires, re-check status
    onLock(() => setStatus('locked'));

    checkStatus();
  }, [checkStatus]);

  const handleUnlocked = useCallback(async () => {
    const needsMigration = await checkNeedsMigration();
    setStatus(needsMigration ? 'migrating' : 'unlocked');
  }, []);

  const handleMigrationComplete = useCallback(() => {
    setStatus('unlocked');
  }, []);

  const handlePasswordSet = useCallback(async () => {
    const needsMigration = await checkNeedsMigration();
    setStatus(needsMigration ? 'migrating' : 'unlocked');
  }, []);

  return (
    <AuthContext.Provider value={{
      status,
      onUnlocked: handleUnlocked,
      onPasswordSet: handlePasswordSet,
      onMigrationComplete: handleMigrationComplete,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
