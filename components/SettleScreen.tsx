"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "./LiffProvider";
import type { TripSummary } from "@/types";

export default function SettleScreen() {
  const router = useRouter();
  const { activeTrip, members, isAdmin, reload } = useLiff();
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [nextTitle, setNextTitle] = useState("次の旅行");
  const [settling, setSettling] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!activeTrip) return;
    fetch(`/api/settle?tripId=${activeTrip.trip_id}`)
      .then((r) => r.json())
      .then(setSummary);
  }, [activeTrip]);

  const settle = async () => {
    if (!activeTrip) return;
    setSettling(true);

    const res = await fetch("/api/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: activeTrip.trip_id, nextTitle }),
    });

    if (res.ok) {
      setDone(true);
      reload();
    }
    setSettling(false);
  };

  if (!summary) {
    return <div className="flex items-center justify-center h-screen text-gray-400">計算中...</div>;
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">精算完了！</h2>
        <p className="text-gray-500 mb-6">
          繰越金 ¥{summary.pool_balance.toLocaleString()} で次の旅行を開始しました
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-brand-green text-white rounded-2xl px-8 py-3 font-bold"
        >
          ホームへ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー */}
      <div className="bg-red-500 text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">←</button>
        <h1 className="text-lg font-bold">🏁 旅行を締める・精算</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 総支出サマリー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500">今回の旅行の総支出 🎉</p>
          <p className="text-4xl font-black text-gray-800 mt-1">
            ¥{summary.total_expenses.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            💳 ¥{summary.total_card.toLocaleString()} ／ 💴 ¥{summary.total_cash.toLocaleString()}
          </p>
          <p className="text-xs text-blue-500 mt-2">
            プール残高（次回繰越）：¥{summary.pool_balance.toLocaleString()}
          </p>
        </div>

        {/* 個人実質消費額 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">👤 みんなが実質楽しんだ額</p>
          <div className="space-y-3">
            {members.map((m) => {
              const benefit = summary.benefit_per_user[m.user_id] ?? 0;
              const maxBenefit = Math.max(...Object.values(summary.benefit_per_user));
              const pct = maxBenefit > 0 ? (benefit / maxBenefit) * 100 : 0;
              const emoji =
                benefit === maxBenefit ? "🏆" : benefit > maxBenefit * 0.9 ? "😊" : "☘️";
              return (
                <div key={m.user_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{emoji} {m.display_name}</span>
                    <span className="font-bold">¥{Math.round(benefit).toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-brand-green h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 送金ナビゲーション */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">💸 送金ナビゲーション</p>
          {summary.settlement_routes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">送金不要！完全に釣り合っています</p>
          ) : (
            <div className="space-y-2">
              {summary.settlement_routes.map((r, i) => (
                <div key={i} className="flex items-center gap-2 bg-orange-50 rounded-xl p-3">
                  <span className="text-sm font-bold text-gray-700">{r.from_name}</span>
                  <span className="text-orange-400">➔</span>
                  <span className="text-sm font-bold text-gray-700">{r.to_name}</span>
                  <span className="ml-auto text-sm font-black text-orange-600">
                    ¥{r.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 次の旅行タイトル */}
        {isAdmin && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="text-xs text-gray-500">次の旅行のタイトル</label>
            <input
              type="text"
              value={nextTitle}
              onChange={(e) => setNextTitle(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm mt-1"
            />
          </div>
        )}
      </div>

      {/* 固定フッター */}
      {isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={settle}
            disabled={settling}
            className="w-full bg-red-500 text-white rounded-2xl py-4 text-lg font-bold shadow-lg disabled:opacity-50"
          >
            {settling ? "処理中..." : "✅ 送金確認済み・プロジェクト締める"}
          </button>
        </div>
      )}
    </div>
  );
}
