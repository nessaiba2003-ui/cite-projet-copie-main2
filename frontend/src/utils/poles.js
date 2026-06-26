/** Charte graphique officielle — Cité de l'Innovation UCA */

export const POLE_COLORS = {
  INCUBATION: '#10B981',
  VALORISATION: '#3B82F6',
  RD: '#EC4899',
  TRANSVERSE: '#F59E0B',
  ESPACE_OUVERT: '#9B8EC4',
  RDC: '#78716C',
};

/**
 * Liste fixe des 4 pôles d'excellence (référence officielle)
 * Utilisée pour le select du formulaire local.
 */
export const POLES_FIXED = [
  {
    code: 'INCUBATION',
    nom: 'Pôle Incubation & Entrepreneuriat',
    shortName: 'Incubation & Entrepreneuriat',
    color: '#10B981',
    etage: 1,
  },
  {
    code: 'VALORISATION',
    nom: 'Pôle Valorisation & Transfert de Technologies',
    shortName: 'Valorisation & Transfert',
    color: '#3B82F6',
    etage: 2,
  },
  {
    code: 'RD',
    nom: "Pôle Plateformes d'appui à la R&D et Prototypage",
    shortName: 'R&D et Prototypage',
    color: '#EC4899',
    etage: 3,
  },
  {
    code: 'TRANSVERSE',
    nom: 'Pôle Services Transverses',
    shortName: 'Services Transverses',
    color: '#F59E0B',
    etage: 4,
  },
];

/**
 * Mapping étage → pôle (selon spec UCA)
 * Étage 0 (RDC)         → libre, pas de pôle spécifique
 * Étage 1               → Incubation & Entrepreneuriat
 * Étage 2               → Valorisation & Transfert de Technologies
 * Étage 3               → R&D et Prototypage
 * Étage 4               → Services Transverses
 * Étage 5               → Espace ouvert
 */
export const FLOOR_TO_POLE_CODE = {
  0: null,
  1: 'INCUBATION',
  2: 'VALORISATION',
  3: 'RD',
  4: 'TRANSVERSE',
  5: 'ESPACE_OUVERT',
};

export const POLE_CODE_TO_FLOOR = {
  INCUBATION: 1,
  VALORISATION: 2,
  RD: 3,
  TRANSVERSE: 4,
  ESPACE_OUVERT: 5,
};

export const FLOOR_OPTIONS = [
  { value: 0, label: 'Rez-de-chaussée (RDC)', poleCode: null, poleName: '— Libre —' },
  { value: 1, label: '1er étage', poleCode: 'INCUBATION', poleName: 'Incubation & Entrepreneuriat' },
  { value: 2, label: '2ème étage', poleCode: 'VALORISATION', poleName: 'Valorisation & Transfert de Technologies' },
  { value: 3, label: '3ème étage', poleCode: 'RD', poleName: 'R&D et Prototypage' },
  { value: 4, label: '4ème étage', poleCode: 'TRANSVERSE', poleName: 'Services Transverses' },
  { value: 5, label: '5ème étage', poleCode: 'ESPACE_OUVERT', poleName: 'Espace ouvert' },
];

export const TYPE_LOCAL_OPTIONS = [
  { value: 'SALLE_CONFERENCE', label: 'Salle de conférence' },
  { value: 'CELLULE_RD', label: 'Cellule de R&D' },
  { value: 'BUREAU_INCUBATION', label: "Bureau d'incubation" },
  { value: 'LABORATOIRE', label: "Laboratoire d'analyse" },
  { value: 'AMPHITHEATRE', label: 'Amphithéâtre' },
  { value: 'COWORKING', label: 'Espace coworking' },
  { value: 'ATELIER', label: 'Atelier' },
  { value: 'SALLE_REUNION', label: 'Salle de réunion' },
];

export const DISPOSITION_OPTIONS = [
  { value: 'U', label: 'Disposition en U' },
  { value: 'CLASSE', label: 'Style classe' },
  { value: 'THEATRE', label: 'Style théâtre' },
  { value: 'BOARDROOM', label: 'Boardroom' },
  { value: 'LIBRE', label: 'Libre / modulable' },
];

export const EQUIPEMENT_SUGGESTIONS = [
  'Vidéoprojecteur',
  'Wifi Haut Débit',
  'Tableau Interactif',
  'Chromatographe',
  'Spectroscope',
  'Microscope',
  'Imprimante 3D',
  'Visioconférence',
];

export function getPoleColor(local) {
  if (local?.poleCouleur) return local.poleCouleur;
  if (local?.poleCode && POLE_COLORS[local.poleCode]) return POLE_COLORS[local.poleCode];
  if (local?.etage != null) {
    const poleCode = FLOOR_TO_POLE_CODE[local.etage];
    if (poleCode && POLE_COLORS[poleCode]) return POLE_COLORS[poleCode];
  }
  return '#78716C';
}

export function getPoleStyles(local) {
  const color = getPoleColor(local);
  return {
    '--pole-color': color,
    borderColor: `${color}40`,
    boxShadow: `0 4px 24px ${color}18`,
  };
}

export function labelTypeLocal(value) {
  return TYPE_LOCAL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelDisposition(value) {
  return DISPOSITION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/**
 * Cherche un pôle (depuis les pôles API) qui correspond à un code de pôle fixe.
 * Retourne l'id du pôle correspondant en base.
 */
export function findApiPoleByCode(apiPoles, fixedCode) {
  if (!Array.isArray(apiPoles) || apiPoles.length === 0) return null;
  if (!fixedCode) return null;

  const namePatterns = {
    INCUBATION: ['incubation', 'entrepreneuriat'],
    VALORISATION: ['valorisation', 'transfert', 'technologie'],
    RD: ['r&d', 'r et d', 'prototypage', 'recherche', 'plateforme'],
    TRANSVERSE: ['transverse', 'transverses', 'service'],
    ESPACE_OUVERT: ['ouvert', 'espace'],
  };

  const patterns = namePatterns[fixedCode] || [];

  return (
    apiPoles.find(
      (p) =>
        p.code === fixedCode ||
        p.code === fixedCode.toLowerCase() ||
        patterns.some((pat) => (p.nom || '').toLowerCase().includes(pat)),
    ) || null
  );
}

/**
 * Trouve le code du pôle fixe à partir d'un pôle de l'API.
 */
export function findFixedCodeByApiPole(apiPole) {
  if (!apiPole) return null;
  const nameLower = (apiPole.nom || '').toLowerCase();
  const codeUpper = (apiPole.code || '').toUpperCase();

  if (codeUpper === 'INCUBATION' || nameLower.includes('incubation') || nameLower.includes('entrepreneuriat')) {
    return 'INCUBATION';
  }
  if (codeUpper === 'VALORISATION' || nameLower.includes('valorisation') || nameLower.includes('transfert')) {
    return 'VALORISATION';
  }
  if (codeUpper === 'RD' || nameLower.includes('r&d') || nameLower.includes('prototypage') || nameLower.includes('recherche')) {
    return 'RD';
  }
  if (codeUpper === 'TRANSVERSE' || nameLower.includes('transverse') || nameLower.includes('service')) {
    return 'TRANSVERSE';
  }
  return null;
}