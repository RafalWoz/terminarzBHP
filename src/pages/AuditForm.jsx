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
  getFirm,
  encrypt,
  db
} from '../storage';

const AUDIT_TYPES = ['okresowy', 'kontrolny', 'powypadkowy', 'wdrożeniowy'];
const RISK_LEVELS = [
  { val: 'low', label: 'Niskie', color: 'bg-blue-100 text-blue-700' },
  { val: 'medium', label: 'Średnie', color: 'bg-yellow-100 text-yellow-700' },
  { val: 'high', label: 'Wysokie', color: 'bg-orange-100 text-orange-700' },
  { val: 'critical', label: 'Krytyczne', color: 'bg-red-600 text-white shadow-red-200 shadow-lg' }
];

const DEFAULT_AREAS = [
  "Dokumentacja BHP",
  "Ocena ryzyka zawodowego",
  "Szkolenia BHP",
  "Stan techniczny stanowisk",
  "Maszyny i urządzenia",
  "Środki ochrony indywidualnej (ŚOI)",
  "Ewakuacja i PPOŻ",
  "Badania lekarskie",
  "Czynniki szkodliwe"
];

export default function AuditForm() {
  const { firmId, id: auditId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [step, setStep] = useState(1); // 1: Dane, 2: Zakres/Realizacja, 3: Podsumowanie/Raport
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [items, setItems] = useState({}); 
  const [photos, setPhotos] = useState([]);
  const [firm, setFirm] = useState(null);

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
          itemsMap[i.pointId] = i; 
        });
        setItems(itemsMap);
        setPhotos(ph);
      }
      setLoading(false);
    }
    load();
  }, [auditId, firmId]);

  const handleStartAudit = async () => {
    const key = getSessionKey();
    const newAudit = {
      firmId: parseInt(firmId),
      title: `Audyt BHP - ${new Date().toLocaleDateString('pl-PL')}`,
      type: 'okresowy',
      auditor: 'Główny Specjalista BHP',
      location: firm?.address || '',
      scope: DEFAULT_AREAS,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    const id = await addAudit(newAudit, key);
    navigate(`/firms/${firmId}/audits/${id}`);
    setStep(2);
  };

  const updateAuditData = async (fields) => {
    const key = getSessionKey();
    const updated = { ...audit, ...fields };
    setAudit(updated);
    const { id, firmId: fId, status, createdAt, updatedAt, ...sensitive } = updated;
    const encryptedData = await encrypt(sensitive, key);
    await db.audits.update(id, { encryptedData, updatedAt: new Date().toISOString() });
  };

  const updateItemData = async (pointId, fields) => {
    const key = getSessionKey();
    const current = items[pointId] || { pointId, result: 'ok' };
    const updated = { ...current, ...fields };
    setItems(prev => ({ ...prev, [pointId]: updated }));
    
    await addAuditItem({
      auditId: parseInt(auditId),
      pointId,
      ...updated
    }, key);
  };

  const handleAddPhoto = async (e, pointId = 'general') => {
    const file = e.target.files[0];
    if (!file) return;
    const key = getSessionKey();
    const meta = { pointId, description: 'Zdjecie uchybienia' };
    const photoId = await addAuditPhoto(parseInt(auditId), file, meta, key);
    setPhotos(prev => [...prev, { id: photoId, blob: file, ...meta }]);
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Ładowanie systemu audytowego...</div>;
  if (!audit && auditId !== 'new') return <div className="p-10 text-center text-red-500">Błąd: Nie znaleziono audytu.</div>;

  // --- KROK 0: START (jeśli nowy) ---
  if (!auditId || auditId === 'new' || !audit) {
    return (
      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="text-center">
            <h1 className="text-2xl font-black text-slate-800">Nowy Audyt BHP</h1>
            <p className="text-sm text-slate-500 mt-1">Rozpocznij proces dokumentowania niezgodności</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4">Ustawienia wstępne</h3>
            <p className="text-sm text-slate-500 mb-6">System załaduje domyślne obszary kontrolne dla firmy <strong>{firm?.name}</strong>.</p>
            <button onClick={handleStartAudit} className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
              URUCHOM FORMULARZ AUDYTU
            </button>
        </div>
      </div>
    );
  }

  // --- KROK 1: DANE ---
  if (step === 1) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6 pb-24">
        <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3 transition-all" />
            </div>
            <span className="text-[10px] font-black text-primary">DANE</span>
        </div>
        <h2 className="text-xl font-black text-slate-800">Krok 1: Dane audytu</h2>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <label className="block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nazwa audytu / Numer / Obiekt</span>
                <input type="text" value={audit.title || ''} onChange={e => updateAuditData({title: e.target.value})} className="w-full font-bold border-b py-2 focus:border-primary outline-none" placeholder="np. Audyt warsztatu" />
            </label>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Typ audytu</span>
                    <select value={audit.type || 'okresowy'} onChange={e => updateAuditData({type: e.target.value})} className="w-full bg-slate-50 p-2 rounded-lg text-sm mt-1">
                        {AUDIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </label>
                <label className="block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audytor</span>
                    <input type="text" value={audit.auditor || ''} onChange={e => updateAuditData({auditor: e.target.value})} className="w-full bg-slate-50 p-2 rounded-lg text-sm mt-1" />
                </label>
            </div>
            <label className="block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lokalizacja / Adres zakładu</span>
                <input type="text" value={audit.location || ''} onChange={e => updateAuditData({location: e.target.value})} className="w-full bg-slate-50 p-2 rounded-lg text-sm mt-1" />
            </label>
        </div>
        <button onClick={() => setStep(2)} className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            DALEJ: REALIZACJA AUDYTU
        </button>
      </div>
    );
  }

  // Fallback dla zakresu audytu
  const currentScope = audit.scope || DEFAULT_AREAS;
  const failCount = Object.values(items).filter(i => i.result === 'fail').length;

  return (
    <div className={`p-4 max-w-lg mx-auto pb-48 ${step === 3 ? 'print:p-0 bg-white' : ''}`}>
      
      {/* Dynamicznie zmieniający się Header */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={() => setStep(step - 1)} className="text-xs font-bold text-slate-400">← Wstecz</button>
        <div className="flex gap-2">
           <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-black">UCHYBIENIA: {failCount}</span>
           <button onClick={() => setStep(3)} className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">Widok Raportu</button>
        </div>
      </div>

      {step === 2 ? (
        <div className="space-y-8">
           <h2 className="text-xl font-black text-slate-800">Krok 2: Obszary Kontrolne</h2>
           {currentScope.map((area, idx) => (
             <div key={idx} className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase border-l-4 border-primary pl-3">{area}</h3>
                <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-700">Status obszaru</span>
                     <div className="flex gap-1">
                        {['ok', 'fail', 'na'].map(s => {
                           const statusState = items[area]?.result === s;
                           const colors = { ok: 'bg-green-500', fail: 'bg-red-500', na: 'bg-slate-400' };
                           return (
                             <button key={s} onClick={() => updateItemData(area, {result: s})} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${statusState ? `${colors[s]} text-white` : 'bg-slate-100 text-slate-400'}`}>
                               {s === 'ok' ? 'OK' : s === 'fail' ? 'Uchyb' : 'N/D'}
                             </button>
                           )
                        })}
                     </div>
                   </div>

                   {/* Pola szczegółowe przy niezgodności */}
                   <div className={`space-y-4 transition-all ${items[area]?.result === 'fail' ? 'opacity-100 max-h-screen' : 'opacity-30 blur-[1px]'}`}>
                      <label className="block">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Opis stanu faktycznego (niezgodność)</span>
                         <textarea 
                           className="w-full bg-slate-50 p-3 rounded-xl text-sm border focus:border-red-300 outline-none mt-1" 
                           placeholder="Dlaczego jest niezgodnie? Co zaobserwowano?"
                           value={items[area]?.description || ''}
                           onChange={e => updateItemData(area, {description: e.target.value})}
                         />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                         <label className="block">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Ryzyko</span>
                            <select 
                               value={items[area]?.risk || 'medium'} 
                               onChange={e => updateItemData(area, {risk: e.target.value})}
                               className="w-full bg-slate-50 p-2 rounded-lg text-xs mt-1"
                            >
                               {RISK_LEVELS.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
                            </select>
                         </label>
                         <label className="block">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Termin realizacji</span>
                            <input 
                              type="date" 
                              value={items[area]?.deadline || ''} 
                              onChange={e => updateItemData(area, {deadline: e.target.value})}
                              className={`w-full p-2 rounded-lg text-xs mt-1 border ${items[area]?.risk === 'critical' ? 'border-red-500 bg-red-50' : 'bg-slate-50'}`} 
                            />
                         </label>
                      </div>
                      <label className="block">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Zalecenie naprawcze</span>
                         <input 
                           type="text" 
                           placeholder="Co należy zrobić, aby naprawić usterkę?" 
                           className="w-full bg-slate-50 p-3 rounded-xl text-sm border outline-none mt-1" 
                           value={items[area]?.recommendation || ''}
                           onChange={e => updateItemData(area, {recommendation: e.target.value})}
                         />
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <label className="flex-1 bg-slate-100 py-3 rounded-xl text-[10px] font-bold text-center cursor-pointer">
                           📷 DODAJ ZDJĘCIE
                           <input type="file" capture="environment" className="hidden" onChange={e => handleAddPhoto(e, area)} />
                        </label>
                        {photos.filter(p => p.pointId === area).length > 0 && (
                          <span className="text-[10px] bg-primary text-white px-2 py-1 rounded">ZDJĘCIA: {photos.filter(p => p.pointId === area).length}</span>
                        )}
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        /* --- KROK 3: RAPORT --- */
        <div className="space-y-6">
           {/* Header Raportu */}
           <div className="border-b-4 border-slate-900 pb-4">
              <h1 className="text-3xl font-black uppercase text-slate-900">{audit.title}</h1>
              <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-slate-600">
                 <p><strong>Typ:</strong> {audit.type}</p>
                 <p><strong>Firma:</strong> {firm?.name}</p>
                 <p><strong>Audytor:</strong> {audit.auditor}</p>
                 <p><strong>Lokalizacja:</strong> {audit.location}</p>
              </div>
           </div>

           {/* Statystyki */}
           <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 text-white p-3 rounded-2xl text-center">
                 <div className="text-2xl font-black">{currentScope.length}</div>
                 <div className="text-[8px] uppercase tracking-widest font-bold">Obszary</div>
              </div>
              <div className="bg-red-500 text-white p-3 rounded-2xl text-center">
                 <div className="text-2xl font-black">{failCount}</div>
                 <div className="text-[8px] uppercase tracking-widest font-bold">Uchybienia</div>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-2xl text-center">
                 <div className="text-2xl font-black">{currentScope.length > 0 ? Math.round(((currentScope.length - failCount) / currentScope.length) * 100) : 0}%</div>
                 <div className="text-[8px] uppercase tracking-widest font-bold">Zgodność</div>
              </div>
           </div>

           {/* Lista uchybień w pełnej strukturze */}
           <div className="space-y-8 mt-10">
              <h3 className="text-lg font-black bg-slate-100 p-3 rounded-xl print:bg-transparent print:p-0">REJESTR NIEZGODNOŚCI I ZALECENIA</h3>
              {Object.values(items).filter(i => i.result === 'fail').map((item, idx) => (
                <div key={idx} className="border-b pb-6 break-inside-avoid">
                   <div className="flex gap-2 items-center mb-2">
                      <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                      <h4 className="font-black text-slate-800 uppercase text-sm">{item.pointId}</h4>
                      <span className={`ml-auto text-[8px] font-black px-2 py-1 rounded uppercase ${RISK_LEVELS.find(r => r.val === item.risk)?.color}`}>
                         Ryzyko: {RISK_LEVELS.find(r => r.val === item.risk)?.label}
                      </span>
                   </div>
                   
                   <div className="pl-10 space-y-3">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Stan faktyczny:</p>
                         <p className="text-sm text-slate-700">{item.description}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border-l-4 border-red-500">
                         <p className="text-[10px] font-bold text-red-400 uppercase">Zalecenie Naprawcze:</p>
                         <p className="text-sm font-bold text-slate-800">{item.recommendation}</p>
                         {item.deadline && <p className="text-[10px] mt-1 text-red-600 font-bold">TERMIN: {item.deadline}</p>}
                      </div>
                      
                      {/* Zdjęcia uchybienia */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                         {photos.filter(p => p.pointId === item.pointId).map((p, pIdx) => (
                           <div key={pIdx} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border">
                              <img src={URL.createObjectURL(p.blob)} alt="Usterka" className="w-full h-full object-cover" />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <button onClick={() => window.print()} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl print:hidden">GENERUJ RAPORT PDF</button>
        </div>
      )}
    </div>
  );
}
