# Paradise Delivery - Deployment Guide

## Option 1: Render (Recommended - Free & Easy)

### Step 1: Push to GitHub
```bash
cd paradise-delivery
git init
git add .
git commit -m "Initial commit - Paradise Delivery v1.0"
```

Create a new GitHub repo and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/paradise-delivery.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repo
5. Settings:
   - **Name:** paradise-delivery
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add Environment Variables:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
   JWT_SECRET=your-secret-key-here
   NODE_ENV=production
   ```

7. Click "Create Web Service"

**Your site will be live at:** `https://paradise-delivery.onrender.com`

---

## Option 2: Railway (Alternative)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway auto-detects Node.js
6. Add environment variables in Settings
7. Deploy!

---

## Option 3: Traditional VPS (DigitalOcean/Linode)

If you want full control, you can rent a VPS for $5/month:

```bash
# On your server:
git clone https://github.com/YOUR_USERNAME/paradise-delivery.git
cd paradise-delivery
npm install
npm start

# Use PM2 to keep it running:
npm install -g pm2
pm2 start server.js --name "paradise-delivery"
pm2 startup
pm2 save
```

---

## Option 4: Namecheap (Your Current Host)

If you have existing hosting with Namecheap:

1. **Upload static files** (HTML/CSS/JS) via FTP:
   - Host: `buttefrontdesk.com` (or your domain)
   - Username: `your-ftp-username`
   - Password: `your-ftp-password`

2. **Upload the Node.js backend** to a VPS or use a separate service

3. **Update API URLs** in your HTML files to point to your backend URL

---

## Quick Deployment Checklist

Before deploying:
- [ ] Update `.env` with production values
- [ ] Change JWT_SECRET to a random string
- [ ] Switch Stripe to live keys (when ready)
- [ ] Add Google Maps API key
- [ ] Test everything locally one more time
- [ ] Set up custom domain (optional)
- [ ] Enable SSL/HTTPS

---

## Post-Deployment

Once deployed, test these URLs:
- Homepage: `https://your-domain.com/app-final.html`
- Demo Restaurant: `https://your-domain.com/demo-restaurant.html`
- Driver Signup: `https://your-domain.com/driver-portal.html`
- Restaurant Signup: `https://your-domain.com/restaurant-partners.html`
- Admin: `https://your-domain.com/admin/index.html`

---

## Troubleshooting

**"Cannot find module" errors:**
- Run `npm install` again
- Check `package.json` has all dependencies

**Port already in use:**
- Render/Railway handle this automatically
- On VPS: Change PORT in .env

**Database errors:**
- SQLite file path issue
- Make sure `database/` folder exists

**Environment variables not loading:**
- Check .env file is in root directory
- Verify variables are set in hosting dashboard

---

## Recommended: Render (5 minutes)

**Why Render?**
- ✅ Free tier available
- ✅ Auto-deploys from GitHub
- ✅ Built-in SSL
- ✅ Easy environment variables
- ✅ Good for Node.js apps

**Estimated time:** 5-10 minutes to deploy

---

Need help with any step?