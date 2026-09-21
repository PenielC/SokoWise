"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";

export async function resolveFlagAction(
  flagId: string,
  resolution: "REMOVED" | "DISMISSED",
): Promise<void> {
  const admin = await requireAdmin("/admin/flags");

  const flag = await prisma.flag.findUnique({ where: { id: flagId } });
  if (!flag) throw new Error("Flag not found.");
  if (flag.status !== "OPEN") return; // already resolved by someone else — no-op

  await prisma.$transaction(async (tx) => {
    await tx.flag.update({
      where: { id: flagId },
      data: {
        status: resolution === "REMOVED" ? "RESOLVED_REMOVED" : "RESOLVED_DISMISSED",
        resolvedAt: new Date(),
        resolvedById: admin.id,
      },
    });

    if (resolution === "REMOVED") {
      await tx.priceReport.update({
        where: { id: flag.priceReportId },
        data: { moderationStatus: "REMOVED" },
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: resolution === "REMOVED" ? "FLAG_RESOLVED_REMOVED" : "FLAG_RESOLVED_DISMISSED",
        entityType: "Flag",
        entityId: flagId,
        metadata: { priceReportId: flag.priceReportId, reason: flag.reason },
      },
    });
  });

  revalidatePath("/admin/flags");
  revalidatePath("/admin");
}

export async function updateSellerVerificationAction(
  sellerId: string,
  status: "VERIFIED" | "UNVERIFIED" | "SUSPENDED",
): Promise<void> {
  const admin = await requireAdmin("/admin/sellers");

  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!seller) throw new Error("Seller not found.");

  await prisma.$transaction(async (tx) => {
    await tx.seller.update({ where: { id: sellerId }, data: { verificationStatus: status } });
    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: `SELLER_STATUS_${status}`,
        entityType: "Seller",
        entityId: sellerId,
        metadata: { previousStatus: seller.verificationStatus, newStatus: status },
      },
    });
  });

  revalidatePath("/admin/sellers");
  revalidatePath(`/sellers/${sellerId}`);
}
