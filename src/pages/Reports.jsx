import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAuditsByFirm, getFirm, getSessionKey } from '../storage';

function collectReports(audits) {
  return audits
    .flatMap((audit) => {
      const history = Array.isArray(audit.reportHistory) ? audit.reportHistory : [];
      const fallbackHistory = history.length === 0 && audit.reportGeneratedAt
        ? [{ generatedAt: audit.reportGeneratedAt, title: audit.title, failCount: audit.failCount, scopeCount: audit.scope?.length }]
        : [];

      return [...history, ...fallbackHistory].map((report, index) => ({
        id: report.id || `${audit.id}-${report.generatedAt || index}`,
        auditId: audit.id,
        auditTitle: audit.title || 'Raport z audytu BHP',
        generatedAt: report.generatedAt,
        title: report.title || audit.title || 'Raport z audytu BHP',
        failCount: Number.isFinite(report.failCount) ? report.failCount : 0,
        scopeCount: Number.isFinite(report.scopeCount) ? report.scopeCount : audit.scope?.length || 0,
      }));
    })
    .sort((a, b) => new Date(b.generatedAt || 0) - new Date(a.generatedAt || 0));
}

export default function Reports() {
  const { id: firmId } = useParams();
  const [firm, setFirm] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const key = getSessionKey();
      const [loadedFirm, audits] = await Promise.all([
        getFirm(parseInt(firmId), key),
        getAuditsByFirm(firmId, key)
      ]);

      setFirm(loadedFirm);
      setReports(collectReports(audits));
      setLoading(false);
    }

    load();
  }, [firmId]);

  if (loading) return <div className="p-10 text-center">Ładowanie raportów...</div>;

  return (
    <div className="p-4 max-w-lg lg:max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/firms" className="hover:text-primary">Firmy</Link>
        <span>/</span>
        <Link to={`/firms/${firmId}`} className="hover:text-primary truncate">{firm?.name}</Link>
        <span>/</span>
        <span className="font-medium text-gray-800">Raporty</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Historia raportów</h1>
        <p className="text-sm text-slate-500 mt-1">Lista raportów wygenerowanych w module audytów dla tej firmy.</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4 opacity-20">📊</div>
          <p className="text-gray-500 font-medium">Nie wygenerowano jeszcze żadnego raportu.</p>
          <p className="text-sm text-gray-400 mt-1">Po zakończeniu audytu raport pojawi się tutaj automatycznie.</p>
          <Link to={`/firms/${firmId}/audits`} className="inline-flex mt-5 bg-primary text-white px-4 py-2 rounded-xl font-bold shadow-sm">
            Przejdź do audytów
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/firms/${firmId}/audits/${report.auditId}`}
              state={{ showReport: true }}
              className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between gap-4 items-start mb-2">
                <div>
                  <div className="font-bold text-slate-800">{report.title}</div>
                  <div className="text-xs text-gray-400 mt-1">Audyt: {report.auditTitle}</div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                  Wygenerowany
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Data</div>
                  <div className="font-semibold text-slate-700">{report.generatedAt ? new Date(report.generatedAt).toLocaleDateString('pl-PL') : 'Brak daty'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Punkty</div>
                  <div className="font-semibold text-slate-700">{report.scopeCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Uchybienia</div>
                  <div className="font-semibold text-slate-700">{report.failCount}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
