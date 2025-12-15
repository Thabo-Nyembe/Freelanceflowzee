'use client'
import { useState } from 'react'
import { useCampaigns, type Campaign, type CampaignType, type CampaignStatus } from '@/lib/hooks/use-campaigns'

export default function CampaignsClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<CampaignType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const { campaigns, loading, error } = useCampaigns({ campaignType: campaignTypeFilter, status: statusFilter })
  const displayCampaigns = campaigns.length > 0 ? campaigns : initialCampaigns

  const stats = {
    total: displayCampaigns.length,
    running: displayCampaigns.filter(c => c.status === 'running').length,
    totalRevenue: displayCampaigns.reduce((sum, c) => sum + c.revenue_generated, 0).toFixed(2),
    avgROI: displayCampaigns.length > 0 ? (displayCampaigns.reduce((sum, c) => sum + (c.roi_percentage || 0), 0) / displayCampaigns.length).toFixed(1) : '0'
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Marketing Campaigns</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Campaigns</div><div className="text-3xl font-bold text-rose-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Running</div><div className="text-3xl font-bold text-green-600">{stats.running}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Revenue</div><div className="text-3xl font-bold text-blue-600">${stats.totalRevenue}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg ROI</div><div className="text-3xl font-bold text-purple-600">{stats.avgROI}%</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={campaignTypeFilter} onChange={(e) => setCampaignTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="email">Email</option><option value="sms">SMS</option><option value="social">Social</option><option value="multi_channel">Multi-Channel</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="draft">Draft</option><option value="running">Running</option><option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayCampaigns.filter(c => (campaignTypeFilter === 'all' || c.campaign_type === campaignTypeFilter) && (statusFilter === 'all' || c.status === statusFilter)).map(campaign => (
          <div key={campaign.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${campaign.status === 'running' ? 'bg-green-100 text-green-700' : campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{campaign.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-rose-100 text-rose-700">{campaign.campaign_type}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{campaign.phase}</span>
                  {campaign.is_automated && <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">Automated</span>}
                </div>
                <h3 className="text-lg font-semibold">{campaign.campaign_name}</h3>
                {campaign.description && <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>👥 {campaign.audience_size} audience</span>
                  <span>👀 {campaign.impressions} impressions</span>
                  <span>🖱️ {campaign.clicks} clicks</span>
                  <span>✅ {campaign.conversions} conversions</span>
                </div>
              </div>
              <div className="text-right">
                {campaign.roi_percentage && (
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{campaign.roi_percentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">ROI</div>
                  </div>
                )}
                {campaign.revenue_generated > 0 && <div className="text-xs text-green-600 font-semibold mt-1">💰 ${campaign.revenue_generated.toFixed(2)}</div>}
                {campaign.conversion_rate && <div className="text-xs text-gray-600 mt-1">📊 {campaign.conversion_rate.toFixed(1)}% CVR</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
