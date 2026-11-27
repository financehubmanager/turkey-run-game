// v2 probe: verifies the new feedback paths live in headless Chromium.
// - jump -> +1 osc, slide -> +1 buffer source (regression, b3f2df6)
// - gap forced <= 140 -> SPOTTED! banner + red frame + +1 osc (spotted tone)
// - goldcorn pickup -> +4 osc (gold arpeggio), feather pickup -> +1 osc + '+1 LIFE!' banner
// - zero console/page errors, zero non-localhost requests (offline evidence)
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire('/home/hatch/workspace/makefun/budget-site/scripts/x.js');
const { chromium } = require('playwright-core');
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.REPO_ROOT || '/home/hatch/workspace/makefun/turkey-run-game';
const port = 8093;
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`;
const GROUND_Y = 402;

const server = spawn('node', ['serve.ts', '--port', String(port)], { cwd: root, stdio: 'pipe' });
await new Promise((r) => { server.stdout.on('data', () => r()); setTimeout(r, 3000); });

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
const errors = [];
const external = [];
const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 480 } });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  // Offline simulation: abort anything that is not the local server.
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(`http://127.0.0.1:${port}`)) route.continue();
    else { external.push(url); route.abort(); }
  });
  // Instrument AudioContext exactly like the tester did.
  await page.addInitScript(() => {
    window.__osc = 0; window.__buf = 0;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      const p = AC.prototype;
      const co = p.createOscillator;
      p.createOscillator = function (...a) { window.__osc += 1; return co.apply(this, a); };
      const cb = p.createBufferSource;
      p.createBufferSource = function (...a) { window.__buf += 1; return cb.apply(this, a); };
    }
  });
  const counts = () => page.evaluate(() => ({ osc: window.__osc, buf: window.__buf }));
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  check('loads offline (no external requests)', external.length === 0, external.join(', ') || 'none');
  check('screen at load is title', (await page.evaluate(() => window.GOBBLE.screen)) === 'title');
  await page.mouse.click(640, 388); // START
  await page.waitForTimeout(300);
  check('screen after START is play', (await page.evaluate(() => window.GOBBLE.screen)) === 'play');
  let c0 = await counts();
  check('gobble on start (3 osc)', c0.osc === 3, `osc=${c0.osc}`);

  // Jump regression.
  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
  let c1 = await counts();
  check('jump -> +1 osc', c1.osc === c0.osc + 1, `osc ${c0.osc} -> ${c1.osc}`);
  // Slide regression (wait to land first).
  await page.waitForTimeout(900);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowDown');
  let c2 = await counts();
  check('slide -> +1 buffer source', c2.buf === c1.buf + 1, `buf ${c1.buf} -> ${c2.buf}`);

  // SPOTTED: force the farmer close, then wait a few steps.
  await page.evaluate(() => { window.GOBBLE.state.gap = 100; });
  await page.waitForTimeout(300);
  const spotted = await page.evaluate(() => ({
    banner: window.GOBBLE.state.banner, bannerT: window.GOBBLE.state.bannerT,
    warned: window.GOBBLE.state.spottedWarned, gap: window.GOBBLE.state.gap,
  }));
  let c3 = await counts();
  check('SPOTTED banner shows', spotted.banner === 'SPOTTED! RUN!', JSON.stringify(spotted));
  check('SPOTTED sound (+1 osc)', c3.osc === c2.osc + 1, `osc ${c2.osc} -> ${c3.osc}`);
  // Red frame visible while the warning is up: sample corner pixels.
  await page.screenshot({ path: '/tmp/turkey-v2-spotted.png' });
  const px = await page.evaluate(() => {
    const cv = document.getElementById('game');
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(6, 6, 1, 1).data;
    return [d[0], d[1], d[2]];
  });
  check('red danger frame at corner (R dominant)', px[0] > 150 && px[0] > px[1] + 60, `rgb=${px}`);
  // No re-trigger while still close, re-arm after pulling away.
  await page.waitForTimeout(400);
  let c4 = await counts();
  check('SPOTTED fires once (no repeat)', c4.osc === c3.osc, `osc ${c3.osc} -> ${c4.osc}`);
  await page.evaluate(() => { window.GOBBLE.state.gap = 300; });
  await page.waitForTimeout(200);
  const rearmed = await page.evaluate(() => window.GOBBLE.state.spottedWarned);
  check('SPOTTED re-arms after gap recovers', rearmed === false, `warned=${rearmed}`);

  // GOLD: drop a goldcorn onto the grounded turkey.
  await page.evaluate((gy) => {
    const st = window.GOBBLE.state;
    st.turkey.y = gy; st.turkey.onGround = true;
    st.pickups.push({ kind: 'goldcorn', x: 250, y: gy - 46, width: 30, height: 38, taken: false, bob: 0 });
  }, GROUND_Y);
  await page.waitForTimeout(500);
  let c5 = await counts();
  check('goldcorn -> +4 osc (arpeggio)', c5.osc === c4.osc + 4, `osc ${c4.osc} -> ${c5.osc}`);

  // FEATHER: lives 2 -> feather gives +1 life + banner + its own sound.
  await page.evaluate((gy) => {
    const st = window.GOBBLE.state;
    st.lives = 2;
    st.pickups.push({ kind: 'feather', x: 250, y: gy - 46, width: 30, height: 30, taken: false, bob: 0 });
  }, GROUND_Y);
  await page.waitForTimeout(500);
  const feather = await page.evaluate(() => ({ lives: window.GOBBLE.state.lives, banner: window.GOBBLE.state.banner }));
  let c6 = await counts();
  check('feather -> +1 life', feather.lives === 3, JSON.stringify(feather));
  check('feather -> +1 LIFE! banner', feather.banner === '+1 LIFE!', feather.banner);
  check('feather sound (+1 osc)', c6.osc === c5.osc + 1, `osc ${c5.osc} -> ${c6.osc}`);

  check('zero console/page errors', errors.length === 0, errors.join(' | ') || 'none');
} finally {
  await browser.close();
  server.kill();
}
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `PROBE FAILED: ${failed.length} checks` : 'PROBE OK — all checks passed');
process.exit(failed.length || errors.length || external.length ? 1 : 0);
