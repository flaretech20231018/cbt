# 開発フェーズ計画

> アーキテクチャ・技術スタックは [05_architecture.md](../architecture/05_architecture.md) を参照。
> 開発環境・テスト・CI/CD 構成の詳細は [10_development-environment.md](./10_development-environment.md) を参照。
> 各フェーズのワークフローは [11_issue-management.md](./11_issue-management.md) を参照。

---

## フェーズ概要

| フェーズ | 名称 | 状態 | 主な目的 |
|---------|------|------|---------|
| Phase 0 | ドキュメント整備 | ✅ 完了 | 設計・仕様・開発ルールを文書化し、実装の迷いをなくす |
| Phase 1 | プロジェクト基盤構築 | ★ 進行中 | Next.js・Docker・テスト基盤・CI を整備し、「動く土台」を作る |
| Phase 2 | 認証・DB セットアップ | 未着手 | Clerk + Supabase を接続し、ログインとデータ保存が動く状態にする |
| Phase 3 | コア機能実装 | 未着手 | 3コラム法の CRUD を SDD/TDD で実装し、MVP を完成させる |
| Phase 4 | デプロイ・公開 | 未着手 | Vercel + 本番 Supabase/Clerk を接続し、一般公開する |

---

## Phase 0: ドキュメント整備

### 目的

「何を作るか」「どう作るか」「なぜそう決めたか」を文書化し、実装フェーズに入る前の認識ずれをなくす。

### 成果物

| ファイル | 説明 | 状態 |
|---------|------|------|
| `docs/01_overview.md` | プロジェクト概要・ビジョン・KPI | 完成 |
| `docs/planning/02_personas.md` | ターゲットユーザーの詳細 | 完成 |
| `docs/planning/03_use-cases.md` | ユーザーストーリー・受入条件 | 完成 |
| `docs/planning/04_mvp.md` | MVP 機能・3コラム仕様・バリデーション | 完成 |
| `docs/architecture/05_architecture.md` | 技術スタック・ディレクトリ設計・ADR | 完成 |
| `docs/architecture/06_database.md` | テーブル定義・RLS ポリシー | 完成 |
| `docs/development/07_development-phases.md` | 開発フェーズ計画（本ドキュメント） | 完成 |
| `docs/development/08_coding-standards.md` | ESLint・Prettier・命名規則・コミット規約 | 完成 |
| `docs/architecture/09_ui-design.md` | 横断 UI ルール（デザイントークン・エラー表示・ローディング・アクセシビリティ・免責） | 完成 |
| `docs/development/10_development-environment.md` | Docker・テスト・CI/CD 構成 | 完成 |
| `docs/development/11_issue-management.md` | Issue 運用ルール・ラベル・ブランチ命名規約 | 完成 |
| `CLAUDE.md` | AI コンテキスト共有・ドキュメント索引 | 完成 |
| `.github/ISSUE_TEMPLATE/` | Issue テンプレート（バグ報告・機能リクエスト・開発タスク） | 完成 |
| `.github/pull_request_template.md` | PR テンプレート | 完成 |

### 完了定義

- [ ] 上記すべてのファイルが「完成」状態になっている
- [ ] `docs/` 全体を `git add` して初回コミット済み

> **各フェーズのワークフローについて**: Issue は既に全て起票・マイルストーン割り当て済み。[11_issue-management.md](./11_issue-management.md) のワークフロー ステップ 3（開発）から開始する。

---

## Phase 1: プロジェクト基盤構築 [草案]

### 目的

コードを書き始められる「動く骨格」を作る。ツール・環境・フォーマットを統一し、テスト基盤・CI を整備して、Phase 3 で初日から TDD / SDD サイクルを回せる状態にする。

### 成果物

> **[草案]** 以下の成果物リストは初稿。各 Issue 着手時にスコープ・使用ツールをユーザーと確認すること。

| カテゴリ | 内容 |
|---------|------|
| アプリ | `create-next-app` で Next.js 15 + TypeScript + Tailwind CSS を初期化 |
| Docker | `Dockerfile` + `docker-compose.yml`（`app` サービス）の作成・動作確認 |
| Lint / Format | ESLint・Prettier を設定し、`npm run lint` が通る |
| 環境変数 | `.env.local.example` を作成。`.env.local` は `.gitignore` に追加済み |
| Vitest | `vitest.config.ts` + React Testing Library セットアップ。`npm run test:run` が通る状態 |
| CI | `.github/workflows/ci.yml`（lint / type-check / test / build）を作成 |
| CodeRabbit | `.coderabbit.yaml` を配置し、GitHub App を連携。PR への自動レビューを有効化 |
| Git | 初回コミット（ `feat: initialize Next.js project` ）をプッシュ |

