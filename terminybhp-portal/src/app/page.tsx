import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              Nowoczesny Portal <span className="text-blue-600">TerminyBHP</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Kompleksowe narzędzia, kalkulatory, gotowe szablony i aktualna wiedza dla specjalistów BHP. Zoptymalizuj swoją pracę już dziś.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/tools" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
                Sprawdź Narzędzia
              </Link>
              <Link href="/blog" className="bg-white text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm">
                Czytaj Bloga
              </Link>
            </div>
          </div>
        </section>

        {/* Cechy / Architektura */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                📚
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">SEO Content Hub</h3>
              <p className="text-slate-600">Baza wiedzy zasilana automatycznie z n8n. Buduj ruch organiczny dzięki zoptymalizowanym treściom.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                🛠️
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Kalkulatory i Narzędzia</h3>
              <p className="text-slate-600">Interaktywne narzędzia takie jak kalkulator ryzyka, pomagające zbierać leady i ułatwiać pracę.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                📄
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Dokumenty i Wzory</h3>
              <p className="text-slate-600">Gotowe do pobrania instrukcje i szablony w jednym miejscu.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
