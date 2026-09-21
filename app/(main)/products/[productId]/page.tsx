import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductComparison } from "@/lib/products/getProductComparison";
import { getLocationFilterOptions } from "@/lib/sellers/getLocationFilterOptions";
import { isCountryCode } from "@/lib/validation/country";
import { PriceReportCard } from "@/components/products/PriceReportCard";
import { LocationFilterBar } from "@/components/search/LocationFilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ country?: string; city?: string }>;
}) {
  const { productId } = await params;
  const { country: countryParam, city: cityParam } = await searchParams;
  const country = countryParam && isCountryCode(countryParam) ? countryParam : undefined;
  const city = cityParam?.trim() || undefined;

  const user = await getCurrentUser();
  const [comparison, locationOptions] = await Promise.all([
    getProductComparison(productId, { viewerId: user?.id, country, city }),
    getLocationFilterOptions(country),
  ]);
  if (!comparison) notFound();

  const { product, reports, bestValueId, lowestReportedId, noDataMessage, conflictingReportsMessage } =
    comparison;

  return (
    <main className="flex flex-col">
      <div className="hero-surface border-b border-border">
        <div className="container-page flex flex-col gap-4 py-8">
          <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-green-600">
            ← Back to search
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-lg font-bold text-green-600">
                {product.name.charAt(0)}
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                  {product.name}
                </h1>
                <p className="text-sm text-slate-600">
                  {product.category} · {product.unit}
                  {reports.length > 0
                    ? ` · ${reports.length} active price report${reports.length === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
            </div>
            <Button href={`/report-price?productId=${product.id}`} variant="secondary">
              Report a price
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col gap-6 py-8">
        <LocationFilterBar
          action={`/products/${product.id}`}
          options={locationOptions}
          selectedCountry={country}
          selectedCity={city}
        />

        {conflictingReportsMessage ? (
          <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{conflictingReportsMessage}</span>
          </div>
        ) : null}

        {noDataMessage ? (
          <EmptyState
            title={noDataMessage}
            description={country || city ? "Try clearing the location filter above." : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((report) => (
              <PriceReportCard
                key={report.id}
                report={report}
                isBestValue={report.id === bestValueId}
                isLowestReported={report.id === lowestReportedId}
                isAuthenticated={Boolean(user)}
                redirectPath={`/products/${product.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
