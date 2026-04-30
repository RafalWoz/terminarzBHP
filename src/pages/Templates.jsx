import { useState, useEffect } from 'react';
import { getSessionKey, getCustomTemplates, saveCustomTemplates } from '../storage';
import { Link } from 'react-router-dom';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newPoint, setNewPoint] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const key = getSessionKey();
    const t = await getCustomTemplates(key);
    setTemplates(t);
    setLoading(false);
  }

  const handleSave = async (updatedTemplates) => {
    const key = getSessionKey();
    await saveCustomTemplates(updatedTemplates, key);
    setTemplates(updatedTemplates);
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      id: Date.now().toString(),
      name: 'Nowy Szablon Audytu',
      points: ['Punkt 1']
    });
  };

  const saveCurrentEdit = async () => {
    if (!editingTemplate.name.trim() || editingTemplate.points.length === 0) {
      alert("Szablon musi mieć nazwę i co najmniej jeden punkt kontrolny.");
      return;
    }
    const exists = templates.find(t => t.id === editingTemplate.id);
    let newTemplates;
    if (exists) {
      newTemplates = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
    } else {
      newTemplates = [...templates, editingTemplate];
    }
    await handleSave(newTemplates);
    setEditingTemplate(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten szablon?")) return;
    const newTemplates = templates.filter(t => t.id !== id);
    await handleSave(newTemplates);
  };

  const addPoint = () => {
    if (!newPoint.trim()) return;
    setEditingTemplate({
      ...editingTemplate,
      points: [...editingTemplate.points, newPoint.trim()]
    });
    setNewPoint('');
  };

  const removePoint = (index) => {
    const pts = [...editingTemplate.points];
    pts.splice(index, 1);
    setEditingTemplate({ ...editingTemplate, points: pts });
  };

  if (loading) return <div className="p-10 text-center">Ładowanie szablonów...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto pb-32">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/settings" className="hover:text-primary">Ustawienia</Link>
        <span>/</span>
        <span className="font-medium text-gray-800">Szablony Audytów</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Moje Szablony</h1>
        {!editingTemplate && (
          <button 
            onClick={handleCreateNew}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold shadow-sm"
          >
            + Nowy
          </button>
        )}
      </div>

      {editingTemplate ? (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nazwa Szablonu</label>
            <input 
              type="text" 
              value={editingTemplate.name}
              onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
              className="w-full border-b-2 border-slate-200 pb-2 text-xl font-bold focus:border-primary outline-none"
              placeholder="Np. Audyt Magazynu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Punkty Kontrolne ({editingTemplate.points.length})</label>
            <div className="space-y-2 mb-4">
              {editingTemplate.points.map((pt, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-sm font-medium text-slate-700">{idx + 1}. {pt}</span>
                  <button onClick={() => removePoint(idx)} className="text-red-500 font-bold hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newPoint}
                onChange={e => setNewPoint(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPoint()}
                placeholder="Dodaj nowy punkt..."
                className="flex-1 bg-slate-100 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button 
                onClick={addPoint}
                disabled={!newPoint.trim()}
                className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                Dodaj
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setEditingTemplate(null)}
              className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold"
            >
              Anuluj
            </button>
            <button 
              onClick={saveCurrentEdit}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-md shadow-primary/20"
            >
              Zapisz Szablon
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">Brak własnych szablonów.</p>
              <p className="text-xs text-slate-400 mt-1">Dodaj nowy, aby używać go podczas audytów.</p>
            </div>
          ) : (
            templates.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t.points.length} punktów kontrolnych</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingTemplate(t)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
