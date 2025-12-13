"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type FAQStatus = 'published' | 'draft' | 'review' | 'archived'
type FAQCategory = 'getting-started' | 'account' | 'billing' | 'technical' | 'features' | 'troubleshooting' | 'security' | 'integrations'
type FAQPriority = 'low' | 'medium' | 'high' | 'critical'

interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
  status: FAQStatus
  priority: FAQPriority
  views: number
  helpful: number
  notHelpful: number
  searches: number
  relatedFAQs: string[]
  tags: string[]
  lastUpdated: string
  author: string
  averageReadTime: number
}

export default function FAQPage() {
  const [statusFilter, setStatusFilter] = useState<FAQStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<FAQCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<FAQPriority | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const faqs: FAQ[] = [
    {
      id: 'faq-001',
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.',
      category: 'account',
      status: 'published',
      priority: 'high',
      views: 15420,
      helpful: 1340,
      notHelpful: 45,
      searches: 8900,
      relatedFAQs: ['faq-002', 'faq-003'],
      tags: ['password', 'account', 'security'],
      lastUpdated: '2024-01-15',
      author: 'Sarah Johnson',
      averageReadTime: 1.2
    },
    {
      id: 'faq-002',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans.',
      category: 'billing',
      status: 'published',
      priority: 'high',
      views: 12800,
      helpful: 1120,
      notHelpful: 32,
      searches: 7200,
      relatedFAQs: ['faq-005', 'faq-009'],
      tags: ['payment', 'billing', 'subscription'],
      lastUpdated: '2024-01-14',
      author: 'Michael Chen',
      averageReadTime: 1.5
    },
    {
      id: 'faq-003',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Settings > Security > Two-Factor Authentication, click "Enable", and follow the setup wizard to configure your authenticator app.',
      category: 'security',
      status: 'published',
      priority: 'critical',
      views: 9800,
      helpful: 890,
      notHelpful: 28,
      searches: 5400,
      relatedFAQs: ['faq-001', 'faq-010'],
      tags: ['2fa', 'security', 'authentication'],
      lastUpdated: '2024-01-13',
      author: 'Emily Rodriguez',
      averageReadTime: 2.3
    },
    {
      id: 'faq-004',
      question: 'Can I integrate with third-party tools?',
      answer: 'Yes! We offer integrations with over 100 popular tools including Slack, Zapier, Google Workspace, and Microsoft 365. Visit our Integrations page for the full list.',
      category: 'integrations',
      status: 'published',
      priority: 'medium',
      views: 8500,
      helpful: 720,
      notHelpful: 45,
      searches: 4100,
      relatedFAQs: ['faq-007', 'faq-011'],
      tags: ['integrations', 'api', 'third-party'],
      lastUpdated: '2024-01-12',
      author: 'David Kim',
      averageReadTime: 1.8
    },
    {
      id: 'faq-005',
      question: 'How do I upgrade my subscription plan?',
      answer: 'Navigate to Settings > Billing > Plan, select your desired plan, and confirm the upgrade. Changes take effect immediately.',
      category: 'billing',
      status: 'published',
      priority: 'high',
      views: 7200,
      helpful: 650,
      notHelpful: 22,
      searches: 3800,
      relatedFAQs: ['faq-002', 'faq-006'],
      tags: ['upgrade', 'subscription', 'billing'],
      lastUpdated: '2024-01-11',
      author: 'Sarah Johnson',
      averageReadTime: 1.4
    },
    {
      id: 'faq-006',
      question: 'What is your refund policy?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. Contact support@example.com to request a refund within 30 days of purchase.',
      category: 'billing',
      status: 'published',
      priority: 'medium',
      views: 6100,
      helpful: 520,
      notHelpful: 38,
      searches: 2900,
      relatedFAQs: ['faq-002', 'faq-005'],
      tags: ['refund', 'billing', 'policy'],
      lastUpdated: '2024-01-10',
      author: 'Michael Chen',
      averageReadTime: 1.6
    },
    {
      id: 'faq-007',
      question: 'How do I use the API?',
      answer: 'Our REST API is well-documented at api.example.com/docs. Generate an API key from Settings > API Keys and use it in your requests.',
      category: 'technical',
      status: 'published',
      priority: 'medium',
      views: 5400,
      helpful: 480,
      notHelpful: 52,
      searches: 2500,
      relatedFAQs: ['faq-004', 'faq-012'],
      tags: ['api', 'development', 'technical'],
      lastUpdated: '2024-01-09',
      author: 'Emily Rodriguez',
      averageReadTime: 3.2
    },
    {
      id: 'faq-008',
      question: 'Is my data secure and encrypted?',
      answer: 'Absolutely. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. All data is stored in SOC 2 certified data centers.',
      category: 'security',
      status: 'published',
      priority: 'critical',
      views: 4800,
      helpful: 430,
      notHelpful: 15,
      searches: 2200,
      relatedFAQs: ['faq-003', 'faq-010'],
      tags: ['security', 'encryption', 'compliance'],
      lastUpdated: '2024-01-08',
      author: 'David Kim',
      averageReadTime: 2.1
    },
    {
      id: 'faq-009',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from Settings > Billing. Your access continues until the end of your billing period.',
      category: 'billing',
      status: 'published',
      priority: 'high',
      views: 4200,
      helpful: 380,
      notHelpful: 28,
      searches: 1900,
      relatedFAQs: ['faq-002', 'faq-006'],
      tags: ['cancel', 'subscription', 'billing'],
      lastUpdated: '2024-01-07',
      author: 'Sarah Johnson',
      averageReadTime: 1.3
    },
    {
      id: 'faq-010',
      question: 'What browsers are supported?',
      answer: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox.',
      category: 'technical',
      status: 'published',
      priority: 'low',
      views: 3600,
      helpful: 320,
      notHelpful: 42,
      searches: 1500,
      relatedFAQs: ['faq-007', 'faq-012'],
      tags: ['browsers', 'compatibility', 'technical'],
      lastUpdated: '2024-01-06',
      author: 'Michael Chen',
      averageReadTime: 0.9
    },
    {
      id: 'faq-011',
      question: 'How do I export my data?',
      answer: 'Navigate to Settings > Data Export, select the data you want to export, choose your format (CSV, JSON, or Excel), and click "Export".',
      category: 'features',
      status: 'published',
      priority: 'medium',
      views: 3100,
      helpful: 280,
      notHelpful: 35,
      searches: 1300,
      relatedFAQs: ['faq-004', 'faq-007'],
      tags: ['export', 'data', 'features'],
      lastUpdated: '2024-01-05',
      author: 'Emily Rodriguez',
      averageReadTime: 1.7
    },
    {
      id: 'faq-012',
      question: 'Why am I getting a 404 error?',
      answer: 'A 404 error typically means the page you are trying to access does not exist. Check the URL for typos or navigate from the dashboard.',
      category: 'troubleshooting',
      status: 'published',
      priority: 'medium',
      views: 2800,
      helpful: 240,
      notHelpful: 68,
      searches: 1100,
      relatedFAQs: ['faq-007', 'faq-010'],
      tags: ['error', 'troubleshooting', '404'],
      lastUpdated: '2024-01-04',
      author: 'David Kim',
      averageReadTime: 1.1
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    if (statusFilter !== 'all' && faq.status !== statusFilter) return false
    if (categoryFilter !== 'all' && faq.category !== categoryFilter) return false
    if (priorityFilter !== 'all' && faq.priority !== priorityFilter) return false
    return true
  })

  const stats = [
    { label: 'Total FAQs', value: '142', trend: '+12', trendLabel: 'this month' },
    { label: 'Total Views', value: '84.2K', trend: '+18%', trendLabel: 'vs last month' },
    { label: 'Avg Helpfulness', value: '94.2%', trend: '+2.1%', trendLabel: 'improvement' },
    { label: 'Top Searches', value: '23.4K', trend: '+25%', trendLabel: 'this week' }
  ]

  const quickActions = [
    { label: 'Create FAQ', icon: '📝', onClick: () => console.log('Create FAQ') },
    { label: 'Import FAQs', icon: '📥', onClick: () => console.log('Import FAQs') },
    { label: 'Export Data', icon: '📤', onClick: () => console.log('Export Data') },
    { label: 'Analytics', icon: '📊', onClick: () => console.log('Analytics') },
    { label: 'Categories', icon: '🏷️', onClick: () => console.log('Categories') },
    { label: 'Search Trends', icon: '🔍', onClick: () => console.log('Search Trends') },
    { label: 'User Feedback', icon: '💬', onClick: () => console.log('User Feedback') },
    { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') }
  ]

  const recentActivity = [
    { label: 'FAQ "How do I reset password?" updated', time: '5 min ago', type: 'update' },
    { label: 'New FAQ created by Sarah Johnson', time: '12 min ago', type: 'create' },
    { label: 'FAQ "Payment methods" marked as helpful by 45 users', time: '28 min ago', type: 'feedback' },
    { label: 'Category "Security" reorganized', time: '1 hour ago', type: 'organize' },
    { label: 'FAQ "API usage" received 12 not helpful votes', time: '2 hours ago', type: 'feedback' },
    { label: '3 FAQs moved to published status', time: '3 hours ago', type: 'status' }
  ]

  const topSearchedFAQs = filteredFAQs
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 5)
    .map((faq, index) => ({
      rank: index + 1,
      label: faq.question,
      value: faq.searches.toLocaleString(),
      change: index === 0 ? '+15%' : index === 1 ? '+12%' : index === 2 ? '+8%' : index === 3 ? '+5%' : '+2%'
    }))

  const getStatusColor = (status: FAQStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'review': return 'bg-yellow-100 text-yellow-700'
      case 'archived': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: FAQCategory) => {
    switch (category) {
      case 'getting-started': return 'bg-blue-100 text-blue-700'
      case 'account': return 'bg-purple-100 text-purple-700'
      case 'billing': return 'bg-green-100 text-green-700'
      case 'technical': return 'bg-orange-100 text-orange-700'
      case 'features': return 'bg-pink-100 text-pink-700'
      case 'troubleshooting': return 'bg-red-100 text-red-700'
      case 'security': return 'bg-indigo-100 text-indigo-700'
      case 'integrations': return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: FAQPriority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const calculateHelpfulness = (helpful: number, notHelpful: number) => {
    const total = helpful + notHelpful
    if (total === 0) return 0
    return Math.round((helpful / total) * 100)
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 mt-1">Manage and organize your FAQ knowledge base</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Create New FAQ
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
          <PillButton active={statusFilter === 'published'} onClick={() => setStatusFilter('published')}>Published</PillButton>
          <PillButton active={statusFilter === 'draft'} onClick={() => setStatusFilter('draft')}>Draft</PillButton>
          <PillButton active={statusFilter === 'review'} onClick={() => setStatusFilter('review')}>Review</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'account'} onClick={() => setCategoryFilter('account')}>Account</PillButton>
          <PillButton active={categoryFilter === 'billing'} onClick={() => setCategoryFilter('billing')}>Billing</PillButton>
          <PillButton active={categoryFilter === 'technical'} onClick={() => setCategoryFilter('technical')}>Technical</PillButton>
          <PillButton active={categoryFilter === 'security'} onClick={() => setCategoryFilter('security')}>Security</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={priorityFilter === 'all'} onClick={() => setPriorityFilter('all')}>All Priorities</PillButton>
          <PillButton active={priorityFilter === 'critical'} onClick={() => setPriorityFilter('critical')}>Critical</PillButton>
          <PillButton active={priorityFilter === 'high'} onClick={() => setPriorityFilter('high')}>High</PillButton>
          <PillButton active={priorityFilter === 'medium'} onClick={() => setPriorityFilter('medium')}>Medium</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">FAQ List ({filteredFAQs.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredFAQs.map(faq => {
                const helpfulness = calculateHelpfulness(faq.helpful, faq.notHelpful)
                return (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{faq.answer}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(faq.status)}`}>
                        {faq.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(faq.category)}`}>
                        {faq.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(faq.priority)}`}>
                        {faq.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-xs">
                        <div className="text-gray-500">Views</div>
                        <div className="font-semibold">{faq.views.toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Searches</div>
                        <div className="font-semibold">{faq.searches.toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Helpful</div>
                        <div className="font-semibold text-green-600">{faq.helpful}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Not Helpful</div>
                        <div className="font-semibold text-red-600">{faq.notHelpful}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Helpfulness Score</span>
                        <span className="text-xs font-semibold">{helpfulness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${helpfulness}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      <span>By {faq.author}</span>
                      <span>{faq.averageReadTime} min read</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Published FAQs" value="128" />
              <MiniKPI label="Draft FAQs" value="9" />
              <MiniKPI label="In Review" value="5" />
              <MiniKPI label="Avg Response Rate" value="94.2%" />
            </div>
          </div>

          {/* Top Searched FAQs */}
          <RankingList title="Most Searched FAQs" items={topSearchedFAQs} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Category Distribution"
            items={[
              { label: 'Account', value: 32, color: 'from-purple-400 to-purple-600' },
              { label: 'Billing', value: 28, color: 'from-green-400 to-green-600' },
              { label: 'Technical', value: 25, color: 'from-orange-400 to-orange-600' },
              { label: 'Security', value: 15, color: 'from-indigo-400 to-indigo-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
