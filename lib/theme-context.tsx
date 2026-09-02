"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeName } from "./theme";

const STORAGE_KEY = "tabipay-theme-pref";

interface ThemeContextValue {
  theme: ThemeName;
  freeChoiceEnabled: boolean;
  setTheme: (theme: "guam" | "korea") => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  serverTheme,
  freeChoiceEnabled,
  children,
}: {
  serverTheme: ThemeName;
  freeChoiceEnabled: boolean;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeName>(serverTheme);

  // マウント後、自由選択期間中であればlocalStorageの保存値を反映する
  // （初回レンダリングはサーバーと必ず一致させ、hydrationミスマッチを避ける）
  useEffect(() => {
    if (!freeChoiceEnabled) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "guam" || saved === "korea") {
        setThemeState(saved);
        document.documentElement.dataset.theme = saved;
      }
    } catch {
      // localStorageが使えない環境ではサーバーテーマのまま
    }
  }, [freeChoiceEnabled]);

  const setTheme = (next: "guam" | "korea") => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できなくても表示の切り替え自体は反映する
    }
  };

  return <ThemeContext.Provider value={{ theme, freeChoiceEnabled, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
