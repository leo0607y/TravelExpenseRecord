import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const supabase = createAdminClient();

  // ユーザーが参加している全グループを取得
  const { data: userRecords, error } = await supabase
    .from("users")
    .select("*, group:groups(*)")
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!userRecords || userRecords.length === 0) {
    return NextResponse.json({ groups: [] });
  }

  const groupIds = userRecords.map((u) => u.group_id);

  // 各グループのアクティブトリップとメンバーを取得
  const [{ data: trips }, { data: allMembers }] = await Promise.all([
    supabase.from("trips").select("*").in("group_id", groupIds).eq("status", "active"),
    supabase.from("users").select("*").in("group_id", groupIds),
  ]);

  const groups = userRecords.map((u) => ({
    user: u,
    group: u.group,
    trip: (trips ?? []).find((t) => t.group_id === u.group_id) ?? null,
    members: (allMembers ?? []).filter((m) => m.group_id === u.group_id),
  }));

  return NextResponse.json({ groups });
}
