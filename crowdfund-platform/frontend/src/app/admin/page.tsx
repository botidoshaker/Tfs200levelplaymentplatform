"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Campaign {
  _id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
}

interface Transaction {
  _id: string;
  reference: string;
  amount: number;
  status: string;
  campaign: Campaign;
  user?: { name: string; email: string };
}

export default function AdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "transactions">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [campaignsRes, transactionsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/campaigns`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions`, { headers }),
      ]);

      setCampaigns(campaignsRes.data.data || []);
      setTransactions(transactionsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRaised = campaigns.reduce((sum, c) => sum + c.currentAmount, 0);
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter((t) => t.status === "completed").length;
  const pendingTransactions = transactions.filter((t) => t.status === "pending").length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage campaigns and monitor transactions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 font-semibold ${
            activeTab === "overview"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-6 py-3 font-semibold ${
            activeTab === "campaigns"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          All Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-6 py-3 font-semibold ${
            activeTab === "transactions"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          All Transactions ({transactions.length})
        </button>
      </div>

      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Raised</h3>
              <p className="text-3xl font-bold text-green-600">₦{totalRaised.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Campaigns</h3>
              <p className="text-3xl font-bold text-blue-600">
                {campaigns.filter((c) => c.status === "active").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Transactions</h3>
              <p className="text-3xl font-bold text-green-600">{completedTransactions}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Transactions</h3>
              <p className="text-3xl font-bold text-yellow-600">{pendingTransactions}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx._id} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{tx.campaign?.title || "Unknown Campaign"}</p>
                  <p className="text-sm text-gray-500">Reference: {tx.reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₦{tx.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    tx.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : tx.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raised</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td className="px-6 py-4">
                    <Link href={`/campaigns/${campaign._id}`} className="text-green-600 hover:underline">
                      {campaign.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">₦{campaign.targetAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">₦{campaign.currentAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.reference}</td>
                  <td className="px-6 py-4">
                    <Link href={`/campaigns/${tx.campaign?._id}`} className="text-green-600 hover:underline">
                      {tx.campaign?.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-semibold">₦{tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      tx.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
