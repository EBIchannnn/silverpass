# SilverPass - Claude Code ガイド

Oracle Java SE 11 Silver 受験者向けのAI解説付き問題演習アプリ。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS v3
- **バックエンド**: Next.js API Routes
- **DB**: SQLite + Prisma v5（将来: PlanetScale）
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`)
- **認証**: NextAuth.js v4 + `@next-auth/prisma-adapter`（v4専用、`@auth/prisma-adapter` は v5用なので使わない）
- **デプロイ予定**: Vercel

## ローカル開発

```bash
# 初回セットアップ
npm install
npm run db:setup      # マイグレーション + シードデータ投入

# 開発サーバー起動（Windowsでは start-dev.cmd をダブルクリックでも可）
NEXT_TELEMETRY_DISABLED=1 npm run dev
```

> **注意**: 環境変数 `ANTHROPIC_API_KEY` がシェルに空で設定されている場合、`.env.local` の値が上書きされる。`unset ANTHROPIC_API_KEY` してから起動すること。

## 重要な設計判断

### 認証アダプター
`next-auth` v4 では必ず `@next-auth/prisma-adapter` を使用する。`@auth/prisma-adapter` は v5 (Auth.js) 用であり、v4 と組み合わせると `OAuthCreateAccount` エラーになる。

### Prisma User モデルの必須フィールド
`@next-auth/prisma-adapter` は `User.emailVerified DateTime?` を必須とする。このフィールドが抜けると `prisma.user.create()` がバリデーションエラーになる。

### 環境変数の優先順位
Next.js はシェル環境変数を `.env.local` より優先する。CI や別環境での起動時に注意。

### Claude APIモデル
`claude-sonnet-4-20250514` は deprecated。現在は `claude-sonnet-4-6` を使用。`lib/anthropic.ts` ではなく `app/api/explain/route.ts` 内で指定している。

### 問題データ
`data/questions.json` → `prisma/seed.ts` でDBに投入する。現在54問（仕様書の50問より多い）。
DB再構築: `npm run db:reset`

## ディレクトリ構成

```
app/
  api/
    auth/[...nextauth]/   NextAuth ハンドラ
    quiz/                 問題一覧取得 (GET) 
    quiz/[id]/            問題詳細取得・回答送信 (GET/POST)
    explain/              Claude AI解説生成 (POST, SSE streaming)
    dashboard/            ダッシュボードデータ (GET, 要認証)
  login/                  ログインページ
  quiz/                   問題演習ページ（クライアントコンポーネント）
  page.tsx                ダッシュボード / ランディング

components/
  QuizCard.tsx            問題表示・選択肢ボタン（highlight.js使用）
  ExplanationBox.tsx      AI解説SSEストリーミング受信・表示
  ScoreChart.tsx          分野別スコアバーグラフ
  ProgressBar.tsx         問題進捗バー
  Navbar.tsx              ナビゲーションバー

lib/
  prisma.ts               グローバルPrismaクライアント（HMR対策済み）
  anthropic.ts            Anthropicクライアント
  auth.ts                 NextAuth設定
```

## APIの仕様

### POST /api/explain
Claude API を SSE (Server-Sent Events) でストリーミングする。
- リクエスト: `{ questionBody, codeBlock, options, selectedIndex, answerIndex, explanation }`
- レスポンス: `data: {"text": "..."}\n\n` 形式のSSEストリーム
- APIキーはサーバー側のみ。クライアントには渡さない。

### POST /api/quiz/[id]
回答を受け取り正誤判定 + ログイン済みならDBに回答履歴を保存。
ゲスト（未ログイン）でも正誤判定は返す（DB保存なし）。

## フェーズ計画

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 1 (MVP) | 問題演習・AI解説・認証・ダッシュボード | ✅ 完了 |
| Phase 2 | Stripe決済・プレミアムプラン | 未着手 |
| Phase 3 | Vercelデプロイ・PlanetScale移行 | 未着手 |
| Phase 4 | 問題数拡充（200問+）・弱点復習モード | 未着手 |
