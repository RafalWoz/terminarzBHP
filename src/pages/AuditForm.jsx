import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getAudit, 
  addAudit, 
  getAuditItems, 
  addAuditItem, 
  addAuditPhoto, 
  getAuditPhotos, 
  getSessionKey, 
  AUDIT_TEMPLATES,
  getFirm
} from '../storage';

export default function AuditForm() {
  const { firmId, id: auditId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [items, setItems] = useState({}); // { pointId: { result, notes } }
  const [photos, setPhotos] = useState([]);
  const [firm, setFirm] = useState(null);
  
  // Selection state if it's a new audit
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    async function load() {
      const key = getSessionKey();
      const f = await getFirm(parseInt(firmId), key);
      setFirm(f);

      if (auditId && auditId !== 'new') {
        const a = await getAudit(parseInt(auditId), key);
        const it = await getAuditItems(parseInt(auditId), key);
        const ph = await getAuditPhotos(parseInt(auditId), key);
        
        setAudit(a);
        const itemsMap = {};
        it.forEach(i => {
          itemsMap[i.pointId] = { result: i.result, notes: i.notes };
        });
        setItems(itemsMap);
        setPhotos(ph);
      }
      setLoading(false);
    }
    load();
  }, [auditId, firmId]);

  const handleStartAudit = async (template) => {
    const key = getSessionKey();
    const newAudit = {
      firmId: parseInt(firmId),
      title: template.title,
      templateId: template.id,
      status: 'draft'
    };
    const id = await addAudit(newAudit, key);
    navigate(`/firms/${firmId}/audits/${id}`);
  };

  const handleUpdateItem = async (pointId, result) => {
    const key = getSessionKey();
    const current = items[pointId] || {};
    const updated = { ...current, result };
    
    setItems(prev => ({ ...prev, [pointId]: updated }));
    
    // Save to DB (ideally we want to update if exists, but for MVP we can add or simple upsert logic)
    // Here we'll just add/update in memory and we could have a "Save" button or auto-save
    await addAuditItem({
      auditId: parseInt(auditId),
      pointId,
      result,
      notes: updated.notes || ''
    }, key);
  };

  const handleAddPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const key = getSessionKey();
    // In real app: compress image first
    const blob = file; 
    const meta = { pointId: 'general', description: 'Zdjęcie z audytu' };
    
    const photoId = await addAuditPhoto(parseInt(auditId), blob, meta, key);
    setPhotos(prev => [...prev, { id: photoId, blob, ...meta }]);
  };

  if (loading) return <div className="p-10 text-center">Ładowanie...</div>;

  // 1. Template Selection Screen
  if (!auditId || auditId === 'new') {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Wybierz szablon audytu</h1>
        <div className="space-y-4">
          {AUDIT_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => handleStartAudit(t)}
              className="w-full bg-white p-6 rounded-2xl border border-gray-200 text-left hover:border-primary transition-all shadow-sm"
            >
              <div className="text-lg font-bold text-slate-800">{t.title}</div>
              <p className="text-sm text-gray-500 mt-1">Liczba kategorii: {t.categories.length}</p>
            </button>
          ))}
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-full mt-6 py-4 text-gray-500 font-bold"
        >
          Anuluj
        </button>
      </div>
    );
  }

  // 2. Audit Execution Screen
  const template = AUDIT_TEMPLATES.find(t => t.id === audit.templateId) || AUDIT_TEMPLATES[0];

  return (
    <div className="p-4 max-w-lg mx-auto pb-32">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{audit.title}</h1>
          <div className="text-xs text-gray-400">Firma: {firm?.name}</div>
        </div>
        <button 
          onClick={() => navigate(`/firms/${firmId}/audits`)}
          className="text-xs font-bold text-primary bg-blue-50 px-3 py-2 rounded-lg"
        >
          Gotowe
        </button>
      </div>

      <div className="space-y-8">
        {template.categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">{cat.name}</h2>
            {cat.items.map((item) => {
              const pointId = `${catIdx}-${item}`;
              const state = items[pointId] || {};
              return (
                <div key={item} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="font-semibold text-slate-700 leading-snug">{item}</div>
                  <div className="flex gap-2">
                    <ActionButton 
                      label="OK" 
                      active={state.result === 'ok'} 
                      color="green" 
                      onClick={() => handleUpdateItem(pointId, 'ok')} 
                    />
                    <ActionButton 
                      label="NIE" 
                      active={state.result === 'fail'} 
                      color="red" 
                      onClick={() => handleUpdateItem(pointId, 'fail')} 
                    />
                    <ActionButton 
                      label="N/D" 
                      active={state.result === 'na'} 
                      color="gray" 
                      onClick={() => handleUpdateItem(pointId, 'na')} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Photo Section */}
      <div className="mt-10">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Zdjęcia i dokumentacja</h2>
        <div className="grid grid-cols-3 gap-2">
          {photos.map(p => (
            <div key={p.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
               <img 
                 src={URL.createObjectURL(p.blob)} 
                 alt="Podgląd" 
                 className="w-full h-full object-cover"
               />
            </div>
          ))}
          <button 
            onClick={() => fileInputRef.current.click()}
            className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 hover:text-primary hover:border-primary transition-all"
          >
            <span className="text-2xl">📸</span>
            <span className="text-[10px] font-bold mt-1">DODAJ</span>
          </button>
        </div>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={handleAddPhoto}
      />
    </div>
  );
}

function ActionButton({ label, active, color, onClick }) {
  const colors = {
    green: active ? 'bg-green-500 text-white border-green-500' : 'bg-white text-green-600 border-green-100',
    red: active ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-600 border-red-100',
    gray: active ? 'bg-slate-500 text-white border-slate-500' : 'bg-white text-slate-400 border-slate-100',
  };
  
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded-xl border font-black text-xs transition-all ${colors[color]}`}
    >
      {label}
    </button>
  );
}
