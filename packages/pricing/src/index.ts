// ============================================
// PRICING CONSTANTS
// ============================================

export const PRICING = {
  // Service fee: 15% of subtotal
  serviceFeeRate: 0.15,
  
  // Delivery fee tiers based on distance
  deliveryFeeTiers: [
    { maxMiles: 1, fee: 3.99 },
    { maxMiles: 2, fee: 4.49 },
    { maxMiles: 3, fee: 4.99 },
    { maxMiles: 4, fee: 5.49 },
    { maxMiles: 5, fee: 5.99 },
    { maxMiles: 6, fee: 6.49 },
    { maxMiles: 8, fee: 7.49 },
  ],
  
  // Maximum delivery fee for distances beyond tiered range
  maxDeliveryFee: 8.99,
  
  // Small order fee applies when subtotal is below threshold
  smallOrderFee: 2.99,
  smallOrderThreshold: 15,
  
  // Restaurant commission: 18% of food subtotal
  restaurantCommission: 0.18,
  
  // Tax rate (varies by location, default to 0)
  defaultTaxRate: 0,
  
  // Driver payment calculation
  driverPayment: {
    basePay: 5.00,
    perMileRate: 0.60,
  },
  
  // Prop 22 constants (California)
  prop22: {
    minimumWageMultiplier: 1.2, // 120% of minimum wage
    mileageCompensationRate: 0.30, // $0.30 per engaged mile
  },
} as const;

// DoorDash pricing for comparison (estimated averages)
export const DOORDASH_PRICING = {
  serviceFeeRate: 0.15, // 15%
  deliveryFeeBase: 2.99, // Can vary significantly
  deliveryFeePerMile: 0.99,
  smallOrderFee: 2.50,
  smallOrderThreshold: 12,
  regulatoryFee: 0.30, // Various regulatory fees
  // DoorDash also has:
  // - Dynamic pricing (surge pricing during busy times)
  // - Higher fees in some markets
  // - Priority delivery fees
} as const;

// ============================================
// TYPES
// ============================================

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: {
    name: string;
    price: number;
  }[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PricingBreakdown {
  subtotal: number;
  tax: number;
  serviceFee: number;
  deliveryFee: number;
  smallOrderFee: number | null;
  tip: number | null;
  total: number;
}

export interface ParadiseVsDoorDash {
  paradiseTotal: number;
  doorDashTotal: number;
  savings: number;
  savingsPercentage: number;
}

export interface ProfitBreakdown {
  // Revenue
  orderTotal: number;
  
  // Costs
  restaurantPayout: number;
  driverPayout: number;
  stripeFees: number;
  
  // Net
  platformRevenue: number;
  platformProfit: number;
  
  // Breakdown
  serviceFeeRevenue: number;
  deliveryFeeRevenue: number;
  smallOrderFeeRevenue: number;
  commissionRevenue: number;
}

export interface OrderForProfit {
  items: MenuItem[];
  distanceMiles: number;
  subtotal: number;
  tax: number;
  serviceFee: number;
  deliveryFee: number;
  smallOrderFee: number | null;
  tip: number | null;
  total: number;
}

// ============================================
// DELIVERY FEE CALCULATION
// ============================================

/**
 * Calculate delivery fee based on distance
 * Uses tiered pricing structure
 */
export function getDeliveryFee(distanceMiles: number): number {
  // Find the appropriate tier
  for (const tier of PRICING.deliveryFeeTiers) {
    if (distanceMiles <= tier.maxMiles) {
      return tier.fee;
    }
  }
  
  // Beyond the highest tier, use max fee
  return PRICING.maxDeliveryFee;
}

/**
 * Get the delivery fee tier for display purposes
 */
export function getDeliveryFeeTier(distanceMiles: number): { tier: number; maxMiles: number; fee: number } | null {
  for (let i = 0; i < PRICING.deliveryFeeTiers.length; i++) {
    const tier = PRICING.deliveryFeeTiers[i];
    if (distanceMiles <= tier.maxMiles) {
      return { tier: i + 1, maxMiles: tier.maxMiles, fee: tier.fee };
    }
  }
  return null;
}

// ============================================
// ORDER TOTAL CALCULATION
// ============================================

/**
 * Calculate subtotal from order items
 */
export function calculateSubtotal(items: MenuItem[]): number {
  return items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const modifiersTotal = item.modifiers?.reduce(
      (sum, mod) => sum + mod.price * item.quantity,
      0
    ) ?? 0;
    return total + itemTotal + modifiersTotal;
  }, 0);
}

