export type ThemeName = "default" | "guam" | "korea";

// 手動で特定テーマに固定したい場合はここを書き換えてデプロイする（自動切り替えより優先）。
// 通常は null のままにしておくこと。旅行が全て終わったら "default" にする。
const MANUAL_OVERRIDE: ThemeName | null = "korea";

// 自動切り替えスケジュール（日本時間基準、比較はUTCで行う）
// 　〜9/8 06:00 JST      : グアムテーマ
// 　9/8 06:00〜9/9 12:00 : 韓国テーマ（強制、ユーザーは選べない）
// 　9/9 12:00 JST〜      : 韓国テーマを初期値に、ユーザーがグアム/韓国を自由に選択可能
//     （選択の切り替えは lib/theme-context.tsx が担当）
const KOREA_SWITCH_AT = new Date("2026-09-07T21:00:00.000Z"); // 2026-09-08 06:00 JST
export const FREE_CHOICE_AT = new Date("2026-09-09T03:00:00.000Z"); // 2026-09-09 12:00 JST

/** 現在時刻において自動スケジュール上あるべきテーマ（手動固定があればそれを優先） */
export function getScheduledTheme(now: Date = new Date()): "guam" | "korea" {
  if (MANUAL_OVERRIDE === "guam" || MANUAL_OVERRIDE === "korea") return MANUAL_OVERRIDE;
  return now < KOREA_SWITCH_AT ? "guam" : "korea";
}

/** この時刻以降、ユーザーがUIテーマを自由に選択できるようになる */
export function isFreeChoiceEnabled(now: Date = new Date()): boolean {
  if (MANUAL_OVERRIDE) return false;
  return now >= FREE_CHOICE_AT;
}

/** サーバー側の初期レンダリングに使うテーマ（自由選択期間中はクライアント側で上書きされうる） */
export function getServerTheme(now: Date = new Date()): ThemeName {
  if (MANUAL_OVERRIDE) return MANUAL_OVERRIDE;
  return getScheduledTheme(now);
}

const THEME_MESSAGES: Record<"guam" | "korea", { greeting: string; signoff: string }> = {
  guam: { greeting: "🌺 ハファデイ！", signoff: "🌴 Si Yu'os Ma'åse'" },
  korea: { greeting: "🇰🇷 アンニョンハセヨ！", signoff: "🐯 감사합니다" },
};

// LINEへの送信テキストに、送信時点でスケジュールされているテーマの挨拶を添える。
// 個々のユーザーがUIで選んだ表示テーマとは独立（グループ全員に届く文面は一つに統一する必要があるため）。
export function themeLineMessage(text: string, now: Date = new Date()): string {
  const theme = getScheduledTheme(now);
  const { greeting, signoff } = THEME_MESSAGES[theme];
  return `${greeting}\n\n${text}\n\n${signoff}`;
}
