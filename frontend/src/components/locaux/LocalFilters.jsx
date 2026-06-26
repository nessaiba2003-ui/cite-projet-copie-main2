import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import {
  DISPOSITION_OPTIONS,
  EQUIPEMENT_SUGGESTIONS,
  TYPE_LOCAL_OPTIONS,
} from '@/utils/poles';
import Button from '@/components/ui/Button';

const emptyFilters = {
  typeLocal: '',
  disposition: '',
  equipements: [],
  disponibleDebut: '',
  disponibleFin: '',
  search: '',
};

export default function LocalFilters({ poles, selectedPoleId, onPoleSelect, onApply, className }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [open, setOpen] = useState(true);

  const toggleEquip = (eq) => {
    setFilters((f) => ({
      ...f,
      equipements: f.equipements.includes(eq)
        ? f.equipements.filter((e) => e !== eq)
        : [...f.equipements, eq],
    }));
  };

  const apply = () => {
    onApply({
      poleId: selectedPoleId,
      typeLocal: filters.typeLocal || undefined,
      disposition: filters.disposition || undefined,
      equipements: filters.equipements.length ? filters.equipements : undefined,
      disponibleDebut: filters.disponibleDebut || undefined,
      disponibleFin: filters.disponibleFin || undefined,
      search: filters.search || undefined,
    });
  };

  const reset = () => {
    setFilters(emptyFilters);
    onApply({ poleId: selectedPoleId });
  };

  return (
    <aside
      className={cn(
        'rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-[#1C1815]',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-100">
          <Filter className="h-4 w-4 text-[var(--color-primary)]" />
          Filtres
        </h3>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
        >
          {open ? 'Réduire' : 'Afficher'}
        </button>
      </div>

      {open && (
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Pôle
            </p>
            <div className="flex flex-wrap gap-2">
              {poles?.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPoleSelect(p.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold text-white transition-transform hover:scale-105',
                    selectedPoleId === p.id && 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1C1815]',
                  )}
                  style={{
                    background: p.couleur,
                    ['--tw-ring-color']: p.couleur,
                  }}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Type de local
            </label>
            <select
              className="cim-field w-full rounded-xl border px-3 py-2 text-sm"
              value={filters.typeLocal}
              onChange={(e) => setFilters((f) => ({ ...f, typeLocal: e.target.value }))}
            >
              <option value="">Tous</option>
              {TYPE_LOCAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-300">
              Disposition
            </label>
            <select
              className="cim-field w-full rounded-xl border px-3 py-2 text-sm"
              value={filters.disposition}
              onChange={(e) => setFilters((f) => ({ ...f, disposition: e.target.value }))}
            >
              <option value="">Toutes</option>
              {DISPOSITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
              Équipements
            </p>
            <div className="flex flex-wrap gap-2">
              {EQUIPEMENT_SUGGESTIONS.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquip(eq)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
                    filters.equipements.includes(eq)
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-[#14110F] dark:text-stone-200',
                  )}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Disponible à partir de
            </label>
            <input
              type="datetime-local"
              className="cim-field rounded-xl border px-3 py-2 text-sm"
              value={filters.disponibleDebut}
              onChange={(e) => setFilters((f) => ({ ...f, disponibleDebut: e.target.value }))}
            />
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Jusqu&apos;au
            </label>
            <input
              type="datetime-local"
              className="cim-field rounded-xl border px-3 py-2 text-sm"
              value={filters.disponibleFin}
              onChange={(e) => setFilters((f) => ({ ...f, disponibleFin: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white border-transparent"
              onClick={apply}
            >
              Appliquer
            </Button>
            <Button size="sm" variant="outline" icon={X} onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}