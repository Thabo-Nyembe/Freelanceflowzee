'use client'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  FileText, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Star,
  Clock, Users, BookOpen, FolderOpen, ChevronRight, ChevronDown, Home, File,
  Link2, MessageSquare, History, Share2, Settings, Lock, Globe, Archive,
  Tag, Bookmark, ThumbsUp, ThumbsDown, Copy, ExternalLink, Layers, Grid,
  List, SortAsc, Calendar, User, AlertCircle, CheckCircle2, ArrowLeft,
  Code, Terminal, GitBranch, GitCommit, Play, Zap, TrendingUp, BarChart3,
  Download, Upload, Sparkles, Book, Lightbulb, Palette, Layout, Box,
  Menu, X, ArrowRight, RefreshCw, Bell, Shield, Key, Database, Webhook
} from 'lucide-react'

interface DocSpace {
  id: string
  key: string
  name: string
  description: string
  icon: string
  visibility: 'public' | 'private' | 'internal'
  owner: { name: string; avatar: string }
  team_members: number
  pages_count: number
  views: number
  last_updated: string
  created_at: string
  git_sync?: { enabled: boolean; repo: string; branch: string }
  custom_domain?: string
  is_starred: boolean
  status: 'published' | 'draft' | 'archived'
}

interface DocPage {
  id: string
  space_id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'published' | 'draft' | 'archived' | 'review'
  author: { name: string; avatar: string }
  contributors: { name: string; avatar: string }[]
  created_at: string
  updated_at: string
  published_at?: string
  version: number
  parent_id?: string
  children: string[]
  order: number
  labels: string[]
  likes: number
  comments_count: number
  views: number
  reading_time: string
  is_bookmarked: boolean
  seo?: { title?: string; description?: string }
}

interface DocVersion {
  id: string
  page_id: string
  version: number
  author: { name: string; avatar: string }
  created_at: string
  message: string
  changes: { additions: number; deletions: number }
  is_current: boolean
}

interface DocComment {
  id: string
  page_id: string
  author: { name: string; avatar: string }
  content: string
  created_at: string
  is_resolved: boolean
  position?: { line: number; text: string }
  replies: DocComment[]
}

interface DocTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  usage_count: number
  preview_content: string
  is_official: boolean
}

interface DocIntegration {
  id: string
  name: string
  type: 'git' | 'api' | 'webhook' | 'sso'
  icon: any
  status: 'connected' | 'disconnected' | 'error'
  last_sync?: string
  config?: Record<string, string>
}

interface DocAnalytics {
  page_id: string
  page_title: string
  views: number
  unique_visitors: number
  avg_time: string
  bounce_rate: number
  feedback_positive: number
  feedback_negative: number
}

