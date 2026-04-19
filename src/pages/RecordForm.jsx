import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  addTraining, 
  addMedical, 
  getSessionKey 
} from '../storage';
import { calculateTrainingExpiration, calculateMedicalExpiration } from '../utils/expirations';

export default function RecordForm() {
  const { firmId, employeeId } = useParams();

  const navigate = useNavigate();
  const [table, setTable] = useState('trainings');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    employeeId: parseInt(employeeId),
    firmId: parseInt(firmId),
    type: 'okresowe',
    subtype: 'robotniczy',
    date: new Date().toISOString().split('T')[0],
    expiresAt: '',
    notes: ''
  });

  // Auto-calculate expiration when date or type changes
  useEffect(() => {
    if (form.date) {
      let expires = '';
      if (table === 'trainings') {
        expires = calculateTrainingExpiration(form.date, form.type, form.subtype);
      } else {
        expires = calculateMedicalExpiration(form.date);
      }
      setForm(prev => ({ ...prev, expiresAt: expires || '' }));
    }
  }, [form.date, form.type, form.subtype, table]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const key = getSessionKey();
      const data = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
      };

      if (table === 'trainings') {
        await addTraining(data, key);
      } else {
        await addMedical(data, key);
      }

      navigate(`/firms/${firmId}/employees/${employeeId}`);
    } catch (err) {
      setError('Błąd zapisu: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dodaj termin</h1>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setTable('trainings')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${table === 'trainings' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
        >
          Szkolenie
        </button>
        <button
          type="button"
          onClick={() => setTable('medicals')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${table === 'medicals' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
        >
          Badanie
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-700 mb-1 block">Typ</span>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
          >
            {table === 'trainings' ? (
              <>
                <option value="okresowe">Okresowe</option>
                <option value="wstepne_ogolne">Wstępne ogólne</option>
                <option value="wstepne_stanowiskowe">Wstępne stanowiskowe</option>
              </>
            ) : (
              <>
                <option value="okresowe">Okresowe</option>
                <option value="wstepne">Wstępne</option>
                <option value="kontrolne">Kontrolne</option>
              </>
            )}
          </select>
        </label>

        {table === 'trainings' && form.type === 'okresowe' && (
          <label className="block">
            <span className="text-sm font-bold text-slate-700 mb-1 block">Grupa zawodowa</span>
            <select
              value={form.subtype}
              onChange={(e) => setForm({ ...form, subtype: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
            >
              <option value="robotniczy">Robotnicze (3 lata)</option>
              <option value="administracyjno_biurowy">Admin-biurowe (6 lat)</option>
              <option value="kierujacy">Kierujące (5 lat)</option>
              <option value="pracodawca">Pracodawca (5 lat)</option>
              <option value="inzynieryjno_techniczny">Inż-techniczne (5 lat)</option>
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700 mb-1 block">Data wykonania</span>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700 mb-1 block">Ważne do</span>
            <input
              type="date"
              value={form.expiresAt ? form.expiresAt.split('T')[0] : ''}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-blue-50/50 font-bold text-primary"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 mb-1 block">Notatki / Nr zaświadczenia</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
            rows={2}
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-6">
        <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">
          Zapisz termin
        </button>
        <button type="button" onClick={() => navigate(-1)} className="px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500">
          Anuluj
        </button>
      </div>
    </form>
  );
}
