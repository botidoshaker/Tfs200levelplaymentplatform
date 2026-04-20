import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string, verified: boolean) => void;
  onClose: () => void;
  metadata?: {
    campaignId?: string;
    contributorName?: string;
    contributorPhone?: string;
  };
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency: string;
        channels: string[];
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx';

// Verify payment reference with backend API (NOT directly with Paystack)
const verifyPayment = async (reference: string): Promise<{
  verified: boolean;
  status: string;
  amount: number;
  currency: string;
  message?: string;
}> => {
  try {
    const token = localStorage.getItem('user');
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      try {
        const userData = JSON.parse(token);
        if (userData.token) {
          headers = {
            ...headers,
            'Authorization': `Bearer ${userData.token}`,
          };
        }
      } catch {}
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/verify/${reference}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Verification request failed');
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        verified: data.data.status === 'completed',
        status: data.data.status,
        amount: data.data.amount,
        currency: data.data.currency || 'NGN',
        message: 'Payment verified successfully',
      };
    }

    return {
      verified: false,
      status: data.data?.status || 'unknown',
      amount: 0,
      currency: 'NGN',
      message: data.message || 'Verification failed',
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      verified: false,
      status: 'error',
      amount: 0,
      currency: 'NGN',
      message: 'Failed to verify payment',
    };
  }
};

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  email,
  amount,
  reference,
  onSuccess,
  onClose,
  metadata,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  React.useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setLoading(false);
    script.onerror = () => {
      setError('Failed to load payment system');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!window.PaystackPop) {
      setError('Payment system not available');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Convert to kobo
      ref: reference,
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      callback: async (response) => {
        // Payment initiated - now verify it SERVER-SIDE via our backend
        setVerifying(true);

        // IMPORTANT: We do NOT mark as successful here!
        // The backend will verify via webhook and update the database
        // This is just polling to check the status
        
        const maxAttempts = 10;
        let attempts = 0;

        const pollVerification = async () => {
          attempts++;
          const verificationResult = await verifyPayment(response.reference);

          if (verificationResult.verified) {
            setVerifying(false);
            onSuccess(response.reference, true);
          } else if (attempts < maxAttempts && verificationResult.status === 'pending') {
            // Keep polling if still pending
            setTimeout(pollVerification, 2000);
          } else {
            setVerifying(false);
            // Show message that webhook will confirm
            onSuccess(response.reference, false);
          }
        };

        pollVerification();
      },
      onClose: () => {
        onClose();
      },
    });

    handler.openIframe();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error && !verifying) {
    return (
      <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-600 font-medium">Verifying your payment...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your transaction</p>
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      className="w-full py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
    >
      <CheckCircle className="w-5 h-5" />
      Pay Now with Paystack
    </button>
  );
};

export default PaystackPayment;
