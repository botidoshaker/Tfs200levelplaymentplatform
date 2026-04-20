# Crowdfunding Platform - Deployment Guide

## Overview
This is a full-stack crowdfunding platform with secure payment verification using Paystack.

## Project Structure
```
crowdfund-platform/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/
│   │   ├── context/
│   │   └── ...
│   ├── .env.local
│   └── package.json
├── backend/           # Express.js API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── .env.example
│   └── package.json
└── vercel.json        # Vercel configuration
```

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud like MongoDB Atlas)
- Paystack account for payment processing

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crowdfund-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=https://your-domain.com
NODE_ENV=production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Local Development

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Setup Environment Variables
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your backend URL
```

### 3. Start Development Servers
```bash
# From root directory
npm run dev

# Or start separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Deployment to Vercel

### Frontend Deployment (Vercel)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/crowdfund-platform.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set the Root Directory to `frontend`
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://api.yourdomain.com`)
   - Deploy

### Backend Deployment Options

#### Option A: Deploy Backend on Vercel (Serverless)
1. Create `api/` folder in root or configure backend for serverless
2. Update `vercel.json` for backend routes
3. Deploy as separate Vercel project

#### Option B: Deploy Backend on Railway/Render/Heroku
1. Push backend to a separate repository or use monorepo
2. Connect to Railway/Render/Heroku
3. Set environment variables
4. Deploy

#### Option C: Deploy on VPS (DigitalOcean, AWS, etc.)
1. Set up Node.js server
2. Clone repository
3. Install dependencies
4. Configure PM2 for process management
5. Set up Nginx as reverse proxy
6. Configure SSL with Let's Encrypt

## Payment Webhook Setup

### Configuring Paystack Webhook

1. **Get your backend URL**
   - Local: Use ngrok for testing: `ngrok http 5000`
   - Production: `https://your-backend-url.com`

2. **Set webhook URL in Paystack Dashboard**
   - Go to Paystack Dashboard → Settings → API Keys & Webhooks
   - Add webhook URL: `https://your-backend-url.com/api/payments/webhook`
   - Save

3. **Test webhook locally with ngrok**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Start your backend
   cd backend && npm run dev
   
   # In another terminal
   ngrok http 5000
   
   # Use the ngrok URL as your webhook endpoint
   ```

## Security Considerations

1. **Payment Verification**: All payments are verified server-side via Paystack API
2. **Webhook Signature**: Webhook requests are validated using Paystack secret hash
3. **JWT Authentication**: User sessions are protected with JWT tokens
4. **Environment Variables**: Never commit `.env` files to version control
5. **HTTPS**: Always use HTTPS in production

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign (auth required)
- `PUT /api/campaigns/:id` - Update campaign (owner only)
- `DELETE /api/campaigns/:id` - Delete campaign (owner only)
- `GET /api/campaigns/my-campaigns` - Get user's campaigns

### Payments
- `POST /api/payments/initialize` - Initialize payment (auth required)
- `GET /api/payments/verify/:reference` - Verify payment
- `POST /api/payments/webhook` - Paystack webhook handler
- `GET /api/payments/my-contributions` - Get user's contributions

### Admin
- `GET /api/admin/campaigns` - Get all campaigns
- `GET /api/admin/transactions` - Get all transactions

## Troubleshooting

### Payment Not Verifying
1. Check webhook URL is correctly set in Paystack dashboard
2. Verify webhook endpoint is publicly accessible
3. Check backend logs for webhook events
4. Ensure PAYSTACK_SECRET_KEY is correct

### CORS Errors
1. Update `FRONTEND_URL` in backend .env
2. Check CORS configuration in `server.js`

### Database Connection Issues
1. Verify MongoDB URI is correct
2. Check MongoDB is running and accessible
3. For MongoDB Atlas, whitelist your IP address

## Support

For issues or questions:
- Check backend logs: `cd backend && npm run dev`
- Check browser console for frontend errors
- Review Paystack dashboard for transaction details
