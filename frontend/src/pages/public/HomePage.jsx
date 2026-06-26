import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Building2, CalendarDays, Megaphone, MapPin,
  ExternalLink, Rocket, FlaskConical, Cpu, Settings, Users,
  CheckCircle2, Mail, Bookmark,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Loading from '@/components/ui/Loading';
import EventCard from '@/components/features/evenements/EventCard';

import annonceService from '@/services/annonceService';
import evenementService from '@/services/evenementService';
import localService from '@/services/localService';

import { getPageContent, formatDate } from '@/utils/helpers';
import { resolveMediaUrl } from '@/utils/media';

// ===== PALETTE STRICTE : 4 COULEURS UNIQUEMENT =====
const POLE_COLORS = {
  green:  '#16A34A',
  blue:   '#60A5FA',
  pink:   '#DB2777',
  gold:   '#D4AF37',
};

const POLE_LIGHT = {
  green:  '#4ADE80',
  blue:   '#93C5FD',
  pink:   '#F472B6',
  gold:   '#F0CF65',
};

const POLE_BRIGHT = {
  green: '#86EFAC',
  blue:  '#BFDBFE',
  pink:  '#FBCFE8',
  gold:  '#FDE68A',
};

// ===== TOUS LES LOCAUX = POLE SERVICES TRANSVERSES (Jaune doré) =====
const TRANSVERSE_COLOR = POLE_COLORS.gold;
const TRANSVERSE_COLOR_DARK = '#B8941F';
// ✅ CORRECTION : Ajout des backticks
const TRANSVERSE_GRADIENT = `linear-gradient(135deg, ${POLE_LIGHT.gold} 0%, ${POLE_COLORS.gold} 100%)`;
const TRANSVERSE_SHADOW = 'rgba(212, 175, 55, 0.35)';

// ✅ CORRECTION : Ajout des backticks
const SMOOTH_GRADIENT = `linear-gradient(135deg,
  ${POLE_COLORS.green} 0%,
  ${POLE_COLORS.blue} 33%,
  ${POLE_COLORS.pink} 66%,
  ${POLE_COLORS.gold} 100%
)`;

const POLES = [
  {
    title: 'Pôle Incubation & Entrepreneuriat',
    icon: Rocket,
    // ✅ CORRECTION : Ajout des backticks
    gradient: `linear-gradient(135deg, ${POLE_LIGHT.green} 0%, ${POLE_COLORS.green} 100%)`,
    accent: POLE_COLORS.green,
    shadowColor: 'rgba(22, 163, 74, 0.35)',
    description:
      "Accompagnement des projets innovants et soutien à la création de startups technologiques à fort potentiel de croissance et d'impact.",
    link: '/structures',
  },
  {
    title: 'Pôle Valorisation et Transfert de Technologies',
    icon: FlaskConical,
    // ✅ CORRECTION : Ajout des backticks
    gradient: `linear-gradient(135deg, ${POLE_LIGHT.blue} 0%, ${POLE_COLORS.blue} 100%)`,
    accent: POLE_COLORS.blue,
    shadowColor: 'rgba(96, 165, 250, 0.35)',
    description:
      "Valorisation des résultats de recherche et facilitation du transfert technologique vers l'industrie pour une innovation collaborative et performante.",
    link: '/structures',
  },
  {
    title: "Pôle Plateformes d'appui à la R&D et prototypage",
    icon: Cpu,
    // ✅ CORRECTION : Ajout des backticks
    gradient: `linear-gradient(135deg, ${POLE_LIGHT.pink} 0%, ${POLE_COLORS.pink} 100%)`,
    accent: POLE_COLORS.pink,
    shadowColor: 'rgba(219, 39, 119, 0.35)',
    description:
      "Services d'analyse et de caractérisation, d'imagerie, de simulation, de modélisation et de prototypage pour accompagner vos projets de R&D.",
    link: '/structures',
  },
  {
    title: 'Pôle Services Transverses',
    icon: Settings,
    // ✅ CORRECTION : Ajout des backticks
    gradient: `linear-gradient(135deg, ${POLE_LIGHT.gold} 0%, ${POLE_COLORS.gold} 100%)`,
    accent: POLE_COLORS.gold,
    shadowColor: 'rgba(212, 175, 55, 0.35)',
    description:
      "Services supports pour l'ensemble des activités de la Cité de l'innovation : gestion de projet, propriété intellectuelle, formation et expertise.",
    link: '/structures',
  },
];

