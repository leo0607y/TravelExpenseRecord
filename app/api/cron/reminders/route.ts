import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/**
 * GET /api/cron/reminders
 * 送信予定時刻を過ぎた未送信のリマインダーをLINEへ送る。
 * Upstash QStashから3分おきに呼び出される（無料枠1,000件/日に収まる頻度）
 * （.github/workflows/cron-jobs.ymlのschedule実行はバックアップ用）。
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: dueReminders } = await supabase
    .from("reminders")
    .select("*")
    .is("sent_at", null)
    .lte("send_at", now);

  if (!dueReminders || dueReminders.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const groupIds = [...new Set(dueReminders.map((r) => r.group_id))];
  const { data: groups } = await supabase
    .from("groups")
    .select("group_id, line_group_id")
    .in("group_id", groupIds);
  const groupMap = Object.fromEntries((groups ?? []).map((g) => [g.group_id, g]));

  let sent = 0;
  for (const reminder of dueReminders) {
    const group = groupMap[reminder.group_id];
    const message = reminder.message;

    if (group?.line_group_id) {
      await sendLinePush(group.line_group_id, message);
    } else {
      const { data: members } = await supabase
        .from("users")
        .select("user_id")
        .eq("group_id", reminder.group_id);
      await Promise.all((members ?? []).map((m) => sendLinePush(m.user_id, message)));
    }

    await supabase.from("reminders").update({ sent_at: new Date().toISOString() }).eq("reminder_id", reminder.reminder_id);
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
