import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { calcTripSummary } from "@/lib/settlement";
import type { Expense, Saving, User } from "@/types";

export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId");
  if (!tripId) return NextResponse.json({ error: "tripId が必要です" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: trip } = await supabase.from("trips").select("*").eq("trip_id", tripId).single();
  if (!trip) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const [{ data: savingsRaw }, { data: expensesRaw }, { data: members }] = await Promise.all([
    supabase.from("savings").select("*").eq("trip_id", tripId),
    supabase.from("expenses").select("*").eq("trip_id", tripId).order("paid_at", { ascending: true }),
    supabase.from("users").select("*").eq("group_id", trip.group_id),
  ]);

  const expenseIds = (expensesRaw ?? []).map((e) => e.expense_id);
  const { data: beneficiariesRaw } = expenseIds.length > 0
    ? await supabase.from("expense_beneficiaries").select("*").in("expense_id", expenseIds)
    : { data: [] as { expense_id: string; user_id: string }[] };

  const userMap = Object.fromEntries((members ?? []).map((u: User) => [u.user_id, u]));

  const expenses: Expense[] = (expensesRaw ?? []).map((e) => ({
    ...e,
    payer: userMap[e.payer_id] ?? null,
    beneficiaries: (beneficiariesRaw ?? [])
      .filter((b) => b.expense_id === e.expense_id)
      .map((b) => userMap[b.user_id] ?? null)
      .filter(Boolean),
  }));

  const savings: Saving[] = (savingsRaw ?? []).map((s) => ({
    ...s,
    user: userMap[s.user_id] ?? null,
  }));

  const approvedSavings = savings.filter((s) => s.status === "approved");

  const summary = calcTripSummary(
    trip.carry_over_in,
    (members as User[]) ?? [],
    savings,
    expenses
  );

  const fmtYen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;
  const fmtDate = (s: string) => s.slice(0, 10);

  const savingsRows = ((members as User[]) ?? []).map((m) => {
    const s = approvedSavings.find((sv) => sv.user_id === m.user_id);
    return `<tr>
      <td>${m.display_name}</td>
      <td class="num">${s ? fmtYen(s.amount) : "—"}</td>
      <td class="center">${s ? "✅ 承認済" : "未積立"}</td>
    </tr>`;
  }).join("");

  const totalApproved = approvedSavings.reduce((s, r) => s + r.amount, 0);

  const expenseRows = expenses.map((e) => {
    const bens = ((e.beneficiaries ?? []) as User[]).map((b) => b.display_name).join("・");
    const payerName = (e.payer as User | null)?.display_name ?? "";
    const imgTag = e.image_url
      ? `<div class="receipt-img"><img src="${e.image_url}" alt="レシート" /></div>`
      : "";
    return `<div class="expense-card">
      <div class="expense-header">
        <div>
          <div class="expense-title">${e.title}</div>
          <div class="expense-meta">${fmtDate(e.paid_at)} ／ ${payerName} ／ ${e.payment_type === "card" ? "💳 カード" : "💴 現金"}</div>
          <div class="expense-meta">受益者：${bens}</div>
          ${e.memo ? `<div class="expense-memo">📝 ${e.memo}</div>` : ""}
        </div>
        <div class="expense-amount">${fmtYen(e.amount)}</div>
      </div>
      ${imgTag}
    </div>`;
  }).join("");

  const routeRows = summary.settlement_routes.length === 0
    ? `<p class="no-transfer">送金不要！全員釣り合っています</p>`
    : summary.settlement_routes.map((r) =>
        `<div class="route-row"><span class="from">${r.from_name}</span><span class="arrow">→</span><span class="to">${r.to_name}</span><span class="route-amount">${fmtYen(r.amount)}</span></div>`
      ).join("");

  const shortfall = summary.pool_balance < 0
    ? `<div class="shortfall">⚠️ 積立不足：追加で ${fmtYen(Math.abs(summary.pool_balance))} の振込が必要です（1人当たり目安 ${fmtYen(Math.abs(summary.pool_balance) / Math.max(1, (members ?? []).length))}）</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${trip.title} 精算レポート</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; color: #1a1a1a; background: #f5f5f5; padding: 16px; }
  .page { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
  .page-header { background: #2ecc71; color: #fff; padding: 24px; }
  .page-header h1 { font-size: 22px; font-weight: 800; }
  .page-header .sub { font-size: 13px; opacity: .8; margin-top: 4px; }
  .section { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
  .section-title { font-size: 13px; color: #888; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .5px; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .summary-cell { background: #f9f9f9; border-radius: 10px; padding: 12px; text-align: center; }
  .summary-cell .label { font-size: 11px; color: #888; }
  .summary-cell .value { font-size: 20px; font-weight: 800; color: #1a1a1a; margin-top: 2px; }
  .summary-cell.green .value { color: #2ecc71; }
  .summary-cell.red .value { color: #e74c3c; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { background: #f5f5f5; padding: 8px 10px; text-align: left; font-size: 12px; color: #666; font-weight: 600; }
  td { padding: 8px 10px; border-bottom: 1px solid #f5f5f5; }
  td.num { text-align: right; font-weight: 700; }
  td.center { text-align: center; }
  .expense-card { border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
  .expense-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 14px; gap: 8px; }
  .expense-title { font-size: 15px; font-weight: 700; }
  .expense-meta { font-size: 12px; color: #888; margin-top: 3px; }
  .expense-memo { font-size: 12px; color: #555; margin-top: 4px; background: #f9f9f9; padding: 4px 8px; border-radius: 6px; }
  .expense-amount { font-size: 18px; font-weight: 800; color: #1a1a1a; white-space: nowrap; }
  .receipt-img img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
  .route-row { display: flex; align-items: center; gap: 10px; background: #fff8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; }
  .from, .to { font-weight: 700; font-size: 14px; }
  .arrow { color: #e67e22; font-size: 16px; }
  .route-amount { margin-left: auto; font-weight: 800; font-size: 16px; color: #e67e22; }
  .no-transfer { color: #888; font-size: 14px; text-align: center; padding: 12px 0; }
  .shortfall { background: #fff0f0; border: 1px solid #ffc0c0; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #c0392b; font-weight: 600; margin-bottom: 12px; }
  .print-btn { display: block; width: 100%; padding: 14px; background: #2ecc71; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; margin: 16px 0; }
  @media print {
    body { background: #fff; padding: 0; }
    .page { border-radius: 0; }
    .no-print { display: none !important; }
    .expense-card { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="page-header">
    <h1>🏖️ ${trip.title}</h1>
    <div class="sub">精算レポート</div>
  </div>

  <div class="section no-print">
    <button class="print-btn" onclick="window.print()">📄 PDFとして保存（印刷）</button>
  </div>

  <!-- 総支出サマリー -->
  <div class="section">
    <div class="section-title">総支出サマリー</div>
    <div class="summary-grid">
      <div class="summary-cell">
        <div class="label">総支出</div>
        <div class="value">${fmtYen(summary.total_expenses)}</div>
      </div>
      <div class="summary-cell">
        <div class="label">💳 カード</div>
        <div class="value">${fmtYen(summary.total_card)}</div>
      </div>
      <div class="summary-cell">
        <div class="label">💴 現金</div>
        <div class="value">${fmtYen(summary.total_cash)}</div>
      </div>
    </div>
    <div class="summary-grid" style="margin-top:10px">
      <div class="summary-cell">
        <div class="label">繰越金</div>
        <div class="value">${fmtYen(trip.carry_over_in)}</div>
      </div>
      <div class="summary-cell">
        <div class="label">積立合計</div>
        <div class="value">${fmtYen(totalApproved)}</div>
      </div>
      <div class="summary-cell ${summary.pool_balance < 0 ? "red" : "green"}">
        <div class="label">プール残高</div>
        <div class="value">${fmtYen(summary.pool_balance)}</div>
      </div>
    </div>
    ${shortfall}
  </div>

  <!-- 積み立て状況 -->
  <div class="section">
    <div class="section-title">積み立て状況</div>
    <table>
      <thead><tr><th>名前</th><th>積立額</th><th>状態</th></tr></thead>
      <tbody>${savingsRows}</tbody>
    </table>
  </div>

  <!-- 支出一覧 -->
  <div class="section">
    <div class="section-title">支出一覧（${expenses.length}件）</div>
    ${expenseRows}
  </div>

  <!-- 送金ナビゲーション -->
  <div class="section">
    <div class="section-title">送金ナビゲーション</div>
    ${routeRows}
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
