import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <>
      <h1 className="text-xl font-bold text-ink-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600">Sign in to report, confirm, or flag prices.</p>
      <div className="mt-6">
        <SignInForm from={from} />
      </div>
    </>
  );
}
