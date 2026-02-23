import { DeliveryJob, Driver, WeeklyEarnings, DailyEarnings } from '@/types';

export const mockDriver: Driver = {
  id: 'drv_001',
  name: 'Alex Johnson',
  email: 'alex.j@email.com',
  phone: '(555) 123-4567',
  avatar: undefined,
  vehicle: {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    color: 'Silver',
    licensePlate: 'ABC1234',
    type: 'car',
  },
  documents: [
    { id: 'doc_1', type: 'license', status: 'verified', expiryDate: '2027-05-15', uploadedAt: '2024-01-10' },
    { id: 'doc_2', type: 'insurance', status: 'verified', expiryDate: '2025-08-20', uploadedAt: '2024-01-10' },
    { id: 'doc_3', type: 'registration', status: 'verified', expiryDate: '2026-03-01', uploadedAt: '2024-01-10' },
    { id: 'doc_4', type: 'background_check', status: 'verified', uploadedAt: '2024-01-10' },
  ],
  rating: 4.92,
  totalDeliveries: 1247,
  memberSince: '2023-06-15',
};

export const mockAvailableJobs: DeliveryJob[] = [
  {
    id: 'job_001',
    status: 'available',
    restaurant: {
      id: 'rest_001',
      name: 'Burger Paradise',
      address: '123 Main St, Los Angeles, CA',
      phone: '(555) 111-2222',
      location: { lat: 34.0522, lng: -118.2437 },
      pickupInstructions: 'Park in rear lot, enter through back door',
    },
    customer: {
      id: 'cust_001',
      name: 'Sarah M.',
      phone: '(555) 987-6543',
      address: '456 Oak Ave, Los Angeles, CA 90012',
      location: { lat: 34.0555, lng: -118.2500 },
      deliveryInstructions: 'Leave at door, ring bell',
    },
    items: [
      { id: 'item_1', name: 'Double Cheeseburger', quantity: 2 },
      { id: 'item_2', name: 'Large Fries', quantity: 1 },
      { id: 'item_3', name: 'Chocolate Shake', quantity: 2 },
    ],
    earnings: {
      basePay: 5.00,
      distancePay: 3.60,
      tip: 4.50,
      bonus: 0,
      total: 13.10,
    },
    distance: 6.0,
    estimatedTime: 25,
    timestamp: new Date().toISOString(),
    notes: 'Customer requested extra napkins',
  },
  {
    id: 'job_002',
    status: 'available',
    restaurant: {
      id: 'rest_002',
      name: 'Pizza Heaven',
      address: '789 Sunset Blvd, Los Angeles, CA',
      phone: '(555) 333-4444',
      location: { lat: 34.0955, lng: -118.2450 },
    },
    customer: {
      id: 'cust_002',
      name: 'Mike R.',
      phone: '(555) 777-8888',
      address: '321 Hill St, Los Angeles, CA 90013',
      location: { lat: 34.0600, lng: -118.2350 },
      deliveryInstructions: 'Call upon arrival',
    },
    items: [
      { id: 'item_4', name: 'Large Pepperoni Pizza', quantity: 1 },
      { id: 'item_5', name: 'Garlic Bread', quantity: 1 },
      { id: 'item_6', name: '2L Soda', quantity: 1 },
    ],
    earnings: {
      basePay: 5.00,
      distancePay: 4.80,
      tip: 6.00,
      bonus: 2.00,
      total: 17.80,
    },
    distance: 8.0,
    estimatedTime: 35,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'job_003',
    status: 'available',
    restaurant: {
      id: 'rest_003',
      name: 'Sushi Express',
      address: '555 Ocean Ave, Santa Monica, CA',
      phone: '(555) 555-6666',
      location: { lat: 34.0195, lng: -118.4912 },
      pickupInstructions: 'Wait at counter',
    },
    customer: {
      id: 'cust_003',
      name: 'Emily W.',
      phone: '(555) 444-3333',
      address: '888 Beach Blvd, Santa Monica, CA 90401',
      location: { lat: 34.0150, lng: -118.4800 },
    },
    items: [
      { id: 'item_7', name: 'Spicy Tuna Roll', quantity: 2 },
      { id: 'item_8', name: 'California Roll', quantity: 1 },
      { id: 'item_9', name: 'Miso Soup', quantity: 2 },
    ],
    earnings: {
      basePay: 5.00,
      distancePay: 2.40,
      tip: 3.00,
      bonus: 0,
      total: 10.40,
    },
    distance: 4.0,
    estimatedTime: 18,
    timestamp: new Date().toISOString(),
  },
];

