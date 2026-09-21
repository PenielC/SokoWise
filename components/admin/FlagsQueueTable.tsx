"use client";

import Link from "next/link";
import { resolveFlagAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import type { FlagQueueItem } from "@/lib/admin/getFlagsQueue";

function ResolveButtons({ flagId }: { flagId: string }) {
  return (
    <div className="flex gap-2">
      <form
        action={resolveFlagAction.bind(null, flagId, "REMOVED")}
        onSubmit={(event) => {
          if (!window.confirm("Remove this price report? It will no longer be shown publicly.")) {
            event.preventDefault();
          }
        }}
      >
        <Button type="submit" variant="danger" className="!px-3 !py-1.5 text-xs">
          Remove report
        </Button>
      </form>
      <form action={resolveFlagAction.bind(null, flagId, "DISMISSED")}>
        <Button type="submit" variant="ghost" className="!px-3 !py-1.5 text-xs">
          Dismiss flag
        </Button>
      </form>
    </div>
  );
}

export function FlagsQueueTable({ flags }: { flags: FlagQueueItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      {flags.map((flag) => (
        <div key={flag.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm shadow-ink-900/5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/products/${flag.report.productId}`}
                  className="font-semibold text-ink-900 hover:text-green-600"
                >
                  {flag.report.productName}
                </Link>
                <Badge tone="danger" dot>
                  {flag.reasonLabel}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {formatPrice(flag.report.price, flag.report.currency)} · {flag.report.sellerName} ·{" "}
                {flag.report.sourceLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Flagged by {flag.reporterName} · {formatRelativeTime(flag.createdAt)}
              </p>
              {flag.comment ? <p className="mt-2 text-sm text-slate-600">&ldquo;{flag.comment}&rdquo;</p> : null}
            </div>
            <ResolveButtons flagId={flag.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
