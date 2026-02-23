"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft,
  Plus,
  Minus,
  MapPin,
  Clock,
  Info,
  ShoppingBag,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import { mockRestaurants } from "@/lib/mockData";
import { mariasMenu, calculateExactSavings } from "@/lib/competitorPricing";
import { useState, useMemo } from "react";

// Demo cart with Maria's Kitchen items (exact competitor pricing)
const DEMO_CART = [
  { itemId: 'maria-001', quantity: 2 }, // Maria's Special Burrito
  { itemId: 'maria-002', quantity: 1 }, // Street Tacos
];

export default function CartPage() {
  const [cart, setCart] = useState(DEMO_CART);
  
  // Use Maria's Kitchen exact pricing
  const cartItems = useMemo(() => {
    return cart.map(cartItem => {
      const item = mariasMenu.find(i => i.id === cartItem.itemId);
      return item ? { ...cartItem, item } : null;
    }).filter((c): c is { itemId: string; quantity: number; item: typeof mariasMenu[0] } => c !== null);
  }, [cart]);

  // Calculate exact savings using real competitor prices
  const savingsData = useMemo(() => {
    if (cartItems.length === 0) return null;
    return calculateExactSavings(cartItems.map(c => ({ 
      menuItem: c.item, 
      quantity: c.quantity 
    })));
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, c) => sum + c.item.ourPrice * c.quantity, 0);
  const serviceFee = subtotal * 0.15;
  const deliveryFee = 4.49;
  const smallOrderFee = subtotal < 15 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const tip = subtotal * 0.15;
  const total = subtotal + serviceFee + deliveryFee + smallOrderFee + tax + tip;
  
  const doorDashTotal = savingsData?.doorDashTotal || total * 1.25;
  const savings = savingsData?.savings || 0;

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.itemId === itemId) {
        return { ...c, quantity: Math.max(0, c.quantity + delta) };
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const restaurant = mockRestaurants.find(r => r.id === 'marias-kitchen');

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/restaurant/${restaurant?.id || ''}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Your Cart</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Restaurant Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-bold text-lg">{restaurant?.name}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {restaurant?.deliveryTime}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {restaurant?.distance} mi
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Price Comparison Widget - Exact Savings */}
        <Card className="mb-6 bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-teal-800">Your Savings</span>
            </div>
            <div className="space-y-2">
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{quantity}x {item.name}</span>
                  <span className="text-teal-600 font-medium">
                    Save ${((item.competitorPrices.doorDash - item.ourPrice) * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <Separator className="my-2 border-teal-200" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Us:</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">DoorDash:</span>
                <span className="text-gray-500 line-through">${doorDashTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-teal-700 pt-2 border-t-2 border-teal-300">
                <span>You save:</span>
                <span>${savings.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cart Items */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Order Items</h3>
            <div className="space-y-4">
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">${item.ourPrice.toFixed(2)} each</p>
                    <p className="text-xs text-teal-600">
                      vs ${item.competitorPrices.doorDash.toFixed(2)} on DoorDash
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold w-6 text-center">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Breakdown */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee (15%)</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              {smallOrderFee > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Small Order Fee</span>
                  <span>${smallOrderFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tip (15%)</span>
                <span>${tip.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DoorDash Comparison Detail */}
        <Card className="mb-6 bg-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm text-gray-700">How you save</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>No menu markups</span>
                <span className="text-teal-600">-${(subtotal * 0.10).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lower delivery fee</span>
                <span className="text-teal-600">-$1.50</span>
              </div>
              <div className="flex justify-between">
                <span>Smaller service fee</span>
                <span className="text-teal-600">-$0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">123 Main Street</p>
                  <p className="text-sm text-gray-500">Paradise, CA 95969</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Change</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            size="lg" 
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Place Order • ${total.toFixed(2)}
          </Button>
          <p className="text-center text-sm text-teal-600 font-medium mt-2">
            You're saving ${savings.toFixed(2)} vs DoorDash exact pricing
          </p>
        </div>
      </div>
    </div>
  );
}
