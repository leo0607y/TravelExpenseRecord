"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLiff } from "./LiffProvider";
import type { Expense, Saving, Trip } from "@/types";

interface TripData {
  trip: Trip;
  savings: (Saving & { user: { display_name: string; picture_url: string | null } })[];
  expenses: (Expense & {
    payer: { display_name: string };
    beneficiaries: { user_id: string; display_name: string }[];
  })[];
}

export default function HomeScreen() {
  const { activeTrip, members, currentUser, isAdmin, reload } = useLiff();
  const [data, setData] = useState<TripData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.trip_id}`);
    if (res.ok) setData(await res.json());
  }, [activeTrip]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!activeTrip || !data) {
    return <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>;
  }

  const { trip, savings, expenses } = data;

  const approvedSavings = savings.filter((s) => s.status === "approved");
  const totalCard = expenses.filter((e) => e.payment_type === "card").reduce((s, e) => s + e.amount, 0);
  const poolBalance = trip.carry_over_in + approvedSavings.reduce((s, r) => s + r.amount, 0) - totalCard;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalCash = expenses.filter((e) => e.payment_type === "cash").reduce((s, e) => s + e.amount, 0);

  // メンバーごとの積立ステータス
  const savingStatus = (userId: string) => {
    const s = savings.find((s) => s.user_id === userId);
    if (!s) return { label: "未申請", color: "bg-gray-200 text-gray-600" };
    if (s.status === "approved") return { label: "積立済", color: "bg-green-100 text-green-700" };
    return { label: "確認中", color: "bg-yellow-100 text-yellow-700" };
  };

  const approveSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}/approve`, { method: "POST" });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">現在の旅行</p>
            <h1 className="text-lg font-bold">{trip.title}</h1>
          </div>
          <Link href="/history" className="text-xs bg-white/20 rounded-full px-3 py-1">
            履歴
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 総支出カード */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">🎉 ワクワク総支出</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            ¥{totalExpenses.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            💳 カード ¥{totalCard.toLocaleString()} ／ 💴 現金 ¥{totalCash.toLocaleString()}
          </p>
        </div>

        {/* プール残高カード */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">💰 口座プール残高</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ¥{poolBalance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            繰越 ¥{trip.carry_over_in.toLocaleString()} ＋ 積立 ¥{approvedSavings.reduce((s, r) => s + r.amount, 0).toLocaleString()} － カード ¥{totalCard.toLocaleString()}
          </p>
        </div>

        {/* メンバー積立ステータス */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">👥 メンバー積立状況</p>
          <div className="grid grid-cols-3 gap-2">
            {members.map((m) => {
              const st = savingStatus(m.user_id);
              const pendingSaving = savings.find(
                (s) => s.user_id === m.user_id && s.status === "pending"
              );
              return (
                <div key={m.user_id} className="text-center">
                  {m.picture_url ? (
                    <Image src={m.picture_url} alt={m.display_name} width={40} height={40} className="rounded-full mx-auto" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-sm">
                      {m.display_name[0]}
                    </div>
                  )}
                  <p className="text-xs mt-1 truncate">{m.display_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  {/* 管理者のみ承認ボタンを表示 */}
                  {isAdmin && pendingSaving && (
                    <button
                      onClick={() => approveSaving(pendingSaving.saving_id)}
                      className="mt-1 text-xs bg-brand-green text-white rounded-full px-2 py-0.5 block mx-auto"
                    >
                      承認
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 自分の積立申請ボタン */}
          {currentUser && !savings.find((s) => s.user_id === currentUser.user_id) && (
            <SavingForm tripId={trip.trip_id} userId={currentUser.user_id} onDone={fetchData} />
          )}
        </div>

        {/* 直近の支出リスト */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">📋 支出履歴</p>
          {expenses.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">支出がまだありません</p>
          )}
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.expense_id}>
                <button
                  onClick={() => setExpandedId(expandedId === e.expense_id ? null : e.expense_id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {e.title}
                        {e.image_url && " 📸"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {e.paid_at} ／ {e.payer.display_name} ／{" "}
                        {e.payment_type === "card" ? "💳" : "💴"}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      ¥{e.amount.toLocaleString()}
                    </p>
                  </div>
                </button>
                {expandedId === e.expense_id && (
                  <div className="bg-gray-50 rounded-xl p-3 mt-1 space-y-2">
                    <p className="text-xs text-gray-500">
                      受益者：{e.beneficiaries.map((b) => b.display_name).join("・")}
                    </p>
                    {e.memo && <p className="text-xs text-gray-600">📝 {e.memo}</p>}
                    {e.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.image_url}
                        alt="レシート"
                        className="w-full rounded-lg object-cover max-h-48"
                        onClick={() => window.open(e.image_url!, "_blank")}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 管理者のみ：旅行を締めるボタン */}
        {isAdmin && (
          <Link
            href="/settle"
            className="block w-full text-center bg-red-500 text-white rounded-2xl py-3 font-bold shadow"
          >
            🏁 旅行を締める・精算する
          </Link>
        )}
      </div>

      {/* 固定フッター：支出登録ボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Link
          href="/expense"
          className="block w-full text-center bg-brand-green text-white rounded-2xl py-4 text-lg font-bold shadow-lg"
          onClick={reload}
        >
          ＋ 支出を記録する
        </Link>
      </div>
    </div>
  );
}

function SavingForm({ tripId, userId, onDone }: { tripId: string; userId: string; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip_id: tripId, user_id: userId, amount: Number(amount) }),
    });
    setLoading(false);
    setAmount("");
    onDone();
  };

  return (
    <div className="mt-3 flex gap-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="積立金額（円）"
        className="flex-1 border rounded-xl px-3 py-2 text-sm"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="bg-brand-green text-white rounded-xl px-4 text-sm font-bold disabled:opacity-50"
      >
        申請
      </button>
    </div>
  );
}
