import type { SupabaseClient } from "@supabase/supabase-js";
import { sendLinePush } from "@/lib/line";
import { loadTripSummary } from "@/lib/trip-data";
import type { SettlementTransfer, Trip, TripSummary } from "@/types";

const fmtYen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;

async function getLineGroupId(supabase: SupabaseClient, groupId: string): Promise<string | null> {
  const { data } = await supabase.from("groups").select("line_group_id").eq("group_id", groupId).maybeSingle();
  return data?.line_group_id ?? null;
}

function reportUrl(tripId: string): string | null {
  const appUrl = process.env.APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  return appUrl ? `${appUrl}/api/report?tripId=${tripId}` : null;
}

/**
 * 旅行の締めを宣言する。
 * 送金が必要なければ即座に finalizeTrip を実行し、必要なら送金ルートを
 * settlement_transfers に確定保存して、Botで送金先を案内する。
 */
export async function declareSettlement(
  supabase: SupabaseClient,
  tripId: string,
  nextTitle: string | null
): Promise<
  | { status: "not_found" }
  | { status: "already_settled" }
  | { status: "already_declared"; transfers: SettlementTransfer[] }
  | { status: "finalized"; summary: TripSummary; newTrip: Trip }
  | { status: "declared"; transfers: SettlementTransfer[] }
> {
  const loaded = await loadTripSummary(supabase, tripId);
  if (!loaded) return { status: "not_found" };
  const { trip, members, summary } = loaded;
  const nameOf = (userId: string) => members.find((m) => m.user_id === userId)?.display_name ?? "";

  if (trip.status !== "active") return { status: "already_settled" };

  const { data: existing } = await supabase
    .from("settlement_transfers")
    .select("*")
    .eq("trip_id", tripId);

  if (existing && existing.length > 0) {
    const transfers = existing.map((t) => ({
      ...t,
      from_name: nameOf(t.from_user_id),
      to_name: nameOf(t.to_user_id),
    })) as SettlementTransfer[];
    return { status: "already_declared", transfers };
  }

  await supabase.from("trips").update({ next_trip_title: nextTitle ?? null }).eq("trip_id", tripId);

  if (summary.settlement_routes.length === 0) {
    return await finalizeTrip(supabase, tripId);
  }

  const { data: inserted, error } = await supabase
    .from("settlement_transfers")
    .insert(
      summary.settlement_routes.map((r) => ({
        trip_id: tripId,
        from_user_id: r.from_user_id,
        to_user_id: r.to_user_id,
        amount: r.amount,
      }))
    )
    .select();

  if (error || !inserted) throw new Error(error?.message ?? "送金ルートの保存に失敗しました");

  const transfers = inserted.map((t) => ({
    ...t,
    from_name: summary.settlement_routes.find((r) => r.from_user_id === t.from_user_id)?.from_name ?? "",
    to_name: summary.settlement_routes.find((r) => r.to_user_id === t.to_user_id)?.to_name ?? "",
  })) as SettlementTransfer[];

  const lineGroupId = await getLineGroupId(supabase, trip.group_id);
  if (lineGroupId) {
    const routeLines = transfers
      .map((t) => `  ${t.from_name} → ${t.to_name}  ${fmtYen(t.amount)}`)
      .join("\n");

    const text = [
      `🏁「${trip.title}」の精算が確定しました！`,
      "",
      `💰 総支出：${fmtYen(summary.total_expenses)}`,
      `  💳 共通カード ${fmtYen(summary.total_card)}`,
      `  💴 立替 ${fmtYen(summary.total_cash)}`,
      "",
      "💸 送金ナビゲーション",
      routeLines,
      "",
      "送金が終わった人はアプリの精算画面で「送信完了」を押してください。全員押し終わると自動で旅行が締まって次の旅行が始まります。",
    ].join("\n");

    await sendLinePush(lineGroupId, text);
  }

  return { status: "declared", transfers };
}

/** 指定の送金を完了にし、全員完了していれば自動的に旅行を締めて次の旅行を作る */
export async function completeTransfer(
  supabase: SupabaseClient,
  transferId: string
): Promise<
  | { status: "not_found" }
  | { status: "updated"; finalized: false }
  | { status: "updated"; finalized: true; summary: TripSummary; newTrip: Trip }
> {
  const { data: transfer } = await supabase
    .from("settlement_transfers")
    .select("*")
    .eq("transfer_id", transferId)
    .maybeSingle();
  if (!transfer) return { status: "not_found" };

  await supabase
    .from("settlement_transfers")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("transfer_id", transferId);

  const { data: remaining } = await supabase
    .from("settlement_transfers")
    .select("transfer_id")
    .eq("trip_id", transfer.trip_id)
    .eq("status", "pending");

  if (remaining && remaining.length > 0) {
    return { status: "updated", finalized: false };
  }

  const result = await finalizeTrip(supabase, transfer.trip_id);
  if (result.status !== "finalized") return { status: "updated", finalized: false };
  return { status: "updated", finalized: true, summary: result.summary, newTrip: result.newTrip };
}

/** 旅行を settled にし、プール残高を繰り越した次の旅行を作成、Botへ完了通知する */
export async function finalizeTrip(
  supabase: SupabaseClient,
  tripId: string
): Promise<{ status: "not_found" } | { status: "finalized"; summary: TripSummary; newTrip: Trip }> {
  const loaded = await loadTripSummary(supabase, tripId);
  if (!loaded) return { status: "not_found" };
  const { trip, summary } = loaded;

  await supabase.from("trips").update({ status: "settled" }).eq("trip_id", tripId);

  const { data: newTrip } = await supabase
    .from("trips")
    .insert({
      group_id: trip.group_id,
      title: trip.next_trip_title ?? "次の旅行",
      status: "active",
      carry_over_in: Math.max(0, Math.round(summary.pool_balance)),
    })
    .select()
    .single();

  const lineGroupId = await getLineGroupId(supabase, trip.group_id);
  if (lineGroupId) {
    const lines = [
      `🎉「${trip.title}」の送金がすべて完了し、精算が終わりました！`,
      "",
      `👛 繰越金 ${fmtYen(Math.max(0, summary.pool_balance))} は次の旅行「${newTrip.title}」に引き継がれました。`,
    ];
    await sendLinePush(lineGroupId, lines.join("\n"));

    const url = reportUrl(tripId);
    if (url) await sendLinePush(lineGroupId, `📄 精算レポート（PDF）\n${url}`);
  }

  return { status: "finalized", summary, newTrip: newTrip as Trip };
}
