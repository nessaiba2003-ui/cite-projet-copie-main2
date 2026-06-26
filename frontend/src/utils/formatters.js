import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format amount in Moroccan Dirham (MAD).
 */
export function formatCurrency(amount, options = {}) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '—';
  const { locale = 'fr-MA', currency = 'MAD', minimumFractionDigits = 0 } = options;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format datetime for display (French locale).
 */
export function formatDateTime(value, pattern = "dd/MM/yyyy 'à' HH:mm") {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (!isValid(date)) return '—';
    return format(date, pattern, { locale: fr });
  } catch {
    return '—';
  }
}
