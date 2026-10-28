export type ScoreRow = {
  name: string;
  score: number;
  distance: number;
  mode: "solo" | "duo";
  at: number;
};

const KEY = "chainbreak-scores-v1";

export function loadScores(): ScoreRow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as { version?: number; rows?: ScoreRow[] };
    if (!data || data.version !== 1 || !Array.isArray(data.rows)) return [];
    return data.rows
      .filter((r) => r && typeof r.score === "number" && Number.isFinite(r.score))
      .slice(0, 8);
  } catch {
    return [];
  }
}

export function saveScore(row: ScoreRow): ScoreRow[] {
  const safe: ScoreRow = {
    name: String(row.name || "YOU").slice(0, 12),
    score: Number.isFinite(row.score) ? Math.max(0, Math.floor(row.score)) : 0,
    distance: Number.isFinite(row.distance) ? Math.max(0, Math.floor(row.distance)) : 0,
    mode: row.mode === "duo" ? "duo" : "solo",
    at: Number.isFinite(row.at) ? row.at : Date.now(),
  };
  const rows = [...loadScores(), safe].sort((a, b) => b.score - a.score).slice(0, 8);
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, rows }));
    return rows;
  } catch {
    return rows;
  }
}
