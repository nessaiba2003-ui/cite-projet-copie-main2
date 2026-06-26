import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '@/components/ui/Loading';
import BuildingEntrance from '@/components/features/reservation/BuildingEntrance';
import StairsTransition from '@/components/features/reservation/StairsTransition';
import FloorExplorer from '@/components/features/reservation/FloorExplorer';
import localService from '@/services/localService';
import { groupLocauxByFloor, getFloorLabel } from '@/utils/floorHelpers';
import { LOCAL_STATUS } from '@/utils/constants';

/* ===== POLE UNIQUE : SERVICES TRANSVERSES (Jaune doré) ===== */
const POLE_COLOR = '#D4AF37';
const POLE_COLOR_DARK = '#B8941F';

const PHASE = { ENTRANCE: 'entrance', BUILDING: 'building', STAIRS: 'stairs' };

/** Étages principaux du bâtiment (5 niveaux : RDC + 4 étages). */
const MAIN_FLOORS = [0, 1, 2, 3, 4];

const emptyFilters = {
  typeLocal: '',
  disposition: '',
  equipements: [],
  disponibleDebut: '',
  disponibleFin: '',
  search: '',
};

function applyLocalFilters(list, filters) {
  let result = [...list];
  if (filters.typeLocal) {
    result = result.filter((l) => l.typeLocal === filters.typeLocal);
  }
  if (filters.disposition) {
    result = result.filter((l) => l.disposition === filters.disposition);
  }
  if (filters.equipements?.length) {
    result = result.filter(
      (l) => l.equipements && filters.equipements.every((eq) => l.equipements.includes(eq)),
    );
  }
  const q = (filters.search || '').trim().toLowerCase();
  if (q) {
    result = result.filter(
      (l) =>
        l.nom?.toLowerCase().includes(q) ||
        l.code?.toLowerCase().includes(q) ||
        l.localisation?.toLowerCase().includes(q),
    );
  }
  return result;
}

export default function LocauxPage() {
  const [locaux, setLocaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(PHASE.ENTRANCE);
  const [filters, setFilters] = useState(emptyFilters);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [stairsTarget, setStairsTarget] = useState(null);
  const [prevFloor, setPrevFloor] = useState(null);

  const fetchLocaux = useCallback((params = {}) => {
    return localService
      .search(params)
      .then(setLocaux)
      .catch(() => toast.error('Impossible de charger les locaux'));
  }, []);

  useEffect(() => {
    localService
      .getDisponibles()
      .then(setLocaux)
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const hasDates = filters.disponibleDebut && filters.disponibleFin;
    if (!hasDates) return;

    const t = setTimeout(() => {
      fetchLocaux({
        disponibleDebut: new Date(filters.disponibleDebut).toISOString(),
        disponibleFin: new Date(filters.disponibleFin).toISOString(),
      });
    }, 400);
    return () => clearTimeout(t);
  }, [filters.disponibleDebut, filters.disponibleFin, fetchLocaux]);

  const baseLocaux = useMemo(
    () => locaux.filter((l) => l.statut === LOCAL_STATUS.DISPONIBLE || !l.statut),
    [locaux],
  );

  const filteredLocaux = useMemo(
    () => applyLocalFilters(baseLocaux, filters),
    [baseLocaux, filters],
  );

  const floors = useMemo(() => {
    const grouped = groupLocauxByFloor(filteredLocaux);
    const byEtage = new Map(grouped.map((f) => [f.etage, f]));
    return MAIN_FLOORS.map((etage) => ({
      etage,
      label: getFloorLabel(etage),
      locaux: byEtage.get(etage)?.locaux ?? [],
    }));
  }, [filteredLocaux]);

  useEffect(() => {
    if (!floors.some((f) => f.etage === currentFloor)) {
      setCurrentFloor(MAIN_FLOORS[0]);
    }
  }, [floors, currentFloor]);

  const currentFloorData = floors.find((f) => f.etage === currentFloor) ?? floors[0];

  const handleEnterBuilding = () => {
    setFilters(emptyFilters);
    setCurrentFloor(0);
    setPhase(PHASE.BUILDING);
  };

  const handleChangeFloor = (targetEtage) => {
    if (targetEtage === currentFloor) return;
    setPrevFloor(currentFloor);
    setStairsTarget(targetEtage);
    setPhase(PHASE.STAIRS);
  };

  const handleStairsComplete = () => {
    if (stairsTarget != null) setCurrentFloor(stairsTarget);
    setStairsTarget(null);
    setPhase(PHASE.BUILDING);
  };

  if (loading) return <Loading label="Chargement de la cité…" />;

  return (
    <div className="reservation-experience -mx-4 sm:-mx-6 lg:-mx-8">
      <AnimatePresence mode="wait">
        {phase === PHASE.ENTRANCE && (
          <BuildingEntrance key="entrance" onEnter={handleEnterBuilding} />
        )}

        {phase === PHASE.STAIRS && stairsTarget != null && (
          <StairsTransition
            key="stairs"
            fromFloor={prevFloor ?? 0}
            toFloor={stairsTarget}
            onComplete={handleStairsComplete}
          />
        )}

        {phase === PHASE.BUILDING && (
          <motion.div
            key="building"
            className="space-y-3 px-2 sm:px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-wrap items-center gap-2 px-2">
              <button
                type="button"
                onClick={() => setPhase(PHASE.ENTRANCE)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border px-3.5 py-1.5 text-xs font-semibold transition-all hover:shadow-md"
                style={{
                  borderColor: `${POLE_COLOR}50`,
                  color: POLE_COLOR_DARK,
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à l&apos;entrée
              </button>
            </div>

            <FloorExplorer
              floor={currentFloorData}
              locaux={currentFloorData.locaux}
              currentFloor={currentFloor}
              onChangeFloor={handleChangeFloor}
              floors={floors}
              filters={filters}
              onFiltersChange={setFilters}
              onFiltersReset={() => setFilters(emptyFilters)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}