import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SetPasswordScreen from './components/auth/SetPasswordScreen';
import UnlockScreen from './components/auth/UnlockScreen';
import MigrationScreen from './components/auth/MigrationScreen';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Firms from './pages/Firms';
import FirmDetails from './pages/FirmDetails';
import FirmForm from './pages/FirmForm';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetails from './pages/EmployeeDetails';
import RecordForm from './pages/RecordForm';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

function AppRoutes() {
  const { status, onUnlocked, onPasswordSet, onMigrationComplete } = useAuth();

  // Global Security Check (Web Crypto API requires Secure Context)
  if (!window.isSecureContext || !crypto.subtle) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">Wymagane połączenie bezpieczne</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Ta aplikacja używa zaawansowanego szyfrowania do ochrony Twoich danych. 
            Przeglądarki pozwalają na to wyłącznie przez <strong>połączenie HTTPS</strong> lub na <strong>localhost</strong>.
          </p>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
            <p className="text-red-400 text-sm">
              Skontaktuj się z administratorem, aby włączyć certyfikat SSL (HTTPS) na tym serwerze.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-white/60 text-sm">Ładowanie…</p>
        </div>
      </div>
    );
  }

  if (status === 'no-password') {
    return <SetPasswordScreen onPasswordSet={onPasswordSet} />;
  }

  if (status === 'locked') {
    return <UnlockScreen onUnlocked={onUnlocked} />;
  }

  if (status === 'migrating') {
    return <MigrationScreen onMigrationComplete={onMigrationComplete} />;
  }

  // status === 'unlocked'
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="firms" element={<Firms />} />
          <Route path="firms/new" element={<FirmForm />} />
          <Route path="firms/:id" element={<FirmDetails />} />
          <Route path="firms/:id/edit" element={<FirmForm />} />
          <Route path="firms/:firmId/employees/new" element={<EmployeeForm />} />
          <Route path="firms/:firmId/employees/:id" element={<EmployeeDetails />} />
          <Route path="firms/:firmId/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="firms/:firmId/employees/:employeeId/records/new" element={<RecordForm />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
