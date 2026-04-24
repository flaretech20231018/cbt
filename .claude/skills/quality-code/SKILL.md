---
name: quality-code
description: 機能要件を自然言語で受け取り、品質副特性（ISO/IEC 25010）を意識した新規プロダクションコードを生成する。変更容易性・試験性・モジュール性をデフォルトで優先し、プロジェクトのアーキテクチャ規約に沿ったコードを出力する。新しいコンポーネント、Server Action、ユーティリティ関数等を実装してほしいと言われたときに使用する。
disable-model-invocation: true
argument-hint: <実装したい機能の説明>
allowed-tools: Read, Glob, Grep
---

# 目的

開発者体験向上・コード理解の認知負荷削減・変更容易性の確保

コードを「動けばよい」ではなく、**将来の変更コストを最小化する資産**として生成する。
実装の選択を品質副特性の観点から説明することで、なぜその設計にしたかを開発者が理解できるようにする。

# 命令

以下の機能要件を実装してください。

**要件**: $ARGUMENTS

---

## Step 1. 目的・目標・手段を整理する

実装前に以下を明確にすること:

| 層 | 問い |
|----|------|
| **目的** | なぜこの機能が必要か（ユーザー・事業が得る価値） |
| **目標** | 目的を達成するために実現すべき振る舞い・仕様（What） |
| **手段** | 目標を実現するための実装上の選択（How） |

目的が曖昧な場合は、`docs/01_overview.md` と `docs/planning/03_use-cases.md` を参照して補完すること。
目標は「何ができるようになるか」という振る舞いレベルで記述し、特定フィールドやUI構造の詳細に踏み込まないこと。

## Step 2. 対象ファイルの配置場所を決定する

`docs/architecture/05_architecture.md` のディレクトリ規約に従うこと:

| 実装対象 | 配置場所 | 判断基準 |
|---------|---------|---------|
| ページ専用コンポーネント | `app/**/_components/` | 1ルートのみで使用 |
| 汎用UIプリミティブ | `components/ui/` | ドメイン知識ゼロ |
| Server Action | `app/**/_actions/` | そのルートからのみ呼ばれる |
| 外部サービスクライアント | `src/lib/` | Supabase / Clerk の設定 |
| 型定義 | `src/types/` | アプリ全体で共有 |
| ユーティリティ | `src/utils/` | 副作用のない純粋関数 |

## Step 3. Server / Client Component を判定する

`use client` の誤配置はバンドルサイズ増加・データ漏洩の原因になる。

| 条件 | 判定 |
|------|------|
| DB アクセス / Supabase クエリ | Server Component |
| `auth()` でユーザー情報を取得 | Server Component |
| `useState` / `useEffect` / イベントハンドラ | Client Component |
| React Hook Form | Client Component |
| `window` / `localStorage` | Client Component |

**原則: `use client` はツリーの末端（葉コンポーネント）に押し下げる。**

## Step 4. 優先する品質副特性を選定する

このプロジェクトのデフォルト優先順位（変更不要な場合はそのまま適用）:

1. **修正性（Modifiability）** — 機能追加が頻繁なため最優先。変更箇所が局所化されること
2. **試験性（Testability）** — 外部依存を注入可能にし、単体テストを書ける構造にすること
3. **モジュール性（Modularity）** — 1つのコンポーネント変更が他に波及しないこと
4. **解析性（Analysability）** — コードを読んで意図がすぐにわかること（認知負荷の最小化）

## Step 5. コードを生成する

### 出力フォーマット

```
## 実装

### [ファイルパス]
```[言語]
// コード
```

### 設計の根拠

| 選択 | 促進する品質副特性 | 理由 |
|------|-----------------|------|
| [設計上の選択] | [修正性/試験性/モジュール性/解析性] | [具体的な理由] |

### トレードオフ（該当する場合）
[ある品質副特性を高めた結果、他の特性に与えた影響]
```

---

## プロジェクト固有のパターン

### Server Action（Result パターン）

```typescript
'use server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

const Schema = z.object({
  // フィールド定義
})

export async function actionName(
  input: z.infer<typeof Schema>
): Promise<{ error?: string }> {
  // 事前条件: 認証チェック
  const { userId } = await auth()
  if (!userId) return { error: '認証が必要です' }

  // 事前条件: バリデーション
  const result = Schema.safeParse(input)
  if (!result.success) return { error: '入力値が不正です' }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('table').insert(result.data)
  if (error) return { error: '保存に失敗しました。もう一度お試しください。' }

  revalidatePath('/path')
  return {}
}
```

### Client Component（React Hook Form + Server Action）

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function SomeForm() {
  const form = useForm({ resolver: zodResolver(Schema) })

  const onSubmit = form.handleSubmit(async (data) => {
    const { error } = await someAction(data)
    if (error) form.setError('root', { message: error })
  })

  return <form onSubmit={onSubmit}>{/* フィールド */}</form>
}
```

### データ取得（Server Component）

```typescript
// app/**/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'

export default async function Page() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('table')
    .select('*')
    .order('created_at', { ascending: false })

  return <SomeComponent items={data ?? []} />
}
```

---

# 制約

- **禁止**: 「責務」という曖昧な表現を設計の説明に使う → 「修正性が低い」「凝集度が不足している」等、**品質副特性の言葉で説明すること**
- **禁止**: DomainService パターンの安易な導入 → ビジネスロジックはドメインオブジェクトまたは Action 内に閉じること
- **禁止**: Client Component 内で Server Component を直接 import する
- **禁止**: `SUPABASE_SERVICE_ROLE_KEY` をクライアントサイドで使用する（RLS バイパスは管理操作専用）
- **禁止**: 将来の要件を想定した過剰な抽象化 → 現在の要件のみを満たす最小の実装にすること（YAGNI）
- **禁止**: エラーを `throw` で Client に伝播させる → **Result パターン（`Promise<{ error?: string }>`）を使うこと**
- **注意**: `auth.uid()` は Clerk との連携では使えない。`auth.jwt()->>'sub'` を使うこと（Clerk userId は TEXT 型）