### 完了定義

- [ ] `docker compose up` で Next.js ウェルカムページが `localhost:3000` に表示される
- [ ] `npm run lint` がエラーなしで通る
- [ ] `npm run build` が成功する
- [ ] `npm run test:run` がエラーなしで通る
- [ ] GitHub Actions の CI 全ジョブが green になる
- [ ] PR を作成したとき CodeRabbit がコメントを付与する

> **各フェーズのワークフローについて**: Issue は既に全て起票・マイルストーン割り当て済み。[11_issue-management.md](./11_issue-management.md) のワークフロー ステップ 3（開発）から開始する。

### 使用技術・ツール

`Next.js 15` `TypeScript` `Tailwind CSS` `ESLint` `Prettier` `Docker` `GitHub Actions` `Vitest` `React Testing Library` `CodeRabbit`

---

## Phase 2: 認証・DB セットアップ [草案]

### 目的

Clerk によるログインと Supabase へのデータ保存が動く状態を作る。アプリの「認証の壁」と「データの壁」を両方突破する。

### 成果物

| カテゴリ | 内容 |
|---------|------|
| Clerk | サインイン・サインアップページ（`app/(auth)/`）の動作確認 |
| Clerk | `ClerkProvider` を Root Layout に組み込み、ミドルウェアで認証ガードを設定 |
| Supabase | ローカル環境（`supabase start`）を Docker と並行起動できる状態にする |
| Supabase | `supabase/migrations/` にマイグレーションを作成・適用（`users`・`records` テーブル + RLS） |
| 連携 | Clerk Third-party Auth を Supabase に設定。`auth.jwt()->>'sub'` で RLS が動くことを確認 |
| 型定義 | `supabase gen types` で `src/types/database.types.ts` を生成 |

### 完了定義

- [ ] Clerk でメール登録 → ログイン → ログアウトが動く
- [ ] ログイン済みユーザーが Supabase に INSERT できる
- [ ] 他ユーザーのデータが SELECT できない（RLS 動作確認）
- [ ] 未ログイン状態で `/records` にアクセスするとサインインページにリダイレクトされる

### 使用技術・ツール

`Clerk` `Supabase` `PostgreSQL` `Row Level Security` `supabase CLI`

### 参考ドキュメント

- [05_architecture.md — 認証・認可設計](../architecture/05_architecture.md)
- [06_database.md](../architecture/06_database.md)

### Issue 展開バックログ（参考）

> フェーズ開始時に、このセクションの **作業内容** を参考に Issue を起票し、対応するマイルストーンに割り当てること。そのまま使う必要はなく、前フェーズの学びを反映して調整すること。

#### feat: Clerk 認証基盤構築（サインイン・サインアップ・ミドルウェア）

**Labels:** type: feat, priority: must

**概要:**
Clerk を使ったログイン・サインアップ画面を実装し、未認証ユーザーを /sign-in にリダイレクトするミドルウェアを設定する。

**作業内容:**
- [ ] Clerk アカウント作成・アプリ作成（開発環境用）
- [ ] Clerk SDK インストール（`@clerk/nextjs`）
- [ ] `.env.local` に Clerk キーを設定
- [ ] `app/layout.tsx` に `ClerkProvider` を組み込む
- [ ] `app/(auth)/sign-in/[[...sign-in]]/page.tsx` 作成（`<SignIn />` コンポーネント）
- [ ] `app/(auth)/sign-up/[[...sign-up]]/page.tsx` 作成（`<SignUp />` コンポーネント）
- [ ] `middleware.ts` 作成（`/records` 以下を認証ガード）
- [ ] ログイン→ログアウトフローを手動確認

**完了定義:**
- [ ] メールアドレスでアカウント作成・ログインができる
- [ ] ログアウトが動作する
- [ ] 未ログイン状態で `/records` にアクセスすると `/sign-in` にリダイレクトされる

**参考:** [05_architecture.md](../architecture/05_architecture.md)（ADR-001）

---

#### chore: Supabase ローカル環境構築 + DB マイグレーション作成・適用

