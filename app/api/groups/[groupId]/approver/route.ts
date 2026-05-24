import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const { requesterId, approverId } = await req.json();

  const supabase = createAdminClient();

  const { data: requester } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", requesterId)
    .eq("group_id", groupId)
    .maybeSingle();
  if (requester?.role !== "admin") {
    return NextResponse.json({ error: "管理者のみ変更できます" }, { status: 403 });
  }

  const { error } = await supabase
    .from("groups")
    .update({ approver_id: approverId })
    .eq("group_id", groupId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
