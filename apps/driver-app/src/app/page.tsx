"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Power,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Camera,
  Check,
  DollarSign,
  Clock
} from "lucide-react";
import { useState } from "react";

export default function DriverHome() {
  const [isOnline, setIsOnline] = useState(false);
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);

  const earnings = {
    today: 87.50,
    trips: 8,
    hours: 3.5,
  };

  if (hasActiveDelivery) {
    return <ActiveDelivery onComplete={() => setHasActiveDelivery(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Paradise Driver</h1>
          <div className="text-right">
            <p className="text-sm text-gray-400">Today's Earnings</p>
            <p className="text-2xl font-bold text-teal-400">${earnings.today.toFixed(2)}</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Online Toggle */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Button
                size="lg"
                className={`w-32 h-32 rounded-full text-xl font-bold ${
                  isOnline 
                    ? 'bg-teal-500 hover:bg-teal-600' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                onClick={() => setIsOnline(!isOnline)}
              >
                <Power className="w-8 h-8 mb-2" />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Button>
              <p className="mt-4 text-gray-400">
                {isOnline ? 'Looking for orders...' : 'Tap to go online'}
              </p>
            </div>
          </CardContent>
        </Card>

        {isOnline && (
          <>
            {/* Mock Job Offer */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">New Order</h3>
                    <p className="text-gray-400">Maria's Kitchen</p>
                  </div>
                  <Badge className="bg-teal-500">$8.40</Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-300 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>1.2 mi to restaurant</span>
                  </div>
                  <div className="flex items-center">
                    <Navigation className="w-4 h-4 mr-2" />
                    <span>2.5 mi total trip</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>~25 min</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-teal-500 hover:bg-teal-600"
                    onClick={() => setHasActiveDelivery(true)}
                  >
                    Accept
                  </Button>
                  <Button variant="outline" className="flex-1 border-gray-600">
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Stats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Today's Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{earnings.trips}</p>
                <p className="text-sm text-gray-400">Trips</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{earnings.hours}h</p>
                <p className="text-sm text-gray-400">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${(earnings.today / earnings.trips).toFixed(2)}</p>
                <p className="text-sm text-gray-400">Per Trip</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActiveDelivery({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'navigate' | 'arrived' | 'pickup' | 'deliver'>('navigate');

  const steps = [
    { id: 'navigate', label: 'Navigate to Restaurant', complete: step !== 'navigate' },
    { id: 'arrived', label: 'Arrived at Restaurant', complete: step === 'pickup' || step === 'deliver' },
    { id: 'pickup', label: 'Pick Up Order', complete: step === 'deliver' },
    { id: 'deliver', label: 'Deliver to Customer', complete: false },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4">
        <h1 className="text-xl font-bold">Active Delivery</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Order Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">Maria's Kitchen</h3>
                <p className="text-gray-400">123 Main St, Paradise</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="border-gray-600">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-gray-600">
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              <p>2x Maria's Special Burrito</p>
              <p>1x Street Tacos</p>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Delivery Steps</h3>
            <div className="space-y-3">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s.complete ? 'bg-teal-500' : 'bg-gray-700'
                  }`}>
                    {s.complete ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className={s.complete ? 'text-gray-400' : ''}>{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        {step === 'navigate' && (
          <Button 
            className="w-full bg-teal-500 hover:bg-teal-600 h-14 text-lg"
            onClick={() => setStep('arrived')}
          >
            <Navigation className="w-5 h-5 mr-2" />
            Navigate to Restaurant
          </Button>
        )}

        {step === 'arrived' && (
          <Button 
            className="w-full bg-teal-500 hover:bg-teal-600 h-14 text-lg"
            onClick={() => setStep('pickup')}
          >
            <MapPin className="w-5 h-5 mr-2" />
            I've Arrived
          </Button>
        )}

        {step === 'pickup' && (
          <div className="space-y-3">
            <Button 
              className="w-full bg-teal-500 hover:bg-teal-600 h-14 text-lg"
              onClick={() => setStep('deliver')}
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo & Confirm Pickup
            </Button>
            <p className="text-sm text-gray-400 text-center">
              Photo required for verification
            </p>
          </div>
        )}

        {step === 'deliver' && (
          <div className="space-y-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">Deliver To</h3>
                <p>456 Oak Ave, Paradise</p>
                <p className="text-gray-400 text-sm">Leave at door</p>
              </CardContent>
            </Card>
            
            <Button 
              className="w-full bg-teal-500 hover:bg-teal-600 h-14 text-lg"
              onClick={onComplete}
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo & Complete Delivery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
