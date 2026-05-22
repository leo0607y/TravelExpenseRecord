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
  const [step, setStep] = useState("SDK読み込み中...");
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const initCalled = useRef(false);

  const init = useCallback(async () => {
    if (initCalled.current) return;
    initCalled.current = true;

    try {
      // ① LIFF ID チェック
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      setStep(`① LIFF ID確認中... (${liffId ?? "未設定"})`);
      if (!liffId) {
        setError("LIFF IDが未設定です。VercelのNEXT_PUBLIC_LIFF_IDを確認してください。");
        return;
      }

      // ② window.liff チェック
      setStep("② LIFF SDK確認中...");
      const liff = window.liff;
      if (!liff) {
        setError("LIFF SDKが見つかりません。LINEアプリから開いてください。");
        return;
      }

      // ③ liff.init()
      setStep(`③ liff.init()実行中... (ID: ${liffId})`);
      await Promise.race([
        liff.init({ liffId }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`liff.init()が10秒でタイムアウト (LIFF ID: ${liffId})`)), 10000)
        ),
      ]);

      // ④ ログイン確認
      setStep("④ ログイン確認中...");
      if (!liff.isLoggedIn()) {
        setStep("④ LINEログインにリダイレクト中...");
        liff.login();
        return;
      }

      // ⑤ コンテキスト取得
      setStep("⑤ グループ情報取得中...");
      const ctx = liff.getContext();
      const ctxJson = JSON.stringify(ctx);
      const gId: string = ctx?.groupId ?? process.env.NEXT_PUBLIC_DEV_GROUP_ID ?? "";

      if (!gId) {
        setError(`グループIDが取得できません。LINEグループチャット内から開いてください。\ncontext: ${ctxJson}`);
        return;
      }

      // ⑥ プロフィール取得
      setStep("⑥ プロフィール取得中...");
      const p = await liff.getProfile();
      const liffProfile: LiffProfile = {
        userId: p.userId,
        displayName: p.displayName,
        pictureUrl: p.pictureUrl,
      };

      // ⑦ バックエンド初期化
      setStep("⑦ サーバー初期化中...");
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
        setError(`サーバーエラー (${res.status}): ${body.error ?? "不明"}`);
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
      initCalled.current = false;
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const reload = useCallback(() => {
    initCalled.current = false;
    setReady(false);
    setError(null);
    setStep("再初期化中...");
    init();
  }, [init]);

  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="afterInteractive"
        onLoad={init}
        onError={() => setError("LIFF SDKスクリプトの読み込みに失敗しました。")}
      />
      <Ctx.Provider value={{ ready, error, profile, groupId, currentUser, members, activeTrip, isAdmin, reload }}>
        {/* ローディング中はステップを表示 */}
        {!ready && !error && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 p-6">
            <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500 text-center">{step}</p>
          </div>
        )}
        {children}
      </Ctx.Provider>
    </>
  );
}
