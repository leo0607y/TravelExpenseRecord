import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import LiffProvider from "@/components/LiffProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import ResortDecorations from "@/components/ResortDecorations";

export const metadata: Metadata = {
  title: "Tabi-Pay",
  description: "3人旅行の共同サイフ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 初回描画前にテーマを適用し、切り替え時のちらつきを防ぐ
const themeInitScript = `
(function () {
  try {
    if (window.localStorage.getItem("tabipay-theme") === "guam") {
      document.documentElement.setAttribute("data-theme", "guam");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-gray-50 max-w-md mx-auto">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <ResortDecorations />
          <ThemeToggleButton />
          <LiffProvider>{children}</LiffProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
