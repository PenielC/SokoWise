import { z } from "zod";
import { sellerTypes } from "@/lib/validation/priceReport";
import { countries } from "@/lib/validation/country";

export const sellerRegistrationSchema = z.object({
  businessName: z.string().trim().min(2, "Enter your business or stall name."),
  sellerType: z.enum(sellerTypes),
  country: z.enum(countries),
  location: z.string().trim().min(2, "Enter your location."),
  city: z.string().trim().min(2, "Enter your city."),
  contactPhone: z.string().trim().optional(),
  contactWhatsapp: z.string().trim().optional(),
});

export type SellerRegistrationInput = z.infer<typeof sellerRegistrationSchema>;

export const sellerPriceSchema = z.object({
  productId: z.string().min(1, "Choose a product."),
  price: z.coerce.number().positive("Enter a price greater than zero."),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"]).default("UNKNOWN"),
  notes: z.string().trim().max(280, "Keep notes under 280 characters.").optional(),
});

export type SellerPriceInput = z.infer<typeof sellerPriceSchema>;
