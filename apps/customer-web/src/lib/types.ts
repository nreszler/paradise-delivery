export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: number;
  image: string;
  isLocallyOwned: boolean;
  isPartner: boolean;
  description: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  hours: string;
  address: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
  addOns?: AddOn[];
  dietary?: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedAddOns: AddOn[];
  specialInstructions: string;
}

export interface Cart {
  items: CartItem[];
  restaurantId: string | null;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  smallOrderFee: number;
  tax: number;
  tip: number;
  total: number;
  createdAt: string;
  estimatedDelivery: string;
  deliveryAddress: Address;
  driver?: Driver;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  instructions?: string;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  image: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  accountHealth: number;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}
