// ─── Lo-fi Beat Generator ─────────────────────────────────────────────────────
// Generates lo-fi hip-hop style beats entirely via Web Audio API.
// No audio files — everything is synthesized.

const BPM = 75;
const BEAT_MS = (60 / BPM) * 1000; // ~800ms per beat
// bar = 4 beats (~3200ms)

// Jazzy chord progressions (MIDI-style note frequencies)
const CHORDS = [
  [261.6, 329.6, 392.0, 466.2],  // Cmaj7
  [220.0, 277.2, 329.6, 415.3],  // Am7
  [246.9, 311.1, 370.0, 440.0],  // Bm7b5 → Dm-ish
  [196.0, 246.9, 293.7, 370.0],  // G7
];

export class LofiPlayer {
  #ctx: AudioContext;
  #masterGain: GainNode;
  #intervalId: ReturnType<typeof setInterval> | null = null;
  #chordOscs: OscillatorNode[] = [];
  #chordGain: GainNode | null = null;
  #crackleSource: AudioBufferSourceNode | null = null;
  #beat = 0;
  #bar = 0;

  constructor(ctx: AudioContext) {
    this.#ctx = ctx;
    this.#masterGain = ctx.createGain();
    this.#masterGain.gain.value = 0.2;
    this.#masterGain.connect(ctx.destination);
  }

  start(): void {
    this.stop();
    this.#beat = 0;
    this.#bar = 0;
    this.#startChordPad();
    this.#startCrackle();
    this.#playBeat(); // play immediately
    this.#intervalId = setInterval(() => this.#playBeat(), BEAT_MS);
  }

  stop(): void {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    this.#stopChordPad();
    this.#stopCrackle();
  }

  setVolume(v: number): void {
    this.#masterGain.gain.setTargetAtTime(v, this.#ctx.currentTime, 0.05);
  }

  dispose(): void {
    this.stop();
    this.#masterGain.disconnect();
  }

  // ── Kick drum ──────────────────────────────────────────────────────────────

  #playKick(): void {
    const ctx = this.#ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.#masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // ── Hi-hat ─────────────────────────────────────────────────────────────────

  #playHiHat(): void {
    const ctx = this.#ctx;
    const now = ctx.currentTime;
    const len = 512;

    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    source.connect(hp);
    hp.connect(gain);
    gain.connect(this.#masterGain);
    source.start(now);
    source.stop(now + 0.06);
  }

  // ── Snare (soft, lo-fi) ────────────────────────────────────────────────────

  #playSnare(): void {
    const ctx = this.#ctx;
    const now = ctx.currentTime;

    // Noise component
    const len = 1024;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilt = ctx.createBiquadFilter();
    noiseFilt.type = 'bandpass';
    noiseFilt.frequency.value = 3000;
    noiseFilt.Q.value = 0.8;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(noiseFilt);
    noiseFilt.connect(noiseGain);
    noiseGain.connect(this.#masterGain);
    noise.start(now);
    noise.stop(now + 0.15);

    // Tone component
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.#masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // ── Chord pad ──────────────────────────────────────────────────────────────

  #startChordPad(): void {
    const ctx = this.#ctx;
    const chord = CHORDS[this.#bar % CHORDS.length];

    const gain = ctx.createGain();
    gain.gain.value = 0.06;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800;
    lp.Q.value = 0.5;
    lp.connect(gain);
    gain.connect(this.#masterGain);

    this.#chordGain = gain;
    this.#chordOscs = chord.map(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      // Slight detune for warmth
      osc.detune.value = (Math.random() - 0.5) * 12;
      osc.connect(lp);
      osc.start();
      return osc;
    });
  }

  #stopChordPad(): void {
    for (const osc of this.#chordOscs) {
      try { osc.stop(); osc.disconnect(); } catch { /* ignore */ }
    }
    this.#chordOscs = [];
    this.#chordGain?.disconnect();
    this.#chordGain = null;
  }

  #changeChord(): void {
    this.#stopChordPad();
    this.#startChordPad();
  }

  // ── Vinyl crackle ──────────────────────────────────────────────────────────

  #startCrackle(): void {
    const ctx = this.#ctx;
    const len = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      // Sparse crackle: mostly silence with occasional pops
      data[i] = Math.random() < 0.002 ? (Math.random() - 0.5) * 0.8 : 0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;

    const gain = ctx.createGain();
    gain.gain.value = 0.15;

    source.connect(lp);
    lp.connect(gain);
    gain.connect(this.#masterGain);
    source.start();

    this.#crackleSource = source;
  }

  #stopCrackle(): void {
    try { this.#crackleSource?.stop(); this.#crackleSource?.disconnect(); } catch { /* ignore */ }
    this.#crackleSource = null;
  }

  // ── Sequencer ──────────────────────────────────────────────────────────────

  #playBeat(): void {
    const beatInBar = this.#beat % 4;

    // Kick on beats 0 and 2 (with slight swing on beat 2)
    if (beatInBar === 0 || beatInBar === 2) {
      this.#playKick();
    }

    // Snare on beat 1 and 3 (backbeat)
    if (beatInBar === 1 || beatInBar === 3) {
      this.#playSnare();
    }

    // Hi-hat on every beat + off-beats (8th notes feel)
    this.#playHiHat();
    setTimeout(() => this.#playHiHat(), BEAT_MS / 2);

    // Change chord every bar
    if (beatInBar === 0 && this.#beat > 0) {
      this.#bar++;
      this.#changeChord();
    }

    this.#beat++;
  }
}
