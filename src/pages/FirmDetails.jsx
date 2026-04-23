import { useParams, Link } from 'react-router-dom';
import { useFirm } from '../hooks/useFirms';
import { useEmployees } from '../hooks/useEmployees';

export default function FirmDetails() {
  const { id } = useParams();
  const firm = useFirm(id);
  const employees = useEmployees(id);

  if (!firm) return <div className="p-4 text-center mt-10 text-gray-500">Ładowanie firmy...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/firms" className="hover:text-primary transition-colors">Firmy</Link>
        <span>/</span>
        <span className="font-medium text-gray-800 truncate">{firm.name}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <Link to={`/firms/${id}/edit`} className="text-gray-400 hover:text-primary text-xl">⚙️</Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{firm.name}</h1>
        {firm.nip && <div className="text-sm font-mono text-gray-500 mb-1">NIP: {firm.nip}</div>}
        {firm.contactPerson && (
          <div className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-50">
            <span className="font-semibold">Osoba kontaktowa:</span> {firm.contactPerson}
            {firm.phone && <div className="mt-1">📞 {firm.phone}</div>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link 
          to={`/firms/${id}/audits`}
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center hover:border-primary/30 transition-all"
        >
          <span className="text-2xl mb-1">📋</span>
          <span className="text-xs font-bold text-slate-700">Audyty</span>
        </Link>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center opacity-50 grayscale cursor-not-allowed">
          <span className="text-2xl mb-1">📊</span>
          <span className="text-xs font-bold text-slate-700">Raporty</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Pracownicy</h2>
        <Link
          to={`/firms/${id}/employees/new`}
          className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-900 transition-colors"
        >
          + Dodaj osobę
        </Link>
      </div>

      {!employees && <div className="text-center py-10 text-gray-400">Ładowanie listy...</div>}
      {employees && employees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-3 opacity-30">👷</div>
          <p className="text-gray-500 font-medium">Brak pracowników w tej firmie.</p>
        </div>
      )}

      <div className="grid gap-3">
        {employees?.map((emp) => (
          <Link
            key={emp.id}
            to={`/firms/${id}/employees/${emp.id}`}
            className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-all hover:border-primary/20"
          >
            <StatusIndicator status={emp.status} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800">
                {emp.firstName} {emp.lastName}
              </div>
              <div className="text-xs text-gray-500 truncate">{emp.position || 'Brak stanowiska'}</div>
            </div>
            <div className="text-xs font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-md">
              {emp.recordCount} wpisów
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusIndicator({ status }) {
  const colors = {
    expired: 'bg-red-500',
    critical: 'bg-orange-500',
    warning: 'bg-yellow-500',
    ok: 'bg-green-500',
    none: 'bg-slate-200'
  };
  
  return <div className={`w-3 h-3 rounded-full ${colors[status]} flex-shrink-0 animate-pulse`} />;
}
