import { Router } from 'express';
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getCampaignTransactions,
  getMyTransactions,
  getAllTransactions,
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

// Webhook route (no auth required, uses signature verification)
router.post('/webhook', handleWebhook);

// Payment routes
router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);

// Transaction queries
router.get('/campaign/:campaignId', protect, getCampaignTransactions);
router.get('/my', protect, getMyTransactions);
router.get('/', protect, admin, getAllTransactions);

export default router;
