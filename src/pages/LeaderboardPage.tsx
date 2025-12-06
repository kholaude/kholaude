import { useEffect, useMemo, useState } from "react";

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

type LeaderboardResponse = {
  timeframe: Timeframe;
  updatedAt: number;
  rows: LeaderboardRow[];
};

const BASE: string = import.meta.env.VITE_BACKEND_URL;

async function fetchLeaderboardSafe(timeframe: Timeframe): Promise<LeaderboardResponse> {
  if (!BASE) {
    throw new Error("VITE_BACKEND_URL не задан при сборке фронта.");
  }

  const url = `${BASE}/api/leaderboard?timeframe=${timeframe}`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
  });

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `HTTP ${res.status} при запросе leaderboard. URL: ${url}. Ответ: ${text.slice(0, 200)}`
    );
  }

  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Ожидали JSON, получили "${contentType || "unknown"}". URL: ${url}. Ответ: ${text.slice(
        0,
        200
      )}`
    );
  }

  return res.json();
}

type Props = {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
};

export default function LeaderboardPage({ timeframe, setTimeframe }: Props) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const data = await fetchLeaderboardSafe(timeframe);

      setRows(Array.isArray(data.rows) ? data.rows : []);
      setUpdatedAt(data.updatedAt ?? Date.now());
    } catch (e: any) {
      setRows([]);
      setUpdatedAt(null);
      setErr(e?.message || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 300000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const sorted = useMemo(() => rows, [rows]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-3xl font-semibold tracking-tight">
              Genesis-style leaderboard
            </div>
            <div className="text-sm text-white/60 mt-1">
              Обновляется каждые 5 минут
              {updatedAt ? ` • обновлено ${new Date(updatedAt).toLocaleString()}` : ""}.
            </div>
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setTimeframe("1d")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeframe === "1d" ? "bg-white text-black" : "text-white/70"
              }`}
            >
              1 день
            </button>
            <button
              onClick={() => setTimeframe("1w")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeframe === "1w" ? "bg-white text-black" : "text-white/70"
              }`}
            >
              1 нед
            </button>
            <button
              onClick={() => setTimeframe("1m")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                timeframe === "1m" ? "bg-white text-black" : "text-white/70"
              }`}
            >
              1 мес
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="text-lg font-medium">Leaderboard</div>
            <div className="text-xs text-white/50">
              {loading ? "загрузка..." : sorted.length ? `${sorted.length} участников` : "нет данных"}
            </div>
          </div>

          {err && (
            <div className="p-5 text-sm text-red-200 bg-red-500/10 border-b border-red-500/20">
              {err}
            </div>
          )}

          {!sorted.length && !err && !loading && (
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
                    <th className="text-right px-5 py-3">Текущий баланс</th>
                    <th className="text-right px-5 py-3">P&amp;L реализ.</th>
                    <th className="text-right px-5 py-3">P&amp;L нереализ.</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => {
                    const realized = Number(r.realizedPnlUsd ?? 0);
                    const unrl = Number(r.unrealizedPnlUsd ?? 0);
                    const bal = r.balanceUsd;

                    const polymarketLabel = r.polyUsername ? `@${r.polyUsername}` : r.wallet;
                    const url = r.profileUrl || (r.polyUsername
                      ? `https://polymarket.com/@${r.polyUsername}`
                      : `https://polymarket.com/profile/${r.wallet}`);

                    return (
                      <tr
                        key={`${r.wallet}-${idx}`}
                        className="border-b border-white/5 hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-3 tabular-nums">{idx + 1}</td>
                        <td className="px-5 py-3">{r.nickname}</td>
                        <td className="px-5 py-3">
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
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
