import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import type { Timeframe } from "./lib/api";

import LeaderboardPage from "./pages/LeaderboardPage";
import ImportPage from "./pages/ImportPage";

const TF_KEY = "ui:timeframe";

export default function App() {
  const [timeframe, setTimeframe] = useState<Timeframe>(() => {
    const raw = localStorage.getItem(TF_KEY);
    return raw === "1w" || raw === "1m" || raw === "1y" ? raw : "1m";
  });

  useEffect(() => {
    localStorage.setItem(TF_KEY, timeframe);
  }, [timeframe]);

  const location = useLocation();

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-white font-semibold text-xl tracking-tight">
            Polymarket PnL
          </Link>

          <div className="flex gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                location.pathname === "/"
                  ? "bg-white text-black border-white"
                  : "border-white/15 text-white/70 hover:text-white"
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/import"
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                location.pathname.startsWith("/import")
                  ? "bg-white text-black border-white"
                  : "border-white/15 text-white/70 hover:text-white"
              }`}
            >
              Import
            </Link>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<LeaderboardPage timeframe={timeframe} setTimeframe={setTimeframe} />} />
        <Route path="/import" element={<ImportPage timeframe={timeframe} setTimeframe={setTimeframe} />} />
      </Routes>
    </div>
  );
}
