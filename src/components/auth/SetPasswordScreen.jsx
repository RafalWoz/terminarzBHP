/**
 * SetPasswordScreen.jsx — First-run password setup screen
 */

import { useState } from 'react';
import { setupPassword, validatePasswordStrength } from '../../storage';

export default function SetPasswordScreen({ onPasswordSet }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hint, setHint] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const strengthError = validatePasswordStrength(password);
    if (strengthError) { setError(strengthError); return; }
    if (password !== confirm) { setError('Hasła nie są identyczne.'); return; }
    if (!agreed) { setError('Musisz potwierdzić, że rozumiesz zasady dostępu do danych.'); return; }

    setLoading(true);
    try {
      await setupPassword(password, hint);
      onPasswordSet();
    } catch (e) {
      setError('Błąd podczas ustawiania hasła: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrengthLevel(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">TerminyBHP</h1>
          <p className="text-blue-300 mt-1 text-sm">Pierwsze uruchomienie — ustaw hasło dostępu</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
          {/* Warning box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-300 text-sm font-semibold mb-1">⚠️ Ważne — przeczytaj przed ustawieniem hasła</p>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              Twoje dane BHP są szyfrowane i zabezpieczone tym hasłem. <strong>Jeśli zapomnisz hasła — NIE ODZYSKASZ danych.</strong> Nie mamy kopii ani możliwości resetu. Zapisz hasło w bezpiecznym miejscu (np. menedżer haseł).
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Hasło dostępu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Min. 10 znaków"
              autoComplete="new-password"
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${strength.textColor}`}>{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Powtórz hasło</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full px-4 py-2.5 bg-white/10 border rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 outline-none ${confirm && confirm !== password ? 'border-red-500' : 'border-white/20'}`}
              placeholder="Powtórz hasło"
              autoComplete="new-password"
            />
          </div>

          {/* Hint */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Podpowiedź do hasła <span className="text-white/40">(opcjonalnie)</span></label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Podpowiedź widoczna na ekranie logowania"
            />
            <p className="text-white/30 text-xs mt-1">Nie wpisuj tu samego hasła!</p>
          </div>

          {/* Agreement checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-sm text-blue-200 leading-relaxed">
              Rozumiem, że <strong className="text-white">zapomnienie hasła oznacza trwałą utratę danych</strong>. TerminyBHP nie ma możliwości resetu hasła ani odzyskania danych.
            </span>
          </label>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Przygotowuję szyfrowanie…' : '🔐 Ustaw hasło i uruchom aplikację'}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-4">
          Dane przechowywane lokalnie · Szyfrowanie AES-GCM 256 · Brak chmury
        </p>
      </div>
    </div>
  );
}

function getStrengthLevel(pwd) {
  if (!pwd) return { level: 0, color: '', label: '', textColor: '' };
  let score = 0;
  if (pwd.length >= 10) score++;
  if (pwd.length >= 14) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) score++;

  const levels = [
    { level: 1, color: 'bg-red-500', label: 'Słabe', textColor: 'text-red-400' },
    { level: 2, color: 'bg-orange-500', label: 'Przeciętne', textColor: 'text-orange-400' },
    { level: 3, color: 'bg-yellow-500', label: 'Dobre', textColor: 'text-yellow-400' },
    { level: 4, color: 'bg-green-500', label: 'Silne', textColor: 'text-green-400' },
  ];
  return levels[Math.min(score, 4) - 1] || levels[0];
}
