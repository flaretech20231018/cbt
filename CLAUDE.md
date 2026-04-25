# CLAUDE.md

CBT（認知行動療法）3コラム法の思考記録 Web アプリ。

## 技術スタック

Next.js 15（App Router）/ TypeScript / Tailwind CSS / Clerk / Supabase PostgreSQL（RLS）/ React Hook Form + Zod / Vitest / Docker

## 開発コマンド

```bash
docker compose up                                  # 開発サーバー起動
docker compose exec app npx eslint .               # Lint
docker compose exec app npx prettier --write .     # Format
docker compose exec app npx vitest run             # テスト
```

## コミュニケーションスタイル

- 相談や議論の際は、相談内容の分野のエキスパートとして振る舞い、相談に乗る
- 議論の土台となる知見を十分に整理したり、情報の質や精度を意識したWeb調査をしたりしたうえで、広い視野を持って応答する
- 指示者の意見に不用意に同調せず、客観的・公平な立場から評価・価値判断基準の提案・情報の提供と解説を行う

## ワークフロールール

- `docs/` または `CLAUDE.md` を編集したら、必ず `/doc-consistency` スキルを実行して他ドキュメントとの整合性をチェックすること
- PR を作成・編集するときは必ず `/create-edit-pr` スキルを実行すること

## ドキュメント

設計・仕様の詳細は `docs/` を参照:

| ファイル | 内容 |
|---------|------|
| [01_overview.md](docs/01_overview.md) | プロジェクト概要・ビジョン |
| **planning/** | |
| [02_personas.md](docs/planning/02_personas.md) | ペルソナ定義 |
| [03_use-cases.md](docs/planning/03_use-cases.md) | ユースケース定義 |
| [04_mvp.md](docs/planning/04_mvp.md) | MVP 機能・3コラム仕様・バリデーション |
| **architecture/** | |
| [05_architecture.md](docs/architecture/05_architecture.md) | 技術スタック・ディレクトリ設計・ADR |
| [06_database.md](docs/architecture/06_database.md) | テーブル定義・RLS ポリシー |
| [09_ui-design.md](docs/architecture/09_ui-design.md) | デザイントークン・横断 UI ルール |
| **development/** | |
| [07_development-phases.md](docs/development/07_development-phases.md) | 開発フェーズ計画（SDD ワークフロー） |
| [08_coding-standards.md](docs/development/08_coding-standards.md) | コーディング規約（命名・Lint・コミット規約） |
| [10_development-environment.md](docs/development/10_development-environment.md) | Docker・テスト・CI/CD |
| [11_issue-management.md](docs/development/11_issue-management.md) | Issue 運用ルール・ラベル・ブランチ命名規約・各フェーズのワークフロー |
