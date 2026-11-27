# FIX REPORT — Gobble Dash: The Great Turkey Escape

**Bounty:** make.fun `turkey-run-game-01` — "Make the best turkey escape game"
**Repo lokal:** `~/workspace/makefun/turkey-run-game/` (base commit `0fcf7a4` + `7538622` BUILD_REPORT.md + TEST_REPORT.md)
**Fixer:** sesi ini (dimulai setelah bounty dibuka 02:00Z — thinking_in_window aman)
**Tanggal:** 27 Nov 2026, ~10:20–10:55 WIB
**Status: BERSIH — semua 7 defect dari TEST_REPORT.md diperbaiki dan terverifikasi.**
Tidak ada submit, tidak ada push, tidak ada repo remote.

## Defect yang diperbaiki

### SEDANG-1 — Suara lompat & slide tidak pernah berbunyi (dead code) ✅ FIXED
- **Akar:** `audio.jump()` / `audio.slide()` didefinisikan di `game/src/audio.js`
  tapi tidak ada call-site; `world.step()` tidak memberi tahu `main.js`
  bahwa lompat/slide terjadi.
- **Perubahan:**
  - `game/src/config.js` — `EVENTS` ditambah `JUMP: 64` dan `SLIDE: 128`.
  - `game/src/world.js` (`step`, blok jump/slide) — `events |= EVENTS.JUMP`
    saat lompat benar-benar terjadi (termasuk double jump), `events |=
    EVENTS.SLIDE` saat slide dimulai. Event hanya dipicu bila aksinya
    lolos syarat (grounded / airJumps tersisa), jadi tidak ada suara palsu.
  - `game/src/main.js` (loop play) — `if (events & EVENTS.JUMP)
    audio.jump(); if (events & EVENTS.SLIDE) audio.slide();` di samping
    pemicu suara yang sudah ada.
- **Bukti (instrumentasi `AudioContext` persis seperti tester,
  `/tmp/turkey-tools/probe-audio-fix.mjs`, headless Chromium):**
  - Sebelum START: 0 osc / 0 buf. Setelah START: 3 osc (gobble) — sama
    seperti kontrol tester.
  - Lompat: osc **3 → 4 (delta +1)**. Double jump: osc **4 → 5 (delta
    +1)**. Tekan ketiga di udara: osc **5 → 5 (delta 0)** — benar, karena
    `airJumps` sudah habis (hanya 1 double jump per lompatan).
  - Slide (tahan ↓ 500 ms): buffer source **0 → 1 (delta +1)**.
  - Kontrol positif pickup: osc **5 → 7 (delta +2)** — mesin suara jalan.
  - 0 console/page error selama probe.

### KECIL-1 — Siluet windmill di title screen terbaca seperti salib ✅ FIXED
- **Perubahan:** `game/src/render.js` (latar stage 0, `drawBackground`) —
  bilah kini trapesium meruncing (sempit di poros, lebar 22 px di ujung,
  panjang 58 px) dengan spar lattice, ditambah atap cap di atas menara,
  hub bulat, dan ekor/vane penunjuk angin di belakang poros.
- **Bukti:** `screenshots/2-title.jpg` baru (sha256 di bawah) — kincir kini
  langsung dikenali sebagai windmill dengan 4 bilah lebar + ekor; diverifikasi
  dengan melihat langsung screenshot hasil re-shoot.

### KECIL-2 — Pisau jatuh menembus teks banner di screenshot kitchen ✅ FIXED
- **Perubahan:** `game/src/shots.js` (scene `kitchen`) — pisau dipindah dari
  `(x=520, y=60)` ke `(x=1010, y=30)`, jauh di kanan teks banner
  "THE KITCHEN YARD" (teks berakhir ~x=830) dan tidak menabrak haybale
  (900–978) maupun laundry line (1080).
- **Bukti:** `screenshots/3-kitchen.jpg` baru — banner utuh tanpa objek
  menembus huruf; pisau jatuh terlihat di kanan atas, terverifikasi visual.

### KECIL-3 — README badge generik tanpa owner ✅ FIXED
- **Perubahan:** `README.md:3` — badge diganti ke konvensi repo entry lain
  (news-image): badge `make.fun · turkey-run-game-01`, badge `rank` dan
  `reward` dengan path owner `financehubmanager/turkey-run-game`, plus baris
  `<sub>Entered on make.fun …</sub>`.

### KECIL-4 — README mengklaim `game/index.html` bisa dibuka langsung ✅ FIXED
- **Perubahan:** `README.md` ("How to play") — wording diganti: game memakai
  ES module sehingga butuh `http://`, bukan `file://` (membuka langsung gagal
  di Chrome dengan CORS); cara main: `node serve.ts` → http://localhost:8080.

### KECIL-5 — Cover: pisau mirip pesawat kertas; label "HIDE!" kontras rendah ✅ FIXED
- **Perubahan:** `game/src/render.js` (`drawObstacle`, `kind === 'knife'`) —
  pisau digambar ulang sebagai carving knife yang tegas: handle kayu gelap
  `#4a2c14` dengan 2 rivet emas di atas, bolster, bilah putih keperakan
  meruncing ke ujung tajam di bawah (tip-first saat jatuh) dengan garis fuller.
  Label haystack (`kind === 'haystack'`): teks "HIDE! ↓" kini diberi
  stroke outline coklat gelap (`rgba(60,32,8,0.85)`, lebar 4) sebelum fill
  putih.
- **Bukti:** `screenshots/1-cover.jpg` baru — pisau di tengah atas kini
  terbaca sebagai pisau (handle gelap + bilah runcing), dan label "HIDE! ↓"
  jelas terbaca di atas langit oranye; diverifikasi visual.

