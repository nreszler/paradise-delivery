/**
 * Onboarding Utilities
 */

import {
  DriverApplication,
  RestaurantApplication,
  ApplicationStatus,
  DocumentType,
  OrientationSectionType,
} from '../types';

// ============================================================================
// Progress Calculation
// ============================================================================

export function calculateDriverProgress(application: DriverApplication): {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  currentStep: string;
} {
  const steps = [
    { key: 'basic_info', label: 'Basic Information', check: () => !!application.basicInfo.firstName },
    { key: 'vehicle_info', label: 'Vehicle Information', check: () => !!application.vehicleInfo.licensePlate },
    { key: 'license_front', label: 'Driver\'s License (Front)', check: () => application.documents.licenseFront?.status === 'verified' },
    { key: 'license_back', label: 'Driver\'s License (Back)', check: () => application.documents.licenseBack?.status === 'verified' },
    { key: 'insurance', label: 'Auto Insurance', check: () => application.documents.autoInsurance?.status === 'verified' },
    { key: 'registration', label: 'Vehicle Registration', check: () => application.documents.vehicleRegistration?.status === 'verified' },
    { key: 'profile_photo', label: 'Profile Photo', check: () => application.documents.profilePhoto?.status === 'verified' },
    { key: 'background_check', label: 'Background Check', check: () => application.backgroundCheck?.status === 'clear' },
    { key: 'orientation', label: 'Orientation', check: () => !!application.orientation?.acknowledged },
  ];

  const completedSteps = steps.filter(s => s.check()).length;
  const percentage = Math.round((completedSteps / steps.length) * 100);

  // Find current step
  let currentStep = steps[0].key;
  for (const step of steps) {
    if (!step.check()) {
      currentStep = step.key;
      break;
    }
    currentStep = 'complete';
  }

  return {
    percentage,
    completedSteps,
    totalSteps: steps.length,
    currentStep,
  };
}

export function calculateRestaurantProgress(application: RestaurantApplication): {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
} {
  const steps = [
    { label: 'Business Information', check: () => !!application.businessInfo.ein },
    { label: 'Location & Hours', check: () => !!application.location.address.street },
    { label: 'Business License', check: () => application.documents.businessLicense?.status === 'verified' },
    { label: 'Health Permit', check: () => application.documents.healthPermit?.status === 'verified' },
    { label: 'Insurance', check: () => application.documents.liabilityInsurance?.status === 'verified' },
    { label: 'Menu Setup', check: () => application.menuSetup?.status === 'confirmed' },
    { label: 'Bank Account', check: () => application.bankingInfo?.microDepositsVerified },
    { label: 'Commission Agreement', check: () => !!application.commissionAgreement },
    { label: 'Equipment Setup', check: () => application.equipmentSetup?.staffTrainingCompleted },
    { label: 'Test Orders', check: () => (application.testOrders?.filter(o => o.status === 'completed').length || 0) >= 2 },
  ];

  const completedSteps = steps.filter(s => s.check()).length;
  const percentage = Math.round((completedSteps / steps.length) * 100);

  return {
    percentage,
    completedSteps,
    totalSteps: steps.length,
  };
}

// ============================================================================
// Step Helpers
// ============================================================================

export function getDriverNextSteps(application: DriverApplication): string[] {
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

export function getDocumentStatus(application: DriverApplication): {
  type: DocumentType;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'missing';
  label: string;
}[] {
  const documentTypes: { type: DocumentType; label: string; key: keyof typeof application.documents }[] = [
    { type: 'drivers_license_front', label: 'Driver\'s License (Front)', key: 'licenseFront' },
    { type: 'drivers_license_back', label: 'Driver\'s License (Back)', key: 'licenseBack' },
    { type: 'auto_insurance', label: 'Auto Insurance', key: 'autoInsurance' },
    { type: 'vehicle_registration', label: 'Vehicle Registration', key: 'vehicleRegistration' },
    { type: 'profile_photo', label: 'Profile Photo', key: 'profilePhoto' },
  ];

  return documentTypes.map(({ type, label, key }) => {
    const doc = application.documents[key];
    return {
      type,
      label,
      status: doc?.status || 'missing',
    };
  });
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateDriverBasicInfo(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  ssn?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.firstName || data.firstName.length < 2) {
    errors.firstName = 'First name is required';
  }
  if (!data.lastName || data.lastName.length < 2) {
    errors.lastName = 'Last name is required';
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Valid email is required';
  }
  if (!data.phone || !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = 'Valid phone number is required';
  }
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const dob = new Date(data.dateOfBirth);
    const age = calculateAge(dob);
    if (age < 18) {
      errors.dateOfBirth = 'You must be at least 18 years old';
    }
  }
  if (!data.ssn || !/^\d{3}-?\d{2}-?\d{4}$/.test(data.ssn)) {
    errors.ssn = 'Valid SSN is required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateVehicleInfo(data: {
  type?: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.type) {
    errors.type = 'Vehicle type is required';
  }
  if (!data.make || data.make.length < 2) {
    errors.make = 'Make is required';
  }
  if (!data.model || data.model.length < 2) {
    errors.model = 'Model is required';
  }
  if (!data.year || data.year < 1990 || data.year > new Date().getFullYear() + 1) {
    errors.year = 'Valid vehicle year is required';
  }
  if (!data.licensePlate || data.licensePlate.length < 3) {
    errors.licensePlate = 'License plate is required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ============================================================================
// Formatting Helpers
// ============================================================================

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `***-**-${cleaned.slice(-4)}`;
  }
  return ssn;
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// ============================================================================
// Age Calculation
// ============================================================================

export function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// ============================================================================
// Status Helpers
// ============================================================================

export function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'approved':
    case 'auto_approved':
      return 'green';
    case 'rejected':
    case 'auto_rejected':
      return 'red';
    case 'pending_review':
      return 'yellow';
    case 'under_review':
      return 'blue';
    default:
      return 'gray';
  }
}

