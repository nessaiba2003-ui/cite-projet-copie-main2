import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, Building2, Calendar as CalendarIcon } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ReservationStatus from '@/components/features/reservations/ReservationStatus';
import reservationService from '@/services/reservationService';
import { formatDateTime } from '@/utils/formatters';
import { RESERVATION_STATUS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

const TABS = [
  { key: 'all', label: 'Toutes', accent: '#E07A5F', shadowColor: 'rgba(224, 122, 95, 0.30)' },
  { key: RESERVATION_STATUS.EN_ATTENTE, label: 'En attente', accent: '#E9B86A', shadowColor: 'rgba(242, 204, 143, 0.40)' },
  { key: RESERVATION_STATUS.VALIDEE, label: 'Validées', accent: '#5BBFA0', shadowColor: 'rgba(91, 191, 160, 0.30)' },
  { key: RESERVATION_STATUS.REJETEE, label: 'Rejetées', accent: '#EF4444', shadowColor: 'rgba(239, 68, 68, 0.30)' },
  { key: RESERVATION_STATUS.ANNULEE, label: 'Annulées', accent: '#78716C', shadowColor: 'rgba(120, 113, 108, 0.25)' },
];

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const load = () => {
    setLoading(true);
    reservationService
      .getMesReservations()
      .then(setReservations)
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'all') return reservations;
    return reservations.filter((r) => r.statut === tab);
  }, [reservations, tab]);

  const counts = useMemo(() => {
    const map = { all: reservations.length };
    TABS.forEach((t) => {
      if (t.key === 'all') return;
      map[t.key] = reservations.filter((r) => r.statut === t.key).length;
    });
    return map;
  }, [reservations]);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setCancelling(confirmCancel);
    try {
      await reservationService.annuler(confirmCancel);
      toast.success('Réservation annulée');
      setConfirmCancel(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible d'annuler");
    } finally {
      setCancelling(null);
    }
  };

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  if (loading) return <Loading label="Chargement…" />;

  return (
    <div className="relative space-y-6">
      {/* HEADER */}
      <div
        className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white transition-all duration-300"
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 16px 40px -12px rgba(224, 122, 95, 0.20)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <div className="h-1.5 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />
        <div className="p-7 flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-md shadow-[#E07A5F]/30">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Mes réservations
            </h1>
            <p className="mt-1 text-stone-600">Suivez l&apos;état de vos demandes</p>
          </div>
        </div>
      </div>

      {/* ONGLETS DE FILTRE */}
      <div className="flex flex-wrap gap-2.5">
        {TABS.map(({ key, label, accent, shadowColor }) => {
          const isActive = tab === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'group inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300',
                isActive
                  ? 'text-white border-transparent shadow-md hover:-translate-y-0.5'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:shadow-sm',
              )}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
                      boxShadow: `0 8px 20px -6px ${shadowColor}`,
                    }
                  : {}
              }
            >
              {label}
              <span
                className={cn(
                  'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                  isActive ? 'bg-white/30 text-white' : 'bg-stone-100 text-stone-600',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div
        className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white transition-all duration-300"
        style={{
          boxShadow: tab !== 'all' ? `0 12px 30px -10px ${activeTab.shadowColor}` : '',
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-gradient-to-r from-stone-50 to-stone-100/50">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-xs uppercase tracking-wider text-stone-600">
                  Local
                </th>
                <th className="px-5 py-4 text-left font-bold text-xs uppercase tracking-wider text-stone-600">
                  Période
                </th>
                <th className="px-5 py-4 text-left font-bold text-xs uppercase tracking-wider text-stone-600">
                  Statut
                </th>
                <th className="px-5 py-4 text-right font-bold text-xs uppercase tracking-wider text-stone-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#FEF4F1]/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEF4F1] to-[#FFE6D5]">
                        <Building2 className="h-4 w-4 text-[#E07A5F]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">{r.localNom}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{r.localCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-600">
                    <p className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-[#5BBFA0]" />
                      {formatDateTime(r.dateDebut)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500 ml-5">→ {formatDateTime(r.dateFin)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <ReservationStatus status={r.statut} size="sm" />
                    {r.motifRejet && (
                      <p className="mt-2 max-w-xs text-xs text-red-600 italic">
                        Motif : {r.motifRejet}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {[RESERVATION_STATUS.EN_ATTENTE, RESERVATION_STATUS.VALIDEE].includes(
                      r.statut,
                    ) && (
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(r.id)}
                        disabled={cancelling === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 hover:shadow-sm transition-all disabled:opacity-50"
                      >
                        {cancelling === r.id ? 'Annulation…' : 'Annuler'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <p className="text-stone-500 font-medium">
              Aucune réservation dans cette catégorie.
            </p>
          </div>
        )}
      </div>

      {/* DIALOG CONFIRMATION */}
      <ConfirmDialog
        open={!!confirmCancel}
        title="Annuler la réservation"
        description="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible."
        confirmText="Oui, annuler"
        cancelText="Garder"
        variant="danger"
        loading={!!cancelling}
        onConfirm={handleCancel}
        onClose={() => setConfirmCancel(null)}
      />
    </div>
  );
}