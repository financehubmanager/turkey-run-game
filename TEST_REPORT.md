# TEST REPORT — Gobble Dash: The Great Turkey Escape

**Bounty:** make.fun `turkey-run-game-01` — "Make the best turkey escape game"
**Repo lokal:** `~/workspace/makefun/turkey-run-game/` (commit `0fcf7a4` + `7538622` BUILD_REPORT.md)
**Tester:** independen, sesi ini (dimulai setelah bounty dibuka 02:00Z — thinking_in_window aman)
**Tanggal:** 27 Nov 2026, ~09:40–10:15 WIB
**Metode:** playtest tangan di headless Chromium (Playwright, input keyboard sungguhan,
poll 100 ms, reaksi ~200 px — timing manusia, bukan autopilot sempurna), probe
WebAudio via instrumentasi AudioContext, `makefun check`, determinisme `main.ts` 2x,
re-shoot keempat screenshot dari kode saat ini, dan diff vs kit starter.

## Verdict: PERLU PERBAIKAN

**0 KRITIS, 1 SEDANG, 6 KECIL.** Game lengkap dan bisa dimainkan sampai tamat;
satu-satunya cacat berdampak nyata adalah suara lompat/slide yang tidak pernah
berbunyi (SEDANG-1). Sisanya kosmetik/dokumentasi. Tidak ada yang menghalangi
submit secara teknis — tapi SEDANG-1 layak diperbaiki dulu karena kriteria juri
no. 3 (feel/polish, sound) dan karena lompat adalah aksi tersering pemain.

## Defect

### SEDANG

**SEDANG-1 — Suara lompat dan slide tidak pernah berbunyi (dead code).**
- Bukti kode: `audio.jump()` dan `audio.slide()` didefinisikan di
  `game/src/audio.js` tapi **tidak pernah dipanggil di mana pun**.
  `game/src/main.js:109-122` hanya memanggil `unlock, gobble, pickup,
  stumble, stage, caught, escaped`. `grep -rn 'audio\.' game/src/*.js`
  mengonfirmasi: nol call-site untuk `jump`/`slide` (juga `gold`,
  `feather`, `spotted` tidak terpakai).
- Bukti perilaku (instrumentasi `AudioContext.prototype.createOscillator` /
  `createBufferSource` sebelum game dimuat):
  - Setelah klik START: 3 oscillator (gobble pembuka) — OK.
  - Setelah 1× lompat: tetap 3; setelah double jump: tetap 3
    (seharusnya +1 tiap lompat bila terhubung).
  - Setelah slide (tahan ↓ 500 ms): 0 buffer source (seharusnya +1 noise).
  - Kontrol positif: corn pickup yang dipaksa menabrak kalkun menambah
    +2 oscillator — jalur suara pickup terbukti jalan, jadi yang hilang
    memang hanya pemicunya, bukan mesin suaranya.
- Dampak: aksi tersering pemain (lompat, puluhan kali per run) sunyi;
  BUILD_REPORT.md mengklaim "Synthesized WebAudio sounds (gobble, **jump**,
  pickup, stumble, fanfares)" — klaim jump itu tidak benar.
- Perbaikan yang disarankan (fixer): picu `audio.jump()` saat lompat
  (mis. di loop `main.js` bila `pressed.jump` diterima di layar play, atau
  tambah event JUMP dari `world.step`), dan `audio.slide()` saat slide
  dimulai. Bukan ranah tester — jangan ubah apa pun di sini.

### KECIL

**KECIL-1 — Siluet windmill di title screen terbaca seperti salib polos.**
- `game/src/render.js:80-91`: 4 bilah tipis (8×52 px) berputar di poros.
  Di `screenshots/2-title.jpg` (t=1250) bilahnya jatuh mendekati diagonal
  dan membentuk tanda tambah/salib, bukan kincir. Terkonfirmasi dari
  screenshot, sesuai catatan builder. Tidak rusak, tapi pembaca cepat
  (juri) tidak akan mengenali ini sebagai windmill.

**KECIL-2 — Pisau jatuh menembus teks banner di screenshot kitchen.**
- `screenshots/3-kitchen.jpg`: pisau yang di-stage di `game/src/shots.js`
  (x=520, y=60) jatuh tepat menembus huruf "THE KITCHEN YARD".
  Komposisi sedikit canggung; game-nya sendiri tidak rusak.

**KECIL-3 — README badge tidak menyebut owner.**
- `README.md:3` hanya badge generik shields.io `make.fun-turkey--run--game--01`.
  Entry lain (mis. news-image, budget-site) memakai badge rank/reward
  make.fun dengan path owner `financehubmanager/<repo>`. Tidak memengaruhi
  grading (badge hidup setelah submit), tapi tidak konsisten dengan
  konvensi repo lain.

