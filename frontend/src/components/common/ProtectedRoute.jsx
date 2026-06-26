import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { TOKEN_KEY } from '../../utils/constants';
import Loading from '../ui/Loading';

/**
 * Protects routes by authentication and optional role list.
 */
export default function ProtectedRoute({
  children,
  roles = [],
  redirectTo = '/login',
}) {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated?.() ?? true,
  );

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHydrated(true);
      return undefined;
    }
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return <Loading fullScreen label="Vérification de la session…" />;
  }

  const storedToken = token || localStorage.getItem(TOKEN_KEY);
  if (!storedToken) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
