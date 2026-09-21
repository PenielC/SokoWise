import { z } from "zod";

export const flagReasons = [
  "OUTDATED",
  "INCORRECT_PRICE",
  "SELLER_NOT_FOUND",
  "SUSPICIOUS",
  "OTHER",
] as const;

export const flagSchema = z.object({
  reason: z.enum(flagReasons),
  comment: z.string().trim().max(280, "Keep it under 280 characters.").optional(),
});

export type FlagInput = z.infer<typeof flagSchema>;

export const FLAG_REASON_LABEL: Record<(typeof flagReasons)[number], string> = {
  OUTDATED: "Price is outdated",
  INCORRECT_PRICE: "Price is incorrect",
  SELLER_NOT_FOUND: "Seller not found at this location",
  SUSPICIOUS: "Suspicious or implausible",
  OTHER: "Other",
};
