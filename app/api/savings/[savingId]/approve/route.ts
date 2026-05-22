import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** POST /api/savings/:savingId/approve — 管理者が積立を承認する */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("savings")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("saving_id", savingId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
