const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllCampaigns,
  getAllTransactions,
  flagCampaign,
  getAllUsers
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes are protected and require admin role
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/campaigns', getAllCampaigns);
router.get('/transactions', getAllTransactions);
router.get('/users', getAllUsers);
router.put('/campaigns/:id/flag', flagCampaign);

module.exports = router;
