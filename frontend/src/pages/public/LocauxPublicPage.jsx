import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  ArrowRight,
  Users,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import localService from '@/services/localService';
import Loading from '@/components/ui/Loading';
import Input from '@/components/ui/Input';

/* ===== POLE UNIQUE : SERVICES TRANSVERSES (Jaune doré) ===== */
const POLE_COLOR = '#D4AF37';
const POLE_COLOR_LIGHT = '#F0CF65';
const POLE_COLOR_DARK = '#B8941F';
const POLE_GRADIENT = `linear-gradient(135deg, ${POLE_COLOR_LIGHT} 0%, ${POLE_COLOR} 100%)`;
const POLE_SHADOW = 'rgba(212, 175, 55, 0.35)';

export default function LocauxPublicPage() {
  const [loading, setLoading] = useState(true);
  const [locaux, setLocaux] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    localService
      .getDisponibles()
      .then(setLocaux)
      .catch(() => toast.error('Impossible de charger les locaux'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locaux;
    return locaux.filter(
      (l) =>
        l.nom?.toLowerCase().includes(q) ||
        l.code?.toLowerCase().includes(q) ||
        l.localisation?.toLowerCase().includes(q),
    );
  }, [locaux, search]);

  if (loading) return <Loading label="Chargement des locaux…" />;

  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute top-16 -left-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `${POLE_COLOR}15` }}
        />
        <div
          className="absolute bottom-32 -right-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `${POLE_COLOR_LIGHT}20` }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-5">
        {/* HEADER */}
        <div
          className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 12px 30px -10px ${POLE_SHADOW}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="h-1" style={{ background: POLE_GRADIENT }} />
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: `${POLE_COLOR}12`,
                    borderColor: `${POLE_COLOR}40`,
                    color: POLE_COLOR_DARK,
                  }}
                >
                  <Building2 className="h-3 w-3" />
                  Espaces disponibles
                </span>
                <h1 className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Accès aux locaux
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-xl">
                  Choisissez un local puis faites une demande de réservation (sans création de compte).
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/immersion">
                <button
                  type="button"
                  className="group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: POLE_GRADIENT,
                    boxShadow: `0 6px 16px -4px ${POLE_SHADOW}`,
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
                  Visite immersive (Ascenseur &amp; étages)
                </button>
              </Link>
              <Link to="/immersion/floor/0">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-1.5 text-xs font-semibold transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    borderColor: `${POLE_COLOR}50`,
                    color: POLE_COLOR_DARK,
                  }}
                >
                  Aller directement au RDC
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white">
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-stone-500" />
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-stone-700">
                Rechercher un local
              </h2>
            </div>

            <div className="max-w-md">
              <Input
                placeholder="Rechercher par nom, code ou localisation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] transition-colors hover:opacity-70"
                  style={{ color: POLE_COLOR_DARK }}
                >
                  <X className="h-3 w-3" />
                  Effacer
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-stone-500">Résultat :</span>
              <span className="font-semibold text-stone-800">
                {filtered.length} local{filtered.length > 1 ? 'aux' : ''} disponible{filtered.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* LISTE DES LOCAUX */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-stone-200/70 bg-white p-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-stone-300 mb-2" />
            <p className="text-stone-600 font-medium text-sm">Aucun local trouvé.</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all"
                style={{ background: POLE_GRADIENT }}
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <div
                key={l.id}
                className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-500 hover:-translate-y-1"
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 16px 36px -10px ${POLE_SHADOW}, 0 0 0 1px ${POLE_SHADOW}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div className="h-1" style={{ background: POLE_GRADIENT }} />
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {l.code}
                  </p>
                  <h3 className="mt-0.5 font-display text-base font-extrabold text-stone-900 leading-snug line-clamp-2">
                    {l.nom}
                  </h3>

                  {l.capacite != null && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-stone-600">
                      <Users className="h-3.5 w-3.5" style={{ color: POLE_COLOR_DARK }} />
                      Capacité : <b>{l.capacite}</b>
                    </p>
                  )}

                  {l.localisation && (
                    <p className="mt-0.5 text-[11px] text-stone-500 truncate">
                      {l.localisation}
                    </p>
                  )}

                  <div className="mt-3.5 flex gap-1.5">
                    <Link to={`/locaux/${l.id}`} className="flex-1">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1 rounded-full border-2 bg-white px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                        style={{
                          borderColor: POLE_COLOR,
                          color: POLE_COLOR_DARK,
                        }}
                      >
                        Détails
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                    <Link to={`/reservation/${l.id}`} className="flex-1">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        style={{
                          background: POLE_GRADIENT,
                          boxShadow: `0 5px 12px -3px ${POLE_SHADOW}`,
                        }}
                      >
                        Réserver
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}