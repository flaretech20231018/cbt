---
name: quality-review
description: 既存コードのファイルパスを指定して品質副特性（ISO/IEC 25010）の観点から分析し、問題箇所と改善案を提示する。「責務」等の曖昧な表現を使わず、修正性・試験性・モジュール性・解析性の言葉で指摘する。コードをレビューしてほしい、品質を確認してほしい、改善点を教えてほしいと言われたときに使用する。
disable-model-invocation: true
argument-hint: <レビュー対象のファイルパス>
allowed-tools: Read, Glob, Grep
---

# 目的

開発者体験向上・コード理解の認知負荷削減・変更容易性の確保

品質のレビューを「感覚的な指摘」ではなく、**品質副特性に基づいた客観的な分析**にする。
「なぜ問題か」「何を改善すべきか」を具体的な品質副特性の言葉で説明し、開発者が納得して改善できるようにする。

# 命令

`$ARGUMENTS` のコードを品質副特性の観点でレビューしてください。

---

## Step 1. 対象コードを読み込む

`$ARGUMENTS` を読み込み、以下を把握する:

- ファイルの種別（Server Action / Server Component / Client Component / UIプリミティブ / ユーティリティ）
- エクスポートされた関数・コンポーネントの一覧
- 外部依存の種類と数

## Step 2. 品質副特性ごとに分析する

以下の分析観点でコードを評価すること:

| 品質副特性 | 分析観点 |
|-----------|---------|
| **修正性（Modifiability）** | 変更箇所が局所化されているか。1箇所の変更が複数ファイルに波及しないか |
| **試験性（Testability）** | 外部依存が注入可能か。純粋な関数・コンポーネントとして分離されているか |
| **モジュール性（Modularity）** | 異なるビジネス概念や関心が同一コンポーネントに混在していないか |
| **解析性（Analysability）** | 名前から意図が読めるか。コードを読んで処理の流れが追えるか |
| **機能正確性（Functional Correctness）** | 事前条件・事後条件・不変条件は正しく実装されているか |

## Step 3. 結果を出力する

### 出力フォーマット

```
## 品質レビュー結果: [ファイルパス]

### 概要
[ファイルの種別・全体的な評価を1〜2文で]

---

### 指摘事項

#### [品質副特性名] の問題: [問題タイトル]

**問題**: [品質副特性の観点からなぜ問題なのかを具体的に説明]

❌ 現在のコード（問題箇所を抜粋）
```[言語]
// 問題のあるコード
```

✅ 改善後のコード
```[言語]
// 改善されたコード
```

**改善による効果**: [どの品質副特性がどう向上するかを具体的に説明]

---

### 優先度まとめ

| 優先度 | 指摘 | 影響する品質副特性 |
|--------|------|-----------------|
| 高 | [指摘タイトル] | [副特性名] |
| 中 | [指摘タイトル] | [副特性名] |
| 低 | [指摘タイトル] | [副特性名] |

### 良い点
[品質副特性の観点で良くできている箇所]
```

---

## 分析の補足ガイド

### 機能正確性が低いパターン

機能正確性は「メソッドが契約通りに動くか」を問う。事前条件・事後条件・不変条件が実装に反映されているかを確認する。

```typescript
// ❌ 機能正確性が低い: 事前条件（認証チェック）が欠落している
// → 未認証ユーザーのデータが混入する可能性がある（不変条件の破壊）
export async function createRecord(input: CreateRecordInput) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('records').insert(input) // userId が未検証
  if (error) throw error
  revalidatePath('/records')
}

// ✅ 機能正確性が高い: 事前条件・事後条件・不変条件が明確に実装されている
export async function createRecord(
  input: CreateRecordInput
): Promise<{ error?: string }> {
  // 事前条件: 認証済みであること
  const { userId } = await auth()
  if (!userId) return { error: '認証が必要です' }

  // 事前条件: 入力値が妥当であること
  const result = CreateRecordSchema.safeParse(input)
  if (!result.success) return { error: '入力値が不正です' }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('records')
    .insert({ ...result.data, user_id: userId }) // 不変条件: 自分のデータのみ挿入

  // 事後条件: 失敗時はエラーを返す（throwしない）
  if (error) return { error: '保存に失敗しました。もう一度お試しください。' }

  revalidatePath('/records') // 事後条件: 一覧を最新化する
  return {}
}
```

### 修正性が低いパターン

```typescript
// ❌ 修正性が低い: ビジネスロジックとUIが混在
// → コンポーネントを修正するたびにロジックも壊れるリスクがある
export function RecordList() {
  const [records, setRecords] = useState([])
  useEffect(() => {
    fetch('/api/records').then(r => r.json()).then(setRecords) // フェッチロジック混在
  }, [])
  const sorted = records.sort((a, b) => ...) // ソートロジック混在
  return <ul>{sorted.map(r => <li>{r.situation}</li>)}</ul>
}

// ✅ 修正性が高い: データ取得はServer Component、表示はClient Component
// app/records/page.tsx (Server Component)
export default async function RecordsPage() {
  const records = await fetchRecords() // データ取得を分離
  return <RecordList records={records} />
}
```

### 試験性が低いパターン

```typescript
// ❌ 試験性が低い: 外部依存がハードコード
// → テスト時に Supabase クライアントの差し替えができない
export async function createRecord(input: unknown) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...) // 直接生成
  await supabase.from('records').insert(input)
}

// ✅ 試験性が高い: lib/supabase.ts の共通関数を使い、vi.mock で差し替え可能にする
export async function createRecord(input: unknown) {
  const supabase = await createServerSupabaseClient() // モック可能
  await supabase.from('records').insert(input)
}
```

### モジュール性が低いパターン

```typescript
// ❌ モジュール性が低い: 複数の関心が1つのAction に混在
// → 認証・バリデーション・通知・DB操作のいずれかが変わると全体を修正する必要がある
export async function createRecord(input: unknown) {
  const { userId } = await auth()
  const validated = Schema.parse(input)
  await supabase.from('records').insert(validated)
  await sendWelcomeEmailIfFirstRecord(userId) // 通知ロジックが混在
  await updateUserStats(userId)               // 統計更新が混在
  revalidatePath('/records')
}
```

### 解析性が低いパターン

```typescript
// ❌ 解析性が低い: 技術的実装を表す名前・マジックナンバー
const d = await sb.from('r').select('*').lt('ca', Date.now() - 86400000)

// ✅ 解析性が高い: 意図を表す名前
const recentRecords = await supabase
  .from('records')
  .select('*')
  .gt('created_at', oneDayAgo)
```

---

# 制約

- **禁止**: 「責務が多すぎる」「責務を分離する」等の曖昧な表現 → **「モジュール性が低い」「修正性への影響」等、品質副特性の言葉を使うこと**
- **禁止**: 感覚的・主観的な指摘（「読みにくい」「きれいではない」）→ **品質副特性への影響を根拠として示すこと**
- **禁止**: DomainService パターンの提案 → このプロジェクトでは使用しない
- **禁止**: 過剰なリファクタリング提案 → 現在の要件で問題になる箇所のみ指摘すること（YAGNI）
- **注意**: 良い点も必ず挙げること。品質副特性の観点で優れている箇所を明示することで、どのパターンを維持すべきかを開発者が判断できるようにする
