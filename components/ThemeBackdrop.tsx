"use client";

import { useTheme } from "@/lib/theme-context";
import GuamAccent from "./guam-illustrations/GuamAccent";
import KoreaAccent from "./korea-illustrations/KoreaAccent";

/**
 * 画面全体の背景にイラストを散りばめる装飾レイヤー。
 * 位置は固定配列で持つ（Math.randomを使うとSSRとクライアントで
 * 食い違ってhydrationエラーになるため）。
 * カードの下に敷かれるので、カード同士の隙間や余白から覗く。
 */
const SPOTS = [
  { top: "1%", left: "3%", size: 54, rot: -12 },
  { top: "4%", left: "46%", size: 40, rot: 8 },
  { top: "2%", left: "78%", size: 58, rot: 16 },
  { top: "9%", left: "22%", size: 44, rot: -20 },
  { top: "11%", left: "66%", size: 50, rot: 6 },
  { top: "16%", left: "88%", size: 42, rot: -8 },
  { top: "18%", left: "8%", size: 48, rot: 14 },
  { top: "23%", left: "38%", size: 56, rot: -6 },
  { top: "26%", left: "72%", size: 44, rot: 18 },
  { top: "31%", left: "14%", size: 52, rot: -16 },
  { top: "34%", left: "56%", size: 46, rot: 10 },
  { top: "38%", left: "86%", size: 54, rot: -4 },
  { top: "42%", left: "30%", size: 42, rot: 20 },
  { top: "46%", left: "64%", size: 50, rot: -14 },
  { top: "50%", left: "4%", size: 56, rot: 6 },
  { top: "54%", left: "44%", size: 44, rot: -18 },
  { top: "57%", left: "80%", size: 48, rot: 12 },
  { top: "62%", left: "20%", size: 52, rot: -10 },
  { top: "66%", left: "58%", size: 42, rot: 16 },
  { top: "70%", left: "88%", size: 50, rot: -6 },
  { top: "73%", left: "10%", size: 46, rot: 8 },
  { top: "78%", left: "40%", size: 54, rot: -20 },
  { top: "81%", left: "74%", size: 44, rot: 14 },
  { top: "86%", left: "26%", size: 48, rot: -8 },
  { top: "89%", left: "62%", size: 52, rot: 18 },
  { top: "93%", left: "6%", size: 42, rot: -12 },
  { top: "95%", left: "50%", size: 50, rot: 10 },
  { top: "97%", left: "84%", size: 46, rot: -16 },
];

export default function ThemeBackdrop() {
  const { theme } = useTheme();
  if (theme !== "guam" && theme !== "korea") return null;

  const Accent = theme === "guam" ? GuamAccent : KoreaAccent;

  return (
    <div
      className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none select-none overflow-hidden opacity-[0.16]"
      aria-hidden="true"
    >
      {SPOTS.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            transform: `rotate(${s.rot}deg)`,
          }}
        >
          <Accent index={i * 3 + 1} className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}
