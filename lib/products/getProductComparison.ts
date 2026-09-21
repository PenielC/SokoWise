import type { Availability, SellerVerificationStatus, SourceType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { toPlainNumber } from "@/lib/serialize";
import {
  computeConflictingReportsMessage,
  computeNoDataMessage,
  computeSourceLabel,
  computeTrustLabel,
  type SourceLabel,
  type TrustLabel,
} from "@/lib/trust/labels";
import { pickBestValueAndLowest } from "@/lib/ranking/bestValue";
import { COUNTRY_LABEL, type CountryCode } from "@/lib/validation/country";

export type PriceReportView = {
  id: string;
  price: number;
  currency: string;
  availability: Availability;
  sourceType: SourceType;
  sourceLabel: SourceLabel;
  trustLabel: TrustLabel;
  submittedAt: Date;
  lastVerifiedAt: Date;
  confirmationCount: number;
  openFlagCount: number;
  viewerHasConfirmed: boolean;
  viewerHasFlagged: boolean;
  notes: string | null;
  seller: {
    id: string;
    businessName: string;
    location: string;
    city: string;
    country: CountryCode;
    countryLabel: string;
    verificationStatus: SellerVerificationStatus;
  };
};

export type ProductComparison = {
  product: { id: string; name: string; category: string; unit: string; brand: string | null };
  reports: PriceReportView[];
  bestValueId: string | null;
  lowestReportedId: string | null;
  noDataMessage: string | null;
  conflictingReportsMessage: string | null;
};

/**
 * Assembles everything the product comparison page needs: active price
 * reports with computed trust/source labels, and the BEST VALUE / LOWEST
 * REPORTED picks — all from candidates with zero open flags (a flagged
 * report stays visible but never wins a badge, per spec §6/§7).
 */
export async function getProductComparison(
  productId: string,
  options: { now?: Date; viewerId?: string; country?: CountryCode; city?: string } = {},
): Promise<ProductComparison | null> {
  const { now = new Date(), viewerId, country, city } = options;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;

  // A seller can submit more than one ACTIVE report over time for the same
  // product (each price update inserts a new row rather than mutating one in
  // place, so history/confirmations stay intact — see plan's data model
  // notes). Only the latest one per seller is "current" and shown here;
  // `distinct` + a matching `orderBy` gives Postgres DISTINCT ON semantics.
  const rawReports = await prisma.priceReport.findMany({
    where: {
      productId,
      moderationStatus: "ACTIVE",
      seller: {
        ...(country ? { country } : {}),
        ...(city ? { city } : {}),
      },
    },
    include: {
      seller: true,
      confirmations: { select: { userId: true } },
      flags: { select: { userId: true, status: true } },
    },
    orderBy: [{ sellerId: "asc" }, { submittedAt: "desc" }],
    distinct: ["sellerId"],
  });

  const reports: PriceReportView[] = rawReports.map((report) => {
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
      seller: {
        id: report.seller.id,
        businessName: report.seller.businessName,
        location: report.seller.location,
        city: report.seller.city,
        country: report.seller.country,
        countryLabel: COUNTRY_LABEL[report.seller.country],
        verificationStatus: report.seller.verificationStatus,
      },
    };
  });

  // `distinct` above orders by sellerId to pick the right row per group;
  // re-sort for display now that dedup is done.
  reports.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  const candidatePool = reports.filter((report) => report.openFlagCount === 0);
  const { bestValue, lowestReported } = pickBestValueAndLowest(
    candidatePool.map((report) => ({
      id: report.id,
      price: report.price,
      submittedAt: report.submittedAt,
      lastVerifiedAt: report.lastVerifiedAt,
      confirmationCount: report.confirmationCount,
    })),
    now,
  );

  return {
    product,
    reports,
    bestValueId: bestValue?.id ?? null,
    lowestReportedId: lowestReported?.id ?? null,
    noDataMessage: computeNoDataMessage(reports.length),
    conflictingReportsMessage: computeConflictingReportsMessage(reports.map((report) => report.price)),
  };
}
