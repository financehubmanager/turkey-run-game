# TEST REPORT — Gobble Dash v3 (Turkey Run Game) — LAYAK SUBMIT

**Bounty:** make.fun `turkey-run-game-01` — $250, 20 tempat
**Repo lokal:** `~/workspace/makefun/turkey-run-game/`
**Tester:** sesi ini (independen), 28 Nov 2026 ~10:20–10:45 WIB
**Otorisasi:** "Otomasi penuh make.fun disetujui user 26 Nov 2026 22:22 WIB — watcher memindai tiap 30 menit dan menjalankan bounty lolos filter sampai SUBMIT tanpa persetujuan; revisi atas ranking jauh adalah aturan berdiri user 27 Nov 2026."
**Build yang diuji:** commit lokal `ad11a85` (builder v3), working tree bersih.
**Verdict: LAYAK SUBMIT — 0 KRITIS, 0 SEDANG, 3 KECIL.** Semua klaim BUILD_REPORT.md
terkonfirmasi lewat pengukuran ulang sendiri. Tidak ada cacat yang membenarkan fixer
sebelum cutoff ronde 3 (21:00 WIB 28 Nov).

## 1. makefun check — dijalankan sendiri (kit nested)

Dari `~/workspace/makefun/turkey-run-game-01-kit/turkey-run-game-01-kit/cli/makefun.mjs`:
**4 passed, 1 failed, 15 skipped, 5 dicek saat submission.** Sama persis dengan klaim
builder dan dengan v2. Satu-satunya failed adalah `transcripts_present` — ekspektasi
pre-bundle (bundle dibuat parent saat submit). Catatan dari output check: kit lokal
level 58 vs situs level 61 (hanya catatan, bukan kegagalan); entry deadline yang
ditulis check adalah 2026-11-29T02:00:00Z — cutoff ronde 3 (21:00 WIB 28 Nov) tetap
yang mengikat untuk penempatan ronde.

## 2. Determinisme + integritas — diukur sendiri

| Uji | Hasil |
| --- | --- |
| `main.ts` 2× (`/tmp/turkey-v3-t1` vs `/tmp/turkey-v3-t2`) | **IDENTICAL** (`diff -r` kosong) |
| dossier.json | sha256 `697ea57e6cabbd375d594765b18ffb26ded248c7a8c7cee76a70267bb75624a7`, **407.216 byte** — sama persis dengan klaim builder |
| `vendor/makefun-game.ts` | sha256 `dc671875…` = kit starter — **tidak disentuh** |
| `grep http://\|https://` di `game/` | **0** — tidak ada referensi eksternal |
| `config.js` (tuning) | tidak disentuh (diff v3 hanya `render.js` + `shots.js` + screenshot + BUILD_REPORT) |

## 3. Re-shoot independen — screenshot = hasil kode, byte-identik

`scripts/shoot.mjs` dijalankan sendiri di salinan repo (`/tmp/turkey-v3-shoot`, port 8093):
**shoot OK, 0 page error, keempat sha256 IDENTIK dengan yang di-commit** (cover
`08e85b15…`, title `9d5254a1…`, kitchen `4620cc69…`, escaped `111af1e9…`).
Screenshot yang diserahkan adalah render asli kode v3, bukan gambar lama.

## 4. Screenshot — dilihat langsung keempatnya

| File | Yang terlihat (pengamatan sendiri) |
| --- | --- |
| `1-cover.jpg` (1280×480, 54.940 B) | Banner **"SPOTTED! RUN!"** besar + frame merah di keempat tepi + meter **FARMER merah** + petani persis di belakang kalkun dengan jala terulur — kejaran TERBACA tanpa ambigu. Pisau besar (gagang cokelat + bilah perak runcing, tip-first) jelas sebagai pisau, tidak menyentuh HUD bar. Kalkun melompat pagar; label "HIDE! ↓" jelas; HUD lengkap. |
| `2-title.jpg` (1280×480, 72.919 B) | Byte-identical dengan v2, tidak berubah. "GOBBLE DASH", kincir terbaca sebagai kincir, tombol START THE RUN, instruksi, best 1250. |
| `3-kitchen.jpg` (1280×480, 66.508 B) | Pisau besar di kanan atas, **lepas dari cakram matahari**; oven dengan **glow oranye + "HOT!" ber-outline gelap** terbaca sebagai oven panas; banner "THE KITCHEN YARD" utuh; "DUCK!" di atas laundry line; HUD 940/1200 m, SCORE 1900. |
| `4-escaped.jpg` (1280×480, 65.986 B) | Label **"FOREST GATE" kini di atas kanopi pohon** — tidak lagi menimpa elips pohon kiri (KECIL-A v2 tertutup). "ESCAPED!" hijau, Score 2900, "RUN AGAIN" + "or press R". |

**Catatan akurasi klaim builder:** builder menulis jala "hampir menyentuh ekor kalkun".
Di frame render, jarak jala ke ekor ≈ 40 px pada lebar 1280 (≈3% lebar frame) — dekat
dan terbaca mengejar, tapi tidak benar-benar nyaris menyentuh. Bukan cacat; klaimnya
sedikit berlebihan, efek visualnya tercapai.

