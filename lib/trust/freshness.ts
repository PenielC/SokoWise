export function hoursSince(date: Date, now: Date = new Date()): number {
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
}

/**
 * A report's "freshness anchor" is the more recent of when it was first
 * submitted and when it was last confirmed/re-verified — a report confirmed
 * yesterday is fresher than its original (older) submission date.
 */
export function freshnessAnchor(report: { submittedAt: Date; lastVerifiedAt: Date }): Date {
  return report.submittedAt > report.lastVerifiedAt ? report.submittedAt : report.lastVerifiedAt;
}
