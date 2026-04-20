import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  hostId: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'expired' | 'paused';
  allowAnonymous: boolean;
  showContributors: boolean;
  category: string;
  imageUrl?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'paused'],
      default: 'active',
    },
    allowAnonymous: {
      type: Boolean,
      default: true,
    },
    showContributors: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: 'general',
    },
    imageUrl: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
campaignSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

export default Campaign;
