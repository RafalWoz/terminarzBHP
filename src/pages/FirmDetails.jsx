import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirm } from '../hooks/useFirms';
import { useEmployees } from '../hooks/useEmployees';
import EmployeeDetailView from '../components/EmployeeDetailView';

export default function FirmDetails() {
  const { id } = useParams();
  const firm = useFirm(id);
  const employees = useEmployees(id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  if (!firm) return <div className="p-4 text-center mt-10 text-gray-500">Ladowanie firmy...</div>;

  const handleEmployeeClick = (empId, e) => {
    // If on desktop (>1024px), stay on page and show detail
    if (window.innerWidth >= 1024) {
      e.preventDefault();
      setSelectedEmployeeId(empId);
    }
    // Else (mobile), let the Link handle navigation
  };

  return (
    <div className="p-4 max-w-lg lg:max-w-7xl mx-auto pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/firms" className="hover:text-primary transition-colors">Firmy</Link>
        <span>/</span>
        <span className="font-medium text-gray-800 truncate">{firm.name}</span>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Firm Info + Employees List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Firm Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <Link to={`/firms/${id}/edit`} className="text-gray-400 hover:text-primary text-xl" title="Edytuj">⚙️</Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{firm.name}</h1>
            {firm.nip && <div className="text-sm font-mono text-gray-500 mb-1">NIP: {firm.nip}</div>}
            {firm.contactPerson && (
              <div className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-50">
                <span className="font-semibold">Osoba kontaktowa:</span> {firm.contactPerson}
                {firm.phone && <div className="mt-1">tel. {firm.phone}</div>}
              </div>
            )}
          </div>

          {/* MODULES (Quick Actions) */}
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to={`/firms/${id}/audits`}
              className="bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm flex flex-col items-center justify-center hover:border-primary/20 transition-all active:scale-95"
            >
              <div className="text-2xl mb-1">📋</div>
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Audyty</div>
            </Link>
            
            <Link
              to={`/firms/${id}/reports`}
              className="bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm flex flex-col items-center justify-center hover:border-primary/20 transition-all active:scale-95"
            >
              <div className="text-2xl mb-1">📊</div>
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Raporty</div>
            </Link>
          </div>

          {/* Employees Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Pracownicy</h2>
              <Link
                to={`/firms/${id}/employees/new`}
                className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-900 transition-colors"
              >
                + Dodaj osobę
              </Link>
            </div>

            {!employees && <div className="text-center py-10 text-gray-400">Pobieranie listy...</div>}
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
                  onClick={(e) => handleEmployeeClick(emp.id, e)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                    selectedEmployeeId === emp.id 
                      ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                      : 'bg-white border-gray-100 shadow-sm active:bg-gray-50'
                  }`}
                >
                  <StatusIndicator status={emp.status} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800">
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{emp.position || 'Brak stanowiska'}</div>
                  </div>
                  <div className="text-xs font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-md">
                    {emp.recordCount}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Employee Detail Panel (Desktop only) */}
        <div className="hidden lg:block lg:col-span-7 sticky top-24">
          <div className="bg-slate-50/50 rounded-3xl p-6 border-2 border-dashed border-slate-200 min-h-[500px]">
            {selectedEmployeeId ? (
              <EmployeeDetailView employeeId={selectedEmployeeId} firmId={id} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="text-6xl mb-4 opacity-20">👤</div>
                <h3 className="text-xl font-bold text-slate-400">Podgląd pracownika</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                  Wybierz osobę z listy po lewej stronie, aby szybko zobaczyć historię badań i szkoleń.
                </p>
              </div>
            )}
          </div>
        </div>

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
