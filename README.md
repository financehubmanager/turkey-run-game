# Gobble Dash — The Great Turkey Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/financehubmanager/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/financehubmanager/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
<sub>Entered on [make.fun](https://make.fun/?ref=eadefpex&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>

Thanksgiving morning. The farmer is coming with his net, the oven is already hot and the carving knife is out. **Giblet the turkey** has one plan: run 1200 metres through the farmyard, the cornfield and the kitchen yard, and burst through the forest gate.

An entry for make.fun's **"Make the best turkey escape game"** bounty (`turkey-run-game-01`).

## How to play

Serve it locally — the game uses ES modules, so it needs `http://`, not `file://` (opening `game/index.html` directly fails in Chrome with a CORS error):

```sh
node serve.ts   # http://localhost:8080
```

No build step, no network, everything is static files under `game/`.

| Key / mouse | Action |
| --- | --- |
| `Space` / `↑` / `W` / click | Jump |
| `↓` / `S` | Slide under the laundry line — or duck into a haystack to hide |
| `P` / `Esc` | Pause |
| `R` | Restart |
| `M` | Mute |

## The run

- **Dodge** fences, hay bales, pumpkins, rolling pins, the glowing **oven** and falling **carving knives**. Jump them — or slide under the laundry line.
- **Hide** in a haystack (`↓` nearby) and the farmer runs straight past you.
- **Grab corn** for points (golden corn is worth 100); feathers restore a life.
- **The farmer** gains on you the whole run. Every stumble costs a life and lets him close in — three stumbles (or an empty gap) and you're **caught**.
- **Escape** by reaching the forest gate at **1200 m**.

Three stages grow faster and denser: **The Farmyard** → **The Cornfield** → **The Kitchen Yard**. The HUD shows score, best, distance with a progress bar to the gate, lives and the farmer meter.

## Original work

All art is drawn in code (canvas 2D), all sounds are synthesized with WebAudio — no copied assets, no libraries, no network requests. The turkey, the farmer, the farm and the kitchen are original.

## Layout

- `game/index.html` + `game/src/` — the game: `config.js` (tuning), `rng.js` (seeded random), `audio.js` (synth sounds), `input.js` (keyboard/mouse), `world.js` (simulation), `render.js` (all drawing), `shots.js` (deterministic screenshot scenes), `main.js` (loop and screens).
- `main.ts` — the make.fun program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `screenshots/` — 4 real renders of the game's own code (cover = mid-run gameplay, title, kitchen yard, escaped).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

## License

MIT — see [LICENSE](LICENSE).
