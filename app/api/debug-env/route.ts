import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(未設定)";
  const keyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? "(未設定)";
  return NextResponse.json({
    supabase_url: url,
    service_role_key_prefix: keyPrefix + "...",
  });
}
