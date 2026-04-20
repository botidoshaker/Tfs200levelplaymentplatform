import Campaign from '../models/Campaign.js';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Create Campaign
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { title, description, targetAmount, deadline, allowAnonymous, showContributors, category, imageUrl } = req.body;

    const campaign = await Campaign.create({
      title,
      description,
      targetAmount,
      deadline,
      allowAnonymous: allowAnonymous ?? true,
      showContributors: showContributors ?? true,
      category: category || 'general',
      imageUrl,
      hostId: (req as any).user._id,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get All Campaigns
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const { status, category, search } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('hostId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get Single Campaign
export const getCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let campaign;
    if (mongoose.Types.ObjectId.isValid(id)) {
      campaign = await Campaign.findById(id).populate('hostId', 'name email');
    } else {
      campaign = await Campaign.findOne({ slug: id }).populate('hostId', 'name email');
    }

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update Campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check ownership or admin
    if (campaign.hostId.toString() !== (req as any).user._id.toString() && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign',
      });
    }

    campaign = await Campaign.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Delete Campaign
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check ownership or admin
    if (campaign.hostId.toString() !== (req as any).user._id.toString() && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this campaign',
      });
    }

    await Campaign.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get User's Campaigns
export const getMyCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find({ hostId: (req as any).user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
