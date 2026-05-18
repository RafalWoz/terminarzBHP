# Posts

Ten katalog jest miejscem na artykuly JSON dodawane przed statycznym eksportem strony.

Wariant LH.pl jako zwykly hosting HTML nie obsluguje endpointow API Next.js, dlatego n8n nie publikuje tutaj przez `POST /api/...`.

Docelowy przeplyw dla n8n:

1. n8n przygotowuje plik JSON artykulu w tym formacie.
2. Plik trafia do `terminybhp-portal/data/posts/<slug>.json` w repozytorium albo lokalnym katalogu builda.
3. Uruchamiasz `npm run build` w `terminybhp-portal`.
4. Zawartosc folderu `terminybhp-portal/out` wgrywasz przez FTP/SFTP na LH.pl.

Przykladowy plik:

```json
{
  "title": "Tytul artykulu",
  "slug": "tytul-artykulu",
  "description": "Krotki opis widoczny na liscie wpisow.",
  "category": "Szkolenia",
  "content": [
    "Pierwszy akapit artykulu.",
    "Drugi akapit artykulu."
  ],
  "status": "publish",
  "createdAt": "2026-05-18T00:00:00.000Z"
}
```
