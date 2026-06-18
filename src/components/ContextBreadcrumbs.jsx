import { Link, useLocation } from 'react-router-dom';
import { useFirm } from '../hooks/useFirms';
import { useEmployee } from '../hooks/useEmployees';

function getContextFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const context = {
    firmId: null,
    employeeId: null,
    currentLabel: 'Panel główny',
  };

  if (parts.length === 0) return context;

  if (parts[0] === 'firms') {
    context.currentLabel = 'Firmy';

    if (parts[1] === 'new') {
      context.currentLabel = 'Nowa firma';
      return context;
    }

    if (parts[1]) {
      context.firmId = parts[1];
      context.currentLabel = 'Szczegóły firmy';
    }

    if (parts[2] === 'edit') {
      context.currentLabel = 'Edycja firmy';
    }

    if (parts[2] === 'audits') {
      context.currentLabel = parts[3] ? 'Edycja audytu' : 'Audyty';
    }

    if (parts[2] === 'reports') {
      context.currentLabel = 'Raporty';
    }

    if (parts[2] === 'employees') {
      if (parts[3] === 'new') {
        context.currentLabel = 'Nowy pracownik';
      } else if (parts[3]) {
        context.employeeId = parts[3];
        context.currentLabel = 'Pracownik';
      }

      if (parts[4] === 'edit') {
        context.currentLabel = 'Edycja pracownika';
      }

      if (parts[4] === 'records') {
        context.currentLabel = parts[5] === 'new' ? 'Nowy termin' : 'Edycja terminu';
      }
    }

    return context;
  }

  if (parts[0] === 'documents') context.currentLabel = 'Dokumenty';
  if (parts[0] === 'settings') context.currentLabel = 'Ustawienia';
  if (parts[0] === 'templates') context.currentLabel = 'Szablony';

  return context;
}

function buildCrumbs({ firm, employee, firmId, employeeId, currentLabel }) {
  const crumbs = [{ label: 'Start', to: '/' }];

  if (!firmId && currentLabel !== 'Panel główny') {
    crumbs.push({ label: currentLabel });
    return crumbs;
  }

  if (firmId) {
    crumbs.push({ label: 'Firmy', to: '/firms' });
    crumbs.push({ label: firm?.name || 'Firma', to: `/firms/${firmId}` });
  }

  if (employeeId) {
    const employeeName = employee
      ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Pracownik'
      : 'Pracownik';
    crumbs.push({ label: employeeName, to: `/firms/${firmId}/employees/${employeeId}` });
  }

  const last = crumbs[crumbs.length - 1];
  if (currentLabel !== 'Panel główny' && last?.label !== currentLabel) {
    crumbs.push({ label: currentLabel });
  }

  return crumbs;
}

function isCurrent(index, crumbs) {
  return index === crumbs.length - 1;
}

export default function ContextBreadcrumbs({ variant = 'desktop' }) {
  const location = useLocation();
  const context = getContextFromPath(location.pathname);
  const firm = useFirm(context.firmId);
  const employee = useEmployee(context.employeeId);
  const crumbs = buildCrumbs({ ...context, firm, employee });

  if (location.pathname === '/') return null;

  if (variant === 'mobile') {
    return (
      <nav className="lg:hidden sticky top-16 z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-2 overflow-x-auto print:hidden" aria-label="Ścieżka nawigacji">
        <ol className="flex items-center gap-2 text-xs whitespace-nowrap text-gray-500">
          {crumbs.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-300">/</span>}
              {crumb.to && !isCurrent(index, crumbs) ? (
                <Link to={crumb.to} className="font-semibold text-gray-600 hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-bold text-slate-800" aria-current={isCurrent(index, crumbs) ? 'page' : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <aside className="hidden lg:block w-72 shrink-0 border-r border-gray-100 bg-white/80 backdrop-blur px-5 py-6 overflow-y-auto print:hidden">
      <div className="sticky top-6 space-y-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Jesteś tutaj</p>
          <ol className="mt-4 space-y-2" aria-label="Ścieżka nawigacji">
            {crumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`}>
                {crumb.to && !isCurrent(index, crumbs) ? (
                  <Link to={crumb.to} className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="block rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary" aria-current={isCurrent(index, crumbs) ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        {(context.firmId || context.employeeId) && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Firma</p>
              <p className="mt-1 text-sm font-bold text-slate-800 leading-snug">{firm?.name || 'Ładowanie firmy…'}</p>
            </div>
            {context.employeeId && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pracownik</p>
                <p className="mt-1 text-sm font-bold text-slate-800 leading-snug">
                  {employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Pracownik' : 'Ładowanie pracownika…'}
                </p>
                {employee?.position && <p className="mt-1 text-xs text-gray-500">{employee.position}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
