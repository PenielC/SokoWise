"use client";

import Link from "next/link";
import { removeSellerListingAction } from "@/lib/actions/sellers";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { type TrustLabel } from "@/lib/trust/labels";
import type { SellerListingView } from "@/lib/sellers/getSellerListings";

const TRUST_LABEL_TONE: Record<TrustLabel, "neutral" | "success" | "warning" | "danger"> = {
  "Newly reported": "neutral",
  "Community confirmed": "success",
  "Multiple reports": "success",
  "Possibly outdated": "warning",
  "Flagged for review": "danger",
};

function RemoveListingButton({ priceReportId }: { priceReportId: string }) {
  return (
    <form
      action={removeSellerListingAction.bind(null, priceReportId)}
      onSubmit={(event) => {
        if (!window.confirm("Remove this listing? It will no longer be shown publicly.")) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" className="!px-3 !py-1.5 text-xs text-red-600 hover:!border-red-300">
        Remove
      </Button>
    </form>
  );
}

export function SellerListingsTable({ listings }: { listings: SellerListingView[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {listings.map((listing) => (
        <div key={listing.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm shadow-ink-900/5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold text-ink-900">{listing.product.name}</p>
            <p className="text-xl font-bold tracking-tight text-ink-900">
              {formatPrice(listing.price, listing.currency)}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={TRUST_LABEL_TONE[listing.trustLabel]} dot>
              {listing.trustLabel}
            </Badge>
            {listing.availability === "OUT_OF_STOCK" ? <Badge tone="danger">Out of stock</Badge> : null}
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Submitted {formatRelativeTime(listing.submittedAt)}
            {listing.confirmationCount > 0
              ? ` · ${listing.confirmationCount} confirmation${listing.confirmationCount === 1 ? "" : "s"}`
              : ""}
          </p>

          <div className="mt-4 flex gap-2">
            <Button href={`/dashboard/seller/prices/${listing.id}/edit`} variant="ghost" className="!px-3 !py-1.5 text-xs">
              Update price
            </Button>
            <RemoveListingButton priceReportId={listing.id} />
            <Link
              href={`/products/${listing.product.id}`}
              className="ml-auto self-center text-xs font-medium text-green-600 hover:underline"
            >
              View public page
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
