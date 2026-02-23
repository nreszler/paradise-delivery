# Paradise Delivery - Driver Photo Requirements

## Based on DoorDash Structure

### Delivery Types

**1. "Leave at Door" (Contactless)**
- Customer selects this option at checkout
- Driver **MUST** take photo of order at door
- Photo visible to customer in app + email
- GPS coordinates attached to photo
- No signature required

**2. "Hand It to Me"**
- Customer selects this option at checkout
- Driver hands order directly to customer
- **Photo NOT required** in app
- Driver taps "Delivered" after handoff
- Optional: Driver can take photo anyway for their protection

**3. "Hand It to Me" but Customer Not Available**
- If customer not home after text + call + 5-min timer
- Driver switches to "Leave at Door" mode
- Takes photo and leaves order
- Notes: "Left at door - customer not home"

---

## Implementation in Driver App

### Order Detail Screen
```
┌─────────────────────────────┐
│ ORDER #1234                 │
│                             │
│ Paradise Cafe               │
│ 123 Main St                 │
│                             │
│ Customer: John D.           │
│ 456 Oak Ave                 │
│                             │
│ Delivery Method:            │
│ ⚫ Leave at Door            │
│   [Photo Required]          │
│                             │
│ OR                          │
│                             │
│ ⚫ Hand It to Me            │
│   [No Photo Required]       │
│                             │
│ [Navigate] [Start Delivery] │
└─────────────────────────────┘
```

### "Leave at Door" Flow
1. Driver arrives at address
2. Places order at door
3. Taps "Take Delivery Photo"
4. Camera opens (in-app)
5. Driver takes photo of order at door
6. Photo auto-uploaded with GPS
7. Driver taps "Complete Delivery"
8. Photo sent to customer via app + email

### "Hand It to Me" Flow
1. Driver arrives at address
2. Hands order to customer
3. Driver taps "Complete Delivery"
4. No photo screen shown
5. Optional: "Take Photo for Your Records" button (hidden in menu)

### "Hand It to Me" + No Answer Flow
1. Driver arrives, knocks, no answer
2. Driver taps "Customer Not Available"
3. Options shown:
   - Text customer
   - Call customer
   - Start 5-min timer
4. If timer expires:
   - Switch to "Leave at Door" mode
   - Take photo required
   - Leave order with note

---

## Driver Photo Stats (Same as DoorDash)

Track photo completion rate:
```
Photo Completion Rate: 85%
✓ 17 of 20 "Leave at Door" orders photographed

[Good - Keep it up!]
```

Warning if below 70%:
```
Photo Completion Rate: 65%
⚠ You're below the 70% requirement

Taking photos protects you from fraud claims.
[Learn More]
```

---

## Fraud Prevention Without Mandating All Photos

### Why Not Require Photos for ALL Orders?

**Problems:**
1. Awkward to photograph customer during handoff
2. Slows down delivery
3. Privacy concerns
4. Not what DoorDash does

**Solution:**
1. **Encourage photos** for "Hand It to Me" via optional button
2. **Track photo rate** on "Leave at Door" (target 100%)
3. **Flag drivers** with low photo rates for retraining
4. **Protect drivers** with optional body cam integration

---

## Customer Options at Checkout

### Delivery Instructions Screen
```
How would you like to receive your order?

⚫ Leave at Door
   Driver will leave your order at your door
   and take a photo for confirmation.
   
   [Best for: Contactless delivery]

⚫ Hand It to Me  
   Driver will hand your order directly to you.
   
   [Best for: Apartments, secure buildings]

Delivery Instructions (optional):
[________________________]
```

### Default Selection
- New customers: "Leave at Door" (easier)
- Previous order type: Remember preference
- 70% of orders: "Leave at Door"
- 30% of orders: "Hand It to Me"

---

## Edge Cases

### Customer Changes Mind Mid-Delivery
- Texted "Leave at door" but waiting outside
- Driver can still hand it over
- Driver takes photo anyway (covers both)
- Marks "Handed to Customer"

### Alcohol Orders (21+ Required)
- ALWAYS "Hand It to Me" (ID check required)
- Driver scans ID
- Customer signature in app
- Photo NOT required (ID scan is proof)

### High-Value Orders (>$75)
- Suggest "Hand It to Me" to customer
- If "Leave at Door" selected:
  - Photo required (normal)
  - Signature recommended (optional)

### Driver Safety Concerns
- Dark areas, unsafe neighborhoods
- Driver can choose "Leave at Door" even if "Hand It to Me" selected
- Takes photo from car, leaves quickly
- Customer notified: "Left at door for your safety"

---

## Technical Implementation

### Database Schema
```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY,
  order_id UUID,
  delivery_method VARCHAR, -- 'leave_at_door' or 'hand_to_customer'
  photo_url VARCHAR, -- NULL for hand-to-customer
  photo_location JSONB, -- { lat: float, lng: float }
  handed_to_customer BOOLEAN DEFAULT false,
  customer_unavailable BOOLEAN DEFAULT false,
  timer_started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### API Endpoints
```
POST /api/deliveries/:id/photo
  - Upload delivery photo
  - Requires: image, location
  - Only for "leave_at_door" orders

POST /api/deliveries/:id/complete
  - Complete delivery
  - Requires: delivery_method confirmation
  - Optional: photo_url

POST /api/deliveries/:id/customer-unavailable
  - Start 5-min timer
  - Send notification to customer

POST /api/deliveries/:id/switch-to-leave
  - Switch from hand-to-customer to leave-at-door
  - Requires timer expired or customer approved
```

### Driver Stats Endpoint
```
GET /api/drivers/:id/stats
{
  "totalDeliveries": 150,
  "leaveAtDoorCount": 105,
  "leaveAtDoorPhotoCount": 102,
  "photoCompletionRate": 0.97, // 97%
  "status": "good" // good, warning, critical
}
```

---

## Summary

| Scenario | Photo Required? | Notes |
|----------|-----------------|-------|
| "Leave at Door" | **YES** | Always required, GPS tagged |
| "Hand It to Me" | **NO** | Optional for driver protection |
| "Hand It to Me" + No Answer | **YES** | After timer expires |
| Alcohol (21+) | **NO** | ID scan replaces photo |

This matches DoorDash exactly while protecting drivers from fraud.
