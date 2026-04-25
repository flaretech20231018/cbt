---
name: checkout-branch
description: バージョン管理ファイル（コード・設定・ドキュメント）に変更を加える前に作業ブランチを切る。ファイル編集・新規作成の前に必ずこのスキルを実行すること。
user-invocable: true
allowed-tools: Bash, Read
argument-hint: <Issue番号（省略可）> <作業の概要>
---

# 作業ブランチの作成

ファイルに変更を加える前に、必ず main から作業ブランチを切る。直接 main にコミットしない。

---

## Step 1. 現在のブランチを確認する

```bash
git branch --show-current
git status
```

- すでに main 以外のブランチにいる場合はこのスキルの実行は不要。そのまま作業を続ける。
- 未コミットの変更がある場合はブランチ作成前にユーザーに確認する。

## Step 2. ブランチ名を決める

`$ARGUMENTS`（Issue番号・作業概要）をもとに、以下の命名規則に従ってブランチ名を決める。

### 命名規則

```
<type>/<issue番号>/<kebab-case-summary>
```

Issue がない場合:

```
<type>/<kebab-case-summary>
```

| type | 用途 |
|------|------|
| feat | 新機能 |
| fix | バグ修正 |
| docs | ドキュメントのみの変更 |
| chore | ビルド・設定・依存関係など |
| refactor | リファクタリング |
| test | テストの追加・修正 |

### 例

```
feat/4/setup-nextjs
fix/7/login-redirect
docs/2/phase-0-initial-setup
chore/add-create-edit-pr-skill
```

## Step 3. main から最新を取得してブランチを作成する

```bash
git checkout main
git pull
git checkout -b <ブランチ名>
```

## Step 4. Issue に着手を記録する

Issue 番号が判明している場合、以下を実行する。

```bash
gh issue edit <Issue番号> --add-label "status: in-progress" --add-assignee "@me"
```

Issue 番号が不明・Issue なしの場合はスキップする。

## Step 5. ブランチ名をユーザーに報告する

作成したブランチ名と、Issue への着手記録の結果を報告し、作業を開始してよいことを伝える。

## 制約

- **禁止**: main ブランチ上でファイルを編集・コミットすること
- **禁止**: Issue がある場合にブランチ名から Issue 番号を省略すること
- **注意**: ブランチ作成前に `git status` で未コミット変更がないことを確認すること
