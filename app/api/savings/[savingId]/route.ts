import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** PATCH /api/savings/{savingId} — 自分の積立タイトルを更新する */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ savingId: string }> }
) {
  const { savingId } = await params;
  const { title, requesterId } = await req.json();
  const supabase = createAdminClient();

  const { data: saving } = await supabase
    .from("savings")
    .select("user_id")
    .eq("saving_id", savingId)
    .maybeSingle();

  if (!saving) return NextResponse.json({ error: "積立が見つかりません" }, { status: 404 });
  if (saving.user_id !== requesterId) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const { data, error } = await supabase
    .from("savings")
    .update({ title: title?.trim() || null })
    .eq("saving_id", savingId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
