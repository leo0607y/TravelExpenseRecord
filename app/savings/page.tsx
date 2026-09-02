"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLiff } from "@/components/LiffProvider";
import { useTheme } from "@/lib/theme-context";
import GuamAccent from "@/components/guam-illustrations/GuamAccent";
import ThemeAccentStrip from "@/components/ThemeAccentStrip";
import Seashell from "@/components/guam-illustrations/Seashell";
import KoreaAccent from "@/components/korea-illustrations/KoreaAccent";
import Taegeuk from "@/components/korea-illustrations/Taegeuk";
import type { Saving, Trip } from "@/types";

type SavingWithUser = Saving & { user: { display_name: string; picture_url: string | null } };
type TripWithSavings = { trip: Pick<Trip, "trip_id" | "title" | "status" | "created_at">; savings: SavingWithUser[] };

export default function SavingsPage() {
  const { activeTrip, group, currentUser, canApprove } = useLiff();
  const { theme } = useTheme();
  const [tripGroups, setTripGroups] = useState<TripWithSavings[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSavingId, setEditingSavingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const fetchSavings = useCallback(async () => {
    if (!group) return;
    const res = await fetch(`/api/savings?groupId=${group.group_id}`);
    if (res.ok) setTripGroups(await res.json());
    setLoading(false);
  }, [group]);

  useEffect(() => { fetchSavings(); }, [fetchSavings]);

  const approveSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser?.user_id }),
    });
    fetchSavings();
  };

  const rejectSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser?.user_id }),
    });
    fetchSavings();
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

  const allSavings = tripGroups.flatMap((tg) => tg.savings);
  const totalApproved = allSavings.filter((s) => s.status === "approved").reduce((sum, s) => sum + s.amount, 0);
  const pendingCount = allSavings.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen pb-8">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/80 text-sm">← 戻る</Link>
          <h1 className="text-lg font-bold">積立一覧</h1>
        </div>
        <p className="text-xs opacity-70 mt-1">全旅行の積立履歴</p>
        <ThemeAccentStrip count={9} start={12} className="mt-3 opacity-45" itemClassName="w-7 h-7" />
      </div>

      <div className="p-4 space-y-4">
        {/* 全体サマリー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
          <div className="flex-1 text-center border-r border-gray-100">
            <p className="text-xs text-gray-500">承認済み累計</p>
            <p className="text-xl font-bold text-green-600">¥{totalApproved.toLocaleString()}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500">確認待ち</p>
            <p className="text-xl font-bold text-yellow-600">{pendingCount}件</p>
          </div>
        </div>

        {tripGroups.length === 0 && (
          <div className="text-center py-12">
            {theme === "guam" && <Seashell className="w-14 h-12 mx-auto mb-2 opacity-80" />}
            {theme === "korea" && <Taegeuk className="w-12 h-12 mx-auto mb-2 opacity-80" />}
            <p className="text-gray-400 text-sm">積立はまだありません</p>
          </div>
        )}

        {tripGroups.map(({ trip, savings }, tripIndex) => {
          const isActive = trip.trip_id === activeTrip?.trip_id;
          const tripApproved = savings.filter((s) => s.status === "approved").reduce((sum, s) => sum + s.amount, 0);
          const tripPending = savings.filter((s) => s.status === "pending");
          const tripApprovedList = savings.filter((s) => s.status === "approved");

          return (
            <div key={trip.trip_id} className="relative bg-white rounded-2xl shadow-sm overflow-hidden">
              {theme === "guam" && (
                <GuamAccent index={tripIndex} className="absolute -right-2 -top-2 w-10 h-10 opacity-20 pointer-events-none" />
              )}
              {theme === "korea" && (
                <KoreaAccent index={tripIndex} className="absolute -right-2 -top-2 w-10 h-10 opacity-20 pointer-events-none" />
              )}
              {/* 旅行ヘッダー */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">{trip.title}</p>
                  <p className="text-xs text-gray-400">
                    {trip.created_at.slice(0, 10)}
                    {isActive ? " ・ 進行中" : " ・ 精算済み"}
                  </p>
                </div>
                <p className="text-sm font-bold text-green-600">¥{tripApproved.toLocaleString()}</p>
              </div>

              <div className="p-4 space-y-4">
                {/* 確認待ち */}
                {tripPending.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">⏳ 確認待ち</p>
                    <div className="space-y-3">
                      {tripPending.map((s, i) => (
                        <SavingRow
                          key={s.saving_id}
                          s={s}
                          accentIndex={i}
                          isEditing={editingSavingId === s.saving_id}
                          editingTitle={editingTitle}
                          currentUserId={currentUser?.user_id}
                          canApprove={isActive && canApprove}
                          onStartEdit={() => { setEditingSavingId(s.saving_id); setEditingTitle(s.title ?? ""); }}
                          onSaveTitle={() => saveTitle(s.saving_id)}
                          onCancelEdit={() => setEditingSavingId(null)}
                          onEditingTitleChange={setEditingTitle}
                          onApprove={() => approveSaving(s.saving_id)}
                          onReject={() => rejectSaving(s.saving_id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 承認済み */}
                {tripApprovedList.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">✅ 積立済み</p>
                    <div className="space-y-3">
                      {tripApprovedList.map((s, i) => (
                        <SavingRow
                          key={s.saving_id}
                          s={s}
                          accentIndex={i}
                          isEditing={editingSavingId === s.saving_id}
                          editingTitle={editingTitle}
                          currentUserId={currentUser?.user_id}
                          canApprove={false}
                          onStartEdit={() => { setEditingSavingId(s.saving_id); setEditingTitle(s.title ?? ""); }}
                          onSaveTitle={() => saveTitle(s.saving_id)}
                          onCancelEdit={() => setEditingSavingId(null)}
                          onEditingTitleChange={setEditingTitle}
                          onApprove={() => {}}
                          onReject={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SavingRow({
  s, accentIndex, isEditing, editingTitle, currentUserId, canApprove,
  onStartEdit, onSaveTitle, onCancelEdit, onEditingTitleChange,
  onApprove, onReject,
}: {
  s: SavingWithUser;
  accentIndex: number;
  isEditing: boolean;
  editingTitle: string;
  currentUserId?: string;
  canApprove: boolean;
  onStartEdit: () => void;
  onSaveTitle: () => void;
  onCancelEdit: () => void;
  onEditingTitleChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      {theme === "guam" && (
        <GuamAccent index={accentIndex} className="w-6 h-6 shrink-0 opacity-70" />
      )}
      {theme === "korea" && (
        <KoreaAccent index={accentIndex} className="w-6 h-6 shrink-0 opacity-70" />
      )}
      {s.user?.picture_url ? (
        <Image src={s.user.picture_url} alt={s.user.display_name} width={36} height={36} className="rounded-full shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm shrink-0">
          {s.user?.display_name?.[0] ?? "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1 mb-1">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSaveTitle()}
              className="flex-1 border rounded-lg px-2 py-0.5 text-sm min-w-0"
              autoFocus
              placeholder="タイトル"
            />
            <button onClick={onSaveTitle} className="text-xs bg-brand-green text-white rounded-lg px-2 py-0.5 whitespace-nowrap">保存</button>
            <button onClick={onCancelEdit} className="text-xs text-gray-400 whitespace-nowrap">取消</button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-gray-800 truncate">{s.title ?? "（タイトルなし）"}</p>
            {s.user_id === currentUserId && (
              <button onClick={onStartEdit} className="text-gray-400 text-xs leading-none shrink-0">✏️</button>
            )}
          </div>
        )}
        <p className="text-xs text-gray-500">{s.user?.display_name}</p>
        <p className="text-sm font-bold text-gray-800">¥{s.amount.toLocaleString()}</p>
        <p className="text-xs text-gray-400">
          {s.status === "approved" && s.approved_at
            ? new Date(s.approved_at).toLocaleDateString("ja-JP") + " 承認"
            : new Date(s.created_at).toLocaleDateString("ja-JP") + " 申請"}
        </p>
      </div>

      {s.status === "pending" ? (
        <div className="flex flex-col gap-1 shrink-0">
          {canApprove && (
            <>
              <button onClick={onReject} className="text-xs bg-red-400 text-white rounded-full px-3 py-1">棄却</button>
              <button onClick={onApprove} className="text-xs bg-brand-green text-white rounded-full px-3 py-1">承認</button>
            </>
          )}
          {!canApprove && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">確認待ち</span>}
        </div>
      ) : (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">積立済</span>
      )}
    </div>
  );
}
