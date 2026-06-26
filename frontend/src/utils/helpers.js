import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ADMIN_ROLES, ROLES } from './constants';

/**
 * Merge class names (strings, arrays, falsy-filtered).
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter((x) => typeof x === 'string' && x.length > 0)
    .join(' ');
}

/**
 * Extract array content from a Spring Data Page response.
 */
export function getPageContent(page) {
  if (!page) return [];
  if (Array.isArray(page)) return page;
  if (Array.isArray(page.content)) return page.content;
  return [];
}

export function getTotalElements(page) {
  if (!page || Array.isArray(page)) return page?.length ?? 0;
  return page.totalElements ?? page.content?.length ?? 0;
}

export function isAdmin(role) {
  return ADMIN_ROLES.includes(role);
}

export function isDemandeur(role) {
  return role === ROLES.DEMANDEUR;
}

export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN;
}

/**
 * Format ISO / Date to short French date.
 */
export function formatDate(value, pattern = 'dd MMM yyyy') {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (!isValid(date)) return '—';
    return format(date, pattern, { locale: fr });
  } catch {
    return '—';
  }
}
