import { useState } from 'react';
import { setupPassword } from '../../storage/auth';
import { setSyncProvider } from '../../storage/sync/syncManager';
import { FileSystemDriver } from '../../storage/sync/drivers/FileSystemDriver';
import { validatePasswordStrength } from '../../storage/crypto';

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState({
    provider: 'local', // 'google', 'local', 'browser'
    password: '',
    confirmPassword: '',
    hint: '',
    config: {}
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleLocalFolderPick = async () => {
    try {
      setLoading(true);
      const handle = await FileSystemDriver.pickDirectory();
      setData({ ...data, config: { handle } });
      nextStep();
    } catch (e) {
      if (e.message !== 'BROWSER_UNSUPPORTED') {
         setError('Błąd wyboru folderu: ' + e.message);
      } else {
         setError('Twoja przeglądarka nie wspiera wyboru folderów. Użyj Chrome lub Edge.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (data.password !== data.confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    const strength = validatePasswordStrength(data.password);
    if (strength.score < 2) {
      setError('Hasło jest zbyt słabe. Użyj co najmniej 8 znaków.');
      return;
    }

    setLoading(true);
    try {
      // 1. Setup Master Password
      await setupPassword(data.password, data.hint);
      
      // 2. Setup Sync Provider
      await setSyncProvider(data.provider, data.config);

      onComplete();
    } catch (e) {
      setError('Błąd konfiguracji: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Header / Progress */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Konfiguracja TerminyBHP</h2>
            <span className="text-sm font-medium text-slate-400">Krok {step} z 3</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-start gap-3">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Gdzie chcesz trzymać dane?</h3>
                <p className="text-slate-500">Wybierz sposób przechowywania bazy danych.</p>
              </div>

              <div className="grid gap-4">
                <OptionCard 
                  active={data.provider === 'local'}
                  onClick={() => setData({ ...data, provider: 'local' })}
                  icon="💻"
                  title="Folder na komputerze"
                  desc="Dane będą zapisywane w wybranym folderze na Twoim dysku. (Rekomendowane dla Chrome/Edge)"
                />
                <OptionCard 
                  active={data.provider === 'google'}
                  onClick={() => setData({ ...data, provider: 'google' })}
                  icon="☁️"
                  title="Dysk Google"
                  desc="Bezpieczna synchronizacja w chmurze Google. Dane zostaną zaszyfrowane przed wysłaniem."
                />
                <OptionCard 
                  active={data.provider === 'browser'}
                  onClick={() => setData({ ...data, provider: 'browser' })}
                  icon="🌐"
                  title="Tylko przeglądarka"
                  desc="Dane będą trzymane tylko w pamięci przeglądarki. Ryzyko utraty po czyszczeniu historii."
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={nextStep}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors"
                >
                  Kontynuuj
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {data.provider === 'local' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 text-4xl flex items-center justify-center rounded-3xl mx-auto">📂</div>
                  <h3 className="text-2xl font-bold text-slate-900">Wybierz folder</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Aplikacja będzie automatycznie tworzyć zaszyfrowaną kopię zapasową w wybranym folderze po każdej zmianie.
                  </p>
                  <button 
                    onClick={handleLocalFolderPick}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    {loading ? '⏳ Inicjalizacja...' : '📁 Wybierz folder na dysku'}
                  </button>
                </div>
              )}
              
              {data.provider === 'google' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 text-4xl flex items-center justify-center rounded-3xl mx-auto">🚀</div>
                  <h3 className="text-2xl font-bold text-slate-900">Zaloguj się kontem Google</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Umożliwi to aplikacji zapisywanie zaszyfrowanego pliku bazy w dedykowanym folderze na Twoim dysku Google.
                  </p>
                  <button 
                    onClick={nextStep} // Placeholder
                    className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
                  >
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
                    Zaloguj przez Google
                  </button>
                </div>
              )}

              {data.provider === 'browser' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-orange-50 text-4xl flex items-center justify-center rounded-3xl mx-auto">⚠️</div>
                  <h3 className="text-2xl font-bold text-slate-900">Uwaga</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Wybrałeś przechowywanie tylko w przeglądarce. Pamiętaj, aby regularnie robić kopie zapasowe ręcznie w ustawieniach.
                  </p>
                  <button onClick={nextStep} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Rozumiem, kontynuuj</button>
                </div>
              )}

              <button onClick={prevStep} className="w-full text-slate-400 font-medium py-2">Wróć do wyboru</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Hasło główne</h3>
                <p className="text-slate-500">To hasło będzie wymagane do odblokowania danych.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Hasło</label>
                  <input 
                    type="password"
                    value={data.password}
                    onChange={e => { setData({...data, password: e.target.value}); setError(''); }}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Min. 8 znaków"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Potwierdź hasło</label>
                  <input 
                    type="password"
                    value={data.confirmPassword}
                    onChange={e => setData({...data, confirmPassword: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Podpowiedź do hasła (opcjonalnie)</label>
                  <input 
                    type="text"
                    value={data.hint}
                    onChange={e => setData({...data, hint: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="np. Imię pierwszego psa"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleFinish}
                  disabled={loading || !data.password}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {loading ? '⏳ Konfiguracja...' : '✅ Zakończ konfigurację'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionCard({ active, onClick, icon, title, desc }) {
  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 text-left transition-all ${
        active 
          ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' 
          : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
    >
      <div className="flex gap-4">
        <div className="text-3xl bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm border border-slate-50">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        </div>
        {active && <div className="text-blue-600 font-bold">✓</div>}
      </div>
    </button>
  );
}
