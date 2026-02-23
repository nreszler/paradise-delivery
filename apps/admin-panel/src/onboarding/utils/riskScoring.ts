/**
 * Risk Scoring Utilities
 * Calculates risk scores and generates AI recommendations
 */

import {
  DriverApplication,
  RestaurantApplication,
  RiskLevel,
  AiRecommendation,
  RiskFactor,
  AutoRejectFlag,
} from '../types';

// ============================================================================
// DRIVER RISK SCORING
// ============================================================================

interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  recommendation: AiRecommendation;
}

export async function calculateDriverRiskScore(
  application: DriverApplication
): Promise<RiskScoreResult> {
  let score = 0;
  const riskFactors: RiskFactor[] = [];
  const positiveIndicators: string[] = [];

  // Document Verification Risk (0-30 points)
  const docRisk = calculateDocumentRisk(application);
  score += docRisk.score;
  riskFactors.push(...docRisk.factors);

  // Background Check Risk (0-40 points)
  const bgRisk = calculateBackgroundCheckRisk(application);
  score += bgRisk.score;
  riskFactors.push(...bgRisk.factors);

  // Identity Verification Risk (0-20 points)
  const idRisk = calculateIdentityRisk(application);
  score += idRisk.score;
  riskFactors.push(...idRisk.factors);

  // Application Quality Risk (0-10 points)
  const appRisk = calculateApplicationQualityRisk(application);
  score += appRisk.score;
  riskFactors.push(...appRisk.factors);

  // Positive indicators
  if (application.documents.licenseFront?.status === 'verified' &&
      application.documents.licenseBack?.status === 'verified') {
    positiveIndicators.push('Valid driver\'s license verified');
  }

  if (application.backgroundCheck?.drivingRecord.movingViolations2Years === 0) {
    positiveIndicators.push('Clean driving record (2 years)');
  }

  if (application.backgroundCheck?.criminalRecords.length === 0) {
    positiveIndicators.push('No criminal record');
  }

  // Determine risk level
  const level = getRiskLevel(score);

  // Generate recommendation
  const recommendation = generateRecommendation(score, application, riskFactors, positiveIndicators);

  return {
    score: Math.min(100, Math.max(0, score)),
    level,
    recommendation,
  };
}

function calculateDocumentRisk(application: DriverApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];
  const docs = application.documents;

  // Check license
  if (docs.licenseFront?.status === 'rejected' || docs.licenseBack?.status === 'rejected') {
    score += 30;
    factors.push({
      factor: 'license_rejected',
      severity: 'high',
      weight: 30,
      description: 'Driver\'s license verification failed',
    });
  } else if (!docs.licenseFront || !docs.licenseBack) {
    score += 10;
    factors.push({
      factor: 'license_pending',
      severity: 'medium',
      weight: 10,
      description: 'Driver\'s license not yet uploaded',
    });
  }

  // Check insurance
  if (docs.autoInsurance?.status === 'rejected') {
    score += 25;
    factors.push({
      factor: 'insurance_rejected',
      severity: 'high',
      weight: 25,
      description: 'Auto insurance verification failed',
    });
  } else if (docs.autoInsurance?.verificationResult?.flags.includes('coverage_inadequate')) {
    score += 20;
    factors.push({
      factor: 'inadequate_coverage',
      severity: 'high',
      weight: 20,
      description: 'Insurance coverage may be inadequate',
    });
  } else if (!docs.autoInsurance) {
    score += 8;
    factors.push({
      factor: 'insurance_pending',
      severity: 'medium',
      weight: 8,
      description: 'Auto insurance not yet uploaded',
    });
  }

  // Check registration
  if (docs.vehicleRegistration?.status === 'rejected') {
    score += 20;
    factors.push({
      factor: 'registration_rejected',
      severity: 'high',
      weight: 20,
      description: 'Vehicle registration verification failed',
    });
  } else if (!docs.vehicleRegistration) {
    score += 5;
    factors.push({
      factor: 'registration_pending',
      severity: 'low',
      weight: 5,
      description: 'Vehicle registration not yet uploaded',
    });
  }

  // Check photo
  if (docs.profilePhoto?.status === 'rejected') {
    score += 15;
    factors.push({
      factor: 'photo_rejected',
      severity: 'medium',
      weight: 15,
      description: 'Profile photo rejected - may not match license',
    });
  }

  return { score, factors };
}

