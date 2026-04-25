---
name: test-gen
description: テスト対象のファイルパスを指定してテストコードを生成する。Server Actions・ユーティリティ関数・Reactコンポーネントに対して、契約による設計（事前条件・事後条件・不変条件）とGiven-When-Thenパターンに基づき、FIRST原則（Fast・Isolated・Repeatable・Self-validating・Thorough）を遵守したテストを実装する。テストを書いてほしい、テストコードを生成してほしいと言われたときに使用する。TDDのRedフェーズ（失敗するテストの作成）にも使用する。
disable-model-invocation: true
argument-hint: <テスト対象のファイルパス>
allowed-tools: Read, Glob, Grep
---

# 目的

テストコードを「実装の検証スクリプト」ではなく **ロジックの契約書** かつ **AIコーディングエージェントのガードレール** として機能させる。

テストは以下を同時に実現する:
- **仕様の明文化**: 「何を保証しているか」が一目でわかる
- **リグレッション防止**: コード変更でバグが入ったら検出する
- **リファクタリングの安全網**: 実装詳細ではなく振る舞いを検証し、構造変更に耐える
- **AIへのガードレール**: プロダクションコード実装時に、テストが正しさの境界を定義する

# テスト品質の原則

## FIRST原則（必須。すべてのテストが満たすこと）

- **Fast**: 外部I/Oを排除し高速に実行する。ユニットテストは数ミリ秒以内
- **Isolated**: 各テストは他テストの実行結果・順序・状態に一切依存しない。任意の順序で実行しても同一結果を返す
- **Repeatable**: 任意の環境で同一結果を返す。日付・乱数・ネットワーク等の非決定的要素をモック化する
- **Self-validating**: pass/failをテスト自身が判定する。手動確認不要
- **Thorough**: ハッピーパスだけでなく、異常系・境界値・エラーパスを網羅する

## テスト品質の3柱（生成後の自己評価基準）

- **Trustworthy（信頼性）**: 偽陽性（正しいコードでテスト失敗）・偽陰性（バグがあるのにテスト通過）がない
- **Maintainable（保守性）**: 実装変更で壊れにくい。実装詳細ではなく振る舞いを検証する
- **Readable（可読性）**: テストの意図が一目でわかる。テスト名が仕様書として機能する

# 命令

`$ARGUMENTS` のテストコードを以下の手順で実装してください。

---

## Step 1. テスト対象を分析する

`$ARGUMENTS` を読み込み、以下を特定する:

- エクスポートされた関数・コンポーネントの一覧
- 各関数のシグネチャ（引数・戻り値の型）
- 外部依存（Supabase クライアント / Clerk auth / Zod スキーマ等）
- Zodスキーマがある場合、各フィールドの型・制約（min/max/optional等）を抽出する

## Step 2. テスト種別を判定する

| 対象の特徴 | テスト種別 | 使用ツール |
|-----------|-----------|-----------|
| `'use server'` が宣言されている | 単体テスト（外部依存をMock） | Vitest |
| 純粋関数（引数のみに依存、副作用なし） | 単体テスト | Vitest |
| `'use client'` / useState / イベントハンドラを持つ | コンポーネントテスト | Vitest + React Testing Library |
| `components/ui/` 配下のUIプリミティブ | ビジュアルテスト | Storybook Story |

## Step 3. 契約を特定し、テストケースを列挙する

public な関数・コンポーネントごとに以下の3つの契約を分析し、**各契約の各exit pointに対して1つのテストケース**を列挙する。

exit pointとは関数の呼び出し側から観察可能な出力であり、以下の3種類がある:
- **戻り値**: 関数が値を返す
- **状態変更**: SUTや依存先の状態が変わる
- **外部呼び出し**: 外部サービスへの呼び出しが発生する

### 3-1. 事前条件（呼び出し側が保証すべき条件が満たされない場合のテスト）

以下のチェックリストを**上から順に照合**し、該当するものすべてのテストケースを列挙する:

**認証・認可（最優先。全Server Actionsに必須）:**
- [ ] 未認証（authトークンなし / userIdがnull）で呼び出した場合 → エラーが返ること
- [ ] 他ユーザーのリソースID（IDOR）を指定した場合 → エラーが返ること
- [ ] 権限外の操作を試みた場合 → エラーが返ること

