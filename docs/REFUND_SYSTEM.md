# Refund System Documentation

## Overview

Paradise Delivery's refund system is designed to **protect honest customers** while **preventing fraud**. We believe that when things go wrong, customers shouldn't have to fight for fair treatment.

**Core Principles:**
1. **Automatic first** - Most refunds happen without human review
2. **Customer trust** - We start by believing the customer
3. **Fraud protection** - Smart detection, not blanket suspicion
4. **Fast resolution** - Under 2 minutes from claim to refund

---

## Refund Categories

### 1. Missing Items

| Subtotal | Auto-Refund | Photo Required | Processing Time |
|----------|-------------|----------------|-----------------|
| <$15 | ✅ Yes | No | Instant |
| $15-50 | ✅ Yes | Recommended | Instant |
| >$50 | ⚠️ Review | Yes | <5 minutes |

**Process:**
1. Customer reports missing item
2. AI checks restaurant order history
3. If pattern matches (restaurant has high error rate) → Auto-approve
4. If customer history is clean → Auto-approve
5. If suspicious pattern → Manual review

### 2. Wrong Items

| Scenario | Refund | Credit Bonus | Notes |
|----------|--------|--------------|-------|
| Wrong item delivered | 100% item price | 10% ($2 min) | Keep or return item |
| Missing modification | 50% item price | None | e.g., no sauce on side |
| Allergen not respected | 150% item price | $10 credit | Serious safety issue |

**Process:**
1. Customer uploads photo of received item
2. AI image recognition matches menu photos
3. Discrepancy detected → Auto-refund
4. Restaurant receives alert with photo

### 3. Quality Issues

| Issue | Refund % | Photo Required | Restaurant Impact |
|-------|----------|----------------|-------------------|
| Cold food | 50% | Yes | Warning |
| Spilled/damaged | 100% | Yes | Strike |
| Undercooked | 100% | Yes | Strike |
| Foreign object | 150% + $10 | Yes | Suspension review |
| Wrong temperature | 25% | No | None |

**Quality Score Impact:**
Each quality refund affects restaurant's visibility in app.

### 4. Delivery Issues

| Issue | Compensation | Automatic? | Detection Method |
|-------|--------------|------------|------------------|
| >15 min late | $2 credit | ✅ Yes | GPS tracking |
| >30 min late | $5 credit | ✅ Yes | GPS tracking |
| >45 min late | Full refund | ✅ Yes | GPS + food temp |
| Wrong address | Case by case | ⚠️ Review | Driver GPS log |
| Never arrived | Full refund + $10 | ⚠️ Review | GPS + customer confirm |

### 5. Driver Issues

| Issue | Action | Driver Impact |
|-------|--------|---------------|
| Unprofessional behavior | Refund + deactivation review | 3 strikes = ban |
| Tampered packaging | Full refund + police report | Immediate ban |
| Wrong delivery spot | $3 credit | Warning |
| Excessive delay | $2-5 credit | Performance review |

---

## Fraud Detection System

### Behavioral Analysis

The system monitors for suspicious patterns:

**Red Flags (Triggers Review):**
- >3 refund claims in 30 days
- Claims always on highest-priced items
- Claims immediately after placing order
- Same issue type repeatedly
- Multiple accounts, same device/payment
- Photo metadata doesn't match claim

**Green Flags (Fast-Track Approval):**
- First claim ever
- Restaurant has high error rate
- Driver has recent complaints
- Claims diverse in type and restaurant
- Account >6 months old with regular orders

### Velocity Limits

| Account Age | Max Claims/30 Days | Cooldown Period |
|-------------|-------------------|-----------------|
| <1 month | 1 | 48 hours |
| 1-6 months | 2 | 24 hours |
| 6-12 months | 3 | 12 hours |
| >12 months | 4 | 6 hours |

**Exceeding limits:** Claims require manual approval for 90 days.

### Photo Verification

AI checks uploaded photos for:
- ✅ Timestamp within 2 hours of delivery
- ✅ Location matches delivery address
- ✅ Image shows claimed issue
- ❌ Stock photos (reverse image search)
- ❌ Edited/filtered photos (metadata analysis)
- ❌ Photos from different orders

---

## Refund Process Flow

### Standard Flow (90% of cases)

```
Customer Reports Issue
         ↓
    [2 seconds]
         ↓
AI Risk Assessment
    ├─ Low Risk ──→ Auto-Approve ──→ Refund issued (instant)
    └─ Medium Risk ──→ Pattern Check
              ├─ Clean history ──→ Auto-Approve
              └─ Flag raised ──→ Queue for review
```

### Review Flow (10% of cases)

```
Queued for Review
         ↓
    [2-5 minutes]
         ↓
Support Agent Review
    ├─ Approve ──→ Refund + feedback to AI
    ├─ Partial ──→ Partial refund + explanation
    └─ Deny ──→ Explanation + account flag
         ↓
Customer Notification (email + push)
```

### Restaurant Dispute Process

Restaurants can dispute refunds within 24 hours:

