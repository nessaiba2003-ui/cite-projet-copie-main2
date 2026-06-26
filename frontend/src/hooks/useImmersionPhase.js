import { createContext, useCallback, useContext, useState } from 'react';

/** Phases du parcours immersif de réservation. */
export const PHASE = Object.freeze({
  ENTRANCE: 'entrance',
  STAIRS: 'stairs',
  FLOORS: 'floors',
});

export const ImmersionPhaseContext = createContext(null);

/**
 * Gestion de l'état des phases (entrée → escaliers → étages).
 * @param {number} [initialFloor=0] — étage affiché par défaut en phase FLOORS (ex. 0 = RDC)
 */
export function useImmersionPhase(initialFloor = 0) {
  const [phase, setPhase] = useState(PHASE.ENTRANCE);
  const [currentFloor, setCurrentFloor] = useState(initialFloor);

  /** Porte d'entrée → lance la transition escaliers. */
  const enterCite = useCallback(() => {
    setPhase(PHASE.STAIRS);
  }, []);

  /** Fin de l'animation escaliers → exploration des étages. */
  const completeStairs = useCallback(() => {
    setPhase(PHASE.FLOORS);
  }, []);

  /**
   * Cible un étage (scroll / highlight gérés par FloorNavigator à l'étape 5).
   * @param {number} etage
   */
  const goToFloor = useCallback((etage) => {
    setCurrentFloor(etage);
    setPhase((prev) => (prev === PHASE.FLOORS ? prev : PHASE.FLOORS));
  }, []);

  return {
    phase,
    currentFloor,
    setPhase,
    setCurrentFloor,
    enterCite,
    completeStairs,
    goToFloor,
  };
}

/** Consomme le contexte fourni par ImmersionWrapper. */
export function useImmersionPhaseContext() {
  const value = useContext(ImmersionPhaseContext);
  if (!value) {
    throw new Error('useImmersionPhaseContext doit être utilisé dans <ImmersionWrapper>');
  }
  return value;
}
