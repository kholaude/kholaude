import type { PnlResponse, Timeframe } from "./api";

const LAST_KEY = "pnl:last";
const SNAP_PREFIX = "pnl:snapshot:";

function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function saveLastResult(data: PnlResponse) {
  localStorage.setItem(LAST_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
}

export function loadLastResult(): (PnlResponse & { savedAt?: number }) | null {
  const raw = localStorage.getItem(LAST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveTodaySnapshot(data: PnlResponse) {
  const key = SNAP_PREFIX + ymd();
  localStorage.setItem(key, JSON.stringify({ ...data, savedAt: Date.now() }));
}

export function loadYesterdaySnapshot(): (PnlResponse & { savedAt?: number }) | null {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const key = SNAP_PREFIX + ymd(d);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function normalizeRowsForUi(rows: any[]) {
  return rows.map((r) => ({
    wallet: r.wallet,
    pnlUsd: r.pnlUsd ?? r.pnlEth ?? "0",
    holdingsUsd: r.holdingsUsd ?? null,
  }));
}

export function timeframeLabel(tf: Timeframe) {
  if (tf === "1w") return "1 нед";
  if (tf === "1m") return "1 мес";
  return "1 год";
}
