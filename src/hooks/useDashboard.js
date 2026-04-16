import { useLiveQuery } from 'dexie-react-hooks';
import { 
  getAllTrainings, 
  getAllMedicals, 
  getAllFirms, 
  getAllEmployees, 
  getSessionKey, 
  isUnlocked 
} from '../storage';
import { getExpirationStatus, getDaysUntilExpiration } from '../utils/expirations.js';

export function useDashboard() {
  return useLiveQuery(async () => {
    if (!isUnlocked()) return { items: [], stats: { expired: 0, critical: 0, warning: 0, ok: 0 } };
    const key = getSessionKey();

    const [trainings, medicals, firms, employees] = await Promise.all([
      getAllTrainings(key),
      getAllMedicals(key),
      getAllFirms(key),
      getAllEmployees(key),
    ]);

    const firmsMap = new Map(firms.map((f) => [f.id, f]));
    const employeesMap = new Map(employees.map((e) => [e.id, e]));

    const items = [];

    for (const t of trainings) {
      if (!t.expiresAt) continue;
      const emp = employeesMap.get(t.employeeId);
      const firm = firmsMap.get(t.firmId);
      if (!emp || !firm) continue;

      items.push({
        id: `training-${t.id}`,
        kind: 'Szkolenie',
        subkind: t.type,
        employeeName: `${emp.firstName || ''} ${emp.lastName}`,
        firmName: firm.name,
        expiresAt: t.expiresAt,
        daysLeft: getDaysUntilExpiration(t.expiresAt),
        status: getExpirationStatus(t.expiresAt),
        link: `/firms/${firm.id}/employees/${emp.id}`,
      });
    }

    for (const m of medicals) {
      if (!m.expiresAt) continue;
      const emp = employeesMap.get(m.employeeId);
      const firm = firmsMap.get(m.firmId);
      if (!emp || !firm) continue;

      items.push({
        id: `medical-${m.id}`,
        kind: 'Badanie',
        subkind: m.type,
        employeeName: `${emp.firstName || ''} ${emp.lastName}`,
        firmName: firm.name,
        expiresAt: m.expiresAt,
        daysLeft: getDaysUntilExpiration(m.expiresAt),
        status: getExpirationStatus(m.expiresAt),
        link: `/firms/${firm.id}/employees/${emp.id}`,
      });
    }

    items.sort((a, b) => a.daysLeft - b.daysLeft);

    const stats = {
      expired: items.filter((i) => i.status === 'expired').length,
      critical: items.filter((i) => i.status === 'critical').length,
      warning: items.filter((i) => i.status === 'warning').length,
      ok: items.filter((i) => i.status === 'ok').length,
    };

    return { items, stats };
  });
}
