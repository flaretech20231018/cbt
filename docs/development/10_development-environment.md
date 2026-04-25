# 開発環境・テスト・CI/CD

> コーディング規約・Linter/Formatter・コード品質診断ツールは [08_coding-standards.md](./08_coding-standards.md) を参照。

---

## 環境一覧

| 環境 | 用途 | 実行基盤 |
|------|------|---------|
| ローカル開発 | 機能開発・デバッグ | Docker コンテナ |
| CI | テスト・Lint・ビルド検証 | GitHub Actions（Ubuntu ランナー） |
| 本番 | エンドユーザー向けサービス | Vercel |

---

## ローカル開発環境

### Docker 構成

Node.js をホストマシンに直接インストールせず、Docker コンテナ内に閉じ込める構成を採用する。ホスト環境を汚さず、チームメンバー間・CI との環境差異を排除するため。

```
cbt/
├── docker-compose.yml       # サービス定義
├── Dockerfile               # アプリコンテナ
└── .env.local               # 環境変数（gitignore 対象）
```

**サービス構成（予定）：**

| サービス | 役割 | ポート |
|---------|------|-------|
| `app` | Next.js 開発サーバー | 3000 |
| `supabase` | Supabase ローカル環境（CLI） | 54321（Studio）/ 54322（DB） |

### よく使うコマンド

```bash
# 開発サーバー起動
docker compose up

# コンテナ内でコマンド実行
docker compose exec app npm run dev
docker compose exec app npx react-doctor@latest .   # コード品質スキャン

# Supabase ローカル環境
docker compose exec app npx supabase start
docker compose exec app npx supabase db push        # マイグレーション適用
docker compose exec app npx supabase gen types      # 型定義生成
```

---

## テスト戦略

> テスト実装の詳細・命名規則は [08_coding-standards.md](./08_coding-standards.md) を参照。

### テスト階層とツール

```
E2E テスト
  └── Playwright

コンポーネントテスト / ビジュアルテスト
  └── Storybook + @storybook/test-runner
       ストーリーをテストケースとして活用

単体テスト / 統合テスト
  └── Vitest + React Testing Library
       Server Actions・ユーティリティ関数・コンポーネント
```

### Vitest + React Testing Library

- **対象**: Server Actions のロジック、ユーティリティ関数、クライアントコンポーネントの振る舞い
- **実行**: コンテナ内で `npx vitest` / `npx vitest --coverage`
- **方針**: 実装の詳細（DOM 構造）ではなく、ユーザーの操作と結果を検証する

```bash
docker compose exec app npx vitest              # ウォッチモード
docker compose exec app npx vitest run          # 単発実行（CI 用）
docker compose exec app npx vitest --coverage   # カバレッジ計測
```

### Storybook

- **対象**: `components/ui/` の汎用コンポーネント、ドメイン固有コンポーネント
- **用途**: コンポーネントの独立開発・ドキュメント化・ビジュアル確認
- **test-runner**: ストーリーを自動テストとして実行（CI でも動作）

```bash
docker compose exec app npx storybook dev -p 6006   # 開発用 Storybook 起動
docker compose exec app npx storybook build          # 静的ビルド
docker compose exec app npx test-storybook           # ストーリーをテスト実行
```

---

## CI/CD パイプライン

### GitHub Actions ワークフロー概要

PR 作成・プッシュ時に自動で以下を実行する。

```
push / pull_request
        │
        ├── lint          ESLint チェック
        ├── type-check    TypeScript 型チェック（tsc --noEmit）
        ├── test          Vitest（単体テスト）
        ├── storybook     Storybook ビルド + test-runner
        ├── playwright    Playwright（E2E テスト）
        └── build         Next.js ビルド検証
```

**ワークフローファイルの予定パス：**

```
.github/
└── workflows/
    ├── ci.yml          # lint / type-check / test / storybook / playwright / build
    └── storybook.yml   # Storybook ビルド + test-runner（分離する場合のみ）
```

> **構成の判断ガイド（Phase 1 で確定）**
>
> | 構成 | 採用条件 |
> |------|---------|
> | `ci.yml` 一本化 | Storybook ビルドが軽量（2 分以内）で、CI 全体の実行時間が許容範囲内の場合 |
> | `storybook.yml` 分離 | Storybook ビルドが重く、他ジョブと並列実行してもボトルネックになる場合 |
>
> 構成を確定したら以下を同期すること：
> - 本セクション（ワークフローファイル構成）
> - [07_development-phases.md](./07_development-phases.md) Phase 1 成果物の CI 行

### CodeRabbit（AI コードレビュー）

PR に対して CodeRabbit が自動でコードレビューコメントを付与する。

- **役割**: 人間のレビューを補完する。実装の意図・設計上の問題・バグリスクを指摘
- **設定ファイル**: `.coderabbit.yaml`（プロジェクトルートに配置）
- **注意**: CodeRabbit のコメントはあくまで参考。すべてに対応する義務はない

### Vercel デプロイ

| トリガー | 対象 | 動作 |
|---------|------|------|
| `main` ブランチへのマージ | 本番環境 | 自動デプロイ |
| PR 作成・更新 | Preview 環境 | プレビュー URL を発行 |

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [05_architecture.md](../architecture/05_architecture.md) | システム構成・ディレクトリ設計・認証設計 |
| [08_coding-standards.md](./08_coding-standards.md) | ESLint・Prettier・React Doctor・命名規則 |
| [07_development-phases.md](./07_development-phases.md) | 開発フェーズ計画・マイルストーン |
