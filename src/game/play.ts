import { Input } from "@/game/input";
import { canLevelUp, loadCareer, saveCareer, SHOP, winsNeeded, type Career, type ItemId } from "@/game/career";
import { loadScores, saveScore, type ScoreRow } from "@/game/scores";
import { Sfx } from "@/game/sfx";
import riderBlack from "@/assets/rider-0.png";
import riderTan from "@/assets/rider-1.png";
import riderRed from "@/assets/rider-2.png";
import riderBlue from "@/assets/rider-3.png";
import carRearUrl from "@/assets/car-rear.png";
import carFrontUrl from "@/assets/car-front.png";
import palmUrl from "@/assets/palm.png";
import pineUrl from "@/assets/pine.png";
import scrubUrl from "@/assets/scrub.png";
import crowdUrl from "@/assets/crowd.png";

export type Phase = "title" | "play" | "pause" | "over";
export type Mode = "solo" | "duo";

export type Hud = {
  phase: Phase;
  mode: Mode;
  speed: number;
  speeds: number[];
  health: number[];
  names: string[];
  human: boolean[];
  crashed: boolean[];
  place: number[];
  score: number;
  distance: number;
  banner: string;
  combo: number;
  muted: boolean;
  scores: ScoreRow[];
  freshBest: boolean;
  tip: string;
  cause: string;
  mapName: string;
  mapPlace: string;
  hand: string;
  heat: string;
  race: number;
  raceMax: number;
  boost: number[];
  boostLeft: number[];
  level: number;
  wins: number;
  winsNeed: number;
  purse: number;
  canLevel: boolean;
  owned: ItemId[];
  audio: "live" | "tap" | "blocked";
  result: "none" | "win" | "place" | "wreck";
};

type Rider = {
  id: number;
  human: boolean;
  name: string;
  z: number;
  lat: number;
  latVel: number;
  speed: number;
  yaw: number;
  lean: number;
  health: number;
  swing: number;
  swingAge: number;
  swingHit: boolean;
  cooldown: number;
  attackSide: number;
  steer: number;
  throttle: boolean;
  brake: boolean;
  crashed: boolean;
  crashT: number;
  recover: number;
  flash: number;
  invuln: number;
  combo: number;
  comboT: number;
  score: number;
  distance: number;
  paint: number;
  weapon: number;
  maxHealth: number;
  boostT: number;
  boostCharge: number;
  sweep0: number;
  grip: boolean;
  heavy: boolean;
  canBoost: boolean;
};

type Car = {
  z: number;
  lat: number;
  speed: number;
  oncoming: boolean;
  style: number;
  wob: number;
  lane: number;
};

type Part = {
  alive: boolean;
  z: number;
  lat: number;
  y: number;
  vz: number;
  vlat: number;
  vy: number;
  life: number;
  max: number;
  cr: number;
  cg: number;
  cb: number;
  size: number;
};

type Floater = { alive: boolean; z: number; lat: number; y: number; text: string; life: number; max: number };

type Cam = { z: number; x: number; y: number; lat: number; speed: number; steer: number; id: number };

type View = { x: number; y: number; w: number; h: number };

const RIDER_N = 8;
const MAX_SPEED = 78;
const RACE_M = 2200;
const CAM_H = 1.48;
const H_RATIO = 0.36;
const NAMES = ["YOU", "ACE", "ROOK", "NINA", "HEX", "JULES", "OTTO", "MARA"];

const PAINTS: { tank: string; suit: string; helmet: string; visor: string }[] = [
  { tank: "#e8a317", suit: "#d6452a", helmet: "#f3e6d0", visor: "#1c2438" },
  { tank: "#f3e6d0", suit: "#243044", helmet: "#d6452a", visor: "#e8a317" },
  { tank: "#2f6f4e", suit: "#173028", helmet: "#e4f0e6", visor: "#102018" },
  { tank: "#3d6ea8", suit: "#1c2438", helmet: "#d5e2f2", visor: "#101820" },
  { tank: "#8d3d32", suit: "#2a1614", helmet: "#f0d2b4", visor: "#241410" },
  { tank: "#c4843c", suit: "#3a2814", helmet: "#f3e6d0", visor: "#2a1c10" },
  { tank: "#6a587f", suit: "#241c30", helmet: "#e6dcf2", visor: "#181420" },
  { tank: "#c44832", suit: "#241210", helmet: "#1a1614", visor: "#e8a317" },
];

const BIKE_GRID = [
  ".............oooooo.............",
  "...........oohhhhhhoo...........",
  "..........ohhhhhhhhhho..........",
  "..........ohhhvhhhvhho..........",
  "..........ohhhhhhhhhho..........",
  "...........oohhhhhhoo...........",
  "..........oollllllloo...........",
  "........ollmmmmmmmmmlo..........",
  ".......olmnnnnnnnnnnnmo.........",
  ".......olmnnnnnnnnnnnmo.........",
  ".......olmnnmmmmmmnnnmo.........",
  "........olmmmmmmmmmmmlo.........",
  "..........oolllllloo............",
  "...........ojj..jjo.............",
  "...........ojj..jjo.............",
  "...........ojj..jjo.............",
  "...........obb..bbo.............",
  ".........oodddddddddoo..........",
  "........odppppppppppppdo........",
  "........odppppppppppppdo........",
  ".........odddaaaaadddo..........",
  "...........oottttttoo...........",
  "..........oottrrrrttoo..........",
  "...........oottttttoo...........",
  "..........ooe.....eoo...........",
];

function mixHex(hex: string, toward: number, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (c: number) => Math.max(0, Math.min(255, Math.round(c + (toward - c) * t)));
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

const POSTERS = [
  { src: riderBlack, anchor: 0.371 },
  { src: riderTan, anchor: 0.492 },
  { src: riderRed, anchor: 0.498 },
  { src: riderBlue, anchor: 0.499 },
];
const WORLD_ART = {
  rear: carRearUrl,
  front: carFrontUrl,
  palm: palmUrl,
  pine: pineUrl,
  scrub: scrubUrl,
  crowd: crowdUrl,
} as const;
const worldImgs: Partial<Record<keyof typeof WORLD_ART, HTMLImageElement>> = {};

function worldArt(key: keyof typeof WORLD_ART) {
  let img = worldImgs[key];
  if (!img) {
    img = new Image();
    img.src = WORLD_ART[key];
    worldImgs[key] = img;
  }
  return img.complete && img.naturalWidth > 2 ? img : null;
}

function paintWorld(ctx: CanvasRenderingContext2D, img: HTMLImageElement, height: number, yaw = 0) {
  const w = height * (img.width / img.height);
  ctx.save();
  ctx.rotate(yaw);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, -w * 0.5, -height, w, height);
  ctx.restore();
}

let spriteYaw = 0;
const posterImgs: HTMLImageElement[] = [];

function posterFor(paint: number) {
  const i = ((paint % 4) + 4) % 4;
  let img = posterImgs[i];
  if (!img) {
    img = new Image();
    img.src = POSTERS[i]!.src;
    posterImgs[i] = img;
  }
  if (!img.complete || img.naturalWidth < 2) return null;
  const tagged = img as HTMLImageElement & { lite?: HTMLCanvasElement };
  if (!tagged.lite) {
    const h = 340;
    const w = Math.max(1, Math.round(h * (img.naturalWidth / img.naturalHeight)));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (!g) return { img, anchor: POSTERS[i]!.anchor };
    g.imageSmoothingEnabled = true;
    g.drawImage(img, 0, 0, w, h);
    tagged.lite = c;
  }
  return { img: tagged.lite, anchor: POSTERS[i]!.anchor };
}

let riderSheets: HTMLCanvasElement[] | null = null;

