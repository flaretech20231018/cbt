---
name: create-edit-pr
description: PR を作成・編集する。gh pr create / gh pr edit を使う前に必ずこのスキルを実行すること。.github/pull_request_template.md の構成に従って本文を組み立てる。
user-invocable: true
allowed-tools: Read, Bash, Glob
argument-hint: <"create" または "edit <PR番号>">
---

# PR 作成・編集

`gh pr create` または `gh pr edit` を実行する際、必ず `.github/pull_request_template.md` の構成に従って本文を組み立てる。

---

## Step 1. テンプレートを読み込む

`.github/pull_request_template.md` を読み込み、セクション構成を把握する。

## Step 2. 変更内容を把握する

以下を確認して PR 本文の材料を集める:

```bash
git diff main...HEAD --stat        # 変更ファイルの一覧
git log main..HEAD --oneline       # コミット一覧
```

## Step 3. 本文を組み立てる

テンプレートの**各セクションをすべて含める**。内容が該当しない場合は「該当なし」と明記し、セクション自体を省略しない。

### 各セクションの書き方

| セクション | 方針 |
|-----------|------|
| 概要 | 変更の目的を1〜2文で簡潔に |
| 変更内容 | 箇条書き。実装・設定・ドキュメントを分けて書く |
| 関連 Issue | `Closes #xxx` の形式で記載 |
| テスト | 実施したテスト内容のみ記載。未実施・該当なしの場合は「該当なし」と書く。完了定義や受け入れ条件は Issue に書くものなので PR に書かない |
| スクリーンショット | UI 変更がある場合のみ添付。ない場合は「なし」 |

## Step 4. gh コマンドを実行する

組み立てた本文を使って `gh pr create` または `gh pr edit` を実行する。

```bash
# 新規作成
gh pr create --title "<Conventional Commits 形式のタイトル>" --body "$(cat <<'EOF'
<組み立てた本文>
EOF
)"

# 編集
gh pr edit <PR番号> --title "<タイトル>" --body "$(cat <<'EOF'
<組み立てた本文>
EOF
)"
```

### タイトルの形式

Conventional Commits に従う: `<type>: <件名>`

| type | 用途 |
|------|------|
| feat | 新機能 |
| fix | バグ修正 |
| docs | ドキュメントのみの変更 |
| chore | ビルド・設定・依存関係など |
| refactor | リファクタリング |
| test | テストの追加・修正 |
| style | フォーマット変更（動作に影響なし） |

## 制約

- **禁止**: テンプレートのセクションを省略すること
- **禁止**: テスト セクションに完了定義・受け入れ条件を書くこと（Issue に書くべき内容）
- **禁止**: `--body` なしで `gh pr create` を実行すること（テンプレートが無視されるため）
