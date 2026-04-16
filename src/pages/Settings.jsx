import { useRef, useState } from 'react';
import { 
  exportLocalBackup, 
  importLocalBackup, 
  getSessionKey, 
  lockSession,
  changePassword 
} from '../storage';
import { exportUserData } from '../storage/rodo/dataExport';
import { eraseAllData } from '../storage/rodo/dataErasure';

export default function Settings() {
  const fileInputRef = useRef();
  const [status, setStatus] = useState(null);
  const [erasureInput, setErasureInput] = useState('');
  
  // Password change state
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: '', new1: '', new2: '' });
  
  const lastBackup = localStorage.getItem('lastBackup');

  const handleExport = async () => {
    try {
      const key = getSessionKey();
      const result = await exportLocalBackup(key);
      setStatus({ type: 'success', msg: `Kopia zapisana: ${result.filename}` });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Błąd kopii: ' + e.message });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const key = getSessionKey();
      const result = await importLocalBackup(file, key);
      setStatus({
        type: 'success',
        msg: `Wczytano: ${result.firms} firm, ${result.employees} pracowników.`,
      });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Błąd importu: ' + e.message });
    }
    e.target.value = ''; 
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.new1 !== pwdForm.new2) {
      setStatus({ type: 'error', msg: 'Nowe hasła nie są identyczne.' });
      return;
    }
    if (pwdForm.new1.length < 10) {
      setStatus({ type: 'error', msg: 'Nowe hasło musi mieć min. 10 znaków.' });
      return;
    }

    try {
      await changePassword(pwdForm.old, pwdForm.new1);
      setStatus({ type: 'success', msg: 'Hasło zostało pomyślnie zmienione.' });
      setShowPwdChange(false);
      setPwdForm({ old: '', new1: '', new2: '' });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Błąd zmiany hasła: ' + e.message });
    }
  };

  const handleRodoExport = async () => {
    try {
      await exportUserData();
      setStatus({ type: 'success', msg: 'Dane wyeksportowane do plików JSON/CSV.' });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Błąd eksportu RODO: ' + e.message });
    }
  };

  const handleErasure = async () => {
    try {
      await eraseAllData(erasureInput);
    } catch (e) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-800">Ustawienia i Prywatność</h1>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${
          status.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {status.msg}
        </div>
      )}

      {/* 1. Kopia Zapasowa (Zaszyfrowana) */}
      <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>🛡️</span> Kopia zapasowa
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Pliki kopii są <strong>zaszyfrowane</strong>. Do ich odczytu wymagane jest Twoje aktualne hasło.
          </p>
        </div>

        {lastBackup && (
          <div className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">
             Ostatni eksport: {new Date(lastBackup).toLocaleString('pl-PL')}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleExport}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-sm hover:bg-blue-900 transition-colors"
          >
            Pobierz zaszyfrowaną kopię (.json)
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full border border-gray-300 py-3 rounded-lg font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Wczytaj kopię z pliku
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
      </section>

      {/* 1b. Zmiana Hasła */}
      <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Hasło główne</h2>
          <button 
            onClick={() => setShowPwdChange(!showPwdChange)}
            className="text-primary text-sm font-bold"
          >
            {showPwdChange ? 'Anuluj' : 'Zmień hasło'}
          </button>
        </div>
        
        {showPwdChange ? (
          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
            <input 
              type="password" 
              placeholder="Aktualne hasło"
              value={pwdForm.old}
              onChange={(e) => setPwdForm({ ...pwdForm, old: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              required
            />
            <input 
              type="password" 
              placeholder="Nowe hasło (min. 10 znaków)"
              value={pwdForm.new1}
              onChange={(e) => setPwdForm({ ...pwdForm, new1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              required
            />
            <input 
              type="password" 
              placeholder="Powtórz nowe hasło"
              value={pwdForm.new2}
              onChange={(e) => setPwdForm({ ...pwdForm, new2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">
              Zatwierdź nowe hasło
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-500">Zabezpiecza Twoje dane na tym urządzeniu.</p>
        )}
      </section>

      {/* 2. RODO - Prawo do przenoszenia danych (Art. 20) */}
      <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">📋 Twoje dane (RODO)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Pobierz swoje dane w formacie czytelnym dla człowieka (JSON/CSV). Pliki te <strong>nie będą zaszyfrowane</strong>.
          </p>
        </div>
        <button
          onClick={handleRodoExport}
          className="w-full border border-blue-200 text-blue-700 py-3 rounded-lg font-bold bg-blue-50/50 hover:bg-blue-50 transition-colors"
        >
          Eksportuj moje dane (Art. 20 RODO)
        </button>
      </section>

      {/* 3. Sesja */}
      <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">🔐 Bezpieczeństwo</h2>
          <p className="text-xs text-gray-500 mt-1">Zakończ obecną sesję i zablokuj dostęp.</p>
        </div>
        <button
          onClick={() => { lockSession(); window.location.reload(); }}
          className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900"
        >
          Zablokuj aplikację teraz
        </button>
      </section>

      {/* 4. Usuwanie danych (Art. 17) */}
      <section className="bg-red-50 p-5 rounded-xl border border-red-100 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-red-800">⚠️ Usuwanie danych</h2>
          <p className="text-xs text-red-600/80 mt-1">
            Ta funkcja usunie <strong>wszystkie</strong> dane z tego urządzenia. Operacja jest nieodwracalna.
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-red-800 uppercase">Wpisz frazę "USUŃ WSZYSTKO", aby potwierdzić:</p>
          <input 
            type="text" 
            value={erasureInput}
            onChange={(e) => setErasureInput(e.target.value)}
            placeholder="USUŃ WSZYSTKO"
            className="w-full px-4 py-2 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleErasure}
            disabled={erasureInput !== 'USUŃ WSZYSTKO'}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-30 transition-colors"
          >
            Usuń wszystkie dane (Art. 17 RODO)
          </button>
        </div>
      </section>
      
      <p className="text-center text-[10px] text-gray-400">
        TerminyBHP v3.0 (Security Update) · Szyfrowanie Local-First
      </p>
    </div>
  );
}
