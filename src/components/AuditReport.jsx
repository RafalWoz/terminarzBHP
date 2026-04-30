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

  return (
    <div className="bg-white min-h-screen">
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
        <header className={`border-b-2 mb-8 pb-6 ${template === 'classic' ? 'border-black' : 'border-slate-800'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className={`text-3xl font-black uppercase tracking-tight ${template === 'classic' ? 'text-black' : 'text-slate-900'}`}>
                {audit.title || 'Raport z Audytu BHP'}
              </h1>
              <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Dokumentacja Niezgodności</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">Data: {new Date(audit.createdAt).toLocaleDateString('pl-PL')}</p>
              <p className="text-xs text-slate-500">Znak sprawy: {audit.id}/{new Date(audit.createdAt).getFullYear()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Obiekt audytowany</p>
              <p className="font-bold text-lg">{firm?.name || 'Brak danych firmy'}</p>
              <p className="text-slate-600">{audit.location}</p>
              <p className="text-slate-600">NIP: {firm?.nip}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Informacje o audycie</p>
              <table className="w-full text-left">
                <tbody>
                  <tr><th className="py-1 pr-4 font-normal text-slate-500">Typ przeglądu:</th><td className="font-bold capitalize">{audit.type}</td></tr>
                  <tr><th className="py-1 pr-4 font-normal text-slate-500">Przeprowadził:</th><td className="font-bold">{audit.auditor}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </header>

        {/* STATYSTYKI */}
        <section className="mb-10 print:page-break-inside-avoid">
          <h2 className="text-lg font-black uppercase mb-4 border-b pb-2">Podsumowanie Wyników</h2>
          <div className="grid grid-cols-3 gap-4">
             <div className={`p-4 rounded-xl border-2 text-center ${template === 'classic' ? 'border-black' : 'bg-slate-50 border-slate-300'}`}>
                <div className="text-3xl font-black text-slate-900">{currentScope.length}</div>
                <div className="text-xs uppercase tracking-widest font-bold text-slate-700 mt-1">Obszary</div>
             </div>
             <div className={`p-4 rounded-xl border-2 text-center ${template === 'classic' ? 'border-black' : 'bg-red-50 border-red-300 text-red-800'}`}>
                <div className="text-3xl font-black">{failCount}</div>
                <div className="text-xs uppercase tracking-widest font-bold mt-1">Stwierdzone Uchybienia</div>
             </div>
             <div className={`p-4 rounded-xl border-2 text-center ${template === 'classic' ? 'border-black' : 'bg-green-50 border-green-300 text-green-800'}`}>
                <div className="text-3xl font-black">{complianceRate}%</div>
                <div className="text-xs uppercase tracking-widest font-bold mt-1">Zgodność</div>
             </div>
          </div>
        </section>

        {/* REJESTR NIEZGODNOŚCI */}
        <section>
          <h2 className="text-lg font-black uppercase mb-6 border-b pb-2">Rejestr Niezgodności i Zalecenia</h2>
          
          {failedItems.length === 0 ? (
             <p className="text-slate-500 italic">Nie stwierdzono niezgodności w badanych obszarach.</p>
          ) : (
            <div className="space-y-8">
              {failedItems.map((item, idx) => {
                const riskLevel = RISK_LEVELS.find(r => r.val === item.risk) || RISK_LEVELS[1];
                const itemPhotos = photos.filter(p => p.pointId === item.pointId);

                return (
                  <div key={idx} className={`inline-block w-full print:page-break-inside-avoid border rounded-xl overflow-hidden mb-8 ${template === 'classic' ? 'border-black' : 'border-slate-300'}`}>
                    
                    {/* Header uchybienia */}
                    <div className={`flex items-center justify-between p-3 border-b ${template === 'classic' ? 'border-black bg-gray-100' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${template === 'classic' ? 'bg-black text-white' : 'bg-slate-800 text-white'}`}>
                          {idx + 1}
                        </span>
                        <h4 className="font-black uppercase text-base text-slate-900">{item.pointId}</h4>
                      </div>
                      <span className={`text-xs font-black px-3 py-1.5 rounded border uppercase print:exact-colors ${template === 'classic' ? 'border-black text-black' : riskLevel.color}`}>
                        Ryzyko: {riskLevel.label}
                      </span>
                    </div>

                    {/* Treść uchybienia */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase mb-2">Stan faktyczny (Niezgodność)</p>
                          <p className="text-base text-slate-900 font-medium">{item.description || 'Brak opisu.'}</p>
                        </div>
                        <div className={`p-4 rounded-lg border-l-4 ${template === 'classic' ? 'border-black bg-gray-50' : 'border-red-600 bg-red-50'}`}>
                          <p className={`text-xs font-bold uppercase mb-2 ${template === 'classic' ? 'text-black' : 'text-red-800'}`}>Zalecenie Naprawcze</p>
                          <p className="text-base text-slate-900 font-bold">{item.recommendation || 'Brak zaleceń.'}</p>
                          {item.deadline && (
                            <p className="text-xs mt-3 font-black text-slate-800">
                              TERMIN REALIZACJI: <span className="underline">{item.deadline}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Zdjęcia */}
                      {itemPhotos.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {itemPhotos.map((p, pIdx) => (
                            <div key={pIdx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 aspect-[4/3]">
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

        {/* STOPKA PODPISY */}
        <section className="mt-16 pt-16 print:page-break-inside-avoid">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="border-b border-black w-48 mx-auto mb-2"></div>
              <p className="text-xs font-bold uppercase text-slate-500">Podpis Audytora</p>
            </div>
            <div>
              <div className="border-b border-black w-48 mx-auto mb-2"></div>
              <p className="text-xs font-bold uppercase text-slate-500">Podpis Przedstawiciela Firmy</p>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