export default function DocumentationClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<DocSpace | null>(null)
  const [selectedPage, setSelectedPage] = useState<DocPage | null>(null)
  const [showVersions, setShowVersions] = useState(false)
  const [showNewSpace, setShowNewSpace] = useState(false)
  const [expandedPages, setExpandedPages] = useState<string[]>(['page1'])
  const [editorMode, setEditorMode] = useState(false)

  // Mock spaces
  const spaces: DocSpace[] = [
    { id: 'space1', key: 'docs', name: 'Product Documentation', description: 'Official product documentation and guides',
      icon: '📚', visibility: 'public', owner: { name: 'Sarah Chen', avatar: '' }, team_members: 8, pages_count: 156,
      views: 45600, last_updated: '2024-01-15T10:30:00Z', created_at: '2023-06-01', is_starred: true, status: 'published',
      git_sync: { enabled: true, repo: 'company/docs', branch: 'main' }, custom_domain: 'docs.company.com' },
    { id: 'space2', key: 'api', name: 'API Reference', description: 'REST API documentation and examples',
      icon: '🔌', visibility: 'public', owner: { name: 'Mike Ross', avatar: '' }, team_members: 5, pages_count: 89,
      views: 32100, last_updated: '2024-01-15T09:45:00Z', created_at: '2023-08-15', is_starred: true, status: 'published',
      git_sync: { enabled: true, repo: 'company/api-docs', branch: 'main' } },
    { id: 'space3', key: 'internal', name: 'Engineering Wiki', description: 'Internal engineering documentation',
      icon: '🔧', visibility: 'internal', owner: { name: 'Emily Davis', avatar: '' }, team_members: 24, pages_count: 234,
      views: 18900, last_updated: '2024-01-15T11:00:00Z', created_at: '2023-03-01', is_starred: false, status: 'published' },
    { id: 'space4', key: 'onboard', name: 'Onboarding Guide', description: 'New employee onboarding documentation',
      icon: '👋', visibility: 'private', owner: { name: 'Alex Kim', avatar: '' }, team_members: 3, pages_count: 45,
      views: 2340, last_updated: '2024-01-14T16:30:00Z', created_at: '2023-10-01', is_starred: false, status: 'published' },
    { id: 'space5', key: 'changelog', name: 'Changelog', description: 'Product updates and release notes',
      icon: '📝', visibility: 'public', owner: { name: 'Sarah Chen', avatar: '' }, team_members: 4, pages_count: 67,
      views: 12500, last_updated: '2024-01-15T08:00:00Z', created_at: '2023-06-01', is_starred: false, status: 'published' }
  ]

  // Mock pages
  const pages: DocPage[] = [
    { id: 'page1', space_id: 'space1', title: 'Getting Started', slug: 'getting-started',
      content: '# Getting Started\n\nWelcome to our documentation...', excerpt: 'Quick start guide for new users',
      status: 'published', author: { name: 'Sarah Chen', avatar: '' },
      contributors: [{ name: 'Mike Ross', avatar: '' }, { name: 'Emily Davis', avatar: '' }],
      created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-15T10:30:00Z', published_at: '2024-01-01T12:00:00Z',
      version: 12, children: ['page2', 'page3'], order: 1, labels: ['guide', 'beginner'],
      likes: 156, comments_count: 24, views: 8900, reading_time: '5 min', is_bookmarked: true },
    { id: 'page2', space_id: 'space1', title: 'Installation', slug: 'installation', parent_id: 'page1',
      content: '# Installation\n\nFollow these steps to install...', excerpt: 'Step-by-step installation guide',
      status: 'published', author: { name: 'Mike Ross', avatar: '' }, contributors: [],
      created_at: '2024-01-05T14:00:00Z', updated_at: '2024-01-14T16:00:00Z', published_at: '2024-01-05T15:00:00Z',
      version: 5, children: [], order: 1, labels: ['installation', 'setup'],
      likes: 89, comments_count: 12, views: 4500, reading_time: '8 min', is_bookmarked: false },
    { id: 'page3', space_id: 'space1', title: 'Configuration', slug: 'configuration', parent_id: 'page1',
      content: '# Configuration\n\nConfiguration options...', excerpt: 'Configure your environment',
      status: 'draft', author: { name: 'Emily Davis', avatar: '' }, contributors: [{ name: 'Sarah Chen', avatar: '' }],
      created_at: '2024-01-10T09:00:00Z', updated_at: '2024-01-15T09:00:00Z',
      version: 3, children: [], order: 2, labels: ['configuration', 'advanced'],
      likes: 34, comments_count: 8, views: 1200, reading_time: '12 min', is_bookmarked: true },
    { id: 'page4', space_id: 'space2', title: 'Authentication', slug: 'authentication',
      content: '# Authentication\n\nAPI authentication...', excerpt: 'Learn how to authenticate API requests',
      status: 'published', author: { name: 'Mike Ross', avatar: '' }, contributors: [],
      created_at: '2023-12-20T10:00:00Z', updated_at: '2024-01-10T14:00:00Z', published_at: '2023-12-20T12:00:00Z',
      version: 8, children: [], order: 1, labels: ['api', 'auth', 'security'],
      likes: 234, comments_count: 45, views: 12300, reading_time: '10 min', is_bookmarked: true },
    { id: 'page5', space_id: 'space2', title: 'Endpoints', slug: 'endpoints',
      content: '# API Endpoints\n\nComplete list...', excerpt: 'API endpoint reference',
      status: 'published', author: { name: 'Mike Ross', avatar: '' }, contributors: [{ name: 'Sarah Chen', avatar: '' }],
      created_at: '2023-12-25T10:00:00Z', updated_at: '2024-01-12T14:00:00Z', published_at: '2023-12-25T12:00:00Z',
      version: 15, children: [], order: 2, labels: ['api', 'reference'],
      likes: 189, comments_count: 32, views: 9800, reading_time: '25 min', is_bookmarked: false }
  ]

  // Mock versions
  const versions: DocVersion[] = [
    { id: 'v1', page_id: 'page1', version: 12, author: { name: 'Sarah Chen', avatar: '' }, created_at: '2024-01-15T10:30:00Z',
      message: 'Updated getting started section with new examples', changes: { additions: 45, deletions: 12 }, is_current: true },
    { id: 'v2', page_id: 'page1', version: 11, author: { name: 'Mike Ross', avatar: '' }, created_at: '2024-01-14T15:00:00Z',
      message: 'Fixed typos and formatting', changes: { additions: 5, deletions: 5 }, is_current: false },
    { id: 'v3', page_id: 'page1', version: 10, author: { name: 'Sarah Chen', avatar: '' }, created_at: '2024-01-12T11:00:00Z',
      message: 'Added troubleshooting section', changes: { additions: 120, deletions: 0 }, is_current: false },
    { id: 'v4', page_id: 'page1', version: 9, author: { name: 'Emily Davis', avatar: '' }, created_at: '2024-01-10T09:00:00Z',
      message: 'Updated screenshots', changes: { additions: 8, deletions: 8 }, is_current: false }
  ]

  // Mock templates
  const templates: DocTemplate[] = [
    { id: 't1', name: 'Getting Started Guide', description: 'Introductory guide for new users', category: 'Guides',
      icon: '🚀', usage_count: 234, preview_content: '# Getting Started\n\n## Prerequisites\n...', is_official: true },
    { id: 't2', name: 'API Endpoint', description: 'Document an API endpoint', category: 'API',
      icon: '🔌', usage_count: 189, preview_content: '# Endpoint Name\n\n## Request\n...', is_official: true },
    { id: 't3', name: 'Tutorial', description: 'Step-by-step tutorial', category: 'Guides',
      icon: '📖', usage_count: 156, preview_content: '# Tutorial: Title\n\n## What you\'ll learn\n...', is_official: true },
    { id: 't4', name: 'Changelog Entry', description: 'Release notes template', category: 'Updates',
      icon: '📝', usage_count: 312, preview_content: '# Version X.X.X\n\n## New Features\n...', is_official: true },
    { id: 't5', name: 'Troubleshooting', description: 'Common issues and solutions', category: 'Support',
      icon: '🔧', usage_count: 98, preview_content: '# Troubleshooting\n\n## Common Issues\n...', is_official: true },
    { id: 't6', name: 'Architecture Doc', description: 'System architecture documentation', category: 'Technical',
      icon: '🏗️', usage_count: 67, preview_content: '# Architecture Overview\n\n## Components\n...', is_official: false }
  ]

  // Mock integrations
  const integrations: DocIntegration[] = [
    { id: 'int1', name: 'GitHub', type: 'git', icon: GitBranch, status: 'connected', last_sync: '5 min ago',
      config: { repo: 'company/docs', branch: 'main' } },
    { id: 'int2', name: 'OpenAPI', type: 'api', icon: Code, status: 'connected', last_sync: '1 hour ago',
      config: { spec_url: 'https://api.company.com/openapi.json' } },
    { id: 'int3', name: 'Slack', type: 'webhook', icon: Webhook, status: 'connected' },
    { id: 'int4', name: 'Okta SSO', type: 'sso', icon: Shield, status: 'connected' }
  ]

  // Mock analytics
  const analytics: DocAnalytics[] = [
    { page_id: 'page4', page_title: 'Authentication', views: 12300, unique_visitors: 4500, avg_time: '3:45', bounce_rate: 23, feedback_positive: 234, feedback_negative: 12 },
    { page_id: 'page5', page_title: 'Endpoints', views: 9800, unique_visitors: 3200, avg_time: '5:20', bounce_rate: 18, feedback_positive: 189, feedback_negative: 8 },
    { page_id: 'page1', page_title: 'Getting Started', views: 8900, unique_visitors: 5600, avg_time: '4:15', bounce_rate: 15, feedback_positive: 156, feedback_negative: 5 },
    { page_id: 'page2', page_title: 'Installation', views: 4500, unique_visitors: 2100, avg_time: '6:30', bounce_rate: 12, feedback_positive: 89, feedback_negative: 3 }
  ]

  const stats = useMemo(() => ({
    totalSpaces: spaces.length,
    totalPages: pages.length,
    totalViews: pages.reduce((sum, p) => sum + p.views, 0),
    publishedPages: pages.filter(p => p.status === 'published').length,
    draftPages: pages.filter(p => p.status === 'draft').length,
    totalContributors: new Set(pages.flatMap(p => [p.author.name, ...p.contributors.map(c => c.name)])).size,
    avgReadTime: '8 min',
    satisfaction: 94
  }), [spaces, pages])

  const getStatusColor = (status: DocPage['status']): string => {
    const colors: Record<DocPage['status'], string> = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[status]
  }

  const getVisibilityColor = (visibility: DocSpace['visibility']): string => {
    const colors: Record<DocSpace['visibility'], string> = {
      public: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      private: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      internal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[visibility]
  }

  const toggleExpand = (pageId: string) => {
    setExpandedPages(prev => prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId])
  }

  const renderPageTree = (parentId?: string, level: number = 0) => {
    const childPages = pages.filter(p => p.parent_id === parentId && p.space_id === (selectedSpace?.id || 'space1'))
    return childPages.map(page => (
      <div key={page.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setSelectedPage(page)}
        >
          {page.children.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(page.id) }} className="p-0.5">
              {expandedPages.includes(page.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {page.children.length === 0 && <FileText className="h-4 w-4 text-gray-400" />}
          <span className={`flex-1 text-sm ${selectedPage?.id === page.id ? 'font-medium text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
            {page.title}
          </span>
          {page.status === 'draft' && <Badge variant="outline" className="text-xs">Draft</Badge>}
        </div>
        {expandedPages.includes(page.id) && page.children.length > 0 && renderPageTree(page.id, level + 1)}
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Documentation</h1>
                <p className="text-purple-100">GitBook-level knowledge management platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input placeholder="Search docs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60" />
              </div>
              <Button onClick={() => setShowNewSpace(true)} className="bg-white text-purple-600 hover:bg-purple-50">
                <Plus className="h-4 w-4 mr-2" />
                New Space
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Spaces', value: stats.totalSpaces, icon: FolderOpen, color: 'from-violet-500 to-purple-500' },
              { label: 'Pages', value: stats.totalPages, icon: FileText, color: 'from-purple-500 to-fuchsia-500' },
              { label: 'Views', value: `${(stats.totalViews / 1000).toFixed(1)}K`, icon: Eye, color: 'from-fuchsia-500 to-pink-500' },
              { label: 'Published', value: stats.publishedPages, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
              { label: 'Drafts', value: stats.draftPages, icon: Edit, color: 'from-yellow-500 to-orange-500' },
              { label: 'Writers', value: stats.totalContributors, icon: Users, color: 'from-blue-500 to-cyan-500' },
              { label: 'Avg Read', value: stats.avgReadTime, icon: Clock, color: 'from-cyan-500 to-teal-500' },
              { label: 'Satisfaction', value: `${stats.satisfaction}%`, icon: ThumbsUp, color: 'from-teal-500 to-green-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-purple-200 text-xs">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="spaces">Spaces</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Pages */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Recently Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pages.slice(0, 5).map(page => (
                      <div key={page.id} onClick={() => setSelectedPage(page)}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{page.title}</h4>
                            <Badge className={getStatusColor(page.status)}>{page.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{page.excerpt}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{page.reading_time}</p>
                          <p>{new Date(page.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    New Space
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Code className="h-4 w-4 mr-2" />
                    Import from Git
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Markdown
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Popular Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Most Viewed Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics.slice(0, 4).map(stat => (
                    <div key={stat.page_id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{stat.page_title}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{stat.views.toLocaleString()} views</span>
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="h-3 w-3" />
                          {stat.feedback_positive}
                        </div>
                      </div>
                      <Progress value={Math.min((stat.views / 15000) * 100, 100)} className="h-1 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spaces Tab */}
          <TabsContent value="spaces" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map(space => (
                <Card key={space.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedSpace(space)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{space.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{space.name}</h3>
                          <code className="text-xs text-gray-500">/{space.key}</code>
                        </div>
                      </div>
                      {space.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{space.description}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={getVisibilityColor(space.visibility)}>{space.visibility}</Badge>
                      {space.git_sync?.enabled && (
                        <Badge variant="outline" className="text-xs">
                          <GitBranch className="h-3 w-3 mr-1" />
                          Git Sync
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{space.pages_count}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{space.team_members}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(space.views / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                    {space.custom_domain && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Globe className="h-3 w-3" />
                          {space.custom_domain}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <div className="flex gap-6">
              {/* Page Tree */}
              <Card className="w-64 flex-shrink-0">
                <CardHeader>
                  <CardTitle className="text-sm">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[500px]">
                    {pages.filter(p => !p.parent_id).map(page => (
                      <div key={page.id}>
                        <div
                          className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer ${selectedPage?.id === page.id ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                          onClick={() => setSelectedPage(page)}
                        >
                          {page.children.length > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); toggleExpand(page.id) }} className="p-0.5">
                              {expandedPages.includes(page.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          )}
                          {page.children.length === 0 && <FileText className="h-4 w-4 text-gray-400" />}
                          <span className="flex-1 text-sm truncate">{page.title}</span>
                        </div>
                        {expandedPages.includes(page.id) && pages.filter(p => p.parent_id === page.id).map(child => (
                          <div key={child.id}
                            className={`flex items-center gap-2 px-3 py-2 pl-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer ${selectedPage?.id === child.id ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                            onClick={() => setSelectedPage(child)}>
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="flex-1 text-sm truncate">{child.title}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Page Content */}
              <Card className="flex-1">
                <CardContent className="p-6">
                  {selectedPage ? (
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPage.title}</h2>
                            <Badge className={getStatusColor(selectedPage.status)}>{selectedPage.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px]">{selectedPage.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              {selectedPage.author.name}
                            </span>
                            <span>v{selectedPage.version}</span>
                            <span>{selectedPage.reading_time} read</span>
                            <span>{selectedPage.views.toLocaleString()} views</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowVersions(true)}>
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap">{selectedPage.content}</pre>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {selectedPage.likes}
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {selectedPage.comments_count}
                          </Button>
                        </div>
                        <div className="flex-1" />
                        <div className="flex flex-wrap gap-1">
                          {selectedPage.labels.map(label => (
                            <Badge key={label} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a page</h3>
                      <p className="text-gray-500">Choose a page from the navigation to view its content</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{template.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                          {template.is_official && <Badge className="bg-purple-100 text-purple-700">Official</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Used {template.usage_count} times</span>
                      <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Use Template</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Views', value: stats.totalViews.toLocaleString(), change: '+12%', icon: Eye },
                { label: 'Unique Visitors', value: '15.2K', change: '+8%', icon: Users },
                { label: 'Avg. Read Time', value: '4:32', change: '+5%', icon: Clock },
                { label: 'Satisfaction', value: '94%', change: '+2%', icon: ThumbsUp }
              ].map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="h-5 w-5 text-purple-600" />
                      <span className="text-xs text-green-600">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.map((stat, i) => (
                    <div key={stat.page_id} className="flex items-center gap-4">
                      <span className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs font-medium text-purple-600">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{stat.page_title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{stat.views.toLocaleString()} views</span>
                          <span>{stat.unique_visitors.toLocaleString()} visitors</span>
                          <span>{stat.avg_time} avg time</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center gap-2 text-sm">
                          <ThumbsUp className="h-3 w-3 text-green-600" />
                          <span>{stat.feedback_positive}</span>
                          <ThumbsDown className="h-3 w-3 text-red-500 ml-2" />
                          <span>{stat.feedback_negative}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Space</label>
                    <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                      {spaces.map(space => <option key={space.id} value={space.id}>{space.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enable Comments</p>
                      <p className="text-sm text-gray-500">Allow readers to comment on pages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Page Feedback</p>
                      <p className="text-sm text-gray-500">Show helpful/not helpful buttons</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-purple-600" />
                    Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {integrations.map(int => (
                      <div key={int.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <int.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{int.name}</p>
                            {int.last_sync && <p className="text-xs text-gray-500">Last sync: {int.last_sync}</p>}
                          </div>
                        </div>
                        <Badge className={int.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {int.status}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto-generate Meta</p>
                      <p className="text-sm text-gray-500">Generate SEO meta from content</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sitemap</p>
                      <p className="text-sm text-gray-500">Generate XML sitemap</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Robots.txt</p>
                      <p className="text-sm text-gray-500">Allow search engine indexing</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">New Comments</p>
                      <p className="text-sm text-gray-500">Notify on new comments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Page Updates</p>
                      <p className="text-sm text-gray-500">Notify when watched pages update</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Git Sync Errors</p>
                      <p className="text-sm text-gray-500">Alert on sync failures</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Version History Dialog */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <History className="h-5 w-5 text-purple-600" />
              Version History
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 py-4">
              {versions.map((version, index) => (
                <div key={version.id} className={`p-4 rounded-lg border ${version.is_current ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={version.is_current ? 'default' : 'outline'}>v{version.version}</Badge>
                      {version.is_current && <Badge className="bg-green-100 text-green-700">Current</Badge>}
                    </div>
                    <span className="text-sm text-gray-500">{new Date(version.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mb-2">{version.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[8px]">{version.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">{version.author.name}</span>
                      <span className="text-xs text-green-600">+{version.changes.additions}</span>
                      <span className="text-xs text-red-500">-{version.changes.deletions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      {!version.is_current && <Button variant="ghost" size="sm">Restore</Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* New Space Dialog */}
      <Dialog open={showNewSpace} onOpenChange={setShowNewSpace}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-purple-600" />
              Create New Space
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Space Name</label>
              <Input placeholder="My Documentation" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug</label>
              <Input placeholder="my-docs" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <Input placeholder="What is this space about?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
              <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <option value="public">Public - Anyone can view</option>
                <option value="internal">Internal - Team members only</option>
                <option value="private">Private - Invite only</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="git-sync" />
              <label htmlFor="git-sync" className="text-sm text-gray-700 dark:text-gray-300">Enable Git Sync</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewSpace(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600">Create Space</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
