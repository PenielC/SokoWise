import { prisma } from "@/lib/db/client";
import { toPlainNumber } from "@/lib/serialize";
import { FLAG_REASON_LABEL, type flagReasons } from "@/lib/validation/flag";

export type FlagQueueItem = {
  id: string;
  reason: (typeof flagReasons)[number];
  reasonLabel: string;
  comment: string | null;
  createdAt: Date;
  reporterName: string;
  report: {
    id: string;
    price: number;
    currency: string;
    sourceLabel: "Seller submitted" | "Community reported";
    productId: string;
    productName: string;
    sellerName: string;
  };
};

/** Every OPEN flag, oldest first, with enough context to judge it without another click. */
export async function getFlagsQueue(): Promise<FlagQueueItem[]> {
  const flags = await prisma.flag.findMany({
    where: { status: "OPEN" },
    include: {
      user: { select: { name: true } },
      priceReport: { include: { product: true, seller: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return flags.map((flag) => ({
    id: flag.id,
    reason: flag.reason,
    reasonLabel: FLAG_REASON_LABEL[flag.reason],
    comment: flag.comment,
    createdAt: flag.createdAt,
    reporterName: flag.user.name,
    report: {
      id: flag.priceReport.id,
      price: toPlainNumber(flag.priceReport.price),
      currency: flag.priceReport.currency,
      sourceLabel: flag.priceReport.sourceType === "SELLER" ? "Seller submitted" : "Community reported",
      productId: flag.priceReport.product.id,
      productName: flag.priceReport.product.name,
      sellerName: flag.priceReport.seller.businessName,
    },
  }));
}
