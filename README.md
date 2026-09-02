# TerminyBHP

Repozytorium zawiera dwa obszary projektu:

- `terminybhp-portal/` - publiczna strona TerminyBHP.pl w Next.js: strona glowna i blog.
- katalog glowny - aplikacja serwisowa React/Vite publikowana docelowo pod `/serwis/`.

## Docelowa struktura adresow

- `terminybhp.pl/` - publiczna strona informacyjna.
- `terminybhp.pl/blog/` - publiczny blog i baza wiedzy.
- `terminybhp.pl/serwis/` - aplikacja do pilnowania terminow BHP.

## Uruchamianie lokalne

Aplikacja serwisowa:

```bash
npm install
npm run dev
```

Portal publiczny:

```bash
cd terminybhp-portal
npm install
npm run dev
```

## Uwagi

Nie commitujemy `node_modules`, `.next`, `dist`, lokalnych plikow `.env` ani konfiguracji `regon_config.php`.
