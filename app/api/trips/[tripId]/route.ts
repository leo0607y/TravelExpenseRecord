import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** GET /api/trips/:tripId — 旅行の全データ取得 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = createAdminClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("trip_id", tripId)
    .single();

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const [{ data: savingsRaw }, { data: expensesRaw }, { data: users }] = await Promise.all([
    supabase.from("savings").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").eq("trip_id", tripId).order("paid_at", { ascending: false }),
    supabase.from("users").select("*").eq("group_id", trip.group_id),
  ]);

  const expenseIds = (expensesRaw ?? []).map((e) => e.expense_id);
  const { data: beneficiariesRaw } = expenseIds.length > 0
    ? await supabase.from("expense_beneficiaries").select("*").in("expense_id", expenseIds)
    : { data: [] as { expense_id: string; user_id: string }[] };

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.user_id, u]));

  const savings = (savingsRaw ?? []).map((s) => ({
    ...s,
    user: userMap[s.user_id] ?? null,
  }));

  const expenses = (expensesRaw ?? []).map((e) => ({
    ...e,
    payer: userMap[e.payer_id] ?? null,
    beneficiaries: (beneficiariesRaw ?? [])
      .filter((b) => b.expense_id === e.expense_id)
      .map((b) => userMap[b.user_id] ?? null)
      .filter(Boolean),
  }));

  return NextResponse.json({ trip, savings, expenses });
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
