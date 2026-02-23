# Paradise Delivery - Smart Dispatch & Batching System

## DoorDash-Style Batching Structure

### Batch Types (Exactly Like DoorDash)

**1. Standard Batched Offer**
- 2 orders from same restaurant
- Both placed within 10 minutes
- Delivered sequentially (closest first)
- Driver sees both orders in one offer

**2. Add-On Order**
- Driver already has Order A en route
- Order B comes in from same restaurant
- Offer sent: "Add $4.50 for extra delivery"
- Driver can accept or decline

**3. Stacked Pickup**
- 2 orders from nearby restaurants (within 0.3 miles)
- Pick up A → Pick up B → Deliver A → Deliver B
- Shown as single batched offer

---

## Smart Dispatch Algorithm

### Core Formula
```
DISPATCH_TIME = ORDER_TIME + PREP_TIME - DRIVE_TIME - BUFFER

Where:
- ORDER_TIME: When customer placed order
- PREP_TIME: Restaurant's estimated prep (learned)
- DRIVE_TIME: How long driver takes to arrive
- BUFFER: 2-3 minutes safety margin
```

### Example
```
Order placed: 6:00:00 PM
Carmelita's avg prep: 15 min
Driver 2 miles away: 6 min drive
Buffer: 2 min

DISPATCH_TIME = 6:00 + 15 min - 6 min - 2 min = 6:07 PM

Driver gets notification at 6:07 PM
Arrives at 6:13 PM  
Order ready at ~6:15 PM
Wait time: ~2 minutes ✓
```

---

## Restaurant Prep Time Learning System

### Phase 1: Restaurant Sets Initial Time
**Onboarding:**
```
Average prep time for orders?
⚫ Under 10 min (coffee, donuts)
⚫ 10-15 min (sandwiches, salads)
⚫ 15-20 min (burgers, tacos)
⚫ 20-30 min (pizza, pasta)
⚫ 30+ min (full meals, busy kitchen)
```

### Phase 2: System Learns (Week 1-4)

**Track Every Order:**
```typescript
interface PrepTimeRecord {
  restaurantId: string;
  orderId: string;
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  items: number;
  complexity: 'low' | 'medium' | 'high';
  estimatedPrep: number; // minutes
  actualPrep: number; // driver arrival - order time
  driverWaitTime: number; // how long driver waited
}
```

**Calculate Averages by Time Block:**
```
Carmelita's Mexican Grill:

Monday-Thursday:
  11am-2pm (Lunch):    18 min avg
  2pm-5pm (Slow):      12 min avg
  5pm-8pm (Dinner):    22 min avg
  8pm-10pm:           15 min avg

Friday-Sunday:
  11am-2pm:           20 min avg
  2pm-5pm:            14 min avg
  5pm-8pm:            28 min avg (peak!)
  8pm-10pm:           18 min avg
```

### Phase 3: Dynamic Adjustment

**Algorithm Adjusts Daily:**
```typescript
function updatePrepTime(restaurantId: string, newRecord: PrepTimeRecord) {
  const restaurant = getRestaurant(restaurantId);
  
  // Get existing average for this time block
  const timeBlock = getTimeBlock(newRecord.dayOfWeek, newRecord.hourOfDay);
  const currentAvg = restaurant.prepTimes[timeBlock];
  
  // Weighted average (70% old, 30% new)
  const updatedAvg = (currentAvg * 0.7) + (newRecord.actualPrep * 0.3);
  
  // Update
  restaurant.prepTimes[timeBlock] = Math.round(updatedAvg);
  
  // Save
  saveRestaurant(restaurant);
}
```

### Phase 4: Anomaly Detection

**Flag Unusual Times:**
```
Carmelita's - Thursday 6:30 PM
Expected: 22 min
Actual: 45 min
Driver wait: 20 min ⚠️

ALERT: Restaurant unusually slow
Action: Adjust next dispatch +5 min
Notify: Restaurant manager
```

---

## Driver Dispatch Timing by Scenario

### Scenario 1: Single Order, Normal Time

```
Order #1234 - Carmelita's
Placed: 6:00 PM
Items: 3 (tacos)
Estimated prep: 15 min
Nearest driver: 5 min away

TIMELINE:
6:00:00 - Order confirmed
6:06:00 - DISPATCH driver (15 - 5 - 2 = 8 min delay)
6:11:00 - Driver arrives
6:15:00 - Order ready
6:16:00 - Driver departs
6:22:00 - Delivered

Driver wait: 1 minute ✓
```

