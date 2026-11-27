# BUILD REPORT — Gobble Dash v2: The Great Turkey Escape

**Bounty:** make.fun `turkey-run-game-01` — "Make the best turkey escape game" ($250, 20 tempat)
**Repo lokal:** `~/workspace/makefun/turkey-run-game/`
**Builder:** sesi ini, 28 Nov 2026 ~05:20–06:00 WIB
**Persetujuan user:** "User menyetujui revisi Turkey v2 pada 28 Nov 2026 05:18 WIB — memilih 'Ya, buat revisi Turkey v2' di chat make.fun; kerjakan sampai selesai tanpa konfirmasi lagi."
**Base:** commit `3d3d056` (FIX_REPORT b3f2df6 — perbaikan tester yang BELUM PERNAH di-submit)
**Deadline ronde 2:** 28 Nov 2026 09:00 WIB (v2 harus ter-submit sebelum itu)

## Temuan awal yang menentukan v2 (verifikasi, bukan klaim)

**Remote HEAD saat v2 dibangun adalah `6aedab7` ("Add screenshot 4-escaped") — sama
dengan commit yang di-submit v1.** Commit perbaikan tester `b3f2df6` (suara
lompat/slide, windmill, pisau, label HIDE!, haystack spawn) dan `3d3d056` hanya
ada di lokal dan **tidak pernah di-push**. Artinya ronde 1 (rank 1518/4864,
55,5%) menilai game TANPA perbaikan suara itu. v2 ini mengirim semua perbaikan
tersebut — plus tiga peningkatan feedback baru di bawah — sehingga lonjakan
kualitas v1→v2 jauh lebih besar dari sekadar "revisi kecil".

**Verifikasi klaim fixer (dilihat langsung, bukan dipercaya):**
- `1-cover.jpg` — kalkun melompat pagar, petani + jala di kiri, pisau jatuh
  kini terbaca sebagai pisau (handle gelap + bilah runcing, tip-first),
  label "HIDE! ↓" terbaca jelas di atas langit oranye, HUD lengkap
  (SCORE 1250, progress 275/1200 m, 3 nyawa, meter FARMER). ✅
- `2-title.jpg` — windmill kini 4 bilah meruncing + ekor/vane, langsung
  dikenali sebagai kincir, bukan salib. ✅
- `3-kitchen.jpg` — banner "THE KITCHEN YARD" utuh, pisau kini di kanan atas
  (x=1010), oven "HOT!", rolling pin, laundry line "DUCK!", HUD 940/1200 m. ✅
- `4-escaped.jpg` — "ESCAPED!" hijau, forest gate + kalkun, skor 2900,
  tombol "RUN AGAIN" + "or press R". ✅

## Yang diubah di v2 (di luar perbaikan b3f2df6 yang ikut terkirim)

Semua perubahan mengikuti brief juri (judge-briefs.md §5) — kriteria #3 dulu,
lalu #1/#4. Tidak ada perubahan tuning gameplay (angka di config.js tidak
disentuh kecuali penambahan event), tidak ada perubahan shot.

### 1. Peringatan SPOTTED! — kriteria #3 ("feedback saat kalkun terlihat")
`audio.spotted()` sudah didefinisikan sejak v1 tapi **tidak pernah dipanggil**
(dead code kedua setelah jump/slide). Sekarang dihidupkan:
- `game/src/config.js` — `EVENTS.SPOTTED = 256`.
- `game/src/world.js` — state baru `spottedWarned`; saat `gap <= 140`
  (dua stumble dari start; meter HUD baru merah di 90, jadi peringatan datang
  dulu) dan belum diperingatkan: `banner = 'SPOTTED! RUN!'`, `bannerT = 1.6`,
  `events |= EVENTS.SPOTTED`. Re-arm saat `gap > 200`.
- `game/src/main.js` — `if (events & EVENTS.SPOTTED) audio.spotted();`
- `game/src/render.js` — selama banner SPOTTED! tampil: overlay merah tipis
  + frame merah tebal 16 px di tepi layar (bahaya terbaca sekilas).

### 2. Suara pickup yang berbeda — kriteria #3 (feedback jelas)
`audio.gold()` dan `audio.feather()` juga dead code di v1. Sekarang:
- `game/src/config.js` — `EVENTS.GOLD = 512`, `EVENTS.FEATHER = 1024`.
- `game/src/world.js` — goldcorn → `EVENTS.GOLD` (arpeggio 4 nada);
  feather → `EVENTS.FEATHER` + banner `'+1 LIFE!'` 1,2 dtk bila nyawa
  bertambah; corn biasa tetap `EVENTS.PICKUP`.
