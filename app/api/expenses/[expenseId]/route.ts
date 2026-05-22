import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** DELETE /api/expenses/:expenseId — 支出を削除する */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const { expenseId } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("expense_id", expenseId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
