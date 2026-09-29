export type UserRole = 'customer' | 'admin' | 'delivery_partner';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface CartItem { productId: string; variantId: string; quantity: number; addedAt?: string; productName?: string; size?: string; color?: string; imagePath?: string; priceMinor?: number; }

export interface Order { id: string; customerId: string; items: OrderItem[]; shippingAddress: ShippingAddress; subtotalMinor: number; discountMinor: number; shippingMinor: number; taxMinor: number; totalMinor: number; currency: string; status: OrderStatus; reservationExpiresAt?: string; createdAt: string; updatedAt: string; }

export type ShipmentStatus = 
  | 'fulfillment_pending'
  | 'packing'
  | 'ready_for_shipping'
  | 'booking_pending'
  | 'booked'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'return_initiated'
  | 'returning'
  | 'returned'
  | 'cancelled'
  | 'exception';

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  providerEventReference?: string;
  status: ShipmentStatus;
  originalProviderStatus?: string;
  eventTimestamp: string;
  receivedTimestamp: string;
  description: string;
  location?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  provider: string; // e.g. "internal", "shiprocket"
  providerShipmentReference?: string;
  trackingNumber?: string;
  status: ShipmentStatus;
  pickupAddressSnapshot?: ShippingAddress;
  deliveryAddressSnapshot?: ShippingAddress;
  packageWeightGrams?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAssignment {
  id: string;
  shipmentId: string;
  deliveryPartnerId: string;
  status: 'assigned' | 'accepted' | 'rejected' | 'completed' | 'revoked';
  assignedAt: string;
  updatedAt: string;
}

type ProductStatus = "draft" | "active" | "archived";

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subCategory?: string;
  imagePaths: string[];
  basePriceMinor: number;
  currency: string;
  featured: boolean;
  isComfortSection?: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  sizes?: string[];
  colors?: string[];
  colorVariants?: { colorName: string; imagePaths: string[] }[];
  material?: string;
  careInstructions?: string;
  shippingReturns?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  offerPriceMinor?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  priceMinor: number;
  stockAvailable: number;
  stockReserved: number;
}


export interface ShippingAddress {
  id?: string;
  fullName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince?: string;
  postalCode?: string;
  countryCode: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "pending_payment"
  | "payment_processing"
  | "confirmed"
  | "cancelled"
  | "expired";

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitPriceMinor: number;
  imagePath?: string;
}

export interface CheckoutQuote {
  items: OrderItem[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  expiresAt: string;
}




export type PaymentStatus =
  | "created"
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerId: string;
  provider: string;
  providerPaymentReference?: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  orderId: string;
  providerRefundReference: string;
  amountMinor: number;
  reason?: string;
  status: "pending" | "succeeded" | "failed";
  createdAt: string;
}