**入力バリデーション（Zodスキーマの各フィールドに対して）:**
- [ ] 必須フィールドが欠損（undefined）の場合
- [ ] 空文字列 `""` の場合
- [ ] 空白のみ `"   "` の場合（trimで空になるか）
- [ ] 最大長を超過した文字列の場合
- [ ] 型が異なる値の場合（数値フィールドに文字列等）
- [ ] 特殊文字を含む場合（`<script>`, `'`, `"`, SQLメタ文字）

**データ型固有の境界値:**
→ `references/edge-case-checklist.md` を参照して、パラメータの型に応じた境界値テストを追加する

### 3-2. 事後条件（正常実行後に保証される出力・副作用のテスト）

各exit pointに対して独立したテストケースを作成する:
- [ ] 戻り値が期待通りであること（errorがundefined / 正しいデータ構造）
- [ ] DBへの書き込みが正しい引数で呼ばれること（from/insert/update/deleteの引数検証）
- [ ] revalidatePath / revalidateTag が正しいパスで呼ばれること
- [ ] redirect が正しいパスで呼ばれること

**エラーハンドリングパス（最重要。Yuan et al.の研究により、カタストロフィック障害の92%がエラーハンドリング不備に起因）:**
- [ ] Supabaseクエリがerrorを返した場合 → 適切なエラーレスポンスが返ること
- [ ] Supabaseクエリがnullデータを返した場合 → 適切に処理されること
- [ ] 認証サービス（Clerk）が例外をスローした場合 → クラッシュせずエラーが返ること
- [ ] 外部APIがタイムアウトした場合 → 適切に処理されること

### 3-3. 不変条件（実行の前後を問わず常に成り立つ性質のテスト）

- [ ] 他ユーザーのデータには一切触れない（fromの引数にuserIdフィルタが含まれること）
- [ ] 同一操作を2回実行しても整合性が保たれる（冪等性）
- [ ] エラー発生時にも部分的な状態変更が残らない

## Step 4. テストコードを生成する

Step 3で列挙した各テストケースに対して、以下の構造でコードを生成する。

### テスト隔離の保証（beforeEachの必須パターン）

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'

// モジュールモックはファイルトップレベルで宣言
vi.mock('@/lib/supabase')
vi.mock('@clerk/nextjs/server')

describe('<対象の関数名>', () => {
  beforeEach(() => {
    // ★ 隔離の保証: 全テストの前にモック状態を完全リセット
    vi.clearAllMocks()

    // 正常系のデフォルトモック（各テストで上書き可能）
    vi.mocked(auth).mockResolvedValue({
      userId: 'user_test123',
      getToken: vi.fn().mockResolvedValue('mock-token'),
    } as any)
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    } as any)
  })

  // テストケースをここに配置
})
```

### テストケースの構造

```typescript
describe('<対象の関数名>', () => {

  describe('事前条件', () => {
    it('未認証の場合、認証エラーを返すこと', async () => {
      // Given: 事前条件を満たさない状態をセットアップ
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      // When: 対象を呼び出す
      const result = await targetAction(validInput)
      // Then: 期待されるエラーを検証
      expect(result.error).toBe('認証が必要です')
    })

    it('必須フィールドが空文字の場合、バリデーションエラーを返すこと', async () => {
      // Given
      const invalidInput = { ...validInput, situation: '' }
      // When
      const result = await targetAction(invalidInput)
      // Then
      expect(result.error).toBeDefined()
    })
  })

  describe('事後条件', () => {
    it('有効な入力の場合、recordsテーブルにデータが挿入されること', async () => {
      // Given: テストデータはテスト内にインラインで定義する
      const input = { situation: 'テスト状況', thought: 'テスト思考' }
      // When
      await targetAction(input)
      // Then
      expect(mockFrom).toHaveBeenCalledWith('records')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ situation: 'テスト状況', user_id: 'user_test123' })
      )
    })

    it('Supabaseがエラーを返した場合、エラーレスポンスを返すこと', async () => {
      // Given: DB操作が失敗するモック
      mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
      // When
      const result = await targetAction(validInput)
      // Then
      expect(result.error).toBeDefined()
    })
  })

  describe('不変条件', () => {
    it('他ユーザーのデータにアクセスしないこと', async () => {
      // Given / When
      await targetAction(validInput)
      // Then: user_idフィルタが含まれることを検証
      expect(mockFrom).toHaveBeenCalledWith('records')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user_test123' })
      )
    })
  })
})
```

### テストデータの原則

- **テストデータはテスト内にインラインで定義する**（Mystery Guestスメルの防止）
- 共有フィクスチャファイルは使わない。代わりにファクトリ関数を使う:

```typescript
// ✅ ファクトリ関数: デフォルト値を持ち、テストごとに上書き可能
function createValidInput(overrides?: Partial<RecordInput>): RecordInput {
  return {
    situation: 'テスト状況',
    automatic_thought: '自動思考',
    balanced_thought: 'バランス思考',
    ...overrides,
  }
}

