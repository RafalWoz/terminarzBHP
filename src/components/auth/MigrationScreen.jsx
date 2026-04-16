/**
 * MigrationScreen.jsx — Shown when old plaintext data (v2) needs to be encrypted
 */

import { useState } from 'react';
import { exportPlaintextBackup, runMigration, countLegacyRecords } from '../../storage/migration';
import { getSessionKey } from '../../storage/session';
import { useEffect } from 'react';

export default function MigrationScreen({ onMigrationComplete }) {
  const [counts, setCounts] = useState(null);
  const [step, setStep] = useState('info'); // 'info' | 'migrating' | 'done'
  const [progress, setProgress] = useState('');
  const [backupDone, setBackupDone] = useState(false);

  useEffect(() => {
    countLegacyRecords().then(setCounts);
  }, []);

  const handleBackup = async () => {
    await exportPlaintextBackup();
    setBackupDone(true);
  };

  const handleMigrate = async () => {
    setStep('migrating');
    setProgress('Szyfrowanie firm…');
    try {
      const key = getSessionKey();
      const summary = await runMigration(key);
      setProgress(`Zaszyfrowano: ${summary.firms} firm, ${summary.employees} pracowników, ${summary.trainings} szkoleń, ${summary.medicals} badań.`);
      setStep('done');
    } catch (e) {
      setProgress('Błąd migracji: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🔄</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Wymagana migracja danych</h1>
          <p className="text-blue-300 mt-1 text-sm">Twoje dane zostaną zaszyfrowane</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {step === 'info' && (
            <>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-200 text-sm leading-relaxed">
                  Wykryto dane z poprzedniej wersji aplikacji. Aby chronić Twoje dane osobowe zgodnie z RODO, zostaną teraz zaszyfrowane kluczem AES-GCM 256.
                </p>
                {counts && (
                  <ul className="mt-3 text-blue-300 text-sm space-y-1">
                    <li>🏢 Firm: <strong>{counts.firms}</strong></li>
                    <li>👷 Pracowników: <strong>{counts.employees}</strong></li>
                    <li>📋 Szkoleń: <strong>{counts.trainings}</strong></li>
                    <li>🩺 Badań: <strong>{counts.medicals}</strong></li>
                  </ul>
                )}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-semibold mb-2">⚠️ Krok 1: Pobierz kopię zapasową</p>
                <p className="text-amber-200/80 text-xs mb-3">
                  Przed migracją zalecamy pobrać backup w starym formacie. Jeśli coś pójdzie nie tak, będziesz mieć kopię danych.
                </p>
                <button
                  onClick={handleBackup}
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${backupDone ? 'bg-green-600 text-white' : 'bg-amber-500 text-slate-900 hover:bg-amber-400'}`}
                >
                  {backupDone ? '✅ Backup pobrany' : '⬇️ Pobierz backup przed migracją'}
                </button>
              </div>

              <button
                onClick={handleMigrate}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                🔐 Zaszyfruj dane i kontynuuj
              </button>
            </>
          )}

          {step === 'migrating' && (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-4">⚙️</div>
              <p className="text-white font-semibold">Migracja w toku…</p>
              <p className="text-blue-300 text-sm mt-2">{progress}</p>
              <p className="text-white/40 text-xs mt-4">Nie zamykaj aplikacji</p>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-white font-bold text-lg">Migracja zakończona!</p>
              <p className="text-blue-300 text-sm mt-2">{progress}</p>
              <button
                onClick={onMigrationComplete}
                className="mt-6 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Przejdź do aplikacji →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
