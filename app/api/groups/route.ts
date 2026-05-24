import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes).map((b) => chars[b % chars.length]).join("");
}

export async function POST(req: NextRequest) {
  const { userId, displayName, pictureUrl } = await req.json();
  if (!userId || !displayName) {
    return NextResponse.json({ error: "userId と displayName は必須です" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const groupId = crypto.randomUUID();
  const inviteCode = generateInviteCode();

  const { error: e1 } = await supabase.from("groups").insert({
    group_id: groupId,
    invite_code: inviteCode,
    created_by: userId,
    approver_id: userId,
  });
  if (e1) return NextResponse.json({ error: `グループ作成失敗: ${e1.message}` }, { status: 500 });

  const { error: e2 } = await supabase.from("users").insert(
    { user_id: userId, display_name: displayName, picture_url: pictureUrl ?? null, group_id: groupId, role: "admin" }
  );
  if (e2) return NextResponse.json({ error: `ユーザー作成失敗: ${e2.message}` }, { status: 500 });

  const { error: e3 } = await supabase.from("trips").insert({
    group_id: groupId,
    title: "最初の旅行",
    status: "active",
    carry_over_in: 0,
  });
  if (e3) return NextResponse.json({ error: `旅行作成失敗: ${e3.message}` }, { status: 500 });

  const [{ data: group }, { data: members }, { data: trip }] = await Promise.all([
    supabase.from("groups").select("*").eq("group_id", groupId).maybeSingle(),
    supabase.from("users").select("*").eq("group_id", groupId),
    supabase.from("trips").select("*").eq("group_id", groupId).eq("status", "active").maybeSingle(),
  ]);

  return NextResponse.json({ group, members: members ?? [], trip });
}
