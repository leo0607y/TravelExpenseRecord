import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { calcTripSummary } from "@/lib/settlement";
import type { Expense, Saving, User } from "@/types";

/** GET /api/settle?tripId=xxx — 精算サマリーを計算して返す */
export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId");
  if (!tripId) return NextResponse.json({ error: "tripId が必要です" }, { status: 400 });

  const supabase = createAdminClient();

  const [{ data: trip }, { data: savings }, { data: expenses }, { data: members }] =
    await Promise.all([
      supabase.from("trips").select("*").eq("trip_id", tripId).single(),
      supabase.from("savings").select("*").eq("trip_id", tripId),
      supabase
        .from("expenses")
        .select("*, beneficiaries:expense_beneficiaries(user:users(*))")
        .eq("trip_id", tripId),
      supabase.from("users").select("*").eq("group_id", "").then(async () => {
        const { data: t } = await supabase.from("trips").select("group_id").eq("trip_id", tripId).single();
        return supabase.from("users").select("*").eq("group_id", t?.group_id ?? "");
      }),
    ]);

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const normalizedExpenses: Expense[] = (expenses ?? []).map((e) => ({
    ...e,
    beneficiaries: (e.beneficiaries as { user: User }[]).map((b) => b.user),
  }));

  const summary = calcTripSummary(
    trip.carry_over_in,
    (members as User[]) ?? [],
    (savings as Saving[]) ?? [],
    normalizedExpenses
  );

  return NextResponse.json(summary);
}

/** POST /api/settle — 旅行を締めて次のプロジェクトを作成する */
export async function POST(req: NextRequest) {
  const { tripId, nextTitle } = await req.json();
  const supabase = createAdminClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*, savings(*), expenses(*)")
    .eq("trip_id", tripId)
    .single();

  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  // メンバー取得
  const { data: members } = await supabase.from("users").select("*").eq("group_id", trip.group_id);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, beneficiaries:expense_beneficiaries(user:users(*))")
    .eq("trip_id", tripId);

  const normalizedExpenses: Expense[] = (expenses ?? []).map((e) => ({
    ...e,
    beneficiaries: (e.beneficiaries as { user: User }[]).map((b) => b.user),
  }));

  const summary = calcTripSummary(
    trip.carry_over_in,
    (members as User[]) ?? [],
    (trip.savings as Saving[]) ?? [],
    normalizedExpenses
  );

  // 現在の旅行を settled に
  await supabase.from("trips").update({ status: "settled" }).eq("trip_id", tripId);

  // 次の旅行を作成（繰越金 = B_pool）
  const { data: newTrip } = await supabase
    .from("trips")
    .insert({
      group_id: trip.group_id,
      title: nextTitle ?? "次の旅行",
      status: "active",
      carry_over_in: Math.max(0, Math.round(summary.pool_balance)),
    })
    .select()
    .single();

  return NextResponse.json({ summary, newTrip });
}
