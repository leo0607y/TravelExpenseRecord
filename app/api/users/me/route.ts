import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const supabase = createAdminClient();

  // ユーザーが参加している全レコードを取得（join なし）
  const { data: userRecords, error: e1 } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  if (!userRecords || userRecords.length === 0) {
    return NextResponse.json({ groups: [] });
  }

  const groupIds = userRecords.map((u) => u.group_id);

  // グループ情報・アクティブトリップ・メンバーを別途取得
  const [{ data: groupList }, { data: trips }, { data: allMembers }] = await Promise.all([
    supabase.from("groups").select("*").in("group_id", groupIds),
    supabase.from("trips").select("*").in("group_id", groupIds).eq("status", "active"),
    supabase.from("users").select("*").in("group_id", groupIds),
  ]);

  const groups = userRecords.map((u) => ({
    user: u,
    group: (groupList ?? []).find((g) => g.group_id === u.group_id) ?? null,
    trip: (trips ?? []).find((t) => t.group_id === u.group_id) ?? null,
    members: (allMembers ?? []).filter((m) => m.group_id === u.group_id),
  }));

  return NextResponse.json({ groups });
}
