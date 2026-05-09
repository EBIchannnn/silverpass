# SilverPass ☕

Oracle Java SE 11 Silver 受験者向けの **AI解説付き問題演習アプリ**

## 機能

- ✅ 54問のJava Silver試験範囲問題（8カテゴリ）
- 🤖 Claude AIによる解説ストリーミング表示
- 📊 ダッシュボード（今日の正解率・分野別スコア）
- 🔐 Googleログイン（NextAuth.js）
- 🔒 無料プラン：1日10問制限
- 💻 コードブロックのシンタックスハイライト

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js 14（App Router）+ TypeScript + Tailwind CSS |
| バックエンド | Next.js API Routes |
| DB | SQLite（Prisma） |
| AI | Anthropic Claude API |
| 認証 | NextAuth.js + Google OAuth |

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して以下を設定：

| 変数 | 説明 | 取得先 |
|------|------|--------|
| `ANTHROPIC_API_KEY` | Claude API キー | [console.anthropic.com](https://console.anthropic.com/) |
| `NEXTAUTH_SECRET` | 署名用シークレット | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth シークレット | Google Cloud Console |

#### Google OAuth の設定手順
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「認証情報」→「OAuthクライアントIDを作成」
3. アプリケーション種別: **ウェブアプリケーション**
4. 承認済みのリダイレクトURI: `http://localhost:3000/api/auth/callback/google`

### 3. データベースのセットアップ

```bash
npm run db:migrate   # マイグレーション実行
npm run db:seed      # 問題データの投入（54問）
```

または一括で：

```bash
npm run db:setup
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開く。

> **注意:** `NEXT_TELEMETRY_DISABLED=1 npm run dev` で起動するとテレメトリのエラーを回避できる場合があります。

## スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run db:migrate` | DBマイグレーション |
| `npm run db:seed` | 問題データ投入 |
| `npm run db:setup` | マイグレーション＋シード |
| `npm run db:studio` | Prisma Studio（DB GUI） |

## ディレクトリ構成

```
silverpass/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth
│   │   ├── quiz/                # 問題取得・回答API
│   │   ├── explain/             # Claude AI解説API
│   │   └── dashboard/           # ダッシュボードデータAPI
│   ├── login/                   # ログインページ
│   ├── quiz/                    # 問題演習ページ
│   └── page.tsx                 # ダッシュボード
├── components/
│   ├── QuizCard.tsx             # 問題表示
│   ├── ExplanationBox.tsx       # AI解説（ストリーミング）
│   ├── ProgressBar.tsx          # 進捗バー
│   ├── ScoreChart.tsx           # 分野別スコアグラフ
│   └── Navbar.tsx               # ナビゲーション
├── lib/
│   ├── prisma.ts                # Prismaクライアント
│   ├── anthropic.ts             # Claude APIクライアント
│   └── auth.ts                  # NextAuth設定
├── prisma/
│   ├── schema.prisma            # DBスキーマ
│   └── seed.ts                  # データ投入スクリプト
└── data/
    └── questions.json           # 54問の問題データ
```

## 問題カテゴリ

- データ型と変数
- 演算子
- 制御フロー（if/switch/for/while）
- オブジェクト指向（クラス/継承/インターフェース）
- 例外処理
- コレクション（List/Map/Set）
- ラムダ式・Stream API
- モジュールシステム（Java 9+）

## Phase 2 予定

- [ ] Stripe決済（プレミアムプラン）
- [ ] 弱点分析・復習モード
- [ ] Vercelデプロイ（PlanetScale DB）
- [ ] 問題数の拡充（200問+）

## 本番デプロイ手順（Vercel + Supabase）

### 1. Supabaseでデータベースを作成
1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. リージョン: `Northeast Asia (Tokyo)` を選択
3. 「Settings」→「Database」→「Connection string」→「URI」をコピー

### 2. Vercelにデプロイ
1. [vercel.com](https://vercel.com) でGitHubリポジトリ `EBIchannnn/silverpass` をインポート
2. 以下の環境変数を設定：

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | SupabaseのPostgreSQL接続URL |
| `ANTHROPIC_API_KEY` | Anthropic APIキー |
| `NEXTAUTH_SECRET` | NextAuth署名用シークレット（`openssl rand -base64 32` で生成） |
| `NEXTAUTH_URL` | デプロイ後のURL（例: `https://silverpass.vercel.app`） |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth シークレット |

3. 「Deploy」を実行

### 3. DBのマイグレーションとシードデータ投入
ローカルの `.env.local` に本番の `DATABASE_URL` を設定した上で：

```bash
npx prisma migrate deploy
npm run db:seed
```

### 4. Google OAuthのリダイレクトURIを追加
Google Cloud Consoleの承認済みリダイレクトURIに追加：
```
https://[あなたのドメイン].vercel.app/api/auth/callback/google
```
