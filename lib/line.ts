const LINE_API = "https://api.line.me/v2/bot/message";

function token() {
  return process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
}

export interface LineMention {
  userId: string;
  displayName: string;
}

/**
 * LINEグループ or ユーザーにプッシュ送信。
 * mention を渡すとテキスト先頭に <m userId="..."> タグを埋め込みメンションとして送信する。
 * メンションはグループ送信時のみ有効（個人宛では省略してよい）。
 */
export async function sendLinePush(to: string, text: string, mention?: LineMention): Promise<void> {
  if (!token() || !to) return;

  const message: Record<string, unknown> = { type: "text", text };

  if (mention) {
    // <m userId="..."> タグをテキストに埋め込むことでLINEがメンションとして解釈する
    message.text = `<m userId="${mention.userId}">\n${text}`;
  }

  try {
    const res = await fetch(`${LINE_API}/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ to, messages: [message] }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[LINE push error] status=${res.status} body=${body}`);
    }
  } catch (err) {
    console.error("[LINE push failed]", err);
  }
}

/** WebhookのreplyToken使って返信 */
export async function replyLine(replyToken: string, text: string): Promise<void> {
  if (!token()) return;
  await fetch(`${LINE_API}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  }).catch((err) => {
    console.error("[LINE reply failed]", err);
  });
}
