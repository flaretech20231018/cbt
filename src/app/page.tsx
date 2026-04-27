import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="text-lg font-semibold">CBT 思考記録</span>
        {userId ? (
          <UserButton />
        ) : (
          <Link href="/sign-in" className="text-sm text-blue-600 hover:underline">
            ログイン
          </Link>
        )}
      </header>
      <main className="flex flex-1 items-center justify-center">
        <h1 className="text-2xl font-semibold">CBT 思考記録</h1>
      </main>
    </div>
  );
}
