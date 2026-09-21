import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { toPlainNumber } from "@/lib/serialize";
import { PriceForm } from "@/components/dashboard/PriceForm";

export const metadata: Metadata = { title: "Update a Price" };

export default async function EditSellerPricePage({
  params,
}: {
  params: Promise<{ priceReportId: string }>;
}) {
  const { priceReportId } = await params;
  const user = await requireUser(`/dashboard/seller/prices/${priceReportId}/edit`);
  if (!user.sellerId) redirect("/sellers/register");

  const report = await prisma.priceReport.findUnique({
    where: { id: priceReportId },
    include: { product: true },
  });
  if (!report || report.sellerId !== user.sellerId) notFound();

  return (
    <main className="container-page flex justify-center py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-sm shadow-ink-900/5 sm:p-8">
        <h1 className="text-xl font-bold text-ink-900">Update price</h1>
        <p className="mt-1 text-sm text-slate-600">
          This creates a new price report — your previous one stays in history.
        </p>
        <div className="mt-6">
          <PriceForm
            lockedProduct={{ id: report.product.id, name: report.product.name, unit: report.product.unit }}
            currency={report.currency}
            defaultPrice={toPlainNumber(report.price)}
            defaultAvailability={report.availability}
            defaultNotes={report.notes ?? undefined}
          />
        </div>
      </div>
    </main>
  );
}
