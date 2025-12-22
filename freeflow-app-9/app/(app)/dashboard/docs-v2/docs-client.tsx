'use client'

import { useState } from 'react'
import { useDocs, type Doc, type DocCategory, type DocStatus } from '@/lib/hooks/use-docs'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, RankingList, ActivityFeed } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { FileText, Book, Code, Search, Package, Eye, ThumbsUp, Download, Terminal } from 'lucide-react'

export default function DocsClient({ initialDocs }: { initialDocs: Doc[] }) {
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all')
  const { docs, loading, error } = useDocs({ category: categoryFilter, status: statusFilter })

  const displayDocs = docs.length > 0 ? docs : initialDocs

  const stats = [
    {
      label: 'Total Docs',
      value: displayDocs.length.toString(),
      change: 28.4,
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: 'Monthly Views',
      value: displayDocs.reduce((sum, d) => sum + d.monthly_views, 0).toLocaleString(),
      change: 42.1,
      icon: <Eye className="w-5 h-5" />
    },
    {
      label: 'Helpful Rating',
      value: displayDocs.length > 0
        ? `${(displayDocs.reduce((sum, d) => sum + d.helpful_rating_percent, 0) / displayDocs.length).toFixed(0)}%`
        : '0%',
      change: 15.3,
      icon: <ThumbsUp className="w-5 h-5" />
    },
    {
      label: 'API Docs',
      value: displayDocs.filter(d => d.doc_category === 'api').length.toString(),
      change: 22.7,
      icon: <Code className="w-5 h-5" />
    }
  ]

  const getCategoryColor = (category: DocCategory) => {
    switch (category) {
      case 'guides': return 'bg-blue-100 text-blue-700'
      case 'api': return 'bg-purple-100 text-purple-700'
      case 'sdk': return 'bg-green-100 text-green-700'
      case 'tutorials': return 'bg-orange-100 text-orange-700'
      case 'reference': return 'bg-indigo-100 text-indigo-700'
      case 'examples': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'review': return 'bg-yellow-100 text-yellow-700'
      case 'archived': return 'bg-slate-100 text-slate-700'
      case 'deprecated': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category: DocCategory) => {
    switch (category) {
      case 'api': return <Code className="w-5 h-5" />
      case 'sdk': return <Package className="w-5 h-5" />
      case 'guides': return <Book className="w-5 h-5" />
      case 'tutorials': return <FileText className="w-5 h-5" />
      case 'examples': return <Terminal className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const topDocs = displayDocs
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 5)
    .map((d, i) => ({
      rank: i + 1,
      label: d.doc_title,
      value: `${(d.total_views / 1000).toFixed(1)}K`,
      change: d.helpful_rating_percent
    }))

  const recentActivity = displayDocs.slice(0, 4).map((d) => ({
    icon: <FileText className="w-5 h-5" />,
    title: d.status === 'published' ? 'Documentation published' : 'Documentation updated',
    description: d.doc_title,
    time: new Date(d.updated_at).toLocaleDateString(),
    status: (d.status === 'published' ? 'success' : 'info') as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Book className="w-10 h-10 text-slate-600" />
              Developer Docs
            </h1>
            <p className="text-muted-foreground">API references, guides, and developer resources</p>
          </div>
          <GradientButton from="slate" to="gray" onClick={() => console.log('New doc')}>
            <FileText className="w-5 h-5 mr-2" />
            New Document
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Book />} title="Guides" description="Tutorials" onClick={() => console.log('Guides')} />
          <BentoQuickAction icon={<Code />} title="API Ref" description="Endpoints" onClick={() => console.log('API')} />
          <BentoQuickAction icon={<Package />} title="SDKs" description="Libraries" onClick={() => console.log('SDKs')} />
          <BentoQuickAction icon={<Terminal />} title="Examples" description="Code samples" onClick={() => console.log('Examples')} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PillButton variant={categoryFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setCategoryFilter('all')}>
              All Docs
            </PillButton>
            <PillButton variant={categoryFilter === 'guides' ? 'primary' : 'ghost'} onClick={() => setCategoryFilter('guides')}>
              <Book className="w-4 h-4 mr-2" />
              Guides
            </PillButton>
            <PillButton variant={categoryFilter === 'api' ? 'primary' : 'ghost'} onClick={() => setCategoryFilter('api')}>
              <Code className="w-4 h-4 mr-2" />
              API
            </PillButton>
            <PillButton variant={categoryFilter === 'sdk' ? 'primary' : 'ghost'} onClick={() => setCategoryFilter('sdk')}>
              <Package className="w-4 h-4 mr-2" />
              SDK
            </PillButton>
          </div>
          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayDocs.map((doc) => (
              <BentoCard key={doc.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(doc.doc_category)}
                      <h3 className="font-semibold">{doc.doc_title}</h3>
                    </div>
                    {doc.summary && (
                      <p className="text-sm text-muted-foreground mb-2">{doc.summary}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-md ${getCategoryColor(doc.doc_category)}`}>
                        {doc.doc_category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      {doc.is_featured && (
                        <span className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-semibold">{doc.total_views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Helpful</p>
                    <p className="font-semibold text-green-600">{doc.helpful_rating_percent.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-semibold">{doc.average_rating.toFixed(1)}/5</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Read Time</p>
                    <p className="font-semibold">{Math.ceil(doc.avg_read_time_seconds / 60)}min</p>
                  </div>
                </div>

                {doc.api_endpoint && (
                  <div className="mb-3 p-2 bg-muted rounded-lg">
                    <code className="text-xs font-mono">
                      <span className="font-semibold">{doc.http_method}</span> {doc.api_endpoint}
                    </code>
                    {doc.success_rate > 0 && (
                      <p className="text-xs text-green-600 mt-1">Success Rate: {doc.success_rate.toFixed(1)}%</p>
                    )}
                  </div>
                )}

                {doc.has_code_examples && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Terminal className="w-3 h-3" />
                    <span>Includes code examples</span>
                    {doc.code_copy_count > 0 && (
                      <span className="text-green-600">{doc.code_copy_count} copies</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t">
                  <ModernButton variant="primary" size="sm">View Doc</ModernButton>
                  {doc.status === 'published' && (
                    <ModernButton variant="outline" size="sm">Edit</ModernButton>
                  )}
                </div>
              </BentoCard>
            ))}

            {displayDocs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Documentation</h3>
                <p className="text-muted-foreground">Create your first document</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <RankingList title="Most Viewed Docs" items={topDocs} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Documentation Metrics</h3>
              <div className="space-y-3">
                <MiniKPI
                  label="Avg Read Time"
                  value={displayDocs.length > 0
                    ? `${(displayDocs.reduce((sum, d) => sum + d.avg_read_time_seconds, 0) / displayDocs.length / 60).toFixed(1)}min`
                    : '0min'}
                  change={-8.3}
                />
                <MiniKPI
                  label="Completion Rate"
                  value={displayDocs.length > 0
                    ? `${(displayDocs.reduce((sum, d) => sum + d.completion_rate, 0) / displayDocs.length).toFixed(0)}%`
                    : '0%'}
                  change={15.7}
                />
                <MiniKPI
                  label="Code Copy Rate"
                  value={displayDocs.filter(d => d.has_code_examples).length > 0
                    ? `${(displayDocs.filter(d => d.has_code_examples).reduce((sum, d) => sum + d.code_copy_count, 0) / displayDocs.filter(d => d.has_code_examples).length).toFixed(0)}`
                    : '0'}
                  change={22.4}
                />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
