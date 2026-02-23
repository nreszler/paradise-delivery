# Google Maps API Setup Guide for Paradise Delivery

## Step-by-Step Instructions

### 1. Create Google Cloud Account (5 minutes)

1. Go to https://console.cloud.google.com/
2. Sign in with your Google account (or create one)
3. Accept terms of service
4. You'll get $300 free credits for 90 days (perfect for testing)

### 2. Create New Project (2 minutes)

1. Click project dropdown at top of page
2. Click "New Project"
3. Project name: `paradise-delivery`
4. Organization: (leave as default)
5. Location: (leave as default)
6. Click "Create"

### 3. Enable Required APIs (5 minutes)

1. Make sure your `paradise-delivery` project is selected
2. Click the hamburger menu (☰) → "APIs & Services" → "Library"
3. Search and enable each API:

**Required APIs:**
- ✅ **Distance Matrix API** - Calculate delivery distances
- ✅ **Geocoding API** - Convert addresses to coordinates
- ✅ **Maps JavaScript API** - Show maps on website

**Optional (for future features):**
- Places API - Autocomplete addresses
- Directions API - Turn-by-turn for drivers

To enable each:
1. Search for the API name
2. Click on it
3. Click "Enable"

### 4. Create API Key (3 minutes)

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Copy the key (starts with `AIza...`)
4. Click "Restrict Key" (important!)

### 5. Secure Your API Key (CRITICAL)

**In the API key settings:**

1. **Application restrictions:**
   - Select "HTTP referrers (websites)"
   - Add your domains:
     - `*.paradisedelivery.com/*`
     - `localhost:3000/*` (for testing)

2. **API restrictions:**
   - Select "Restrict key"
   - Check only these APIs:
     - Distance Matrix API
     - Geocoding API
     - Maps JavaScript API

3. Click "Save"

**Without restrictions, someone could steal your API key and rack up charges!**

### 6. Set Up Billing (Required)

1. Go to Billing → "Manage Billing Accounts"
2. Click "Add Billing Account"
3. Enter your business info
4. Add payment method (credit card)
5. Link billing account to your project

**Note:** You won't be charged until you exceed $300 free credits or 90 days pass.

### 7. Update Your Code

**Add API key to .env:**
```env
GOOGLE_MAPS_API_KEY=AIzaYourActualKeyHere
```

**Test the integration:**

Add this test script to your project:

```javascript
// test-distance.js
const axios = require('axios');

async function calculateDistance() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // Test: Paradise, CA to Chico, CA
  const origin = 'Paradise, CA';
  const destination = 'Chico, CA';
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving&units=imperial&key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.rows[0].elements[0].status === 'OK') {
      const distance = data.rows[0].elements[0].distance.text;
      const duration = data.rows[0].elements[0].duration.text;
      console.log(`Distance: ${distance}`);
      console.log(`Duration: ${duration}`);
    } else {
      console.log('Error:', data.rows[0].elements[0].status);
    }
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

calculateDistance();
```

Run it:
```bash
node test-distance.js
```

Expected output:
```
Distance: 11.2 mi
Duration: 18 mins
```

### 8. Update Your Backend

In your `routes/orders.js`, the distance calculation is already implemented. It will:

1. Take customer address
2. Get restaurant coordinates
3. Calculate driving distance
4. Apply correct delivery fee ($2.49-$5.99)

### 9. Monitor Usage & Costs

**Pricing (as of 2025):**
- Distance Matrix API: $5 per 1000 requests
- Geocoding API: $5 per 1000 requests

**Example costs:**
- 100 orders/day × 30 days = 3000 API calls
- Cost: ~$15/month

**Set up budget alerts:**
1. Go to Billing → Budgets & alerts
2. Create budget: $50/month
3. Set alerts at 50%, 90%, 100%

---

## Common Issues

**"API key not valid"**
- Check key restrictions match your domain
- Ensure APIs are enabled
- Wait 5 minutes after enabling

**"You must enable Billing"**
- Add credit card to Google Cloud
- Link billing account to project

**"OVER_QUERY_LIMIT"**
- You're on free tier (limited requests)
- Add billing to get higher limits

**"REQUEST_DENIED"**
- API key restrictions too strict
- Check HTTP referrer settings

---

## Test Locations in Paradise, CA

Use these for testing distance calculations:

| From (Restaurant) | To (Customer) | Expected Distance |
|-------------------|---------------|-------------------|
| 6491 Clark Rd, Paradise, CA | 100 Black Olive Dr, Paradise, CA | ~2 miles |
| 6491 Clark Rd, Paradise, CA | 150 Pearson Rd, Paradise, CA | ~3 miles |
| 6491 Clark Rd, Paradise, CA | Chico, CA | ~11 miles |

---

## Quick Reference

| Task | URL |
|------|-----|
| Google Cloud Console | https://console.cloud.google.com/ |
| API Library | APIs & Services → Library |
| API Credentials | APIs & Services → Credentials |
| Billing | Billing → Overview |
| Usage Reports | APIs & Services → Dashboard |

---

## Next Steps After Setup

1. ✅ Test distance calculation API
2. ✅ Verify delivery fees are correct
3. ✅ Add address autocomplete to checkout
4. ✅ Show driver route on map
5. ✅ Set up usage monitoring

**Need help?**
- Google Cloud Support: https://cloud.google.com/support
- Community: https://stackoverflow.com/questions/tagged/google-maps