import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg">PilnujTerminow</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Zaloguj sie
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Zaloz konto
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          Darmowe konto — do 3 pracownikow
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Pilnuj terminow BHP zamiast<br />szukac w tabelkach Excel
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          Automatyczne przypomnienia o badaniach lekarskich, szkoleniach BHP
          i certyfikatach — 30, 14 i 7 dni przed wygasniciem.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
          >
            Zacznij za darmo
          </Link>
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 font-medium px-6 py-3"
          >
            Mam juz konto →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-2xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">Jeden ekran</h3>
              <p className="text-gray-500 text-sm">
                Tabela wszystkich pracownikow z kolorami. Zielony — ok. Zolty — uwazaj. Czerwony — dzialaj.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-2xl mb-3">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Automatyczne emaile</h3>
              <p className="text-gray-500 text-sm">
                System sam wysyla przypomnienia 30, 14 i 7 dni przed wygasniciem. Do Ciebie i do pracownika.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-2xl mb-3">⏱</div>
              <h3 className="font-semibold text-gray-900 mb-2">10 minut onboardingu</h3>
              <p className="text-gray-500 text-sm">
                Wpisz pracownikow i daty — i zapomnij. System robi reszte. Zero konsultantow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cennik */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Prosty cennik</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { name: "Free", price: "0 zl", limit: "do 3 pracownikow", features: ["Wszystkie funkcje", "Email przypomnienia", "Bez limitu czasowego"] },
            { name: "Starter", price: "39 zl/mies.", limit: "do 10 pracownikow", features: ["Wszystkie funkcje", "Email do pracownika", "Priorytetowe wsparcie"], highlight: false },
            { name: "Pro", price: "99 zl/mies.", limit: "Nieograniczony", features: ["Wszystkie funkcje", "SMS przypomnienia", "API dostep"], highlight: true },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 border ${
                plan.highlight
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="font-bold text-lg text-gray-900 mb-1">{plan.name}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{plan.price}</div>
              <div className="text-sm text-gray-500 mb-4">{plan.limit}</div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-6 block text-center text-sm font-medium py-2 px-4 rounded-lg transition-colors ${
                  plan.highlight
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
              >
                Zacznij
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        PilnujTerminow © 2025 · Terminarz BHP dla polskich firm
      </footer>
    </div>
  );
}
