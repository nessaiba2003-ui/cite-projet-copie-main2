import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';

export default function ImageCarousel({ images = [], alt = 'Local', className }) {
  const [index, setIndex] = useState(0);
  const list = images?.length ? images : [];

  if (!list.length) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center rounded-2xl',
          'bg-gradient-to-br from-stone-100 to-stone-200 text-stone-600',
          'dark:from-[#1C1815] dark:to-[#14110F] dark:text-stone-300',
          className,
        )}
      >
        <span className="text-sm font-semibold">Aucune photo</span>
      </div>
    );
  }

  const prev = () => setIndex((i) => (i === 0 ? list.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === list.length - 1 ? 0 : i + 1));

  return (
    <div className={cn('relative overflow-hidden rounded-2xl', className)}>
      <AnimatePresence mode="wait">
        <motion.img
          key={list[index]}
          src={list[index]}
          alt={alt}
          className="aspect-video w-full object-cover"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
        />
      </AnimatePresence>

      {list.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
            aria-label="Suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  i === index ? 'w-6 bg-white' : 'bg-white/55',
                )}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}