// Gobble Dash — the simulation: the turkey, the farmer closing in behind,
// the obstacles and pickups ahead, the three stages and the forest gate.
// Pure fixed-step logic: step(dt, input) advances one 1/60 s tick and
// returns an EVENTS bitmask. Nothing here touches the canvas or the DOM.

import { EVENTS, GROUND_Y, OBSTACLES, PICKUPS, RUN, SPAWN_TABLES, STAGES, TURKEY_X, VIEW } from './config.js';
import { makeRng, pickWeighted, range } from './rng.js';

const TURKEY_W = 62;
const TURKEY_H = 64;
const SLIDE_H = 30;
// The laundry line hangs at head height: a standing turkey hits it, a
// sliding one (30 px tall) clears it with room to spare.
const LINE_Y = GROUND_Y - 58;

export function createWorld(seed) {
  const rng = makeRng(seed);
  const state = freshState();

  function freshState() {
    return {
      seed,
      time: 0,
      distance: 0,
      score: 0,
      lives: 3,
      speed: RUN.startSpeed,
      gap: RUN.gapStart,
      stageIndex: 0,
      turkey: {
        y: GROUND_Y, vy: 0, onGround: true, sliding: false, slideT: 0,
        hidden: false, hiddenT: 0, invulnT: 0, runPhase: 0, airJumps: 0,
      },
      obstacles: [],
      pickups: [],
      particles: [],
      spawnIn: 420,
      over: null,
      banner: null,
      bannerT: 0,
      shakeT: 0,
      spottedWarned: false,
      escapedAt: 0,
    };
  }

  function stageFor(distance) {
    for (let i = 0; i < STAGES.length; i += 1) {
      if (distance >= STAGES[i].from && distance < STAGES[i].to) return i;
    }
    return STAGES.length - 1;
  }

  function spawnPickup(x, kind) {
    const def = PICKUPS[kind];
    state.pickups.push({
      kind, x,
      y: GROUND_Y - 46 - (kind === 'goldcorn' ? 70 : 0),
      width: def.width, height: def.height, taken: false, bob: rng() * 6.28,
    });
  }

  function spawnObstacle() {
    const table = SPAWN_TABLES[state.stageIndex];
    const kind = pickWeighted(rng, table);
    const x = VIEW.width + 80;
    if (kind === 'corn') {
      // A little trail of corn to chase, sometimes with a golden cob.
      const n = 3 + Math.floor(rng() * 3);
      for (let i = 0; i < n; i += 1) spawnPickup(x + i * 44, i === n - 1 && rng() < 0.3 ? 'goldcorn' : 'corn');
      if (rng() < 0.22) spawnPickup(x + n * 44 + 30, 'feather');
      state.spawnIn = range(rng, 300, 460);
      return;
    }
    if (kind === 'haystack') {
      state.obstacles.push({ kind, x, y: GROUND_Y - 66, width: 96, height: 66, hit: false });
      state.spawnIn = range(rng, 420, 620);
      return;
    }
    const def = OBSTACLES[kind];
    if (kind === 'knife') {
      // A carving knife drops from the sky onto a marked spot: the shadow
      // and glint warn the turkey to keep moving.
      state.obstacles.push({
        kind, x: x + range(rng, 0, 120), y: -90, width: def.width, height: def.height,
        vy: 0, falling: true, stuckT: 0, hit: false,
      });
    } else if (kind === 'rollingpin') {
      state.obstacles.push({
        kind, x, y: GROUND_Y - def.height, width: def.width, height: def.height,
        vx: -130, roll: 0, hit: false,
      });
    } else if (kind === 'line') {
      state.obstacles.push({
        kind, x, y: LINE_Y, width: def.width, height: def.height, hit: false,
      });
    } else {
      state.obstacles.push({
        kind, x, y: GROUND_Y - def.height, width: def.width, height: def.height, hit: false,
      });
    }
    // A haystack to hide in appears now and then between dangers.
    if (rng() < 0.16) {
      state.obstacles.push({ kind: 'haystack', x: x + 260, y: GROUND_Y - 66, width: 96, height: 66, hit: false });
    }
    state.spawnIn = range(rng, 520, 760) * (RUN.startSpeed / state.speed + 0.6);
  }

  function burst(x, y, color, n, power) {
    for (let i = 0; i < n; i += 1) {
      state.particles.push({
        x, y,
        vx: range(rng, -power, power * 0.4),
        vy: range(rng, -power, -20),
        life: range(rng, 0.3, 0.7), max: 0.7,
        size: range(rng, 3, 8), color,
      });
    }
  }

  function turkeyBox() {
    const t = state.turkey;
    const h = t.sliding ? SLIDE_H : TURKEY_H;
    return { x: TURKEY_X - 8, y: t.y - h, width: TURKEY_W, height: h };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function stumble(obstacle) {
    obstacle.hit = true;
    state.lives -= 1;
    state.gap = Math.max(0, state.gap - RUN.stumbleGapLoss);
    state.turkey.invulnT = RUN.invulnerableSeconds;
    state.shakeT = 0.35;
    burst(TURKEY_X + 30, state.turkey.y - 30, '#e8b34b', 14, 220);
    burst(TURKEY_X + 30, state.turkey.y - 30, '#fff3d6', 8, 140);
    if (state.lives <= 0 || state.gap <= 0) {
      state.over = 'caught';
      return EVENTS.STUMBLE | EVENTS.OVER;
    }
    return EVENTS.STUMBLE;
  }

  function step(dt, input) {
    if (state.over) return EVENTS.NONE;
    let events = EVENTS.NONE;
    const t = state.turkey;
    state.time += dt;

    // Speed and stage grow with distance.
    state.speed = Math.min(RUN.maxSpeed, RUN.startSpeed + state.distance * RUN.speedPerMetre);
    const stage = stageFor(state.distance);
    if (stage !== state.stageIndex) {
      state.stageIndex = stage;
      state.banner = STAGES[stage].name;
      state.bannerT = 2.2;
      events |= EVENTS.STAGE;
    }
    if (state.bannerT > 0) state.bannerT -= dt;
    if (state.shakeT > 0) state.shakeT -= dt;

    // The farmer gains slowly; clean running and corn push him back.
    state.gap = Math.min(RUN.gapMax, state.gap + (5 - RUN.gapDriftPerSecond) * dt);
    if (state.gap <= 0) {
      state.over = 'caught';
      return EVENTS.OVER;
    }

    // v2: the farmer is close enough to spot the turkey. Warn once —
    // sound + banner + red frame — until the turkey pulls away again.
    // (gap 140 is two stumbles from the start; the HUD meter turns red
    // at 90, so the warning comes first.)
    if (state.gap <= 140 && !state.spottedWarned) {
      state.spottedWarned = true;
      state.banner = 'SPOTTED! RUN!';
      state.bannerT = 1.6;
      events |= EVENTS.SPOTTED;
    } else if (state.gap > 200) {
      state.spottedWarned = false;
    }

    // Jump / double jump / slide / hide. One mid-air jump per leap lets
    // the turkey clear two dangers piled together.
    if (input.jump && !t.hidden && (t.onGround || t.airJumps < 1)) {
      // v4: takeoff dust — the jump finally has a visible effect (brief
      // #3: feedback when the turkey acts), matching the landing burst.
      // Fixed puffs, no rng draws, so the spawn sequence — and the
      // playtest — stay identical to v3.
      if (t.onGround) {
        const puffs = [[-14, -30, -50], [-4, -44, -70], [6, -20, -40], [16, -52, -90], [-22, -14, -30], [24, -36, -60]];
        for (const [dx, vy, vx] of puffs) {
          state.particles.push({ x: TURKEY_X + 10 + dx, y: GROUND_Y - 2, vx, vy, life: 0.45, max: 0.45, size: 5, color: '#e3d3ae' });
        }
      }
      if (!t.onGround) t.airJumps += 1;
      t.vy = RUN.jumpVelocity;
      t.onGround = false;
      t.sliding = false;
      events |= EVENTS.JUMP;
    }
    if (input.slidePressed && t.onGround && !t.hidden) {
      t.sliding = true;
      t.slideT = RUN.slideSeconds;
      events |= EVENTS.SLIDE;
    }
    if (t.sliding) {
      // A slide is a timed move: once started it runs its full length,
      // so a quick tap still clears the whole laundry line.
      t.slideT -= dt;
      if (t.slideT <= 0) t.sliding = false;
    }
    if (t.hidden) {
      t.hiddenT -= dt;
      if (t.hiddenT <= 0) t.hidden = false;
    } else if (input.slidePressed) {
      // Ducking into a haystack hides the turkey from the farmer.
      for (const ob of state.obstacles) {
        if (ob.kind === 'haystack' && Math.abs(ob.x + ob.width / 2 - (TURKEY_X + 20)) < 90) {
          t.hidden = true;
          t.hiddenT = RUN.hideSeconds;
          state.gap = Math.min(RUN.gapMax, state.gap + RUN.hideGapBonus);
          state.banner = 'HIDDEN IN THE HAY!';
          state.bannerT = 1.4;
          events |= EVENTS.HIDE;
          break;
        }
      }
    }

    // Vertical physics.
    if (!t.onGround) {
      t.vy += RUN.gravity * dt;
      t.y += t.vy * dt;
      if (t.y >= GROUND_Y) {
        t.y = GROUND_Y;
        t.vy = 0;
        t.onGround = true;
        t.airJumps = 0;
        burst(TURKEY_X + 30, GROUND_Y, '#d9c49a', 5, 90);
      }
    }
    t.runPhase += dt * (state.speed / 28);
    if (t.invulnT > 0) t.invulnT -= dt;

    // Advance the world.
    const advance = state.speed * dt;
    state.distance += advance / RUN.pxPerMetre;
    state.score += advance / RUN.pxPerMetre;
    state.spawnIn -= advance;

    if (state.distance >= RUN.goalDistance) {
      state.over = 'escaped';
      state.escapedAt = state.time;
      return events | EVENTS.ESCAPED | EVENTS.OVER;
    }

    if (state.spawnIn <= 0) spawnObstacle();

    const box = turkeyBox();
    for (const ob of state.obstacles) {
      ob.x -= advance;
      if (ob.kind === 'rollingpin') {
        ob.x += (ob.vx || 0) * dt;
        ob.roll += dt * 9;
      }
      if (ob.falling) {
        ob.vy += 2400 * dt;
        ob.y += ob.vy * dt;
        if (ob.y >= GROUND_Y - ob.height) {
          ob.y = GROUND_Y - ob.height;
          ob.falling = false;
          ob.stuckT = 1.1;
          burst(ob.x + 17, GROUND_Y, '#c8ccd4', 6, 120);
        }
      } else if (ob.stuckT !== undefined && ob.stuckT > 0) {
        ob.stuckT -= dt;
      }
      if (ob.kind === 'haystack') continue;
      if (!ob.hit && !t.hidden && t.invulnT <= 0 && overlaps(box, ob)) {
        events |= stumble(ob);
        if (state.over) return events;
      }
      if (!ob.hit && ob.x + ob.width < TURKEY_X - 10 && ob.kind !== 'haystack') {
        state.score += (OBSTACLES[ob.kind]?.score ?? 0);
        ob.hit = true;
      }
    }
    state.obstacles = state.obstacles.filter((ob) => ob.x + ob.width > -160 && (ob.stuckT === undefined || ob.stuckT > 0 || ob.x + ob.width > -40));

    for (const pk of state.pickups) {
      pk.x -= advance;
      pk.bob += dt * 6;
      if (!pk.taken && !t.hidden && overlaps(box, { x: pk.x - 8, y: pk.y - 8, width: pk.width + 16, height: pk.height + 16 })) {
        pk.taken = true;
        const def = PICKUPS[pk.kind];
        state.score += def.score;
        if (pk.kind === 'corn') state.gap = Math.min(RUN.gapMax, state.gap + RUN.cornGapBonus);
        if (pk.kind === 'feather') {
          // A life back, with its own sound and a banner — the rarest
          // pickup should read as a small victory, not plain corn.
          if (state.lives < 3) {
            state.lives += 1;
            state.banner = '+1 LIFE!';
            state.bannerT = 1.2;
          }
          events |= EVENTS.FEATHER;
        } else if (pk.kind === 'goldcorn') {
          events |= EVENTS.GOLD;
        } else {
          events |= EVENTS.PICKUP;
        }
        burst(pk.x, pk.y, pk.kind === 'goldcorn' ? '#ffd94d' : '#ffb347', 7, 110);
      }
    }
    state.pickups = state.pickups.filter((pk) => !pk.taken && pk.x > -60);

    // Dust puffs at the turkey's feet while it runs on the ground.
    if (t.onGround && !t.hidden && Math.floor(state.time * 14) !== Math.floor((state.time - dt) * 14)) {
      state.particles.push({
        x: TURKEY_X - 6, y: GROUND_Y - 2,
        vx: range(rng, -70, -30), vy: range(rng, -40, -8),
        life: 0.45, max: 0.45, size: range(rng, 3, 6), color: '#e3d3ae',
      });
    }
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);

    return events;
  }

  return {
    state,
    reset() {
      const fresh = freshState();
      Object.keys(fresh).forEach((k) => { state[k] = fresh[k]; });
    },
    step,
    turkeyBox,
    stage() { return STAGES[state.stageIndex]; },
  };
}
