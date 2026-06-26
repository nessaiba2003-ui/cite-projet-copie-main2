import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Phone,
  Lightbulb,
  FlaskConical,
  Microscope,
  Settings,
} from 'lucide-react';

const CONTACTS = [
  {
    title: 'Incubation & Entrepreneuriat',
    icon: Lightbulb,
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.30)',
    accent: '#10B981',
    items: [
      { label: 'Email', value: 'incubation@uca.ac.ma', href: 'mailto:incubation@uca.ac.ma' },
    ],
  },
  {
    title: 'Valorisation et transfert de technologie',
    icon: FlaskConical,
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    shadowColor: 'rgba(59, 130, 246, 0.30)',
    accent: '#3B82F6',
    items: [
      { label: 'Propriété Intellectuelle', value: 'cp.citeinnovation@uca.ac.ma', href: 'mailto:cp.citeinnovation@uca.ac.ma' },
      { label: 'Maturation', value: 'ctt.citeinnovation@uca.ac.ma', href: 'mailto:ctt.citeinnovation@uca.ac.ma' },
    ],
  },
  {
    title: 'Plateforme R&D et Prototypage',
    icon: Microscope,
    gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    shadowColor: 'rgba(236, 72, 153, 0.30)',
    accent: '#EC4899',
    items: [
      { label: 'Email', value: 'plateformes@uca.ac.ma', href: 'mailto:plateformes@uca.ac.ma' },
    ],
  },
  {
    title: 'Services transverses',
    icon: Settings,
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    shadowColor: 'rgba(245, 158, 11, 0.30)',
    accent: '#F59E0B',
    items: [
      { label: 'Email principal', value: 'cite_innovation_marrakech@uca.ac.ma', href: 'mailto:cite_innovation_marrakech@uca.ac.ma' },
      { label: 'Téléphone', value: '+212 524 33 15 50', href: 'tel:+212524331550', icon: Phone },
      { label: 'Adresse', value: 'Av Abdelkrim Khattabi, B.P. 511 — 40000 Marrakech', icon: MapPin },
    ],
  },
];

export default function ContactPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#E07A5F]/10 blur-3xl animate-aurora-slow" />
        <div className="absolute bottom-16 -right-24 h-72 w-72 rounded-full bg-[#9B8EC4]/10 blur-3xl animate-aurora" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F]/10 to-[#F2CC8F]/10 border border-[#E07A5F]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C96A50]">
            <Mail className="h-3 w-3" />
            Contact
          </span>
          <h1 className="mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
            Contactez nos équipes
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#F2CC8F]" />
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-stone-600">
            Nous sommes à votre disposition pour répondre à vos questions et accompagner vos
            projets innovants.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACTS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-500 hover:-translate-y-1 group"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 40px -12px ${card.shadowColor}, 0 0 0 1px ${card.shadowColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div
                  className="relative flex items-center gap-2.5 p-3.5 text-white overflow-hidden"
                  style={{ background: card.gradient }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    }}
                  />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="h-5 w-5 text-white drop-shadow" />
                  </div>
                  <h2 className="relative font-display text-sm font-extrabold leading-tight">
                    {card.title}
                  </h2>
                </div>
                <ul className="space-y-2.5 p-4">
                  {card.items.map((item) => (
                    <li key={item.label} className="flex gap-2 text-xs">
                      {item.icon ? (
                        <item.icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: card.accent }} />
                      ) : (
                        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: card.accent }} />
                      )}
                      <div>
                        <p className="font-semibold text-stone-500 text-[10px] uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-stone-800 hover:underline font-medium transition-colors text-xs"
                            onMouseEnter={(e) => { e.currentTarget.style.color = card.accent; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-stone-700 text-xs">{item.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-8 relative overflow-hidden rounded-2xl border border-stone-200/70 bg-gradient-to-br from-[#FEF4F1] to-white p-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-md shadow-[#E07A5F]/30">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-display text-base font-extrabold text-stone-900">
            Où nous trouver
          </h3>
          <p className="mt-1 text-xs text-stone-600">
            Cité de l&apos;Innovation de Marrakech — Campus universitaire,
            Université Cadi Ayyad
          </p>
        </motion.div>
      </div>
    </div>
  );
}