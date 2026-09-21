// Deterministic, non-AI product-name normalization for the P0 pass — handles
// the exact variations named in spec §8 ("cooking oil 5 litre" / "5L cooking
// oil" / "five litre cooking oil"). This is a placeholder for the P1
// AI-assisted normalization fast-follow, not a general-purpose NLP solution.

const NUMBER_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  twenty: "20",
};

const UNIT_PATTERNS: Array<[RegExp, string]> = [
  [/(\d+)\s*(litres|liters|litre|liter|l)\b/g, "$1l"],
  [/(\d+)\s*(kilograms|kilogram|kilos|kilo|kg)\b/g, "$1kg"],
  [/(\d+)\s*(grams|gram|g)\b/g, "$1g"],
];

export function normalizeProductName(raw: string): string {
  let normalized = raw.toLowerCase().trim();
  normalized = normalized.replace(/[^a-z0-9\s]/g, " ");
  normalized = normalized.replace(/\s+/g, " ").trim();

  normalized = normalized
    .split(" ")
    .map((token) => NUMBER_WORDS[token] ?? token)
    .join(" ");

  for (const [pattern, replacement] of UNIT_PATTERNS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized.replace(/\s+/g, " ").trim();
}

export function searchTokensOf(query: string): string[] {
  return normalizeProductName(query).split(" ").filter(Boolean);
}
