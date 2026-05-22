import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/init-group
 * LINEグループIDとプロフィールを受け取り、グループ・ユーザー・旅行を初期化する
 */
export async function POST(req: NextRequest) {
  const { groupId, userId, displayName, pictureUrl, role } = await req.json();

  const allowedGroupId = process.env.ALLOWED_LINE_GROUP_ID;
  if (allowedGroupId && groupId !== allowedGroupId) {
    return NextResponse.json({ error: "このグループは許可されていません" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // グループを upsert
  await supabase.from("groups").upsert({ group_id: groupId }, { onConflict: "group_id" });

  // ユーザーを upsert
  await supabase.from("users").upsert(
    { user_id: userId, display_name: displayName, picture_url: pictureUrl ?? null, group_id: groupId, role: role ?? "member" },
    { onConflict: "user_id" }
  );

  // アクティブな旅行がなければ最初の旅行を作成
  const { data: activeTrip } = await supabase
    .from("trips")
    .select("trip_id")
    .eq("group_id", groupId)
    .eq("status", "active")
    .single();

  if (!activeTrip) {
    await supabase.from("trips").insert({
      group_id: groupId,
      title: "最初の旅行",
      status: "active",
      carry_over_in: 0,
    });
  }

  // グループのメンバー一覧と現在の旅行を返す
  const { data: members } = await supabase
    .from("users")
    .select("*")
    .eq("group_id", groupId);

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "active")
    .single();

  return NextResponse.json({ members, trip });
}
