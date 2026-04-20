import Transaction from '../models/Transaction.js';
import Campaign from '../models/Campaign.js';
import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';

// Initialize Payment (Create pending transaction)
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { campaignId, amount, contributorName, contributorEmail, isAnonymous, message } = req.body;

    // Validate campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check campaign status
    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This campaign is not accepting contributions',
      });
    }

    // Generate unique reference
    const reference = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create pending transaction
    const transaction = await Transaction.create({
      campaignId,
      userId: (req as any).user._id,
      amount,
      currency: 'NGN',
      reference,
      status: 'pending',
      paymentMethod: 'card',
      contributorName,
      contributorEmail,
      isAnonymous: isAnonymous ?? false,
      message,
    });

    // Get Paystack initialization URL
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: contributorEmail,
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        reference,
        metadata: {
          campaignId: campaignId.toString(),
          userId: (req as any).user._id.toString(),
          contributorName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.data.authorization_url,
        accessCode: paystackResponse.data.data.access_code,
        reference: transaction.reference,
        transactionId: transaction._id,
      },
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to initialize payment',
    });
  }
};

// Verify Payment (Manual verification endpoint)
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const transaction = await Transaction.findOne({ reference }).populate('campaignId');
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // If already verified, return current status
    if (transaction.status === 'completed' || transaction.status === 'failed') {
      return res.json({
        success: true,
        data: transaction,
      });
    }

    // Verify with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackData = response.data.data;

    if (paystackData.status === 'success') {
      // Update transaction
      transaction.status = 'completed';
      transaction.verifiedAt = new Date();
      transaction.paystackReference = paystackData.reference;
      transaction.paymentMethod = paystackData.channel || 'card';
      await transaction.save();

      // Update campaign total
      const campaign = await Campaign.findById(transaction.campaignId);
      if (campaign) {
        campaign.currentAmount += transaction.amount;
        
        // Check if target reached
        if (campaign.currentAmount >= campaign.targetAmount) {
          campaign.status = 'completed';
        }
        
        await campaign.save();
      }
    } else if (paystackData.status === 'failed' || paystackData.status === 'abandoned') {
      transaction.status = 'failed';
      await transaction.save();
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
};

// Webhook Handler - CRITICAL FOR SECURITY
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // Get the hash from header
    const hash = req.headers['x-paystack-signature'] as string;
    
    if (!hash) {
      return res.status(400).json({
        success: false,
        message: 'No signature provided',
      });
    }

    // Get raw body for hash verification
    const rawBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const computedHash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(rawBody)
      .digest('hex');

    if (computedHash !== hash) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    const event = req.body;
    console.log('Webhook received:', event.event);

    // Handle different events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulCharge(event.data);
        break;
      case 'charge.failed':
        await handleFailedCharge(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.event);
    }

    res.json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

// Handle successful charge
const handleSuccessfulCharge = async (data: any) => {
  try {
    const reference = data.reference;
    
    // Find transaction by reference
    const transaction = await Transaction.findOne({ 
      $or: [{ reference }, { paystackReference: reference }] 
    }).populate('campaignId');

    if (!transaction) {
      console.warn('Transaction not found for reference:', reference);
      return;
    }

    // Skip if already completed
    if (transaction.status === 'completed') {
      console.log('Transaction already completed:', reference);
      return;
    }

    // Double verify with Paystack API
    const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = verifyResponse.data.data;

    if (verifyData.status === 'success') {
      // Update transaction
      transaction.status = 'completed';
      transaction.verifiedAt = new Date();
      transaction.paystackReference = reference;
      transaction.paymentMethod = data.channel || verifyData.channel || 'card';
      transaction.metadata = {
        ...transaction.metadata,
        paystackData: verifyData,
      };
      await transaction.save();

      // Update campaign total
      const campaign = await Campaign.findById(transaction.campaignId);
      if (campaign) {
        campaign.currentAmount += transaction.amount;
        
        // Check if target reached
        if (campaign.currentAmount >= campaign.targetAmount) {
          campaign.status = 'completed';
        }
        
        await campaign.save();
        
        console.log(`Campaign ${campaign._id} updated. New total: ${campaign.currentAmount}`);
      }

      console.log(`Transaction ${reference} marked as completed`);
    } else {
      console.warn('Paystack verification returned non-success status:', verifyData.status);
      transaction.status = 'failed';
      await transaction.save();
    }
  } catch (error: any) {
    console.error('Error handling successful charge:', error);
    throw error;
  }
};

// Handle failed charge
const handleFailedCharge = async (data: any) => {
  try {
    const reference = data.reference;
    
    const transaction = await Transaction.findOne({ 
      $or: [{ reference }, { paystackReference: reference }] 
    });

    if (transaction && transaction.status === 'pending') {
      transaction.status = 'failed';
      transaction.metadata = {
        ...transaction.metadata,
        failureReason: data.failure_message || 'Payment failed',
      };
      await transaction.save();
      
      console.log(`Transaction ${reference} marked as failed`);
    }
  } catch (error: any) {
    console.error('Error handling failed charge:', error);
    throw error;
  }
};

// Get Campaign Transactions
export const getCampaignTransactions = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.query;

    const query: any = { campaignId };
    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .select('-metadata') // Exclude sensitive metadata
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get User's Transactions
export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: (req as any).user._id })
      .populate('campaignId', 'title slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Admin: Get All Transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('campaignId', 'title')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
