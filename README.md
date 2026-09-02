# Tabi-Pay（旅の共同サイフ）

旅行の共同財布を、LINEミニアプリ上でまるごと管理するアプリです。
みんなで積み立てて、共通カードで払って、最後にワンタップで精算します。

本番URL: https://travel-expense-record.vercel.app

---

## 1. 使い方マニュアル（メンバー向け）

### 1-1. 参加する

1. 幹事から共有された招待コード（6桁）を受け取る
2. アプリを開き、招待コードを入力して参加する
3. 参加すると、そのグループの現在の旅行にひもづく

> LINEグループにBotを招待しておくと、通知がグループへ届きます。招待していない場合は各自へ個別のDMで届きます。

### 1-2. 積み立てる

1. ホーム画面下部の積立フォームに **タイトル**（例：9月分）と **金額** を入力して申請する
2. 入金担当者に確認依頼の通知が飛ぶ
3. 実際に振り込む
4. 入金担当者が「承認」を押すと積立が確定し、全員に通知が届く

積立は何回でも追加できます。ホーム画面の「メンバー積立状況」で、誰が未申請・確認中・積立済かひと目で分かります。

### 1-3. 支出を記録する

1. 画面下の「＋ 支出を記録する」を押す
2. 入力する項目
   - **タイトル**（例：明洞で焼肉）
   - **金額**（円。USD払いの場合は外貨額も残せます）
   - **支払い方法** — 💳 共通カード / 💴 現金立替
   - **受益者** — その支出で恩恵を受けた人にチェック（割り勘の対象）
   - **メモ・レシート写真**（任意）
3. 保存すると、その日の分は毎晩21:00のまとめ通知でグループに届きます

> 支出ごとに即時通知は飛びません。通知が多くなりすぎないよう、1日1回まとめて届く設計です。

### 1-4. リマインダーを予約する

「🔔 リマインダーを見る・予約する」から、日時とメッセージを指定して予約できます。
指定時刻を過ぎると自動でLINEに届きます（3分おきに送信チェック）。予約後の編集・削除も可能です。

### 1-5. 精算する（幹事のみ）

1. 「🏁 旅行を締める・精算する」を開く
2. 総支出・プール残高・積立不足額を確認する（金額の修正もここで可能）
3. 必要なら「📄 精算サマリーをPDFで保存」で記録を残す
4. 締めると、誰が誰にいくら送るかの精算ルートが全員に通知され、次の旅行が自動で作成されます

余ったプール残高は次の旅行に **繰越** されます。

---

## 2. 画面の見かた

| 画面 | 内容 |
|---|---|
| ホーム | 総支出・プール残高・メンバー積立状況・支出履歴 |
| 支出一覧 | 全支出の一覧と絞り込み |
| 積立一覧 | 全旅行分の積立履歴（承認待ち / 積立済） |
| 旅の履歴 | 過去に精算済みの旅行 |
| リマインダー | 予約リマインダーの作成・編集・削除 |
| 精算 | 旅行の締めと精算ルート（幹事のみ） |

**プール残高** ＝ 繰越金 ＋ 承認済み積立 − 共通カードでの支払い

マイナスになっている場合は積立が不足しているので、追加の振込が必要です（1人あたりの目安も表示されます）。

---

## 3. 旅行先テーマ

旅行日程に合わせて、アプリの配色とイラストが自動で切り替わります。

| 期間（日本時間） | テーマ |
|---|---|
| 〜9/3 23:00 | 韓国 |
| 9/3 23:00 〜 9/8 06:00 | グアム |
| 9/8 06:00 〜 9/9 10:00 | 韓国 |
| 9/9 10:00 〜 | 標準 / グアム / 韓国 を自由に選択可能 |

自由選択が始まると、画面右下に切り替えボタンが出ます。選んだテーマはその端末だけに保存されるので、
他のメンバーの表示には影響しません。

---

## 4. 開発者向け

### セットアップ

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # 型チェック
```

### 必要な環境変数（Vercel Project Settings）

| 変数 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase接続 |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー側のDB操作 |
| `NEXT_PUBLIC_LIFF_ID` | LIFF起動 |
| `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` | LINE Messaging API |
| `CRON_SECRET` | 定時実行エンドポイントの認証 |
| `QSTASH_TOKEN` ほか | Upstash QStash（Vercel連携で自動設定） |

> ローカル開発では `NEXT_PUBLIC_LIFF_ID` が未設定だとLINEログインを迂回する開発バイパスが働きます（本番ビルドでは無効）。

### 定時実行の運用

定時実行は **Upstash QStash** から各エンドポイントを直接叩く方式です。
Vercel Cron・GitHub Actions の `schedule` はどちらも実際には発火しなかった経緯があります（`開発ログ.md` T-005 参照）。

| ジョブ | 間隔 | エンドポイント |
|---|---|---|
| リマインダー送信 | 3分おき | `/api/cron/reminders` |
| 日次まとめ | 毎日 21:00 JST | `/api/cron/daily-summary` |
| 月次積立リマインド | 毎月20日 9:00 JST | `/api/cron/monthly-savings-reminder` |

スケジュールの確認・変更:

```bash
# 一覧
curl -sS "https://qstash.upstash.io/v2/schedules" -H "Authorization: Bearer $QSTASH_TOKEN"

# 配信ログ（DELIVERED / responseStatus を確認できる）
curl -sS "https://qstash.upstash.io/v2/events" -H "Authorization: Bearer $QSTASH_TOKEN"

# 追加（間隔を変えるときは削除して作り直す）
curl -sS -X POST "https://qstash.upstash.io/v2/schedules/https://travel-expense-record.vercel.app/api/cron/reminders" \
  -H "Authorization: Bearer $QSTASH_TOKEN" \
  -H "Upstash-Cron: */3 * * * *" \
  -H "Upstash-Method: GET" \
  -H "Upstash-Forward-Authorization: Bearer $CRON_SECRET"
```

QStashの無料枠は **1日1,000メッセージ**。空振り（送るリマインダーが無い場合）も1通として数えられるため、
最も高頻度な reminders は3分おき（1日480通）に抑えています。間隔を縮める際は枠を超えないか確認してください。

手動で叩いて動作確認する場合:

```bash
curl -sS "https://travel-expense-record.vercel.app/api/cron/reminders" \
  -H "Authorization: Bearer $CRON_SECRET"
```

GitHub Actions（`.github/workflows/cron-jobs.yml`）は同じスケジュールをバックアップとして残しており、
Actionsタブから `workflow_dispatch` で任意のジョブを手動実行できます。

### デプロイ

`main` への push で Vercel が自動デプロイします。

```bash
vercel ls travel-expense-record   # デプロイ状況
vercel deploy --prod              # 手動デプロイ
```

### ドキュメント

| ファイル | 内容 |
|---|---|
| `設計書.md` | 企画・精算ロジック・DB設計・通知設計・UI設計・API一覧 |
| `開発ログ.md` | セッションごとの実施記録とトラブル記録 |
| `supabase/schema.sql` | DBスキーマ（既存DBへの適用手順もコメントに記載） |
