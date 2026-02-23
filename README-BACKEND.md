# Paradise Delivery - Backend

Complete backend API for Paradise Delivery food delivery platform.

## 🚀 Features

### Customer Features
- User registration and authentication
- Browse restaurants and menus
- Place orders with distance-based delivery fees
- Track order status in real-time
- Secure payment processing (Stripe)

### Driver Features
- Complete onboarding workflow
- Document upload and verification
- Background check integration
- Prop 22 compliance tracking
- Real-time earnings dashboard
- GPS location tracking

### Restaurant Features
- Partner application system
- Menu management
- Order management dashboard
- Weekly payout tracking

### Admin Features
- Driver approval workflow
- Restaurant management
- Order monitoring
- Financial reporting
- Prop 22 compliance reports

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** SQLite3 (upgrade to PostgreSQL for production)
- **Authentication:** JWT
- **Payments:** Stripe
- **Maps:** Google Maps API
- **Email:** Nodemailer

## 📁 Project Structure

```
paradise-delivery/
├── server.js                 # Main server entry
├── package.json              # Dependencies
├── .env.example              # Environment template
├── database/
│   ├── schema.sql           # Database schema
│   └── paradise.db          # SQLite database (created on init)
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management
│   ├── drivers.js           # Driver onboarding & management
│   ├── restaurants.js       # Restaurant management
│   ├── menu.js              # Menu management
│   ├── orders.js            # Order processing
│   ├── payments.js          # Stripe payment handling
│   └── admin.js             # Admin dashboard API
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Error handling
│   └── validate.js          # Input validation
├── utils/
│   ├── distance.js          # Distance calculation
│   ├── earnings.js          # Driver earnings calculator
│   └── prop22.js            # Prop 22 compliance
└── scripts/
    ├── migrate.js           # Database migrations
    └── seed.js              # Seed data
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd paradise-delivery
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

### 3. Initialize Database

```bash
npm run migrate
npm run seed
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Drivers
- `POST /api/drivers/apply` - Submit driver application
- `POST /api/drivers/:id/documents` - Upload documents
- `GET /api/drivers/:id/status` - Check onboarding status
- `POST /api/drivers/:id/banking` - Add banking info
- `GET /api/drivers` - List all drivers (admin)
- `POST /api/drivers/:id/approve` - Approve driver (admin)
- `POST /api/drivers/:id/reject` - Reject driver (admin)

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/customer/:id` - Get customer orders
- `GET /api/orders/restaurant/:id` - Get restaurant orders
- `GET /api/orders/available/driver` - Get available orders
- `POST /api/orders/:id/assign-driver` - Assign driver
- `POST /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order

### Restaurants
- `POST /api/restaurants/apply` - Submit restaurant application
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant
- `GET /api/restaurants/:id/menu` - Get restaurant menu

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/receipts/:orderId` - Get receipt

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 3000) |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |
| `SMTP_USER` | Email username | Yes |
| `SMTP_PASS` | Email password | Yes |

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Prop 22 Compliance

The backend automatically tracks and calculates:

- **Engaged Time:** Time from order acceptance to delivery
- **Engaged Miles:** Miles driven during deliveries
- **Earnings Guarantee:** 120% of minimum wage calculation
- **Mileage Reimbursement:** $0.60/mile (above $0.36 minimum)
- **Weekly True-Up:** Automatic adjustment if earnings fall below guarantee
- **Healthcare Subsidy:** Eligibility tracking for 15+ hour drivers

## 🚀 Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name "paradise-delivery"
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 📝 Database Schema

See `database/schema.sql` for complete schema.

Key tables:
- `users` - All user accounts (customers, drivers, admins)
- `driver_profiles` - Driver-specific data
- `restaurants` - Restaurant partner data
- `orders` - Order information
- `driver_earnings` - Driver payment records
- `prop22_tracking` - Prop 22 compliance data

## 🐛 Troubleshooting

### Database locked errors
```bash
# Close all connections and retry
sqlite3 database/paradise.db ".clone database/paradise_backup.db"
```

### Port already in use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

## 📄 License

Private - Paradise Delivery LLC

## 🤝 Support

For support, email buttefrontdesk@outlook.com or call (530) 783-7148.