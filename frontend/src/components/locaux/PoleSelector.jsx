import { motion } from 'framer-motion';
import { ArrowRight, Building2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

export default function PoleSelector({ poles, selectedId, onSelect }) {
  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
          Choisissez votre pôle
        </h2>
        <p className="mt-2 text-stone-600 dark:text-stone-300">
          Parcourez les espaces par domaine d&apos;activité de la Cité
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2">
        {poles.map((pole, i) => {
          const active = selectedId === pole.id;
          const color = pole.couleur || 'var(--color-primary)';

          return (
            <motion.button
              key={pole.id}
              type="button"
              onClick={() => onSelect(pole)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all',
                'bg-white shadow-sm hover:-translate-y-1 dark:bg-[#1C1815]',
                active ? 'ring-2 ring-offset-2 ring-offset-[#FBF9F7] dark:ring-offset-[#14110F]' : '',
              )}
              style={{
                borderColor: color,
                boxShadow: active ? `0 10px 30px ${String(color).includes('var') ? 'rgba(224,122,95,.22)' : `${color}33`}` : undefined,
                ['--tw-ring-color']: color,
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.div className="absolute inset-x-0 top-0 h-2" style={{ background: color }} />

              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{ background: color }}
                >
                  <Building2 className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {pole.nom}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600 dark:text-stone-300">
                    {pole.description}
                  </p>
                </div>

                <ArrowRight
                  className="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
