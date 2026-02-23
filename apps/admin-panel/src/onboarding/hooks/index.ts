/**
 * Custom Hooks for Onboarding
 */

import { useState, useEffect, useCallback } from 'react';
import {
  DriverApplication,
  RestaurantApplication,
  ApplicationStatus,
  ApplicationFilters,
  OnboardingMetrics,
} from '../types';

// ============================================================================
// Driver Application Hook
// ============================================================================

interface UseDriverApplicationReturn {
  application: DriverApplication | null;
  loading: boolean;
  error: string | null;
  progress: ApplicationProgress | null;
  nextSteps: string[];
  refresh: () => void;
  submitBasicInfo: (data: any) => Promise<void>;
  uploadDocument: (documentType: string, file: File) => Promise<void>;
  consentToBackgroundCheck: () => Promise<void>;
  completeOrientation: (sections: any[]) => Promise<void>;
}

interface ApplicationProgress {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
}

export function useDriverApplication(applicationId?: string): UseDriverApplicationReturn {
  const [application, setApplication] = useState<DriverApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ApplicationProgress | null>(null);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/drivers/application/${applicationId}/status`);
      const result = await response.json();

      if (result.success) {
        setApplication(result.data.application);
        setProgress(result.data.progress);
        setNextSteps(result.data.nextSteps);
      } else {
        setError(result.error?.message || 'Failed to load application');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication, refreshTrigger]);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  const submitBasicInfo = async (data: any) => {
    try {
      const response = await fetch('/api/drivers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message);
      }

      setApplication(result.data);
    } catch (err) {
      throw err;
    }
  };

  const uploadDocument = async (documentType: string, file: File) => {
    if (!application) return;

    const formData = new FormData();
    formData.append('applicationId', application.id);
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await fetch('/api/drivers/upload-document', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    refresh();
  };

  const consentToBackgroundCheck = async () => {
    if (!application) return;

    const response = await fetch('/api/drivers/background-check-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: application.id,
        consentGiven: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit consent');
    }

    refresh();
  };

  const completeOrientation = async (sections: any[]) => {
    if (!application) return;

    const totalTime = sections.reduce((acc, s) => acc + (s.timeSpentSeconds || 0), 0);

    const response = await fetch('/api/drivers/orientation-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: application.id,
        sectionsViewed: sections,
        totalTimeSpentSeconds: totalTime,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete orientation');
    }

    refresh();
  };

  return {
    application,
    loading,
    error,
    progress,
    nextSteps,
    refresh,
    submitBasicInfo,
    uploadDocument,
    consentToBackgroundCheck,
    completeOrientation,
  };
}

// ============================================================================
// Admin Applications List Hook
// ============================================================================

interface UseAdminApplicationsReturn {
  applications: any[];
  loading: boolean;
  error: string | null;
  meta: { total: number; page: number; limit: number };
  filters: ApplicationFilters;
  setFilters: (filters: ApplicationFilters) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  approveApplication: (id: string, notes?: string) => Promise<void>;
  rejectApplication: (id: string, reason: string, notes?: string) => Promise<void>;
}

export function useAdminApplications(type: 'driver' | 'restaurant'): UseAdminApplicationsReturn {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [filters, setFilters] = useState<ApplicationFilters>({
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

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

      const endpoint = type === 'driver' 
        ? '/api/admin/applications/drivers' 
        : '/api/admin/applications/restaurants';

      const response = await fetch(`${endpoint}?${params}`);
      const result = await response.json();

      if (result.success) {
        setApplications(result.data.applications);
        setMeta(result.data.meta);
      } else {
        setError(result.error?.message || 'Failed to load applications');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [type, filters, meta.page, meta.limit, refreshTrigger]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  const approveApplication = async (id: string, notes?: string) => {
    const response = await fetch(`/api/admin/applications/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes,
        adminId: 'current_admin_id',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to approve application');
    }

    refresh();
  };

  const rejectApplication = async (id: string, reason: string, notes?: string) => {
    const response = await fetch(`/api/admin/applications/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason,
        notes,
        allowAppeal: true,
        adminId: 'current_admin_id',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to reject application');
    }

    refresh();
  };

  const setPage = (page: number) => {
    setMeta(prev => ({ ...prev, page }));
  };

  return {
    applications,
    loading,
    error,
    meta,
    filters,
    setFilters,
    setPage,
    refresh,
    approveApplication,
    rejectApplication,
  };
}

// ============================================================================
// Onboarding Metrics Hook
// ============================================================================

interface UseOnboardingMetricsReturn {
  metrics: OnboardingMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useOnboardingMetrics(): UseOnboardingMetricsReturn {
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/onboarding-metrics');
        const result = await response.json();

        if (result.success) {
          setMetrics(result.data);
        }
      } catch (err) {
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [refreshTrigger]);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  return { metrics, loading, error, refresh };
}

// ============================================================================
// Document Upload Hook
// ============================================================================

interface UseDocumentUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  upload: (file: File, documentType: string, applicationId: string) => Promise<any>;
}

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, documentType: string, applicationId: string) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('documentType', documentType);
      formData.append('file', file);

      const response = await fetch('/api/drivers/upload-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Upload failed');
      }

      setProgress(100);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, progress, error, upload };
}

// ============================================================================
// Background Check Status Hook
// ============================================================================

interface UseBackgroundCheckReturn {
  status: 'idle' | 'pending' | 'clear' | 'consider' | 'error';
  reportId: string | null;
  error: string | null;
  submitConsent: (applicationId: string) => Promise<void>;
}

export function useBackgroundCheck(): UseBackgroundCheckReturn {
  const [status, setStatus] = useState<'idle' | 'pending' | 'clear' | 'consider' | 'error'>('idle');
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitConsent = async (applicationId: string) => {
    setStatus('pending');
    setError(null);

    try {
      const response = await fetch('/api/drivers/background-check-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          consentGiven: true,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message);
      }

      setReportId(result.data.reportId);
      // Status will be updated via polling or webhook
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
      throw err;
    }
  };

  return { status, reportId, error, submitConsent };
}

// ============================================================================
// Notification Hook
// ============================================================================

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        const result = await response.json();

        if (result.success) {
          setNotifications(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