**Labels:** type: chore, priority: must

**概要:**
Supabase ローカル環境（supabase start）を立ち上げ、users テーブル・records テーブル・RLS ポリシーのマイグレーションを作成・適用する。

**作業内容:**
- [ ] Supabase CLI インストール（`@supabase/cli`）
- [ ] `supabase init` で `supabase/config.toml` 初期化
- [ ] `docker-compose.yml` に supabase サービスを追加（または supabase start で並行起動）
- [ ] マイグレーションファイル作成・適用:
  - `20260201000000_create_users.sql`（users テーブル + RLS）
  - `20260201000001_create_records.sql`（records テーブル + RLS + インデックス + updated_at トリガー）
  - RLS ポリシー（`auth.jwt()->>'sub'` 方式）
- [ ] Supabase Studio（localhost:54321）でテーブル・RLS が正しく作成されていることを確認

**完了定義:**
- [ ] `supabase start` が成功し、Studio にアクセスできる
- [ ] users・records テーブルが設計通りに作成されている
- [ ] RLS が有効化されている
- [ ] `supabase/migrations/` に SQL ファイルが存在する

**参考:** [06_database.md](../architecture/06_database.md)（テーブル定義・RLS ポリシー・マイグレーション SQL）、ADR-002

---

#### feat: Clerk ↔ Supabase Third-party Auth 連携 + 型定義生成

**Labels:** type: feat, priority: must
**依存:** Clerk 認証基盤 + Supabase ローカル環境

**概要:**
Clerk の JWT を Supabase RLS に渡す Third-party Auth 連携を設定し、ログイン済みユーザーが自分のデータのみ操作できることを確認する。

**作業内容:**
- [ ] Clerk ダッシュボード: Integrations → Supabase を有効化
- [ ] Supabase ダッシュボード: Authentication → Third-party providers → Clerk を追加
- [ ] `supabase/config.toml` に Clerk ドメインを設定
- [ ] `src/lib/supabase.ts` 作成（`createServerSupabaseClient`、accessToken で Clerk JWT を渡す）
- [ ] RLS 動作確認:
  - ログイン済みユーザーが自分の records に INSERT/SELECT できることを確認
  - 別ユーザーのデータが SELECT できないことを確認（テスト用2ユーザーで手動確認）
- [ ] `npx supabase gen types typescript` → `src/types/database.types.ts` 生成

**完了定義:**
- [ ] ログイン済みユーザーが Supabase に INSERT できる
- [ ] 他ユーザーのデータが SELECT できない（RLS 動作確認済み）
- [ ] `src/types/database.types.ts` が生成されている
- [ ] `src/lib/supabase.ts` が実装されている

**参考:** [05_architecture.md](../architecture/05_architecture.md)（データフロー）、[06_database.md](../architecture/06_database.md)（RLS ポリシー）

---

## Phase 3: コア機能実装 [草案]

### 目的

3コラム法の CRUD をすべて実装し、MVP のコア機能を完成させる。TDD（テスト駆動開発）で Server Actions の信頼性を担保する。

### 仕様駆動開発（SDD）：段階的な spec.md 作成ワークフロー

**実装コードを書く前に、spec.md を以下の 5 ステップで段階的に作成する。**

各ステップの成果物が次のステップのインプットとなるため、順序を飛ばさない。
ただし、後のステップで気づいた矛盾は前のステップに戻って修正してよい（仕様は生きたドキュメント）。

```
Step 1. 要件定義（何を・なぜ作るか）
          ↓  ◆ Gate: 機能要件だけで「何が動くか」を説明できるか？
Step 2. 画面・UX 設計（ユーザーに見える振る舞い）
          ↓  ◆ Gate: 画面仕様だけでモックアップが描けるか？
Step 3. Contract 設計（型・スキーマ・API シグネチャ）
          ↓  ◆ Gate: Contract だけでテストケースが書けるか？
Step 4. コンポーネント・状態設計（実装の骨格）
          ↓  ◆ Gate: コンポーネント構成が Contract と画面仕様に整合しているか？
Step 5. テスト方針の策定
          ↓  ◆ Gate: 機能要件のすべてに対応するテストが計画されているか？
──────────────────────────────────────────
          ↓
Step 6. TDD サイクルで実装（Red → Green → Refactor）
```

---

#### Step 1. 要件定義

spec.md の「概要」「機能要件」セクションを作成する。

