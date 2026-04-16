import { useLiveQuery } from 'dexie-react-hooks';
import { 
  getEmployeesByFirm, 
  getEmployee,
  getTrainingsByEmployee, 
  getMedicalsByEmployee, 
  getSessionKey, 
  isUnlocked 
} from '../storage';
import { getExpirationStatus } from '../utils/expirations';

export function useEmployees(firmId) {
  return useLiveQuery(async () => {
    if (!firmId || !isUnlocked()) return [];
    const key = getSessionKey();
    
    // Get employees
    const employees = await getEmployeesByFirm(parseInt(firmId), key);
    
    // For each employee, get their most critical status
    const enrichedEmployees = await Promise.all(employees.map(async (emp) => {
      const trainings = await getTrainingsByEmployee(emp.id, key);
      const medicals = await getMedicalsByEmployee(emp.id, key);
      
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
  return useLiveQuery(async () => {
    if (!id || !isUnlocked()) return null;
    const key = getSessionKey();
    return getEmployee(parseInt(id), key);
  }, [id]);
}
