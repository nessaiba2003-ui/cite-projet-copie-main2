import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Users,
  Calendar,
  Image as ImgIcon,
  Video as VidIcon,
  Compass,
  Building2,
} from 'lucide-react';
import ImageCarousel from '@/components/locaux/ImageCarousel';
import Panorama360 from '@/components/locaux/Panorama360';
import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/helpers';

export default function LocalDetailsPanel({ local, onReserve }) {
  const [tab, setTab] = useState('photos');
  const [activePanoIndex, setActivePanoIndex] = useState(0);

  const images = useMemo(() => {
    const list = local?.images ?? [];
    return list.map((x) => resolveMediaUrl(x));
  }, [local]);

  const videoUrl = useMemo(
    () => (local?.videoUrl ? resolveMediaUrl(local.videoUrl) : ''),
    [local],
  );
  const panoImages = useMemo(() => {
    const list = [];
    if (local?.panoramaUrl) list.push(resolveMediaUrl(local.panoramaUrl));
    images.forEach((image) => {
      if (image && !list.includes(image)) list.push(image);
    });
    return list;
  }, [images, local]);

  useEffect(() => {
    setActivePanoIndex(0);
  }, [local?.id]);

  if (!local) {
    return (
      <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white p-8 text-center">
        <Building2 className="mx-auto h-12 w-12 text-stone-300 mb-3" />
        <p className="text-stone-500 font-medium">
          Sélectionnez un local pour afficher ses détails.
        </p>
      </div>
    );
  }

  const hasVideo = Boolean(videoUrl && videoUrl.trim() !== '');
  const hasPano = panoImages.length > 0;
  const activePanoUrl = panoImages[activePanoIndex] ?? '';

  const tabs = [
    { key: 'photos', label: 'Photos', icon: ImgIcon, gradient: 'from-[#E07A5F] to-[#E8956F]', shadowColor: 'rgba(224, 122, 95, 0.30)' },
    { key: 'video', label: 'Visite vidéo', icon: VidIcon, gradient: 'from-[#9B8EC4] to-[#B8AAD4]', shadowColor: 'rgba(155, 142, 196, 0.30)' },
    { key: 'pano', label: 'Aperçu 360°', icon: Compass, gradient: 'from-[#5BBFA0] to-[#7DD4B8]', shadowColor: 'rgba(91, 191, 160, 0.30)' },
  ];

  return (
    <div
      className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white transition-all duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 50px -15px rgba(212, 175, 55, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F2CC8F] to-[#5BBFA0]" />

      <div className="p-6">
        {/* HEADER LOCAL */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 uppercase">
              {local.code}
            </p>
            <h3 className="mt-1 truncate font-display text-2xl font-extrabold text-stone-900">
              {local.nom}
            </h3>
          </div>
          <button
            type="button"
            onClick={onReserve}
            className="shrink-0 group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#5BBFA0]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#5BBFA0]/45 hover:-translate-y-0.5"
          >
            <Calendar className="h-4 w-4" />
            Réserver
          </button>
        </div>

        {/* INFOS RAPIDES */}
        <div className="mt-4 flex flex-wrap gap-2">
          {local.localisation && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E07A5F]/10 border border-[#E07A5F]/25 px-3 py-1.5 text-sm font-semibold text-[#C96A50]">
              <MapPin className="h-3.5 w-3.5" />
              {local.localisation}
            </span>
          )}
          {local.capacite != null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9B8EC4]/10 border border-[#9B8EC4]/25 px-3 py-1.5 text-sm font-semibold text-[#806FB0]">
              <Users className="h-3.5 w-3.5" />
              {local.capacite} places
            </span>
          )}
        </div>

        {/* DESCRIPTION */}
        <p className="mt-5 whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">
          {local.description || 'Aucune description disponible.'}
        </p>

        {/* ONGLETS MÉDIA */}
        <div className="mt-6 flex gap-2 rounded-full bg-stone-100 p-1.5">
          {tabs.map(({ key, label, icon: Icon, gradient, shadowColor }) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-300',
                  isActive
                    ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                    : 'text-stone-600 hover:bg-white',
                )}
                style={
                  isActive
                    ? { boxShadow: `0 8px 20px -6px ${shadowColor}` }
                    : {}
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* CONTENU MÉDIA */}
        <div className="mt-5">
          {tab === 'photos' && (
            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
              <ImageCarousel images={images} alt={local.nom} className="rounded-2xl" />
            </div>
          )}

          {tab === 'video' && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
              {hasVideo ? (
                <video
                  src={videoUrl}
                  controls
                  className="aspect-video w-full rounded-xl bg-black"
                />
              ) : (
                <div className="py-10 text-center">
                  <VidIcon className="mx-auto h-10 w-10 text-stone-300 mb-2" />
                  <p className="text-sm text-stone-500 font-medium">
                    Aucune vidéo disponible.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'pano' && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
              {hasPano ? (
                <div className="space-y-3">
                  <Panorama360 imageUrl={activePanoUrl} height="360px" label={local.nom} />
                  {panoImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {panoImages.map((src, index) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setActivePanoIndex(index)}
                          className={cn(
                            'h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all',
                            activePanoIndex === index
                              ? 'border-[#5BBFA0] shadow-md shadow-[#5BBFA0]/25'
                              : 'border-stone-200 hover:border-[#5BBFA0]/50',
                          )}
                        >
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Compass className="mx-auto h-10 w-10 text-stone-300 mb-2" />
                  <p className="text-sm text-stone-500 font-medium">
                    Aucune vue 360° disponible.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
