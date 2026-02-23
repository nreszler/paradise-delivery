# Paradise Delivery - Order Batching System

## Overview
AI-powered order batching that groups 2-3 compatible orders for a single driver, increasing efficiency and reducing costs by ~40%.

---

## Batching Logic

### When to Batch

**Criteria (ALL must be true):**
1. **Same restaurant** OR restaurants within 0.5 miles
2. **Orders placed within 10 minutes** of each other
3. **No drivers currently assigned** to either order
4. **Order sizes compatible** (small + small, not 10-item + 1-item)
5. **Delivery addresses within 2 miles** of each other
6. **Route efficiency** > 70% (not backtracking)

### Batch Types

**Type 1: Same Restaurant (Ideal)**
```
Restaurant: Carmelita's
├── Order A (Customer 1) - 2 mi north
├── Order B (Customer 2) - 1.5 mi north  
└── Order C (Customer 3) - 2.5 mi north

Driver: Pick up all 3 → Deliver A → Deliver B → Deliver C
Driver pay: $5 base + $0.60/mi (total route)
```

**Type 2: Nearby Restaurants**
```
Restaurant A: Carmelita's - 0.3 mi from B
Restaurant B: Paradise Cafe

Driver: Pick up A → Pick up B → Deliver A's orders → Deliver B's orders
```

**Type 3: Chain Batching (Rare in Paradise)**
```
Multiple McDonald's orders (if multiple locations exist)
```

---

## Driver Payout for Batched Orders

### DoorDash-Style Payout

**Standard (no batch):**
- Base: $5.00
- Mileage: $0.60/mile
- Example 3-mi delivery: $5 + $1.80 = **$6.80**

**Batched (2 orders):**
- Base: $5.00 (NOT $10!)
- Mileage: $0.60/mile (entire route)
- Example: 4 mi total route = $5 + $2.40 = **$7.40**
- Plus tips from both customers

**Batched (3 orders):**
- Base: $5.00
- Mileage: $0.60/mile (entire route)
- Example: 6 mi total route = $5 + $3.60 = **$8.60**
- Plus tips from all 3 customers

### Driver Benefit
- Same trip, ~30% more pay
- Two chances for tips
- More efficient use of time
- Driver effective hourly: $18-25 vs $15-20

---

## Economics for Paradise Delivery

### Without Batching
| Metric | Per Order |
|--------|-----------|
| Driver pay | $6.80 |
| Your profit | $3.76 |
| 2 orders profit | $7.52 |

### With Batching (2 orders)
| Metric | Per Order | Batch Total |
|--------|-----------|-------------|
| Driver pay | $3.70 (split) | $7.40 |
| Your profit | $6.41 | $12.82 |
| **Savings** | **$2.65/order** | **$5.30 total** |

### Paradise, CA Projection
- Daily orders: 50
- Batchable orders: ~20 (40%)
- Average batch size: 2.2 orders
- Daily savings: $58
- **Monthly savings: $1,740**
- **Annual savings: $20,880**

---

## Algorithm Implementation

### Batch Detection Engine

```typescript
// Runs every 30 seconds
function findBatches(): Batch[] {
  const unassignedOrders = getUnassignedOrders();
  const batches: Batch[] = [];
  
  for (const order of unassignedOrders) {
    const compatibleOrders = findCompatibleOrders(order, unassignedOrders);
    
    if (compatibleOrders.length >= 1) {
      const batch = createBatch([order, ...compatibleOrders.slice(0, 2)]);
      batches.push(batch);
    }
  }
  
  return batches;
}

function findCompatibleOrders(target: Order, candidates: Order[]): Order[] {
  return candidates.filter(candidate => {
    // Same restaurant or nearby
    const restaurantDistance = getDistance(
      target.restaurant.location,
      candidate.restaurant.location
    );
    if (restaurantDistance > 0.5) return false;
    
    // Orders within 10 minutes
    const timeDiff = Math.abs(target.createdAt - candidate.createdAt);
    if (timeDiff > 10 * 60 * 1000) return false; // 10 min
    
    // Delivery addresses nearby
    const deliveryDistance = getDistance(
      target.deliveryAddress.location,
      candidate.deliveryAddress.location
    );
    if (deliveryDistance > 2) return false;
    
    // Route efficiency
    const efficiency = calculateRouteEfficiency([target, candidate]);
    if (efficiency < 0.7) return false;
    
    return true;
  });
}

function calculateRouteEfficiency(orders: Order[]): number {
  // Calculate total distance if batched vs individual
  const individualDistance = orders.reduce((sum, o) => 
    sum + o.restaurant.distanceTo(o.deliveryAddress), 0
  );
  
  const batchedRoute = optimizeRoute(orders);
  const batchedDistance = calculateRouteDistance(batchedRoute);
  
  return individualDistance / batchedDistance; // > 1 = more efficient
}
```

### Route Optimization

```typescript
function optimizeRoute(batch: Batch): Route {
  const stops = [
    { type: 'pickup', location: batch.restaurant.location },
    ...batch.orders.map(o => ({ 
      type: 'delivery', 
      location: o.deliveryAddress.location,
      order: o 
    }))
  ];
  
  // Traveling Salesman Problem (simplified for 3-4 stops)
  const optimized = solveTSP(stops);
  
  return {
    stops: optimized,
    totalDistance: calculateDistance(optimized),
    estimatedTime: calculateTime(optimized),
    driverPay: calculateDriverPay(optimized)
  };
}
```

---

## Customer Experience

### Checkout - Delivery Options

