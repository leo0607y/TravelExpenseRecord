import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLinePush } from "@/lib/line";

/** GET /api/savings?groupId=xxx — グループ全旅行の積立を旅行ごとにまとめて返す */
export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("groupId");
  if (!groupId) return NextResponse.json({ error: "groupId が必要です" }, { status: 400 });

  const supabase = createAdminClient();

  const [{ data: trips }, { data: users }] = await Promise.all([
    supabase.from("trips").select("trip_id, title, status, created_at").eq("group_id", groupId).order("created_at", { ascending: false }),
    supabase.from("users").select("user_id, display_name, picture_url").eq("group_id", groupId),
  ]);

  const tripIds = (trips ?? []).map((t) => t.trip_id);
  const { data: savingsRaw } = tripIds.length > 0
    ? await supabase.from("savings").select("*").in("trip_id", tripIds).order("created_at", { ascending: false })
    : { data: [] as never[] };

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.user_id, u]));

  const result = (trips ?? [])
    .map((trip) => ({
      trip,
      savings: (savingsRaw ?? [])
        .filter((s) => s.trip_id === trip.trip_id)
        .map((s) => ({ ...s, user: userMap[s.user_id] ?? null })),
    }))
    .filter((t) => t.savings.length > 0);

  return NextResponse.json(result);
}

/** POST /api/savings — 積立申請を登録する（複数回可） */
export async function POST(req: NextRequest) {
  const { trip_id, user_id, amount, title } = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("savings")
    .insert({ trip_id, user_id, amount, title: title || null, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 入金担当者とグループに通知
  const { data: trip } = await supabase
    .from("trips")
    .select("title, group_id")
    .eq("trip_id", trip_id)
    .maybeSingle();

  if (trip) {
    const [{ data: group }, { data: submitter }] = await Promise.all([
      supabase.from("groups").select("approver_id, line_group_id").eq("group_id", trip.group_id).maybeSingle(),
      supabase.from("users").select("display_name").eq("user_id", user_id).eq("group_id", trip.group_id).maybeSingle(),
    ]);

    const name = submitter?.display_name ?? "メンバー";
    const lines = [
      "💰 入金確認のお知らせ",
      "",
      `旅行：「${trip.title}」`,
      `申請者：${name}さん`,
      ...(title ? [`件名：${title}`] : []),
      `金額：¥${Number(amount).toLocaleString()}`,
      "",
      "確認後、アプリで承認をお願いします🙏",
    ];
    const message = lines.join("\n");

    if (group?.line_group_id) {
      // グループに送信。入金担当者がいればメンションする
      let approverMention: { userId: string; displayName: string } | undefined;
      if (group.approver_id) {
        const { data: approver } = await supabase
          .from("users")
          .select("display_name")
          .eq("user_id", group.approver_id)
          .maybeSingle();
        if (approver) {
          approverMention = { userId: group.approver_id, displayName: approver.display_name };
        }
      }
      await sendLinePush(group.line_group_id, message, approverMention);
    } else if (group?.approver_id) {
      // グループ未リンクの場合は担当者に個別送信（メンション不要）
      await sendLinePush(group.approver_id, message);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
