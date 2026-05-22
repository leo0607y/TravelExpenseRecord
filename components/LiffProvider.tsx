"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const initCalled = useRef(false);

  const init = useCallback(async () => {
    // 二重実行を防ぐ
    if (initCalled.current) return;
    initCalled.current = true;

    try {
      const liff = window.liff;
      if (!liff) {
        setError("LIFF SDKが見つかりません。LINEアプリから開いてください。");
        return;
      }

      // liff.init() に10秒のタイムアウトを設定
      const liffInitPromise = liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("LIFF初期化がタイムアウトしました。LINEアプリから開き直してください。")), 10000)
      );
      await Promise.race([liffInitPromise, timeoutPromise]);

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const ctx = liff.getContext();
      const gId: string = ctx?.groupId ?? process.env.NEXT_PUBLIC_DEV_GROUP_ID ?? "";

      if (!gId) {
        setError("LINEグループチャット内から開いてください。");
        return;
      }

      const p = await liff.getProfile();
      const liffProfile: LiffProfile = {
        userId: p.userId,
        displayName: p.displayName,
        pictureUrl: p.pictureUrl,
      };

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
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "初期化に失敗しました。");
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
      initCalled.current = false; // エラー時はリトライ可能にする
      setError(e instanceof Error ? e.message : "不明なエラーが発生しました。");
    }
  }, []);

  // SDKが読み込まれる前にタイムアウトエラーを出す（15秒）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready && !error) {
        setError("読み込みがタイムアウトしました。LINEアプリから開き直してください。");
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [ready, error]);

  const reload = useCallback(() => {
    initCalled.current = false;
    setReady(false);
    setError(null);
    init();
  }, [init]);

  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="afterInteractive"
        onLoad={init}
        onError={() => setError("LIFF SDKの読み込みに失敗しました。LINEアプリから開いてください。")}
      />
      <Ctx.Provider value={{ ready, error, profile, groupId, currentUser, members, activeTrip, isAdmin, reload }}>
        {children}
      </Ctx.Provider>
    </>
  );
}
