import Badge from '@/components/ui/Badge';
import { RESERVATION_STATUS } from '@/utils/constants';

const LABELS = {
  [RESERVATION_STATUS.EN_ATTENTE]: 'En attente',
  [RESERVATION_STATUS.VALIDEE]: 'Validée',
  [RESERVATION_STATUS.CONFIRMEE]: 'Confirmée',
  [RESERVATION_STATUS.REJETEE]: 'Rejetée',
  [RESERVATION_STATUS.ANNULEE]: 'Annulée',
  [RESERVATION_STATUS.TERMINEE]: 'Terminée',
};

export default function ReservationStatus({ status, className, size = 'md' }) {
  return (
    <Badge
      status={status}
      label={LABELS[status] ?? status}
      className={className}
      size={size}
    />
  );
}