-- ============================================================
-- Tabi-Pay データベーススキーマ
-- Supabase SQL Editorで実行する
-- ============================================================

-- Groups（旅行グループ）
CREATE TABLE IF NOT EXISTS groups (
  group_id   TEXT PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,
  created_by  TEXT,
  approver_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users（LINEユーザー）
CREATE TABLE IF NOT EXISTS users (
  user_id      TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  picture_url  TEXT,
  group_id     TEXT NOT NULL REFERENCES groups(group_id),
  role         TEXT NOT NULL DEFAULT 'member'
                 CHECK (role IN ('admin', 'member')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trips（旅行プロジェクト）
CREATE TABLE IF NOT EXISTS trips (
  trip_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      TEXT NOT NULL REFERENCES groups(group_id),
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'settled')),
  carry_over_in INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Savings（積立・入金履歴）
CREATE TABLE IF NOT EXISTS savings (
  saving_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(user_id),
  amount      INTEGER NOT NULL CHECK (amount > 0),
  title       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);
-- ※ 既存DBへの適用: ALTER TABLE savings ADD COLUMN IF NOT EXISTS title TEXT;

-- Expenses（支出）
CREATE TABLE IF NOT EXISTS expenses (
  expense_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id        UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  payer_id       TEXT NOT NULL REFERENCES users(user_id),
  amount         INTEGER NOT NULL CHECK (amount > 0), -- 精算計算で使う円換算額（USDの場合は概算→後で確定額に修正する）
  currency       TEXT NOT NULL DEFAULT 'JPY' CHECK (currency IN ('JPY', 'USD')),
  foreign_amount NUMERIC, -- currency='USD'のときのドル建て金額（参考表示用。精算計算には使わない）
  payment_type   TEXT NOT NULL CHECK (payment_type IN ('card', 'cash')),
  title          TEXT NOT NULL,
  memo           TEXT,
  image_url      TEXT,
  paid_at        DATE NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ※ 既存DBへの適用:
--   ALTER TABLE expenses ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'JPY' CHECK (currency IN ('JPY', 'USD'));
--   ALTER TABLE expenses ADD COLUMN IF NOT EXISTS foreign_amount NUMERIC;

-- ExpenseBeneficiaries（支出受益者・中間テーブル）
CREATE TABLE IF NOT EXISTS expense_beneficiaries (
  expense_id UUID NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(user_id),
  PRIMARY KEY (expense_id, user_id)
);

-- Reminders（アプリ内から予約するリマインダー。指定日時にLINEへ送信される）
-- ※ created_by は users(user_id) への外部キーを付けていない。
--   本番DBのusersテーブルに一意制約が想定通り付いておらず
--   REFERENCES users(user_id) がエラーになったため（42830）。
--   ユーザーの正当性チェックはアプリ側（APIルート）で行っている。
CREATE TABLE IF NOT EXISTS reminders (
  reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  group_id    TEXT NOT NULL REFERENCES groups(group_id),
  created_by  TEXT NOT NULL,
  message     TEXT NOT NULL,
  send_at     TIMESTAMPTZ NOT NULL,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(send_at) WHERE sent_at IS NULL;
-- ※ 既存DBへの適用: 上記の CREATE TABLE / CREATE INDEX をSupabase SQL Editorでそのまま実行すればよい

-- ============================================================
-- Storage バケット（画像アップロード用）
-- ============================================================
-- Supabase Dashboard > Storage から "expense-images" バケットを作成すること
-- アクセス制御: private（Authenticated のみ読み書き可）

-- ============================================================
-- インデックス（パフォーマンス）
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_trips_group_id  ON trips(group_id);
CREATE INDEX IF NOT EXISTS idx_savings_trip_id ON savings(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expense_beneficiaries_expense_id
  ON expense_beneficiaries(expense_id);
