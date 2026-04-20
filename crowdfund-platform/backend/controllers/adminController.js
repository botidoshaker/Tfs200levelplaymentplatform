const Campaign = require('../models/Campaign');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const completedCampaigns = await Campaign.countDocuments({ status: 'completed' });
    const totalContributions = await Transaction.countDocuments({ status: 'completed' });
    const totalAmountRaised = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const totalUsers = await User.countDocuments();

    res.json({
      data: {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalContributions,
        totalAmountRaised: totalAmountRaised[0]?.total || 0,
        pendingTransactions,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// @desc    Get all campaigns (admin view)
// @route   GET /api/admin/campaigns
// @access  Private/Admin
const getAllCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const campaigns = await Campaign.find(query)
      .populate('creator', 'name email phone')
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
    console.error('Get all campaigns error:', error);
    res.status(500).json({ message: 'Server error fetching campaigns' });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('campaign', 'title')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.json({
      data: transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// @desc    Flag a campaign as suspicious
// @route   PUT /api/admin/campaigns/:id/flag
// @access  Private/Admin
const flagCampaign = async (req, res) => {
  try {
    const { reason } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Add flag to campaign (you might want to create a separate Flag model)
    campaign.status = 'expired'; // Temporarily disable the campaign
    campaign.flagged = true;
    campaign.flagReason = reason;
    campaign.flaggedAt = Date.now();
    
    await campaign.save();

    res.json({
      message: 'Campaign flagged successfully',
      data: campaign
    });
  } catch (error) {
    console.error('Flag campaign error:', error);
    res.status(500).json({ message: 'Server error flagging campaign' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments();

    res.json({
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

module.exports = {
  getDashboardStats,
  getAllCampaigns,
  getAllTransactions,
  flagCampaign,
  getAllUsers
};
