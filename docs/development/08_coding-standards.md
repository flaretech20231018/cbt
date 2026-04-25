# コーディング規約

> テスト戦略・開発環境・CI/CD の構成は [10_development-environment.md](./10_development-environment.md) を参照。

---

## Linter / Formatter

### ESLint

- **設定**: Flat Config（`eslint.config.mjs`）で以下の構成を適用する
- **実行**: `npx eslint .`（CI でも同一コマンドを実行）

**設定構成（適用順）：**

| 層 | パッケージ | 役割 |
|----|-----------|------|
| 1 | `eslint-config-next/core-web-vitals` | Next.js 固有ルール + React + Core Web Vitals |
| 2 | `eslint-config-next/typescript` | `typescript-eslint/recommended` ルール |
| 3 | `typescript-eslint` strict 設定 | `recommended` → `strict` への引き上げ |
| 4 | `eslint-config-prettier` | Prettier とのフォーマットルール競合を無効化 |

> 技術選定の判断根拠は [ADR-005](../architecture/05_architecture.md#adr-005-eslint-設定構成を-airbnb-から-next-公式--typescript-strict-に変更する) を参照。

**主な適用ルール方針：**

| カテゴリ | 方針 |
|---------|------|
| `no-unused-vars` | 未使用変数はエラー（`_` prefix で明示的に無視可） |
| `react/jsx-no-leaked-render` | JSX 内での `&&` レンダリングを禁止（数値 0 の意図しない表示を防ぐ） |
| `@next/next/no-html-link-for-pages` | `<a>` タグではなく `<Link>` を使う |

### Prettier

- **役割**: コードフォーマットに専念。ESLint との競合ルールは `eslint-config-prettier` で無効化する
- **実行**: `npx prettier --write .`（保存時自動フォーマット推奨）

**設定方針（`.prettierrc`）：**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## コード品質診断ツール

### React Doctor

React コードベースを自動スキャンし、パフォーマンス・セキュリティ・アーキテクチャの問題を 0〜100 のスコアで数値化する診断 CLI ツール。47 以上のルールが組み込まれている。

**主な検出対象：**

| カテゴリ | 具体例 |
|---------|--------|
| パフォーマンス | 不要な `useEffect`、派生ステートの過剰な state 管理 |
| アーキテクチャ | prop drilling、デッドコード（未使用 export） |
| アクセシビリティ | `alt` 属性の欠落、ラベルなしフォーム要素 |

**実行方法（Docker コンテナ内）：**

```bash
# プロジェクト全体をスキャン
docker compose exec app npx react-doctor@latest .

# 詳細表示
docker compose exec app npx react-doctor@latest . --verbose

# 差分スキャン（PR 単位での確認に使う）
docker compose exec app npx react-doctor@latest . --diff main
```

**運用方針：**

- 実装フェーズ開始後、定期的にスキャンを実行して健全性を確認する
- `--diff main` を使い、PR ごとに悪化していないかを確認する（CI への組み込みは将来対応）
- スコア 100 点を目標にするのではなく、**スコアの低下が起きていないこと**を継続的にチェックする

---

## 命名規則

### ファイル名

| 種別 | 規則 | 例 |
|------|------|-----|
| コンポーネントファイル | PascalCase | `RecordForm.tsx` |
| ユーティリティ・フック | camelCase | `useRecordForm.ts`, `cn.ts` |
| Server Actions ファイル | kebab-case | `create-record.ts` |
| テストファイル | 対象ファイル名 + `.test.ts(x)` | `create-record.test.ts`, `RecordForm.test.tsx` |
| Storybook | 対象ファイル名 + `.stories.tsx` | `Button.stories.tsx` |
| 型定義ファイル | camelCase | `database.types.ts` |

### 変数・関数・クラス

| 種別 | 規則 | 例 |
|------|------|-----|
| 変数・関数 | camelCase | `fetchRecords`, `isLoading` |
| React コンポーネント | PascalCase | `RecordForm`, `RecordList` |
| 定数 | UPPER_SNAKE_CASE | `MAX_RECORD_LENGTH` |
| 型・インターフェース | PascalCase | `CreateRecordInput`, `Record` |
| Zod スキーマ | PascalCase + `Schema` suffix | `CreateRecordSchema` |
| Server Action 関数 | camelCase（動詞始まり） | `createRecord`, `deleteRecord` |
| イベントハンドラ | `handle` + 動詞 | `handleSubmit`, `handleDelete` |
| boolean 変数 | `is` / `has` / `can` prefix | `isLoading`, `hasError` |

### ディレクトリ名

| 種別 | 規則 | 例 |
|------|------|-----|
| App Router ルート | kebab-case | `sign-in/`, `records/` |
| プライベートフォルダ | `_` prefix + camelCase | `_components/`, `_actions/` |
| 共有コンポーネント | camelCase | `ui/`, `layout/` |

---

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) に準拠する。

### フォーマット

```
<type>(<scope>): <subject>

[optional body]
```

- **subject**: 英語・小文字始まり・末尾ピリオドなし・命令形（`add`, `fix`, `update`）
- **scope**: 変更対象の機能領域（省略可）
- **body**: 変更の理由・背景を補足する場合に記述（省略可）

### type 一覧

| type | 用途 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat(records): add create record form` |
| `fix` | バグ修正 | `fix(auth): resolve redirect loop on sign-in` |
| `build` | ビルドシステム・外部依存関係の変更 | `build: update webpack config` |
| `chore` | 雑務（src・test に影響しない変更） | `chore(deps): update Next.js to 15.x` |
| `ci` | CI/CD の設定変更 | `ci: add storybook build job` |
| `docs` | ドキュメントのみの変更 | `docs(readme): update setup instructions` |
| `perf` | パフォーマンス改善 | `perf(records): memoize filtered record list` |
| `refactor` | 機能変更を伴わないリファクタリング | `refactor(records): extract RecordCard component` |
| `revert` | 以前のコミットの取り消し | `revert: feat(records): add create record form` |
| `style` | コードフォーマット（動作に影響しない変更） | `style: apply prettier formatting` |
| `test` | テストの追加・修正 | `test(records): add unit tests for create-record action` |

### scope 一覧

| scope | 対象 |
|-------|------|
| `records` | 思考記録の CRUD |
| `auth` | 認証・認可 |
| `ui` | 共有 UI コンポーネント |
| `deps` | 依存パッケージ |
| `db` | データベース・マイグレーション |

> scope は上記に限定しない。変更対象が明確であれば自由に追加してよい。

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [05_architecture.md](../architecture/05_architecture.md) | システム構成・ディレクトリ設計 |
| [10_development-environment.md](./10_development-environment.md) | 開発環境・テスト戦略・CI/CD |
