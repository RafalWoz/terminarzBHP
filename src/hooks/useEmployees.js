import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getExpirationStatus } from '../utils/expirations';

export function useEmployees(firmId) {
  return useLiveQuery(async () => {
    if (!firmId) return [];
    
    // Get employees
    const employees = await db.employees.where('firmId').equals(parseInt(firmId)).toArray();
    
    // For each employee, get their most critical status
    const enrichedEmployees = await Promise.all(employees.map(async (emp) => {
      const trainings = await db.trainings.where('employeeId').equals(emp.id).toArray();
      const medicals = await db.medicals.where('employeeId').equals(emp.id).toArray();
      
      const allRecords = [...trainings, ...medicals];
      const statuses = allRecords.map(r => getExpirationStatus(r.expiresAt));
      
      let finalStatus = 'ok';
      if (statuses.includes('expired')) finalStatus = 'expired';
      else if (statuses.includes('critical')) finalStatus = 'critical';
      else if (statuses.includes('warning')) finalStatus = 'warning';
      else if (allRecords.length === 0) finalStatus = 'none';
      
      return { ...emp, status: finalStatus, recordCount: allRecords.length };
    }));
    
    return enrichedEmployees;
  }, [firmId]);
}

export function useEmployee(id) {
  return useLiveQuery(() => db.employees.get(parseInt(id)), [id]);
}
