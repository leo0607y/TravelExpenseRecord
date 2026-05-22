import type { LiffProfile, LiffContext } from "@/types";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liff: any;
  }
}

export async function initLiff(): Promise<void> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) throw new Error("NEXT_PUBLIC_LIFF_ID が設定されていません");

  await window.liff.init({ liffId });

  if (!window.liff.isLoggedIn()) {
    window.liff.login();
  }
}

export async function getLiffProfile(): Promise<LiffProfile> {
  const profile = await window.liff.getProfile();
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
  };
}

export function getLiffContext(): LiffContext {
  return window.liff.getContext();
}

export function getAccessToken(): string {
  return window.liff.getAccessToken();
}

/** LINEグループ外からのアクセスをブロックする */
export function assertGroupContext(expectedGroupId: string): string {
  const ctx = getLiffContext();
  if (ctx.type !== "group" || !ctx.groupId) {
    throw new Error("LINEグループチャット内から開いてください");
  }
  if (ctx.groupId !== expectedGroupId) {
    throw new Error("このグループでは使用できません");
  }
  return ctx.groupId;
}
