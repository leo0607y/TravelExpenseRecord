import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: user, error: e1 } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  if (!user?.group_id) return NextResponse.json({ user: null, group: null, members: [], trip: null });

  const [{ data: group }, { data: members }, { data: trip }] = await Promise.all([
    supabase.from("groups").select("*").eq("group_id", user.group_id).maybeSingle(),
    supabase.from("users").select("*").eq("group_id", user.group_id),
    supabase.from("trips").select("*").eq("group_id", user.group_id).eq("status", "active").maybeSingle(),
  ]);

  return NextResponse.json({ user, group, members: members ?? [], trip });
}
