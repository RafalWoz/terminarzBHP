import { useRef, useState } from 'react';
import { exportBackup, importBackup } from '../utils/backup';

export default function Settings() {
  const fileInputRef = useRef();
  const [status, setStatus] = useState(null);
  const lastBackup = localStorage.getItem('lastBackup');

  const handleExport = async () => {
    try {
      const result = await exportBackup();
      setStatus({ type: 'success', msg: `Zapisano logi: ${result.filename}` });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Błąd kopii: ' + e.message });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await importBackup(file);
      if (result.cancelled) return;
      setStatus({
        type: 'success',
        msg: `Zassano: ${result.firms} firm, ${result.employees} pracowników, ${result.trainings} szkoleń.`,
      });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Błąd importu: ' + e.message });
    }
    e.target.value = ''; 
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800">Ustawienia</h1>

      <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>💾</span> Zabezpieczenie danych
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Twoje dane i daty terminów nie są przesyłane na żaden serwer. Mieszkają we wnętrzu Twojego telefonu. Regularnie zapisuj kopię do pliku!
          </p>
        </div>

        {lastBackup && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
             <span className="text-xs text-blue-800 font-medium">Ostatnia kopia:</span>
             <span className="text-xs font-mono font-bold text-blue-900">{new Date(lastBackup).toLocaleString('pl-PL')}</span>
          </div>
        )}

        <button
          onClick={handleExport}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
        >
          ⬇️ Eksportuj do pliku (.json)
        </button>

        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full border-2 border-dashed border-gray-300 py-3.5 rounded-xl font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          ⬆️ Wczytaj kopię awaryjną
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
      </section>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${
          status.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
