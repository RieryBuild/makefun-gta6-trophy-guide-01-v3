// Vice Ledger data layer: loads the trophy file (same-origin fetch, offline-safe)
// and holds the roadmap phase definitions and the demo seed used for screenshots.
export const TROPHY_DATA_URL = 'data/trophies.json';

export const PHASES = [
  { id: 1, title: 'Phase 1 — Story First', goal: 'Chapters 1–4, the named missions and the finale — the spine of the run. Save before the last story beat.' },
  { id: 2, title: 'Phase 2 — Strangers & Partners', goal: 'Eight stranger strands plus the two partner trophies — do the partner pair while partners are still around.' },
  { id: 3, title: 'Phase 3 — Activities & Skills', goal: 'Nine activity types, the shooting range, races, fishing, bowling and the rest — the skill grind.' },
  { id: 4, title: 'Phase 4 — Collectibles & Map', goal: 'Cards, WAiNK spots, vehicles, garages and all 52 areas of Leonida — one long road trip.' },
  { id: 5, title: 'Phase 5 — Crime Cleanup & Platinum', goal: 'Vaults, trucks, gangs, laundering and the 100% completion gold — then the platinum pops by itself.' },
];

// Demo seed for screenshots: 13 earned (11 story + 2 activities), in-memory only.
export const DEMO_EARNED_IDS = [
  'just-like-paradise', 'paradise-lost', 't-ass-drug-money', 'vice-city-baby',
  'top-of-the-world-ma', 'trust', 'break-the-bank', 'family-matters', 'dwnfall',
  'hi-jacked', 'snow-storm', 'stick-fiddler', 'baited-my-tackle',
];

export const KIND_LABELS = {
  all: 'All', story: 'Story', missable: 'Missable', collectible: 'Collectibles',
  activity: 'Activities', stranger: 'Strangers', crime: 'Crime', misc: 'Misc',
  completion: 'Completion', platinum: 'Platinum',
};

export const KIND_FILTERS = ['all', 'story', 'missable', 'collectible', 'activity', 'stranger', 'crime', 'misc'];

export async function loadTrophyData() {
  const response = await fetch(TROPHY_DATA_URL);
  if (!response.ok) throw new Error('Could not load ' + TROPHY_DATA_URL);
  return response.json();
}

// Groups every citation by its source page, for the source matrix.
export function buildSourceMatrix(trophies) {
  const byKey = new Map();
  for (const trophy of trophies) {
    for (const source of trophy.sources) {
      const key = source.site + ' — ' + source.page;
      if (!byKey.has(key)) {
        byKey.set(key, { site: source.site, page: source.page, date: source.date, covers: new Set(), count: 0 });
      }
      const row = byKey.get(key);
      // Matrix shows the base cover only (text before any "; count …" suffix),
      // so near-duplicate cover lines collapse into one readable cell.
      row.covers.add(source.covers.split(';')[0].trim());
      row.count += 1;
    }
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count);
}

export function countCitations(trophies) {
  return trophies.reduce((sum, trophy) => sum + trophy.sources.length, 0);
}
