import { Restaurant, MenuItem } from './types';

export interface CompetitorPrice {
  doorDash: number;
  uberEats?: number;
  grubhub?: number;
}

export interface MenuItemWithComparison extends MenuItem {
  competitorPrices: CompetitorPrice;
  ourPrice: number; // After 10% discount
}

// Maria's Kitchen - First Paradise Delivery Partner
// TODO: Fill in exact DoorDash prices after checking their app
export const mariasMenu: MenuItemWithComparison[] = [
  {
    id: 'maria-001',
    restaurantId: 'marias-kitchen',
    name: 'Maria\'s Special Burrito',
    description: 'Hand-rolled flour tortilla with rice, beans, choice of meat, cheese, and Maria\'s secret salsa',
    price: 11.99, // Original menu price
    ourPrice: 10.79, // After 10% discount
    category: 'Burritos',
    popular: true,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400',
    competitorPrices: {
      doorDash: 12.99, // TODO: Update with exact DoorDash price
    },
    addOns: [
      { id: 'ma1', name: 'Extra Salsa', price: 0.75 },
      { id: 'ma2', name: 'Guacamole', price: 2.50 },
      { id: 'ma3', name: 'Sour Cream', price: 1.00 },
    ],
  },
  {
    id: 'maria-002',
    restaurantId: 'marias-kitchen',
    name: 'Street Tacos (3)',
    description: 'Three authentic corn tortilla tacos with onions, cilantro, and your choice of meat',
    price: 9.99,
    ourPrice: 8.99,
    category: 'Tacos',
    popular: true,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
    competitorPrices: {
      doorDash: 10.99, // TODO: Update with exact DoorDash price
    },
    addOns: [
      { id: 'ma4', name: 'Extra Tortillas', price: 1.50 },
      { id: 'ma5', name: 'Side of Rice', price: 2.50 },
    ],
  },
  {
    id: 'maria-003',
    restaurantId: 'marias-kitchen',
    name: 'Chicken Enchiladas',
    description: 'Three enchiladas topped with Maria\'s homemade enchilada sauce and cheese',
    price: 13.99,
    ourPrice: 12.59,
    category: 'Plates',
    popular: true,
    image: 'https://images.unsplash.com/photo-1534352956036-cd81e27fed21?w=400',
    competitorPrices: {
      doorDash: 15.99, // TODO: Update with exact DoorDash price
    },
    addOns: [
      { id: 'ma6', name: 'Extra Cheese', price: 2.00 },
      { id: 'ma7', name: 'Side Salad', price: 3.50 },
    ],
  },
  {
    id: 'maria-004',
    restaurantId: 'marias-kitchen',
    name: 'Chips & Guacamole',
    description: 'Fresh tortilla chips with house-made guacamole',
    price: 6.99,
    ourPrice: 6.29,
    category: 'Appetizers',
    popular: false,
    image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400',
    competitorPrices: {
      doorDash: 7.99, // TODO: Update with exact DoorDash price
    },
    addOns: [
      { id: 'ma8', name: 'Extra Chips', price: 1.50 },
    ],
  },
  {
    id: 'maria-005',
    restaurantId: 'marias-kitchen',
    name: 'Horchata (Large)',
    description: 'Traditional Mexican rice drink with cinnamon',
    price: 3.99,
    ourPrice: 3.59,
    category: 'Drinks',
    popular: false,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    competitorPrices: {
      doorDash: 4.49, // TODO: Update with exact DoorDash price
    },
    addOns: [],
  },
  {
    id: 'maria-006',
    restaurantId: 'marias-kitchen',
    name: 'Quesadilla Supreme',
    description: 'Large flour tortilla with cheese, chicken, peppers, and onions',
    price: 10.99,
    ourPrice: 9.89,
    category: 'Specialties',
    popular: true,
    image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400',
    competitorPrices: {
      doorDash: 11.99, // TODO: Update with exact DoorDash price
    },
    addOns: [
      { id: 'ma9', name: 'Add Steak', price: 3.00 },
      { id: 'ma10', name: 'Side of Beans', price: 2.50 },
    ],
  },
];

// Calculate exact savings for an order
export function calculateExactSavings(
  items: { menuItem: MenuItemWithComparison; quantity: number }[]
): {
  ourTotal: number;
  doorDashTotal: number;
  savings: number;
  savingsPercentage: number;
} {
  const ourTotal = items.reduce(
    (sum, { menuItem, quantity }) => sum + menuItem.ourPrice * quantity,
    0
  );
  
  const doorDashItemTotal = items.reduce(
    (sum, { menuItem, quantity }) => sum + (menuItem.competitorPrices.doorDash || menuItem.price) * quantity,
    0
  );
  
  // Add DoorDash fees (15% service, $5.99 delivery, tax)
  const doorDashServiceFee = doorDashItemTotal * 0.15;
  const doorDashDeliveryFee = 5.99;
  const doorDashTax = doorDashItemTotal * 0.08;
  const doorDashTotal = doorDashItemTotal + doorDashServiceFee + doorDashDeliveryFee + doorDashTax;
  
  // Our fees
  const ourServiceFee = ourTotal * 0.15;
  const ourDeliveryFee = 4.49;
  const ourTax = ourTotal * 0.08;
  const ourGrandTotal = ourTotal + ourServiceFee + ourDeliveryFee + ourTax;
  
  const savings = doorDashTotal - ourGrandTotal;
  const savingsPercentage = (savings / doorDashTotal) * 100;
  
  return {
    ourTotal: ourGrandTotal,
    doorDashTotal,
    savings,
    savingsPercentage,
  };
}

// Export Maria's Kitchen restaurant info
export const mariasRestaurant: Restaurant = {
  id: 'marias-kitchen',
  name: "Maria's Kitchen",
  cuisine: 'Mexican',
  rating: 4.8,
  reviewCount: 156,
  deliveryTime: '25-40 min',
  deliveryFee: 3.99,
  distance: 1.5,
  image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865c47?w=800',
  isLocallyOwned: true,
  isPartner: true,
  description: 'Family-owned Mexican restaurant serving authentic recipes passed down through generations. Maria\'s handmade tortillas and secret salsa make every dish special.',
  priceRange: '$$',
  hours: '11:00 AM - 9:00 PM',
  address: 'Main Street, Paradise, CA',
};
