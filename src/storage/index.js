/**
 * storage/index.js — Public API for the entire storage module
 *
 * Import everything from here — do NOT import from internal modules directly.
 *
 * Usage example:
 *   import { addFirm, getAllFirms, setupPassword, exportBackup } from '../storage';
 */

// Core
export { db } from './db';
export { deriveKey, generateSalt, encrypt, decrypt, validatePasswordStrength } from './crypto';
export { setSessionKey, getSessionKey, isUnlocked, lockSession, onLock, setLockTimeout, loadLockTimeout } from './session';
export {
  hasPasswordSetUp,
  setupPassword,
  verifyPassword,
  getPasswordHint,
  changePassword,
  getFailedAttempts,
} from './auth';

// Repositories
export {
  addFirm, updateFirm, getFirm, getAllFirms, deleteFirm, searchFirms,
} from './repositories/firms';

export {
  addEmployee, updateEmployee, getEmployee, getEmployeesByFirm, getAllEmployees, deleteEmployee,
} from './repositories/employees';

export {
  addTraining, updateTraining, getTraining, getTrainingsByEmployee, getAllTrainings,
  getExpiringTrainings, deleteTraining,
} from './repositories/trainings';

export {
  addMedical, updateMedical, getMedical, getMedicalsByEmployee, getAllMedicals,
  getExpiringMedicals, deleteMedical,
} from './repositories/medicals';

export {
  addPermit, updatePermit, getPermit, getPermitsByEmployee, getAllPermits,
  getExpiringPermits, deletePermit,
} from './repositories/permits';

export {
  addAudit, getAudit, getAuditsByFirm, getAllAudits, addAuditItem, getAuditItems, getAllAuditItems, addAuditPhoto, getAuditPhotos, getAllAuditPhotos, AUDIT_TEMPLATES, getCustomTemplates, saveCustomTemplates
} from './repositories/audits';

// Backup
export { exportLocalBackup, importLocalBackup, exportUnencryptedBackup } from './backup/local';

// RODO
export { exportUserData } from './rodo/dataExport';
export { eraseAllData } from './rodo/dataErasure';

// Migration
export { checkNeedsMigration, runMigration } from './migration';

// Sync & Storage Drivers
export { 
  initSyncManager, 
  setSyncProvider, 
  pushToRemote, 
  pullFromRemote 
} from './sync/syncManager';
export { FileSystemDriver } from './sync/drivers/FileSystemDriver';
