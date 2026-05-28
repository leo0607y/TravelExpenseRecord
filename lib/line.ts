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
 * mention を渡すとテキスト先頭に @displayName を置き mention.mentionees で紐付ける。
 * メンションはグループ送信時のみ有効（個人宛では省略してよい）。
 */
export async function sendLinePush(to: string, text: string, mention?: LineMention): Promise<void> {
  if (!token() || !to) return;

  const message: Record<string, unknown> = { type: "text", text };

  if (mention) {
    const tag = `@${mention.displayName}`;
    message.text = `${tag}\n${text}`;
    message.mention = {
      mentionees: [
        {
          index: 0,
          length: [...tag].length,
          type: "user",
          userId: mention.userId,
        },
      ],
    };
  }

  const payload = { to, messages: [message] };
  console.log("[LINE push]", JSON.stringify(payload));

  try {
    const res = await fetch(`${LINE_API}/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify(payload),
    });
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      console.error(`[LINE push error] status=${res.status} body=${body}`);
    } else {
      console.log(`[LINE push ok] status=${res.status} body=${body}`);
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
