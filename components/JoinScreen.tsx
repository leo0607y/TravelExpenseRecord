"use client";

import { useState } from "react";
import type { LiffProfile, Group, User, Trip } from "@/types";

interface Props {
  profile: LiffProfile;
  onJoined: (group: Group, members: User[], trip: Trip | null) => void;
}

type Mode = "select" | "create" | "join";

export default function JoinScreen({ profile, onJoined }: Props) {
  const [mode, setMode] = useState<Mode>("select");
  const [inviteCode, setInviteCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [pendingJoin, setPendingJoin] = useState<{ group: Group; members: User[]; trip: Trip | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.userId, displayName: profile.displayName, pictureUrl: profile.pictureUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "作成に失敗しました"); return; }
      setCreatedCode(data.group.invite_code);
      setPendingJoin({ group: data.group, members: data.members, trip: data.trip });
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
        body: JSON.stringify({ userId: profile.userId, displayName: profile.displayName, pictureUrl: profile.pictureUrl, inviteCode: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "参加に失敗しました"); return; }
      onJoined(data.group, data.members, data.trip);
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

  // 招待コード表示画面（グループ作成後）
  if (createdCode && pendingJoin) {
    return (
      <div className="w-full max-w-sm space-y-5 text-center">
        <div>
          <p className="text-lg font-bold text-gray-800">グループを作成しました！</p>
          <p className="text-sm text-gray-500 mt-1">このコードをメンバーに共有してください</p>
        </div>
        <div className="bg-gray-100 rounded-2xl p-6">
          <p className="text-4xl font-mono font-bold tracking-widest text-brand-green">{createdCode}</p>
        </div>
        <button onClick={copyCode} className="text-sm text-brand-green underline">
          {copied ? "コピーしました！" : "コードをコピー"}
        </button>
        <button
          onClick={() => onJoined(pendingJoin.group, pendingJoin.members, pendingJoin.trip)}
          className="w-full bg-brand-green text-white rounded-2xl py-4 font-bold text-lg"
        >
          アプリを始める
        </button>
      </div>
    );
  }

  if (mode === "select") {
    return (
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">Tabi-Pay</p>
          <p className="text-sm text-gray-500 mt-1">旅行グループを設定してください</p>
        </div>
        <button
          onClick={() => setMode("create")}
          className="w-full bg-brand-green text-white rounded-2xl py-4 font-bold text-lg"
        >
          グループを作成する
        </button>
        <button
          onClick={() => setMode("join")}
          className="w-full bg-white border-2 border-brand-green text-brand-green rounded-2xl py-4 font-bold text-lg"
        >
          招待コードで参加する
        </button>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="w-full max-w-sm space-y-4">
        <p className="text-center font-bold text-gray-800">グループを作成する</p>
        <p className="text-sm text-gray-500 text-center">あなたが管理者になります。招待コードをメンバーに共有してください。</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-brand-green text-white rounded-2xl py-4 font-bold disabled:opacity-50"
        >
          {loading ? "作成中..." : "作成する"}
        </button>
        <button onClick={() => setMode("select")} className="w-full text-sm text-gray-400 underline">
          戻る
        </button>
      </div>
    );
  }

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
      <button onClick={() => setMode("select")} className="w-full text-sm text-gray-400 underline">
        戻る
      </button>
    </div>
  );
}
