/**
 * Restaurant Onboarding API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  RestaurantApplication,
  RestaurantApplicationRequest,
  ApiResponse,
} from '../types';

// In-memory store (replace with database in production)
const restaurantApplications = new Map<string, RestaurantApplication>();

// ============================================================================
// POST /api/restaurants/apply
// Initialize a new restaurant application
// ============================================================================

export async function POST_apply(req: NextRequest): Promise<NextResponse<ApiResponse<RestaurantApplication>>> {
  try {
    const body: RestaurantApplicationRequest = await req.json();

    // Validate address is in Paradise, CA service area
    const isInParadise = await verifyParadiseAddress(body.location.address);
    if (!isInParadise) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'OUTSIDE_SERVICE_AREA',
          message: 'Restaurant must be located in Paradise or Magalia, CA',
        },
      }, { status: 400 });
    }

    const application: RestaurantApplication = {
      id: `rest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      riskScore: 0,
      riskLevel: 'low',
      createdAt: new Date(),
      updatedAt: new Date(),
      businessInfo: body.businessInfo,
      location: {
        ...body.location,
        verifiedInParadise: true,
      },
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

    restaurantApplications.set(application.id, application);

    await sendNotification('application_received', 'restaurant', application.id, {
      restaurantName: application.businessInfo.restaurantName,
    });

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Failed to create restaurant application:', error);
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
// POST /api/restaurants/upload-document
// Upload legal documents
// ============================================================================

export async function POST_uploadDocument(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
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

    const application = restaurantApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    const fileUrl = await uploadFileToStorage(file);
    const documentId = `doc_${Date.now()}`;

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

    // Update application based on document type
    switch (documentType) {
      case 'business_license':
        application.documents.businessLicense = document;
        break;
      case 'health_permit':
        application.documents.healthPermit = document;
        break;
      case 'sellers_permit':
        application.documents.sellersPermit = document;
        break;
      case 'liability_insurance':
        application.documents.liabilityInsurance = document;
        break;
      case 'workers_comp':
        application.documents.workersComp = document;
        break;
    }

    application.updatedAt = new Date();
    restaurantApplications.set(applicationId, application);

    // Process verification asynchronously
    processDocumentVerification(applicationId, document);

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
// POST /api/restaurants/menu-setup
// Upload and process menu
// ============================================================================

export async function POST_menuSetup(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const formData = await req.formData();
    const applicationId = formData.get('applicationId') as string;
    const menuFile = formData.get('menu') as File;

    if (!applicationId || !menuFile) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Application ID and menu file are required',
        },
      }, { status: 400 });
    }

    const application = restaurantApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    // Upload menu file
    const menuUrl = await uploadFileToStorage(menuFile);

    // Initialize menu setup
    application.menuSetup = {
      status: 'extracting',
      extractionProgress: 0,
      extractedItems: [],
      categories: [],
      modifiers: [],
      itemPhotos: [],
      uploadedAt: new Date(),
    };

    application.updatedAt = new Date();
    restaurantApplications.set(applicationId, application);

    // Process menu extraction asynchronously
    processMenuExtraction(applicationId, menuUrl);

    return NextResponse.json({
      success: true,
      data: {
        status: 'extracting',
        message: 'Menu extraction in progress',
      },
    });
  } catch (error) {
    console.error('Failed to setup menu:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'MENU_PROCESSING_FAILED',
        message: 'Failed to process menu',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/restaurants/bank-connect
// Connect bank account via Stripe Connect
// ============================================================================

export async function POST_bankConnect(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { applicationId, accountHolderName, accountToken } = await req.json();

    if (!applicationId || !accountHolderName || !accountToken) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All banking fields are required',
        },
      }, { status: 400 });
    }

    const application = restaurantApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    // In production, use Stripe Connect to create account
    // const stripeAccount = await stripe.accounts.create({...});

    application.bankingInfo = {
      stripeConnectAccountId: `acct_${Date.now()}`,
      accountHolderName,
      accountType: 'checking',
      microDepositsVerified: false,
      consent1099k: true,
    };

    application.updatedAt = new Date();
    restaurantApplications.set(applicationId, application);

    return NextResponse.json({
      success: true,
      data: {
        accountId: application.bankingInfo.stripeConnectAccountId,
        status: 'pending_verification',
        message: 'Micro-deposits will be sent within 1-2 business days',
      },
    });
  } catch (error) {
    console.error('Failed to connect bank:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'BANK_CONNECTION_FAILED',
        message: 'Failed to connect bank account',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/restaurants/commission-agreement
// Accept commission terms
// ============================================================================

export async function POST_commissionAgreement(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { applicationId, agreed } = await req.json();

    if (!applicationId || !agreed) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'Commission agreement must be accepted',
        },
      }, { status: 400 });
    }

    const application = restaurantApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    application.commissionAgreement = {
      agreedAt: new Date(),
      commissionRate: 0.18, // 18%
      menuDiscountRate: 0.10, // 10%
      deliveryFeeStructure: 'customer_pays',
      payoutSchedule: 'weekly',
      samplePayoutViewed: true,
      agreementDocumentUrl: 'https://legal.paradisedelivery.com/commission-agreement-v1.pdf',
    };

    application.updatedAt = new Date();
    restaurantApplications.set(applicationId, application);

    return NextResponse.json({
      success: true,
      data: { agreed: true },
    });
  } catch (error) {
    console.error('Failed to save agreement:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to save agreement',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/restaurants/equipment-setup
// Complete equipment setup
// ============================================================================

export async function POST_equipmentSetup(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { applicationId, tabletType, hasPrinter, staffTrainingCompleted } = await req.json();

    const application = restaurantApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    application.equipmentSetup = {
      tabletType: tabletType || 'provided',
      hasPrinter: hasPrinter || false,
      staffTrainingCompleted: staffTrainingCompleted || false,
      trainingCompletedAt: staffTrainingCompleted ? new Date() : undefined,
    };

    application.updatedAt = new Date();
    restaurantApplications.set(applicationId, application);

    return NextResponse.json({
      success: true,
      data: { setup: true },
    });
  } catch (error) {
    console.error('Failed to save equipment setup:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to save equipment setup',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST /api/restaurants/test-order
// Complete a test order
// ============================================================================

export async function POST_testOrder(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { applicationId, orderResult } = await req.json();

    const application = restaurantApplications.get(applicationId);
    if (!application) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
        },
      }, { status: 404 });
    }

    if (!application.testOrders) {
      application.testOrders = [];
    }

    application.testOrders.push({
      orderId: `test_${Date.now()}`,
      placedAt: new Date(),
      ...orderResult,
    });

    // Check if all test orders completed successfully
    const completedOrders = application.testOrders.filter(o => o.status === 'completed');
    if (completedOrders.length >= 2 && application.status === 'draft') {
      application.status = 'pending_review';
      application.submittedAt = new Date();

      // Evaluate for auto-approval
      await evaluateRestaurantRisk(applicationId);
    }

    application.updatedAt = new Date();
    restaurantApplications.set(applicationId, application);

    return NextResponse.json({
      success: true,
      data: { completed: true },
    });
  } catch (error) {
    console.error('Failed to record test order:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to record test order',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// GET /api/admin/applications/restaurants
// List restaurant applications for admin
// ============================================================================

export async function GET_adminList(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.getAll('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let applications = Array.from(restaurantApplications.values());

    if (status.length > 0) {
      applications = applications.filter(app => status.includes(app.status));
    }

    const total = applications.length;
    const start = (page - 1) * limit;
    const paginated = applications.slice(start, start + limit);

    const cards = paginated.map(app => ({
      id: app.id,
      restaurantName: app.businessInfo.restaurantName,
      ownerName: app.businessInfo.ownerName,
      email: app.businessInfo.ownerEmail,
      status: app.status,
      riskScore: app.riskScore,
      riskLevel: app.riskLevel,
      submittedAt: app.submittedAt,
      aiChecks: generateRestaurantAiChecks(app),
      menuItemCount: app.menuSetup?.extractedItems.length,
      averagePrepTime: app.location.estimatedPrepTimeMinutes,
      concerns: generateConcerns(app),
      recommendation: app.aiRecommendation.recommendation,
    }));

    return NextResponse.json({
      success: true,
      data: {
        applications: cards,
        meta: { total, page, limit },
      },
    });
  } catch (error) {
    console.error('Failed to list restaurant applications:', error);
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
// HELPER FUNCTIONS
// ============================================================================

async function verifyParadiseAddress(address: any): Promise<boolean> {
  // In production, use geocoding API to verify address is in Paradise/Magalia
  const paradiseZipCodes = ['95969', '95954', '95942'];
  return paradiseZipCodes.includes(address.zipCode);
}

async function uploadFileToStorage(file: File): Promise<string> {
  return `https://storage.paradisedelivery.com/documents/${Date.now()}_${file.name}`;
}

async function processDocumentVerification(applicationId: string, document: any): Promise<void> {
  const { createDocumentVerificationService } = await import('../services/documentVerification');
  const service = createDocumentVerificationService({
    ocrProvider: 'aws-textract',
  });

  const application = restaurantApplications.get(applicationId);
  if (!application) return;

  try {
    const result = await service.verifyDocument(document, {
      applicantName: application.businessInfo.ownerName,
      applicantAddress: application.location.address,
    });

    document.verificationResult = result;
    document.status = result.confidence >= 80 && result.flags.length === 0 ? 'verified' : 'rejected';

    application.updatedAt = new Date();
    restaurantApplications.set(applicationId, application);

    // Evaluate risk score
    await evaluateRestaurantRisk(applicationId);
  } catch (error) {
    console.error('Document verification failed:', error);
    document.status = 'rejected';
    restaurantApplications.set(applicationId, application);
  }
}

async function processMenuExtraction(applicationId: string, menuUrl: string): Promise<void> {
  const application = restaurantApplications.get(applicationId);
  if (!application || !application.menuSetup) return;

  // Simulate AI menu extraction
  // In production, use AWS Textract or similar for OCR + NLP

  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

  application.menuSetup.status = 'review_needed';
  application.menuSetup.extractionProgress = 100;
  application.menuSetup.aiExtractedAt = new Date();

  // Simulated extracted items
  application.menuSetup.extractedItems = [
    {
      id: 'item_1',
      name: 'Sample Item',
      description: 'AI-extracted description',
      price: 12.99,
      category: 'Entrees',
      modifiers: [],
      aiConfidence: 85,
      staffVerified: false,
      highValueItem: false,
    },
  ];

  application.updatedAt = new Date();
  restaurantApplications.set(applicationId, application);

  await sendNotification('menu_extraction_complete', 'restaurant', applicationId, {
    restaurantName: application.businessInfo.restaurantName,
    itemsFound: application.menuSetup.extractedItems.length,
  });
}

async function evaluateRestaurantRisk(applicationId: string): Promise<void> {
  const application = restaurantApplications.get(applicationId);
  if (!application) return;

  const { calculateRestaurantRiskScore } = await import('../utils/riskScoring');
  const result = await calculateRestaurantRiskScore(application);

  application.riskScore = result.score;
  application.riskLevel = result.level;
  application.aiRecommendation = result.recommendation;
  application.updatedAt = new Date();

  // Auto-approve if criteria met
  if (result.recommendation.recommendation === 'auto_approve' && canAutoApproveRestaurant(application)) {
    application.status = 'auto_approved';
    application.reviewedAt = new Date();
    application.reviewedBy = 'system';

    await sendNotification('approved', 'restaurant', applicationId, {
      restaurantName: application.businessInfo.restaurantName,
      autoApproved: true,
    });
  }

  restaurantApplications.set(applicationId, application);
}

function canAutoApproveRestaurant(application: RestaurantApplication): boolean {
  const docs = application.documents;
  return !!(
    docs.businessLicense?.status === 'verified' &&
    docs.healthPermit?.status === 'verified' &&
    docs.liabilityInsurance?.status === 'verified' &&
    application.menuSetup?.status === 'confirmed' &&
    application.bankingInfo?.microDepositsVerified &&
    application.commissionAgreement &&
    application.testOrders &&
    application.testOrders.filter(o => o.status === 'completed').length >= 2 &&
    application.riskScore < 25
  );
}

function generateRestaurantAiChecks(application: RestaurantApplication): any[] {
  const checks = [];
  const docs = application.documents;

  if (docs.businessLicense?.verificationResult) {
    checks.push({
      name: 'Business License Valid',
      passed: docs.businessLicense.status === 'verified',
      details: docs.businessLicense.verificationResult.extractedData.businessName as string,
    });
  }

  if (docs.healthPermit?.verificationResult) {
    checks.push({
      name: 'Health Permit Current',
      passed: docs.healthPermit.status === 'verified',
      warning: docs.healthPermit.verificationResult.flags.includes('expiration_soon'),
    });
  }

  if (docs.liabilityInsurance?.verificationResult) {
    const coverage = docs.liabilityInsurance.verificationResult.extractedData.coverageAmount;
    checks.push({
      name: 'Insurance Verified',
      passed: docs.liabilityInsurance.status === 'verified',
      details: coverage ? `$${(Number(coverage) / 1000000).toFixed(1)}M coverage` : undefined,
    });
  }

  if (application.menuSetup) {
    checks.push({
      name: 'Menu Extracted',
      passed: application.menuSetup.status === 'confirmed',
      details: `${application.menuSetup.extractedItems.length} items`,
    });
  }

  return checks;
}

function generateConcerns(application: RestaurantApplication): string[] {
  const concerns: string[] = [];

  const highValueItems = application.menuSetup?.extractedItems.filter(i => i.price > 40);
  if (highValueItems && highValueItems.length > 0) {
    concerns.push(`${highValueItems.length} items over $40 (high refund risk)`);
  }

  if (application.businessInfo.yearsInBusiness < 1) {
    concerns.push('New business (< 1 year)');
  }

  if (application.menuSetup && application.menuSetup.extractedItems.length < 10) {
    concerns.push('Small menu (limited items)');
  }

  return concerns;
}

async function sendNotification(type: string, recipientType: string, recipientId: string, data: any): Promise<void> {
  console.log(`[Notification] ${type} to ${recipientType} ${recipientId}`, data);
}

export const POST = POST_apply;
