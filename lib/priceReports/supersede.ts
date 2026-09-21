import type { Prisma } from "@prisma/client";

/**
 * A new price report for a (product, seller) pair is meant to fully replace
 * whatever was previously "current" for that pair, regardless of who
 * submitted either one — otherwise removing the newest report would let an
 * older, previously-superseded ACTIVE row silently resurface as "current"
 * again. Call this inside the same transaction as the new report's create.
 */
export async function supersedePriorActiveReports(
  tx: Prisma.TransactionClient,
  { productId, sellerId }: { productId: string; sellerId: string },
): Promise<void> {
  await tx.priceReport.updateMany({
    where: { productId, sellerId, moderationStatus: "ACTIVE" },
    data: { moderationStatus: "REMOVED" },
  });
}