function calculateBackgroundCheckRisk(application: DriverApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];
  const bg = application.backgroundCheck;

  if (!bg) {
    return { score: 20, factors: [{
      factor: 'background_check_pending',
      severity: 'medium',
      weight: 20,
      description: 'Background check not yet initiated',
    }]};
  }

  // Check auto-reject flags
  if (bg.autoRejectFlags.includes('dui_7_years')) {
    score += 100; // Auto-reject
    factors.push({
      factor: 'dui_history',
      severity: 'high',
      weight: 100,
      description: 'DUI/DWI conviction in last 7 years',
    });
  }

  if (bg.autoRejectFlags.includes('violent_felony')) {
    score += 100; // Auto-reject
    factors.push({
      factor: 'violent_felony',
      severity: 'high',
      weight: 100,
      description: 'Violent felony conviction',
    });
  }

  if (bg.autoRejectFlags.includes('excessive_violations')) {
    score += 40;
    factors.push({
      factor: 'excessive_violations',
      severity: 'high',
      weight: 40,
      description: 'More than 3 moving violations in 2 years',
    });
  }

  if (bg.autoRejectFlags.includes('suspended_license')) {
    score += 100; // Auto-reject
    factors.push({
      factor: 'suspended_license',
      severity: 'high',
      weight: 100,
      description: 'Suspended license on record',
    });
  }

  if (bg.autoRejectFlags.includes('reckless_driving')) {
    score += 50;
    factors.push({
      factor: 'reckless_driving',
      severity: 'high',
      weight: 50,
      description: 'Reckless driving conviction',
    });
  }

  if (bg.autoRejectFlags.includes('sex_offender')) {
    score += 100; // Auto-reject
    factors.push({
      factor: 'sex_offender',
      severity: 'high',
      weight: 100,
      description: 'Registered sex offender',
    });
  }

  // Non-auto-reject driving record factors
  const movingViolations = bg.drivingRecord?.movingViolations2Years || 0;
  if (movingViolations >= 2) {
    score += movingViolations * 5;
    factors.push({
      factor: 'moving_violations',
      severity: 'medium',
      weight: movingViolations * 5,
      description: `${movingViolations} moving violations in last 2 years`,
    });
  }

  // License status
  if (bg.drivingRecord?.licenseStatus !== 'valid') {
    score += 35;
    factors.push({
      factor: 'invalid_license_status',
      severity: 'high',
      weight: 35,
      description: `License status: ${bg.drivingRecord?.licenseStatus}`,
    });
  }

  // Old criminal records (not auto-reject)
  const oldRecords = bg.criminalRecords?.filter(r => {
    const yearsAgo = (Date.now() - new Date(r.offenseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return yearsAgo > 3 && yearsAgo <= 7 && !r.violent;
  }) || [];

  if (oldRecords.length > 0) {
    score += oldRecords.length * 10;
    factors.push({
      factor: 'old_criminal_record',
      severity: 'medium',
      weight: oldRecords.length * 10,
      description: `${oldRecords.length} non-violent criminal record(s) 3-7 years ago`,
    });
  }

  return { score, factors };
}

function calculateIdentityRisk(application: DriverApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];

  // Name mismatch across documents
  const nameFlags = [
    application.documents.licenseFront?.verificationResult?.flags.includes('name_mismatch'),
    application.documents.licenseBack?.verificationResult?.flags.includes('name_mismatch'),
    application.documents.vehicleRegistration?.verificationResult?.flags.includes('name_mismatch'),
  ].filter(Boolean);

  if (nameFlags.length > 0) {
    score += 15;
    factors.push({
      factor: 'name_mismatch',
      severity: 'high',
      weight: 15,
      description: 'Name mismatch detected across documents',
    });
  }

  // Document authenticity
  const suspiciousDocs = [
    application.documents.licenseFront?.verificationResult?.authenticityScore < 70,
    application.documents.licenseBack?.verificationResult?.authenticityScore < 70,
  ].filter(Boolean);

  if (suspiciousDocs.length > 0) {
    score += 20;
    factors.push({
      factor: 'suspicious_documents',
      severity: 'high',
      weight: 20,
      description: 'Document authenticity concerns detected',
    });
  }

  // Fraud detection flags
  const fraudFlags = [
    application.documents.licenseFront?.verificationResult?.flags.includes('suspicious_editing'),
    application.documents.licenseFront?.verificationResult?.flags.includes('template_match_known_fake'),
  ].filter(Boolean);

  if (fraudFlags.length > 0) {
    score += 50;
    factors.push({
      factor: 'potential_fraud',
      severity: 'high',
      weight: 50,
      description: 'Potential document fraud detected',
    });
  }

  return { score, factors };
}

