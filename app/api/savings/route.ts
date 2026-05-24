import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/** POST /api/savings — 積立申請を登録する */
export async function POST(req: NextRequest) {
  const { trip_id, user_id, amount } = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("savings")
    .insert({ trip_id, user_id, amount, status: "pending" })
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
    const message = `💰 入金確認のお知らせ\n\n「${trip.title}」で${name}さんが¥${Number(amount).toLocaleString()}の積立を申請しました。\n\n入金担当者は確認後、アプリで承認をお願いします🙏`;

    if (group?.line_group_id) {
      // LINEグループに送信
      await sendLinePush(group.line_group_id, message);
    } else if (group?.approver_id) {
      // グループ未リンクの場合は担当者に個別送信
      await sendLinePush(group.approver_id, message);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
