import type { Metadata, Viewport } from "next";
import "./globals.css";
import LiffProvider from "@/components/LiffProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ThemeBackdrop from "@/components/ThemeBackdrop";
import { getServerTheme, isFreeChoiceEnabled } from "@/lib/theme";
import { ThemeProvider } from "@/lib/theme-context";

// 日時によるテーマ自動切り替え（lib/theme.ts）を反映するため、リクエストごとに動的レンダリングする
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tabi-Pay",
  description: "3人旅行の共同サイフ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const serverTheme = getServerTheme();
  const freeChoiceEnabled = isFreeChoiceEnabled();

  return (
    <html lang="ja" data-theme={serverTheme !== "default" ? serverTheme : undefined}>
      <body className="bg-gray-50 max-w-md mx-auto">
        <ThemeProvider serverTheme={serverTheme} freeChoiceEnabled={freeChoiceEnabled}>
          <ThemeBackdrop />
          <div className="relative z-10">
            <LiffProvider>{children}</LiffProvider>
          </div>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
