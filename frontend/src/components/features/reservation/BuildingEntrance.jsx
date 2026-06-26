import { useState } from 'react';
import { motion } from 'framer-motion';
import { DoorOpen } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Mets ton image ici :
 * public/images/door.jpg
 */
const DOOR_SRC = '/images/door.jpg';

export default function BuildingEntrance({ onEnter }) {
  const [opening, setOpening] = useState(false);

  const start = () => {
    if (opening) return;
    setOpening(true);
    // laisser l’animation se jouer avant d’entrer dans le bâtiment
    window.setTimeout(() => onEnter?.(), 900);
  };

  return (
    <motion.section
      className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-[#FBF9F7] dark:bg-[#14110F] dark:border-stone-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.6 }}
    >
      {/* Ambiance (pastel) */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(900px 500px at 20% 25%, rgba(224,122,95,.22), transparent 60%),' +
            'radial-gradient(900px 520px at 80% 18%, rgba(242,204,143,.20), transparent 55%),' +
            'radial-gradient(900px 520px at 65% 85%, rgba(91,191,160,.16), transparent 55%)',
        }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-[700px] px-6 text-center"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.55 }}
      >
        <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          Cité d&apos;Innovation
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-300">
          Entrez par la porte principale, puis montez étage par étage pour trouver et réserver
          l&apos;espace idéal.
        </p>

        {/* Porte */}
        <div className="mt-10">
          <div
            className="relative mx-auto h-[62vh] max-h-[540px] w-full max-w-[520px] overflow-hidden border border-stone-200 dark:border-stone-800 shadow-2xl"
            style={{
              borderRadius: '999px 999px 28px 28px', // arche
              perspective: 1200,
              background: 'linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,0))',
            }}
          >
            {/* intérieur révélé */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: opening ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background:
                  'radial-gradient(380px 220px at 50% 25%, rgba(242,204,143,.22), transparent 60%),' +
                  'linear-gradient(180deg, rgba(28,24,21,.0), rgba(28,24,21,.12))',
              }}
              aria-hidden
            />

            {/* Battants */}
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
              {/* gauche */}
              <motion.div
                className="absolute inset-y-0 left-0 w-1/2"
                style={{
                  backgroundImage: `url(${DOOR_SRC})`,
                  backgroundSize: '200% 100%',
                  backgroundPosition: 'left center',
                  transformOrigin: 'left center',
                  backfaceVisibility: 'hidden',
                }}
                animate={{
                  rotateY: opening ? -78 : 0,
                  filter: opening ? 'brightness(0.95)' : 'brightness(1)',
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              />
              {/* droite */}
              <motion.div
                className="absolute inset-y-0 right-0 w-1/2"
                style={{
                  backgroundImage: `url(${DOOR_SRC})`,
                  backgroundSize: '200% 100%',
                  backgroundPosition: 'right center',
                  transformOrigin: 'right center',
                  backfaceVisibility: 'hidden',
                }}
                animate={{
                  rotateY: opening ? 78 : 0,
                  filter: opening ? 'brightness(0.95)' : 'brightness(1)',
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              />
            </div>

            {/* voile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={start}
              disabled={opening}
              className="gap-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white border-transparent shadow-lg shadow-black/10"
            >
              <DoorOpen className="h-5 w-5" />
              {opening ? 'Ouverture…' : 'Entrer dans le bâtiment'}
            </Button>
          </div>

          <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
            RDC + 4 étages · Réservation gratuite · Parcours en escalier
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}