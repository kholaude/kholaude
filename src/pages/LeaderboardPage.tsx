import { useEffect, useMemo, useState } from "react";
import { fetchLeaderboard, type LeaderboardRow, type Timeframe } from "../lib/api";

type Props = {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
};

export default function LeaderboardPage({ timeframe, setTimeframe }: Props) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const data = await fetchLeaderboard(timeframe);
      setRows(data.rows || []);
      setUpdatedAt(data.updatedAt || Date.now());
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch leaderboard");
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 300000); // 5 минут
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const sorted = useMemo(() => rows, [rows]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-3xl font-semibold tracking-tight">Genesis-style leaderboard</div>
            <div className="text-sm text-white/60 mt-1">
              Обновляется каждые 5 минут{updatedAt ? ` • обновлено ${new Date(updatedAt).toLocaleString()}` : ""}.
            </div>
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setTimeframe("1d")}
              className={`px-3 py-1.5 rounded-lg text-sm ${timeframe === "1d" ? "bg-white text-black" : "text-white/70"}`}
            >
              1 день
            </button>
            <button
              onClick={() => setTimeframe("1w")}
              className={`px-3 py-1.5 rounded-lg text-sm ${timeframe === "1w" ? "bg-white text-black" : "text-white/70"}`}
            >
              1 нед
            </button>
            <button
              onClick={() => setTimeframe("1m")}
              className={`px-3 py-1.5 rounded-lg text-sm ${timeframe === "1m" ? "bg-white text-black" : "text-white/70"}`}
            >
              1 мес
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="text-lg font-medium">Leaderboard</div>
            <div className="text-xs text-white/50">{sorted.length ? `${sorted.length} участников` : "нет данных"}</div>
          </div>

          {err && (
            <div className="p-5 text-sm text-red-200 bg-red-500/10 border-b border-red-500/20">
              {err}
            </div>
          )}

          {!sorted.length && !err && (
            <div className="p-6 text-sm text-white/50">
              Пока пусто. Добавь участников во вкладке Import.
            </div>
          )}

          {!!sorted.length && (
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 w-16">#</th>
                    <th className="text-left px-5 py-3">Ник турнира</th>
                    <th className="text-left px-5 py-3">Polymarket</th>
                    <th className="text-right px-5 py-3">Баланс</th>
                    <th className="text-right px-5 py-3">P&L реализ.</th>
                    <th className="text-right px-5 py-3">P&L нереализ.</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => {
                    const realized = r.realizedPnlUsd ?? 0;
                    const unrl = r.unrealizedPnlUsd ?? 0;
                    const bal = r.balanceUsd;

                    const polymarketLabel = r.polyUsername ? `@${r.polyUsername}` : r.wallet;

                    return (
                      <tr key={r.wallet} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="px-5 py-3 tabular-nums">{idx + 1}</td>
                        <td className="px-5 py-3">{r.nickname}</td>
                        <td className="px-5 py-3">
                          <a href={r.profileUrl} target="_blank" rel="noreferrer" className="hover:underline">
                            {polymarketLabel}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          {bal == null ? "—" : `$${bal.toFixed(2)}`}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          <span className={realized >= 0 ? "text-emerald-300" : "text-red-300"}>
                            {realized >= 0 ? "+" : ""}${realized.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          <span className={unrl >= 0 ? "text-emerald-300" : "text-red-300"}>
                            {unrl >= 0 ? "+" : ""}${unrl.toFixed(2)}
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
