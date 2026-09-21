import { prisma } from "@/lib/db/client";
import { COUNTRY_LABEL } from "@/lib/validation/country";

export type SellerReviewItem = {
  id: string;
  businessName: string;
  sellerType: string;
  location: string;
  city: string;
  countryLabel: string;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "SUSPENDED";
  hasAccount: boolean;
  activeListingCount: number;
  openFlagCount: number;
};

export async function getSellersForReview(): Promise<SellerReviewItem[]> {
  const sellers = await prisma.seller.findMany({
    include: {
      _count: {
        select: { priceReports: { where: { moderationStatus: "ACTIVE" } } },
      },
      priceReports: {
        select: { flags: { where: { status: "OPEN" }, select: { id: true } } },
      },
    },
    orderBy: { businessName: "asc" },
  });

  return sellers.map((seller) => ({
    id: seller.id,
    businessName: seller.businessName,
    sellerType: seller.sellerType,
    location: seller.location,
    city: seller.city,
    countryLabel: COUNTRY_LABEL[seller.country],
    verificationStatus: seller.verificationStatus,
    hasAccount: seller.userId !== null,
    activeListingCount: seller._count.priceReports,
    openFlagCount: seller.priceReports.reduce((sum, report) => sum + report.flags.length, 0),
  }));
}
