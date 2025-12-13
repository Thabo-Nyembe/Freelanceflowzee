'use client'

import { useState } from 'react'
import {
  FileText,
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
  Folder,
  Tag,
  Users,
  Star,
  MessageSquare,
  Download,
  BarChart3,
  Calendar,
  Filter,
  Code,
  Image,
  Video,
  Link
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type DocStatus = 'published' | 'draft' | 'review' | 'archived'
type DocType = 'guide' | 'api-reference' | 'tutorial' | 'concept' | 'quickstart' | 'troubleshooting'
type DocCategory = 'getting-started' | 'features' | 'integrations' | 'api' | 'sdk' | 'advanced'

interface Documentation {
  id: string
  title: string
  description: string
  status: DocStatus
  type: DocType
  category: DocCategory
  author: string
  createdAt: string
  updatedAt: string
  views: number
  likes: number
  comments: number
  helpful: number
  notHelpful: number
  readTime: number
  version: string
  tags: string[]
  contributors: number
}

export default function DocumentationPage() {
  const [viewMode, setViewMode] = useState<'all' | DocStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | DocType>('all')

  const docs: Documentation[] = [
    {
      id: 'DOC-2847',
      title: 'Getting Started with the Platform',
      description: 'Complete guide to setting up your account and getting started',
      status: 'published',
      type: 'guide',
      category: 'getting-started',
      author: 'Documentation Team',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
      views: 12847,
      likes: 847,
      comments: 156,
      helpful: 1234,
      notHelpful: 56,
      readTime: 15,
      version: 'v2.5',
      tags: ['getting-started', 'setup', 'beginner'],
      contributors: 5
    },
    {
      id: 'DOC-2848',
      title: 'REST API Reference',
      description: 'Complete API documentation with endpoints and examples',
      status: 'published',
      type: 'api-reference',
      category: 'api',
      author: 'API Team',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-14',
      views: 8473,
      likes: 567,
      comments: 89,
      helpful: 892,
      notHelpful: 23,
      readTime: 30,
      version: 'v2.0',
      tags: ['api', 'rest', 'reference'],
      contributors: 8
    },
    {
      id: 'DOC-2849',
      title: 'Building Your First Integration',
      description: 'Step-by-step tutorial for creating integrations',
      status: 'published',
      type: 'tutorial',
      category: 'integrations',
      author: 'Integration Team',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-12',
      views: 5678,
      likes: 423,
      comments: 67,
      helpful: 567,
      notHelpful: 12,
      readTime: 20,
      version: 'v2.4',
      tags: ['integrations', 'tutorial', 'webhook'],
      contributors: 3
    },
    {
      id: 'DOC-2850',
      title: 'Understanding Data Models',
      description: 'Deep dive into platform data structures and relationships',
      status: 'review',
      type: 'concept',
      category: 'advanced',
      author: 'Engineering Team',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-15',
      views: 2345,
      likes: 178,
      comments: 34,
      helpful: 234,
      notHelpful: 8,
      readTime: 25,
      version: 'v2.5',
      tags: ['data', 'models', 'advanced'],
      contributors: 4
    },
    {
      id: 'DOC-2851',
      title: 'Quick Start: Dashboard Setup',
      description: '5-minute guide to setting up your first dashboard',
      status: 'published',
      type: 'quickstart',
      category: 'features',
      author: 'Product Team',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10',
      views: 9234,
      likes: 678,
      comments: 123,
      helpful: 1045,
      notHelpful: 34,
      readTime: 5,
      version: 'v2.4',
      tags: ['quickstart', 'dashboard', 'setup'],
      contributors: 2
    },
    {
      id: 'DOC-2852',
      title: 'Troubleshooting Common Issues',
      description: 'Solutions to frequently encountered problems',
      status: 'published',
      type: 'troubleshooting',
      category: 'getting-started',
      author: 'Support Team',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-14',
      views: 15678,
      likes: 1234,
      comments: 234,
      helpful: 1567,
      notHelpful: 78,
      readTime: 12,
      version: 'v2.5',
      tags: ['troubleshooting', 'faq', 'support'],
      contributors: 6
    },
    {
      id: 'DOC-2853',
      title: 'Advanced SDK Integration',
      description: 'Comprehensive guide to using our JavaScript SDK',
      status: 'draft',
      type: 'guide',
      category: 'sdk',
      author: 'SDK Team',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-15',
      views: 456,
      likes: 34,
      comments: 5,
      helpful: 45,
      notHelpful: 2,
      readTime: 35,
      version: 'v3.0',
      tags: ['sdk', 'javascript', 'advanced'],
      contributors: 3
    }
  ]

  const filteredDocs = docs.filter(doc => {
    if (viewMode !== 'all' && doc.status !== viewMode) return false
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false
    return true
  })

  const totalDocs = docs.length
  const publishedDocs = docs.filter(d => d.status === 'published').length
  const totalViews = docs.reduce((sum, d) => sum + d.views, 0)
  const avgHelpfulRate = docs.reduce((sum, d) => sum + (d.helpful / (d.helpful + d.notHelpful)), 0) / docs.length * 100

  const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'review': return 'text-blue-600 bg-blue-50'
      case 'archived': return 'text-slate-600 bg-slate-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: DocType) => {
    switch (type) {
      case 'guide': return 'text-blue-600 bg-blue-50'
      case 'api-reference': return 'text-purple-600 bg-purple-50'
      case 'tutorial': return 'text-green-600 bg-green-50'
      case 'concept': return 'text-orange-600 bg-orange-50'
      case 'quickstart': return 'text-cyan-600 bg-cyan-50'
      case 'troubleshooting': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-900 via-purple-800 to-fuchsia-900 bg-clip-text text-transparent mb-2">
            Documentation
          </h1>
          <p className="text-slate-600">Manage knowledge base, guides, and API references</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Docs',
              value: totalDocs.toString(),
              icon: FileText,
              trend: { value: 15, isPositive: true },
              color: 'violet'
            },
            {
              label: 'Published',
              value: publishedDocs.toString(),
              icon: CheckCircle2,
              trend: { value: 12, isPositive: true },
              color: 'purple'
            },
            {
              label: 'Total Views',
              value: totalViews.toLocaleString(),
              icon: Eye,
              trend: { value: 25, isPositive: true },
              color: 'fuchsia'
            },
            {
              label: 'Helpful Rate',
              value: `${avgHelpfulRate.toFixed(0)}%`,
              icon: Star,
              trend: { value: 5, isPositive: true },
              color: 'pink'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Document',
              description: 'Create doc',
              icon: Plus,
              gradient: 'from-violet-500 to-purple-600',
              onClick: () => console.log('New doc')
            },
            {
              title: 'Search Docs',
              description: 'Find content',
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
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Contributors',
              description: 'Manage team',
              icon: Users,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Contributors')
            },
            {
              title: 'Versions',
              description: 'Version control',
              icon: Code,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Versions')
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
              label="All Docs"
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
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Guides"
              isActive={typeFilter === 'guide'}
              onClick={() => setTypeFilter('guide')}
            />
            <PillButton
              label="Tutorials"
              isActive={typeFilter === 'tutorial'}
              onClick={() => setTypeFilter('tutorial')}
            />
            <PillButton
              label="API Docs"
              isActive={typeFilter === 'api-reference'}
              onClick={() => setTypeFilter('api-reference')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Documentation List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-violet-600" />
                      <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{doc.description}</p>
                    <p className="text-xs text-slate-500">Doc ID: {doc.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                      {doc.type}
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
                    <p className="text-xs text-slate-500 mb-1">Likes</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm font-medium text-slate-900">{doc.likes}</span>
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
                    <p className="text-xs text-slate-500 mb-1">Read Time</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{doc.readTime} min</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Author</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{doc.author}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Contributors</p>
                    <span className="text-sm font-medium text-slate-900">{doc.contributors}</span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Version</p>
                    <span className="text-sm font-medium text-violet-700">{doc.version}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Helpful Rating</span>
                    <span className="text-xs font-medium text-slate-900">
                      {((doc.helpful / (doc.helpful + doc.notHelpful)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{doc.helpful}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span>{doc.notHelpful}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all">
                    Read Doc
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
              trend={{ value: 25, isPositive: true }}
              className="bg-gradient-to-br from-violet-500 to-purple-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Updates"
              activities={[
                {
                  id: '1',
                  title: 'Doc updated',
                  description: 'Getting Started guide',
                  timestamp: '2 hours ago',
                  type: 'info'
                },
                {
                  id: '2',
                  title: 'New doc published',
                  description: 'Troubleshooting guide',
                  timestamp: '1 day ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Doc in review',
                  description: 'Data Models concept',
                  timestamp: '2 days ago',
                  type: 'info'
                },
                {
                  id: '4',
                  title: 'New contributor',
                  description: 'SDK Team joined',
                  timestamp: '3 days ago',
                  type: 'success'
                }
              ]}
            />

            {/* Top Documents */}
            <RankingList
              title="Most Viewed"
              items={[
                { label: 'Troubleshooting', value: '15.7k', rank: 1 },
                { label: 'Getting Started', value: '12.8k', rank: 2 },
                { label: 'Quick Start', value: '9.2k', rank: 3 },
                { label: 'API Reference', value: '8.5k', rank: 4 },
                { label: 'Integration Guide', value: '5.7k', rank: 5 }
              ]}
            />

            {/* Documentation Health */}
            <ProgressCard
              title="Doc Quality Score"
              progress={avgHelpfulRate}
              subtitle="Based on user feedback"
              color="violet"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