**KECIL-4 — README mengklaim `game/index.html` bisa dibuka langsung, padahal gagal di Chrome.**
- `README.md`: "Open `game/index.html` in a desktop browser".
  Terverifikasi: dibuka via `file://`, Chrome memblokir ES module
  (`CORS policy ... Cross origin requests are only supported for protocol
  schemes: ... http, https ...`, `window.GOBBLE` tidak termuat).
  Ini bawaan pola kit (module script), bukan bug game — main lewat
  `node serve.ts` jalan sempurna. Perbaiki wording README saja.

**KECIL-5 — Cover: pisau jatuh mirip pesawat kertas; label "HIDE!" kontras rendah.**
- `screenshots/1-cover.jpg`: pisau di tengah atas (putih-biru pucat,
  miring) sekilas terbaca seperti pesawat kertas, bukan pisau ukir.
  Label `HIDE! ↓` putih di atas langit oranye (`render.js:362`,
  `#fff8e6`) agak sulit dibaca. Keduanya minor; cover secara keseluruhan
  tetap padat dan terbaca.

**KECIL-6 — Mekanik hide (haystack) jarang sekali muncul secara alami.**
- Observasi: haystack TIDAK ada di `SPAWN_TABLES` (`config.js`) — hanya
  muncul lewat roll 16% pasca-obstacle (`world.js`, `spawnObstacle`).
  Dalam ~496 m permainan dengan gap dipaksa rendah (50), tidak satu pun
  kesempatan hide alami teramati. Hide adalah mekanik unggulan
  (kriteria juri no. 2 menyebut "hiding") tapi sebagian besar run mungkin
  tidak pernah menampilkannya. Bukan bug — saran tuning untuk fixer:
  pertimbangkan bobot haystack di tabel spawn.

## Hasil playtest tangan (headless Chromium, keyboard sungguhan)

| Uji | Hasil |
| --- | --- |
| Title → klik START | PASS — layar `play`, AudioContext `running` setelah klik pertama, 0 AudioContext sebelum interaksi |
| Full run, reaksi manusia (~200 px, poll 100 ms) | **ESCAPED 1200 m**, skor 3310, 2 nyawa tersisa, 1 stumble (di 803 m, awal Kitchen), 15 double jump terpakai, slide terpakai (27 tick), stage 2 tercapai, gap minimum 270 |
| Kitchen stage di kecepatan penuh | Adil — hanya 1 stumble di awal stage, lalu bersih sampai 1200 m. Tidak terlalu padat untuk pemain yang bereaksi wajar |
| Lompat / double jump / slide / hide | Semua berfungsi; double jump menyelamatkan dari rintangan bertumpuk (15× terpakai); slide melewati laundry line tanpa stumble |
| Pause saat lompat (P di udara) | PASS — layar `paused`, posisi y membeku 202 → 202 selama 400 ms, status airborne terjaga; P lagi = resume, game lanjut |
| Restart dari pause (P lalu R) | PASS — layar `play`, distance reset (<5 m) |
| Restart dari end screen (R) | PASS — `play`, distance 3,5 m, `over=null` |
| Esc = pause | PASS |
| Mute toggle (M) | PASS, terverifikasi via jumlah oscillator: pickup +2 saat unmuted, +0 saat muted, +2 lagi setelah un-mute |
| Hide saat farmer gap < 90 | PASS (haystack dipaksa masuk state): gap 51 → 112 (+60 bonus + drift), `hidden=true`, banner "HIDDEN IN THE HAY!", tidak stumble, 3 nyawa utuh |
| Suara setelah klik pertama | PASS — AudioContext dibuat + `running` setelah klik START; gobble/pickup/stumble/stage/fanfare berbunyi (lihat SEDANG-1 untuk lompat/slide) |
| `?shot=caught` | PASS — layar CAUGHT tampil benar (petani memegang kalkun, "RUN AGAIN", "or press R") |
| Console / page error saat main via server | **0** error, **0** request di luar localhost |
| Buka langsung `file://` | GAGAL (Chrome blokir ES module, CORS) — lihat KECIL-4; bukan jalur main yang didukung |

## Verifikasi independen klaim builder

