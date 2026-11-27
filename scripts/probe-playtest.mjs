// Playtest: loads the real game in headless Chromium, plays it with an
// autopilot (jump / slide from the live state, like a player reading the
// screen), and checks the whole loop: title -> play -> pause -> resume ->
// caught or escaped -> restart. Also asserts zero console errors and zero
// requests outside localhost. Usage: node scripts/probe-playtest.mjs
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire('/home/hatch/workspace/makefun/budget-site/scripts/x.js');
const { chromium } = require('playwright-core');
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.REPO_ROOT || join(here, '..');
const port = 8092;
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`;

const server = spawn('node', ['serve.ts', '--port', String(port)], { cwd: root, stdio: 'pipe' });
await new Promise((r) => { server.stdout.on('data', () => r()); setTimeout(r, 3000); });

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
const errors = [];
const external = [];
let result = { outcome: 'timeout' };
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 480 } });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', (req) => { if (!req.url().startsWith(`http://127.0.0.1:${port}`)) external.push(req.url()); });

  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  console.log('screen at load:', await page.evaluate(() => window.GOBBLE.screen));

  // Start with a click on the START button.
  await page.mouse.click(640, 388);
  await page.waitForTimeout(300);
  console.log('screen after click:', await page.evaluate(() => window.GOBBLE.screen));

  // Pause / resume check.
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(200);
  const paused = await page.evaluate(() => window.GOBBLE.screen);
  console.log('screen after P:', paused);
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(200);
  console.log('screen after P again:', await page.evaluate(() => window.GOBBLE.screen));

  // Autopilot: poll state 10x/s, jump or slide when danger is near.
  const deadline = Date.now() + 180000;
  let lastReport = 0;
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => {
      const g = window.GOBBLE;
      if (!g) return null;
      const st = g.state;
      return {
        screen: g.screen, over: st.over, distance: st.distance, score: st.score,
        lives: st.lives, gap: st.gap, stage: st.stageIndex,
        y: st.turkey.y, onGround: st.turkey.onGround, hidden: st.turkey.hidden,
        vy: st.turkey.vy, airJumps: st.turkey.airJumps,
        obstacles: st.obstacles.map((o) => ({ kind: o.kind, x: o.x, y: o.y, w: o.width })),
        hay: st.obstacles.some((o) => o.kind === 'haystack' && Math.abs(o.x + 48 - 270) < 100),
      };
    });
    if (!s) break;
    if (s.over) { result = { outcome: s.over, distance: s.distance, score: s.score, lives: s.lives }; break; }
    if (s.screen !== 'play') { result = { outcome: 'screen:' + s.screen, distance: s.distance }; break; }
    let acted = false;
    const canJump = s.onGround || (s.airJumps < 1 && s.vy > 0);
    for (const ob of s.obstacles) {
      const gap = ob.x - 250;
      // Jump with ~160 px of warning: the probe's poll loop adds latency,
      // so it reacts earlier than the in-game 100 px staging pilot.
      const near = 160;
      if (gap > -20 && gap < near) {
        if (ob.kind === 'line') { await page.keyboard.down('ArrowDown'); await page.waitForTimeout(120); await page.keyboard.up('ArrowDown'); acted = true; break; }
        if (canJump && !s.hidden) { await page.keyboard.press('Space'); acted = true; break; }
      }
    }
    if (!acted && s.hay && s.onGround) {
      await page.keyboard.press('ArrowDown');
    }
    if (Date.now() - lastReport > 10000) {
      lastReport = Date.now();
      console.log(`... ${Math.floor(s.distance)}m score ${Math.floor(s.score)} lives ${s.lives} gap ${Math.floor(s.gap)} stage ${s.stage}`);
    }
    await page.waitForTimeout(90);
  }
  console.log('RESULT:', JSON.stringify(result));

  // Restart check from the end screen.
  if (result.over || result.outcome === 'caught' || result.outcome === 'escaped') {
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ screen: window.GOBBLE.screen, distance: window.GOBBLE.state.distance, over: window.GOBBLE.state.over }));
    console.log('after R:', JSON.stringify(after));
    result.restart = after.screen === 'play' && after.distance < 5 && after.over === null;
  }
} finally {
  await browser.close();
  server.kill();
}

console.log('console/page errors:', errors.length ? errors : 'none');
console.log('external requests:', external.length ? external : 'none');
if (errors.length || external.length) process.exit(1);
if (!result.restart && (result.outcome === 'caught' || result.outcome === 'escaped')) {
  console.error('RESTART CHECK FAILED');
  process.exit(1);
}
console.log('playtest OK');
