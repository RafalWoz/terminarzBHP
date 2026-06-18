import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  addTraining, 
  addMedical,
  updateTraining,
  updateMedical,
  getTraining,
  getMedical,
  getSessionKey 
} from '../storage';
import { calculateTrainingExpiration, calculateMedicalExpiration } from '../utils/expirations';

function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
}

function buildDefaultForm(firmId, employeeId) {
  return {
    employeeId: parseInt(employeeId),
    firmId: parseInt(firmId),
    type: 'okresowe',
    subtype: 'robotniczy',
    date: new Date().toISOString().split('T')[0],
    expiresAt: '',
    notes: ''
  };
}

export default function RecordForm() {
  const { firmId, employeeId, recordKind, recordId } = useParams();
  const isEditing = Boolean(recordKind && recordId);

  const navigate = useNavigate();
  const [table, setTable] = useState(recordKind === 'medicals' ? 'medicals' : 'trainings');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const skipNextAutoCalculation = useRef(false);

  const [form, setForm] = useState(() => buildDefaultForm(firmId, employeeId));

  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;

    async function loadRecord() {
      setIsLoading(true);
      setError('');

      try {
        const key = getSessionKey();
        const numericRecordId = parseInt(recordId);
        let record;

        if (recordKind === 'trainings') {
          setTable('trainings');
          record = await getTraining(numericRecordId, key);
        } else if (recordKind === 'medicals') {
          setTable('medicals');
          record = await getMedical(numericRecordId, key);
        } else {
          throw new Error('Nieznany typ wpisu.');
        }

        if (!record) {
          throw new Error('Nie znaleziono wpisu.');
        }

        if (cancelled) return;
        skipNextAutoCalculation.current = true;
        setForm({
          employeeId: record.employeeId || parseInt(employeeId),
          firmId: record.firmId || parseInt(firmId),
          type: record.type || 'okresowe',
          subtype: record.subtype || 'robotniczy',
          date: toDateInputValue(record.date),
          expiresAt: toDateInputValue(record.expiresAt),
          notes: record.notes || ''
        });
      } catch (err) {
        if (!cancelled) {
          setError('Nie udało się wczytać wpisu: ' + err.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRecord();

    return () => {
      cancelled = true;
    };
  }, [isEditing, recordKind, recordId, employeeId, firmId]);

  // Auto-calculate expiration when date or type changes
  useEffect(() => {
    if (skipNextAutoCalculation.current) {
      skipNextAutoCalculation.current = false;
      return;
    }

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
        employeeId: parseInt(employeeId),
        firmId: parseInt(firmId),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
      };

      if (isEditing) {
        const numericRecordId = parseInt(recordId);
        if (Number.isNaN(numericRecordId)) {
          throw new Error('Nieprawidłowy identyfikator wpisu.');
        }

        if (table === 'trainings') {
          await updateTraining(numericRecordId, data, key);
        } else {
          await updateMedical(numericRecordId, data, key);
        }
      } else if (table === 'trainings') {
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
      <h1 className="text-2xl font-bold mb-2 text-slate-800">{isEditing ? 'Edytuj termin' : 'Dodaj termin'}</h1>
      {isEditing && (
        <p className="text-sm text-gray-500 mb-6">
          Popraw datę, typ lub notatkę. Po zapisaniu wpis w historii zostanie zaktualizowany.
        </p>
      )}

      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          disabled={isEditing}
          onClick={() => setTable('trainings')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${table === 'trainings' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'} ${isEditing ? 'cursor-default' : ''}`}
        >
          Szkolenie
        </button>
        <button
          type="button"
          disabled={isEditing}
          onClick={() => setTable('medicals')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${table === 'medicals' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'} ${isEditing ? 'cursor-default' : ''}`}
        >
          Badanie
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-sm font-medium text-gray-500">
          Ładowanie wpisu…
        </div>
      ) : (
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
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-6">
        <button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 disabled:opacity-60">
          {isEditing ? 'Zapisz zmiany' : 'Zapisz termin'}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500">
          Anuluj
        </button>
      </div>
    </form>
  );
}
