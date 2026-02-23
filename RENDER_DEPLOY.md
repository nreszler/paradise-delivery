# 🚀 Deploy to Your Existing Render Account

Since you already have a Render account (from AI Receptionist), this will be quick!

## Option 1: Blueprint Deploy (Easiest - 2 minutes)

### Step 1: Push to GitHub First

If you haven't already:

```bash
# In your paradise-delivery folder
git init
git add .
git commit -m "Ready for Render deployment"

# Create GitHub repo first, then:
git remote add origin https://github.com/YOUR_USERNAME/paradise-delivery.git
git branch -M main
git push -u origin main
```

### Step 2: Update render.yaml

Open `render.yaml` and change:
```yaml
repo: https://github.com/YOUR_USERNAME/paradise-delivery
```

To your actual GitHub repo URL.

### Step 3: Deploy on Render

1. Log into your Render dashboard: https://dashboard.render.com
2. Click **"Blueprints"** in the left sidebar
3. Click **"New Blueprint Instance"**
4. Connect your GitHub account (if not already)
5. Select the `paradise-delivery` repo
6. Click **"Apply"**
7. Fill in the environment variables when prompted:
   - `STRIPE_SECRET_KEY`: `sk_test_YOUR_SECRET_KEY_HERE`
   - `STRIPE_PUBLISHABLE_KEY`: `pk_test_YOUR_PUBLISHABLE_KEY_HERE`
   - `JWT_SECRET`: (generate a random string, or use: `paradise-delivery-secret-2024`)

8. Click **"Apply"**

**Done!** Your site will be live in ~2 minutes.

URL will be: `https://paradise-delivery.onrender.com`

---

## Option 2: Manual Setup (If Blueprint Doesn't Work)

### Step 1: Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Find and select `paradise-delivery` repo
5. Click **"Connect"**

### Step 2: Configure Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | paradise-delivery |
| **Region** | Oregon (US West) |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### Step 3: Add Environment Variables

Click **"Advanced"** then add these:

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
JWT_SECRET=paradise-delivery-secret-key-change-this-in-production
```

### Step 4: Deploy

Click **"Create Web Service"**

Render will:
1. Build your app (~2 minutes)
2. Deploy it automatically
3. Give you a URL

---

## 🌐 Custom Domain (Optional)

If you want to use your own domain:

1. In Render dashboard, click your service
2. Go to **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter: `delivery.buttefrontdesk.com` (or whatever you want)
5. Follow DNS instructions

---

## ✅ Verify Deployment

Once deployed, test these URLs:

- **Homepage**: `https://paradise-delivery.onrender.com/app-final.html`
- **Driver Signup**: `https://paradise-delivery.onrender.com/driver-portal.html`
- **Restaurant Signup**: `https://paradise-delivery.onrender.com/restaurant-partners.html`
- **Admin**: `https://paradise-delivery.onrender.com/admin/index.html`
- **API Health**: `https://paradise-delivery.onrender.com/api/health`

---

## 🔄 Auto-Deploy

Render will automatically redeploy when you push changes to GitHub:

```bash
git add .
git commit -m "Updated homepage"
git push origin main
# Render automatically deploys the new version!
```

---

## 💰 Costs

**Free Plan:**
- 512 MB RAM
- 0.1 CPU
- 750 hours/month
- **Perfect for testing and launch!**

**When you need to upgrade:**
- Starter: $7/month (1 GB RAM, more reliable)
- Standard: $25/month (2 GB RAM, always on)

---

## 🆘 Troubleshooting

**"Build failed"**
- Check Render logs (Dashboard → Logs)
- Make sure `package.json` is in root
- Try running `npm install` locally first

**"Cannot find module"**
- Delete `node_modules` locally
- Run `npm install` again
- Commit `package-lock.json`

**Environment variables not working**
- Double-check spelling (case-sensitive)
- Restart service after adding env vars
- Check logs to confirm they're loaded

**Site shows "Not Found"**
- Make sure static files are being served
- Check server.js has correct static file path
- Verify HTML files are in root directory

---

## 📞 Still Need Help?

1. Check Render docs: https://render.com/docs
2. View logs in Render Dashboard
3. Ask me - paste any error messages here!

---

**Ready to deploy? Follow Option 1 or 2 above!** 🚀