**Klaim pisau live tidak berubah — terverifikasi dari kode:** `config.js:43`
`knife: { width: 34, height: 70 }` dan spawn di `world.js:84-87` memakai
`def.width/def.height` itu; scale render `ks = h/70` (`render.js`) = 1,0 untuk pisau
live, 1,31 hanya untuk shot staged (44×92). Render live tidak berubah.

## 5. Playtest live — dijalankan sendiri (headless Chromium)

`scripts/probe-playtest.mjs` (port 8094), autopilot, run saya sendiri:
**ESCAPED 1200 m, skor 3210, 3 nyawa** (builder: 4120 — variansi autopilot, keduanya
ESCAPED); restart (R) → play, distance 2,8 m, over null; **0 console/page error;
0 external request** (bukti main offline — finalist review memainkannya offline).
Title → play → pause → play semua transisi benar.

## 6. Probe feedback v2 — dijalankan sendiri 3×

`scripts/probe-v2-feedback.mjs` (16 cek):
- **Run 1: 2 FAIL** (cek oscillator-count awal — gobble/jump; semua cek SPOTTED,
  goldcorn, feather, dan 0 error PASS).
- **Run 2: 16/16 PASS. Run 3: 16/16 PASS.**
- Penilaian: pola yang sama persis seperti tester v2 (run 1: 14/16, run 2: 16/16).
  Penghitungan oscillator sensitif timing; suara TERBUKTI berbunyi di semua run
  (jump/gobble/SPOTTED/goldcorn/feather semua menambah osc). Bukan cacat game,
  dicatat sebagai observasi.

## 7. Penilaian terhadap brief juri (kriteria berurut, §5 turkey)

| # | Kriteria | v2 | v3 | Alasan |
| --- | --- | --- | --- | --- |
| 1 | Complete game, shown | 5 | 5 | Title + 2 run HUD + end screen restart; pisau + oven kini benar-benar terbaca sebagai ancaman bernama di brief |
| 2 | Fun & depth | 4 | 4 | Kejaran kini TERLIHAT di cover (petani dekat + SPOTTED! + meter merah) — perbaikan utama v3 tercapai; tetap 4 karena hide/slide masih hanya lewat label kecil |
| 3 | Feel & polish | 4 | 4 | SPOTTED! kini terlihat di cover (banner + frame + meter merah), bukan hanya bersuara — keuntungan nyata; tetap 4 karena lompat tanpa efek visual khusus (KECIL-2) dan ujung pisau menyentuh teks banner (KECIL-1) |
| 4 | Look & originality | 4 | 4 | Pisau/oven/HOT!/label gerbang membaik; tetap 4 karena pita langit tengah masih kosong di cover + kitchen dan kalkun masih kecil di frame |
| 5 | Structure | 5 | 5 | Satu tugas per file dipertahankan; perubahan terkurung di render.js (visual) + shots.js (staging) |

**Apakah v3 menjawab kelemahan yang terlihat juri? Ya, pada dua titik yang didiagnosis
builder.** v2 kalah duel terutama di #4 (look) dan #2 (kejaran tak terlihat); v3
menarget persis keduanya dengan perubahan yang terlihat di frame terbesar (cover).
Yang tidak dikejar v3 (kalkun lebih besar, efek lompat, isi langit tengah) adalah
pekerjaan staging/skala yang lebih besar — benar tidak dipaksakan sebelum cutoff.

## Cacat (semua KECIL — jangan perbaiki sebelum cutoff 21:00 WIB)

- **KECIL-1 (diakui builder, terkonfirmasi):** ujung pisau menyentuh teks banner —
  cover: ujung di antara "SPOTTED!" dan "RUN!" (menyentuh tepi atas huruf); kitchen:
  ujung menyentuh atas huruf "D" pada "YARD". Teks tetap sepenuhnya legibel di
  kedua shot. Kosmetik.
- **KECIL-2 (diwarisi v2):** lompat tanpa efek visual khusus (hanya animasi kalkun;
  partikel debu hanya saat mendarat). Suara sudah ada; efek tambahan butuh staging
  ulang shot — risiko > manfaat sebelum cutoff.
- **KECIL-3 (diwarisi v2):** `file://` tetap gagal (Chrome blokir ES module — pola
  bawaan kit, didokumentasikan di README). Main offline yang didukung: `node serve.ts`
  / harness make.fun; 0 request eksternal terverifikasi.
- **Observasi (bukan cacat):** probe oscillator-count flaky di run pertama (2 FAIL,
  lalu 16/16 di dua run berikutnya). Pola sama seperti v2.
- **Observasi (bukan cacat):** pita langit tengah masih kosong di cover + kitchen;
  kalkun masih kecil di frame — sudah tercermin di skor #4 = 4.

## Tidak diuji

Sim-judge (gerbang parent), bundle `makefun check --transcripts` + push + submit
(tugas parent); penilaian juri sesungguhnya.

## Rekomendasi

Submit apa adanya — tidak ada cacat yang membenarkan fixer sebelum cutoff ronde 3
(21:00 WIB 28 Nov). Langkah berikut tetap milik parent: sim-judge v3 vs v2, push
(via PAT — screenshot berubah byte-nya dan HARUS ada di remote), bundle, submit.
