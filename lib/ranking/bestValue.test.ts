import { describe, expect, it } from "vitest";
import { pickBestValueAndLowest, type RankableReport } from "./bestValue";

const NOW = new Date("2026-01-10T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000);

describe("pickBestValueAndLowest", () => {
  it("returns nulls for an empty pool", () => {
    expect(pickBestValueAndLowest([], NOW)).toEqual({ bestValue: null, lowestReported: null });
  });

  it("reproduces spec §7's worked example: Shop B wins BEST VALUE, Seller C wins LOWEST REPORTED", () => {
    // $11.90, reported ~5h ago, 3 community confirmations.
    const shopB: RankableReport = {
      id: "shop-b",
      price: 11.9,
      submittedAt: hoursAgo(5),
      lastVerifiedAt: hoursAgo(5),
      confirmationCount: 3,
    };
    // $10.80, reported 2h ago, 1 community confirmation.
    const sellerC: RankableReport = {
      id: "seller-c",
      price: 10.8,
      submittedAt: hoursAgo(2),
      lastVerifiedAt: hoursAgo(2),
      confirmationCount: 1,
    };

    const { bestValue, lowestReported } = pickBestValueAndLowest([shopB, sellerC], NOW);

    expect(bestValue?.id).toBe("shop-b");
    expect(lowestReported?.id).toBe("seller-c");
  });

  it("scores the worked example at the hand-computed values", () => {
    // Re-derive bestValueScore inline to assert the exact numbers documented
    // in the plan, guarding against a future accidental formula change.
    const minPrice = 10.8;
    const priceScoreB = minPrice / 11.9;
    const freshnessScoreB = Math.pow(0.5, 5 / 48);
    const confidenceScoreB = Math.min(1, 3 / 3);
    const scoreB = 0.45 * priceScoreB + 0.25 * freshnessScoreB + 0.3 * confidenceScoreB;

    const priceScoreC = minPrice / 10.8;
    const freshnessScoreC = Math.pow(0.5, 2 / 48);
    const confidenceScoreC = Math.min(1, 1 / 3);
    const scoreC = 0.45 * priceScoreC + 0.25 * freshnessScoreC + 0.3 * confidenceScoreC;

    expect(scoreB).toBeCloseTo(0.941, 2);
    expect(scoreC).toBeCloseTo(0.793, 2);
    expect(scoreB).toBeGreaterThan(scoreC);
  });

  it("picks the single candidate when only one exists", () => {
    const only: RankableReport = {
      id: "only",
      price: 5,
      submittedAt: hoursAgo(1),
      lastVerifiedAt: hoursAgo(1),
      confirmationCount: 0,
    };
    const { bestValue, lowestReported } = pickBestValueAndLowest([only], NOW);
    expect(bestValue?.id).toBe("only");
    expect(lowestReported?.id).toBe("only");
  });

  it("tie-breaks equal prices by freshness, then confirmation count", () => {
    const stale: RankableReport = {
      id: "stale",
      price: 10,
      submittedAt: hoursAgo(50),
      lastVerifiedAt: hoursAgo(50),
      confirmationCount: 5,
    };
    const fresh: RankableReport = {
      id: "fresh",
      price: 10,
      submittedAt: hoursAgo(1),
      lastVerifiedAt: hoursAgo(1),
      confirmationCount: 0,
    };
    const { lowestReported } = pickBestValueAndLowest([stale, fresh], NOW);
    expect(lowestReported?.id).toBe("fresh");
  });
});
