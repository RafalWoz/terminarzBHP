/**
 * dataExport.js — RODO Art. 20: Right to data portability
 * Exports user data in human-readable JSON + CSV format (unencrypted by design).
 */

import { getSessionKey } from '../session';
import { getAllFirms } from '../repositories/firms';
import { getAllEmployees } from '../repositories/employees';
import { getAllTrainings } from '../repositories/trainings';
import { getAllMedicals } from '../repositories/medicals';
import { getAllPermits } from '../repositories/permits';

function toCSV(rows, columns) {
  if (!rows.length) return columns.join(';') + '\n';
  const header = columns.join(';');
  const lines = rows.map((row) =>
    columns.map((col) => {
      const val = row[col] ?? '';
      return typeof val === 'string' && val.includes(';') ? `"${val}"` : val;
    }).join(';')
  );
  return [header, ...lines].join('\n');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export all user data as JSON + CSV files (RODO art. 20).
 * Data is NOT encrypted — it's the user's own data for portability.
 */
export async function exportUserData() {
  const key = getSessionKey();
  const date = new Date().toISOString().slice(0, 10);

  const [firms, employees, trainings, medicals, permits] = await Promise.all([
    getAllFirms(key),
    getAllEmployees(key),
    getAllTrainings(key),
    getAllMedicals(key),
    getAllPermits(key),
  ]);

  // ── JSON export ────────────────────────────────────────────────────────────
  const jsonPayload = {
    exported_at: new Date().toISOString(),
    purpose: 'Eksport danych zgodnie z art. 20 RODO (prawo do przenoszenia danych)',
    warning: 'Plik zawiera dane osobowe. Zabezpiecz go po pobraniu.',
    data: { firms, employees, trainings, medicals, permits },
  };
  downloadBlob(
    new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json' }),
    `terminybhp-moje-dane-${date}.json`
  );

  // ── CSV exports ────────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 300)); // brief delay between downloads

  downloadBlob(
    new Blob([toCSV(firms, ['id','name','nip','address','contactPerson','phone','email','notes','createdAt'])], { type: 'text/csv;charset=utf-8' }),
    `terminybhp-firmy-${date}.csv`
  );

  await new Promise((r) => setTimeout(r, 300));

  downloadBlob(
    new Blob([toCSV(employees, ['id','firmId','firstName','lastName','position','hireDate','active','notes'])], { type: 'text/csv;charset=utf-8' }),
    `terminybhp-pracownicy-${date}.csv`
  );

  return { firms: firms.length, employees: employees.length, trainings: trainings.length };
}
