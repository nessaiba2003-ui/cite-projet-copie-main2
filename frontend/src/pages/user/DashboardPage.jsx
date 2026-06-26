import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  ClipboardList,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '@/components/ui/Loading';
import ReservationStatus from '@/components/features/reservations/ReservationStatus';
import reservationService from '@/services/reservationService';
import { formatDateTime } from '@/utils/formatters';
import { RESERVATION_STATUS } from '@/utils/constants';
import useAuth from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationService
      .getMesReservations()
      .then(setReservations)
      .catch(() => toast.error('Impossible de charger vos réservations'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = reservations
    .filter((r) =>
      [
        RESERVATION_STATUS.EN_ATTENTE,
        RESERVATION_STATUS.VALIDEE,
        RESERVATION_STATUS.CONFIRMEE,
      ].includes(r.statut),
    )
    .slice(0, 5);

  const stats = {
    total: reservations.length,
    enAttente: reservations.filter((r) => r.statut === RESERVATION_STATUS.EN_ATTENTE).length,
    validees: reservations.filter((r) =>
      [RESERVATION_STATUS.VALIDEE, RESERVATION_STATUS.CONFIRMEE].includes(r.statut),
    ).length,
  };

  if (loading) return <Loading label="Chargement du tableau de bord…" />;

  const statsCards = [
    {
      label: 'Réservations totales',
      value: stats.total,
      icon: ClipboardList,
      gradient: 'linear-gradient(135deg, #F4AC97 0%, #E07A5F 100%)',
      shadowColor: 'rgba(224, 122, 95, 0.30)',
      accent: '#E07A5F',
    },
    {
      label: 'En attente',
      value: stats.enAttente,
      icon: Calendar,
      gradient: 'linear-gradient(135deg, #F5D391 0%, #E9B86A 100%)',
      shadowColor: 'rgba(242, 204, 143, 0.40)',
      accent: '#E9B86A',
    },
    {
      label: 'Validées',
      value: stats.validees,
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, #88D4B7 0%, #5BBFA0 100%)',
      shadowColor: 'rgba(91, 191, 160, 0.30)',
      accent: '#5BBFA0',
    },
  ];

  return (
    <div className="relative space-y-8">
      {/* HEADER DE BIENVENUE */}
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
        <div className="p-7 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E07A5F]/10 to-[#F2CC8F]/10 border border-[#E07A5F]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C96A50]">
                <Sparkles className="h-3.5 w-3.5" />
                Espace demandeur
              </span>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Bonjour,{' '}
                <span className="bg-gradient-to-r from-[#E07A5F] to-[#9B8EC4] bg-clip-text text-transparent">
                  {user?.nomComplet?.split(' ')[0] || 'Demandeur'}
                </span>
              </h1>
              <p className="mt-2 text-stone-600">
                Gérez vos réservations et découvrez les locaux de la Cité d&apos;Innovation.
              </p>
            </div>
            <Link to="/demandeur/locaux">
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#5BBFA0]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#5BBFA0]/45 hover:-translate-y-0.5"
              >
                <Building2 className="h-4 w-4" />
                Réserver un local
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-5 sm:grid-cols-3">
        {statsCards.map(({ label, value, icon: Icon, gradient, shadowColor, accent }) => (
          <div
            key={label}
            className="group overflow-hidden rounded-3xl border border-stone-200/70 bg-white transition-all duration-500 hover:-translate-y-1"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 20px 45px -12px ${shadowColor}, 0 0 0 1px ${shadowColor}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="p-6 flex items-center gap-5">
              <div
                className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                style={{
                  background: gradient,
                  boxShadow: `0 10px 25px -5px ${shadowColor}`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  }}
                />
                <Icon className="relative h-7 w-7 drop-shadow" />
              </div>
              <div>
                <p
                  className="font-display text-3xl font-extrabold leading-none"
                  style={{ color: accent }}
                >
                  {value}
                </p>
                <p className="mt-1 text-sm font-medium text-stone-600">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PROCHAINES RÉSERVATIONS */}
      <div
        className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white transition-all duration-300"
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 16px 40px -12px rgba(155, 142, 196, 0.22)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <div className="h-1.5 bg-gradient-to-r from-[#9B8EC4] via-[#B8AAD4] to-[#FFCFD8]" />
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9B8EC4] to-[#B8AAD4] shadow-md shadow-[#9B8EC4]/30">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-extrabold text-stone-900">
                  Prochaines réservations
                </h2>
                <p className="text-xs text-stone-500">Vos demandes à venir</p>
              </div>
            </div>
            <Link
              to="/demandeur/mes-reservations"
              className="group inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#E07A5F] hover:text-[#C96A50] hover:shadow-md transition-all"
            >
              Voir tout
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 py-10 text-center">
              <Calendar className="mx-auto h-10 w-10 text-stone-300 mb-2" />
              <p className="text-stone-500 font-medium">Aucune réservation à venir.</p>
              <Link to="/demandeur/locaux" className="mt-4 inline-block">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#E07A5F]/30 hover:shadow-lg transition-all"
                >
                  Faire une demande
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {upcoming.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 px-2 -mx-2 rounded-xl hover:bg-stone-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FEF4F1] to-[#FFE6D5]">
                      <Building2 className="h-5 w-5 text-[#E07A5F]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 truncate">
                        {r.localNom}{' '}
                        <span className="text-xs font-medium text-stone-400">({r.localCode})</span>
                      </p>
                      <p className="text-sm text-stone-600 mt-0.5">
                        {formatDateTime(r.dateDebut)} — {formatDateTime(r.dateFin)}
                      </p>
                    </div>
                  </div>
                  <ReservationStatus status={r.statut} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}