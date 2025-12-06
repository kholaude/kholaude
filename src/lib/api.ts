const BASE = import.meta.env.VITE_BACKEND_URL;

export type Timeframe = "1d" | "1w" | "1m";

export type LeaderboardRow = {
  wallet: string;
  nickname: string;
  polyUsername: string | null;
  profileUrl: string;
  balanceUsd: number | null;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
};

const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

export async function importWallet(wallet: string, nickname: string, inviteCode: string) {
  const res = await fetch(`${BASE}/api/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...NGROK_HEADERS,
    },
    body: JSON.stringify({ wallet, nickname, inviteCode }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchLeaderboard(timeframe: Timeframe) {
  const res = await fetch(`${BASE}/api/leaderboard?timeframe=${timeframe}`, {
    headers: {
      accept: "application/json",
      ...NGROK_HEADERS,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<{ timeframe: Timeframe; updatedAt: number; rows: LeaderboardRow[] }>;
}
