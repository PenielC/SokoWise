import { describe, expect, it } from "vitest";
import {
  computeConflictingReportsMessage,
  computeNoDataMessage,
  computeSourceLabel,
  computeTrustLabel,
} from "./labels";

const NOW = new Date("2026-01-10T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000);

describe("computeSourceLabel", () => {
  it("maps SELLER and COMMUNITY to their display strings", () => {
    expect(computeSourceLabel("SELLER")).toBe("Seller submitted");
    expect(computeSourceLabel("COMMUNITY")).toBe("Community reported");
  });
});

describe("computeTrustLabel", () => {
  it("flags for review regardless of age/confirmations when an open flag exists", () => {
    const label = computeTrustLabel({
      submittedAt: hoursAgo(1),
      lastVerifiedAt: hoursAgo(1),
      confirmationCount: 5,
      openFlagCount: 1,
      now: NOW,
    });
    expect(label).toBe("Flagged for review");
  });

  it("is possibly outdated past 72 hours with no flags", () => {
    const label = computeTrustLabel({
      submittedAt: hoursAgo(73),
      lastVerifiedAt: hoursAgo(73),
      confirmationCount: 0,
      openFlagCount: 0,
      now: NOW,
    });
    expect(label).toBe("Possibly outdated");
  });

  it("is not outdated at exactly 72 hours", () => {
    const label = computeTrustLabel({
      submittedAt: hoursAgo(72),
      lastVerifiedAt: hoursAgo(72),
      confirmationCount: 0,
      openFlagCount: 0,
      now: NOW,
    });
    expect(label).not.toBe("Possibly outdated");
  });

  it("is multiple reports at 3+ confirmations within the freshness window", () => {
    const label = computeTrustLabel({
      submittedAt: hoursAgo(10),
      lastVerifiedAt: hoursAgo(10),
      confirmationCount: 3,
      openFlagCount: 0,
      now: NOW,
    });
    expect(label).toBe("Multiple reports");
  });

  it("is community confirmed at 1-2 confirmations", () => {
    const label = computeTrustLabel({
      submittedAt: hoursAgo(10),
      lastVerifiedAt: hoursAgo(10),
      confirmationCount: 1,
      openFlagCount: 0,
      now: NOW,
    });
    expect(label).toBe("Community confirmed");
  });

  it("is newly reported with zero confirmations and fresh age", () => {
    const label = computeTrustLabel({
      submittedAt: hoursAgo(1),
      lastVerifiedAt: hoursAgo(1),
      confirmationCount: 0,
      openFlagCount: 0,
      now: NOW,
    });
    expect(label).toBe("Newly reported");
  });

  it("uses the more recent of submittedAt/lastVerifiedAt as the freshness anchor", () => {
    // Submitted long ago, but recently re-verified -> should not be outdated.
    const label = computeTrustLabel({
      submittedAt: hoursAgo(200),
      lastVerifiedAt: hoursAgo(1),
      confirmationCount: 0,
      openFlagCount: 0,
      now: NOW,
    });
    expect(label).toBe("Newly reported");
  });
});

describe("computeNoDataMessage", () => {
  it("returns the exact spec copy when there are zero active reports", () => {
    expect(computeNoDataMessage(0)).toBe(
      "We don't have enough current price information for this product yet.",
    );
  });

  it("returns null when reports exist", () => {
    expect(computeNoDataMessage(1)).toBeNull();
  });
});

describe("computeConflictingReportsMessage", () => {
  it("returns the exact spec copy when price spread exceeds 50% of the minimum", () => {
    expect(computeConflictingReportsMessage([10, 20])).toBe(
      "Community reports show different prices. Check the seller before travelling.",
    );
  });

  it("returns null when prices are close together", () => {
    expect(computeConflictingReportsMessage([10, 12])).toBeNull();
  });

  it("returns null with fewer than two prices", () => {
    expect(computeConflictingReportsMessage([10])).toBeNull();
  });
});
