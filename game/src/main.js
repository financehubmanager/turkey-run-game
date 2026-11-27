// Gobble Dash — wiring: the fixed-step loop, the screens (title, play,
// paused, caught, escaped), the buttons, the best score and the ?shot=
// screenshot mode. The simulation lives in world.js, the drawing in
// render.js; this file only moves between them.

import { EVENTS, SCREENS, STEP, VIEW } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createWorld } from './world.js';
import { BUTTONS, drawCaught, drawEscaped, drawPaused, drawTitle, drawWorld } from './render.js';
import { stageShot } from './shots.js';

const BEST_KEY = 'gobble-dash-best';

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private mode or no storage: the best score simply does not persist.
  }
}

function inRect(point, rect) {
  return point && point.x >= rect.x && point.x <= rect.x + rect.width
    && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function main() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;

  const audio = createAudio();
  const input = createInput(canvas);
  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  const seed = Number(params.get('seed') || 1) || 1;

  let world;
  let screen;
  let best = loadBest();

  if (shotName) {
    // Screenshot mode: stage one fixed frame and draw it once. No loop,
    // no clock, no storage — the same query always renders the same bytes.
    const staged = stageShot(shotName, seed);
    world = staged.world;
    screen = staged.screen;
    if (screen === SCREENS.TITLE) drawTitle(ctx, world.state, 1250);
    else if (screen === SCREENS.CAUGHT) drawCaught(ctx, world.state, 1200);
    else if (screen === SCREENS.ESCAPED) drawEscaped(ctx, world.state, 2900);
    else drawWorld(ctx, world.state, world.state.time, 1250);
    window.GOBBLE = { screen, state: world.state, shot: shotName };
    return;
  }

  world = createWorld(1);
  screen = SCREENS.TITLE;

  function startRun() {
    world.reset();
    // A fresh run gets a fresh shuffle of the farm.
    world.state.seed = (Date.now() % 2147483647) || 1;
    screen = SCREENS.PLAY;
    audio.unlock();
    audio.gobble();
  }

  function finishRun() {
    const score = Math.floor(world.state.score);
    if (score > best) {
      best = score;
      saveBest(best);
    }
    screen = world.state.over === 'escaped' ? SCREENS.ESCAPED : SCREENS.CAUGHT;
    if (screen === SCREENS.ESCAPED) audio.escaped();
    else audio.caught();
  }

  function handleClick(point) {
    if (!point) return false;
    if (screen === SCREENS.TITLE && inRect(point, BUTTONS.title.start)) { startRun(); return true; }
    if (screen === SCREENS.CAUGHT && inRect(point, BUTTONS.caught.restart)) { startRun(); return true; }
    if (screen === SCREENS.ESCAPED && inRect(point, BUTTONS.escaped.restart)) { startRun(); return true; }
    if (screen === SCREENS.PAUSED && inRect(point, BUTTONS.paused.resume)) { screen = SCREENS.PLAY; return true; }
    return false;
  }

  let last = performance.now();
  let accumulator = 0;

  function frame(now) {
    const elapsed = Math.min(0.1, (now - last) / 1000);
    last = now;
    accumulator += elapsed;

    while (accumulator >= STEP) {
      accumulator -= STEP;
      const pressed = input.poll();
      if (pressed.mute) audio.toggleMute();
      if (pressed.click) audio.unlock();

      if (screen === SCREENS.TITLE) {
        if (pressed.start && !handleClick(pressed.click)) startRun();
      } else if (screen === SCREENS.PLAY) {
        if (pressed.pause) {
          screen = SCREENS.PAUSED;
        } else {
          const events = world.step(STEP, pressed);
          if (events & EVENTS.JUMP) audio.jump();
          if (events & EVENTS.SLIDE) audio.slide();
          if (events & EVENTS.PICKUP) audio.pickup();
          if (events & EVENTS.GOLD) audio.gold();
          if (events & EVENTS.FEATHER) audio.feather();
          if (events & EVENTS.SPOTTED) audio.spotted();
          if (events & EVENTS.STUMBLE) audio.stumble();
          if (events & EVENTS.HIDE) audio.gobble();
          if (events & EVENTS.STAGE) audio.stage();
          if (events & EVENTS.OVER) finishRun();
        }
      } else if (screen === SCREENS.PAUSED) {
        if (pressed.pause || handleClick(pressed.click)) screen = SCREENS.PLAY;
        if (pressed.restart) startRun();
      } else if (pressed.restart || handleClick(pressed.click)) {
        startRun();
      }
    }

    if (screen === SCREENS.TITLE) drawTitle(ctx, world.state, best);
    else if (screen === SCREENS.PAUSED) drawPaused(ctx, world.state, best);
    else if (screen === SCREENS.CAUGHT) drawCaught(ctx, world.state, best);
    else if (screen === SCREENS.ESCAPED) drawEscaped(ctx, world.state, best);
    else drawWorld(ctx, world.state, world.state.time, best);

    requestAnimationFrame(frame);
  }

  // Test and playtest hook: read-only state for automated checks.
  window.GOBBLE = {
    get screen() { return screen; },
    get state() { return world.state; },
    get best() { return best; },
    start: startRun,
  };

  requestAnimationFrame(frame);
}

main();
