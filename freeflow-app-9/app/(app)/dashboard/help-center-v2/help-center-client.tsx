'use client'

import { useState } from 'react'
import { useHelpArticles, useHelpCategories, HelpArticle, HelpStats } from '@/lib/hooks/use-help-articles'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  BookOpen,
  Search,
  FileText,
  Video,
  MessageSquare,
  ThumbsUp,
  Eye,
  TrendingUp,
  Zap,
  Award,
  HelpCircle,
  Lightbulb,
  Plus,
  Loader2,
  Users
} from 'lucide-react'

interface HelpCenterClientProps {
  initialArticles: HelpArticle[]
  initialStats: HelpStats
}

export default function HelpCenterClient({ initialArticles, initialStats }: HelpCenterClientProps) {
  const {
    articles,
    loading,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    archiveArticle,
    getStats
  } = useHelpArticles()

  const { categories } = useHelpCategories()

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guide' | 'tutorial' | 'faq'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Use real-time data if available, otherwise initial data
  const displayArticles = articles.length > 0 ? articles : initialArticles
  const stats = articles.length > 0 ? getStats() : initialStats

  // Filter articles
  const filteredArticles = displayArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' ||
      article.tags?.includes(selectedCategory) ||
      (selectedCategory === 'guide' && article.visibility === 'public') ||
      (selectedCategory === 'tutorial' && article.tags?.includes('tutorial')) ||
      (selectedCategory === 'faq' && article.tags?.includes('faq'))
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categoryList = [
    { name: 'Getting Started', articles: 124, icon: <Zap className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Features & Guides', articles: 247, icon: <BookOpen className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { name: 'Video Tutorials', articles: 89, icon: <Video className="w-5 h-5" />, color: 'from-orange-500 to-red-500' },
    { name: 'FAQs', articles: 342, icon: <HelpCircle className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { name: 'Troubleshooting', articles: 156, icon: <Lightbulb className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500' }
  ]

  const topArticles = displayArticles
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)
    .map((article, index) => ({
      rank: index + 1,
      name: article.title,
      avatar: ['📚', '⚙️', '💰', '👥', '🔗'][index] || '📄',
      value: `${(article.view_count / 1000).toFixed(1)}K`,
      change: 10 + Math.random() * 30
    }))

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'guide': return 'bg-blue-100 text-blue-700'
      case 'tutorial': return 'bg-purple-100 text-purple-700'
      case 'faq': return 'bg-green-100 text-green-700'
      case 'video': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getHelpfulColor = (rating: number) => {
    if (rating >= 90) return 'text-green-600'
    if (rating >= 80) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getArticleColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-yellow-500 to-amber-500',
      'from-indigo-500 to-purple-500'
    ]
    return colors[index % colors.length]
  }

  const handleCreateArticle = async () => {
    try {
      await createArticle({
        title: 'New Article',
        slug: 'new-article-' + Date.now(),
        content: 'Article content here...',
        status: 'draft',
        visibility: 'public',
        tags: [],
        metadata: {}
      })
    } catch (error) {
      console.error('Failed to create article:', error)
    }
  }

  const statItems = [
    { label: 'Total Articles', value: stats.totalArticles.toString(), change: 25.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Monthly Views', value: `${(stats.totalViews / 1000).toFixed(0)}K`, change: 42.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Helpful Rating', value: `${Math.round(stats.helpfulPercentage)}%`, change: 12.5, icon: <ThumbsUp className="w-5 h-5" /> },
    { label: 'Published', value: stats.publishedArticles.toString(), change: 8.3, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-blue-600" />
              Help Center
            </h1>
            <p className="text-muted-foreground">Knowledge base and self-service documentation</p>
          </div>
          <GradientButton from="blue" to="indigo" onClick={handleCreateArticle}>
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            New Article
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<FileText />} title="Articles" description={`${stats.totalArticles} total`} onClick={() => {}} />
          <BentoQuickAction icon={<Video />} title="Videos" description="Tutorials" onClick={() => {}} />
          <BentoQuickAction icon={<MessageSquare />} title="Community" description="Discussions" onClick={() => {}} />
          <BentoQuickAction icon={<Award />} title="Analytics" description="Performance" onClick={() => {}} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>
              All Content
            </PillButton>
            <PillButton variant={selectedCategory === 'guide' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('guide')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Guides
            </PillButton>
            <PillButton variant={selectedCategory === 'tutorial' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('tutorial')}>
              <Video className="w-4 h-4 mr-2" />
              Tutorials
            </PillButton>
            <PillButton variant={selectedCategory === 'faq' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('faq')}>
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQs
            </PillButton>
          </div>
          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Help Articles ({filteredArticles.length})</h3>
              {loading && filteredArticles.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No articles found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.slice(0, 6).map((article, index) => (
                    <div key={article.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="space-y-3">
                        <div className={`w-full h-32 rounded-lg bg-gradient-to-r ${getArticleColor(index)} flex items-center justify-center text-white`}>
                          <FileText className="w-12 h-12" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-md ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {article.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{article.visibility}</span>
                          </div>
                          <h4 className="font-semibold mb-2 line-clamp-2">{article.title}</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Views</p>
                              <p className="font-semibold">{(article.view_count / 1000).toFixed(1)}K</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Helpful</p>
                              <p className={`font-semibold ${getHelpfulColor(article.helpful_count > 0 ? 90 : 0)}`}>
                                {article.helpful_count > 0 ? `${Math.round((article.helpful_count / (article.helpful_count + article.not_helpful_count)) * 100)}%` : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Updated {new Date(article.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {article.status === 'draft' && (
                            <ModernButton variant="outline" size="sm" onClick={() => publishArticle(article.id)}>
                              Publish
                            </ModernButton>
                          )}
                          {article.status === 'published' && (
                            <ModernButton variant="outline" size="sm" onClick={() => archiveArticle(article.id)}>
                              Archive
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Content Categories</h3>
              <div className="space-y-3">
                {categoryList.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {}}
                    className="w-full p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white`}>
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.articles} articles</p>
                        </div>
                      </div>
                      <ModernButton variant="ghost" size="sm">
                        Browse
                      </ModernButton>
                    </div>
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList
              title="🏆 Most Viewed Articles"
              items={topArticles.length > 0 ? topArticles : [
                { rank: 1, name: 'Getting Started Guide', avatar: '📚', value: '24.7K', change: 42.1 },
                { rank: 2, name: 'Workflow Tutorial', avatar: '⚙️', value: '18.2K', change: 35.3 },
                { rank: 3, name: 'Billing FAQs', avatar: '💰', value: '12.4K', change: 28.5 }
              ]}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => {}}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => {}}>
                  <Users className="w-4 h-4 mr-2" />
                  Community Forum
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => {}}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Suggest Article
                </ModernButton>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Helpful Rating" value={`${Math.round(stats.helpfulPercentage)}%`} change={8.3} />
                <MiniKPI label="Search Success" value="87%" change={12.5} />
                <MiniKPI label="Self-Service Rate" value="76%" change={15.2} />
                <MiniKPI label="Article Quality" value={`${stats.avgRating.toFixed(1)}/5`} change={5.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
