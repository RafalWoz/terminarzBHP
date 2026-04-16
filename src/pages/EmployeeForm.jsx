import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  addEmployee, 
  updateEmployee, 
  getEmployee, 
  deleteEmployee, 
  getSessionKey 
} from '../storage';

export default function EmployeeForm() {
  const { firmId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    position: '',
    hireDate: '',
    notes: '',
    firmId: parseInt(firmId)
  });

  useEffect(() => {
    if (isEdit) {
      const key = getSessionKey();
      getEmployee(parseInt(id), key).then((emp) => {
        if (emp) setForm(emp);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lastName.trim()) {
      alert('Nazwisko jest wymagane');
      return;
    }
    
    const key = getSessionKey();
    if (isEdit) {
      await updateEmployee(parseInt(id), form, key);
    } else {
      await addEmployee(form, key);
    }
    navigate(`/firms/${firmId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Usunąć tego pracownika i całą historię jego szkoleń?')) return;
    await deleteEmployee(parseInt(id));
    navigate(`/firms/${firmId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        {isEdit ? 'Edytuj pracownika' : 'Nowy pracownik'}
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-700 mb-1 block">Imię</span>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="np. Jan"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 mb-1 block">Nazwisko *</span>
          <input
            type="text"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="np. Kowalski"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 mb-1 block">Stanowisko</span>
          <input
            type="text"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="np. Ślusarz"
          />
        </label>
      </div>

      <div className="flex gap-3 pt-6">
        <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-900 transition-all">
          {isEdit ? 'Zapisz zmiany' : 'Dodaj pracownika'}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500">
          Anuluj
        </button>
      </div>

      {isEdit && (
        <button
          type="button"
          onClick={handleDelete}
          className="w-full mt-4 text-red-500 font-bold py-3 border border-red-50 bg-red-50/30 rounded-xl hover:bg-red-50 transition-colors"
        >
          Usuń pracownika
        </button>
      )}
    </form>
  );
}
