# Paradise Delivery - Quick Deploy
# Run these commands in order

Write-Host "🚀 Paradise Delivery - Quick Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if git is installed
Write-Host "Step 1: Checking Git..." -ForegroundColor Yellow
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   https://git-scm.com/download/win"
    exit 1
}
Write-Host "✓ Git found" -ForegroundColor Green

# Step 2: Check if we're in the right directory
Write-Host ""
Write-Host "Step 2: Checking directory..." -ForegroundColor Yellow
if (!(Test-Path "server.js")) {
    Write-Host "❌ Error: server.js not found. Run this script from the paradise-delivery folder." -ForegroundColor Red
    exit 1
}
Write-Host "✓ In correct directory" -ForegroundColor Green

# Step 3: Initialize git if not already
Write-Host ""
Write-Host "Step 3: Setting up Git..." -ForegroundColor Yellow
if (!(Test-Path ".git")) {
    git init
    Write-Host "✓ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git already initialized" -ForegroundColor Green
}

# Step 4: Create .gitignore
Write-Host ""
Write-Host "Step 4: Creating .gitignore..." -ForegroundColor Yellow
$gitignore = @"
node_modules/
database/paradise.db
.env
*.log
.DS_Store
.vscode/
.idea/
"@
$gitignore | Out-File -FilePath ".gitignore" -Encoding UTF8 -Force
Write-Host "✓ .gitignore created" -ForegroundColor Green

# Step 5: Add all files
Write-Host ""
Write-Host "Step 5: Staging files..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files staged" -ForegroundColor Green

# Step 6: Commit
Write-Host ""
Write-Host "Step 6: Committing changes..." -ForegroundColor Yellow
git commit -m "Initial commit - Paradise Delivery ready for deployment"
Write-Host "✓ Changes committed" -ForegroundColor Green

# Step 7: Instructions for GitHub
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ LOCAL SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS (Choose one):" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Deploy to Render (EASIEST - 5 minutes)" -ForegroundColor Cyan
Write-Host "----------------------------------------------"
Write-Host "1. Go to https://github.com/new"
Write-Host "2. Create a new repository named 'paradise-delivery'"
Write-Host "3. Copy the repository URL (https://github.com/YOUR_USERNAME/paradise-delivery.git)"
Write-Host "4. Run these commands:"
Write-Host ""
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/paradise-delivery.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "5. Go to https://render.com"
Write-Host "6. Sign up with GitHub"
Write-Host "7. Click 'New Web Service'"
Write-Host "8. Connect your GitHub repo"
Write-Host "9. Add environment variables in dashboard:"
Write-Host "   STRIPE_SECRET_KEY=sk_test_51T3uJg..."
Write-Host "   STRIPE_PUBLISHABLE_KEY=pk_test_51T3uJg..."
Write-Host "   JWT_SECRET=your-secret-here"
Write-Host "   NODE_ENV=production"
Write-Host "10. Click 'Create Web Service'"
Write-Host ""
Write-Host "Your site will be live at: https://paradise-delivery.onrender.com"
Write-Host ""
Write-Host "Option 2: Deploy to Netlify (FREE - 2 minutes)" -ForegroundColor Cyan
Write-Host "----------------------------------------------"
Write-Host "For frontend only (HTML files, no backend):"
Write-Host "1. Go to https://app.netlify.com/drop"
Write-Host "2. Drag and drop this folder"
Write-Host "3. Site is live instantly!"
Write-Host ""
Write-Host "⚠️  Note: Netlify only hosts frontend. Backend/API won't work."
Write-Host ""
Write-Host "Option 3: Traditional FTP Upload" -ForegroundColor Cyan
Write-Host "----------------------------------------------"
Write-Host "If you have existing hosting:"
Write-Host "1. Zip these files (excluding node_modules):"
Write-Host "   - All .html files"
Write-Host "   - All .js files"
Write-Host "   - package.json"
Write-Host "   - .env file"
Write-Host "2. Upload via FTP to your host"
Write-Host "3. Run: npm install && npm start"
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Full instructions in: DEPLOYMENT.md" -ForegroundColor Gray
Write-Host ""
Write-Host "❓ Need help? Copy any error messages and paste them here." -ForegroundColor Yellow