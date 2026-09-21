import type { Prisma } from "@prisma/client";

// Prisma's Decimal type can't cross the Server -> Client Component boundary
// (it isn't a plain serializable value) — always convert PriceReport.price
// to a number before passing it to a Client Component.
export function toPlainNumber(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : Number(value);
}
