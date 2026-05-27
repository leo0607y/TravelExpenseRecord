import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const { requesterId } = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  // 承認権限チェック
  if (requesterId) {
    const { data: saving } = await supabase.from("savings").select("trip_id").eq("saving_id", savingId).maybeSingle();
    if (saving) {
      const { data: trip } = await supabase.from("trips").select("group_id").eq("trip_id", saving.trip_id).maybeSingle();
      if (trip) {
        const { data: group } = await supabase.from("groups").select("approver_id").eq("group_id", trip.group_id).maybeSingle();
        if (group?.approver_id && requesterId !== group.approver_id) {
          const { data: user } = await supabase.from("users").select("role").eq("user_id", requesterId).eq("group_id", trip.group_id).maybeSingle();
          if (user?.role !== "admin") {
            return NextResponse.json({ error: "承認権限がありません" }, { status: 403 });
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("savings")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("saving_id", savingId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 承認後にLINE通知を送信
  const saving = data;
  const { data: trip } = await supabase
    .from("trips")
    .select("title, group_id")
    .eq("trip_id", saving.trip_id)
    .maybeSingle();

  if (trip) {
    const [{ data: group }, { data: submitter }] = await Promise.all([
      supabase.from("groups").select("line_group_id").eq("group_id", trip.group_id).maybeSingle(),
      supabase.from("users").select("display_name").eq("user_id", saving.user_id).eq("group_id", trip.group_id).maybeSingle(),
    ]);

    const name = submitter?.display_name ?? "メンバー";
    const lines = [
      "✅ 入金が承認されました",
      "",
      `旅行：「${trip.title}」`,
      `申請者：${name}さん`,
      ...(saving.title ? [`件名：${saving.title}`] : []),
      `金額：¥${Number(saving.amount).toLocaleString()}`,
    ];
    const message = lines.join("\n");

    if (group?.line_group_id) {
      await sendLinePush(group.line_group_id, message);
    } else {
      // グループ未リンクの場合は申請者に個別通知
      await sendLinePush(saving.user_id, message);
    }
  }

  return NextResponse.json(data);
}