function calculateApplicationQualityRisk(application: DriverApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];

  // Document quality issues
  const qualityFlags = [
    application.documents.licenseFront?.verificationResult?.flags.includes('blurry_image'),
    application.documents.licenseFront?.verificationResult?.flags.includes('poor_lighting'),
    application.documents.licenseFront?.verificationResult?.flags.includes('document_cropped'),
  ].filter(Boolean);

  if (qualityFlags.length > 0) {
    score += 5;
    factors.push({
      factor: 'document_quality',
      severity: 'low',
      weight: 5,
      description: 'Document image quality issues',
    });
  }

  // Age verification (must be 18+)
  const age = calculateAge(application.basicInfo.dateOfBirth);
  if (age < 21) {
    score += 5;
    factors.push({
      factor: 'young_driver',
      severity: 'low',
      weight: 5,
      description: `Driver is ${age} years old`,
    });
  }

  return { score, factors };
}

// ============================================================================
// RESTAURANT RISK SCORING
// ============================================================================

export async function calculateRestaurantRiskScore(
  application: RestaurantApplication
): Promise<RiskScoreResult> {
  let score = 0;
  const riskFactors: RiskFactor[] = [];
  const positiveIndicators: string[] = [];

  // Document Verification Risk (0-30 points)
  const docRisk = calculateRestaurantDocumentRisk(application);
  score += docRisk.score;
  riskFactors.push(...docRisk.factors);

  // Business History Risk (0-25 points)
  const historyRisk = calculateBusinessHistoryRisk(application);
  score += historyRisk.score;
  riskFactors.push(...historyRisk.factors);

  // Menu Risk (0-25 points)
  const menuRisk = calculateMenuRisk(application);
  score += menuRisk.score;
  riskFactors.push(...menuRisk.factors);

  // Operational Risk (0-20 points)
  const opRisk = calculateOperationalRisk(application);
  score += opRisk.score;
  riskFactors.push(...opRisk.factors);

  // Positive indicators
  if (application.businessInfo.yearsInBusiness >= 5) {
    positiveIndicators.push('Established business (5+ years)');
  }

  if (application.documents.healthPermit?.status === 'verified') {
    positiveIndicators.push('Valid health permit');
  }

  if (application.menuSetup && application.menuSetup.extractedItems.length >= 20) {
    positiveIndicators.push('Comprehensive menu (20+ items)');
  }

  // Determine risk level
  const level = getRiskLevel(score);

  // Generate recommendation
  const recommendation = generateRecommendation(score, application, riskFactors, positiveIndicators);

  return {
    score: Math.min(100, Math.max(0, score)),
    level,
    recommendation,
  };
}