function riderSheet(index: number) {
  if (!riderSheets) {
    riderSheets = PAINTS.map((paint) => {
      const paintOf: Record<string, string> = {
        o: "#140e0c",
        h: paint.helmet,
        v: paint.visor,
        l: mixHex(paint.suit, 0, 0.45),
        m: paint.suit,
        n: mixHex(paint.suit, 255, 0.28),
        j: "#3a4660",
        b: "#1a140f",
        d: "#16120e",
        p: paint.tank,
        a: "#e23b2e",
        t: "#1c1814",
        r: "#5c564e",
        e: "#3a3028",
      };
      const rows = BIKE_GRID.length;
      const cols = BIKE_GRID[0]!.length;
      const cell = 3;
      const canvas = document.createElement("canvas");
      canvas.width = cols * cell;
      canvas.height = rows * cell;
      const g = canvas.getContext("2d");
      if (!g) return canvas;
      g.imageSmoothingEnabled = false;
      for (let y = 0; y < rows; y++) {
        const row = BIKE_GRID[y]!;
        for (let x = 0; x < cols; x++) {
          const key = row[x];
          if (!key || key === ".") continue;
          g.fillStyle = paintOf[key] ?? "#000";
          g.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      return canvas;
    });
  }
  return riderSheets[index] ?? riderSheets[0]!;
}

const CAR_COLORS = ["#d6452a", "#f3e6d0", "#3d6ea8", "#2f6f4e", "#c4843c", "#6a587f"];

export type MapId = "kochi" | "sur" | "stelvio" | "alain" | "mumbai" | "wall" | "leh";

export type RoadMap = {
  id: MapId;
  name: string;
  place: string;
  blurb: string;
  a1: number;
  f1: number;
  a2: number;
  f2: number;
  phase: number;
  hill: number;
  hillF: number;
  road: number;
  shoulder: number;
  sky: [string, string, string];
  sun: [string, string];
  fog: [number, number, number];
  ground: [string, string];
  dirt: [string, string];
  asphalt: [string, string];
  ridge: [string, string];
  flora: "palm" | "pine" | "scrub";
  heat: "hot" | "highway" | "remote";
  wall: boolean;
};

export const MAPS: RoadMap[] = [
  {
    id: "kochi",
    name: "KOCHI COAST",
    place: "NH-66, Kerala",
    blurb: "Palm verge, lagoon light, easy bends.",
    a1: 18, f1: 0.0085, a2: 24, f2: 0.0031, phase: 1.15,
    hill: 1.35, hillF: 0.0055, road: 6.15, shoulder: 9.4,
    sky: ["#1c2438", "#6e3a38", "#e07a3a"],
    sun: ["rgba(243,230,208,0.95)", "rgba(232,163,23,0.55)"],
    fog: [232, 150, 96],
    ground: ["#3e4a30", "#2a3622"],
    dirt: ["#5a4636", "#4a3a2c"],
    asphalt: ["#343032", "#2a2628"],
    ridge: ["#243044", "#1a2836"],
    flora: "palm",
    heat: "highway",
    wall: false,
  },
  {
    id: "sur",
    name: "BIG SUR",
    place: "Pacific Coast Highway",
    blurb: "Cliff sweeps and sea fog.",
    a1: 34, f1: 0.0062, a2: 18, f2: 0.0024, phase: 0.4,
    hill: 3.4, hillF: 0.0055, road: 5.4, shoulder: 7.6,
    sky: ["#16324a", "#3d6e86", "#e7c39a"],
    sun: ["rgba(243,236,220,0.9)", "rgba(120,170,190,0.45)"],
    fog: [186, 206, 214],
    ground: ["#1c3a34", "#142822"],
    dirt: ["#6a5a48", "#4e4034"],
    asphalt: ["#3a4044", "#2a3034"],
    ridge: ["#1a3044", "#102030"],
    flora: "pine",
    heat: "highway",
    wall: false,
  },
  {
    id: "stelvio",
    name: "STELVIO",
    place: "Stelvio Pass, Italy",
    blurb: "Tight hairpins, thin air.",
    a1: 26, f1: 0.028, a2: 11, f2: 0.011, phase: 2.1,
    hill: 4.8, hillF: 0.016, road: 4.55, shoulder: 6.5,
    sky: ["#243044", "#6a7c90", "#d5dde6"],
    sun: ["rgba(243,236,220,0.85)", "rgba(180,196,210,0.4)"],
    fog: [210, 216, 222],
    ground: ["#3a4638", "#243028"],
    dirt: ["#6a6048", "#4a4434"],
    asphalt: ["#3e4240", "#2c302e"],
    ridge: ["#c8d0d4", "#8a98a0"],
    flora: "pine",
    heat: "remote",
    wall: false,
  },
  {
    id: "alain",
    name: "AL AIN ROAD",
    place: "Dubai–Al Ain, UAE",
    blurb: "Long straights, hard sun, open sand.",
    a1: 2.4, f1: 0.0016, a2: 1.2, f2: 0.0007, phase: 0.2,
    hill: 0.08, hillF: 0.0016, road: 7.8, shoulder: 12,
    sky: ["#3a2418", "#c46a32", "#f0c27a"],
    sun: ["rgba(255,244,220,0.95)", "rgba(232,140,40,0.5)"],
    fog: [232, 196, 140],
    ground: ["#c4a06a", "#a88448"],
    dirt: ["#e0c48a", "#c4a468"],
    asphalt: ["#4a4038", "#3a322c"],
    ridge: ["#c4a070", "#8a6840"],
    flora: "scrub",
    heat: "highway",
    wall: false,
  },
  {
    id: "mumbai",
    name: "MARINE DRIVE",
    place: "Mumbai Coastal Road",
    blurb: "Night stretch where the traffic police already hunt racers.",
    a1: 3.2, f1: 0.0024, a2: 1.4, f2: 0.0009, phase: 0.5,
    hill: 0.05, hillF: 0.0012, road: 7.2, shoulder: 9.4,
    sky: ["#070d18", "#14243c", "#e07a3a"],
    sun: ["rgba(255,220,170,0.35)", "rgba(80,120,180,0.25)"],
    fog: [120, 140, 170],
    ground: ["#16324a", "#0e2030"],
    dirt: ["#3a4038", "#2a3028"],
    asphalt: ["#2a3038", "#1c2228"],
    ridge: ["#101820", "#1a2838"],
    flora: "palm",
    heat: "hot",
    wall: false,
  },
  {
    id: "wall",
    name: "BADALING",
    place: "Badaling Expressway, Beijing",
    blurb: "The highway runs under the Great Wall. Tourist road, police close.",
    a1: 22, f1: 0.013, a2: 12, f2: 0.0055, phase: 0.9,
    hill: 3.1, hillF: 0.008, road: 5.9, shoulder: 8.2,
    sky: ["#6e88a8", "#d2c2a4", "#f0dcc0"],
    sun: ["rgba(255,236,210,0.9)", "rgba(210,160,90,0.4)"],
    fog: [214, 196, 170],
    ground: ["#4a5840", "#2e3a2a"],
    dirt: ["#8a7048", "#6a5838"],
    asphalt: ["#3a3834", "#2a2824"],
    ridge: ["#8a6848", "#5a4030"],
    flora: "pine",
    heat: "highway",
    wall: true,
  },
  {
    id: "leh",
    name: "MANALI–LEH",
    place: "Manali–Leh Highway",
    blurb: "High passes. Police only come if you hit someone.",
    a1: 18, f1: 0.012, a2: 10, f2: 0.005, phase: 1.3,
    hill: 5.2, hillF: 0.011, road: 4.9, shoulder: 7.2,
    sky: ["#163048", "#6a84a0", "#ecd4b0"],
    sun: ["rgba(255,244,220,0.9)", "rgba(180,140,90,0.35)"],
    fog: [210, 200, 184],
    ground: ["#6a6048", "#4a4030"],
    dirt: ["#a08860", "#7a6848"],
    asphalt: ["#3e3a34", "#2c2a26"],
    ridge: ["#c8b8a0", "#8a7860"],
    flora: "scrub",
    heat: "remote",
    wall: false,
  },
];

const GEAR = [
  { name: "CHAIN", dmg: 34, knock: 11, reach: 1.9, zReach: 3.6 },
  { name: "STICK", dmg: 32, knock: 12, reach: 2.15, zReach: 4.2 },
  { name: "WRENCH", dmg: 40, knock: 14, reach: 2.0, zReach: 4.0 },
  { name: "STEEL ROD", dmg: 48, knock: 18, reach: 2.4, zReach: 4.7 },
];

let map: RoadMap = MAPS[0]!;
let ROAD_HALF = map.road;
let SHOULDER = map.shoulder;

function useMap(id: string) {
  map = MAPS.find((m) => m.id === id) ?? MAPS[0]!;
  ROAD_HALF = map.road;
  SHOULDER = map.shoulder;
}

function clamp(n: number, a: number, b: number) {
  if (!Number.isFinite(n)) return a;
  return n < a ? a : n > b ? b : n;
}

function centerX(z: number) {
  return Math.sin(z * map.f1) * map.a1 + Math.sin(z * map.f2 + map.phase) * map.a2;
}

function dCenter(z: number) {
  return Math.cos(z * map.f1) * map.a1 * map.f1 + Math.cos(z * map.f2 + map.phase) * map.a2 * map.f2;
}

function hillY(z: number) {
  return Math.sin(z * map.hillF) * map.hill + Math.sin(z * map.hillF * 2.6 + 0.6) * map.hill * 0.22;
}

function hash(n: number) {
  let x = Math.imul(n | 0, 374761393) + 1103515245;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return (x ^ (x >>> 16)) >>> 0;
}

function mix(a: string, t: number): string {
  const fog = map.fog;
  const n = parseInt(a.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const u = t * t;
  return `rgb(${(r + (fog[0] - r) * u) | 0},${(g + (fog[1] - g) * u) | 0},${(b + (fog[2] - b) * u) | 0})`;
}

type Prop = { z: number; lat: number; kind: number; rad: number; dmg: number };

function propAt(seg: number): Prop | null {
  const h = hash(seg + 17);
  const z = seg * 8 + 3;
  const edge = map.road + 1.85;
  if (map.wall && h % 6 === 2) return { z, lat: edge + 2.4, kind: 6, rad: 0, dmg: 0 };
  if (h % 18 === 7) return { z, lat: h % 2 === 0 ? edge + 0.15 : -edge - 0.1, kind: 5, rad: 0, dmg: 0 };
  if (h % 9 === 4) return { z, lat: h % 2 === 0 ? -edge : edge + 0.2, kind: 4, rad: 0, dmg: 0 };
  const scarce = map.flora === "scrub" ? 14 : 8;
  if (h % scarce === 0) return { z, lat: -edge - (h % 4) * 0.35, kind: 1, rad: 1.05, dmg: 16 };
  if (h % scarce === 1) return { z, lat: edge + (h % 4) * 0.28, kind: 1, rad: 1.05, dmg: 16 };
  if (h % 11 === 3) return { z, lat: h % 2 === 0 ? edge - 0.4 : -edge + 0.4, kind: 2, rad: 0.65, dmg: 12 };
  if (h % 15 === 5) return { z, lat: edge + 0.15, kind: 3, rad: 0.45, dmg: 8 };
  if (h % 15 === 6) return { z, lat: -edge - 0.15, kind: 3, rad: 0.45, dmg: 8 };
  return null;
}

function makeRider(id: number): Rider {
  return {
    id,
    human: false,
    name: NAMES[id] ?? "RIDER",
    z: 0,
    lat: 0,
    latVel: 0,
    speed: 0,
    yaw: 0,
    lean: 0,
    health: 100,
    swing: 0,
    swingAge: 0,
    swingHit: false,
    cooldown: 0,
    attackSide: 1,
    steer: 0,
    throttle: false,
    brake: false,
    crashed: false,
    crashT: 0,
    recover: 0,
    flash: 0,
    invuln: 0,
    combo: 0,
    comboT: 0,
    score: 0,
    distance: 0,
    paint: id,
    weapon: 0,
    maxHealth: 100,
    boostT: 0,
    boostCharge: 1,
    sweep0: 0,
    grip: false,
    heavy: false,
    canBoost: false,
  };
}

export type GameHandle = {
  start: (mode: Mode) => void;
  restart: () => void;
  toTitle: () => void;
  togglePause: () => void;
  toggleMute: () => void;
  hear: () => void;
  pointer: (code: string, down: boolean) => void;
  edge: (player: 0 | 1, v: number) => void;
  setMap: (id: MapId) => void;
  levelUp: () => void;
  buy: (id: ItemId) => boolean;
  dispose: () => void;
};

export function mountGame(canvas: HTMLCanvasElement, onHud: (h: Hud) => void): GameHandle {
  const ctxOrNull = canvas.getContext("2d", { alpha: false });
  if (!ctxOrNull) throw new Error("Canvas unavailable");
  const ctx: CanvasRenderingContext2D = ctxOrNull;
  const input = new Input();
  const sfx = new Sfx();
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const cars: Car[] = Array.from({ length: 12 }, (_, i) => ({
    z: 80 + i * 28,
    lat: i % 2 === 0 ? 2.2 : 4.4,
    speed: 22,
    oncoming: false,
    style: i % CAR_COLORS.length,
    wob: i,
    lane: i % 2 === 0 ? 2.2 : 4.4,
  }));
  const cops: { alive: boolean; z: number; lat: number; speed: number; side: number }[] = [
    { alive: false, z: 0, lat: 2, speed: 40, side: 1 },
    { alive: false, z: 0, lat: 4, speed: 40, side: -1 },
  ];
  let fastT = 0;
  let hitHeat = 0;
  let copTold = false;
  const parts: Part[] = Array.from({ length: 180 }, () => ({
    alive: false,
    z: 0,
    lat: 0,
    y: 0,
    vz: 0,
    vlat: 0,
    vy: 0,
    life: 0,
    max: 1,
    cr: 255,
    cg: 220,
    cb: 160,
    size: 0.2,
  }));
  const floaters: Floater[] = Array.from({ length: 24 }, () => ({
    alive: false,
    z: 0,
    lat: 0,
    y: 1,
    text: "",
    life: 0,
    max: 1,
  }));

  const riders: Rider[] = Array.from({ length: RIDER_N }, (_, i) => makeRider(i));
  const pose = new Float64Array(RIDER_N);
  const sprung = new Float64Array(RIDER_N);
  let career: Career = loadCareer();
  let result: "none" | "win" | "place" | "wreck" = "none";
  const pickups: { alive: boolean; z: number; lat: number; kind: number }[] = Array.from({ length: 6 }, () => ({
    alive: false,
    z: 0,
    lat: 2,
    kind: 1,
  }));
  let nextDropZ = 260;
  let announcedDrop = false;

  let mode: Mode = "solo";
  let phase: Phase = "title";
  let titleZ = 40;
  let trauma = 0;
  let hurtFlash = 0;
  let banner = "";
  let bannerT = 0;
  let cause = "";
  let grace = 0;
  let time = 0;
  let freshBest = false;
  let saved = false;
  let tipT = 0;
  let freeze = 0;
  let lastHud = 0;
  let raf = 0;
  let running = true;
  let frameFaults = 0;
  let scoreboard = loadScores();
  const probe = {
    getYaw: () => riders[0]?.yaw ?? 0,
    getLean: () => pose[0] ?? 0,
    getSpeed: () => (phase === "play" ? (riders[0]?.speed ?? 0) : riders[0]?.speed ?? 0),
    setKeys: (codes: string[]) => input.setOverride(codes),
    setSteer: (v: number) => input.setSteer(v),
  };

  function emit(force = false) {
    const now = performance.now();
    if (!force && now - lastHud < 80) return;
    lastHud = now;
    onHud(snapshot());
  }

  function handLabel() {
    const humans = riders.filter((r) => r.human);
    if (humans.length < 2) return humans[0]?.weapon ? (GEAR[humans[0].weapon]?.name ?? "CHAIN") : "CHAIN";
    return humans.map((r) => `${r.name} ${r.weapon ? (GEAR[r.weapon]?.name ?? "CHAIN") : "CHAIN"}`).join(" · ");
  }

  function standings() {
    return riders.map((r, i) => i).sort((a, b) => {
      const ra = riders[a]!;
      const rb = riders[b]!;
      if (ra.crashed !== rb.crashed) return ra.crashed ? 1 : -1;
      return rb.z - ra.z;
    });
  }

  function kmh(speed: number) {
    return Math.max(0, speed) * (165 / MAX_SPEED);
  }

  function snapshot(): Hud {
    const humans = riders.filter((r) => r.human);
    const score = humans.reduce((s, r) => s + r.score, 0);
    const distance = humans.reduce((s, r) => Math.max(s, r.distance), 0);
    const order = standings();
    const place = riders.map((r) => order.indexOf(r.id) + 1);
    const lead = humans.find((r) => !r.crashed) ?? humans[0];
    return {
      phase,
      mode,
      speed: kmh(lead?.speed ?? 0),
      speeds: riders.map((r) => kmh(r.speed)),
      health: riders.map((r) => Math.max(0, r.health)),
      names: riders.map((r) => r.name),
      human: riders.map((r) => r.human),
      crashed: riders.map((r) => r.crashed),
      place,
      score: Math.floor(score),
      distance: Math.floor(distance),
      banner: bannerT > 0 ? banner : "",
      combo: humans.reduce((m, r) => Math.max(m, r.comboT > 0 ? r.combo : 0), 0),
      muted: sfx.muted,
      scores: scoreboard,
      freshBest,
      tip: tipT > 0 ? (mode === "duo" ? "Tools on the road are optional · P1 Space · P2 Enter" : "Steer into a tool to arm up · or leave it") : "",
      cause,
      mapName: map.name,
      mapPlace: map.place,
      hand: handLabel(),
      heat: cops.some((c) => c.alive) ? "POLICE" : "",
      race: Math.floor(Math.max(0, ...riders.filter((r) => r.human).map((r) => r.distance), 0)),
      raceMax: RACE_M,
      boost: riders.map((r) => Math.max(0, Math.min(1, r.boostCharge))),
      boostLeft: riders.map((r) => Math.max(0, r.boostT)),
      level: career.level,
      wins: career.wins,
      winsNeed: Number.isFinite(winsNeeded(career.level)) ? winsNeeded(career.level) : career.wins,
      purse: career.purse,
      canLevel: canLevelUp(career),
      owned: career.owned,
      audio: sfx.dead ? "blocked" : sfx.muted || sfx.live ? "live" : "tap",
      result,
    };
  }

  function spawnPart(fn: (p: Part) => void) {
    for (const p of parts) {
      if (p.alive) continue;
      fn(p);
      p.alive = true;
      return;
    }
  }

  function burst(z: number, lat: number, cr: number, cg: number, cb: number, n: number) {
    for (let i = 0; i < n; i++) {
      spawnPart((p) => {
        p.z = z;
        p.lat = lat + (Math.random() - 0.5) * 0.8;
        p.y = 0.4 + Math.random() * 0.8;
        p.vz = (Math.random() - 0.4) * 8;
        p.vlat = (Math.random() - 0.5) * 6;
        p.vy = 1.5 + Math.random() * 3;
        p.life = p.max = 0.35 + Math.random() * 0.35;
        p.cr = cr;
        p.cg = cg;
        p.cb = cb;
        p.size = 0.08 + Math.random() * 0.16;
      });
    }
  }

  function floatText(z: number, lat: number, text: string) {
    for (const f of floaters) {
      if (f.alive) continue;
      f.alive = true;
      f.z = z;
      f.lat = lat;
      f.y = 1.6;
      f.text = text;
      f.life = f.max = 0.75;
      return;
    }
  }

  function wreck(r: Rider, by: Rider | null) {
    if (r.crashed) return;
    r.health = 0;
    r.crashed = true;
    r.crashT = 0;
    r.recover = r.human ? 99 : 3.8;
    r.speed *= 0.35;
    r.swing = 0;
    burst(r.z, r.lat, 212, 80, 48, 16);
    burst(r.z, r.lat, 40, 36, 32, 8);
    sfx.crash();
    trauma = Math.min(1, trauma + (r.human ? 0.85 : 0.45));
    if (r.human) hurtFlash = 0.55;
    if (by && by.human) {
      by.score += 480;
      banner = `${by.name} wrecked ${r.name}`;
    } else if (r.human) {
      banner = cause || (by ? `${by.name} took you out` : "You wrecked");
      if (by) cause = `${by.name} took you out`;
      else if (!cause) cause = "You wrecked";
    } else {
      banner = `${r.name} wrecked`;
    }
    bannerT = r.human ? 3 : 1.35;
    floatText(r.z, r.lat, "WRECK");
  }

  function hurt(r: Rider, dmg: number, knock: number, source: Rider | null): boolean {
    if (r.crashed || r.invuln > 0) return false;
    r.health -= dmg;
    r.invuln = 0.28;
    r.flash = 0.1;
    r.latVel += knock;
    r.speed *= 0.88;
    if (r.human || source?.human) {
      trauma = Math.min(1, trauma + 0.34);
      if (r.human) hurtFlash = 0.32;
      sfx.hit();
    }
    burst(r.z, r.lat, 243, 230, 208, 8);
    floatText(r.z, r.lat, `${Math.round(dmg)}`);
    if (r.health <= 0) wreck(r, source);
    return true;
  }

  function beginSwing(r: Rider, side: number) {
    if (r.crashed || r.cooldown > 0 || r.swing > 0) return;
    r.swing = 0.2;
    r.swingAge = 0;
    r.swingHit = false;
    r.attackSide = side || (r.id % 2 === 0 ? 1 : -1);
    r.cooldown = r.human ? 0.4 : 0.78;
    if (r.human) sfx.swing();
  }

  function connect(a: Rider, b: Rider) {
    if (b.crashed || b.invuln > 0) return;
    const gear = a.weapon > 0 ? GEAR[a.weapon] : null;
    let dmg = gear ? gear.dmg * (a.human ? 1 : 0.85) : a.human ? 34 : 13;
    if (a.heavy) dmg *= 1.35;
    const side = Math.sign(b.lat - a.lat) || a.attackSide || 1;
    let knock = side * (gear ? gear.knock * 0.65 : a.human ? 11 : 7);
    if (gear && b.human) {
      const outward = Math.abs(b.lat) < 0.35 ? side : Math.sign(b.lat) || side;
      knock = outward * gear.knock;
    }
    const landed = hurt(b, dmg, knock, a);
    a.swingHit = true;
    if (!landed) return;
    a.combo = a.comboT > 0 ? a.combo + 1 : 1;
    a.comboT = 1.8;
    if (a.human) a.score += 140 * a.combo;
    const verb = gear ? gear.name : "CHAIN";
    banner = a.combo > 1 ? `${a.name} x${a.combo}` : `${a.name} ${verb}`;
    bannerT = 0.9;
    if (a.human || b.human) freeze = Math.min(0.08, freeze + 0.05);
    burst(b.z, b.lat, 232, 163, 23, 10);
    if (!reduce) trauma = Math.min(1, trauma + 0.2);
  }

  function resolveSwings() {
    for (const a of riders) {
      if (a.crashed || a.swing <= 0 || a.swingHit) continue;
      const gear = a.weapon > 0 ? GEAR[a.weapon] : null;
      const zReach = gear ? gear.zReach : 3.6;
      const xReach = gear ? gear.reach : 1.9;
      for (const b of riders) {
        if (a === b || b.crashed || b.invuln > 0) continue;
        const dz = Math.abs(a.z - b.z);
        const dx = b.lat - a.lat;
        const adx = Math.abs(dx);
        if (dz > zReach || adx > xReach) continue;
        if (adx > 0.35) {
          const side = Math.sign(dx) || a.attackSide;
          if (a.attackSide && side !== a.attackSide && adx > 0.9) continue;
        }
        connect(a, b);
        break;
      }
    }
  }

  function scenery(r: Rider) {
    if (r.crashed || r.invuln > 0) return;
    const base = Math.floor(r.z / 8);
    for (let i = -1; i <= 1; i++) {
      const prop = propAt(base + i);
      if (!prop || prop.kind >= 4) continue;
      const z0 = Math.min(r.sweep0, r.z);
      const z1 = Math.max(r.sweep0, r.z);
      if (prop.z > z0 - 1.7 && prop.z < z1 + 1.7 && Math.abs(prop.lat - r.lat) < prop.rad + 0.35) {
        const knock = Math.sign(r.lat - prop.lat) * 7 || 4;
        if (r.human) cause = prop.kind === 1 ? "You hit a tree" : prop.kind === 2 ? "You hit a sign" : "You left the road";
        if (hurt(r, prop.dmg, knock, null)) r.speed *= 0.72;
        return;
      }
    }
  }

  function carHits() {
    for (const c of cars) {
      for (const r of riders) {
        if (r.crashed || r.invuln > 0) continue;
        const z0 = Math.min(r.sweep0, r.z);
        const z1 = Math.max(r.sweep0, r.z);
        const reach = (c.oncoming ? 2.6 : 2.1) + Math.min(8, r.speed * 0.03);
        const dx = Math.abs(c.lat - r.lat);
        if (c.z > z0 - reach && c.z < z1 + reach && dx < 1.22) {
          const knock = (Math.sign(r.lat - c.lat) || 1) * (c.oncoming ? 9 : 5);
          if (r.human) cause = c.oncoming ? "Head-on with a car" : "You hit a car";
          if (!hurt(r, c.oncoming ? 22 : 12, knock, null)) continue;
          if (r.human) flagHeat("hit");
          r.speed *= c.oncoming ? 0.55 : 0.78;
          c.lat += Math.sign(c.lat - r.lat) * 0.55;
          burst(r.z, r.lat, 240, 200, 120, 10);
        }
      }
    }
  }

  function separate() {
    for (let i = 0; i < riders.length; i++) {
      const a = riders[i]!;
      if (a.crashed) continue;
      for (let j = i + 1; j < riders.length; j++) {
        const b = riders[j]!;
        if (b.crashed) continue;
        const dz = a.z - b.z;
        const dx = a.lat - b.lat;
        if (Math.abs(dz) < 2.1 && Math.abs(dx) < 0.72) {
          const push = (0.72 - Math.abs(dx)) * 10;
          const s = Math.sign(dx) || 1;
          a.latVel += s * push * 0.5;
          b.latVel -= s * push * 0.5;
          if (Math.abs(dz) < 0.4) {
            a.z += 0.02;
            b.z -= 0.02;
          }
        }
      }
    }
  }

  function livingHumans() {
    return riders.filter((r) => r.human && !r.crashed);
  }

  function tryBoost(r: Rider) {
    if (r.crashed || r.boostT > 0 || r.boostCharge < 1 || !r.canBoost) return;
    const others = riders.filter((o) => !o.human && o.boostT > 0).length;
    if (!r.human && others > 0) return;
    r.boostT = r.human ? 10 : 6;
    r.boostCharge = 0;
    if (r.human) {
      sfx.whoosh();
      banner = "BOOST";
      bannerT = 0.8;
    }
  }

  function controlHumans() {
    for (const r of riders) {
      if (!r.human) continue;
      if (r.crashed) {
        r.steer = 0;
        r.throttle = false;
        r.brake = false;
        continue;
      }
      if (mode === "duo" && r.id === 1) {
        r.steer = input.steerP2();
        r.brake = input.down("ArrowDown");
        r.throttle = !r.brake;
        if (input.down("KeyL")) tryBoost(r);
        if (input.down("Enter") || input.down("ShiftRight")) {
          const foe = nearestFoe(r);
          const side = foe ? Math.sign(foe.lat - r.lat) || 1 : -r.steer || 1;
          beginSwing(r, side);
        }
      } else {
        r.steer = mode === "solo" ? input.steerSolo() : input.steerP1();
        r.brake = input.down("KeyS") || (mode === "solo" && input.down("ArrowDown"));
        r.throttle = !r.brake;
        const attack = input.down("Space") || (mode === "solo" && input.down("KeyK"));
        if (input.down("KeyB") || input.down("ShiftLeft")) tryBoost(r);
        if (attack) {
          const foe = nearestFoe(r);
          const side = foe ? Math.sign(foe.lat - r.lat) || 1 : -r.steer || 1;
          beginSwing(r, side);
        }
      }
    }
  }

  function nearestFoe(r: Rider): Rider | null {
    let best: Rider | null = null;
    let d = 6;
    for (const o of riders) {
      if (o === r || o.crashed) continue;
      const dist = Math.abs(o.z - r.z) + Math.abs(o.lat - r.lat) * 0.8;
      if (dist < d) {
        d = dist;
        best = o;
      }
    }
    return best;
  }

  function nearestHuman(r: Rider): Rider {
    let best = riders[0]!;
    let d = Infinity;
    for (const h of riders) {
      if (!h.human || h.crashed) continue;
      const dist = Math.abs(h.z - r.z);
      if (dist < d) {
        d = dist;
        best = h;
      }
    }
    return best;
  }

  function controlAI(_dt: number) {
    for (const r of riders) {
      if (r.human || r.crashed) continue;
      const target = nearestHuman(r);
      const side = r.id % 2 === 0 ? 1 : -1;
      let want = target.lat + side * (1.05 + (r.id % 3) * 0.32);
      want += Math.sin(time * 1.4 + r.id * 1.7) * 0.12;
      for (const c of cars) {
        const dz = c.z - r.z;
        if (dz > 0 && dz < 16 && Math.abs(c.lat - r.lat) < 1.45) {
          want += c.lat >= r.lat ? -1.8 : 1.8;
        }
      }
      if (r.weapon > 0) {
        const outward = Math.abs(target.lat) < 0.35 ? side : Math.sign(target.lat) || side;
        want = target.lat - outward * 1.25;
      }
      want = clamp(want, 0.2, ROAD_HALF - 0.4);
      const drop = !r.weapon ? nearestLoot(r) : null;
      if (drop && willGrab(r, drop.z)) want = drop.lat;
      const diff = clamp((want - r.lat) * 0.85, -1, 1);
      r.steer = diff;
      const gap = r.z - target.z;
      let wantSpd = target.speed + 1;
      if (gap > 10) wantSpd = target.speed - 8;
      if (gap < -3) wantSpd = Math.max(target.speed + 14, 52);
      if (r.boostT > 0) wantSpd = MAX_SPEED * 1.45;
      if (drop && drop.z > r.z) wantSpd = Math.max(wantSpd, target.speed + 6);
      if (Math.abs(r.lat) > ROAD_HALF) wantSpd *= 0.65;
      r.throttle = wantSpd > r.speed + 0.8;
      r.brake = r.speed > wantSpd + 6;
      const armed = r.weapon > 0;
      const zWindow = armed ? 5.2 : 4.2;
      const xWindow = armed ? 2.35 : 1.7;
      if (grace <= 0 && r.cooldown <= 0 && Math.abs(r.z - target.z) < zWindow && Math.abs(r.lat - target.lat) < xWindow) {
        const outward = Math.abs(target.lat) < 0.35 ? side : Math.sign(target.lat) || side;
        beginSwing(r, armed ? outward : Math.sign(target.lat - r.lat) || side);
      }
      if (r.canBoost && r.boostCharge >= 1 && Math.abs(r.z - target.z) < 36) tryBoost(r);
    }
  }

  function willGrab(r: Rider, z: number) {
    return hash(((z * 10) | 0) + r.id * 13) % 10 < 8;
  }

  function nearestLoot(r: Rider) {
    let best: (typeof pickups)[number] | null = null;
    let bestD = 34;
    for (const p of pickups) {
      if (!p.alive) continue;
      const dz = p.z - r.z;
      if (dz < -3 || dz > 32) continue;
      if (!willGrab(r, p.z)) continue;
      const d = dz + Math.abs(p.lat - r.lat) * 2;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  function placeDrop(z: number) {
    const slot = pickups.find((p) => !p.alive) ?? pickups[0];
    if (!slot) return;
    slot.alive = true;
    slot.z = z;
    const span = Math.max(1.5, ROAD_HALF - 1.6);
    slot.lat = 0.7 + ((hash(z | 0) % 100) / 100) * span;
    slot.kind = ((hash((z * 3) | 0) >> 3) % 3) + 1;
    if (!announcedDrop) {
      announcedDrop = true;
      banner = "TOOLS AHEAD";
      bannerT = 1.3;
    }
  }

  function flagHeat(kind: "hit" | "speed") {
    if (phase !== "play") return;
    if (kind === "speed" && map.heat === "remote") return;
    if (kind === "hit" && map.heat === "remote") {
      hitHeat += 1;
      if (hitHeat < 2) return;
    }
    spawnCop();
  }

  function spawnCop() {
    const target = livingHumans()[0];
    if (!target) return;
    const alive = cops.filter((c) => c.alive).length;
    const allow = map.heat === "hot" ? 2 : 1;
    if (alive >= allow) return;
    const cop = cops.find((c) => !c.alive);
    if (!cop) return;
    cop.alive = true;
    cop.z = target.z - 14 - alive * 8;
    cop.lat = clamp(target.lat + cop.side * 1.1, 0.4, Math.max(0.8, ROAD_HALF - 0.5));
    cop.speed = Math.max(34, Math.min(target.speed, MAX_SPEED) * 0.92);
    fastT = 0;
    if (!copTold) {
      copTold = true;
      banner = map.heat === "hot" ? "INTERCEPTORS" : "POLICE";
      bannerT = 1.3;
    }
  }

  function updateCops(dt: number) {
    const target = livingHumans()[0];
    if (!target || phase !== "play") return;
    if (target.speed > 64) fastT += dt;
    else fastT = Math.max(0, fastT - dt * 0.35);
    const need = map.heat === "hot" ? 2.2 : 5;
    if (fastT > need) flagHeat("speed");
    for (const cop of cops) {
      if (!cop.alive) continue;
      const gap = target.z - cop.z;
      if (gap > 140) {
        cop.alive = false;
        continue;
      }
      const want = Math.min(MAX_SPEED * 1.05, target.speed + (gap > 6 ? 12 : 2));
      cop.speed += (want - cop.speed) * Math.min(1, dt * 1.4);
      if (cop.speed < 0) cop.speed = 0;
      const beside = clamp(target.lat + cop.side * 0.95, 0.3, ROAD_HALF - 0.3);
      cop.lat += clamp(beside - cop.lat, -1, 1) * 8 * dt;
      cop.z += cop.speed * dt;
      if (Math.abs(cop.z - target.z) < 2.4 && Math.abs(cop.lat - target.lat) < 1.15 && target.invuln <= 0) {
        const outward = Math.sign(target.lat) || cop.side;
        if (hurt(target, 16, outward * 8, null)) {
          banner = "PULL OVER";
          bannerT = 0.8;
          cop.z -= 1.5;
        }
      }
    }
  }

  function updateDrops() {
    let front = 0;
    let back = Infinity;
    for (const r of riders) {
      if (r.z > front) front = r.z;
      if (r.z < back) back = r.z;
    }
    if (front + 75 > nextDropZ) {
      placeDrop(nextDropZ);
      nextDropZ += 165 + (hash(nextDropZ | 0) % 70);
    }
    for (const p of pickups) {
      if (p.alive && p.z < back - 30) p.alive = false;
    }
  }

  function collectLoot() {
    const order = [...riders].sort((a, b) => Number(b.human) - Number(a.human));
    for (const p of pickups) {
      if (!p.alive) continue;
      for (const r of order) {
        if (r.crashed) continue;
        if (Math.abs(p.z - r.z) > 2.3 || Math.abs(p.lat - r.lat) > 1.15) continue;
        if (!r.human && !willGrab(r, p.z)) continue;
        p.alive = false;
        r.weapon = p.kind;
        const label = GEAR[p.kind]?.name ?? "TOOL";
        floatText(r.z, r.lat, label);
        if (r.human) {
          banner = `${r.name} took ${label}`;
          bannerT = 0.9;
          sfx.whoosh();
        }
        break;
      }
    }
  }

  function integrate(r: Rider, dt: number) {
    if (r.crashed) {
      r.speed = Math.max(0, r.speed - 46 * dt);
      r.z += r.speed * dt;
      r.lat += r.latVel * dt;
      r.latVel *= Math.exp(-2.4 * dt);
      r.crashT += dt;
      r.lean += (1.4 - r.lean) * (1 - Math.exp(-4 * dt));
      if (!r.human) {
        r.recover -= dt;
        if (r.recover <= 0) {
          const h = nearestHuman(r);
          r.crashed = false;
          r.health = Math.round(r.maxHealth * 0.62);
          r.z = h.z - 10 - (r.id % 4);
          r.lat = clamp(h.lat + (r.id % 2 === 0 ? 2.1 : -1.6), -0.2, 5.2);
          r.speed = Math.min(MAX_SPEED, Math.max(30, Math.min(h.speed, MAX_SPEED) * 0.92));
          r.crashT = 0;
          r.latVel = 0;
          r.lean = 0;
        }
      }
      return;
    }

    const off = Math.abs(r.lat) > ROAD_HALF;
    const mult = r.boostT > 0 ? (r.human ? 2.15 : 1.45) : 1;
    const cap = (off ? MAX_SPEED * (r.grip ? 0.75 : 0.55) : MAX_SPEED) * mult;
    if (r.boostT > 0 && !r.brake) {
      r.speed += (cap - r.speed) * Math.min(1, dt * 1.8);
    } else {
      if (r.throttle) r.speed += (r.grip ? 16 : 13) * dt;
      else if (r.human && !r.brake && r.speed < 32) r.speed += 10 * dt;
      else r.speed -= 8 * dt;
      if (r.brake) r.speed -= 50 * dt;
    }
    if (r.brake && r.boostT > 0) r.boostT = 0;
    if (off) r.speed -= (r.grip ? 8 : 16) * dt;
    if (r.speed > cap) r.speed = Math.max(cap, r.speed - (r.speed - cap) * Math.min(1, dt * 1.5) - 24 * dt);
    if (r.speed < 0) r.speed = 0;

    const pace = clamp(r.speed / MAX_SPEED, 0, 2.2);
    const sf = clamp(1.05 - pace * 0.62, 0.38, 1.05);
    r.lat += -r.steer * (r.grip ? 8.5 : 7.2) * sf * dt;
    const pushingOut = r.lat * -r.steer > 0.2;
    if (off && !pushingOut) r.lat -= Math.sign(r.lat) * 6 * dt;
    if (Math.abs(r.steer) < 0.2) r.lat -= dCenter(r.z) * Math.min(r.speed, MAX_SPEED) * dt * 0.012;
    r.lat += r.latVel * dt;
    r.latVel *= Math.exp(-3.4 * dt);
    if (r.lat > SHOULDER) {
      r.lat = SHOULDER - 0.35;
      r.latVel = -10;
      if (hurt(r, 8, 0, null) && r.human) {
        banner = "BARRIER";
        bannerT = 1.1;
        cause = "You hit the barrier";
        if (!r.crashed) r.invuln = 0.9;
      }
    } else if (r.lat < -SHOULDER) {
      r.lat = -SHOULDER + 0.35;
      r.latVel = 10;
      if (hurt(r, 8, 0, null) && r.human) {
        banner = "BARRIER";
        bannerT = 1.1;
        cause = "You hit the barrier";
        if (!r.crashed) r.invuln = 0.9;
      }
    }

    r.yaw += r.steer * 2.8 * sf * dt;
    const leanTarget = r.steer * 0.72;
    r.lean += (leanTarget - r.lean) * (1 - Math.exp(-10 * dt));
    pose[r.id] = (pose[r.id] ?? 0) + (r.lean - (pose[r.id] ?? 0)) * (1 - Math.exp(-6 * dt));
    const sit = Math.sin(r.distance * 2.2) * 0.016 * clamp(r.speed / MAX_SPEED, 0, 1) + (r.brake ? 0.04 : 0) - (r.throttle ? 0.022 : 0);
    sprung[r.id] = (sprung[r.id] ?? 0) + (sit - (sprung[r.id] ?? 0)) * (1 - Math.exp(-14 * dt));
    r.sweep0 = r.z;
    r.z += r.speed * dt;
    r.distance += r.speed * dt;
    if (r.human) r.score += r.speed * dt * 0.45;

    r.cooldown = Math.max(0, r.cooldown - dt);
    if (r.swing > 0) {
      r.swing -= dt;
      r.swingAge += dt;
      if (r.swing < 0) r.swing = 0;
    }
    r.flash = Math.max(0, r.flash - dt);
    r.invuln = Math.max(0, r.invuln - dt);
    r.comboT = Math.max(0, r.comboT - dt);
    if (r.comboT <= 0) r.combo = 0;
    if (r.boostT > 0) r.boostT = Math.max(0, r.boostT - dt);
    else if (!r.crashed && r.canBoost) {
      const refill = r.human ? (career.owned.includes("tank") ? 1 / 11 : 1 / 16) : 1 / 26;
      r.boostCharge = Math.min(1, r.boostCharge + dt * refill);
    }

    if (off && r.human && Math.random() < 0.4) {
      spawnPart((p) => {
        p.z = r.z;
        p.lat = r.lat;
        p.y = 0.15;
        p.vz = -r.speed * 0.15;
        p.vlat = (Math.random() - 0.5) * 2;
        p.vy = 0.6;
        p.life = p.max = 0.4;
        p.cr = 120;
        p.cg = 96;
        p.cb = 70;
        p.size = 0.18;
      });
    }
    if (r.throttle && r.human && Math.random() < 0.5) {
      spawnPart((p) => {
        p.z = r.z - 0.6;
        p.lat = r.lat + (r.id === 1 ? 0.25 : -0.25);
        p.y = 0.25;
        p.vz = -4;
        p.vlat = 0;
        p.vy = 0.8;
        p.life = p.max = 0.25;
        p.cr = 80;
        p.cg = 80;
        p.cb = 80;
        p.size = 0.1;
      });
    }
  }

  function updateCars(dt: number) {
    let z0 = Infinity;
    let z1 = -Infinity;
    for (const r of riders) {
      if (r.z < z0) z0 = r.z;
      if (r.z > z1) z1 = r.z;
    }
    for (const c of cars) {
      c.z += c.speed * dt;
      c.lat = c.lane + Math.sin(time * 0.7 + c.wob) * 0.28;
      if (!c.oncoming && c.z < z0 - 30) parkCar(c, z1 + 40 + Math.random() * 140, false);
      if (c.oncoming && c.z < z0 - 20) parkCar(c, z1 + 70 + Math.random() * 160, true);
    }
  }

  function parkCar(c: Car, z: number, oncoming: boolean) {
    c.oncoming = oncoming;
    c.z = z;
    c.style = (c.style + 1) % CAR_COLORS.length;
    if (oncoming) {
      c.lane = Math.random() < 0.5 ? -4.6 : -2.2;
      c.lat = c.lane;
      c.speed = -(32 + Math.random() * 12);
    } else {
      c.lane = Math.random() < 0.5 ? 2.1 : 4.5;
      c.lat = c.lane;
      c.speed = 16 + Math.random() * 12;
    }
  }

  function setupTraffic() {
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i]!;
      const oncoming = i >= 7;
      parkCar(c, 70 + i * 26, oncoming);
      c.wob = i * 1.3;
    }
    const lead = cars[0]!;
    lead.oncoming = false;
    lead.z = 64;
    lead.lane = 4.6;
    lead.lat = 4.6;
    lead.speed = 18;
    const nose = cars[7]!;
    nose.oncoming = true;
    nose.z = 78;
    nose.lane = -3.4;
    nose.lat = -3.4;
    nose.speed = -36;
  }

  function reset(next: Mode) {
    mode = next;
    phase = "play";
    freshBest = false;
    saved = false;
    grace = 0.65;
    time = 0;
    trauma = 0;
    hurtFlash = 0;
    freeze = 0;
    banner = "BREAK OUT";
    bannerT = 1.1;
    cause = "";
    tipT = 4;
    for (const p of parts) p.alive = false;
    for (const f of floaters) f.alive = false;
    const slots = [
      { z: 54, lat: 2.2 },
      { z: 50, lat: 4.25 },
      { z: 48, lat: 0.85 },
      { z: 60, lat: 3.35 },
      { z: 44, lat: 4.55 },
      { z: 40, lat: 1.7 },
      { z: 36, lat: 1.35 },
      { z: 46, lat: 4.7 },
    ];
    for (let i = 0; i < RIDER_N; i++) {
      const r = riders[i]!;
      const slot = slots[i]!;
      r.human = next === "duo" ? i < 2 : i === 0;
      r.name = next === "duo" ? (i === 0 ? "P1" : i === 1 ? "P2" : NAMES[i]!) : i === 0 ? "YOU" : NAMES[i]!;
      r.z = slot.z;
      r.lat = slot.lat;
      r.latVel = 0;
      r.speed = 36;
      r.yaw = 0;
      r.lean = 0;
      r.health = 100;
      r.swing = 0;
      r.swingAge = 0;
      r.swingHit = false;
      r.cooldown = 0.2;
      r.attackSide = 1;
      r.steer = 0;
      r.throttle = false;
      r.brake = false;
      r.crashed = false;
      r.crashT = 0;
      r.recover = 0;
      r.flash = 0;
      r.invuln = 0.4;
      r.combo = 0;
      r.comboT = 0;
      r.score = 0;
      r.distance = 0;
      r.paint = i;
      r.weapon = 0;
      const kit = gearFor(i, r.human);
      r.maxHealth = kit.maxHealth;
      r.health = kit.maxHealth;
      r.grip = kit.grip;
      r.heavy = kit.heavy;
      r.canBoost = kit.canBoost;
      r.boostT = 0;
      r.boostCharge = r.human ? 1 : 0.25;
      r.sweep0 = r.z;
    }
    for (const p of pickups) p.alive = false;
    nextDropZ = 250;
    announcedDrop = false;
    result = "none";
    fastT = 0;
    hitHeat = 0;
    copTold = false;
    for (const cop of cops) cop.alive = false;
    setupTraffic();
    emit(true);
  }

  function gearFor(i: number, human: boolean) {
    if (human) {
      return {
        maxHealth: career.owned.includes("plate") ? 130 : 100,
        grip: career.owned.includes("grip"),
        heavy: career.owned.includes("chain"),
        canBoost: true,
      };
    }
    const lv = career.level;
    return {
      maxHealth: lv >= 2 && (i === 2 || i === 4 || i === 6) ? 115 : 100,
      grip: lv >= 4 && (i === 3 || i === 5),
      heavy: lv >= 4 && (i === 1 || i === 7),
      canBoost: lv >= 3 && (i === 2 || i === 5),
    };
  }

  function keepCareer() {
    if (!saveCareer(career)) {
      banner = "Purse not saved in this browser";
      bannerT = 2.4;
    }
  }

  function finishIfNeeded() {
    const humans = riders.filter((r) => r.human);
    if (!humans.length || saved) return;
    const crossed = humans.filter((h) => !h.crashed && h.distance >= RACE_M);
    if (crossed.length) {
      const leader = standings()[0] ?? 0;
      const won = crossed.some((h) => h.id === leader);
      phase = "over";
      bank(won ? "win" : "place");
      banner = won ? "RACE WON" : "FINISHED";
      bannerT = 2;
      emit(true);
      return;
    }
    if (!humans.every((h) => h.crashed && h.crashT > 1.05)) return;
    phase = "over";
    bank("wreck");
    emit(true);
  }

  function bank(kind: "win" | "place" | "wreck") {
    if (saved) return;
    saved = true;
    result = kind;
    const humans = riders.filter((r) => r.human);
    const score = Math.floor(humans.reduce((s, r) => s + r.score, 0));
    const distance = Math.floor(humans.reduce((s, r) => Math.max(s, r.distance), 0));
    const pay = kind === "win" ? 220 + Math.floor(score * 0.2) : kind === "place" ? 70 + Math.floor(score * 0.1) : Math.floor(score * 0.08);
    if (kind === "win") career.wins += 1;
    career.purse += pay;
    keepCareer();
    const name = mode === "duo" ? "DUO" : "YOU";
    const prev = loadScores();
    const best = prev[0]?.score ?? 0;
    freshBest = score > 0 && score >= best;
    scoreboard = saveScore({ name, score, distance, mode, at: Date.now() });
  }

  function sane(r: Rider) {
    if (!Number.isFinite(r.speed) || r.speed < 0) r.speed = 0;
    const boostCap = r.boostT > 0 ? MAX_SPEED * (r.human ? 2.3 : 1.6) : MAX_SPEED * 1.15;
    if (r.speed > boostCap) r.speed = boostCap;
    if (!Number.isFinite(r.z)) r.z = 40;
    if (!Number.isFinite(r.lat)) r.lat = 2.5;
    if (!Number.isFinite(r.latVel)) r.latVel = 0;
    if (!Number.isFinite(r.health)) r.health = 0;
    if (!Number.isFinite(r.lean)) r.lean = 0;
    if (!Number.isFinite(r.yaw)) r.yaw = 0;
  }

  function tick(dt: number) {
    time += dt;
    trauma = Math.max(0, trauma - dt * 1.5);
    hurtFlash = Math.max(0, hurtFlash - dt * 1.4);
    bannerT = Math.max(0, bannerT - dt);
    tipT = Math.max(0, tipT - dt);
    grace = Math.max(0, grace - dt);

    for (const p of parts) {
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.alive = false;
        continue;
      }
      p.z += p.vz * dt;
      p.lat += p.vlat * dt;
      p.y += p.vy * dt;
      p.vy -= 3.2 * dt;
      if (p.y < 0) {
        p.y = 0;
        p.vy *= -0.3;
      }
    }
    for (const f of floaters) {
      if (!f.alive) continue;
      f.life -= dt;
      f.y += dt * 1.4;
      if (f.life <= 0) f.alive = false;
    }

    if (phase === "title") {
      titleZ += 46 * dt;
      return;
    }
    if (phase === "pause" || phase === "over") {
      sfx.engineSpeed(0, false);
      return;
    }

    if (freeze > 0) {
      freeze -= dt;
      const audible = livingHumans()[0] ?? riders[0]!;
      sfx.engineSpeed(audible.speed, audible.throttle);
      return;
    }

    controlHumans();
    controlAI(dt);
    for (const r of riders) integrate(r, dt);
    separate();
    resolveSwings();
    for (const r of riders) scenery(r);
    carHits();
    updateCars(dt);
    updateCops(dt);
    updateDrops();
    collectLoot();
    finishIfNeeded();
    for (const r of riders) sane(r);

    const audible = livingHumans()[0] ?? riders[0]!;
    sfx.engineSpeed(audible.speed, audible.throttle);
  }

  function views(w: number, h: number): { view: View; rider: Rider }[] {
    if (mode === "solo" || phase === "title") {
      return [{ view: { x: 0, y: 0, w, h }, rider: riders[0]! }];
    }
    if (w >= 1000 && w > h * 1.15) {
      return [
        { view: { x: 0, y: 0, w: w / 2, h }, rider: riders[0]! },
        { view: { x: w / 2, y: 0, w: w / 2, h }, rider: riders[1]! },
      ];
    }
    return [
      { view: { x: 0, y: 0, w, h: h / 2 }, rider: riders[0]! },
      { view: { x: 0, y: h / 2, w, h: h / 2 }, rider: riders[1]! },
    ];
  }

  function render() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!Number.isFinite(dpr) || dpr <= 0) dpr = 1;
    const maxSide = 4096;
    const maxArea = 16_000_000;
    if (w * dpr > maxSide) dpr = maxSide / w;
    if (h * dpr > maxSide) dpr = Math.min(dpr, maxSide / h);
    if (w * h * dpr * dpr > maxArea) dpr = Math.min(dpr, Math.sqrt(maxArea / (w * h)));
    dpr = Math.max(0.25, dpr);
    const bw = Math.max(1, Math.min(maxSide, Math.floor(w * dpr)));
    const bh = Math.max(1, Math.min(maxSide, Math.floor(h * dpr)));
    try {
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } catch {
      return;
    }
    ctx.fillStyle = "#140e0c";
    ctx.fillRect(0, 0, w, h);

    const shots = phase === "title" ? [{ view: { x: 0, y: 0, w, h }, rider: riders[0]! }] : views(w, h);
    shots.forEach((shot, idx) => {
      const cam: Cam =
        phase === "title"
          ? {
              z: titleZ,
              x: centerX(titleZ),
              y: hillY(titleZ) + CAM_H,
              lat: 0,
              speed: 46,
              steer: Math.sin(time * 0.7) * 0.3,
              id: -1,
            }
          : {
              z: shot.rider.z - (3.8 + clamp(shot.rider.speed / MAX_SPEED, 0, 1) * 1.3),
              x: centerX(shot.rider.z - (3.8 + clamp(shot.rider.speed / MAX_SPEED, 0, 1) * 1.3)) + shot.rider.lat * 0.82,
              y: hillY(shot.rider.z) + CAM_H,
              lat: shot.rider.lat,
              speed: shot.rider.speed,
              steer: shot.rider.steer,
              id: shot.rider.id,
            };
      drawView(shot.view, cam, idx > 0);
    });

    if (mode === "duo" && phase !== "title") {
      ctx.save();
      ctx.fillStyle = "#e8a317";
      if (w >= h * 0.95) ctx.fillRect(w / 2 - 1, 0, 2, h);
      else ctx.fillRect(0, h / 2 - 1, w, 2);
      ctx.restore();
    }
  }

  function radial(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
    if (![x0, y0, r0, x1, y1, r1].every((n) => Number.isFinite(n))) return null;
    const inner = Math.max(0, r0);
    const outer = Math.max(inner + 1, r1);
    try {
      return ctx.createRadialGradient(x0, y0, inner, x1, y1, outer);
    } catch {
      return null;
    }
  }

  function setAlpha(a: number) {
    ctx.globalAlpha = Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 1;
  }

  function drawView(view: View, cam: Cam, second: boolean) {
    if (!(view.w > 2 && view.h > 2) || !Number.isFinite(cam.z) || !Number.isFinite(cam.x)) return;
    const mag = reduce ? 0 : trauma * trauma;
    const ox = Math.sin(time * 53 + (second ? 2 : 0)) * view.w * 0.012 * mag;
    const oy = Math.cos(time * 47) * view.h * 0.01 * mag;
    ctx.save();
    try {
    ctx.beginPath();
    ctx.rect(view.x, view.y, view.w, view.h);
    ctx.clip();
    ctx.translate(ox, oy);
    if (cam.id >= 0 && phase !== "title") {
      const roll = -(pose[cam.id] ?? 0) * 0.2;
      const cx = view.x + view.w * 0.5;
      const cy = view.y + view.h * 0.72;
      ctx.translate(cx, cy);
      ctx.rotate(roll);
      ctx.translate(-cx, -cy);
    }

    const focal = view.h * 0.84;
    const horizon = view.y + view.h * H_RATIO;
    const near = (CAM_H * focal) / (view.h * (1 - H_RATIO));
    const FAR = 220;
    const STEPS = 72;

    const sky = ctx.createLinearGradient(0, view.y, 0, horizon + 8);
    sky.addColorStop(0, map.sky[0]);
    sky.addColorStop(0.45, map.sky[1]);
    sky.addColorStop(1, map.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(view.x - 20, view.y - 20, view.w + 40, view.h + 40);

    const sunX = view.x + view.w * (0.68 + Math.sin(cam.z * 0.001) * 0.03);
    const sunY = horizon - view.h * 0.07;
    const sunR = Math.max(8, view.h * 0.16);
    const sun = radial(sunX, sunY, 2, sunX, sunY, sunR);
    if (sun) {
      sun.addColorStop(0, map.sun[0]);
      sun.addColorStop(0.35, map.sun[1]);
      sun.addColorStop(1, "rgba(232,163,23,0)");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(48, 28, 36, 0.45)";
    for (let i = 0; i < 4; i++) {
      const drift = ((cam.z * 0.0012 + i * 0.27) % 1 + 1) % 1;
      const cx = view.x + drift * view.w;
      const cy = view.y + view.h * (0.06 + (i % 2) * 0.07);
      ctx.beginPath();
      ctx.ellipse(cx, cy, view.w * 0.16, view.h * 0.035, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + view.w * 0.06, cy + 4, view.w * 0.1, view.h * 0.028, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawRidges(view, horizon, cam.z);

    ctx.fillStyle = map.ground[1];
    ctx.fillRect(view.x - 20, horizon, view.w + 40, view.h);

    const project = (z: number, wx: number, wy: number) => {
      const dz = z - cam.z;
      if (!Number.isFinite(dz) || dz < 0.12 || !Number.isFinite(focal) || focal <= 0) return null;
      const s = focal / dz;
      if (!Number.isFinite(s)) return null;
      return {
        x: view.x + view.w * 0.5 + (wx - cam.x) * s,
        y: horizon - (wy - (hillY(cam.z) + CAM_H)) * s,
        s,
      };
    };

    type Spr = { z: number; draw: (fog: number) => void };
    const spr: Spr[] = [];

    for (let i = STEPS - 1; i >= 0; i--) {
      const zFar = cam.z + near + ((i + 1) / STEPS) * (FAR - near);
      const zNear = cam.z + near + (i / STEPS) * (FAR - near);
      const fogT = clamp((zNear - cam.z) / FAR, 0, 1);
      const yFarH = hillY(zFar);
      const yNearH = hillY(zNear);
      const cFar = centerX(zFar);
      const cNear = centerX(zNear);
      const span = (z: number, lat: number, y: number) => project(z, centerX(z) + lat, y);

      const lF = span(zFar, -ROAD_HALF, yFarH);
      const rF = span(zFar, ROAD_HALF, yFarH);
      const lN = span(zNear, -ROAD_HALF, yNearH);
      const rN = span(zNear, ROAD_HALF, yNearH);
      if (!lF || !rF || !lN || !rN) continue;
      if (lN.y <= lF.y) continue;

      const yBandF = (lF.y + rF.y) / 2;
      const yBandN = (lN.y + rN.y) / 2;
      const stripe = Math.floor(zNear / 5) % 2;
      ctx.fillStyle = stripe ? map.ground[0] : map.ground[1];
      ctx.beginPath();
      ctx.moveTo(view.x - 30, yBandF);
      ctx.lineTo(view.x + view.w + 30, yBandF);
      ctx.lineTo(view.x + view.w + 30, yBandN);
      ctx.lineTo(view.x - 30, yBandN);
      ctx.fill();

      const shF_l = span(zFar, -ROAD_HALF - 2.4, yFarH);
      const shF_r = span(zFar, ROAD_HALF + 2.4, yFarH);
      const shN_l = span(zNear, -ROAD_HALF - 2.4, yNearH);
      const shN_r = span(zNear, ROAD_HALF + 2.4, yNearH);
      if (shF_l && shF_r && shN_l && shN_r) {
        ctx.fillStyle = mix(stripe ? map.dirt[0] : map.dirt[1], fogT);
        quad(shF_l, shF_r, shN_r, shN_l);
      }

      ctx.fillStyle = mix(stripe ? map.asphalt[0] : map.asphalt[1], fogT);
      quad(lF, rF, rN, lN);

      ctx.fillStyle = mix("#f4efe6", fogT);
      ribbon(span, zFar, zNear, yFarH, yNearH, -ROAD_HALF + 0.04, 0.07);
      ribbon(span, zFar, zNear, yFarH, yNearH, ROAD_HALF - 0.11, 0.07);

      const mark = ((Math.floor(zNear / 4) % 4) + 4) % 4;
      if (mark === 0 && zNear - cam.z > 8) {
        const zMark = zNear + (zFar - zNear) * 0.28;
        ctx.fillStyle = mix("#e8a317", fogT);
        ribbon(span, zMark, zNear, hillY(zMark), yNearH, -0.04, 0.08);
      }

      ctx.fillStyle = mix("#c2b6a4", fogT);
      ribbon(span, zFar, zNear, yFarH + 0.62, yNearH + 0.62, ROAD_HALF + 0.02, 0.1);
      ribbon(span, zFar, zNear, yFarH + 0.62, yNearH + 0.62, -ROAD_HALF - 0.12, 0.1);
      ctx.fillStyle = mix("#6e655c", fogT);
      ribbon(span, zFar, zNear, yFarH, yNearH, ROAD_HALF + 0.04, 0.06);
      ribbon(span, zFar, zNear, yFarH, yNearH, -ROAD_HALF - 0.1, 0.06);

      void cFar;
      void cNear;
    }

    if (phase !== "title") {
      const flow = cam.z * 0.17;
      const roadTop = horizon + (view.h - horizon) * 0.34;
      const roadBot = view.y + view.h;
      for (let i = 0; i < 14; i++) {
        const t = ((i / 14) + (flow % 1)) % 1;
        const y = roadTop + t * t * (roadBot - roadTop);
        const wpx = 2 + t * 5;
        const hpx = 5 + t * 14;
        const side = i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : 0;
        const xOff = side * (10 + t * 28);
        setAlpha(i % 3 === 2 ? 0.35 + t * 0.55 : 0.12 + t * 0.2);
        ctx.fillStyle = i % 3 === 2 ? "#e8a317" : "#1a1614";
        ctx.fillRect(view.x + view.w * 0.5 - wpx / 2 + xOff, y, wpx, hpx);
      }
      ctx.globalAlpha = 1;
    }

    if (phase !== "title" && cam.speed > 30) {
      const rush = clamp((cam.speed - 30) / 45, 0, 1);
      ctx.save();
      setAlpha(0.18 * rush);
      ctx.strokeStyle = "#f7f1e6";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        const u = (time * (0.55 + rush) + i * 0.16) % 1;
        const y = horizon + u * u * (view.h * (1 - H_RATIO));
        const spread = view.w * (0.18 + u * 0.34);
        const mid = view.x + view.w * 0.5;
        ctx.beginPath();
        ctx.moveTo(mid - spread, y);
        ctx.lineTo(mid - spread - 18 * rush, y + 10);
        ctx.moveTo(mid + spread, y);
        ctx.lineTo(mid + spread + 18 * rush, y + 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    const zStart = cam.z + near;
    const zEnd = cam.z + FAR;
    const seg0 = Math.floor(zStart / 8) - 1;
    const seg1 = Math.floor(zEnd / 8) + 1;
    for (let seg = seg1; seg >= seg0; seg--) {
      const prop = propAt(seg);
      if (!prop || prop.z < zStart || prop.z > zEnd) continue;
      const fogT = clamp((prop.z - cam.z) / FAR, 0, 1);
      spr.push({
        z: prop.z,
        draw: () => {
          const p = project(prop.z, centerX(prop.z) + prop.lat, hillY(prop.z));
          if (!p || p.s < 0.4) return;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(p.s, p.s);
          spriteYaw = clamp(-dCenter(prop.z) * 1.8, -0.4, 0.4);
          if (prop.kind === 1) drawTree(1 - fogT);
          else if (prop.kind === 2) drawSign(1 - fogT);
          else if (prop.kind === 3) drawPole(1 - fogT);
          else if (prop.kind === 4) drawCrowd(prop.z);
          else if (prop.kind === 5) drawCheer(prop.z);
          else if (prop.kind === 6) drawWall();
          ctx.restore();
        },
      });
    }

    if (phase !== "title") {
      for (const c of cars) {
        if (c.z < cam.z + 1 || c.z > cam.z + FAR) continue;
        const fogT = clamp((c.z - cam.z) / FAR, 0, 1);
        spr.push({
          z: c.z,
          draw: () => {
            const p = project(c.z, centerX(c.z) + c.lat, hillY(c.z));
            if (!p) return;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(p.s, p.s);
            spriteYaw = clamp(-dCenter(c.z) * 1.4, -0.35, 0.35);
            drawCar(c.oncoming, CAR_COLORS[c.style] ?? "#f3e6d0", 1 - fogT);
            ctx.restore();
          },
        });
      }
      for (const cop of cops) {
        if (!cop.alive || cop.z < cam.z + 1 || cop.z > cam.z + FAR) continue;
        const cz = cop.z;
        const clat = cop.lat;
        spr.push({
          z: cz,
          draw: () => {
            const p = project(cz, centerX(cz) + clat, hillY(cz));
            if (!p) return;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(p.s, p.s);
            spriteYaw = clamp(-dCenter(cz) * 1.4, -0.35, 0.35);
            drawCop();
            ctx.restore();
          },
        });
      }
      for (const loot of pickups) {
        if (!loot.alive || loot.z < cam.z + 1 || loot.z > cam.z + FAR) continue;
        const kind = loot.kind;
        const lz = loot.z;
        const llat = loot.lat;
        spr.push({
          z: lz,
          draw: () => {
            const p = project(lz, centerX(lz) + llat, hillY(lz));
            if (!p) return;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(p.s, p.s);
            drawLoot(kind);
            ctx.restore();
            if (p.s > 6) {
              ctx.fillStyle = "#f3e6d0";
              ctx.font = `600 ${Math.max(11, Math.min(18, p.s * 0.28))}px Barlow, sans-serif`;
              ctx.textAlign = "center";
              ctx.fillText(GEAR[kind]?.name ?? "TOOL", p.x, p.y - p.s * 2.4);
            }
          },
        });
      }
      if (cam.id >= 0) {
        const heroLine = riders[cam.id];
        if (heroLine && !heroLine.crashed) {
          const fz = heroLine.z + (RACE_M - heroLine.distance);
          if (fz > cam.z + 2 && fz < cam.z + FAR) {
            spr.push({
              z: fz,
              draw: () => {
                const left = project(fz, centerX(fz) - ROAD_HALF, hillY(fz) + 1.2);
                const right = project(fz, centerX(fz) + ROAD_HALF, hillY(fz) + 1.2);
                const lowL = project(fz, centerX(fz) - ROAD_HALF, hillY(fz));
                const lowR = project(fz, centerX(fz) + ROAD_HALF, hillY(fz));
                if (!left || !right || !lowL || !lowR) return;
                ctx.fillStyle = "#f3e6d0";
                ctx.beginPath();
                ctx.moveTo(left.x, left.y);
                ctx.lineTo(right.x, right.y);
                ctx.lineTo(lowR.x, lowR.y);
                ctx.lineTo(lowL.x, lowL.y);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#140e0c";
                const cells = 8;
                for (let n = 0; n < cells; n++) {
                  if (n % 2) continue;
                  const t0 = n / cells;
                  const t1 = (n + 1) / cells;
                  ctx.beginPath();
                  ctx.moveTo(left.x + (right.x - left.x) * t0, left.y + (right.y - left.y) * t0);
                  ctx.lineTo(left.x + (right.x - left.x) * t1, left.y + (right.y - left.y) * t1);
                  ctx.lineTo(lowL.x + (lowR.x - lowL.x) * t1, lowL.y + (lowR.y - lowL.y) * t1);
                  ctx.lineTo(lowL.x + (lowR.x - lowL.x) * t0, lowL.y + (lowR.y - lowL.y) * t0);
                  ctx.fill();
                }
              },
            });
          }
        }
      }
      for (const r of riders) {
        const dz = r.z - cam.z;
        if (dz < 0.55 || dz > FAR) continue;
        const hero = r.id === cam.id;
        const fogT = clamp(dz / FAR, 0, 1);
        spr.push({
          z: r.z,
          draw: () => {
            const pt = project(r.z, centerX(r.z) + r.lat, hillY(r.z));
            if (!pt) return;
            const natural = pt.s * 1.25;
            const scale = hero
              ? clamp(natural * 1.25, view.h * 0.34, view.h * 0.46)
              : Math.min(natural, view.h * 0.22);
            drawRiderSprite(r, pt.x, pt.y, scale, hero, hero ? 1 : 1 - fogT);
          },
        });
      }
    } else {
      for (let i = 0; i < RIDER_N; i++) {
        const ghost = riders[i]!;
        const z = cam.z + 8 + (RIDER_N - 1 - i) * 6.2;
        const lat = (i % 2 === 0 ? 1.55 : 3.85) + Math.sin(time * 0.8 + i) * 0.35;
        const lean = Math.sin(time * 0.7 + i) * 0.18;
        const waving = Math.sin(time * 1.6 + i * 1.3) > 0.82;
        const fogT = clamp((z - cam.z) / FAR, 0, 1);
        spr.push({
          z,
          draw: () => {
            const snap = {
              z: ghost.z,
              lat: ghost.lat,
              lean: ghost.lean,
              swing: ghost.swing,
              swingAge: ghost.swingAge,
              attackSide: ghost.attackSide,
              crashed: ghost.crashed,
              throttle: ghost.throttle,
              flash: ghost.flash,
              crashT: ghost.crashT,
            };
            ghost.z = z;
            ghost.lat = lat;
            ghost.lean = lean;
            ghost.crashed = false;
            ghost.throttle = true;
            ghost.flash = 0;
            ghost.crashT = 0;
            ghost.swing = waving ? 0.12 : 0;
            ghost.swingAge = waving ? 0.1 : 0;
            ghost.attackSide = i % 2 === 0 ? 1 : -1;
            try {
              const pt = project(z, centerX(z) + lat, hillY(z));
              if (pt) drawRiderSprite(ghost, pt.x, pt.y, Math.min(pt.s * 1.05, view.h * 0.22), false, 1 - fogT);
            } finally {
              ghost.z = snap.z;
              ghost.lat = snap.lat;
              ghost.lean = snap.lean;
              ghost.swing = snap.swing;
              ghost.swingAge = snap.swingAge;
              ghost.attackSide = snap.attackSide;
              ghost.crashed = snap.crashed;
              ghost.throttle = snap.throttle;
              ghost.flash = snap.flash;
              ghost.crashT = snap.crashT;
            }
          },
        });
      }
    }

    spr.sort((a, b) => b.z - a.z);
    for (const s of spr) s.draw(0);

    if (phase !== "title" && cam.id >= 0) {
      const hero = riders[cam.id];
      if (hero) {
        const heroPt = project(hero.z, centerX(hero.z) + hero.lat, hillY(hero.z));
        const heroX = heroPt?.x ?? view.x + view.w * 0.5;
        const heroY = heroPt?.y ?? view.y + view.h * 0.72;
        cops.forEach((cop, n) => {
          if (!cop.alive) return;
          const dz = cop.z - cam.z;
          if (dz < -32 || dz > 6) return;
          const side = clamp((cop.lat - hero.lat) / 2.2, -1, 1) || (n === 0 ? -1 : 1);
          const x = heroX + side * view.w * 0.36;
          const y = heroY + Math.min(view.h * 0.1, Math.max(0, -dz) * 2.2);
          const sc = Math.min(view.h * 0.16, view.w * 0.18, 78);
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(sc / 1.5, sc / 1.5);
          drawCop();
          ctx.restore();
          ctx.fillStyle = "#f3e6d0";
          ctx.font = "600 11px Barlow, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("POLICE", x, y - sc * 0.7);
        });
      }
    }


    for (const p of parts) {
      if (!p.alive) continue;
      const dz = p.z - cam.z;
      if (dz < 1 || dz > 80) continue;
      const pt = project(p.z, centerX(p.z) + p.lat, hillY(p.z) + p.y);
      if (!pt) continue;
      setAlpha(clamp(p.life / p.max, 0, 1));
      ctx.fillStyle = `rgb(${p.cr},${p.cg},${p.cb})`;
      const sz = Math.max(1.5, p.size * pt.s);
      ctx.fillRect(pt.x - sz / 2, pt.y - sz / 2, sz, sz);
      ctx.globalAlpha = 1;
    }

    for (const f of floaters) {
      if (!f.alive) continue;
      const pt = project(f.z, centerX(f.z) + f.lat, hillY(f.z) + f.y);
      if (!pt) continue;
      setAlpha(clamp(f.life / f.max, 0, 1));
      ctx.fillStyle = "#f3e6d0";
      ctx.font = `700 ${Math.max(14, pt.s * 0.22)}px Barlow, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(f.text, pt.x, pt.y);
      ctx.globalAlpha = 1;
    }

    if (cam.speed > 42 && phase === "play") {
      setAlpha(clamp((cam.speed - 42) / 50, 0, 0.35));
      ctx.strokeStyle = "#f3e6d0";
      ctx.lineWidth = 2;
      const lines = 8;
      for (let i = 0; i < lines; i++) {
        const t = (i / lines + time * 0.8) % 1;
        const y = horizon + t * (view.h * 0.7);
        const inset = (1 - t) * view.w * 0.42;
        ctx.beginPath();
        ctx.moveTo(view.x + 8, y);
        ctx.lineTo(view.x + inset, y - 10);
        ctx.moveTo(view.x + view.w - 8, y);
        ctx.lineTo(view.x + view.w - inset, y - 10);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    if (hurtFlash > 0 && cam.id >= 0 && riders[cam.id]?.human) {
      ctx.fillStyle = `rgba(214,69,42,${hurtFlash * 0.35})`;
      ctx.fillRect(view.x, view.y, view.w, view.h);
    }

    const vig = radial(
      view.x + view.w / 2,
      view.y + view.h * 0.55,
      Math.max(1, view.h * 0.3),
      view.x + view.w / 2,
      view.y + view.h * 0.5,
      Math.max(8, view.h * 0.78),
    );
    if (vig) {
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(8,5,4,0.45)");
      ctx.fillStyle = vig;
      ctx.fillRect(view.x, view.y, view.w, view.h);
    }

    if (phase !== "title" && cam.id >= 0 && riders[cam.id]?.crashed) {
      ctx.fillStyle = "rgba(12,9,8,0.35)";
      ctx.fillRect(view.x, view.y, view.w, view.h);
      ctx.fillStyle = "#f3e6d0";
      ctx.font = `600 ${Math.max(28, view.w * 0.06)}px Teko, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("WRECKED", view.x + view.w / 2, view.y + view.h * 0.46);
    }

    } finally {
      ctx.restore();
    }
  }

  function ribbon(
    span: (z: number, lat: number, y: number) => { x: number; y: number; s: number } | null,
    zFar: number,
    zNear: number,
    yFar: number,
    yNear: number,
    lat: number,
    width: number,
  ) {
    const a = span(zFar, lat, yFar);
    const b = span(zFar, lat + width, yFar);
    const c = span(zNear, lat + width, yNear);
    const d = span(zNear, lat, yNear);
    if (!a || !b || !c || !d) return;
    quad(a, b, c, d);
  }

  function quad(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number },
    d: { x: number; y: number },
  ) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawRidges(view: View, horizon: number, z: number) {
    const parallax = centerX(z) * 1.6;
    ctx.fillStyle = map.ridge[0];
    ridge(view, horizon, parallax * 0.15, 0.16, 0.05);
    ctx.fillStyle = map.ridge[1];
    ridge(view, horizon, parallax * 0.35, 0.1, 0.08);
  }

  function ridge(view: View, horizon: number, shift: number, h: number, yOff: number) {
    ctx.beginPath();
    const base = horizon - view.h * yOff;
    ctx.moveTo(view.x - 40, base);
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = view.x - 40 + (view.w + 80) * t;
      const n = Math.sin(t * 7 + shift * 0.01) * 0.6 + Math.sin(t * 3 + 1.2) * 0.4;
      ctx.lineTo(x, base - view.h * h * (0.45 + n * 0.55));
    }
    ctx.lineTo(view.x + view.w + 40, base);
    ctx.closePath();
    ctx.fill();
  }

  function drawCrowd(seed: number) {
    const img = worldArt("crowd");
    if (img) {
      const wave = Math.sin(time * 5 + seed) * 0.04;
      ctx.save();
      ctx.translate(wave, 0);
      paintWorld(ctx, img, 1.7, spriteYaw);
      ctx.restore();
      return;
    }
    const wave = Math.sin(time * 6 + seed) * 0.12;
    const colors = ["#d6452a", "#3d6ea8", "#f3e6d0", "#2f6f4e", "#c4843c"];
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 0.42;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(x, 0.05, 0.16, 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors[(hash(seed + i) + i) % colors.length]!;
      ctx.fillRect(x - 0.1, -0.72, 0.2, 0.48);
      ctx.fillStyle = "#e0b090";
      ctx.beginPath();
      ctx.arc(x, -0.86, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e0b090";
      ctx.lineWidth = 0.05;
      ctx.beginPath();
      ctx.moveTo(x, -0.62);
      ctx.lineTo(x + (i % 2 === 0 ? 0.18 : -0.16), -0.95 - wave);
      ctx.stroke();
    }
  }

  function drawCheer(seed: number) {
    const img = worldArt("crowd");
    if (img) {
      ctx.save();
      ctx.translate(Math.sin(time * 6 + seed) * 0.03, 0);
      paintWorld(ctx, img, 1.85, spriteYaw);
      ctx.restore();
      return;
    }
    const wave = Math.sin(time * 7 + seed);
    const looks = [
      { hair: "#1a120c", top: "#d6452a", legs: "#1c2438", skin: "#e0b090" },
      { hair: "#3a2414", top: "#f3e6d0", legs: "#6a3a4a", skin: "#c48a62" },
      { hair: "#14100e", top: "#e8a317", legs: "#2a2420", skin: "#f0c8a0" },
    ];
    for (let i = 0; i < 2; i++) {
      const look = looks[(hash(seed + i * 3) + i) % looks.length]!;
      const x = (i === 0 ? -0.28 : 0.3) + wave * 0.02;
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(x, 0.06, 0.2, 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = look.legs;
      ctx.fillRect(x - 0.1, -0.42, 0.08, 0.4);
      ctx.fillRect(x + 0.02, -0.42, 0.08, 0.4);
      ctx.fillStyle = look.top;
      ctx.beginPath();
      ctx.moveTo(x - 0.16, -0.95);
      ctx.lineTo(x + 0.16, -0.95);
      ctx.lineTo(x + 0.12, -0.42);
      ctx.lineTo(x - 0.12, -0.42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = look.skin;
      ctx.fillRect(x - 0.05, -0.48, 0.1, 0.1);
      ctx.beginPath();
      ctx.arc(x, -1.12, 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = look.hair;
      ctx.beginPath();
      ctx.arc(x, -1.16, 0.14, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 0.14, -1.16, 0.06, 0.34);
      ctx.fillRect(x + 0.08, -1.16, 0.06, 0.28);
      ctx.strokeStyle = look.skin;
      ctx.lineWidth = 0.05;
      ctx.beginPath();
      ctx.moveTo(x + 0.1, -0.86);
      ctx.lineTo(x + 0.28, -1.15 - wave * 0.12);
      ctx.stroke();
      ctx.strokeStyle = "#e8a317";
      ctx.lineWidth = 0.04;
      ctx.beginPath();
      ctx.moveTo(x + 0.28, -1.15 - wave * 0.12);
      ctx.lineTo(x + 0.42, -1.02);
      ctx.stroke();
    }
  }

  function drawWall() {
    ctx.save();
    ctx.rotate(spriteYaw);
    const courses = ["#8d7352", "#a88b62", "#7a6246", "#b89a6e"];
    for (let row = 0; row < 6; row++) {
      const y = -0.22 - row * 0.28;
      for (let col = 0; col < 6; col++) {
        const x = -0.95 + col * 0.32 + (row % 2 ? 0.16 : 0);
        ctx.fillStyle = courses[(row + col) % courses.length]!;
        ctx.fillRect(x, y, 0.3, 0.26);
        ctx.fillStyle = "rgba(40,24,12,0.35)";
        ctx.fillRect(x, y + 0.22, 0.3, 0.03);
      }
    }
    ctx.fillStyle = "#c4a46c";
    for (let i = 0; i < 5; i++) ctx.fillRect(-0.82 + i * 0.36, -2.05, 0.22, 0.32);
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(0.22, -2.7, 0.7, 0.7);
    ctx.fillStyle = "#3a2a1c";
    ctx.fillRect(0.34, -2.95, 0.18, 0.28);
    ctx.fillRect(0.62, -2.95, 0.18, 0.28);
    ctx.restore();
  }

  function drawCop() {
    const art = worldArt("rear");
    const flash = Math.sin(time * 18) > 0;
    ctx.save();
    ctx.rotate(spriteYaw * 0.5);
    if (art) paintWorld(ctx, art, 1.7, 0);
    else {
      ctx.fillStyle = "#f4f7f8";
      ctx.fillRect(-0.7, -1.2, 1.4, 0.9);
    }
    ctx.fillStyle = flash ? "#d6452a" : "#3d6ea8";
    ctx.fillRect(-0.28, -1.55, 0.22, 0.14);
    ctx.fillStyle = flash ? "#3d6ea8" : "#d6452a";
    ctx.fillRect(0.06, -1.55, 0.22, 0.14);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(-0.18, -0.95, 0.36, 0.16);
    ctx.restore();
  }

  function drawTree(fade: number) {
    setAlpha(0.4 + fade * 0.6);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0.15, 0.08, 0.7, 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    if (map.flora === "scrub") {
      const bush = worldArt("scrub");
      if (bush) {
        paintWorld(ctx, bush, 2.2, spriteYaw);
        setAlpha(1);
        return;
      }
      ctx.fillStyle = "#2f6f4e";
      ctx.fillRect(-0.18, -1.7, 0.36, 1.7);
      ctx.fillRect(-0.55, -1.15, 0.28, 0.7);
      ctx.fillRect(0.28, -1.25, 0.26, 0.62);
      ctx.fillStyle = "#1e4a34";
      ctx.fillRect(-0.08, -1.7, 0.1, 1.7);
      setAlpha(1);
      return;
    }
    if (map.flora === "pine") {
      const pine = worldArt("pine");
      if (pine) {
        paintWorld(ctx, pine, 4.2, spriteYaw);
        setAlpha(1);
        return;
      }
      ctx.fillStyle = "#3a2a1e";
      ctx.fillRect(-0.1, -1.15, 0.2, 1.15);
      ctx.fillStyle = "#163024";
      ctx.beginPath();
      ctx.moveTo(0, -3.3);
      ctx.lineTo(0.85, -1.15);
      ctx.lineTo(-0.85, -1.15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2f6f4e";
      ctx.beginPath();
      ctx.moveTo(0, -2.7);
      ctx.lineTo(0.62, -1.55);
      ctx.lineTo(-0.62, -1.55);
      ctx.closePath();
      ctx.fill();
      setAlpha(1);
      return;
    }
    if (map.flora === "palm") {
      const palm = worldArt("palm");
      if (palm) {
        paintWorld(ctx, palm, 4.4, spriteYaw);
        setAlpha(1);
        return;
      }
    }
    ctx.fillStyle = "#6a4a32";
    ctx.fillRect(-0.1, -1.9, 0.2, 1.9);
    ctx.fillStyle = "#1e3a28";
    ctx.beginPath();
    ctx.ellipse(-0.7, -2.15, 0.55, 0.16, -0.5, 0, Math.PI * 2);
    ctx.ellipse(0.7, -2.2, 0.55, 0.16, 0.5, 0, Math.PI * 2);
    ctx.ellipse(0, -2.55, 0.42, 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3f6b46";
    ctx.beginPath();
    ctx.ellipse(-0.55, -2.28, 0.4, 0.12, -0.4, 0, Math.PI * 2);
    ctx.ellipse(0.55, -2.32, 0.4, 0.12, 0.4, 0, Math.PI * 2);
    ctx.fill();
    setAlpha(1);
  }

  function drawLoot(kind: number) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 0.08, 0.55, 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8a317";
    ctx.fillRect(-0.35, -0.08, 0.7, 0.1);
    if (kind === 2) {
      ctx.strokeStyle = "#d8d2c6";
      ctx.lineWidth = 0.12;
      ctx.beginPath();
      ctx.moveTo(0, -0.15);
      ctx.lineTo(0.05, -1.15);
      ctx.moveTo(-0.18, -1.05);
      ctx.lineTo(0.22, -1.2);
      ctx.moveTo(-0.12, -0.85);
      ctx.lineTo(0.22, -0.7);
      ctx.stroke();
    } else if (kind === 3) {
      ctx.strokeStyle = "#9aa7b2";
      ctx.lineWidth = 0.14;
      ctx.beginPath();
      ctx.moveTo(-0.05, -0.1);
      ctx.lineTo(0.08, -1.7);
      ctx.stroke();
      ctx.strokeStyle = "#eef2f4";
      ctx.lineWidth = 0.04;
      ctx.beginPath();
      ctx.moveTo(-0.1, -0.2);
      ctx.lineTo(0.02, -1.6);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#6b3e22";
      ctx.lineWidth = 0.16;
      ctx.beginPath();
      ctx.moveTo(0, -0.1);
      ctx.lineTo(0.06, -1.35);
      ctx.stroke();
    }
  }

  function drawSign(fade: number) {
    setAlpha(0.4 + fade * 0.6);
    ctx.fillStyle = "#2a211c";
    ctx.fillRect(-0.05, -2.3, 0.1, 2.3);
    ctx.fillStyle = "#e8a317";
    ctx.fillRect(-0.7, -3.05, 1.4, 0.8);
    ctx.fillStyle = "#140e0c";
    ctx.fillRect(-0.55, -2.9, 1.1, 0.12);
    ctx.fillRect(-0.55, -2.65, 0.7, 0.1);
    ctx.globalAlpha = 1;
  }

  function drawPole(fade: number) {
    setAlpha(0.4 + fade * 0.6);
    ctx.fillStyle = "#2a211c";
    ctx.fillRect(-0.06, -3.2, 0.12, 3.2);
    ctx.fillStyle = "#f3e6d0";
    ctx.beginPath();
    ctx.arc(0.15, -3.25, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function tread(cx: number, cy: number, radius: number, spin: number) {
    if (!(radius > 0.02)) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.rotate(spin);
    ctx.strokeStyle = "rgba(196,188,172,0.9)";
    ctx.lineWidth = Math.max(1, radius * 0.14);
    ctx.lineCap = "butt";
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(0, radius * 0.22);
      ctx.lineTo(0, radius * 0.88);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(40,34,30,0.9)";
    ctx.fill();
    ctx.restore();
  }

  function drawCar(oncoming: boolean, color: string, fade: number) {
    setAlpha(0.45 + fade * 0.55);
    const art = worldArt(oncoming ? "front" : "rear");
    if (art) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 0.06, 0.95, 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      paintWorld(ctx, art, 1.85, 0);
      const roll = time * (oncoming ? 22 : 16);
      tread(-0.78, -0.22, 0.22, roll);
      tread(0.78, -0.22, 0.22, roll);
      if (oncoming) {
        const glow = radial(0, -0.7, 0.05, 0, -0.7, 1.4);
        if (glow) {
          glow.addColorStop(0, "rgba(255,244,210,0.28)");
          glow.addColorStop(1, "rgba(255,244,210,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, -0.55, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      return;
    }
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 0.05, 1.05, 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(-0.9, -1.35, 1.8, 1.15);
    ctx.fillStyle = "#1c2438";
    ctx.fillRect(-0.7, -1.25, 1.4, 0.42);
    if (oncoming) {
      ctx.fillStyle = "#f3e6d0";
      ctx.fillRect(-0.7, -0.55, 0.28, 0.18);
      ctx.fillRect(0.42, -0.55, 0.28, 0.18);
      ctx.fillStyle = "rgba(243,230,208,0.35)";
      ctx.beginPath();
      ctx.arc(-0.56, -0.46, 0.35, 0, Math.PI * 2);
      ctx.arc(0.56, -0.46, 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#d6452a";
      ctx.fillRect(-0.75, -0.48, 0.3, 0.16);
      ctx.fillRect(0.45, -0.48, 0.3, 0.16);
    }
    ctx.globalAlpha = 1;
  }

  function drawHandGear(r: Rider, flash: boolean) {
    const swinging = r.swing > 0 && !r.crashed;
    const t = clamp(r.swingAge / 0.22, 0, 1);
    const sweep = -1.15 + t * 2.6;
    const side = r.attackSide || 1;
    ctx.save();
    ctx.translate(side * 18, -78);
    ctx.rotate(swinging ? (side > 0 ? sweep : -sweep) : side > 0 ? 0.85 : -0.85);
    ctx.lineCap = "round";
    if (r.weapon === 2) {
      ctx.strokeStyle = flash ? "#fff" : "#c8c2b6";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(36, 2);
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(32, 2);
      ctx.lineTo(44, -8);
      ctx.moveTo(33, 4);
      ctx.lineTo(46, 12);
      ctx.stroke();
    } else if (r.weapon === 3) {
      ctx.strokeStyle = flash ? "#fff" : "#8b97a3";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.lineTo(58, 2);
      ctx.stroke();
      ctx.strokeStyle = flash ? "#fff" : "#e7edf1";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(4, -1);
      ctx.lineTo(52, 0);
      ctx.stroke();
    } else if (r.weapon === 1) {
      ctx.strokeStyle = flash ? "#fff" : "#5c3418";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(44, 4);
      ctx.stroke();
      ctx.strokeStyle = flash ? "#fff" : "#c4843c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, -2);
      ctx.lineTo(38, 1);
      ctx.stroke();
    } else if (swinging) {
      ctx.strokeStyle = flash ? "#fff" : "#b7aa96";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(46, 6);
      ctx.stroke();
      ctx.fillStyle = flash ? "#fff" : "#d9d0c2";
      for (let i = 1; i <= 7; i++) {
        ctx.beginPath();
        ctx.ellipse(i * 6.2, 4 + Math.sin(i) * 1.5, 3.1, 2.2, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = flash ? "#fff" : "#c4b6a0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.quadraticCurveTo(18, 16, 8, 28);
      ctx.stroke();
      ctx.fillStyle = flash ? "#fff" : "#ddd4c6";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(6 + i * 2.2, 6 + i * 5, 2.6, 1.8, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawHinged(
    img: CanvasImageSource & { width: number; height: number },
    left: number,
    top: number,
    dw: number,
    dh: number,
    r: Rider,
  ) {
    const lean = pose[r.id] ?? r.lean;
    const swing = r.swing > 0 ? (r.attackSide || 1) * clamp(r.swingAge / 0.22, 0, 1) * 0.3 : 0;
    const bank = -lean * 0.42 + swing;
    const drop = (sprung[r.id] ?? 0) * dh;
    ctx.translate(-lean * dw * 0.04, drop);
    ctx.rotate(bank);
    ctx.drawImage(img, left, top, dw, dh);
    tread(left + dw * 0.371, top + dh * 0.9, dh * 0.04, r.distance / 0.28);
  }

  function drawRiderSprite(r: Rider, x: number, y: number, scale: number, hero: boolean, fade = 1) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const flash = r.flash > 0.04;
    const s = clamp(Number.isFinite(scale) ? scale : 48, 18, 420);
    ctx.save();
    try {
      ctx.translate(x, y);
      const buzz = r.crashed ? 0 : Math.sin(r.distance * 16) * clamp(r.speed / 36, 0, 1) * Math.min(2, s * 0.012);
      const bob = r.crashed ? 0 : Math.sin(time * (7 + Math.min(10, r.speed * 0.12)) + r.id) * Math.min(3, s * 0.016);
      ctx.translate(buzz, bob);
      if (r.crashed) {
        ctx.strokeStyle = "rgba(20,14,12,0.55)";
        ctx.lineWidth = Math.max(3, s * 0.04);
        ctx.beginPath();
        ctx.moveTo(-s * 0.55, 6);
        ctx.lineTo(s * 0.7, 2);
        ctx.stroke();
        ctx.translate(s * 0.08, s * 0.16);
        ctx.rotate(clamp(r.crashT * 1.6, 0, 1.2) * (r.id % 2 === 0 ? 1 : -1));
        ctx.scale(1, 0.48);
      } else if (s <= 70) {
        const swingPose = r.swing > 0 ? (r.attackSide || 1) * clamp(r.swingAge / 0.22, 0, 1) * 0.28 : 0;
        ctx.rotate(-r.lean * 0.45 + swingPose);
      }
      setAlpha(clamp(fade, 0.15, 1));
      const poster = posterFor(r.paint);
      const img = poster?.img ?? riderSheet(r.paint % PAINTS.length);
      const dh = s * (poster ? 1.15 : 1.05);
      const dw = dh * (img.width / img.height);
      const anchor = poster?.anchor ?? 0.5;
      ctx.imageSmoothingEnabled = true;
      if (flash) ctx.filter = "brightness(2.2)";
      if (!r.crashed && s > 70) drawHinged(img, -dw * anchor, -dh, dw, dh, r);
      else ctx.drawImage(img, -dw * anchor, -dh, dw, dh);
      ctx.filter = "none";
      if (!r.crashed && s <= 70) {
        const hub = dh * 0.042;
        tread(dw * (0.371 - anchor), -dh * 0.105, hub, r.distance / 0.28);
      }

      if (!r.crashed && (r.swing > 0 || r.weapon > 0)) {
      const swinging = r.swing > 0;
      const t = clamp(r.swingAge / 0.22, 0, 1);
      const side = r.attackSide || 1;
      const ox = side * dw * 0.22;
      const oy = -dh * 0.58;
      const reach = swinging ? dw * (0.22 + t * 0.42) : dw * 0.18;
      const drop = swinging ? -dh * 0.08 : dh * 0.16;
      ctx.strokeStyle = flash ? "#fff" : r.weapon === 2 ? "#d5d0c6" : r.weapon === 3 ? "#b7c0c8" : "#6a3a18";
      ctx.lineWidth = Math.max(3, dw * (r.weapon === 3 ? 0.055 : 0.04));
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + side * reach, oy + drop);
      ctx.stroke();
      if (r.weapon === 0) {
        ctx.fillStyle = flash ? "#fff" : "#e7dfd2";
        for (let i = 0; i < 6; i++) {
          const u = i / 5;
          ctx.beginPath();
          ctx.arc(ox + side * reach * u, oy + drop * u, Math.max(2, dw * 0.028), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (r.weapon === 2) {
        ctx.strokeStyle = flash ? "#fff" : "#eee8dc";
        ctx.lineWidth = Math.max(2, dw * 0.03);
        ctx.beginPath();
        ctx.moveTo(ox + side * reach, oy + drop);
        ctx.lineTo(ox + side * reach * 1.15, oy + drop - dh * 0.06);
        ctx.moveTo(ox + side * reach, oy + drop);
        ctx.lineTo(ox + side * reach * 1.12, oy + drop + dh * 0.05);
        ctx.stroke();
      }
      }

      if (!poster && r.throttle && !r.crashed) {
        ctx.fillStyle = "#e23b2e";
        ctx.fillRect(-dw * 0.34, -dh * 0.08, dw * 0.08, dh * 0.035);
        ctx.fillRect(dw * 0.26, -dh * 0.08, dw * 0.08, dh * 0.035);
      }
      if (r.boostT > 0 && !r.crashed) {
        ctx.fillStyle = "rgba(90,180,255,0.95)";
        ctx.beginPath();
        ctx.moveTo(-dw * 0.42, -dh * 0.06);
        ctx.lineTo(-dw * 0.62, -dh * 0.04);
        ctx.lineTo(-dw * 0.4, -dh * 0.02);
        ctx.moveTo(dw * 0.42, -dh * 0.06);
        ctx.lineTo(dw * 0.64, -dh * 0.04);
        ctx.lineTo(dw * 0.4, -dh * 0.02);
        ctx.fill();
      }
      ctx.imageSmoothingEnabled = true;
    } finally {
      ctx.restore();
    }

    if (!hero && s > 36 && !r.crashed) {
      ctx.save();
      try {
        setAlpha(clamp(fade, 0.2, 1));
        const labelY = y - s * 0.98;
        ctx.fillStyle = "#f3e6d0";
        ctx.font = `600 ${Math.max(11, Math.min(18, s * 0.11))}px Barlow, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(r.name, x, labelY);
        const hp = clamp(r.health / Math.max(1, r.maxHealth), 0, 1);
        ctx.fillStyle = "#140e0c";
        ctx.fillRect(x - 16, labelY + 4, 32, 3);
        ctx.fillStyle = hp < 0.3 ? "#d6452a" : "#e8a317";
        ctx.fillRect(x - 16, labelY + 4, 32 * hp, 3);
      } finally {
        ctx.restore();
      }
    }
  }

  function loop(now: number) {
    if (!running) return;
    try {
      let dt = (now - lastTs) / 1000;
      if (!Number.isFinite(dt) || dt < 0) dt = 0;
      dt = Math.min(0.05, dt);
      lastTs = now;
      acc += dt;
      let steps = 0;
      while (acc >= 1 / 60 && steps < 5) {
        tick(1 / 60);
        acc -= 1 / 60;
        steps++;
      }
      render();
      emit(phase !== lastPhase);
      lastPhase = phase;
      frameFaults = 0;
    } catch (err) {
      frameFaults += 1;
      if (frameFaults === 1) console.error(err);
      acc = 0;
    }
    if (running) raf = requestAnimationFrame(loop);
  }

  let lastTs = performance.now();
  let acc = 0;
  let lastPhase: Phase = phase;

  window.__controlsTest = probe;

  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.code === "Escape" || e.code === "KeyP") {
      if (phase === "play") {
        phase = "pause";
        emit(true);
      } else if (phase === "pause") {
        phase = "play";
        emit(true);
      }
    } else if ((e.code === "KeyR" || e.code === "Enter") && phase === "over") {
      reset(mode);
    } else if (e.code === "Enter" && phase === "title") {
      sfx.unlock();
      reset("solo");
    }
  };
  window.addEventListener("keydown", onKey);
  const onLost = (e: Event) => {
    e.preventDefault();
  };
  canvas.addEventListener("contextlost", onLost);

  emit(true);
  raf = requestAnimationFrame(loop);

  return {
    start(next: Mode) {
      sfx.unlock();
      reset(next);
    },
    restart() {
      sfx.unlock();
      reset(mode);
    },
    toTitle() {
      phase = "title";
      freshBest = false;
      emit(true);
    },
    togglePause() {
      if (phase === "play") phase = "pause";
      else if (phase === "pause") phase = "play";
      emit(true);
    },
    toggleMute() {
      sfx.unlock();
      sfx.toggle();
      emit(true);
    },
    hear() {
      sfx.setMuted(false);
      sfx.unlock();
      emit(true);
    },
    pointer(code: string, down: boolean) {
      if (down) sfx.unlock();
      input.pointer(code, down);
    },
    edge(player: 0 | 1, v: number) {
      input.setEdge(player, v);
    },
    setMap(id: MapId) {
      useMap(id);
      emit(true);
    },
    levelUp() {
      if (!canLevelUp(career)) return;
      career = { ...career, level: career.level + 1 };
      keepCareer();
      emit(true);
    },
    buy(id: ItemId) {
      const item = SHOP.find((entry) => entry.id === id);
      if (!item || career.owned.includes(id) || career.level < item.level || career.purse < item.cost) return false;
      career = { ...career, purse: career.purse - item.cost, owned: [...career.owned, id] };
      keepCareer();
      emit(true);
      return true;
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      input.dispose();
      sfx.dispose();
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("contextlost", onLost);
      if (window.__controlsTest === probe) delete window.__controlsTest;
    },
  };
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getLean?: () => number;
      getSpeed: () => number;
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}
