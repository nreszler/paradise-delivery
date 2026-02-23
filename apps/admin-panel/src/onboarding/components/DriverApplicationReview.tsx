/**
 * Driver Application Review Component
 * Detailed review interface for individual driver applications
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  DriverApplication,
  VerificationResult,
  BackgroundCheckResult,
  OrientationCompletion,
} from '../types';

interface DriverApplicationReviewProps {
  applicationId: string;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const DriverApplicationReview: React.FC<DriverApplicationReviewProps> = ({
  applicationId,
  onBack,
  onApprove,
  onReject,
}) => {
  const [application, setApplication] = useState<DriverApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'background' | 'orientation'>('overview');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/drivers/application/${applicationId}/status`);
      const result = await response.json();
      if (result.success) {
        setApplication(result.data.application);
        setAdminNotes(result.data.application.adminNotes || '');
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: adminNotes,
          adminId: 'current_admin_id', // Replace with actual admin ID
        }),
      });

      if (response.ok) {
        onApprove(applicationId);
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return;

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectionReason,
          notes: adminNotes,
          allowAppeal: true,
          adminId: 'current_admin_id',
        }),
      });

      if (response.ok) {
        onReject(applicationId, rejectionReason);
        setShowRejectModal(false);
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 60) return 'bg-yellow-100 text-yellow-800';
    if (score < 80) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'auto_approve': return 'bg-green-100 text-green-800';
      case 'approve_with_monitoring': return 'bg-blue-100 text-blue-800';
      case 'manual_review': return 'bg-yellow-100 text-yellow-800';
      case 'auto_reject': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              ← Back to List
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {application.basicInfo.firstName} {application.basicInfo.lastName}
            </h1>
            <p className="text-gray-500">
              {application.basicInfo.email} · {application.basicInfo.phone}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(application.riskScore)}`}>
              Risk Score: {application.riskScore}/100 ({application.riskLevel})
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Application ID: {application.id}
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">AI Recommendation</h3>
            <span className={`px-2 py-1 rounded text-sm ${getRecommendationColor(application.aiRecommendation.recommendation)}`}>
              {application.aiRecommendation.recommendation.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Confidence: {application.aiRecommendation.confidence}%
          </p>
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              <strong>Reasoning:</strong> {application.aiRecommendation.reasoning.join('; ')}
            </p>
          </div>
          {application.aiRecommendation.riskFactors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Risk Factors:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {application.aiRecommendation.riskFactors.map((factor, i) => (
                  <li key={i}>{factor.description}</li>
                ))}
              </ul>
            </div>
          )}
          {application.aiRecommendation.positiveIndicators.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Positive Indicators:</p>
              <ul className="text-sm text-green-600 list-disc list-inside">
                {application.aiRecommendation.positiveIndicators.map((indicator, i) => (
                  <li key={i}>{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {application.status === 'pending_review' || application.status === 'under_review' ? (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleApprove}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Approve Application
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Reject Application
            </button>
            <button
              onClick={() => alert('Request more info functionality')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Request More Info
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <span className={`px-4 py-2 rounded-lg font-medium ${
              application.status === 'approved' || application.status === 'auto_approved'
                ? 'bg-green-100 text-green-800'
                : application.status === 'rejected' || application.status === 'auto_rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              Status: {application.status.replace(/_/g, ' ').toUpperCase()}
            </span>
            {application.rejectionReason && (
              <p className="mt-2 text-red-600">
                Reason: {application.rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            {(['overview', 'documents', 'background', 'orientation'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name:</span>
                      <span>{application.basicInfo.firstName} {application.basicInfo.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span>{formatDate(application.basicInfo.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SSN (Last 4):</span>
                      <span>***-**-{application.basicInfo.ssnLast4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{application.basicInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span>{application.basicInfo.phone}</span>
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-3 mt-6">Address</h3>
                  <div className="text-sm">
                    <p>{application.basicInfo.address.street}</p>
                    <p>{application.basicInfo.address.city}, {application.basicInfo.address.state} {application.basicInfo.address.zipCode}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Vehicle Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="capitalize">{application.vehicleInfo.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Make:</span>
                      <span>{application.vehicleInfo.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Model:</span>
                      <span>{application.vehicleInfo.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Year:</span>
                      <span>{application.vehicleInfo.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Color:</span>
                      <span>{application.vehicleInfo.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">License Plate:</span>
                      <span>{application.vehicleInfo.licensePlate}</span>
                    </div>
                    {application.vehicleInfo.vin && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">VIN:</span>
                        <span>{application.vehicleInfo.vin}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {Object.entries(application.documents).map(([key, doc]) => (
                doc && (
                  <DocumentVerificationCard
                    key={key}
                    title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    document={doc}
                  />
                )
              ))}
            </div>
          )}

          {/* Background Check Tab */}
          {activeTab === 'background' && application.backgroundCheck && (
            <BackgroundCheckDetails check={application.backgroundCheck} />
          )}

          {/* Orientation Tab */}
          {activeTab === 'orientation' && (
            <OrientationDetails orientation={application.orientation} />
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Reject Application</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject {application.basicInfo.firstName} {application.basicInfo.lastName}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason (required)
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select a reason...</option>
                <option value="expired_license">Expired or Suspended License</option>
                <option value="dui_history">DUI/DWI in last 7 years</option>
                <option value="criminal_history">Criminal history</option>
                <option value="driving_record">Poor driving record</option>
                <option value="fraudulent_documents">Fraudulent documents</option>
                <option value="incomplete_application">Incomplete application</option>
                <option value="failed_verification">Failed document verification</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Document Verification Card Component
const DocumentVerificationCard: React.FC<{
  title: string;
  document: any;
}> = ({ title, document }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        </div>
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View Document
        </a>
      </div>

      {document.verificationResult && (
        <div className="mt-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500">AI Confidence:</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  document.verificationResult.confidence >= 80 ? 'bg-green-500' :
                  document.verificationResult.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${document.verificationResult.confidence}%` }}
              />
            </div>
            <span>{document.verificationResult.confidence}%</span>
          </div>

          {document.verificationResult.authenticityScore < 80 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500">Authenticity Score:</span>
              <span className={document.verificationResult.authenticityScore < 60 ? 'text-red-600' : 'text-yellow-600'}>
                {document.verificationResult.authenticityScore}%
              </span>
            </div>
          )}

          {Object.entries(document.verificationResult.extractedData).length > 0 && (
            <div className="mt-2">
              <p className="text-gray-500 mb-1">Extracted Data:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(document.verificationResult.extractedData).map(([key, value]) => (
                  value && (
                    <div key={key} className="text-xs">
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="ml-1">
                        {value instanceof Date ? value.toLocaleDateString() : String(value)}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {document.verificationResult.flags.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600 text-xs">Flags:</p>
              <ul className="text-xs text-red-500 list-disc list-inside">
                {document.verificationResult.flags.map((flag: string, i: number) => (
                  <li key={i}>{flag.replace(/_/g, ' ')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {document.rejectionReason && (
        <div className="mt-3 text-sm text-red-600">
          <strong>Rejection Reason:</strong> {document.rejectionReason}
        </div>
      )}
    </div>
  );
};

// Background Check Details Component
const BackgroundCheckDetails: React.FC<{
  check: BackgroundCheckResult;
}> = ({ check }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Background Check Status</h3>
          <p className="text-sm text-gray-500">
            Provider: {check.provider} · Report ID: {check.reportId}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          check.status === 'clear' ? 'bg-green-100 text-green-800' :
          check.status === 'consider' ? 'bg-yellow-100 text-yellow-800' :
          check.status === 'suspended' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {check.status.toUpperCase()}
        </span>
      </div>

      {check.status !== 'pending' && (
        <>
          {/* Driving Record */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Driving Record</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">License Status</p>
                <p className={`font-medium ${
                  check.drivingRecord.licenseStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {check.drivingRecord.licenseStatus.toUpperCase()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">License Class</p>
                <p className="font-medium">{check.drivingRecord.licenseClass}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Moving Violations (2 years)</p>
                <p className={`font-medium ${
                  check.drivingRecord.movingViolations2Years > 2 ? 'text-red-600' :
                  check.drivingRecord.movingViolations2Years > 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {check.drivingRecord.movingViolations2Years}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Total Violations</p>
                <p className="font-medium">{check.drivingRecord.totalViolations}</p>
              </div>
            </div>

            {check.drivingRecord.violations.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Violation History</h5>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Violation</th>
                      <th className="px-3 py-2 text-left">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {check.drivingRecord.violations.map((v, i) => (
                      <tr key={i} className={v.dui || v.reckless ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2">{new Date(v.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">
                          {v.violation}
                          {v.dui && <span className="ml-2 text-xs text-red-600 font-bold">(DUI)</span>}
                          {v.reckless && <span className="ml-2 text-xs text-red-600 font-bold">(RECKLESS)</span>}
                        </td>
                        <td className="px-3 py-2">{v.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Criminal History */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Criminal History (7 years)</h4>
            {check.criminalRecords.length === 0 ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                ✓ No criminal records found
              </div>
            ) : (
              <div className="space-y-2">
                {check.criminalRecords.map((record, i) => (
                  <div key={i} className={`p-3 rounded ${record.violent ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <div className="flex justify-between">
                      <span className="font-medium">{record.offense}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        record.severity === 'felony' ? 'bg-red-100 text-red-800' :
                        record.severity === 'misdemeanor' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(record.offenseDate).toLocaleDateString()}
                      {record.convictionDate && ` · Convicted: ${new Date(record.convictionDate).toLocaleDateString()}`}
                    </p>
                    {record.violent && (
                      <p className="text-sm text-red-600 font-medium">VIOLENT OFFENSE</p>
                    )}
                    {record.duiRelated && (
                      <p className="text-sm text-red-600 font-medium">DUI/DWI RELATED</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sex Offender Check */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Sex Offender Registry Check</h4>
            <p className={check.sexOffenderCheck === 'clear' ? 'text-green-600' : 'text-red-600'}>
              {check.sexOffenderCheck === 'clear' ? '✓ Clear - No records found' : '✗ Hit found on registry'}
            </p>
          </div>
        </>
      )}

      {check.autoRejectFlags.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">⚠ Auto-Reject Criteria Triggered</h4>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {check.autoRejectFlags.map((flag, i) => (
              <li key={i}>{flag.replace(/_/g, ' ').toUpperCase()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Orientation Details Component
const OrientationDetails: React.FC<{
  orientation?: OrientationCompletion;
}> = ({ orientation }) => {
  if (!orientation) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Orientation not yet completed</p>
        <p className="text-sm mt-2">
          The applicant must complete the orientation module before they can be approved.
        </p>
      </div>
    );
  }

  const sections = [
    { id: 'welcome', title: 'Welcome to Paradise Delivery' },
    { id: 'how_delivery_works', title: 'How Delivery Works' },
    { id: 'safety_guidelines', title: 'Safety Guidelines' },
    { id: 'using_the_app', title: 'Using the Driver App' },
    { id: 'customer_service', title: 'Customer Service Best Practices' },
    { id: 'earnings_payments', title: 'Earnings & Payments' },
    { id: 'prop22_rights', title: 'Prop 22 Rights (CA)' },
  ];

  const viewedSectionIds = new Set(orientation.sectionsViewed.map(s => s.sectionId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
        <div>
          <h3 className="font-medium text-green-900">Orientation Completed</h3>
          <p className="text-sm text-green-700">
            Completed on {new Date(orientation.completedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-800">
            {formatDuration(orientation.totalTimeSpentSeconds)}
          </p>
          <p className="text-sm text-green-700">Total time spent</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Sections Viewed</h4>
        <div className="space-y-2">
          {sections.map(section => {
            const viewed = viewedSectionIds.has(section.id);
            const sectionData = orientation.sectionsViewed.find(s => s.sectionId === section.id);

            return (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3 rounded ${
                  viewed ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    viewed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {viewed ? '✓' : '○'}
                  </span>
                  <span className={viewed ? 'text-gray-900' : 'text-gray-500'}>
                    {section.title}
                  </span>
                </div>
                {sectionData && (
                  <span className="text-sm text-gray-500">
                    {formatDuration(sectionData.timeSpentSeconds)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
