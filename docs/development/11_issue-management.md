# Issue 管理・運用ルール

## ブランチ戦略

GitHub Flow ベース。`main` から作業ブランチを分岐し、PR 経由でマージする。

### ブランチ命名規約

```
<type>/<issue-number>/<short-description>
```

| 要素 | 説明 | 例 |
|------|------|----|
| type | Conventional Commits のタイプ名 | feat, fix, docs, chore, ci, refactor, test |
| issue-number | 対応する GitHub Issue の番号 | 2, 15, 42 |
| short-description | 内容を簡潔に表すケバブケース | phase-0-initial-setup |

**例:**

```
docs/2/phase-0-initial-setup
feat/12/user-authentication
fix/23/login-redirect
chore/4/nextjs-docker-setup
ci/9/github-actions-ci
```

**ルール:**
- 小文字・ハイフン区切り（ケバブケース）
- Issue が存在しない軽微な修正では番号を省略可（`fix/typo-readme`）

---

## ラベル体系

### Type ラベル（12 個）— 全 Issue に必ず 1 つ付与

Conventional Commits に準拠 + `epic`。

| ラベル | 色 | 用途 |
|--------|-----|------|
| `type: epic` | `#9b59b6` | ビジネス要件・ユーザーストーリー単位の親チケット（使用条件は後述） |
| `type: feat` | `#2ecc71` | 新機能実装 |
| `type: fix` | `#d73a4a` | バグ修正 |
| `type: docs` | `#3498db` | ドキュメント作成・更新 |
| `type: style` | `#1abc9c` | コードスタイル変更（機能変更なし） |
| `type: refactor` | `#0075ca` | リファクタリング（振る舞い変更なし） |
| `type: perf` | `#e67e22` | パフォーマンス改善 |
| `type: test` | `#f39c12` | テスト追加・整備 |
| `type: build` | `#7f8c8d` | ビルドシステム・外部依存関連 |
| `type: ci` | `#6c5ce7` | CI 設定・スクリプト変更 |
| `type: chore` | `#95a5a6` | その他の雑務（src/test 以外の変更） |
| `type: revert` | `#636e72` | 以前のコミットの取り消し |

### Priority ラベル（4 個）— 全 Issue に必ず 1 つ付与

| ラベル | 色 | 用途 |
|--------|-----|------|
| `priority: must` | `#e74c3c` | Must 要件（MVP に必須） |
| `priority: should` | `#f39c12` | Should 要件（強く推奨） |
| `priority: could` | `#c5def5` | Nice-to-have |
| `priority: backlog` | `#bfd4f2` | 未トリアージ・優先度未判断 |

### Status ラベル（2 個）— 該当時のみ付与

| ラベル | 色 | 用途 |
|--------|-----|------|
| `status: blocked` | `#d93f0b` | 依存 Issue 未完了で着手不可 |
| `status: in-progress` | `#0e8a16` | 作業中 |

ラベルなし = 未着手。

### クローズ理由ラベル（2 個）— 該当時のみ付与

| ラベル | 色 | 用途 |
|--------|-----|------|
| `invalid` | `#e4e669` | 問題として認めない（仕様通り・再現不能・誤投稿など） |
| `wontfix` | `#ffffff` | 問題として認めるが対応しない（コスト・方針・スコープ外など） |

---

## マイルストーン

Phase ごとに 1 マイルストーンを作成。全 Issue は必ずいずれかのマイルストーンに所属する。

| マイルストーン | Phase |
|--------------|-------|
| Phase 0: ドキュメント整備 | 0 |
| Phase 1: プロジェクト基盤構築 | 1 |
| Phase 2: 認証・DB セットアップ | 2 |
| Phase 3: コア機能実装 | 3 |
| Phase 4: デプロイ・公開 | 4 |

MVP 後は `v1.1`, `v1.2` 等のバージョンマイルストーンに移行する。

---

## Issue 管理方針

### 原則

- **Phase の括りはマイルストーンで管理する。** 全 Issue は必ずいずれかのマイルストーンに所属する。

### 各フェーズのワークフロー

各フェーズの開始時に以下を実施する。

1. **Issue 起票** — [07_development-phases.md](07_development-phases.md) の該当フェーズ「Issue 展開バックログ（参考）」を元に Issue を起票する
2. **マイルストーン割り当て** — 起票した Issue を対応するマイルストーンに割り当てる
3. **開発（1 Issue / 1 PR）** — Issue を 1 枚ずつ以下の手順で作業する
   1. Issue に自分をアサイン + `status: in-progress` を付ける（二重着手防止）
   2. ブランチを切る（`/checkout-branch`）
   3. 実装・コミット
   4. PR 作成（本文に `Closes #N` を記載）
   5. レビュー → スカッシュマージ → Issue 自動クローズ
4. **完了定義チェック** — [07_development-phases.md](07_development-phases.md) の「完了定義」チェックリストを全て満たしたらフェーズ終了

### Epic を使う条件

以下を **すべて** 満たす場合のみ Epic Issue を起票する。それ以外は通常 Issue + マイルストーンで十分。

| 条件 | 説明 |
|------|------|
| ビジネスインパクトが大きい | 「決済できる」「通知が来る」など、それ単体でリリースノートに書けるレベルのユーザー価値 |
| Issue が 5 枚以上生まれる | 設計・実装・UI・テスト・ドキュメントが全部絡む |
| 複数人・複数チームが触る | 誰が何をやるかの整理が必要 |
| 数スプリントにまたがる | 1 スプリントで終わらない規模感 |

### Issue 本文テンプレート

詳細 Issue には以下を含める:

- **概要**: 何をするか 1-2 行
- **作業内容**: チェックリスト形式
- **完了定義**: 検証可能な条件
- **参考ドキュメント**: `docs/` 内の該当ファイルへのリンク
- **依存関係**: `Depends on #N` 形式

### SDD（Specification-Driven Development）Issue の分割

Phase 3 以降の機能実装では、spec.md 作成 Issue と実装 Issue を分離する:

- `docs(spec): 〇〇の仕様書作成（SDD Step 1〜5）` — 仕様書作成
- `feat: 〇〇 実装 + テスト（SDD Step 6）` — 実装

これにより AI ペアプロのコンテキストを最大限活用できる。

---

## 依存関係の記載

Issue 本文に `Depends on #N` と記載し、依存関係を明示する。
GitHub は `Depends on` を自動リンク化しないが、人間と AI が参照する際に十分機能する。

---

## Phase 2・4 詳細 Issue 参考資料 / Phase 3 作業手順

[07_development-phases.md](07_development-phases.md) の各 Phase セクションに事前設計した作業定義を保持している:

- **Phase 2・4**:「Issue 展開バックログ（参考）」— フェーズ開始時に **作業内容** セクションを参考に Issue を起票し、対応するマイルストーンに割り当てる
- **Phase 3**:「作業手順（参考）」— 1 Issue / 1 PR 内で実施する作業の手順

いずれもそのまま使う必要はなく、前フェーズの学びを反映して調整すること。
