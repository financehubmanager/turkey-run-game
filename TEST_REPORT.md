# TEST REPORT — Gobble Dash v2 (Turkey Run Game) — LAYAK SUBMIT

**Bounty:** make.fun `turkey-run-game-01` — $250, 20 tempat
**Repo lokal:** `~/workspace/makefun/turkey-run-game/`
**Tester:** sesi ini (independen), 28 Nov 2026 ~05:30–06:00 WIB
**Persetujuan user:** "User menyetujui revisi Turkey v2 pada 28 Nov 2026 05:18 WIB — memilih 'Ya, buat revisi Turkey v2' di chat make.fun; uji sampai selesai tanpa konfirmasi lagi."
**Build yang diuji:** commit lokal `00c1e7b` (builder v2), working tree bersih.
**Verdict: LAYAK SUBMIT — 0 KRITIS, 0 SEDANG, 3 KECIL.** Tidak ada cacat yang membenarkan fixer sebelum cutoff ronde 2 (09:00 WIB 28 Nov).

Semua klaim BUILD_REPORT.md diukur ulang sendiri, bukan dipercaya. Yang tidak bisa saya verifikasi dari BUILD_REPORT: tidak ada — semua klaim utama terkonfirmasi.

## 1. makefun check — dijalankan sendiri (kit nested)

Kit ternyata NESTED: `~/workspace/makefun/turkey-run-game-01-kit/turkey-run-game-01-kit/cli/makefun.mjs`
(panggilan dari level luar gagal `MODULE_NOT_FOUND` — bukan cacat entry, hanya path kit).
Dari kit yang benar: **4 passed, 1 failed, 15 skipped, 5 dicek saat submission.**
Satu-satunya failed adalah `transcripts_present` — ekspektasi pre-bundle (bundle dibuat parent
saat submit). Sama persis dengan klaim builder.

## 2. Determinisme + integritas — diukur sendiri

| Uji | Hasil |
| --- | --- |
| `main.ts` 2× (MAKEFUN_OUTPUT_DIR=/tmp/turkey-t1, /tmp/turkey-t2) | **IDENTICAL** (`diff -r` kosong) |
| dossier.json | sha256 `995f4cd36f667447a16574683309225759f364186d929707c19d1019678a1b4e`, **398.451 byte** — sama persis dengan klaim builder |
| Direktori builder (/tmp/turkey-v2-d1 vs d2) | IDENTICAL (diff kosong) |
| `vendor/makefun-game.ts` | sha256 `dc671875…` = kit starter (`starter/vendor/makefun-game.ts`) — **tidak disentuh** |
| `grep http://\|https://` di `game/` | **0** — tidak ada referensi eksternal |

## 3. Probe feedback v2 — dijalankan sendiri 2×

`scripts/probe-v2-feedback.mjs`:
- **Run 1: 14/16** — FAIL "gobble on start (3 osc)" (osc=2) dan FAIL "jump -> +1 osc" (osc 2→4).
- **Run 2: 16/16 PASS** — semua lolos, termasuk SPOTTED banner + suara +1 osc,
  frame merah sudut (rgb 177,69,43), SPOTTED sekali + re-arm, goldcorn +4 osc,
  feather +1 nyawa + banner '+1 LIFE!' + suara, 0 console/page error, 0 request non-localhost.
- Penilaian: kedua FAIL run 1 adalah **flakiness penghitungan oscillator yang sensitif timing**
  (suara TERBUKTI berbunyi — jump menambah osc, gobble menambah osc; hanya jumlah pastinya
  bergeser antar-run), bukan cacat game. Bukan alasan menahan submit; dicatat sebagai observasi.

## 4. Screenshot — dilihat langsung keempatnya

| File | Yang terlihat (pengamatan sendiri) |
| --- | --- |
| `1-cover.jpg` | Kalkun melompat pagar; petani + jala di kiri; pisau jatuh terbaca sebagai pisau (handle gelap + bilah runcing, tip-first); label "HIDE! ↓" jelas; HUD lengkap (SCORE 1250, BEST 1250, 275/1200 m, THE FARMYARD, 3 nyawa, meter FARMER). |
| `2-title.jpg` | "GOBBLE DASH — The Great Turkey Escape"; kincir 4 bilah + vane — langsung terbaca sebagai kincir, bukan salib; tombol "START THE RUN"; instruksi; best 1250. |
| `3-kitchen.jpg` | Banner "THE KITCHEN YARD" utuh; oven "HOT!"; rolling pin; laundry line "DUCK!"; pisau di kanan atas (x≈1010) — TIDAK menembus banner; HUD 940/1200 m, SCORE 1900. |
| `4-escaped.jpg` | "ESCAPED!" hijau; forest gate + kalkun; Score 2900; tombol "RUN AGAIN" + "or press R". Set shot lengkap per kriteria #1: title + 2 run HUD + end screen restart. |

