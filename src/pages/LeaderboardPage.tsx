import { useMemo } from "react";
import type { Timeframe } from "../lib/api";
import {
  loadLastResult,
  loadYesterdaySnapshot,
  normalizeRowsForUi,
  timeframeLabel,
} from "../lib/storage";

type Props = {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
};

function profileUrl(wallet: string) {
  // если формат профиля другой — поменяешь тут
  return `https://polymarket.com/profile/${wallet}`;
}

export default function LeaderboardPage({ timeframe, setTimeframe }: Props) {
  const last = loadLastResult();
  const yesterday = loadYesterdaySnapshot();

  const rows = useMemo(() => {
    const base = last ? normalizeRowsForUi(last.rows) : [];
    return [...base].sort((a, b) => Number(b.pnlUsd) - Number(a.pnlUsd));
  }, [last]);

  const yesterdayRanks = useMemo(() => {
    if (!yesterday) return new Map<string, number>();
    const ys = normalizeRowsForUi(yesterday.rows).sort(
      (a, b) => Number(b.pnlUsd) - Number(a.pnlUsd)
    );
    const map = new Map<string, number>();
    ys.forEach((r, idx) => map.set(r.wallet.toLowerCase(), idx + 1));
    return map;
  }, [yesterday]);

  function rankChange(wallet: string, currentRank: number) {
    const prev = yesterdayRanks.get(wallet.toLowerCase());
    if (!prev) return "—";
    const diff = prev - currentRank;
    if (diff === 0) return "0";
    return diff > 0 ? `+${diff}` : `${diff}`;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-3xl font-semibold tracking-tight">Genesis-style leaderboard</div>
            <div className="text-sm text-white/60 mt-1">
              Сейчас показываем последний импортированный список. Таймфрейм: {timeframeLabel(timeframe)}.
            </div>
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setTimeframe("1w")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeframe === "1w" ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              1 нед
            </button>
            <button
              onClick={() => setTimeframe("1m")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeframe === "1m" ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              1 мес
            </button>
            <button
              onClick={() => setTimeframe("1y")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeframe === "1y" ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              1 год
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="text-lg font-medium">Leaderboard</div>
            <div className="text-xs text-white/50">
              {rows.length ? `${rows.length} участников` : "нет данных"}
            </div>
          </div>

          {!rows.length && (
            <div className="p-6 text-sm text-white/50">
              Пока нет данных. Перейди во вкладку Import и загрузи список кошельков.
            </div>
          )}

          {!!rows.length && (
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 w-16">#</th>
                    <th className="text-left px-5 py-3 w-28">Δ топа</th>
                    <th className="text-left px-5 py-3">Username</th>
                    <th className="text-right px-5 py-3">Баланс</th>
                    <th className="text-right px-5 py-3">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const rank = idx + 1;
                    const delta = rankChange(r.wallet, rank);
                    const pnl = Number(r.pnlUsd);
                    const hold = r.holdingsUsd == null ? null : Number(r.holdingsUsd);

                    return (
                      <tr key={r.wallet} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="px-5 py-3 tabular-nums">{rank}</td>
                        <td className="px-5 py-3 tabular-nums">
                          <span
                            className={
                              delta.startsWith("+")
                                ? "text-emerald-300"
                                : delta.startsWith("-")
                                ? "text-red-300"
                                : "text-white/50"
                            }
                          >
                            {delta}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={profileUrl(r.wallet)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:underline"
                          >
                            {r.wallet}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          {hold == null ? "—" : `$${hold.toFixed(2)}`}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          <span className={pnl >= 0 ? "text-emerald-300" : "text-red-300"}>
                            {pnl >= 0 ? "+" : ""}
                            ${pnl.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
