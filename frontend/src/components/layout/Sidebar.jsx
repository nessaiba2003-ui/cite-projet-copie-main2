import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Megaphone,
  ClipboardList,
  Users,
  BarChart3,
  BookOpen,
  LogOut,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { ROLES } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import { getDefaultDashboardPath } from '../../utils/routes';

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 border',
    isActive
      ? 'bg-gradient-to-r from-[#FEF0EB] to-[#FFF6E8] text-[#C96A50] border-[#E07A5F]/30 shadow-sm'
      : 'text-stone-700 border-transparent hover:bg-stone-50 hover:text-stone-900',
  );

const linkClassCollapsed = ({ isActive }) =>
  cn(
    'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 border',
    isActive
      ? 'bg-gradient-to-br from-[#FEF0EB] to-[#FFF6E8] text-[#C96A50] border-[#E07A5F]/30 shadow-sm'
      : 'text-stone-700 border-transparent hover:bg-stone-50 hover:text-stone-900',
  );

const adminLinks = [
  { to: '/admin/dashboard/reservations', label: 'Tableau de bord réservations', shortLabel: 'TB Réservations', icon: LayoutDashboard, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_RES] },
  { to: '/admin/dashboard/evenements', label: 'Tableau de bord événements', shortLabel: 'TB Événements', icon: LayoutDashboard, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_RES, ROLES.ADMIN_EVT] },
  { to: '/admin/reservations', label: 'Réservations', shortLabel: 'Réservations', icon: ClipboardList, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_RES] },
  { to: '/admin/locaux', label: 'Locaux', shortLabel: 'Locaux', icon: Building2, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_RES] },
  { to: '/admin/evenements', label: 'Événements', shortLabel: 'Événements', icon: CalendarDays, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_EVT] },
  { to: '/admin/annonces', label: 'Annonces', shortLabel: 'Annonces', icon: Megaphone, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_EVT, ROLES.ADMIN_SEC] },
  { to: '/admin/demandeurs', label: 'Demandeurs', shortLabel: 'Demandeurs', icon: Users, roles: [ROLES.SUPER_ADMIN] },
  { to: '/admin/stats', label: "Statistiques d'occupation", shortLabel: 'Statistiques', icon: BarChart3, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_RES] },
];

const demandeurLinks = [
  { to: '/demandeur/dashboard', label: 'Tableau de bord', shortLabel: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/demandeur/locaux', label: 'Réserver un local', shortLabel: 'Réserver', icon: Building2 },
  { to: '/demandeur/mes-reservations', label: 'Mes réservations', shortLabel: 'Mes résa', icon: BookOpen },
  { to: '/evenements', label: 'Événements', shortLabel: 'Événements', icon: CalendarDays },
];

export default function Sidebar({ collapsed = false, onToggleCollapse, onNavigate }) {
  const { role, isAdmin, user, logout } = useAuth();

  const links = isAdmin ? adminLinks.filter((l) => l.roles.includes(role)) : demandeurLinks;
  const dashboardPath = isAdmin ? getDefaultDashboardPath(role) : '/demandeur/dashboard';

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-stone-200 bg-white transition-all duration-300',
        collapsed ? 'w-[80px]' : 'w-64',
      )}
    >
      {/* HEADER */}
      <div
        className={cn(
          'border-b border-stone-200 transition-all duration-300',
          collapsed ? 'p-3' : 'p-4',
        )}
      >
        {!collapsed ? (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                {isAdmin ? 'Administration' : 'Espace demandeur'}
              </p>
              <p className="mt-1 truncate text-sm font-bold text-stone-800">
                {user?.nomComplet || 'Utilisateur'}
              </p>

              {isAdmin && (
                <NavLink
                  to={dashboardPath}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#E07A5F] hover:text-[#C96A50] hover:underline"
                  onClick={onNavigate}
                >
                  Accueil admin
                </NavLink>
              )}
            </div>

            {/* BOUTON TOGGLE COLLAPSE — VISIBLE EN MODE PLEIN */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEF4F1] to-[#FFF8F3] border border-[#E07A5F]/30 text-[#C96A50] shadow-sm hover:bg-gradient-to-br hover:from-[#E07A5F] hover:to-[#E8956F] hover:text-white hover:border-transparent hover:shadow-md hover:shadow-[#E07A5F]/30 transition-all duration-200"
                aria-label="Réduire le menu"
                title="Réduire le menu"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] text-white shadow-md">
              <span className="text-sm font-bold">
                {(user?.nomComplet || 'U').charAt(0).toUpperCase()}
              </span>
            </div>

            {/* BOUTON TOGGLE COLLAPSE — VISIBLE EN MODE COMPACT */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEF4F1] to-[#FFF8F3] border border-[#E07A5F]/30 text-[#C96A50] shadow-sm hover:bg-gradient-to-br hover:from-[#E07A5F] hover:to-[#E8956F] hover:text-white hover:border-transparent hover:shadow-md hover:shadow-[#E07A5F]/30 transition-all duration-200"
                aria-label="Déplier le menu"
                title="Déplier le menu"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* BOUTON RETOUR ACCUEIL — TOUJOURS VISIBLE */}
      <div className={cn('border-b border-stone-200', collapsed ? 'p-2' : 'p-3')}>
        <Link to="/" onClick={onNavigate}>
          {collapsed ? (
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] text-white shadow-md shadow-[#5BBFA0]/30 hover:shadow-lg hover:shadow-[#5BBFA0]/45 hover:-translate-y-0.5 transition-all duration-300 mx-auto"
              title="Retour à l'accueil"
            >
              <Home className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#5BBFA0]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#5BBFA0]/45 hover:-translate-y-0.5"
            >
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </button>
          )}
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav
        className={cn(
          'flex-1 overflow-y-auto',
          collapsed ? 'p-2 space-y-1.5 flex flex-col items-center' : 'p-3 space-y-1',
        )}
      >
        {links.map(({ to, label, shortLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={collapsed ? linkClassCollapsed : linkClass}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{shortLabel || label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div
        className={cn(
          'border-t border-stone-200',
          collapsed ? 'p-2 flex justify-center' : 'p-3',
        )}
      >
        <button
          type="button"
          onClick={logout}
          className={cn(
            'flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200 text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent',
            collapsed ? 'h-11 w-11 justify-center px-0' : 'w-full px-3 py-2.5',
          )}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}