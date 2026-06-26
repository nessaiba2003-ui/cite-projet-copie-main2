import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ_DATA = [
  {
    question: "Comment réserver un espace de recherche ou un laboratoire ?",
    answer: "Parcourez l'onglet 'Structures', choisissez le laboratoire approprié (ex: Lab de Robotique, Biotech, Clusters GPU), puis cliquez sur 'Réserver maintenant'. Complétez le formulaire avec vos identifiants institutionnels (@uca.ma / @uca.ac.ma), déterminez le créneau horaire désiré et sélectionnez d'éventuels équipements de pointe requis."
  },
  {
    question: "Quels sont les critères et les délais d'approbation d'accès ?",
    answer: "L'accès est réservé aux chercheurs, doctorants et startups incubées. Les demandes sont généralement traitées sous 48h ouvrables par le comité de gestion de la Cité."
  },
  {
    question: "Qu'est-ce que la classification par Pôle (Incubation, Valorisation, etc.) ?",
    answer: "La Cité est divisée en pôles thématiques pour faciliter la synergie. Le Pôle Incubation accueille les startups, le Pôle Recherche les laboratoires académiques, et le Pôle Valorisation sert d'interface avec l'industrie."
  },
  {
    question: "Qui peut accéder à la salle des serveurs GPU NVIDIA H100 ?",
    answer: "Seuls les projets validés ayant un besoin démontré en calcul haute performance (HPC) et ayant suivi la formation de sécurité obligatoire peuvent accéder à cette zone sécurisée."
  },
  {
    question: "Comment contacter le support technique ?",
    answer: "Vous pouvez utiliser le chatbot InnoBot pour les questions fréquentes, ou envoyer un email à support@cite-innovation.uca.ma pour les incidents techniques."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#E07A5F]/10 blur-3xl animate-aurora-slow" />
        <div className="absolute bottom-16 -right-24 h-72 w-72 rounded-full bg-[#9B8EC4]/10 blur-3xl animate-aurora" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-lg shadow-[#E07A5F]/30 mb-3">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
            Foire Aux Questions
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#F2CC8F]" />
          <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Trouvez rapidement des réponses sur le fonctionnement de la Cité d&apos;Innovation.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((item, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                openIndex === index
                  ? 'border-[#E07A5F]/40 bg-[#FEF4F1]/40 shadow-md shadow-[#E07A5F]/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors"
              >
                <span
                  className={`font-semibold text-xs sm:text-sm ${
                    openIndex === index ? 'text-[#C96A50]' : 'text-stone-800'
                  }`}
                >
                  {item.question}
                </span>
                <span
                  className={`ml-3 shrink-0 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
                    openIndex === index
                      ? 'bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] text-white shadow-md'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {openIndex === index ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-4 pt-0 border-t border-[#E07A5F]/15 mt-1">
                  <p className="text-xs text-stone-600 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}