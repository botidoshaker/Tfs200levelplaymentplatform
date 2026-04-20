"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  contributors: Array<{
    name: string;
    amount: number;
    anonymous: boolean;
    date: string;
  }>;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributeAmount, setContributeAmount] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const fetchCampaign = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${params.id}`);
      setCampaign(response.data.data);
    } catch (err) {
      console.error("Error fetching campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const amount = parseFloat(contributeAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setProcessingPayment(true);

    try {
      const token = localStorage.getItem("token");
      
      // Initialize payment on backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/initialize`,
        {
          campaignId: params.id,
          amount,
          email: user?.email || email,
          anonymous,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to Paystack payment page
      window.location.href = response.data.data.authorizationUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to initialize payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Campaign not found</h1>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-green-600 hover:text-green-700"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const percentageFunded = Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="h-64 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-8xl">🚀</span>
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">{campaign.title}</h1>
              <p className="text-gray-600 mb-6 whitespace-pre-line">{campaign.description}</p>
              
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Target Amount</p>
                    <p className="text-lg font-semibold">₦{campaign.targetAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Raised So Far</p>
                    <p className="text-lg font-semibold text-green-600">₦{campaign.currentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`text-lg font-semibold ${campaign.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="text-lg font-semibold">{new Date(campaign.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contributors List */}
          {campaign.contributors && campaign.contributors.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Contributors ({campaign.contributors.length})</h2>
              <div className="space-y-3">
                {campaign.contributors.map((contributor, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">
                        {contributor.anonymous ? "Anonymous" : contributor.name}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(contributor.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-green-600 font-semibold">₦{contributor.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contribution Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Make a Contribution</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{percentageFunded.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentageFunded}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ₦{campaign.currentAmount.toLocaleString()} of ₦{campaign.targetAmount.toLocaleString()}
              </p>
            </div>

            {campaign.status !== 'active' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-4">
                This campaign is no longer accepting contributions.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            {campaign.status === 'active' && (
              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₦)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 5000"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                  />
                </div>

                {!isAuthenticated && (
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    id="anonymous"
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                    Contribute anonymously
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={processingPayment || campaign.status !== 'active'}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayment ? "Processing..." : "Contribute Now"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Secure payment powered by Paystack. All transactions are verified.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
