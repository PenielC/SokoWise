import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ConfirmFlagButtons } from "@/components/priceReports/ConfirmFlagButtons";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { STALE_INLINE_MESSAGE, type TrustLabel } from "@/lib/trust/labels";
import type { SellerListingView } from "@/lib/sellers/getSellerListings";

const TRUST_LABEL_TONE: Record<TrustLabel, "neutral" | "success" | "warning" | "danger"> = {
  "Newly reported": "neutral",
  "Community confirmed": "success",
  "Multiple reports": "success",
  "Possibly outdated": "warning",
  "Flagged for review": "danger",
};

export function SellerListingCard({
  listing,
  isAuthenticated,
  redirectPath,
}: {
  listing: SellerListingView;
  isAuthenticated: boolean;
  redirectPath: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm shadow-ink-900/5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-baseline justify-between gap-3">
        <Link
          href={`/products/${listing.product.id}`}
          className="font-semibold text-ink-900 hover:text-green-600"
        >
          {listing.product.name}
        </Link>
        <p className="text-xl font-bold tracking-tight text-ink-900">
          {formatPrice(listing.price, listing.currency)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{listing.sourceLabel}</Badge>
        <Badge tone={TRUST_LABEL_TONE[listing.trustLabel]} dot>
          {listing.trustLabel}
        </Badge>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Reported {formatRelativeTime(listing.submittedAt)}
        {listing.confirmationCount > 0
          ? ` · ${listing.confirmationCount} confirmation${listing.confirmationCount === 1 ? "" : "s"}`
          : ""}
      </p>

      {listing.trustLabel === "Possibly outdated" ? (
        <p className="mt-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-600">
          {STALE_INLINE_MESSAGE}
        </p>
      ) : null}

      <ConfirmFlagButtons
        priceReportId={listing.id}
        redirectPath={redirectPath}
        isAuthenticated={isAuthenticated}
        viewerHasConfirmed={listing.viewerHasConfirmed}
        viewerHasFlagged={listing.viewerHasFlagged}
      />
    </div>
  );
}
