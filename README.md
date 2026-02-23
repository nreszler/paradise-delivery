# City Delivery LLC / Paradise Delivery

A local-first food delivery platform serving Paradise, CA — with architecture to expand to any city.

## Brand Structure

**Parent Company:** City Delivery LLC  
**First Market:** Paradise Delivery (Paradise, CA 95969)  
**Future Expansion:** Chico Delivery, Oroville Delivery, and beyond

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:generate
pnpm db:push

# Run all apps
pnpm dev
```

**Apps will be available at:**
- Customer: http://localhost:3000
- Restaurant: http://localhost:3001
- Driver: http://localhost:3002
- Admin: http://localhost:3003

---

## Project Structure

```
paradise-delivery/
├── apps/
│   ├── customer-web/          # paradisedelivery.com
│   ├── customer-mobile/       # iOS & Android apps
│   ├── restaurant-dashboard/  # Restaurant portal
│   ├── driver-app/            # Web app for drivers
│   ├── driver-mobile/         # iOS & Android apps
│   └── admin-panel/           # citydelivery.com/admin
├── packages/
│   ├── database/              # Prisma schema
│   ├── pricing/               # Fee calculator
│   ├── refund-assessment/     # Fraud detection
│   ├── payments/              # Stripe Connect
│   └── shared-ui/             # Components
└── docs/
    ├── BRAND_STRUCTURE.md     # Expansion strategy
    ├── FINAL_PRICING_v3.md    # Unit economics
    ├── INSURANCE_STRUCTURE.md # Coverage details
    └── ...
```

---

## The Pitch

**"Keep Paradise in Paradise"**

- **Customers:** Save 15-20% vs DoorDash
- **Restaurants:** Keep 82% (vs 70% on DoorDash)
- **Drivers:** Earn $18-25/hr with Prop 22 compliance
- **Community:** Local business supporting local businesses

---

## Pricing Model

| Component | Rate |
|-----------|------|
| Service Fee | 15% |
| Delivery Fee | $3.99-7.49 (distance-based) |
| Small Order Fee | $2.99 (orders under $15) |
| Restaurant Commission | 18% |
| **Customer Savings vs DoorDash** | **15-20%** |
| **Your Profit (avg)** | **$3.72/order** |

---

## Key Features

### Customer Apps
- Price comparison widget ("You save $X vs DoorDash")
- Live order tracking
- Scheduled orders
- Pickup option
- Apple Pay / Google Pay

### Driver Apps
- One-tap job acceptance
- Photo-required delivery confirmation
- GPS tracking
- Earnings breakdown ($5 + $0.60/mile)
- Prop 22 compliance tracking

### Restaurant Dashboard
- Real-time order notifications
- Menu builder
- Error charge dispute
- Analytics & insights

### Admin Panel
- Refund risk scoring (AI-powered)
- Fraud detection
- Driver/restaurant onboarding
- Financial reporting

---

## Launch Timeline (Paradise, CA)

| Week | Milestone |
|------|-----------|
| 1 | Technical setup, Stripe Connect |
| 2 | Form LLC, insurance, licenses |
| 3 | First restaurant (Carmelita's) |
| 4 | Recruit 3-5 drivers |
| 5 | Soft launch (friends & family) |
| 6 | Public launch! |

**Target:** 60 orders/day by Month 6

---

## Expansion Strategy

**Phase 1:** Paradise, CA (Now)  
**Phase 2:** Chico, CA + Magalia (Month 7-12)  
**Phase 3:** Butte County + beyond (Year 2)

Each new market gets localized branding ("Chico Delivery") but runs on the same City Delivery infrastructure.

**Cost to add new city:** ~$500 (marketing only)

---

## Documentation

- [BRAND_STRUCTURE.md](docs/BRAND_STRUCTURE.md) - Expansion strategy
- [FINAL_PRICING_v3.md](docs/FINAL_PRICING_v3.md) - Financial model
- [INSURANCE_STRUCTURE.md](docs/INSURANCE_STRUCTURE.md) - Coverage details
- [SMART_DISPATCH.md](docs/SMART_DISPATCH.md) - Driver dispatch algorithm
- [BATCHING_SYSTEM.md](docs/BATCHING_SYSTEM.md) - Order batching
- [REFUND_SYSTEM.md](docs/REFUND_SYSTEM.md) - Fraud prevention
- [COMPREHENSIVE_RESEARCH.md](docs/COMPREHENSIVE_RESEARCH.md) - Full market analysis

---

## Tech Stack

- **Frontend:** Next.js 14, React Native, Tailwind CSS
- **Backend:** Node.js, PostgreSQL, Prisma
- **Payments:** Stripe Connect
- **Maps:** Google Maps API
- **Hosting:** Vercel + Railway

---

## Contact

**Paradise Delivery**  
A City Delivery Company  
Paradise, CA 95969

Order: paradisedelivery.com  
Support: (530) XXX-XXXX

---

Built with ❤️ in Paradise, California
