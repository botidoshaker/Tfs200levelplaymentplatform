import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  campaignId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  reference: string;
  paystackReference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  contributorName?: string;
  contributorEmail: string;
  isAnonymous: boolean;
  message?: string;
  verifiedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    paystackReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      default: 'card',
    },
    contributorName: {
      type: String,
    },
    contributorEmail: {
      type: String,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ campaignId: 1, status: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ paystackReference: 1 });

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
