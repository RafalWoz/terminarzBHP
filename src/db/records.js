import { db } from './index';

export async function addRecord(table, record) {
  return db[table].add({
    ...record,
    createdAt: new Date(),
  });
}

export async function deleteRecord(table, id) {
  return db[table].delete(id);
}

export async function getRecordsByEmployee(employeeId) {
  const [trainings, medicals] = await Promise.all([
    db.trainings.where('employeeId').equals(parseInt(employeeId)).toArray(),
    db.medicals.where('employeeId').equals(parseInt(employeeId)).toArray(),
  ]);
  
  return { trainings, medicals };
}
