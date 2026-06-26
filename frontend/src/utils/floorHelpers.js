const FLOOR_LABELS = {
  0: { label: 'Rez-de-chaussée', short: 'RDC', icon: '⌂' },
  1: { label: '1er étage', short: '1', icon: '①' },
  2: { label: '2ème étage', short: '2', icon: '②' },
  3: { label: '3ème étage', short: '3', icon: '③' },
  4: { label: '4ème étage', short: '4', icon: '④' },
  5: { label: '5ème étage', short: '5', icon: '⑤' },
};

export function inferEtage(local) {
  if (local?.etage != null) {
    const e = Number(local.etage);
    if (e >= 0 && e <= 5) return e;
  }
  const loc = (local?.localisation || '').toLowerCase();
  if (loc.includes('rdc') || loc.includes('rez')) return 0;
  if (loc.includes('1er') || loc.includes('1ère')) return 1;
  if (loc.includes('2ème') || loc.includes('2eme') || loc.includes('r+2')) return 2;
  if (loc.includes('3ème') || loc.includes('3eme') || loc.includes('r+3')) return 3;
  if (loc.includes('4ème') || loc.includes('4eme') || loc.includes('r+4')) return 4;
  if (loc.includes('5ème') || loc.includes('5eme') || loc.includes('r+5')) return 5;
  return 0;
}

export function getFloorLabel(etage) {
  return FLOOR_LABELS[etage]?.label ?? `Étage ${etage}`;
}

export function getFloorShort(etage) {
  return FLOOR_LABELS[etage]?.short ?? String(etage);
}

export function groupLocauxByFloor(locaux) {
  const groups = new Map();
  for (const local of locaux) {
    const etage = inferEtage(local);
    if (!groups.has(etage)) groups.set(etage, []);
    groups.get(etage).push({ ...local, etage });
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([etage, items]) => ({ etage, label: getFloorLabel(etage), locaux: items }));
}