| 作業 | 内容 |
|------|------|
| インプット | [03_use-cases.md](../planning/03_use-cases.md)、[04_mvp.md](../planning/04_mvp.md) |
| 書くもの | 概要テーブル（機能名・対象ルート・関連 US・優先度）＋機能要件チェックリスト |
| ポイント | 「システムが満たすべき条件」を箇条書きで列挙。実装方法には触れない |

**◆ セルフレビューゲート**: 機能要件チェックリストだけを読んで「何が動くアプリなのか」を第三者に説明できるか？

---

#### Step 2. 画面・UX 設計

spec.md の「画面一覧」「画面仕様」「画面遷移」セクションを作成する。

| 作業 | 内容 |
|------|------|
| インプット | Step 1 の機能要件 ＋ [09_ui-design.md](../architecture/09_ui-design.md)（作成済みの場合） |
| 書くもの | 画面一覧テーブル → 画面ごとの表示要素・ユーザー操作・エラー/エッジケース → 画面遷移図 |
| ポイント | ユーザー視点で「何が見えて、何ができるか」を確定させる。技術的な実装詳細は書かない |

**◆ セルフレビューゲート**: 画面仕様だけを見てワイヤーフレームが描けるか？ 機能要件に対応しない画面、画面に対応しない機能要件はないか？

---

#### Step 3. Contract 設計

spec.md の「データ型・Contract」「Server Actions」「データフロー」セクションを作成する。

| 作業 | 内容 |
|------|------|
| インプット | Step 1 の機能要件 ＋ Step 2 の画面仕様 ＋ [06_database.md](../architecture/06_database.md) |
| 書くもの | TypeScript 型定義 → Zod スキーマ → Server Action のシグネチャ（入力型・戻り値・revalidate 対象）→ データフロー図 |
| ポイント | 型とスキーマが FE/BE の「合意書」となる。画面仕様の入出力と Contract が 1:1 で対応することを確認する |

**◆ セルフレビューゲート**: Contract（型 + Zod スキーマ + Action シグネチャ）だけを見て、テストケースの入出力が書けるか？

> Contract の定義（TypeScript 型 + Zod スキーマが Contract である理由）は [05_architecture.md — ADR-004](../architecture/05_architecture.md) を参照。

---

#### Step 4. コンポーネント・状態設計

spec.md の「コンポーネント構成」「各コンポーネントの責務」「状態一覧」セクションを作成する。

| 作業 | 内容 |
|------|------|
| インプット | Step 2 の画面仕様 ＋ Step 3 の Contract |
| 書くもの | ディレクトリツリー → コンポーネントごとの Server/Client 区分と責務 → Client Component が保持する状態の一覧 |
| ポイント | 画面仕様の各要素がどのコンポーネントに対応するかを明確にする。Contract の入出力がどのコンポーネントを通過するかをトレースする |

**◆ セルフレビューゲート**: コンポーネント構成が Contract と画面仕様の両方に整合しているか？ 責務が曖昧なコンポーネントはないか？

---

#### Step 5. テスト方針の策定

spec.md の「テスト方針」セクションを作成する。

| 作業 | 内容 |
|------|------|
| インプット | Step 1 の機能要件 ＋ Step 3 の Contract ＋ Step 4 のコンポーネント構成 |
| 書くもの | テスト対象・ツール・方針 |
| ポイント | 機能要件の各チェックボックスに対応するテストが最低 1 つ存在することを確認する |

**◆ セルフレビューゲート**: 機能要件チェックリストのすべての項目に対応するテストが計画されているか？ テストの粒度は適切か？

---

#### Step 6. TDD サイクルで実装

spec.md が完成したら、**6-A（バックエンド）→ 6-B（フロントエンド）**の順で実装する。
Server Actions の入出力が安定してからコンポーネントを組み立てることで、FE/BE 間の不整合を防ぐ。

##### 6-A. Server Actions（バックエンド）

```
6-A-1. Contract（Zod スキーマ）が要求する振る舞いをテストケースとして書く（Red）
         → Vitest で Server Action のテスト
         → 正常系・バリデーションエラー・認証エラーを網羅
6-A-2. テストを通す最小限の実装を書く（Green）
6-A-3. リファクタリングする（Refactor）
6-A-4. 次の Server Action に進む（6-A-1 へ戻る）
```

##### 6-B. コンポーネント・UI（フロントエンド）

