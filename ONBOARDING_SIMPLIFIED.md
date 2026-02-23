# Paradise Delivery - Onboarding System (Simplified - DoorDash-Style)

## Overview
AI-powered onboarding matching DoorDash exactly. No video interviews, no quizzes.

---

## Driver Onboarding Flow

### Step 1: Sign Up (2 minutes)
- Full name
- Phone number (SMS verification)
- Email
- Create password
- Referral code (optional)

### Step 2: Background Check Consent (1 minute)
- Social Security Number (encrypted)
- Date of birth
- Consent to background check
- "By continuing, you agree to background check"

### Step 3: Driver's License Upload (AI Verified)
**Front of License:**
- Photo upload
- AI extracts: Name, DOB, License #, Expiration
- AI verifies: Not expired, photo clear

**Back of License:**
- Photo upload
- AI verifies: Barcode readable

**Selfie Match:**
- Take selfie in app
- AI compares to license photo
- Ensures same person

**Auto-Reject If:**
- License expired
- Name doesn't match application
- Photo unclear/blurry
- Under 18

### Step 4: Vehicle & Insurance
**Vehicle Info:**
- Type: Car / Bike / Scooter
- Make, model, year, color
- License plate

**Insurance Upload:**
- Photo of insurance card
- AI extracts: Carrier, policy #, expiration
- Verifies: Not expired, adequate coverage
- **Note:** Paradise, CA doesn't require commercial insurance for food delivery

**Registration Upload (cars only):**
- Photo of registration
- AI verifies: Current, matches vehicle

### Step 5: Prop 22 Acknowledgment (CA Only)
- Read: "You are an independent contractor"
- Read: "You are entitled to minimum earnings guarantee"
- Read: "Healthcare stipend after 15 hrs/week"
- Checkbox: "I understand and agree"

### Step 6: Orientation (Read-Only)
**Slides:**
1. How Paradise Delivery works
2. How to accept and complete deliveries
3. Earnings breakdown ($5 + $0.60/mile)
4. Prop 22 rights and guarantees
5. Photo requirements (Leave at Door)
6. Contactless delivery guidelines
7. Support and help resources

**No quiz. Just scroll through and tap "Complete."**

### Step 7: Activate
- "You're ready to drive!"
- Option to order Paradise Delivery bag (optional)
- "Go Online" button

**Total Time:** 10-15 minutes

---

## Restaurant Onboarding Flow

### Step 1: Business Information
- Restaurant name
- Business type (LLC, Corp, Sole Prop)
- Owner name, phone, email
- Years in business
- EIN/Tax ID

### Step 2: Location & Hours
- Address (must be in Paradise/Magalia)
- Business hours
- Delivery hours (if different)
- Average prep time

### Step 3: Legal Documents (AI Verified)

**Business License:**
- Upload photo
- AI extracts: License #, expiration
- Verifies: Valid in Butte County

**Health Permit:**
- Upload photo  
- AI verifies: Current, valid for food service

**Insurance:**
- General liability certificate
- AI verifies: Adequate coverage

**Seller's Permit:**
- CA sales tax permit
- AI verifies: Active

### Step 4: Menu Setup
**Upload Options:**
- Upload PDF menu
- Upload photos of menu
- Enter items manually

**AI Menu Extraction:**
- Reads PDF/photos
- Extracts: Item names, descriptions, prices
- Suggests: Categories (appetizers, entrees, etc.)
- Admin reviews and approves extraction

**Add Photos:**
- Upload photos for top items
- At least 5 items need photos to go live

### Step 5: Banking (Stripe Connect)
- Enter bank routing number
- Enter account number
- Stripe sends micro-deposits (2-3 days)
- Verify amounts to activate payouts

### Step 6: Agreement
- Commission: 18%
- Payout schedule: Weekly
- Sample payout breakdown shown
- E-sign agreement

### Step 7: Equipment & Training
- Tablet for orders: $100 deposit (optional, can use own device)
- Printer: $50 (optional)
- Download Restaurant Dashboard app
- Watch 5-min training video

### Step 8: Test Orders
- Paradise Delivery places 2 test orders
- Restaurant practices receiving and confirming
- Delivery driver completes test deliveries
- Restaurant confirms workflow works

### Step 9: Go Live
- Restaurant appears in customer app
- Can start receiving real orders
- Account manager assigned (you!)

**Total Time:** 30-45 minutes (plus 2-3 days for bank verification)

---

## AI Document Verification

### What AI Checks

**Driver's License:**
- OCR: Name, DOB, license number, expiration
- Face match: Selfie vs license photo
- Fraud detection: Photoshop, fake templates
- Validation: Not expired, real state format

**Insurance Card:**
- OCR: Carrier name, policy number, expiration
- Validation: Not expired, readable
- Coverage: Minimum limits met

**Vehicle Registration:**
- OCR: VIN, plate, expiration
- Match: VIN matches vehicle info
- Validation: Current registration

**Business License:**
- OCR: License number, business name, expiration
- Validation: Valid in Paradise/Butte County

**Health Permit:**
- OCR: Permit number, expiration
- Validation: Current, food service category

### Confidence Scoring
```typescript
interface DocumentVerification {
  documentType: string;
  confidenceScore: number; // 0-100
  extractedData: object;
  flags: string[]; // Issues found
  recommendation: 'approve' | 'review' | 'reject';
}
```

