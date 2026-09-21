import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { LocationFilterOptions } from "@/lib/sellers/getLocationFilterOptions";
import type { CountryCode } from "@/lib/validation/country";

export function LocationFilterBar({
  action,
  hiddenFields,
  options,
  selectedCountry,
  selectedCity,
}: {
  /** Where the filter form submits to — `/search` on the search page, or the current product's own URL on the product page. */
  action: string;
  /** Extra fields to carry through unchanged, e.g. the current search query. */
  hiddenFields?: Record<string, string>;
  options: LocationFilterOptions;
  selectedCountry?: CountryCode;
  selectedCity?: string;
}) {
  return (
    <div>
      <form action={action} method="GET" className="flex flex-wrap items-end gap-3">
        {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

        <div className="min-w-[9rem] flex-1">
          <label htmlFor="country" className="text-xs font-medium text-slate-600">
            Country
          </label>
          <Select id="country" name="country" defaultValue={selectedCountry ?? ""} className="mt-1">
            <option value="">All countries</option>
            {options.countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-[9rem] flex-1">
          <label htmlFor="city" className="text-xs font-medium text-slate-600">
            City
          </label>
          <Select id="city" name="city" defaultValue={selectedCity ?? ""} className="mt-1">
            <option value="">All cities</option>
            {options.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" variant="ghost" className="!px-4 !py-2.5 text-sm">
          Apply filters
        </Button>
      </form>
      <p className="mt-1.5 text-xs text-slate-500">
        Only countries and cities with active sellers are listed.
      </p>
    </div>
  );
}
