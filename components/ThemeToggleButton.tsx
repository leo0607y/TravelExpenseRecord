"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isGuam = theme === "guam";

  return (
    <button
      onClick={toggleTheme}
      className={`fixed top-3 right-3 z-[60] rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur transition-colors ${
        isGuam ? "bg-white/90 text-teal-700" : "bg-white/90 text-gray-600"
      }`}
    >
      {isGuam ? "🏠 通常UIに戻す" : "🌴 グアムUIにする"}
    </button>
  );
}