**Frame SPOTTED (dari probe saya sendiri, /tmp/turkey-v2-spotted.png) — dilihat langsung:**
Banner "SPOTTED! RUN!" besar di tengah + frame merah di keempat tepi + petani persis di
belakang kalkun + meter FARMER merah. **Terbaca tanpa ambigu sebagai peringatan, bukan bug.**

## 5. Playtest live — dijalankan sendiri (headless Chromium)

`scripts/probe-playtest.mjs`, autopilot, run saya sendiri:
**ESCAPED 1200 m, skor 4285, 3 nyawa** (builder: 3885/2 nyawa — variansi autopilot,
keduanya ESCAPED); restart (R) → play, distance 3,15 m, over null; **0 console/page error;
0 external request** (bukti main offline — finalist review memainkannya offline).
SPOTTED, suara jump/slide, dan pickup berbeda terverifikasi lewat probe §3 di atas.

## 6. Temuan builder yang saya konfirmasi (penting untuk push)

Remote HEAD terverifikasi masih **`6aedab7` "Add screenshot 4-escaped"** — sama dengan commit
yang di-submit v1. Jadi `b3f2df6` (suara lompat/slide, windmill, pisau, HIDE!, haystack),
`3d3d056`, dan `00c1e7b` (v2) **semuanya hanya lokal, belum pernah di-push**. Ronde 1
(1518/4864, 55,5%) menilai game TANPA perbaikan itu. v2 mengirim semuanya sekaligus —
lonjakan kualitas v1→v2 lebih besar dari "revisi kecil".

## Skor mandiri per kriteria brief (1–5)

| # | Kriteria | Skor | Alasan |
| --- | --- | --- | --- |
| 1 | Complete game, shown | 5 | Title + 2 run HUD + end screen restart; semua unsur (kalkun, petani, oven, pisau) terlihat di set |
| 2 | Fun & depth | 4 | Lompat/double-jump/slide/hide + 3 stage makin sulit + SPOTTED menambah ketegangan saat farmer dekat |
| 3 | Feel & polish | 4 | Semua feedback kini bersuara (jump, slide, pickup, gold, feather, stumble, stage, hide, spotted, caught, escaped) + visual (shake, flash merah, frame merah SPOTTED, banner). Tahan di 4: lompat tanpa efek visual khusus (KECIL-C) |
| 4 | Look & originality | 4 | Windmill/pisau/HIDE! terverifikasi terbaca; palet autumn koheren; art sendiri. Minus: KECIL-A/B |
| 5 | Structure | 5 | Satu tugas per file dipertahankan; event baru terpisah bersih (config/world/main/render) |

## Cacat (semua KECIL — jangan perbaiki sebelum cutoff 09:00 WIB)

- **KECIL-1 (diwarisi builder, terkonfirmasi):** label "FOREST GATE" di `4-escaped.jpg`
  sedikit menimpa elips pohon kiri gerbang (teks di atas dedaunan). Kosmetik, makna tidak kabur.
- **KECIL-2 (diwarisi builder, terkonfirmasi):** pisau jatuh di `1-cover.jpg` ujungnya
  menyentuh area progress bar HUD (x≈560, y≈40). Terbaca sebagai jatuh dari langit, bukan merusak.
- **KECIL-3 (diwarisi builder, terkonfirmasi):** lompat tanpa efek visual khusus (hanya animasi
  kalkun; partikel debu hanya saat mendarat). Suara sudah ada; efek tambahan butuh staging
  ulang shot — risiko > manfaat sebelum cutoff.
- **Observasi (bukan cacat):** probe oscillator-count flaky (run 1: 14/16, run 2: 16/16).
  Penghitungan osc sensitif timing; suara terbukti berbunyi di semua run.

## Tidak diuji

Bundle `makefun check --transcripts` + submit (tugas parent); penilaian juri sesungguhnya.

## Rekomendasi

Submit apa adanya — tidak ada cacat yang membenarkan fixer sebelum cutoff ronde 2 (09:00 WIB).
