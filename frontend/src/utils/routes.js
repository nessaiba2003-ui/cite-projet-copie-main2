import { ROLES } from './constants';

/** Chemins accessibles sans connexion (site vitrine). */
export const PUBLIC_PATHS = [
  '/',
  '/annonces',
  '/evenements',
  '/locaux',
  '/structures',
  '/contact',
  '/partenariat',
  '/login',
  '/forgot-password',
  '/access-denied',
];

export function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/evenements/')) return true;
  if (pathname.startsWith('/locaux/')) return true;
  if (pathname.startsWith('/reservation/')) return true;
  return false;
}

/** Préfixes API consultables sans session (GET public). */
export const PUBLIC_API_GET_PREFIXES = [
  '/auth/login',
  '/annonces',
  '/evenements',
  '/locaux/disponibles',
  '/poles',
  '/public/',
];

export function isPublicApiRequest(url, method = 'get') {
  if (!url || method.toLowerCase() !== 'get') return false;
  const path = url.includes('http') ? new URL(url, window.location.origin).pathname : url;
  const apiPath = path.replace(/^.*\/api/, '/api');
  return PUBLIC_API_GET_PREFIXES.some((prefix) => apiPath === prefix || apiPath.startsWith(prefix));
}

/** Rôles admins */
const RESERVATION_ADMIN = [ROLES.ADMIN_RES];
const EVENT_ADMIN = [ROLES.ADMIN_EVT];

/** Tableau de bord par défaut après connexion. */
export function getDefaultDashboardPath(role) {
  switch (role) {
    case ROLES.ADMIN_RES:
      return '/admin/dashboard/reservations';
    case ROLES.ADMIN_EVT:
      return '/admin/dashboard/evenements';
    default:
      return '/admin/dashboard';
  }
}

function matchesRoute(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/** Vérifie si un rôle peut accéder à une route admin. */
export function canAccessAdminRoute(role, pathname) {
  const reservationRoutes = [
    '/admin/dashboard/reservations',
    '/admin/reservations',
    '/admin/locaux',
    '/admin/stats',
    '/admin/demandeurs',
  ];

  const eventDashboardRoutes = ['/admin/dashboard/evenements'];
  const eventMgmtRoutes = ['/admin/evenements', '/admin/annonces'];

  if (reservationRoutes.some((r) => matchesRoute(pathname, r))) {
    return RESERVATION_ADMIN.includes(role);
  }
  if (eventDashboardRoutes.some((r) => matchesRoute(pathname, r))) {
    return RESERVATION_ADMIN.includes(role) || EVENT_ADMIN.includes(role);
  }
  if (eventMgmtRoutes.some((r) => matchesRoute(pathname, r))) {
    return EVENT_ADMIN.includes(role);
  }
  if (pathname === '/admin/dashboard' || pathname === '/admin/dashboard/') {
    return RESERVATION_ADMIN.includes(role) || EVENT_ADMIN.includes(role);
  }
  return false;
}

export { RESERVATION_ADMIN, EVENT_ADMIN };