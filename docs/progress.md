# SilverPass 開発進捗

## Phase 1 MVP ✅ 完了（2026-05-07〜08）

### 実装済み機能
- [x] Next.js 14 App Router プロジェクト構築
- [x] Prisma + PostgreSQL (Supabase) データベース設計・マイグレーション
- [x] 問題データ54問（8カテゴリ）作成・シード投入
- [x] 問題演習画面（カテゴリフィルター・ランダム出題）
- [x] コードブロックのシンタックスハイライト（highlight.js）
- [x] 正誤判定ロジック
- [x] Claude API による AI解説（SSEストリーミング）
- [x] NextAuth.js + Google OAuth 認証
- [x] 回答履歴の DB 保存
- [x] ダッシュボード（今日の正解率・分野別スコア）
- [x] 無料プラン 1日10問制限

### 解決したトラブル
- `@auth/prisma-adapter` → `@next-auth/prisma-adapter` へ変更（v4互換性）
- `User.emailVerified` フィールド追加（NextAuthアダプター必須）
- `next/image` の外部ドメイン許可（`lh3.googleusercontent.com`）
- モデル名 `claude-sonnet-4-20250514` → `claude-sonnet-4-6` へ更新
- シェル環境の空 `ANTHROPIC_API_KEY` が `.env.local` を上書きする問題

---

## Phase 3 Vercel デプロイ ✅ 完了（2026-05-10）

### 実施済み
- [x] DBプロバイダーを SQLite → PostgreSQL (Supabase) に移行
- [x] `migration_lock.toml` の provider を `postgresql` に修正
- [x] Supabase へ `prisma migrate deploy` 適用済み（マイグレーション適用済み確認）
- [x] Supabase へシードデータ54問投入済み
- [x] `vercel.json` に `prisma generate && next build` を設定済み
- [x] GitHub へ push 済み (`EBIchannnn/silverpass`)
- [ ] Vercel プロジェクト作成・環境変数設定（手動作業 → 下記参照）
- [ ] `NEXTAUTH_URL` を本番URLに変更
- [ ] Google OAuth のリダイレクト URI に本番URLを追加

### Vercel 環境変数（設定必須）

| 変数名 | 値 |
|--------|-----|
| `DATABASE_URL` | Supabase の接続文字列 |
| `ANTHROPIC_API_KEY` | Anthropic APIキー |
| `NEXTAUTH_SECRET` | 署名用シークレット |
| `NEXTAUTH_URL` | `https://[デプロイ後のドメイン].vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth シークレット |

---

## Phase 2 Stripe決済（未着手）

### TODO
- [ ] Stripe アカウント作成・APIキー取得
- [ ] `stripe` パッケージ追加
- [ ] `/api/stripe/checkout` エンドポイント実装
- [ ] `/api/stripe/webhook` Webhook 実装
- [ ] `User.isPremium` フラグの自動更新
- [ ] プレミアムアップグレード画面 (`/pricing`)
- [ ] 制限解除ロジックの動作確認

---

## Phase 4 コンテンツ拡充（未着手）

### TODO
- [ ] 問題数を200問以上に拡充
- [ ] 弱点分析・復習モード（正解率の低い問題を優先出題）
- [ ] 模擬試験モード（60問・時間制限あり）
- [ ] 問題の難易度バランス調整
- [ ] ユーザーによる問題フィードバック機能

---

## メモ・アイデア

- 将来的にメールマガジン（毎日1問）機能も検討
- OGP画像を設定してSNSシェアしやすくする
- PWA対応でスマホからオフライン学習できるようにする
