"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/sign-in";
import { emptyActionState } from "@/lib/actions/types";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SignInForm({ from }: { from?: string }) {
  const [state, formAction] = useActionState(signInAction, emptyActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="from" value={from ?? ""} />

      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      <SubmitButton pendingLabel="Signing in…">Sign In</SubmitButton>

      <p className="text-center text-sm text-slate-600">
        New to SokoWise?{" "}
        <Link
          href={from ? `/sign-up?from=${encodeURIComponent(from)}` : "/sign-up"}
          className="font-semibold text-green-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
