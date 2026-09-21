import { describe, expect, it } from "vitest";
import { normalizeProductName, searchTokensOf } from "./normalize";

describe("normalizeProductName", () => {
  it("normalizes spec §8's cooking-oil variations to the same unit token", () => {
    expect(normalizeProductName("5L cooking oil")).toBe("5l cooking oil");
    expect(normalizeProductName("cooking oil 5 litre")).toContain("5l");
    expect(normalizeProductName("five litre cooking oil")).toContain("5l");
  });

  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeProductName("  Cooking   Oil  ")).toBe("cooking oil");
  });

  it("strips punctuation", () => {
    expect(normalizeProductName("Mealie-Meal, 20kg!")).toBe("mealie meal 20kg");
  });

  it("normalizes kilogram variants", () => {
    expect(normalizeProductName("20 kilograms mealie meal")).toBe("20kg mealie meal");
    expect(normalizeProductName("20kg mealie meal")).toBe("20kg mealie meal");
  });
});

describe("searchTokensOf", () => {
  it("splits a normalized query into non-empty tokens", () => {
    expect(searchTokensOf("  cheap  5L cooking oil ")).toEqual(["cheap", "5l", "cooking", "oil"]);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchTokensOf("   ")).toEqual([]);
  });
});
