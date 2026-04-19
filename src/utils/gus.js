/**
 * Pobiera dane firmy z GUS (REGON BIR 1.1) przez serwerowy proxy PHP.
 *
 * @param {string} nip - 10-cyfrowy NIP (bez kresek/spacji)
 * @returns {Promise<{ name: string, address: string, regon?: string }>}
 * @throws {Error} z czytelnym komunikatem dla UI
 */
export async function fetchGusData(nip) {
  const cleanedNip = String(nip || '').replace(/\D+/g, '');
  if (cleanedNip.length !== 10) {
    throw new Error('Podaj poprawny 10-cyfrowy NIP.');
  }

  // W dev (vite @ localhost) uderzamy bezpośrednio w proxy na produkcji,
  // bo lokalny serwer Vite nie uruchamia PHP.
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const targetUrl = isLocal
    ? `https://terminybhp.pl/regon_proxy.php?nip=${cleanedNip}`
    : `./regon_proxy.php?nip=${cleanedNip}`;

  let response;
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch (networkError) {
    console.error('GUS network error:', networkError);
    throw new Error(
      'Brak połączenia z serwerem proxy GUS. Sprawdź internet lub spróbuj ponownie za chwilę.',
    );
  }

  // Odczytujemy ciało ZAWSZE - nawet przy 4xx/5xx proxy zwraca JSON z opisem.
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // proxy oddało HTML (np. błąd serwera / 500 page) - pokaż surowy skrót
    const snippet = text.slice(0, 180).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Nieprawidłowa odpowiedź serwera proxy (HTTP ${response.status}). ${snippet}`,
    );
  }

  if (!response.ok || (payload && payload.error)) {
    const msg =
      (payload && payload.error) ||
      `Błąd serwera proxy (HTTP ${response.status}).`;
    throw new Error(msg);
  }

  if (!payload || !payload.data) {
    throw new Error('GUS nie zwrócił danych dla podanego NIP.');
  }

  return payload.data;
}
