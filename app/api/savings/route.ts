import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** POST /api/savings — 積立申請を登録する */
export async function POST(req: NextRequest) {
  const { trip_id, user_id, amount } = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("savings")
    .insert({ trip_id, user_id, amount, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