export function getStatusLabel(status: ApplicationStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ============================================================================
// Orientation Content
// ============================================================================

export const ORIENTATION_SECTIONS: { id: OrientationSectionType; title: string; content: string }[] = [
  {
    id: 'welcome',
    title: 'Welcome to Paradise Delivery',
    content: `Welcome to the Paradise Delivery team! We're excited to have you as a delivery driver in our community.

As an independent contractor, you'll have the flexibility to deliver when it works for you while earning competitive pay.

This orientation will guide you through everything you need to know to get started.`,
  },
  {
    id: 'how_delivery_works',
    title: 'How Delivery Works',
    content: `1. **Go Online**: Open the app and tap "Go Online" when you're ready to start delivering.

2. **Accept Orders**: You'll receive delivery requests with restaurant name, customer location, and estimated earnings. Tap to accept.

3. **Pick Up**: Navigate to the restaurant, confirm your arrival, and collect the order. Check items match the receipt.

4. **Deliver**: Follow GPS to the customer. Text or call if needed. Mark delivered after handing off food.

5. **Get Paid**: Earnings appear in your account and are deposited weekly (or instantly for a small fee).`,
  },
  {
    id: 'safety_guidelines',
    title: 'Safety Guidelines',
    content: `Your safety is our priority:

• **Driving**: Follow all traffic laws. Never text and drive. Use a phone mount.
• **Parking**: Park legally. Don't block traffic or fire hydrants.
• **Hot Food**: Use insulated bags provided. Keep hot foods hot and cold foods cold.
• **Customer Interactions**: Be professional and polite. If a customer seems unsafe, contact support.
• **At Night**: Stick to well-lit areas. Trust your instincts.

Report any safety incidents immediately through the app.`,
  },
  {
    id: 'using_the_app',
    title: 'Using the Driver App',
    content: `Key features of the driver app:

• **Dashboard**: View your rating, earnings, and delivery stats.
• **Map**: Shows your location, restaurant, and customer address.
• **Navigation**: Tap to open your preferred navigation app (Google Maps, Waze, etc.).
• **Support**: Access 24/7 support for any issues.
• **Earnings**: Track your daily and weekly earnings in real-time.

Take some time to explore the app before your first delivery.`,
  },
  {
    id: 'customer_service',
    title: 'Customer Service Best Practices',
    content: `Great service leads to better ratings and more tips:

• **Communicate**: Text customers if the restaurant is running behind.
• **Be Timely**: Deliver within the estimated time window.
• **Double Check**: Verify you have all items before leaving the restaurant.
• **Follow Instructions**: Pay attention to delivery notes (gate codes, apartment numbers).
• **Be Friendly**: A smile and greeting go a long way.
• **Handle Issues**: If something goes wrong, contact support rather than arguing with staff.`,
  },
  {
    id: 'earnings_payments',
    title: 'Earnings & Payments',
    content: `How you get paid:

**Base Pay**: Per-delivery amount based on time, distance, and desirability.

**Promotions**: Peak pay during busy times, challenges for completing certain numbers of deliveries.

**Tips**: Customers can tip in-app or in cash. You keep 100% of tips.

**Payment Schedule**: Direct deposit every Monday for the previous week's earnings (Monday-Sunday).

**Fast Pay**: Instantly transfer earnings to your debit card for a $1.99 fee.

Prop 22 guarantees minimum earnings of 120% of local minimum wage for active delivery time plus $0.30 per mile.`,
  },
  {
    id: 'prop22_rights',
    title: 'Prop 22 Rights (California)',
    content: `As a California driver, Proposition 22 provides you with:

**Earnings Guarantee**: At least 120% of minimum wage for engaged time (from acceptance to delivery).

**Mileage Reimbursement**: $0.30 per mile driven during deliveries.

**Healthcare Subsidy**: Quarterly payments toward health insurance if you average 15+ active hours per week.

**Accident Insurance**: Coverage for injuries while on deliveries.

**Anti-Discrimination**: Protection from discrimination based on protected characteristics.

You are an independent contractor, not an employee. This means you control when, where, and how much you work.`,
  },
];

// ============================================================================
// Export/Import Helpers
// ============================================================================

export function exportApplicationsToCSV(applications: any[]): string {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Status',
    'Risk Score',
    'Risk Level',
    'Submitted At',
    'Approved At',
    'Document Status',
  ];

  const rows = applications.map(app => [
    app.id,
    app.applicantName || `${app.basicInfo?.firstName} ${app.basicInfo?.lastName}`,
    app.email || app.basicInfo?.email,
    app.phone || app.basicInfo?.phone,
    app.status,
    app.riskScore,
    app.riskLevel,
    app.submittedAt ? new Date(app.submittedAt).toISOString() : '',
    app.reviewedAt ? new Date(app.reviewedAt).toISOString() : '',
    app.aiChecks?.map((c: any) => `${c.name}:${c.passed ? 'pass' : 'fail'}`).join(';'),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ============================================================================
// ID Generation
// ============================================================================

export function generateApplicationId(type: 'driver' | 'restaurant'): string {
  const prefix = type === 'driver' ? 'drv' : 'rst';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${random}`;
}

export function generateDocumentId(): string {
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
}
