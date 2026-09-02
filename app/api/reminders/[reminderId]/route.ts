import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 300;

/** PATCH /api/reminders/{reminderId} — 送信前のリマインダーの日時・本文を編集する（本人または管理者のみ） */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reminderId: string }> }
) {
  const { reminderId } = await params;
  const { requesterId, message, send_at } = await req.json().catch(() => ({}));

  const supabase = createAdminClient();

  const { data: reminder } = await supabase
    .from("reminders")
    .select("created_by, group_id, sent_at")
    .eq("reminder_id", reminderId)
    .maybeSingle();

  if (!reminder) return NextResponse.json({ error: "リマインダーが見つかりません" }, { status: 404 });
  if (reminder.sent_at) return NextResponse.json({ error: "送信済みのリマインダーは編集できません" }, { status: 400 });

  if (reminder.created_by !== requesterId) {
    const { data: requester } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", requesterId)
      .eq("group_id", reminder.group_id)
      .maybeSingle();

    if (requester?.role !== "admin") {
      return NextResponse.json({ error: "作成者または管理者のみ編集できます" }, { status: 403 });
    }
  }

  const update: Record<string, unknown> = {};

  if (message !== undefined) {
    if (!String(message).trim()) return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
    if (String(message).length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください` }, { status: 400 });
    }
    update.message = String(message).trim();
  }

  if (send_at !== undefined) {
    const sendAtDate = new Date(send_at);
    if (!send_at || Number.isNaN(sendAtDate.getTime())) {
      return NextResponse.json({ error: "送信日時が不正です" }, { status: 400 });
    }
    update.send_at = sendAtDate.toISOString();
  }

  const { data, error } = await supabase
    .from("reminders")
    .update(update)
    .eq("reminder_id", reminderId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

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
