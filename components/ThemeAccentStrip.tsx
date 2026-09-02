"use client";

import { useTheme } from "@/lib/theme-context";
import GuamAccent from "./guam-illustrations/GuamAccent";
import KoreaAccent from "./korea-illustrations/KoreaAccent";

/**
 * 装飾イラストを横一列に散らして並べる帯。
 * 上下のずらしと傾きを付けて、並びが機械的に見えないようにしている。
 * 標準テーマでは帯ごと描かない（余白も作らない）。
 */
export default function ThemeAccentStrip({
  count = 8,
  start = 0,
  className = "",
  itemClassName = "w-7 h-7",
}: {
  count?: number;
  start?: number;
  className?: string;
  itemClassName?: string;
}) {
  const { theme } = useTheme();
  if (theme !== "guam" && theme !== "korea") return null;

  const Accent = theme === "guam" ? GuamAccent : KoreaAccent;

  return (
    <div
      className={`flex items-center justify-between gap-1 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => {
        const shift = i % 3 === 0 ? "translate-y-1" : i % 3 === 1 ? "-translate-y-1" : "";
        const tilt = i % 4 === 0 ? "rotate-6" : i % 4 === 2 ? "-rotate-6" : "";
        return (
          <Accent key={i} index={start + i} className={`${itemClassName} ${shift} ${tilt}`} />
        );
      })}
    </div>
  );
}