- `game/src/main.js` — wiring `audio.gold()` / `audio.feather()`.

### 3. Peralatan probe (bukan game)
- `scripts/probe-v2-feedback.mjs` (baru) — probe 16 cek untuk jalur v2.
- `scripts/probe-playtest.mjs`, `scripts/shoot.mjs` — import
  `playwright-core` diperbaiki via `createRequire` dari
  `budget-site/scripts/node_modules` (ESM tidak me-resolve paket itu dari
  repo ini; tanpa ini kedua skrip tidak bisa jalan di VM ini). Bukan
  perubahan game; tidak memengaruhi dossier.

## Verifikasi (semua diukur sendiri)

| Uji | Hasil |
| --- | --- |
| Probe v2 (`scripts/probe-v2-feedback.mjs`, 16 cek) | **PROBE OK — semua lolos.** Jump +1 osc (regresi b3f2df6 ✅), slide +1 buffer ✅, SPOTTED banner tampil + suara +1 osc ✅, frame merah di sudut (rgb 177,69,43) ✅, SPOTTED hanya sekali + re-arm setelah gap pulih ✅, goldcorn +4 osc ✅, feather +1 nyawa + banner '+1 LIFE!' + suara ✅, 0 console/page error ✅, **0 request non-localhost (rute eksternal di-abort = bukti main offline)** ✅ |
| Frame SPOTTED dilihat langsung (`/tmp/turkey-v2-spotted.png`) | Banner "SPOTTED! RUN!" besar di tengah, frame merah di keempat tepi, petani persis di belakang kalkun, windmill terlihat. Peringatan tidak mungkin terlewat. |
| Playtest penuh (`scripts/probe-playtest.mjs`, autopilot) | **ESCAPED 1200 m**, skor 3885, 2 nyawa; restart (R) → play, distance 3,0 m, over null; **0 console/page error, 0 external request**; playtest OK |
| Re-shoot (`scripts/shoot.mjs`) | **OK, 0 page error.** Keempat JPG **byte-identical** dengan fixer (sha256 sama, lihat bawah) — jalur baru tidak mengubah frame staged, sesuai desain |
| `makefun check` (kit turkey, `--worktree`) | **4 passed** (competition_open, snapshot, license_osi MIT, entrypoint main.ts → node22), **1 failed `transcripts_present`** — ekspektasi, bundle dibuat saat submit; 15 skipped, 5 dicek saat submission |
| Determinisme `main.ts` 2× (`/tmp/turkey-v2-d1` vs `/tmp/turkey-v2-d2`) | **PASS — IDENTICAL** (`diff -r` kosong). dossier.json sha256 `995f4cd36f667447a16574683309225759f364186d929707c19d1019678a1b4e`, 398.451 byte (< 1,5 MiB) |
| `vendor/makefun-game.ts` | **Tidak diubah** — sha256 `dc671875…` = kit starter |
| `grep http://\|https://` di `game/` | **0** — tidak ada referensi eksternal; game load/main dari file sendiri |
| Keseimbangan | Tidak di-sim ulang: v2 tidak mengubah satu pun angka tuning (hanya event + feedback). Playtest autopilot tetap ESCAPED seperti v1. |

## Screenshot (sha256 — identik dengan fixer b3f2df6)

| File | sha256 | Bytes |
| --- | --- | --- |
| `screenshots/1-cover.jpg` | `f41ab542857352c6ed68fb09a690aadd5f7a8ed022fd651d7d533a4b333c3fe2` | 50.873 |
| `screenshots/2-title.jpg` | `9d5254a1f3d232ca4dcdd903a049d35b04108b8ec58c043e3948fb496e9cc25d` | 72.919 |
| `screenshots/3-kitchen.jpg` | `608005cd096be5baedc4e67fa4369c1739d52d2266bffa28a2fbcaf97bf4a61a` | 65.002 |
| `screenshots/4-escaped.jpg` | `cb61f5e4761af863133542f6fecce6e24c9232114c178959195abab2ad267a89` | 65.888 |

Set shot lengkap per kriteria #1: title (2) + run dengan HUD (1 cover, 3 kitchen)
+ end screen ESCAPED dengan restart (4). Screenshot CAUGHT (`?shot=caught`)
sudah diverifikasi tester v1 tapi tidak diserahkan — satu end screen sudah
memenuhi brief ("tertangkap atau lolos").

