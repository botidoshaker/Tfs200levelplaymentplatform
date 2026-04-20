export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  token?: string;
}

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  hostId: string | { _id: string; name: string; email: string };
  status: 'active' | 'completed' | 'expired' | 'paused';
  allowAnonymous: boolean;
  showContributors: boolean;
  category: string;
  imageUrl?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  campaignId: string | { _id: string; title: string; slug: string };
  userId: string | { _id: string; name: string; email: string };
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
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  transactionId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}
