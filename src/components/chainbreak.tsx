import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { mountGame, type GameHandle, type Hud, type MapId, type Mode, MAPS } from "@/game/play";
import { SHOP, type ItemId } from "@/game/career";

const EMPTY: Hud = {
  phase: "title",
  mode: "solo",
  speed: 0,
  speeds: [0, 0, 0, 0, 0, 0, 0, 0],
  health: [100, 100, 100, 100, 100, 100, 100, 100],
  names: ["YOU", "ACE", "ROOK", "NINA", "HEX", "JULES", "OTTO", "MARA"],
  human: [true, false, false, false, false, false, false, false],
  crashed: [false, false, false, false, false, false, false, false],
  place: [1, 2, 3, 4, 5, 6, 7, 8],
  score: 0,
  distance: 0,
  banner: "",
  combo: 0,
  muted: false,
  scores: [],
  freshBest: false,
  tip: "",
  cause: "",
  mapName: "KOCHI COAST",
  mapPlace: "NH-66, Kerala",
  hand: "CHAIN",
  heat: "",
  race: 0,
  raceMax: 2200,
  boost: [0, 0, 0, 0, 0, 0, 0, 0],
  boostLeft: [0, 0, 0, 0, 0, 0, 0, 0],
  level: 1,
  wins: 0,
  winsNeed: 1,
  purse: 0,
  canLevel: false,
  owned: [],
  result: "none",
  audio: "tap",
};

