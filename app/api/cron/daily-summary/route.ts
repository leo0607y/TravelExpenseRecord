import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/**
 * GET /api/cron/daily-summary
 * Vercel Cronから毎晩22:00 JST（13:00 UTC）に呼び出される
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: trips } = await supabase.from("trips").select("*").eq("status", "active");

  for (const trip of trips ?? []) {
    const [{ data: todayExpensesRaw }, { data: approvedSavings }, { data: allExpensesRaw }, { data: members }, { data: group }] =
      await Promise.all([
        supabase.from("expenses").select("*").eq("trip_id", trip.trip_id).eq("paid_at", today),
        supabase.from("savings").select("amount").eq("trip_id", trip.trip_id).eq("status", "approved"),
        supabase.from("expenses").select("amount, payment_type").eq("trip_id", trip.trip_id),
        supabase.from("users").select("*").eq("group_id", trip.group_id),
        supabase.from("groups").select("line_group_id").eq("group_id", trip.group_id).maybeSingle(),
      ]);

    if (!todayExpensesRaw || todayExpensesRaw.length === 0) continue;

    const expenseIds = todayExpensesRaw.map((e) => e.expense_id);
    const { data: beneficiariesRaw } = await supabase
      .from("expense_beneficiaries")
      .select("*")
      .in("expense_id", expenseIds);

    const userMap = Object.fromEntries((members ?? []).map((u) => [u.user_id, u]));

    const todayExpenses = todayExpensesRaw.map((e) => ({
      ...e,
      payerName: userMap[e.payer_id]?.display_name ?? "?",
      beneficiaryNames: (beneficiariesRaw ?? [])
        .filter((b) => b.expense_id === e.expense_id)
        .map((b) => userMap[b.user_id]?.display_name ?? "?"),
    }));

    const poolBalance =
      trip.carry_over_in +
      (approvedSavings ?? []).reduce((s, r) => s + r.amount, 0) -
      (allExpensesRaw ?? []).filter((e) => e.payment_type === "card").reduce((s, e) => s + e.amount, 0);

    const totalToday = todayExpenses.reduce((s, e) => s + e.amount, 0);

    const expenseLines = todayExpenses
      .map((e) => {
        const bens = e.beneficiaryNames.join(", ");
        const imgMark = e.image_url ? " 📸" : "";
        const payType = e.payment_type === "card" ? "共通カード" : "現金立替";
        return `【${e.title}${imgMark}】\n  ¥${e.amount.toLocaleString()}（${e.payerName}・${payType} / 受益：${bens}）${e.memo ? `\n  メモ：「${e.memo}」` : ""}`;
      })
      .join("\n\n");

    const message = `📋 【Tabi-Pay 本日の支出まとめ】\n\n💸 本日の支出総額：¥${totalToday.toLocaleString()}\n\n${expenseLines}\n\n━━━━━━━━━━━━━━━━\n💳 口座プール残高：¥${poolBalance.toLocaleString()}\n━━━━━━━━━━━━━━━━\n今日も一日お疲れ様でした！`;

    if (group?.line_group_id) {
      // LINEグループに1通送信
      await sendLinePush(group.line_group_id, message);
    } else {
      // 未リンクの場合はメンバー全員に個別送信
      await Promise.all((members ?? []).map((m) => sendLinePush(m.user_id, message)));
    }
  }

  return NextResponse.json({ ok: true });
}
