"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import Script from "next/script";
import type { LiffProfile, Group, User, Trip } from "@/types";
import JoinScreen from "./JoinScreen";

interface LiffContextValue {
  ready: boolean;
  error: string | null;
  profile: LiffProfile | null;
  group: Group | null;
  groupId: string | null;
  currentUser: User | null;
  members: User[];
  activeTrip: Trip | null;
  isAdmin: boolean;
  canApprove: boolean;
  reload: () => void;
}

const Ctx = createContext<LiffContextValue>({
  ready: false,
  error: null,
  profile: null,
  group: null,
  groupId: null,
  currentUser: null,
  members: [],
  activeTrip: null,
  isAdmin: false,
  canApprove: false,
  reload: () => {},
});

export function useLiff() {
  return useContext(Ctx);
}

export default function LiffProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [needJoin, setNeedJoin] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const initCalled = useRef(false);

  const init = useCallback(async () => {
    if (initCalled.current) return;
    initCalled.current = true;

    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) { setError("NEXT_PUBLIC_LIFF_ID が未設定です"); return; }

      const liff = window.liff;
      if (!liff) { setError("LIFF SDKが見つかりません"); return; }

      await Promise.race([
        liff.init({ liffId }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("init() 10秒タイムアウト")), 10000)
        ),
      ]);

      const loggedIn = liff.isLoggedIn();
      if (!loggedIn) { setNeedLogin(true); return; }

      const p = await liff.getProfile();
      const liffProfile: LiffProfile = { userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl };
      setProfile(liffProfile);

      const res = await fetch(`/api/users/me?userId=${encodeURIComponent(liffProfile.userId)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(`確認エラー: ${body.error ?? "不明"}`);
        return;
      }

      const { user, group: grp, members: mbrs, trip } = await res.json();
      if (user?.group_id && grp) {
        setGroup(grp);
        setMembers(mbrs ?? []);
        setActiveTrip(trip ?? null);
        setCurrentUser(user);
        setReady(true);
      } else {
        setNeedJoin(true);
      }
    } catch (e) {
      initCalled.current = false;
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const handleJoined = useCallback((grp: Group, mbrs: User[], trip: Trip | null) => {
    const me = mbrs.find((m) => m.user_id === profile?.userId) ?? null;
    setGroup(grp);
    setMembers(mbrs);
    setActiveTrip(trip);
    setCurrentUser(me);
    setNeedJoin(false);
    setReady(true);
  }, [profile]);

  const handleLogin = () => {
    window.liff.login({ redirectUri: window.location.href });
  };

  const reload = useCallback(() => {
    initCalled.current = false;
    setReady(false);
    setError(null);
    setNeedLogin(false);
    setNeedJoin(false);
    setProfile(null);
    setGroup(null);
    setCurrentUser(null);
    setMembers([]);
    setActiveTrip(null);
    init();
  }, [init]);

  const isAdmin = currentUser?.role === "admin";
  const canApprove = group?.approver_id
    ? currentUser?.user_id === group.approver_id
    : isAdmin;

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="afterInteractive"
        onLoad={init}
        onError={() => setError("LIFF SDK の読み込みに失敗しました")}
      />
      <Ctx.Provider value={{ ready, error, profile, group, groupId: group?.group_id ?? null, currentUser, members, activeTrip, isAdmin, canApprove, reload }}>
        {!ready && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 p-6 gap-4">
            {error && (
              <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 whitespace-pre-wrap">
                ⚠️ {error}
              </div>
            )}
            {needLogin && !error && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">LINEアカウントでのログインが必要です</p>
                <button
                  onClick={handleLogin}
                  className="bg-brand-green text-white rounded-xl px-6 py-3 font-bold text-sm"
                >
                  LINEでログイン
                </button>
              </div>
            )}
            {needJoin && profile && !error && (
              <JoinScreen profile={profile} onJoined={handleJoined} />
            )}
            {!error && !needLogin && !needJoin && (
              <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
            )}
            {error && (
              <button onClick={reload} className="text-sm text-brand-green underline">
                再試行
              </button>
            )}
          </div>
        )}
        {children}
      </Ctx.Provider>
    </>
  );
}
