'use client'

import { useState } from 'react'
import {
  HelpCircle,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Eye,
  Search,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Users,
  Star,
  Download,
  BarChart3,
  Calendar,
  Filter,
  Tag,
  Folder,
  Link,
  AlertCircle
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type DocStatus = 'published' | 'draft' | 'review' | 'outdated'
type DocCategory = 'faq' | 'how-to' | 'troubleshooting' | 'reference' | 'best-practices' | 'glossary'
type Helpfulness = 'very-helpful' | 'helpful' | 'not-helpful'

interface HelpDoc {
  id: string
  title: string
  question: string
  answer: string
  status: DocStatus
  category: DocCategory
  author: string
  createdAt: string
  updatedAt: string
  views: number
  searches: number
  helpful: number
  notHelpful: number
  comments: number
  relatedDocs: string[]
  tags: string[]
  popularity: number
}

export default function HelpDocsPage() {
  const [viewMode, setViewMode] = useState<'all' | DocStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | DocCategory>('all')

  const helpDocs: HelpDoc[] = [
    {
      id: 'HELP-2847',
      title: 'How do I reset my password?',
      question: 'I forgot my password and need to reset it. How do I do that?',
      answer: 'To reset your password, click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.',
      status: 'published',
      category: 'faq',
      author: 'Support Team',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
      views: 15678,
      searches: 2847,
      helpful: 1456,
      notHelpful: 23,
      comments: 45,
      relatedDocs: ['Account Security', 'Login Issues'],
      tags: ['password', 'account', 'security'],
      popularity: 98
    },
    {
      id: 'HELP-2848',
      title: 'How to integrate third-party services?',
      question: 'What are the steps to connect external services to my account?',
      answer: 'Navigate to Settings > Integrations, click "Add Integration", select your service, and follow the authentication flow to complete the connection.',
      status: 'published',
      category: 'how-to',
      author: 'Integration Team',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-12',
      views: 8473,
      searches: 1234,
      helpful: 823,
      notHelpful: 12,
      comments: 67,
      relatedDocs: ['API Authentication', 'OAuth Setup'],
      tags: ['integration', 'api', 'third-party'],
      popularity: 94
    },
    {
      id: 'HELP-2849',
      title: 'Dashboard not loading - troubleshooting',
      question: 'My dashboard shows a blank screen. What should I do?',
      answer: 'Try clearing your browser cache, disabling extensions, or using an incognito window. If the issue persists, contact support.',
      status: 'published',
      category: 'troubleshooting',
      author: 'Tech Support',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-14',
      views: 6234,
      searches: 892,
      helpful: 567,
      notHelpful: 45,
      comments: 89,
      relatedDocs: ['Browser Compatibility', 'Technical Issues'],
      tags: ['dashboard', 'bug', 'troubleshooting'],
      popularity: 87
    },
    {
      id: 'HELP-2850',
      title: 'API Rate Limits Reference',
      question: 'What are the API rate limits for different plan tiers?',
      answer: 'Free: 1000/hour, Pro: 10,000/hour, Enterprise: 100,000/hour. Rate limits reset every hour on the hour.',
      status: 'published',
      category: 'reference',
      author: 'API Team',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10',
      views: 12847,
      searches: 1678,
      helpful: 1234,
      notHelpful: 34,
      comments: 123,
      relatedDocs: ['API Documentation', 'Plan Comparison'],
      tags: ['api', 'rate-limit', 'reference'],
      popularity: 96
    },
    {
      id: 'HELP-2851',
      title: 'Best practices for data security',
      question: 'How can I ensure my data is secure on the platform?',
      answer: 'Enable 2FA, use strong passwords, regularly review access logs, enable encryption at rest, and follow our security guidelines.',
      status: 'published',
      category: 'best-practices',
      author: 'Security Team',
      createdAt: '2024-01-07',
      updatedAt: '2024-01-13',
      views: 5678,
      searches: 789,
      helpful: 534,
      notHelpful: 8,
      comments: 56,
      relatedDocs: ['Security Features', '2FA Setup'],
      tags: ['security', 'best-practices', 'data'],
      popularity: 92
    },
    {
      id: 'HELP-2852',
      title: 'Webhook terminology glossary',
      question: 'What do the webhook-related terms mean?',
      answer: 'Event: trigger condition. Payload: data sent. Signature: authentication token. Retry: automatic reattempt on failure.',
      status: 'published',
      category: 'glossary',
      author: 'Documentation Team',
      createdAt: '2024-01-09',
      updatedAt: '2024-01-11',
      views: 3456,
      searches: 456,
      helpful: 312,
      notHelpful: 5,
      comments: 23,
      relatedDocs: ['Webhook Guide', 'Event Types'],
      tags: ['webhook', 'glossary', 'terminology'],
      popularity: 89
    },
    {
      id: 'HELP-2853',
      title: 'Exporting large datasets',
      question: 'How do I export datasets larger than 10,000 rows?',
      answer: 'Use the async export API endpoint or schedule exports during off-peak hours. Large exports may take several minutes to process.',
      status: 'review',
      category: 'how-to',
      author: 'Data Team',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-15',
      views: 1234,
      searches: 234,
      helpful: 123,
      notHelpful: 3,
      comments: 12,
      relatedDocs: ['Export API', 'Data Limits'],
      tags: ['export', 'data', 'api'],
      popularity: 78
    }
  ]

  const filteredDocs = helpDocs.filter(doc => {
    if (viewMode !== 'all' && doc.status !== viewMode) return false
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
    return true
  })

  const totalDocs = helpDocs.length
  const publishedDocs = helpDocs.filter(d => d.status === 'published').length
  const totalViews = helpDocs.reduce((sum, d) => sum + d.views, 0)
  const avgHelpfulness = (helpDocs.reduce((sum, d) => sum + (d.helpful / (d.helpful + d.notHelpful)), 0) / helpDocs.length) * 100

  const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'review': return 'text-blue-600 bg-blue-50'
      case 'outdated': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: DocCategory) => {
    switch (category) {
      case 'faq': return 'text-blue-600 bg-blue-50'
      case 'how-to': return 'text-green-600 bg-green-50'
      case 'troubleshooting': return 'text-red-600 bg-red-50'
      case 'reference': return 'text-purple-600 bg-purple-50'
      case 'best-practices': return 'text-orange-600 bg-orange-50'
      case 'glossary': return 'text-cyan-600 bg-cyan-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: DocCategory) => {
    switch (category) {
      case 'faq': return <HelpCircle className="w-4 h-4" />
      case 'how-to': return <BookOpen className="w-4 h-4" />
      case 'troubleshooting': return <AlertCircle className="w-4 h-4" />
      case 'reference': return <Folder className="w-4 h-4" />
      case 'best-practices': return <Star className="w-4 h-4" />
      case 'glossary': return <Tag className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
            Help Documentation
          </h1>
          <p className="text-slate-600">Self-service knowledge base and support resources</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Articles',
              value: totalDocs.toString(),
              icon: HelpCircle,
              trend: { value: 12, isPositive: true },
              color: 'sky'
            },
            {
              label: 'Published',
              value: publishedDocs.toString(),
              icon: CheckCircle2,
              trend: { value: 8, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Total Views',
              value: totalViews.toLocaleString(),
              icon: Eye,
              trend: { value: 35, isPositive: true },
              color: 'indigo'
            },
            {
              label: 'Helpfulness',
              value: `${avgHelpfulness.toFixed(0)}%`,
              icon: ThumbsUp,
              trend: { value: 6, isPositive: true },
              color: 'purple'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Article',
              description: 'Create help doc',
              icon: Plus,
              gradient: 'from-sky-500 to-blue-600',
              onClick: () => console.log('New article')
            },
            {
              title: 'Search',
              description: 'Find answers',
              icon: Search,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Search')
            },
            {
              title: 'Categories',
              description: 'Organize docs',
              icon: Folder,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Categories')
            },
            {
              title: 'Analytics',
              description: 'View metrics',
              icon: BarChart3,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Feedback',
              description: 'User responses',
              icon: MessageSquare,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Feedback')
            },
            {
              title: 'Related Links',
              description: 'Manage links',
              icon: Link,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Links')
            },
            {
              title: 'Settings',
              description: 'Configure',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Export',
              description: 'Download docs',
              icon: Download,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Export')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Articles"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Published"
              isActive={viewMode === 'published'}
              onClick={() => setViewMode('published')}
            />
            <PillButton
              label="Draft"
              isActive={viewMode === 'draft'}
              onClick={() => setViewMode('draft')}
            />
            <PillButton
              label="Review"
              isActive={viewMode === 'review'}
              onClick={() => setViewMode('review')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Categories"
              isActive={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
            />
            <PillButton
              label="FAQ"
              isActive={categoryFilter === 'faq'}
              onClick={() => setCategoryFilter('faq')}
            />
            <PillButton
              label="How-To"
              isActive={categoryFilter === 'how-to'}
              onClick={() => setCategoryFilter('how-to')}
            />
            <PillButton
              label="Troubleshooting"
              isActive={categoryFilter === 'troubleshooting'}
              onClick={() => setCategoryFilter('troubleshooting')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Help Docs List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getCategoryIcon(doc.category)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{doc.title}</h3>
                      <p className="text-sm text-slate-600 mb-2 font-medium">{doc.question}</p>
                      <p className="text-sm text-slate-700 mb-2">{doc.answer}</p>
                      <p className="text-xs text-slate-500">Article ID: {doc.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Views</p>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {doc.views.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Searches</p>
                    <div className="flex items-center gap-1">
                      <Search className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {doc.searches.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Comments</p>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-blue-500" />
                      <span className="text-sm font-medium text-slate-900">{doc.comments}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Popularity</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{doc.popularity}%</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Was this helpful?</span>
                    <span className="text-xs font-medium text-slate-900">
                      {((doc.helpful / (doc.helpful + doc.notHelpful)) * 100).toFixed(0)}% found helpful
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{doc.helpful}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{doc.notHelpful}</span>
                    </div>
                  </div>
                </div>

                {doc.relatedDocs.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Related Articles</p>
                    <div className="flex flex-wrap gap-2">
                      {doc.relatedDocs.map((related, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                        >
                          <Link className="w-3 h-3" />
                          {related}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-sky-600 hover:to-blue-700 transition-all">
                    Read Full Article
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Total Views */}
            <MiniKPI
              label="Total Views"
              value={totalViews.toLocaleString()}
              icon={Eye}
              trend={{ value: 35, isPositive: true }}
              className="bg-gradient-to-br from-sky-500 to-blue-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={[
                {
                  id: '1',
                  title: 'Article viewed',
                  description: 'Password reset guide',
                  timestamp: '1 minute ago',
                  type: 'info'
                },
                {
                  id: '2',
                  title: 'Helpful feedback',
                  description: 'API rate limits',
                  timestamp: '15 minutes ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Article updated',
                  description: 'Integration guide',
                  timestamp: '1 hour ago',
                  type: 'info'
                },
                {
                  id: '4',
                  title: 'New comment',
                  description: 'Dashboard troubleshooting',
                  timestamp: '2 hours ago',
                  type: 'info'
                }
              ]}
            />

            {/* Popular Articles */}
            <RankingList
              title="Most Popular"
              items={[
                { label: 'Password Reset', value: '15.7k', rank: 1 },
                { label: 'API Rate Limits', value: '12.8k', rank: 2 },
                { label: 'Integration Guide', value: '8.5k', rank: 3 },
                { label: 'Dashboard Issues', value: '6.2k', rank: 4 },
                { label: 'Security Practices', value: '5.7k', rank: 5 }
              ]}
            />

            {/* Content Quality */}
            <ProgressCard
              title="Content Quality"
              progress={avgHelpfulness}
              subtitle="Based on user feedback"
              color="sky"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
