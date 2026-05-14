import Link from 'next/link';

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Narzędzia i Kalkulatory BHP</h1>
      <p className="text-lg text-slate-600 mb-8">
        Przydatne generatory i kalkulatory, które ułatwią Ci codzienną pracę w branży BHP.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-100 flex flex-col items-start">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 text-xl">
            🧮
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Kalkulator ryzyka zawodowego</h2>
          <p className="text-slate-600 mb-4">Szybko oceń poziom ryzyka na stanowisku pracy metodą PN-N-18002 lub Risk Score.</p>
          <Link href="/tools/kalkulator-ryzyka" className="mt-auto inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800">
            Uruchom narzędzie &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
