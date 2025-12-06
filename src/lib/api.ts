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

export async function importWallet(wallet: string, nickname: string, inviteCode: string) {
  const res = await fetch(`${BASE}/api/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet, nickname, inviteCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchLeaderboard(timeframe: Timeframe) {
  const res = await fetch(`${BASE}/api/leaderboard?timeframe=${timeframe}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    timeframe: Timeframe;
    updatedAt: number;
    rows: LeaderboardRow[];
  }>;
}
