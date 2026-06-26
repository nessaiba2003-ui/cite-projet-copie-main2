import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers';

const PRESETS = [
  { label: '1 h', hours: 1 },
  { label: '2 h', hours: 2 },
  { label: '4 h', hours: 4 },
  { label: 'Journée', hours: 8 },
  { label: 'Demi-journée', hours: 4 },
];

function toDatetimeLocalValue(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function DurationSelector({ dateDebut, dateFin, onChange, activePreset, onPresetChange }) {
  const applyPreset = (hours) => {
    onPresetChange?.(hours);
    if (!dateDebut) return;
    const start = new Date(dateDebut);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    onChange?.({ dateDebut: toDatetimeLocalValue(start), dateFin: toDatetimeLocalValue(end) });
  };

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
          <Clock className="h-4 w-4 text-[var(--color-primary)]" />
          Durée rapide
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ label, hours }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyPreset(hours)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                activePreset === hours
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110F] text-stone-700 dark:text-stone-200 hover:border-[var(--color-primary)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <motion.div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Début de la réservation"
          type="datetime-local"
          value={dateDebut}
          onChange={(e) => onChange?.({ dateDebut: e.target.value, dateFin })}
          required
        />
        <Input
          label="Fin de la réservation"
          type="datetime-local"
          value={dateFin}
          onChange={(e) => onChange?.({ dateDebut, dateFin: e.target.value })}
          required
        />
      </motion.div>

      {dateDebut && dateFin && (
        <motion.p className="text-sm text-emerald-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Période définie — ajustez via le calendrier ou les champs ci-dessus.
        </motion.p>
      )}
    </motion.div>
  );
}

export { toDatetimeLocalValue };