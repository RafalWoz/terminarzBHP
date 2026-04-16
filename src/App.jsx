import { HashRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
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

