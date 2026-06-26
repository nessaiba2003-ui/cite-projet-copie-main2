import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import {
  DISPOSITION_OPTIONS,
  EQUIPEMENT_SUGGESTIONS,
  TYPE_LOCAL_OPTIONS,
} from '@/utils/poles';

const FIELD =
  'cim-field w-full rounded-xl px-3 py-2 text-sm shadow-sm ' +
  'bg-white text-stone-800 border-stone-200 placeholder:text-stone-400 ' +
  'dark:bg-[#14110F] dark:text-stone-100 dark:border-stone-800 dark:placeholder:text-stone-500';

export default function FloorInlineFilters({ filters, onChange, onReset }) {
  const [expanded, setExpanded] = useState(false);

  const set = (key, value) => onChange({ ...filters, [key]: value });

  const toggleEquip = (eq) => {
    const list = filters.equipements || [];
    set('equipements', list.includes(eq) ? list.filter((e) => e !== eq) : [...list, eq]);
  };

  const activeCount = [
    filters.typeLocal,
    filters.disposition,
    filters.search,
    filters.disponibleDebut,
    filters.disponibleFin,
    filters.equipements?.length,
  ].filter(Boolean).length;

  return (
    <div className="mb-6 rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-[#14110F]/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-100"
        >
          <Filter className="h-4 w-4 text-[var(--color-primary)]" />
          Filtrer sur cet étage
          {activeCount > 0 && (
            <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
          >
            <X className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
        <input
          type="search"
          className={cn(FIELD, 'pl-10')}
          placeholder="Rechercher un local sur cet étage…"
          value={filters.search || ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      {expanded && (
        <div className="mt-4 grid gap-4 border-t border-stone-200 pt-4 dark:border-stone-800 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Type de local
            </label>
            <select
              className={FIELD}
              value={filters.typeLocal || ''}
              onChange={(e) => set('typeLocal', e.target.value)}
            >
              <option value="">Tous les types</option>
              {TYPE_LOCAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Disposition
            </label>
            <select
              className={FIELD}
              value={filters.disposition || ''}
              onChange={(e) => set('disposition', e.target.value)}
            >
              <option value="">Toutes</option>
              {DISPOSITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Disponibilité
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="datetime-local"
                className={FIELD}
                value={filters.disponibleDebut || ''}
                onChange={(e) => set('disponibleDebut', e.target.value)}
              />
              <input
                type="datetime-local"
                className={FIELD}
                value={filters.disponibleFin || ''}
                onChange={(e) => set('disponibleFin', e.target.value)}
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <p className="mb-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
              Équipements
            </p>
            <div className="flex flex-wrap gap-2">
              {EQUIPEMENT_SUGGESTIONS.map((eq) => {
                const on = filters.equipements?.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquip(eq)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
                      on
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-[#1C1815] dark:text-stone-200',
                    )}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}