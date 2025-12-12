"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  RankingList,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  FileText,
  Book,
  Code,
  Search,
  Zap,
  GitBranch,
  Users,
  Eye,
  ThumbsUp,
  Download,
  TrendingUp,
  Layers,
  Terminal,
  Package
} from 'lucide-react'

/**
 * Docs V2 - Groundbreaking Developer Documentation
 * Showcases documentation, API references, and developer resources
 */
export default function DocsV2() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guides' | 'api' | 'sdk'>('all')

  const stats = [
    { label: 'Total Docs', value: '347', change: 28.4, icon: <FileText className="w-5 h-5" /> },
    { label: 'Monthly Views', value: '94K', change: 42.1, icon: <Eye className="w-5 h-5" /> },
    { label: 'Helpful Rating', value: '96%', change: 15.3, icon: <ThumbsUp className="w-5 h-5" /> },
    { label: 'API Endpoints', value: '124', change: 22.7, icon: <Zap className="w-5 h-5" /> }
  ]

  const docSections = [
    {
      id: '1',
      title: 'Getting Started',
      category: 'guides',
      articles: 24,
      views: 28400,
      helpful: 98,
      lastUpdated: '2 days ago',
      color: 'from-blue-500 to-cyan-500',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: '2',
      title: 'API Reference',
      category: 'api',
      articles: 124,
      views: 45200,
      helpful: 94,
      lastUpdated: '1 day ago',
      color: 'from-purple-500 to-pink-500',
      icon: <Code className="w-5 h-5" />
    },
    {
      id: '3',
      title: 'SDK Documentation',
      category: 'sdk',
      articles: 67,
      views: 18900,
      helpful: 96,
      lastUpdated: '3 days ago',
      color: 'from-green-500 to-emerald-500',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: '4',
      title: 'Authentication',
      category: 'guides',
      articles: 18,
      views: 34700,
      helpful: 97,
      lastUpdated: '1 week ago',
      color: 'from-orange-500 to-red-500',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: '5',
      title: 'Webhooks',
      category: 'api',
      articles: 12,
      views: 12400,
      helpful: 92,
      lastUpdated: '5 days ago',
      color: 'from-yellow-500 to-amber-500',
      icon: <GitBranch className="w-5 h-5" />
    },
    {
      id: '6',
      title: 'Code Examples',
      category: 'guides',
      articles: 89,
      views: 24800,
      helpful: 95,
      lastUpdated: '2 days ago',
      color: 'from-indigo-500 to-purple-500',
      icon: <Terminal className="w-5 h-5" />
    }
  ]

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/v1/users',
      description: 'List all users',
      calls: 124000,
      avgLatency: 45,
      successRate: 99.8
    },
    {
      method: 'POST',
      endpoint: '/api/v1/projects',
      description: 'Create a new project',
      calls: 84000,
      avgLatency: 120,
      successRate: 98.5
    },
    {
      method: 'GET',
      endpoint: '/api/v1/analytics',
      description: 'Fetch analytics data',
      calls: 64000,
      avgLatency: 230,
      successRate: 99.2
    },
    {
      method: 'PUT',
      endpoint: '/api/v1/settings',
      description: 'Update user settings',
      calls: 42000,
      avgLatency: 85,
      successRate: 99.6
    }
  ]

  const topDocs = [
    { rank: 1, name: 'Quick Start Guide', avatar: '🚀', value: '28.4K', change: 42.1 },
    { rank: 2, name: 'API Authentication', avatar: '🔐', value: '34.7K', change: 35.3 },
    { rank: 3, name: 'REST API Overview', avatar: '⚡', value: '45.2K', change: 28.5 },
    { rank: 4, name: 'Webhooks Setup', avatar: '🔗', value: '12.4K', change: 22.7 },
    { rank: 5, name: 'SDK Installation', avatar: '📦', value: '18.9K', change: 18.2 }
  ]

  const recentActivity = [
    { icon: <FileText className="w-5 h-5" />, title: 'Documentation updated', description: 'API Reference v2.1 published', time: '2 hours ago', status: 'success' as const },
    { icon: <Code className="w-5 h-5" />, title: 'New code example', description: 'Added Python SDK sample', time: '1 day ago', status: 'success' as const },
    { icon: <Download className="w-5 h-5" />, title: 'High downloads', description: 'SDK v3.2 reached 10K downloads', time: '2 days ago', status: 'success' as const },
    { icon: <ThumbsUp className="w-5 h-5" />, title: 'Positive feedback', description: 'Getting Started rated 5 stars', time: '3 days ago', status: 'success' as const }
  ]

  const versions = [
    { version: 'v3.2.0', status: 'Latest', downloads: 10247, released: '1 week ago', color: 'from-green-500 to-emerald-500' },
    { version: 'v3.1.5', status: 'Stable', downloads: 24890, released: '1 month ago', color: 'from-blue-500 to-cyan-500' },
    { version: 'v3.0.2', status: 'Legacy', downloads: 8920, released: '3 months ago', color: 'from-gray-500 to-slate-500' }
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700'
      case 'POST': return 'bg-green-100 text-green-700'
      case 'PUT': return 'bg-yellow-100 text-yellow-700'
      case 'DELETE': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'guides': return 'bg-blue-100 text-blue-700'
      case 'api': return 'bg-purple-100 text-purple-700'
      case 'sdk': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxViews = Math.max(...docSections.map(s => s.views))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 p-6">
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
            <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>
              All Docs
            </PillButton>
            <PillButton variant={selectedCategory === 'guides' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('guides')}>
              <Book className="w-4 h-4 mr-2" />
              Guides
            </PillButton>
            <PillButton variant={selectedCategory === 'api' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('api')}>
              <Code className="w-4 h-4 mr-2" />
              API Reference
            </PillButton>
            <PillButton variant={selectedCategory === 'sdk' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('sdk')}>
              <Package className="w-4 h-4 mr-2" />
              SDK Docs
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
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Documentation Sections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docSections.map((section) => {
                  const viewPercent = (section.views / maxViews) * 100

                  return (
                    <div key={section.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="space-y-3">
                        <div className={`w-full h-24 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center text-white`}>
                          {section.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-md ${getCategoryColor(section.category)}`}>
                              {section.category}
                            </span>
                            <span className="text-xs text-muted-foreground">{section.articles} articles</span>
                          </div>
                          <h4 className="font-semibold mb-2">{section.title}</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Views</p>
                              <p className="font-semibold">{(section.views / 1000).toFixed(1)}K</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Helpful</p>
                              <p className="font-semibold text-green-600">{section.helpful}%</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${section.color}`}
                                style={{ width: `${viewPercent}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Updated {section.lastUpdated}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Popular API Endpoints</h3>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-md font-mono font-semibold ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">API Calls</p>
                        <p className="font-semibold">{(endpoint.calls / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Latency</p>
                        <p className="font-semibold">{endpoint.avgLatency}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-semibold text-green-600">{endpoint.successRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">SDK Versions</h3>
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.version} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${version.color} flex items-center justify-center text-white`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold font-mono">{version.version}</h4>
                          <p className="text-xs text-muted-foreground">{version.status}</p>
                        </div>
                      </div>
                      <ModernButton variant="outline" size="sm">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </ModernButton>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t">
                      <div>
                        <p className="text-muted-foreground">Downloads</p>
                        <p className="font-semibold">{version.downloads.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Released</p>
                        <p className="font-semibold">{version.released}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Most Viewed Docs" items={topDocs} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Documentation Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Read Time" value="4.2min" change={-8.3} />
                <MiniKPI label="Search Success" value="92%" change={15.7} />
                <MiniKPI label="Code Copy Rate" value="68%" change={22.4} />
                <MiniKPI label="Feedback Score" value="4.8/5" change={12.1} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('API Explorer')}>
                  <Code className="w-4 h-4 mr-2" />
                  API Explorer
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Changelog')}>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Changelog
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('SDK Downloads')}>
                  <Download className="w-4 h-4 mr-2" />
                  SDK Downloads
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
