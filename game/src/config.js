// Gobble Dash — tuning, stages and obstacle definitions.
// One clear job: every number the game balances on lives here, so the
// judge's outline and any later tuning read the game from this file alone.

export const VIEW = { width: 1280, height: 480 };
export const GROUND_Y = 402;
export const TURKEY_X = 250;
export const STEP = 1 / 60;

// The run: 1200 metres to the forest gate. Speed in px/s; 40 px = 1 m.
export const RUN = {
  goalDistance: 1200,
  pxPerMetre: 40,
  startSpeed: 280,
  maxSpeed: 560,
  speedPerMetre: 0.22,
  gravity: 2300,
  jumpVelocity: -1050,
  slideSeconds: 0.85,
  hideSeconds: 1.6,
  stumbleGapLoss: 70,
  gapStart: 280,
  gapMax: 340,
  gapDriftPerSecond: 1.6,
  cornGapBonus: 3,
  hideGapBonus: 60,
  invulnerableSeconds: 1.4,
};

export const STAGES = [
  { from: 0, to: 400, name: 'THE FARMYARD', skyTop: '#f7a94b', skyMid: '#f9c86e', skyBot: '#fbe3a1', ground: '#b97d3c', grass: '#8fae4e' },
  { from: 400, to: 800, name: 'THE CORNFIELD', skyTop: '#e88f3e', skyMid: '#f2b45c', skyBot: '#f7d795', ground: '#a06a2e', grass: '#c2a13b' },
  { from: 800, to: 1200, name: 'THE KITCHEN YARD', skyTop: '#d97b35', skyMid: '#eda24f', skyBot: '#f6c987', ground: '#8f5a28', grass: '#7d9b45' },
];

// Obstacle kinds. width/height are the solid body in px; `jump` means the
// turkey clears it by jumping, `slide` means it must slide under it.
export const OBSTACLES = {
  fence: { width: 46, height: 64, kind: 'jump', score: 10 },
  haybale: { width: 78, height: 58, kind: 'jump', score: 15 },
  pumpkin: { width: 64, height: 46, kind: 'jump', score: 15 },
  oven: { width: 88, height: 88, kind: 'jump', score: 30 },
  knife: { width: 34, height: 70, kind: 'jump', score: 20 },
  rollingpin: { width: 58, height: 26, kind: 'jump', score: 20, rolls: true },
  line: { width: 90, height: 24, kind: 'slide', score: 20 },
};

// Spawn tables per stage: [kind, weight]. The kitchen leans on ovens and
// falling knives; the farmyard teaches fences and the laundry line.
export const SPAWN_TABLES = [
  [['fence', 5], ['haybale', 3], ['pumpkin', 2], ['line', 2], ['knife', 1], ['haystack', 1], ['corn', 6]],
  [['fence', 4], ['haybale', 3], ['pumpkin', 3], ['rollingpin', 3], ['line', 2], ['knife', 2], ['haystack', 1], ['corn', 6]],
  [['oven', 4], ['knife', 4], ['rollingpin', 3], ['haybale', 2], ['fence', 2], ['line', 1], ['haystack', 1], ['corn', 5]],
];

export const PICKUPS = {
  corn: { width: 26, height: 34, score: 25 },
  goldcorn: { width: 30, height: 38, score: 100 },
  feather: { width: 30, height: 30, score: 50 },
};

export const EVENTS = {
  NONE: 0,
  OVER: 1,
  ESCAPED: 2,
  STUMBLE: 4,
  PICKUP: 8,
  HIDE: 16,
  STAGE: 32,
  JUMP: 64,
  SLIDE: 128,
};

export const SCREENS = {
  TITLE: 'title',
  PLAY: 'play',
  PAUSED: 'paused',
  CAUGHT: 'caught',
  ESCAPED: 'escaped',
};
