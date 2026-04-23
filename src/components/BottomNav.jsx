import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Co dziś?', icon: '📊' },
  { to: '/firms', label: 'Firmy', icon: '🏢' },
  { to: '/documents', label: 'Dokumenty', icon: '📄' },
  { to: '/settings', label: 'Ustawienia', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50 pb-safe print:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors ${
              isActive ? 'text-primary font-semibold' : 'text-gray-500 hover:text-gray-700'
            }`
          }
        >
          <span className="text-xl mb-1">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
