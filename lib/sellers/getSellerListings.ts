import type { Seller } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { toPlainNumber } from "@/lib/serialize";
import { computeSourceLabel, computeTrustLabel } from "@/lib/trust/labels";
import type { PriceReportView } from "@/lib/products/getProductComparison";

export type SellerListingView = Omit<PriceReportView, "seller"> & {
  product: { id: string; name: string; unit: string };
};

export async function getSellerListings(
  sellerId: string,
  options: { now?: Date; viewerId?: string } = {},
): Promise<{ seller: Seller; listings: SellerListingView[] } | null> {
  const { now = new Date(), viewerId } = options;

  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!seller) return null;

  // Only the latest ACTIVE report per product is "current" — see the matching
  // comment in getProductComparison.ts for why (price updates insert new rows).
  const rawReports = await prisma.priceReport.findMany({
    where: { sellerId, moderationStatus: "ACTIVE" },
    include: {
      product: true,
      confirmations: { select: { userId: true } },
      flags: { select: { userId: true, status: true } },
    },
    orderBy: [{ productId: "asc" }, { submittedAt: "desc" }],
    distinct: ["productId"],
  });

  const listings: SellerListingView[] = rawReports.map((report) => {
    const confirmationCount = report.confirmations.length;
    const openFlagCount = report.flags.filter((flag) => flag.status === "OPEN").length;

    return {
      id: report.id,
      price: toPlainNumber(report.price),
      currency: report.currency,
      availability: report.availability,
      sourceType: report.sourceType,
      sourceLabel: computeSourceLabel(report.sourceType),
      trustLabel: computeTrustLabel({
        submittedAt: report.submittedAt,
        lastVerifiedAt: report.lastVerifiedAt,
        confirmationCount,
        openFlagCount,
        now,
      }),
      submittedAt: report.submittedAt,
      lastVerifiedAt: report.lastVerifiedAt,
      confirmationCount,
      openFlagCount,
      viewerHasConfirmed: viewerId ? report.confirmations.some((c) => c.userId === viewerId) : false,
      viewerHasFlagged: viewerId ? report.flags.some((f) => f.userId === viewerId) : false,
      notes: report.notes,
      product: { id: report.product.id, name: report.product.name, unit: report.product.unit },
    };
  });

  listings.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  return { seller, listings };
}
