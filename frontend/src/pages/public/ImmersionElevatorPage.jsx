import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, ArrowUp, ArrowDown, Sparkles, ArrowLeft,
} from 'lucide-react';
import { getFloorMeta, IMMERSION_FLOORS } from '@/data/immersionFloors';

const IMMERSION_SOUND_KEY = 'immersion_sound_on';
const LAST_FLOOR_KEY = 'immersion_last_floor';

function isSoundEnabled() {
  const v = localStorage.getItem(IMMERSION_SOUND_KEY);
  if (v == null) return true;
  return v === '1';
}

function setSoundEnabled(on) {
  localStorage.setItem(IMMERSION_SOUND_KEY, on ? '1' : '0');
}

function getLastFloor() {
  const v = Number(localStorage.getItem(LAST_FLOOR_KEY));
  return isFinite(v) ? v : 0;
}

function setLastFloor(f) {
  localStorage.setItem(LAST_FLOOR_KEY, String(f));
}

function createElevatorSfxEngine() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    ctx.resume?.().catch(() => {});

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.55, now);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-15, now);
    comp.knee.setValueAtTime(20, now);
    comp.ratio.setValueAtTime(3, now);

    master.connect(comp);
    comp.connect(ctx.destination);

    const delay = ctx.createDelay(0.45);
    delay.delayTime.setValueAtTime(0.13, now);
    const fb = ctx.createGain();
    fb.gain.setValueAtTime(0.30, now);
    const wet = ctx.createGain();
    wet.gain.setValueAtTime(0.40, now);
    delay.connect(fb).connect(delay);
    delay.connect(wet).connect(master);

    const bus = ctx.createGain();
    bus.connect(master);
    bus.connect(delay);

    const env = (t0, peak, dur) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      return g;
    };

    const note = (t0, freq, peak, dur) => {
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t0);
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t0);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(freq * 1.2, t0);
      bp.Q.setValueAtTime(8, t0);
      const g1 = env(t0, peak, dur);
      const g2 = env(t0, peak * 0.3, dur * 0.8);
      osc1.connect(bp).connect(g1).connect(bus);
      osc2.connect(g2).connect(bus);
      osc1.start(t0);
      osc1.stop(t0 + dur + 0.2);
      osc2.start(t0);
      osc2.stop(t0 + dur + 0.2);
    };

    const tin = (t0) => note(t0, 1318.5, 0.55, 1.0);
    const tan = (t0) => note(t0, 880, 0.55, 1.3);

    const playClose = () => {
      const t0 = ctx.currentTime + 0.02;
      note(t0, 1046.5, 0.40, 0.5);
    };

    const playArriveAndOpen = () => {
      const t0 = ctx.currentTime + 0.05;
      tin(t0);
      tan(t0 + 0.45);
      note(t0 + 0.95, 1568, 0.45, 0.9);
    };

    const stop = () => {
      try {
        const t0 = ctx.currentTime;
        master.gain.cancelScheduledValues(t0);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0002), t0);
        master.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
      } catch {}
      setTimeout(() => ctx.close().catch(() => {}), 300);
    };

    return { playClose, playArriveAndOpen, stop, ctx };
  } catch {
    return null;
  }
}