export function Chainbreak() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameHandle | null>(null);
  const [hud, setHud] = useState<Hud>(EMPTY);
  const [bootError, setBootError] = useState(false);
  const [mapId, setMapId] = useState<MapId>("kochi");
  const [shop, setShop] = useState(false);

  useEffect(() => {
    const fit = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      const root = document.querySelector(".game-root") as HTMLElement | null;
      if (root && h > 0) root.style.height = `${Math.round(h)}px`;
    };
    fit();
    window.visualViewport?.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("scroll", fit);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.visualViewport?.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("scroll", fit);
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const game = mountGame(canvas, setHud);
      game.setMap(mapId);
      gameRef.current = game;
      const ride = new URLSearchParams(window.location.search).get("ride");
      if (ride === "solo" || ride === "duo") game.start(ride);
      return () => {
        game.dispose();
        gameRef.current = null;
      };
    } catch (err) {
      console.error(err);
      setBootError(true);
    }
    // map is applied on mount; later picks go through pickMap
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = (mode: Mode) => {
    setHud((h) => (h.phase === "title" ? { ...h, phase: "play", mode } : h));
    const game = gameRef.current;
    if (!game) {
      setBootError(true);
      return;
    }
    try {
      game.setMap(mapId);
      game.start(mode);
    } catch (err) {
      console.error(err);
      setBootError(true);
    }
  };
  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    let last = 0;
    const go = (e: Event) => {
      const t = e.target instanceof Element ? e.target : null;
      const solo = t?.closest?.("#start-ride");
      const duo = t?.closest?.("#two-riders");
      if (!solo && !duo) return;
      const now = performance.now();
      if (now - last < 400) return;
      last = now;
      startRef.current(solo ? "solo" : "duo");
    };
    const opts = { capture: true, passive: true } as const;
    document.addEventListener("pointerdown", go, opts);
    document.addEventListener("touchstart", go, opts);
    document.addEventListener("click", go, opts);
    return () => {
      document.removeEventListener("pointerdown", go, opts);
      document.removeEventListener("touchstart", go, opts);
      document.removeEventListener("click", go, opts);
    };
  }, []);
  const pickMap = (id: MapId) => {
    setMapId(id);
    gameRef.current?.setMap(id);
  };
  const humans = hud.names.map((_, i) => i).filter((i) => hud.human[i]);
  const pack = hud.names.map((_, i) => i).sort((a, b) => (hud.place[a] ?? 0) - (hud.place[b] ?? 0));
  const you = hud.human.findIndex(Boolean);
  const headLabel =
    hud.mode === "duo" ? "TWO RIDERS · 8 BIKES" : `SOLO · P${hud.place[you] ?? 1}/8`;

  return (
    <main className="game-root relative h-dvh w-full overflow-hidden bg-bg text-fg select-none">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" />

      {bootError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-bg p-4">
          <section className="panel w-full max-w-md px-5 py-5">
            <p className="font-display text-lg tracking-[0.2em] text-accent">CANVAS BLOCKED</p>
            <h2 className="font-display text-5xl leading-none">Couldn't start the ride</h2>
            <p className="mt-2 text-sm text-muted">This browser refused the drawing surface. Reload the page and try again.</p>
          </section>
        </div>
      ) : hud.phase === "title" && (
        <>
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end p-3 pb-36 sm:justify-center sm:p-6 sm:pb-40">
          <section className="panel rise pointer-events-auto my-auto w-full max-w-lg overflow-y-auto px-4 py-4 touch-manipulation sm:px-6 sm:py-6 max-h-[calc(100svh-11rem)]">
            <p className="font-display text-lg tracking-[0.28em] text-primary">JAILBREAK MILE</p>
            <h1 className="font-display text-5xl leading-none text-fg sm:text-8xl landscape:max-lg:text-5xl">CHAINBREAK</h1>
            <p className="mt-1 max-w-sm text-sm leading-snug text-muted sm:text-base">
              Eight bikes. Real roads. Boost refills on its own. Win races if you want to level up, then spend the purse in the shop.
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
              <span>
                LV {hud.level} · {hud.wins} win{hud.wins === 1 ? "" : "s"} · {hud.purse} purse
              </span>
              <button
                type="button"
                className="pointer-events-auto h-9 rounded-md border border-border px-3 font-display text-xl leading-none text-fg"
                onClick={() => setShop((v) => !v)}
              >
                {shop ? "Close shop" : "Shop"}
              </button>
            </div>
            {shop ? (
              <ShopPanel hud={hud} onBuy={(id) => gameRef.current?.buy(id)} onLevel={() => gameRef.current?.levelUp()} />
            ) : (
              <>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {MAPS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pickMap(m.id)}
                  className={`h-14 min-w-36 shrink-0 rounded-md border px-3 text-left ${
                    mapId === m.id ? "border-primary bg-primary text-ink" : "border-border bg-surface text-fg"
                  }`}
                >
                  <span className="block font-display text-xl leading-none">{m.name}</span>
                  <span className={`block text-[11px] leading-tight ${mapId === m.id ? "text-ink/80" : "text-muted"}`}>{m.place}</span>
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">{MAPS.find((m) => m.id === mapId)?.blurb}</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="font-display text-xl leading-none text-primary">Solo · 1 of 8</p>
                <p className="mt-1 text-muted">Hold the left or right edge to steer. Brake and Nitro sit at the bottom. The bike stays on the gas.</p>
              </div>
              <div>
                <p className="font-display text-xl leading-none text-primary">Duo · 2 of 8</p>
                <p className="mt-1 text-muted">Each rider uses the edges of their own half. Brake and Nitro are at the bottom.</p>
              </div>
            </div>
            <ScoreTable hud={hud} />
              </>
            )}
          </section>
        </div>
        <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 mx-auto grid w-full max-w-lg gap-2 bg-bg/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              id="start-ride"
              type="button"
              className="flex h-16 items-center justify-center rounded-md bg-primary px-4 font-display text-3xl leading-none text-ink"
              style={{ touchAction: "manipulation" }}
              onPointerUp={(e) => {
                e.preventDefault();
                start("solo");
              }}
            >
              Start Ride
            </button>
            <button
              id="two-riders"
              type="button"
              className="flex h-12 items-center justify-center rounded-md border border-border bg-surface px-4 font-display text-2xl leading-none text-fg"
              style={{ touchAction: "manipulation" }}
              onPointerUp={(e) => {
                e.preventDefault();
                start("duo");
              }}
            >
              Two Riders
            </button>
          </div>
        </>
      )}

      {hud.phase !== "title" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
          <header className="relative z-30 flex items-start justify-between gap-2 px-2 pt-2 sm:p-4">
            <div className="panel px-3 py-2">
              <p className="font-display text-sm leading-none tracking-[0.18em] text-primary">{headLabel}</p>
              <p className="truncate text-[11px] text-muted">{hud.mapName}{hud.heat ? ` · ${hud.heat}` : ""}</p>
              <p className="font-display text-2xl leading-none text-fg sm:text-4xl">
                {hud.speed.toFixed(0)}
                <span className="ml-1 text-lg text-muted">KM/H</span>
              </p>
              <p className="truncate text-[11px] tracking-wide text-primary">{hud.hand}</p>
              {humans.map((i) => (
                <div key={`boost-${i}`} className="mt-1">
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>{hud.mode === "duo" ? hud.names[i] : "BOOST"}</span>
                    <span>{(hud.boostLeft[i] ?? 0) > 0 ? `${Math.ceil(hud.boostLeft[i] ?? 0)}s` : (hud.boost[i] ?? 0) >= 1 ? "READY" : "CHARGE"}</span>
                  </div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-ink">
                    <div
                      className={`h-full ${(hud.boostLeft[i] ?? 0) > 0 ? "bg-sky-400" : "bg-primary"}`}
                      style={{ width: `${Math.round(((hud.boostLeft[i] ?? 0) > 0 ? (hud.boostLeft[i] ?? 0) / 10 : (hud.boost[i] ?? 0)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="panel px-3 py-2 text-right">
              <p className="font-display text-sm leading-none tracking-[0.18em] text-muted">SCORE</p>
              <p className="font-display text-3xl leading-none text-primary tabular-nums">{hud.score}</p>
              <p className="text-xs text-muted tabular-nums">
                {Math.min(hud.race, hud.raceMax)}/{hud.raceMax} m
              </p>
            </div>
            <div className="flex gap-2">
              <IconButton label={hud.muted ? "Unmute" : "Mute"} onClick={() => gameRef.current?.toggleMute()}>
                {hud.muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </IconButton>
              {hud.phase !== "over" && (
                <IconButton label={hud.phase === "pause" ? "Resume" : "Pause"} onClick={() => gameRef.current?.togglePause()}>
                  {hud.phase === "pause" ? <Play className="size-5" /> : <Pause className="size-5" />}
                </IconButton>
              )}
            </div>
          </header>

          <div className="hidden flex-wrap gap-2 px-3 sm:flex sm:px-4">
            {humans.map((i) => (
              <div key={hud.names[i]} className="panel min-w-36 flex-1 px-3 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-xl leading-none">
                    {hud.names[i]}
                    <span className="ml-2 text-muted">P{hud.place[i]}/8</span>
                  </span>
                  <span className={`text-sm ${hud.health[i]! < 30 ? "text-accent" : "text-muted"}`}>
                    {Math.ceil(hud.health[i]!)}
                    {hud.mode === "duo" ? ` · ${Math.round(hud.speeds[i] ?? 0)}` : ""}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink" aria-hidden>
                  <div
                    className={`h-full ${hud.health[i]! < 30 ? "bg-accent" : "bg-primary"}`}
                    style={{ width: `${Math.max(0, Math.min(100, hud.health[i]!))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-1 flex gap-1 px-2 sm:mt-2 sm:px-4">
            {pack.map((i) => (
              <div
                key={`${hud.names[i]}-${i}`}
                title={hud.names[i]}
                className={`flex min-w-0 flex-1 flex-col items-center rounded-sm border px-0.5 py-1 ${
                  hud.human[i] ? "border-primary bg-primary text-ink" : "border-border bg-surface text-fg"
                } ${hud.crashed[i] ? "opacity-40" : ""}`}
              >
                <p className="w-full truncate text-center font-display text-sm leading-none">{hud.names[i]?.slice(0, 4)}</p>
                <div className="mt-1 h-1 w-full bg-ink/40" aria-hidden>
                  <div
                    className={`h-full ${hud.human[i] ? "bg-ink" : hud.health[i]! < 30 ? "bg-accent" : "bg-primary"}`}
                    style={{ width: `${Math.max(0, Math.min(100, hud.health[i]!))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {hud.banner && (
            <p className="pointer-events-none mt-1 text-center font-display text-lg leading-none tracking-wide text-primary">
              {hud.banner}
              {hud.combo > 1 ? `  ×${hud.combo}` : ""}
            </p>
          )}
          {hud.tip && !hud.banner && hud.phase === "play" && (
            <p className="mt-3 text-center text-sm text-fg">{hud.tip}</p>
          )}

          {hud.phase === "play" && hud.audio !== "live" && (
            <button
              type="button"
              className="pointer-events-auto mx-auto mt-2 h-9 rounded-full border border-border bg-surface px-4 text-sm"
              onPointerUp={() => gameRef.current?.hear()}
            >
              {hud.audio === "blocked" ? "Sound blocked in this browser" : "Tap for sound"}
            </button>
          )}

          <div className="flex-1" />

          {hud.phase === "play" && (
            <>
              <EdgeSteer mode={hud.mode} onEdge={(player, v) => gameRef.current?.edge(player, v)} />
              <TouchBar mode={hud.mode} onPtr={(c, d) => gameRef.current?.pointer(c, d)} />
            </>
          )}
        </div>
      )}

      {hud.phase === "pause" && (
        <Overlay>
          <h2 className="font-display text-6xl leading-none">PAUSED</h2>
          <p className="mt-1 text-sm text-muted">The pack is still out there.</p>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              className="h-12 rounded-md bg-primary font-display text-2xl leading-none text-ink"
              onClick={() => gameRef.current?.togglePause()}
            >
              Resume
            </button>
            <button
              type="button"
              className="h-12 rounded-md border border-border font-display text-2xl leading-none"
              onClick={() => gameRef.current?.restart()}
            >
              Restart
            </button>
          </div>
        </Overlay>
      )}

      {hud.phase === "over" && (
        <Overlay>
          <p className="font-display text-lg tracking-[0.2em] text-accent">
            {hud.result === "win" ? "RACE WON" : hud.result === "place" ? "FINISHED" : "GAME OVER"}
          </p>
          <h2 className="font-display text-5xl leading-none">
            {hud.result === "win" ? "FIRST" : hud.result === "place" ? "NOT FIRST" : hud.cause || "WIPED OUT"}
          </h2>
          <p className="mt-1 text-muted">
            Score {hud.score} · {hud.distance} m
          </p>
          {hud.canLevel && (
            <button
              type="button"
              className="mt-3 h-12 w-full rounded-md bg-primary font-display text-2xl leading-none text-ink"
              onClick={() => gameRef.current?.levelUp()}
            >
              Level up
            </button>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary font-display text-2xl leading-none text-ink"
              onClick={() => gameRef.current?.restart()}
            >
              <RotateCcw className="size-5" />
              Restart
            </button>
            <button
              type="button"
              className="h-12 rounded-md border border-border font-display text-2xl leading-none"
              onClick={() => gameRef.current?.toTitle()}
            >
              Title
            </button>
          </div>
          <ScoreTable hud={hud} />
        </Overlay>
      )}
    </main>
  );
}

function ShopPanel({
  hud,
  onBuy,
  onLevel,
}: {
  hud: Hud;
  onBuy: (id: ItemId) => void;
  onLevel: () => void;
}) {
  return (
    <div className="mt-3">
      <p className="text-sm text-muted">
        {hud.level >= 5 ? "Level maxed." : `${hud.wins}/${hud.winsNeed} wins to level up. You choose when.`}
      </p>
      {hud.canLevel && (
        <button
          type="button"
          className="mt-2 h-11 w-full rounded-md bg-primary font-display text-2xl leading-none text-ink"
          onClick={onLevel}
        >
          Level up to {hud.level + 1}
        </button>
      )}
      <ul className="mt-3 space-y-2">
        {SHOP.map((item) => {
          const owned = hud.owned.includes(item.id);
          const locked = hud.level < item.level;
          return (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
              <div>
                <p className="font-display text-xl leading-none">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.blurb}
                  {locked ? ` · needs LV ${item.level}` : ` · ${item.cost}`}
                </p>
              </div>
              <button
                type="button"
                disabled={owned || locked || hud.purse < item.cost}
                className="h-10 shrink-0 rounded-md border border-border px-3 font-display text-xl leading-none disabled:opacity-40"
                onClick={() => onBuy(item.id)}
              >
                {owned ? "OWN" : "BUY"}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted">Rivals only pick up gear at higher levels, and never the full set.</p>
    </div>
  );
}

function ScoreTable({ hud }: { hud: Hud }) {
  return (
    <div className="mt-4">
      <p className="font-display text-xl leading-none text-muted">LOCAL BESTS</p>
      {hud.scores.length === 0 ? (
        <p className="mt-1 text-sm text-muted">No records yet. The mile is open.</p>
      ) : (
        <ol className="mt-1 space-y-0.5 text-sm">
          {hud.scores.slice(0, 5).map((row, i) => (
            <li key={`${row.at}-${i}`} className="flex justify-between gap-3 tabular-nums">
              <span className="text-muted">
                {i + 1}. {row.name}
                <span className="ml-2 text-xs">{row.mode === "duo" ? "DUO" : "SOLO"}</span>
              </span>
              <span>
                {row.score}
                <span className="ml-2 text-muted">{row.distance}m</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-ink/55 p-4 sm:items-center">
      <section className="panel rise my-auto w-full max-w-md px-5 py-5">{children}</section>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Hold({
  code,
  label,
  tone,
  onPtr,
}: {
  code: string;
  label: string;
  tone?: "gas" | "hit" | "boost";
  onPtr: (code: string, down: boolean) => void;
}) {
  const onPtrRef = useRef(onPtr);
  onPtrRef.current = onPtr;
  useEffect(() => {
    return () => onPtrRef.current(code, false);
  }, [code]);
  const toneClass =
    tone === "gas" ? "bg-primary text-ink border-primary" : tone === "hit" ? "bg-accent text-fg border-accent" : tone === "boost" ? "bg-sky-500 text-ink border-sky-300" : "bg-surface text-fg";
  return (
    <button
      type="button"
      aria-label={label}
      className={`pointer-events-auto flex h-12 min-w-0 flex-1 items-center justify-center rounded-full border border-border px-1 font-display text-lg leading-none ${toneClass}`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = e.pointerId;
        onPtr(code, true);
        const end = (ev: PointerEvent) => {
          if (ev.pointerId !== id) return;
          window.removeEventListener("pointerup", end);
          window.removeEventListener("pointercancel", end);
          onPtr(code, false);
        };
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
      }}
    >
      {label === "L" || label === "R" ? (
        label === "L" ? <ChevronLeft className="size-7" /> : <ChevronRight className="size-7" />
      ) : (
        label
      )}
    </button>
  );
}

function EdgeSteer({ mode, onEdge }: { mode: Mode; onEdge: (player: 0 | 1, v: number) => void }) {
  const points = useRef(new Map<number, { player: 0 | 1; x: number }>());
  const onEdgeRef = useRef(onEdge);
  onEdgeRef.current = onEdge;

  const apply = () => {
    if (mode === "solo") {
      let s = 0;
      for (const p of points.current.values()) {
        if (p.x < 0.26) s += 1;
        else if (p.x > 0.74) s -= 1;
      }
      onEdgeRef.current(0, Math.max(-1, Math.min(1, s)));
      return;
    }
    const acc: [number, number] = [0, 0];
    for (const p of points.current.values()) acc[p.player] += p.x < 0.26 ? 1 : p.x > 0.74 ? -1 : 0;
    onEdgeRef.current(0, Math.max(-1, Math.min(1, acc[0])));
    onEdgeRef.current(1, Math.max(-1, Math.min(1, acc[1])));
  };

  useEffect(() => {
    return () => {
      onEdgeRef.current(0, 0);
      onEdgeRef.current(1, 0);
    };
  }, []);

  const place = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const wide = window.innerWidth >= window.innerHeight * 0.95;
    let player: 0 | 1 = 0;
    let x = (e.clientX - rect.left) / Math.max(1, rect.width);
    if (mode === "duo") {
      if (wide) {
        player = e.clientX < rect.left + rect.width / 2 ? 0 : 1;
        const localLeft = player === 0 ? rect.left : rect.left + rect.width / 2;
        x = (e.clientX - localLeft) / Math.max(1, rect.width / 2);
      } else {
        player = e.clientY < rect.top + rect.height / 2 ? 0 : 1;
        x = (e.clientX - rect.left) / Math.max(1, rect.width);
      }
    }
    points.current.set(e.pointerId, { player, x });
    apply();
  };

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20 touch-none"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        place(e);
      }}
      onPointerMove={(e) => {
        if (!points.current.has(e.pointerId)) return;
        place(e);
      }}
      onPointerUp={(e) => {
        points.current.delete(e.pointerId);
        apply();
      }}
      onPointerCancel={(e) => {
        points.current.delete(e.pointerId);
        apply();
      }}
    />
  );
}

function TouchBar({ mode, onPtr }: { mode: Mode; onPtr: (code: string, down: boolean) => void }) {
  return (
    <div className="pointer-events-none relative z-30 flex flex-col gap-2 px-16 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {mode === "solo" ? (
        <div className="mx-auto flex w-full max-w-xs gap-3">
          <Hold code="KeyS" label="BRAKE" onPtr={onPtr} />
          <Hold code="KeyB" label="NITRO" tone="boost" onPtr={onPtr} />
        </div>
      ) : (
        <>
          <div className="mx-auto flex w-full max-w-xs items-center gap-2">
            <span className="w-8 font-display text-xl text-primary">P1</span>
            <Hold code="KeyS" label="BRAKE" onPtr={onPtr} />
            <Hold code="KeyB" label="NITRO" tone="boost" onPtr={onPtr} />
          </div>
          <div className="mx-auto flex w-full max-w-xs items-center gap-2">
            <span className="w-8 font-display text-xl text-primary">P2</span>
            <Hold code="ArrowDown" label="BRAKE" onPtr={onPtr} />
            <Hold code="KeyL" label="NITRO" tone="boost" onPtr={onPtr} />
          </div>
        </>
      )}
    </div>
  );
}
