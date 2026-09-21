import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Create an Account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <>
      <h1 className="text-xl font-bold text-ink-900">Join SokoWise</h1>
      <p className="mt-1 text-sm text-slate-600">
        Create an account to report prices, confirm listings, and flag anything that looks wrong.
      </p>
      <div className="mt-6">
        <SignUpForm from={from} />
      </div>
    </>
  );
}
