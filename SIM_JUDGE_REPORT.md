# SIM-JUDGE REPORT — turkey-run-game-01

- Model proxy: gemini-3-flash-preview (Gemini; BUKAN juri asli z-ai/glm-5.3-flash — sinyal RELATIF, bukan prediksi rank)
- NEW: /home/hatch/workspace/makefun/turkey-run-game
- OLD: /tmp/turkey-v3-old
- Panggilan Gemini: 2 (max 8/run) | token total: 18496
- Panel win rate NEW: 1.00 (1.0/1 duel)

## Verdict: WORTH SUBMIT

new beats old and wins a majority of the panel; submit, then keep the reasons below for the next round

## Duel

### NEW vs OLD

- call order NEW-first: winner NEW margin +1, deciding criterion #5; reason: The entries are visually identical and describe the same game. Entry A is chosen by a narrow margin because its outline shows a more complete project structure, including server and utility scripts.
  - k1: tie — Both entries show a complete game loop with title, gameplay, and end screens.
  - k2: tie — Both feature the same mechanics: jumping, sliding, and hiding across multiple stages.
  - k3: tie — Both show identical polish, HUD elements, and clear feedback for game states.
  - k4: tie — Both use the same original Thanksgiving-themed art and cohesive autumn palette.
  - k5: A — Entry A's outline includes additional project infrastructure like server and automation scripts.
- call order OLD-first: winner NEW margin +1, deciding criterion #2; reason: Entry B is a more developed version of the same game, with a larger source code size indicating additional depth and polish in the gameplay logic, while maintaining the same high-quality visuals and structure. The inclusion of automated judge reports and scripts in the outline further suggests a more complete and refined submission package.
  - k1: tie — Both entries present a complete and identical-looking turkey escape game with all required screens and HUD elements.
  - k2: B — Entry B has a larger source code footprint for the game logic (approx. 61KB vs 57KB), suggesting more depth in the simulation and obstacle variety.
  - k3: B — The additional code in Entry B likely contributes to better tuning and more refined gameplay mechanics, representing a more polished version of the game.
  - k4: tie — The visual assets and art style are identical in both entries, featuring a cohesive Thanksgiving theme and clear scene readability.
  - k5: tie — Both entries follow an excellent modular structure with clear separation of concerns across multiple source files.
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