| Gate | Hasil |
| --- | --- |
| `makefun check` (`--kit turkey-run-game-01-kit --repo … --worktree`) | **4 passed** (`competition_open`, `snapshot` 23 file / 385.230 byte, `license_osi` MIT, `entrypoint` main.ts → node22), **1 failed** `transcripts_present` — ekspektasi, bundle dibuat saat submit; 15 skipped, 5 dicek saat submission (repo belum ada — sesuai desain tahap ini). Catatan check: kit lokal level 53, situs level 58 |
| Determinisme `main.ts` 2× (`/tmp/t1` vs `/tmp/t2`) | **PASS — IDENTICAL** (`diff -r` kosong). `dossier.json` sha256 `c28aae77d8a6616c36c5b321d9d7f56bc7664b3ca24b2b388f44395ac801d123` — **cocok dengan klaim builder**, 393.445 byte (< 1,5 MiB) |
| Batas gate | game/ **52.107 byte, 9 file** (≤48 MiB / ≤993); **0 symlink**; **0 referensi `http://`/`https://`** di game/ (grep bersih); screenshot 50.420 / 72.378 / 65.237 / 65.888 byte (≤256 KiB), semua 1280×480 |
| `vendor/makefun-game.ts` | **Tidak diubah** — sha256 `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129`, identik dengan kit starter (turkey kit maupun kit utama) |
| Screenshot = render asli kode | **PASS** — re-shoot dari salinan repo ke direktori sementara menghasilkan keempat JPG **byte-identical** (sha256 sama) dengan yang diserahkan |
| Originalitas vs kit starter ("Turkey Dodge") | Game logic orisinal: `world.js` 8/310 baris sama, `render.js` 4/539, `config.js` 3/78 (boilerplate sepele). Yang banyak sama hanya scaffold yang memang diinstruksikan kit: `main.ts` 29/39, `serve.ts` 46/60, `index.html` 15/20. Dossier jelas berbeda dari house game |
| Kelengkapan deliverable | LICENSE MIT (SPDX) ✓ · README + badge ✓ (lihat KECIL-3) · `.makefun/owner.json` wallet `5XrS76uzjrhf9pyMBVQpfL1SpyxX7Dk8vyFUncED2o39` ✓ · `main.ts` di root ✓ · `game/index.html` playable offline via server, 0 request eksternal ✓ · git lokal 2 commit (`0fcf7a4`, `7538622`), working tree bersih ✓ |

## Kritikus visual (sudut pandang juri: hanya contact sheet + outline source)

- **1-cover.jpg — bagus.** Padat dan terbaca walau dikecilkan: kalkun
  melompat pagar, petani + jala di kiri, pumpkin, haystack, jejak corn,
  pisau jatuh, HUD lengkap (skor, best, progress 275/1200 m, nyawa,
  meter FARMER). Tema "kalkun lari dikejar petani" langsung kebaca.
  Minus kecil: KECIL-5.
- **2-title.jpg — bagus.** Judul "GOBBLE DASH" besar dan kontras, cerita +
  kontrol + tombol START merah jelas. Minus: KECIL-1 (windmill = salib).
- **3-kitchen.jpg — bagus.** Oven + label "HOT!", pisau jatuh, rolling
  pin, laundry line + "DUCK!", banner stage, HUD 940/1200 m — stage
  Kitchen langsung dikenali. Minus: KECIL-2 (pisau menembus banner).
- **4-escaped.jpg — bagus.** "ESCAPED!" hijau besar, forest gate dengan
  dua pohon, kalkun di gerbang, skor 2900, tombol RUN AGAIN. End screen
  terbaca sempurna.
- **CAUGHT (tidak diserahkan, dicek terpisah) — bagus.** "CAUGHT!" merah,
  petani memegang kalkun di cornfield, teks + tombol jelas.
- Perbandingan dengan ekspektasi juri (kalkun lari, petani mengejar,
  oven + pisau ukir terlihat): **semua unsur ada dan terlihat** di
  keempat screenshot. Tidak ada elemen yang tampak rusak.

## Scorecard

| Aspek | Skor | Catatan |
| --- | --- | --- |
| Gameplay | 8/10 | Loop lengkap dan adil; double jump + slide + hide semua berfungsi; kitchen tidak over-dense. Minus: lompat/slide sunyi (SEDANG-1), hide jarang muncul (KECIL-6) |
| Visual / judge-readability | 8/10 | Cover padat, keempat screenshot masing-masing jelas menunjukkan gamenya; palet autumn koheren. Minus: windmill = salib, pisau menembus banner, pisau cover ambigu |
| Kelengkapan | 9/10 | Semua deliverable ada; README badge + wording file:// kurang tepat |
| Determinisme | 10/10 | main.ts 2× byte-identical; screenshot re-shoot byte-identical; dossier sha256 cocok dengan klaim |

## Catatan untuk fixer (bukan defect)

1. Perbaiki SEDANG-1 dulu; KECIL-1/2/5 bila sempat (semuanya visual murni,
   tidak mengubah gameplay). KECIL-3/4 hanya README.
2. Setelah perbaikan apa pun pada `game/src/`, screenshot HARUS di-shoot
   ulang (`scripts/shoot.mjs`) dan `main.ts` dijalankan ulang — dossier
   dan screenshot terikat byte-identical dengan kode.
3. Jangan sentuh `vendor/makefun-game.ts`.
