import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getRecordsByEmployee, deleteRecord } from '../db/records';
import { getExpirationStatus, formatDaysMessage, getDaysUntilExpiration } from '../utils/expirations';

export default function EmployeeDetails() {
  const { firmId, id } = useParams();
  const navigate = useNavigate();
  
  const employee = useLiveQuery(() => db.employees.get(parseInt(id)), [id]);
  const records = useLiveQuery(() => getRecordsByEmployee(id), [id]);

  if (!employee) return <div className="p-4 text-center mt-10 text-gray-400">Ładowanie pracownika...</div>;

  const allRecords = [
    ...(records?.trainings?.map(r => ({ ...r, kind: 'Szkolenie' })) || []),
    ...(records?.medicals?.map(r => ({ ...r, kind: 'Badanie' })) || [])
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDeleteRecord = async (table, recordId) => {
    if (!window.confirm('Usunąć ten wpis z historii?')) return;
    const tableName = table === 'Szkolenie' ? 'trainings' : 'medicals';
    await deleteRecord(tableName, recordId);
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to={`/firms/${firmId}`} className="underline">Firma</Link>
        <span>/</span>
        <span className="font-medium text-gray-800">{employee.firstName} {employee.lastName}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{employee.firstName} {employee.lastName}</h1>
          <p className="text-gray-500 font-medium">{employee.position || 'Stanowisko nieokreślone'}</p>
        </div>
        <Link to={`/firms/${firmId}/employees/${id}/edit`} className="text-xl">✏️</Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Historia terminów</h2>
        <Link
          to={`/firms/${firmId}/employees/${id}/records/new`}
          className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-bold"
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
            
            <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-slate-800">{record.kind}: {record.type}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{new Date(record.date).toLocaleDateString('pl-PL')}</div>
                </div>
                <button onClick={() => handleDeleteRecord(record.kind, record.id)} className="text-gray-300 hover:text-red-500">✕</button>
              </div>

              {record.expiresAt ? (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-500">Ważne do: {new Date(record.expiresAt).toLocaleDateString('pl-PL')}</div>
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
