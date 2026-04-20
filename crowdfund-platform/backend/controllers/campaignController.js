const Campaign = require('../models/Campaign');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
const getCampaigns = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const campaigns = await Campaign.find(query)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Campaign.countDocuments(query);

    res.json({
      data: campaigns,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Server error fetching campaigns' });
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Public
const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('contributors.user', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check expiration
    campaign.checkExpiration();

    res.json({ data: campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ message: 'Server error fetching campaign' });
  }
};

// @desc    Create a campaign
// @route   POST /api/campaigns
// @access  Private
const createCampaign = async (req, res) => {
  try {
    const { title, description, targetAmount, deadline, category, imageUrl } = req.body;

    // Validate required fields
    if (!title || !description || !targetAmount || !deadline) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate deadline is in the future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ message: 'Deadline must be in the future' });
    }

    const campaign = await Campaign.create({
      title,
      description,
      targetAmount,
      deadline,
      category: category || 'General',
      imageUrl: imageUrl || '',
      creator: req.user._id
    });

    res.status(201).json({
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Server error creating campaign' });
  }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Creator only)
const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user is the creator
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this campaign' });
    }

    const { title, description, targetAmount, deadline, category, imageUrl } = req.body;

    campaign.title = title || campaign.title;
    campaign.description = description || campaign.description;
    campaign.targetAmount = targetAmount !== undefined ? targetAmount : campaign.targetAmount;
    campaign.deadline = deadline || campaign.deadline;
    campaign.category = category || campaign.category;
    campaign.imageUrl = imageUrl !== undefined ? imageUrl : campaign.imageUrl;

    await campaign.save();

    res.json({
      message: 'Campaign updated successfully',
      data: campaign
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ message: 'Server error updating campaign' });
  }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Creator or Admin only)
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user is the creator or admin
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this campaign' });
    }

    await campaign.deleteOne();

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ message: 'Server error deleting campaign' });
  }
};

// @desc    Get campaigns by current user
// @route   GET /api/campaigns/my/campaigns
// @access  Private
const getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creator: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ data: campaigns });
  } catch (error) {
    console.error('Get my campaigns error:', error);
    res.status(500).json({ message: 'Server error fetching your campaigns' });
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getMyCampaigns
};
