"use client";

import { useTheme } from "@/lib/theme-context";

/** 自由選択期間中のみ表示される、グアム/韓国UIを切り替える小さなフローティングボタン */
export default function ThemeSwitcher() {
  const { theme, freeChoiceEnabled, setTheme } = useTheme();

  if (!freeChoiceEnabled) return null;

  return (
    <div className="fixed bottom-20 right-3 z-40 flex bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => setTheme("default")}
        className={`px-3 py-2 font-bold transition-colors ${
          theme === "default" ? "bg-brand-green text-white" : "text-gray-500"
        }`}
      >
        ✨ 標準
      </button>
      <button
        type="button"
        onClick={() => setTheme("guam")}
        className={`px-3 py-2 font-bold transition-colors ${
          theme === "guam" ? "bg-brand-green text-white" : "text-gray-500"
        }`}
      >
        🌴 グアム
      </button>
      <button
        type="button"
        onClick={() => setTheme("korea")}
        className={`px-3 py-2 font-bold transition-colors ${
          theme === "korea" ? "bg-brand-green text-white" : "text-gray-500"
        }`}
      >
        🇰🇷 韓国
      </button>
    </div>
  );
}
