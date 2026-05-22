import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** GET /api/trips/:tripId — 旅行の全データ取得 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = createAdminClient();

  const [{ data: trip }, { data: savings }, { data: expenses }] =
    await Promise.all([
      supabase.from("trips").select("*").eq("trip_id", tripId).single(),
      supabase
        .from("savings")
        .select("*, user:users(*)")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false }),
      supabase
        .from("expenses")
        .select("*, payer:users!payer_id(*), beneficiaries:expense_beneficiaries(user:users(*))")
        .eq("trip_id", tripId)
        .order("paid_at", { ascending: false }),
    ]);

  // beneficiaries をフラット化
  const normalizedExpenses = (expenses ?? []).map((e) => ({
    ...e,
    beneficiaries: (e.beneficiaries as { user: unknown }[]).map((b) => b.user),
  }));

  return NextResponse.json({ trip, savings, expenses: normalizedExpenses });
}

/** PATCH /api/trips/:tripId — タイトル更新 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("trips")
    .update({ title: body.title })
    .eq("trip_id", tripId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
