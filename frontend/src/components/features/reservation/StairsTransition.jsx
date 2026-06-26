import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFloorLabel } from '@/utils/floorHelpers';

const STEPS = 8;

export default function StairsTransition({ fromFloor, toFloor, onComplete }) {
  const goingUp = toFloor > fromFloor;

  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="stairs-scene fixed inset-0 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[#FBF9F7] dark:bg-[#14110F]" />

      <div
        className="absolute inset-0 opacity-85"
        style={{
          background:
            'radial-gradient(900px 520px at 20% 25%, rgba(224,122,95,.20), transparent 60%),' +
            'radial-gradient(900px 520px at 80% 18%, rgba(242,204,143,.18), transparent 55%),' +
            'radial-gradient(900px 520px at 65% 85%, rgba(91,191,160,.16), transparent 55%)',
        }}
        aria-hidden
      />

      <div className="stairs-container relative h-full w-full max-w-lg">
        {Array.from({ length: STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className="stairs-step absolute left-1/2 w-[72%] -translate-x-1/2 rounded-md border border-stone-200/70 dark:border-stone-800/70 shadow-lg"
            style={{
              height: '6%',
              bottom: `${8 + i * 9}%`,
              background:
                'linear-gradient(90deg, rgba(224,122,95,.16), rgba(242,204,143,.12), rgba(91,191,160,.14))',
              transform: `translateX(-50%) translateZ(${i * 20}px) rotateX(2deg)`,
            }}
            initial={{ opacity: 0, y: goingUp ? 80 : -80 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: goingUp ? [80, 0, -40, -120] : [-80, 0, 40, 120],
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          {goingUp ? 'Montée' : 'Descente'}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
          {getFloorLabel(toFloor)}
        </h2>
      </motion.div>
    </motion.div>
  );
}