import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getSellerListings } from "@/lib/sellers/getSellerListings";
import { SellerListingsTable } from "@/components/dashboard/SellerListingsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "My Listings" };

export default async function SellerDashboardPage() {
  const user = await requireUser("/dashboard/seller");
  if (!user.sellerId) redirect("/sellers/register");

  const result = await getSellerListings(user.sellerId, { viewerId: user.id });
  const listings = result?.listings ?? [];

  return (
    <main className="container-page flex flex-col gap-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">My Listings</h1>
          <p className="text-sm text-slate-600">
            {result?.seller.businessName} · {listings.length} active listing
            {listings.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button href="/dashboard/seller/prices/new">Add a price</Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="You haven't listed any prices yet"
          description="Add your first price so consumers can find and compare it."
          action={<Button href="/dashboard/seller/prices/new">Add a price</Button>}
        />
      ) : (
        <SellerListingsTable listings={listings} />
      )}
    </main>
  );
}
