"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  imageUrl: string;
  percentageFunded?: number;
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns?limit=6`);
      setCampaigns(response.data.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg mb-12 text-white">
        <h1 className="text-5xl font-bold mb-4">Fund Your Dreams</h1>
        <p className="text-xl mb-8">Create campaigns and raise funds from supporters worldwide</p>
        <Link href="/campaigns/create" className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
          Start a Campaign
        </Link>
      </section>

      {/* Featured Campaigns */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Featured Campaigns</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">No campaigns yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link href={`/campaigns/${campaign._id}`} key={campaign._id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                    <span className="text-white text-6xl">🚀</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{campaign.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">₦{campaign.currentAmount.toLocaleString()}</span>
                        <span className="text-gray-500">of ₦{campaign.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{campaign.status === 'active' ? 'Active' : campaign.status}</span>
                      <span>Ends {new Date(campaign.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="mt-16 py-12 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Create Campaign</h3>
            <p className="text-gray-600">Set up your campaign with a goal, description, and deadline</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Receive Contributions</h3>
            <p className="text-gray-600">Supporters can contribute securely through our payment system</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Verified Payments</h3>
            <p className="text-gray-600">All payments are verified on the backend for security</p>
          </div>
        </div>
      </section>
    </div>
  );
}
