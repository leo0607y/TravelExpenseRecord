"use client";

import { useState } from "react";
import type { LiffProfile, Group, User, Trip } from "@/types";

interface GroupEntry {
  user: User;
  group: Group;
  trip: Trip | null;
  members: User[];
}

interface Props {
  profile: LiffProfile;
  existingGroups: GroupEntry[];
  onSelected: (group: Group, members: User[], trip: Trip | null, user: User) => void;
}

type Mode = "list" | "create" | "join";

export default function GroupSelectScreen({ profile, existingGroups, onSelected }: Props) {
  const [mode, setMode] = useState<Mode>("list");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [pendingEntry, setPendingEntry] = useState<GroupEntry | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelect = (entry: GroupEntry) => {
    onSelected(entry.group, entry.members, entry.trip, entry.user);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "作成に失敗しました"); return; }
      setCreatedCode(data.group.invite_code);
      const me = (data.members as User[]).find((m) => m.user_id === profile.userId) ?? data.members[0];
      setPendingEntry({ user: me, group: data.group, trip: data.trip, members: data.members });
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          inviteCode: inviteCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "参加に失敗しました"); return; }
      const me = (data.members as User[]).find((m) => m.user_id === profile.userId) ?? data.members[0];
      onSelected(data.group, data.members, data.trip, me);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!createdCode) return;
    await navigator.clipboard.writeText(createdCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // グループ作成完了画面
  if (createdCode && pendingEntry) {
    return (
      <div className="w-full max-w-sm space-y-5 text-center">
        <p className="text-lg font-bold text-gray-800">グループを作成しました！</p>
        <p className="text-sm text-gray-500">このコードをメンバーに共有してください</p>
        <div className="bg-gray-100 rounded-2xl p-6">
          <p className="text-4xl font-mono font-bold tracking-widest text-brand-green">{createdCode}</p>
        </div>
        <button onClick={copyCode} className="text-sm text-brand-green underline">
          {copied ? "コピーしました！" : "コードをコピー"}
        </button>
        <button
          onClick={() => onSelected(pendingEntry.group, pendingEntry.members, pendingEntry.trip, pendingEntry.user)}
          className="w-full bg-brand-green text-white rounded-2xl py-4 font-bold text-lg"
        >
          アプリを始める
        </button>
      </div>
    );
  }

  // 招待コード入力画面
  if (mode === "join") {
    return (
      <div className="w-full max-w-sm space-y-4">
        <p className="text-center font-bold text-gray-800">招待コードで参加する</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="6文字のコード"
          maxLength={6}
          className="w-full border-2 rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-widest uppercase"
        />
        <button
          onClick={handleJoin}
          disabled={loading || inviteCode.trim().length !== 6}
          className="w-full bg-brand-green text-white rounded-2xl py-4 font-bold disabled:opacity-50"
        >
          {loading ? "参加中..." : "参加する"}
        </button>
        <button onClick={() => { setMode("list"); setError(null); }} className="w-full text-sm text-gray-400 underline">
          戻る
        </button>
      </div>
    );
  }

  // グループ作成確認画面
  if (mode === "create") {
    return (
      <div className="w-full max-w-sm space-y-4">
        <p className="text-center font-bold text-gray-800">新しいグループを作る</p>
        <p className="text-sm text-gray-500 text-center">あなたが管理者になります。作成後、招待コードをメンバーに共有してください。</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-brand-green text-white rounded-2xl py-4 font-bold disabled:opacity-50"
        >
          {loading ? "作成中..." : "作成する"}
        </button>
        <button onClick={() => { setMode("list"); setError(null); }} className="w-full text-sm text-gray-400 underline">
          戻る
        </button>
      </div>
    );
  }

  // メイン：グループ一覧
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-800">Tabi-Pay</p>
        <p className="text-sm text-gray-500 mt-1">
          {existingGroups.length > 0 ? "どのグループで使いますか？" : "グループを設定してください"}
        </p>
      </div>

      {existingGroups.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold px-1 uppercase tracking-wide">参加中のグループ</p>
          {existingGroups.map((entry) => (
            <button
              key={entry.group.group_id}
              onClick={() => handleSelect(entry)}
              className="w-full text-left bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center justify-between active:border-brand-green transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">
                  {entry.trip?.title ?? "旅行なし"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  招待コード：{entry.group.invite_code} ／ {entry.user.role === "admin" ? "👑 管理者" : "メンバー"}
                </p>
                <p className="text-xs text-gray-400">
                  メンバー {entry.members.length}人
                  {entry.trip ? ` ／ ✈️ 進行中` : " ／ 旅行なし"}
                </p>
              </div>
              <span className="text-gray-300 text-2xl ml-2">›</span>
            </button>
          ))}
        </div>
      )}

      <div className={`space-y-2 ${existingGroups.length > 0 ? "pt-2 border-t border-gray-100" : ""}`}>
        {existingGroups.length > 0 && (
          <p className="text-xs text-gray-400 font-semibold px-1 uppercase tracking-wide">別のグループ</p>
        )}
        <button
          onClick={() => setMode("create")}
          className="w-full bg-brand-green text-white rounded-2xl py-4 font-bold text-lg"
        >
          ＋ 新しいグループを作る
        </button>
        <button
          onClick={() => setMode("join")}
          className="w-full bg-white border-2 border-brand-green text-brand-green rounded-2xl py-4 font-bold text-lg"
        >
          招待コードで参加する
        </button>
      </div>
    </div>
  );
}
