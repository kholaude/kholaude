import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeWallets, type AnalyzeResponse, type Timeframe } from "./lib/api";

const POLL_MS = 5 * 60 * 1000;

function parseWallets(text: string) {
  return text
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean);
}

export default function App() {
  const [input, setInput] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("1w");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQueryWallets, setLastQueryWallets] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);

  const wallets = useMemo(() => parseWallets(input), [input]);

  async function runQuery(walletsOverride?: string[], tfOverride?: Timeframe) {
    const w = walletsOverride ?? wallets;
    const tf = tfOverride ?? timeframe;

    if (!w.length) {
      setError("Вставь хотя бы один адрес кошелька.");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeWallets(w, tf);
      setData(res);
      setLastQueryWallets(w);
    } catch (e: any) {
      setError(e?.message ?? "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      if (lastQueryWallets.length) {
        runQuery(lastQueryWallets, timeframe);
      }
    }, POLL_MS);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, lastQueryWallets.join("|")]);

  const headerSub =
    data ? `обновлено ${new Date(data.updatedAt).toLocaleString()}` : "ожидает запрос";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              ETH Wallet P&amp;L
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Сортировка по изменению ETH-баланса за период, автообновление каждые 5 минут.
            </p>
          </div>
          <div className="text-xs text-zinc-500">{headerSub}</div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-zinc-900/40 p-5 shadow-lg ring-1 ring-white/5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-200">
                Кошельки (по одному в строке)
              </div>
              <div className="text-xs text-zinc-500">
                {wallets.length} шт.
              </div>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="0x...\n0x...\n0x..."
              className="h-72 w-full resize-none rounded-xl bg-zinc-950/60 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => runQuery()}
                disabled={loading}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-400 disabled:opacity-60"
              >
                {loading ? "Считаю..." : "Импортировать и посчитать"}
              </button>
              <button
                onClick={() => {
                  setInput("");
                  setData(null);
                  setError(null);
                  setLastQueryWallets([]);
                }}
                className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
              >
                Очистить
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900/40 p-5 shadow-lg ring-1 ring-white/5">
            <div className="mb-4 text-sm font-medium text-zinc-200">
              Период
            </div>
            <div className="flex gap-2">
              {(["1w", "1m", "1y"] as Timeframe[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-medium transition",
                    timeframe === tf
                      ? "bg-white text-zinc-900"
                      : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  ].join(" ")}
                >
                  {tf === "1w" && "1 нед"}
                  {tf === "1m" && "1 мес"}
                  {tf === "1y" && "1 год"}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-zinc-950/50 p-4 ring-1 ring-white/5">
              <div className="text-xs text-zinc-500">Как считаем</div>
              <div className="mt-1 text-sm text-zinc-200">
                Баланс ETH на старте периода и на текущем блоке, разница = P&amp;L в ETH.
              </div>
              {data && (
                <div className="mt-3 text-xs text-zinc-500">
                  startBlock: {data.startBlock} · latestBlock: {data.latestBlock}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-500/20">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-zinc-900/40 p-5 shadow-lg ring-1 ring-white/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-200">
              Результаты
            </div>
            <div className="text-xs text-zinc-500">
              {data ? `${data.rows.length} валидных адресов` : "нет данных"}
            </div>
          </div>

          {!data && (
            <div className="rounded-xl bg-zinc-950/40 p-6 text-sm text-zinc-400 ring-1 ring-white/5">
              Вставь список кошельков и нажми “Импортировать и посчитать”.
            </div>
          )}

          {data && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="text-zinc-400">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Кошелёк</th>
                    <th className="py-2 pr-4">Баланс старт</th>
                    <th className="py-2 pr-4">Баланс сейчас</th>
                    <th className="py-2 pr-4">P&amp;L (ETH)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => {
                    const pnlNum = Number(r.pnlEth);
                    const pnlClass =
                      pnlNum > 0
                        ? "text-emerald-300"
                        : pnlNum < 0
                        ? "text-rose-300"
                        : "text-zinc-200";

                    return (
                      <tr
                        key={`${r.wallet}-${i}`}
                        className="border-t border-white/5"
                      >
                        <td className="py-2 pr-4 text-zinc-500">{i + 1}</td>
                        <td className="py-2 pr-4 font-mono text-xs md:text-sm">
                          {r.wallet}
                        </td>
                        <td className="py-2 pr-4 text-zinc-200">
                          {Number(r.startBalanceEth).toFixed(6)}
                        </td>
                        <td className="py-2 pr-4 text-zinc-200">
                          {Number(r.currentBalanceEth).toFixed(6)}
                        </td>
                        <td className={`py-2 pr-4 font-semibold ${pnlClass}`}>
                          {pnlNum >= 0 ? "+" : ""}
                          {pnlNum.toFixed(6)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-xs text-zinc-500">
          MVP считает только изменение ETH-баланса за период.
        </div>
      </div>
    </div>
  );
}
