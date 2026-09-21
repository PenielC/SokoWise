import { prisma } from "@/lib/db/client";

export type AdminOverview = {
  openFlagCount: number;
  sellerCount: number;
  activeReportCount: number;
  userCount: number;
  recentAuditLog: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: Date;
    actorName: string;
  }[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const [openFlagCount, sellerCount, activeReportCount, userCount, auditLogEntries] = await Promise.all([
    prisma.flag.count({ where: { status: "OPEN" } }),
    prisma.seller.count(),
    prisma.priceReport.count({ where: { moderationStatus: "ACTIVE" } }),
    prisma.user.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return {
    openFlagCount,
    sellerCount,
    activeReportCount,
    userCount,
    recentAuditLog: auditLogEntries.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      createdAt: entry.createdAt,
      actorName: entry.actor.name,
    })),
  };
}
