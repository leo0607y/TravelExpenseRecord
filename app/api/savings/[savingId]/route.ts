import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** DELETE /api/savings/{savingId} — 積立申請を棄却する（入金管理者またはadmin） */
export async function DELETE(
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
  if (saving.status !== "pending") return NextResponse.json({ error: "確認待ちの申請のみ棄却できます" }, { status: 400 });

  const { data: trip } = await supabase
    .from("trips")
    .select("group_id")
    .eq("trip_id", saving.trip_id)
    .maybeSingle();

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const { data: group } = await supabase
    .from("groups")
    .select("approver_id")
    .eq("group_id", trip.group_id)
    .maybeSingle();

  const { data: requester } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", requesterId)
    .eq("group_id", trip.group_id)
    .maybeSingle();

  const isApprover = group?.approver_id === requesterId;
  const isAdmin = requester?.role === "admin";
  if (!isApprover && !isAdmin) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const { error } = await supabase.from("savings").delete().eq("saving_id", savingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** PATCH /api/savings/{savingId} — 自分の積立タイトルを更新する */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const { title, requesterId } = await req.json();
  const supabase = createAdminClient();

  const { data: saving } = await supabase
    .from("savings")
    .select("user_id")
    .eq("saving_id", savingId)
    .maybeSingle();

  if (!saving) return NextResponse.json({ error: "積立が見つかりません" }, { status: 404 });
  if (saving.user_id !== requesterId) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const { data, error } = await supabase
    .from("savings")
    .update({ title: title?.trim() || null })
    .eq("saving_id", savingId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
