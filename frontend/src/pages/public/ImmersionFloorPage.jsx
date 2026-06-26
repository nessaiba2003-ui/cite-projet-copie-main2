import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChevronRight, ArrowLeft, Home, Building2, MapPin } from 'lucide-react';
import localService from '@/services/localService';
import Loading from '@/components/ui/Loading';
import FloorSelector from '@/components/features/immersion/FloorSelector';
import LocalDetailsPanel from '@/components/features/immersion/LocalDetailsPanel';
import { getFloorMeta } from '@/data/immersionFloors';
import { inferEtage } from '@/utils/floorHelpers';

function getLocalEtage(local) {
  if (local?.etage != null) return Number(local.etage);
  return Number(inferEtage(local) ?? 0);
}

export default function ImmersionFloorPage() {
  const { etage } = useParams();
  const navigate = useNavigate();
  const currentEtage = Number(etage ?? 0);
  const meta = useMemo(() => getFloorMeta(currentEtage), [currentEtage]);

  const [loading, setLoading] = useState(true);
  const [allLocaux, setAllLocaux] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    localService
      .getAll()
      .then((data) => setAllLocaux(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Impossible de charger les locaux'))
      .finally(() => setLoading(false));
  }, []);

  const locauxFloor = useMemo(() => {
    return allLocaux
      .map((l) => ({ ...l, __etage: getLocalEtage(l) }))
      .filter((l) => l.__etage === currentEtage);
  }, [allLocaux, currentEtage]);

  useEffect(() => {
    if (locauxFloor.length > 0) {
      setSelectedId((prev) => prev ?? locauxFloor[0].id);
    } else {
      setSelectedId(null);
    }
  }, [currentEtage, locauxFloor]);

  const selectedLocal = useMemo(
    () => locauxFloor.find((l) => l.id === selectedId) ?? null,
    [locauxFloor, selectedId],
  );

  const onSelectFloor = (nextEtage) => {
    if (Number(nextEtage) === currentEtage) return;
    navigate(`/immersion/elevator/${nextEtage}`);
  };

  const onReserve = () => {
    if (!selectedLocal?.id) return;
    navigate(`/reservation/${selectedLocal.id}`);
  };

  if (loading) return <Loading label="Chargement de l'immersion…" />;

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{
        background:
          'linear-gradient(160deg, #FFF8EE 0%, #FBEED9 35%, #F7E4C8 65%, #FFF1DC 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full blur-3xl opacity-40 animate-aurora-slow"
          style={{ background: 'radial-gradient(circle, #F5D391 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 -right-24 h-[480px] w-[480px] rounded-full blur-3xl opacity-35 animate-aurora"
          style={{ background: 'radial-gradient(circle, #E8C69A 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 left-1/3 h-[440px] w-[440px] rounded-full blur-3xl opacity-30 animate-aurora-slow"
          style={{
            background: 'radial-gradient(circle, #FFE6D5 0%, transparent 70%)',
            animationDelay: '-8s',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 space-y-4">
        <motion.div
          className="overflow-hidden rounded-2xl border border-[#B8945E]/40 bg-white/70 backdrop-blur-md"
          style={{
            boxShadow: '0 12px 30px -10px rgba(184, 148, 94, 0.30)',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-1 bg-gradient-to-r from-[#E8C69A] via-[#F5DCBC] to-[#E8C69A]" />
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8C69A] to-[#B8945E] shadow-md shadow-[#E8C69A]/40">
                  <Building2 className="h-4 w-4 text-white drop-shadow" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.3em] text-[#8B6B3A] uppercase">
                    Explorateur immersif
                  </p>
                  <p className="mt-0.5 font-display text-xs font-bold text-[#3D2817] truncate">
                    {meta.title}
                  </p>
                  <p className="text-[11px] text-stone-600 truncate">{meta.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/immersion">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-[#B8945E]/40 bg-white px-3 py-1.5 text-[10px] font-semibold text-[#8B6B3A] hover:bg-white hover:border-[#B8945E]/70 hover:shadow-md transition-all"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Retour aux portes
                  </button>
                </Link>
                <Link to="/">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#E8C69A] to-[#B8945E] px-3 py-1.5 text-[10px] font-semibold text-white shadow-md shadow-[#E8C69A]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <Home className="h-3 w-3" />
                    Quitter l&apos;immersion
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[280px_280px_1fr]">
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FloorSelector value={currentEtage} onChange={onSelectFloor} />

            <div
              className="overflow-hidden rounded-2xl border border-[#B8945E]/40 bg-white/70 backdrop-blur-md transition-all duration-300"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(184, 148, 94, 0.40)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="h-1 bg-gradient-to-r from-[#E8C69A] via-[#F5DCBC] to-[#E8C69A]" />
              <div className="p-4">
                <p className="text-[9px] font-bold tracking-[0.3em] text-[#8B6B3A] uppercase">
                  Niveau actuel
                </p>
                <p className="mt-1.5 font-display text-xl font-extrabold text-[#8B6B3A]">
                  {meta.shortLabel}
                </p>
                <p className="mt-0.5 text-xs font-bold text-[#3D2817]">{meta.title}</p>
                <p className="mt-0.5 text-xs text-stone-600 leading-relaxed">{meta.subtitle}</p>
              </div>
            </div>

            <Link
              to="/locaux"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-[#8B6B3A] hover:text-[#B8945E] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              Liste classique des locaux
            </Link>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-2xl border border-[#B8945E]/40 bg-white/70 backdrop-blur-md transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(184, 148, 94, 0.40)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="h-1 bg-gradient-to-r from-[#E8C69A] via-[#F5DCBC] to-[#E8C69A]" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#E8C69A] to-[#B8945E] shadow-md shadow-[#E8C69A]/40">
                    <MapPin className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="font-display text-xs font-bold text-[#3D2817]">
                      Espaces référencés
                    </p>
                    <p className="text-[10px] text-stone-600">
                      {locauxFloor.length} local{locauxFloor.length > 1 ? 'aux' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {locauxFloor.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#B8945E]/30 bg-white/50 py-8 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-[#B8945E]/40 mb-1.5" />
                  <p className="text-xs text-stone-600 font-medium">
                    Aucun local référencé sur cet étage.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                  {locauxFloor.map((l) => {
                    const active = l.id === selectedId;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setSelectedId(l.id)}
                        className={`group w-full rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-300 ${
                          active
                            ? 'border-[#B8945E] bg-gradient-to-br from-[#FFF8EE] to-white shadow-md shadow-[#B8945E]/25'
                            : 'border-stone-200 bg-white hover:border-[#B8945E]/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className={`truncate text-xs font-bold ${
                                active ? 'text-[#8B6B3A]' : 'text-[#3D2817]'
                              }`}
                            >
                              {l.nom}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium text-stone-500">
                              {l.code}
                            </p>
                          </div>
                          <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 transition-all duration-300 ${
                              active
                                ? 'text-[#B8945E] translate-x-1'
                                : 'text-stone-400 group-hover:translate-x-0.5'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LocalDetailsPanel local={selectedLocal} onReserve={onReserve} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}