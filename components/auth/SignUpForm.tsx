"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
import { emptyActionState } from "@/lib/actions/types";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SignUpForm({ from }: { from?: string }) {
  const [state, formAction] = useActionState(signUpAction, emptyActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="from" value={from ?? ""} />

      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" autoComplete="name" required />
      </Field>

      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      <SubmitButton pendingLabel="Creating your account…">Create account</SubmitButton>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href={from ? `/sign-in?from=${encodeURIComponent(from)}` : "/sign-in"}
          className="font-semibold text-green-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
