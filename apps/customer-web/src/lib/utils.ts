import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Paradise Delivery Pricing Model
export const PRICING = {
  SERVICE_FEE_PERCENT: 0.15, // 15% service fee
  SMALL_ORDER_THRESHOLD: 15, // $15 minimum
  SMALL_ORDER_FEE: 2.99, // $2.99 fee for small orders
  TAX_RATE: 0.0875, // 8.75% tax rate
  DOORDASH_MARKUP: 0.25, // 25% average markup on DoorDash for comparison
} as const;

export function calculateDeliveryFee(distance: number): number {
  // Delivery fee based on distance: $3.99 - $7.49
  if (distance <= 1) return 3.99;
  if (distance <= 2) return 4.49;
  if (distance <= 3) return 4.99;
  if (distance <= 4) return 5.99;
  return 7.49;
}

export interface PriceBreakdown {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  smallOrderFee: number;
  tax: number;
  tip: number;
  total: number;
  doorDashEstimate: number;
  savings: number;
  savingsPercent: number;
}

export function calculatePriceBreakdown(
  subtotal: number,
  distance: number,
  tip: number = 0
): PriceBreakdown {
  const serviceFee = subtotal * PRICING.SERVICE_FEE_PERCENT;
  const deliveryFee = calculateDeliveryFee(distance);
  const smallOrderFee = subtotal < PRICING.SMALL_ORDER_THRESHOLD ? PRICING.SMALL_ORDER_FEE : 0;
  const taxableAmount = subtotal + serviceFee + deliveryFee + smallOrderFee;
  const tax = taxableAmount * PRICING.TAX_RATE;
  const total = subtotal + serviceFee + deliveryFee + smallOrderFee + tax + tip;
  
  // DoorDash estimate (typically 25% more expensive)
  const doorDashSubtotal = subtotal * (1 + PRICING.DOORDASH_MARKUP);
  const doorDashServiceFee = doorDashSubtotal * 0.15; // DoorDash 15% service fee
  const doorDashDeliveryFee = deliveryFee + 1; // DoorDash delivery fee typically $1-2 more
  const doorDashSmallOrderFee = subtotal < 12 ? 2.50 : 0; // DoorDash has lower threshold
  const doorDashTax = (doorDashSubtotal + doorDashServiceFee + doorDashDeliveryFee) * PRICING.TAX_RATE;
  const doorDashTotal = doorDashSubtotal + doorDashServiceFee + doorDashDeliveryFee + doorDashSmallOrderFee + doorDashTax + tip;
  
  const savings = doorDashTotal - total;
  const savingsPercent = (savings / doorDashTotal) * 100;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    deliveryFee,
    smallOrderFee,
    tax: Math.round(tax * 100) / 100,
    tip,
    total: Math.round(total * 100) / 100,
    doorDashEstimate: Math.round(doorDashTotal * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getSavingsColor(savingsPercent: number): string {
  if (savingsPercent >= 20) return 'text-teal-600';
  if (savingsPercent >= 15) return 'text-teal-500';
  if (savingsPercent >= 10) return 'text-coral-500';
  return 'text-muted-foreground';
}
