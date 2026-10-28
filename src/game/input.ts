export class Input {
  private held = new Set<string>();
  private virt = new Set<string>();
  private override: Set<string> | null = null;
  private steerOverride: number | null = null;

  constructor() {
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.clearHeld = this.clearHeld.bind(this);
    window.addEventListener("keydown", this.onDown);
    window.addEventListener("keyup", this.onUp);
    window.addEventListener("blur", this.clearHeld);
    document.addEventListener("visibilitychange", this.clearHeld);
  }

  dispose() {
    window.removeEventListener("keydown", this.onDown);
    window.removeEventListener("keyup", this.onUp);
    window.removeEventListener("blur", this.clearHeld);
    document.removeEventListener("visibilitychange", this.clearHeld);
  }

  private onDown(e: KeyboardEvent) {
    this.held.add(e.code);
    if (
      e.code === "Space" ||
      e.code === "ArrowUp" ||
      e.code === "ArrowDown" ||
      e.code === "ArrowLeft" ||
      e.code === "ArrowRight"
    ) {
      e.preventDefault();
    }
  }

  private onUp(e: KeyboardEvent) {
    this.held.delete(e.code);
  }

  private clearHeld() {
    this.held.clear();
    this.virt.clear();
  }

  /** QA probe: these codes stay held until the next call. */
  setOverride(codes: string[]) {
    this.override = new Set(codes);
    this.steerOverride = null;
  }

  private edge: [number, number] = [0, 0];

  setEdge(player: 0 | 1, v: number) {
    this.edge[player] = Math.max(-1, Math.min(1, v));
  }

  setSteer(v: number) {
    this.steerOverride = Math.max(-1, Math.min(1, v));
  }

  down(code: string): boolean {
    if (this.override) return this.override.has(code);
    return this.held.has(code) || this.virt.has(code);
  }

  pointer(code: string, pressed: boolean) {
    if (pressed) this.virt.add(code);
    else this.virt.delete(code);
  }

  steerSolo(): number {
    if (this.steerOverride !== null && !this.override) return this.steerOverride;
    let s = this.edge[0];
    if (this.down("KeyA") || this.down("ArrowLeft")) s += 1;
    if (this.down("KeyD") || this.down("ArrowRight")) s -= 1;
    return clamp1(s);
  }

  steerP1(): number {
    if (this.steerOverride !== null && !this.override) return this.steerOverride;
    let s = this.edge[0];
    if (this.down("KeyA")) s += 1;
    if (this.down("KeyD")) s -= 1;
    return clamp1(s);
  }

  steerP2(): number {
    let s = this.edge[1];
    if (this.down("ArrowLeft")) s += 1;
    if (this.down("ArrowRight")) s -= 1;
    return clamp1(s);
  }
}

function clamp1(n: number) {
  return n < -1 ? -1 : n > 1 ? 1 : n;
}