export const mockActiveJob: DeliveryJob = {
  id: 'job_active_001',
  status: 'picked_up',
  restaurant: {
    id: 'rest_004',
    name: 'Taco Paradise',
    address: '222 Market St, Los Angeles, CA',
    phone: '(555) 999-0000',
    location: { lat: 34.0400, lng: -118.2550 },
  },
  customer: {
    id: 'cust_004',
    name: 'David K.',
    phone: '(555) 222-1111',
    address: '777 Pine St, Los Angeles, CA 90014',
    location: { lat: 34.0480, lng: -118.2620 },
    deliveryInstructions: 'Gate code: 1234, 3rd floor',
  },
  items: [
    { id: 'item_10', name: 'Carne Asada Tacos', quantity: 3 },
    { id: 'item_11', name: 'Chips & Guac', quantity: 1 },
    { id: 'item_12', name: 'Horchata', quantity: 2 },
  ],
  earnings: {
    basePay: 5.00,
    distancePay: 2.10,
    tip: 5.00,
    bonus: 0,
    total: 12.10,
  },
  distance: 3.5,
  estimatedTime: 15,
  timestamp: new Date().toISOString(),
};

export const mockDailyEarnings: DailyEarnings = {
  date: new Date().toISOString().split('T')[0],
  deliveries: 8,
  onlineHours: 5.5,
  earnings: {
    basePay: 40.00,
    distancePay: 28.80,
    tip: 32.50,
    bonus: 10.00,
    total: 111.30,
  },
  prop22TopUp: 0,
};

export const mockWeeklyEarnings: WeeklyEarnings = {
  weekStart: '2026-02-16',
  weekEnd: '2026-02-22',
  days: [
    { date: '2026-02-16', deliveries: 12, onlineHours: 8, earnings: { basePay: 60, distancePay: 45, tip: 48, bonus: 15, total: 168 }, prop22TopUp: 0 },
    { date: '2026-02-17', deliveries: 10, onlineHours: 6.5, earnings: { basePay: 50, distancePay: 36, tip: 38, bonus: 0, total: 124 }, prop22TopUp: 0 },
    { date: '2026-02-18', deliveries: 14, onlineHours: 9, earnings: { basePay: 70, distancePay: 52, tip: 55, bonus: 20, total: 197 }, prop22TopUp: 0 },
    { date: '2026-02-19', deliveries: 11, onlineHours: 7, earnings: { basePay: 55, distancePay: 41, tip: 42, bonus: 10, total: 148 }, prop22TopUp: 0 },
    { date: '2026-02-20', deliveries: 8, onlineHours: 5.5, earnings: { basePay: 40, distancePay: 28.80, tip: 32.50, bonus: 10, total: 111.30 }, prop22TopUp: 0 },
  ],
  total: {
    basePay: 275.00,
    distancePay: 202.80,
    tip: 215.50,
    bonus: 55.00,
    total: 748.30,
  },
  prop22Guarantee: {
    minimumEarned: 748.30,
    actualEarned: 748.30,
    topUpAmount: 0,
    hoursWorked: 36,
    status: 'qualified',
  },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDistance(miles: number): string {
  return `${miles.toFixed(1)} mi`;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
