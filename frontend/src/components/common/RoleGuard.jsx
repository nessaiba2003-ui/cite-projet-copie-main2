import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

/**
 * Protège les routes enfants pour une liste de rôles autorisés.
 */
export default function RoleGuard({ roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Outlet />
    </ProtectedRoute>
  );
}
