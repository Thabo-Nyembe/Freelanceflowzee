"use client"

import { useState } from 'react'
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
  Lightbulb
} from 'lucide-react'

/**
 * Help Center V2 - Groundbreaking Knowledge Base & Documentation
 * Showcases help articles and self-service content with modern components
 */
export default function HelpCenterV2() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guide' | 'tutorial' | 'faq'>('all')

  const stats = [
    { label: 'Total Articles', value: '847', change: 25.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Monthly Views', value: '124K', change: 42.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Helpful Rating', value: '94%', change: 12.5, icon: <ThumbsUp className="w-5 h-5" /> },
    { label: 'Avg Read Time', value: '3.2m', change: -8.3, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const articles = [
    {
      id: '1',
      title: 'Getting Started with Projects',
      category: 'guide',
      views: 24700,
      helpful: 94,
      lastUpdated: '2 days ago',
      readTime: '5 min',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      title: 'How to Create Custom Workflows',
      category: 'tutorial',
      views: 18200,
      helpful: 92,
      lastUpdated: '1 week ago',
      readTime: '8 min',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      title: 'Billing and Payment FAQs',
      category: 'faq',
      views: 12400,
      helpful: 89,
      lastUpdated: '3 days ago',
      readTime: '3 min',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      title: 'Team Collaboration Best Practices',
      category: 'guide',
      views: 9800,
      helpful: 96,
      lastUpdated: '1 week ago',
      readTime: '6 min',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      title: 'Integrating Third-Party Apps',
      category: 'tutorial',
      views: 8500,
      helpful: 87,
      lastUpdated: '2 weeks ago',
      readTime: '10 min',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '6',
      title: 'Security and Privacy Settings',
      category: 'guide',
      views: 7200,
      helpful: 91,
      lastUpdated: '5 days ago',
      readTime: '4 min',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const categories = [
    { name: 'Getting Started', articles: 124, icon: <Zap className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Features & Guides', articles: 247, icon: <BookOpen className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { name: 'Video Tutorials', articles: 89, icon: <Video className="w-5 h-5" />, color: 'from-orange-500 to-red-500' },
    { name: 'FAQs', articles: 342, icon: <HelpCircle className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { name: 'Troubleshooting', articles: 156, icon: <Lightbulb className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500' }
  ]

  const topArticles = [
    { rank: 1, name: 'Getting Started Guide', avatar: '📚', value: '24.7K', change: 42.1 },
    { rank: 2, name: 'Workflow Tutorial', avatar: '⚙️', value: '18.2K', change: 35.3 },
    { rank: 3, name: 'Billing FAQs', avatar: '💰', value: '12.4K', change: 28.5 },
    { rank: 4, name: 'Collaboration Guide', avatar: '👥', value: '9.8K', change: 22.7 },
    { rank: 5, name: 'Integration Tutorial', avatar: '🔗', value: '8.5K', change: 18.2 }
  ]

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
          <GradientButton from="blue" to="indigo" onClick={() => console.log('New article')}>
            <FileText className="w-5 h-5 mr-2" />
            New Article
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<FileText />} title="Articles" description="All content" onClick={() => console.log('Articles')} />
          <BentoQuickAction icon={<Video />} title="Videos" description="Tutorials" onClick={() => console.log('Videos')} />
          <BentoQuickAction icon={<MessageSquare />} title="Community" description="Discussions" onClick={() => console.log('Community')} />
          <BentoQuickAction icon={<Award />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Help Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <div key={article.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="space-y-3">
                      <div className={`w-full h-32 rounded-lg bg-gradient-to-r ${article.color} flex items-center justify-center text-white`}>
                        <FileText className="w-12 h-12" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-md ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{article.readTime}</span>
                        </div>
                        <h4 className="font-semibold mb-2">{article.title}</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Views</p>
                            <p className="font-semibold">{(article.views / 1000).toFixed(1)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Helpful</p>
                            <p className={`font-semibold ${getHelpfulColor(article.helpful)}`}>
                              {article.helpful}%
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated {article.lastUpdated}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Content Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => console.log('Category', category.name)}
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
            <RankingList title="🏆 Most Viewed Articles" items={topArticles} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Contact')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Community')}>
                  <Users className="w-4 h-4 mr-2" />
                  Community Forum
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Suggest')}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Suggest Article
                </ModernButton>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Helpful Rating" value="92%" change={8.3} />
                <MiniKPI label="Search Success" value="87%" change={12.5} />
                <MiniKPI label="Self-Service Rate" value="76%" change={15.2} />
                <MiniKPI label="Article Quality" value="4.6/5" change={5.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
