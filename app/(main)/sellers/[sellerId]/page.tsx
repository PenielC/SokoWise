import { notFound } from "next/navigation";
import { getSellerListings } from "@/lib/sellers/getSellerListings";
import { SellerListingCard } from "@/components/sellers/SellerListingCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/auth/session";
import { COUNTRY_LABEL } from "@/lib/validation/country";

const SELLER_TYPE_LABEL: Record<string, string> = {
  SUPERMARKET: "Supermarket",
  GROCERY: "Grocery shop",
  WHOLESALER: "Wholesaler",
  MARKET_SELLER: "Market seller",
  INDEPENDENT_RETAILER: "Independent retailer",
};

export default async function SellerPage({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  const user = await getCurrentUser();
  const result = await getSellerListings(sellerId, { viewerId: user?.id });
  if (!result) notFound();

  const { seller, listings } = result;

  return (
    <main className="flex flex-col">
      <div className="hero-surface border-b border-border">
        <div className="container-page flex items-center gap-4 py-8">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-lg font-bold text-green-600">
            {seller.businessName.charAt(0)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                {seller.businessName}
              </h1>
              {seller.verificationStatus === "VERIFIED" ? (
                <Badge tone="success" dot>
                  Verified
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-slate-600">
              {SELLER_TYPE_LABEL[seller.sellerType] ?? seller.sellerType} · {seller.location},{" "}
              {seller.city}, {COUNTRY_LABEL[seller.country]}
            </p>
            {seller.contactPhone ? (
              <p className="mt-1 text-sm font-medium text-ink-900">{seller.contactPhone}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {listings.length === 0 ? (
          <EmptyState title="This seller has no active price listings yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <SellerListingCard
                key={listing.id}
                listing={listing}
                isAuthenticated={Boolean(user)}
                redirectPath={`/sellers/${seller.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
