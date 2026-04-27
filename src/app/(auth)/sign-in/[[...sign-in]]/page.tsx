import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-full flex flex-col items-center justify-center px-4 md:px-6 bg-gray-50">
      <SignIn />
    </main>
  );
}
