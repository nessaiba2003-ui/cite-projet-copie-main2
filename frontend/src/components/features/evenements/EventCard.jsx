import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatDateTime } from '@/utils/formatters';
import { PUBLICATION_STATUS } from '@/utils/constants';
import { resolveMediaUrl } from '@/utils/media';

/* ============ IMAGES PAR DÉFAUT (Unsplash, libres de droits) ============ */
const DEFAULT_IMAGES = {
  REUNION: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&q=80', // Réunion en cercle
  FORMATION: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80', // Formation
  CONFERENCE: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80', // Conférence amphi
  AUTRE: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80', // Workshop générique
  DEFAULT: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', // Event général
};

// Détecte le type d'événement depuis le titre/description si pas de typeEvenement
function detectEventType(event) {
  if (event.typeEvenement && DEFAULT_IMAGES[event.typeEvenement]) {
    return event.typeEvenement;
  }
  const text = `${event.titre || ''} ${event.description || ''} ${event.contenu || ''}`.toLowerCase();
  if (/conf[ée]rence|symposium|seminaire|séminaire|talk|keynote/i.test(text)) return 'CONFERENCE';
  if (/formation|atelier|workshop|cours|training/i.test(text)) return 'FORMATION';
  if (/r[ée]union|meeting|comit[ée]|assembl[ée]e/i.test(text)) return 'REUNION';
  return 'DEFAULT';
}

function getEventImage(event) {
  // 1. Priorité à l'image principale uploadée
  if (event.imagePrincipale) {
    return resolveMediaUrl(event.imagePrincipale);
  }
  // 2. Sinon, image par défaut selon le type
  const type = detectEventType(event);
  return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.DEFAULT;
}

export default function EventCard({ event, view = 'grid' }) {
  const places =
    event.placesRestantes != null
      ? `${event.placesRestantes} places restantes`
      : event.nombrePlacesMax
        ? `${event.nombrePlacesMax} places`
        : null;

  const isList = view === 'list';
  const imageUrl = getEventImage(event);

  return (
    <Link to={`/evenements/${event.id}`} className="block group h-full">
      <article
        className={
          isList
            ? 'flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-500 hover:-translate-y-1 h-full'
            : 'flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-500 hover:-translate-y-1.5'
        }
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            '0 20px 40px -12px rgba(91, 191, 160, 0.30), 0 0 0 1px rgba(91, 191, 160, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* IMAGE — toujours présente (uploadée ou par défaut) */}
        <div
          className={
            isList
              ? 'sm:w-48 shrink-0 h-32 sm:h-auto relative overflow-hidden bg-stone-100'
              : 'h-36 relative overflow-hidden bg-stone-100'
          }
        >
          <img
            src={imageUrl}
            alt={event.titre}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              // Fallback ultime si l'image distante ne charge pas
              e.currentTarget.src = DEFAULT_IMAGES.DEFAULT;
            }}
          />

          {/* Overlay sombre pour lisibilité */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />

          {/* Badge statut */}
          {event.statut && (
            <div className="absolute top-2.5 right-2.5">
              <Badge status={event.statut ?? PUBLICATION_STATUS.PUBLIE} size="sm" />
            </div>
          )}

          {/* Badge type d'événement */}
          {event.typeEvenement && (
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-stone-800 shadow-sm">
                {event.typeEvenement}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-sm font-bold text-stone-900 leading-snug line-clamp-2">
            {event.titre}
          </h3>

          {event.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-stone-600 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="mt-3 space-y-1 text-xs text-stone-600">
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#E07A5F]" />
              {formatDateTime(event.dateDebut)}
            </p>

            {event.lieu && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#5BBFA0]" />
                {event.lieu}
              </p>
            )}

            {places && (
              <p className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0 text-[#9B8EC4]" />
                {places}
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-[#E07A5F]/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#E07A5F]/45">
              Voir détails
              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}