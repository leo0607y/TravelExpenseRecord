"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Script from "next/script";
import type { LiffProfile, User, Trip } from "@/types";

interface LiffContextValue {
  ready: boolean;
  error: string | null;
  profile: LiffProfile | null;
  groupId: string | null;
  currentUser: User | null;
  members: User[];
  activeTrip: Trip | null;
  isAdmin: boolean;
  reload: () => void;
}

const Ctx = createContext<LiffContextValue>({
  ready: false,
  error: null,
  profile: null,
  groupId: null,
  currentUser: null,
  members: [],
  activeTrip: null,
  isAdmin: false,
  reload: () => {},
});

export function useLiff() {
  return useContext(Ctx);
}

export default function LiffProvider({ children }: { children: React.ReactNode }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const init = useCallback(async () => {
    try {
      const liff = window.liff;
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const ctx = liff.getContext();
      // ローカル開発用：グループコンテキストがない場合は env のフォールバックを使う
      const gId: string =
        ctx?.groupId ?? process.env.NEXT_PUBLIC_DEV_GROUP_ID ?? "";

      if (!gId) {
        setError("LINEグループチャット内から開いてください");
        return;
      }

      const p = await liff.getProfile();
      const liffProfile: LiffProfile = {
        userId: p.userId,
        displayName: p.displayName,
        pictureUrl: p.pictureUrl,
      };

      // バックエンドでグループ・ユーザーを初期化
      const res = await fetch("/api/init-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: gId,
          userId: liffProfile.userId,
          displayName: liffProfile.displayName,
          pictureUrl: liffProfile.pictureUrl,
        }),
      });

      if (!res.ok) {
        const { error: e } = await res.json();
        setError(e ?? "初期化に失敗しました");
        return;
      }

      const { members: m, trip } = await res.json();

      setProfile(liffProfile);
      setGroupId(gId);
      setMembers(m ?? []);
      setActiveTrip(trip ?? null);
      setCurrentUser(m?.find((u: User) => u.user_id === liffProfile.userId) ?? null);
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded) init();
  }, [scriptLoaded, init]);

  const reload = useCallback(() => {
    setReady(false);
    init();
  }, [init]);

  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        onLoad={() => setScriptLoaded(true)}
      />
      <Ctx.Provider value={{ ready, error, profile, groupId, currentUser, members, activeTrip, isAdmin, reload }}>
        {children}
      </Ctx.Provider>
    </>
  );
}
