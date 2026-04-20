"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Campaign {
  _id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  deadline: string;
}

interface Transaction {
  _id: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: string;
  campaign: Campaign;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "contributions">("campaigns");
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [contributions, setContributions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [campaignsRes, contributionsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/my-campaigns`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/my-contributions`, { headers }),
      ]);

      setMyCampaigns(campaignsRes.data.data || []);
      setContributions(contributionsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-6 py-3 font-semibold ${
            activeTab === "campaigns"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          My Campaigns ({myCampaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("contributions")}
          className={`px-6 py-3 font-semibold ${
            activeTab === "contributions"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          My Contributions ({contributions.length})
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === "campaigns" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Campaigns</h2>
                <Link
                  href="/campaigns/create"
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700"
                >
                  Create New Campaign
                </Link>
              </div>

              {myCampaigns.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600 mb-4">You haven't created any campaigns yet.</p>
                  <Link
                    href="/campaigns/create"
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    Create your first campaign →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCampaigns.map((campaign) => (
                    <Link href={`/campaigns/${campaign._id}`} key={campaign._id}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                        <div className="h-40 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                          <span className="text-white text-5xl">🚀</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 truncate">{campaign.title}</h3>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-green-600 font-semibold">
                              ₦{campaign.currentAmount.toLocaleString()}
                            </span>
                            <span className="text-gray-500">
                              of ₦{campaign.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="mt-3 flex justify-between text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded ${
                              campaign.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                            <span>Ends {new Date(campaign.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "contributions" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Your Contribution History</h2>

              {contributions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600 mb-4">You haven't made any contributions yet.</p>
                  <Link href="/" className="text-green-600 hover:text-green-700 font-semibold">
                    Browse campaigns →
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contributions.map((tx) => (
                        <tr key={tx._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/campaigns/${tx.campaign._id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              {tx.campaign.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tx.reference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                            ₦{tx.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tx.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : tx.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
