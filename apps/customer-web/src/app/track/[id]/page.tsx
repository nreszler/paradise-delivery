"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin,
  Phone,
  MessageCircle,
  Check,
  Clock,
  ChefHat,
  Bike,
  Home
} from "lucide-react";
import Link from "next/link";

export default function TrackPage({ params }: { params: { id: string } }) {
  // Mock order status
  const orderStatus = 'picked_up'; // pending, confirmed, preparing, ready, picked_up, delivered
  const driver = {
    name: 'Michael',
    rating: 4.9,
    vehicle: 'Toyota Camry • White',
    phone: '(530) 555-0123',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  };

  const steps = [
    { id: 'confirmed', label: 'Order Confirmed', time: '6:15 PM', complete: true },
    { id: 'preparing', label: 'Preparing', time: '6:20 PM', complete: true },
    { id: 'ready', label: 'Ready for Pickup', time: '6:35 PM', complete: true },
    { id: 'picked_up', label: 'Driver Picked Up', time: '6:38 PM', complete: true },
    { id: 'delivered', label: 'Delivered', time: 'Estimated 6:55 PM', complete: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Track Order #{params.id}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Estimated arrival</p>
                <p className="text-2xl font-bold">6:55 PM</p>
              </div>
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <Bike className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <p className="text-gray-600">
              Michael is on the way with your order from Maria's Kitchen
            </p>
          </CardContent>
        </Card>

        {/* Driver Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-bold mb-4">Your Driver</h2>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full bg-gray-200 bg-cover bg-center"
                style={{ backgroundImage: `url(${driver.image})` }}
              />
              <div className="flex-1">
                <p className="font-bold text-lg">{driver.name}</p>
                <p className="text-gray-500">{driver.vehicle}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{driver.rating}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-bold mb-4">Order Progress</h2>
            <div className="space-y-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.complete ? 'bg-teal-500 text-white' : 'bg-gray-200'
                    }`}>
                      {step.complete ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-gray-500 text-sm">{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-12 ${step.complete ? 'bg-teal-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className={`font-medium ${step.complete ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-gray-500">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-bold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>2x Maria's Special Burrito</span>
                <span>$21.58</span>
              </div>
              <div className="flex justify-between">
                <span>1x Street Tacos (3)</span>
                <span>$8.99</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>$46.19</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivering To
            </h2>
            <p className="font-medium">123 Main Street</p>
            <p className="text-gray-500">Paradise, CA 95969</p>
            <p className="text-gray-500 text-sm mt-1">Gate code: 1234</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
