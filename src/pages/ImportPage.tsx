import { useMemo, useState } from "react";
import { importWallet, type Timeframe } from "../lib/api";

type Props = {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
};

export default function ImportPage({ timeframe, setTimeframe }: Props) {
  const [text, setText] = useState("");
  const [nickname, setNickname] = useState("");
  const [invite, setInvite] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  const wallets = useMemo(
    () =>
      text
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean),
    [text]
  );

  async function run() {
    setLog("");

    if (!wallets.length) return setLog("Вставь хотя бы один адрес.");
    if (!nickname.trim()) return setLog("Введи никнейм участника.");
    if (!invite.trim()) return setLog("Введи код-приглашение.");

    setLoading(true);
    try {
      let ok = 0;
      for (const w of wallets) {
        await importWallet(w, nickname.trim(), invite.trim());
        ok++;
      }
      setLog(`Импортировано: ${ok}`);
      setText("");
    } catch (e: any) {
      setLog(e?.message || "Ошибка импорта");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-3xl font-semibold">Import</div>
            <div className="text-sm text-white/60 mt-1">
              Регистрация кошельков для турнира по invite-коду.
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

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-lg font-medium mb-3">
              Кошельки (по одному в строке)
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-64 rounded-xl bg-black/40 border border-white/10 p-3 text-sm outline-none"
              placeholder="0x...\n0x..."
            />

            <div className="mt-4 space-y-3">
              <input
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none"
                placeholder="Никнейм участника"
              />
              <input
                value={invite}
                onChange={e => setInvite(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none"
                placeholder="Код-приглашение"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={run}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50"
              >
                {loading ? "Импорт..." : "Импортировать"}
              </button>
              <button
                onClick={() => {
                  setText("");
                  setNickname("");
                  setInvite("");
                  setLog("");
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
              >
                Очистить
              </button>
            </div>

            {log && (
              <div className="mt-3 text-sm text-white/70">
                {log}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-lg font-medium mb-2">Подсказка</div>
            <div className="text-sm text-white/60">
              Если бек у тебя за ngrok, этот импорт использует специальный заголовок,
              который отключает ngrok-страницу предупреждения.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
