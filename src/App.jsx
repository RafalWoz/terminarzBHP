import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import OnboardingWizard from './components/auth/OnboardingWizard';
import UnlockScreen from './components/auth/UnlockScreen';
import MigrationScreen from './components/auth/MigrationScreen';
// ... (reszta importów bez zmian)

function AppRoutes() {
  const { status, onUnlocked, onPasswordSet, onMigrationComplete } = useAuth();
  
  // ... (global security check bez zmian)

  if (status === 'loading') {
    // ... (loading screen bez zmian)
  }

  if (status === 'onboarding') {
    return <OnboardingWizard onComplete={onPasswordSet} />;
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
