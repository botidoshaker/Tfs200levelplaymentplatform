import { Router } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getMyCampaigns,
} from '../controllers/campaignController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(getCampaigns)
  .post(protect, createCampaign);

router.get('/my', protect, getMyCampaigns);

router.route('/:id')
  .get(getCampaign)
  .put(protect, updateCampaign)
  .delete(protect, deleteCampaign);

export default router;
