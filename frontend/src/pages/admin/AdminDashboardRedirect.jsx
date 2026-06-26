import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { getDefaultDashboardPath } from '@/utils/routes';
import { ROLES } from '@/utils/constants';

export default function AdminDashboardRedirect() {
  const { role } = useAuth();

  if (role === ROLES.SUPER_ADMIN) {
    return <Navigate to="/admin/dashboard/reservations" replace />;
  }

  return <Navigate to={getDefaultDashboardPath(role)} replace />;
}