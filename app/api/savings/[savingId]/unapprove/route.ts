import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** POST /api/savings/{savingId}/unapprove — 承認済みを積立前（pending）に戻す（管理者のみ） */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const { requesterId } = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: saving } = await supabase
    .from("savings")
    .select("trip_id, status")
    .eq("saving_id", savingId)
    .maybeSingle();

  if (!saving) return NextResponse.json({ error: "積立が見つかりません" }, { status: 404 });
  if (saving.status !== "approved") return NextResponse.json({ error: "承認済みではありません" }, { status: 400 });

  const { data: trip } = await supabase
    .from("trips")
    .select("group_id")
    .eq("trip_id", saving.trip_id)
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
    .eq("saving_id", savingId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
