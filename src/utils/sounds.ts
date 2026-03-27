export type NoiseType =
  | 'off'
  | 'white'
  | 'pink'
  | 'brown'
  | 'rain'
  | 'storm'
  | 'ocean'
  | 'fire'
  | 'binaural';

export const NOISE_OPTIONS: { key: NoiseType; label: string; hint?: string }[] = [
  { key: 'off',      label: 'OFF' },
  { key: 'white',    label: 'WHITE' },
  { key: 'pink',     label: 'PINK' },
  { key: 'brown',    label: 'BROWN' },
  { key: 'rain',     label: 'RAIN' },
  { key: 'storm',    label: 'STORM' },
  { key: 'ocean',    label: 'OCEAN' },
  { key: 'fire',     label: 'FIRE' },
  { key: 'binaural', label: 'BINARL', hint: 'Use headphones for full effect' },
];

// ─── Tick ────────────────────────────────────────────────────────────────────

export function playTick(ctx: AudioContext, volume = 0.07): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1100, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

// ─── Buffer generators ────────────────────────────────────────────────────────

function buf(ctx: AudioContext, fill: (data: Float32Array) => void): AudioBuffer {
  const len = ctx.sampleRate * 6; // 6s loop
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) fill(b.getChannelData(ch));
  return b;
}

function whiteBuf(ctx: AudioContext): AudioBuffer {
  return buf(ctx, d => {
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  });
}

// Paul Kellet's pink noise algorithm — equal energy per octave
function pinkBuf(ctx: AudioContext): AudioBuffer {
  return buf(ctx, d => {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  });
}

function brownBuf(ctx: AudioContext): AudioBuffer {
  return buf(ctx, d => {
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      d[i] = (last + 0.02 * w) / 1.02;
      last = d[i];
      d[i] *= 3.5;
    }
  });
}

// ─── NoisePlayer ─────────────────────────────────────────────────────────────

export class NoisePlayer {
  #nodes: (AudioBufferSourceNode | OscillatorNode)[] = [];
  #masterGain: GainNode;
  #thunderTimer: ReturnType<typeof setTimeout> | null = null;
  #ctx: AudioContext;

  constructor(ctx: AudioContext) {
    this.#ctx = ctx;
    this.#masterGain = ctx.createGain();
    this.#masterGain.gain.value = 0.2;
    this.#masterGain.connect(ctx.destination);
  }

  start(type: Exclude<NoiseType, 'off'>): void {
    this.stop();
    const methods: Record<Exclude<NoiseType, 'off'>, () => void> = {
      white:    () => this.#startWhite(),
      pink:     () => this.#startPink(),
      brown:    () => this.#startBrown(),
      rain:     () => this.#startRain(),
      storm:    () => this.#startStorm(),
      ocean:    () => this.#startOcean(),
      fire:     () => this.#startFire(),
      binaural: () => this.#startBinaural(),
    };
    methods[type]();
  }

  stop(): void {
    if (this.#thunderTimer) { clearTimeout(this.#thunderTimer); this.#thunderTimer = null; }
    for (const n of this.#nodes) { try { n.stop(); n.disconnect(); } catch { /* ignore */ } }
    this.#nodes = [];
  }

  setVolume(v: number): void {
    this.#masterGain.gain.setTargetAtTime(v, this.#ctx.currentTime, 0.05);
  }

  dispose(): void {
    this.stop();
    this.#masterGain.disconnect();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  #track(n: AudioBufferSourceNode | OscillatorNode): void {
    this.#nodes.push(n);
  }

  /** Create a looping buffer source connected to `dest`, started and tracked. */
  #loop(b: AudioBuffer, dest: AudioNode): void {
    const s = this.#ctx.createBufferSource();
    s.buffer = b; s.loop = true;
    s.connect(dest); s.start();
    this.#track(s);
  }

  /** Attach an LFO oscillator to an AudioParam. */
  #lfo(freq: number, amount: number, param: AudioParam): void {
    const o = this.#ctx.createOscillator();
    const g = this.#ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.value = amount;
    o.connect(g); g.connect(param);
    o.start(); this.#track(o);
  }

