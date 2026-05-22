import type {
  Expense,
  Saving,
  User,
  NetPosition,
  SettlementRoute,
  TripSummary,
} from "@/types";

/**
 * 物理プール残高 B_pool を計算する
 * B_pool = C_init + Σ P_i - Σ(card) A_k
 */
export function calcPoolBalance(
  carryOverIn: number,
  savings: Saving[],
  expenses: Expense[]
): number {
  const approvedSavings = savings
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => sum + s.amount, 0);

  const cardExpenses = expenses
    .filter((e) => e.payment_type === "card")
    .reduce((sum, e) => sum + e.amount, 0);

  return carryOverIn + approvedSavings - cardExpenses;
}

/**
 * 旅行全体の集計サマリーを計算する（設計書 §3 の実装）
 */
export function calcTripSummary(
  carryOverIn: number,
  members: User[],
  savings: Saving[],
  expenses: Expense[]
): TripSummary {
  const memberCount = members.length;
  const poolBalance = calcPoolBalance(carryOverIn, savings, expenses);

  // 総支出
  const totalCard = expenses
    .filter((e) => e.payment_type === "card")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCash = expenses
    .filter((e) => e.payment_type === "cash")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalCard + totalCash;

  // 各自の OutPocket_i（現金立て替え合計）
  const outPocket: Record<string, number> = {};
  members.forEach((m) => (outPocket[m.user_id] = 0));
  expenses
    .filter((e) => e.payment_type === "cash")
    .forEach((e) => {
      outPocket[e.payer_id] = (outPocket[e.payer_id] ?? 0) + e.amount;
    });

  // 各自の積立合計（承認済み）
  const approvedSavings: Record<string, number> = {};
  members.forEach((m) => (approvedSavings[m.user_id] = 0));
  savings
    .filter((s) => s.status === "approved")
    .forEach((s) => {
      approvedSavings[s.user_id] = (approvedSavings[s.user_id] ?? 0) + s.amount;
    });

  // Contrib_i = P_i + OutPocket_i + C_init / |M|
  const contrib: Record<string, number> = {};
  members.forEach((m) => {
    contrib[m.user_id] =
      (approvedSavings[m.user_id] ?? 0) +
      (outPocket[m.user_id] ?? 0) +
      carryOverIn / memberCount;
  });

  // Benefit_i = Σ(i ∈ B_k) A_k / |B_k|
  const benefit: Record<string, number> = {};
  members.forEach((m) => (benefit[m.user_id] = 0));
  expenses.forEach((e) => {
    const bens = e.beneficiaries ?? [];
    if (bens.length === 0) return;
    const share = e.amount / bens.length;
    bens.forEach((b) => {
      benefit[b.user_id] = (benefit[b.user_id] ?? 0) + share;
    });
  });

  // Net_i = Contrib_i - Benefit_i - B_pool / |M|
  const netPositions: NetPosition[] = members.map((m) => ({
    user_id: m.user_id,
    display_name: m.display_name,
    amount:
      (contrib[m.user_id] ?? 0) -
      (benefit[m.user_id] ?? 0) -
      poolBalance / memberCount,
  }));

  const settlementRoutes = calcSettlementRoutes(netPositions);

  return {
    pool_balance: poolBalance,
    total_expenses: totalExpenses,
    total_card: totalCard,
    total_cash: totalCash,
    benefit_per_user: benefit,
    net_positions: netPositions,
    settlement_routes: settlementRoutes,
  };
}

/**
 * 債務最小化アルゴリズム（Greedy）で最適送金ルートを生成する（設計書 §3.4）
 */
export function calcSettlementRoutes(
  netPositions: NetPosition[]
): SettlementRoute[] {
  const routes: SettlementRoute[] = [];

  // 0.5円以下の誤差は無視
  const creditors = netPositions
    .filter((n) => n.amount > 0.5)
    .map((n) => ({ ...n }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = netPositions
    .filter((n) => n.amount < -0.5)
    .map((n) => ({ ...n }))
    .sort((a, b) => a.amount - b.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const transfer = Math.min(creditor.amount, Math.abs(debtor.amount));

    routes.push({
      from_user_id: debtor.user_id,
      from_name: debtor.display_name,
      to_user_id: creditor.user_id,
      to_name: creditor.display_name,
      amount: Math.round(transfer),
    });

    creditor.amount -= transfer;
    debtor.amount += transfer;

    if (Math.abs(creditor.amount) < 0.5) ci++;
    if (Math.abs(debtor.amount) < 0.5) di++;
  }

  return routes;
}
