"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type ArticleStatus = 'published' | 'draft' | 'review' | 'archived' | 'scheduled'
type ArticleType = 'guide' | 'how-to' | 'best-practice' | 'case-study' | 'reference' | 'glossary' | 'concept'
type ArticleLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface KnowledgeArticle {
  id: string
  title: string
  excerpt: string
  type: ArticleType
  status: ArticleStatus
  level: ArticleLevel
  author: string
  contributors: number
  views: number
  likes: number
  bookmarks: number
  shares: number
  comments: number
  readTime: number
  lastUpdated: string
  publishedDate: string
  tags: string[]
  relatedArticles: string[]
  rating: number
  totalRatings: number
}

export default function KnowledgeArticlesPage() {
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ArticleType | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<ArticleLevel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const articles: KnowledgeArticle[] = [
    {
      id: 'article-001',
      title: 'Getting Started with Advanced Analytics',
      excerpt: 'Learn how to leverage our powerful analytics engine to gain insights into your business data and make data-driven decisions.',
      type: 'guide',
      status: 'published',
      level: 'beginner',
      author: 'Sarah Johnson',
      contributors: 5,
      views: 24500,
      likes: 2100,
      bookmarks: 890,
      shares: 345,
      comments: 127,
      readTime: 8,
      lastUpdated: '2024-01-15',
      publishedDate: '2024-01-10',
      tags: ['analytics', 'getting-started', 'data'],
      relatedArticles: ['article-002', 'article-005'],
      rating: 4.8,
      totalRatings: 456
    },
    {
      id: 'article-002',
      title: 'Best Practices for Team Collaboration',
      excerpt: 'Discover proven strategies and tips for enhancing team collaboration and productivity in remote and hybrid work environments.',
      type: 'best-practice',
      status: 'published',
      level: 'intermediate',
      author: 'Michael Chen',
      contributors: 3,
      views: 18900,
      likes: 1650,
      bookmarks: 720,
      shares: 289,
      comments: 94,
      readTime: 12,
      lastUpdated: '2024-01-14',
      publishedDate: '2024-01-08',
      tags: ['collaboration', 'team', 'productivity'],
      relatedArticles: ['article-001', 'article-007'],
      rating: 4.6,
      totalRatings: 382
    },
    {
      id: 'article-003',
      title: 'Complete API Integration Guide',
      excerpt: 'A comprehensive walkthrough of integrating our REST API into your applications, with code examples in multiple languages.',
      type: 'how-to',
      status: 'published',
      level: 'advanced',
      author: 'Emily Rodriguez',
      contributors: 8,
      views: 15600,
      likes: 1420,
      bookmarks: 980,
      shares: 412,
      comments: 156,
      readTime: 15,
      lastUpdated: '2024-01-13',
      publishedDate: '2024-01-05',
      tags: ['api', 'integration', 'development'],
      relatedArticles: ['article-004', 'article-009'],
      rating: 4.9,
      totalRatings: 521
    },
    {
      id: 'article-004',
      title: 'Security Best Practices for Enterprise',
      excerpt: 'Essential security guidelines and configurations for enterprise deployments to ensure data protection and compliance.',
      type: 'best-practice',
      status: 'published',
      level: 'expert',
      author: 'David Kim',
      contributors: 6,
      views: 12300,
      likes: 1180,
      bookmarks: 850,
      shares: 298,
      comments: 89,
      readTime: 18,
      lastUpdated: '2024-01-12',
      publishedDate: '2024-01-03',
      tags: ['security', 'enterprise', 'compliance'],
      relatedArticles: ['article-003', 'article-010'],
      rating: 4.7,
      totalRatings: 294
    },
    {
      id: 'article-005',
      title: 'Understanding Data Visualization Concepts',
      excerpt: 'Core concepts and principles of effective data visualization to help you create meaningful and impactful charts and graphs.',
      type: 'concept',
      status: 'published',
      level: 'beginner',
      author: 'Sarah Johnson',
      contributors: 4,
      views: 10800,
      likes: 920,
      bookmarks: 540,
      shares: 187,
      comments: 62,
      readTime: 10,
      lastUpdated: '2024-01-11',
      publishedDate: '2024-01-02',
      tags: ['visualization', 'data', 'concepts'],
      relatedArticles: ['article-001', 'article-006'],
      rating: 4.5,
      totalRatings: 268
    },
    {
      id: 'article-006',
      title: 'Customer Success Story: Acme Corp',
      excerpt: 'How Acme Corporation increased productivity by 340% and reduced costs by 60% using our platform over 12 months.',
      type: 'case-study',
      status: 'published',
      level: 'intermediate',
      author: 'Michael Chen',
      contributors: 2,
      views: 9400,
      likes: 780,
      bookmarks: 420,
      shares: 234,
      comments: 45,
      readTime: 7,
      lastUpdated: '2024-01-10',
      publishedDate: '2023-12-28',
      tags: ['case-study', 'success', 'productivity'],
      relatedArticles: ['article-002', 'article-008'],
      rating: 4.4,
      totalRatings: 189
    },
    {
      id: 'article-007',
      title: 'Workflow Automation Reference',
      excerpt: 'Complete reference documentation for all available workflow automation triggers, actions, and conditions.',
      type: 'reference',
      status: 'published',
      level: 'intermediate',
      author: 'Emily Rodriguez',
      contributors: 7,
      views: 8200,
      likes: 650,
      bookmarks: 890,
      shares: 156,
      comments: 38,
      readTime: 20,
      lastUpdated: '2024-01-09',
      publishedDate: '2023-12-25',
      tags: ['automation', 'workflow', 'reference'],
      relatedArticles: ['article-002', 'article-011'],
      rating: 4.6,
      totalRatings: 312
    },
    {
      id: 'article-008',
      title: 'How to Set Up Custom Dashboards',
      excerpt: 'Step-by-step instructions for creating and customizing dashboards tailored to your specific business needs and metrics.',
      type: 'how-to',
      status: 'published',
      level: 'beginner',
      author: 'David Kim',
      contributors: 3,
      views: 7600,
      likes: 580,
      bookmarks: 340,
      shares: 123,
      comments: 51,
      readTime: 9,
      lastUpdated: '2024-01-08',
      publishedDate: '2023-12-22',
      tags: ['dashboards', 'customization', 'metrics'],
      relatedArticles: ['article-001', 'article-006'],
      rating: 4.3,
      totalRatings: 227
    },
    {
      id: 'article-009',
      title: 'Technical Glossary: Platform Terms',
      excerpt: 'Comprehensive glossary of technical terms, concepts, and acronyms used throughout the platform and documentation.',
      type: 'glossary',
      status: 'published',
      level: 'beginner',
      author: 'Sarah Johnson',
      contributors: 12,
      views: 6800,
      likes: 490,
      bookmarks: 620,
      shares: 98,
      comments: 24,
      readTime: 25,
      lastUpdated: '2024-01-07',
      publishedDate: '2023-12-20',
      tags: ['glossary', 'terms', 'reference'],
      relatedArticles: ['article-003', 'article-007'],
      rating: 4.2,
      totalRatings: 156
    },
    {
      id: 'article-010',
      title: 'Advanced Security Architecture',
      excerpt: 'Deep dive into our multi-layered security architecture, encryption standards, and compliance certifications.',
      type: 'concept',
      status: 'published',
      level: 'expert',
      author: 'Michael Chen',
      contributors: 5,
      views: 5900,
      likes: 520,
      bookmarks: 780,
      shares: 167,
      comments: 72,
      readTime: 22,
      lastUpdated: '2024-01-06',
      publishedDate: '2023-12-18',
      tags: ['security', 'architecture', 'advanced'],
      relatedArticles: ['article-004', 'article-003'],
      rating: 4.8,
      totalRatings: 298
    },
    {
      id: 'article-011',
      title: 'Building Effective Workflows: A Guide',
      excerpt: 'Learn how to design and implement efficient workflows that automate repetitive tasks and streamline your operations.',
      type: 'guide',
      status: 'published',
      level: 'intermediate',
      author: 'Emily Rodriguez',
      contributors: 4,
      views: 5200,
      likes: 430,
      bookmarks: 290,
      shares: 89,
      comments: 34,
      readTime: 11,
      lastUpdated: '2024-01-05',
      publishedDate: '2023-12-15',
      tags: ['workflow', 'automation', 'guide'],
      relatedArticles: ['article-007', 'article-002'],
      rating: 4.5,
      totalRatings: 203
    },
    {
      id: 'article-012',
      title: 'ROI Measurement Case Study',
      excerpt: 'Detailed analysis of how our customers measure and maximize ROI, with real-world data and success metrics.',
      type: 'case-study',
      status: 'published',
      level: 'advanced',
      author: 'David Kim',
      contributors: 3,
      views: 4600,
      likes: 380,
      bookmarks: 450,
      shares: 156,
      comments: 28,
      readTime: 14,
      lastUpdated: '2024-01-04',
      publishedDate: '2023-12-12',
      tags: ['roi', 'metrics', 'case-study'],
      relatedArticles: ['article-006', 'article-001'],
      rating: 4.7,
      totalRatings: 174
    }
  ]

  const filteredArticles = articles.filter(article => {
    if (statusFilter !== 'all' && article.status !== statusFilter) return false
    if (typeFilter !== 'all' && article.type !== typeFilter) return false
    if (levelFilter !== 'all' && article.level !== levelFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Articles', value: '287', trend: '+24', trendLabel: 'this month' },
    { label: 'Total Views', value: '156K', trend: '+32%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.6/5', trend: '+0.2', trendLabel: 'improvement' },
    { label: 'Total Bookmarks', value: '12.4K', trend: '+18%', trendLabel: 'this week' }
  ]

  const quickActions = [
    { label: 'Create Article', icon: '✍️', onClick: () => console.log('Create Article') },
    { label: 'Import Content', icon: '📥', onClick: () => console.log('Import Content') },
    { label: 'Export Data', icon: '📤', onClick: () => console.log('Export Data') },
    { label: 'Analytics', icon: '📊', onClick: () => console.log('Analytics') },
    { label: 'Categories', icon: '📚', onClick: () => console.log('Categories') },
    { label: 'Contributors', icon: '👥', onClick: () => console.log('Contributors') },
    { label: 'Tags Manager', icon: '🏷️', onClick: () => console.log('Tags Manager') },
    { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') }
  ]

  const recentActivity = [
    { label: 'Article "API Integration Guide" updated', time: '8 min ago', type: 'update' },
    { label: 'New article published by Sarah Johnson', time: '15 min ago', type: 'publish' },
    { label: 'Article "Security Best Practices" received 5-star rating', time: '32 min ago', type: 'rating' },
    { label: '3 articles moved to review status', time: '1 hour ago', type: 'status' },
    { label: 'Article "Data Visualization" bookmarked by 23 users', time: '2 hours ago', type: 'bookmark' },
    { label: 'New contributor added to "Workflow Automation"', time: '3 hours ago', type: 'contributor' }
  ]

  const topArticles = filteredArticles
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((article, index) => ({
      rank: index + 1,
      label: article.title,
      value: article.views.toLocaleString(),
      change: index === 0 ? '+28%' : index === 1 ? '+22%' : index === 2 ? '+18%' : index === 3 ? '+12%' : '+8%'
    }))

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'review': return 'bg-yellow-100 text-yellow-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'archived': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: ArticleType) => {
    switch (type) {
      case 'guide': return 'bg-blue-100 text-blue-700'
      case 'how-to': return 'bg-green-100 text-green-700'
      case 'best-practice': return 'bg-purple-100 text-purple-700'
      case 'case-study': return 'bg-orange-100 text-orange-700'
      case 'reference': return 'bg-pink-100 text-pink-700'
      case 'glossary': return 'bg-indigo-100 text-indigo-700'
      case 'concept': return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelColor = (level: ArticleLevel) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-orange-100 text-orange-700'
      case 'expert': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Knowledge Articles
          </h1>
          <p className="text-gray-600 mt-1">Create and manage your knowledge base content</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Create New Article
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
          <PillButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All Types</PillButton>
          <PillButton active={typeFilter === 'guide'} onClick={() => setTypeFilter('guide')}>Guide</PillButton>
          <PillButton active={typeFilter === 'how-to'} onClick={() => setTypeFilter('how-to')}>How-To</PillButton>
          <PillButton active={typeFilter === 'best-practice'} onClick={() => setTypeFilter('best-practice')}>Best Practice</PillButton>
          <PillButton active={typeFilter === 'case-study'} onClick={() => setTypeFilter('case-study')}>Case Study</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={levelFilter === 'all'} onClick={() => setLevelFilter('all')}>All Levels</PillButton>
          <PillButton active={levelFilter === 'beginner'} onClick={() => setLevelFilter('beginner')}>Beginner</PillButton>
          <PillButton active={levelFilter === 'intermediate'} onClick={() => setLevelFilter('intermediate')}>Intermediate</PillButton>
          <PillButton active={levelFilter === 'advanced'} onClick={() => setLevelFilter('advanced')}>Advanced</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Articles ({filteredArticles.length})</h2>
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
              {filteredArticles.map(article => (
                <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.excerpt}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(article.type)}`}>
                      {article.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(article.level)}`}>
                      {article.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Views</div>
                      <div className="font-semibold">{article.views.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Likes</div>
                      <div className="font-semibold">{article.likes.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Bookmarks</div>
                      <div className="font-semibold">{article.bookmarks.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Shares</div>
                      <div className="font-semibold">{article.shares.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{article.rating}</span>
                      <span className="text-gray-500">({article.totalRatings})</span>
                    </div>
                    <span className="text-gray-500">{article.readTime} min read</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                    <span>By {article.author}</span>
                    <span>{article.contributors} contributors</span>
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
              <MiniKPI label="Published" value="246" />
              <MiniKPI label="In Review" value="28" />
              <MiniKPI label="Drafts" value="13" />
              <MiniKPI label="Contributors" value="42" />
            </div>
          </div>

          {/* Top Articles */}
          <RankingList title="Most Viewed Articles" items={topArticles} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Article Type Distribution */}
          <ProgressCard
            title="Article Type Distribution"
            items={[
              { label: 'Guides', value: 35, color: 'from-blue-400 to-blue-600' },
              { label: 'How-To', value: 28, color: 'from-green-400 to-green-600' },
              { label: 'Best Practices', value: 22, color: 'from-purple-400 to-purple-600' },
              { label: 'Case Studies', value: 15, color: 'from-orange-400 to-orange-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
