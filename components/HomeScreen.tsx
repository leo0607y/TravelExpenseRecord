"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLiff } from "./LiffProvider";
import GuamMascot from "./GuamMascot";
import KoreaMascot from "./KoreaMascot";
import HulaDancer from "./guam-illustrations/HulaDancer";
import HanbokDancer from "./korea-illustrations/HanbokDancer";
import ThemeAccent from "./ThemeAccent";
import ThemeAccentStrip from "./ThemeAccentStrip";
import { useTheme } from "@/lib/theme-context";
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
  const { activeTrip, members, currentUser, isAdmin, canApprove, group, reload, switchGroup, updateGroupApprover } = useLiff();
  const { theme } = useTheme();
  const [data, setData] = useState<TripData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [changingApprover, setChangingApprover] = useState(false);
  const [newApproverId, setNewApproverId] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);

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

  const savingStatus = (userId: string) => {
    const userSavings = savings.filter((s) => s.user_id === userId);
    if (userSavings.length === 0) return { label: "未申請", color: "bg-gray-200 text-gray-600" };
    if (userSavings.some((s) => s.status === "pending")) return { label: "確認中", color: "bg-yellow-100 text-yellow-700" };
    return { label: "積立済", color: "bg-green-100 text-green-700" };
  };

  const approveSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser?.user_id }),
    });
    fetchData();
  };

  const remindSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}/remind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser?.user_id }),
    });
  };

  const rejectSaving = async (savingId: string) => {
    await fetch(`/api/savings/${savingId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser?.user_id }),
    });
    fetchData();
  };

  const remindUser = async (userId: string) => {
    if (!currentUser) return;
    await fetch(`/api/trips/${trip.trip_id}/savings/remind-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser.user_id, userId }),
    });
  };

  const setApprover = async () => {
    if (!group || !currentUser || !newApproverId) return;
    const res = await fetch(`/api/groups/${group.group_id}/approver`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser.user_id, approverId: newApproverId }),
    });
    if (res.ok) {
      updateGroupApprover(newApproverId);
    }
    setChangingApprover(false);
  };

  const deleteGroup = async () => {
    if (!group || !currentUser) return;
    setDeletingGroup(true);
    await fetch(`/api/groups/${group.group_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser.user_id }),
    });
    setDeletingGroup(false);
    reload();
  };

  const copyInviteCode = async () => {
    if (!group?.invite_code) return;
    await navigator.clipboard.writeText(group.invite_code).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const saveTitle = async () => {
    if (!titleInput.trim()) return;
    await fetch(`/api/trips/${trip.trip_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleInput.trim() }),
    });
    setEditingTitle(false);
    fetchData();
  };

  const currentApproverName = members.find((m) => m.user_id === group?.approver_id)?.display_name ?? "未設定";

  return (
    <div className="min-h-screen pb-24">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-3">
            <p className="text-xs opacity-80">現在の旅行</p>
            {editingTitle ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                  className="bg-white/20 text-white placeholder-white/60 rounded-lg px-2 py-1 text-sm flex-1 outline-none border border-white/40"
                  autoFocus
                />
                <button onClick={saveTitle} className="text-xs bg-white text-brand-green rounded-lg px-2 py-1 font-bold whitespace-nowrap">保存</button>
                <button onClick={() => setEditingTitle(false)} className="text-xs text-white/70 whitespace-nowrap">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{trip.title}</h1>
                {isAdmin && (
                  <button
                    onClick={() => { setEditingTitle(true); setTitleInput(trip.title); }}
                    className="text-white/70 text-base leading-none"
                  >
                    ✏️
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/history" className="text-xs bg-white/20 rounded-full px-3 py-1 whitespace-nowrap">
              履歴
            </Link>
            <button
              onClick={switchGroup}
              className="text-xs bg-white/20 rounded-full px-3 py-1 whitespace-nowrap"
            >
              切替
            </button>
          </div>
        </div>
        <ThemeAccentStrip count={9} start={0} className="mt-3 opacity-45" itemClassName="w-7 h-7" />
      </div>

      <div className="p-4 space-y-4">
        {/* リマインダー */}
        <Link
          href="/reminders"
          className="relative overflow-hidden block w-full text-center bg-white border-2 border-brand-green text-brand-green rounded-2xl py-3 font-bold shadow-sm"
        >
          <ThemeAccent index={9} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 opacity-40 pointer-events-none" />
          🔔 リマインダーを見る・予約する
          <ThemeAccent index={13} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 opacity-40 pointer-events-none" />
        </Link>

        {/* 総支出カード */}
        <div className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <ThemeAccent index={3} className="absolute -left-2 -top-2 w-12 h-12 opacity-20 pointer-events-none" />
          <ThemeAccent index={7} className="absolute right-16 top-2 w-9 h-9 opacity-25 pointer-events-none" />
          <p className="text-xs text-gray-500 relative">🎉 ワクワク総支出</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">¥{totalExpenses.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">
            💳 共通カード ¥{totalCard.toLocaleString()} ／ 💴 立替 ¥{totalCash.toLocaleString()}
          </p>
          {theme === "guam" && (
            <GuamMascot className="absolute -bottom-1 right-2 w-12 h-12 opacity-80 pointer-events-none" />
          )}
          {theme === "korea" && (
            <KoreaMascot className="absolute -bottom-1 right-2 w-12 h-12 opacity-80 pointer-events-none" />
          )}
        </div>

        {/* プール残高カード */}
        <div className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <ThemeAccent index={2} className="absolute -right-2 -bottom-2 w-12 h-12 opacity-20 pointer-events-none" />
          <ThemeAccent index={5} className="absolute right-14 -top-1 w-9 h-9 opacity-20 pointer-events-none" />
          <ThemeAccent index={11} className="absolute -left-2 bottom-6 w-9 h-9 opacity-15 pointer-events-none" />
          <p className="text-xs text-gray-500 relative">💰 口座プール残高</p>
          <p className={`text-2xl font-bold mt-1 ${poolBalance < 0 ? "text-red-600" : "text-blue-600"}`}>
            ¥{poolBalance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            繰越 ¥{trip.carry_over_in.toLocaleString()} ＋ 積立 ¥{approvedSavings.reduce((s, r) => s + r.amount, 0).toLocaleString()} － カード ¥{totalCard.toLocaleString()}
          </p>
          {poolBalance < 0 && (
            <div className="bg-red-50 rounded-xl p-3 mt-3 border border-red-200">
              <p className="text-xs text-red-600 font-bold">⚠️ 積立不足 - 追加振込が必要</p>
              <p className="text-sm text-red-700 font-bold mt-1">
                追加合計：¥{Math.abs(poolBalance).toLocaleString()}
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                1人当たり目安：¥{Math.ceil(Math.abs(poolBalance) / Math.max(1, members.length)).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <ThemeAccentStrip count={12} start={14} className="opacity-70" itemClassName="w-6 h-6" />

        {/* メンバー積立ステータス */}
        <div className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          {theme === "guam" && (
            <HulaDancer className="absolute -top-2 right-3 w-10 h-14 opacity-70 pointer-events-none" />
          )}
          {theme === "korea" && (
            <HanbokDancer className="absolute -top-2 right-3 w-10 h-14 opacity-70 pointer-events-none" />
          )}
          <ThemeAccent index={6} className="absolute -left-2 -bottom-2 w-12 h-12 opacity-15 pointer-events-none" />
          <ThemeAccent index={12} className="absolute right-16 -bottom-1 w-9 h-9 opacity-15 pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative">
            <p className="text-xs text-gray-500">👥 メンバー積立状況</p>
            <Link href="/savings" className="text-xs text-brand-green underline">一覧を見る</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {members.map((m) => {
              const st = savingStatus(m.user_id);
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
                  <button
                    onClick={() => remindUser(m.user_id)}
                    className="mt-1 text-xs bg-orange-400 text-white rounded-full px-2 py-0.5"
                  >
                    催促
                  </button>
                </div>
              );
            })}
          </div>

          {/* 承認待ち積立一覧（入金担当者のみ） */}
          {canApprove && savings.filter((s) => s.status === "pending").length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">⏳ 承認待ちの積立</p>
              <div className="space-y-2">
                {savings.filter((s) => s.status === "pending").map((s) => (
                  <div key={s.saving_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0 mr-2">
                      {s.title && <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>}
                      <p className="text-xs text-gray-500">{s.user.display_name} ／ ¥{s.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => remindSaving(s.saving_id)}
                        className="text-xs bg-orange-400 text-white rounded-full px-2 py-1"
                      >
                        催促
                      </button>
                      <button
                        onClick={() => rejectSaving(s.saving_id)}
                        className="text-xs bg-red-400 text-white rounded-full px-2 py-1"
                      >
                        棄却
                      </button>
                      <button
                        onClick={() => approveSaving(s.saving_id)}
                        className="text-xs bg-brand-green text-white rounded-full px-2 py-1"
                      >
                        承認
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 入金確認担当者 */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">入金確認担当者</p>
                <p className="text-sm font-medium text-gray-700">{currentApproverName}</p>
              </div>
              {isAdmin && !changingApprover && (
                <button
                  onClick={() => { setChangingApprover(true); setNewApproverId(group?.approver_id ?? ""); }}
                  className="text-xs text-brand-green underline"
                >
                  変更
                </button>
              )}
            </div>
            {changingApprover && (
              <div className="mt-2 flex gap-2">
                <select
                  value={newApproverId}
                  onChange={(e) => setNewApproverId(e.target.value)}
                  className="flex-1 border rounded-xl px-3 py-2 text-sm"
                >
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{m.display_name}</option>
                  ))}
                </select>
                <button onClick={setApprover} className="bg-brand-green text-white rounded-xl px-3 text-sm font-bold">
                  確定
                </button>
                <button onClick={() => setChangingApprover(false)} className="text-gray-400 text-sm">
                  取消
                </button>
              </div>
            )}
          </div>

          {/* 招待コード */}
          {group?.invite_code && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">招待コード（メンバーに共有）</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-2xl font-mono font-bold tracking-widest text-brand-green">
                  {group.invite_code}
                </span>
                <button
                  onClick={copyInviteCode}
                  className="text-xs text-brand-green underline ml-3"
                >
                  {codeCopied ? "コピー済み" : "コピー"}
                </button>
              </div>
            </div>
          )}

          {/* 積立申請フォーム（何回でも追加可） */}
          {currentUser && (
            <SavingForm tripId={trip.trip_id} userId={currentUser.user_id} onDone={fetchData} />
          )}
        </div>

        <ThemeAccentStrip count={12} start={26} className="opacity-70" itemClassName="w-6 h-6" />

        {/* 支出履歴 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <ThemeAccent index={8} className="absolute -right-2 -top-2 w-12 h-12 opacity-15 pointer-events-none" />
          <p className="text-xs text-gray-500 mb-3 relative">📋 支出履歴</p>
          {expenses.length === 0 && (
            <div className="py-4">
              <p className="text-sm text-gray-400 text-center">支出がまだありません</p>
              <ThemeAccentStrip count={6} start={4} className="mt-3 opacity-50" itemClassName="w-8 h-8" />
            </div>
          )}
          <div className="space-y-2">
            {expenses.map((e, i) => (
              <div key={e.expense_id}>
                <button
                  onClick={() => setExpandedId(expandedId === e.expense_id ? null : e.expense_id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <ThemeAccent index={i} className="w-6 h-6 shrink-0 opacity-80" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {e.title}{e.image_url && " 📸"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {e.paid_at} ／ {e.payer.display_name} ／ {e.payment_type === "card" ? "💳" : "💴"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-800 shrink-0 ml-2">¥{e.amount.toLocaleString()}</p>
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

        {/* 管理者のみ：グループ削除 */}
        {isAdmin && (
          deletingGroup ? (
            <div className="bg-gray-100 rounded-2xl p-4 text-center space-y-3">
              <p className="text-sm font-bold text-gray-700">本当にこのグループを削除しますか？</p>
              <p className="text-xs text-gray-500">支出・積立・旅行履歴が全て削除されます。元に戻せません。</p>
              <div className="flex gap-2">
                <button
                  onClick={deleteGroup}
                  className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm font-bold"
                >
                  削除する
                </button>
                <button
                  onClick={() => setDeletingGroup(false)}
                  className="flex-1 bg-white border border-gray-300 text-gray-600 rounded-xl py-2 text-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDeletingGroup(true)}
              className="w-full text-center text-gray-400 text-xs py-2 underline"
            >
              このグループを削除する
            </button>
          )
        )}

        {/* 締めの装飾 */}
        <ThemeAccentStrip count={9} start={2} className="pt-1 pb-2 opacity-60" itemClassName="w-7 h-7" />
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-md mx-auto">
        <ThemeAccentStrip count={12} start={7} className="px-3 pt-1.5 opacity-60" itemClassName="w-5 h-5" />
        <div className="flex gap-2 px-3 pb-3 pt-1">
          <Link
            href="/expenses"
            className="flex-1 text-center bg-gray-100 text-gray-700 rounded-2xl py-3 text-sm font-bold"
          >
            📋 支出一覧
          </Link>
          <Link
            href="/expense"
            className="flex-[2] text-center bg-brand-green text-white rounded-2xl py-3 text-base font-bold shadow"
          >
            ＋ 支出を記録する
          </Link>
        </div>
      </div>
    </div>
  );
}

function SavingForm({ tripId, userId, onDone }: { tripId: string; userId: string; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim() || !amount || Number(amount) <= 0) return;
    setLoading(true);
    await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip_id: tripId, user_id: userId, amount: Number(amount), title: title.trim() || null }),
    });
    setLoading(false);
    setTitle("");
    setAmount("");
    onDone();
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <p className="text-xs text-gray-500">＋ 積立を追加申請する</p>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル（必須）"
        className={`w-full border rounded-xl px-3 py-2 text-sm ${!title.trim() ? "border-red-300" : ""}`}
      />
      <div className="flex gap-2">
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
    </div>
  );
}
