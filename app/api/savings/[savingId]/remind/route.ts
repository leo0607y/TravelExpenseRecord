import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/** POST /api/savings/{savingId}/remind — 入金担当者が申請者に催促を送る */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const { requesterId } = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: saving } = await supabase
    .from("savings")
    .select("trip_id, user_id, amount, title")
    .eq("saving_id", savingId)
    .maybeSingle();

  if (!saving) return NextResponse.json({ error: "積立が見つかりません" }, { status: 404 });

  const { data: trip } = await supabase
    .from("trips")
    .select("title, group_id")
    .eq("trip_id", saving.trip_id)
    .maybeSingle();

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const [{ data: group }, { data: savingUser }, { data: approverUser }] = await Promise.all([
    supabase.from("groups").select("line_group_id").eq("group_id", trip.group_id).maybeSingle(),
    supabase.from("users").select("display_name").eq("user_id", saving.user_id).maybeSingle(),
    supabase.from("users").select("display_name").eq("user_id", requesterId).maybeSingle(),
  ]);

  const targetName = savingUser?.display_name ?? "メンバー";
  const approverName = approverUser?.display_name ?? "入金担当者";

  const message = [
    "📣 積立しなさい！！！",
    "",
    `旅行：「${trip.title}」`,
    "",
    "入金担当者より確認のご連絡です。今月分は入金しましたか？？？",
    `By ${approverName}`,
  ].join("\n");

  if (group?.line_group_id) {
    const mention = savingUser ? { userId: saving.user_id, displayName: targetName } : undefined;
    await sendLinePush(group.line_group_id, message, mention);
  } else {
    await sendLinePush(saving.user_id, message);
  }

  return NextResponse.json({ ok: true });
}
