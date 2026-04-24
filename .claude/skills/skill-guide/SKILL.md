---
name: skill-guide
description: Claude Code のスキル作成方法を案内する。スキルを作りたい、SKILL.md の書き方を知りたい、フロントマターの設定を確認したい場合に使用する。
---

# Claude Code スキル作成ガイド

> 公式ドキュメント: https://code.claude.com/docs/en/skills

## 概要

スキルは Claude が実行できることを拡張する仕組み。`SKILL.md` ファイルに指示を書くと、Claude がツールキットに追加する。

- `/skill-name` で直接呼び出せる
- 関連する会話では Claude が自動で読み込む

---

## ファイル構造

```
my-skill/
├── SKILL.md           # メイン指示（必須）
├── template.md        # Claude が埋めるテンプレート
├── examples/
│   └── sample.md      # 期待される出力例
└── scripts/
    └── validate.sh    # Claude が実行できるスクリプト
```

---

## 保存場所と適用範囲

| 場所         | パス                                           | 適用対象         |
| :----------- | :--------------------------------------------- | :--------------- |
| Enterprise   | 管理設定を参照                                  | 組織全ユーザー   |
| Personal     | `~/.claude/skills/<skill-name>/SKILL.md`       | 全プロジェクト   |
| Project      | `.claude/skills/<skill-name>/SKILL.md`         | このプロジェクトのみ |
| Plugin       | `<plugin>/skills/<skill-name>/SKILL.md`        | プラグイン有効箇所 |

優先順位: enterprise > personal > project

---

## SKILL.md の基本構造

```yaml
---
name: my-skill
description: スキルの説明。Claude がいつ使うかを判断するために使う。
---

スキルの指示をここに書く（Markdown）
```

---

## フロントマター フィールド一覧

| フィールド                    | 必須 | デフォルト | 説明                                                                 |
| :---------------------------- | :--- | :--------- | :------------------------------------------------------------------- |
| `name`                        | No   | ディレクトリ名 | スラッシュコマンド名。小文字・数字・ハイフンのみ（最大64文字）      |
| `description`                 | 推奨 | 最初の段落  | Claude がスキルを使うか判断する説明文                               |
| `argument-hint`               | No   | —          | オートコンプリートに表示するヒント。例: `[issue-number]`            |
| `disable-model-invocation`    | No   | `false`    | `true` で Claude による自動呼び出しを無効化（手動専用）             |
| `user-invocable`              | No   | `true`     | `false` で `/` メニューから非表示（Claude のみ呼び出し可能）       |
| `allowed-tools`               | No   | —          | このスキル実行中に許可なしで使えるツール。例: `Read, Grep, Glob`   |
| `model`                       | No   | —          | スキル実行時に使用するモデル                                         |
| `context`                     | No   | —          | `fork` で分離したサブエージェントで実行                              |
| `agent`                       | No   | `general-purpose` | `context: fork` 時のサブエージェントタイプ                 |
| `hooks`                       | No   | —          | このスキルのライフサイクルにスコープされたフック                     |

---

## 呼び出し制御

| フロントマター                       | ユーザーが呼び出せる | Claude が呼び出せる | コンテキストへの読み込み                             |
| :----------------------------------- | :------------------: | :-----------------: | :--------------------------------------------------- |
| （デフォルト）                       | ✓                    | ✓                   | 説明は常にコンテキストに含まれる                     |
| `disable-model-invocation: true`     | ✓                    | ✗                   | 説明もコンテキストに含まれない（完全手動）           |
| `user-invocable: false`              | ✗                    | ✓                   | 説明は常にコンテキストに含まれる                     |

**使い分け:**
- `/deploy`、`/commit` など副作用があるもの → `disable-model-invocation: true`
- 背景知識・コンテキスト情報 → `user-invocable: false`

---

## 文字列置換

| 変数                    | 説明                                               |
| :---------------------- | :------------------------------------------------- |
| `$ARGUMENTS`            | スキル呼び出し時の全引数                           |
| `$ARGUMENTS[N]`         | N番目の引数（0始まり）                             |
| `$N`                    | `$ARGUMENTS[N]` の短縮形                           |
| `${CLAUDE_SESSION_ID}`  | 現在のセッションID                                 |
| `${CLAUDE_SKILL_DIR}`   | スキルの `SKILL.md` が置かれているディレクトリパス |

**例:**
```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Implement the fix
3. Write tests
4. Create a commit
```

---

## 動的コンテキスト注入

`` !`command` `` 構文でシェルコマンドを事前実行し、その出力を埋め込める（Claude が実行するのではなく前処理）。

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

---

## サブエージェントで実行（context: fork）

`context: fork` でスキルを分離コンテキストで実行。会話履歴にはアクセスできない。

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

**agent オプション:** `Explore`、`Plan`、`general-purpose`、カスタムサブエージェント名

---

## スキルコンテンツの種類

### リファレンス型（知識・規約）
Claude が現在の作業に適用する背景知識。インラインで実行。

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

### タスク型（手順・アクション）
副作用のある操作や手動トリガーしたいもの。`disable-model-invocation: true` を推奨。

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

---

## サポートファイルの活用

`SKILL.md` から別ファイルを参照することで、メインファイルをコンパクトに保てる。

```markdown
## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

**目安:** `SKILL.md` は500行以下に保つ。詳細は別ファイルへ。

---

## 拡張思考の有効化

スキルコンテンツのどこかに `ultrathink` という単語を含めると拡張思考が有効になる。

---

## バンドル済みスキル（Claude Code 標準搭載）

| スキル       | 説明                                                                 |
| :----------- | :------------------------------------------------------------------- |
| `/simplify`  | 変更ファイルをコード品質・効率・再利用の観点でレビューして修正       |
| `/batch`     | コードベース全体の大規模変更を並列エージェントで実行                 |
| `/debug`     | 現在のセッションのデバッグログを読んでトラブルシューティング         |

---

## トラブルシューティング

| 症状                       | 対処法                                                              |
| :------------------------- | :------------------------------------------------------------------ |
| スキルがトリガーされない    | `description` にユーザーが使う自然なキーワードを含める              |
| スキルが頻繁にトリガーされる | `description` をより具体的にするか `disable-model-invocation: true` を追加 |
| Claude が全スキルを見ない   | スキル数が多い場合 `/context` で確認。`SLASH_COMMAND_TOOL_CHAR_BUDGET` で上限調整 |

---

## 権限制御

```
# 全スキルを無効化
Skill

# 特定スキルのみ許可
Skill(commit)
Skill(review-pr *)

# 特定スキルを拒否
Skill(deploy *)
```

---

## 最小限のスキル例

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational.
```
