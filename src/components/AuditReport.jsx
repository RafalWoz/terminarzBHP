import React, { useState } from 'react';

const RISK_LEVELS = [
  { val: 'low', label: 'Niskie', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { val: 'medium', label: 'Średnie', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { val: 'high', label: 'Wysokie', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { val: 'critical', label: 'Krytyczne', color: 'bg-red-600 text-white border-red-700' }
];

export default function AuditReport({ audit, firm, items, photos, currentScope, failCount }) {
  const [template, setTemplate] = useState('modern'); // 'modern', 'classic'
  
  const complianceRate = currentScope.length > 0 
    ? Math.round(((currentScope.length - failCount) / currentScope.length) * 100) 
    : 0;

  const failedItems = Object.values(items).filter(i => i.result === 'fail');
  const passedItems = Object.values(items).filter(i => i.result === 'ok');

  return (
    <div className="bg-white">
      {/* Opcje wydruku (ukryte podczas drukowania) */}
      <div className="print:hidden bg-slate-100 p-4 rounded-xl mb-8 flex justify-between items-center border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800">Opcje Raportu</h3>
          <p className="text-xs text-slate-500">Wybierz styl wydruku</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={template} 
            onChange={(e) => setTemplate(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-primary"
          >
            <option value="modern">Styl Nowoczesny</option>
            <option value="classic">Styl Klasyczny (Urzedowy)</option>
          </select>
          <button 
            onClick={() => window.print()} 
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition-colors"
          >
            🖨️ Drukuj / PDF
          </button>
        </div>
      </div>

      {/* Kontener Raportu */}
      <div className={`print:exact-colors print:m-0 print:p-0 ${template === 'classic' ? 'font-serif' : 'font-sans'}`}>
        
        {/* NAGŁÓWEK DOKUMENTU */}
        <header className={`border-b mb-2 pb-1 ${template === 'classic' ? 'border-black' : 'border-slate-800'}`}>
          <div className="flex justify-between items-start mb-1">
            <div>
              <h1 className={`text-xl font-black uppercase tracking-tight ${template === 'classic' ? 'text-black' : 'text-slate-900'}`}>
                {audit.title || 'Raport z Audytu BHP'}
              </h1>
              <p className="text-[10px] font-bold text-slate-500 mt-0 uppercase tracking-widest">Dokumentacja Niezgodności</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold">Data: {new Date(audit.createdAt).toLocaleDateString('pl-PL')}</p>
              <p className="text-[10px] text-slate-500">Znak sprawy: {audit.id}/{new Date(audit.createdAt).getFullYear()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Obiekt audytowany</p>
              <p className="font-bold text-sm leading-tight">{firm?.name || 'Brak danych firmy'}</p>
              <p className="text-slate-600">{audit.location}</p>
              <p className="text-slate-600">NIP: {firm?.nip}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Informacje o audycie</p>
              <table className="w-full text-left">
                <tbody>
                  <tr><th className="py-0 pr-2 font-normal text-slate-500">Typ:</th><td className="font-bold capitalize">{audit.type}</td></tr>
                  <tr><th className="py-0 pr-2 font-normal text-slate-500">Audytor:</th><td className="font-bold">{audit.auditor}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </header>

        {/* STATYSTYKI */}
        <section className="mb-2 print:page-break-inside-avoid">
          <h2 className="text-[10px] font-black uppercase mb-1 border-b pb-0.5">Podsumowanie Wyników</h2>
          <div className="grid grid-cols-3 gap-2">
             <div className={`p-1 rounded-lg border text-center ${template === 'classic' ? 'border-black' : 'bg-slate-50 border-slate-300'}`}>
                <div className="text-sm font-black text-slate-900">{currentScope.length}</div>
                <div className="text-[7px] uppercase tracking-widest font-bold text-slate-700">Obszary</div>
             </div>
             <div className={`p-1 rounded-lg border text-center ${template === 'classic' ? 'border-black' : 'bg-red-50 border-red-300 text-red-800'}`}>
                <div className="text-sm font-black">{failCount}</div>
                <div className="text-[7px] uppercase tracking-widest font-bold">Uchybienia</div>
             </div>
             <div className={`p-1 rounded-lg border text-center ${template === 'classic' ? 'border-black' : 'bg-green-50 border-green-300 text-green-800'}`}>
                <div className="text-sm font-black">{complianceRate}%</div>
                <div className="text-[7px] uppercase tracking-widest font-bold">Zgodność</div>
             </div>
          </div>
        </section>

        {/* REJESTR NIEZGODNOŚCI */}
        <section className="print:mt-0">
          <h2 className="text-xs font-black uppercase mb-1 border-b pb-0.5 print:break-after-avoid">Rejestr Niezgodności i Zalecenia</h2>
          
          {failedItems.length === 0 ? (
             <p className="text-slate-500 italic text-xs">Nie stwierdzono niezgodności w badanych obszarach.</p>
          ) : (
            <div className="space-y-1">
              {failedItems.map((item, idx) => {
                const riskLevel = RISK_LEVELS.find(r => r.val === item.risk) || RISK_LEVELS[1];
                const itemPhotos = photos.filter(p => p.pointId === item.pointId);

                return (
                  <div key={idx} className={`block w-full print:break-inside-avoid border rounded-lg overflow-hidden mb-1 ${template === 'classic' ? 'border-black' : 'border-slate-300'}`}>
                    
                    {/* Header uchybienia */}
                    <div className={`flex items-center justify-between p-1 px-2 border-b ${template === 'classic' ? 'border-black bg-gray-100' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] ${template === 'classic' ? 'bg-black text-white' : 'bg-slate-800 text-white'}`}>
                          {idx + 1}
                        </span>
                        <h4 className="font-black uppercase text-xs text-slate-900">{item.pointId}</h4>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase print:exact-colors ${template === 'classic' ? 'border-black text-black' : riskLevel.color}`}>
                        Ryzyko: {riskLevel.label}
                      </span>
                    </div>

                    {/* Treść uchybienia */}
                    <div className={`p-1.5 flex ${itemPhotos.length > 0 ? 'flex-row' : 'flex-col'} items-start gap-3`}>
                      <div className={`${itemPhotos.length > 0 ? 'w-3/5' : 'w-full'} space-y-1`}>
                        <div>
                          <p className="text-[8px] font-bold text-slate-600 uppercase mb-0">Stan faktyczny (Niezgodność)</p>
                          <p className="text-xs text-slate-900 leading-tight">{item.description || 'Brak opisu.'}</p>
                        </div>
                        <div className={`p-1 rounded bg-red-50 border-l-2 ${template === 'classic' ? 'border-black bg-gray-50' : 'border-red-500'}`}>
                          <p className={`text-[8px] font-bold uppercase mb-0 ${template === 'classic' ? 'text-black' : 'text-red-800'}`}>Zalecenie Naprawcze</p>
                          <p className="text-xs text-slate-900 font-bold leading-tight">{item.recommendation || 'Brak zaleceń.'}</p>
                          {item.deadline && (
                            <p className="text-[8px] mt-0.5 font-black text-slate-800">
                              TERMIN REALIZACJI: <span className="underline">{item.deadline}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Zdjęcia */}
                      {itemPhotos.length > 0 && (
                        <div className="w-2/5 grid grid-cols-2 gap-1">
                          {itemPhotos.map((p, pIdx) => (
                            <div key={pIdx} className="border border-slate-200 rounded overflow-hidden bg-slate-50 aspect-square">
                              <img src={URL.createObjectURL(p.blob)} alt="Usterka" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ZGODNE OBSZARY */}
        {passedItems.length > 0 && (
          <section className="mt-2 print:mt-1 print:break-inside-avoid">
            <h2 className="text-[10px] font-black uppercase mb-1 border-b pb-0.5 text-slate-700 print:break-after-avoid">Obszary bez zastrzeżeń (Zgodne)</h2>
            <div className="flex flex-wrap gap-1">
              {passedItems.map((item, idx) => (
                <span key={idx} className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase ${template === 'classic' ? 'border-black text-black' : 'bg-green-50 text-green-800 border-green-200'} print:exact-colors`}>
                  ✓ {item.pointId}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* STOPKA PODPISY */}
        <section className="mt-4 pt-4 print:mt-2 print:pt-2 print:break-inside-avoid">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="border-b border-black w-32 mx-auto mb-1"></div>
              <p className="text-[9px] font-bold uppercase text-slate-500">Podpis Audytora</p>
            </div>
            <div>
              <div className="border-b border-black w-32 mx-auto mb-1"></div>
              <p className="text-[9px] font-bold uppercase text-slate-500">Podpis Przedstawiciela Firmy</p>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
