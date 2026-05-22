import type { Metadata, Viewport } from "next";
import "./globals.css";
import LiffProvider from "@/components/LiffProvider";

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
  return (
    <html lang="ja">
      <body className="bg-gray-50 max-w-md mx-auto">
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}
