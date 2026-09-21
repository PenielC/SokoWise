import Link from "next/link";
import { searchProducts } from "@/lib/search/searchProducts";
import { getLocationFilterOptions } from "@/lib/sellers/getLocationFilterOptions";
import { isCountryCode, COUNTRY_LABEL } from "@/lib/validation/country";
import { SearchBar } from "@/components/search/SearchBar";
import { LocationFilterBar } from "@/components/search/LocationFilterBar";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; city?: string }>;
}) {
  const { q, country: countryParam, city: cityParam } = await searchParams;
  const query = q?.trim() ?? "";
  const country = countryParam && isCountryCode(countryParam) ? countryParam : undefined;
  const city = cityParam?.trim() || undefined;
  const hasLocationFilter = Boolean(country || city);

  const [products, locationOptions] = await Promise.all([
    query || hasLocationFilter ? searchProducts(query, { country, city }) : Promise.resolve([]),
    getLocationFilterOptions(country),
  ]);

  const resultsLabel = [
    query ? `"${query}"` : null,
    city ? city : null,
    country ? COUNTRY_LABEL[country] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="flex flex-col">
      <div className="hero-surface border-b border-border">
        <div className="container-page flex flex-col items-center gap-4 py-10">
          <SearchBar defaultValue={query} />
        </div>
      </div>

      <div className="container-page flex flex-col gap-6 py-8">
        <LocationFilterBar
          action="/search"
          hiddenFields={{ q: query }}
          options={locationOptions}
          selectedCountry={country}
          selectedCity={city}
        />

        {!query && !hasLocationFilter ? (
          <EmptyState title="Search for a product, or filter by location, to get started" />
        ) : products.length === 0 ? (
          <EmptyState
            title={`No products matched ${resultsLabel}`}
            description="Try a shorter search, a different location, or clear a filter."
          />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-600">
              {products.length} result{products.length === 1 ? "" : "s"}
              {resultsLabel ? <> for {resultsLabel}</> : null}
            </p>
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm shadow-ink-900/5 transition-all hover:-translate-y-0.5 hover:border-green-600/40 hover:shadow-md"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-sm font-bold text-green-600">
                  {product.name.charAt(0)}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-ink-900 group-hover:text-green-600">
                    {product.name}
                  </span>
                  <span className="block text-sm text-slate-600">
                    {product.category} · {product.unit}
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-600"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
