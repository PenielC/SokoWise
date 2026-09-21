import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-sm font-bold text-ink-900">
            SokoWise
          </Link>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Community-powered price discovery, comparison, and verification — built for the
            Andela × Open Society Foundations civic-tech hackathon.
          </p>
        </div>

        <nav aria-label="Footer" className="flex gap-4 text-xs font-medium text-slate-600">
          <Link href="/search" className="hover:text-green-600">
            Search
          </Link>
          <Link href="/sign-up" className="hover:text-green-600">
            Become a contributor
          </Link>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-1 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SokoWise.</p>
          <p>Demo data — prices shown are for demonstration only, not real-world current prices.</p>
        </div>
      </div>
    </footer>
  );
}
