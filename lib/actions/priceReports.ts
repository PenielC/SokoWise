"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/session";
import { capabilities, requireCapability } from "@/lib/rbac";
import { priceReportSchema } from "@/lib/validation/priceReport";
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

export async function submitPriceReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const user = await requireUser(`/report-price?productId=${productId}`);
  requireCapability(
    capabilities.canSubmitCommunityReport(user),
    "You must be signed in to report a price.",
  );

  const parsed = priceReportSchema.safeParse({
    productId,
    sellerId: formData.get("sellerId") || undefined,
    newSellerName: formData.get("newSellerName") || undefined,
    newSellerType: formData.get("newSellerType") || undefined,
    newSellerCountry: formData.get("newSellerCountry") || undefined,
    newSellerLocation: formData.get("newSellerLocation") || undefined,
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

  let sellerId = parsed.data.sellerId;
  let currency: string;
  if (!sellerId) {
    // A community member reporting a price for a seller who isn't in the
    // system yet — exactly the "sellers with no online presence" scenario
    // the product exists to address (spec §1). No linked user account.
    const seller = await prisma.seller.create({
      data: {
        businessName: parsed.data.newSellerName!,
        sellerType: parsed.data.newSellerType!,
        country: parsed.data.newSellerCountry!,
        location: parsed.data.newSellerLocation!,
      },
    });
    sellerId = seller.id;
    currency = CURRENCY_BY_COUNTRY[seller.country];
  } else {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return { error: "That seller could not be found." };
    }
    currency = CURRENCY_BY_COUNTRY[seller.country];
  }

  await prisma.$transaction(async (tx) => {
    await supersedePriorActiveReports(tx, { productId: product.id, sellerId });
    await tx.priceReport.create({
      data: {
        productId: product.id,
        sellerId,
        sourceType: "COMMUNITY",
        price: parsed.data.price,
        currency,
        availability: parsed.data.availability,
        submittedById: user.id,
        notes: parsed.data.notes || null,
      },
    });
  });

  revalidatePath(`/products/${product.id}`);
  return { success: true };
}
