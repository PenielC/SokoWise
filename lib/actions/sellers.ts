"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/session";
import { capabilities, requireCapability } from "@/lib/rbac";
import { sellerPriceSchema, sellerRegistrationSchema } from "@/lib/validation/seller";
import { supersedePriorActiveReports } from "@/lib/priceReports/supersede";
import { CURRENCY_BY_COUNTRY } from "@/lib/validation/country";
import type { ActionState } from "@/lib/actions/types";

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function registerSellerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser("/sellers/register");
  requireCapability(capabilities.canRegisterSeller(user), "You're already registered as a seller.");

  const parsed = sellerRegistrationSchema.safeParse({
    businessName: formData.get("businessName"),
    sellerType: formData.get("sellerType"),
    location: formData.get("location"),
    city: formData.get("city"),
    contactPhone: formData.get("contactPhone") || undefined,
    contactWhatsapp: formData.get("contactWhatsapp") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await prisma.seller.create({
    data: { userId: user.id, ...parsed.data },
  });

  // getCurrentUser() looks up sellerId fresh from the DB on every call, but
  // the shared (main) layout — where SiteHeader lives — is still subject to
  // Next.js's client-side router cache, which a plain redirect() doesn't
  // bust. Revalidating the layout forces the header to reflect the new
  // seller capability immediately instead of on the next unrelated navigation.
  revalidatePath("/", "layout");
  redirect("/dashboard/seller");
}

export async function submitSellerPriceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser("/dashboard/seller/prices/new");
  requireCapability(
    capabilities.canManageSellerListings(user),
    "You must register as a seller before submitting prices.",
  );

  const parsed = sellerPriceSchema.safeParse({
    productId: formData.get("productId"),
    price: formData.get("price"),
    availability: formData.get("availability") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return { error: "That product could not be found." };
  }

  // Resolved fresh from the DB (never trusted from the session) so the
  // currency always matches the seller's actual, current country.
  const seller = await prisma.seller.findUnique({ where: { id: user.sellerId! } });
  if (!seller) {
    return { error: "Your seller profile could not be found." };
  }
  const currency = CURRENCY_BY_COUNTRY[seller.country];

  await prisma.$transaction(async (tx) => {
    await supersedePriorActiveReports(tx, { productId: product.id, sellerId: user.sellerId! });
    await tx.priceReport.create({
      data: {
        productId: product.id,
        sellerId: user.sellerId!,
        sourceType: "SELLER",
        price: parsed.data.price,
        currency,
        availability: parsed.data.availability,
        submittedById: user.id,
        notes: parsed.data.notes || null,
      },
    });
  });

  revalidatePath("/dashboard/seller");
  revalidatePath(`/products/${product.id}`);
  redirect("/dashboard/seller");
}

export async function removeSellerListingAction(priceReportId: string): Promise<void> {
  const user = await requireUser("/dashboard/seller");
  requireCapability(capabilities.canManageSellerListings(user), "You must be a registered seller.");

  const report = await prisma.priceReport.findUnique({ where: { id: priceReportId } });
  if (!report || report.sellerId !== user.sellerId) {
    throw new Error("That listing does not belong to you.");
  }

  await prisma.priceReport.update({
    where: { id: priceReportId },
    data: { moderationStatus: "REMOVED" },
  });

  revalidatePath("/dashboard/seller");
  revalidatePath(`/products/${report.productId}`);
}
