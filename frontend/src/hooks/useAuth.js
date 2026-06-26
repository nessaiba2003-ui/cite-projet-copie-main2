import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isAdmin, isDemandeur, isSuperAdmin } from '../utils/helpers';
import { getDefaultDashboardPath } from '../utils/routes';

export function useAuth() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const getDashboardPath = useCallback(() => {
    if (isAdmin(role)) return getDefaultDashboardPath(role);
    if (isDemandeur(role)) return '/demandeur/dashboard';
    return '/';
  }, [role]);

  return {
    token,
    user,
    role,
    isLoading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(role),
    isDemandeur: isDemandeur(role),
    isSuperAdmin: isSuperAdmin(role),
    login,
    logout: handleLogout,
    getDashboardPath,
  };
}

export default useAuth;
