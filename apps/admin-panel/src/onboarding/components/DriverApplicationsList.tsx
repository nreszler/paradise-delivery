/**
 * Driver Applications List Component
 * Admin dashboard for reviewing driver applications
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  DriverApplicationCard,
  ApplicationStatus,
  RiskLevel,
  ApplicationFilters,
  BulkAction,
} from '../types';

interface DriverApplicationsListProps {
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

export const DriverApplicationsList: React.FC<DriverApplicationsListProps> = ({
  onSelectApplication,
  refreshTrigger,
}) => {
  const [applications, setApplications] = useState<DriverApplicationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ApplicationFilters>({
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });

  useEffect(() => {
    fetchApplications();
  }, [filters, refreshTrigger]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status?.length) {
        filters.status.forEach(s => params.append('status', s));
      }
      if (filters.riskLevel?.length) {
        filters.riskLevel.forEach(r => params.append('riskLevel', r));
      }
      params.append('page', meta.page.toString());
      params.append('limit', meta.limit.toString());
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      if (filters.searchQuery) {
        params.append('q', filters.searchQuery);
      }

      const response = await fetch(`/api/admin/applications/drivers?${params}`);
      const result = await response.json();

      if (result.success) {
        setApplications(result.data.applications);
        setMeta(result.data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(applications.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: BulkAction['action']) => {
    if (selectedIds.size === 0) return;

    const confirmed = action === 'reject' 
      ? confirm(`Are you sure you want to reject ${selectedIds.size} applications?`)
      : true;

    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/applications/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          applicationIds: Array.from(selectedIds),
        }),
      });

      if (response.ok) {
        setSelectedIds(new Set());
        fetchApplications();
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
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
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            />
          </div>

          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.status?.join(',') || ''}
            onChange={(e) => setFilters({
              ...filters,
              status: e.target.value ? e.target.value.split(',') as ApplicationStatus[] : undefined,
            })}
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="auto_approved">Auto-Approved</option>
            <option value="auto_rejected">Auto-Rejected</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.riskLevel?.join(',') || ''}
            onChange={(e) => setFilters({
              ...filters,
              riskLevel: e.target.value ? e.target.value.split(',') as RiskLevel[] : undefined,
            })}
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [ApplicationFilters['sortBy'], ApplicationFilters['sortOrder']];
              setFilters({ ...filters, sortBy, sortOrder });
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="risk_score-desc">Highest Risk</option>
            <option value="risk_score-asc">Lowest Risk</option>
            <option value="name-asc">Name A-Z</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 flex gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={() => handleBulkAction('request_info')}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Request Info
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === applications.length && applications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Checks</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orientation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectApplication(app.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(app.id)}
                    onChange={() => handleSelectOne(app.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{app.applicantName}</div>
                    <div className="text-sm text-gray-500">{app.email}</div>
                    <div className="text-sm text-gray-500">{app.phone}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[app.status]}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          app.riskScore < 30 ? 'bg-green-500' :
                          app.riskScore < 60 ? 'bg-yellow-500' :
                          app.riskScore < 80 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${app.riskScore}%` }}
                      />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${RISK_COLORS[app.riskLevel]}`}>
                      {app.riskScore}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {app.aiChecks.slice(0, 4).map((check, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded ${
                          check.passed
                            ? check.warning
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                        title={check.details}
                      >
                        {check.name}
                        {check.passed ? ' ✓' : ' ✗'}
                      </span>
                    ))}
                    {app.aiChecks.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{app.aiChecks.length - 4} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {app.orientationCompleted ? (
                    <span className="text-sm text-green-600">
                      ✓ {formatDuration(app.orientationTimeSpent)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(app.submittedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {app.recommendation === 'auto_approve' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkAction('approve');
                        }}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApplication(app.id);
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No applications found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-500">
          Showing {applications.length} of {meta.total} applications
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
            disabled={meta.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {meta.page}
          </span>
          <button
            onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
            disabled={applications.length < meta.limit}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
