"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "./LiffProvider";
import { useTheme } from "@/lib/theme-context";
import OceanWave from "./guam-illustrations/OceanWave";
import GuamAccent from "./guam-illustrations/GuamAccent";
import ThemeAccentStrip from "./ThemeAccentStrip";
import Lightstick from "./korea-illustrations/Lightstick";
import KoreaAccent from "./korea-illustrations/KoreaAccent";
import type { Reminder } from "@/types";

const MAX_MESSAGE_LENGTH = 300;

export default function RemindersScreen() {
  const router = useRouter();
  const { activeTrip, group, currentUser, isAdmin } = useLiff();
  const { theme } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendDate, setSendDate] = useState("");
  const [sendTime, setSendTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSendDate, setEditSendDate] = useState("");
  const [editSendTime, setEditSendTime] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const toLocalDateParts = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  };

  // date入力とtime入力を安全にISO文字列へ変換する（不正な値ならnullを返す）
  const combineToISO = (datePart: string, timePart: string): string | null => {
    if (!datePart || !timePart) return null;
    const d = new Date(`${datePart}T${timePart}`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const fetchReminders = useCallback(async () => {
    if (!activeTrip) return;
    const res = await fetch(`/api/reminders?tripId=${activeTrip.trip_id}`);
    if (res.ok) setReminders(await res.json());
    setLoading(false);
  }, [activeTrip]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const submit = async () => {
    if (!activeTrip || !group || !currentUser) return;
    if (!message.trim()) { setError("メッセージを入力してください"); return; }
    if (message.length > MAX_MESSAGE_LENGTH) { setError(`メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください`); return; }
    const sendAtISO = combineToISO(sendDate, sendTime);
    if (!sendAtISO) { setError("送信日時を正しく選択してください"); return; }
    if (new Date(sendAtISO).getTime() <= Date.now()) { setError("送信日時は未来の日時を選択してください"); return; }

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: activeTrip.trip_id,
        group_id: group.group_id,
        created_by: currentUser.user_id,
        message: message.trim(),
        send_at: sendAtISO,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const { error: e } = await res.json();
      setError(e ?? "送信に失敗しました");
      return;
    }

    setSendDate("");
    setSendTime("");
    setMessage("");
    fetchReminders();
  };

  const removeReminder = async (reminderId: string) => {
    if (!currentUser) return;
    await fetch(`/api/reminders/${reminderId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId: currentUser.user_id }),
    });
    fetchReminders();
  };

  const startEdit = (r: Reminder) => {
    const { date, time } = toLocalDateParts(r.send_at);
    setEditingId(r.reminder_id);
    setEditSendDate(date);
    setEditSendTime(time);
    setEditMessage(r.message);
    setEditError(null);
  };

  const saveEdit = async (reminderId: string) => {
    if (!currentUser) return;
    if (!editMessage.trim()) { setEditError("メッセージを入力してください"); return; }
    if (editMessage.length > MAX_MESSAGE_LENGTH) { setEditError(`メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください`); return; }
    const editSendAtISO = combineToISO(editSendDate, editSendTime);
    if (!editSendAtISO) { setEditError("送信日時を正しく選択してください"); return; }
    if (new Date(editSendAtISO).getTime() <= Date.now()) { setEditError("送信日時は未来の日時を選択してください"); return; }

    setSavingEdit(true);
    const res = await fetch(`/api/reminders/${reminderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requesterId: currentUser.user_id,
        message: editMessage.trim(),
        send_at: editSendAtISO,
      }),
    });
    setSavingEdit(false);

    if (!res.ok) {
      const { error: e } = await res.json();
      setEditError(e ?? "保存に失敗しました");
      return;
    }

    setEditingId(null);
    fetchReminders();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>;
  }

  const pending = reminders.filter((r) => !r.sent_at);
  const sent = reminders.filter((r) => r.sent_at).slice(0, 10);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen pb-8">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">🔔 リマインダー</h1>
            {activeTrip && <p className="text-xs opacity-80">{activeTrip.title}</p>}
          </div>
        </div>
        <ThemeAccentStrip count={9} start={9} className="mt-3 opacity-45" itemClassName="w-7 h-7" />
      </div>

      <div className="p-4 space-y-4">
        {/* 新規作成フォーム */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs text-gray-500">＋ 新しいリマインダーを予約する</p>
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>
          )}
          <div>
            <label className="text-xs text-gray-500">送信日時</label>
            <div className="flex gap-2 mt-1">
              <input
                type="date"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                className="flex-1 min-w-0 border rounded-xl px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="w-28 shrink-0 border rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">メッセージ</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="例：明日は9時にロビー集合！忘れ物ない？"
              rows={3}
              className="w-full border rounded-xl px-3 py-2 text-sm mt-1 resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{message.length}/{MAX_MESSAGE_LENGTH}</p>
          </div>
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full bg-brand-green text-white rounded-2xl py-3 font-bold disabled:opacity-50"
          >
            {submitting ? "予約中..." : "この内容で予約する"}
          </button>
        </div>

        {/* 送信予定 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">⏰ 送信予定</p>
          {pending.length === 0 && (
            <div className="text-center py-4">
              {theme === "guam" && <OceanWave className="w-24 h-10 mx-auto mb-1 opacity-80" />}
              {theme === "korea" && <Lightstick className="w-10 h-16 mx-auto mb-1 opacity-80" />}
              <p className="text-sm text-gray-400">予定中のリマインダーはありません</p>
            </div>
          )}
          <div className="space-y-2">
            {pending.map((r, i) => {
              const canManage = r.created_by === currentUser?.user_id || isAdmin;

              if (editingId === r.reminder_id) {
                return (
                  <div key={r.reminder_id} className="py-2 border-b border-gray-100 last:border-0 space-y-2">
                    {editError && (
                      <div className="bg-red-50 text-red-600 rounded-xl p-2 text-xs">{editError}</div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={editSendDate}
                        onChange={(e) => setEditSendDate(e.target.value)}
                        className="flex-1 min-w-0 border rounded-xl px-3 py-2 text-sm"
                      />
                      <input
                        type="time"
                        value={editSendTime}
                        onChange={(e) => setEditSendTime(e.target.value)}
                        className="w-28 shrink-0 border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      maxLength={MAX_MESSAGE_LENGTH}
                      rows={3}
                      className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right">{editMessage.length}/{MAX_MESSAGE_LENGTH}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(r.reminder_id)}
                        disabled={savingEdit}
                        className="flex-1 bg-brand-green text-white rounded-xl py-2 text-sm font-bold disabled:opacity-50"
                      >
                        {savingEdit ? "保存中..." : "保存"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-white border border-gray-300 text-gray-600 rounded-xl py-2 text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={r.reminder_id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {theme === "guam" && (
                      <GuamAccent index={i} className="w-6 h-6 shrink-0 opacity-70 mt-0.5" />
                    )}
                    {theme === "korea" && (
                      <KoreaAccent index={i} className="w-6 h-6 shrink-0 opacity-70 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{formatDateTime(r.send_at)}</p>
                      <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{r.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.creator?.display_name ?? "メンバー"}が予約</p>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(r)}
                        className="text-xs bg-brand-green text-white rounded-full px-3 py-1"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => removeReminder(r.reminder_id)}
                        className="text-xs bg-red-400 text-white rounded-full px-3 py-1"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 送信済み */}
        {sent.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-3">✅ 送信済み</p>
            <div className="space-y-2">
              {sent.map((r, i) => (
                <div key={r.reminder_id} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                  {theme === "guam" && (
                    <GuamAccent index={i} className="w-6 h-6 shrink-0 opacity-50 mt-0.5" />
                  )}
                  {theme === "korea" && (
                    <KoreaAccent index={i} className="w-6 h-6 shrink-0 opacity-50 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{formatDateTime(r.send_at)}</p>
                    <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{r.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.creator?.display_name ?? "メンバー"}が予約</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