```
6-B-1. Step 4 のコンポーネント構成に従い、画面仕様を満たすコンポーネントを実装する（Red）
         → Server Component: データ取得・認証チェック
         → Client Component: フォーム状態管理（React Hook Form）・ユーザー操作
6-B-2. RTL でテストを書く（Green）
         → フォーム操作・エラー表示・Server Action 呼び出しを検証
6-B-3. `npm run react-doctor` でコード品質スキャン → 指摘対応（Refactor）
         → 不要な re-render・props の粒度・Server/Client 境界の問題を修正
6-B-4. 画面遷移・レスポンシブ対応を確認する
6-B-5. `npm run test:coverage` でカバレッジを確認し、未カバー箇所を補強する
6-B-6. 次の画面に進む（6-B-1 へ戻る）
```

> **6-A → 6-B の順にする理由**: Server Actions が安定した Contract を提供してからコンポーネントを組み立てることで、フロントエンドの実装中に「API の入出力が変わった」という手戻りを防ぐ。

---

#### この段階的ワークフローの設計根拠

- **前段の成果物が後段のインプット**: 要件 → 画面 → Contract → コンポーネント → テスト → 実装の順で、各段階が次の段階の前提条件を確定させる
- **早期の矛盾検出**: 各ゲートで整合性をチェックすることで、実装着手後の手戻りを最小化する
- **AI ペアプログラミングとの相性**: 各ステップの成果物がそのまま AI へのコンテキストとなり、指示の精度が段階的に上がる
- **個人開発でも実践可能**: 各ステップの成果物は spec.md 内のセクションに対応しており、新規ファイルの追加は不要。セルフレビューゲートは「1 つの問い」に答えるだけ

> 参考: [Spec-Driven Development（Thoughtworks, 2025）](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices)

### 成果物

| 機能 | US | 対象ファイル |
|------|-----|------------|
| 思考記録の一覧表示 | US-03 | `app/records/page.tsx` + `_components/RecordList.tsx` |
| 思考記録の詳細表示 | US-04 | `app/records/[id]/page.tsx` |
| 思考記録の新規作成 | US-02 | `app/records/new/page.tsx` + `RecordForm.tsx` + `create-record.ts` |
| 思考記録の編集 | US-05 | `app/records/[id]/edit/` + `EditForm.tsx` + `update-record.ts` |
| 思考記録の削除 | US-06 | `delete-record.ts`（確認ダイアログ付き） |
| 医療的免責 | — | `components/layout/Footer.tsx` |
| UX 改善 | — | B コラムのヘルプテキスト・入力例・プレースホルダー（SDD Step 2 で設計し Step 6-B で実装） |
| アクセシビリティ | — | フォームのラベル・`aria-*` 属性を WCAG AA 相当に整備（Step 6-B で作り込み） |

#### 実装ルール

- Server Actions は Zod でバリデーション。エラーは Result パターン（`{ error?: string }`）で返す
- フォームは React Hook Form で管理（Client Component）
- `createRecord` 実行後は `revalidatePath('/records')` で一覧を最新化

### 完了定義

- [ ] MVP 機能一覧（[04_mvp.md](../planning/04_mvp.md)）の Must 項目がすべて動作する
- [ ] Should 項目（編集・削除）が動作する
- [ ] Server Actions のテストが存在し、パスしている
- [ ] レスポンシブ対応：スマートフォン・PC の両方で崩れない
- [ ] 初回でも 3 分以内に 1 記録を作成できる UX になっている（KPI）

### 使用技術・ツール

`React Hook Form` `Zod` `Supabase JS` `Server Actions` `Vitest` `React Testing Library`

### 作業手順（参考）

> Phase 3 は 1 Issue / 1 PR で管理する。以下はその Issue 内で実施する作業の手順と完了定義。
> そのまま使う必要はなく、前フェーズの学びを反映して調整すること。

#### feat: 共有 UI コンポーネント実装（Button / Input / Textarea / Card）

**Labels:** type: feat, priority: must

**概要:**
Phase 3 の機能実装で使う共有 UI プリミティブコンポーネントを実装する。

**作業内容:**
- [ ] `src/components/ui/Button.tsx`（Primary / Secondary / Destructive / Ghost バリアント）
- [ ] `src/components/ui/Input.tsx`（label / error / helpText 対応）
- [ ] `src/components/ui/Textarea.tsx`（label / error / helpText 対応）
- [ ] `src/components/ui/Card.tsx`（記録カード用）
- [ ] `src/utils/cn.ts`（className マージユーティリティ）

