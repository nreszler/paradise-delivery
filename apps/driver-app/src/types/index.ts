export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicle: Vehicle;
  documents: Document[];
  rating: number;
  totalDeliveries: number;
  memberSince: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: 'car' | 'motorcycle' | 'bicycle';
}

export interface Document {
  id: string;
  type: 'license' | 'insurance' | 'registration' | 'background_check';
  status: 'verified' | 'pending' | 'expired';
  expiryDate?: string;
  uploadedAt: string;
}

export interface DeliveryJob {
  id: string;
  status: 'available' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  restaurant: Restaurant;
  customer: Customer;
  items: OrderItem[];
  earnings: Earnings;
  distance: number;
  estimatedTime: number;
  timestamp: string;
  notes?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: GeoLocation;
  pickupInstructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  location: GeoLocation;
  deliveryInstructions?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

export interface Earnings {
  basePay: number;
  distancePay: number;
  tip: number;
  bonus: number;
  total: number;
}

export interface DailyEarnings {
  date: string;
  deliveries: number;
  onlineHours: number;
  earnings: Earnings;
  prop22TopUp: number;
}

export interface WeeklyEarnings {
  weekStart: string;
  weekEnd: string;
  days: DailyEarnings[];
  total: Earnings;
  prop22Guarantee: {
    minimumEarned: number;
    actualEarned: number;
    topUpAmount: number;
    hoursWorked: number;
    status: 'pending' | 'qualified' | 'paid';
  };
}

export interface DeliveryPhoto {
  type: 'pickup' | 'delivery';
  url: string;
  timestamp: string;
  location: GeoLocation;
}

export interface DeliveryTimer {
  startedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  totalMinutes: number;
  flag?: 'too_fast' | 'too_slow' | null;
}

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
}
