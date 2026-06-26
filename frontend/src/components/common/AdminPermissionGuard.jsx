import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { canAccessAdminRoute } from '@/utils/routes';

/**
 * Vérifie les droits admin par chemin (réservations vs événements).
 */
export default function AdminPermissionGuard({ children }) {
  const { role } = useAuth();
  const { pathname } = useLocation();

  if (!canAccessAdminRoute(role, pathname)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
