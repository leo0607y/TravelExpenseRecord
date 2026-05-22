import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// API Routes用サービスロールクライアント（RLSをバイパス）
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
