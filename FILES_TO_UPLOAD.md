# 📦 Paradise Delivery - Files to Upload

## Essential Files (Required)

### Root HTML Pages
- `app-final.html` - Main landing page
- `demo-restaurant.html` - Demo restaurant with working cart/checkout
- `driver-portal.html` - Driver signup page
- `restaurant-partners.html` - Restaurant signup page
- `terms.html` - Terms of Service
- `privacy.html` - Privacy Policy
- `prop22-disclosure.html` - Prop 22 Disclosure

### Backend Files
- `server.js` - Main server file
- `package.json` - Dependencies
- `.env` - Environment variables (API keys)

### Route Handlers (in `/routes/` folder)
- `auth.js` - User authentication
- `drivers.js` - Driver applications
- `restaurants.js` - Restaurant applications
- `orders.js` - Order processing
- `payments.js` - Stripe payments
- `menu.js` - Menu items
- `admin.js` - Admin dashboard API
- `users.js` - User management

### Database
- `database/schema.sql` - Database structure
- `scripts/init-db.js` - Database initializer

### Admin Dashboard
- `admin/index.html` - Admin interface

### Documentation
- `README-BACKEND.md` - Backend documentation
- `DEPLOYMENT.md` - Deployment guide

---

## Optional Files (Helpful but not required)

### Documentation
- `docs/STRIPE_SETUP.md` - Stripe setup guide
- `docs/GOOGLE_MAPS_SETUP.md` - Google Maps guide
- `SETUP_CHECKLIST.md` - Setup checklist
- `STRIPE_VERIFICATION_REPORT.md` - Stripe verification
- `test-integration.js` - Test script

### Development
- `deploy.sh` - Deployment script (for Linux/Mac)
- `.env.example` - Environment template

---

## Do NOT Upload

### Node Modules
- `node_modules/` folder (will be installed on server)

### Git
- `.git/` folder
- `.gitignore`

### Database (if SQLite)
- `database/paradise.db` (will be created on server)

### Logs
- Any `.log` files

---

## File Count Summary

**Total files to upload:** ~25 files
**Total size:** ~500 KB (without node_modules)

---

## Quick Upload Commands

### Using Git (Recommended)
```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/paradise-delivery.git
git push -u origin main
```

### Using FTP (if using traditional hosting)
```bash
# Zip the files (excluding node_modules)
zip -r paradise-delivery.zip . -x "node_modules/*" ".git/*" "database/paradise.db"

# Upload paradise-delivery.zip via FTP
# Extract on server
# Run: npm install && npm start
```

---

## Post-Upload Checklist

After uploading, verify these work:

- [ ] Homepage loads: `/app-final.html`
- [ ] Driver signup submits: `/driver-portal.html`
- [ ] Restaurant signup submits: `/restaurant-partners.html`
- [ ] Demo restaurant checkout works: `/demo-restaurant.html`
- [ ] Admin dashboard loads: `/admin/index.html`
- [ ] API endpoints respond: `/api/health`

---

## Deployment Size

**With node_modules:** ~150 MB
**Without node_modules:** ~500 KB

Always exclude `node_modules/` from uploads - the server will install dependencies automatically.

---

**Ready to upload? See DEPLOYMENT.md for platform-specific instructions.**