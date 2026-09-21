import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { CURRENCY_BY_COUNTRY } from "@/lib/validation/country";
import { PriceForm } from "@/components/dashboard/PriceForm";

export const metadata: Metadata = { title: "Add a Price" };

export default async function NewSellerPricePage() {
  const user = await requireUser("/dashboard/seller/prices/new");
  if (!user.sellerId) redirect("/sellers/register");

  const [products, seller] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true },
    }),
    prisma.seller.findUnique({ where: { id: user.sellerId }, select: { country: true } }),
  ]);
  const currency = CURRENCY_BY_COUNTRY[seller!.country];

  return (
    <main className="container-page flex justify-center py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-sm shadow-ink-900/5 sm:p-8">
        <h1 className="text-xl font-bold text-ink-900">Add a price</h1>
        <p className="mt-1 text-sm text-slate-600">List a product you sell and its current price.</p>
        <div className="mt-6">
          <PriceForm products={products} currency={currency} />
        </div>
      </div>
    </main>
  );
}
