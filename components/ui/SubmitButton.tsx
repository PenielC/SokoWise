"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={cn("w-full", className)}>
      {pending ? (pendingLabel ?? "Please wait…") : children}
    </Button>
  );
}
