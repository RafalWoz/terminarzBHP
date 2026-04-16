/**
 * UnlockScreen.jsx — Password prompt shown on every subsequent app open
 */

import { useState, useEffect, useRef } from 'react';
import { verifyPassword, getPasswordHint, getFailedAttempts } from '../../storage';

export default function UnlockScreen({ onUnlocked }) {
  const [password, setPassword] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    getPasswordHint().then((h) => setHint(h || ''));
    inputRef.current?.focus();
  }, []);

  // Countdown timer for rate-limit lockout
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockSeconds((s) => {
        if (s <= 1) { clearInterval(timer); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockSeconds > 0 || loading) return;
    setError('');
    setLoading(true);

    try {
      const key = await verifyPassword(password);
      if (key) {
        onUnlocked();
      } else {
        const attempts = getFailedAttempts();
        if (attempts >= 10) {
          setLockSeconds(300);
          setError(`Zbyt wiele błędnych prób. Odczekaj 5 minut.`);
        } else if (attempts >= 5) {
          setLockSeconds(30);
          setError(`Nieprawidłowe hasło. Odczekaj 30 sekund. (próba ${attempts})`);
        } else {
          setError(`Nieprawidłowe hasło. Próba ${attempts} z 5.`);
        }
        setPassword('');
      }
    } catch (e) {
      if (e.message.startsWith('RATE_LIMITED:')) {
        const secs = parseInt(e.message.split(':')[1]);
        setLockSeconds(secs);
        setError('Zbyt wiele błędnych prób. Poczekaj przed kolejną próbą.');
      } else {
        setError('Błąd: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockSeconds > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white">TerminyBHP</h1>
          <p className="text-blue-300 mt-1 text-sm">Wpisz hasło, aby odblokować</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Hasło dostępu</label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked || loading}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="Twoje hasło"
              autoComplete="current-password"
            />
          </div>

          {hint && (
            <p className="text-blue-300/60 text-xs">
              💡 Podpowiedź: <span className="italic">{hint}</span>
            </p>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {isLocked && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-orange-300 text-sm text-center">
              🕐 Odblokowanie za: <strong>{lockSeconds}s</strong>
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || loading || !password}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Sprawdzam…' : '🔓 Odblokuj'}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-4">
          Dane szyfrowane lokalnie · Bez dostępu do hasła nie możemy Ci pomóc
        </p>
      </div>
    </div>
  );
}