**Auto-Approve:** Confidence > 85, no flags
**Manual Review:** Confidence 60-85 or minor flags
**Auto-Reject:** Confidence < 60 or major flags (expired, fake)

---

## Admin Review Dashboard

### Driver Applications

**List View:**
| Name | Status | Risk Score | Time | Action |
|------|--------|------------|------|--------|
| John D. | Pending | 12 | 2 hrs | [Review] |
| Sarah M. | AI Approved | 8 | 1 hr | [Approve] |
| Mike R. | Flagged | 45 | 30 min | [Review] |

**Detail View:**
```
Applicant: John Doe
Applied: 2 hours ago
Status: PENDING REVIEW
Risk Score: 12/100 (LOW)

Documents Uploaded:
✓ License (front) - Confidence: 98%
✓ License (back) - Confidence: 95%
✓ Selfie match - Confidence: 92%
✓ Insurance - Confidence: 87%
✓ Registration - Confidence: 94%

AI Findings:
✓ License valid until 2027
✓ Name matches application
✓ Insurance coverage adequate
✓ Registration current
⚠ Photo slightly blurry but readable

Background Check:
[Run Check] [Pending] [Complete]

Action:
[Approve Driver] [Request New Photo] [Reject]
```

### Restaurant Applications

**List View:**
| Restaurant | Status | Risk | Items | Action |
|------------|--------|------|-------|--------|
| Carmelita's | Pending | 5 | 47 | [Review] |
| Paradise Cafe | AI Approved | 3 | 32 | [Approve] |
| New Bistro | Flagged | 38 | 12 | [Review] |

**Detail View:**
```
Restaurant: Carmelita's Mexican Grill
Owner: Maria Gonzalez
Applied: 4 hours ago
Status: PENDING REVIEW
Risk Score: 5/100 (LOW)

Documents:
✓ Business license - Valid
✓ Health permit - Current
✓ Insurance - $1M coverage
✓ Seller's permit - Active

Menu:
✓ 47 items extracted
✓ 8 photos uploaded
⚠ 2 items need clarification

Test Orders:
[Place Test Order 1] [Place Test Order 2]

Action:
[Approve Restaurant] [Request Menu Changes] [Reject]
```

---

## Background Check Integration

### Provider: Checkr (same as DoorDash)

**API Flow:**
1. Driver consents in app
2. System sends to Checkr via API
3. Checkr runs:
   - SSN trace
   - National criminal search (7 years)
   - County criminal search (residence counties)
   - Motor vehicle report (driving record)
   - Sex offender registry
4. Results returned in 1-3 days
5. Auto-approve if clear
6. Manual review if flags

**Auto-Reject Criteria:**
- DUI/DWI in last 7 years
- Violent felony (any time)
- Theft/robbery in last 7 years
- >3 moving violations in 2 years
- Suspended license currently

**Manual Review:**
- Old convictions (>7 years)
- Non-violent misdemeanors
- Single recent moving violation

---

## Notifications

### To Applicants

**Driver:**
- Application received ✓
- Document uploaded ✓
- Document rejected (with reason) ✗
- Background check initiated ⏳
- Approved! Start driving 🎉
- Rejected (with reason + appeal info) ✗

**Restaurant:**
- Application received ✓
- Menu extraction complete (review needed) 👀
- Document rejected (with reason) ✗
- Bank account verified ✓
- Approved! Go live 🎉
- First order placed! 🎊

### To Admin

**Email Digest (Daily):**
```
Paradise Delivery - Daily Onboarding Summary

New Applications: 3
- Drivers: 2
- Restaurants: 1

Pending Review: 5
- Drivers: 3
- Restaurants: 2

AI Approved (awaiting your confirm): 2

Auto-Rejected: 1
- Reason: Expired license

Action Required: [View Dashboard]
```

---

## API Endpoints

### Driver Onboarding
```
POST /api/drivers/apply                    → Create application
POST /api/drivers/:id/upload-document      → Upload license/insurance/etc
GET  /api/drivers/:id/status               → Check application status
POST /api/drivers/:id/background-consent   → Submit SSN/consent
POST /api/admin/drivers/:id/approve        → Admin approve
POST /api/admin/drivers/:id/reject         → Admin reject
```

### Restaurant Onboarding
```
POST /api/restaurants/apply                → Create application
POST /api/restaurants/:id/upload-document  → Upload permits
POST /api/restaurants/:id/menu             → Upload/enter menu
GET  /api/restaurants/:id/status           → Check status
POST /api/admin/restaurants/:id/approve    → Admin approve
POST /api/admin/restaurants/:id/test-order → Place test order
```

---

## Time to Complete

| Step | Driver | Restaurant |
|------|--------|------------|
| Application | 10-15 min | 30-45 min |
| Background Check | 1-3 days | N/A |
| Bank Verification | N/A | 2-3 days |
| Total (typical) | 1-3 days | 3-5 days |

---

## Comparison: Paradise vs DoorDash

| Feature | DoorDash | Paradise Delivery |
|---------|----------|-------------------|
| Video interview | ❌ No | ❌ No |
| Quiz/Test | ❌ No | ❌ No |
| Background check | ✅ Yes | ✅ Yes |
| Document upload | ✅ Yes | ✅ Yes |
| Orientation | ✅ Yes (read-only) | ✅ Yes |
| AI verification | ✅ Yes | ✅ Yes |
| Time to start | 3-7 days | 1-5 days |

**Paradise is faster** because we prioritize local drivers and restaurants.
