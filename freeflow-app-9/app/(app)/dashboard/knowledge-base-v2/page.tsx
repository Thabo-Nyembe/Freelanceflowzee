"use client"

import { useState } from 'react'
import {
  BookOpen,
  FileText,
  Search,
  ThumbsUp,
  Eye,
  Star,
  TrendingUp,
  MessageSquare,
  Plus,
  Download,
  Edit,
  Calendar,
  Filter,
  Award,
  Users,
  Zap,
  CheckCircle2,
  HelpCircle,
  Code,
  Video,
  Image as ImageIcon
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ArticleCategory = 'all' | 'getting-started' | 'tutorials' | 'api' | 'troubleshooting' | 'best-practices'
type ArticleType = 'all' | 'article' | 'video' | 'guide' | 'faq'

export default function KnowledgeBaseV2Page() {
  const [category, setCategory] = useState<ArticleCategory>('all')
  const [articleType, setArticleType] = useState<ArticleType>('all')

  const stats = [
    {
      label: 'Total Articles',
      value: '847',
      change: '+18.2%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'text-indigo-600'
    },
    {
      label: 'Total Views',
      value: '284.7K',
      change: '+24.8%',
      trend: 'up' as const,
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      label: 'Avg Rating',
      value: '4.7/5',
      change: '+8.4%',
      trend: 'up' as const,
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Helpful Rate',
      value: '92.4%',
      change: '+12.5%',
      trend: 'up' as const,
      icon: ThumbsUp,
      color: 'text-green-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Article',
      description: 'Create knowledge article',
      icon: Plus,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Search Articles',
      description: 'Find documentation',
      icon: Search,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Upload Video',
      description: 'Add video tutorial',
      icon: Video,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Export KB',
      description: 'Download all articles',
      icon: Download,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Analytics',
      description: 'View KB performance',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Categories',
      description: 'Manage categories',
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Contributors',
      description: 'Manage KB team',
      icon: Users,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'AI Suggest',
      description: 'Get AI recommendations',
      icon: Zap,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const articles = [
    {
      id: 'KB-2847',
      title: 'Getting Started with the Platform',
      description: 'A comprehensive guide to help you get started with our platform and understand the basics',
      category: 'getting-started',
      type: 'guide',
      author: 'Sarah Johnson',
      views: 12847,
      rating: 4.9,
      helpful: 847,
      notHelpful: 23,
      lastUpdated: '2024-02-10',
      readTime: '8 min',
      status: 'published',
      tags: ['beginner', 'setup', 'onboarding']
    },
    {
      id: 'KB-2846',
      title: 'API Authentication Best Practices',
      description: 'Learn how to securely authenticate API requests using OAuth 2.0 and API keys',
      category: 'api',
      type: 'article',
      author: 'Michael Chen',
      views: 8470,
      rating: 4.8,
      helpful: 524,
      notHelpful: 12,
      lastUpdated: '2024-02-12',
      readTime: '12 min',
      status: 'published',
      tags: ['api', 'security', 'oauth']
    },
    {
      id: 'KB-2845',
      title: 'Building Your First Integration',
      description: 'Step-by-step tutorial on creating your first integration with our platform',
      category: 'tutorials',
      type: 'video',
      author: 'David Park',
      views: 6284,
      rating: 4.7,
      helpful: 412,
      notHelpful: 8,
      lastUpdated: '2024-02-08',
      readTime: '15 min',
      status: 'published',
      tags: ['integration', 'tutorial', 'video']
    },
    {
      id: 'KB-2844',
      title: 'Troubleshooting Connection Errors',
      description: 'Common connection errors and how to resolve them quickly',
      category: 'troubleshooting',
      type: 'article',
      author: 'Emma Wilson',
      views: 5847,
      rating: 4.6,
      helpful: 384,
      notHelpful: 15,
      lastUpdated: '2024-02-14',
      readTime: '6 min',
      status: 'published',
      tags: ['troubleshooting', 'errors', 'debugging']
    },
    {
      id: 'KB-2843',
      title: 'Data Security and Compliance',
      description: 'Understanding our security measures and compliance certifications',
      category: 'best-practices',
      type: 'guide',
      author: 'Lisa Anderson',
      views: 4920,
      rating: 4.9,
      helpful: 456,
      notHelpful: 5,
      lastUpdated: '2024-02-05',
      readTime: '10 min',
      status: 'published',
      tags: ['security', 'compliance', 'gdpr']
    },
    {
      id: 'KB-2842',
      title: 'Advanced Dashboard Customization',
      description: 'Learn how to customize your dashboard with widgets and layouts',
      category: 'tutorials',
      type: 'article',
      author: 'Robert Taylor',
      views: 4280,
      rating: 4.5,
      helpful: 312,
      notHelpful: 18,
      lastUpdated: '2024-02-11',
      readTime: '14 min',
      status: 'published',
      tags: ['dashboard', 'customization', 'ui']
    },
    {
      id: 'KB-2841',
      title: 'Frequently Asked Questions',
      description: 'Answers to the most common questions about our platform',
      category: 'getting-started',
      type: 'faq',
      author: 'James Martinez',
      views: 15280,
      rating: 4.4,
      helpful: 892,
      notHelpful: 47,
      lastUpdated: '2024-02-15',
      readTime: '5 min',
      status: 'published',
      tags: ['faq', 'common', 'quick-answers']
    },
    {
      id: 'KB-2840',
      title: 'Rate Limiting and Throttling',
      description: 'Understanding API rate limits and how to handle throttling',
      category: 'api',
      type: 'article',
      author: 'Sarah Johnson',
      views: 3847,
      rating: 4.7,
      helpful: 284,
      notHelpful: 9,
      lastUpdated: '2024-02-07',
      readTime: '9 min',
      status: 'published',
      tags: ['api', 'rate-limiting', 'performance']
    },
    {
      id: 'KB-2839',
      title: 'Team Collaboration Features',
      description: 'Maximize productivity with team collaboration tools and features',
      category: 'best-practices',
      type: 'video',
      author: 'Michael Chen',
      views: 7290,
      rating: 4.8,
      helpful: 528,
      notHelpful: 14,
      lastUpdated: '2024-02-13',
      readTime: '18 min',
      status: 'published',
      tags: ['collaboration', 'teams', 'productivity']
    },
    {
      id: 'KB-2838',
      title: 'Webhook Setup and Testing',
      description: 'Complete guide to setting up and testing webhooks for real-time events',
      category: 'tutorials',
      type: 'guide',
      author: 'Emma Wilson',
      views: 5120,
      rating: 4.6,
      helpful: 394,
      notHelpful: 11,
      lastUpdated: '2024-02-06',
      readTime: '11 min',
      status: 'published',
      tags: ['webhooks', 'events', 'integration']
    }
  ]

  const filteredArticles = articles.filter(article => {
    const categoryMatch = category === 'all' || article.category === category
    const typeMatch = articleType === 'all' || article.type === articleType
    return categoryMatch && typeMatch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return FileText
      case 'video':
        return Video
      case 'guide':
        return BookOpen
      case 'faq':
        return HelpCircle
      default:
        return FileText
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'video':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'guide':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'faq':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return 'text-green-600'
    if (rating >= 4.5) return 'text-blue-600'
    if (rating >= 4.0) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getHelpfulRate = (helpful: number, notHelpful: number) => {
    const total = helpful + notHelpful
    if (total === 0) return 0
    return ((helpful / total) * 100).toFixed(1)
  }

  const recentActivity = [
    { label: 'New article published', time: '2 hours ago', color: 'text-green-600' },
    { label: 'Video tutorial updated', time: '5 hours ago', color: 'text-blue-600' },
    { label: 'High rating received', time: '1 day ago', color: 'text-yellow-600' },
    { label: 'FAQ expanded', time: '2 days ago', color: 'text-purple-600' },
    { label: 'Category reorganized', time: '3 days ago', color: 'text-orange-600' }
  ]

  const topArticles = [
    { label: 'Getting Started Guide', value: '12.8K views', color: 'bg-indigo-500' },
    { label: 'FAQ Collection', value: '15.3K views', color: 'bg-blue-500' },
    { label: 'API Authentication', value: '8.5K views', color: 'bg-purple-500' },
    { label: 'Team Collaboration', value: '7.3K views', color: 'bg-green-500' },
    { label: 'First Integration', value: '6.3K views', color: 'bg-cyan-500' }
  ]

  const articleGrowthData = {
    label: 'KB Growth Target',
    current: 847,
    target: 1000,
    subtitle: '84.7% of target reached'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Knowledge Base
            </h1>
            <p className="text-gray-600 mt-2">Manage documentation and help articles</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Article
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setCategory('all')}
                  isActive={category === 'all'}
                  variant="default"
                >
                  All Categories
                </PillButton>
                <PillButton
                  onClick={() => setCategory('getting-started')}
                  isActive={category === 'getting-started'}
                  variant="default"
                >
                  Getting Started
                </PillButton>
                <PillButton
                  onClick={() => setCategory('tutorials')}
                  isActive={category === 'tutorials'}
                  variant="default"
                >
                  Tutorials
                </PillButton>
                <PillButton
                  onClick={() => setCategory('api')}
                  isActive={category === 'api'}
                  variant="default"
                >
                  API
                </PillButton>
                <PillButton
                  onClick={() => setCategory('troubleshooting')}
                  isActive={category === 'troubleshooting'}
                  variant="default"
                >
                  Troubleshooting
                </PillButton>
                <PillButton
                  onClick={() => setCategory('best-practices')}
                  isActive={category === 'best-practices'}
                  variant="default"
                >
                  Best Practices
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Content Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setArticleType('all')}
                  isActive={articleType === 'all'}
                  variant="default"
                >
                  All Types
                </PillButton>
                <PillButton
                  onClick={() => setArticleType('article')}
                  isActive={articleType === 'article'}
                  variant="default"
                >
                  Articles
                </PillButton>
                <PillButton
                  onClick={() => setArticleType('video')}
                  isActive={articleType === 'video'}
                  variant="default"
                >
                  Videos
                </PillButton>
                <PillButton
                  onClick={() => setArticleType('guide')}
                  isActive={articleType === 'guide'}
                  variant="default"
                >
                  Guides
                </PillButton>
                <PillButton
                  onClick={() => setArticleType('faq')}
                  isActive={articleType === 'faq'}
                  variant="default"
                >
                  FAQs
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Knowledge Articles</h2>
              <div className="text-sm text-gray-600">
                {filteredArticles.length} articles
              </div>
            </div>

            <div className="space-y-3">
              {filteredArticles.map((article) => {
                const TypeIcon = getTypeIcon(article.type)
                const helpfulRate = getHelpfulRate(article.helpful, article.notHelpful)

                return (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-indigo-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white">
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{article.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{article.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">{article.category.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getTypeBadge(article.type)}`}>
                        {article.type}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{article.description}</p>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Author</div>
                        <div className="font-medium text-gray-900 text-sm">{article.author}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Views</div>
                        <div className="font-medium text-gray-900 text-sm">{article.views.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Rating</div>
                        <div className={`font-medium text-sm flex items-center gap-1 ${getRatingColor(article.rating)}`}>
                          <Star className="w-3 h-3 fill-current" />
                          {article.rating}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Helpful</div>
                        <div className="font-medium text-green-600 text-sm">{helpfulRate}%</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">Updated: {article.lastUpdated}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{article.readTime} read</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1">
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={articleGrowthData.label}
              current={articleGrowthData.current}
              target={articleGrowthData.target}
              subtitle={articleGrowthData.subtitle}
            />

            <MiniKPI
              title="Avg Helpful Rate"
              value="92.4%"
              change="+12.5%"
              trend="up"
              subtitle="Across all articles"
            />

            <RankingList
              title="Most Popular"
              items={topArticles}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
