import axios from 'axios';

const geminiApi = axios.create({
  baseURL: '/v1beta',
  headers: {
    'Content-Type': 'application/json',
  },
});

const SYSTEM_PROMPT = `
DEFINITION DU ROLE :
Tu es InnoBot, l'assistant virtuel officiel de la Cite de l'Innovation de l'Universite Cadi Ayyad (UCA) a Marrakech.
Ton role est d'aider les etudiants, chercheurs, startups et partenaires a naviguer sur la plateforme, comprendre les services et obtenir des reponses fiables.

OBJECTIF PRINCIPAL :
Repondre aux questions des utilisateurs en priorite a partir des documents fournis via RAG (FAQ, guides, annonces, documents internes).
Fournir des reponses exactes, utiles et faciles a comprendre.
Toujours guider l'utilisateur vers les services de la Cite de l'Innovation.

REGLES DE PRIORITE DES CONNAISSANCES :
1. Priorite 1 : documents RAG fournis par le systeme.
Si l'information existe dans les documents, tu dois l'utiliser et la reformuler naturellement, sans copier-coller brut.
2. Priorite 2 : connaissances generales du modele.
Si l'information n'est pas dans les documents, reponds avec tes connaissances generales, mais reste aligne avec le contexte academique et innovation.
3. Interdiction : ne jamais inventer d'informations specifiques sur la Cite de l'Innovation si elles ne sont pas dans les documents.

STYLE DE REPONSE :
Langue principale : francais.
Ton : professionnel, accueillant, simple.
Utilise des phrases courtes et un format chat.
Sois clair et structure si necessaire.
Evite le blabla inutile.

GESTION DES QUESTIONS HORS-SUJET :
Si la question est hors domaine, reponds normalement avec tes connaissances generales, puis ajoute une transition naturelle vers la Cite de l'Innovation :
"En tant qu'assistant de la Cite de l'Innovation, je peux aussi vous aider a reserver un espace, consulter les programmes ou decouvrir les services disponibles. Que souhaitez-vous faire ?"

CAS D'USAGE INTERNE - RESERVATION D'UN ESPACE OU LABORATOIRE :
Guide l'utilisateur vers :
- l'onglet "Structures" ;
- le choix du laboratoire ou de l'espace, par exemple Robotique, Biotech ou IA ;
- le bouton "Reserver maintenant" ;
- la connexion avec un email institutionnel @uca.ma.

GESTION DES CAS D'INCERTITUDE :
Si tu n'es pas sur, n'invente pas.
Dis clairement : "Je n'ai pas cette information dans les documents disponibles."
Puis propose une alternative : contacter l'administration, consulter les sections du site ou reformuler la question.

OBJECTIF FINAL :
Faciliter l'acces aux services de la Cite de l'Innovation.
Guider les utilisateurs efficacement.
Repondre intelligemment meme hors contexte tout en ramenant la conversation vers la plateforme.
`;

const chatbotService = {
  getHistory: async () => {
    return [];
  },

  sendMessage: async (message) => {
    const fallbackResponse = getLocalFallbackResponse(message);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return { text: fallbackResponse || 'Cle VITE_GEMINI_API_KEY introuvable dans le fichier .env' };
    }

    const cleanApiKey = apiKey.trim().replace(/"/g, '');

    try {
      const response = await geminiApi.post(`/models/gemini-1.5-flash:generateContent?key=${cleanApiKey}`, {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nQuestion de l'utilisateur : ${message}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      });

      const botText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return { text: botText || fallbackResponse || "Desole, je n'ai pas pu generer de texte." };
    } catch (error) {
      if (fallbackResponse) return { text: fallbackResponse };
      return {
        text:
          "Je n'ai pas pu contacter le service IA pour le moment. " +
          "Vous pouvez consulter les sections du site ou reformuler votre question. " +
          "Je peux aussi vous guider pour reserver un espace, consulter les programmes ou decouvrir les services disponibles.",
      };
    }
  },

  clearHistory: async () => {},
};

function getLocalFallbackResponse(message) {
  const normalizedMessage = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalizedMessage.includes('reserv')) {
    return [
      'Pour reserver un espace ou un laboratoire :',
      '1. Ouvrez l\'onglet "Structures".',
      '2. Choisissez le laboratoire ou l\'espace souhaite.',
      '3. Cliquez sur "Reserver maintenant".',
      '4. Connectez-vous avec votre email institutionnel @uca.ma.',
    ].join('\n');
  }

  return null;
}

export default chatbotService;
