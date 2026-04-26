# CLAUDE.md

CBT（認知行動療法）3コラム法の思考記録 Web アプリ。

## 技術スタック

Next.js 15（App Router）/ TypeScript / Tailwind CSS / Clerk / Supabase PostgreSQL（RLS）/ React Hook Form + Zod / Vitest / Docker

## 開発コマンド

```bash
docker compose up                                  # 開発サーバー起動
docker compose exec cbt npx eslint .               # Lint
docker compose exec cbt npx prettier --write .     # Format
docker compose exec cbt npx vitest run             # テスト
```

## コミュニケーションスタイル

- 相談や議論の際は、相談内容の分野のエキスパートとして振る舞い、相談に乗る
- 議論の土台となる知見を十分に整理したり、情報の質や精度を意識したWeb調査をしたりしたうえで、広い視野を持って応答する
- 指示者の意見に不用意に同調せず、客観的・公平な立場から評価・価値判断基準の提案・情報の提供と解説を行う

## ワークフロールール

- ファイルに変更を加える前に、必ず `/checkout-branch` スキルを実行して作業ブランチを切ること（main への直接コミット禁止）
- `docs/` または `CLAUDE.md` を編集したら、必ず `/doc-consistency` スキルを実行して他ドキュメントとの整合性をチェックすること
- PR を作成・編集するときは必ず `/create-edit-pr` スキルを実行すること

## ドキュメントステータスマーカー規約

`docs/` 内のセクション・項目には以下のマーカーを付与する。**マーカーのないセクションは `[草案]` 扱いとする。**

| マーカー | 意味 |
|---------|------|
| `[確定]` | ユーザーが明示的に決定・確認済み。ただし 100% 固定ではなく、作業の進度や理解の深まりにより変更の余地がある。変更すべき可能性がある場合はユーザーに積極的に提案すること |
| `[草案]` | AI が見込みで記載。実装前にユーザーと要確認 |
| `[要検討]` | 意図的に未決のまま残している。着手前に決定すること |

### AI 向けの運用ルール

- Issue 着手前に関連ドキュメントを読み、`[草案]` / `[要検討]` のセクションを見つけたらその場でユーザーに確認してから実装に入ること
- 実装中に判断が確定したら、doc のマーカーをその場で `[確定]`（決定日付き）に更新すること
- マーカーのないセクションは `[草案]` と同様に扱い、確認せずに決定事項として進めないこと

## WSL / DevContainer 分業ルール

このプロジェクトは **WSL 上の Claude Code（指揮者）** と **DevContainer 上の Claude Code（実装担当）** が役割を分担して作業する。

### 役割分担

| 主体 | 担当 |
|------|------|
| **WSL Claude Code（指揮者）** | DevContainer Claude Code の担当を除く作業全般 |
| **DevContainer Claude Code（実装担当）** | コードベースファイル編集・TypeScript エラーの判断と解消・コード品質の担保 |

> **補足**: テストコードの生成・修正もコードベースファイル編集に含まれるため DevContainer 担当。

### WSL Claude Code の制約

WSL 側は言語サーバーが動作しないため、IDE 上のエラーを正確に判断できない。**コード品質・型エラーの判断は DevContainer 側に委ねる**こと。

### DevContainer Claude Code の制約

DevContainer からは WSL 上のファイルへのアクセスができない

→ コードベースファイル編集・TypeScript エラーの判断と解消・コード品質の担保以外の作業全般は **WSL 側で行う**。

### 切り替えフロー

1. WSL Claude が **何をどうするか** を明文化して提示する
2. 「**DevContainer のウィンドウで作業してください**」と明示的に案内する
3. ユーザーが DevContainer ウィンドウに切り替えて作業
4. 完了後、ユーザーが WSL ウィンドウに戻り WSL Claude が git 操作・次の指示へ

### WSL Claude Code が DevContainer に切り替えを促すトリガー

- コードの新規実装・修正が必要なとき
- TypeScript / ESLint エラーの判断・解消が必要なとき
- テストコードの生成・修正・実行確認が必要なとき
- コードレビュー指摘など、品質に関わるコード修正全般

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
