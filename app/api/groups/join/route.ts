import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { userId, displayName, pictureUrl, inviteCode } = await req.json();
  if (!userId || !displayName || !inviteCode) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: group, error: e1 } = await supabase
    .from("groups")
    .select("*")
    .eq("invite_code", (inviteCode as string).toUpperCase().trim())
    .maybeSingle();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (!group) return NextResponse.json({ error: "招待コードが無効です" }, { status: 404 });

  const { error: e2 } = await supabase.from("users").upsert(
    { user_id: userId, display_name: displayName, picture_url: pictureUrl ?? null, group_id: group.group_id, role: "member" },
    { onConflict: "user_id" }
  );
  if (e2) return NextResponse.json({ error: `参加失敗: ${e2.message}` }, { status: 500 });

  const [{ data: members }, { data: trip }] = await Promise.all([
    supabase.from("users").select("*").eq("group_id", group.group_id),
    supabase.from("trips").select("*").eq("group_id", group.group_id).eq("status", "active").maybeSingle(),
  ]);

  return NextResponse.json({ group, members: members ?? [], trip });
}
