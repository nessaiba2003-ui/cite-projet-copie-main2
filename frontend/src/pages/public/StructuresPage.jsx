import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Sparkles,
  Rocket,
  FlaskConical,
  Cpu,
  Settings,
} from 'lucide-react';

const POLES = [
  {
    code: 'INCUBATION',
    nom: 'Incubation & Entrepreneuriat',
    icon: Rocket,
    description:
      'Accompagnement des projets innovants et création de startups à fort impact.',
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    accent: '#10B981',
    shadowColor: 'rgba(16, 185, 129, 0.30)',
    cellules: ['Compétences entrepreneuriales', 'Création de startups'],
  },
  {
    code: 'VALORISATION',
    nom: 'Valorisation & Transfert de Technologies',
    icon: FlaskConical,
    description:
      'Détection, protection et valorisation des résultats de recherche universitaire.',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    accent: '#3B82F6',
    shadowColor: 'rgba(59, 130, 246, 0.30)',
    cellules: ['Propriété intellectuelle', 'Maturation & Transfert'],
  },
  {
    code: 'RD',
    nom: "Plateformes d'Appui à la R&D et Prototypage",
    icon: Cpu,
    description:
      'Analyses, imagerie, simulation et prototypage pour vos projets de recherche.',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    accent: '#EC4899',
    shadowColor: 'rgba(236, 72, 153, 0.30)',
    cellules: ['Chromatographie', 'Spectroscopie', 'Imagerie avancée', 'Prototypage'],
  },
  {
    code: 'TRANSVERSE',
    nom: 'Services Transverses',
    icon: Settings,
    description:
      'Gestion administrative, communication, partenariats et événements de la Cité.',
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    accent: '#F59E0B',
    shadowColor: 'rgba(245, 158, 11, 0.30)',
    cellules: ['Administration & logistique', 'Communication & partenariat'],
  },
];

export default function StructuresPage() {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#F5F7FA]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-60 w-60 rounded-full bg-[#E07A5F]/8 blur-3xl animate-aurora-slow" />
        <div className="absolute bottom-16 -right-24 h-60 w-60 rounded-full bg-[#5BBFA0]/8 blur-3xl animate-aurora" />
        <div
          className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-[#9B8EC4]/8 blur-3xl animate-aurora-slow"
          style={{ animationDelay: '-12s' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F]/10 to-[#F2CC8F]/10 border border-[#E07A5F]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C96A50]">
            <Sparkles className="h-3 w-3" />
            Excellence
          </span>
          <h1 className="mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
            Nos structures
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-14 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#F2CC8F]" />
          <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-stone-600">
            Quatre pôles complémentaires au service de l&apos;innovation à l&apos;Université Cadi Ayyad.
          </p>
        </motion.div>

        {/* GRID 4 POLES — compactes (LOGO SUPPRIMÉ) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POLES.map((pole, i) => {
            const Icon = pole.icon;
            return (
              <motion.article
                key={pole.code}
                className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-500 hover:-translate-y-1 flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 16px 36px -12px ${pole.shadowColor}, 0 0 0 1px ${pole.shadowColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div
                  className="relative px-3 pt-4 pb-3 text-center text-white overflow-hidden"
                  style={{ background: pole.gradient }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    }}
                  />
                  <div className="relative mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/25 backdrop-blur-sm shadow-inner ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="h-4 w-4 text-white drop-shadow" />
                  </div>
                  <h2 className="relative font-display text-[11px] font-extrabold leading-tight min-h-[2.2rem] flex items-center justify-center">
                    {pole.nom}
                  </h2>
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <p className="text-[11px] leading-relaxed text-stone-600 flex-1">
                    {pole.description}
                  </p>

                  <ul className="mt-2.5 space-y-1">
                    {pole.cellules.map((c) => (
                      <li key={c} className="flex items-center gap-1.5 text-[11px] text-stone-700">
                        <span
                          className="h-1 w-1 rounded-full shrink-0"
                          style={{ background: pole.accent }}
                        />
                        <span className="truncate">{c}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={`/locaux?pole=${pole.code}`} className="mt-3 block">
                    <button
                      type="button"
                      className="group/btn w-full inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: pole.gradient,
                        boxShadow: `0 5px 12px -3px ${pole.shadowColor}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 8px 18px -4px ${pole.shadowColor}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 5px 12px -3px ${pole.shadowColor}`;
                      }}
                    >
                      <Building2 className="h-3 w-3" />
                      Voir les locaux
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                    </button>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}