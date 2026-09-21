import { prisma } from "@/lib/db/client";
import { searchTokensOf } from "./normalize";
import type { CountryCode } from "@/lib/validation/country";

export type SearchFilters = {
  country?: CountryCode;
  city?: string;
};

/**
 * Deterministic search: match products where every query token appears
 * somewhere in the name, normalized name, or category — a simple stand-in
 * for imperfect-wording tolerance (spec §9) until the P1 AI-assisted
 * natural-language search fast-follow replaces the matching strategy here.
 *
 * Country/city are a location filter, not a text token: a product only
 * matches when it has at least one ACTIVE report from a seller in that
 * country/city — otherwise you'd "find" a product with a filtered location
 * that has zero relevant results once you open it, per spec §3's
 * "Location/context" requirement.
 */
export async function searchProducts(query: string, filters: SearchFilters = {}) {
  const tokens = searchTokensOf(query);
  const { country, city } = filters;

  const locationCondition =
    country || city
      ? {
          priceReports: {
            some: {
              moderationStatus: "ACTIVE" as const,
              seller: {
                ...(country ? { country } : {}),
                ...(city ? { city } : {}),
              },
            },
          },
        }
      : {};

  if (tokens.length === 0) {
    return prisma.product.findMany({
      where: locationCondition,
      orderBy: { name: "asc" },
      take: 20,
    });
  }

  return prisma.product.findMany({
    where: {
      AND: [
        ...tokens.map((token) => ({
          OR: [
            { normalizedName: { contains: token, mode: "insensitive" as const } },
            { name: { contains: token, mode: "insensitive" as const } },
            { category: { contains: token, mode: "insensitive" as const } },
          ],
        })),
        locationCondition,
      ],
    },
    orderBy: { name: "asc" },
    take: 20,
  });
}
