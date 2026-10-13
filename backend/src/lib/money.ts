export const STORE_CURRENCY = "INR";
export function formatMoney(minor: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: STORE_CURRENCY,
  }).format((Number.isFinite(minor) ? minor : 0) / 100);
}
