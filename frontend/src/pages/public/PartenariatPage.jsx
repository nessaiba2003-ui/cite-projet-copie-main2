import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Handshake, Rocket, GraduationCap, Building, ArrowRight, ExternalLink } from 'lucide-react';

const PARTNERSHIPS = [
  {
    icon: Rocket,
    title: 'Startups & PME',
    text: "Accédez à l'incubation, aux espaces de coworking et aux programmes d'accompagnement.",
    gradient: 'linear-gradient(135deg, #F4AC97 0%, #E07A5F 100%)',
    accent: '#E07A5F',
    shadowColor: 'rgba(224, 122, 95, 0.30)',
  },
  {
    icon: GraduationCap,
    title: 'Université & Recherche',
    text: 'Valorisez vos travaux, protégez votre propriété intellectuelle et transférez vos technologies.',
    gradient: 'linear-gradient(135deg, #88D4B7 0%, #5BBFA0 100%)',
    accent: '#5BBFA0',
    shadowColor: 'rgba(91, 191, 160, 0.30)',
  },
  {
    icon: Building,
    title: 'Institutions & Collectivités',
    text: "Co-construisez des projets territoriaux autour de l'innovation et de l'emploi.",
    gradient: 'linear-gradient(135deg, #B8AAD4 0%, #9B8EC4 100%)',
    accent: '#9B8EC4',
    shadowColor: 'rgba(155, 142, 196, 0.30)',
  },
];

/* ============ PARTENAIRES OFFICIELS UCA (issus de cim.uca.ma) ============ */
const PARTENAIRES_OFFICIELS = [
  // Institutionnels nationaux
  { name: 'Université Cadi Ayyad (UCA)', category: 'Académique', website: 'https://www.uca.ma' },
  { name: 'Ministère de l\'Enseignement Supérieur', category: 'Institutionnel', website: 'https://www.enssup.gov.ma' },
  { name: 'CNRST', category: 'Recherche', website: 'https://www.cnrst.ma' },
  { name: 'Région Marrakech-Safi', category: 'Institutionnel', website: 'https://www.regionmarrakechsafi.ma' },
  { name: 'Wilaya de Marrakech', category: 'Institutionnel', website: '' },

  // Agences nationales
  { name: 'OMPIC', category: 'Propriété Intellectuelle', website: 'https://www.ompic.ma' },
  { name: 'Maroc PME', category: 'Soutien aux PME', website: 'https://www.marocpme.gov.ma' },
  { name: 'CCG (Tamwilcom)', category: 'Financement', website: 'https://www.tamwilcom.ma' },
  { name: 'CGEM', category: 'Confédération', website: 'https://www.cgem.ma' },

  // Acteurs économiques
  { name: 'OCP Group', category: 'Industriel', website: 'https://www.ocpgroup.ma' },
  { name: 'Attijariwafa Bank', category: 'Bancaire', website: 'https://www.attijariwafabank.com' },
  { name: 'Banque Populaire', category: 'Bancaire', website: 'https://www.banquepopulaire.ma' },

  // Internationaux
  { name: 'AUF (Agence Universitaire de la Francophonie)', category: 'International', website: 'https://www.auf.org' },
  { name: 'GIZ (Coopération Allemande)', category: 'International', website: 'https://www.giz.de' },
  { name: 'Expertise France', category: 'International', website: 'https://www.expertisefrance.fr' },
  { name: 'USAID', category: 'International', website: 'https://www.usaid.gov' },
];

const CATEGORY_COLORS = {
  'Académique': { bg: '#10B981', light: '#D1FAE5' },
  'Institutionnel': { bg: '#3B82F6', light: '#DBEAFE' },
  'Recherche': { bg: '#8B5CF6', light: '#EDE9FE' },
  'Propriété Intellectuelle': { bg: '#EC4899', light: '#FCE7F3' },
  'Soutien aux PME': { bg: '#F59E0B', light: '#FEF3C7' },
  'Financement': { bg: '#06B6D4', light: '#CFFAFE' },
  'Confédération': { bg: '#84CC16', light: '#ECFCCB' },
  'Industriel': { bg: '#EF4444', light: '#FEE2E2' },
  'Bancaire': { bg: '#6366F1', light: '#E0E7FF' },
  'International': { bg: '#D4AF37', light: '#FEF3C7' },
};

