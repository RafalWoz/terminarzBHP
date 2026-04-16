import { db } from './index';

export async function addFirm(firm) {
  const now = new Date();
  return db.firms.add({
    ...firm,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateFirm(id, changes) {
  return db.firms.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteFirm(id) {
  // Cascading deletes for a Firm
  await db.transaction('rw', [db.firms, db.employees, db.trainings, db.medicals], async () => {
    await db.firms.delete(id);
    const employees = await db.employees.where('firmId').equals(id).toArray();
    for (const emp of employees) {
      await db.trainings.where('employeeId').equals(emp.id).delete();
      await db.medicals.where('employeeId').equals(emp.id).delete();
    }
    await db.employees.where('firmId').equals(id).delete();
  });
}

export async function getFirm(id) {
  return db.firms.get(id);
}

export async function getAllFirms() {
  return db.firms.orderBy('name').toArray();
}
