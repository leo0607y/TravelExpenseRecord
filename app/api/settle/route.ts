import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { calcTripSummary } from "@/lib/settlement";
import { sendLinePush } from "@/lib/line";
import type { Expense, Saving, User, TripSummary } from "@/types";

/** GET /api/settle?tripId=xxx — 精算サマリーを計算して返す */
export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId");
  if (!tripId) return NextResponse.json({ error: "tripId が必要です" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: trip } = await supabase.from("trips").select("*").eq("trip_id", tripId).single();
  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const [{ data: savingsRaw }, { data: expensesRaw }, { data: members }] = await Promise.all([
    supabase.from("savings").select("*").eq("trip_id", tripId),
    supabase.from("expenses").select("*").eq("trip_id", tripId),
    supabase.from("users").select("*").eq("group_id", trip.group_id),
  ]);

  const expenseIds = (expensesRaw ?? []).map((e) => e.expense_id);
  const { data: beneficiariesRaw } = expenseIds.length > 0
    ? await supabase.from("expense_beneficiaries").select("*").in("expense_id", expenseIds)
    : { data: [] as { expense_id: string; user_id: string }[] };

  const userMap = Object.fromEntries((members ?? []).map((u: User) => [u.user_id, u]));

  const expenses: Expense[] = (expensesRaw ?? []).map((e) => ({
    ...e,
    beneficiaries: (beneficiariesRaw ?? [])
      .filter((b) => b.expense_id === e.expense_id)
      .map((b) => userMap[b.user_id] ?? null)
      .filter(Boolean),
  }));

  const summary = calcTripSummary(
    trip.carry_over_in,
    (members as User[]) ?? [],
    (savingsRaw as Saving[]) ?? [],
    expenses
  );

  return NextResponse.json(summary);
}

/** POST /api/settle — 旅行を締めて次のプロジェクトを作成する */
export async function POST(req: NextRequest) {
  const { tripId, nextTitle } = await req.json();
  const supabase = createAdminClient();

  const { data: trip } = await supabase.from("trips").select("*").eq("trip_id", tripId).single();
  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const [{ data: savingsRaw }, { data: expensesRaw }, { data: members }] = await Promise.all([
    supabase.from("savings").select("*").eq("trip_id", tripId),
    supabase.from("expenses").select("*").eq("trip_id", tripId),
    supabase.from("users").select("*").eq("group_id", trip.group_id),
  ]);

  const expenseIds = (expensesRaw ?? []).map((e) => e.expense_id);
  const { data: beneficiariesRaw } = expenseIds.length > 0
    ? await supabase.from("expense_beneficiaries").select("*").in("expense_id", expenseIds)
    : { data: [] as { expense_id: string; user_id: string }[] };

  const userMap = Object.fromEntries((members ?? []).map((u: User) => [u.user_id, u]));

  const expenses: Expense[] = (expensesRaw ?? []).map((e) => ({
    ...e,
    beneficiaries: (beneficiariesRaw ?? [])
      .filter((b) => b.expense_id === e.expense_id)
      .map((b) => userMap[b.user_id] ?? null)
      .filter(Boolean),
  }));

  const summary = calcTripSummary(
    trip.carry_over_in,
    (members as User[]) ?? [],
    (savingsRaw as Saving[]) ?? [],
    expenses
  );

  await supabase.from("trips").update({ status: "settled" }).eq("trip_id", tripId);

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

  // LINE通知
  const { data: group } = await supabase
    .from("groups")
    .select("line_group_id")
    .eq("group_id", trip.group_id)
    .single();

  if (group?.line_group_id) {
    await sendSettlementNotification(group.line_group_id, trip.trip_id, trip.title, summary);
  }

  return NextResponse.json({ summary, newTrip });
}

async function sendSettlementNotification(
  lineGroupId: string,
  tripId: string,
  tripTitle: string,
  summary: TripSummary
) {
  const fmtYen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;

  const routeLines = summary.settlement_routes.length === 0
    ? "  送金不要！全員釣り合っています 🎉"
    : summary.settlement_routes.map((r) => `  ${r.from_name} → ${r.to_name}  ${fmtYen(r.amount)}`).join("\n");

  const summaryText = [
    `🏁「${tripTitle}」の精算が完了しました！`,
    "",
    `💰 総支出：${fmtYen(summary.total_expenses)}`,
    `  💳 共通カード ${fmtYen(summary.total_card)}`,
    `  💴 立替 ${fmtYen(summary.total_cash)}`,
    "",
    "💸 返金まとめ",
    routeLines,
  ].join("\n");

  await sendLinePush(lineGroupId, summaryText);

  const appUrl = process.env.APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (appUrl) {
    const reportUrl = `${appUrl}/api/report?tripId=${tripId}`;
    await sendLinePush(lineGroupId, `📄 精算レポート（PDF）\n${reportUrl}`);
  }
}
