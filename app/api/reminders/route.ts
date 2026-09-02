import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 300;

/** GET /api/reminders?tripId=xxx — 旅行のリマインダー一覧（送信待ち・送信済み）を返す */
export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId");
  if (!tripId) return NextResponse.json({ error: "tripId が必要です" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("trip_id", tripId)
    .order("send_at", { ascending: true });

  const creatorIds = [...new Set((reminders ?? []).map((r) => r.created_by))];
  const { data: users } = creatorIds.length > 0
    ? await supabase.from("users").select("user_id, display_name").in("user_id", creatorIds)
    : { data: [] as { user_id: string; display_name: string }[] };
  const userMap = Object.fromEntries((users ?? []).map((u) => [u.user_id, u]));

  const result = (reminders ?? []).map((r) => ({
    ...r,
    creator: userMap[r.created_by] ? { display_name: userMap[r.created_by].display_name } : undefined,
  }));

  return NextResponse.json(result);
}

/** POST /api/reminders — リマインダーを予約する */
export async function POST(req: NextRequest) {
  const { trip_id, group_id, created_by, message, send_at } = await req.json().catch(() => ({}));

  if (!trip_id || !group_id || !created_by) {
    return NextResponse.json({ error: "trip_id, group_id, created_by が必要です" }, { status: 400 });
  }
  if (!message || !String(message).trim()) {
    return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  }
  if (String(message).length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください` }, { status: 400 });
  }
  const sendAtDate = new Date(send_at);
  if (!send_at || Number.isNaN(sendAtDate.getTime())) {
    return NextResponse.json({ error: "送信日時が不正です" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reminders")
    .insert({
      trip_id,
      group_id,
      created_by,
      message: String(message).trim(),
      send_at: sendAtDate.toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data, { status: 201 });
}
