import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditsByFirm, getSessionKey, getFirm } from '../storage';

export default function Audits() {
  const { id: firmId } = useParams();
  const [audits, setAudits] = useState([]);
  const [firm, setFirm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const key = getSessionKey();
      const [f, a] = await Promise.all([
        getFirm(parseInt(firmId), key),
        getAuditsByFirm(firmId, key)
      ]);
      setFirm(f);
      setAudits(a);
      setLoading(false);
    }
    load();
  }, [firmId]);

  if (loading) return <div className="p-10 text-center">Ładowanie audytów...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/firms" className="hover:text-primary">Firmy</Link>
        <span>/</span>
        <Link to={`/firms/${firmId}`} className="hover:text-primary truncate">{firm?.name}</Link>
        <span>/</span>
        <span className="font-medium text-gray-800">Audyty</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Audyty i Kontrole</h1>
        <Link
          to={`/firms/${firmId}/audits/new`}
          className="bg-primary text-white px-4 py-2 rounded-xl font-bold shadow-sm"
        >
          + Nowy
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4 opacity-20">📋</div>
          <p className="text-gray-500 font-medium">Brak przeprowadzonych audytów.</p>
          <p className="text-sm text-gray-400 mt-1">Kliknij "+ Nowy" aby zacząć kontrolę.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => (
            <Link
              key={audit.id}
              to={`/firms/${firmId}/audits/${audit.id}`}
              className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-800">{audit.title || 'Audyt bez tytułu'}</div>
                <StatusBadge status={audit.status} />
              </div>
              <div className="text-xs text-gray-400">
                Data: {new Date(audit.createdAt).toLocaleDateString('pl-PL')} 
                {audit.templateId && ` · Szablon: ${audit.templateId}`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-600',
    completed: 'bg-green-100 text-green-700',
    archived: 'bg-slate-100 text-slate-500'
  };
  const labels = {
    draft: 'W toku',
    completed: 'Zakończony',
    archived: 'Zarchiwizowany'
  };
  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}
