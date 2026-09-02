"use client";

import { useTheme } from "@/lib/theme-context";
import GuamAccent from "./guam-illustrations/GuamAccent";
import KoreaAccent from "./korea-illustrations/KoreaAccent";

/**
 * 現在のテーマに応じた装飾イラストを1つ描く。
 * indexごとに絵柄が決まるので、同じ画面でindexをずらせば別々の絵柄が出る。
 * 標準テーマでは何も描かない。
 */
export default function ThemeAccent({ index, className }: { index: number; className?: string }) {
  const { theme } = useTheme();

  if (theme === "guam") return <GuamAccent index={index} className={className} />;
  if (theme === "korea") return <KoreaAccent index={index} className={className} />;
  return null;
}
