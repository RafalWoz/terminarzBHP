import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirms } from '../hooks/useFirms';

export default function Firms() {
  const [search, setSearch] = useState('');
  const firms = useFirms(search);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Firmy</h1>
        <Link
          to="/firms/new"
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
        >
          + Dodaj
        </Link>
      </div>

      <input
        type="search"
        placeholder="Szukaj firmy (NIP, Nazwa)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary outline-none"
      />

      {!firms && <div className="text-center text-gray-500 py-12">Ładowanie baz danych...</div>}
      {firms && firms.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-5xl mb-4">🏢</div>
          <p className="font-medium">Brak wyników lub firm. Dodaj pierwszą!</p>
        </div>
      )}

      <div className="space-y-3">
        {firms?.map((firm) => (
          <Link
            key={firm.id}
            to={`/firms/${firm.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 transition-shadow hover:shadow-sm"
          >
            <div className="font-semibold text-lg text-slate-800">{firm.name}</div>
            {firm.nip && <div className="text-sm text-slate-500 mt-1 font-mono">NIP: {firm.nip}</div>}
            {firm.contactPerson && <div className="text-sm text-slate-500">Kontakt: {firm.contactPerson}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
