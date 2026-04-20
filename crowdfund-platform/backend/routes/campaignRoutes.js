const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getMyCampaigns
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getCampaigns)
  .post(protect, createCampaign);

router.get('/my-campaigns', protect, getMyCampaigns);

router.route('/:id')
  .get(getCampaign)
  .put(protect, updateCampaign)
  .delete(protect, deleteCampaign);

module.exports = router;
