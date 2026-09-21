"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { confirmReportAction } from "@/lib/actions/confirmations";
import { flagReportAction } from "@/lib/actions/flags";
import { emptyActionState } from "@/lib/actions/types";
import { flagReasons, FLAG_REASON_LABEL } from "@/lib/validation/flag";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ConfirmFlagButtons({
  priceReportId,
  redirectPath,
  isAuthenticated,
  viewerHasConfirmed,
  viewerHasFlagged,
}: {
  priceReportId: string;
  redirectPath: string;
  isAuthenticated: boolean;
  viewerHasConfirmed: boolean;
  viewerHasFlagged: boolean;
}) {
  const [flagOpen, setFlagOpen] = useState(false);
  const confirmAction = confirmReportAction.bind(null, priceReportId, redirectPath);
  const flagAction = flagReportAction.bind(null, priceReportId, redirectPath);
  const [confirmState, confirmFormAction] = useActionState(confirmAction, emptyActionState);
  const [flagState, flagFormAction] = useActionState(flagAction, emptyActionState);

  if (!isAuthenticated) {
    return (
      <p className="mt-3 text-xs text-slate-500">
        <Link href={`/sign-in?from=${encodeURIComponent(redirectPath)}`} className="font-semibold text-green-600 hover:underline">
          Sign in
        </Link>{" "}
        to confirm or flag this price.
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      {confirmState.error ? <p className="mb-2 text-xs text-red-600">{confirmState.error}</p> : null}
      {flagState.error ? <p className="mb-2 text-xs text-red-600">{flagState.error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        {viewerHasConfirmed ? (
          <span className="text-xs font-medium text-green-600">✓ You confirmed this</span>
        ) : (
          <form action={confirmFormAction}>
            <Button type="submit" variant="ghost" className="!px-3 !py-1.5 text-xs">
              Still accurate?
            </Button>
          </form>
        )}

        {viewerHasFlagged ? (
          <span className="text-xs font-medium text-red-600">⚑ You flagged this</span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="!px-3 !py-1.5 text-xs"
            onClick={() => setFlagOpen((open) => !open)}
          >
            Flag
          </Button>
        )}
      </div>

      {flagOpen && !viewerHasFlagged ? (
        <form action={flagFormAction} className="mt-3 space-y-2 rounded-lg bg-mist p-3">
          <Select name="reason" required defaultValue="">
            <option value="" disabled>
              Why are you flagging this?
            </option>
            {flagReasons.map((reason) => (
              <option key={reason} value={reason}>
                {FLAG_REASON_LABEL[reason]}
              </option>
            ))}
          </Select>
          <Textarea name="comment" placeholder="Optional details" rows={2} />
          <SubmitButton pendingLabel="Submitting…" className="!w-auto !px-4 !py-1.5 text-xs">
            Submit flag
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
