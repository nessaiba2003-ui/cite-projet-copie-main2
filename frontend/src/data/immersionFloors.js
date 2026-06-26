export const IMMERSION_FLOORS = [
  {
    etage: 0,
    shortLabel: 'RDC',
    title: 'Rez-de-chaussée (RDC)',
    subtitle: "Pôle d’accueil, espaces communs et salles principales.",
  },
  {
    etage: 1,
    shortLabel: 'N1',
    title: 'Premier Étage (Niveau 1)',
    subtitle: 'Incubation, startups et espaces de travail.',
  },
  {
    etage: 2,
    shortLabel: 'N2',
    title: 'Deuxième Étage (Niveau 2)',
    subtitle: 'Espaces collaboratifs, design et ateliers.',
  },
  {
    etage: 3,
    shortLabel: 'N3',
    title: 'Troisième Étage (Niveau 3)',
    subtitle: 'Unités de recherche et laboratoires.',
  },
  {
    etage: 4,
    shortLabel: 'N4',
    title: 'Quatrième Étage (Niveau 4)',
    subtitle: 'Calcul & innovation, plateformes techniques.',
  },
  {
    etage: 5,
    shortLabel: 'N5',
    title: 'Cinquième Étage (Niveau 5)',
    subtitle: 'Espaces avancés et salles spécialisées.',
  },
];

export function getFloorMeta(etage) {
  const n = Number(etage);
  return IMMERSION_FLOORS.find((f) => f.etage === n) ?? IMMERSION_FLOORS[0];
}