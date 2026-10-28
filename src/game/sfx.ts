export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private engine: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  muted = false;
  private started = false;
  dead = false;

  get live() {
    return !this.dead && !this.muted && this.ctx?.state === "running";
  }

  unlock() {
    if (this.dead) return;
    try {
      const ctx = this.ensure();
      if (!ctx || ctx.state === "closed") return;
      if (ctx.state === "suspended") void ctx.resume();
    } catch {
      this.dead = true;
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      if (this.master) this.master.gain.value = m ? 0 : 0.9;
    } catch {
      this.dead = true;
    }
  }

  toggle() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  engineSpeed(speed: number, throttle: boolean) {
    if (this.dead || !this.started || !this.engine || !this.engineGain || !this.ctx) return;
    try {
      const ctx = this.ctx;
      if (ctx.state === "closed") return;
      if (this.muted || !Number.isFinite(speed) || speed <= 0.4) {
        this.engineGain.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
        return;
      }
      const f = 48 + speed * 1.35 + (throttle ? 12 : 0);
      this.engine.frequency.setTargetAtTime(f, ctx.currentTime, 0.08);
      const g = 0.045 + Math.min(0.06, speed * 0.0008);
      this.engineGain.gain.setTargetAtTime(g, ctx.currentTime, 0.08);
    } catch {
      this.dead = true;
    }
  }

  dispose() {
    try {
      this.engine?.stop();
    } catch {
      /* already stopped */
    }
    try {
      void this.ctx?.close().catch(() => {});
    } catch {
      /* already closed */
    }
    this.engine = null;
    this.engineGain = null;
    this.master = null;
    this.ctx = null;
    this.noise = null;
    this.started = false;
  }

  swing() {
    this.tone(220, 90, "sawtooth", 0.05, 0.09);
  }

  hit() {
    this.burst(0.18, 0.9);
    this.tone(140, 90, "square", 0.06, 0.07);
  }

  crash() {
    this.burst(0.45, 0.4);
    this.tone(70, 280, "sawtooth", 0.1, 0.2);
  }

  whoosh() {
    this.burst(0.08, 2.2);
  }

  private ensure(): AudioContext | null {
    if (this.dead) return null;
    if (this.ctx) return this.ctx.state === "closed" ? null : this.ctx;
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.9;
      master.connect(ctx.destination);
      const engineGain = ctx.createGain();
      engineGain.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 50;
      osc.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(master);
      osc.start();
      const len = Math.max(1, Math.floor(ctx.sampleRate * 0.4));
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.ctx = ctx;
      this.master = master;
      this.engine = osc;
      this.engineGain = engineGain;
      this.noise = buffer;
      this.started = true;
      return ctx;
    } catch {
      this.dead = true;
      return null;
    }
  }

  private tone(freq: number, ms: number, type: OscillatorType, gain: number, slide: number) {
    if (this.muted || this.dead) return;
    try {
      const ctx = this.ensure();
      if (!ctx || !this.master) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const start = Math.max(40, freq);
      const end = Math.max(40, freq * slide);
      const dur = Math.max(0.02, ms / 1000);
      o.type = type;
      o.frequency.setValueAtTime(start, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + dur);
      g.gain.setValueAtTime(Math.max(0.0001, gain), ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g);
      g.connect(this.master);
      o.start();
      o.stop(ctx.currentTime + dur + 0.02);
    } catch {
      this.dead = true;
    }
  }

  private burst(sec: number, rate: number) {
    if (this.muted || this.dead || !this.noise) return;
    try {
      const ctx = this.ensure();
      if (!ctx || !this.master) return;
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.playbackRate.value = Math.max(0.05, rate);
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 300;
      const dur = Math.max(0.02, sec);
      g.gain.setValueAtTime(0.22, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      src.connect(f);
      f.connect(g);
      g.connect(this.master);
      src.start();
      src.stop(ctx.currentTime + dur);
    } catch {
      this.dead = true;
    }
  }
}
