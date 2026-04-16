import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addFirm, updateFirm, getFirm, deleteFirm } from '../db/firms';

export default function FirmForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const [form, setForm] = useState({
    name: '', nip: '', address: '',
    contactPerson: '', phone: '', email: '', notes: '',
  });

  useEffect(() => {
    if (isEdit) {
      getFirm(parseInt(id)).then((firm) => {
        if (firm) setForm(firm);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Nazwa firmy jest wymagana');
      return;
    }
    if (isEdit) {
      await updateFirm(parseInt(id), form);
    } else {
      await addFirm(form);
    }
    navigate('/firms');
  };

  const handleDelete = async () => {
    if (!window.confirm('Usunąć tę firmę? Tej akcji nie można cofnąć.')) return;
    await deleteFirm(parseInt(id));
    navigate('/firms');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        {isEdit ? 'Edytuj firmę' : 'Nowa firma'}
      </h1>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <Field label="Nazwa firmy *" value={form.name}
          onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="NIP" value={form.nip}
          onChange={(v) => setForm({ ...form, nip: v })} />
        <Field label="Adres" value={form.address}
          onChange={(v) => setForm({ ...form, address: v })} />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Kontakt</h2>
        <Field label="Osoba kontaktowa" value={form.contactPerson}
          onChange={(v) => setForm({ ...form, contactPerson: v })} />
        <Field label="Telefon" value={form.phone} type="tel"
          onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Email" value={form.email} type="email"
          onChange={(v) => setForm({ ...form, email: v })} />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <Field label="Notatki" value={form.notes} multiline
          onChange={(v) => setForm({ ...form, notes: v })} />
      </div>

      <div className="flex gap-3 pt-6">
        <button type="submit" className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-semibold shadow hover:bg-blue-900 transition-colors">
          {isEdit ? 'Zapisz zmiany' : 'Dodaj firmę'}
        </button>
        <button type="button" onClick={() => navigate(-1)}
          className="px-6 py-3 border border-gray-300 bg-white shadow-sm rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Anuluj
        </button>
      </div>

      {isEdit && (
        <button type="button" onClick={handleDelete}
          className="w-full mt-4 text-red-600 font-semibold py-3 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
          ⚠️ Usuń firmę i jej dane
        </button>
      )}
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', multiline = false }) {
  const Component = multiline ? 'textarea' : 'input';
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 mb-1 block">{label}</span>
      <Component
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={multiline ? 3 : undefined}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
      />
    </label>
  );
}
