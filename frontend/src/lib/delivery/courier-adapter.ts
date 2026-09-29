export interface ServiceabilityInput {
  originPostalCode: string;
  destinationPostalCode: string;
  weightGrams?: number;
}

export interface ServiceabilityResult {
  isServiceable: boolean;
  estimatedDays?: number;
  providerName: string;
}

export interface ShipmentInput {
  orderId: string;
  deliveryAddress: any;
  pickupAddress: any;
  weightGrams?: number;
}

export interface ShipmentResult {
  providerShipmentReference: string;
  trackingNumber: string;
  status: string;
}

export interface TrackingResult {
  trackingNumber: string;
  currentStatus: string;
  events: any[];
}

export interface CancellationResult {
  success: boolean;
  message?: string;
}

export interface CourierProvider {
  name: string;
  
  checkServiceability(input: ServiceabilityInput): Promise<ServiceabilityResult>;
  
  createShipment(input: ShipmentInput): Promise<ShipmentResult>;
  
  getTracking(reference: string): Promise<TrackingResult>;
  
  cancelShipment?(reference: string): Promise<CancellationResult>;
}
