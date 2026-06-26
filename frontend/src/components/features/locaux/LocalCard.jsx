import { Link } from 'react-router-dom';
import { MapPin, Users, Building2, ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { LOCAL_STATUS } from '@/utils/constants';
import { resolveMediaUrl } from '@/utils/media';

/* Détermine le pôle selon le code OU l'étage du local */
function getPoleForLocal(local) {
  // 1) Par étage (priorité)
  const etage = local?.etage;
  if (etage === 1) return { name: 'Incubation', color: '#10B981', shadow: 'rgba(16, 185, 129, 0.30)' };
  if (etage === 2) return { name: 'Valorisation', color: '#3B82F6', shadow: 'rgba(59, 130, 246, 0.30)' };
  if (etage === 3) return { name: 'R&D', color: '#EC4899', shadow: 'rgba(236, 72, 153, 0.30)' };
  if (etage === 4) return { name: 'Services Transverses', color: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.30)' };
  if (etage === 5) return { name: 'Espace ouvert', color: '#9B8EC4', shadow: 'rgba(155, 142, 196, 0.30)' };
  if (etage === 0) return { name: 'RDC', color: '#78716C', shadow: 'rgba(120, 113, 108, 0.25)' };

  // 2) Fallback par code
  if (!local?.code) return null;
  const upperCode = local.code.toUpperCase();
  if (['LOC', 'COW', 'INC', 'STARTUP'].some((p) => upperCode.startsWith(p))) {
    return { name: 'Incubation', color: '#10B981', shadow: 'rgba(16, 185, 129, 0.30)' };
  }
  if (['VAL', 'BUR', 'MEET'].some((p) => upperCode.startsWith(p))) {
    return { name: 'Valorisation', color: '#3B82F6', shadow: 'rgba(59, 130, 246, 0.30)' };
  }
  if (['LAB', 'RD', 'PROTO'].some((p) => upperCode.startsWith(p))) {
    return { name: 'R&D', color: '#EC4899', shadow: 'rgba(236, 72, 153, 0.30)' };
  }
  if (['CONF', 'AMPHI', 'TRANS', 'SERV'].some((p) => upperCode.startsWith(p))) {
    return { name: 'Services Transverses', color: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.30)' };
  }
  return null;
}

export default function LocalCard({ local, reservePath, showReserve = true }) {
  const detailsPath = local?.id ? `/demandeur/locaux/${local.id}` : '/demandeur/locaux';
  const path =
    reservePath ?? (local?.id ? `/demandeur/reservation/${local.id}` : '/demandeur/locaux');

  const imageUrl = local?.images?.[0] ? resolveMediaUrl(local.images[0]) : null;
  const hasImage = Boolean(imageUrl);

  const pole = getPoleForLocal(local);
  const accentColor = pole?.color || '#E07A5F';
  const shadowColor = pole?.shadow || 'rgba(224, 122, 95, 0.30)';
  const barGradient = pole
    ? `linear-gradient(90deg, ${pole.color}, ${pole.color}CC)`
    : 'linear-gradient(90deg, #E07A5F, #F2CC8F, #5BBFA0)';

  return (
    <div
      className="group overflow-hidden rounded-3xl border border-stone-200/70 bg-white h-full flex flex-col transition-all duration-500 hover:-translate-y-1"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 45px -12px ${shadowColor}, 0 0 0 1px ${shadowColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Liseré coloré */}
      <div className="h-1.5" style={{ background: barGradient }} />

      {/* Image */}
      <div
        className="relative h-44 overflow-hidden bg-stone-100"
        style={
          !hasImage
            ? {
                background: pole
                  ? `linear-gradient(135deg, ${pole.color}15 0%, ${pole.color}08 100%)`
                  : 'linear-gradient(135deg, #FEF4F1 0%, #FFE6D5 100%)',
              }
            : {}
        }
      >
        {hasImage ? (
          <>
            <img
              src={imageUrl}
              alt={local.nom}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              style={{
                background: pole
                  ? `linear-gradient(135deg, ${pole.color} 0%, ${pole.color}CC 100%)`
                  : 'linear-gradient(135deg, #E07A5F 0%, #F2CC8F 100%)',
                boxShadow: `0 10px 25px -5px ${shadowColor}`,
              }}
            >
              <Building2 className="h-8 w-8 text-white drop-shadow" />
            </div>
          </div>
        )}

        {/* Badge pôle en overlay */}
        {pole && (
          <div className="absolute top-3 right-3">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md"
              style={{
                background: hasImage ? `${pole.color}EE` : `${pole.color}20`,
                color: hasImage ? '#FFFFFF' : pole.color,
                border: hasImage ? `1px solid ${pole.color}` : `1px solid ${pole.color}40`,
                textShadow: hasImage ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {pole.name}
            </span>
          </div>
        )}

        {/* Badge statut en overlay */}
        <div className="absolute top-3 left-3">
          <Badge status={local.statut ?? LOCAL_STATUS.DISPONIBLE} size="sm" />
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-extrabold text-stone-900 leading-snug line-clamp-2">
          {local.nom}
        </h3>

        {local.description && (
          <p className="mt-2 text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {local.description}
          </p>
        )}

        <div className="mt-3 space-y-1.5 flex-1">
          {local.capacite != null && (
            <p className="flex items-center gap-1.5 text-sm text-stone-600">
              <Users className="h-4 w-4 shrink-0 text-[#9B8EC4]" />
              Capacité : <span className="font-semibold text-stone-800">{local.capacite}</span>
            </p>
          )}
          {local.localisation && (
            <p className="flex items-center gap-1.5 text-sm text-stone-600 truncate">
              <MapPin className="h-4 w-4 shrink-0 text-[#E07A5F]" />
              <span className="truncate">{local.localisation}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        {showReserve && (
          <div className="mt-5 flex gap-2">
            <Link to={detailsPath} className="flex-1">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:border-stone-300 hover:shadow-sm transition-all"
              >
                Détails
              </button>
            </Link>
            <Link to={path} className="flex-1">
              <button
                type="button"
                className="group/btn w-full inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 100%)`,
                  boxShadow: `0 6px 15px -3px ${shadowColor}`,
                }}
              >
                Réserver
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}