/**
 * Driver Onboarding API Routes
 * Simplified DoorDash-style onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  DriverApplication,
  DriverApplicationRequest,
  DocumentUploadRequest,
  ReviewActionRequest,
  ApiResponse,
  ApplicationStatus,
  ApplicationFilters,
} from '../types';

// ============================================================================
// IN-MEMORY STORE (Replace with database in production)
// ============================================================================

const driverApplications = new Map<string, DriverApplication>();

// ============================================================================
// POST /api/drivers/apply
// Initialize a new driver application
// ============================================================================

export async function POST_apply(req: NextRequest): Promise<NextResponse<ApiResponse<DriverApplication>>> {
  try {
    const body: DriverApplicationRequest = await req.json();
    
    // Validate required fields
    if (!body.basicInfo || !body.vehicleInfo) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Basic info and vehicle info are required',
        },
      }, { status: 400 });
    }

    // Validate age (18+)
    const dob = new Date(body.basicInfo.dateOfBirth);
    const age = calculateAge(dob);
    if (age < 18) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNDERAGE_APPLICANT',
          message: 'Driver must be at least 18 years old',
        },
      }, { status: 400 });
    }

    // Create application
    const application: DriverApplication = {
      id: generateId(),
      status: 'draft',
      riskScore: 0,
      riskLevel: 'low',
      createdAt: new Date(),
      updatedAt: new Date(),
      basicInfo: {
        ...body.basicInfo,
        ssnEncrypted: encryptSSN(body.basicInfo.ssn),
        ssnLast4: body.basicInfo.ssn.slice(-4),
      },
      vehicleInfo: body.vehicleInfo,
      documents: {},
      aiRecommendation: {
        recommendation: 'manual_review',
        confidence: 0,
        reasoning: [],
        riskFactors: [],
        positiveIndicators: [],
        generatedAt: new Date(),
      },
    };

    driverApplications.set(application.id, application);

    // Send notification
    await sendNotification('application_received', 'driver', application.id, {
      applicantName: `${application.basicInfo.firstName} ${application.basicInfo.lastName}`,
    });

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Failed to create driver application:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create application',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// GET /api/drivers/application/:id/status
// Get application status and progress
// ============================================================================

export async function GET_status(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{
  application: DriverApplication;
  progress: ApplicationProgress;
  nextSteps: string[];
}>>> {
  try {
    const { id } = params;
    const application = driverApplications.get(id);

    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    const progress = calculateProgress(application);
    const nextSteps = getNextSteps(application);

    return NextResponse.json({
      success: true,
      data: {
        application: sanitizeApplication(application),
        progress,
        nextSteps,
      },
    });
  } catch (error) {
    console.error('Failed to get application status:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get application status',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/drivers/upload-document
// Upload and verify a document
// ============================================================================

export async function POST_uploadDocument(req: NextRequest): Promise<NextResponse<ApiResponse<{
  documentId: string;
  verificationStatus: string;
  flags?: string[];
}>>> {
  try {
    const formData = await req.formData();
    const applicationId = formData.get('applicationId') as string;
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!applicationId || !documentType || !file) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Application ID, document type, and file are required',
        },
      }, { status: 400 });
    }

    const application = driverApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    // Upload file to storage (S3, etc.)
    const fileUrl = await uploadFileToStorage(file);

    // Create document record
    const documentId = generateId();
    const document = {
      id: documentId,
      applicationId,
      documentType: documentType as any,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date(),
      status: 'processing' as const,
    };

    // Update application with document reference
    if (documentType === 'drivers_license_front') {
      application.documents.licenseFront = document;
    } else if (documentType === 'drivers_license_back') {
      application.documents.licenseBack = document;
    } else if (documentType === 'auto_insurance') {
      application.documents.autoInsurance = document;
    } else if (documentType === 'vehicle_registration') {
      application.documents.vehicleRegistration = document;
    } else if (documentType === 'profile_photo') {
      application.documents.profilePhoto = document;
    }

    application.updatedAt = new Date();
    driverApplications.set(applicationId, application);

    // Process document verification asynchronously
    processDocumentVerification(applicationId, documentId, documentType, fileUrl);

    return NextResponse.json({
      success: true,
      data: {
        documentId,
        verificationStatus: 'processing',
      },
    });
  } catch (error) {
    console.error('Failed to upload document:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload document',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/drivers/background-check-consent
// Submit background check consent
// ============================================================================

export async function POST_backgroundCheckConsent(req: NextRequest): Promise<NextResponse<ApiResponse<{
  status: string;
  reportId?: string;
}>>> {
  try {
    const { applicationId, consentGiven, ssnConfirmation } = await req.json();

    if (!applicationId || !consentGiven) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_CONSENT',
          message: 'Background check consent is required',
        },
      }, { status: 400 });
    }

    const application = driverApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    // Update application
    application.backgroundCheckConsentAt = new Date();
    application.updatedAt = new Date();

    // Initiate background check with Checkr or similar
    const backgroundCheckResult = await initiateBackgroundCheck(application);
    application.backgroundCheck = backgroundCheckResult;

    // Update status
    if (allDocumentsVerified(application)) {
      application.status = 'pending_review';
      application.submittedAt = new Date();
    }

    driverApplications.set(applicationId, application);

    // Send notification
    await sendNotification('background_check_initiated', 'driver', applicationId, {
      applicantName: `${application.basicInfo.firstName} ${application.basicInfo.lastName}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        status: 'initiated',
        reportId: backgroundCheckResult.reportId,
      },
    });
  } catch (error) {
    console.error('Failed to process background check consent:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'BACKGROUND_CHECK_ERROR',
        message: 'Failed to initiate background check',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/drivers/orientation-complete
// Mark orientation as completed
// ============================================================================

export async function POST_orientationComplete(req: NextRequest): Promise<NextResponse<ApiResponse<{
  completed: boolean;
}>>> {
  try {
    const { applicationId, sectionsViewed, totalTimeSpentSeconds } = await req.json();

    if (!applicationId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_APPLICATION_ID',
          message: 'Application ID is required',
        },
      }, { status: 400 });
    }

    const application = driverApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    // Record orientation completion
    application.orientation = {
      completedAt: new Date(),
      sectionsViewed: sectionsViewed || [],
      totalTimeSpentSeconds: totalTimeSpentSeconds || 0,
      acknowledged: true,
    };

    application.updatedAt = new Date();
    driverApplications.set(applicationId, application);

    return NextResponse.json({
      success: true,
      data: { completed: true },
    });
  } catch (error) {
    console.error('Failed to complete orientation:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete orientation',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// GET /api/admin/applications/drivers
// List driver applications for admin review
// ============================================================================

export async function GET_adminList(req: NextRequest): Promise<NextResponse<ApiResponse<{
  applications: any[];
  meta: { total: number; page: number; limit: number };
}>>> {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.getAll('status');
    const riskLevel = searchParams.getAll('riskLevel');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchQuery = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let applications = Array.from(driverApplications.values());

    // Apply filters
    if (status.length > 0) {
      applications = applications.filter(app => status.includes(app.status));
    }
    if (riskLevel.length > 0) {
      applications = applications.filter(app => riskLevel.includes(app.riskLevel));
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      applications = applications.filter(app => 
        app.basicInfo.firstName.toLowerCase().includes(query) ||
        app.basicInfo.lastName.toLowerCase().includes(query) ||
        app.basicInfo.email.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    applications.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'risk_score') {
        comparison = a.riskScore - b.riskScore;
      } else if (sortBy === 'name') {
        comparison = a.basicInfo.lastName.localeCompare(b.basicInfo.lastName);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const total = applications.length;
    const start = (page - 1) * limit;
    const paginated = applications.slice(start, start + limit);

    // Convert to card format
    const cards = paginated.map(app => ({
      id: app.id,
      applicantName: `${app.basicInfo.firstName} ${app.basicInfo.lastName}`,
      email: app.basicInfo.email,
      phone: app.basicInfo.phone,
      status: app.status,
      riskScore: app.riskScore,
      riskLevel: app.riskLevel,
      submittedAt: app.submittedAt,
      aiChecks: generateAiChecks(app),
      orientationCompleted: !!app.orientation?.completedAt,
      orientationTimeSpent: app.orientation?.totalTimeSpentSeconds,
      recommendation: app.aiRecommendation.recommendation,
      pendingDocuments: getPendingDocuments(app),
    }));

    return NextResponse.json({
      success: true,
      data: {
        applications: cards,
        meta: { total, page, limit },
      },
    });
  } catch (error) {
    console.error('Failed to list applications:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to list applications',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/admin/applications/:id/approve
// Approve a driver application
// ============================================================================

export async function POST_adminApprove(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const { id } = params;
    const { notes, adminId } = await req.json();

    const application = driverApplications.get(id);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    application.adminNotes = notes;
    application.updatedAt = new Date();

    driverApplications.set(id, application);

    // Send approval notification
    await sendNotification('approved', 'driver', id, {
      applicantName: `${application.basicInfo.firstName} ${application.basicInfo.lastName}`,
      nextSteps: 'Download the driver app and start accepting deliveries!',
    });

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error('Failed to approve application:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to approve application',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/admin/applications/:id/reject
// Reject a driver application
// ============================================================================

export async function POST_adminReject(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const { id } = params;
    const { reason, notes, adminId, allowAppeal } = await req.json();

    if (!reason) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_REASON',
          message: 'Rejection reason is required',
        },
      }, { status: 400 });
    }

    const application = driverApplications.get(id);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    application.adminNotes = notes;
    application.appealStatus = allowAppeal ? 'pending' : 'none';
    application.updatedAt = new Date();

    driverApplications.set(id, application);

    // Send rejection notification
    await sendNotification('rejected', 'driver', id, {
      applicantName: `${application.basicInfo.firstName} ${application.basicInfo.lastName}`,
      reason,
      appealAllowed: allowAppeal,
    });

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error('Failed to reject application:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reject application',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `drv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function encryptSSN(ssn: string): string {
  // In production, use proper encryption (e.g., AES-256)
  // This is a placeholder
  return Buffer.from(ssn).toString('base64');
}

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

async function uploadFileToStorage(file: File): Promise<string> {
  // In production, upload to S3, Cloudflare R2, etc.
  // Return the public URL
  return `https://storage.paradisedelivery.com/documents/${generateId()}_${file.name}`;
}

async function processDocumentVerification(
  applicationId: string,
  documentId: string,
  documentType: string,
  fileUrl: string
): Promise<void> {
  // Import and use the document verification service
  const { createDocumentVerificationService } = await import('../services/documentVerification');
  const service = createDocumentVerificationService({
    ocrProvider: 'aws-textract',
  });

  const application = driverApplications.get(applicationId);
  if (!application) return;

  // Find the document
  let document: any;
  if (documentType === 'drivers_license_front') document = application.documents.licenseFront;
  else if (documentType === 'drivers_license_back') document = application.documents.licenseBack;
  else if (documentType === 'auto_insurance') document = application.documents.autoInsurance;
  else if (documentType === 'vehicle_registration') document = application.documents.vehicleRegistration;
  else if (documentType === 'profile_photo') document = application.documents.profilePhoto;

  if (!document) return;

  try {
    const result = await service.verifyDocument(document, {
      applicantName: `${application.basicInfo.firstName} ${application.basicInfo.lastName}`,
      applicantAddress: application.basicInfo.address,
      vehicleInfo: application.vehicleInfo,
    });

    document.verificationResult = result;
    document.status = result.confidence >= 80 && result.flags.length === 0 ? 'verified' : 'rejected';

    // If profile photo, also do face match with license
    if (documentType === 'profile_photo' && application.documents.licenseFront?.fileUrl) {
      const faceMatch = await service.verifyFaceMatch(
        fileUrl,
        application.documents.licenseFront.fileUrl
      );
      if (!faceMatch.matches) {
        document.status = 'rejected';
        document.rejectionReason = 'Photo does not match license photo';
      }
    }

    application.updatedAt = new Date();
    driverApplications.set(applicationId, application);

    // Re-evaluate risk score
    await evaluateRiskScore(applicationId);
  } catch (error) {
    console.error('Document verification failed:', error);
    document.status = 'rejected';
    document.rejectionReason = 'Verification processing failed';
    driverApplications.set(applicationId, application);
  }
}

async function initiateBackgroundCheck(application: DriverApplication) {
  // In production, integrate with Checkr API
  // This is a simulated response
  
  return {
    provider: 'checkr' as const,
    reportId: `rpt_${generateId()}`,
    status: 'pending' as const,
    initiatedAt: new Date(),
    criminalRecords: [],
    drivingRecord: {
      licenseStatus: 'valid' as const,
      licenseClass: 'C',
      violations: [],
      totalViolations: 0,
      movingViolations2Years: 0,
    },
    sexOffenderCheck: 'clear' as const,
    autoRejectFlags: [],
  };
}

async function evaluateRiskScore(applicationId: string): Promise<void> {
  const application = driverApplications.get(applicationId);
  if (!application) return;

  const { calculateDriverRiskScore } = await import('../utils/riskScoring');
  const result = await calculateDriverRiskScore(application);
  
  application.riskScore = result.score;
  application.riskLevel = result.level;
  application.aiRecommendation = result.recommendation;
  application.updatedAt = new Date();

  driverApplications.set(applicationId, application);

  // Auto-approve or auto-reject if criteria met
  if (result.recommendation.recommendation === 'auto_approve' && canAutoApprove(application)) {
    application.status = 'auto_approved';
    application.reviewedAt = new Date();
    application.reviewedBy = 'system';
    
    await sendNotification('approved', 'driver', applicationId, {
      applicantName: `${application.basicInfo.firstName} ${application.basicInfo.lastName}`,
      autoApproved: true,
    });
  } else if (result.recommendation.recommendation === 'auto_reject') {
    application.status = 'auto_rejected';
    application.rejectionReason = 'Failed automated screening criteria';
    application.reviewedAt = new Date();
    application.reviewedBy = 'system';
    
    await sendNotification('auto_rejected', 'driver', applicationId, {
      applicantName: `${application.basicInfo.firstName} ${application.basicInfo.lastName}`,
      reason: application.rejectionReason,
    });
  }

  driverApplications.set(applicationId, application);
}

function canAutoApprove(application: DriverApplication): boolean {
  // Check all required criteria for auto-approval
  return (
    application.documents.licenseFront?.status === 'verified' &&
    application.documents.licenseBack?.status === 'verified' &&
    application.documents.autoInsurance?.status === 'verified' &&
    application.documents.vehicleRegistration?.status === 'verified' &&
    application.documents.profilePhoto?.status === 'verified' &&
    application.backgroundCheck?.status === 'clear' &&
    application.backgroundCheck?.autoRejectFlags.length === 0 &&
    application.backgroundCheck?.drivingRecord.movingViolations2Years <= 2 &&
    application.orientation?.acknowledged === true &&
    application.riskScore < 30
  );
}

function allDocumentsVerified(application: DriverApplication): boolean {
  const docs = application.documents;
  return !!(
    docs.licenseFront?.status === 'verified' &&
    docs.licenseBack?.status === 'verified' &&
    docs.autoInsurance?.status === 'verified' &&
    docs.vehicleRegistration?.status === 'verified' &&
    docs.profilePhoto?.status === 'verified'
  );
}

interface ApplicationProgress {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
}

function calculateProgress(application: DriverApplication): ApplicationProgress {
  const steps = [
    !!application.basicInfo.firstName, // Basic info
    !!application.vehicleInfo.licensePlate, // Vehicle info
    application.documents.licenseFront?.status === 'verified', // License
    application.documents.autoInsurance?.status === 'verified', // Insurance
    application.documents.vehicleRegistration?.status === 'verified', // Registration
    application.documents.profilePhoto?.status === 'verified', // Photo
    !!application.backgroundCheckConsentAt, // Background check consent
    application.backgroundCheck?.status === 'clear', // Background check complete
    !!application.orientation?.acknowledged, // Orientation
  ];

  const completedSteps = steps.filter(Boolean).length;
  return {
    percentage: Math.round((completedSteps / steps.length) * 100),
    completedSteps,
    totalSteps: steps.length,
  };
}

function getNextSteps(application: DriverApplication): string[] {
  const steps: string[] = [];
  const docs = application.documents;

  if (!docs.licenseFront || docs.licenseFront.status !== 'verified') {
    steps.push('Upload front of driver\'s license');
  }
  if (!docs.licenseBack || docs.licenseBack.status !== 'verified') {
    steps.push('Upload back of driver\'s license');
  }
  if (!docs.autoInsurance || docs.autoInsurance.status !== 'verified') {
    steps.push('Upload auto insurance card');
  }
  if (!docs.vehicleRegistration || docs.vehicleRegistration.status !== 'verified') {
    steps.push('Upload vehicle registration');
  }
  if (!docs.profilePhoto || docs.profilePhoto.status !== 'verified') {
    steps.push('Upload profile photo');
  }
  if (!application.backgroundCheckConsentAt) {
    steps.push('Consent to background check');
  }
  if (application.backgroundCheck?.status === 'pending') {
    steps.push('Wait for background check to complete');
  }
  if (!application.orientation?.acknowledged) {
    steps.push('Complete orientation');
  }

  return steps;
}

function getPendingDocuments(application: DriverApplication): string[] {
  const pending: string[] = [];
  const docs = application.documents;

  if (!docs.licenseFront || docs.licenseFront.status !== 'verified') {
    pending.push('drivers_license_front');
  }
  if (!docs.licenseBack || docs.licenseBack.status !== 'verified') {
    pending.push('drivers_license_back');
  }
  if (!docs.autoInsurance || docs.autoInsurance.status !== 'verified') {
    pending.push('auto_insurance');
  }
  if (!docs.vehicleRegistration || docs.vehicleRegistration.status !== 'verified') {
    pending.push('vehicle_registration');
  }
  if (!docs.profilePhoto || docs.profilePhoto.status !== 'verified') {
    pending.push('profile_photo');
  }

  return pending;
}

function generateAiChecks(application: DriverApplication): any[] {
  const checks = [];
  const docs = application.documents;

  if (docs.licenseFront?.verificationResult) {
    checks.push({
      name: 'License Valid',
      passed: docs.licenseFront.status === 'verified',
      details: docs.licenseFront.verificationResult.extractedData.expirationDate
        ? `Expires ${new Date(docs.licenseFront.verificationResult.extractedData.expirationDate).toLocaleDateString()}`
        : undefined,
      warning: docs.licenseFront.verificationResult.flags.includes('expiration_soon'),
    });
  }

  if (docs.autoInsurance?.verificationResult) {
    checks.push({
      name: 'Insurance Verified',
      passed: docs.autoInsurance.status === 'verified',
      details: docs.autoInsurance.verificationResult.extractedData.insuranceCompany as string,
      warning: !docs.autoInsurance.verificationResult.extractedData.hasCommercialCoverage,
    });
  }

  if (docs.vehicleRegistration?.verificationResult) {
    checks.push({
      name: 'Registration Current',
      passed: docs.vehicleRegistration.status === 'verified',
      details: docs.vehicleRegistration.verificationResult.extractedData.licensePlate as string,
    });
  }

  if (application.backgroundCheck) {
    checks.push({
      name: 'Background Check',
      passed: application.backgroundCheck.status === 'clear',
      details: `${application.backgroundCheck.drivingRecord.movingViolations2Years} moving violations (2 years)`,
      warning: application.backgroundCheck.drivingRecord.movingViolations2Years > 0,
    });
  }

  if (docs.profilePhoto?.status) {
    checks.push({
      name: 'Photo Verified',
      passed: docs.profilePhoto.status === 'verified',
    });
  }

  return checks;
}

function sanitizeApplication(application: DriverApplication): any {
  // Remove sensitive data for API responses
  return {
    ...application,
    basicInfo: {
      ...application.basicInfo,
      ssnEncrypted: undefined,
      ssnLast4: application.basicInfo.ssnLast4,
    },
  };
}

async function sendNotification(
  type: string,
  recipientType: 'driver' | 'restaurant' | 'admin',
  recipientId: string,
  data: any
): Promise<void> {
  // In production, send via email, SMS, or push notification
  console.log(`[Notification] ${type} to ${recipientType} ${recipientId}`, data);
}

// Re-export for Next.js App Router
export const POST = POST_apply;
