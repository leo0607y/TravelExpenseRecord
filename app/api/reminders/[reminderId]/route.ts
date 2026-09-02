import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** DELETE /api/reminders/{reminderId} — 送信前のリマインダーを取り消す（本人または管理者のみ） */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reminderId: string }> }
) {
  const { reminderId } = await params;
  const { requesterId } = await req.json().catch(() => ({}));

  const supabase = createAdminClient();

  const { data: reminder } = await supabase
    .from("reminders")
    .select("created_by, group_id, sent_at")
    .eq("reminder_id", reminderId)
    .maybeSingle();

  if (!reminder) return NextResponse.json({ error: "リマインダーが見つかりません" }, { status: 404 });
  if (reminder.sent_at) return NextResponse.json({ error: "送信済みのリマインダーは取り消せません" }, { status: 400 });

  if (reminder.created_by !== requesterId) {
    const { data: requester } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", requesterId)
      .eq("group_id", reminder.group_id)
      .maybeSingle();

    if (requester?.role !== "admin") {
      return NextResponse.json({ error: "作成者または管理者のみ取り消せます" }, { status: 403 });
    }
  }

  await supabase.from("reminders").delete().eq("reminder_id", reminderId);

  return NextResponse.json({ ok: true });
}
