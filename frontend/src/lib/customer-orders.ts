// Delivery is the final fulfilment stage. Shipment status also covers older
// orders whose order document still says "confirmed" after delivery.
export function isCompletedOrder(order: {
  status: string;
  shipmentStatus: string | null;
}) {
  return order.status === "delivered" || order.shipmentStatus === "delivered";
}
