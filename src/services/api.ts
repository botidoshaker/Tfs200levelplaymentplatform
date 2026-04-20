import { ApiResponse, User, Campaign, Transaction, PaymentInitResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = (): string | null => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, phone: string, password: string) => {
    const response = await apiFetch<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiFetch<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  },

  getMe: async () => {
    const response = await apiFetch<User>('/auth/me');
    return response.data;
  },
};

// Campaigns API
export const campaignsAPI = {
  getAll: async (params?: { status?: string; category?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiFetch<Campaign[]>(`/campaigns${query}`);
    return { data: response.data, count: response.count };
  },

  getById: async (id: string) => {
    const response = await apiFetch<Campaign>(`/campaigns/${id}`);
    return response.data;
  },

  create: async (campaignData: Partial<Campaign>) => {
    const response = await apiFetch<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
    return response.data;
  },

  update: async (id: string, campaignData: Partial<Campaign>) => {
    const response = await apiFetch<Campaign>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiFetch<{ message: string }>(`/campaigns/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  getMyCampaigns: async () => {
    const response = await apiFetch<Campaign[]>('/campaigns/my');
    return { data: response.data, count: response.count };
  },
};

// Payments API
export const paymentsAPI = {
  initialize: async (paymentData: {
    campaignId: string;
    amount: number;
    contributorName: string;
    contributorEmail: string;
    isAnonymous: boolean;
    message?: string;
  }) => {
    const response = await apiFetch<PaymentInitResponse>('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return response.data;
  },

  verify: async (reference: string) => {
    const response = await apiFetch<Transaction>(`/payments/verify/${reference}`);
    return response.data;
  },

  getCampaignTransactions: async (campaignId: string) => {
    const response = await apiFetch<Transaction[]>(`/payments/campaign/${campaignId}`);
    return response.data;
  },

  getMyTransactions: async () => {
    const response = await apiFetch<Transaction[]>('/payments/my');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllTransactions: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiFetch<Transaction[]>(`/payments${query}`);
    return {
      data: response.data,
      total: response.total,
      page: response.page,
      pages: response.pages,
    };
  },
};
