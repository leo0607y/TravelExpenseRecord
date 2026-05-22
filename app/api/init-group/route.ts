import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { groupId, userId, displayName, pictureUrl, role } = await req.json();

  const allowedGroupId = process.env.ALLOWED_LINE_GROUP_ID;
  if (allowedGroupId && groupId !== allowedGroupId) {
    return NextResponse.json({ error: "このグループは許可されていません" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // groups
  const { error: e1 } = await supabase
    .from("groups")
    .upsert({ group_id: groupId }, { onConflict: "group_id" });
  if (e1) return NextResponse.json({ error: `groups upsert失敗: ${e1.message}` }, { status: 500 });

  // users
  const { error: e2 } = await supabase
    .from("users")
    .upsert(
      { user_id: userId, display_name: displayName, picture_url: pictureUrl ?? null, group_id: groupId, role: role ?? "member" },
      { onConflict: "user_id" }
    );
  if (e2) return NextResponse.json({ error: `users upsert失敗: ${e2.message}` }, { status: 500 });

  // アクティブな旅行を確認
  const { data: activeTrip, error: e3 } = await supabase
    .from("trips")
    .select("trip_id")
    .eq("group_id", groupId)
    .eq("status", "active")
    .maybeSingle();
  if (e3) return NextResponse.json({ error: `trips検索失敗: ${e3.message}` }, { status: 500 });

  // なければ作成
  if (!activeTrip) {
    const { error: e4 } = await supabase.from("trips").insert({
      group_id: groupId,
      title: "最初の旅行",
      status: "active",
      carry_over_in: 0,
    });
    if (e4) return NextResponse.json({ error: `trips insert失敗: ${e4.message}` }, { status: 500 });
  }

  // メンバーと旅行を返す
  const { data: members, error: e5 } = await supabase
    .from("users")
    .select("*")
    .eq("group_id", groupId);
  if (e5) return NextResponse.json({ error: `members取得失敗: ${e5.message}` }, { status: 500 });

  const { data: trip, error: e6 } = await supabase
    .from("trips")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "active")
    .maybeSingle();
  if (e6) return NextResponse.json({ error: `trip取得失敗: ${e6.message}` }, { status: 500 });

  return NextResponse.json({ members, trip });
}
