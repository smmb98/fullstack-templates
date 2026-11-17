export const localeConfig = {
  locale: "en-US",
  currency: "USD",
  available: {
    "en-US": { currency: "USD", label: "United States (USD)" },
    "en-PK": { currency: "PKR", label: "Pakistan (PKR)" },
  },
} as const;

export function formatMoney(money: { amount: number; currency: "USD" | "PKR" }): string {
  return new Intl.NumberFormat(localeConfig.locale, {
    style: "currency",
    currency: money.currency,
  }).format(money.amount / 100);
}
