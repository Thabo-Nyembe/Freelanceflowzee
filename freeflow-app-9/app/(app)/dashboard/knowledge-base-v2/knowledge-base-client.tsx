'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { BookOpen, Plus, Search, Eye, ThumbsUp, FileText, TrendingUp } from 'lucide-react'

const articles = [
  { id: 'KB-001', title: 'Getting Started Guide', category: 'Getting Started', views: 5200, helpful: 487, updated: '2024-01-15', status: 'published' },
  { id: 'KB-002', title: 'How to Reset Your Password', category: 'Account', views: 3800, helpful: 356, updated: '2024-01-20', status: 'published' },
  { id: 'KB-003', title: 'Billing and Subscriptions FAQ', category: 'Billing', views: 2900, helpful: 248, updated: '2024-02-01', status: 'published' },
  { id: 'KB-004', title: 'API Integration Tutorial', category: 'Development', views: 1850, helpful: 189, updated: '2024-01-28', status: 'draft' },
]

const categories = [
  { name: 'Getting Started', count: 12, views: 25000, color: 'bg-blue-100 text-blue-700' },
  { name: 'Account', count: 18, views: 32000, color: 'bg-purple-100 text-purple-700' },
  { name: 'Billing', count: 15, views: 18000, color: 'bg-green-100 text-green-700' },
  { name: 'Development', count: 8, views: 12000, color: 'bg-orange-100 text-orange-700' },
]

export default function KnowledgeBaseClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    avgHelpful: Math.round((articles.reduce((sum, a) => sum + (a.helpful / a.views) * 100, 0) / articles.length)),
  }), [])

  const insights = [
    { icon: BookOpen, title: `${stats.total}`, description: 'Total articles' },
    { icon: FileText, title: `${stats.published}`, description: 'Published' },
    { icon: Eye, title: `${(stats.totalViews / 1000).toFixed(1)}k`, description: 'Total views' },
    { icon: ThumbsUp, title: `${stats.avgHelpful}%`, description: 'Helpful rate' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="h-8 w-8 text-primary" />Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Manage help articles and documentation</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Article</Button>
      </div>

      <CollapsibleInsightsPanel title="Knowledge Base Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.name}>
            <CardContent className="p-4 text-center">
              <Badge className={cat.color}>{cat.name}</Badge>
              <p className="text-2xl font-bold mt-2">{cat.count}</p>
              <p className="text-xs text-muted-foreground">{(cat.views / 1000).toFixed(1)}k views</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search articles..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{article.id}</Badge>
                    <h4 className="font-semibold">{article.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Category: {article.category} • Updated: {article.updated}</p>
                </div>
                <Badge className={article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {article.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-medium">{article.views.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-muted-foreground">Helpful</p>
                    <p className="font-medium">{article.helpful}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Helpful Rate</p>
                  <p className="font-medium">{Math.round((article.helpful / article.views) * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
