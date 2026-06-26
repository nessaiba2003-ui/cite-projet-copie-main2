import { cn } from '../../utils/helpers';

const statusLabels = {
  EN_ATTENTE: 'En attente',
  VALIDEE: 'Validée',
  CONFIRMEE: 'Confirmée',
  REJETEE: 'Rejetée',
  ANNULEE: 'Annulée',
  TERMINEE: 'Terminée',
  DISPONIBLE: 'Disponible',
  MAINTENANCE: 'Maintenance',
  HORS_SERVICE: 'Hors service',
  BROUILLON: 'Brouillon',
  PUBLIE: 'Publié',
  ARCHIVE: 'Archivé',
};

const STATUS_STYLES = {
  EN_ATTENTE: 'bg-amber-50 text-amber-800 border-amber-200',
  VALIDEE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CONFIRMEE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  DISPONIBLE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  REJETEE: 'bg-red-50 text-red-700 border-red-200',
  ANNULEE: 'bg-red-50 text-red-700 border-red-200',
  HORS_SERVICE: 'bg-red-50 text-red-700 border-red-200',
  MAINTENANCE: 'bg-purple-50 text-purple-700 border-purple-200',
  BROUILLON: 'bg-purple-50 text-purple-700 border-purple-200',
  PUBLIE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ARCHIVE: 'bg-stone-100 text-stone-700 border-stone-200',
  TERMINEE: 'bg-stone-100 text-stone-700 border-stone-200',
  default: 'bg-stone-100 text-stone-700 border-stone-200',
};

export default function Badge({ status, label, className, size = 'md' }) {
  const displayLabel = label ?? statusLabels[status] ?? status ?? '—';
  const colorClass = STATUS_STYLES[status] ?? STATUS_STYLES.default;

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={cn('inline-flex items-center rounded-full border', sizeClass, colorClass, className)}>
      {displayLabel}
    </span>
  );
}