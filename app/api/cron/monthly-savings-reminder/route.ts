import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/**
 * GET /api/cron/monthly-savings-reminder
 * Vercel Cronから毎月20日 9:00 JST（0:00 UTC）に呼び出される
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: trips } = await supabase.from("trips").select("*").eq("status", "active");

  for (const trip of trips ?? []) {
    const [{ data: members }, { data: group }] = await Promise.all([
      supabase.from("users").select("*").eq("group_id", trip.group_id),
      supabase.from("groups").select("line_group_id").eq("group_id", trip.group_id).maybeSingle(),
    ]);

    const message = `💰 今月の積み立てはいくらにしますか？\n\n旅行：「${trip.title}」\n\nアプリから積立金額を入力してください🙏`;

    if (group?.line_group_id) {
      await sendLinePush(group.line_group_id, message);
    } else {
      await Promise.all((members ?? []).map((m) => sendLinePush(m.user_id, message)));
    }
  }

  return NextResponse.json({ ok: true });
}
