'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ja">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-xl font-semibold">予期しないエラーが発生しました</h1>
          <button
            onClick={reset}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            再試行
          </button>
        </main>
      </body>
    </html>
  );
}
