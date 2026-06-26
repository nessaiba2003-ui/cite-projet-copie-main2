import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  ArrowLeft,
  Calendar,
  Camera,
  Eye,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import MediaViewer from '@/components/features/reservation/MediaViewer';
import Panorama360 from '@/components/locaux/Panorama360';
import localService from '@/services/localService';
import { getFloorLabel, inferEtage } from '@/utils/floorHelpers';
import { cn } from '@/utils/helpers';
import { resolveMediaUrl } from '@/utils/media';

/* ===== POLE UNIQUE : SERVICES TRANSVERSES (Jaune doré) ===== */
const POLE_COLOR = '#D4AF37';
const POLE_COLOR_LIGHT = '#F0CF65';
const POLE_COLOR_DARK = '#B8941F';
const POLE_GRADIENT = `linear-gradient(135deg, ${POLE_COLOR_LIGHT} 0%, ${POLE_COLOR} 100%)`;
const POLE_SHADOW = 'rgba(212, 175, 55, 0.35)';

export default function LocalDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const isDemandeurPath = location.pathname.startsWith('/demandeur');

  const backTo = isDemandeurPath ? '/demandeur/locaux' : '/locaux';
  const reservationTo = isDemandeurPath ? `/demandeur/reservation/${id}` : `/reservation/${id}`;

  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('media');

  useEffect(() => {
    localService
      .getById(id)
      .then(setLocal)
      .catch(() => toast.error('Local introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading label="Chargement…" />;

  if (!local) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-stone-600">Local introuvable.</p>
        <Link to={backTo} className="mt-3 inline-block">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-1.5 text-xs font-semibold transition-all hover:shadow-md"
            style={{ borderColor: `${POLE_COLOR}50`, color: POLE_COLOR_DARK }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </button>
        </Link>
      </div>
    );
  }

  const etage = inferEtage(local);
  const localImages = Array.isArray(local.images) ? local.images.map((src) => resolveMediaUrl(src)) : [];
  const panoramaImages = [
    ...(local.panoramaUrl ? [resolveMediaUrl(local.panoramaUrl)] : []),
    ...localImages,
  ].filter((src, index, list) => src && list.indexOf(src) === index);
  const hasPanorama = panoramaImages.length > 0;

  return (
    <motion.div
      className="relative space-y-5 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 rounded-full bg-white border px-3.5 py-1.5 text-xs font-semibold transition-all hover:shadow-md"
        style={{ borderColor: `${POLE_COLOR}50`, color: POLE_COLOR_DARK }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à l&apos;exploration
      </Link>

      {/* HEADER LOCAL */}
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
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: `${POLE_COLOR}12`,
                  borderColor: `${POLE_COLOR}40`,
                  color: POLE_COLOR_DARK,
                }}
              >
                {getFloorLabel(etage)}
              </span>
              <h1 className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                {local.nom}
              </h1>
              <p className="mt-0.5 text-sm text-stone-500 font-medium">{local.code}</p>
            </div>
            <Badge status={local.statut} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* COLONNE GAUCHE : VISITE + DESCRIPTION */}
        <div className="lg:col-span-2 space-y-4">
          {/* Visite virtuelle */}
          <motion.div
            className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 12px 30px -10px ${POLE_SHADOW}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="h-1" style={{ background: POLE_GRADIENT }} />
            <div className="px-4 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg shadow-md"
                  style={{
                    background: POLE_GRADIENT,
                    boxShadow: `0 5px 12px -3px ${POLE_SHADOW}`,
                  }}
                >
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-display text-sm font-extrabold text-stone-900">
                  Visite virtuelle
                </h2>
              </div>
              {hasPanorama && (
                <div className="flex gap-1 rounded-full bg-stone-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('media')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-300',
                      activeTab === 'media'
                        ? 'text-white shadow-md'
                        : 'text-stone-600 hover:bg-white',
                    )}
                    style={
                      activeTab === 'media'
                        ? {
                            background: POLE_GRADIENT,
                            boxShadow: `0 5px 12px -3px ${POLE_SHADOW}`,
                          }
                        : {}
                    }
                  >
                    <Camera className="h-3 w-3" />
                    Photos &amp; Vidéo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('360')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-300',
                      activeTab === '360'
                        ? 'text-white shadow-md'
                        : 'text-stone-600 hover:bg-white',
                    )}
                    style={
                      activeTab === '360'
                        ? {
                            background: POLE_GRADIENT,
                            boxShadow: `0 5px 12px -3px ${POLE_SHADOW}`,
                          }
                        : {}
                    }
                  >
                    <Sparkles className="h-3 w-3" />
                    Vue 360°
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {activeTab === 'media' ? (
                <MediaViewer local={local} />
              ) : (
                <Panorama360 imageUrl={panoramaImages[0]} height="360px" label={local.nom} />
              )}
            </div>
          </motion.div>

          {/* Description */}
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
            <div className="px-4 py-3 border-b border-stone-200">
              <h2 className="font-display text-sm font-extrabold text-stone-900">
                Description
              </h2>
            </div>
            <div className="p-4">
              <p className="whitespace-pre-wrap text-xs text-stone-700 leading-relaxed">
                {local.description || 'Aucune description disponible.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {local.localisation && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                    style={{
                      background: `${POLE_COLOR}12`,
                      borderColor: `${POLE_COLOR}40`,
                      color: POLE_COLOR_DARK,
                    }}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {local.localisation}
                  </span>
                )}
                {local.capacite != null && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                    style={{
                      background: `${POLE_COLOR}12`,
                      borderColor: `${POLE_COLOR}40`,
                      color: POLE_COLOR_DARK,
                    }}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {local.capacite} places
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : RÉSERVATION */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="sticky top-4 overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 16px 36px -10px ${POLE_SHADOW}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div
              className="relative p-4 text-white overflow-hidden"
              style={{ background: POLE_GRADIENT }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                }}
              />
              <div className="relative flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm ring-1 ring-white/30 shadow-inner">
                  <Calendar className="h-4 w-4 text-white drop-shadow" />
                </div>
                <h2 className="font-display text-base font-extrabold">Réserver</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Réservation directe sans paiement en ligne. Choisissez votre créneau sur le
                calendrier.
              </p>
              <Link to={reservationTo} className="block">
                <button
                  type="button"
                  className="group w-full inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: POLE_GRADIENT,
                    boxShadow: `0 8px 20px -4px ${POLE_SHADOW}`,
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Choisir un créneau
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
