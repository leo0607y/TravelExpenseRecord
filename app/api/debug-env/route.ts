import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(未設定)";
  const keyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? "(未設定)";

  // Supabase REST APIへの疎通確認
  let pingResult = "未テスト";
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
      },
    });
    pingResult = `HTTP ${res.status}`;
  } catch (e) {
    pingResult = `接続失敗: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    supabase_url: url,
    service_role_key_prefix: keyPrefix + "...",
    ping: pingResult,
  });
}
