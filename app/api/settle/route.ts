import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { loadTripSummary } from "@/lib/trip-data";
import { declareSettlement } from "@/lib/settle-actions";
import type { SettlementTransfer } from "@/types";

/** GET /api/settle?tripId=xxx — 精算サマリーを計算して返す（締め宣言済みなら送金状況も返す） */
export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId");
  if (!tripId) return NextResponse.json({ error: "tripId が必要です" }, { status: 400 });

  const supabase = createAdminClient();
  const loaded = await loadTripSummary(supabase, tripId);
  if (!loaded) return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });

  const { members, summary } = loaded;
  const nameOf = (userId: string) => members.find((m) => m.user_id === userId)?.display_name ?? "";

  const { data: existing } = await supabase
    .from("settlement_transfers")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  const transfers: SettlementTransfer[] | null = existing && existing.length > 0
    ? existing.map((t) => ({ ...t, from_name: nameOf(t.from_user_id), to_name: nameOf(t.to_user_id) }))
    : null;

  return NextResponse.json({ ...summary, transfers });
}

/** POST /api/settle — 旅行の締めを宣言する（送金不要ならその場で確定、必要ならBotに送金ルートを通知） */
export async function POST(req: NextRequest) {
  const { tripId, nextTitle } = await req.json();
  if (!tripId) return NextResponse.json({ error: "tripId が必要です" }, { status: 400 });

  const supabase = createAdminClient();
  const result = await declareSettlement(supabase, tripId, nextTitle ?? null);

  switch (result.status) {
    case "not_found":
      return NextResponse.json({ error: "旅行が見つかりません" }, { status: 404 });
    case "already_settled":
      return NextResponse.json({ error: "この旅行は既に締められています" }, { status: 400 });
    case "already_declared":
      return NextResponse.json({ declared: true, transfers: result.transfers });
    case "declared":
      return NextResponse.json({ declared: true, transfers: result.transfers });
    case "finalized":
      return NextResponse.json({ finalized: true, summary: result.summary, newTrip: result.newTrip });
  }
}
