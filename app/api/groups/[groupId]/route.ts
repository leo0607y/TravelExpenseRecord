import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** DELETE /api/groups/:groupId — グループを完全削除する（管理者のみ） */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const { requesterId } = await req.json();

  const supabase = createAdminClient();

  // 管理者チェック
  const { data: requester } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", requesterId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (requester?.role !== "admin") {
    return NextResponse.json({ error: "管理者のみ削除できます" }, { status: 403 });
  }

  // このグループのtrip_idを全取得
  const { data: trips } = await supabase
    .from("trips")
    .select("trip_id")
    .eq("group_id", groupId);

  const tripIds = (trips ?? []).map((t) => t.trip_id);

  if (tripIds.length > 0) {
    // expense_id を取得してからbeneficiariesを削除
    const { data: expenses } = await supabase
      .from("expenses")
      .select("expense_id")
      .in("trip_id", tripIds);

    const expenseIds = (expenses ?? []).map((e) => e.expense_id);

    if (expenseIds.length > 0) {
      await supabase.from("expense_beneficiaries").delete().in("expense_id", expenseIds);
    }

    await supabase.from("expenses").delete().in("trip_id", tripIds);
    await supabase.from("savings").delete().in("trip_id", tripIds);
    await supabase.from("trips").delete().in("trip_id", tripIds);
  }

  await supabase.from("users").delete().eq("group_id", groupId);
  await supabase.from("groups").delete().eq("group_id", groupId);

  return NextResponse.json({ ok: true });
}
