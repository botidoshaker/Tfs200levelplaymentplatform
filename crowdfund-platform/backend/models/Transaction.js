const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'ussd', 'mobile_money'],
    default: 'card'
  },
  paystackData: {
    authorizationCode: String,
    last4: String,
    bank: String,
    cardType: String,
    channel: String
  },
  webhookAttempts: {
    type: Number,
    default: 0
  },
  verifiedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries on pending transactions
transactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
