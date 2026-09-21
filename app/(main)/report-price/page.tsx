import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/session";
import { ReportPriceForm, ReportPriceCancelLink } from "@/components/priceReports/ReportPriceForm";

export const metadata: Metadata = { title: "Report a Price" };

export default async function ReportPricePage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  if (!productId) notFound();

  await requireUser(`/report-price?productId=${productId}`);

  const [product, sellers] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.seller.findMany({
      orderBy: { businessName: "asc" },
      select: { id: true, businessName: true, location: true, country: true },
    }),
  ]);
  if (!product) notFound();

  return (
    <main className="container-page flex justify-center py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-sm shadow-ink-900/5 sm:p-8">
        <h1 className="text-xl font-bold text-ink-900">Report a price</h1>
        <p className="mt-1 text-sm text-slate-600">
          {product.name} · {product.category} · {product.unit}
        </p>

        <div className="mt-6">
          <ReportPriceForm productId={product.id} sellers={sellers} />
        </div>
        <div className="mt-3">
          <ReportPriceCancelLink productId={product.id} />
        </div>
      </div>
    </main>
  );
}