/**
 * Calculate complete order total with full breakdown
 */
export function calculateOrderTotal(
  items: MenuItem[],
  distance: number,
  address?: Address,
  options?: {
    tip?: number;
    taxRate?: number;
  }
): PricingBreakdown {
  // Calculate subtotal
  const subtotal = calculateSubtotal(items);
  
  // Calculate tax
  const taxRate = options?.taxRate ?? PRICING.defaultTaxRate;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  
  // Calculate service fee (15% of subtotal)
  const serviceFee = Math.round(subtotal * PRICING.serviceFeeRate * 100) / 100;
  
  // Calculate delivery fee based on distance
  const deliveryFee = getDeliveryFee(distance);
  
  // Calculate small order fee if applicable
  const smallOrderFee = subtotal < PRICING.smallOrderThreshold 
    ? PRICING.smallOrderFee 
    : null;
  
  // Calculate total
  const total = Math.round(
    (subtotal + tax + serviceFee + deliveryFee + (smallOrderFee ?? 0) + (options?.tip ?? 0)) * 100
  ) / 100;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    smallOrderFee,
    tip: options?.tip ?? null,
    total,
  };
}

// ============================================
// SAVINGS CALCULATION (vs DoorDash)
// ============================================

/**
 * Estimate DoorDash pricing for comparison
 */
export function estimateDoorDashTotal(
  items: MenuItem[],
  distance: number,
  options?: {
    tip?: number;
    taxRate?: number;
  }
): number {
  const subtotal = calculateSubtotal(items);
  const taxRate = options?.taxRate ?? 0;
  
  const tax = subtotal * taxRate;
  const serviceFee = subtotal * DOORDASH_PRICING.serviceFeeRate;
  const deliveryFee = DOORDASH_PRICING.deliveryFeeBase + (distance * DOORDASH_PRICING.deliveryFeePerMile);
  const smallOrderFee = subtotal < DOORDASH_PRICING.smallOrderThreshold 
    ? DOORDASH_PRICING.smallOrderFee 
    : 0;
  const regulatoryFee = DOORDASH_PRICING.regulatoryFee;
  
  return Math.round(
    (subtotal + tax + serviceFee + deliveryFee + smallOrderFee + regulatoryFee + (options?.tip ?? 0)) * 100
  ) / 100;
}

/**
 * Calculate savings compared to DoorDash
 */
export function calculateSavingsVsDoorDash(
  items: MenuItem[],
  distance: number,
  options?: {
    tip?: number;
    taxRate?: number;
  }
): ParadiseVsDoorDash {
  const paradiseBreakdown = calculateOrderTotal(items, distance, undefined, options);
  const doorDashTotal = estimateDoorDashTotal(items, distance, options);
  
  const savings = Math.round((doorDashTotal - paradiseBreakdown.total) * 100) / 100;
  const savingsPercentage = doorDashTotal > 0 
    ? Math.round((savings / doorDashTotal) * 1000) / 10 
    : 0;
  
  return {
    paradiseTotal: paradiseBreakdown.total,
    doorDashTotal,
    savings,
    savingsPercentage,
  };
}

/**
 * Quick savings calculation from order total
 * Used when you already have the Paradise order total
 */
export function calculateSavingsFromTotal(
  paradiseTotal: number,
  estimatedDoorDashTotal: number
): ParadiseVsDoorDash {
  const savings = Math.round((estimatedDoorDashTotal - paradiseTotal) * 100) / 100;
  const savingsPercentage = estimatedDoorDashTotal > 0 
    ? Math.round((savings / estimatedDoorDashTotal) * 1000) / 10 
    : 0;
  
  return {
    paradiseTotal,
    doorDashTotal: estimatedDoorDashTotal,
    savings,
    savingsPercentage,
  };
}