### KECIL-6 — Mekanik hide jarang muncul alami ✅ FIXED
- **Perubahan:** `game/src/config.js` (`SPAWN_TABLES`) — `['haystack', 1]`
  ditambahkan ke ketiga tabel stage (bobot 1 dari total ~20 per tabel, ~5%
  spawn; roll 16% pasca-obstacle di `world.js` tetap ada). Sengaja kecil
  agar hide muncul wajar tanpa membanjiri run.
- **Bukti (sim headless Node, autopilot yang sama seperti `shots.js`,
  `/tmp/turkey-tools/check-haystack.mjs`, 8 seed):** haystack ter-spawn
  **4–16 per run (rata-rata ~9,8)**, kesempatan hide **4–14 per run**,
  semua hide yang dicoba berhasil (gap +60). Sebelum perbaikan: 0
  kesempatan hide dalam ~496 m (temuan tester).
- **Keseimbangan tidak rusak:** 5/8 run escaped (sama seperti 5/8 klaim
  builder sebelum perbaikan); 3 caught di 352–1102 m.

## Verifikasi ulang (setelah semua perbaikan)

| Uji | Hasil |
| --- | --- |
| Re-shoot screenshot (`scripts/shoot.mjs` via `/tmp/turkey-tools/shoot.mjs`) | **OK, 0 page error** — 1-cover.jpg 50.873 byte, 2-title.jpg 72.919 byte, 3-kitchen.jpg 65.002 byte, 4-escaped.jpg 65.888 byte (tidak berubah, tidak tersentuh perbaikan); semua 1280×480, ≤256 KiB |
| Verifikasi visual screenshot baru | Windmill = kincir ✅ · pisau kitchen tidak menembus banner ✅ · pisau cover = pisau ✅ · "HIDE! ↓" terbaca ✅ |
| SEDANG-1 via instrumentasi AudioContext | **FIXED** — lompat +1 osc, double jump +1 osc, slide +1 buffer source, tekan ke-3 di udara +0 (benar) |
| Playtest headless penuh (`probe-playtest.mjs`) | **ESCAPED 1200 m**, skor 3470, 2 nyawa, restart (R) bersih; **0 console/page error, 0 request eksternal** |
| `makefun check` (`--kit . --repo … --worktree`) | **4 passed** (`competition_open`, `snapshot` 24 file / 400.225 byte, `license_osi` MIT, `entrypoint` main.ts → node22), **1 failed `transcripts_present`** — ekspektasi, bundle dibuat saat submit; 15 skipped, 5 dicek saat submission (repo remote belum ada — sesuai desain tahap ini) |
| Determinisme `main.ts` 2× (`/tmp/o1` vs `/tmp/o2`) | **PASS — IDENTICAL** (`diff -r` kosong). dossier.json sha256 **`39785c119fcd01a7e98da54d12c45da13b6f493389fc6c3248ac4c9467ab8d2d`**, 396.588 byte (< 1,5 MiB) |
| `vendor/makefun-game.ts` | **Tidak diubah** — sha256 `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129`, identik dengan kit starter |
| Keseimbangan (sim 8 seed) | 5/8 escaped — sama seperti sebelum perbaikan |

## Screenshot baru (sha256)

| File | sha256 | Bytes |
| --- | --- | --- |
| `screenshots/1-cover.jpg` | `f41ab542857352c6ed68fb09a690aadd5f7a8ed022fd651d7d533a4b333c3fe2` | 50.873 |
| `screenshots/2-title.jpg` | `9d5254a1f3d232ca4dcdd903a049d35b04108b8ec58c043e3948fb496e9cc25d` | 72.919 |
| `screenshots/3-kitchen.jpg` | `608005cd096be5baedc4e67fa4369c1739d52d2266bffa28a2fbcaf97bf4a61a` | 65.002 |
| `screenshots/4-escaped.jpg` | `cb61f5e4761af863133542f6fecce6e24c9232114c178959195abab2ad267a89` (tidak berubah) | 65.888 |

## File yang diubah

- `game/src/config.js` — EVENTS JUMP/SLIDE + bobot haystack di 3 tabel spawn
- `game/src/world.js` — emit EVENTS.JUMP / EVENTS.SLIDE
- `game/src/main.js` — `audio.jump()` / `audio.slide()` dari event
- `game/src/render.js` — windmill, bentuk pisau, outline label HIDE!
- `game/src/shots.js` — posisi pisau scene kitchen (520,60 → 1010,30)
- `README.md` — badge owner + wording serve via `node serve.ts`
- `screenshots/1-cover.jpg`, `2-title.jpg`, `3-kitchen.jpg` — re-shoot
- `FIX_REPORT.md` (file ini)

## Verdict akhir: BERSIH

Semua defect dari TEST_REPORT.md diperbaiki: 1 SEDANG + 6 KECIL, 0 sisa.
Game tetap jalan sampai tamat (ESCAPED), deterministik, check kit lolos
kecuali `transcripts_present` yang memang baru ada saat bundle/submit.
Siap lanjut ke langkah repo (buat repo publik `financehubmanager/turkey-run-game`,
push, bundle, submit) — langkah itu di luar tugas fixer ini.

## Commit lokal

- Commit perbaikan: `b3f2df6` — "Fix tester defects: jump/slide sounds,
  windmill, knife, HIDE! label, haystack spawn, README" (11 file, +355/−11,
  termasuk TEST_REPORT.md + FIX_REPORT.md + 3 screenshot baru).
- Commit SHA FIX_REPORT.md ini: `b3f2df6` (ditulis di commit yang sama);
  pembaruan baris ini dicatat di commit lanjutan di bawah.
