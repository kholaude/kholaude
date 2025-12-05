export type Timeframe = "1w" | "1m" | "1y";

export type WalletRow = {
  wallet: string;
  startBalanceEth: string;
  currentBalanceEth: string;
  pnlEth: string;
};

export type AnalyzeResponse = {
  timeframe: Timeframe;
  updatedAt: string;
  startBlock: number;
  latestBlock: number;
  rows: WalletRow[];
};

const BASE = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";

export async function analyzeWallets(wallets: string[], timeframe: Timeframe) {
  const res = await fetch(`${BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallets, timeframe })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "API error");
  }

  return (await res.json()) as AnalyzeResponse;
}
