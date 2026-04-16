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
