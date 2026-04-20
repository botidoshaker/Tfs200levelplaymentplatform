# Contribute Platform - Full Stack Crowdfunding Application

A full-stack crowdfunding/contribution platform inspired by kolekto.com.ng, built with React/Next.js frontend and Node.js/Express backend with secure Paystack payment integration.

## Features

### User Authentication
- Signup/Login with email, phone, and password
- JWT-based authentication
- Protected routes and user dashboard

### Contribution System
- Create contribution campaigns (title, description, target amount, deadline)
- Users can contribute money to campaigns
- Real-time tracking of total contributions
- Optional anonymous contributions
- Contributors list visibility toggle

### Secure Payment Integration (Paystack)
- **Webhook-based verification** - Payments are NOT marked successful on frontend
- Server-side transaction verification via Paystack API
- HMAC signature verification for webhooks
- Double-verification: webhook + API call to Paystack
- Pending transactions until confirmed by payment provider

### Security Features
- No frontend-only success triggers
- All transactions validated server-side
- JWT authentication for protected routes
- CORS configuration
- Environment variables for sensitive keys
- Webhook signature verification prevents fake payments

### Admin Panel
- View all campaigns and transactions
- Filter transactions by status
- Flag suspicious activity
- User management

## Tech Stack

### Frontend
- React 19 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Lucide React icons
- Paystack Inline JS

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Axios for API calls
- Crypto for webhook verification

## Project Structure

```
/workspace
├── src/                    # Frontend React code
│   ├── components/         # Reusable components
│   │   └── PaystackPayment.tsx
│   ├── context/            # React contexts
│   │   └── AuthContext.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── pages/              # Page components
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── server/                 # Backend Node.js code
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   │   ├── authController.ts
│   │   │   ├── campaignController.ts
│   │   │   └── paymentController.ts
│   │   ├── middleware/     # Express middleware
│   │   │   └── auth.ts
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Campaign.ts
│   │   │   └── Transaction.ts
│   │   ├── routes/         # Express routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── campaignRoutes.ts
│   │   │   └── paymentRoutes.ts
│   │   └── server.ts       # Express app entry
│   ├── config/
│   │   └── db.ts           # Database connection
│   └── package.json
└── package.json            # Frontend dependencies
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Paystack account (for payment processing)

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd /workspace
npm install

# Install backend dependencies
cd /workspace/server
npm install
```

### 2. Configure Environment Variables

**Backend (.env in /workspace/server/):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/contribute-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env in /workspace/):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath /data/db
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd /workspace/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /workspace
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign (protected)
- `PUT /api/campaigns/:id` - Update campaign (protected)
- `DELETE /api/campaigns/:id` - Delete campaign (protected)
- `GET /api/campaigns/my` - Get user's campaigns (protected)

### Payments
- `POST /api/payments/initialize` - Initialize payment (protected)
- `GET /api/payments/verify/:reference` - Verify payment (protected)
- `POST /api/payments/webhook` - Paystack webhook (signature verified)
- `GET /api/payments/campaign/:campaignId` - Get campaign transactions (protected)
- `GET /api/payments/my` - Get user's transactions (protected)
- `GET /api/payments` - Get all transactions (admin only)

## Payment Flow

1. User clicks "Contribute" on a campaign
2. Frontend calls `/api/payments/initialize` to create pending transaction
3. Backend creates transaction with status "pending" and gets Paystack URL
4. Frontend opens Paystack popup for payment
5. User completes payment on Paystack
6. Paystack sends webhook to `/api/payments/webhook`
7. Backend verifies webhook signature
8. Backend double-verifies with Paystack API
9. If successful: updates transaction to "completed" and adds to campaign total
10. Frontend polls `/api/payments/verify/:reference` to check status
11. User sees confirmation when payment is verified

## Security Notes

- **Never trust the frontend**: Payment success is only determined by webhook + server verification
- **Webhook signature verification**: Uses HMAC-SHA512 to verify webhook authenticity
- **Double verification**: Even after webhook, we call Paystack API to confirm
- **JWT tokens**: Stored in localStorage, sent with each protected request
- **Password hashing**: Uses bcrypt with salt rounds
- **CORS**: Configured to only allow requests from frontend URL

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Use production Paystack keys
4. Enable HTTPS
5. Use MongoDB Atlas or managed MongoDB
6. Set up webhook URL in Paystack dashboard
7. Configure proper CORS origins

## License

MIT
