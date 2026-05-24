const LINE_API = "https://api.line.me/v2/bot/message";

function token() {
  return process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
}

/** LINEグループ or ユーザーにプッシュ送信 */
export async function sendLinePush(to: string, text: string): Promise<void> {
  if (!token() || !to) return;
  await fetch(`${LINE_API}/push`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  }).catch(() => {});
}

/** WebhookのreplyToken使って返信 */
export async function replyLine(replyToken: string, text: string): Promise<void> {
  if (!token()) return;
  await fetch(`${LINE_API}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  }).catch(() => {});
}
