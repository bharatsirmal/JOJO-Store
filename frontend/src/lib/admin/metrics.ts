export function adminDate(value: unknown): Date | null {
  let date: Date;
  if (value && typeof (value as { toDate?: unknown }).toDate === "function")
    date = (value as { toDate: () => Date }).toDate();
  else if (value instanceof Date) date = value;
  else if (typeof value === "string" || typeof value === "number")
    date = new Date(value);
  else return null;
  return Number.isFinite(date.getTime()) ? date : null;
}
export function salesMetrics(
  orders: { status?: string; totalMinor?: number; createdAt?: unknown }[],
) {
  const days = new Map<string, { revenue: number; orders: number }>();
  let revenueMinor = 0;
  for (const order of orders) {
    if (
      !["confirmed", "paid", "processing", "shipped", "delivered"].includes(
        order.status || "",
      )
    )
      continue;
    const amount = Number.isFinite(order.totalMinor) ? order.totalMinor! : 0;
    revenueMinor += amount;
    const date = adminDate(order.createdAt);
    if (!date) continue;
    const key = date.toISOString().slice(0, 10),
      day = days.get(key) || { revenue: 0, orders: 0 };
    day.revenue += amount / 100;
    day.orders++;
    days.set(key, day);
  }
  return {
    revenueMinor,
    salesData: Array.from(days.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, day]) => ({ date, ...day })),
  };
}
