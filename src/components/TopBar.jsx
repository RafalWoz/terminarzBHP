import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const location = useLocation();
  
  let title = "TerminyBHP";
  if (location.pathname.startsWith('/firms')) title = "Firmy";
  else if (location.pathname.startsWith('/documents')) title = "Dokumenty";
  else if (location.pathname.startsWith('/settings')) title = "Ustawienia";

  return (
    <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10 flex items-center justify-between">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold border border-blue-600">
        BHP
      </div>
    </header>
  );
}
