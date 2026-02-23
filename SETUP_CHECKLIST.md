# Paradise Delivery - Quick Setup Checklist

## Accounts You Need to Create

### ⬜ 1. Stripe (30 minutes)
- [ ] Go to stripe.com and sign up
- [ ] Complete business profile (LLC, EIN, your info)
- [ ] Add bank account for payouts
- [ ] Copy API keys from Dashboard → Developers → API Keys
- [ ] Add keys to `.env` file:
  ```
  STRIPE_SECRET_KEY=sk_test_your_key
  STRIPE_PUBLISHABLE_KEY=pk_test_your_key
  ```

**Test card:** 4242 4242 4242 4242, any future date, any CVC

---

### ⬜ 2. Google Maps API (20 minutes)
- [ ] Go to console.cloud.google.com
- [ ] Create project "paradise-delivery"
- [ ] Enable these APIs:
  - Distance Matrix API
  - Geocoding API
  - Maps JavaScript API
- [ ] Create API key (restrict to your domain!)
- [ ] Add billing (required, $300 free credits)
- [ ] Add key to `.env` file:
  ```
  GOOGLE_MAPS_API_KEY=AIzaYourKey
  ```

---

### ⬜ 3. Email SMTP (5 minutes)
**Option A: Gmail (Easiest)**
- [ ] Create Gmail account or use existing
- [ ] Enable 2-factor authentication
- [ ] Generate App Password
- [ ] Add to `.env`:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your@gmail.com
  SMTP_PASS=your_app_password
  ```

**Option B: Outlook (Your current email)**
- [ ] Already configured in backend
- [ ] Just need app password from Microsoft

---

## Test Everything (15 minutes)

### ⬜ Start Backend
```bash
cd paradise-delivery
npm install
npm start
```

### ⬜ Test Payment Flow
- [ ] Go to demo-restaurant.html
- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Check Stripe Dashboard for payment

### ⬜ Test Distance Calculation
- [ ] Place test order
- [ ] Verify delivery fee matches distance
  - 0-2 miles: $2.49
  - 2-4 miles: $3.49
  - 4-7 miles: $4.49
  - 7-11 miles: $5.49

---

## Monthly Costs

| Service | Cost |
|---------|------|
| Stripe | 2.9% + $0.30 per transaction |
| Google Maps | ~$15-30/month (depending on volume) |
| Hosting (Render) | $0-7/month |
| **Total** | **~$50-100/month** |

---

## After Setup

### Week 1: Soft Launch
- [ ] Recruit 3 friends as test customers
- [ ] Recruit 2 friends as test drivers
- [ ] Place 10 test orders
- [ ] Fix any bugs

### Week 2: Restaurant Partners
- [ ] Email 10 local restaurants
- [ ] Get 3-5 signed up
- [ ] Photograph their menus
- [ ] Add to platform

### Week 3: Driver Recruitment
- [ ] Post on Facebook/Nextdoor
- [ ] Target college students (Chico State)
- [ ] Get 5-10 drivers onboarded

### Week 4: Public Launch
- [ ] Post on local Facebook groups
- [ ] Flyers at restaurants
- [ ] Word of mouth

---

## Support

**Need help?**
- Text/call: (530) 783-7148
- Email: buttefrontdesk@outlook.com

**Estimated time to complete setup:** 1-2 hours
**Estimated time to launch:** 3-4 weeks