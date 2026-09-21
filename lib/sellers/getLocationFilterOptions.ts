import { prisma } from "@/lib/db/client";
import { COUNTRY_LABEL, type CountryCode } from "@/lib/validation/country";

export type LocationFilterOptions = {
  countries: { value: CountryCode; label: string }[];
  cities: string[];
};

/**
 * Countries and cities to populate the filter dropdowns with — derived from
 * sellers that actually have at least one ACTIVE listing, not a hardcoded
 * exhaustive list, so the filter never offers an option that returns zero
 * results. Cities are scoped to `country` when given, for basic
 * country-then-city cascading without needing any client-side JS (each
 * selection is a full page reload with the new filter applied).
 */
export async function getLocationFilterOptions(country?: CountryCode): Promise<LocationFilterOptions> {
  const sellersWithActiveListings = await prisma.seller.findMany({
    where: { priceReports: { some: { moderationStatus: "ACTIVE" } } },
    select: { country: true, city: true },
    distinct: ["country", "city"],
  });

  const countrySet = new Set(sellersWithActiveListings.map((s) => s.country));
  const cities = sellersWithActiveListings
    .filter((s) => !country || s.country === country)
    .map((s) => s.city);

  return {
    countries: [...countrySet].sort().map((value) => ({ value, label: COUNTRY_LABEL[value] })),
    cities: [...new Set(cities)].sort(),
  };
}
