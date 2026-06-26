import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Play, View } from 'lucide-react';
import PanoramaViewer from './PanoramaViewer';
import { cn } from '@/utils/helpers';
import { resolveMediaUrl } from '@/utils/media';

const TABS = [
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'video', label: 'Vidéo', icon: Play },
  { id: 'panorama', label: '360°', icon: View },
];

export default function MediaViewer({ local }) {
  const [tab, setTab] = useState('photos');
  const images = local?.images?.length ? local.images.map((src) => resolveMediaUrl(src)) : [];
  const videoUrl = local?.videoUrl ? resolveMediaUrl(local.videoUrl) : '';
  const panoramaImages = [
    ...(local?.panoramaUrl ? [resolveMediaUrl(local.panoramaUrl)] : []),
    ...images,
  ].filter((src, index, list) => src && list.indexOf(src) === index);
  const hasVideo = !!videoUrl;
  const hasPanorama = panoramaImages.length > 0;

  return (
    <div className="space-y-4">
      <motion.div className="flex gap-2 rounded-2xl bg-stone-100 p-1 dark:bg-[#14110F]" layout>
        {TABS.map(({ id, label, icon: Icon }) => {
          const disabled = (id === 'video' && !hasVideo) || (id === 'panorama' && !hasPanorama);

          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setTab(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                tab === id && !disabled
                  ? 'bg-white text-[var(--color-primary)] shadow-sm dark:bg-[#1C1815]'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100',
                disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {images.length > 0 ? (
              images.map((src, i) => (
                <motion.img
                  key={src}
                  src={src}
                  alt=""
                  className="h-48 w-full rounded-2xl object-cover shadow-sm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                />
              ))
            ) : (
              <div className="col-span-2 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF0EB] to-[#FFF6E8] dark:from-[#1C1815] dark:to-[#14110F] text-stone-700 dark:text-stone-300">
                Aucune photo
              </div>
            )}
          </motion.div>
        )}

        {tab === 'video' && hasVideo && (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-2xl shadow-sm"
          >
            <video
              src={videoUrl}
              controls
              playsInline
              className="aspect-video w-full bg-black"
              poster={images[0]}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </motion.div>
        )}

        {tab === 'panorama' && hasPanorama && (
          <motion.div key="panorama" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PanoramaViewer url={panoramaImages[0]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
