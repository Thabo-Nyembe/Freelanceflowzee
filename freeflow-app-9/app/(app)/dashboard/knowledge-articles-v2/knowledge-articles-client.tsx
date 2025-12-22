'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import { useKnowledgeArticles, KnowledgeArticle, KnowledgeArticleStats } from '@/lib/hooks/use-knowledge-articles'
import { createKnowledgeArticle, updateKnowledgeArticle, deleteKnowledgeArticle, publishKnowledgeArticle, archiveKnowledgeArticle } from '@/app/actions/knowledge-articles'

type ArticleStatus = 'published' | 'draft' | 'review' | 'archived' | 'scheduled'
type ArticleType = 'guide' | 'how-to' | 'best-practice' | 'case-study' | 'reference' | 'glossary' | 'concept'
type ArticleLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface KnowledgeArticlesClientProps {
  initialArticles: KnowledgeArticle[]
  initialStats: KnowledgeArticleStats
}

export default function KnowledgeArticlesClient({ initialArticles, initialStats }: KnowledgeArticlesClientProps) {
  const { articles, stats, createArticle, updateArticle, deleteArticle } = useKnowledgeArticles(initialArticles, initialStats)
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ArticleType | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<ArticleLevel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    article_type: 'guide' as ArticleType,
    status: 'draft' as ArticleStatus,
    level: 'beginner' as ArticleLevel,
    read_time_minutes: 5,
    tags: [] as string[]
  })

  const filteredArticles = articles.filter(article => {
    if (statusFilter !== 'all' && article.status !== statusFilter) return false
    if (typeFilter !== 'all' && article.article_type !== typeFilter) return false
    if (levelFilter !== 'all' && article.level !== levelFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Articles', value: stats.total.toString(), trend: `+${stats.published}`, trendLabel: 'published' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), trend: '+12%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: `${stats.avgRating.toFixed(1)}/5`, trend: '+0.2', trendLabel: 'improvement' },
    { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), trend: '+18%', trendLabel: 'this week' }
  ]

  const handleCreateArticle = async () => {
    try {
      await createKnowledgeArticle(formData)
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create article:', error)
    }
  }

  const handleUpdateArticle = async () => {
    if (!editingArticle) return
    try {
      await updateKnowledgeArticle(editingArticle.id, formData)
      setEditingArticle(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update article:', error)
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteKnowledgeArticle(id)
      } catch (error) {
        console.error('Failed to delete article:', error)
      }
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await publishKnowledgeArticle(id)
    } catch (error) {
      console.error('Failed to publish article:', error)
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveKnowledgeArticle(id)
    } catch (error) {
      console.error('Failed to archive article:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      article_type: 'guide',
      status: 'draft',
      level: 'beginner',
      read_time_minutes: 5,
      tags: []
    })
  }

  const openEditModal = (article: KnowledgeArticle) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content || '',
      article_type: article.article_type,
      status: article.status,
      level: article.level,
      read_time_minutes: article.read_time_minutes,
      tags: article.tags || []
    })
  }

  const quickActions = [
    { label: 'Create Article', icon: '✍️', onClick: () => setShowCreateModal(true) },
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
    { label: 'New article published', time: '15 min ago', type: 'publish' },
    { label: 'Article received 5-star rating', time: '32 min ago', type: 'rating' },
    { label: '3 articles moved to review', time: '1 hour ago', type: 'status' },
    { label: 'Article bookmarked by 23 users', time: '2 hours ago', type: 'bookmark' }
  ]

  const topArticles = filteredArticles
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)
    .map((article, index) => ({
      rank: index + 1,
      label: article.title,
      value: (article.views_count || 0).toLocaleString(),
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          Create New Article
        </button>
      </div>

      {/* Stats Grid */}
      <StatGrid stats={statsDisplay} />

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

            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No articles found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Article
                </button>
              </div>
            ) : (
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(article.article_type)}`}>
                        {article.article_type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(article.level)}`}>
                        {article.level}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-xs">
                        <div className="text-gray-500">Views</div>
                        <div className="font-semibold">{(article.views_count || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Likes</div>
                        <div className="font-semibold">{(article.likes_count || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Bookmarks</div>
                        <div className="font-semibold">{(article.bookmarks_count || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Shares</div>
                        <div className="font-semibold">{(article.shares_count || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{article.rating || 0}</span>
                        <span className="text-gray-500">({article.total_ratings || 0})</span>
                      </div>
                      <span className="text-gray-500">{article.read_time_minutes} min read</span>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => openEditModal(article)}
                        className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      {article.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(article.id)}
                          className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100"
                        >
                          Publish
                        </button>
                      )}
                      {article.status === 'published' && (
                        <button
                          onClick={() => handleArchive(article.id)}
                          className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded text-xs font-medium hover:bg-yellow-100"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Published" value={stats.published.toString()} />
              <MiniKPI label="In Review" value={stats.review.toString()} />
              <MiniKPI label="Drafts" value={stats.draft.toString()} />
              <MiniKPI label="Archived" value={stats.archived.toString()} />
            </div>
          </div>

          <RankingList title="Most Viewed Articles" items={topArticles} />
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingArticle) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingArticle ? 'Edit Article' : 'Create New Article'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Brief summary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={6}
                  placeholder="Article content"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.article_type}
                    onChange={(e) => setFormData({ ...formData, article_type: e.target.value as ArticleType })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="guide">Guide</option>
                    <option value="how-to">How-To</option>
                    <option value="best-practice">Best Practice</option>
                    <option value="case-study">Case Study</option>
                    <option value="reference">Reference</option>
                    <option value="glossary">Glossary</option>
                    <option value="concept">Concept</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as ArticleLevel })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Read Time (min)</label>
                  <input
                    type="number"
                    value={formData.read_time_minutes}
                    onChange={(e) => setFormData({ ...formData, read_time_minutes: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={1}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingArticle(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={editingArticle ? handleUpdateArticle : handleCreateArticle}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingArticle ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
