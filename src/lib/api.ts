const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export type Timeframe = "1w" | "1m" | "1y";

export type WalletRow = {
  wallet: string;

  // старые поля могли остаться для совместимости
  startBalanceEth?: string;
  currentBalanceEth?: string;
  pnlEth?: string;

  // новые поля для Polymarket-режима
  pnlUsd?: string;
  holdingsUsd?: string | null;
  openCashPnlUsd?: string | null;
  unit?: "USD";
};

export type PnlResponse = {
  timeframe: Timeframe;
  startTs?: number;
  nowTs?: number;
  unit?: "USD";
  rows: WalletRow[];
  note?: string;
};

export async function fetchPnl(wallets: string[], timeframe: Timeframe): Promise<PnlResponse> {
  const res = await fetch(`${BASE}/api/pnl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallets, timeframe }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}
