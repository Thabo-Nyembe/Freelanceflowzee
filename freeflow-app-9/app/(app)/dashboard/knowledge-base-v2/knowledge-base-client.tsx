'use client'

import { useState } from 'react'
import { useKnowledgeBase, type KnowledgeBaseArticle, type ArticleCategory, type ArticleType, type ArticleStatus } from '@/lib/hooks/use-knowledge-base'
import {
  BookOpen,
  FileText,
  Search,
  ThumbsUp,
  Eye,
  Star,
  TrendingUp,
  Plus,
  Download,
  Edit,
  Users,
  Zap,
  HelpCircle,
  Video
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

export default function KnowledgeBaseClient({ initialArticles }: { initialArticles: KnowledgeBaseArticle[] }) {
  const [category, setCategory] = useState<ArticleCategory | 'all'>('all')
  const [articleType, setArticleType] = useState<ArticleType | 'all'>('all')
  const { articles, loading, error } = useKnowledgeBase({
    category: category !== 'all' ? category : undefined,
    type: articleType !== 'all' ? articleType : undefined
  })

  const displayArticles = articles.length > 0 ? articles : initialArticles

  const filteredArticles = displayArticles.filter(article => {
    const categoryMatch = category === 'all' || article.category === category
    const typeMatch = articleType === 'all' || article.article_type === articleType
    return categoryMatch && typeMatch
  })

  const totalViews = filteredArticles.reduce((sum, a) => sum + (a.view_count || 0), 0)
  const avgRating = filteredArticles.length > 0
    ? filteredArticles.reduce((sum, a) => sum + (a.rating || 0), 0) / filteredArticles.length
    : 0
  const avgHelpfulRate = filteredArticles.length > 0
    ? filteredArticles.reduce((sum, a) => sum + (a.helpful_percentage || 0), 0) / filteredArticles.length
    : 0

  const stats = [
    {
      label: 'Total Articles',
      value: filteredArticles.length.toString(),
      change: '+18.2%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'text-indigo-600'
    },
    {
      label: 'Total Views',
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(),
      change: '+24.8%',
      trend: 'up' as const,
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      label: 'Avg Rating',
      value: `${avgRating.toFixed(1)}/5`,
      change: '+8.4%',
      trend: 'up' as const,
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Helpful Rate',
      value: `${avgHelpfulRate.toFixed(1)}%`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: ThumbsUp,
      color: 'text-green-600'
    }
  ]

  const quickActions = [
    { label: 'New Article', description: 'Create knowledge article', icon: Plus, color: 'from-indigo-500 to-purple-500' },
    { label: 'Search Articles', description: 'Find documentation', icon: Search, color: 'from-blue-500 to-cyan-500' },
    { label: 'Upload Video', description: 'Add video tutorial', icon: Video, color: 'from-red-500 to-pink-500' },
    { label: 'Export KB', description: 'Download all articles', icon: Download, color: 'from-green-500 to-emerald-500' },
    { label: 'Analytics', description: 'View KB performance', icon: TrendingUp, color: 'from-orange-500 to-amber-500' },
    { label: 'Categories', description: 'Manage categories', icon: BookOpen, color: 'from-teal-500 to-cyan-500' },
    { label: 'Contributors', description: 'Manage KB team', icon: Users, color: 'from-purple-500 to-violet-500' },
    { label: 'AI Suggest', description: 'Get AI recommendations', icon: Zap, color: 'from-pink-500 to-rose-500' }
  ]

  const getTypeIcon = (type: ArticleType) => {
    switch (type) {
      case 'article': return FileText
      case 'video': return Video
      case 'guide': return BookOpen
      case 'faq': return HelpCircle
      case 'tutorial': return BookOpen
      case 'reference': return FileText
      default: return FileText
    }
  }

  const getTypeBadge = (type: ArticleType) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'video': return 'bg-red-100 text-red-800 border-red-200'
      case 'guide': return 'bg-green-100 text-green-800 border-green-200'
      case 'faq': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'tutorial': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'reference': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
    if (total === 0) return '0.0'
    return ((helpful / total) * 100).toFixed(1)
  }

  const recentActivity = [
    { label: 'New article published', time: '2 hours ago', color: 'text-green-600' },
    { label: 'Video tutorial updated', time: '5 hours ago', color: 'text-blue-600' },
    { label: 'High rating received', time: '1 day ago', color: 'text-yellow-600' },
    { label: 'FAQ expanded', time: '2 days ago', color: 'text-purple-600' },
    { label: 'Category reorganized', time: '3 days ago', color: 'text-orange-600' }
  ]

  const topArticles = filteredArticles
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5)
    .map((article, index) => ({
      label: article.article_title,
      value: `${((article.view_count || 0) / 1000).toFixed(1)}K views`,
      color: ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-cyan-500'][index]
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
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

        <StatGrid stats={stats} />

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <PillButton onClick={() => setCategory('all')} isActive={category === 'all'} variant="default">All Categories</PillButton>
                <PillButton onClick={() => setCategory('getting-started')} isActive={category === 'getting-started'} variant="default">Getting Started</PillButton>
                <PillButton onClick={() => setCategory('tutorials')} isActive={category === 'tutorials'} variant="default">Tutorials</PillButton>
                <PillButton onClick={() => setCategory('api')} isActive={category === 'api'} variant="default">API</PillButton>
                <PillButton onClick={() => setCategory('troubleshooting')} isActive={category === 'troubleshooting'} variant="default">Troubleshooting</PillButton>
                <PillButton onClick={() => setCategory('best-practices')} isActive={category === 'best-practices'} variant="default">Best Practices</PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Content Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton onClick={() => setArticleType('all')} isActive={articleType === 'all'} variant="default">All Types</PillButton>
                <PillButton onClick={() => setArticleType('article')} isActive={articleType === 'article'} variant="default">Articles</PillButton>
                <PillButton onClick={() => setArticleType('video')} isActive={articleType === 'video'} variant="default">Videos</PillButton>
                <PillButton onClick={() => setArticleType('guide')} isActive={articleType === 'guide'} variant="default">Guides</PillButton>
                <PillButton onClick={() => setArticleType('faq')} isActive={articleType === 'faq'} variant="default">FAQs</PillButton>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Knowledge Articles</h2>
              <div className="text-sm text-gray-600">{filteredArticles.length} articles</div>
            </div>

            <div className="space-y-3">
              {filteredArticles.map((article) => {
                const TypeIcon = getTypeIcon(article.article_type)
                const helpfulRate = getHelpfulRate(article.helpful_count || 0, article.not_helpful_count || 0)

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
                          <h3 className="font-semibold text-gray-900">{article.article_title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{article.id.substring(0, 8)}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">{article.category?.replace('-', ' ') || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getTypeBadge(article.article_type)}`}>
                        {article.article_type}
                      </div>
                    </div>

                    {article.description && (
                      <p className="text-sm text-gray-600 mb-4">{article.description}</p>
                    )}

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Author</div>
                        <div className="font-medium text-gray-900 text-sm">{article.author || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Views</div>
                        <div className="font-medium text-gray-900 text-sm">{(article.view_count || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Rating</div>
                        <div className={`font-medium text-sm flex items-center gap-1 ${getRatingColor(article.rating || 0)}`}>
                          <Star className="w-3 h-3 fill-current" />
                          {(article.rating || 0).toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Helpful</div>
                        <div className="font-medium text-green-600 text-sm">{helpfulRate}%</div>
                      </div>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Updated: {article.last_updated_at
                            ? new Date(article.last_updated_at).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{article.read_time_minutes || 5} min read</span>
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

              {filteredArticles.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Articles</h3>
                  <p className="text-gray-500">Create your first knowledge base article</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <ProgressCard
              label="KB Growth Target"
              current={filteredArticles.length}
              target={1000}
              subtitle={`${((filteredArticles.length / 1000) * 100).toFixed(1)}% of target reached`}
            />

            <MiniKPI
              title="Avg Helpful Rate"
              value={`${avgHelpfulRate.toFixed(1)}%`}
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
