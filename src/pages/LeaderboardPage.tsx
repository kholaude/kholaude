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

        <div className="
