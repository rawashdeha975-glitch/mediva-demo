/**
 * Generative, sample-free soundtrack built with the Web Audio API.
 * Everything is scheduled on the AudioContext clock relative to film time,
 * so it stays in sync when playing from any point (seek / scrub).
 */
export type SoundPlan = {
  total: number;
  cuts: number[]; // whoosh transitions
  impacts: number[]; // logo hits
  heartFrom: number;
  heartTo: number;
  beatFrom: number;
  beatTo: number;
};

// A minor → F → C → G  (warm, hopeful)
const CHORDS = [
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [130.81, 164.81, 196.0],
  [196.0, 246.94, 293.66],
];

export class Soundtrack {
  ctx: AudioContext;
  out: MediaStreamAudioDestinationNode;
  private master: GainNode;
  private bus: GainNode | null = null;
  private noise: AudioBuffer;
  private vol = 0.6;

  constructor() {
    const AC =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    this.master = this.ctx.createGain();
    this.master.gain.value = this.vol;
    this.master.connect(comp);
    comp.connect(this.ctx.destination);
    this.out = this.ctx.createMediaStreamDestination();
    comp.connect(this.out);

    const len = this.ctx.sampleRate * 2;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(m: boolean) {
    this.master.gain.setTargetAtTime(m ? 0 : this.vol, this.ctx.currentTime, 0.05);
  }

  stop() {
    const b = this.bus;
    if (!b) return;
    b.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
    setTimeout(() => b.disconnect(), 400);
    this.bus = null;
  }

  start(from: number, plan: SoundPlan) {
    this.stop();
    void this.ctx.resume();
    const ctx = this.ctx;
    const bus = ctx.createGain();
    bus.connect(this.master);
    this.bus = bus;
    const now = ctx.currentTime + 0.04;
    const at = (ft: number) => now + (ft - from);

    // pads — 4s per chord
    for (let i = 0; i * 4 < plan.total; i++) {
      const s = i * 4;
      if (s + 4.6 <= from) continue;
      const late = s < from;
      this.pad(bus, late ? now : at(s), late ? 4.6 - (from - s) : 4.6, CHORDS[i % 4], late);
    }
    // arpeggio + soft kick
    for (let ft = plan.beatFrom; ft < plan.beatTo; ft += 0.25) {
      if (ft < from) continue;
      const ch = CHORDS[Math.floor(ft / 4) % 4];
      const step = Math.round((ft - plan.beatFrom) / 0.25);
      this.pluck(bus, at(ft), ch[step % 3] * (step % 8 < 4 ? 2 : 4), step % 4 === 0 ? 0.05 : 0.03);
    }
    for (let ft = plan.beatFrom; ft < plan.beatTo; ft += 1) if (ft >= from) this.kick(bus, at(ft), 0.2);
    // heartbeat during the "problem" scene
    for (let ft = plan.heartFrom; ft < plan.heartTo; ft += 1.1) {
      if (ft < from) continue;
      this.kick(bus, at(ft), 0.2);
      this.kick(bus, at(ft + 0.24), 0.12);
    }
    plan.cuts.forEach((c) => c - 0.55 >= from && this.whoosh(bus, at(c - 0.55)));
    plan.impacts.forEach((c) => c >= from && this.impact(bus, at(c)));
  }

  private pad(bus: GainNode, t: number, dur: number, chord: number[], late: boolean) {
    const ctx = this.ctx;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 900;
    f.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + (late ? 0.15 : 1.1));
    g.gain.setValueAtTime(0.05, t + Math.max(0.2, dur - 1));
    g.gain.linearRampToValueAtTime(0, t + dur);
    f.connect(g);
    g.connect(bus);
    chord.forEach((freq) =>
      [-7, 7].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = freq;
        o.detune.value = det;
        o.connect(f);
        o.start(t);
        o.stop(t + dur + 0.05);
      })
    );
  }

  private pluck(bus: GainNode, t: number, freq: number, v: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.3);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + 0.32);
  }

  private kick(bus: GainNode, t: number, v: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + 0.4);
  }

  private whoosh(bus: GainNode, t: number) {
    const ctx = this.ctx;
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.1;
    f.frequency.setValueAtTime(250, t);
    f.frequency.exponentialRampToValueAtTime(3200, t + 0.5);
    f.frequency.exponentialRampToValueAtTime(600, t + 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.45);
    g.gain.linearRampToValueAtTime(0, t + 0.85);
    n.connect(f);
    f.connect(g);
    g.connect(bus);
    n.start(t);
    n.stop(t + 0.9);
  }

  private impact(bus: GainNode, t: number) {
    const ctx = this.ctx;
    this.kick(bus, t, 0.55);
    const sub = ctx.createOscillator();
    sub.frequency.value = 55;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.22, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    sub.connect(sg);
    sg.connect(bus);
    sub.start(t);
    sub.stop(t + 1.9);
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    n.connect(f);
    f.connect(g);
    g.connect(bus);
    n.start(t);
    n.stop(t + 0.75);
    // shimmer
    [880, 1318.5].forEach((fr, i) => this.pluck(bus, t + 0.05 + i * 0.08, fr, 0.05));
  }
}
