import Dexie from 'dexie';

export const db = new Dexie('TerminyBHP');

// M1: Version 1 with firms
// M2: Version 2 with employees, trainings, medicals
db.version(2).stores({
  firms: '++id, name, nip, createdAt',
  employees: '++id, firmId, lastName, [firmId+active]',
  trainings: '++id, employeeId, firmId, type, expiresAt',
  medicals: '++id, employeeId, firmId, type, expiresAt',
});
