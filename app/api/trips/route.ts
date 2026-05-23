import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** GET /api/trips?groupId=xxx — settled な旅行一覧を返す */
export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("groupId");
  if (!groupId) return NextResponse.json({ error: "groupId が必要です" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "settled")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(trips ?? []);
}