// ============================================
// PROFIT CALCULATION
// ============================================

/**
 * Calculate driver payout for a delivery
 */
export function calculateDriverPayout(distanceMiles: number): number {
  return Math.round(
    (PRICING.driverPayment.basePay + (distanceMiles * PRICING.driverPayment.perMileRate)) * 100
  ) / 100;
}

/**
 * Calculate full profit breakdown for an order
 */
export function calculateProfit(order: OrderForProfit): ProfitBreakdown {
  // Revenue breakdown
  const serviceFeeRevenue = order.serviceFee;
  const deliveryFeeRevenue = order.deliveryFee;
  const smallOrderFeeRevenue = order.smallOrderFee ?? 0;
  const commissionRevenue = Math.round(order.subtotal * PRICING.restaurantCommission * 100) / 100;
  
  // Platform total revenue (fees + commission)
  const platformRevenue = Math.round(
    (serviceFeeRevenue + deliveryFeeRevenue + smallOrderFeeRevenue + commissionRevenue) * 100
  ) / 100;
  
  // Costs
  const restaurantPayout = Math.round(
    (order.subtotal - commissionRevenue) * 100
  ) / 100;
  const driverPayout = calculateDriverPayout(order.distanceMiles);
  
  // Stripe fees (typical 2.9% + $0.30, but varies)
  // Customer pays: order.total
  // Stripe takes: ~2.9% + $0.30
  const stripeFees = Math.round((order.total * 0.029 + 0.30) * 100) / 100;
  
  // Net profit
  const platformProfit = Math.round(
    (platformRevenue - driverPayout - stripeFees) * 100
  ) / 100;
  
  return {
    orderTotal: order.total,
    restaurantPayout,
    driverPayout,
    stripeFees,
    platformRevenue,
    platformProfit,
    serviceFeeRevenue,
    deliveryFeeRevenue,
    smallOrderFeeRevenue,
    commissionRevenue,
  };
}

// ============================================
// PROP 22 CALCULATIONS
// ============================================

export interface Prop22Calculation {
  activeHours: number;
  engagedHours: number;
  milesDriven: number;
  minimumEarnings: number;
  actualEarnings: number;
  mileageCompensation: number;
  trueUpAmount: number;
}

/**
 * Calculate Prop 22 true-up amount for a driver
 * California law: 120% of minimum wage for active hours + $0.30/mile
 */
export function calculateWeeklyTrueUp(
  activeHours: number,
  engagedHours: number,
  milesDriven: number,
  actualEarnings: number,
  minimumWage: number = 16.00 // California minimum wage (adjustable)
): Prop22Calculation {
  // 120% of minimum wage for active hours
  const minimumEarnings = Math.round(
    activeHours * minimumWage * PRICING.prop22.minimumWageMultiplier * 100
  ) / 100;
  
  // Mileage compensation for engaged miles
  const mileageCompensation = Math.round(
    milesDriven * PRICING.prop22.mileageCompensationRate * 100
  ) / 100;
  
  // Calculate true-up (can't be negative)
  const trueUpAmount = Math.max(
    0,
    Math.round((minimumEarnings + mileageCompensation - actualEarnings) * 100) / 100
  );
  
  return {
    activeHours,
    engagedHours,
    milesDriven,
    minimumEarnings,
    actualEarnings,
    mileageCompensation,
    trueUpAmount,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Check if order qualifies for small order fee
 */
export function hasSmallOrderFee(subtotal: number): boolean {
  return subtotal < PRICING.smallOrderThreshold;
}

/**
 * Get price estimate for a delivery
 * Quick calculation without full breakdown
 */
export function getQuickPriceEstimate(
  subtotal: number,
  distance: number,
  taxRate: number = 0
): number {
  const tax = subtotal * taxRate;
  const serviceFee = subtotal * PRICING.serviceFeeRate;
  const deliveryFee = getDeliveryFee(distance);
  const smallOrderFee = hasSmallOrderFee(subtotal) ? PRICING.smallOrderFee : 0;
  
  return Math.round((subtotal + tax + serviceFee + deliveryFee + smallOrderFee) * 100) / 100;
}
