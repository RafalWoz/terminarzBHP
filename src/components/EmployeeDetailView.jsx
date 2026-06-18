import { useLiveQuery } from 'dexie-react-hooks';
import { useEmployee } from '../hooks/useEmployees';
import { 
  getTrainingsByEmployee, 
  getMedicalsByEmployee, 
  deleteTraining, 
  deleteMedical, 
  getSessionKey, 
  isUnlocked 
} from '../storage';
import { getExpirationStatus, formatDaysMessage, getDaysUntilExpiration } from '../utils/expirations';
import { Link } from 'react-router-dom';

function formatRecordDate(value) {
  if (!value) return 'Brak daty';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Nieprawidłowa data' : date.toLocaleDateString('pl-PL');
}

function getRecordTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export default function EmployeeDetailView({ employeeId, firmId, onDeleted }) {
  const employee = useEmployee(employeeId);
  const records = useLiveQuery(async () => {
    if (!employeeId || !isUnlocked()) return { trainings: [], medicals: [] };
    const key = getSessionKey();
    const [trainings, medicals] = await Promise.all([
      getTrainingsByEmployee(parseInt(employeeId), key),
      getMedicalsByEmployee(parseInt(employeeId), key)
    ]);
    return { trainings, medicals };
  }, [employeeId]);

  if (!employee) return (
    <div className="flex items-center justify-center h-64 text-gray-400 italic">
      Wybierz pracownika z listy, aby zobaczyć szczegóły.
    </div>
  );

  const allRecords = [
    ...(records?.trainings?.map(r => ({ ...r, kind: 'Szkolenie', table: 'trainings' })) || []),
    ...(records?.medicals?.map(r => ({ ...r, kind: 'Badanie', table: 'medicals' })) || [])
  ].sort((a, b) => getRecordTime(b.date) - getRecordTime(a.date));

  const handleDeleteRecord = async (kind, recordId) => {
    if (!window.confirm('Usunąć ten wpis z historii?')) return;
    try {
      if (kind === 'Szkolenie') {
        await deleteTraining(recordId);
      } else {
        await deleteMedical(recordId);
      }
      if (onDeleted) onDeleted();
    } catch (e) {
      alert('Błąd usuwania: ' + e.message);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{employee.firstName} {employee.lastName}</h1>
          <p className="text-gray-500 font-medium">{employee.position || 'Stanowisko nieokreślone'}</p>
        </div>
        <div className="flex gap-4">
           <Link to={`/firms/${firmId}/employees/${employeeId}/edit`} className="text-xl hover:scale-110 transition-transform">✏️</Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Historia terminów</h2>
        <Link
          to={`/firms/${firmId}/employees/${employeeId}/records/new`}
          className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-sm"
        >
          + Nowy wpis
        </Link>
      </div>

      {allRecords.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400">Brak historii badań i szkoleń.</p>
        </div>
      )}

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-gray-100 before:z-0">
        {allRecords.map((record) => (
          <div key={record.kind + record.id} className="relative z-10 flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white ${record.kind === 'Szkolenie' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
               {record.kind === 'Szkolenie' ? '🎓' : '🩺'}
            </div>
            
            <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2 gap-3">
                <div>
                  <div className="font-bold text-slate-800">{record.kind}: {record.type}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{formatRecordDate(record.date)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/firms/${firmId}/employees/${employeeId}/records/${record.table}/${record.id}/edit`}
                    className="text-xs font-bold text-primary hover:text-blue-900 transition-colors"
                  >
                    Edytuj
                  </Link>
                  <button onClick={() => handleDeleteRecord(record.kind, record.id)} className="text-gray-300 hover:text-red-500 transition-colors">✕</button>
                </div>
              </div>

              {record.expiresAt ? (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-gray-500">Ważne do: {formatRecordDate(record.expiresAt)}</div>
                  <StatusBadge status={getExpirationStatus(record.expiresAt)} days={getDaysUntilExpiration(record.expiresAt)} />
                </div>
              ) : (
                <div className="mt-2 text-xs italic text-gray-300">Bezterminowo</div>
              )}
              
              {record.notes && <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-gray-600 italic">"{record.notes}"</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, days }) {
  const colors = {
    expired: 'bg-red-100 text-red-700',
    critical: 'bg-orange-100 text-orange-700',
    warning: 'bg-yellow-100 text-yellow-700',
    ok: 'bg-green-100 text-green-700'
  };
  
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter ${colors[status]}`}>
      {formatDaysMessage(days)}
    </span>
  );
}
