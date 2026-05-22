import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/cron/daily-summary
 * Vercel Cronから毎晩22:00に呼び出される
 * 当日の支出をまとめてLINEグループに通知する
 */
export async function GET(req: NextRequest) {
  // Vercel Cronの認証
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // アクティブな全旅行を取得
  const { data: trips } = await supabase
    .from("trips")
    .select("*, group:groups(*)")
    .eq("status", "active");

  for (const trip of trips ?? []) {
    // 当日の支出を取得
    const { data: todayExpenses } = await supabase
      .from("expenses")
      .select("*, payer:users!payer_id(display_name), beneficiaries:expense_beneficiaries(user:users(display_name))")
      .eq("trip_id", trip.trip_id)
      .eq("paid_at", today);

    if (!todayExpenses || todayExpenses.length === 0) continue;

    // 今日の積立残高を計算
    const { data: savings } = await supabase
      .from("savings")
      .select("amount, status")
      .eq("trip_id", trip.trip_id)
      .eq("status", "approved");

    const { data: allExpenses } = await supabase
      .from("expenses")
      .select("amount, payment_type")
      .eq("trip_id", trip.trip_id);

    type PartialExpense = { amount: number; payment_type: string };
    const poolBalance =
      trip.carry_over_in +
      (savings ?? []).reduce((s, r) => s + r.amount, 0) -
      ((allExpenses ?? []) as PartialExpense[])
        .filter((e) => e.payment_type === "card")
        .reduce((s, e) => s + e.amount, 0);

    const totalToday = todayExpenses.reduce((s, e) => s + e.amount, 0);

    // メッセージ組み立て
    const expenseLines = todayExpenses
      .map((e) => {
        const payerName = (e.payer as { display_name: string })?.display_name ?? "?";
        const bens = (e.beneficiaries as { user: { display_name: string } }[])
          .map((b) => b.user.display_name)
          .join(", ");
        const hasImage = e.image_url ? " 📸" : "";
        return `【${e.title}${hasImage}】\n  金額：¥${e.amount.toLocaleString()}（支払：${payerName}・${e.payment_type === "card" ? "共通カード" : "現金立替"} / 受益：${bens}）${e.memo ? `\n  メモ：「${e.memo}」` : ""}`;
      })
      .join("\n\n");

    const message = `📋 【Tabi-Pay 本日の支出まとめ】\n\n本日は以下の支出が記録されました。\n💸 本日の支出総額：¥${totalToday.toLocaleString()}\n\n${expenseLines}\n\n━━━━━━━━━━━━━━━━\n💳 現在のリアルタイム口座残高：¥${poolBalance.toLocaleString()}\n━━━━━━━━━━━━━━━━\n今日も一日お疲れ様でした！詳細はアプリを開いて確認してね。`;

    // LINE Messaging API でグループに送信
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: trip.group_id,
        messages: [{ type: "text", text: message }],
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
