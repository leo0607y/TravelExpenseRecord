"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "default" | "guam";

const STORAGE_KEY = "tabipay-theme";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "default",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "guam") setTheme("guam");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "guam" ? "guam" : "");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "guam" ? "default" : "guam"));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