### Scenario 2: Batch Order, Same Restaurant

```
Order #1234 - Carmelita's - Placed 6:00 PM
Order #1235 - Carmelita's - Placed 6:04 PM

System detects batch opportunity:
- Same restaurant ✓
- Within 10 min ✓
- Delivery addresses 1.2 mi apart ✓

TIMELINE:
6:00:00 - Order #1234 confirmed
6:04:00 - Order #1235 confirmed → BATCH DETECTED
6:08:00 - DISPATCH driver (20 min combined prep - 6 min drive - 2 min = 12 min)
6:14:00 - Driver arrives
6:20:00 - Both orders ready
6:21:00 - Pick up both
6:26:00 - Deliver #1234 (closer)
6:30:00 - Deliver #1235

Driver pay: $5 + ($0.60 × 5 mi) = $8.00
Savings vs 2 trips: $5.60
```

### Scenario 3: Large Order (Slower)

```
Order #1236 - Paradise Cafe
Placed: 12:30 PM
Items: 12 (breakfast for office)
Estimated prep: 28 min (learned: large orders take 2x)
Nearest driver: 4 min away

TIMELINE:
12:30:00 - Order confirmed
12:50:00 - DISPATCH driver (28 - 4 - 2 = 22 min delay)
12:54:00 - Driver arrives
12:58:00 - Order ready
1:02:00 - Delivered

Driver wait: 4 minutes (acceptable for large order)
```

### Scenario 4: Rush Hour (Busy)

```
Carmelita's - Friday 7:00 PM (dinner rush)
Learned: Prep time 35 min during rush (vs 22 min normal)

Order #1237
Placed: 7:00 PM
Estimated prep: 35 min
Driver: 6 min away

TIMELINE:
7:00:00 - Order confirmed
7:27:00 - DISPATCH driver (35 - 6 - 2 = 27 min delay)
7:33:00 - Driver arrives
7:35:00 - Order ready
7:36:00 - Driver departs

Driver wait: 2 minutes ✓
```

---

## Wait Time Monitoring

### Track Driver Wait Times

```typescript
interface WaitTimeRecord {
  orderId: string;
  restaurantId: string;
  driverArrival: timestamp;
  orderReady: timestamp;
  waitTimeMinutes: number;
  acceptable: boolean; // < 3 min = acceptable
}
```

### Thresholds

| Wait Time | Status | Action |
|-----------|--------|--------|
| 0-2 min | ✓ Perfect | None |
| 2-5 min | ⚠️ Slight delay | Monitor |
| 5-10 min | ❌ Too long | +5 min to future dispatches |
| 10+ min | 🚨 Problem | Alert manager, +10 min to dispatches |

### Automatic Adjustments

**If average wait time > 5 min for a restaurant:**
1. Increase estimated prep time by +3 minutes
2. Adjust all future dispatches
3. Notify restaurant: "Drivers waiting longer than expected"
4. Reset after 5 orders with improved times

**If average wait time < 1 min (drivers arriving too late):**
1. Decrease estimated prep time by -2 minutes
2. Send drivers earlier
3. Food might be sitting (quality risk)

---

## Driver Experience

### Notification Timing

**Optimal Dispatch:**
```
📦 NEW ORDER - Carmelita's

Pick up by: 6:15 PM (in 8 min)
Deliver to: 456 Oak Ave (1.2 mi)
Earnings: $6.20 + tip

[Accept] [Decline]
```

**Too Early (Driver Waits):**
```
📦 NEW ORDER - Carmelita's

Pick up by: 6:25 PM (in 18 min)
⚠️ Restaurant needs 15 min to prepare

[Accept] [Decline]
```

**Too Late (Food Sits):**
```
📦 NEW ORDER - Carmelita's - URGENT

Pick up NOW (order ready)
Deliver to: 456 Oak Ave
Earnings: $6.20 + tip

[Accept] [Decline]
```

### Batched Offer

```
📦 BATCHED OFFER (2 Orders)

Carmelita's Mexican
├── Order 1: Sarah (2 mi north) - $3.20
└── Order 2: Mike (1.5 mi north) - $3.20

Pick up by: 6:20 PM
Total earnings: $8.40 + tips
Time: ~25 min

[Accept] [Decline]
```

