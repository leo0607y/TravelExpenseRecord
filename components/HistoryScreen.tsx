"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "./LiffProvider";
import type { Trip, Expense } from "@/types";

type ExpenseWithPayer = Expense & { payer: { display_name: string } };

interface TripWithExpenses extends Trip {
  expenses?: ExpenseWithPayer[];
  expanded?: boolean;
  loading?: boolean;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { group } = useLiff();
  const [trips, setTrips] = useState<TripWithExpenses[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!group) return;
    setLoading(true);
    const res = await fetch(`/api/trips?groupId=${group.group_id}`);
    if (res.ok) {
      const data: Trip[] = await res.json();
      setTrips(data.map((t) => ({ ...t, expanded: false, loading: false })));
    }
    setLoading(false);
  }, [group]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const toggleTrip = async (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.trip_id !== tripId) return t;
        if (t.expenses) return { ...t, expanded: !t.expanded };
        return { ...t, expanded: true, loading: true };
      })
    );

    const trip = trips.find((t) => t.trip_id === tripId);
    if (trip?.expenses) return;

    const res = await fetch(`/api/trips/${tripId}`);
    if (res.ok) {
      const data = await res.json();
      setTrips((prev) =>
        prev.map((t) =>
          t.trip_id === tripId
            ? { ...t, expenses: data.expenses ?? [], loading: false }
            : t
        )
      );
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white text-lg">←</button>
        <h1 className="text-lg font-bold">旅の履歴</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {trips.length === 0 && (
          <p className="text-center text-gray-400 py-12">過去の旅行はまだありません</p>
        )}
        {trips.map((trip) => {
          const tripTotal = (trip.expenses ?? []).reduce((s, e) => s + e.amount, 0);
          const tripCard = (trip.expenses ?? []).filter((e) => e.payment_type === "card").reduce((s, e) => s + e.amount, 0);
          const tripCash = (trip.expenses ?? []).filter((e) => e.payment_type === "cash").reduce((s, e) => s + e.amount, 0);
          const imageCount = (trip.expenses ?? []).filter((e) => e.image_url).length;

          return (
            <div key={trip.trip_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* 旅行ヘッダー（タップで開閉） */}
              <button
                onClick={() => toggleTrip(trip.trip_id)}
                className="w-full text-left px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{trip.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {trip.created_at.slice(0, 10)} 精算済み
                      {imageCount > 0 && ` ／ 📸 ${imageCount}枚`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-700">
                      {trip.expenses ? `¥${tripTotal.toLocaleString()}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{trip.expanded ? "▲" : "▼"}</p>
                  </div>
                </div>
              </button>

              {/* 展開時：支出一覧 */}
              {trip.expanded && (
                <div className="border-t border-gray-100">
                  {trip.loading ? (
                    <p className="text-center text-gray-400 text-sm py-4">読み込み中...</p>
                  ) : (
                    <>
                      {/* 合計サマリー */}
                      {trip.expenses && trip.expenses.length > 0 && (
                        <div className="flex justify-around text-center px-4 py-3 bg-gray-50">
                          <div>
                            <p className="text-xs text-gray-400">合計</p>
                            <p className="text-sm font-bold text-gray-800">¥{tripTotal.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">💳</p>
                            <p className="text-sm font-bold text-gray-700">¥{tripCard.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">💴</p>
                            <p className="text-sm font-bold text-gray-700">¥{tripCash.toLocaleString()}</p>
                          </div>
                        </div>
                      )}

                      {/* 支出リスト */}
                      <div className="divide-y divide-gray-100">
                        {(trip.expenses ?? []).length === 0 && (
                          <p className="text-center text-gray-400 text-sm py-4">支出データなし</p>
                        )}
                        {(trip.expenses ?? []).map((e) => (
                          <div key={e.expense_id}>
                            {/* 画像（ある場合） */}
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
                                  style={{ maxHeight: "200px" }}
                                />
                              </button>
                            )}
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{e.title}</p>
                                <p className="text-xs text-gray-400">
                                  {e.paid_at} ／ {e.payer.display_name} ／ {e.payment_type === "card" ? "💳" : "💴"}
                                </p>
                                {e.memo && <p className="text-xs text-gray-500 mt-0.5">📝 {e.memo}</p>}
                              </div>
                              <p className="text-sm font-bold text-gray-800 ml-3 shrink-0">
                                ¥{e.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
