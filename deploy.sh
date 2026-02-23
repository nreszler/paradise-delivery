#!/bin/bash
# Paradise Delivery - Deployment Script
# Usage: ./deploy.sh

echo "🚀 Paradise Delivery Deployment Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Are you in the paradise-delivery directory?"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check Node.js
echo "Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Found: $(node --version)"
    exit 1
fi

print_status "Node.js $(node --version) detected"

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Check .env file
echo ""
echo "Step 3: Checking environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env file with your actual API keys before starting the server"
    else
        print_error ".env file not found and no .env.example template available"
        exit 1
    fi
else
    print_status ".env file found"
fi

# Step 4: Initialize database
echo ""
echo "Step 4: Initializing database..."
node scripts/init-db.js

if [ $? -eq 0 ]; then
    print_status "Database initialized"
else
    print_warning "Database initialization had warnings (this is OK if database already exists)"
fi

# Step 5: Test Stripe configuration
echo ""
echo "Step 5: Testing Stripe configuration..."
node -e "
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
stripe.accounts.retrieve()
  .then(account => {
    console.log('✓ Stripe connection successful');
    console.log('  Account ID:', account.id);
    console.log('  Charges enabled:', account.charges_enabled);
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Stripe connection failed:', err.message);
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
    print_warning "Stripe configuration test failed. Check your STRIPE_SECRET_KEY in .env"
fi

# Step 6: Build file list
echo ""
echo "Step 6: Files ready for deployment..."
echo ""
echo "HTML Files:"
ls -1 *.html 2>/dev/null | while read file; do
    echo "  - $file"
done

echo ""
echo "Backend Files:"
echo "  - server.js"
echo "  - package.json"
echo "  - routes/*.js"
echo "  - database/schema.sql"

echo ""
echo "Total files to deploy:"
find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.sql" -o -name ".env" \) ! -path "./node_modules/*" ! -path "./.git/*" | wc -l

# Step 7: Start server locally (optional)
echo ""
echo "======================================"
echo ""
echo "Deployment preparation complete!"
echo ""
echo "To start the server locally, run:"
echo "  npm start"
echo ""
echo "To deploy to Render/Railway:"
echo "  1. Push to GitHub: git push origin main"
echo "  2. Connect your repo on Render or Railway"
echo "  3. Set environment variables in dashboard"
echo "  4. Deploy!"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""

# Ask if user wants to start server
read -p "Start the server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting Paradise Delivery server..."
    npm start
fi