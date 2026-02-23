'use client';

import { DailyEarnings } from '@/types';
import { formatCurrency } from '@/lib/mockData';
import { TrendingUp, Clock, Package } from 'lucide-react';

interface EarningsCardProps {
  earnings: DailyEarnings;
}

export default function EarningsCard({ earnings }: EarningsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Today&apos;s Earnings</h3>
        <div className="p-2 bg-teal-500/20 rounded-lg">
          <TrendingUp size={20} className="text-teal-400" />
        </div>
      </div>

      <div className="mb-4">
        <span className="text-4xl font-bold text-teal-400">
          {formatCurrency(earnings.earnings.total)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-900 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Package size={16} />
            <span>Deliveries</span>
          </div>
          <span className="text-xl font-semibold">{earnings.deliveries}</span>
        </div>
        <div className="bg-dark-900 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Clock size={16} />
            <span>Online</span>
          </div>
          <span className="text-xl font-semibold">{earnings.onlineHours}h</span>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Base Pay</span>
          <span>{formatCurrency(earnings.earnings.basePay)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Distance ({formatCurrency(0.60)}/mi)</span>
          <span>{formatCurrency(earnings.earnings.distancePay)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Tips</span>
          <span className="text-teal-400">{formatCurrency(earnings.earnings.tip)}</span>
        </div>
        {earnings.earnings.bonus > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Bonus</span>
            <span className="text-teal-400">{formatCurrency(earnings.earnings.bonus)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
