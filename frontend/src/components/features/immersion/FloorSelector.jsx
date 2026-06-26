import { IMMERSION_FLOORS } from '@/data/immersionFloors';
import { cn } from '@/utils/helpers';
import { Layers } from 'lucide-react';

export default function FloorSelector({ value = 0, onChange }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white transition-all duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 16px 40px -12px rgba(212, 175, 55, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F2CC8F] to-[#D4AF37]" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A88829] shadow-md shadow-[#D4AF37]/30">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-[#A88829] uppercase">
              Sélecteur de niveaux
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              Cliquez pour appeler l&apos;ascenseur
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {[...IMMERSION_FLOORS].reverse().map((f) => {
            const active = Number(value) === f.etage;
            return (
              <button
                key={f.etage}
                type="button"
                onClick={() => onChange?.(f.etage)}
                className={cn(
                  'group w-full rounded-2xl border-2 px-3 py-3 text-left transition-all duration-300',
                  active
                    ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFF8E7] to-white shadow-md shadow-[#D4AF37]/25'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm',
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold transition-all duration-300',
                      active
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#A88829] text-white shadow-md shadow-[#D4AF37]/40 scale-105'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 group-hover:border-stone-300',
                    )}
                  >
                    {f.shortLabel}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm font-bold',
                        active ? 'text-[#A88829]' : 'text-stone-900',
                      )}
                    >
                      {f.title}
                    </p>
                    <p className="truncate text-xs text-stone-500 mt-0.5">{f.subtitle}</p>
                  </div>
                  {active && (
                    <div className="flex h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" style={{ boxShadow: '0 0 8px rgba(212, 175, 55, 0.7)' }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}