"use client";

import Link from "next/link";
import { updateSellerVerificationAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SellerReviewItem } from "@/lib/admin/getSellersForReview";

const STATUS_TONE = {
  UNVERIFIED: "neutral",
  VERIFIED: "success",
  SUSPENDED: "danger",
} as const;

function StatusActions({ sellerId, status }: { sellerId: string; status: SellerReviewItem["verificationStatus"] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "VERIFIED" ? (
        <form action={updateSellerVerificationAction.bind(null, sellerId, "VERIFIED")}>
          <Button type="submit" variant="ghost" className="!px-3 !py-1.5 text-xs">
            Verify
          </Button>
        </form>
      ) : null}
      {status !== "SUSPENDED" ? (
        <form
          action={updateSellerVerificationAction.bind(null, sellerId, "SUSPENDED")}
          onSubmit={(event) => {
            if (!window.confirm("Suspend this seller? Their listings stay visible but flagged as suspended.")) {
              event.preventDefault();
            }
          }}
        >
          <Button type="submit" variant="danger" className="!px-3 !py-1.5 text-xs">
            Suspend
          </Button>
        </form>
      ) : null}
      {status !== "UNVERIFIED" ? (
        <form action={updateSellerVerificationAction.bind(null, sellerId, "UNVERIFIED")}>
          <Button type="submit" variant="ghost" className="!px-3 !py-1.5 text-xs">
            Reset to unverified
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function SellerReviewTable({ sellers }: { sellers: SellerReviewItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      {sellers.map((seller) => (
        <div key={seller.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm shadow-ink-900/5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/sellers/${seller.id}`} className="font-semibold text-ink-900 hover:text-green-600">
                  {seller.businessName}
                </Link>
                <Badge tone={STATUS_TONE[seller.verificationStatus]} dot>
                  {seller.verificationStatus}
                </Badge>
                {!seller.hasAccount ? <Badge tone="neutral">Informal — no account</Badge> : null}
                {seller.openFlagCount > 0 ? (
                  <Badge tone="danger">
                    {seller.openFlagCount} open flag{seller.openFlagCount === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {seller.location}, {seller.city}, {seller.countryLabel} · {seller.activeListingCount} active
                listing{seller.activeListingCount === 1 ? "" : "s"}
              </p>
            </div>
            <StatusActions sellerId={seller.id} status={seller.verificationStatus} />
          </div>
        </div>
      ))}
    </div>
  );
}
