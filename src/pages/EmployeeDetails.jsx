import { useParams, Link } from 'react-router-dom';
import EmployeeDetailView from '../components/EmployeeDetailView';

export default function EmployeeDetails() {
  const { firmId, id } = useParams();

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to={`/firms/${firmId}`} className="underline hover:text-primary transition-colors">Firma</Link>
        <span>/</span>
        <span className="font-medium text-gray-800">Szczegóły pracownika</span>
      </div>

      <EmployeeDetailView employeeId={id} firmId={firmId} />
    </div>
  );
}
