import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8">BHP Blog & Baza Wiedzy</h1>
      <p className="text-lg text-slate-600 mb-8">
        Najnowsze artykuły, porady i aktualności ze świata BHP.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Przykładowy post (placeholder) */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-100">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">Wiedza</span>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Jak prawidłowo przeprowadzić szkolenie wstępne BHP?</h2>
          <p className="text-slate-600 mb-4 line-clamp-3">Zastanawiasz się, z czego powinno składać się szkolenie wstępne pracownika? Sprawdź nasz poradnik krok po kroku.</p>
          <Link href="/blog/przykladowy-post" className="text-blue-600 font-semibold hover:text-blue-800">
            Czytaj dalej &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
