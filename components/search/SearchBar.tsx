import { Button } from "@/components/ui/Button";

// A plain GET form works without any client-side JavaScript — important for
// the low-bandwidth accessibility requirement (spec §9).
export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      method="GET"
      className="flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-white p-1.5 pl-4 shadow-sm shadow-ink-900/5 transition-shadow focus-within:border-green-600 focus-within:ring-4 focus-within:ring-green-600/10"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-slate-500"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        name="q"
        placeholder="Search for a product, e.g. 5L cooking oil"
        defaultValue={defaultValue}
        aria-label="Search for a product"
        className="w-full border-0 bg-transparent py-2 text-sm text-ink-900 outline-none placeholder:text-slate-500"
      />
      <Button type="submit" className="shrink-0">
        Search
      </Button>
    </form>
  );
}
