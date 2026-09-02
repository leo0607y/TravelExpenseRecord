import { KOREA_ICONS } from "./index";

/** リストの各行・各カードに小さく添える、indexに応じて決定的に絵柄が変わる韓国イラスト */
export default function KoreaAccent({ index, className }: { index: number; className?: string }) {
  const Icon = KOREA_ICONS[((index % KOREA_ICONS.length) + KOREA_ICONS.length) % KOREA_ICONS.length];
  return <Icon className={className} />;
}
