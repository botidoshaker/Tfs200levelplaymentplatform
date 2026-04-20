# Crowdfunding Platform - Vercel Deployment Instructions

## Quick Start for Vercel Deployment

This guide will help you deploy the crowdfunding platform to Vercel with accessible payment links.

## Step 1: Prepare Your Repository

```bash
cd /workspace/crowdfund-platform
git init
git add .
git commit -m "Initial commit - crowdfunding platform"
```

Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/crowdfund-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (default)

5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.vercel.app
   ```
   (You'll get this URL after deploying the backend)

6. Click "Deploy"

## Step 3: Deploy Backend to Vercel

1. In Vercel, create another project (or use the same repo)
2. **Configure Project:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** (leave empty)

3. **Add Environment Variables:**
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/crowdfund
   JWT_SECRET = your-super-secret-jwt-key-min-32-chars
   PAYSTACK_SECRET_KEY = sk_test_xxxxxxxxxxxxxxxxxxxxx (or sk_live for production)
   PAYSTACK_PUBLIC_KEY = pk_test_xxxxxxxxxxxxxxxxxxxxx (or pk_live for production)
   FRONTEND_URL = https://your-frontend-url.vercel.app
   NODE_ENV = production
   ```

4. Click "Deploy"

## Step 4: Configure Paystack Webhook

### For Production:

1. Get your backend URL from Vercel (e.g., `https://crowdfund-backend.vercel.app`)
2. Go to [Paystack Dashboard](https://dashboard.paystack.com)
3. Navigate to **Settings** → **API Keys & Webhooks**
4. Under **Webhook URLs**, add:
   ```
   https://your-backend-url.vercel.app/api/payments/webhook
   ```
5. Copy the **Webhook Secret** and add it to your backend environment variables as `PAYSTACK_WEBHOOK_SECRET`

### For Local Testing:

1. Install ngrok: `npm install -g ngrok`
2. Start your backend locally: `cd backend && npm run dev`
3. Run ngrok: `ngrok http 5000`
4. Use the ngrok URL as webhook: `https://xxxx-xxxx.ngrok.io/api/payments/webhook`

## Step 5: Update Frontend API URL

After backend deployment:
1. Go to Vercel → Frontend Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your backend URL
3. Redeploy the frontend

## Payment Flow

1. User clicks "Contribute Now" on a campaign
2. Frontend calls `/api/payments/initialize` on backend
3. Backend creates pending transaction and gets Paystack authorization URL
4. User is redirected to Paystack payment page (secure, hosted by Paystack)
5. User completes payment on Paystack
6. Paystack redirects user back to `/payment/callback?reference=xxx`
7. Frontend calls `/api/payments/verify/:reference` to check status
8. **Backend verifies with Paystack API** (server-side verification)
9. Paystack sends webhook to `/api/payments/webhook` (async confirmation)
10. Backend updates transaction status and campaign total only after verification

## Important Security Notes

✅ **Payment links are accessible** - Users are redirected to Paystack's secure payment page
✅ **No frontend payment success** - Success is determined ONLY by backend verification
✅ **Webhook verification** - All webhook requests are signature-verified
✅ **Server-side validation** - Transaction amounts and status verified via Paystack API

## Environment Variables Summary

### Frontend (.env.local / Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

### Backend (.env / Vercel)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-min-32-characters-long
PAYSTACK_SECRET_KEY=sk_test_xxx or sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx or pk_live_xxx
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=5000
```

## MongoDB Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for Vercel access
5. Get connection string
6. Replace `<password>` with your user password
7. Add to backend environment variables

## Testing the Deployment

1. **Create Account**: Sign up at your frontend URL
2. **Create Campaign**: Create a test campaign
3. **Make Contribution**: 
   - Click "Contribute Now"
   - Enter amount
   - You'll be redirected to Paystack
   - Complete test payment
   - Return to your site
4. **Verify**: Check dashboard for updated contribution total

## Troubleshooting

### Payment Link Not Working
- Ensure `FRONTEND_URL` in backend matches your actual frontend URL
- Check that `NEXT_PUBLIC_API_URL` in frontend points to backend
- Verify Paystack keys are correct (test vs live)

### Webhook Not Receiving Events
- Check webhook URL is publicly accessible (not localhost)
- Verify webhook secret is configured
- Check Vercel function logs for errors

### CORS Errors
- Update `FRONTEND_URL` in backend environment
- Ensure backend CORS configuration allows your frontend domain

## URLs After Deployment

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-backend.vercel.app/api`
- **Payment Initialize**: `https://your-backend.vercel.app/api/payments/initialize`
- **Payment Callback**: `https://your-project.vercel.app/payment/callback`
- **Webhook Endpoint**: `https://your-backend.vercel.app/api/payments/webhook`

## Support

For issues:
1. Check Vercel Function Logs
2. Review MongoDB connection
3. Verify Paystack dashboard for transaction status
4. Test webhook endpoint using Paystack's "Test Webhook" feature
