'use client';

import { WeeklyEarnings } from '@/types';
import { formatCurrency } from '@/lib/mockData';
import { Info, Shield, Clock, TrendingUp } from 'lucide-react';

interface Prop22CardProps {
  weeklyData: WeeklyEarnings;
}

export default function Prop22Card({ weeklyData }: Prop22CardProps) {
  const { prop22Guarantee } = weeklyData;
  
  // Calculate minimum guarantee (120% of minimum wage for active hours + $0.30/mile)
  const minWageRate = 16.00; // CA minimum wage
  const mileageRate = 0.30;
  const multiplier = 1.20;
  
  const guaranteedMinimum = prop22Guarantee.hoursWorked * minWageRate * multiplier;
  const mileageCompensation = weeklyData.total.distancePay || 0; // Approximate from distance pay
  const totalMinimum = guaranteedMinimum + mileageCompensation;
  
  const progressPercentage = Math.min(
    (prop22Guarantee.actualEarned / totalMinimum) * 100, 
    100
  );

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-500/20 rounded-lg">
          <Shield size={20} className="text-teal-400" />
        </div>
        <div>
          <h3 className="font-semibold">Prop 22 Guarantee</h3>
          <p className="text-sm text-gray-400">Weekly earnings protection</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress to Guarantee</span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-3 bg-dark-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-900 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Clock size={14} />
            <span>Hours Worked</span>
          </div>
          <span className="text-xl font-semibold">{prop22Guarantee.hoursWorked}h</span>
        </div>
        <div className="bg-dark-900 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <TrendingUp size={14} />
            <span>Your Earnings</span>
          </div>
          <span className="text-xl font-semibold text-teal-400">
            {formatCurrency(prop22Guarantee.actualEarned)}
          </span>
        </div>
      </div>

      {/* Guarantee Breakdown */}
      <div className="space-y-2 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">120% Min Wage ({prop22Guarantee.hoursWorked}h × ${minWageRate})</span>
          <span>{formatCurrency(guaranteedMinimum)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Per-Mile Compensation</span>
          <span>{formatCurrency(mileageCompensation)}</span>
        </div>
        <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-700">
          <span>Minimum Guarantee</span>
          <span>{formatCurrency(totalMinimum)}</span>
        </div>
      </div>

      {/* Status */}
      {prop22Guarantee.topUpAmount > 0 ? (
        <div className="bg-teal-500/20 rounded-xl p-3 flex items-center gap-3">
          <Info size={20} className="text-teal-400" />
          <div>
            <p className="text-sm font-medium text-teal-400">
              Top-up Applied: {formatCurrency(prop22Guarantee.topUpAmount)}
            </p>
            <p className="text-xs text-gray-400">
              You&apos;ll receive this adjustment by next Wednesday
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 rounded-xl p-3 flex items-center gap-3">
          <Check size={20} className="text-green-400" />
          <p className="text-sm text-green-400">
            You&apos;ve earned above the minimum guarantee this week!
          </p>
        </div>
      )}
    </div>
  );
}

function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