export default function ImmersionElevatorPage() {
  const { etage } = useParams();
  const navigate = useNavigate();

  const targetFloor = Number(etage);
  const fromFloor = useMemo(() => getLastFloor(), []);
  const meta = useMemo(() => getFloorMeta(etage), [etage]);

  const direction = targetFloor > fromFloor ? 'up' : targetFloor < fromFloor ? 'down' : 'up';
  const floorsToTraverse = useMemo(() => {
    const min = Math.min(fromFloor, targetFloor);
    const max = Math.max(fromFloor, targetFloor);
    const list = [];
    for (let i = min; i <= max; i++) list.push(i);
    return direction === 'up' ? list : list.reverse();
  }, [fromFloor, targetFloor, direction]);

  const [progress, setProgress] = useState(0);
  const [currentDisplayFloor, setCurrentDisplayFloor] = useState(fromFloor);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const sfxRef = useRef(null);
  const arrivedRef = useRef(false);

  useEffect(() => {
    const total = 3500;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);

      if (floorsToTraverse.length > 0) {
        const idx = Math.min(
          floorsToTraverse.length - 1,
          Math.floor((pct / 100) * floorsToTraverse.length),
        );
        setCurrentDisplayFloor(floorsToTraverse[idx]);
      }

      if (pct >= 100) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [floorsToTraverse]);

  useEffect(() => {
    if (!soundOn) return;
    const engine = createElevatorSfxEngine();
    sfxRef.current = engine;
    engine?.playClose?.();
    return () => {
      try {
        engine?.stop?.();
      } catch {}
    };
  }, [soundOn]);

  useEffect(() => {
    if (progress < 100) return;
    if (arrivedRef.current) return;
    arrivedRef.current = true;

    if (soundOn) sfxRef.current?.playArriveAndOpen?.();

    const to = setTimeout(() => {
      setLastFloor(targetFloor);
      navigate(`/immersion/floor/${meta.etage}`, { replace: true });
    }, soundOn ? 1800 : 200);

    return () => clearTimeout(to);
  }, [progress, soundOn, navigate, meta.etage, targetFloor]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (!next) {
      try {
        sfxRef.current?.stop?.();
      } catch {}
    }
  };

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, #FFF8EE 0%, #FBEED9 35%, #F7E4C8 65%, #FFF1DC 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full blur-3xl opacity-50 animate-aurora-slow"
          style={{ background: 'radial-gradient(circle, #F5D391 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 -right-24 h-[480px] w-[480px] rounded-full blur-3xl opacity-45 animate-aurora"
          style={{ background: 'radial-gradient(circle, #E8C69A 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 left-1/3 h-[440px] w-[440px] rounded-full blur-3xl opacity-40 animate-aurora-slow"
          style={{
            background: 'radial-gradient(circle, #FFE6D5 0%, transparent 70%)',
            animationDelay: '-8s',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4">
          <Link to="/immersion">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#B8945E]/40 bg-white/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-[#8B6B3A] hover:bg-white hover:border-[#B8945E]/70 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour aux portes
            </button>
          </Link>
        </div>

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border border-[#B8945E]/40 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.3em] text-[#8B6B3A]">
            <Sparkles className="h-3 w-3" />
            Ascenseur virtuel UCA
          </span>

          <h1 className="mt-3 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#3D2817]">
            Déplacement en cours…
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-stone-700">
            La cabine virtuelle se dirige vers l&apos;étage sélectionné.
          </p>
        </div>

        <div className="mx-auto mt-7 max-w-sm">
          <div
            className="relative overflow-hidden rounded-2xl border border-[#B8945E]/40 p-5"
            style={{
              background: 'linear-gradient(180deg, #FFFAF0 0%, #FBEED9 100%)',
              boxShadow:
                '0 20px 50px -15px rgba(184, 148, 94, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 0 50px rgba(232, 198, 154, 0.15)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-16"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(232, 198, 154, 0.40) 0%, transparent 70%)',
              }}
            />

            <div
              className="relative mx-auto rounded-xl border border-[#B8945E]/50 px-5 py-4"
              style={{
                background: 'linear-gradient(180deg, #2A1F15 0%, #1A140F 100%)',
                boxShadow:
                  'inset 0 0 20px rgba(0, 0, 0, 0.8), 0 0 25px rgba(232, 198, 154, 0.35)',
              }}
            >
              <p className="text-center text-[9px] font-bold tracking-[0.4em] text-[#F5D391]/80 uppercase">
                Étage actuel
              </p>

              <div className="mt-1.5 flex items-center justify-center gap-3">
                <AnimatePresence mode="wait">
                  {direction === 'up' ? (
                    <motion.div
                      key="up"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: [0, -3, 0], opacity: 1 }}
                      transition={{ y: { duration: 1, repeat: Infinity }, opacity: { duration: 0.3 } }}
                    >
                      <ArrowUp
                        className="h-5 w-5 text-[#88D4B7]"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(136, 212, 183, 0.9))' }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="down"
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: [0, 3, 0], opacity: 1 }}
                      transition={{ y: { duration: 1, repeat: Infinity }, opacity: { duration: 0.3 } }}
                    >
                      <ArrowDown
                        className="h-5 w-5 text-[#F4AC97]"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(244, 172, 151, 0.9))' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentDisplayFloor}
                    className="font-display text-5xl font-black tabular-nums"
                    style={{
                      color: '#F5D391',
                      textShadow:
                        '0 0 20px rgba(245, 211, 145, 0.95), 0 0 40px rgba(245, 211, 145, 0.55)',
                    }}
                    initial={{ y: direction === 'up' ? 20 : -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: direction === 'up' ? -20 : 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentDisplayFloor === 0 ? 'RDC' : currentDisplayFloor}
                  </motion.p>
                </AnimatePresence>
              </div>

              <p className="mt-2.5 text-center text-[9px] font-bold tracking-[0.2em] text-[#F5D391]/70 uppercase">
                Destination : {meta.shortLabel}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              {IMMERSION_FLOORS.slice().reverse().map((f) => {
                const isPassed =
                  direction === 'up'
                    ? f.etage <= currentDisplayFloor && f.etage >= fromFloor
                    : f.etage >= currentDisplayFloor && f.etage <= fromFloor;
                const isCurrent = f.etage === currentDisplayFloor;
                return (
                  <div key={f.etage} className="flex flex-col items-center gap-1">
                    <div
                      className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                      style={{
                        background: isCurrent
                          ? '#B8945E'
                          : isPassed
                            ? 'rgba(184, 148, 94, 0.55)'
                            : 'rgba(184, 148, 94, 0.20)',
                        boxShadow: isCurrent
                          ? '0 0 10px rgba(184, 148, 94, 0.95), 0 0 20px rgba(184, 148, 94, 0.55)'
                          : 'none',
                        transform: isCurrent ? 'scale(1.5)' : 'scale(1)',
                      }}
                    />
                    <span
                      className="text-[7px] font-bold tabular-nums"
                      style={{
                        color: isCurrent
                          ? '#8B6B3A'
                          : isPassed
                            ? 'rgba(139, 107, 58, 0.6)'
                            : 'rgba(139, 107, 58, 0.35)',
                      }}
                    >
                      {f.etage === 0 ? 'RDC' : f.etage}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="h-1 w-full overflow-hidden rounded-full bg-[#B8945E]/15">
                <motion.div
                  className="h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #B8945E, #E8C69A, #B8945E)',
                    boxShadow: '0 0 12px rgba(184, 148, 94, 0.65)',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
              <p className="mt-1.5 text-center text-[9px] font-bold tracking-[0.2em] text-[#8B6B3A]/80 uppercase">
                Cabine en mouvement · {Math.floor(progress)}%
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-[#B8945E]/30 bg-white/60 px-3 py-2.5">
              <p className="text-center text-[9px] font-bold tracking-[0.3em] text-[#8B6B3A] uppercase">
                Destination
              </p>
              <p className="mt-0.5 text-center font-display text-xs font-bold text-[#3D2817]">
                {meta.title}
              </p>
              <p className="mt-0.5 text-center text-[10px] text-stone-600">
                {meta.subtitle}
              </p>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={toggleSound}
                className="inline-flex items-center gap-1 rounded-full border border-[#B8945E]/40 bg-white/70 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] text-[#8B6B3A] uppercase hover:border-[#B8945E]/70 hover:bg-white transition-all"
                aria-label="Activer/désactiver le son"
              >
                {soundOn ? <Volume2 className="h-2.5 w-2.5" /> : <VolumeX className="h-2.5 w-2.5" />}
                Son {soundOn ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <motion.div
            className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#8B6B3A]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="h-1 w-1 rounded-full bg-[#B8945E]" />
            <span className="font-semibold tracking-widest uppercase">Cabine synchronisée</span>
            <div className="h-1 w-1 rounded-full bg-[#B8945E]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}