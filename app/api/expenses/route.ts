import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** POST /api/expenses — 支出を登録する */
export async function POST(req: NextRequest) {
  const { trip_id, payer_id, amount, payment_type, title, memo, image_url, paid_at, beneficiary_ids } =
    await req.json();

  if (!beneficiary_ids || beneficiary_ids.length === 0) {
    return NextResponse.json({ error: "受益者を1人以上選択してください" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({ trip_id, payer_id, amount, payment_type, title, memo: memo ?? null, image_url: image_url ?? null, paid_at })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 受益者を登録
  await supabase.from("expense_beneficiaries").insert(
    (beneficiary_ids as string[]).map((uid) => ({
      expense_id: expense.expense_id,
      user_id: uid,
    }))
  );

  return NextResponse.json(expense, { status: 201 });
}
