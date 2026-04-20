const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getMyContributions
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook route (public but signature verified)
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);
router.get('/my-contributions', protect, getMyContributions);

module.exports = router;
