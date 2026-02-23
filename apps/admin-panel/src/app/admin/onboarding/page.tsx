/**
 * Example Admin Dashboard Page
 * Next.js App Router compatible
 */

'use client';

import React, { useState } from 'react';
import {
  DriverApplicationsList,
  DriverApplicationReview,
  RestaurantApplicationsList,
} from '@/onboarding/components';
import { useOnboardingMetrics } from '@/onboarding/hooks';

type TabType = 'drivers' | 'restaurants';

export default function OnboardingDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('drivers');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { metrics, loading: metricsLoading } = useOnboardingMetrics();

  const handleDriverApproved = (id: string) => {
    alert(`Driver ${id} approved!`);
    setSelectedDriver(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDriverRejected = (id: string, reason: string) => {
    alert(`Driver ${id} rejected: ${reason}`);
    setSelectedDriver(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (selectedDriver) {
    return (
      <DriverApplicationReview
        applicationId={selectedDriver}
        onBack={() => setSelectedDriver(null)}
        onApprove={handleDriverApproved}
        onReject={handleDriverRejected}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Onboarding Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage driver and restaurant applications
          </p>
        </div>

        {/* Metrics */}
        {!metricsLoading && metrics && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Total Applications"
              value={metrics.totalApplications}
              color="blue"
            />
            <MetricCard
              title="Pending Review"
              value={metrics.pendingReview}
              color="yellow"
            />
            <MetricCard
              title="Approved Today"
              value={metrics.approvedToday}
              color="green"
            />
            <MetricCard
              title="Approval Rate"
              value={`${Math.round(metrics.approvalRate)}%`}
              color="purple"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('drivers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'drivers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Driver Applications
              </button>
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'restaurants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Restaurant Applications
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'drivers' ? (
              <DriverApplicationsList
                onSelectApplication={setSelectedDriver}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <RestaurantApplicationsList
                onSelectApplication={setSelectedRestaurant}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number | string;
  color: 'blue' | 'yellow' | 'green' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
