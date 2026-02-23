/**
 * PARADISE DELIVERY - AI-Powered Onboarding System
 * Core Types and Interfaces
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type ApplicationStatus = 
  | 'draft'
  | 'pending_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'auto_approved'
  | 'auto_rejected'
  | 'test_orders_pending'
  | 'onboarding_complete';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type DocumentType = 
  | 'drivers_license_front'
  | 'drivers_license_back'
  | 'auto_insurance'
  | 'vehicle_registration'
  | 'profile_photo'
  | 'business_license'
  | 'health_permit'
  | 'sellers_permit'
  | 'liability_insurance'
  | 'workers_comp'
  | 'menu_pdf'
  | 'bank_statement'
  | 'w9_form'
  | 'pickup_area_photo';

export interface VerificationResult {
  documentType: DocumentType;
  confidence: number; // 0-100
  extractedData: Record<string, string | Date | number | undefined>;
  flags: VerificationFlag[];
  authenticityScore: number; // 0-100, fraud detection
  ocrText?: string;
  processedAt: Date;
  processingTimeMs: number;
}

export type VerificationFlag = 
  | 'expiration_soon'
  | 'name_mismatch'
  | 'date_invalid'
  | 'blurry_image'
  | 'poor_lighting'
  | 'document_cropped'
  | 'suspicious_editing'
  | 'template_match_known_fake'
  | 'expired_document'
  | 'invalid_document_type'
  | 'class_mismatch'
  | 'coverage_inadequate'
  | 'address_mismatch';

export interface DocumentUpload {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  verificationResult?: VerificationResult;
  status: 'pending' | 'processing' | 'verified' | 'rejected';
  rejectionReason?: string;
}

export interface AuditLogEntry {
  id: string;
  applicationId: string;
  applicationType: 'driver' | 'restaurant';
  action: string;
  performedBy: string;
  performedByRole: 'system' | 'admin' | 'ai';
  timestamp: Date;
  details: Record<string, unknown>;
  ipAddress?: string;
}

// ============================================================================
// DRIVER ONBOARDING TYPES
// ============================================================================

export interface DriverApplication {
  id: string;
  status: ApplicationStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  
  // Step 1: Basic Info
  basicInfo: DriverBasicInfo;
  
  // Step 2: Vehicle Information
  vehicleInfo: VehicleInfo;
  
  // Step 3: Documents
  documents: DriverDocuments;
  
  // Step 4: Background Check
  backgroundCheck?: BackgroundCheckResult;
  backgroundCheckConsentAt?: Date;
  
  // Step 5: Prop 22 Compliance (CA only)
  prop22Compliance?: Prop22Compliance;
  
  // Step 6: Orientation (Simplified - Read-only)
  orientation?: OrientationCompletion;
  
  // AI Review
  aiRecommendation: AiRecommendation;
  
  // Admin Review
  adminNotes?: string;
  rejectionReason?: string;
  appealStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface DriverBasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  ssnEncrypted: string; // Encrypted SSN
  ssnLast4: string; // Last 4 for display
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface VehicleInfo {
  type: 'car' | 'bike' | 'scooter' | 'motorcycle';
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin?: string;
}

export interface DriverDocuments {
  licenseFront?: DocumentUpload;
  licenseBack?: DocumentUpload;
  autoInsurance?: DocumentUpload;
  vehicleRegistration?: DocumentUpload;
  profilePhoto?: DocumentUpload;
}

export interface BackgroundCheckResult {
  provider: 'checkr' | 'sterling' | 'goodhire';
  reportId: string;
  status: 'pending' | 'clear' | 'consider' | 'suspended';
  initiatedAt: Date;
  completedAt?: Date;
  
  // Criminal History (7 years)
  criminalRecords: CriminalRecord[];
  
  // Driving Record
  drivingRecord: DrivingRecord;
  
  // Sex Offender Registry
  sexOffenderCheck: 'clear' | 'hit';
  
  // Auto-reject flags
  autoRejectFlags: AutoRejectFlag[];
  
  // Raw report URL (secure)
  reportUrl?: string;
}

export interface CriminalRecord {
  offense: string;
  offenseDate: Date;
  convictionDate?: Date;
  disposition: string;
  severity: 'misdemeanor' | 'felony' | 'infraction';
  violent: boolean;
  duiRelated: boolean;
}

export interface DrivingRecord {
  licenseStatus: 'valid' | 'suspended' | 'expired' | 'revoked';
  licenseClass: string;
  violations: DrivingViolation[];
  totalViolations: number;
  movingViolations2Years: number;
}

export interface DrivingViolation {
  date: Date;
  violation: string;
  points: number;
  moving: boolean;
  reckless: boolean;
  dui: boolean;
}

export type AutoRejectFlag = 
  | 'dui_7_years'
  | 'violent_felony'
  | 'excessive_violations'
  | 'suspended_license'
  | 'reckless_driving'
  | 'sex_offender';

export interface Prop22Compliance {
  acknowledgedAt: Date;
  contractorStatusAcknowledged: boolean;
  rightsUnderstood: boolean;
  healthcareEnrollmentRequired: boolean;
  healthcareEnrollmentCompleted?: boolean;
  weeklyHoursEstimate: number;
}

export interface OrientationCompletion {
  completedAt: Date;
  sectionsViewed: OrientationSection[];
  totalTimeSpentSeconds: number;
  acknowledged: boolean;
}

export interface OrientationSection {
  sectionId: string;
  title: string;
  viewedAt: Date;
  timeSpentSeconds: number;
}

export type OrientationSectionType =
  | 'welcome'
  | 'how_delivery_works'
  | 'safety_guidelines'
  | 'using_the_app'
  | 'customer_service'
  | 'earnings_payments'
  | 'prop22_rights';

// ============================================================================
// RESTAURANT ONBOARDING TYPES
// ============================================================================

export interface RestaurantApplication {
  id: string;
  status: ApplicationStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  
  // Step 1: Business Info
  businessInfo: BusinessInfo;
  
  // Step 2: Location & Hours
  location: RestaurantLocation;
  
  // Step 3: Legal Documents
  documents: RestaurantDocuments;
  
  // Step 4: Menu Setup
  menuSetup?: MenuSetup;
  
  // Step 5: Banking & Tax
  bankingInfo?: BankingInfo;
  
  // Step 6: Commission Agreement
  commissionAgreement?: CommissionAgreement;
  
  // Step 7: Equipment & Setup
  equipmentSetup?: EquipmentSetup;
  
  // Step 8: Test Orders
  testOrders?: TestOrderResult[];
  
  // AI Review
  aiRecommendation: AiRecommendation;
  
  // Admin Review
  adminNotes?: string;
  rejectionReason?: string;
}

export interface BusinessInfo {
  restaurantName: string;
  businessType: 'llc' | 'corporation' | 'sole_proprietorship' | 'partnership';
  ein: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  yearsInBusiness: number;
  website?: string;
  cuisineType: string;
}

export interface RestaurantLocation {
  address: Address;
  businessHours: BusinessHours;
  deliveryHours?: BusinessHours;
  deliveryRadiusMiles: number;
  estimatedPrepTimeMinutes: number;
  verifiedInParadise: boolean;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "22:00"
  closed: boolean;
}

export interface RestaurantDocuments {
  businessLicense?: DocumentUpload;
  healthPermit?: DocumentUpload;
  sellersPermit?: DocumentUpload;
  liabilityInsurance?: DocumentUpload;
  workersComp?: DocumentUpload;
}

export interface MenuSetup {
  status: 'pending' | 'extracting' | 'review_needed' | 'confirmed';
  extractionProgress?: number;
  extractedItems: ExtractedMenuItem[];
  categories: MenuCategory[];
  modifiers: MenuModifier[];
  itemPhotos: MenuItemPhoto[];
  uploadedAt: Date;
  aiExtractedAt?: Date;
  staffConfirmedAt?: Date;
}

export interface ExtractedMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  modifiers: string[];
  aiConfidence: number;
  staffVerified: boolean;
  highValueItem: boolean; // > $40 flag
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
}

export interface MenuModifier {
  id: string;
  name: string;
  options: ModifierOption[];
  required: boolean;
  multipleSelection: boolean;
}

export interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface MenuItemPhoto {
  itemId: string;
  photoUrl: string;
  uploadedAt: Date;
}

export interface BankingInfo {
  stripeConnectAccountId?: string;
  accountHolderName: string;
  bankName?: string;
  accountType: 'checking' | 'savings';
  last4?: string;
  routingLast4?: string;
  microDepositsVerified: boolean;
  w9Form?: DocumentUpload;
  consent1099k: boolean;
}

export interface CommissionAgreement {
  agreedAt: Date;
  commissionRate: number; // 18%
  menuDiscountRate: number; // 10%
  deliveryFeeStructure: string;
  payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
  samplePayoutViewed: boolean;
  agreementDocumentUrl: string;
}

export interface EquipmentSetup {
  tabletType: 'provided' | 'byod';
  tabletSerialNumber?: string;
  hasPrinter: boolean;
  printerSerialNumber?: string;
  pickupAreaPhoto?: DocumentUpload;
  staffTrainingCompleted: boolean;
  trainingCompletedAt?: Date;
}

export interface TestOrderResult {
  orderId: string;
  placedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  timingMinutes: number;
  receiptPrinted: boolean;
  qualityScore: number;
  issues: string[];
  staffFamiliarWithApp: boolean;
}

// ============================================================================
// AI RECOMMENDATION TYPES
// ============================================================================

export interface AiRecommendation {
  recommendation: 'auto_approve' | 'auto_reject' | 'manual_review' | 'approve_with_monitoring';
  confidence: number;
  reasoning: string[];
  riskFactors: RiskFactor[];
  positiveIndicators: string[];
  generatedAt: Date;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  weight: number;
  description: string;
}

// ============================================================================
// ADMIN DASHBOARD TYPES
// ============================================================================

export interface DriverApplicationCard {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  submittedAt?: Date;
  aiChecks: AiCheckResult[];
  orientationCompleted?: boolean;
  orientationTimeSpent?: number; // seconds
  recommendation: string;
  pendingDocuments: DocumentType[];
}

export interface RestaurantApplicationCard {
  id: string;
  restaurantName: string;
  ownerName: string;
  email: string;
  status: ApplicationStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  submittedAt?: Date;
  aiChecks: AiCheckResult[];
  menuItemCount?: number;
  averagePrepTime?: number;
  concerns: string[];
  recommendation: string;
}

export interface AiCheckResult {
  name: string;
  passed: boolean;
  details?: string;
  warning?: boolean;
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  riskLevel?: RiskLevel[];
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
  sortBy: 'date' | 'risk_score' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface BulkAction {
  action: 'approve' | 'reject' | 'request_info' | 'export';
  applicationIds: string[];
  reason?: string;
}

export interface OnboardingMetrics {
  totalApplications: number;
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  averageProcessingTime: number; // hours
  approvalRate: number; // percentage
  funnelStages: FunnelStage[];
}

export interface FunnelStage {
  stage: string;
  count: number;
  dropOff: number;
  conversionRate: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'application_received'
  | 'document_rejected'
  | 'background_check_initiated'
  | 'background_check_complete'
  | 'approved'
  | 'rejected'
  | 'orientation_reminder'
  | 'menu_extraction_complete'
  | 'test_order_ready'
  | 'reminder_missing_docs'
  | 'high_risk_flagged'
  | 'auto_rejected';

export interface Notification {
  id: string;
  type: NotificationType;
  recipientType: 'driver' | 'restaurant' | 'admin';
  recipientId: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  sentAt: Date;
  readAt?: Date;
  channel: 'email' | 'sms' | 'push' | 'in_app';
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface DriverApplicationRequest {
  basicInfo: Omit<DriverBasicInfo, 'ssnEncrypted' | 'ssnLast4'> & { ssn: string };
  vehicleInfo: VehicleInfo;
}

export interface RestaurantApplicationRequest {
  businessInfo: BusinessInfo;
  location: Omit<RestaurantLocation, 'verifiedInParadise'>;
}

export interface DocumentUploadRequest {
  applicationId: string;
  documentType: DocumentType;
  file: File;
}

export interface ReviewActionRequest {
  applicationId: string;
  action: 'approve' | 'reject' | 'request_info';
  reason?: string;
  notes?: string;
  adminId: string;
}
