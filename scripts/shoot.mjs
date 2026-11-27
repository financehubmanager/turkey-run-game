// Takes the entry's screenshots: serves game/ locally, opens each
// ?shot= scene from shots.json in headless Chromium at exactly 1280x480,
// saves a PNG, then converts it to JPEG (quality stepped down until it
// fits the 256 KiB cap). Usage: node scripts/shoot.mjs [--port 8091]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire('/home/hatch/workspace/makefun/budget-site/scripts/x.js');
const { chromium } = require('playwright-core');

const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.REPO_ROOT || join(here, '..');
const shots = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
const port = Number(process.argv.find((a, i) => process.argv[i - 1] === '--port') || 8091);
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`;
const outDir = join(root, 'screenshots');
mkdirSync(outDir, { recursive: true });

const server = spawn('node', ['serve.ts', '--port', String(port)], { cwd: root, stdio: 'pipe' });
await new Promise((resolve) => {
  server.stdout.on('data', () => resolve());
  setTimeout(resolve, 3000);
});

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
const errors = [];
try {
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 480 } });
    page.on('pageerror', (e) => errors.push(`${shot.name}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${shot.name}: ${m.text()}`); });
    await page.goto(`http://127.0.0.1:${port}/index.html${shot.query}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const png = join(outDir, shot.name.replace(/\.jpg$/, '.png'));
    await page.screenshot({ path: png });
    await page.close();
    // PNG -> JPEG, stepping quality down until under 256 KiB.
    let quality = 90;
    for (;;) {
      execFileSync('python3', ['-c',
        `from PIL import Image; im=Image.open(${JSON.stringify(png)}).convert('RGB'); im.save(${JSON.stringify(join(outDir, shot.name))}, 'JPEG', quality=${quality})`]);
      const size = statSync(join(outDir, shot.name)).size;
      console.log(`${shot.name}: ${size} bytes (quality ${quality})`);
      if (size <= 262144 || quality <= 40) break;
      quality -= 10;
    }
    if (existsSync(png)) {
      const { unlinkSync } = await import('node:fs');
      unlinkSync(png);
    }
  }
} finally {
  await browser.close();
  server.kill();
}

if (errors.length) {
  console.error('PAGE ERRORS:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('shoot OK');
