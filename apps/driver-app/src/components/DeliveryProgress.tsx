'use client';

import { useState, useEffect } from 'react';
import { DeliveryJob, DeliveryTimer } from '@/types';
import { CheckCircle2, Circle, Clock, Camera, MapPin, Navigation, Phone } from 'lucide-react';
import { formatTime } from '@/lib/mockData';

interface DeliveryProgressProps {
  job: DeliveryJob;
  timer: DeliveryTimer;
  onUpdateStatus: (status: DeliveryJob['status']) => void;
  onCapturePhoto: (type: 'pickup' | 'delivery') => void;
}

const steps = [
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'picked_up', label: 'Picked Up', icon: CheckCircle2 },
  { status: 'in_transit', label: 'In Transit', icon: CheckCircle2 },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function DeliveryProgress({ 
  job, 
  timer, 
  onUpdateStatus, 
  onCapturePhoto 
}: DeliveryProgressProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(timer.startedAt).getTime();
      const now = new Date().getTime();
      const minutes = Math.floor((now - start) / 60000);
      setElapsedMinutes(minutes);
    }, 60000);

    return () => clearInterval(interval);
  }, [timer.startedAt]);

  const getCurrentStepIndex = () => {
    const statusOrder = ['accepted', 'picked_up', 'in_transit', 'delivered'];
    return statusOrder.indexOf(job.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  const renderActionButton = () => {
    switch (job.status) {
      case 'accepted':
        return (
          <div className="space-y-3">
            <a 
              href={`https://maps.google.com/?q=${job.restaurant.location.lat},${job.restaurant.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full flex items-center gap-2"
            >
              <Navigation size={20} />
              Navigate to Restaurant
            </a>
            <button
              onClick={() => onCapturePhoto('pickup')}
              className="btn-primary w-full flex items-center gap-2"
            >
              <Camera size={20} />
              Confirm Pickup
            </button>
          </div>
        );
      
      case 'picked_up':
        return (
          <div className="space-y-3">
            <a 
              href={`https://maps.google.com/?q=${job.customer.location.lat},${job.customer.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full flex items-center gap-2"
            >
              <Navigation size={20} />
              Navigate to Customer
            </a>
            <button
              onClick={() => onUpdateStatus('in_transit')}
              className="btn-primary w-full flex items-center gap-2"
            >
              <MapPin size={20} />
              Arrived at Customer
            </button>
          </div>
        );
      
      case 'in_transit':
        return (
          <button
            onClick={() => onCapturePhoto('delivery')}
            className="btn-primary w-full flex items-center gap-2"
          >
            <Camera size={20} />
            Confirm Delivery
          </button>
        );
      
      case 'delivered':
        return (
          <button
            onClick={() => onUpdateStatus('completed')}
            className="btn-primary w-full"
          >
            Mark Complete
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <Clock size={20} className="text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Delivery Time</p>
              <p className="font-semibold">{formatTime(elapsedMinutes)}</p>
            </div>
          </div>
          {elapsedMinutes > job.estimatedTime * 1.5 && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              Taking longer than expected
            </span>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700">
            <div 
              className="h-full bg-teal-500 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted 
                        ? 'bg-teal-500 border-teal-500' 
                        : isCurrent 
                          ? 'bg-dark-800 border-teal-500' 
                          : 'bg-dark-800 border-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Icon size={16} className="text-white" />
                    ) : (
                      <Circle size={16} className={isCurrent ? 'text-teal-400' : 'text-gray-600'} />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isCurrent ? 'text-teal-400 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Location Info */}
      <div className="card">
        {job.status === 'accepted' || job.status === 'picked_up' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <MapPin size={20} className="text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">PICKUP FROM</p>
                <p className="font-semibold">{job.restaurant.name}</p>
                <p className="text-sm text-gray-400">{job.restaurant.address}</p>
                {job.restaurant.pickupInstructions && (
                  <p className="text-sm text-teal-400 mt-1">
                    Note: {job.restaurant.pickupInstructions}
                  </p>
                )}
              </div>
            </div>
            <a 
              href={`tel:${job.restaurant.phone}`}
              className="flex items-center gap-2 text-teal-400 text-sm"
            >
              <Phone size={16} />
              Call Restaurant
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <MapPin size={20} className="text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">DELIVER TO</p>
                <p className="font-semibold">{job.customer.name}</p>
                <p className="text-sm text-gray-400">{job.customer.address}</p>
                {job.customer.deliveryInstructions && (
                  <p className="text-sm text-teal-400 mt-1">
                    Note: {job.customer.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>
            <a 
              href={`tel:${job.customer.phone}`}
              className="flex items-center gap-2 text-teal-400 text-sm"
            >
              <Phone size={16} />
              Call Customer
            </a>
          </div>
        )}
      </div>

      {/* Action Button */}
      {renderActionButton()}
    </div>
  );
}
