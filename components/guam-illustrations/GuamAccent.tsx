import { GUAM_ICONS } from "./index";

/** リストの各行・各カードに小さく添える、indexに応じて決定的に絵柄が変わるグアムイラスト */
export default function GuamAccent({ index, className }: { index: number; className?: string }) {
  const Icon = GUAM_ICONS[((index % GUAM_ICONS.length) + GUAM_ICONS.length) % GUAM_ICONS.length];
  return <Icon className={className} />;
}
