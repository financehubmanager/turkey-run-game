// Gobble Dash — every pixel the player sees, drawn with the canvas 2D API:
// the autumn farm in three stages, the turkey and the farmer, the hazards,
// the HUD and the title / pause / caught / escaped screens. No image files.

import { GROUND_Y, RUN, STAGES, TURKEY_X, VIEW } from './config.js';

const W = VIEW.width;
const H = VIEW.height;

export const BUTTONS = {
  title: { start: { x: 490, y: 356, width: 300, height: 64 } },
  caught: { restart: { x: 490, y: 340, width: 300, height: 64 } },
  escaped: { restart: { x: 490, y: 340, width: 300, height: 64 } },
  paused: { resume: { x: 490, y: 300, width: 300, height: 64 } },
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold', font = 'Georgia') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function drawCloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ellipse(ctx, x, y, 42 * s, 20 * s);
  ellipse(ctx, x + 30 * s, y + 4 * s, 34 * s, 16 * s);
  ellipse(ctx, x - 32 * s, y + 5 * s, 30 * s, 14 * s);
}

function drawBackground(ctx, state, t) {
  const stage = STAGES[state.stageIndex];
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, stage.skyTop);
  grad.addColorStop(0.55, stage.skyMid);
  grad.addColorStop(1, stage.skyBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);

  // Low autumn sun and drifting clouds.
  ctx.fillStyle = '#fff2c4';
  ellipse(ctx, 1080, 84, 46, 46);
  ctx.fillStyle = '#ffdf8a';
  ellipse(ctx, 1080, 84, 58, 58);
  ctx.fillStyle = '#fff2c4';
  ellipse(ctx, 1080, 84, 46, 46);
  const scroll = state.distance * RUN.pxPerMetre * 0.12;
  for (let i = 0; i < 4; i += 1) {
    const cx = ((i * 340 - scroll) % 1400 + 1400) % 1400 - 60;
    drawCloud(ctx, cx, 56 + (i % 2) * 34, 0.8 + (i % 3) * 0.25, 'rgba(255,244,214,0.85)');
  }

  // Parallax silhouettes per stage.
  const far = state.distance * RUN.pxPerMetre * 0.25;
  ctx.fillStyle = 'rgba(122,74,32,0.35)';
  if (state.stageIndex === 0) {
    // Barn and windmill on the farmyard horizon.
    const bx = 900 - (far % 1500);
    ctx.fillRect(bx, 300, 150, 102);
    ctx.beginPath();
    ctx.moveTo(bx - 12, 300); ctx.lineTo(bx + 75, 238); ctx.lineTo(bx + 162, 300); ctx.closePath(); ctx.fill();
    ctx.fillRect(bx + 62, 330, 26, 72);
    const wx = 240 - (far % 1500);
    // Tower with a cap roof, and four tapered blades that read as a
    // windmill even at a glance: wide at the tip, narrow at the hub,
    // with a lattice spar and a tail vane behind the hub.
    ctx.fillRect(wx, 260, 10, 142);
    ctx.beginPath();
    ctx.moveTo(wx - 4, 262); ctx.lineTo(wx + 5, 238); ctx.lineTo(wx + 14, 262); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 4; i += 1) {
      const a = t * 0.4 + (i * Math.PI) / 2;
      ctx.save();
      ctx.translate(wx + 5, 250);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.lineTo(11, -58); ctx.lineTo(-11, -58);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(122,74,32,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -56); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, -30); ctx.lineTo(8, -30); ctx.stroke();
      ctx.restore();
    }
    // Hub cap and tail vane.
    ctx.beginPath(); ctx.arc(wx + 5, 250, 6, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(wx + 5, 250);
    ctx.rotate(-0.5);
    ctx.fillRect(8, -4, 34, 8);
    ctx.beginPath(); ctx.moveTo(42, -12); ctx.lineTo(42, 12); ctx.lineTo(56, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (state.stageIndex === 1) {
    // Corn rows marching to the horizon.
    for (let i = 0; i < 26; i += 1) {
      const cx = ((i * 97 - far * 1.4) % 1400 + 1400) % 1400 - 40;
      const hgt = 66 + (i % 3) * 14;
      ctx.fillRect(cx, GROUND_Y - hgt, 7, hgt);
      ellipse(ctx, cx + 3, GROUND_Y - hgt - 8, 16, 10);
    }
  } else {
    // The farmhouse kitchen: warm windows, chimney smoke, hanging pots.
    const hx = 760 - (far % 1500);
    ctx.fillRect(hx, 250, 260, 152);
    ctx.beginPath();
    ctx.moveTo(hx - 16, 250); ctx.lineTo(hx + 130, 196); ctx.lineTo(hx + 276, 250); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(hx + 40, 292, 44, 52);
    ctx.fillRect(hx + 160, 292, 44, 52);
    ctx.fillStyle = 'rgba(122,74,32,0.35)';
    ctx.fillRect(hx + 200, 180, 26, 60);
    drawCloud(ctx, hx + 213, 150 + Math.sin(t * 0.7) * 4, 0.7, 'rgba(255,244,214,0.7)');
  }

  // Rolling hills.
  ctx.fillStyle = 'rgba(139,94,43,0.5)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 80) {
    ctx.lineTo(x, GROUND_Y - 26 - Math.sin((x + state.distance * 8) * 0.004) * 14);
  }
  ctx.lineTo(W, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Ground and grass tufts scrolling by.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, W, 10);
  const near = state.distance * RUN.pxPerMetre;
  ctx.fillStyle = 'rgba(90,60,20,0.5)';
  for (let i = 0; i < 30; i += 1) {
    const gx = ((i * 173 - near) % 1400 + 1400) % 1400 - 40;
    ctx.beginPath();
    ctx.moveTo(gx, GROUND_Y + 12);
    ctx.lineTo(gx + 4, GROUND_Y + 2);
    ctx.lineTo(gx + 8, GROUND_Y + 12);
    ctx.closePath();
    ctx.fill();
  }

  // The forest gate appears as the turkey nears 1500 m.
  const gateAhead = (RUN.goalDistance - state.distance) * RUN.pxPerMetre;
  if (gateAhead < W + 200 && gateAhead > -200) {
    const gx = TURKEY_X + gateAhead;
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(gx - 90, GROUND_Y - 190, 22, 190);
    ctx.fillRect(gx + 68, GROUND_Y - 190, 22, 190);
    ctx.fillStyle = '#7a4d22';
    ctx.fillRect(gx - 100, GROUND_Y - 196, 200, 26);
    ctx.fillStyle = '#2f6b2f';
    ellipse(ctx, gx - 96, GROUND_Y - 200, 46, 30);
    ellipse(ctx, gx + 96, GROUND_Y - 200, 46, 30);
    text(ctx, 'FOREST GATE', gx, GROUND_Y - 214, 20, '#fff8e6', 'center');
  }
}

