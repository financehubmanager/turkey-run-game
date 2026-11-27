// Gobble Dash — every sound is synthesized with WebAudio at run time:
// no audio files ship with the game, so it stays silent on disk and
// offline in the browser. Sounds are short oscillator/noise envelopes.

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + dur);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function noise(dur, vol, lowpass) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    jump() { tone(420, 0.16, 'sine', 0.16, 760); },
    slide() { noise(0.18, 0.10, 900); },
    pickup() { tone(880, 0.09, 'triangle', 0.14, 1320); tone(1320, 0.12, 'triangle', 0.10, 1760); },
    gold() { [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'triangle', 0.13), i * 55)); },
    feather() { tone(520, 0.2, 'sine', 0.12, 1040); },
    stumble() { noise(0.25, 0.22, 500); tone(180, 0.25, 'sawtooth', 0.14, 70); },
    gobble() {
      // The turkey's own warble: three quick pitch drops.
      [0, 110, 230].forEach((delay) => setTimeout(() => tone(300, 0.11, 'square', 0.07, 140), delay));
    },
    spotted() { tone(196, 0.3, 'sawtooth', 0.12, 98); },
    caught() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.28, 'sawtooth', 0.13), i * 150)); },
    escaped() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.14), i * 130)); },
    stage() { tone(587, 0.12, 'triangle', 0.11); setTimeout(() => tone(784, 0.18, 'triangle', 0.11), 120); },
  };
}
