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
  db,
  getCustomTemplates,
  getConsultantInfo
} from '../storage';
import AuditReport from '../components/AuditReport';

const AUDIT_TYPES = ['okresowy', 'kontrolny', 'powypadkowy', 'wdrożeniowy'];
const RISK_LEVELS = [
  { val: 'low', label: 'Niskie', color: 'bg-blue-100 text-blue-700' },
  { val: 'medium', label: 'Średnie', color: 'bg-yellow-100 text-yellow-700' },
  { val: 'high', label: 'Wysokie', color: 'bg-orange-100 text-orange-700' },
  { val: 'critical', label: 'Krytyczne', color: 'bg-red-600 text-white shadow-red-200 shadow-lg' }
];

const DEFAULT_AREAS = [
  "Dokumentacja i instrukcje BHP",
  "Ocena Ryzyka Zawodowego (ORZ)",
  "Szkolenia i uprawnienia pracowników",
  "Badania profilaktyczne pracowników",
  "Stanowiska pracy i ergonomia",
  "Maszyny i urządzenia techniczne",
  "Środki Ochrony Indywidualnej (ŚOI)",
  "Ochrona przeciwpożarowa (PPOŻ)",
  "Drogi ewakuacyjne i oznakowanie",
  "Pierwsza pomoc i apteczki",
  "Zaplecze higieniczno-sanitarne",
  "Oświetlenie i warunki środowiskowe"
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
  const [consultant, setConsultant] = useState(null);
  const [newArea, setNewArea] = useState('');
  
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');

  useEffect(() => {
    async function load() {
      const key = getSessionKey();
      const f = await getFirm(parseInt(firmId), key);
      const tpl = await getCustomTemplates(key);
      const cInfo = await getConsultantInfo(key);
      setFirm(f);
      setAvailableTemplates(tpl);
      setConsultant(cInfo);

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
    
    let scope = DEFAULT_AREAS;
    if (selectedTemplate !== 'default') {
      const t = availableTemplates.find(x => x.id === selectedTemplate);
      if (t) scope = t.points;
    }

    const newAudit = {
      firmId: parseInt(firmId),
      title: `Audyt BHP - ${new Date().toLocaleDateString('pl-PL')}`,
      type: 'okresowy',
      auditor: 'Główny Specjalista BHP',
      location: firm?.address || '',
      scope: scope,
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

  const handleAddArea = () => {
    if (!newArea.trim()) return;
    const currentScope = audit.scope || DEFAULT_AREAS;
    if (!currentScope.includes(newArea.trim())) {
      updateAuditData({ scope: [...currentScope, newArea.trim()] });
    }
    setNewArea('');
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
            
            <div className="mb-6 space-y-2 text-left">
              <label className="block text-xs font-bold text-slate-500 uppercase">Wybierz szablon audytu</label>
              <select 
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-primary font-medium text-slate-700"
              >
                <option value="default">Szablon Domyślny (Podstawowy)</option>
                {availableTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.points.length} pkt)</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Możesz stworzyć własne szablony w zakładce Ustawienia → Szablony Audytów.</p>
            </div>

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
    <div className={`p-4 mx-auto pb-48 ${step === 3 ? 'print:p-0 bg-white max-w-4xl print:max-w-none print:w-full' : 'max-w-lg'}`}>
      
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

           {/* Dodawanie własnego punktu */}
           <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 mt-4">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Brakuje punktu kontrolnego?</h4>
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newArea}
                   onChange={e => setNewArea(e.target.value)}
                   placeholder="Wpisz własny obszar kontrolny..."
                   className="flex-1 bg-white p-3 rounded-xl text-sm border focus:border-primary outline-none"
                   onKeyDown={e => e.key === 'Enter' && handleAddArea()}
                 />
                 <button 
                   onClick={handleAddArea}
                   disabled={!newArea.trim()}
                   className="bg-slate-800 text-white px-4 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                 >
                   DODAJ
                 </button>
              </div>
           </div>

           {/* Dodatkowy duży przycisk na końcu listy */}
           <div className="pt-10">
              <button 
                onClick={() => {
                  setStep(3);
                  window.scrollTo(0,0);
                }} 
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all text-lg"
              >
                🏁 ZAKOŃCZ I GENERUJ RAPORT
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest leading-relaxed">
                Wszystkie dane są zapisywane automatycznie.<br/>Po kliknięciu przejdziesz do podglądu wydruku PDF.
              </p>
           </div>
        </div>
      ) : (
        /* --- KROK 3: RAPORT --- */
        <AuditReport 
          audit={audit}
          firm={firm}
          items={items}
          photos={photos}
          currentScope={currentScope}
          failCount={failCount}
          consultant={consultant}
        />
      )}
    </div>
  );
}