**完了定義:**
- [ ] 全コンポーネントが WCAG AA 準拠（コントラスト比・タッチターゲット 44px）

**参考:** [09_ui-design.md](../architecture/09_ui-design.md)

---

#### feat: 共通レイアウト（Header / Footer）+ 医療的免責表示

**Labels:** type: feat, priority: must
**依存:** 共有 UI コンポーネント

**作業内容:**
- [ ] `src/components/layout/Header.tsx`（アプリ名・ナビゲーション・UserButton）
- [ ] `src/components/layout/Footer.tsx`（免責テキスト: `text-xs text-secondary`）
- [ ] `app/layout.tsx` に Header・Footer を組み込む
- [ ] レスポンシブ確認（SP / PC）

**完了定義:**
- [ ] 全ページのフッターに医療的免責テキストが表示される
- [ ] Header に Clerk の UserButton が表示され、ログアウトできる

**参考:** [09_ui-design.md](../architecture/09_ui-design.md)

---

#### docs(spec): 記録一覧画面の仕様書作成（SDD Step 1〜5）

**Labels:** type: docs

**作成内容（spec-template.md を使用）:**
- [ ] Step 1: 機能要件（US-03 から導出）
- [ ] Step 2: 画面・UX 設計（一覧表示・空状態・loading.tsx）
- [ ] Step 3: Contract 設計（型・クエリ・データフロー）
- [ ] Step 4: コンポーネント構成（RecordList.tsx の責務）
- [ ] Step 5: テスト方針（RTL テスト計画）

**セルフレビューゲート（全て YES で完了）:**
- [ ] 機能要件チェックリストだけで「何が動くか」説明できるか？
- [ ] 画面仕様だけでワイヤーフレームが描けるか？
- [ ] Contract だけでテストケースの入出力が書けるか？

**参考:** docs/features/spec-template.md, [03_use-cases.md](../planning/03_use-cases.md)（US-03）

---

#### feat: 記録一覧画面 実装 + テスト（SDD Step 6）

**Labels:** type: feat, priority: must
**依存:** 一覧 spec.md 完成

**実装ファイル:**
- `app/records/page.tsx`（Server Component、認証チェック・データ取得）
- `app/records/loading.tsx`（スケルトン UI）
- `app/records/error.tsx`（エラーバウンダリ）
- `app/records/_components/RecordList.tsx`
- `app/records/_components/RecordCard.tsx`

**完了定義:**
- [ ] 自分の記録が時系列降順で表示される
- [ ] 記録 0 件で空状態 UI 表示
- [ ] 各カードに日付・できごと冒頭・感情が表示
- [ ] カードクリックで詳細ページに遷移
- [ ] loading.tsx のスケルトン UI が表示
- [ ] SP・PC でレスポンシブ

---

#### docs(spec): 記録詳細・削除画面の仕様書作成（SDD Step 1〜5）

**Labels:** type: docs

**作成内容:**
- [ ] Step 1: 機能要件（US-04・US-06 から導出）
- [ ] Step 2: 画面・UX 設計（3コラム表示・編集ボタン・削除ボタン・not-found.tsx）
- [ ] Step 3: Contract 設計（レコード取得クエリ・deleteRecord シグネチャ）
- [ ] Step 4: コンポーネント構成（DeleteButton の useTransition 設計）
- [ ] Step 5: テスト方針

**セルフレビューゲート:**
- [ ] 削除確認ダイアログの実装方針が決まっているか？（インライン or モーダル）

**参考:** [03_use-cases.md](../planning/03_use-cases.md)（US-04・US-06）

---

#### feat: 記録詳細画面 + 削除機能 実装 + テスト（SDD Step 6）

**Labels:** type: feat, priority: must
**依存:** 一覧実装 + 詳細・削除 spec.md 完成

**実装ファイル:**
- `app/records/[id]/page.tsx`（Server Component）
- `app/records/[id]/not-found.tsx`
- `app/records/[id]/_components/DeleteButton.tsx`（useTransition + 確認）
- `app/records/[id]/_actions/delete-record.ts`（Server Action）

