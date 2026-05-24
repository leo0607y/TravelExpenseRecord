"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "./LiffProvider";
import type { TripSummary, Expense } from "@/types";

type ExpenseWithPayer = Expense & { payer: { display_name: string } };

export default function SettleScreen() {
  const router = useRouter();
  const { activeTrip, members, isAdmin, reload } = useLiff();
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithPayer[]>([]);
  const [nextTitle, setNextTitle] = useState("次の旅行");
  const [settling, setSettling] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!activeTrip) return;
    const res = await fetch(`/api/settle?tripId=${activeTrip.trip_id}`);
    if (res.ok) setSummary(await res.json());
  }, [activeTrip]);

  const fetchExpenses = useCallback(async () => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.trip_id}`);
    if (res.ok) {
      const data = await res.json();
      setExpenses(data.expenses ?? []);
    }
  }, [activeTrip]);

  useEffect(() => {
    fetchSummary();
    fetchExpenses();
  }, [fetchSummary, fetchExpenses]);

  const updateExpenseAmount = async (expenseId: string) => {
    const newAmount = Number(editAmount);
    if (!newAmount || newAmount <= 0) return;
    setSavingAmount(true);
    await fetch(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: newAmount }),
    });
    setEditingExpenseId(null);
    setSavingAmount(false);
    await Promise.all([fetchSummary(), fetchExpenses()]);
  };

  const settle = async () => {
    if (!activeTrip) return;
    setSettling(true);

    const res = await fetch("/api/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: activeTrip.trip_id, nextTitle }),
    });

    if (res.ok) {
      reload();
      router.push("/");
    }
    setSettling(false);
  };

  const openReport = () => {
    if (!activeTrip) return;
    const url = `/api/report?tripId=${activeTrip.trip_id}`;
    try {
      // LINEミニアプリ内では外部ブラウザで開く
      if (typeof window !== "undefined" && window.liff?.openWindow) {
        window.liff.openWindow({ url: window.location.origin + url, external: true });
      } else {
        window.open(url, "_blank");
      }
    } catch {
      window.open(url, "_blank");
    }
  };

  if (!summary) {
    return <div className="flex items-center justify-center h-screen text-gray-400">計算中...</div>;
  }

  const shortfall = summary.pool_balance < 0 ? Math.abs(Math.round(summary.pool_balance)) : 0;

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
          <p className={`text-xs mt-2 font-bold ${summary.pool_balance < 0 ? "text-red-500" : "text-blue-500"}`}>
            プール残高：¥{summary.pool_balance.toLocaleString()}
          </p>
        </div>

        {/* PDFサマリーダウンロード */}
        <button
          onClick={openReport}
          className="w-full bg-blue-500 text-white rounded-2xl py-3 font-bold shadow text-sm flex items-center justify-center gap-2"
        >
          📄 精算サマリーをPDFで保存
        </button>

        {/* 積立不足アラート */}
        {shortfall > 0 && (
          <div className="bg-red-50 rounded-2xl p-4 shadow-sm border border-red-200">
            <p className="text-sm font-bold text-red-600 mb-1">⚠️ 積立不足 - カード代金のために追加振込が必要</p>
            <p className="text-3xl font-black text-red-600">¥{shortfall.toLocaleString()}</p>
            <p className="text-xs text-red-500 mt-1">追加が必要な合計額</p>
            <p className="text-sm text-red-700 font-bold mt-2">
              1人当たり目安：¥{Math.ceil(shortfall / Math.max(1, members.length)).toLocaleString()}
            </p>
          </div>
        )}

        {/* 支出一覧（管理者のみ金額修正可能） */}
        {isAdmin && expenses.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-3">📋 支出一覧（金額を修正できます）</p>
            <div className="space-y-2">
              {expenses.map((e) => (
                <div key={e.expense_id} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                  {editingExpenseId === e.expense_id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                        <p className="text-xs text-gray-400">{e.payer.display_name} ／ {e.payment_type === "card" ? "💳" : "💴"}</p>
                      </div>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(ev) => setEditAmount(ev.target.value)}
                        className="w-24 border-2 border-brand-green rounded-lg px-2 py-1 text-sm text-right font-bold"
                        autoFocus
                      />
                      <button
                        onClick={() => updateExpenseAmount(e.expense_id)}
                        disabled={savingAmount}
                        className="text-xs bg-brand-green text-white rounded-lg px-2 py-1.5 font-bold disabled:opacity-50 whitespace-nowrap"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingExpenseId(null)}
                        className="text-xs text-gray-400 whitespace-nowrap"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                        <p className="text-xs text-gray-400">{e.payer.display_name} ／ {e.payment_type === "card" ? "💳" : "💴"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-sm font-bold text-gray-800">¥{e.amount.toLocaleString()}</p>
                        <button
                          onClick={() => { setEditingExpenseId(e.expense_id); setEditAmount(String(e.amount)); }}
                          className="text-xs text-brand-green underline"
                        >
                          修正
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
