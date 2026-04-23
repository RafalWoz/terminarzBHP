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
  const [items, setItems] = useState({}); 
  const [photos, setPhotos] = useState([]);
  const [firm, setFirm] = useState(null);
  const [isReportMode, setIsReportMode] = useState(false);

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
    const meta = { pointId: 'general', description: 'Zdjecie z audytu' };
    const photoId = await addAuditPhoto(parseInt(auditId), file, meta, key);
    setPhotos(prev => [...prev, { id: photoId, blob: file, ...meta }]);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-10 text-center">Ladowanie...</div>;

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
        <button onClick={() => navigate(-1)} className="w-full mt-6 py-4 text-gray-500 font-bold">Anuluj</button>
      </div>
    );
  }

  const template = AUDIT_TEMPLATES.find(t => t.id === audit.templateId) || AUDIT_TEMPLATES[0];
  const allPoints = template.categories.flatMap(c => c.items);
  const results = Object.values(items);
  const failCount = results.filter(r => r.result === 'fail').length;

  return (
    <div className={`p-4 max-w-lg mx-auto pb-32 ${isReportMode ? 'print:p-0 print:max-w-none bg-white' : ''}`}>
      
      {/* Nawigacja */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link to={`/firms/${firmId}/audits`} className="text-sm text-gray-400">← Wstecz</Link>
        <button 
          onClick={() => setIsReportMode(!isReportMode)}
          className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl"
        >
          {isReportMode ? 'Tryb Edycji' : 'Podgląd Raportu'}
        </button>
      </div>

      <div className={`${isReportMode ? 'space-y-6' : 'space-y-8'}`}>
        
        {/* Naglowek Raportu */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-black text-slate-900 uppercase">{audit.title}</h1>
          <div className="flex justify-between mt-2 text-sm">
            <div>
              <p className="font-bold">Klient: {firm?.name}</p>
              <p className="text-gray-500">Data: {new Date(audit.createdAt).toLocaleDateString('pl-PL')}</p>
            </div>
            {isReportMode && (
              <div className="text-right">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                  Uchybienia: {failCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Kategorie i items */}
        {template.categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-3 break-inside-avoid">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 border-l-4 border-primary pl-2">{cat.name}</h2>
            {cat.items.map((item) => {
              const pointId = `${catIdx}-${item}`;
              const state = items[pointId] || {};
              
              if (isReportMode && !state.result) return null; 

              return (
                <div key={item} className={`bg-white p-4 rounded-xl border ${state.result === 'fail' ? 'border-red-200 bg-red-50/10' : 'border-gray-100'} shadow-sm`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="font-semibold text-slate-700 text-sm leading-snug">{item}</div>
                    {isReportMode ? (
                      <div className={`text-[10px] font-black px-2 py-1 rounded ${
                        state.result === 'ok' ? 'text-green-600' : state.result === 'fail' ? 'text-red-600 bg-red-100' : 'text-gray-400'
                      }`}>
                        {state.result === 'ok' ? 'OK' : state.result === 'fail' ? 'UCHYBIENIE' : 'N/D'}
                      </div>
                    ) : (
                      <div className="flex gap-1 shrink-0">
                        <StatusBtn label="OK" active={state.result === 'ok'} color="green" onClick={() => handleUpdateItem(pointId, 'ok')} />
                        <StatusBtn label="NIE" active={state.result === 'fail'} color="red" onClick={() => handleUpdateItem(pointId, 'fail')} />
                        <StatusBtn label="N/D" active={state.result === 'na'} color="gray" onClick={() => handleUpdateItem(pointId, 'na')} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Zdjecia */}
        {photos.length > 0 && (
          <div className="mt-10 break-before-page">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Dokumentacja foto</h2>
            <div className={`grid ${isReportMode ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
              {photos.map(p => (
                <div key={p.id} className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <img src={URL.createObjectURL(p.blob)} alt="Audit" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panele Akcji */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 print:hidden">
        {isReportMode ? (
          <button 
            onClick={handlePrint}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
          >
            <span>🖨️</span> Drukuj / Zapisz jako PDF
          </button>
        ) : (
          <div className="flex gap-2">
            <label className="flex-1 bg-white border-2 border-primary text-primary py-4 rounded-2xl font-bold text-center cursor-pointer shadow-xl active:scale-95 transition-transform">
              <span>📸 Dodaj Zdjęcie</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAddPhoto} />
            </label>
            <button 
              onClick={() => setIsReportMode(true)}
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-transform"
            >
              🏁 Gotowe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBtn({ label, active, color, onClick }) {
  const styles = {
    green: active ? 'bg-green-500 text-white border-green-500' : 'bg-white text-green-600 border-gray-100',
    red: active ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-600 border-gray-100',
    gray: active ? 'bg-slate-500 text-white border-slate-500' : 'bg-white text-slate-400 border-gray-100',
  };
  return (
    <button 
      onClick={onClick} 
      className={`w-10 h-8 rounded-lg border text-[10px] font-bold transition-all ${styles[color]}`}
    >
      {label}
    </button>
  );
}
