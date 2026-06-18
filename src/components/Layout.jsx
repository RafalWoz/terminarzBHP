import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import ContextBreadcrumbs from './ContextBreadcrumbs';

export default function Layout() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <TopBar />
      <div className="flex-1 min-h-0 lg:flex">
        <ContextBreadcrumbs />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-8">
          <ContextBreadcrumbs variant="mobile" />
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