function calculateRestaurantDocumentRisk(application: RestaurantApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];
  const docs = application.documents;

  // Health permit (critical)
  if (docs.healthPermit?.status === 'rejected') {
    score += 30;
    factors.push({
      factor: 'health_permit_rejected',
      severity: 'high',
      weight: 30,
      description: 'Health permit verification failed',
    });
  } else if (!docs.healthPermit) {
    score += 15;
    factors.push({
      factor: 'health_permit_pending',
      severity: 'high',
      weight: 15,
      description: 'Health permit not uploaded',
    });
  } else if (docs.healthPermit.verificationResult?.flags.includes('expiration_soon')) {
    score += 10;
    factors.push({
      factor: 'health_permit_expiring',
      severity: 'medium',
      weight: 10,
      description: 'Health permit expires soon',
    });
  }

  // Business license
  if (docs.businessLicense?.status === 'rejected') {
    score += 25;
    factors.push({
      factor: 'business_license_rejected',
      severity: 'high',
      weight: 25,
      description: 'Business license verification failed',
    });
  } else if (!docs.businessLicense) {
    score += 10;
    factors.push({
      factor: 'business_license_pending',
      severity: 'medium',
      weight: 10,
      description: 'Business license not uploaded',
    });
  }

  // Insurance
  if (docs.liabilityInsurance?.status === 'rejected') {
    score += 20;
    factors.push({
      factor: 'insurance_rejected',
      severity: 'high',
      weight: 20,
      description: 'Liability insurance verification failed',
    });
  } else if (!docs.liabilityInsurance) {
    score += 10;
    factors.push({
      factor: 'insurance_pending',
      severity: 'medium',
      weight: 10,
      description: 'Liability insurance not uploaded',
    });
  }

  return { score, factors };
}

function calculateBusinessHistoryRisk(application: RestaurantApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];

  // Years in business
  const years = application.businessInfo.yearsInBusiness;
  if (years < 0.5) {
    score += 25;
    factors.push({
      factor: 'very_new_business',
      severity: 'high',
      weight: 25,
      description: 'Business less than 6 months old',
    });
  } else if (years < 1) {
    score += 15;
    factors.push({
      factor: 'new_business',
      severity: 'medium',
      weight: 15,
      description: 'Business less than 1 year old',
    });
  } else if (years < 2) {
    score += 8;
    factors.push({
      factor: 'recent_business',
      severity: 'low',
      weight: 8,
      description: 'Business less than 2 years old',
    });
  }

  // Business type
  if (application.businessInfo.businessType === 'sole_proprietorship') {
    score += 5;
    factors.push({
      factor: 'sole_proprietorship',
      severity: 'low',
      weight: 5,
      description: 'Sole proprietorship (higher liability risk)',
    });
  }

  return { score, factors };
}

function calculateMenuRisk(application: RestaurantApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];
  const menu = application.menuSetup;

  if (!menu) {
    return { score: 15, factors: [{
      factor: 'menu_pending',
      severity: 'medium',
      weight: 15,
      description: 'Menu not yet uploaded',
    }]};
  }

  // High-value items (refund risk)
  const highValueItems = menu.extractedItems.filter(i => i.price > 40);
  if (highValueItems.length > 5) {
    score += 15;
    factors.push({
      factor: 'many_high_value_items',
      severity: 'medium',
      weight: 15,
      description: `${highValueItems.length} items over $40 (high refund risk)`,
    });
  } else if (highValueItems.length > 0) {
    score += highValueItems.length * 2;
    factors.push({
      factor: 'high_value_items',
      severity: 'low',
      weight: highValueItems.length * 2,
      description: `${highValueItems.length} items over $40`,
    });
  }

  // Menu size
  if (menu.extractedItems.length < 10) {
    score += 10;
    factors.push({
      factor: 'small_menu',
      severity: 'medium',
      weight: 10,
      description: `Only ${menu.extractedItems.length} menu items`,
    });
  } else if (menu.extractedItems.length < 15) {
    score += 5;
    factors.push({
      factor: 'limited_menu',
      severity: 'low',
      weight: 5,
      description: `Limited menu (${menu.extractedItems.length} items)`,
    });
  }

  // AI extraction confidence
  const lowConfidenceItems = menu.extractedItems.filter(i => i.aiConfidence < 70);
  if (lowConfidenceItems.length > menu.extractedItems.length * 0.3) {
    score += 8;
    factors.push({
      factor: 'menu_extraction_uncertain',
      severity: 'low',
      weight: 8,
      description: 'Many menu items had low extraction confidence',
    });
  }

  return { score, factors };
}

