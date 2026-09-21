import { z } from "zod";
import { countries } from "@/lib/validation/country";

export const sellerTypes = [
  "SUPERMARKET",
  "GROCERY",
  "WHOLESALER",
  "MARKET_SELLER",
  "INDEPENDENT_RETAILER",
] as const;

export const SELLER_TYPE_LABEL: Record<(typeof sellerTypes)[number], string> = {
  SUPERMARKET: "Supermarket",
  GROCERY: "Grocery shop",
  WHOLESALER: "Wholesaler",
  MARKET_SELLER: "Market seller",
  INDEPENDENT_RETAILER: "Independent retailer",
};

export const priceReportSchema = z
  .object({
    productId: z.string().min(1, "A product is required."),
    sellerId: z.string().optional(),
    newSellerName: z.string().trim().min(2, "Enter the seller's name.").optional(),
    newSellerType: z.enum(sellerTypes).optional(),
    newSellerCountry: z.enum(countries).optional(),
    newSellerLocation: z.string().trim().min(2, "Enter the seller's location.").optional(),
    price: z.coerce.number().positive("Enter a price greater than zero."),
    availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"]).default("UNKNOWN"),
    notes: z.string().trim().max(280, "Keep notes under 280 characters.").optional(),
  })
  .refine(
    (data) =>
      Boolean(data.sellerId) ||
      Boolean(data.newSellerName && data.newSellerType && data.newSellerCountry && data.newSellerLocation),
    { message: "Select an existing seller or enter a new seller's details.", path: ["sellerId"] },
  );

export type PriceReportInput = z.infer<typeof priceReportSchema>;
