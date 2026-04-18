import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
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

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  email,
  amount,
  reference,
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      key: 'pk_test_9721481771baa92fa5c2c78e1c94f2b61ecdd38b',
      email,
      amount: amount * 100, // Convert to kobo
      ref: reference,
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      callback: (response) => {
        onSuccess(response.reference);
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

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      className="w-full py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
    >
      Pay Now with Paystack
    </button>
  );
};

export default PaystackPayment;
