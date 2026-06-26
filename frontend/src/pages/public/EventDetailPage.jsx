import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import InscriptionForm from '@/components/features/evenements/InscriptionForm';
import evenementService from '@/services/evenementService';
import { formatDateTime } from '@/utils/formatters';
import { PUBLICATION_STATUS } from '@/utils/constants';

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evenementService
      .getById(id)
      .then(setEvent)
      .catch(() => toast.error('Événement introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading label="Chargement…" />;
  if (!event) {
    return (
      <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-sm text-stone-600">Événement introuvable.</p>
          <Link to="/evenements" className="mt-3 inline-block">
            <Button variant="outline">Retour aux événements</Button>
          </Link>
        </div>
      </div>
    );
  }

  const placesInfo =
    event.nombrePlacesLimitee && event.placesRestantes != null
      ? `${event.placesRestantes} / ${event.nombrePlacesMax} places disponibles`
      : null;

  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#E07A5F]/10 blur-3xl animate-aurora-slow" />
        <div className="absolute bottom-16 -right-24 h-72 w-72 rounded-full bg-[#5BBFA0]/10 blur-3xl animate-aurora" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:px-8">
        <Link
          to="/evenements"
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#E07A5F] hover:text-[#C96A50] hover:shadow-md hover:shadow-[#E07A5F]/15 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour aux événements
        </Link>

        {event.imagePrincipale && (
          <img
            src={event.imagePrincipale}
            alt=""
            className="mb-5 h-56 w-full rounded-2xl object-cover shadow-lg shadow-stone-300/30"
          />
        )}

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {event.titre}
          </h1>
          {event.statut && (
            <Badge status={event.statut ?? PUBLICATION_STATUS.PUBLIE} />
          )}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E07A5F]/10 border border-[#E07A5F]/25 px-2.5 py-1 text-xs font-semibold text-[#C96A50]">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTime(event.dateDebut)}
            {event.dateFin && ` — ${formatDateTime(event.dateFin)}`}
          </span>
          {event.lieu && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5BBFA0]/10 border border-[#5BBFA0]/25 px-2.5 py-1 text-xs font-semibold text-[#4AA88D]">
              <MapPin className="h-3.5 w-3.5" />
              {event.lieu}
            </span>
          )}
          {placesInfo && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9B8EC4]/10 border border-[#9B8EC4]/25 px-2.5 py-1 text-xs font-semibold text-[#806FB0]">
              <Users className="h-3.5 w-3.5" />
              {placesInfo}
            </span>
          )}
        </div>

        <div
          className="mb-5 overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(224, 122, 95, 0.20)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="h-1 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />
          <div className="px-4 py-3 border-b border-stone-200">
            <h2 className="font-display text-sm font-bold text-stone-900">Description</h2>
          </div>
          <div className="px-4 py-4">
            <p className="whitespace-pre-wrap text-xs text-stone-700 leading-relaxed">
              {event.contenu || event.description || 'Aucune description.'}
            </p>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(91, 191, 160, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="h-1 bg-gradient-to-r from-[#5BBFA0] via-[#7DD4B8] to-[#A8E6CF]" />
          <div className="px-4 py-3 border-b border-stone-200">
            <h2 className="font-display text-sm font-bold text-stone-900">
              Inscription à l&apos;événement
            </h2>
          </div>
          <div className="px-4 py-4">
            <InscriptionForm evenementId={Number(id)} />
          </div>
        </div>
      </div>
    </div>
  );
}