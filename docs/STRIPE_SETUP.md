# Stripe Setup Guide for Paradise Delivery

## Step-by-Step Instructions

### 1. Create Stripe Account (5 minutes)

1. Go to https://dashboard.stripe.com/register
2. Enter your email: **buttefrontdesk@outlook.com**
3. Create a strong password (save in password manager)
4. Verify your email

### 2. Complete Business Profile (10 minutes)

**Business Type:**
- Type: Limited Liability Company (LLC)
- Industry: Food & Drink / Food Delivery
- Website: (leave blank for now or use your domain)

**Business Details:**
- Legal business name: Paradise Delivery LLC (or your LLC name)
- EIN: Your business tax ID
- Business address: Your business address
- Phone: (530) 783-7148

**Representative (You):**
- Full legal name
- Date of birth
- Home address
- Last 4 of SSN (required for identity verification)

### 3. Add Bank Account (2 minutes)

- Routing number
- Account number
- Account type (checking)

This is where Stripe will deposit your payments.

### 4. Get Your API Keys (2 minutes)

Once approved:

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

3. Click "Reveal test key" for the secret key
4. Copy both keys

### 5. Update Your .env File

Open `paradise-delivery/.env` and add:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**IMPORTANT:** 
- Never commit the `.env` file to GitHub
- Use `test` keys for development
- Switch to `live` keys when ready for production

### 6. Test Payment (5 minutes)

1. Start your backend: `npm start`
2. Go to your demo restaurant page
3. Add items to cart
4. Click "Proceed to Checkout"
5. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (12/25)
   - CVC: Any 3 digits (123)
   - ZIP: Any 5 digits (12345)
6. Complete payment
7. Check Stripe Dashboard for the successful test payment

### 7. Webhook Setup (10 minutes)

For order status updates:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```
4. Copy the webhook signing secret
5. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 8. Switch to Live Mode (When Ready)

1. Complete identity verification in Stripe Dashboard
2. Switch to "Live mode" toggle
3. Get live API keys (pk_live_ and sk_live_)
4. Update .env with live keys
5. Test with real $1 payment

---

## Stripe Pricing for Food Delivery

**Standard Pricing:**
- 2.9% + $0.30 per transaction
- No monthly fees
- No setup fees

**Example on $40 order:**
- Customer pays: $40.00
- Stripe fee: $1.46 (2.9% of $40 = $1.16 + $0.30)
- You receive: $38.54

**Your profit on that order:**
- Commission from restaurant (18%): $6.48
- Minus driver pay: -$6.20
- Minus Stripe fee: -$1.46
- **Net profit: $8.82**

---

## Troubleshooting

**"Identity verification failed"**
- Ensure name matches your ID exactly
- Use clear photos of documents
- Try different lighting

**"Account restricted"**
- Complete ALL business profile fields
- Add detailed business description
- Explain your delivery model

**Need help?**
- Stripe Support: support@stripe.com
- Or call: +1 888-963-8442

---

## Quick Reference

| What You Need | Where to Find It |
|---------------|------------------|
| Test API Keys | Dashboard → Developers → API Keys |
| Live API Keys | Dashboard → Activate Account → API Keys |
| Payment Logs | Dashboard → Payments |
| Webhook Settings | Dashboard → Developers → Webhooks |
| Payout Schedule | Dashboard → Settings → Bank accounts |