# City Delivery LLC / Paradise Delivery

## Brand Structure

**Parent Company:** City Delivery LLC  
**First Market:** Paradise Delivery (Paradise, CA)  
**Future Markets:** Chico Delivery, Oroville Delivery, etc.

---

## Domain Strategy

| Domain | Purpose | Status |
|--------|---------|--------|
| paradisedelivery.com | Paradise, CA market | Buy now ($12/yr) |
| citydelivery.com | Parent company & future markets | Buy now ($12/yr) |

**Redirects:**
- paradisedelivery.com → Main entry for Paradise customers
- citydelivery.com → Company info, careers, other markets
- citydelivery.com/paradise → Paradise-specific landing page

---

## Legal Structure

**LLC Formation:**
- Name: City Delivery LLC
- State: California
- DBA (Doing Business As): Paradise Delivery (in Paradise, CA)
- Future DBAs: Chico Delivery, Oroville Delivery, etc.

**Benefits:**
- One legal entity for all markets
- Single tax filing
- Unified insurance policy
- Scalable to new cities

---

## Branding by Market

### Paradise, CA (Launch Market)
- **Customer sees:** "Paradise Delivery"
- **Tagline:** "Fresh from Paradise to Paradise"
- **Colors:** Teal (#14B8A6) + Coral (#F97316)
- **Domain:** paradisedelivery.com
- **App display:** Paradise Delivery logo

### Future Markets (Year 2+)
- **Customer sees:** "[City] Delivery" (e.g., "Chico Delivery")
- **Tagline:** "Your local favorites, delivered"
- **Colors:** Same (consistent brand)
- **Domain:** citydelivery.com/chico
- **App display:** [City] Delivery logo (localized)

---

## App White-Labeling

### Technical Implementation

**Single Codebase:**
```typescript
// Config by market
const MARKET_CONFIG = {
  paradise: {
    name: "Paradise Delivery",
    location: "Paradise, CA",
    lat: 39.7596,
    lng: -121.6219,
    primaryColor: "#14B8A6",
    accentColor: "#F97316",
    domain: "paradisedelivery.com"
  },
  chico: {
    name: "Chico Delivery", 
    location: "Chico, CA",
    lat: 39.7285,
    lng: -121.8375,
    primaryColor: "#14B8A6",
    accentColor: "#F97316",
    domain: "citydelivery.com/chico"
  }
};

// App loads config based on subdomain or user location
const currentMarket = detectMarket(); // "paradise" or "chico"
const config = MARKET_CONFIG[currentMarket];
```

**Dynamic Branding:**
- Logo: Changes per market
- Colors: Consistent (City Delivery brand)
- Restaurant list: Local to market
- Driver pool: Local to market
- Support: Local phone number per market

---

## Marketing Materials

### Paradise Delivery (Current)

**Business Card:**
```
Paradise Delivery
Fresh from Paradise to Paradise

📱 Order: paradisedelivery.com
📞 Support: (530) XXX-XXXX

A City Delivery Company
```

**Flyer:**
```
PARADISE DELIVERY
Your Neighborhood Delivery App

✓ Save 15-20% vs DoorDash
✓ Support Paradise restaurants
✓ Fair pay for local drivers

Order now: paradisedelivery.com

City Delivery LLC
```

### City Delivery (Parent)

**Website (citydelivery.com):**
- About us
- Careers (drivers, support)
- Markets:
  - Paradise Delivery (Live)
  - Chico Delivery (Coming Soon)
  - More cities...
- Restaurant partner info
- Press kit

---

## Expansion Playbook

### Adding a New Market (e.g., Chico)

**Week 1:**
1. Update config: Add "chico" to MARKET_CONFIG
2. Deploy: Same apps, new branding
3. Domain: citydelivery.com/chico live
4. Local phone: Get Chico area code number

**Week 2:**
1. Recruit: 3-5 restaurants in Chico
2. Hire: 3-5 drivers in Chico
3. Market: "Chico Delivery - Now Live!"

**Week 3:**
1. Soft launch: Friends & family
2. Monitor: Separate metrics for Chico
3. Adjust: Local pricing if needed

**Cost to add market:** ~$500 (marketing) + $0 dev

---

## Financial Structure

### Revenue by Market
```
City Delivery LLC
├── Paradise Delivery: 60% of revenue
├── Chico Delivery: 25% of revenue (future)
├── Oroville Delivery: 10% of revenue (future)
└── Other markets: 5% of revenue (future)
```

### Shared Costs
- Engineering team (you + future hires)
- Core infrastructure (servers, APIs)
- Insurance (general liability covers all markets)
- Payment processing (Stripe)

### Local Costs per Market
- Local marketing
- Local support (phone number)
- Local driver recruiting
- Local restaurant relations

---

## Team Structure (Future)

**Corporate (City Delivery LLC):**
- CEO/Founder (you)
- CTO (tech lead)
- CFO (finance)
- Head of Product

**Per Market:**
- Market Manager (local operations)
- Restaurant Success Manager
- Driver Community Manager
- Local Marketing Lead

**Phase 1 (Now):** You do everything in Paradise
**Phase 2 (Year 2):** Hire Market Manager for new cities
**Phase 3 (Year 3):** Corporate team + market managers

---

## Documents Updated

All project docs now reflect:
- **Legal entity:** City Delivery LLC
- **First market:** Paradise Delivery
- **Future expansion:** Built-in to architecture

**Files:**
- FINAL_PRICING_v3.md
- INSURANCE_STRUCTURE.md
- PARADISE_CA_LAUNCH.md
- All technical documentation
- All marketing copy

---

## Summary

**Now:** Launch as Paradise Delivery (citydelivery.com/paradise)  
**Later:** Add Chico Delivery, Oroville Delivery, etc.  
**Never:** Rebrand (scales naturally)  
**Cost to expand:** $500 per city (not $50k rebrand)

**You're building the UberEats of small towns.**
