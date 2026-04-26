# 機能仕様書テンプレート

> **使い方**: このファイルをコピーして `docs/features/<feature-name>/spec.md` として作成する。
> 不要なセクションは削除してよい。
>
> **段階的作成ワークフロー**: 本テンプレートは [07_development-phases.md](../development/07_development-phases.md) の仕様駆動開発（SDD）に対応している。
> 各セクションを Step 1〜5 の順に作成し、各ステップ末尾のセルフレビューゲートを通過してから次に進む。
>
> ```
> Step 1. 要件定義     → 概要・機能要件
> Step 2. 画面・UX 設計 → 画面一覧・画面仕様・画面遷移
> Step 3. Contract 設計 → データ型・Contract・Server Actions・データフロー
> Step 4. コンポーネント・状態設計 → コンポーネント構成・状態一覧
> Step 5. テスト方針    → テスト方針
> ```

---

## 概要

| 項目 | 内容 |
|------|------|
| 機能名 | （例: 思考記録） |
| 対象ルート | （例: `/records`, `/records/new`, `/records/[id]`） |
| 関連 US | （例: US-02, US-03） |
| 優先度 | Must / Should / Could |
| 実装フェーズ | Phase N |

---

## 機能要件

> [03_use-cases.md](../planning/03_use-cases.md) のユースケースから導出した「システムが満たすべき条件」。

- 例）1コラム以上入力があれば保存できる
- 例）未入力コラムは null として保存される
- 例）未認証ユーザーは `/sign-in` にリダイレクトされる
- 例）自分の記録以外は閲覧・編集・削除できない

---

## 画面一覧

| 画面名 | URL | 説明 |
|--------|-----|------|
| 一覧 | `/records` | |
| 新規作成 | `/records/new` | |
| 詳細 | `/records/[id]` | |
| 編集 | `/records/[id]/edit` | |

---

## 画面仕様

> 画面ごとにセクションを繰り返す。

### 画面名（例: 一覧）

**概要**: 1〜2文でこの画面の目的を説明する。

#### 表示要素

| 要素 | 説明 | 備考 |
|------|------|------|
| | | |

#### ユーザー操作

| 操作 | 結果 | 条件 |
|------|------|------|
| | | |

#### エラー・エッジケース

| ケース | 表示・挙動 |
|--------|-----------|
| データなし（空状態） | |
| 読み込みエラー | |

---

## コンポーネント構成

```
app/records/
├── page.tsx                   # Server Component（データ取得）
├── loading.tsx                # Suspense fallback
├── error.tsx                  # エラーバウンダリ
├── _components/
│   └── ComponentName.tsx      # Client / Server を明記
├── new/
│   ├── page.tsx
│   ├── _components/
│   │   └── RecordForm.tsx     # 'use client'
│   └── _actions/
│       └── create-record.ts   # Server Action
└── [id]/
    ├── page.tsx
    ├── not-found.tsx
    └── _actions/
        └── delete-record.ts
```

### 各コンポーネントの責務

| コンポーネント | Server / Client | 責務 |
|--------------|----------------|------|
| `page.tsx` | Server | データ取得・認証チェック |
| `RecordForm.tsx` | Client | フォーム状態管理（React Hook Form） |
| `RecordList.tsx` | Client or Server | 一覧の表示 |

---

## データ型・Contract

> TypeScript 型と Zod スキーマがフロントエンド／バックエンドの共通仕様書となる。

```typescript
// types/records.ts

// DB の行型（Supabase 自動生成ベース）
export type Record = {
  id: string
  user_id: string
  situation: string | null   // A: できごと
  thought: string | null     // B: どう捉えたか
  emotion: string | null     // C: 感情
  thought_confidence: number | null  // 0〜100
  emotion_intensity: number | null   // 0〜100
  created_at: string
  updated_at: string
}

// フォーム入力型
export type CreateRecordInput = {
  situation?: string
  thought?: string
  emotion?: string
  thought_confidence?: number
  emotion_intensity?: number
}

// Zod スキーマ（バリデーション定義）
export const CreateRecordSchema = z.object({
  situation: z.string().optional(),
  thought: z.string().optional(),
  emotion: z.string().optional(),
  thought_confidence: z.number().int().min(0).max(100).optional(),
  emotion_intensity: z.number().int().min(0).max(100).optional(),
}).refine(
  (data) => data.situation || data.thought || data.emotion,
  { message: 'A・B・C のうち1つ以上を入力してください' }
)
```

---

## Server Actions

| Action | ファイル | 入力型 | 戻り値 | revalidate 対象 |
|--------|---------|--------|--------|----------------|
| `createRecord` | `new/_actions/create-record.ts` | `CreateRecordInput` | `{ error?: string }` | `/records` |
| `updateRecord` | `[id]/edit/_actions/update-record.ts` | `UpdateRecordInput` | `{ error?: string }` | `/records`, `/records/[id]` |
| `deleteRecord` | `[id]/_actions/delete-record.ts` | `{ id: string }` | `{ error?: string }` | `/records` |

---

## データフロー

### 取得（Read）

```
ブラウザ → page.tsx（Server Component）
  → auth() で userId 取得（未認証は /sign-in へ redirect）
  → createServerSupabaseClient() → Supabase RLS 評価
  → records テーブルから userId に紐づくデータ取得
  → Client Component へ props として渡す
```

### 作成（Create）

```
ユーザー入力 → RecordForm（Client Component）
  → React Hook Form + Zod でクライアントバリデーション
  → createRecord Server Action 呼び出し
    → Zod でサーバーサイドバリデーション
    → Supabase に INSERT
    → revalidatePath('/records')
    → { error?: string } を返す
  → エラーがあれば画面にメッセージ表示
  → 成功なら /records へ redirect
```

---

## 状態一覧

> Client Component が保持する状態を列挙する。

| コンポーネント | 状態名 | 型 | 初期値 | 説明 |
|--------------|-------|-----|--------|------|
| `RecordForm` | （RHF が管理） | — | — | フォーム値は React Hook Form で管理 |
| `DeleteButton` | `isPending` | `boolean` | `false` | useTransition で管理 |

---

## 画面遷移

```
/records（一覧）
  ├── [新規作成ボタン] → /records/new
  └── [記録カード クリック] → /records/[id]（詳細）
                               ├── [編集ボタン] → /records/[id]/edit
                               └── [削除ボタン] → 確認ダイアログ → 削除 → /records

/records/new
  ├── [保存成功] → /records
  └── [キャンセル] → /records

/records/[id]/edit
  ├── [保存成功] → /records/[id]
  └── [キャンセル] → /records/[id]
```

---

## テスト方針

| レイヤー | ツール | テスト対象 |
|---------|--------|-----------|
| ロジック | RTL + Vitest | Server Action のバリデーション・エラーハンドリング |
| E2E | Playwright | 記録の作成〜一覧表示の一連フロー（実認証・実DB） |

---

## 未解決事項・TODO

> 実装着手前に解消が必要な問いや、後回しにした決定事項を記録する。

- [ ] （例）削除確認ダイアログはモーダルか、インラインか？
- [ ] （例）一覧の表示件数・ページネーション方針

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| YYYY-MM-DD | 初版作成 |
