import { freshnessAnchor, hoursSince } from "@/lib/trust/freshness";

export type RankableReport = {
  id: string;
  price: number;
  submittedAt: Date;
  lastVerifiedAt: Date;
  confirmationCount: number;
};

function ageHoursOf(report: RankableReport, now: Date): number {
  return hoursSince(freshnessAnchor(report), now);
}

/**
 * "Best affordable option" per spec §7 — weighs price, freshness, and
 * community confidence, not just the lowest number. Ratio-to-minimum price
 * scoring (not min-max normalization) is deliberate: with only two
 * candidates, min-max normalization inverts the spec's own worked example.
 */
function bestValueScore(report: RankableReport, minPrice: number, now: Date): number {
  const priceScore = minPrice / report.price;
  const freshnessScore = Math.pow(0.5, ageHoursOf(report, now) / 48);
  const confidenceScore = Math.min(1, report.confirmationCount / 3);
  return 0.45 * priceScore + 0.25 * freshnessScore + 0.3 * confidenceScore;
}

export function pickBestValueAndLowest<T extends RankableReport>(
  reports: T[],
  now: Date = new Date(),
): { bestValue: T | null; lowestReported: T | null } {
  if (reports.length === 0) {
    return { bestValue: null, lowestReported: null };
  }

  const minPrice = Math.min(...reports.map((r) => r.price));

  let bestValue = reports[0];
  let bestScore = bestValueScore(bestValue, minPrice, now);
  for (const report of reports.slice(1)) {
    const score = bestValueScore(report, minPrice, now);
    if (score > bestScore) {
      bestValue = report;
      bestScore = score;
    }
  }

  let lowestReported = reports[0];
  for (const report of reports.slice(1)) {
    if (report.price < lowestReported.price) {
      lowestReported = report;
      continue;
    }
    if (report.price !== lowestReported.price) continue;

    // Tie-break: freshest anchor first, then higher confirmation count.
    const reportAge = ageHoursOf(report, now);
    const currentAge = ageHoursOf(lowestReported, now);
    if (reportAge < currentAge) {
      lowestReported = report;
    } else if (reportAge === currentAge && report.confirmationCount > lowestReported.confirmationCount) {
      lowestReported = report;
    }
  }

  return { bestValue, lowestReported };
}
