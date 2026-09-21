import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getSellersForReview } from "@/lib/admin/getSellersForReview";
import { AdminNav } from "@/components/admin/AdminNav";
import { SellerReviewTable } from "@/components/admin/SellerReviewTable";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Sellers" };

export default async function AdminSellersPage() {
  await requireAdmin("/admin/sellers");
  const sellers = await getSellersForReview();

  return (
    <main className="container-page flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Admin</h1>
        <p className="text-sm text-slate-600">Moderation and platform activity.</p>
      </div>

      <AdminNav active="/admin/sellers" />

      {sellers.length === 0 ? (
        <EmptyState title="No sellers registered yet" />
      ) : (
        <SellerReviewTable sellers={sellers} />
      )}
    </main>
  );
}
