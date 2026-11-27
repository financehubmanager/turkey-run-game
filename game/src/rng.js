// Gobble Dash — a tiny seeded random generator (mulberry32) so the world,
// the screenshots and any replay of a run are reproducible from one seed.

export function makeRng(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickWeighted(rng, table) {
  let total = 0;
  for (let i = 0; i < table.length; i += 1) total += table[i][1];
  let roll = rng() * total;
  for (let i = 0; i < table.length; i += 1) {
    roll -= table[i][1];
    if (roll <= 0) return table[i][0];
  }
  return table[table.length - 1][0];
}

export function range(rng, min, max) {
  return min + rng() * (max - min);
}

export function intRange(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
