import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { formatDaysMessage } from '../utils/expirations';

export default function Dashboard() {
  const data = useDashboard();
  const [filter, setFilter] = useState('all'); 

  if (!data) return <div className="p-4 text-center mt-10">Ładowanie danych...</div>;

  const { items, stats } = data;

  const filteredItems = filter === 'all'
    ? items
    : items.filter((i) => i.status === filter);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Co dziś?</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile
          label="Przeterminowane"
          count={stats.expired}
          color="red"
          active={filter === 'expired'}
          onClick={() => setFilter(filter === 'expired' ? 'all' : 'expired')}
        />
        <StatTile
          label="< 30 dni"
          count={stats.critical}
          color="orange"
          active={filter === 'critical'}
          onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
        />
        <StatTile
          label="< 90 dni"
          count={stats.warning}
          color="yellow"
          active={filter === 'warning'}
          onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}
        />
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="text-5xl mb-3">🎉</div>
          <p className="font-medium text-lg">Wszystko gotowe!</p>
          <p className="text-sm mt-1">Żadne terminy nie wygasają w najbliższym czasie.</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="block bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <StatusDot status={item.status} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800 truncate">
                  {item.employeeName}
                </div>
                <div className="text-sm text-slate-500 font-medium truncate mt-0.5">
                  🏢 {item.firmName}
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono bg-slate-100 inline-block px-2 py-1 rounded">
                  {item.kind} · {formatDaysMessage(item.daysLeft)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatTile({ label, count, color, active, onClick }) {
  const colors = {
    red: active ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-red-50 text-red-800 border border-red-100 hover:bg-red-100',
    orange: active ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-orange-50 text-orange-800 border border-orange-100 hover:bg-orange-100',
    yellow: active ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-100 hover:bg-yellow-100',
  };
  return (
    <button
      onClick={onClick}
      className={`${colors[color]} rounded-xl p-3 text-left transition-all`}
    >
      <div className="text-3xl font-extrabold mb-1">{count}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 leading-tight">{label}</div>
    </button>
  );
}

function StatusDot({ status }) {
  const colors = {
    expired: 'bg-red-500 ring-4 ring-red-100',
    critical: 'bg-orange-500 ring-4 ring-orange-100',
    warning: 'bg-yellow-500 ring-4 ring-yellow-100',
    ok: 'bg-green-500 ring-4 ring-green-100',
  };
  return (
    <div className={`w-3.5 h-3.5 rounded-full ${colors[status] || 'bg-gray-300'} mt-1.5 flex-shrink-0`} />
  );
}