export default function PartenariatPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#E07A5F]/10 blur-3xl animate-aurora-slow" />
        <div className="absolute bottom-16 -right-24 h-72 w-72 rounded-full bg-[#5BBFA0]/10 blur-3xl animate-aurora" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F]/10 to-[#F2CC8F]/10 border border-[#E07A5F]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C96A50]">
            <Handshake className="h-3 w-3" />
            Collaboration
          </span>
          <h1 className="mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
            Partenariat
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#F2CC8F]" />
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-stone-600">
            Rejoignez l&apos;écosystème d&apos;innovation de la Cité et de l&apos;Université Cadi Ayyad.
          </p>
        </motion.div>

        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-lg shadow-[#E07A5F]/30">
            <Handshake className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* 3 TYPES DE PARTENARIATS */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          {PARTNERSHIPS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-500 hover:-translate-y-1"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 40px -12px ${p.shadowColor}, 0 0 0 1px ${p.shadowColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div
                  className="relative px-4 pt-5 pb-4 text-center text-white overflow-hidden"
                  style={{ background: p.gradient }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    }}
                  />
                  <div className="relative mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="h-6 w-6 text-white drop-shadow" />
                  </div>
                  <h3 className="relative font-display text-sm font-extrabold">{p.title}</h3>
                </div>
                <div className="p-4">
                  <p className="text-xs text-stone-600 leading-relaxed">{p.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== PARTENAIRES OFFICIELS UCA ===== */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-5">
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
              Nos partenaires officiels
            </h2>
            <p className="mt-1 text-xs text-stone-600">
              Ils nous accompagnent dans notre mission d&apos;innovation
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white p-5">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {PARTENAIRES_OFFICIELS.map((partner, i) => {
                const catColor = CATEGORY_COLORS[partner.category] || { bg: '#6B7280', light: '#F3F4F6' };
                const content = (
                  <div
                    className="group h-full flex items-start gap-2.5 rounded-xl border border-stone-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = catColor.bg;
                      e.currentTarget.style.boxShadow = `0 8px 20px -8px ${catColor.bg}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div
                      className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"
                      style={{ background: catColor.bg }}
                    >
                      {partner.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 leading-tight line-clamp-2">
                        {partner.name}
                      </p>
                      <span
                        className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{
                          background: catColor.light,
                          color: catColor.bg,
                        }}
                      >
                        {partner.category}
                      </span>
                    </div>
                    {partner.website && (
                      <ExternalLink className="h-3 w-3 text-stone-400 shrink-0 mt-1 group-hover:text-stone-600 transition-colors" />
                    )}
                  </div>
                );

                return partner.website ? (
                  <motion.a
                    key={partner.name}
                    href={partner.website}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {content}
                  </motion.a>
                ) : (
                  <motion.div
                    key={partner.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {content}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="relative overflow-hidden rounded-2xl px-6 py-10 text-center"
          style={{
            background: 'linear-gradient(135deg, #E07A5F 0%, #E8956F 50%, #F2CC8F 100%)',
            boxShadow: '0 20px 50px -15px rgba(224, 122, 95, 0.45)',
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#5BBFA0]/30 blur-3xl" />
          </div>

          <div className="relative">
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-white drop-shadow-md">
              Devenez partenaire
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/95">
              Contactez l&apos;équipe des services transverses pour explorer une
              collaboration sur mesure.
            </p>
            <Link to="/contact" className="mt-5 inline-block">
              <button
                type="button"
                className="group inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#C96A50] shadow-xl shadow-black/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Nous contacter
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}