**完了定義:**
- [ ] 3コラム（できごと・どう捉えたか・感情）が表示される
- [ ] 存在しない ID で not-found.tsx 表示
- [ ] 削除ボタンで確認後、記録を削除して一覧に戻る
- [ ] 削除 Server Action の Vitest テスト（正常系・未認証エラー）
- [ ] 編集ボタンで編集ページに遷移

---

#### docs(spec): 記録作成画面の仕様書作成（SDD Step 1〜5）

**Labels:** type: docs, priority: must

**作成内容:**
- [ ] Step 1: 機能要件（US-02 から導出）
- [ ] Step 2: 画面・UX 設計（A→B→C の入力順・ヘルプテキスト・プレースホルダー・バリデーションエラー）
- [ ] Step 3: Contract 設計（CreateRecordSchema・createRecord シグネチャ・Result パターン）
- [ ] Step 4: コンポーネント構成（RecordForm の React Hook Form 設計）
- [ ] Step 5: テスト方針（正常系・全空バリデーション・ネットワークエラー）

**セルフレビューゲート:**
- [ ] CreateRecordSchema だけでテストケースの入出力が書けるか？
- [ ] 「すべて空で保存」「1項目入力で保存」の挙動が仕様書に明記されているか？

**参考:** [03_use-cases.md](../planning/03_use-cases.md)（US-02）, [04_mvp.md](../planning/04_mvp.md)

---

#### feat: 記録作成 Server Action 実装 + Vitest テスト（SDD Step 6-A）

**Labels:** type: feat, priority: must
**依存:** 作成 spec.md + Clerk↔Supabase 連携

**実装ファイル:** `app/records/new/_actions/create-record.ts`

**TDD サイクル:**
- [ ] テスト先行（Red）:
  - 正常系: 3コラム入力 → INSERT 成功 → `{}` を返す
  - 正常系: 1コラムのみ入力 → INSERT 成功
  - バリデーションエラー: 全コラム空 → `{ error }` を返す
  - 認証エラー: 未ログイン → `{ error }` を返す
- [ ] 最小実装（Green）
- [ ] リファクタリング

**完了定義:**
- [ ] `npm run test:run` で create-record.test.ts が全テストパス
- [ ] Zod でサーバーサイドバリデーション動作
- [ ] `revalidatePath('/records')` 呼び出し
- [ ] Result パターン（`{ error?: string }`）で返却

---

#### feat: 記録作成フォーム UI 実装 + RTL テスト（SDD Step 6-B）

**Labels:** type: feat, priority: must
**依存:** 作成 Server Action 安定

**実装ファイル:**
- `app/records/new/page.tsx`（Server Component）
- `app/records/new/_components/RecordForm.tsx`（'use client'、React Hook Form）

**作業内容:**
- [ ] RecordForm.tsx 実装（React Hook Form + Zod、送信中 disable + スピナー）
- [ ] エラー表示（フィールドエラー: 入力欄直下、フォームエラー: 上部アラートバナー）
- [ ] RTL テスト（送信→createRecord 呼出、全空送信→エラー表示）

**完了定義:**
- [ ] 1コラム以上入力で保存→一覧にリダイレクト
- [ ] 全空保存でバリデーションエラー表示
- [ ] SP・PC でレスポンシブ

---

#### docs(spec): 記録編集画面の仕様書作成（SDD Step 1〜5）

**Labels:** type: docs, priority: should

**作成内容:**
- [ ] Step 1: 機能要件（US-05 から導出）
- [ ] Step 2: 画面・UX 設計（既存値の pre-populate・更新後の遷移先）
- [ ] Step 3: Contract 設計（UpdateRecordSchema・updateRecord シグネチャ）
- [ ] Step 4: コンポーネント構成（EditForm = RecordForm の defaultValues 活用）
- [ ] Step 5: テスト方針

**セルフレビューゲート:**
- [ ] 存在しない ID で編集ページにアクセスした場合の挙動が仕様書に書かれているか？

**参考:** [03_use-cases.md](../planning/03_use-cases.md)（US-05）

---

#### feat: 記録編集 Server Action 実装 + Vitest テスト（SDD Step 6-A）

**Labels:** type: feat, priority: should
**依存:** 編集 spec.md + 作成 Server Action パターン

**実装ファイル:** `app/records/[id]/edit/_actions/update-record.ts`

