import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/** POST /api/savings — 積立申請を登録する（複数回可） */
export async function POST(req: NextRequest) {
  const { trip_id, user_id, amount, title } = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("savings")
    .insert({ trip_id, user_id, amount, title: title || null, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 入金担当者とグループに通知
  const { data: trip } = await supabase
    .from("trips")
    .select("title, group_id")
    .eq("trip_id", trip_id)
    .maybeSingle();

  if (trip) {
    const [{ data: group }, { data: submitter }] = await Promise.all([
      supabase.from("groups").select("approver_id, line_group_id").eq("group_id", trip.group_id).maybeSingle(),
      supabase.from("users").select("display_name").eq("user_id", user_id).eq("group_id", trip.group_id).maybeSingle(),
    ]);

    const name = submitter?.display_name ?? "メンバー";
    const titleLabel = title ? `「${title}」` : "";
    const message = `💰 入金確認のお知らせ\n\n「${trip.title}」で${name}さんが${titleLabel}¥${Number(amount).toLocaleString()}の積立を申請しました。\n\n入金担当者は確認後、アプリで承認をお願いします🙏`;

    if (group?.line_group_id) {
      // グループに送信。入金担当者がいればメンションする
      let approverMention: { userId: string; displayName: string } | undefined;
      if (group.approver_id) {
        const { data: approver } = await supabase
          .from("users")
          .select("display_name")
          .eq("user_id", group.approver_id)
          .maybeSingle();
        if (approver) {
          approverMention = { userId: group.approver_id, displayName: approver.display_name };
        }
      }
      await sendLinePush(group.line_group_id, message, approverMention);
    } else if (group?.approver_id) {
      // グループ未リンクの場合は担当者に個別送信（メンション不要）
      await sendLinePush(group.approver_id, message);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
