import Link from 'next/link';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Szablony i Dokumenty</h1>
      <p className="text-lg text-slate-600 mb-8">
        Gotowe do pobrania wzory dokumentów, instrukcje BHP i checklisty.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-100 flex flex-col items-start">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 text-xl">
            📄
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Instrukcja ogólna BHP</h2>
          <p className="text-slate-600 mb-4">Uniwersalny wzór instrukcji ogólnej, niezbędnej w każdym zakładzie pracy.</p>
          <button className="mt-auto bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Pobierz szablon
          </button>
        </div>
      </div>
    </div>
  );
}
