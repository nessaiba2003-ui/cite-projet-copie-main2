import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, HelpCircle, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import annonceService from '@/services/annonceService';
import { getPageContent, formatDate } from '@/utils/helpers';
import AssistantIA from '@/components/AssistantIA';

const PRIORITY_COLORS = {
  IMPORTANT: 'bg-red-50 text-red-700 border-red-200',
  NORMAL: 'bg-amber-50 text-amber-700 border-amber-200',
  INFO: 'bg-stone-100 text-stone-600 border-stone-200',
};

const PRIORITY_ORDER = { IMPORTANT: 0, NORMAL: 1, INFO: 2 };

const FAQ_DATA = [
  {
    id: 1,
    question: "Comment réserver un espace de recherche ou laboratoire ?",
    answer: "Parcourez l'onglet 'Structures', choisissez le laboratoire approprié (ex: Lab de Robotique, Biotech, Clusters GPU), puis cliquez sur 'Réserver maintenant'. Complétez le formulaire avec vos identifiants institutionnels (@uca.ma / @uca.ac.ma), déterminez le créneau horaire désiré et sélectionnez d'éventuels équipements de pointe requis."
  },
  {
    id: 2,
    question: "Quels sont les critères et les délais d'approbation d'accès ?",
    answer: "Les demandes sont généralement validées par les responsables d'axes ou de laboratoires sous 24 à 48 heures ouvrées, en fonction de la disponibilité des équipements et de la conformité de votre projet."
  },
  {
    id: 3,
    question: "Qu'est-ce que la classification par Pôle (Incubation, Valorisation, etc.) ?",
    answer: "Elle permet d'orienter les porteurs de projet selon leur maturité : le pôle Incubation pour la création de startup, et le pôle Valorisation pour le transfert de technologie et les brevets."
  },
  {
    id: 4,
    question: "Qui peut accéder à la salle des serveurs GPU NVIDIA H100 ?",
    answer: "L'accès est réservé aux chercheurs, doctorants et partenaires industriels de l'Université Cadi Ayyad dont les projets de recherche nécessitent du calcul intensif (Deep Learning, IA) après soumission et validation du dossier technique."
  }
];

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState(1);

  useEffect(() => {
    annonceService
      .getPage(0, 50)
      .then((page) => setAnnonces(getPageContent(page)))
      .catch(() => toast.error('Impossible de charger les annonces'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = annonces;
    if (q) {
      list = list.filter(
        (a) =>
          a.titre?.toLowerCase().includes(q) ||
          a.contenu?.toLowerCase().includes(q),
      );
    }
    return [...list].sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priorite] ?? 9) - (PRIORITY_ORDER[b.priorite] ?? 9),
    );
  }, [annonces, search]);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  if (loading) return <Loading label="Chargement des données…" />;

  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#E07A5F]/10 blur-3xl animate-aurora-slow" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-[#9B8EC4]/10 blur-3xl animate-aurora" />
        <div className="absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-[#5BBFA0]/10 blur-3xl animate-aurora-slow" style={{ animationDelay: '-10s' }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F]/10 to-[#9B8EC4]/10 border border-[#E07A5F]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C96A50]">
            <Megaphone className="h-3 w-3" />
            Centre d&apos;information
          </span>
          <h1 className="mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
            FAQ, Annonces &amp; Assistance IA
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#9B8EC4]" />
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-stone-600">
            Découvrez nos actualités, notre assistance en temps réel et les détails d&apos;attribution
            d&apos;accès aux infrastructures de l&apos;UCA.
          </p>
        </div>

        {/* GRID 2 COLONNES */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          {/* COLONNE GAUCHE : FAQ */}
          <div
            className="lg:col-span-7 rounded-2xl border border-stone-200/70 bg-white p-4 transition-all duration-300"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 16px 40px -12px rgba(91, 191, 160, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5BBFA0] to-[#7DD4B8] shadow-md shadow-[#5BBFA0]/30">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-display text-sm font-extrabold text-stone-900">
                  Foire Aux Questions
                </h2>
                <p className="text-[10px] text-stone-500">Réponses aux questions fréquentes</p>
              </div>
            </div>

            <div className="space-y-2">
              {FAQ_DATA.map((item) => {
                const isOpen = openFaqId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                      isOpen
                        ? 'border-[#E07A5F]/40 bg-[#FEF4F1]/50 shadow-md shadow-[#E07A5F]/15'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(item.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2 pr-3">
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                            isOpen ? 'bg-[#E07A5F]' : 'bg-[#5BBFA0]'
                          }`}
                        />
                        <span
                          className={`text-xs sm:text-sm font-semibold ${
                            isOpen ? 'text-[#C96A50]' : 'text-stone-700'
                          }`}
                        >
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#E07A5F]' : 'text-stone-400'
                        }`}
                      />
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[400px] border-t border-[#E07A5F]/15' : 'max-h-0'
                      }`}
                    >
                      <p className="px-4 py-3 text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLONNE DROITE : ANNONCES */}
          <div
            className="lg:col-span-5 rounded-2xl border border-stone-200/70 bg-white p-4 transition-all duration-300"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 16px 40px -12px rgba(155, 142, 196, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#9B8EC4] to-[#B8AAD4] shadow-md shadow-[#9B8EC4]/30">
                  <Megaphone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-extrabold text-stone-900">
                    Annonces &amp; Actualités
                  </h2>
                  <p className="text-[10px] text-stone-500">{annonces.length} publication(s)</p>
                </div>
              </div>
              <Input
                placeholder="Filtrer les annonces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
                className="text-xs"
              />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-0.5"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 24px -8px rgba(224, 122, 95, 0.30)';
                    e.currentTarget.style.borderColor = 'rgba(224, 122, 95, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />
                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                        {a.createurNom || 'INFRASTRUCTURES'}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {formatDate(a.datePublication)}
                      </span>
                    </div>

                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-stone-900 leading-snug">
                        {a.titre}
                      </h3>
                      {a.priorite && (
                        <span
                          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            PRIORITY_COLORS[a.priorite] ?? PRIORITY_COLORS.INFO
                          }`}
                        >
                          {a.priorite}
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-3 text-[11px] text-stone-600 whitespace-pre-wrap leading-relaxed">
                      {a.contenu}
                    </p>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <p className="text-center text-xs text-stone-400 py-6 italic bg-stone-50 rounded-lg border border-dashed border-stone-200">
                  Aucune actualité trouvée.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AssistantIA />
    </div>
  );
}