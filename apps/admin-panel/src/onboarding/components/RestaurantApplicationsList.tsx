/**
 * Restaurant Applications List Component
 * Admin dashboard for reviewing restaurant applications
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  RestaurantApplicationCard,
  ApplicationStatus,
  RiskLevel,
} from '../types';

interface RestaurantApplicationsListProps {
  onSelectApplication: (id: string) => void;
  refreshTrigger?: number;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  auto_approved: 'bg-green-200 text-green-900',
  auto_rejected: 'bg-red-200 text-red-900',
  test_orders_pending: 'bg-orange-100 text-orange-800',
  onboarding_complete: 'bg-purple-100 text-purple-800',
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const RestaurantApplicationsList: React.FC<RestaurantApplicationsListProps> = ({
  onSelectApplication,
  refreshTrigger,
}) => {
  const [applications, setApplications] = useState<RestaurantApplicationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, refreshTrigger]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', meta.page.toString());
      params.append('limit', meta.limit.toString());

      const response = await fetch(`/api/admin/applications/restaurants?${params}`);
      const result = await response.json();

      if (result.success) {
        setApplications(result.data.applications);
        setMeta(result.data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 items-center">
          <select
            className="px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="test_orders_pending">Test Orders Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectApplication(app.id)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{app.restaurantName}</h3>
                <p className="text-sm text-gray-500">Owner: {app.ownerName}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[app.status]}`}>
                {app.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Risk Score */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Risk Score</span>
                  <span className="font-medium">{app.riskScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      app.riskScore < 30 ? 'bg-green-500' :
                      app.riskScore < 60 ? 'bg-yellow-500' :
                      app.riskScore < 80 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${app.riskScore}%` }}
                  />
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${RISK_COLORS[app.riskLevel]}`}>
                {app.riskLevel}
              </span>
            </div>

            {/* AI Checks */}
            <div className="flex flex-wrap gap-2 mb-4">
              {app.aiChecks.map((check, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded ${
                    check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {check.passed ? '✓' : '✗'} {check.name}
                </span>
              ))}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500">Menu Items:</span>
                <span className="ml-1 font-medium">{app.menuItemCount || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Avg Prep Time:</span>
                <span className="ml-1 font-medium">{app.averagePrepTime} min</span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>
                <span className="ml-1">{formatDate(app.submittedAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Recommendation:</span>
                <span className={`ml-1 font-medium ${
                  app.recommendation === 'auto_approve' ? 'text-green-600' :
                  app.recommendation === 'approve_with_monitoring' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {app.recommendation.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Concerns */}
            {app.concerns.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-yellow-800 mb-1">Concerns:</p>
                <ul className="text-xs text-yellow-700 list-disc list-inside">
                  {app.concerns.map((concern, i) => (
                    <li key={i}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No restaurant applications found.
        </div>
      )}
    </div>
  );
};
