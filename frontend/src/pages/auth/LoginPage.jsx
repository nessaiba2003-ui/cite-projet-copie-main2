import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';
import { APP_NAME } from '@/utils/constants';
import { getDefaultDashboardPath } from '@/utils/routes';

const STARS = Array.from({ length: 70 }).map((_, i) => {
  const seed = i * 13.37;
  return {
    id: i,
    top: (seed * 7) % 100,
    left: (seed * 11) % 100,
    size: ((seed * 3) % 3) + 1,
    delay: (seed % 5) * 0.5,
    duration: 2 + (seed % 4),
    opacity: 0.4 + (seed % 60) / 100,
    depth: ((seed * 17) % 5) + 1,
  };
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, getDashboardPath } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lampOn, setLampOn] = useState(false);
  const [particlesVisible, setParticlesVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (lampOn) {
      const t = setTimeout(() => setParticlesVisible(true), 600);
      return () => clearTimeout(t);
    } else {
      setParticlesVisible(false);
    }
  }, [lampOn]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      toast.success(`Bienvenue, ${data.nomComplet || ''} !`);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(decodeURIComponent(redirect));
      } else {
        navigate(getDefaultDashboardPath(data.role) || getDashboardPath());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden transition-all duration-[1500ms] ease-out"
      style={{
        background: lampOn
          ? 'radial-gradient(ellipse at 50% 20%, #FFF8F3 0%, #FFE6D5 25%, #F5F7FA 60%, #E7E5E4 100%)'
          : 'radial-gradient(ellipse at 50% 20%, #2A2438 0%, #1B1830 40%, #0F0C1A 100%)',
      }}
    >
      <AnimatePresence>
        {!lampOn && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            aria-hidden
          >
            {STARS.map((star) => {
              const parallaxStrength = star.depth * 8;
              const offsetX = mouse.x * parallaxStrength;
              const offsetY = mouse.y * parallaxStrength;
              return (
                <div
                  key={star.id}
                  className="absolute rounded-full bg-white animate-pulse"
                  style={{
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    animationDelay: `${star.delay}s`,
                    animationDuration: `${star.duration}s`,
                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                    transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    boxShadow: star.depth > 3 ? '0 0 4px rgba(255,255,255,0.6)' : 'none',
                  }}
                />
              );
            })}

            <motion.div
              className="absolute pointer-events-none"
              style={{
                width: '350px',
                height: '350px',
                left: `${50 + mouse.x * 25}%`,
                top: `${50 + mouse.y * 25}%`,
                transform: 'translate(-50%, -50%)',
                background:
                  'radial-gradient(circle, rgba(155, 142, 196, 0.10) 0%, rgba(155, 142, 196, 0.05) 30%, transparent 70%)',
                filter: 'blur(40px)',
                transition:
                  'left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {particlesVisible && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          >
            {Array.from({ length: 25 }).map((_, i) => {
              const seed = i * 7.7;
              const left = (seed * 11) % 100;
              const delay = (seed % 8) * 0.5;
              const duration = 8 + (seed % 6);
              const size = ((seed * 2) % 4) + 3;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${left}%`,
                    bottom: '-20px',
                    width: `${size}px`,
                    height: `${size}px`,
                    background:
                      'radial-gradient(circle, rgba(255,230,213,0.9) 0%, rgba(255,207,216,0.5) 50%, transparent 100%)',
                    boxShadow: '0 0 8px rgba(255, 207, 216, 0.6)',
                  }}
                  animate={{
                    y: [-20, -800],
                    opacity: [0, 1, 1, 0],
                    x: [0, (seed % 40) - 20, (seed % 60) - 30],
                  }}
                  transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lampOn && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            aria-hidden
          >
            <div
              className="absolute top-1/4 -left-24 h-72 w-72 rounded-full blur-3xl opacity-40 animate-aurora-slow"
              style={{ background: 'radial-gradient(circle, #FFD9C2 0%, transparent 70%)' }}
            />
            <div
              className="absolute bottom-16 -right-24 h-72 w-72 rounded-full blur-3xl opacity-40 animate-aurora"
              style={{ background: 'radial-gradient(circle, #FFCFD8 0%, transparent 70%)' }}
            />
            <div
              className="absolute bottom-32 left-1/4 h-60 w-60 rounded-full blur-3xl opacity-30 animate-aurora-slow"
              style={{
                background: 'radial-gradient(circle, #B8AAD4 0%, transparent 70%)',
                animationDelay: '-10s',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAMPE */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-20 pointer-events-none">
        <motion.div
          className="mx-auto origin-top"
          style={{ width: '2px' }}
          animate={{ rotate: lampOn ? [-1.5, 1.5, -1.5] : [-0.5, 0.5, -0.5] }}
          transition={{ duration: lampOn ? 4 : 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="mx-auto transition-colors duration-1000"
            style={{
              width: '2px',
              height: lampOn ? '90px' : '100px',
              background: lampOn
                ? 'linear-gradient(180deg, rgba(120, 113, 108, 0.6), rgba(120, 113, 108, 0.4))'
                : 'linear-gradient(180deg, rgba(120, 120, 160, 0.8), rgba(80, 80, 120, 0.6))',
            }}
          />

          <button
            type="button"
            onClick={() => setLampOn((v) => !v)}
            className="group relative -mt-1 mx-auto block cursor-pointer pointer-events-auto focus:outline-none"
            aria-label={lampOn ? 'Éteindre la lampe' : 'Allumer la lampe'}
            style={{ width: '60px', height: '75px' }}
          >
            <AnimatePresence>
              {lampOn && (
                <>
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 1 }}
                    style={{
                      width: '500px',
                      height: '500px',
                      background:
                        'radial-gradient(circle, rgba(255, 230, 180, 0.35) 0%, rgba(255, 200, 150, 0.18) 30%, transparent 70%)',
                      filter: 'blur(20px)',
                    }}
                  />
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                      scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{
                      width: '240px',
                      height: '240px',
                      background:
                        'radial-gradient(circle, rgba(255, 240, 200, 0.55) 0%, rgba(255, 220, 180, 0.25) 40%, transparent 75%)',
                      filter: 'blur(12px)',
                    }}
                  />
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!lampOn && (
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    width: '140px',
                    height: '140px',
                    background:
                      'radial-gradient(circle, rgba(155, 142, 196, 0.20) 0%, transparent 70%)',
                    filter: 'blur(15px)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-sm transition-colors duration-700"
              style={{
                width: '20px',
                height: '12px',
                background: lampOn
                  ? 'linear-gradient(180deg, #B8B0A0 0%, #8A8275 50%, #6B6457 100%)'
                  : 'linear-gradient(180deg, #6A6580 0%, #504A65 50%, #3A3550 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute inset-x-0 top-1 h-px" style={{ background: 'rgba(0,0,0,0.25)' }} />
              <div className="absolute inset-x-0 top-2.5 h-px" style={{ background: 'rgba(0,0,0,0.25)' }} />
            </div>

            <motion.div
              className="absolute left-1/2 top-2.5 -translate-x-1/2 transition-all duration-700"
              style={{
                width: '46px',
                height: '60px',
                borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%',
                background: lampOn
                  ? 'radial-gradient(ellipse at 35% 35%, rgba(255,255,240,0.98) 0%, rgba(255,235,180,0.85) 40%, rgba(255,210,140,0.6) 80%, rgba(255,190,120,0.3) 100%)'
                  : 'radial-gradient(ellipse at 35% 35%, rgba(160, 150, 180, 0.45) 0%, rgba(110, 100, 130, 0.35) 60%, rgba(70, 60, 90, 0.25) 100%)',
                boxShadow: lampOn
                  ? '0 0 35px rgba(255, 220, 150, 0.7), 0 0 70px rgba(255, 200, 130, 0.5), inset 0 -8px 18px rgba(255, 180, 100, 0.3), inset 0 4px 12px rgba(255, 255, 200, 0.5)'
                  : 'inset 0 -7px 13px rgba(0, 0, 0, 0.4), inset 0 4px 9px rgba(255, 255, 255, 0.08)',
                border: lampOn
                  ? '1px solid rgba(255, 220, 150, 0.5)'
                  : '1px solid rgba(140, 130, 160, 0.4)',
              }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.svg
                  width="18"
                  height="28"
                  viewBox="0 0 22 32"
                  style={{
                    filter: lampOn
                      ? 'drop-shadow(0 0 4px rgba(255, 200, 100, 0.9)) drop-shadow(0 0 8px rgba(255, 180, 80, 0.6))'
                      : 'none',
                  }}
                >
                  <path
                    d="M 6 4 Q 6 8, 11 12 T 16 20 Q 16 24, 11 28"
                    stroke={lampOn ? '#FFB347' : '#8A8298'}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 8 6 L 8 14 M 14 6 L 14 14"
                    stroke={lampOn ? '#FF9F40' : '#6A6280'}
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </div>
            </motion.div>

            <AnimatePresence>
              {!lampOn && (
                <motion.div
                  className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <motion.div
                    className="rounded-full border border-white/40 bg-white/15 backdrop-blur-md px-3 py-1 text-[10px] font-semibold text-white shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Cliquez pour allumer
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6 pt-40">
        <AnimatePresence mode="wait">
          {!lampOn ? (
            <motion.div
              key="off-screen"
              className="text-center max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h1
                className="font-display text-xl sm:text-2xl font-extrabold tracking-tight"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  textShadow:
                    '0 2px 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(155, 142, 196, 0.3)',
                }}
              >
                Connexion administration
              </h1>
              <p
                className="mt-3 text-xs sm:text-sm font-medium"
                style={{
                  color: 'rgba(255, 255, 255, 0.65)',
                  textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)',
                }}
              >
                Activez la lumière pour accéder au formulaire
              </p>

              <Link
                to="/"
                className="mt-8 group inline-flex items-center gap-1.5 rounded-full border-2 border-white/60 bg-white/15 backdrop-blur-md px-5 py-2 text-xs font-semibold text-white shadow-xl shadow-black/30 transition-all duration-300 hover:bg-white/25 hover:border-white hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
                style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)' }}
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                Retour à l&apos;accueil
              </Link>

              <motion.div
                className="mt-10 flex items-center justify-center gap-1.5 text-[10px]"
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="h-1 w-1 rounded-full bg-white/60" />
                <span>Déplacez votre souris pour explorer le ciel</span>
                <span className="h-1 w-1 rounded-full bg-white/60" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="on-screen"
              className="w-full max-w-sm"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            >
              <Link
                to="/"
                className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#E07A5F] hover:text-[#C96A50] hover:shadow-md hover:shadow-[#E07A5F]/15 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à l&apos;accueil
              </Link>

              <motion.div
                className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/95 backdrop-blur-xl transition-all duration-300"
                style={{
                  boxShadow:
                    '0 20px 50px -15px rgba(224, 122, 95, 0.30), 0 0 60px rgba(255, 220, 150, 0.20)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="h-1 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />

                <div className="p-6">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-lg shadow-[#E07A5F]/40">
                      <Building2 className="h-6 w-6 text-white drop-shadow" />
                    </div>
                    <h1 className="mt-3 font-display text-lg font-extrabold text-stone-900 tracking-tight">
                      {APP_NAME}
                    </h1>
                    <p className="mt-1 text-xs text-stone-600">Connexion administration</p>
                  </motion.div>

                  <motion.form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div>
                      <label
                        htmlFor="login-email"
                        className="mb-1 block text-xs font-semibold text-stone-700"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#E07A5F]" />
                        <input
                          id="login-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="cim-field w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2 text-xs text-stone-800 placeholder:text-stone-400 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                          placeholder="admin@cite-innovation.ma"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="login-password"
                        className="mb-1 block text-xs font-semibold text-stone-700"
                      >
                        Mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9B8EC4]" />
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="cim-field w-full rounded-xl border border-stone-200 bg-white pl-9 pr-9 py-2 text-xs text-stone-800 placeholder:text-stone-400 focus:border-[#E07A5F] focus:outline-none focus:ring-4 focus:ring-[#E07A5F]/15"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#E07A5F] transition-colors"
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-[#E07A5F] hover:text-[#C96A50] hover:underline transition-colors"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E07A5F]/35 transition-all duration-300 hover:shadow-xl hover:shadow-[#E07A5F]/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          Connexion…
                        </span>
                      ) : (
                        <>
                          Se connecter
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </>
                      )}
                    </button>
                  </motion.form>

                  <motion.p
                    className="mt-5 text-center text-[10px] text-stone-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Accès réservé aux administrateurs.
                  </motion.p>
                </div>
              </motion.div>

              <motion.p
                className="mt-3 text-center text-[10px] text-stone-500 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Cliquez à nouveau sur l&apos;ampoule pour éteindre la lumière
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}