## Skor mandiri per kriteria brief (1–5)

| # | Kriteria | Skor | Alasan |
| --- | --- | --- | --- |
| 1 | Complete game, shown | 5 | Title + 2 run HUD + end screen restart; semua unsur (kalkun, petani, oven, pisau) terlihat di set |
| 2 | Fun & depth | 4 | Lompat/double-jump/slide/hide + 3 stage makin sulit + SPOTTED menambah ketegangan saat farmer dekat; hide kini muncul 4–16×/run (fix b3f2df6) |
| 3 | Feel & polish | 4 | Semua feedback kini bersuara: jump, slide, pickup, gold, feather, stumble, stage, hide, spotted, caught, escaped — plus visual (shake, flash merah stumble, frame merah SPOTTED, banner). Satu tingkat di bawah 5: feedback lompat masih tanpa efek visual khusus (hanya animasi kalkun) |
| 4 | Look & originality | 4 | Windmill/pisau/HIDE! terverifikasi terbaca; palet autumn koheren; art sendiri, bukan salinan. Minus: label "FOREST GATE" di 4-escaped sedikit menimpa pohon kiri; pisau cover menyentuh tepi progress bar |
| 5 | Structure | 5 | Satu tugas per file dipertahankan; event baru di config.js, emit di world.js, wiring di main.js, gambar di render.js |

## Cacat sisa (jujur, tidak diperbaiki — di luar prioritas #3/#1, risiko > manfaat)

- KECIL-A: label "FOREST GATE" di `4-escaped.jpg` sedikit menimpa elips pohon
  kiri gerbang (teks di atas dedaunan). Kosmetik, tidak mengaburkan makna.
- KECIL-B: pisau jatuh di `1-cover.jpg` ujungnya menyentuh area progress bar
  HUD (x≈560, y≈40). Terlihat disengaja (jatuh dari langit), bukan merusak.
- KECIL-C: feedback lompat tidak punya efek visual khusus (partikel debu
  hanya saat mendarat). Suara sudah ada; efek visual tambahan butuh staging
  ulang shot dan berisiko mengubah cover yang sudah bagus.
- KECIL-D: `file://` tetap gagal (Chrome blokir ES module — pola bawaan kit,
  didokumentasikan di README). Main offline yang didukung: `node serve.ts`
  / harness make.fun; 0 request eksternal terverifikasi. Finalist review
  memainkan game lewat harness (serve lokal), bukan `file://`.

## File yang diubah (vs 3d3d056)

- `game/src/config.js` — EVENTS SPOTTED/GOLD/FEATHER
- `game/src/world.js` — pemicu SPOTTED + event GOLD/FEATHER + banner +1 LIFE!
- `game/src/main.js` — wiring audio.spotted/gold/feather
- `game/src/render.js` — frame merah saat SPOTTED!
- `scripts/probe-v2-feedback.mjs` (baru), `scripts/probe-playtest.mjs`,
  `scripts/shoot.mjs` — perbaikan import playwright-core
- `BUILD_REPORT.md` (file ini)

**Tidak diubah:** `vendor/makefun-game.ts`, screenshot (byte-identical),
`shots.json`, `main.ts`, `serve.ts`, `README.md`, `LICENSE`.

## Catatan untuk parent (langkah berikut — BUKAN tugas builder)

1. **Push:** diff lokal vs remote HEAD `6aedab7` mencakup b3f2df6 + 3d3d056 +
   commit v2 ini. Push via PAT (ghpat.py put-file) — screenshot tidak
   berubah byte-nya tapi tetap perlu ada di remote (remote sudah punya
   keempatnya dari v1; yang berubah: 4 file game/src + 3 script + 3 laporan).
2. **Bundle:** resep CAKRAWALA-style (typed origin + prompt-file pesan pertama
   root session) — sesi penulis v1 + fixer + builder v2 ini harus ikut.
3. **Submit sebelum 09:00 WIB 28 Nov** agar dihitung ronde 2 (cutoff
   2026-11-28T02:00:00Z). Judul sama: "Frank Matrix".
4. Bila tester menemukan cacat, perbaiki hanya yang KRITIS/SEDANG — waktu
   ke cutoff mepet; KECIL-A/B/C di atas sengaja ditinggal.
