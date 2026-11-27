# BUILD REPORT — Gobble Dash: The Great Turkey Escape

**Bounty:** make.fun `turkey-run-game-01` — "Make the best turkey escape game"
($250, 20 places). Opened 2026-11-27T02:00:00Z, deadline 2026-11-29T02:00:00Z.
Blind round 1 cutoff 2026-11-27T14:00:00Z (21:00 WIB).
**Account:** @budi-hertanto · **Repo (local, not yet pushed):**
`~/workspace/makefun/turkey-run-game/` → remote `financehubmanager/turkey-run-game`
**Local commit:** `0fcf7a4` — "Gobble Dash — The Great Turkey Escape
(make.fun turkey-run-game-01)" · 22 files, 378,268 bytes.
**Status: READY FOR TESTER.** No submit, no remote repo, nothing pushed.

## What was built

A complete, original 2D canvas endless-runner, written from scratch
(no code copied from any other entry or from the kit starter — only
`vendor/makefun-game.ts` and the MIT LICENSE text are the kit's, unchanged).

**Story:** Giblet the turkey flees on Thanksgiving morning — the farmer
chases with a net, the oven is hot, the carving knife is out. Run 1200 m
through three stages to the forest gate and escape.

**Gameplay**
- Auto-run with jump (Space / ↑ / W / click), **double jump** (press again
  mid-air), slide under the laundry line (↓ / S), and **hide in a haystack**
  (↓ near one — the farmer runs straight past, gap bonus).
- Hazards: fence, hay bale, pumpkin, rolling pin, glowing **oven**,
  falling **carving knife** (shadow + "!" telegraphs the landing spot),
  laundry line (must slide).
- Pickups: corn (+25, pushes the farmer back), golden corn (+100),
  feather (+1 life, max 3).
- **The farmer** gains the whole run (gap meter in the HUD): every stumble
  costs a life and 70 gap; 0 lives or 0 gap = **CAUGHT**. Corn and hiding
  push him back. Speed rises 280 → 560 px/s over the run.
- Stages: The Farmyard (0–400 m) → The Cornfield (400–800 m) →
  The Kitchen Yard (800–1200 m, ovens + knives dense). ~2-minute run.
- HUD: score, best, distance progress bar to the forest gate, lives
  (feathers), farmer meter. Title screen, pause (P), CAUGHT and ESCAPED
  end screens, restart (R / button). Synthesized WebAudio sounds
  (gobble, jump, pickup, stumble, fanfares) + mute (M). No assets, no
  libraries, no network requests — all art is canvas vector drawing.

**Files** (one job each, named for what they do):
`game/index.html`, `game/src/config.js` (tuning/stages),
`game/src/rng.js` (seeded random), `game/src/audio.js` (synth sounds),
`game/src/input.js` (keyboard/mouse), `game/src/world.js` (simulation),
`game/src/render.js` (all drawing + HUD + screens),
`game/src/shots.js` (deterministic screenshot scenes),
`game/src/main.js` (loop, screens, ?shot= mode). Plus `main.ts`
(program/v1 entrypoint), `serve.ts`, `shots.json`, `scripts/shoot.mjs`,
`scripts/probe-playtest.mjs`, `README.md`, `LICENSE` (MIT),
`.makefun/owner.json` (wallet `5XrS76uzjrhf9pyMBVQpfL1SpyxX7Dk8vyFUncED2o39`).

## Screenshots (real renders of the game's own code, 1280×480, ≤256 KiB)

| File | Bytes | Scene |
| --- | --- | --- |
| `screenshots/1-cover.jpg` | 50,420 | Gameplay: turkey leaping a fence, farmer close behind, knife falling, corn trail, full HUD |
| `screenshots/2-title.jpg` | 72,378 | Title screen: GOBBLE DASH, story, controls, START button |
| `screenshots/3-kitchen.jpg` | 65,237 | Kitchen Yard gameplay: oven (HOT!), falling knife, rolling pin, laundry line, stage banner |
| `screenshots/4-escaped.jpg` | 65,888 | ESCAPED end screen at the forest gate |

The CAUGHT end screen is also staged (`?shot=caught`) and was rendered
and inspected during verification (farmer caught the turkey in the
cornfield at 650 m); it is not among the 4 submitted screenshots.

## Verification results

- **Kit check** (`node cli/makefun.mjs check --kit . --repo … --worktree`,
  turkey kit): **4 passed** — `competition_open`, `snapshot`
  (22 files, 378,268 bytes), `license_osi` (MIT), `entrypoint`
  (main.ts → node22). **1 failed, expected:** `transcripts_present`
  (no bundle yet — the bundle is made at submit time from this session).
  5 checks deferred to submission (repo_public, repo_owner,
  repo_created_after_open, commit_in_repo, duplicate_snapshot) — the
  remote repo does not exist yet, by design of this build step.
- **Determinism:** `main.ts` run twice into separate dirs —
  `diff -r` **IDENTICAL**. dossier.json
  sha256 `c28aae77d8a6616c36c5b321d9d7f56bc7664b3ca24b2b388f44395ac801d123`,
  393,445 bytes (< 1.5 MiB).
- **Gate limits:** game/ 52,107 bytes, 9 files (≤993 files / 48 MiB);
  no symlinks; no `http://`/`https://` references anywhere in game/;
  screenshots 1280×480, 50–73 KiB each (≤256 KiB); dossier ≤1.5 MiB.
- **Balance (headless sim, exact 60 Hz, perfect-reaction autopilot,
  8 seeds): 5/8 escaped**, 3 caught at 1031–1176 m; run time ~121 s.
  Before tuning it was 0/8 (caught ~70 m) — three real bugs were found
  and fixed by measurement: jump triggered too early (190 px → 100 px),
  laundry-line slide ended on key release and was shorter than the line,
  and haystacks collided like obstacles. A double jump was added for
  piled-up hazards.
- **Browser playtest** (`scripts/probe-playtest.mjs`, headless Chromium,
  real keyboard input): title → click START → play → P pause → P resume
  → played through all 3 stages to **1163 m** (lives lost and regained
  via feather pickup) → CAUGHT → R restarts cleanly. **Zero console/page
  errors, zero requests outside localhost.**
- **Offline:** game loads and plays from local files only; the probe
  asserted no external requests.

## What the tester should still check

1. **Play it by hand in desktop Chrome** (`node serve.ts`, then
   http://localhost:8080): does the jump/double-jump/slide/hide feel
   fair and fun for a human, not just the autopilot? Is the kitchen
   stage too dense at full speed?
2. **Screenshot quality vs. the judge:** the judge sees mostly the
   contact sheet — is the cover dense and readable enough at small size?
   Compare with the house starter's cover. The title screen's windmill
   silhouette reads as a plain cross; acceptable, but flag it if it
   looks broken to you.
3. **Sound:** WebAudio synth only starts after first interaction
   (browser policy) — confirm sounds actually play on a real click.
4. **Edge cases:** pause during a jump, restart from pause (R), mute
   toggle (M), hiding while the farmer is very close (gap < 90).
5. Nothing to fix is known — the items above are judgement calls, not
   defects found.

## How to re-verify

```sh
cd ~/workspace/makefun/turkey-run-game
node serve.ts                      # http://localhost:8080 — play it
REPO_ROOT=. node /tmp/turkey-tools/shoot.mjs        # re-take screenshots
REPO_ROOT=. node /tmp/turkey-tools/probe-playtest.mjs # headless playtest
rm -rf /tmp/o1 /tmp/o2 && mkdir /tmp/o1 /tmp/o2
MAKEFUN_OUTPUT_DIR=/tmp/o1 node main.ts
MAKEFUN_OUTPUT_DIR=/tmp/o2 node main.ts
diff -r /tmp/o1 /tmp/o2            # determinism
```
