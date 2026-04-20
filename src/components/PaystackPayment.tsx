import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string, verified: boolean) => void;
  onClose: () => void;
  metadata?: {
    collectionId?: string;
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

const PAYSTACK_PUBLIC_KEY = 'pk_test_9721481771baa92fa5c2c78e1c94f2b61ecdd38b';

// Verify payment reference with Paystack API
const verifyPayment = async (reference: string): Promise<{
  verified: boolean;
  status: string;
  amount: number;
  currency: string;
  message?: string;
}> => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Verification request failed');
    }

    const data = await response.json();
    
    return {
      verified: data.status === true && data.data?.status === 'success',
      status: data.data?.status || 'unknown',
      amount: data.data?.amount ? data.data.amount / 100 : 0,
      currency: data.data?.currency || 'NGN',
      message: data.message,
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
        // Payment initiated - now verify it server-side
        setVerifying(true);
        
        const verificationResult = await verifyPayment(response.reference);
        
        setVerifying(false);
        
        if (verificationResult.verified) {
          // Store transaction record
          const transaction = {
            reference: response.reference,
            amount: amount,
            email: email,
            status: 'verified',
            verifiedAt: new Date().toISOString(),
            metadata: metadata || {},
          };
          
          // Save to localStorage for demo purposes
          const transactions = JSON.parse(localStorage.getItem('easycollect_transactions') || '[]');
          transactions.push(transaction);
          localStorage.setItem('easycollect_transactions', JSON.stringify(transactions));
          
          onSuccess(response.reference, true);
        } else {
          setError(`Payment verification failed: ${verificationResult.message || 'Transaction status: ' + verificationResult.status}`);
        }
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