```
Refund Issued
         ↓
Restaurant Alert
         ↓
    [24 hour window]
         ↓
Restaurant Submits Evidence
    ├─ Photo of prepared order
    ├─ Kitchen video (if available)
    ├─ Driver confirmation
    └─ Order notes
         ↓
AI + Human Review
    ├─ Restaurant wins ──→ Customer charged back
    └─ Restaurant loses ──→ Strike recorded
```

**Restaurant Appeals:**
- 3 wrong disputes = 30-day suspension from disputing
- Pattern of wrong disputes = Account review

---

## Refund Amounts & Limits

### Per-Order Limits

| Order Value | Max Refund | Notes |
|-------------|------------|-------|
| <$25 | 100% | Full refund available |
| $25-75 | 100% | May require review |
| $75-150 | 100% | Requires review |
| >$150 | 100% | Manual approval required |

### Per-Customer Limits (Rolling 30 Days)

| Customer Tier | Max Refund Value | Max Claims |
|---------------|------------------|------------|
| New (<1 month) | $50 | 2 |
| Standard | $150 | 4 |
| VIP (100+ orders) | $300 | 6 |
| Flagged Account | $25 | 1 |

### Refund Methods

| Method | Speed | Fees | Availability |
|--------|-------|------|--------------|
| Original payment | 3-5 business days | None | Always |
| Paradise Credit | Instant | None | Always |
| Instant bank transfer | Instant | $0.50 | Orders >$25 |

---

## Customer Communication

### Refund Confirmation (Instant)

**Push Notification:**
```
✅ Refund Processed

We've issued a $12.50 refund for your missing appetizer.
Amount will appear in 3-5 business days.
```

**Email:**
```
Subject: Your $12.50 refund is on its way

Hi [Name],

We're sorry your order from [Restaurant] wasn't perfect.

Refund Details:
• Order: #12345
• Item: Chicken Wings
• Issue: Missing item
• Refund: $12.50
• Method: Original payment (Visa ending in 4242)
• Timeline: 3-5 business days

We know this doesn't fix a disappointing meal, but we hope it helps.

Here's $5 credit for your next order.

[Order Again]
```

### Refund Denial (Rare)

**Email:**
```
Subject: About your recent refund request

Hi [Name],

We reviewed your refund request for order #12345.

After careful review, we're unable to issue a refund at this time because:
[Specific reason: e.g., "Our records show this item was prepared and packed"]

We understand this is frustrating. If you believe this is an error, please reply to this email with any additional details.

We value you as a customer and hope to serve you again soon.
```

---

## Metrics & Monitoring

### Key Performance Indicators

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Avg refund time | <2 min | 5 min | 10 min |
| Auto-approval rate | >85% | 75% | 65% |
| Fraud detection accuracy | >95% | 90% | 85% |
| False positive rate | <2% | 5% | 10% |
| Customer satisfaction | >4.5/5 | 4.0/5 | 3.5/5 |
| Refund dispute rate | <5% | 10% | 15% |

### Monthly Reports

Generated automatically:
- Refund volume and amounts
- Fraud detection performance
- Restaurant quality scores
- Customer refund patterns
- Cost analysis

---

## Integration Points

### Database Schema

```sql
-- Refund requests table
CREATE TABLE refund_requests (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    customer_id UUID REFERENCES customers(id),
    type VARCHAR(50), -- missing_item, wrong_item, quality, etc.
    amount DECIMAL(10,2),
    status VARCHAR(20), -- pending, approved, denied, disputed
    auto_approved BOOLEAN DEFAULT FALSE,
    risk_score INTEGER, -- 0-100
    photo_url VARCHAR(255),
    reason TEXT,
    created_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Fraud detection logs
CREATE TABLE refund_fraud_checks (
    id UUID PRIMARY KEY,
    refund_request_id UUID,
    customer_pattern_score INTEGER,
    velocity_check_result VARCHAR(20),
    photo_verification_result VARCHAR(20),
    overall_risk VARCHAR(20), -- low, medium, high
    flags JSONB
);
```

### API Endpoints

```
POST /api/refunds
- Create refund request
- Auto-process or queue for review
- Returns refund ID and status

GET /api/refunds/:id
- Check refund status
- Returns full refund details

POST /api/refunds/:id/dispute
- Restaurant disputes refund
- Requires evidence upload

GET /api/refunds/stats
- Admin dashboard metrics
- Returns KPIs and trends
```

---

## Testing Scenarios

### Automated Test Cases

1. **Happy Path:** Customer with clean history reports missing $10 item → Auto-approved
2. **Fraud Pattern:** Customer with 3 claims in 5 days reports issue → Queued for review
3. **Restaurant Dispute:** Restaurant provides photo evidence → Chargeback processed
4. **Edge Case:** $200 order with missing $50 item → Manual review triggered
5. **Photo Verification:** Customer uploads stock photo → Flagged for fraud

### Load Testing

- Target: 100 refund requests/minute
- Auto-approval latency: <2 seconds
- Review queue latency: <5 minutes

---

*Document Version: 1.0*
*Last Updated: February 2024*
*Owner: Product & Engineering*
