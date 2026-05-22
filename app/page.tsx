"use client";

import { useLiff } from "@/components/LiffProvider";
import HomeScreen from "@/components/HomeScreen";

export default function Page() {
  const { ready, error } = useLiff();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Tabi-Pay を起動中...</p>
      </div>
    );
  }

  return <HomeScreen />;
}
