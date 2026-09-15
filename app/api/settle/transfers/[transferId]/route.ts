import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { completeTransfer } from "@/lib/settle-actions";

/** POST /api/settle/transfers/:transferId — 送金を「送信完了」にする。全員完了で自動的に旅行を締める */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  const { transferId } = await params;
  const { requesterId } = await req.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: transfer } = await supabase
    .from("settlement_transfers")
    .select("*")
    .eq("transfer_id", transferId)
    .maybeSingle();
  if (!transfer) return NextResponse.json({ error: "送金レコードが見つかりません" }, { status: 404 });
  if (transfer.status === "sent") return NextResponse.json({ error: "既に送信完了になっています" }, { status: 400 });

  // 送金元本人 or 管理者のみ完了にできる
  if (requesterId && requesterId !== transfer.from_user_id) {
    const { data: trip } = await supabase.from("trips").select("group_id").eq("trip_id", transfer.trip_id).maybeSingle();
    const { data: requester } = trip
      ? await supabase.from("users").select("role").eq("user_id", requesterId).eq("group_id", trip.group_id).maybeSingle()
      : { data: null };
    if (requester?.role !== "admin") {
      return NextResponse.json({ error: "この送金を完了にする権限がありません" }, { status: 403 });
    }
  }

  const result = await completeTransfer(supabase, transferId);
  if (result.status === "not_found") {
    return NextResponse.json({ error: "送金レコードが見つかりません" }, { status: 404 });
  }

  if (result.finalized) {
    return NextResponse.json({ finalized: true, summary: result.summary, newTrip: result.newTrip });
  }
  return NextResponse.json({ finalized: false });
}