**TDD サイクル:**
- [ ] テスト先行:
  - 正常系: 有効な入力 → UPDATE 成功
  - バリデーションエラー: 全コラム空
  - 認証エラー: 未ログイン
  - 権限エラー: 他ユーザーのレコード更新
- [ ] 最小実装 → リファクタリング

---

#### feat: 記録編集フォーム UI 実装 + RTL テスト（SDD Step 6-B）

**Labels:** type: feat, priority: should
**依存:** 編集 Server Action 安定

**実装ファイル:**
- `app/records/[id]/edit/page.tsx`（Server Component、既存データ取得）
- `app/records/[id]/edit/_components/EditForm.tsx`（'use client'）

**完了定義:**
- [ ] 既存データがフォームに初期表示される
- [ ] 更新後に詳細ページにリダイレクト

---

## Phase 4: デプロイ・公開 [草案]

### 目的

本番環境（Vercel + 本番 Supabase + 本番 Clerk）を接続し、一般公開する。

### 成果物

| カテゴリ | 内容 |
|---------|------|
| Vercel | プロジェクトを Vercel に接続。`main` ブランチへの push で自動デプロイされる状態にする |
| 環境変数 | Vercel の Environment Variables に本番用 Clerk・Supabase キーを設定 |
| Supabase 本番 | 本番プロジェクトにマイグレーションを適用。RLS が正しく動作することを確認 |
| Clerk 本番 | 本番 Clerk プロジェクトを作成し、Supabase Third-party Auth を再設定 |
| 免責確認 | フッターの医療的免責表示が本番でも正しく表示されることを確認 |

### 完了定義

- [ ] 本番 URL でアプリが動作する
- [ ] `main` ブランチへの push が Vercel に自動デプロイされる
- [ ] PR の Preview URL が発行される
- [ ] 他ユーザーのデータが本番 RLS で保護されていることを確認済み
- [ ] 医療的免責がフッターに表示されている

### 使用技術・ツール

`Vercel` `Supabase（本番プロジェクト）` `Clerk（本番プロジェクト）`

### Issue 展開バックログ（参考）

> フェーズ開始時に、このセクションの **作業内容** を参考に Issue を起票し、対応するマイルストーンに割り当てること。そのまま使う必要はなく、前フェーズの学びを反映して調整すること。

#### chore: Vercel プロジェクト作成 + main ブランチ自動デプロイ設定

**Labels:** type: chore

**作業内容:**
- [ ] Vercel アカウント作成・GitHub リポジトリ連携
- [ ] プロジェクト設定（フレームワーク: Next.js）
- [ ] `main` push → 自動デプロイ確認
- [ ] PR → Preview URL 発行確認

---

#### chore: 本番 Supabase プロジェクト作成 + マイグレーション適用 + RLS 確認

**Labels:** type: chore

**作業内容:**
- [ ] 本番 Supabase プロジェクト作成
- [ ] `supabase db push` でマイグレーション適用
- [ ] RLS 動作確認（SQL エディタで手動確認）

---

#### chore: 本番 Clerk 設定 + Third-party Auth 再設定 + Vercel 環境変数設定

**Labels:** type: chore
**依存:** Vercel + 本番 Supabase

**作業内容:**
- [ ] 本番 Clerk プロジェクト作成
- [ ] Integrations → Supabase 有効化
- [ ] Supabase: Third-party providers → 本番 Clerk 追加
- [ ] Vercel Environment Variables に全本番キー設定
- [ ] 再デプロイして動作確認

---

## フェーズ間の依存関係

```
Phase 0（ドキュメント整備）
    │
    └── Phase 1（プロジェクト基盤構築）
            │
            └── Phase 2（認証・DB セットアップ）
                    │
                    └── Phase 3（コア機能実装）
                            │
                            └── Phase 4（デプロイ・公開）
```

> テスト基盤・CI は Phase 1 で整備済みのため、Phase 3 は初日から TDD / SDD サイクルで開発できる。

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [04_mvp.md](../planning/04_mvp.md) | MVP 機能一覧・バリデーションルール |
| [05_architecture.md](../architecture/05_architecture.md) | 技術スタック・ディレクトリ設計・ADR |
| [06_database.md](../architecture/06_database.md) | テーブル定義・RLS ポリシー |
| [08_coding-standards.md](./08_coding-standards.md) | ESLint・Prettier・命名規則・コンポーネント設計 |
| [10_development-environment.md](./10_development-environment.md) | Docker・テスト・CI/CD 構成 |
