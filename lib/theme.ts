// 現在表示するUIテーマ。ここを書き換えてデプロイすることで全ユーザーの表示が切り替わる。
// 旅行が終わったら "default" に戻すこと。
export const ACTIVE_THEME: "default" | "guam" = "guam";

const GUAM_GREETING = "🌺 ハファデイ！";
const GUAM_SIGNOFF = "🌴 Si Yu'os Ma'åse'";

// テーマがグアムの間、LINEへの送信テキストに南国の挨拶を添える
export function themeLineMessage(text: string): string {
  if (ACTIVE_THEME !== "guam") return text;
  return `${GUAM_GREETING}\n\n${text}\n\n${GUAM_SIGNOFF}`;
}
