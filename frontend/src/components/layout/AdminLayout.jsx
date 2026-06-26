import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, LogOut, Home } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import ProtectedRoute from '../common/ProtectedRoute';
import AdminPermissionGuard from '../common/AdminPermissionGuard';
import useAuth from '../../hooks/useAuth';
import { ADMIN_ROLES, APP_NAME } from '../../utils/constants';
import Button from '../ui/Button';

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const { user, logout } = useAuth();

  // Persister l'état collapsed
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  return (
    <ProtectedRoute roles={ADMIN_ROLES}>
      <div className="admin-panel flex min-h-screen bg-[#FBF9F7]">
        {/* SIDEBAR DESKTOP avec mode collapsed */}
        <div className="hidden shrink-0 lg:block">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
        </div>

        {/* SIDEBAR MOBILE (overlay) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer le menu"
            />
            <div className="absolute left-0 top-0 h-full shadow-2xl">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* HEADER ADMIN */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-3.5 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              {/* Bouton burger mobile */}
              <button
                type="button"
                className="rounded-xl p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <Link
                  to="/"
                  className="font-display text-lg font-bold text-stone-800 hover:text-[#C96A50] transition-colors"
                >
                  {APP_NAME}
                </Link>
                <p className="hidden text-xs text-stone-500 sm:block">Administration</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Bouton "Accueil site" (visible sm+) */}
              <Link to="/" className="hidden sm:inline-flex">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#5BBFA0] hover:text-[#4AA88D] hover:shadow-md transition-all"
                  title="Retour au site"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Site public</span>
                </button>
              </Link>

              <NotificationBell />

              <span className="hidden text-sm font-medium text-stone-700 md:inline truncate max-w-[160px]">
                {user?.nomComplet}
              </span>

              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={logout}
                className="text-stone-700 hover:bg-[#E07A5F]/10 hover:text-[#E07A5F]"
              >
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </header>

          {/* CONTENU PRINCIPAL */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <AdminPermissionGuard>
              <Outlet />
            </AdminPermissionGuard>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}