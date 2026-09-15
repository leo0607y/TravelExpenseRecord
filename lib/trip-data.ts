import type { SupabaseClient } from "@supabase/supabase-js";
import { calcTripSummary } from "@/lib/settlement";
import type { Expense, Saving, Trip, TripSummary, User } from "@/types";

/** 旅行の支出・積立・メンバーを取得し、精算サマリーを計算する（複数APIルートで共通利用） */
export async function loadTripSummary(
  supabase: SupabaseClient,
  tripId: string
): Promise<{ trip: Trip; members: User[]; summary: TripSummary } | null> {
  const { data: trip } = await supabase.from("trips").select("*").eq("trip_id", tripId).single();
  if (!trip) return null;

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

  return { trip: trip as Trip, members: (members as User[]) ?? [], summary };
}
