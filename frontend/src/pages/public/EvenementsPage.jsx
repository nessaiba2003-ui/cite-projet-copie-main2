import { useEffect, useState } from 'react';
import { LayoutGrid, List, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '@/components/ui/Loading';
import EventCard from '@/components/features/evenements/EventCard';
import evenementService from '@/services/evenementService';
import { getPageContent } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

export default function EvenementsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    evenementService
      .getPage(0, 24)
      .then((page) => setEvents(getPageContent(page)))
      .catch(() => toast.error('Impossible de charger les événements'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Chargement des événements…" />;

  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#5BBFA0]/10 blur-3xl animate-aurora" />
        <div className="absolute bottom-32 -right-24 h-72 w-72 rounded-full bg-[#F2CC8F]/12 blur-3xl animate-aurora-slow" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5BBFA0]/12 border border-[#5BBFA0]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4AA88D]">
              <CalendarDays className="h-3 w-3" />
              Agenda
            </span>
            <h1 className="mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
              Événements
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Conférences, ateliers et rencontres à la Cité d&apos;Innovation
            </p>
          </div>

          <div className="flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={cn(
                'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300',
                view === 'grid'
                  ? 'bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] text-white shadow-md shadow-[#5BBFA0]/30'
                  : 'text-stone-600 hover:bg-stone-50',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grille
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300',
                view === 'list'
                  ? 'bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] text-white shadow-md shadow-[#5BBFA0]/30'
                  : 'text-stone-600 hover:bg-stone-50',
              )}
            >
              <List className="h-3.5 w-3.5" />
              Liste
            </button>
          </div>
        </div>

        <div
          className={cn(
            view === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-3',
          )}
        >
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} view={view} />
          ))}
        </div>

        {events.length === 0 && (
          <div className="py-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-stone-300 mb-2" />
            <p className="text-sm text-stone-500">Aucun événement publié.</p>
          </div>
        )}
      </div>
    </div>
  );
}