// テスト内での使用
it('situationが空の場合エラーを返すこと', async () => {
  const input = createValidInput({ situation: '' })
  const result = await createRecord(input)
  expect(result.error).toBeDefined()
})
```

### React Testing Library の方針

```typescript
// ✅ ユーザーの操作と結果を検証する（振る舞いテスト）
// クエリ優先順位: getByRole > getByLabelText > getByText > getByTestId
it('送信ボタンを押すとonSubmitが呼ばれること', async () => {
  const user = userEvent.setup()
  const mockSubmit = vi.fn()
  render(<RecordForm onSubmit={mockSubmit} />)
  await user.click(screen.getByRole('button', { name: '保存' }))
  expect(mockSubmit).toHaveBeenCalledOnce()
})

// ✅ 要素の非存在確認にはqueryByを使う
it('エラーがない場合、エラーメッセージが表示されないこと', () => {
  render(<RecordForm />)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

// ❌ 以下は禁止
// container.querySelector('.class-name')  → DOM構造テスト
// screen.getByTestId('xxx')               → 最終手段のみ
// fireEvent.click(button)                 → userEventを使う
```

---

# 制約

## 絶対禁止（テストスメル）

- **Eager Test**: 1つのテストに複数の独立した契約を詰め込む → 失敗箇所の特定が困難になる
- **実装詳細テスト**: DOM構造・CSSクラス名・privateメソッド・内部状態を直接検証する → リファクタリングで壊れる
- **Mystery Guest**: テスト外の共有フィクスチャ・外部ファイルに依存する → テスト単体で意図が読めない
- **Assertion Roulette**: アサーションが失敗した時にどの検証が失敗したか分からない → 適切なメッセージを付与する
- **Shared State**: テスト間で状態を共有し、実行順序に依存する → FIRST-Isolated違反
- **曖昧なテスト名**: 「正常に動作する」「テスト1」`should work` 等 → 検証する条件を日本語で明記する
- **英語テスト名**: `it('should ...')` → プロジェクト全体を日本語で統一する
- **スタブへのアサーション**: スタブ（データ取得用モック）の呼び出し回数や引数を検証する → 実装詳細への結合
- **Conditional Test Logic**: テスト内にif/switch/ループを含む → テストが壊れた時にテスト自体のバグか判別できない
- **Sleepy Test**: `setTimeout`や固定時間waitに依存する → `vi.useFakeTimers()`や`waitFor`を使う
- **テストロジックの複製**: テスト対象のアルゴリズムをテスト内で再実装する → テストが常に通る無意味なテストになる

## 許容される例外

- **関連する副作用の複数検証**: 例えばinsertが呼ばれ、かつrevalidatePathも呼ばれる、は同一の事後条件の複数exit pointとして1テストにまとめてよい
- **beforeEachでのモックリセット**: `vi.clearAllMocks()`とデフォルトモックの設定はbeforeEachに集約してよい（テストデータの構築はテスト内で行う）

## 非決定的要素のモック化（FIRST-Repeatable保証）

```typescript
// 日付
vi.useFakeTimers()
vi.setSystemTime(new Date('2024-01-15T09:00:00Z'))
afterEach(() => vi.useRealTimers())

// 乱数
vi.spyOn(Math, 'random').mockReturnValue(0.5)

// UUID
vi.mock('crypto', () => ({ randomUUID: () => 'test-uuid-1234' }))
```

---

# 参照

エッジケースの詳細チェックリスト（データ型ごとの境界値・特殊値一覧）は `references/edge-case-checklist.md` を参照すること。Step 3 の事前条件テスト列挙時に、パラメータの型に応じて該当セクションを確認する。
