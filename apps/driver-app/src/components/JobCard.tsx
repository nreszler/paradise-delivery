'use client';

import { DeliveryJob } from '@/types';
import { formatCurrency, formatDistance, formatTime } from '@/lib/mockData';
import { MapPin, Clock, DollarSign, Navigation, ChevronRight } from 'lucide-react';

interface JobCardProps {
  job: DeliveryJob;
  onAccept?: (jobId: string) => void;
  onDecline?: (jobId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function JobCard({ 
  job, 
  onAccept, 
  onDecline, 
  showActions = true,
  compact = false 
}: JobCardProps) {
  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Active Delivery</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.status === 'picked_up' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-teal-500/20 text-teal-400'
          }`}>
            {job.status === 'picked_up' ? 'In Transit' : 'Accepted'}
          </span>
        </div>
        
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Navigation size={20} className="text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{job.restaurant.name}</p>
            <p className="text-sm text-gray-400 truncate">→ {job.customer.name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-teal-400">{formatCurrency(job.earnings.total)}</p>
            <p className="text-xs text-gray-400">{formatDistance(job.distance)}</p>
          </div>
        </div>

        <a 
          href={`/delivery/${job.id}`}
          className="btn-primary w-full text-sm"
        >
          Continue Delivery
        </a>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Order</span>
          <span className="text-sm font-mono">#{job.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1 text-teal-400">
          <DollarSign size={16} />
          <span className="font-bold text-xl">{formatCurrency(job.earnings.total)}</span>
        </div>
      </div>

      {/* Route Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <MapPin size={16} className="text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-0.5">PICKUP</p>
            <p className="font-medium">{job.restaurant.name}</p>
            <p className="text-sm text-gray-400">{job.restaurant.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <MapPin size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-0.5">DROPOFF</p>
            <p className="font-medium">{job.customer.name}</p>
            <p className="text-sm text-gray-400">{job.customer.address}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 py-3 border-y border-gray-700">
        <div className="flex items-center gap-2">
          <Navigation size={16} className="text-gray-400" />
          <span className="text-sm">{formatDistance(job.distance)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm">{formatTime(job.estimatedTime)}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-400">Base</span>
          <span className="text-sm font-medium">{formatCurrency(job.earnings.basePay)}</span>
          <span className="text-xs text-gray-400">+</span>
          <span className="text-xs text-gray-400">{formatCurrency(0.60)}/mi</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-1">
        <p className="text-xs text-gray-400 mb-2">ORDER ITEMS</p>
        {job.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-300">{item.quantity}x {item.name}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onDecline?.(job.id)}
            className="btn-secondary flex-1"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept?.(job.id)}
            className="btn-primary flex-1"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}