function drawTurkey(ctx, state, t) {
  const tk = state.turkey;
  if (tk.hidden) return;
  const phase = tk.runPhase;
  const blink = Math.sin(phase * 2) * 3;
  const legSwing = tk.onGround ? Math.sin(phase) * 14 : 8;
  const bodyY = tk.y - (tk.sliding ? 26 : 46) + (tk.onGround ? Math.abs(Math.sin(phase)) * -2 : 0);
  const alpha = tk.invulnT > 0 && Math.floor(t * 12) % 2 === 0 ? 0.45 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(TURKEY_X, bodyY);

  // Tail fan: five autumn feathers fanning behind.
  const tailColors = ['#b3402a', '#d97b2f', '#e8b34b', '#a83a24', '#c96a1e'];
  for (let i = 0; i < 5; i += 1) {
    const a = -0.5 + i * 0.42;
    ctx.save();
    ctx.rotate(a - 1.1);
    ctx.fillStyle = tailColors[i];
    ctx.beginPath();
    ctx.ellipse(-30, -14, 26, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6d789';
    ctx.beginPath();
    ctx.ellipse(-46, -14, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Legs, animated while running.
  ctx.strokeStyle = '#e8862e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const legY = tk.sliding ? 18 : 40;
  ctx.beginPath();
  ctx.moveTo(-6, 18); ctx.lineTo(-6 + legSwing, legY); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 18); ctx.lineTo(10 - legSwing, legY); ctx.stroke();

  // Body, wing and head.
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 0, 0, 34, 26);
  ctx.fillStyle = '#6f4520';
  ellipse(ctx, 2, -4, 20, 13);
  ctx.fillStyle = '#a06a35';
  ctx.beginPath();
  ctx.ellipse(26, -22, 13, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Beak, wattle, eye.
  ctx.fillStyle = '#f08c1e';
  ctx.beginPath();
  ctx.moveTo(36, -26); ctx.lineTo(50, -21); ctx.lineTo(36, -17); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d63a2f';
  ctx.beginPath();
  ctx.ellipse(33, -13, 5, 9, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1410';
  ctx.beginPath();
  ctx.arc(29, -26, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(30, -27, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void blink;
}

function drawFarmer(ctx, state, t) {
  const gap = state.gap;
  const fx = TURKEY_X - gap - 58;
  if (fx < -110 || state.turkey.hidden) return;
  const phase = t * 11;
  const legSwing = Math.sin(phase) * 12;
  ctx.save();
  ctx.translate(fx, GROUND_Y);
  // Legs and overalls.
  ctx.strokeStyle = '#2f4d7a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -46); ctx.lineTo(-4 + legSwing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -46); ctx.lineTo(10 - legSwing, 0); ctx.stroke();
  ctx.fillStyle = '#c0392b';
  rr(ctx, -16, -92, 40, 48, 8); ctx.fill();
  ctx.fillStyle = '#2f4d7a';
  rr(ctx, -12, -66, 32, 24, 5); ctx.fill();
  // Arm reaching forward with the net.
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(18, -84); ctx.lineTo(44, -66); ctx.stroke();
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(56, -62, 16, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(44, -78); ctx.lineTo(68, -46);
  ctx.moveTo(68, -78); ctx.lineTo(44, -46);
  ctx.stroke();
  // Head, straw hat, angry brows.
  ctx.fillStyle = '#f2c79b';
  ellipse(ctx, 6, -104, 14, 14);
  ctx.fillStyle = '#e8c33c';
  ellipse(ctx, 6, -112, 22, 7);
  ctx.beginPath(); ctx.ellipse(6, -118, 12, 8, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#1d1410';
  ctx.fillRect(2, -110, 12, 3);
  ctx.fillRect(2, -110, 3, 3);
  ctx.restore();
}

function drawObstacle(ctx, ob, t) {
  const { kind, x, y, width: w, height: h } = ob;
  ctx.save();
  if (kind === 'fence') {
    ctx.fillStyle = '#7a4d22';
    ctx.fillRect(x, y, 6, h);
    ctx.fillRect(x + w - 6, y, 6, h);
    ctx.fillRect(x - 4, y + 8, w + 8, 8);
    ctx.fillRect(x - 4, y + 30, w + 8, 8);
  } else if (kind === 'haybale') {
    ctx.fillStyle = '#d9a441';
    rr(ctx, x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = '#a87c22';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 12, y + 6); ctx.lineTo(x + 12, y + h - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - 12, y + 6); ctx.lineTo(x + w - 12, y + h - 6); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, 22, 14, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (kind === 'pumpkin') {
    ctx.fillStyle = '#e07b1f';
    ellipse(ctx, x + w / 2, y + h / 2 + 6, w / 2, h / 2);
    ctx.fillStyle = '#c95f10';
    ellipse(ctx, x + w / 2 - 12, y + h / 2 + 6, 8, h / 2 - 4);
    ellipse(ctx, x + w / 2 + 12, y + h / 2 + 6, 8, h / 2 - 4);
    ctx.fillStyle = '#3f7a2e';
    ctx.fillRect(x + w / 2 - 3, y - 6, 6, 12);
  } else if (kind === 'oven') {
    ctx.fillStyle = '#4a4a52';
    rr(ctx, x, y, w, h, 8); ctx.fill();
    ctx.fillStyle = '#2c2c32';
    rr(ctx, x + 10, y + 12, w - 20, 34, 5); ctx.fill();
    // Fire glow inside the oven mouth.
    const flick = 0.7 + Math.sin(t * 9 + x) * 0.3;
    ctx.fillStyle = `rgba(255,${Math.floor(120 + flick * 60)},20,${0.75 + flick * 0.25})`;
    rr(ctx, x + 16, y + 18, w - 32, 22, 4); ctx.fill();
    ctx.fillStyle = '#ff7b1c';
    ctx.beginPath();
    ctx.moveTo(x + 26, y + 40); ctx.lineTo(x + 40, y + 18); ctx.lineTo(x + 54, y + 40);
    ctx.moveTo(x + 56, y + 40); ctx.lineTo(x + 70, y + 20); ctx.lineTo(x + 84, y + 40);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8ccd4';
    ctx.fillRect(x + 14, y + 58, w - 28, 6);
    ctx.fillRect(x + 14, y + 72, w - 28, 6);
    text(ctx, 'HOT!', x + w / 2, y - 10, 18, '#ff5a1f', 'center');
  } else if (kind === 'knife') {
    if (ob.falling) {
      // Warning shadow on the ground where it will land.
      ctx.fillStyle = 'rgba(40,20,10,0.35)';
      ellipse(ctx, x + w / 2, GROUND_Y + 4, 26, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      text(ctx, '!', x + w / 2, GROUND_Y - 8, 26, '#d63a2f', 'center');
    }
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(ob.falling ? 0.5 : 0.15);
    // Handle at the top, blade tapering to a point at the bottom:
    // a falling carving knife, tip first — not a paper plane.
    ctx.fillStyle = '#4a2c14';
    rr(ctx, -6, -38, 12, 18, 3); ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.arc(0, -33, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -27, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c8ccd4';
    ctx.fillRect(-6, -21, 12, 3);
    ctx.fillStyle = '#e8ecf2';
    ctx.beginPath();
    ctx.moveTo(-7, -18);
    ctx.lineTo(7, -18);
    ctx.quadraticCurveTo(5, 12, 0, 36);
    ctx.quadraticCurveTo(-5, 12, -7, -18);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#9aa2b0';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, -14); ctx.lineTo(-1, 26); ctx.stroke();
    ctx.restore();
  } else if (kind === 'rollingpin') {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(ob.roll || 0);
    ctx.fillStyle = '#c89b62';
    rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill();
    ctx.fillStyle = '#8a6d3b';
    ctx.fillRect(-w / 2 - 8, -4, 8, 8);
    ctx.fillRect(w / 2, -4, 8, 8);
    ctx.restore();
  } else if (kind === 'line') {
    // Laundry line at head height: slide under it.
    ctx.strokeStyle = '#5d3a1a';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x - 6, y + 4); ctx.lineTo(x + w + 6, y + 4); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 6, 18, 14);
    ctx.fillStyle = '#e2543e';
    ctx.fillRect(x + 32, y + 6, 18, 16);
    ctx.fillStyle = '#3e7ac2';
    ctx.fillRect(x + 58, y + 6, 18, 13);
    text(ctx, 'DUCK!', x + w / 2, y - 8, 16, '#fff', 'center');
  } else if (kind === 'haystack') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w / 2, y - 26, x + w, y + h);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#a87c22';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 14 + i * 20, y + h - 8);
      ctx.lineTo(x + 20 + i * 20, y + 14);
      ctx.stroke();
    }
    // Dark outline so the label reads against the bright autumn sky.
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(60,32,8,0.85)';
    ctx.strokeText('HIDE! ↓', x + w / 2, y - 10);
    text(ctx, 'HIDE! ↓', x + w / 2, y - 10, 15, '#fff8e6', 'center');
  }
  ctx.restore();
}

function drawPickup(ctx, pk) {
  const bob = Math.sin(pk.bob) * 3;
  ctx.save();
  ctx.translate(pk.x, pk.y + bob);
  if (pk.kind === 'corn') {
    ctx.fillStyle = '#f7c948';
    ellipse(ctx, 0, 0, 11, 15);
    ctx.fillStyle = '#e8a812';
    for (let i = -1; i <= 1; i += 1) ctx.fillRect(i * 6 - 1, -11, 2, 22);
    ctx.fillStyle = '#3f7a2e';
    ctx.fillRect(-3, 14, 6, 8);
  } else if (pk.kind === 'goldcorn') {
    ctx.fillStyle = '#ffd94d';
    ellipse(ctx, 0, 0, 13, 17);
    ctx.strokeStyle = '#fff3b0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 21, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#e8a812';
    for (let i = -1; i <= 1; i += 1) ctx.fillRect(i * 7 - 1, -12, 2, 24);
  } else {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 7, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, 4); ctx.lineTo(12, -6); ctx.stroke();
  }
  ctx.restore();
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ellipse(ctx, p.x, p.y, p.size, p.size * 0.8);
  }
  ctx.globalAlpha = 1;
}

function drawHud(ctx, state, best) {
  ctx.fillStyle = 'rgba(30,18,8,0.55)';
  ctx.fillRect(0, 0, W, 56);
  text(ctx, `SCORE  ${Math.floor(state.score)}`, 18, 36, 26, '#fff3d6');
  text(ctx, `BEST ${best}`, 18, 52, 13, '#e8c98a');
  // Distance progress: farmyard -> cornfield -> kitchen -> forest gate.
  const prog = Math.min(1, state.distance / RUN.goalDistance);
  const bx = 330, bw = 620, by = 20;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  rr(ctx, bx, by, bw, 14, 7); ctx.fill();
  ctx.fillStyle = '#ffb347';
  rr(ctx, bx, by, Math.max(14, bw * prog), 14, 7); ctx.fill();
  text(ctx, `${Math.floor(state.distance)} m / ${RUN.goalDistance} m  ·  ${STAGES[state.stageIndex].name}`, bx + bw / 2, 50, 14, '#fff3d6', 'center');
  // A little finish flag at the end of the bar: the 1200 m forest gate.
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(bx + bw + 10, by - 6, 3, 24);
  ctx.fillStyle = '#8fe388';
  ctx.beginPath();
  ctx.moveTo(bx + bw + 13, by - 6);
  ctx.lineTo(bx + bw + 30, by - 1);
  ctx.lineTo(bx + bw + 13, by + 4);
  ctx.closePath();
  ctx.fill();
  // Lives as feathers.
  for (let i = 0; i < 3; i += 1) {
    const lx = 1010 + i * 34;
    ctx.fillStyle = i < state.lives ? '#fff3d6' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(lx, 28, 12, 6, -0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Farmer meter: how close he is behind the turkey.
  const fw = 150;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  rr(ctx, 1090, 44, fw, 8, 4); ctx.fill();
  ctx.fillStyle = state.gap < 90 ? '#e2543e' : '#7ec850';
  rr(ctx, 1090, 44, Math.max(8, fw * (state.gap / RUN.gapMax)), 8, 4); ctx.fill();
  text(ctx, 'FARMER', 1090, 40, 12, state.gap < 90 ? '#ff9a8a' : '#fff3d6');
  text(ctx, 'SPACE jump · ↓ slide/hide · P pause', W - 16, H - 12, 13, 'rgba(255,248,230,0.75)', 'right');
}

function drawBanner(ctx, state) {
  if (!state.banner || state.bannerT <= 0) return;
  const alpha = Math.min(1, state.bannerT);
  ctx.save();
  ctx.globalAlpha = alpha;
  text(ctx, state.banner, W / 2, 130, 44, '#fff8e6', 'center');
  ctx.globalAlpha = alpha * 0.9;
  ctx.strokeStyle = '#fff8e6';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - 260, 146); ctx.lineTo(W / 2 + 260, 146); ctx.stroke();
  ctx.restore();
}

function drawButton(ctx, rect, label, sub) {
  ctx.fillStyle = '#e2543e';
  rr(ctx, rect.x, rect.y, rect.width, rect.height, 12); ctx.fill();
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 3;
  rr(ctx, rect.x, rect.y, rect.width, rect.height, 12); ctx.stroke();
  text(ctx, label, rect.x + rect.width / 2, rect.y + 40, 28, '#fff8e6', 'center');
  if (sub) text(ctx, sub, rect.x + rect.width / 2, rect.y + rect.height + 22, 14, '#fff8e6', 'center');
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(20,12,6,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawTitle(ctx, state, best) {
  drawBackground(ctx, state, 0);
  drawTurkey(ctx, { ...state, turkey: { ...state.turkey, runPhase: 0.6 } }, 0);
  drawFarmer(ctx, { ...state, gap: 420 }, 0);
  overlay(ctx, 0.45);
  text(ctx, 'GOBBLE DASH', W / 2, 108, 72, '#ffb347', 'center');
  text(ctx, '— The Great Turkey Escape —', W / 2, 148, 26, '#fff3d6', 'center');
  text(ctx, 'Thanksgiving morning. The farmer is coming with his net, the oven is', W / 2, 196, 19, '#fff8e6', 'center');
  text(ctx, 'already hot and the carving knife is out. Run, Giblet — run for the forest!', W / 2, 222, 19, '#fff8e6', 'center');
  text(ctx, 'SPACE / CLICK  jump — twice for a double jump      ↓  slide under the line, or hide in a haystack', W / 2, 268, 18, '#ffe9b0', 'center');
  text(ctx, 'Grab corn for points. Three stumbles and the farmer catches you.', W / 2, 294, 18, '#ffe9b0', 'center');
  text(ctx, 'Reach the forest gate at 1200 m to escape!', W / 2, 320, 18, '#ffe9b0', 'center');
  drawButton(ctx, BUTTONS.title.start, 'START THE RUN', 'or press SPACE');
  if (best > 0) text(ctx, `Best score: ${best}`, W / 2, 470, 16, '#e8c98a', 'center');
}

export function drawPaused(ctx, state, best) {
  drawWorld(ctx, state, state.time, best);
  overlay(ctx, 0.55);
  text(ctx, 'PAUSED', W / 2, 180, 56, '#fff3d6', 'center');
  text(ctx, 'Take a breath, Giblet. The farmer waits for no turkey.', W / 2, 224, 19, '#ffe9b0', 'center');
  drawButton(ctx, BUTTONS.paused.resume, 'RESUME', 'or press P');
}

export function drawCaught(ctx, state, best) {
  drawWorld(ctx, state, state.time, best);
  overlay(ctx, 0.6);
  text(ctx, 'CAUGHT!', W / 2, 150, 68, '#ff7a5c', 'center');
  text(ctx, `The farmer got Giblet at ${Math.floor(state.distance)} m — the oven was already warm.`, W / 2, 200, 20, '#fff8e6', 'center');
  text(ctx, `Score ${Math.floor(state.score)}   ·   Best ${best}`, W / 2, 240, 20, '#ffe9b0', 'center');
  text(ctx, 'The forest gate was so close. One more run?', W / 2, 282, 18, '#fff8e6', 'center');
  drawButton(ctx, BUTTONS.caught.restart, 'RUN AGAIN', 'or press R');
}

export function drawEscaped(ctx, state, best) {
  drawWorld(ctx, state, state.time, best);
  overlay(ctx, 0.5);
  text(ctx, 'ESCAPED!', W / 2, 150, 68, '#8fe388', 'center');
  text(ctx, 'Giblet burst through the forest gate — Thanksgiving is saved!', W / 2, 200, 20, '#fff8e6', 'center');
  text(ctx, `Score ${Math.floor(state.score)}   ·   Best ${best}`, W / 2, 240, 20, '#ffe9b0', 'center');
  text(ctx, 'The farmer is still looking under haystacks. Run it again, faster?', W / 2, 282, 18, '#fff8e6', 'center');
  drawButton(ctx, BUTTONS.escaped.restart, 'RUN AGAIN', 'or press R');
}

export function drawWorld(ctx, state, t, best) {
  ctx.save();
  if (state.shakeT > 0) {
    ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8);
  }
  drawBackground(ctx, state, t);
  for (const ob of state.obstacles) drawObstacle(ctx, ob, t);
  for (const pk of state.pickups) drawPickup(ctx, pk);
  drawFarmer(ctx, state, t);
  drawTurkey(ctx, state, t);
  drawParticles(ctx, state);
  ctx.restore();
  // Red flash while the turkey is reeling from a stumble.
  if (state.turkey.invulnT > 0.5 && Math.floor(t * 10) % 2 === 0) {
    ctx.fillStyle = 'rgba(214,58,47,0.12)';
    ctx.fillRect(0, 0, W, H);
  }
  drawHud(ctx, state, best);
  drawBanner(ctx, state);
}
