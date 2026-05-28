import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** POST /api/trips/{tripId}/savings/unapprove-user — 特定メンバーの承認済み積立を一括でpendingに戻す（管理者のみ） */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const { requesterId, userId } = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("group_id")
    .eq("trip_id", tripId)
    .maybeSingle();

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const { data: requester } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", requesterId)
    .eq("group_id", trip.group_id)
    .maybeSingle();

  if (requester?.role !== "admin") return NextResponse.json({ error: "管理者のみ操作できます" }, { status: 403 });

  const { data, error } = await supabase
    .from("savings")
    .update({ status: "pending", approved_at: null })
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .eq("status", "approved")
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ updated: data?.length ?? 0 });
}
