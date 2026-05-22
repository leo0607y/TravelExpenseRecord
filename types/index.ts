export type UserRole = "admin" | "member";
export type TripStatus = "active" | "settled";
export type PaymentType = "card" | "cash";
export type SavingStatus = "pending" | "approved";

export interface Group {
  group_id: string;
  created_at: string;
}

export interface User {
  user_id: string;
  display_name: string;
  picture_url: string | null;
  group_id: string;
  role: UserRole;
  created_at: string;
}

export interface Trip {
  trip_id: string;
  group_id: string;
  title: string;
  status: TripStatus;
  carry_over_in: number;
  created_at: string;
}

export interface Saving {
  saving_id: string;
  trip_id: string;
  user_id: string;
  amount: number;
  status: SavingStatus;
  created_at: string;
  approved_at: string | null;
  user?: User;
}

export interface Expense {
  expense_id: string;
  trip_id: string;
  payer_id: string;
  amount: number;
  payment_type: PaymentType;
  title: string;
  memo: string | null;
  image_url: string | null;
  paid_at: string;
  created_at: string;
  payer?: User;
  beneficiaries?: User[];
}

export interface ExpenseBeneficiary {
  expense_id: string;
  user_id: string;
}

// 精算計算用
export interface NetPosition {
  user_id: string;
  display_name: string;
  amount: number; // + 債権 / - 債務
}

export interface SettlementRoute {
  from_user_id: string;
  from_name: string;
  to_user_id: string;
  to_name: string;
  amount: number;
}

export interface TripSummary {
  pool_balance: number;       // B_pool
  total_expenses: number;     // TotalExpenses
  total_card: number;
  total_cash: number;
  benefit_per_user: Record<string, number>; // userId → Benefit_i
  net_positions: NetPosition[];
  settlement_routes: SettlementRoute[];
}

// LIFF Context
export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export interface LiffContext {
  type: string;
  groupId?: string;
}
