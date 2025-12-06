import { useMemo, useState } from "react";
import { fetchPnl, type Timeframe } from "../lib/api";
import { saveLastResult, saveTodaySnapshot, normalizeRowsForUi } from "../lib/storage";

type Props = {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
};

export default function ImportPage({ timeframe, setTimeframe }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<{ wallet: string; pnlUsd: string; holdingsUsd: string | null }[]>([]);

  const wallets = useMemo(
    () =>
      text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [text]
  );

  async function run() {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchPnl(wallets, timeframe);
      saveLastResult(data);
      saveTodaySnapshot(data);
      setRows(normalizeRowsForUi(data.rows));
    } catch (e: any) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-3xl font-semibold tracking-tight">Import wallets</div>
            <div className="text-sm text-white/60 mt-1">
              Вставь адреса по одному в строке и рассчитай Polymarket PnL за период.
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

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="text-lg font-medium">Кошельки</div>
              <div className="text-xs text-white/50">{wallets.length} шт.</div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-72 rounded-xl bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-white/30"
              placeholder="0x...\n0x...\n0x..."
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={run}
                disabled={loading || wallets.length === 0}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500"
              >
                {loading ? "Считаю..." : "Импортировать и посчитать"}
              </button>
              <button
                onClick={() => {
                  setText("");
                  setRows([]);
                  setError(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
              >
                Очистить
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-lg font-medium mb-3">Результат импорта</div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm p-3 mb-3">
                {error}
              </div>
            )}

            {rows.length === 0 && !error && (
              <div className="text-sm text-white/50">
                После расчёта результаты сохранятся и появятся на главной странице.
              </div>
            )}

            {rows.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {rows.map((r, i) => (
                  <div
                    key={`${r.wallet}-${i}`}
                    className="flex justify-between items-center rounded-xl bg-white/5 border border-white/5 px-3 py-2"
                  >
                    <div className="text-xs text-white/60 truncate max-w-[60%]">{r.wallet}</div>
                    <div className="text-sm tabular-nums">
                      ${Number(r.pnlUsd).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
