import { freshnessAnchor, hoursSince } from "./freshness";

export type TrustLabel =
  | "Newly reported"
  | "Community confirmed"
  | "Multiple reports"
  | "Possibly outdated"
  | "Flagged for review";

export type SourceLabel = "Seller submitted" | "Community reported";

export function computeSourceLabel(sourceType: "SELLER" | "COMMUNITY"): SourceLabel {
  return sourceType === "SELLER" ? "Seller submitted" : "Community reported";
}

/**
 * Deterministic, priority-ordered trust label — see spec §6. First match
 * wins. Never persisted: age keeps changing, so this must always be computed
 * at read time from the report's stored timestamps and live counts.
 */
export function computeTrustLabel(input: {
  submittedAt: Date;
  lastVerifiedAt: Date;
  confirmationCount: number;
  openFlagCount: number;
  now?: Date;
}): TrustLabel {
  const { confirmationCount, openFlagCount, now } = input;

  if (openFlagCount >= 1) return "Flagged for review";

  const ageHours = hoursSince(freshnessAnchor(input), now);
  if (ageHours > 72) return "Possibly outdated";
  if (confirmationCount >= 3) return "Multiple reports";
  if (confirmationCount >= 1) return "Community confirmed";
  return "Newly reported";
}

export const STALE_INLINE_MESSAGE = "This price hasn't been confirmed recently.";
export const NO_DATA_MESSAGE = "We don't have enough current price information for this product yet.";
export const CONFLICTING_REPORTS_MESSAGE =
  "Community reports show different prices. Check the seller before travelling.";

export function computeNoDataMessage(activeReportCount: number): string | null {
  return activeReportCount === 0 ? NO_DATA_MESSAGE : null;
}

/** Wide price spread (>50% of the minimum) across active reports for one product. */
export function computeConflictingReportsMessage(prices: number[]): string | null {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min <= 0) return null;
  return (max - min) / min > 0.5 ? CONFLICTING_REPORTS_MESSAGE : null;
}
