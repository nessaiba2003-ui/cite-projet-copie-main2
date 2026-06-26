import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import {
  ImmersionPhaseContext,
  PHASE,
  useImmersionPhase,
} from '@/hooks/useImmersionPhase';

const phaseTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

export default function ImmersionWrapper({
  initialFloor = 0,
  entrance = null,
  stairs = null,
  floors = null,
}) {
  const immersion = useImmersionPhase(initialFloor);
  const { phase, enterCite, completeStairs, currentFloor } = immersion;

  const isFloors = phase === PHASE.FLOORS;

  return (
    <ImmersionPhaseContext.Provider value={immersion}>
      <motion.div
        layout
        className={cn(
          'relative w-full',
          isFloors ? 'min-h-screen overflow-y-auto' : 'h-screen overflow-hidden',
        )}
        data-phase={phase}
        data-floor={currentFloor}
      >
        <AnimatePresence mode="wait">
          {phase === PHASE.ENTRANCE && (
            <motion.div
              key={PHASE.ENTRANCE}
              layout
              className="absolute inset-0 flex flex-col"
              {...phaseTransition}
            >
              {entrance ?? (
                <PhasePlaceholder
                  title="Phase ENTRANCE"
                  hint="EntranceGate.jsx — étape 2"
                  actionLabel="Entrer dans la cité (test)"
                  onAction={enterCite}
                />
              )}
            </motion.div>
          )}

          {phase === PHASE.STAIRS && (
            <motion.div
              key={PHASE.STAIRS}
              layout
              className="absolute inset-0 flex flex-col"
              style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
              {...phaseTransition}
            >
              {stairs ?? (
                <PhasePlaceholder
                  title="Phase STAIRS"
                  hint="StaircaseTransition.jsx — étape 3"
                  actionLabel="Terminer les escaliers (test)"
                  onAction={completeStairs}
                />
              )}
            </motion.div>
          )}

          {phase === PHASE.FLOORS && (
            <motion.div
              key={PHASE.FLOORS}
              layout
              className="relative min-h-screen w-full"
              {...phaseTransition}
            >
              {floors ?? (
                <PhasePlaceholder
                  title="Phase FLOORS"
                  hint={`FloorSection + RoomCard — étape 4 · étage actuel : ${currentFloor}`}
                  actionLabel="Passer à l'étage 1 (test)"
                  onAction={() => immersion.goToFloor(1)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ImmersionPhaseContext.Provider>
  );
}

/** Placeholder minimal pour valider le changement de phase (étape 1). */
function PhasePlaceholder({ title, hint, actionLabel, onAction }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      {/* Background light/dark */}
      <div className="absolute inset-0 bg-[#FBF9F7] dark:bg-[#14110F]" aria-hidden />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(900px 520px at 20% 25%, rgba(224,122,95,.20), transparent 60%),' +
            'radial-gradient(900px 520px at 80% 18%, rgba(242,204,143,.18), transparent 55%),' +
            'radial-gradient(900px 520px at 65% 85%, rgba(91,191,160,.16), transparent 55%)',
        }}
        aria-hidden
      />

      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400">
          Immersion — étape 1
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm text-stone-600 dark:text-stone-300">
          {hint}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onAction?.()}
        className="relative z-10 rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/25"
      >
        {actionLabel}
      </button>
    </div>
  );
}