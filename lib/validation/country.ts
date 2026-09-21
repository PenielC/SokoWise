export const countries = [
  "ZIMBABWE",
  "KENYA",
  "SOUTH_AFRICA",
  "NIGERIA",
  "GHANA",
  "UGANDA",
  "TANZANIA",
  "ZAMBIA",
  "MOZAMBIQUE",
  "BOTSWANA",
] as const;

export type CountryCode = (typeof countries)[number];

export const COUNTRY_LABEL: Record<CountryCode, string> = {
  ZIMBABWE: "Zimbabwe",
  KENYA: "Kenya",
  SOUTH_AFRICA: "South Africa",
  NIGERIA: "Nigeria",
  GHANA: "Ghana",
  UGANDA: "Uganda",
  TANZANIA: "Tanzania",
  ZAMBIA: "Zambia",
  MOZAMBIQUE: "Mozambique",
  BOTSWANA: "Botswana",
};

export function isCountryCode(value: string): value is CountryCode {
  return (countries as readonly string[]).includes(value);
}

// The main currency actually in circulation for everyday retail prices in
// each country — not necessarily the sole official currency (e.g. Zimbabwe's
// official currency is the ZWL, but USD is what's actually used informally
// for this kind of pricing; see README's "Zimbabwe's informal-USD reality").
export const CURRENCY_BY_COUNTRY: Record<CountryCode, string> = {
  ZIMBABWE: "USD",
  KENYA: "KES",
  SOUTH_AFRICA: "ZAR",
  NIGERIA: "NGN",
  GHANA: "GHS",
  UGANDA: "UGX",
  TANZANIA: "TZS",
  ZAMBIA: "ZMW",
  MOZAMBIQUE: "MZN",
  BOTSWANA: "BWP",
};
