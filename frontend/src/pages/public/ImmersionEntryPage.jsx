import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock, DoorOpen, Volume2, VolumeX, Sparkles, Building2, ChevronRight, ArrowLeft,
} from 'lucide-react';
import ImmersionDoor from '@/components/features/immersion/ImmersionDoor';
import { IMMERSION_FLOORS } from '@/data/immersionFloors';

function playDoorSfxModern() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.50, now);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-15, now);
    comp.knee.setValueAtTime(20, now);
    comp.ratio.setValueAtTime(3, now);

    master.connect(comp);
    comp.connect(ctx.destination);

    const delay = ctx.createDelay(0.4);
    delay.delayTime.setValueAtTime(0.10, now);
    const fb = ctx.createGain();
    fb.gain.setValueAtTime(0.28, now);
    const wet = ctx.createGain();
    wet.gain.setValueAtTime(0.35, now);

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

    const ding = (t0, freq, peak = 0.5) => {
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
      const g1 = env(t0, peak, 1.0);
      const g2 = env(t0, peak * 0.3, 0.7);
      osc1.connect(bp).connect(g1).connect(bus);
      osc2.connect(g2).connect(bus);
      osc1.start(t0);
      osc1.stop(t0 + 1.2);
      osc2.start(t0);
      osc2.stop(t0 + 1.0);
    };

    ding(now, 1318.5, 0.50);
    ding(now + 0.35, 1760, 0.45);
    ding(now + 0.70, 2093, 0.40);

    setTimeout(() => ctx.close().catch(() => {}), 2500);
  } catch {
    // no-op
  }
}

export default function ImmersionEntryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('locked');
  const [soundOn, setSoundOn] = useState(true);

  const phase = step === 'locked' ? 'closed' : step === 'opening' ? 'opening' : 'open';
  const floors = useMemo(() => IMMERSION_FLOORS, []);

  const onEnter = () => {
    if (step !== 'locked') return;
    if (soundOn) playDoorSfxModern();
    setStep('opening');
    setTimeout(() => setStep('open'), 1500);
  };

  const goToFloor = (etage) => {
    navigate(`/immersion/elevator/${etage}`);
  };

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden"
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

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to="/">
            <button
              type="button"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#B8945E]/40 bg-white/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-[#8B6B3A] hover:bg-white hover:border-[#B8945E]/70 hover:shadow-lg hover:shadow-[#E8C69A]/30 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              Retourner à l&apos;Accueil
            </button>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B8945E]/40 bg-white/70 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8B6B3A]">
            <Sparkles className="h-3 w-3" />
            Cité de l&apos;Innovation · UCA Marrakech
          </span>
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#3D2817]">
            Visite Virtuelle Immersive
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-[#E8C69A] to-[#B8945E]" />
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-stone-700">
            Accédez virtuellement à l&apos;atrium d&apos;excellence et explorez nos
            infrastructures de pointe en 3D.
          </p>
        </motion.div>

        <ImmersionDoor phase={phase}>
          {step !== 'open' ? (
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-[#E8C69A]/50 bg-gradient-to-br from-white to-[#FFF8EE] backdrop-blur-xl p-5 text-center"
              style={{
                boxShadow:
                  '0 20px 50px -15px rgba(184, 148, 94, 0.40), 0 0 50px rgba(232, 198, 154, 0.30)',
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #E8C69A 0%, #B8945E 100%)',
                  boxShadow: '0 8px 20px -5px rgba(184, 148, 94, 0.6)',
                }}
              >
                <Lock className="h-6 w-6 text-white drop-shadow" />
              </div>

              <p className="mt-3 text-[10px] font-bold tracking-[0.3em] text-[#8B6B3A] uppercase">
                Accès virtuel
              </p>
              <h2 className="mt-1.5 font-display text-base font-extrabold text-[#3D2817]">
                {step === 'opening' ? 'Ouverture des portes…' : 'Portes verrouillées'}
              </h2>
              <p className="mt-1.5 text-xs text-stone-700">
                {step === 'opening'
                  ? 'Accès autorisé. Bienvenue à la Cité d\'Innovation.'
                  : 'Cliquez pour déclencher l\'ouverture automatique.'}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundOn((s) => !s)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-stone-700 hover:border-[#E8C69A] hover:text-[#8B6B3A] hover:shadow-md transition-all"
                  aria-label="Activer/désactiver le son"
                >
                  {soundOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  Son {soundOn ? 'activé' : 'désactivé'}
                </button>
              </div>

              <button
                type="button"
                onClick={onEnter}
                disabled={step === 'opening'}
                className="group mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background:
                    step === 'opening'
                      ? 'linear-gradient(135deg, #88D4B7 0%, #5BBFA0 100%)'
                      : 'linear-gradient(135deg, #E8C69A 0%, #B8945E 100%)',
                  boxShadow:
                    step === 'opening'
                      ? '0 8px 20px -5px rgba(91, 191, 160, 0.45)'
                      : '0 8px 20px -5px rgba(184, 148, 94, 0.55)',
                }}
              >
                <DoorOpen className="h-4 w-4" />
                {step === 'opening' ? 'Ouverture en cours…' : 'Entrer dans le bâtiment'}
              </button>

              <p className="mt-3 text-[9px] text-stone-500 uppercase tracking-wider">
                Université Cadi Ayyad · Campus Cité de l&apos;Innovation
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="w-full max-w-2xl rounded-2xl border border-[#E8C69A]/50 bg-gradient-to-br from-white to-[#FFF8EE] backdrop-blur-xl p-5"
              style={{
                boxShadow:
                  '0 20px 50px -15px rgba(184, 148, 94, 0.40), 0 0 50px rgba(232, 198, 154, 0.40)',
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#88D4B7]/20 to-[#5BBFA0]/15 border border-[#5BBFA0]/30 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.3em] text-[#3D8B74]">
                  <Sparkles className="h-3 w-3" />
                  Accès accordé
                </span>
                <h2 className="mt-2 font-display text-lg font-extrabold text-[#3D2817]">
                  Choisissez un niveau
                </h2>
                <p className="mt-1.5 text-xs text-stone-700">
                  L&apos;ascenseur virtuel vous déplacera vers l&apos;étage sélectionné.
                </p>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                {floors
                  .slice()
                  .reverse()
                  .map((f, idx) => (
                    <motion.button
                      key={f.etage}
                      type="button"
                      onClick={() => goToFloor(f.etage)}
                      className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white px-3 py-3 text-left transition-all duration-300 hover:-translate-y-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(184, 148, 94, 0.7)';
                        e.currentTarget.style.boxShadow =
                          '0 12px 28px -10px rgba(184, 148, 94, 0.45), 0 0 0 1px rgba(184, 148, 94, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#E8C69A] to-[#B8945E] shadow-md shadow-[#E8C69A]/40">
                            <Building2 className="h-3.5 w-3.5 text-white" />
                          </div>
                          <p className="font-display text-sm font-extrabold text-[#8B6B3A]">
                            {f.shortLabel}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-stone-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#8B6B3A]" />
                      </div>
                      <p className="mt-2.5 text-xs font-bold text-[#3D2817]">{f.title}</p>
                      <p className="mt-0.5 text-[11px] text-stone-600 line-clamp-2">{f.subtitle}</p>
                    </motion.button>
                  ))}
              </div>
            </motion.div>
          )}
        </ImmersionDoor>
      </div>
    </div>
  );
}