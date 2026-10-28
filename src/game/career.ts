export type ItemId = "plate" | "grip" | "chain" | "tank";

export type ShopItem = {
  id: ItemId;
  name: string;
  blurb: string;
  cost: number;
  level: number;
};

export const SHOP: ShopItem[] = [
  { id: "plate", name: "PLATE", blurb: "+30 health", cost: 350, level: 1 },
  { id: "grip", name: "GRIP", blurb: "Holds the corners", cost: 450, level: 1 },
  { id: "chain", name: "HEAVY CHAIN", blurb: "Hits harder", cost: 600, level: 2 },
  { id: "tank", name: "QUICK TANK", blurb: "Boost refills faster", cost: 700, level: 2 },
];

export type Career = {
  level: number;
  wins: number;
  purse: number;
  owned: ItemId[];
};

const KEY = "chainbreak-career-v1";
const MAX_LEVEL = 5;

export function emptyCareer(): Career {
  return { level: 1, wins: 0, purse: 0, owned: [] };
}

export function winsNeeded(level: number): number {
  if (level >= MAX_LEVEL) return Number.POSITIVE_INFINITY;
  return [1, 3, 6, 10][level - 1] ?? 99;
}

export function canLevelUp(c: Career): boolean {
  return c.level < MAX_LEVEL && c.wins >= winsNeeded(c.level);
}

export function loadCareer(): Career {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyCareer();
    const data = JSON.parse(raw) as Partial<Career>;
    const owned = Array.isArray(data.owned)
      ? data.owned.filter((id): id is ItemId => SHOP.some((item) => item.id === id))
      : [];
    const level = Number.isFinite(data.level) ? Math.max(1, Math.min(MAX_LEVEL, Math.floor(data.level as number))) : 1;
    const wins = Number.isFinite(data.wins) ? Math.max(0, Math.floor(data.wins as number)) : 0;
    const purse = Number.isFinite(data.purse) ? Math.max(0, Math.floor(data.purse as number)) : 0;
    return { level, wins, purse, owned };
  } catch {
    return emptyCareer();
  }
}

export function saveCareer(c: Career) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
    return true;
  } catch {
    return false;
  }
}
