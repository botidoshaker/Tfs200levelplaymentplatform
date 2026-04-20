import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, AlertCircle, CheckCircle } from 'lucide-react';

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

const BANKS = [
  { code: '057', name: 'Zenith Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '035', name: 'Wema Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '044', name: 'Access Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '215', name: 'Unity Bank' },
  { code: '999', name: 'Palmpay' },
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('easycollect_user') || '{}');
    if (currentUser.bankDetails) {
      setBankDetails(currentUser.bankDetails);
    }
  }, []);

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'bankName') {
      const selectedBank = BANKS.find(b => b.name === value);
      setBankDetails(prev => ({
        ...prev,
        bankName: value,
        bankCode: selectedBank?.code || '',
      }));
    } else {
      setBankDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveBankDetails = async () => {
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      setError('Please fill in all bank details');
      return;
    }

    if (bankDetails.accountNumber.length !== 10) {
      setError('Account number must be 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const currentUser = JSON.parse(localStorage.getItem('easycollect_user') || '{}');
      const updatedUser = { ...currentUser, bankDetails };
      localStorage.setItem('easycollect_user', JSON.stringify(updatedUser));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        {/* Purple Header */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white p-6 rounded-b-3xl">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-300">Back to Dashboard</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bank Account Settings</h1>
              <p className="text-purple-200 text-sm mt-1">
                Manage your payout accounts for direct transfers
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-600 p-4 rounded-xl mb-4">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Bank details saved successfully!</p>
            </div>
          )}

          {/* Add New Account Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Account</h2>

            <div className="space-y-5">
              {/* Select Bank */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Select Bank
                </label>
                <div className="relative">
                  <select
                    name="bankName"
                    value={bankDetails.bankName}
                    onChange={handleBankChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  >
                    <option value="">Choose your bank</option>
                    {BANKS.map(bank => (
                      <option key={bank.code} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleBankChange}
                  maxLength={10}
                  placeholder="Enter 10-digit account number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={bankDetails.accountName}
                  onChange={handleBankChange}
                  placeholder="Account name will appear here"
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Account name is automatically validated
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBankDetails}
                  disabled={loading}
                  className="flex-1 py-3 bg-purple-400 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Add Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