function calculateOperationalRisk(application: RestaurantApplication): {
  score: number;
  factors: RiskFactor[];
} {
  let score = 0;
  const factors: RiskFactor[] = [];

  // Preparation time
  if (application.location.estimatedPrepTimeMinutes > 30) {
    score += 10;
    factors.push({
      factor: 'long_prep_time',
      severity: 'medium',
      weight: 10,
      description: `Estimated prep time ${application.location.estimatedPrepTimeMinutes} minutes`,
    });
  } else if (application.location.estimatedPrepTimeMinutes > 20) {
    score += 5;
    factors.push({
      factor: 'extended_prep_time',
      severity: 'low',
      weight: 5,
      description: `Estimated prep time ${application.location.estimatedPrepTimeMinutes} minutes`,
    });
  }

  // Test orders
  const testOrders = application.testOrders || [];
  const failedTests = testOrders.filter(o => o.status === 'failed');
  if (failedTests.length > 0) {
    score += failedTests.length * 10;
    factors.push({
      factor: 'failed_test_orders',
      severity: 'high',
      weight: failedTests.length * 10,
      description: `${failedTests.length} test order(s) failed`,
    });
  }

  // Delivery radius
  if (application.location.deliveryRadiusMiles > 8) {
    score += 5;
    factors.push({
      factor: 'large_delivery_radius',
      severity: 'low',
      weight: 5,
      description: `Large delivery radius (${application.location.deliveryRadiusMiles} miles)`,
    });
  }

  return { score, factors };
}

// ============================================================================
// SHARED UTILITIES
// ============================================================================

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

function generateRecommendation(
  score: number,
  application: DriverApplication | RestaurantApplication,
  riskFactors: RiskFactor[],
  positiveIndicators: string[]
): AiRecommendation {
  const reasoning: string[] = [];
  
  // Build reasoning from risk factors and positive indicators
  if (riskFactors.length > 0) {
    reasoning.push(`${riskFactors.length} risk factor(s) identified`);
  }
  if (positiveIndicators.length > 0) {
    reasoning.push(`${positiveIndicators.length} positive indicator(s) identified`);
  }

  // Auto-reject criteria
  const hasAutoRejectFactor = riskFactors.some(f => f.weight >= 100);
  if (hasAutoRejectFactor) {
    return {
      recommendation: 'auto_reject',
      confidence: 95,
      reasoning: [...reasoning, 'Auto-reject criteria triggered'],
      riskFactors,
      positiveIndicators,
      generatedAt: new Date(),
    };
  }

  // Determine recommendation based on score
  let recommendation: AiRecommendation['recommendation'];
  let confidence: number;

  if (score < 20) {
    recommendation = 'auto_approve';
    confidence = 90 + (20 - score);
    reasoning.push('Low risk profile meets auto-approval criteria');
  } else if (score < 30) {
    recommendation = 'auto_approve';
    confidence = 80;
    reasoning.push('Low-medium risk, acceptable for auto-approval');
  } else if (score < 50) {
    recommendation = 'manual_review';
    confidence = 70;
    reasoning.push('Medium risk - recommend manual review');
  } else if (score < 70) {
    recommendation = 'manual_review';
    confidence = 80;
    reasoning.push('Elevated risk - manual review required');
  } else {
    recommendation = 'approve_with_monitoring';
    confidence = 75;
    reasoning.push('Higher risk - approve with increased monitoring');
  }

  return {
    recommendation,
    confidence: Math.min(100, confidence),
    reasoning,
    riskFactors,
    positiveIndicators,
    generatedAt: new Date(),
  };
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}
