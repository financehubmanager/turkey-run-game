# SIM-JUDGE REPORT — turkey-run-game-01

- Model proxy: gemini-3.5-flash (Gemini; BUKAN juri asli z-ai/glm-5.3-flash — sinyal RELATIF, bukan prediksi rank)
- NEW: /home/hatch/workspace/makefun/turkey-run-game
- OLD: /tmp/turkey-v2-old
- Panggilan Gemini: 2 (max 8/run) | token total: 10937
- Panel win rate NEW: 1.00 (1.0/1 duel)

## Verdict: WORTH SUBMIT

new beats old and wins a majority of the panel; submit, then keep the reasons below for the next round

## Duel

### NEW vs OLD

- call order NEW-first: winner NEW margin +1, deciding criterion #3; reason: Entry A edges out Entry B on polish by adding prominent on-screen state feedback ('SPOTTED! RUN!') to clearly notify the player when detected.
  - k1: tie — Both entries are fully complete turkey escape games with title screens, HUDs, gameplay, and end screens.
  - k2: tie — Both entries feature identical game mechanics, hiding spots, stage progression, and hazards.
  - k3: A — Entry A adds clearer visual state alerts ('SPOTTED! RUN!') when detected by the farmer, improving feedback.
  - k4: tie — Both share the same autumn palette, vector graphics, and visual layout.
  - k5: tie — Both feature clean modular source code layouts.
- call order OLD-first: winner NEW margin +1, deciding criterion #3; reason: Entry B improves on Entry A in Criterion 3 (Feel & Polish) by introducing clear visual alert overlays ('SPOTTED! RUN!') during key game state changes, making player feedback much clearer.
  - k1: tie — Both entries feature a complete playable turkey escape game with HUD, menu, and end screen.
  - k2: tie — Both entries share the same mechanics including jumping, sliding, hiding, and stage transitions.
  - k3: B — Entry B adds explicit screen alert overlays ('SPOTTED! RUN!') for clearer visual feedback.
  - k4: tie — Both entries use identical visual art style and autumn color palette.
  - k5: tie — Both entries feature clean source outlines organized neatly per module.
- **hasil duel: NEW (avg margin +1.0)**

## Framing yang direplikasi (RULES.txt kit, dossier-view/v1)

- Contact sheet: cover di atas muat 768x480, sisanya sebaris di bawah di sel kecil (140px), tidak pernah diperbesar; satu JPEG per entry.
- Outline: outline.txt bila ada, else teks dossier.json dipotong ~3.500 karakter, else daftar file + deklarasi pertama.
- Duel: tanpa seri, margin 1-5, 2 panggilan (dua urutan), skor = rata-rata; kriteria pertama yang berbeda memutuskan kecuali kriteria berikut berbeda jauh lebih besar.

## Batasan jujur

- Model proxy (Gemini) seleranya BERBEDA dari juri asli (GLM-5.3-flash). Sim mengukur 'apakah revisi mengalahkan versi lama / referensi DI MATA MODEL INI', bukan rank asli.
- 4 anchor house tidak diketahui (screenshot/dossier mereka tidak tersedia), jadi tidak ada kalibrasi win rate absolut.
- Dinamika playoff/Swiss (Thankful: 3 game Swiss tidak cukup masuk playoff) tidak bisa disimulasikan dari duel.
- 1-2 duel per pasangan = sampel kecil; ulangi panel bila hasilnya split/imbang sebelum mengambil keputusan submit.