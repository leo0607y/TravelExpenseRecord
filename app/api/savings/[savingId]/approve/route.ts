import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const { requesterId } = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  // 承認権限チェック
  if (requesterId) {
    const { data: saving } = await supabase.from("savings").select("trip_id").eq("saving_id", savingId).maybeSingle();
    if (saving) {
      const { data: trip } = await supabase.from("trips").select("group_id").eq("trip_id", saving.trip_id).maybeSingle();
      if (trip) {
        const { data: group } = await supabase.from("groups").select("approver_id").eq("group_id", trip.group_id).maybeSingle();
        if (group?.approver_id && requesterId !== group.approver_id) {
          const { data: user } = await supabase.from("users").select("role").eq("user_id", requesterId).eq("group_id", trip.group_id).maybeSingle();
          if (user?.role !== "admin") {
            return NextResponse.json({ error: "承認権限がありません" }, { status: 403 });
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("savings")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("saving_id", savingId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
