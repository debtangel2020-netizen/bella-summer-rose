const whole = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const cents = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
});

/** Format an amount in cents as Rand, e.g. 45000 -> "R 450" */
export function rand(amountInCents: number): string {
  const value = amountInCents / 100;
  return amountInCents % 100 === 0 ? whole.format(value) : cents.format(value);
}

/** "450" or "450.50" -> 45000 / 45050 cents */
export function toCents(input: string | number): number {
  const n = typeof input === "number" ? input : parseFloat(String(input).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function shippingFor(country: string, subtotal: number, s: {
  domesticShipping: number;
  freeDomesticOver: number;
  internationalShipping: number;
}): number {
  const domestic = country.trim().toLowerCase() === "south africa";
  if (domestic) {
    if (s.freeDomesticOver > 0 && subtotal >= s.freeDomesticOver) return 0;
    return s.domesticShipping;
  }
  return s.internationalShipping;
}
