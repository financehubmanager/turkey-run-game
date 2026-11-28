# TEST REPORT — Turkey Run Game v4 · Gobble Dash

**Tanggal uji:** 28 November 2026, ~22:00–22:15 WIB
**Tester:** tester independen (subagent), atas persetujuan user 28 Nov 2026 21:44 WIB
**Otorisasi:** "Otomasi penuh make.fun disetujui user 26 Nov 2026 22:22 WIB; user 28 Nov 2026 21:44 WIB memerintahkan 'Jalankan Turkey, Token Radar dan Negara'."
**Bounty:** `turkey-run-game-01` — "Make the best turkey escape game" ($250, 20 tempat)
**Repo lokal:** `/home/hatch/workspace/makefun/turkey-run-game/` · **Commit yang diuji:** `473922f`
**FINAL:** 29 Nov 2026 09:00 WIB (cutoff 2026-11-29T02:00:00Z)

## Verdict: LAYAK SUBMIT — 0 KRITIS, 0 SEDANG, 5 KECIL

Semua klaim builder diukur ulang sendiri (bukan dipercaya). Tidak ada cacat
yang membenarkan fixer sebelum final.

## 1. Uji yang dijalankan sendiri

| # | Uji | Perintah / cara | Hasil |
|---|---|---|---|
| 1 | Re-shoot | `node scripts/shoot.mjs --port 8091` | **PASS — 4/4 byte-identical** dengan commit (cmp -s); sha256 cocok persis dengan tabel BUILD_REPORT.md (cover d1abf250…, title acb043f8…, kitchen c48d60b2…, escaped 0c6fc9c3…) |
| 2 | Screenshot dilihat langsung | keempat JPG | **PASS** — lihat §3 |
| 3 | Playtest | `node scripts/probe-playtest.mjs` | **PASS — ESCAPED 1200,07 m, skor 3285, 1 nyawa**; restart (R) → play, distance 2,69 m; **0 console/page error, 0 request eksternal** |
| 4 | Probe feedback v2 | `node scripts/probe-v2-feedback.mjs` ×2 | **Run 1: 14/16** (2 FAIL osc-count, artefak timing — lihat §4); **Run 2: 16/16 PASS** |
| 5 | Determinisme | `MAKEFUN_OUTPUT_DIR=/tmp/turkey-v4-t1` vs `/tmp/turkey-v4-t2` + `out/` | **PASS — IDENTICAL** (`diff -r` kosong); dossier sha256 `8f041d24ef5ac693d32db45d60f140b47f79ca258d55b2b7e8eaa822d3582850` = klaim builder, **421.243 byte** |
| 6 | File tak tersentuh | `git diff 9bc422c HEAD -- game/src/config.js main.ts serve.ts shots.json vendor/` | **PASS — 0 baris** |
| 7 | Vendor | `sha256sum vendor/makefun-game.ts` vs kit starter | **PASS — `dc671875…` identik** dengan kit starter |
| 8 | Referensi http | `grep -rn "https\?://" game/` | **PASS — 0 referensi** |
| 9 | `makefun check` | kit turkey, `--repo … --worktree` | **4 passed / 1 failed `transcripts_present` (ekspektasi pre-bundle) / 15 skipped / 5 at submission** — sama seperti v2/v3 |
| 10 | Kode perubahan | baca `game/src/shots.js`, `render.js`, `world.js` | **PASS** — lihat §2 |

Catatan port: saat uji, port 8092 sudah dipakai server `node serve.ts --port 8092`
(pid 16391, sisa sesi lain) yang melayani direktori repo yang SAMA dengan
`render.js` bermd5 identik — playtest berjalan melawannya tanpa masalah.
Shoot (8091) dan probe (8093) memakai port bebas. `makefun check` tidak
menawarkan opsi port; berjalan normal.

## 2. Verifikasi klaim builder (kode dibaca, bukan dipercaya)

- **Kalkun lebih besar:** `game/src/shots.js:85` dan `:148` men-set
  `st.turkey.scale = 1.35` (cover + kitchen saja); `game/src/render.js:217`
  `const s = tk.scale || 1` — tidak ada tempat lain yang men-set scale
  (grep `scale` di kedua file hanya menunjukkan kedua baris itu + pisau).
  Jadi live play dan hitbox (`turkeyBox` di world.js) 100% tidak berubah.
  Hitungan kode: badan 68 × 1,35 = 91,8 ≈ 92 px — cocok dengan klaim.
  Perbandingan visual cover v3 (commit 9bc422c) vs v4: kalkun v4 jelas
  jauh lebih besar sebagai hero; jala petani kini dekat ekor.
- **Lompat berbekas:** `game/src/world.js:192` — 6 puff tetap
  `[[-14,-30,-50], …]` tanpa rng; `render.js` ghost saat airborne +
  debu di-stage di cover/kitchen. Terlihat di screenshot (debu di pangkal
  pagar cover + di atas oven kitchen; ghost halus di belakang kalkun).
- **Langit terisi:** `game/src/render.js:71-93` — burung + 7 daun
  (`leafColors` oranye/merah) di y 168–300, scroll dengan distance,
  deterministik. Terlihat di cover + kitchen.
- **Pisau lepas dari banner:** `shots.js` pisau cover/kitchen y→150.
  Di cover v4 pisau menggantung di tengah langit, jauh di bawah teks
  "SPOTTED! RUN!" dan garis bawahnya — terkonfirmasi visual (di v3
  ujung pisau menyentuh teks banner).
