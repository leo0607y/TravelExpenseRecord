import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { replyLine } from "@/lib/line";
import crypto from "crypto";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET ?? "";
  if (!secret) return true; // 開発中は検証スキップ
  const hash = crypto.createHmac("sha256", secret).update(body).digest("base64");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const supabase = createAdminClient();

  for (const event of body.events ?? []) {
    // Botがグループに追加されたとき
    if (event.type === "join" && event.source?.type === "group") {
      await replyLine(
        event.replyToken,
        "Tabi-Pay Botが参加しました！✈️\n\nこのグループをTabi-Payの旅行とリンクするには、アプリに表示されている6桁の招待コードをこのチャットに送信してください。"
      );
      continue;
    }

    // グループでのテキストメッセージ
    if (
      event.type === "message" &&
      event.message?.type === "text" &&
      event.source?.type === "group"
    ) {
      const lineGroupId: string = event.source.groupId;
      const text: string = event.message.text.trim().toUpperCase();

      // 6桁の招待コードっぽければリンク処理
      if (/^[A-Z0-9]{6}$/.test(text)) {
        const { data: group } = await supabase
          .from("groups")
          .select("group_id")
          .eq("invite_code", text)
          .maybeSingle();

        if (!group) {
          await replyLine(event.replyToken, "招待コードが見つかりませんでした。アプリを確認してください。");
          continue;
        }

        // 既にリンク済みかチェック
        const { data: existing } = await supabase
          .from("groups")
          .select("line_group_id")
          .eq("group_id", group.group_id)
          .maybeSingle();

        if (existing?.line_group_id === lineGroupId) {
          await replyLine(event.replyToken, "このグループは既にリンク済みです✅");
          continue;
        }

        // リンク保存
        await supabase
          .from("groups")
          .update({ line_group_id: lineGroupId })
          .eq("group_id", group.group_id);

        // アクティブな旅行名を取得してメッセージ
        const { data: trip } = await supabase
          .from("trips")
          .select("title")
          .eq("group_id", group.group_id)
          .eq("status", "active")
          .maybeSingle();

        const tripName = trip?.title ?? "旅行";
        await replyLine(
          event.replyToken,
          `✅ リンク完了！\n「${tripName}」とこのグループがつながりました。\n\n積立申請や日次まとめをここに送ります🎉`
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
