export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  RestaurantDetail: { restaurantId: string };
  ItemDetail: { itemId: string; restaurantId: string };
  Cart: undefined;
  AddressSelect: undefined;
  Payment: undefined;
  OrderConfirmation: undefined;
  OrderPlaced: { orderId: string };
  LiveTracking: { orderId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Restaurants: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  LocationPermission: undefined;
};

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  distance: number;
  categories: string[];
  hours: {
    open: string;
    close: string;
  };
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
  modifiers?: Modifier[];
  popular?: boolean;
}

export interface Modifier {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
}

export interface SelectedModifier {
  modifierId: string;
  optionIds: string[];
}

export interface Cart {
  items: CartItem[];
  restaurantId: string | null;
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
  isDefault: boolean;
  latitude: number;
  longitude: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  fees: {
    service: number;
    delivery: number;
    tax: number;
  };
  total: number;
  deliveryAddress: Address;
  estimatedDeliveryTime: string;
  createdAt: string;
  driver?: Driver;
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  phone: string;
  vehicleType: string;
  licensePlate?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  healthScore: number;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}