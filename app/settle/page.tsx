"use client";

import { useLiff } from "@/components/LiffProvider";
import SettleScreen from "@/components/SettleScreen";

export default function Page() {
  const { ready, error, isAdmin } = useLiff();

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!ready) return <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>;
  if (!isAdmin) return <div className="p-6 text-center text-gray-500">管理者のみアクセスできます</div>;

  return <SettleScreen />;
}
