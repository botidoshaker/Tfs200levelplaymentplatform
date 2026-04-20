const axios = require('axios');
const Campaign = require('../models/Campaign');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { generateReference, validatePaystackSignature } = require('../middleware/payment');

// @desc    Initialize a payment
// @route   POST /api/payments/initialize
// @access  Private
const initializePayment = async (req, res) => {
  try {
    const { campaignId, amount, email, anonymous = false } = req.body;

    // Validate required fields
    if (!campaignId || !amount || !email) {
      return res.status(400).json({ message: 'Please provide campaign ID, amount, and email' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ message: 'This campaign is no longer accepting contributions' });
    }

    // Generate unique reference
    const reference = generateReference();

    // Create pending transaction
    const transaction = await Transaction.create({
      reference,
      campaign: campaignId,
      user: req.user._id,
      amount,
      status: 'pending'
    });

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference,
        currency: 'NGN',
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: {
          custom_fields: [
                {
                    display_name: "Campaign ID",
                    variable_name: "campaign_id",
                    value: campaignId
                },
                {
                    display_name: "User ID",
                    variable_name: "user_id",
                    value: req.user._id.toString()
                },
                {
                    display_name: "Anonymous",
                    variable_name: "anonymous",
                    value: anonymous.toString()
                }
            ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!paystackResponse.data.status) {
      throw new Error('Failed to initialize payment with Paystack');
    }

    res.json({
      message: 'Payment initialized successfully',
      data: {
        authorizationUrl: paystackResponse.data.data.authorization_url,
        accessCode: paystackResponse.data.data.access_code,
        reference: reference,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    console.error('Initialize payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to initialize payment',
      error: error.response?.data?.message || error.message
    });
  }
};

// @desc    Verify payment (manual verification endpoint)
// @route   GET /api/payments/verify/:reference
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const transaction = await Transaction.findOne({ reference })
      .populate('campaign')
      .populate('user');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // If already completed, return immediately
    if (transaction.status === 'completed') {
      return res.json({
        message: 'Payment already verified',
        data: transaction
      });
    }

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (!paystackResponse.data.status) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const paystackData = paystackResponse.data.data;

    if (paystackData.status === 'success') {
      // Update transaction status
      transaction.status = 'completed';
      transaction.verifiedAt = Date.now();
      transaction.paystackData = {
        authorizationCode: paystackData.authorization_code,
        last4: paystackData.last4,
        bank: paystackData.bank,
        cardType: paystackData.card_type,
        channel: paystackData.channel
      };
      await transaction.save();

      // Update campaign total
      const campaign = await Campaign.findById(transaction.campaign._id);
      campaign.currentAmount += transaction.amount;
      
      // Add contributor to campaign
      const metadata = paystackData.metadata?.custom_fields || [];
      const anonymousField = metadata.find(f => f.variable_name === 'anonymous');
      const isAnonymous = anonymousField ? anonymousField.value === 'true' : false;

      campaign.contributors.push({
        user: transaction.user._id,
        amount: transaction.amount,
        name: transaction.user.name,
        anonymous: isAnonymous,
        date: Date.now()
      });

      // Check if target reached
      if (campaign.currentAmount >= campaign.targetAmount) {
        campaign.status = 'completed';
      }

      await campaign.save();

      // Create notification for campaign creator
      await Notification.create({
        user: campaign.creator,
        title: 'New Contribution Received',
        message: `Your campaign "${campaign.title}" received a contribution of ₦${transaction.amount.toLocaleString()}`,
        type: 'contribution',
        campaign: campaign._id,
        transaction: transaction._id
      });

      res.json({
        message: 'Payment verified successfully',
        data: transaction
      });
    } else {
      res.status(400).json({
        message: 'Payment not successful',
        data: { status: paystackData.status }
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Payment verification failed',
      error: error.response?.data?.message || error.message
    });
  }
};

// @desc    Handle Paystack webhook
// @route   POST /api/payments/webhook
// @access  Public (but signature verified)
const handleWebhook = async (req, res) => {
  try {
    // Validate Paystack signature
    const isValidSignature = validatePaystackSignature(req);
    
    if (!isValidSignature) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const data = req.body.data;

    console.log(`Webhook received: ${event}`);

    // Only process charge.success events
    if (event !== 'charge.success') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const reference = data.reference;

    // Find the transaction
    const transaction = await Transaction.findOne({ reference })
      .populate('campaign')
      .populate('user');

    if (!transaction) {
      console.error(`Transaction not found for reference: ${reference}`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // If already completed, ignore (prevent double processing)
    if (transaction.status === 'completed') {
      console.log(`Transaction ${reference} already completed`);
      return res.status(200).json({ message: 'Already processed' });
    }

    // Server-side verification - CRITICAL SECURITY STEP
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (!paystackResponse.data.status) {
      console.error(`Paystack verification failed for ${reference}`);
      transaction.status = 'failed';
      await transaction.save();
      return res.status(400).json({ message: 'Verification failed' });
    }

    const paystackData = paystackResponse.data.data;

    // Verify amount matches
    const expectedAmount = transaction.amount * 100; // Convert to kobo
    if (paystackData.amount !== expectedAmount) {
      console.error(`Amount mismatch for ${reference}: expected ${expectedAmount}, got ${paystackData.amount}`);
      transaction.status = 'failed';
      await transaction.save();
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    // Process successful payment
    if (paystackData.status === 'success') {
      transaction.status = 'completed';
      transaction.verifiedAt = Date.now();
      transaction.webhookAttempts += 1;
      transaction.paystackData = {
        authorizationCode: paystackData.authorization_code,
        last4: paystackData.last4,
        bank: paystackData.bank,
        cardType: paystackData.card_type,
        channel: paystackData.channel
      };
      await transaction.save();

      // Update campaign
      const campaign = await Campaign.findById(transaction.campaign._id);
      campaign.currentAmount += transaction.amount;

      // Get anonymous preference from initial transaction or metadata
      const metadata = paystackData.metadata?.custom_fields || [];
      const anonymousField = metadata.find(f => f.variable_name === 'anonymous');
      const isAnonymous = anonymousField ? anonymousField.value === 'true' : false;

      campaign.contributors.push({
        user: transaction.user._id,
        amount: transaction.amount,
        name: transaction.user.name,
        anonymous: isAnonymous,
        date: Date.now()
      });

      // Check if target reached
      if (campaign.currentAmount >= campaign.targetAmount) {
        campaign.status = 'completed';
      }

      await campaign.save();

      // Create notification
      await Notification.create({
        user: campaign.creator,
        title: 'New Contribution Received',
        message: `Your campaign "${campaign.title}" received a contribution of ₦${transaction.amount.toLocaleString()}`,
        type: 'contribution',
        campaign: campaign._id,
        transaction: transaction._id
      });

      console.log(`Payment ${reference} processed successfully`);
      res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      transaction.status = 'failed';
      transaction.webhookAttempts += 1;
      await transaction.save();
      res.status(200).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Webhook processing error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// @desc    Get user's contribution history
// @route   GET /api/payments/my-contributions
// @access  Private
const getMyContributions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('campaign', 'title imageUrl status')
      .sort({ createdAt: -1 });

    res.json({ data: transactions });
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ message: 'Server error fetching contributions' });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getMyContributions
};
