"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLiff } from "@/components/LiffProvider";
import type { Saving } from "@/types";

type SavingWithUser = Saving & { user: { display_name: string; picture_url: string | null } };

export default function SavingsPage() {
  const { activeTrip, currentUser, canApprove } = useLiff();
  const [savings, setSavings] = useState<SavingWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSavingId, setEditingSavingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const fetchSavings = useCallback(async () => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.trip_id}`);
    if (res.ok) {
      const data = await res.json();
      setSavings(data.savings ?? []);
    }
    setLoading(false);
  }, [activeTrip]);

  useEffect(() => { fetchSavings(); }, [fetchSavings]);

  const approveSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser?.user_id }),
    });
    fetchSavings();
  };

  const remindSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}/remind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser?.user_id }),
    });
  };

  const startEditTitle = (s: SavingWithUser) => {
    setEditingSavingId(s.saving_id);
    setEditingTitle(s.title ?? "");
  };

  const saveTitle = async (savingId: string) => {
    if (!currentUser) return;
    await fetch(`/api/savings/${savingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle, requesterId: currentUser.user_id }),
    });
    setEditingSavingId(null);
    fetchSavings();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>;
  }

  const pendingSavings = savings.filter((s) => s.status === "pending");
  const approvedSavings = savings.filter((s) => s.status === "approved");
  const totalApproved = approvedSavings.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/80 text-sm">← 戻る</Link>
          <h1 className="text-lg font-bold">積立一覧</h1>
        </div>
        {activeTrip && (
          <p className="text-xs opacity-70 mt-1">「{activeTrip.title}」の積立履歴</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* サマリー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
          <div className="flex-1 text-center border-r border-gray-100">
            <p className="text-xs text-gray-500">承認済み合計</p>
            <p className="text-xl font-bold text-green-600">¥{totalApproved.toLocaleString()}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500">確認待ち</p>
            <p className="text-xl font-bold text-yellow-600">{pendingSavings.length}件</p>
          </div>
        </div>

        {/* 確認待ち */}
        {pendingSavings.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-3">⏳ 確認待ち</p>
            <div className="space-y-3">
              {pendingSavings.map((s) => (
                <div key={s.saving_id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  {s.user.picture_url ? (
                    <Image src={s.user.picture_url} alt={s.user.display_name} width={36} height={36} className="rounded-full shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm shrink-0">
                      {s.user.display_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {editingSavingId === s.saving_id ? (
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveTitle(s.saving_id)}
                          className="flex-1 border rounded-lg px-2 py-0.5 text-sm min-w-0"
                          autoFocus
                          placeholder="タイトル"
                        />
                        <button onClick={() => saveTitle(s.saving_id)} className="text-xs bg-brand-green text-white rounded-lg px-2 py-0.5 whitespace-nowrap">保存</button>
                        <button onClick={() => setEditingSavingId(null)} className="text-xs text-gray-400 whitespace-nowrap">取消</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {s.title && <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>}
                        {s.user_id === currentUser?.user_id && (
                          <button onClick={() => startEditTitle(s)} className="text-gray-400 text-xs leading-none shrink-0">✏️</button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">{s.user.display_name}</p>
                    <p className="text-sm font-bold text-gray-800">¥{s.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString("ja-JP")} 申請
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => remindSaving(s.saving_id)}
                      className="text-xs bg-orange-400 text-white rounded-full px-3 py-1"
                    >
                      催促
                    </button>
                    {canApprove && (
                      <button
                        onClick={() => approveSaving(s.saving_id)}
                        className="text-xs bg-brand-green text-white rounded-full px-3 py-1"
                      >
                        承認
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 承認済み */}
        {approvedSavings.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-3">✅ 積立済み</p>
            <div className="space-y-3">
              {approvedSavings.map((s) => (
                <div key={s.saving_id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  {s.user.picture_url ? (
                    <Image src={s.user.picture_url} alt={s.user.display_name} width={36} height={36} className="rounded-full shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm shrink-0">
                      {s.user.display_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {editingSavingId === s.saving_id ? (
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveTitle(s.saving_id)}
                          className="flex-1 border rounded-lg px-2 py-0.5 text-sm min-w-0"
                          autoFocus
                          placeholder="タイトル"
                        />
                        <button onClick={() => saveTitle(s.saving_id)} className="text-xs bg-brand-green text-white rounded-lg px-2 py-0.5 whitespace-nowrap">保存</button>
                        <button onClick={() => setEditingSavingId(null)} className="text-xs text-gray-400 whitespace-nowrap">取消</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {s.title && <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>}
                        {s.user_id === currentUser?.user_id && (
                          <button onClick={() => startEditTitle(s)} className="text-gray-400 text-xs leading-none shrink-0">✏️</button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">{s.user.display_name}</p>
                    <p className="text-sm font-bold text-gray-800">¥{s.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {s.approved_at
                        ? new Date(s.approved_at).toLocaleDateString("ja-JP") + " 承認"
                        : new Date(s.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">積立済</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {savings.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-12">
            <p>積立はまだありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
