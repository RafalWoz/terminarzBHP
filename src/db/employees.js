import { db } from './index';

export async function addEmployee(employee) {
  return db.employees.add({
    ...employee,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateEmployee(id, changes) {
  return db.employees.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteEmployee(id) {
  return db.transaction('rw', [db.employees, db.trainings, db.medicals], async () => {
    await db.trainings.where('employeeId').equals(id).delete();
    await db.medicals.where('employeeId').equals(id).delete();
    await db.employees.delete(id);
  });
}

export async function getEmployee(id) {
  return db.employees.get(id);
}

export async function getEmployeesByFirm(firmId) {
  return db.employees.where('firmId').equals(parseInt(firmId)).toArray();
}