---

## Restaurant Dashboard

### Prep Time Insights

```
Your Average Prep Times

Today:
Lunch (11am-2pm): 16 min avg ✓
Dinner (5pm-8pm): 24 min avg ⚠️ (high)

This Week vs Last Week:
+3 min slower during dinner

Driver Wait Times:
Average: 4.2 min ⚠️
Goal: Under 3 min

Recommendation:
Consider adding kitchen staff 
Friday-Sunday 5-8pm

[Adjust Prep Times]
```

### Manual Override

Restaurant can manually set prep times:
```
Set Prep Times:

Weekday Lunch: [15] min
Weekday Dinner: [20] min
Weekend Lunch: [18] min
Weekend Dinner: [28] min

[Save Settings]
```

---

## Database Schema

```sql
-- Restaurant prep times (learned)
CREATE TABLE restaurant_prep_times (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  day_of_week INTEGER, -- 0-6
  hour_of_day INTEGER, -- 0-23
  avg_prep_minutes INTEGER,
  sample_size INTEGER, -- how many orders
  last_updated TIMESTAMP
);

-- Prep time history (every order)
CREATE TABLE prep_time_records (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  restaurant_id UUID REFERENCES restaurants(id),
  estimated_prep INTEGER,
  actual_prep INTEGER,
  driver_wait_minutes INTEGER,
  items_count INTEGER,
  created_at TIMESTAMP
);

-- Dispatch events
CREATE TABLE dispatch_events (
  id UUID PRIMARY KEY,
  order_id UUID,
  driver_id UUID,
  dispatched_at TIMESTAMP,
  estimated_pickup TIMESTAMP,
  actual_pickup TIMESTAMP,
  wait_minutes INTEGER
);

-- Batches
CREATE TABLE batches (
  id UUID PRIMARY KEY,
  restaurant_id UUID,
  driver_id UUID,
  batch_type VARCHAR, -- 'same_restaurant', 'nearby', 'add_on'
  status VARCHAR,
  created_at TIMESTAMP,
  dispatched_at TIMESTAMP
);

CREATE TABLE batch_orders (
  id UUID PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  order_id UUID REFERENCES orders(id),
  sequence INTEGER,
  delivered_at TIMESTAMP
);
```

---

## API Endpoints

```
# Smart Dispatch
POST /api/dispatch/calculate-time
  Input: { restaurantId, orderTime, itemCount }
  Output: { dispatchAt, estimatedReadyAt }

# Batching
GET /api/batches/opportunities
  Returns: List of potential batches

POST /api/batches/create
  Input: { orderIds }
  Output: Batch object

POST /api/batches/:id/dispatch
  Dispatches driver for batch

# Learning
POST /api/prep-times/record
  Input: { orderId, actualPrep, waitTime }
  Action: Updates restaurant averages

GET /api/restaurants/:id/prep-times
  Returns: Average prep times by day/hour
```

---

## Implementation Plan

### Week 1: Basic Dispatch
- Dispatch drivers X minutes before order ready
- Fixed prep times (set by restaurant)
- Track wait times

### Week 2: Learning Algorithm
- Start recording actual prep times
- Calculate averages by day/time
- Adjust dispatch timing based on data

### Week 3: Batching (Phase 1)
- Same restaurant, 2 orders max
- Simple batch detection
- Sequential delivery

### Week 4: Advanced Batching
- Nearby restaurants
- Add-on orders
- Priority delivery option

### Month 2: Optimization
- Anomaly detection
- Predictive prep times (AI)
- Rush hour adjustments

---

## Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Driver wait time | < 3 min | Track |
| Food ready on arrival | 90% | Track |
| Batch rate | 30% | Track |
| Driver satisfaction | > 4.5/5 | Survey |

---

## Summary

**DoorDash-Style Smart Dispatch:**
1. Learn restaurant prep times by day/time
2. Dispatch drivers at optimal moment (arrive just as food ready)
3. Monitor wait times, adjust algorithm
4. Batch compatible orders (same restaurant, close timing)
5. Keep driver wait under 3 minutes

**Benefits:**
- Drivers happier (less waiting)
- Food hotter/fresher
- More deliveries per hour (batching)
- Lower costs
- Better ratings

This system adapts to each restaurant's actual speed, not just guesses.
