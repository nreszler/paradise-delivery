export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  rating: number;
  totalDeliveries: number;
  acceptanceRate: number;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: 'car' | 'motorcycle' | 'bicycle' | 'scooter';
}

export interface Document {
  id: string;
  type: 'license' | 'insurance' | 'registration' | 'background_check';
  status: 'pending' | 'verified' | 'expired' | 'rejected';
  url?: string;
  uploadedAt: string;
  expiresAt?: string;
  number?: string;
}

export interface Earnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  prop22Hours: number;
  prop22Qualifying: boolean;
  healthcareStipend: number;
}

export interface EarningBreakdown {
  basePay: number;
  mileagePay: number;
  tips: number;
  promotions: number;
  prop22Adjustment: number;
  total: number;
}

export interface DeliveryJob {
  id: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    phone: string;
  };
  customer: {
    id: string;
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    phone: string;
    instructions?: string;
  };
  items: OrderItem[];
  estimatedEarnings: number;
  distance: number;
  pickupTime: string;
  status: 'available' | 'accepted' | 'at_restaurant' | 'picked_up' | 'en_route' | 'at_customer' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  specialInstructions?: string;
}

export interface ActiveDelivery {
  job: DeliveryJob;
  status: DeliveryStatus;
  startedAt: string;
  acceptedAt: string;
  arrivedAtRestaurantAt?: string;
  pickedUpAt?: string;
  arrivedAtCustomerAt?: string;
  deliveredAt?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
  earnings: EarningBreakdown;
  timerSeconds: number;
}

export type DeliveryStatus = 
  | 'accepted'
  | 'at_restaurant'
  | 'picked_up'
  | 'en_route'
  | 'at_customer'
  | 'delivered';

export interface DeliveryHistory {
  id: string;
  job: DeliveryJob;
  completedAt: string;
  earnings: EarningBreakdown;
  customerRating?: number;
  issues?: string[];
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  timestamp: number;
  deliveryId?: string;
}

export interface Notification {
  id: string;
  type: 'new_job' | 'order_update' | 'earnings' | 'document_expiry' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DeliveryFlow: { jobId: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Earnings: undefined;
  Jobs: undefined;
  Deliveries: undefined;
  Profile: undefined;
};

export type DeliveryFlowParamList = {
  JobAccepted: { jobId: string };
  AtRestaurant: { jobId: string };
  EnRoute: { jobId: string };
  AtCustomer: { jobId: string };
  DeliveryComplete: { jobId: string };
};
