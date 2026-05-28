import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/** POST /api/trips/{tripId}/savings/remind-user — 特定メンバーへ催促を送る */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const { requesterId, userId } = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("title, group_id")
    .eq("trip_id", tripId)
    .maybeSingle();

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const [{ data: group }, { data: targetUser }, { data: savings }] = await Promise.all([
    supabase.from("groups").select("line_group_id").eq("group_id", trip.group_id).maybeSingle(),
    supabase.from("users").select("display_name").eq("user_id", userId).maybeSingle(),
    supabase.from("savings").select("amount, title").eq("trip_id", tripId).eq("user_id", userId),
  ]);

  const name = targetUser?.display_name ?? "メンバー";
  const totalAmount = (savings ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const lines = [
    "📣 積立のご確認をお願いします",
    "",
    `旅行：「${trip.title}」`,
    `対象：${name}さん`,
    ...(totalAmount > 0 ? [`申請金額合計：¥${totalAmount.toLocaleString()}`] : []),
    "",
    "入金担当者より確認のご連絡です。お振込み状況をご確認いただけますか？🙏",
  ];
  const message = lines.join("\n");

  const mention = targetUser ? { userId, displayName: name } : undefined;

  if (group?.line_group_id) {
    await sendLinePush(group.line_group_id, message, mention);
  } else {
    await sendLinePush(userId, message);
  }

  return NextResponse.json({ ok: true });
}
