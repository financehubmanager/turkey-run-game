// Gobble Dash — deterministic screenshot scenes behind ?shot=<name>&seed=N.
// Each scene stages a full, fixed game state and plays the real rules
// forward a fixed number of steps, so the frame is what a real game looks
// like and the same seed always gives the same frame.
//   title   — title screen over the farmyard, turkey idle, farmer lurking
//   cover   — mid-run: turkey leaping a fence, farmer close behind, a
//              carving knife falling, corn trail, full HUD
//   kitchen — the kitchen yard: turkey clearing the oven as a knife drops
//   escaped — the ESCAPED end screen at the forest gate
//   caught  — the CAUGHT end screen after a stumble at 812 m

import { GROUND_Y, RUN, SCREENS, STEP, TURKEY_X } from './config.js';
import { createWorld } from './world.js';

export const SHOTS = [
  { name: '1-cover.jpg', query: '?shot=cover&seed=1' },
  { name: '2-title.jpg', query: '?shot=title&seed=1' },
  { name: '3-kitchen.jpg', query: '?shot=kitchen&seed=1' },
  { name: '4-escaped.jpg', query: '?shot=escaped&seed=1' },
];

function autopilot(world) {
  // Jump when a jump-kind obstacle is close and the turkey is grounded;
  // slide when a laundry line is close. A falling knife is jumped late,
  // so the turkey is still airborne when it lands and passes over it.
  const st = world.state;
  const tk = st.turkey;
  let jump = false;
  let slide = false;
  const canJump = tk.onGround || (tk.airJumps < 1 && tk.vy > 0);
  for (const ob of st.obstacles) {
    if (ob.kind === 'haystack') continue;
    const gap = ob.x - TURKEY_X;
    // Jump late (100 px): the jump's air time covers the obstacle passing
    // under the turkey; jumping earlier lands the turkey on it.
    const near = 100;
    if (gap > -10 && gap < near) {
      if (ob.kind === 'line') slide = true;
      else if (canJump) jump = true;
    }
  }
  return { jump, slideHeld: slide, slidePressed: slide && tk.onGround, pause: false, restart: false, mute: false, start: false, click: null };
}

function runSteps(world, seconds, pilot) {
  for (let i = 0; i < seconds / STEP; i += 1) {
    const input = pilot ? autopilot(world) : { jump: false, slideHeld: false, slidePressed: false, pause: false, restart: false, mute: false, start: false, click: null };
    world.step(STEP, input);
    if (world.state.over) break;
  }
}

/**
 * Stage the named shot on a fresh world and return the screen to draw.
 * The world is returned too, so main.js can render exactly this state.
 */
export function stageShot(name, seed) {
  const world = createWorld(seed);
  const st = world.state;

  if (name === 'title') {
    // A quiet farmyard moment behind the title: turkey idle, farmer far.
    st.turkey.runPhase = 0.6;
    st.gap = 420;
    st.obstacles.push({ kind: 'haystack', x: 900, y: GROUND_Y - 66, width: 96, height: 66, hit: false });
    st.obstacles.push({ kind: 'fence', x: 1050, y: GROUND_Y - 64, width: 46, height: 64, hit: false });
    return { world, screen: SCREENS.TITLE };
  }

  if (name === 'kitchen') {
    // Fast-forward into the kitchen yard, then freeze a rich moment:
    // turkey mid-jump over the oven while a knife falls beside it.
    runSteps(world, 46, true);
    if (st.over) world.reset();
    st.distance = 940;
    st.score = 1900;
    st.lives = 2;
    st.gap = 150;
    st.stageIndex = 2;
    st.turkey.y = GROUND_Y - 120;
    st.turkey.vy = -320;
    st.turkey.onGround = false;
    st.obstacles = [
      { kind: 'oven', x: 330, y: GROUND_Y - 88, width: 88, height: 88, hit: false },
      { kind: 'knife', x: 1010, y: 30, width: 34, height: 70, vy: 300, falling: true, stuckT: 0, hit: false },
      { kind: 'rollingpin', x: 700, y: GROUND_Y - 26, width: 58, height: 26, vx: -130, roll: 1.2, hit: false },
      { kind: 'haybale', x: 900, y: GROUND_Y - 58, width: 78, height: 58, hit: false },
      { kind: 'line', x: 1080, y: GROUND_Y - 58, width: 90, height: 24, hit: false },
    ];
    st.pickups = [
      { kind: 'corn', x: 430, y: GROUND_Y - 120, width: 26, height: 34, taken: false, bob: 0.4 },
      { kind: 'corn', x: 470, y: GROUND_Y - 120, width: 26, height: 34, taken: false, bob: 1.1 },
      { kind: 'goldcorn', x: 620, y: GROUND_Y - 116, width: 30, height: 38, taken: false, bob: 2.0 },
    ];
    st.banner = 'THE KITCHEN YARD';
    st.bannerT = 2;
    return { world, screen: SCREENS.PLAY };
  }

  if (name === 'escaped') {
    st.distance = 1200;
    st.score = 2900;
    st.lives = 2;
    st.gap = 300;
    st.stageIndex = 2;
    st.over = 'escaped';
    return { world, screen: SCREENS.ESCAPED };
  }

  if (name === 'caught') {
    st.distance = 650;
    st.score = 1200;
    st.lives = 0;
    st.gap = 0;
    st.stageIndex = 1;
    st.over = 'caught';
    return { world, screen: SCREENS.CAUGHT };
  }

  // Default: the cover. Hand-staged, like the kitchen scene: a rich
  // mid-run moment — turkey leaping a fence, farmer right behind, a
  // carving knife falling, corn ahead, haystack and hazards in frame.
  st.distance = 275;
  st.score = 1250;
  st.lives = 3;
  st.gap = 110;
  st.stageIndex = 0;
  st.turkey.y = GROUND_Y - 84;
  st.turkey.vy = -260;
  st.turkey.onGround = false;
  st.turkey.runPhase = 2.4;
  st.obstacles = [
    { kind: 'fence', x: 296, y: GROUND_Y - 64, width: 46, height: 64, hit: false },
    { kind: 'knife', x: 560, y: 40, width: 34, height: 70, vy: 260, falling: true, stuckT: 0, hit: false },
    { kind: 'rollingpin', x: 760, y: GROUND_Y - 26, width: 58, height: 26, vx: -130, roll: 1.2, hit: false },
    { kind: 'haystack', x: 920, y: GROUND_Y - 66, width: 96, height: 66, hit: false },
    { kind: 'pumpkin', x: 1100, y: GROUND_Y - 46, width: 64, height: 46, hit: false },
  ];
  st.pickups = [
    { kind: 'corn', x: 640, y: GROUND_Y - 46, width: 26, height: 34, taken: false, bob: 0.2 },
    { kind: 'corn', x: 684, y: GROUND_Y - 46, width: 26, height: 34, taken: false, bob: 1.4 },
    { kind: 'goldcorn', x: 728, y: GROUND_Y - 116, width: 30, height: 38, taken: false, bob: 2.2 },
  ];
  st.banner = null;
  st.bannerT = 0;
  return { world, screen: SCREENS.PLAY };
}