  /** Create a free oscillator connected to `dest`, started and tracked. */
  #osc(freq: number, type: OscillatorType, dest: AudioNode): void {
    const o = this.#ctx.createOscillator();
    o.type = type; o.frequency.value = freq;
    o.connect(dest); o.start();
    this.#track(o);
  }

  // ── Sound implementations ───────────────────────────────────────────────────

  #startWhite(): void {
    const g = this.#ctx.createGain(); g.gain.value = 0.14;
    g.connect(this.#masterGain);
    this.#loop(whiteBuf(this.#ctx), g);
  }

  #startPink(): void {
    // Pink: balanced focus noise — not as bright as white, not as deep as brown
    const g = this.#ctx.createGain(); g.gain.value = 0.20;
    g.connect(this.#masterGain);
    // Gentle presence boost to keep it clear
    const peak = this.#ctx.createBiquadFilter();
    peak.type = 'peaking'; peak.frequency.value = 3000;
    peak.gain.value = 3; peak.Q.value = 0.8;
    peak.connect(g);
    this.#loop(pinkBuf(this.#ctx), peak);
  }

  #startBrown(): void {
    const g = this.#ctx.createGain(); g.gain.value = 0.22;
    g.connect(this.#masterGain);
    this.#loop(brownBuf(this.#ctx), g);
  }

  #startRain(): void {
    const g = this.#ctx.createGain(); g.gain.value = 0.22;
    g.connect(this.#masterGain);
    // Cut deep rumble, boost mid-high "patter"
    const peak = this.#ctx.createBiquadFilter();
    peak.type = 'peaking'; peak.frequency.value = 2200;
    peak.gain.value = 8; peak.Q.value = 0.8;
    peak.connect(g);
    const hp = this.#ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 350;
    hp.connect(peak);
    // Very slow intensity variation
    this.#lfo(0.07, 0.025, g.gain);
    this.#loop(brownBuf(this.#ctx), hp);
  }

  #startStorm(): void {
    // Same rain base + scheduled thunder
    this.#startRain();
    this.#scheduleThunder();
  }

  #scheduleThunder(): void {
    const delay = 12000 + Math.random() * 22000; // 12–34 s
    this.#thunderTimer = setTimeout(() => {
      this.#rumbleThunder();
      this.#scheduleThunder();
    }, delay);
  }

  #rumbleThunder(): void {
    const ctx = this.#ctx;
    const s = ctx.createBufferSource();
    s.buffer = brownBuf(ctx);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 100; lp.Q.value = 0.4;
    const env = ctx.createGain();
    const now = ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.55, now + 0.4);
    env.gain.setValueAtTime(0.55, now + 0.7);
    env.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
    s.connect(lp); lp.connect(env); env.connect(this.#masterGain);
    s.start(now); s.stop(now + 4);
    // ephemeral — self-cleaning, not tracked
  }

  #startOcean(): void {
    const g = this.#ctx.createGain(); g.gain.value = 0.18;
    g.connect(this.#masterGain);
    const hp = this.#ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 280;
    hp.connect(g);
    // Slow swell — ~8 s wave cycle
    this.#lfo(0.12, 0.07, g.gain);
    this.#loop(brownBuf(this.#ctx), hp);
  }

  #startFire(): void {
    const g = this.#ctx.createGain(); g.gain.value = 0.22;
    g.connect(this.#masterGain);
    // Warmth: low-pass for crackling base
    const lp = this.#ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    lp.connect(g);
    // Mid boost for presence in the crackle
    const peak = this.#ctx.createBiquadFilter();
    peak.type = 'peaking'; peak.frequency.value = 400;
    peak.gain.value = 5; peak.Q.value = 1.2;
    peak.connect(lp);
    // Irregular amplitude flutter simulating pops (2 Hz base, modulated itself)
    this.#lfo(2.3, 0.06, g.gain);
    this.#lfo(0.4, 0.03, g.gain); // slower drift for "log shift" effect
    this.#loop(brownBuf(this.#ctx), peak);
  }

  #startBinaural(): void {
    // 10 Hz alpha beat (200 Hz left, 210 Hz right) — calming focus
    // Requires headphones to perceive the binaural effect
    const carrier = 200;
    const beat = 10;

    const gainL = this.#ctx.createGain(); gainL.gain.value = 0.10;
    const panL = this.#ctx.createStereoPanner(); panL.pan.value = -1;
    gainL.connect(panL); panL.connect(this.#masterGain);
    this.#osc(carrier, 'sine', gainL);

    const gainR = this.#ctx.createGain(); gainR.gain.value = 0.10;
    const panR = this.#ctx.createStereoPanner(); panR.pan.value = 1;
    gainR.connect(panR); panR.connect(this.#masterGain);
    this.#osc(carrier + beat, 'sine', gainR);

    // Soft brown underlayer to mask the bare tones
    const bg = this.#ctx.createGain(); bg.gain.value = 0.08;
    bg.connect(this.#masterGain);
    this.#loop(brownBuf(this.#ctx), bg);
  }
}
