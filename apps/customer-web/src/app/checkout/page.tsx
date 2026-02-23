"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft,
  CreditCard,
  MapPin,
  Clock,
  Check,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setOrderComplete(true);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
            <p className="text-gray-600 mb-4">
              Your order #1234 has been placed and is being prepared.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Estimated delivery</p>
              <p className="text-xl font-bold">6:45 PM - 7:00 PM</p>
            </div>
            <Button 
              className="w-full bg-teal-500 hover:bg-teal-600"
              onClick={() => window.location.href = '/track/1234'}
            >
              Track Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Progress */}
        <div className="flex items-center mb-8">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-teal-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${step >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}>1</div>
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${step >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}>2</div>
          <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-teal-500' : 'bg-gray-200'}`} />
        </div>

        {step === 1 && (
          <>
            {/* Delivery Address */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h2 className="font-bold text-lg mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="123 Main Street" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Paradise" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" placeholder="95969" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instructions">Delivery Instructions (optional)</Label>
                    <Input id="instructions" placeholder="Gate code, apt number, etc." className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-teal-500 hover:bg-teal-600"
              onClick={() => setStep(2)}
            >
              Continue to Payment
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Payment */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h2 className="font-bold text-lg mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input id="expiry" placeholder="MM/YY" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" className="mt-1" />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="font-medium">Apple Pay</span>
                  <Button variant="outline" size="sm">
                    Pay with Apple Pay
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-teal-500 hover:bg-teal-600"
                onClick={() => setStep(3)}
              >
                Review Order
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Order Summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>2x Maria's Special Burrito</span>
                    <span>$21.58</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Street Tacos (3)</span>
                    <span>$8.99</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>$30.57</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (15%)</span>
                    <span>$4.59</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>$3.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>$2.45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip (15%)</span>
                    <span>$4.59</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>$46.19</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                  <p className="text-sm text-teal-700">
                    <strong>You save $8.50</strong> vs DoorDash exact pricing
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-teal-500 hover:bg-teal-600"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
