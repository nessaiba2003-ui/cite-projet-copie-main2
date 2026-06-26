import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import LocalImmersiveCard from './LocalImmersiveCard';
import FloorInlineFilters from '@/components/locaux/FloorInlineFilters';
import { getFloorShort } from '@/utils/floorHelpers';
import Button from '@/components/ui/Button';

export default function FloorExplorer({
  floor,
  locaux,
  currentFloor,
  onChangeFloor,
  floors,
  filters,
  onFiltersChange,
  onFiltersReset,
  accentColor = '#E07A5F',
}) {
  const floorIndex = floors.findIndex((f) => f.etage === currentFloor);
  const canGoUp = floorIndex < floors.length - 1;
  const canGoDown = floorIndex > 0;
  const totalFloors = floors.length;

  return (
    <motion.section
      className="floor-explorer relative min-h-[65vh] rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-sm
                 dark:border-stone-800 dark:bg-[#1C1815]/90"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 flex items-center justify-center gap-2">
        {floors.map((f) => (
          <button
            key={f.etage}
            type="button"
            onClick={() => f.etage !== currentFloor && onChangeFloor(f.etage)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-colors border ${
              f.etage === currentFloor
                ? 'text-white shadow-sm'
                : 'bg-white dark:bg-[#14110F] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-[#1A1613]'
            }`}
            style={f.etage === currentFloor ? { background: accentColor, borderColor: accentColor } : undefined}
            title={f.label}
          >
            {getFloorShort(f.etage)}
          </button>
        ))}
      </div>

      <p className="mb-6 text-center text-xs text-stone-500 dark:text-stone-400">
        {totalFloors} niveau{totalFloors > 1 ? 'x' : ''} — utilisez les escaliers pour changer d&apos;étage
      </p>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm"
            key={currentFloor}
            initial={{ scale: 0.86, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            style={{ background: accentColor }}
          >
            {getFloorShort(currentFloor)}
          </motion.div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <Layers className="mr-1 inline h-3.5 w-3.5" />
              Parcours en escalier
            </p>
            <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
              {floor.label}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              {locaux.length} local{locaux.length !== 1 ? 'aux' : ''} affiché{locaux.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoDown}
            onClick={() => onChangeFloor(floors[floorIndex - 1].etage)}
            className="disabled:opacity-30"
            icon={ChevronDown}
          >
            Descendre
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!canGoUp}
            onClick={() => onChangeFloor(floors[floorIndex + 1].etage)}
            icon={ChevronUp}
            className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white border-transparent"
          >
            Monter
          </Button>
        </div>
      </div>

      <motion.div
        className="mb-6 h-2 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(224,122,95,.45), transparent)' }}
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <FloorInlineFilters filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />

      {locaux.length > 0 ? (
        <motion.div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" layout>
          {locaux.map((local, i) => (
            <LocalImmersiveCard key={local.id} local={local} index={i} />
          ))}
        </motion.div>
      ) : (
        <p className="py-16 text-center text-stone-600 dark:text-stone-300">
          Aucun local ne correspond sur cet étage. Ajustez les filtres ci-dessus.
        </p>
      )}
    </motion.section>
  );
}