const WORKFLOW_STEPS = [
  { num: '01', title: 'Choisissez votre espace',       subtitle: 'Labos, Coworking, Salles de réunion…', icon: Building2,    color: POLE_COLORS.green, light: POLE_LIGHT.green },
  { num: '02', title: 'Sélectionnez vos équipements',  subtitle: 'Fibre, Projecteurs, Matériel R&D',     icon: Settings,     color: POLE_COLORS.blue,  light: POLE_LIGHT.blue  },
  { num: '03', title: 'Validation administrative',     subtitle: 'Notification e-mail en temps réel',    icon: CheckCircle2, color: POLE_COLORS.pink,  light: POLE_LIGHT.pink  },
  { num: '04', title: 'Accès confirmé',                subtitle: 'Email + rappel automatique',           icon: Mail,         color: POLE_COLORS.gold,  light: POLE_LIGHT.gold  },
];

const PRIORITY_COLORS = {
  IMPORTANT: 'bg-red-50 text-red-700 border-red-200',
  NORMAL:    'bg-amber-50 text-amber-700 border-amber-200',
  INFO:      'bg-stone-100 text-stone-600 border-stone-200',
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

// ✅ CORRECTION : Ajout des backticks pour le backgroundImage
const auroraTextStyle = {
  backgroundImage: `linear-gradient(110deg, ${POLE_COLORS.green} 0%, ${POLE_COLORS.blue} 33%, ${POLE_COLORS.pink} 66%, ${POLE_COLORS.gold} 100%)`,
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  filter: 'drop-shadow(0 2px 10px rgba(219, 39, 119, 0.25)) drop-shadow(0 0 20px rgba(96, 165, 250, 0.20))',
  animation: 'auroraShift 8s ease-in-out infinite',
};

export default function HomePage() {
  const [annonces, setAnnonces] = useState([]);
  const [events, setEvents] = useState([]);
  const [locaux, setLocaux] = useState([]);
  const [stats, setStats] = useState({ locaux: 0, events: 0, annonces: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      annonceService.getPage(0, 3),
      evenementService.getPage(0, 6),
      localService.getDisponibles(),
    ])
      .then(([annPage, evtPage, locauxData]) => {
        const ann = getPageContent(annPage);
        const evt = getPageContent(evtPage);
        const locauxList = Array.isArray(locauxData) ? locauxData : [];
        setAnnonces(ann.slice(0, 3));
        setEvents(evt);
        setLocaux(locauxList.slice(0, 6));
        setStats({ locaux: locauxList.length, events: evt.length, annonces: ann.length });
      })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Chargement de l'accueil…" />;

    //  Google Maps zoomé sur la Cité de l'Innovation (z=17 force le zoom serré)
    const mapEmbedUrl = "https://www.google.com/maps?q=Cit%C3%A9%20de%20l'Innovation%20Universit%C3%A9%20Cadi%20Ayyad%20Marrakech&hl=fr&z=17&output=embed";
    const mapsLink    = "https://www.google.com/maps?q=Cit%C3%A9%20de%20l'Innovation%20Universit%C3%A9%20Cadi%20Ayyad%20Marrakech";

    return (
    <div className="relative w-full overflow-x-hidden">
      <style>{`
        @keyframes auroraShift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        @keyframes auroraGlow {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.12); }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section
        className="relative w-full overflow-hidden flex items-center py-8 lg:py-0"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/back.jpeg')" }}
          aria-hidden
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,250,245,0.25) 50%, rgba(245,250,255,0.35) 100%)',
          }}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {/* ✅ CORRECTION : Backticks ajoutés sur tous les radial-gradients ci-dessous */}
          <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${POLE_LIGHT.green} 0%, transparent 70%)`, opacity: 0.70, animation: 'auroraGlow 10s ease-in-out infinite' }} />
          <div className="absolute top-1/4 -right-32 h-[520px] w-[520px] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${POLE_LIGHT.blue} 0%, transparent 70%)`, opacity: 0.65, animation: 'auroraGlow 12s ease-in-out infinite', animationDelay: '-3s' }} />
          <div className="absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${POLE_LIGHT.pink} 0%, transparent 70%)`, opacity: 0.68, animation: 'auroraGlow 14s ease-in-out infinite', animationDelay: '-6s' }} />
          <div className="absolute top-1/2 left-1/4 h-[420px] w-[420px] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${POLE_LIGHT.gold} 0%, transparent 70%)`, opacity: 0.60, animation: 'auroraGlow 11s ease-in-out infinite', animationDelay: '-9s' }} />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] items-center">
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.h1
                className="font-display font-extrabold tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span
                  style={{
                    color: '#FFFFFF',
                    textShadow: '0 2px 12px rgba(219, 39, 119, 0.55), 0 4px 24px rgba(96, 165, 250, 0.45), 0 0 40px rgba(255,255,255,0.35)',
                  }}
                >
                  Bienvenue sur
                </span>

                <span
                  className="block mt-1"
                  style={{
                    color: '#FFD1E8',
                    textShadow: '0 2px 14px rgba(219, 39, 119, 0.70), 0 4px 28px rgba(244, 114, 182, 0.55), 0 0 50px rgba(255,209,232,0.45)',
                  }}
                >
                  Cité d&apos;Innovation
                </span>

                <span
                  className="block mt-0.5 text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold"
                  style={{
                    color: '#FFFFFF',
                    textShadow: '0 2px 12px rgba(96, 165, 250, 0.60), 0 4px 24px rgba(212, 175, 55, 0.45), 0 0 35px rgba(255,255,255,0.40)',
                  }}
                >
                  UCA
                </span>
              </motion.h1>

              <motion.div
                className="mt-4 max-w-lg mx-auto lg:mx-0 space-y-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <p
                  className="text-sm sm:text-base font-semibold"
                  style={{
                    color: '#1A1A2E',
                    textShadow: '0 1px 8px rgba(255,255,255,0.95), 0 2px 16px rgba(255,255,255,0.7)',
                  }}
                >
                  <span
                    className="font-bold"
                    style={{ color: '#FFFFFF', textShadow: '0 1px 10px rgba(219, 39, 119, 0.85), 0 0 18px rgba(219, 39, 119, 0.5)' }}
                  >
                    Réservez
                  </span>
                  {' '}vos espaces.{' '}
                  <span
                    className="font-bold"
                    style={{ color: '#FFFFFF', textShadow: '0 1px 10px rgba(22, 163, 74, 0.85), 0 0 18px rgba(22, 163, 74, 0.5)' }}
                  >
                    Inscrivez-vous
                  </span>
                  {' '}aux événements.
                </p>
                {/* ✅ MODIFICATION TEXTE : Plus orienté Innovation */}
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{
                    color: '#2A2A3E',
                    textShadow: '0 1px 6px rgba(255,255,255,0.95), 0 2px 12px rgba(255,255,255,0.6)',
                  }}
                >
                  Un écosystème dédié aux <span className="font-bold text-white">projets innovants</span>, aux
                  <span className="font-bold text-white"> hackathons</span> et aux collaborations à fort impact.
                  Réservez vos espaces et rejoignez la dynamique entrepreneuriale de l'UCA.
                </p>
              </motion.div>

              <motion.div
                className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link to="/locaux">
                  <button
                    type="button"
                    className="group inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: POLE_COLORS.pink,
                      boxShadow: '0 10px 25px -5px rgba(219, 39, 119, 0.40)',
                    }}
                  >
                    <Building2 className="h-4 w-4" />
                    Réserver un espace
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>

                <Link to="/evenements">
                  <button
                    type="button"
                    className="group inline-flex items-center gap-1.5 rounded-full border-2 bg-white/80 backdrop-blur-md px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-white hover:-translate-y-0.5"
                    style={{
                      borderColor: POLE_COLORS.blue,
                      color: POLE_COLORS.blue,
                      // ✅ CORRECTION : Backticks ajoutés
                      boxShadow: `0 8px 20px -4px ${POLE_COLORS.blue}30`,
                    }}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Voir les événements
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>
              </motion.div>

              <motion.div
                className="mt-6 grid grid-cols-3 gap-3 sm:gap-6 max-w-sm mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                {[
                  { label: 'Pôles',          value: 4,     bright: POLE_BRIGHT.green, glow: 'rgba(134, 239, 172, 0.8)' },
                  { label: 'Espaces',        value: '12+', bright: POLE_BRIGHT.blue,  glow: 'rgba(191, 219, 254, 0.8)' },
                  { label: 'Événements/an',  value: '50+', bright: POLE_BRIGHT.pink,  glow: 'rgba(251, 207, 232, 0.8)' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div
                      className="font-display text-2xl sm:text-3xl font-extrabold"
                      style={{
                        color: '#FFFFFF',
                        // ✅ CORRECTION : Backticks ajoutés
                        textShadow: `0 0 12px ${stat.glow}, 0 2px 8px rgba(0,0,0,0.45), 0 4px 18px rgba(0,0,0,0.30), 0 0 30px ${stat.glow}`,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="mt-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                      style={{
                        color: stat.bright,
                        textShadow: '0 1px 6px rgba(0,0,0,0.55), 0 2px 14px rgba(0,0,0,0.40)',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="md:block w-full max-w-sm mx-auto lg:mx-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div
                className="relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl p-4"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(252,252,255,0.94) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  boxShadow: '0 25px 60px -15px rgba(219, 39, 119, 0.30), 0 0 80px rgba(96, 165, 250, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                }}
              >
                {/* ✅ CORRECTION : Backticks ajoutés sur les radials ci-dessous */}
                <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-50"
                  style={{ background: `radial-gradient(circle, ${POLE_LIGHT.green} 0%, transparent 70%)` }} />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-2xl opacity-45"
                  style={{ background: `radial-gradient(circle, ${POLE_LIGHT.pink} 0%, transparent 70%)` }} />
                <div className="pointer-events-none absolute top-1/2 -right-12 h-20 w-20 rounded-full blur-2xl opacity-40"
                  style={{ background: `radial-gradient(circle, ${POLE_LIGHT.gold} 0%, transparent 70%)` }} />

                <div className="relative flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-sm font-extrabold" style={auroraTextStyle}>
                      Workflow de Réservation
                    </h3>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-600">
                      Processus simplifié &amp; sécurisé
                    </p>
                  </div>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 shadow-sm"
                    // ✅ CORRECTION : Backticks ajoutés
                    style={{ background: `${POLE_COLORS.blue}20`, border: `1px solid ${POLE_COLORS.blue}40` }}
                  >
                    <Bookmark className="h-3.5 w-3.5" style={{ color: POLE_COLORS.blue }} />
                  </div>
                </div>

                <div className="relative space-y-2">
                  {WORKFLOW_STEPS.map((s, idx) => (
                    <motion.div
                      key={s.num}
                      className="relative overflow-hidden flex items-start gap-2.5 rounded-xl bg-white/80 backdrop-blur-sm p-2 hover:bg-white hover:shadow-md transition-all"
                      // ✅ CORRECTION : Backticks ajoutés
                      style={{ border: `1px solid ${s.color}30` }}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                      <div
                        className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl"
                        style={{ background: `radial-gradient(circle, ${s.light} 0%, transparent 70%)`, opacity: 0.55 }}
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute -bottom-5 -left-5 h-16 w-16 rounded-full blur-2xl"
                        style={{ background: `radial-gradient(circle, ${s.light} 0%, transparent 70%)`, opacity: 0.35 }}
                        aria-hidden
                      />

                      <div
                        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 shadow-sm"
                        // ✅ CORRECTION : Backticks ajoutés
                        style={{ borderColor: s.color, background: `${s.color}20` }}
                      >
                        <span className="font-display text-[11px] font-extrabold" style={{ color: s.color }}>
                          {s.num}
                        </span>
                      </div>
                      <div className="relative min-w-0 flex-1">
                        <p className="text-[11px] font-bold leading-tight text-stone-900">{s.title}</p>
                        <p className="mt-0.5 text-[9px] leading-snug text-stone-600">{s.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div
                  className="relative mt-3 flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                  // ✅ CORRECTION : Backticks ajoutés
                  style={{ background: `${POLE_COLORS.blue}10`, border: `1px solid ${POLE_COLORS.blue}30` }}
                >
                  <MapPin className="h-3 w-3 shrink-0" style={{ color: POLE_COLORS.blue }} />
                  <p className="text-[9px] font-semibold text-stone-700">
                    Réservation 100% gratuite · Validation admin sous 24h
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-3 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="h-6 w-3.5 rounded-full border-2 flex items-start justify-center p-0.5"
                style={{ borderColor: POLE_COLORS.pink }}>
                <div className="h-1 w-0.5 rounded-full animate-pulse" style={{ background: POLE_COLORS.pink }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ 4 PÔLES ============ */}
      <section className="relative w-full py-14 sm:py-16 bg-[#F5F7FA]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {/* ✅ CORRECTION : Backticks ajoutés */}
          <div className="absolute top-16 left-10 h-56 w-56 rounded-full blur-3xl" style={{ background: `${POLE_COLORS.green}15` }} />
          <div className="absolute bottom-16 right-10 h-56 w-56 rounded-full blur-3xl" style={{ background: `${POLE_COLORS.pink}15` }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-8 text-center" {...fadeUp}>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                // ✅ CORRECTION : Backticks ajoutés
                background: `${POLE_COLORS.blue}15`,
                borderColor: `${POLE_COLORS.blue}30`,
                color: POLE_COLORS.blue,
              }}
            >
              Excellence
            </span>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
              Quatre pôles d&apos;excellence
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">
              Découvrez nos pôles stratégiques dédiés à l&apos;innovation, la recherche et le
              développement technologique.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POLES.map((pole, idx) => {
              const Icon = pole.icon;
              return (
                <motion.div
                  key={pole.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group"
                >
                  <div
                    className="overflow-hidden rounded-2xl bg-white border border-stone-200/60 shadow-sm transition-all duration-500 hover:-translate-y-1.5 h-full flex flex-col"
                    onMouseEnter={(e) => {
                      // ✅ CORRECTION : Backticks ajoutés
                      e.currentTarget.style.boxShadow = `0 25px 50px -12px ${pole.shadowColor}, 0 0 0 1px ${pole.shadowColor}`;
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div
                      className="relative px-5 pt-5 pb-5 text-center text-white overflow-hidden"
                      style={{ background: pole.gradient }}
                    >
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        }}
                      />
                      <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm shadow-inner ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <Icon className="h-6 w-6 text-white drop-shadow" />
                      </div>
                      <h3 className="relative font-display text-sm font-extrabold leading-snug">
                        {pole.title}
                      </h3>
                    </div>

                    <div className="flex flex-1 flex-col px-5 py-5">
                      <p className="text-xs leading-relaxed text-stone-600 flex-1">
                        {pole.description}
                      </p>
                      <Link
                        to={pole.link}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold transition-all group/link"
                        style={{ color: pole.accent }}
                      >
                        En savoir plus
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ NOS ESPACES — TOUS EN JAUNE DORÉ ============ */}
      <section className="relative w-full py-14 sm:py-16 bg-gradient-to-b from-[#FAF6F2] to-[#F5F7FA]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {/* ✅ CORRECTION : Backticks ajoutés */}
          <div className="absolute top-32 -left-24 h-72 w-72 rounded-full blur-3xl" style={{ background: `${TRANSVERSE_COLOR}15` }} />
          <div className="absolute bottom-32 -right-24 h-72 w-72 rounded-full blur-3xl" style={{ background: `${POLE_LIGHT.gold}20` }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-8 flex flex-wrap items-end justify-between gap-3" {...fadeUp}>
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  // ✅ CORRECTION : Backticks ajoutés
                  background: `${TRANSVERSE_COLOR}15`,
                  borderColor: `${TRANSVERSE_COLOR}40`,
                  color: TRANSVERSE_COLOR_DARK,
                }}
              >
                <Building2 className="h-3 w-3" />
                Espaces disponibles
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
                Nos espaces
              </h2>
              <p className="mt-2 max-w-xl text-sm text-stone-600">
                Découvrez nos locaux et réservez en quelques clics.
              </p>
            </div>
            <Link
              to="/locaux"
              className="group inline-flex items-center gap-1 rounded-full bg-white border px-4 py-2 text-xs font-semibold transition-all"
              style={{ borderColor: `${TRANSVERSE_COLOR}50`, color: TRANSVERSE_COLOR_DARK }}
              onMouseEnter={(e) => {
                // ✅ CORRECTION : Backticks ajoutés
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${TRANSVERSE_SHADOW}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Voir tous les espaces
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {locaux.length === 0 ? (
            <div className="rounded-2xl border border-stone-200/70 bg-white p-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-stone-300 mb-2" />
              <p className="text-stone-600 font-medium text-sm">Aucun espace disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {locaux.map((l, idx) => {
                const firstImage = Array.isArray(l.images) && l.images.length > 0 ? resolveMediaUrl(l.images[0]) : null;
                const hasImage = Boolean(firstImage);

                return (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                  >
                    <div
                      className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-white h-full flex flex-col transition-all duration-500 hover:-translate-y-1"
                      onMouseEnter={(e) => {
                         // ✅ CORRECTION : Backticks ajoutés
                        e.currentTarget.style.boxShadow = `0 20px 45px -12px ${TRANSVERSE_SHADOW}, 0 0 0 1px ${TRANSVERSE_SHADOW}`;
                      }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
                    >
                      {/* Bar haut DORÉ uni */}
                      <div className="h-1.5" style={{ background: TRANSVERSE_GRADIENT }} />

                      <div
                        className="relative h-40 overflow-hidden bg-stone-100"
                        // ✅ CORRECTION : Backticks ajoutés
                        style={!hasImage ? { background: `${TRANSVERSE_COLOR}15` } : {}}
                      >
                        {hasImage ? (
                          <>
                            <img
                              src={firstImage}
                              alt={l.nom}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div
                              className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)' }}
                            />
                            {Array.isArray(l.images) && l.images.length > 1 && (
                              <div className="absolute bottom-2.5 left-2.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 px-2 py-0.5 text-[9px] font-bold text-white">
                                  <Building2 className="h-2.5 w-2.5" />
                                  {l.images.length} photos
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div
                              className="absolute inset-0 opacity-40"
                              style={{
                                backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)',
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                                style={{
                                  background: TRANSVERSE_GRADIENT,
                                  // ✅ CORRECTION : Backticks ajoutés
                                  boxShadow: `0 10px 25px -5px ${TRANSVERSE_SHADOW}`,
                                }}
                              >
                                <Building2 className="h-8 w-8 text-white drop-shadow" />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Badge "TRANSVERSES" en doré */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md"
                            style={{
                              // ✅ CORRECTION : Backticks ajoutés
                              background: hasImage ? `${TRANSVERSE_COLOR}EE` : `${TRANSVERSE_COLOR}20`,
                              color: hasImage ? '#FFFFFF' : TRANSVERSE_COLOR_DARK,
                              border: hasImage ? `1px solid ${TRANSVERSE_COLOR}` : `1px solid ${TRANSVERSE_COLOR}40`,
                              textShadow: hasImage ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                            }}
                          >
                            Transverses
                          </span>
                        </div>

                        {hasImage && l.capacite != null && (
                          <div className="absolute top-2.5 left-2.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-stone-800 shadow-md">
                              <Users className="h-2.5 w-2.5" style={{ color: TRANSVERSE_COLOR_DARK }} />
                              {l.capacite} pers.
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">{l.code}</p>
                        <h3 className="mt-1 font-display text-base font-extrabold text-stone-900 leading-snug line-clamp-2">
                          {l.nom}
                        </h3>

                        <div className="mt-2.5 space-y-1 flex-1">
                          {!hasImage && l.capacite != null && (
                            <p className="flex items-center gap-1 text-xs text-stone-600">
                              <Users className="h-3.5 w-3.5" style={{ color: TRANSVERSE_COLOR_DARK }} />
                              Capacité : <span className="font-semibold text-stone-800">{l.capacite}</span>
                            </p>
                          )}
                          {l.localisation && (
                            <p className="flex items-center gap-1 text-xs text-stone-600 truncate">
                              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: TRANSVERSE_COLOR_DARK }} />
                              <span className="truncate">{l.localisation}</span>
                            </p>
                          )}
                          {hasImage && l.description && (
                            <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">{l.description}</p>
                          )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link to={`/locaux/${l.id}`} className="flex-1">
                            <button
                              type="button"
                              className="w-full inline-flex items-center justify-center gap-1 rounded-full border-2 bg-white px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                              style={{ borderColor: TRANSVERSE_COLOR, color: TRANSVERSE_COLOR_DARK }}
                            >
                              Détails
                            </button>
                          </Link>
                          <Link to={`/reservation/${l.id}`} className="flex-1">
                            <button
                              type="button"
                              className="group/btn w-full inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                              style={{
                                background: TRANSVERSE_GRADIENT,
                                // ✅ CORRECTION : Backticks ajoutés
                                boxShadow: `0 6px 15px -3px ${TRANSVERSE_SHADOW}`,
                              }}
                            >
                              Réserver
                              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.div className="mt-8 text-center sm:hidden" {...fadeUp}>
            <Link to="/locaux">
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                style={{
                  background: TRANSVERSE_GRADIENT,
                  // ✅ CORRECTION : Backticks ajoutés
                  boxShadow: `0 10px 25px -5px ${TRANSVERSE_SHADOW}`,
                }}
              >
                Découvrir tous nos espaces
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============ ANNONCES ============ */}
      <section className="relative w-full py-14 bg-gradient-to-b from-[#F5F7FA] to-[#FAF6F2]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-7 flex flex-wrap items-end justify-between gap-3" {...fadeUp}>
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                   // ✅ CORRECTION : Backticks ajoutés
                  background: `${POLE_COLORS.pink}12`,
                  borderColor: `${POLE_COLORS.pink}30`,
                  color: POLE_COLORS.pink,
                }}
              >
                <Megaphone className="h-3 w-3" />
                Actualités
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
                Dernières annonces
              </h2>
              <p className="mt-1.5 text-sm text-stone-600">Restez informé des actualités</p>
            </div>
            <Link
              to="/annonces"
              className="group inline-flex items-center gap-1 rounded-full bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = POLE_COLORS.pink;
                e.currentTarget.style.color = POLE_COLORS.pink;
                 // ✅ CORRECTION : Backticks ajoutés
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${POLE_COLORS.pink}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Tout voir
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {annonces.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div
                  className="h-full overflow-hidden rounded-xl bg-white border border-stone-200/70 shadow-sm transition-all duration-300 hover:-translate-y-1"
                  onMouseEnter={(e) => {
                     // ✅ CORRECTION : Backticks ajoutés
                    e.currentTarget.style.boxShadow = `0 20px 40px -12px ${POLE_COLORS.pink}40`;
                    e.currentTarget.style.borderColor = `${POLE_COLORS.pink}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div
                    className="h-1.5"
                    style={{
                      // ✅ CORRECTION : Backticks ajoutés
                      background: `linear-gradient(90deg, ${POLE_COLORS.pink} 0%, ${POLE_COLORS.pink} 50%, ${POLE_COLORS.gold} 50%, ${POLE_COLORS.gold} 100%)`,
                    }}
                  />
                  <div className="p-5">
                    <div className="mb-2.5 flex items-start justify-between gap-2.5">
                      <h3 className="font-display text-sm font-bold text-stone-900 line-clamp-2">{a.titre}</h3>
                      {a.priorite && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                            PRIORITY_COLORS[a.priorite] ?? PRIORITY_COLORS.INFO
                          }`}
                        >
                          {a.priorite}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-3 text-xs text-stone-600 leading-relaxed">{a.contenu}</p>
                    <p className="mt-3 text-[11px] text-stone-400 font-medium">{formatDate(a.datePublication)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {annonces.length === 0 && (
              <p className="col-span-3 text-center text-stone-400 py-6 text-sm">Aucune annonce pour le moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* ============ ÉVÉNEMENTS ============ */}
      <section className="relative w-full py-14 bg-[#FAF6F2]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-7 flex flex-wrap items-end justify-between gap-3" {...fadeUp}>
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                   // ✅ CORRECTION : Backticks ajoutés
                  background: `${POLE_COLORS.green}12`,
                  borderColor: `${POLE_COLORS.green}30`,
                  color: POLE_COLORS.green,
                }}
              >
                <CalendarDays className="h-3 w-3" />
                Agenda
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
                Événements à venir
              </h2>
              <p className="mt-1.5 text-sm text-stone-600">Découvrez et inscrivez-vous</p>
            </div>
            <Link
              to="/evenements"
              className="group inline-flex items-center gap-1 rounded-full bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = POLE_COLORS.green;
                e.currentTarget.style.color = POLE_COLORS.green;
                 // ✅ CORRECTION : Backticks ajoutés
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${POLE_COLORS.green}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Tous les événements
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory">
            {events.map((evt) => (
              <div key={evt.id} className="min-w-[240px] max-w-[280px] shrink-0 snap-start">
                <EventCard event={evt} />
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-stone-400 py-6 text-sm">Aucun événement publié pour le moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative w-full py-14 bg-[#F5F7FA]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-12 text-center"
            style={{
              background: SMOOTH_GRADIENT,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.30)',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden>
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Prêt à innover
              </span>

              <h2
                className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.35), 0 4px 24px rgba(0,0,0,0.25)' }}
              >
                Prêt à réserver votre espace ?
              </h2>
              <p
                className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-white/95"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.30)' }}
              >
                Faites une demande en ligne — validation rapide par l&apos;administration.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/locaux">
                  <button
                    type="button"
                    className="group inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-sm font-bold shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                    style={{
                      color: POLE_COLORS.blue,
                      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.30)',
                    }}
                  >
                    Accéder aux locaux
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>

                <Link to="/login">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/60 bg-white/15 backdrop-blur-md px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/25 hover:border-white transition-all"
                  >
                    Connexion
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ OÙ NOUS TROUVER ============ */}
      <section className="relative w-full py-14 bg-gradient-to-b from-[#F5F7FA] to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-8 text-center" {...fadeUp}>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                 // ✅ CORRECTION : Backticks ajoutés
                background: `${POLE_COLORS.gold}15`,
                borderColor: `${POLE_COLORS.gold}40`,
                color: POLE_COLORS.gold,
              }}
            >
              <MapPin className="h-3 w-3" />
              Localisation
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
              Où nous trouver ?
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              Localisation de la Cité de l&apos;Innovation (Marrakech).
            </p>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-500"
             // ✅ CORRECTION : Backticks ajoutés
            style={{ boxShadow: `0 20px 50px -15px ${POLE_COLORS.blue}30` }}
            {...fadeUp}
          >
            <div
              className="relative overflow-hidden flex items-start gap-3 px-5 py-5 sm:px-7"
              style={{ background: '#FFFFFF' }}
            >
               {/* ✅ CORRECTION : Backticks ajoutés sur tous les radials ci-dessous */}
              <div
                className="pointer-events-none absolute -top-20 -left-16 h-56 w-56 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${POLE_LIGHT.green} 0%, transparent 65%)`, opacity: 1 }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -top-12 left-1/4 h-60 w-60 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${POLE_LIGHT.blue} 0%, transparent 65%)`, opacity: 0.95 }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 left-1/2 h-60 w-60 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${POLE_LIGHT.pink} 0%, transparent 65%)`, opacity: 0.95 }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -top-12 -right-16 h-56 w-56 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${POLE_LIGHT.gold} 0%, transparent 65%)`, opacity: 0.95 }}
                aria-hidden
              />

              <div
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/85 backdrop-blur-md ring-1 ring-white/90 shadow-md"
                 // ✅ CORRECTION : Backticks ajoutés
                style={{ boxShadow: `0 8px 20px -5px ${POLE_COLORS.pink}40` }}
              >
                <MapPin className="h-6 w-6" style={{ color: POLE_COLORS.pink }} />
              </div>

              <div className="relative min-w-0 flex-1">
                <p
                  className="font-display text-base font-extrabold"
                  style={{ color: '#0F0F1E', textShadow: '0 1px 8px rgba(255,255,255,0.95)' }}
                >
                  Adresse
                </p>
                <p
                  className="mt-0.5 text-sm font-semibold"
                  style={{ color: '#1F1F2F', textShadow: '0 1px 6px rgba(255,255,255,0.9)' }}
                >
                  Cité de l&apos;Innovation – Université Cadi Ayyad
                </p>
                <p className="text-sm font-medium" style={{ color: '#2F2F3F', textShadow: '0 1px 6px rgba(255,255,255,0.9)' }}>
                  Avenue Abdelkrim Khattabi, BP 511
                </p>
                <p className="text-sm font-medium" style={{ color: '#2F2F3F', textShadow: '0 1px 6px rgba(255,255,255,0.9)' }}>
                  40000 Marrakech, Maroc
                </p>

                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm border px-3.5 py-1.5 text-xs font-semibold transition-all hover:bg-white hover:-translate-y-0.5"
                  style={{
                     // ✅ CORRECTION : Backticks ajoutés
                    borderColor: `${POLE_COLORS.blue}60`,
                    color: POLE_COLORS.blue,
                    boxShadow: `0 6px 18px -4px ${POLE_COLORS.blue}50`,
                  }}
                >
                  Ouvrir sur Google Maps
                  <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* ✅ Carte zoomée + interactions bloquées (impossible de dézoomer) */}
            <div className="relative h-[320px] w-full bg-stone-100 overflow-hidden">
              <iframe
                 title="Localisation - Cité d'Innovation Marrakech"
                 src={mapEmbedUrl}
                 className="h-full w-full"
                 style={{ pointerEvents: 'none' }}
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Overlay invisible qui empêche TOUTE interaction (scroll/zoom/clic) */}
               <div
                  className="absolute inset-0 cursor-default"
                  aria-hidden
                  style={{ background: 'transparent' }}
               />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}