---
name: watch-pr
description: >
  PR の CI（GitHub Actions）結果と CodeRabbit レビューを監視し、完了時にプッシュ通知で知らせる。
  以下の状況で自動トリガーする:
  - Claude が gh pr create で PR を作成した直後
  - Claude が git push でブランチをプッシュした直後（オープン中の PR がある場合）
  - ユーザーが「CI が終わったら教えて」「CI が完了したら通知して」「PR の結果を監視して」
    「作業しながら CI を見ておいて」「CI が通ったらマージして」「待機しながら監視して」
    「PR のチェックを見ておいて」「CI が通るまで他のことをしたい」などと発言した場合
  手動呼び出しは /watch-pr または /watch-pr <PR番号>。
allowed-tools: Bash, Monitor, PushNotification
---

# PR CI・CodeRabbit 監視

PR の CI と CodeRabbit レビューをバックグラウンドで監視し、完了時にプッシュ通知で結果を届ける。

---

## Step 1. PR 番号を特定する

引数（`$ARGUMENTS`）に PR 番号があればそれを使う。なければ現在のブランチの PR を取得する。

```bash
gh pr view --json number --jq '.number'
```

取得できなければユーザーに PR 番号を聞く。

---

## Step 2. 監視スクリプトをバックグラウンドで起動する

以下のスクリプトを `run_in_background: true` で実行する。
`<PR番号>` は Step 1 で取得した値に置き換える。

```bash
PR=<PR番号>
MAX=20  # 最大 20 × 30s = 10 分
COUNT=0
while [ $COUNT -lt $MAX ]; do
  CHECKS=$(gh pr checks $PR 2>/dev/null)
  if [ -n "$CHECKS" ] && \
     echo "$CHECKS" | grep -qE '(fail|pass|cancelled|skipped)' && \
     ! echo "$CHECKS" | grep -qE '(pending|in_progress|queued)'; then
    echo "DONE"
    echo "$CHECKS"
    break
  fi
  COUNT=$((COUNT + 1))
  sleep 30
done
if [ $COUNT -ge $MAX ]; then echo "TIMEOUT"; fi
```

---

## Step 3. Monitor でバックグラウンドプロセスを待つ

Monitor ツールでバックグラウンドプロセスの出力を受け取り、完了を検知する。

---

## Step 4. CodeRabbit レビューコメントを取得する

CI 完了後、CodeRabbit のレビューコメントを取得する。

```bash
# PR レビューから CodeRabbit の本文を取得（先頭 800 文字）
gh api "repos/:owner/:repo/pulls/<PR番号>/reviews" \
  --jq '[.[] | select(.user.login == "coderabbitai[bot]")] | last | .body' \
  2>/dev/null | head -c 800

# CodeRabbit のインラインコメント件数
gh api "repos/:owner/:repo/pulls/<PR番号>/comments" \
  --jq '[.[] | select(.user.login == "coderabbitai[bot]")] | length' \
  2>/dev/null
```

取得に失敗した場合はスキップし、CI 結果のみ通知する。

---

## Step 5. PushNotification で結果を通知する

以下の形式でプッシュ通知を送る。

| 状況 | 通知タイトル | 本文 |
|------|------------|------|
| 全 pass・CodeRabbit コメントなし | ✅ CI 通過 | 「PR #N 全ジョブ通過。マージ可能です。」 |
| 全 pass・CodeRabbit コメントあり | ✅ CI 通過 / 🐰 CodeRabbit あり | 「PR #N 全ジョブ通過。CodeRabbit が N 件コメントしています。」＋コメント概要 |
| fail あり | ❌ CI 失敗 | 「PR #N [失敗ジョブ名] が失敗しました。」 |
| タイムアウト | ⏱ CI タイムアウト | 「PR #N: 10 分経過しても CI が完了しませんでした。手動確認してください。」 |

---

## 制約

- 通知後はユーザーの応答を待つ。自動でマージなどの破壊的操作は行わない
- ただし「CI が通ったらマージして」と明示された場合は通知後にマージを提案する（実行前に確認を取る）
