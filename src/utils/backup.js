import { db } from '../db/index.js';

export async function exportBackup() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    firms: await db.firms.toArray(),
    employees: await db.employees.toArray(),
    trainings: await db.trainings.toArray(),
    medicals: await db.medicals.toArray(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const filename = `terminybhp-backup-${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  localStorage.setItem('lastBackup', new Date().toISOString());

  return { filename, size: blob.size };
}

export async function importBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.version) throw new Error('Nieprawidłowy plik backupu');
  if (data.version > 1) throw new Error('Plik z nowszej wersji aplikacji');

  const hasData = (await db.firms.count()) > 0;
  if (hasData) {
    if (!window.confirm('Masz już dane w aplikacji. Import je NADPISZE. Kontynuować?')) {
      return { cancelled: true };
    }
  }

  await db.transaction('rw', [db.firms, db.employees, db.trainings, db.medicals], async () => {
    await db.firms.clear();
    await db.employees.clear();
    await db.trainings.clear();
    await db.medicals.clear();

    await db.firms.bulkAdd(data.firms || []);
    await db.employees.bulkAdd(data.employees || []);
    await db.trainings.bulkAdd(data.trainings || []);
    await db.medicals.bulkAdd(data.medicals || []);
  });

  return {
    firms: data.firms?.length || 0,
    employees: data.employees?.length || 0,
    trainings: data.trainings?.length || 0,
    medicals: data.medicals?.length || 0,
  };
}
