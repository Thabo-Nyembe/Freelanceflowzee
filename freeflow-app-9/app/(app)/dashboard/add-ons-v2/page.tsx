"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type AddOnStatus = 'installed' | 'available' | 'updating' | 'trial' | 'expired'
type AddOnCategory = 'feature' | 'service' | 'module' | 'pack' | 'bundle' | 'integration' | 'boost' | 'premium'
type AddOnPricing = 'free' | 'freemium' | 'paid' | 'subscription' | 'one-time'

interface AddOn {
  id: string
  name: string
  description: string
  version: string
  provider: string
  category: AddOnCategory
  pricing: AddOnPricing
  status: AddOnStatus
  price: string
  subscribers: number
  totalSales: number
  rating: number
  reviews: number
  lastUpdated: string
  releaseDate: string
  size: string
  features: string[]
  requirements: string[]
  benefits: string[]
  trialDays: number
  tags: string[]
}

export default function AddOnsPage() {
  const [statusFilter, setStatusFilter] = useState<AddOnStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AddOnCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<AddOnPricing | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const addOns: AddOn[] = [
    {
      id: 'addon-001',
      name: 'Premium Analytics Suite',
      description: 'Unlock advanced analytics with AI insights, predictive modeling, custom reports, and data exports.',
      version: '4.8.2',
      provider: 'Analytics Pro',
      category: 'premium',
      pricing: 'subscription',
      status: 'installed',
      price: '$49/month',
      subscribers: 12400,
      totalSales: 156800,
      rating: 4.9,
      reviews: 2840,
      lastUpdated: '2024-01-15',
      releaseDate: '2023-02-10',
      size: '8.2 MB',
      features: ['AI Insights', 'Predictive Modeling', 'Custom Reports', 'Data Export', 'Real-time Dashboards'],
      requirements: ['Premium Plan', 'Admin Access'],
      benefits: ['360° Analytics', 'ROI Tracking', 'Custom KPIs', 'Automated Reporting'],
      trialDays: 14,
      tags: ['analytics', 'ai', 'premium', 'reporting']
    },
    {
      id: 'addon-002',
      name: 'Advanced Security Pack',
      description: 'Enterprise-grade security with SSO, advanced 2FA, IP whitelisting, and security audit logs.',
      version: '3.5.1',
      provider: 'SecureTech',
      category: 'pack',
      pricing: 'subscription',
      status: 'installed',
      price: '$79/month',
      subscribers: 9800,
      totalSales: 142600,
      rating: 4.8,
      reviews: 2340,
      lastUpdated: '2024-01-14',
      releaseDate: '2023-04-15',
      size: '5.4 MB',
      features: ['SSO Integration', 'Advanced 2FA', 'IP Whitelisting', 'Audit Logs', 'Compliance Reports'],
      requirements: ['Enterprise Plan', 'IT Admin'],
      benefits: ['SOC 2 Compliance', 'GDPR Ready', 'Zero Trust', 'Advanced Threat Protection'],
      trialDays: 30,
      tags: ['security', 'enterprise', 'compliance', 'sso']
    },
    {
      id: 'addon-003',
      name: 'Team Collaboration Boost',
      description: 'Enhanced collaboration tools with video conferencing, screen sharing, and real-time co-editing.',
      version: '2.9.4',
      provider: 'Collab Solutions',
      category: 'boost',
      pricing: 'paid',
      status: 'installed',
      price: '$29/month',
      subscribers: 15600,
      totalSales: 187200,
      rating: 4.7,
      reviews: 3120,
      lastUpdated: '2024-01-13',
      releaseDate: '2023-01-20',
      size: '12.6 MB',
      features: ['Video Calls', 'Screen Sharing', 'Co-editing', 'Whiteboard', 'Recording'],
      requirements: ['Team Plan', '5+ Users'],
      benefits: ['Unlimited Meetings', 'HD Quality', 'Cloud Recording', 'No Time Limits'],
      trialDays: 7,
      tags: ['collaboration', 'video', 'meetings', 'team']
    },
    {
      id: 'addon-004',
      name: 'API Developer Module',
      description: 'Full API access with higher rate limits, webhooks, GraphQL support, and priority support.',
      version: '5.2.3',
      provider: 'Dev Tools Inc',
      category: 'module',
      pricing: 'subscription',
      status: 'installed',
      price: '$99/month',
      subscribers: 7200,
      totalSales: 108000,
      rating: 4.9,
      reviews: 1680,
      lastUpdated: '2024-01-12',
      releaseDate: '2023-06-08',
      size: '3.8 MB',
      features: ['Unlimited API Calls', 'GraphQL', 'Webhooks', 'Priority Support', 'Custom Endpoints'],
      requirements: ['Pro Plan', 'Developer Access'],
      benefits: ['10x Rate Limits', '99.99% Uptime', 'Dedicated Support', 'Beta Features'],
      trialDays: 14,
      tags: ['api', 'developer', 'graphql', 'webhooks']
    },
    {
      id: 'addon-005',
      name: 'E-commerce Integration Bundle',
      description: 'Complete e-commerce solution with Shopify, WooCommerce, Stripe, and PayPal integrations.',
      version: '1.8.7',
      provider: 'Commerce Connect',
      category: 'bundle',
      pricing: 'subscription',
      status: 'trial',
      price: '$59/month',
      subscribers: 8900,
      totalSales: 124300,
      rating: 4.6,
      reviews: 1920,
      lastUpdated: '2024-01-11',
      releaseDate: '2023-08-25',
      size: '9.4 MB',
      features: ['Shopify Integration', 'WooCommerce', 'Stripe', 'PayPal', 'Order Sync'],
      requirements: ['Business Plan', 'E-commerce Store'],
      benefits: ['Automated Sync', 'Inventory Management', 'Payment Processing', 'Multi-currency'],
      trialDays: 30,
      tags: ['e-commerce', 'shopify', 'payments', 'integration']
    },
    {
      id: 'addon-006',
      name: 'Custom Branding Feature',
      description: 'White-label solution with custom domain, logo, colors, and email templates.',
      version: '2.4.6',
      provider: 'Brand Studio',
      category: 'feature',
      pricing: 'paid',
      status: 'installed',
      price: '$39/month',
      subscribers: 11200,
      totalSales: 134400,
      rating: 4.5,
      reviews: 2460,
      lastUpdated: '2024-01-10',
      releaseDate: '2023-03-18',
      size: '2.1 MB',
      features: ['Custom Domain', 'Logo Upload', 'Color Schemes', 'Email Templates', 'Favicon'],
      requirements: ['Pro Plan', 'Custom Domain'],
      benefits: ['Full Branding', 'Professional Look', 'Brand Consistency', 'Client Trust'],
      trialDays: 14,
      tags: ['branding', 'white-label', 'customization', 'domain']
    },
    {
      id: 'addon-007',
      name: 'Email Marketing Service',
      description: 'Powerful email marketing with automation, templates, A/B testing, and detailed analytics.',
      version: '3.7.2',
      provider: 'Mail Pro',
      category: 'service',
      pricing: 'freemium',
      status: 'installed',
      price: 'Free - $89/month',
      subscribers: 18900,
      totalSales: 226800,
      rating: 4.7,
      reviews: 4230,
      lastUpdated: '2024-01-09',
      releaseDate: '2023-05-12',
      size: '6.8 MB',
      features: ['Automation', 'Templates', 'A/B Testing', 'Analytics', 'Segmentation'],
      requirements: ['Any Plan'],
      benefits: ['Unlimited Contacts', 'Drag-drop Builder', 'Advanced Analytics', 'Deliverability Boost'],
      trialDays: 0,
      tags: ['email', 'marketing', 'automation', 'campaigns']
    },
    {
      id: 'addon-008',
      name: 'Cloud Storage Expansion',
      description: 'Additional cloud storage with 1TB, 5TB, or 10TB options and priority upload/download speeds.',
      version: '1.3.9',
      provider: 'Cloud Plus',
      category: 'feature',
      pricing: 'subscription',
      status: 'available',
      price: '$19-$99/month',
      subscribers: 14600,
      totalSales: 175200,
      rating: 4.8,
      reviews: 3640,
      lastUpdated: '2024-01-08',
      releaseDate: '2023-07-22',
      size: '1.2 MB',
      features: ['1TB-10TB Storage', 'Priority Speeds', 'Version History', 'Advanced Sharing', 'CDN'],
      requirements: ['Any Plan'],
      benefits: ['99.9% Uptime', 'Fast Transfers', '30-day History', 'Geo-redundancy'],
      trialDays: 7,
      tags: ['storage', 'cloud', 'backup', 'cdn']
    },
    {
      id: 'addon-009',
      name: 'AI Content Generator',
      description: 'AI-powered content creation with GPT-4, image generation, and multi-language support.',
      version: '2.1.5',
      provider: 'AI Creative',
      category: 'premium',
      pricing: 'subscription',
      status: 'trial',
      price: '$69/month',
      subscribers: 6800,
      totalSales: 81600,
      rating: 4.6,
      reviews: 1420,
      lastUpdated: '2024-01-07',
      releaseDate: '2023-11-03',
      size: '7.2 MB',
      features: ['GPT-4 Integration', 'Image AI', 'Multi-language', 'SEO Optimization', 'Plagiarism Check'],
      requirements: ['Pro Plan', 'API Access'],
      benefits: ['10x Faster Content', 'SEO Ready', '50+ Languages', 'Original Content'],
      trialDays: 14,
      tags: ['ai', 'content', 'gpt', 'generation']
    },
    {
      id: 'addon-010',
      name: 'CRM Integration Pack',
      description: 'Connect with Salesforce, HubSpot, Zoho CRM, and Pipedrive with two-way sync.',
      version: '4.3.1',
      provider: 'CRM Connect',
      category: 'integration',
      pricing: 'paid',
      status: 'available',
      price: '$49/month',
      subscribers: 5600,
      totalSales: 67200,
      rating: 4.7,
      reviews: 1180,
      lastUpdated: '2024-01-06',
      releaseDate: '2023-09-14',
      size: '5.6 MB',
      features: ['Salesforce', 'HubSpot', 'Zoho', 'Pipedrive', 'Two-way Sync'],
      requirements: ['Business Plan', 'CRM Account'],
      benefits: ['Real-time Sync', 'Contact Management', 'Deal Tracking', 'Automated Workflows'],
      trialDays: 21,
      tags: ['crm', 'salesforce', 'hubspot', 'integration']
    },
    {
      id: 'addon-011',
      name: 'Priority Support Package',
      description: '24/7 priority support with dedicated account manager, phone support, and SLA guarantees.',
      version: '1.0.8',
      provider: 'Support Pro',
      category: 'service',
      pricing: 'subscription',
      status: 'available',
      price: '$199/month',
      subscribers: 3200,
      totalSales: 76800,
      rating: 4.9,
      reviews: 860,
      lastUpdated: '2024-01-05',
      releaseDate: '2023-12-01',
      size: '0.8 MB',
      features: ['24/7 Support', 'Account Manager', 'Phone Support', 'SLA Guarantee', 'Priority Queue'],
      requirements: ['Enterprise Plan'],
      benefits: ['<1hr Response', 'Dedicated Manager', 'Direct Line', '99.9% Uptime SLA'],
      trialDays: 30,
      tags: ['support', 'priority', 'sla', 'enterprise']
    },
    {
      id: 'addon-012',
      name: 'Advanced Reporting Module',
      description: 'Custom report builder with scheduled reports, PDF/Excel export, and data visualization.',
      version: '3.6.4',
      provider: 'Report Labs',
      category: 'module',
      pricing: 'paid',
      status: 'available',
      price: '$35/month',
      subscribers: 9400,
      totalSales: 112800,
      rating: 4.5,
      reviews: 2180,
      lastUpdated: '2024-01-04',
      releaseDate: '2023-10-20',
      size: '4.2 MB',
      features: ['Custom Builder', 'Scheduling', 'PDF/Excel Export', 'Visualizations', 'Email Delivery'],
      requirements: ['Pro Plan'],
      benefits: ['Unlimited Reports', 'Auto-scheduling', 'Brand Templates', 'Data Blending'],
      trialDays: 14,
      tags: ['reporting', 'analytics', 'export', 'visualization']
    }
  ]

  const filteredAddOns = addOns.filter(addOn => {
    if (statusFilter !== 'all' && addOn.status !== statusFilter) return false
    if (categoryFilter !== 'all' && addOn.category !== categoryFilter) return false
    if (pricingFilter !== 'all' && addOn.pricing !== pricingFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Add-ons', value: '186', trend: '+22', trendLabel: 'this month' },
    { label: 'Installed', value: '48', trend: '+8', trendLabel: 'vs last week' },
    { label: 'Total Revenue', value: '$2.1M', trend: '+42%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.7/5', trend: '+0.2', trendLabel: 'improvement' }
  ]

  const quickActions = [
    { label: 'Browse Add-ons', icon: '🛍️', onClick: () => console.log('Browse Add-ons') },
    { label: 'My Add-ons', icon: '📦', onClick: () => console.log('My Add-ons') },
    { label: 'Subscriptions', icon: '💳', onClick: () => console.log('Subscriptions') },
    { label: 'Billing', icon: '💰', onClick: () => console.log('Billing') },
    { label: 'Trial Add-ons', icon: '🎁', onClick: () => console.log('Trial Add-ons') },
    { label: 'Marketplace', icon: '🏪', onClick: () => console.log('Marketplace') },
    { label: 'Developer Portal', icon: '💻', onClick: () => console.log('Developer Portal') },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Add-on "Premium Analytics" updated to v4.8.2', time: '6 min ago', type: 'update' },
    { label: 'Started trial for "AI Content Generator"', time: '14 min ago', type: 'trial' },
    { label: 'Add-on "Email Marketing" reached 18K subscribers', time: '28 min ago', type: 'milestone' },
    { label: 'Subscription renewed for "Security Pack"', time: '1 hour ago', type: 'billing' },
    { label: 'Add-on "Cloud Storage" received 5-star review', time: '2 hours ago', type: 'review' },
    { label: '3 add-ons added to wishlist', time: '3 hours ago', type: 'wishlist' }
  ]

  const topAddOns = filteredAddOns
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 5)
    .map((addOn, index) => ({
      rank: index + 1,
      label: addOn.name,
      value: addOn.subscribers.toLocaleString(),
      change: index === 0 ? '+42%' : index === 1 ? '+36%' : index === 2 ? '+30%' : index === 3 ? '+24%' : '+18%'
    }))

  const getStatusColor = (status: AddOnStatus) => {
    switch (status) {
      case 'installed': return 'bg-green-100 text-green-700'
      case 'available': return 'bg-blue-100 text-blue-700'
      case 'updating': return 'bg-yellow-100 text-yellow-700'
      case 'trial': return 'bg-purple-100 text-purple-700'
      case 'expired': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: AddOnCategory) => {
    switch (category) {
      case 'feature': return 'bg-blue-100 text-blue-700'
      case 'service': return 'bg-green-100 text-green-700'
      case 'module': return 'bg-purple-100 text-purple-700'
      case 'pack': return 'bg-orange-100 text-orange-700'
      case 'bundle': return 'bg-pink-100 text-pink-700'
      case 'integration': return 'bg-teal-100 text-teal-700'
      case 'boost': return 'bg-indigo-100 text-indigo-700'
      case 'premium': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPricingColor = (pricing: AddOnPricing) => {
    switch (pricing) {
      case 'free': return 'bg-green-100 text-green-700'
      case 'freemium': return 'bg-blue-100 text-blue-700'
      case 'paid': return 'bg-purple-100 text-purple-700'
      case 'subscription': return 'bg-orange-100 text-orange-700'
      case 'one-time': return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Add-ons
          </h1>
          <p className="text-gray-600 mt-1">Enhance your platform with premium add-ons and features</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Browse Marketplace
        </button>
      </div>

      {/* Stats Grid */}
      <StatGrid stats={stats} />

      {/* Quick Actions */}
      <BentoQuickAction actions={quickActions} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <PillButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All Status</PillButton>
          <PillButton active={statusFilter === 'installed'} onClick={() => setStatusFilter('installed')}>Installed</PillButton>
          <PillButton active={statusFilter === 'trial'} onClick={() => setStatusFilter('trial')}>Trial</PillButton>
          <PillButton active={statusFilter === 'available'} onClick={() => setStatusFilter('available')}>Available</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'premium'} onClick={() => setCategoryFilter('premium')}>Premium</PillButton>
          <PillButton active={categoryFilter === 'bundle'} onClick={() => setCategoryFilter('bundle')}>Bundle</PillButton>
          <PillButton active={categoryFilter === 'integration'} onClick={() => setCategoryFilter('integration')}>Integration</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={pricingFilter === 'all'} onClick={() => setPricingFilter('all')}>All Pricing</PillButton>
          <PillButton active={pricingFilter === 'free'} onClick={() => setPricingFilter('free')}>Free</PillButton>
          <PillButton active={pricingFilter === 'freemium'} onClick={() => setPricingFilter('freemium')}>Freemium</PillButton>
          <PillButton active={pricingFilter === 'subscription'} onClick={() => setPricingFilter('subscription')}>Subscription</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add-ons List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Add-ons ({filteredAddOns.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredAddOns.map(addOn => (
                <div key={addOn.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{addOn.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">v{addOn.version} • {addOn.size} • {addOn.provider}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{addOn.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(addOn.status)}`}>
                      {addOn.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(addOn.category)}`}>
                      {addOn.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPricingColor(addOn.pricing)}`}>
                      {addOn.pricing}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Subscribers</div>
                      <div className="font-semibold">{addOn.subscribers.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Price</div>
                      <div className="font-semibold text-orange-600">{addOn.price}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">Key Features</div>
                    <div className="flex flex-wrap gap-1">
                      {addOn.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{addOn.rating}</span>
                      <span className="text-gray-500">({addOn.reviews})</span>
                    </div>
                    {addOn.trialDays > 0 && (
                      <span className="text-green-600 font-medium">{addOn.trialDays}-day trial</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    {addOn.status === 'installed' ? (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded text-xs font-medium hover:bg-orange-100">
                          Manage
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Details
                        </button>
                      </>
                    ) : addOn.status === 'trial' ? (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100">
                          Upgrade
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Cancel Trial
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded text-xs font-medium hover:bg-orange-100">
                          {addOn.trialDays > 0 ? 'Start Trial' : 'Install'}
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Learn More
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Installed" value="48" />
              <MiniKPI label="Active Trials" value="12" />
              <MiniKPI label="Monthly Spend" value="$642" />
              <MiniKPI label="Total Saved" value="$1.2K" />
            </div>
          </div>

          {/* Top Add-ons */}
          <RankingList title="Most Popular Add-ons" items={topAddOns} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Add-on Categories"
            items={[
              { label: 'Premium', value: 24, color: 'from-red-400 to-red-600' },
              { label: 'Integration', value: 22, color: 'from-teal-400 to-teal-600' },
              { label: 'Service', value: 18, color: 'from-green-400 to-green-600' },
              { label: 'Bundle', value: 16, color: 'from-pink-400 to-pink-600' },
              { label: 'Module', value: 14, color: 'from-purple-400 to-purple-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
