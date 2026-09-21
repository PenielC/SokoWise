import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { SellerRegistrationForm } from "@/components/sellers/SellerRegistrationForm";

export const metadata: Metadata = { title: "Register as a Seller" };

export default async function SellerRegisterPage() {
  const user = await requireUser("/sellers/register");
  if (user.sellerId) redirect("/dashboard/seller");

  return (
    <main className="container-page flex justify-center py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-sm shadow-ink-900/5 sm:p-8">
        <h1 className="text-xl font-bold text-ink-900">Register as a seller</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add your business so you can submit and update your own prices.
        </p>
        <div className="mt-6">
          <SellerRegistrationForm />
        </div>
      </div>
    </main>
  );
}