```
Delivery Options:

⚫ Standard Delivery
   $3.99 delivery fee
   Estimated: 35-50 min

⚫ Priority Delivery (+$2.00)
   Delivered first in batch
   Estimated: 25-35 min
   
   [Best for: Hungry now!]
```

**Default:** Standard (may be batched)
**Upsell:** Priority (never batched, delivered first)

### Order Confirmation

**Standard (batched):**
```
Your order has been placed! 🎉

Order #1234
Carmelita's Mexican Grill

Delivery: 40-55 minutes
Your order may be delivered with 1-2 other 
orders heading your way to reduce costs.

[Track Order]
```

**Priority (not batched):**
```
Your order has been placed! 🎉

Order #1235
Paradise Cafe

Priority Delivery: 25-35 minutes
Your order will be delivered first.

[Track Order]
```

### Live Tracking - Batched Orders

```
Driver: Mike
Car: Toyota Camry (White)
Rating: 4.9 ⭐

Current Status:
🍴 Picked up your order + 1 other
🚗 Heading to first delivery
📍 5 min to Customer 1
📍 12 min to YOU (Customer 2)

[View Map]
```

---

## Driver Experience

### Batched Offer Screen

```
📦 BATCHED OFFER
2 Orders from Carmelita's

Order 1 (Deliver First):
👤 Sarah M.
📍 456 Oak Ave (1.2 mi)
💰 $3.20 + tip

Order 2 (Deliver Second):
👤 John D. (YOU)
📍 789 Pine St (2.1 mi)
💰 $4.20 + tip

Total Earnings: $7.40 + tips
Route Time: ~25 min

[Accept] [Decline]
```

### Delivery Sequence

```
1. Navigate to Carmelita's
   [Arrived] [Problem?]

2. Pick up Order 1
   ✓ Order 1234
   [Take Photo] [Confirm Pickup]

3. Pick up Order 2
   ✓ Order 1235
   [Take Photo] [Confirm Pickup]

4. Deliver Order 1 to Sarah
   📍 456 Oak Ave
   [Navigate] [Arrived] 
   [Take Photo] [Complete]

5. Deliver Order 2 to John
   📍 789 Pine St
   [Navigate] [Arrived]
   [Take Photo] [Complete]

✅ Both Orders Complete!
Earnings: $7.40 + $8.50 tips = $15.90
```

---

## Restaurant Experience

### Order Notification

**Single Order:**
```
New Order #1234
Pick up in 15 min
```

**Batched Orders:**
```
2 New Orders (Batched)
├── Order #1234 - Due 6:15pm
└── Order #1235 - Due 6:20pm

Same driver will pick up both
Prepare together if possible
```

### Dashboard View

```
Active Orders:

🔥 Batch #B12 (2 orders)
├── #1234 - Sarah - Due 6:15
├── #1235 - John - Due 6:20
└── Driver: Mike (ETA 3 min)

Single Orders:
├── #1236 - Mike - Due 6:30
└── #1237 - Lisa - Due 6:35
```

---

## Edge Cases

### Customer 1 Not Home
- Driver starts timer (5 min)
- If no response: Leave at door + photo
- Continue to Customer 2
- No delay to Customer 2

### Restaurant Delayed
- Driver waits max 10 min
- If delayed: Unbatch, deliver ready order first
- Return for second order

### Order Too Big to Batch
- 10+ item orders = no batch
- Alcohol orders = no batch (ID check required)
- High-value orders (>$75) = no batch unless priority waived

### Priority Order in Batch
- If Customer 2 paid Priority (+$2)
- They get delivered FIRST in route
- Driver paid extra $0.50 for reordering

---

## Database Schema

```sql
-- Batches table
CREATE TABLE batches (
  id UUID PRIMARY KEY,
  restaurant_id UUID,
  driver_id UUID,
  status VARCHAR, -- 'pending', 'assigned', 'picked_up', 'complete'
  total_distance DECIMAL,
  estimated_time INTEGER, -- minutes
  driver_pay DECIMAL,
  created_at TIMESTAMP,
  assigned_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Batch orders (junction)
CREATE TABLE batch_orders (
  id UUID PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  order_id UUID REFERENCES orders(id),
  sequence INTEGER, -- 1, 2, 3 (delivery order)
  delivered_at TIMESTAMP
);

-- Add batch_id to orders
ALTER TABLE orders ADD COLUMN batch_id UUID;
```

---

## API Endpoints

```
# Batching Engine
GET /api/batches/available
POST /api/batches/:id/assign
POST /api/batches/:id/pickup
POST /api/batches/:id/complete

# Driver
GET /api/drivers/:id/active-batch
POST /api/batches/:batchId/deliver/:orderId

# Customer
GET /api/orders/:id/batch-info
GET /api/batches/:id/eta-for-order/:orderId
```

---

## Implementation Phases

### Phase 1: Simple Batching (Launch)
- Same restaurant only
- 2 orders max
- Same prep time orders
- Simple route (closest first)

### Phase 2: Nearby Restaurants (Month 2)
- Within 0.5 miles
- Pick up A → Pick up B → Deliver all

### Phase 3: Smart Optimization (Month 3)
- 3 orders max
- Priority delivery option
- Real-time traffic
- Predictive batching (AI suggests likely batches)

---

## Summary

**Order batching saves Paradise Delivery ~$1,740/month** by:
- Reducing driver pay per order ($2.65 savings)
- Increasing driver earnings (happier drivers)
- Reducing wait times (more efficient)
- Better customer value (lower delivery costs)

**Recommended:** Launch with Phase 1 (same restaurant, 2 orders max), expand from there.
