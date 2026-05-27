import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/** POST /api/savings/{savingId}/remind — 入金担当者が申請者に催促を送る */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const supabase = createAdminClient();

  // saving と申請者情報を取得
  const { data: saving } = await supabase
    .from("savings")
    .select("trip_id, user_id, amount, title, status")
    .eq("saving_id", savingId)
    .maybeSingle();

  if (!saving) return NextResponse.json({ error: "積立が見つかりません" }, { status: 404 });
  if (saving.status !== "pending") return NextResponse.json({ error: "既に承認済みです" }, { status: 400 });

  // trip → group を取得
  const { data: trip } = await supabase
    .from("trips")
    .select("title, group_id")
    .eq("trip_id", saving.trip_id)
    .maybeSingle();

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const [{ data: group }, { data: savingUser }] = await Promise.all([
    supabase.from("groups").select("line_group_id").eq("group_id", trip.group_id).maybeSingle(),
    supabase.from("users").select("display_name").eq("user_id", saving.user_id).maybeSingle(),
  ]);

  const titleLabel = saving.title ? `「${saving.title}」` : "";
  const message = `📣 積立のご確認をお願いします\n\n「${trip.title}」の積立${titleLabel}（¥${Number(saving.amount).toLocaleString()}）について、入金担当者より確認のご連絡です。\n\nまだ入金の確認が取れておりません。お振込み状況をご確認いただけますか？🙏`;

  if (group?.line_group_id) {
    // グループに送信。申請者をメンションする
    const mention = savingUser
      ? { userId: saving.user_id, displayName: savingUser.display_name }
      : undefined;
    await sendLinePush(group.line_group_id, message, mention);
  } else {
    // グループ未リンクの場合は申請者個人へ送信（メンション不要）
    await sendLinePush(saving.user_id, message);
  }

  return NextResponse.json({ ok: true });
}