- **Playtest builder (3170 / 2 nyawa) vs saya (3285 / 1 nyawa):** jarak
  ESCAPED identik 1200,07 m; selisih skor/nyawa adalah varians autopilot
  (timing lompat), bukan cacat — outcome sama, restart sama (2,69 m).

## 3. Screenshot — dilihat langsung keempatnya

**1-cover.jpg — BAGUS.** SPOTTED! RUN! + frame merah + meter FARMER merah
utuh (elemen pemenang R3). Kalkun besar dan jelas sebagai hero; pisau bersih
dari banner; burung + daun mengisi pita langit; debu di pangkal pagar.
Satu kawanan burung duduk dekat paruh kalkun (KECIL-2); paruh kanan langit
masih lega (KECIL-3); jejak gerak halus (KECIL-1).

**2-title.jpg — BAGUS.** Komposisi utuh: GOBBLE DASH + subjudul + instruksi +
START THE RUN + best score 1250. Burung/daun halus di belakang overlay.

**3-kitchen.jpg — BAGUS.** Kalkun besar di atas oven; HOT! + glow oranye;
pisau bersih dari banner; rumah + asap; burung/daun; label DUCK! terbaca.

**4-escaped.jpg — BAGUS.** ESCAPED! + RUN AGAIN + "or press R" + FOREST GATE
+ Score 2900 · Best 2900 — end screen dengan restart lengkap (kriteria #1).

## 4. Probe run 1: 2 FAIL — artefak timing, bukan cacat game

Run 1: `FAIL gobble on start (3 osc) — osc=2` dan
`FAIL jump -> +1 osc — osc 2 -> 4`. Run 2 (tanpa perubahan kode):
keduanya PASS, total **16/16**. Pola yang SAMA sudah dicatat tester v2 dan
v3 (run 1 gagal, run ulang 16/16): penghitungan oscillator sensitif
terhadap timing — di run 1 osc ketiga gobble mendarat di jendela ukur
lompat sehingga jump terbaca +2, bukan +1. Suara bekerja; probe-nya yang
berpacu. Dicatat sebagai KECIL-4, bukan alasan menahan submit.

## 5. Skor mandiri per kriteria brief (§5) — v3 vs v4

| # | Kriteria | v3 | v4 | Alasan |
|---|---|---|---|---|
| 1 | Complete game, shown | 5 | **5** | Title + 2 run HUD + end screen restart — set lengkap |
| 2 | Fun & depth | 4 | **4** | Kejaran terbaca makin dekat (jala dekat ekor, kalkun besar); tetap 4 — hide/slide masih hanya label kecil, tanpa mekanik baru |
| 3 | Feel & polish | 4 | **5** | Lompat kini punya feedback VISUAL (debu takeoff + jejak gerak) di frame beku; SPOTTED! sudah visual sejak v3 |
| 4 | Look & originality | 4 | **4** | Langit terisi, kalkun besar, pisau bersih; tetap 4 — paruh kanan langit masih lega, art tetap flat vector, ghost halus di sel 140 px |
| 5 | Structure | 5 | **5** | Satu tugas per file dipertahankan |

**v4 tidak lebih jelek dari v3 di kriteria mana pun; #3 naik nyata.**

## 6. Cacat (semua KECIL — tidak membenarkan fixer sebelum final 09:00 WIB)

- **KECIL-1 (baru, kosmetik):** jejak gerak (motion ghost) cukup halus —
  terbaca jelas di frame penuh, tapi di sel kecil contact sheet (140 px)
  bisa menyatu dengan kipas ekor. Sinyal lompat yang lebih kuat adalah
  debu takeoff di pangkal pagar/oven.
- **KECIL-2 (baru, kosmetik):** satu kawanan burung di cover duduk dekat
  paruh kalkun (~320,252) — terbaca sebagai burung, tidak menyentuh
  kalkun, tapi sedikit meramaikan area hero.
- **KECIL-3 (baru, kosmetik):** paruh kanan pita langit cover (x 900–1150,
  y 150–280) masih cukup lega — hanya pisau + satu daun + tepi matahari.
- **KECIL-4 (artefak probe, bukan game):** probe run 1 gagal 2 cek
  osc-count karena timing; run ulang 16/16. Pola yang sama seperti v2/v3.
- **KECIL-5 (diwarisi v3):** `file://` tetap gagal (Chrome blokir ES
  module — pola bawaan kit, didokumentasikan di README). Main offline yang
  didukung: `node serve.ts` / harness make.fun; 0 request eksternal
  terverifikasi.

## 7. Tidak diuji

Bundle `makefun check --transcripts` + submit (tugas parent); penilaian
juri sesungguhnya. `makefun check` tanpa transkrip: 4 passed / 1 failed
(`transcripts_present`, ekspektasi pre-bundle) / 15 skipped / 5 at
submission — tidak diulang karena hasilnya sama dan bukan tugas tester.

## Rekomendasi

**Submit apa adanya.** v4 memperbaiki persis kelemahan yang ditargetkan
(#3 naik ke 5; pisau-banner tertutup; langit terisi; kalkun besar) tanpa
mengorbankan satu pun elemen pemenang R3. Langkah berikut: **sim-judge
v4 vs v3 (WAJIB sebelum submit)**, lalu push, bundle, submit sebelum
final 29 Nov 09:00 WIB. Safety net tersedia: `makefun final
turkey-run-game-01 01a2201c-aee0-74b3-9013-9874b3ac5509` dapat memilih v3
bila v4 terlihat lebih jelek.
