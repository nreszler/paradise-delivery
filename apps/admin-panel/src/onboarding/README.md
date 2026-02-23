# Paradise Delivery - AI-Powered Onboarding System

A comprehensive onboarding system for drivers and restaurants with AI-powered document verification and automated risk scoring.

## Table of Contents

- [Overview](#overview)
- [Driver Onboarding Flow](#driver-onboarding-flow)
- [Restaurant Onboarding Flow](#restaurant-onboarding-flow)
- [AI Document Verification](#ai-document-verification)
- [Risk Scoring](#risk-scoring)
- [Admin Dashboard](#admin-dashboard)
- [API Reference](#api-reference)
- [Configuration](#configuration)

---

## Overview

This onboarding system matches the simplicity of DoorDash while adding AI-powered verification for faster approvals.

### Key Features

- ✅ **AI Document Verification**: OCR extraction with fraud detection
- ✅ **Automated Risk Scoring**: Intelligent approval/rejection recommendations
- ✅ **Background Check Integration**: Checkr API ready
- ✅ **Real-time Status Tracking**: Progress tracking for applicants
- ✅ **Admin Dashboard**: Comprehensive review interface
- ✅ **Auto-approval Logic**: Clean records get instant approval

---

## Driver Onboarding Flow

### Step 1: Basic Information
```typescript
POST /api/drivers/apply
{
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;  // Must be 18+
    ssn: string;        // Encrypted at rest
  },
  vehicleInfo: {
    type: 'car' | 'bike' | 'scooter' | 'motorcycle';
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    vin?: string;
  }
}
```

### Step 2: Document Upload (AI Verified)
```typescript
POST /api/drivers/upload-document
// Upload each document separately
- Driver's License (front + back)
- Auto Insurance Card
- Vehicle Registration
- Profile Photo (face match with license)
```

**AI Verification Checks:**
- Expiration dates
- Name consistency across documents
- Document authenticity (fraud detection)
- Face match between license and profile photo
- OCR data extraction

### Step 3: Background Check Consent
```typescript
POST /api/drivers/background-check-consent
{
  applicationId: string;
  consentGiven: true;
}
```

**Auto-Reject Criteria:**
- DUI/DWI in last 7 years
- Violent felony conviction
- More than 3 moving violations in 2 years
- Suspended license
- Reckless driving conviction
- Registered sex offender

### Step 4: Orientation (Informational)
Read-only orientation covering:
- How delivery works
- Safety guidelines
- Using the driver app
- Customer service best practices
- Earnings & payments
- Prop 22 rights (CA drivers)

```typescript
POST /api/drivers/orientation-complete
{
  applicationId: string;
  sectionsViewed: [...],
  totalTimeSpentSeconds: number;
}
```

### Step 5: Activation
Once all steps complete and background check clears, driver is activated automatically.

---

## Restaurant Onboarding Flow

### Step 1: Business Information
```typescript
POST /api/restaurants/apply
{
  businessInfo: {
    restaurantName: string;
    businessType: 'llc' | 'corporation' | ...;
    ein: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    yearsInBusiness: number;
    cuisineType: string;
  },
  location: {
    address: Address;  // Must be in Paradise/Magalia, CA
    businessHours: BusinessHours;
    deliveryRadiusMiles: number;
    estimatedPrepTimeMinutes: number;
  }
}
```

### Step 2: Legal Documents (AI Verified)
```typescript
POST /api/restaurants/upload-document
- Business License
- Health Permit
- Liability Insurance
- Seller's Permit (optional)
- Workers Comp (optional)
```

### Step 3: Menu Setup
```typescript
POST /api/restaurants/menu-setup
// Upload menu PDF or photos
// AI extracts items, staff reviews and confirms
```

### Step 4: Banking (Stripe Connect)
```typescript
POST /api/restaurants/bank-connect
{
  accountHolderName: string;
  accountToken: string;  // From Stripe.js
}
```

### Step 5: Commission Agreement
- 18% commission rate
- 10% optional menu discount
- Weekly payouts
- 1099-K consent

### Step 6: Equipment & Test Orders
- Tablet setup (provided or BYOD)
- Staff training
- 2-3 test orders to verify workflow

---

## AI Document Verification

The system uses OCR (AWS Textract/Google Vision) plus custom fraud detection:

### Verification Pipeline

1. **Quality Check**
   - Resolution validation
   - Blur detection
   - Lighting assessment
   - Cropping detection

2. **OCR Extraction**
   - Text field extraction
   - Date parsing
   - Name recognition
   - Document type identification

3. **Data Validation**
   - Cross-reference extracted data
   - Expiration date checks
   - Name consistency
   - Age verification (18+)

4. **Fraud Detection**
   - Photoshop/editing artifact detection
   - Template matching against known fakes
   - EXIF data analysis
   - Photo liveness detection

5. **External Verification** (optional)
   - DMV API for licenses
   - Insurance carrier verification
   - Business license database checks

### Confidence Scoring

```typescript
interface VerificationResult {
  documentType: DocumentType;
  confidence: number;        // 0-100
  extractedData: {...};      // Parsed fields
  flags: string[];           // Warnings/errors
  authenticityScore: number; // Fraud detection
}
```

---

## Risk Scoring

### Driver Risk Score Calculation

| Factor | Weight | Description |
|--------|--------|-------------|
| Documents | 0-30 | Missing/invalid documents |
| Background Check | 0-40 | Criminal/driving history |
| Identity Verification | 0-20 | Name mismatches, fraud |
| Application Quality | 0-10 | Image quality, completeness |

**Risk Levels:**
- 0-30: Low (auto-approve eligible)
- 30-60: Medium (manual review)
- 60-80: High (enhanced review)
- 80+: Critical (likely reject)

### Auto-Approve Criteria (Driver)

All must be true:
- ✅ All 5 documents verified
- ✅ Background check status: "clear"
- ✅ 0-2 moving violations (2 years)
- ✅ No criminal convictions
- ✅ Orientation completed
- ✅ Risk score < 30

### Auto-Reject Criteria (Driver)

Any triggers rejection:
- ❌ DUI/DWI in last 7 years
- ❌ Violent felony conviction
- ❌ > 3 moving violations (2 years)
- ❌ Suspended license
- ❌ Reckless driving
- ❌ Sex offender registry hit
- ❌ Fraudulent documents

### Restaurant Risk Score

| Factor | Weight | Description |
|--------|--------|-------------|
| Documents | 0-30 | Missing permits/licenses |
| Business History | 0-25 | Years in business |
| Menu | 0-25 | Size, high-value items |
| Operations | 0-20 | Prep time, test orders |

---

## Admin Dashboard

### Driver Applications View

```tsx
import { DriverApplicationsList } from './onboarding';

<DriverApplicationsList
  onSelectApplication={(id) => navigateToReview(id)}
/>
```

**Features:**
- Filter by status, risk level
- Sort by date, risk score, name
- Bulk approve/reject
- AI recommendation display
- Document verification status
- One-click review

### Application Review Interface

```tsx
import { DriverApplicationReview } from './onboarding';

<DriverApplicationReview
  applicationId={selectedId}
  onBack={() => navigateToList()}
  onApprove={(id) => handleApprove(id)}
  onReject={(id, reason) => handleReject(id, reason)}
/>
```

**Review Tabs:**
- **Overview**: Applicant info, AI recommendation
- **Documents**: Side-by-side verification results
- **Background**: Full driving/criminal history
- **Orientation**: Completion status

### AI Recommendation Display

```
Recommendation: AUTO-APPROVE (Confidence: 92%)

Reasoning:
✓ Low risk profile meets auto-approval criteria
✓ Valid driver's license verified
✓ Clean driving record (2 years)
✓ No criminal record

Risk Factors: None

Action: [Approve] [Reject] [Request Info]
```

---

## API Reference

### Driver Onboarding

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/drivers/apply` | POST | Create new application |
| `/api/drivers/application/:id/status` | GET | Get status & progress |
| `/api/drivers/upload-document` | POST | Upload & verify document |
| `/api/drivers/background-check-consent` | POST | Submit consent |
| `/api/drivers/orientation-complete` | POST | Complete orientation |

### Restaurant Onboarding

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/restaurants/apply` | POST | Create new application |
| `/api/restaurants/upload-document` | POST | Upload legal docs |
| `/api/restaurants/menu-setup` | POST | Upload & extract menu |
| `/api/restaurants/bank-connect` | POST | Connect Stripe account |
| `/api/restaurants/commission-agreement` | POST | Accept terms |
| `/api/restaurants/equipment-setup` | POST | Complete setup |
| `/api/restaurants/test-order` | POST | Record test order |

### Admin API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/applications/drivers` | GET | List driver apps |
| `/api/admin/applications/restaurants` | GET | List restaurant apps |
| `/api/admin/applications/:id/approve` | POST | Approve application |
| `/api/admin/applications/:id/reject` | POST | Reject application |
| `/api/admin/applications/:id/request-info` | POST | Request more info |

---

## Configuration

### Environment Variables

```env
# OCR Provider
OCR_PROVIDER=aws-textract  # or 'google-vision', 'tesseract'
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-west-2

# Background Check
BACKGROUND_CHECK_PROVIDER=checkr
CHECKR_API_KEY=xxx

# Storage
S3_BUCKET=paradise-documents
S3_REGION=us-west-2

# Database (PostgreSQL recommended)
DATABASE_URL=postgresql://...

# Redis (for queues)
REDIS_URL=redis://...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

### Document Verification Config

```typescript
import { createDocumentVerificationService } from './onboarding';

const service = createDocumentVerificationService({
  ocrProvider: 'aws-textract',
  apiKey: process.env.AWS_ACCESS_KEY_ID,
  fraudDetection: true,
});
```

---

## React Components

### Use in Your App

```tsx
// Driver Onboarding Page
import { 
  useDriverApplication, 
  useDocumentUpload,
  ORIENTATION_SECTIONS 
} from './onboarding';

function DriverOnboarding() {
  const { 
    application, 
    progress, 
    nextSteps,
    uploadDocument,
    consentToBackgroundCheck,
    completeOrientation 
  } = useDriverApplication(applicationId);

  const { upload, uploading, progress: uploadProgress } = useDocumentUpload();

  return (
    <div>
      <ProgressBar percentage={progress?.percentage} />
      
      {nextSteps.map(step => (
        <NextStepCard key={step} step={step} />
      ))}
      
      <DocumentUploader 
        onUpload={(file) => upload(file, 'drivers_license_front', applicationId)}
        progress={uploadProgress}
      />
      
      <OrientationViewer 
        sections={ORIENTATION_SECTIONS}
        onComplete={completeOrientation}
      />
    </div>
  );
}
```

### Admin Dashboard Page

```tsx
import { 
  DriverApplicationsList,
  DriverApplicationReview 
} from './onboarding';

function AdminDashboard() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (selectedApp) {
    return (
      <DriverApplicationReview
        applicationId={selectedApp}
        onBack={() => setSelectedApp(null)}
        onApprove={(id) => { /* ... */ }}
        onReject={(id, reason) => { /* ... */ }}
      />
    );
  }

  return (
    <DriverApplicationsList
      onSelectApplication={setSelectedApp}
    />
  );
}
```

---

## Database Schema (Simplified)

### driver_applications
- id, status, risk_score, risk_level
- basic_info (JSONB), vehicle_info (JSONB)
- documents (JSONB references)
- background_check (JSONB)
- orientation (JSONB)
- ai_recommendation (JSONB)
- created_at, updated_at, submitted_at

### documents
- id, application_id, document_type
- file_url, file_name, file_size
- verification_result (JSONB)
- status, uploaded_at

### restaurant_applications
- id, status, risk_score, risk_level
- business_info (JSONB), location (JSONB)
- documents (JSONB references)
- menu_setup (JSONB)
- banking_info (JSONB)
- created_at, updated_at

---

## Testing

### Manual Test Flow

1. Create driver application
2. Upload test documents (use sample images)
3. Submit background check consent
4. Complete orientation
5. Verify auto-approval (if clean) or admin review

### Automated Tests

```typescript
// Example test
describe('Document Verification', () => {
  it('should approve valid license', async () => {
    const result = await service.verifyDocument({
      documentType: 'drivers_license_front',
      fileUrl: 'test-license.jpg',
    });
    
    expect(result.confidence).toBeGreaterThan(80);
    expect(result.flags).toHaveLength(0);
  });
});
```

---

## License

Copyright © 2026 Paradise Delivery. All rights reserved.
