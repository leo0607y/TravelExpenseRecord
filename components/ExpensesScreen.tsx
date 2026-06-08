"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "./LiffProvider";
import type { Expense, SettlementRoute } from "@/types";

type ExpenseWithDetails = Expense & {
  payer: { display_name: string };
  beneficiaries: { user_id: string; display_name: string }[];
};

export default function ExpensesScreen() {
  const router = useRouter();
  const { activeTrip } = useLiff();
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [settlementRoutes, setSettlementRoutes] = useState<SettlementRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!activeTrip) return;
    setLoading(true);
    const [tripRes, settleRes] = await Promise.all([
      fetch(`/api/trips/${activeTrip.trip_id}`),
      fetch(`/api/settle?tripId=${activeTrip.trip_id}`),
    ]);
    if (tripRes.ok) {
      const data = await tripRes.json();
      setExpenses(data.expenses ?? []);
    }
    if (settleRes.ok) {
      const summary = await settleRes.json();
      setSettlementRoutes(summary.settlement_routes ?? []);
    }
    setLoading(false);
  }, [activeTrip]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const totalCard = expenses.filter((e) => e.payment_type === "card").reduce((s, e) => s + e.amount, 0);
  const totalCash = expenses.filter((e) => e.payment_type === "cash").reduce((s, e) => s + e.amount, 0);
  const total = totalCard + totalCash;

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white text-lg">←</button>
        <div>
          <h1 className="text-lg font-bold">支出一覧</h1>
          {activeTrip && <p className="text-xs opacity-80">{activeTrip.title}</p>}
        </div>
      </div>

      {/* 合計サマリー */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xs text-gray-400">合計</p>
            <p className="text-xl font-bold text-gray-800">¥{total.toLocaleString()}</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div>
            <p className="text-xs text-gray-400">💳 カード</p>
            <p className="text-lg font-bold text-gray-700">¥{totalCard.toLocaleString()}</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div>
            <p className="text-xs text-gray-400">💴 現金</p>
            <p className="text-lg font-bold text-gray-700">¥{totalCash.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 精算サマリー */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-2">💸 返金まとめ（現時点）</p>
        {settlementRoutes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-1">精算不要です 🎉</p>
        ) : (
          <div className="space-y-2">
            {settlementRoutes.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-sm text-gray-700">
                  <span className="font-bold text-red-500">{r.from_name}</span>
                  <span className="mx-1 text-gray-400">→</span>
                  <span className="font-bold text-brand-green">{r.to_name}</span>
                </span>
                <span className="text-sm font-black text-gray-800">¥{r.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 支出カード一覧 */}
      <div className="px-4 mt-4 space-y-3">
        {expenses.length === 0 && (
          <p className="text-center text-gray-400 py-12">支出がまだありません</p>
        )}
        {expenses.map((e) => (
          <div key={e.expense_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 画像（ある場合は上部に大きく表示） */}
            {e.image_url && (
              <button
                onClick={() => setLightboxUrl(e.image_url!)}
                className="w-full block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.image_url}
                  alt="レシート"
                  className="w-full object-cover"
                  style={{ maxHeight: "240px" }}
                />
              </button>
            )}
            {/* テキスト情報 */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {e.paid_at} ／ {e.payer.display_name} ／ {e.payment_type === "card" ? "💳 カード" : "💴 現金"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    受益者：{e.beneficiaries.map((b) => b.display_name).join("・")}
                  </p>
                  {e.memo && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-lg px-2 py-1">📝 {e.memo}</p>
                  )}
                </div>
                <p className="text-lg font-black text-gray-800 ml-3 shrink-0">
                  ¥{e.amount.toLocaleString()}
                </p>
              </div>
              {e.image_url && (
                <button
                  onClick={() => setLightboxUrl(e.image_url!)}
                  className="mt-2 text-xs text-brand-green underline"
                >
                  画像を拡大表示
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 画像ライトボックス */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="レシート拡大"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(ev) => ev.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
