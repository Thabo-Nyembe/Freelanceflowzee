'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText, Plus, Search, Filter, Eye, Edit, Trash2, Star, Clock, Users,
  BookOpen, FolderOpen, ChevronRight, ChevronDown, MessageSquare, History,
  Share2, Settings, Lock, Globe, Tag, Bookmark, ThumbsUp, ThumbsDown, Copy,
  ExternalLink, SortAsc, Calendar, CheckCircle2, Code, GitBranch, GitCommit,
  Zap, TrendingUp, BarChart3, Download, Upload, Sparkles, Lightbulb, Layout,
  RefreshCw, Bell, Shield, Database, Webhook, Languages, FileCheck, Rocket,
  ArrowUpRight, ArrowDownRight, Layers, Target, Activity, PenTool, Megaphone
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Type definitions
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

interface DocChangelog {
  id: string
  version: string
  title: string
  date: string
  type: 'major' | 'minor' | 'patch'
  status: 'published' | 'draft' | 'scheduled'
  scheduled_date?: string
  changes: {
    added: string[]
    changed: string[]
    fixed: string[]
    deprecated: string[]
    removed: string[]
    security: string[]
  }
  author: { name: string; avatar: string }
  views: number
}

interface DocLocale {
  id: string
  code: string
  name: string
  native_name: string
  flag: string
  is_default: boolean
  completion: number
  pages_translated: number
  pages_total: number
  last_updated: string
  contributors: { name: string; avatar: string }[]
  status: 'active' | 'draft' | 'review'
}

// Mock data
const mockSpaces: DocSpace[] = [
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

const mockPages: DocPage[] = [
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

const mockVersions: DocVersion[] = [
  { id: 'v1', page_id: 'page1', version: 12, author: { name: 'Sarah Chen', avatar: '' }, created_at: '2024-01-15T10:30:00Z',
    message: 'Updated getting started section with new examples', changes: { additions: 45, deletions: 12 }, is_current: true },
  { id: 'v2', page_id: 'page1', version: 11, author: { name: 'Mike Ross', avatar: '' }, created_at: '2024-01-14T15:00:00Z',
    message: 'Fixed typos and formatting', changes: { additions: 5, deletions: 5 }, is_current: false },
  { id: 'v3', page_id: 'page1', version: 10, author: { name: 'Sarah Chen', avatar: '' }, created_at: '2024-01-12T11:00:00Z',
    message: 'Added troubleshooting section', changes: { additions: 120, deletions: 0 }, is_current: false },
  { id: 'v4', page_id: 'page1', version: 9, author: { name: 'Emily Davis', avatar: '' }, created_at: '2024-01-10T09:00:00Z',
    message: 'Updated screenshots', changes: { additions: 8, deletions: 8 }, is_current: false }
]

const mockTemplates: DocTemplate[] = [
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

const mockIntegrations: DocIntegration[] = [
  { id: 'int1', name: 'GitHub', type: 'git', icon: GitBranch, status: 'connected', last_sync: '5 min ago',
    config: { repo: 'company/docs', branch: 'main' } },
  { id: 'int2', name: 'OpenAPI', type: 'api', icon: Code, status: 'connected', last_sync: '1 hour ago',
    config: { spec_url: 'https://api.company.com/openapi.json' } },
  { id: 'int3', name: 'Slack', type: 'webhook', icon: Webhook, status: 'connected' },
  { id: 'int4', name: 'Okta SSO', type: 'sso', icon: Shield, status: 'connected' }
]

const mockChangelogs: DocChangelog[] = [
  {
    id: 'cl1', version: '2.5.0', title: 'Enhanced Analytics Dashboard', date: '2025-01-20', type: 'minor',
    status: 'published', author: { name: 'Sarah Chen', avatar: '' }, views: 1250,
    changes: {
      added: ['Real-time analytics dashboard', 'Custom metrics builder', 'Export to CSV/PDF'],
      changed: ['Improved chart rendering performance', 'Updated UI for analytics cards'],
      fixed: ['Fixed timezone issues in reports', 'Resolved chart tooltip overlap'],
      deprecated: [], removed: [], security: []
    }
  },
  {
    id: 'cl2', version: '2.4.2', title: 'Security Patch', date: '2025-01-15', type: 'patch',
    status: 'published', author: { name: 'Mike Ross', avatar: '' }, views: 890,
    changes: {
      added: [],
      changed: ['Updated authentication flow'],
      fixed: ['Fixed session handling vulnerability'],
      deprecated: [], removed: [],
      security: ['Patched XSS vulnerability in markdown renderer', 'Enhanced input sanitization']
    }
  },
  {
    id: 'cl3', version: '2.4.1', title: 'Bug Fixes', date: '2025-01-10', type: 'patch',
    status: 'published', author: { name: 'Emily Davis', avatar: '' }, views: 650,
    changes: {
      added: [],
      changed: ['Minor UI improvements'],
      fixed: ['Fixed page navigation issue', 'Resolved search indexing delay', 'Fixed mobile menu toggle'],
      deprecated: [], removed: [], security: []
    }
  },
  {
    id: 'cl4', version: '2.4.0', title: 'Multi-language Support', date: '2025-01-05', type: 'minor',
    status: 'published', author: { name: 'Alex Kim', avatar: '' }, views: 2100,
    changes: {
      added: ['Multi-language documentation support', 'Automatic translation suggestions', 'Language switcher component'],
      changed: ['Restructured content model for i18n', 'Updated editor for translation workflows'],
      fixed: [], deprecated: [], removed: [], security: []
    }
  },
  {
    id: 'cl5', version: '3.0.0', title: 'Major Platform Update', date: '2025-02-01', type: 'major',
    status: 'scheduled', scheduled_date: '2025-02-01', author: { name: 'Sarah Chen', avatar: '' }, views: 0,
    changes: {
      added: ['AI-powered content suggestions', 'Real-time collaboration', 'Custom branding options', 'API v2 with GraphQL'],
      changed: ['Complete UI redesign', 'Improved performance across all pages'],
      fixed: [],
      deprecated: ['Legacy API v1 endpoints'],
      removed: ['Deprecated markdown extensions'],
      security: ['Enhanced encryption for sensitive content']
    }
  }
]

const mockLocales: DocLocale[] = [
  { id: 'l1', code: 'en', name: 'English', native_name: 'English', flag: '🇺🇸', is_default: true, completion: 100,
    pages_translated: 156, pages_total: 156, last_updated: '2025-01-20', status: 'active',
    contributors: [{ name: 'Sarah Chen', avatar: '' }, { name: 'Mike Ross', avatar: '' }] },
  { id: 'l2', code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_default: false, completion: 87,
    pages_translated: 136, pages_total: 156, last_updated: '2025-01-18', status: 'active',
    contributors: [{ name: 'Carlos Garcia', avatar: '' }] },
  { id: 'l3', code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_default: false, completion: 75,
    pages_translated: 117, pages_total: 156, last_updated: '2025-01-15', status: 'active',
    contributors: [{ name: 'Hans Mueller', avatar: '' }] },
  { id: 'l4', code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_default: false, completion: 68,
    pages_translated: 106, pages_total: 156, last_updated: '2025-01-12', status: 'active',
    contributors: [{ name: 'Marie Dubois', avatar: '' }] },
  { id: 'l5', code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_default: false, completion: 45,
    pages_translated: 70, pages_total: 156, last_updated: '2025-01-10', status: 'review',
    contributors: [{ name: 'Yuki Tanaka', avatar: '' }] },
  { id: 'l6', code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_default: false, completion: 32,
    pages_translated: 50, pages_total: 156, last_updated: '2025-01-08', status: 'draft',
    contributors: [{ name: 'Wei Zhang', avatar: '' }] }
]

// Enhanced Competitive Upgrade Mock Data
const mockDocsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Documentation Coverage', description: '94% of features documented. Above industry benchmark.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Coverage' },
  { id: '2', type: 'info' as const, title: 'Popular Pages', description: 'Getting Started guide viewed 1.2k times this week.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '3', type: 'warning' as const, title: 'Outdated Content', description: '5 pages not updated in 90+ days. Review recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Maintenance' },
]

const mockDocsCollaborators = [
  { id: '1', name: 'Tech Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Writer' },
  { id: '2', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'online' as const, role: 'Dev' },
  { id: '3', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'away' as const, role: 'PM' },
]

const mockDocsPredictions = [
  { id: '1', title: 'Content Gap', prediction: 'API v2 docs needed before Q1 release', confidence: 95, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Traffic Forecast', prediction: 'Documentation traffic expected to grow 20% next month', confidence: 78, trend: 'up' as const, impact: 'medium' as const },
]

const mockDocsActivities = [
  { id: '1', user: 'Tech Writer', action: 'Published', target: 'new API reference guide', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Developer', action: 'Updated', target: 'code examples in SDK docs', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Generated', target: 'changelog from commits', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockDocsQuickActions = [
  { id: '1', label: 'New Page', icon: 'plus', action: () => console.log('New page'), variant: 'default' as const },
  { id: '2', label: 'Search Docs', icon: 'search', action: () => console.log('Search'), variant: 'default' as const },
  { id: '3', label: 'Export PDF', icon: 'download', action: () => console.log('Export'), variant: 'outline' as const },
]

export default function DocumentationClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<DocSpace | null>(null)
  const [selectedPage, setSelectedPage] = useState<DocPage | null>(null)
  const [showVersions, setShowVersions] = useState(false)
  const [showNewSpace, setShowNewSpace] = useState(false)
  const [expandedPages, setExpandedPages] = useState<string[]>(['page1'])
  const [selectedChangelog, setSelectedChangelog] = useState<DocChangelog | null>(null)
  const [selectedLocale, setSelectedLocale] = useState<DocLocale | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  const stats = useMemo(() => ({
    totalSpaces: mockSpaces.length,
    totalPages: mockPages.length,
    totalViews: mockPages.reduce((sum, p) => sum + p.views, 0),
    publishedPages: mockPages.filter(p => p.status === 'published').length,
    draftPages: mockPages.filter(p => p.status === 'draft').length,
    totalContributors: new Set(mockPages.flatMap(p => [p.author.name, ...p.contributors.map(c => c.name)])).size,
    avgReadTime: '8 min',
    satisfaction: 94,
    languages: mockLocales.length,
    avgTranslation: Math.round(mockLocales.reduce((sum, l) => sum + l.completion, 0) / mockLocales.length)
  }), [])

  const getStatusColor = (status: DocPage['status']): string => {
    const colors: Record<DocPage['status'], string> = {
      published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[status]
  }

  const getVisibilityColor = (visibility: DocSpace['visibility']): string => {
    const colors: Record<DocSpace['visibility'], string> = {
      public: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      private: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      internal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[visibility]
  }

  const getVersionTypeColor = (type: DocChangelog['type']): string => {
    const colors: Record<DocChangelog['type'], string> = {
      major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      patch: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
    return colors[type]
  }

  const toggleExpand = (pageId: string) => {
    setExpandedPages(prev => prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId])
  }

  // Key metrics for header cards
  const keyMetrics = [
    { label: 'Spaces', value: stats.totalSpaces, icon: FolderOpen, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Pages', value: stats.totalPages, icon: FileText, gradient: 'from-purple-500 to-fuchsia-500' },
    { label: 'Views', value: `${(stats.totalViews / 1000).toFixed(1)}K`, icon: Eye, gradient: 'from-fuchsia-500 to-pink-500' },
    { label: 'Published', value: stats.publishedPages, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-500' },
    { label: 'Drafts', value: stats.draftPages, icon: Edit, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Writers', value: stats.totalContributors, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Languages', value: stats.languages, icon: Languages, gradient: 'from-cyan-500 to-teal-500' },
    { label: 'Satisfaction', value: `${stats.satisfaction}%`, icon: ThumbsUp, gradient: 'from-teal-500 to-emerald-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-10 w-10" />
                  <Badge className="bg-white/20 text-white border-0">GitBook Level</Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Documentation</h1>
                <p className="text-white/80">Knowledge management platform • Multi-language • Versioning • Analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Search docs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <Button onClick={() => setShowNewSpace(true)} className="bg-white text-purple-600 hover:bg-purple-50">
                  <Plus className="h-4 w-4 mr-2" />
                  New Space
                </Button>
              </div>
            </div>

            {/* 8 Gradient Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                      <metric.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xl font-bold">{metric.value}</div>
                  <div className="text-xs text-white/70">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border h-auto flex-wrap">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="spaces" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <FolderOpen className="h-4 w-4 mr-2" />
              Spaces
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Layout className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="changelogs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Megaphone className="h-4 w-4 mr-2" />
              Changelogs
            </TabsTrigger>
            <TabsTrigger value="localization" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Languages className="h-4 w-4 mr-2" />
              Localization
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Hub</h2>
                    <p className="text-purple-100">{stats.totalPages} pages across {stats.totalSpaces} spaces</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-purple-100 text-sm">Total Views</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'New Page', desc: 'Create documentation', color: 'text-purple-500' },
                { icon: FolderOpen, label: 'New Space', desc: 'Add new space', color: 'text-blue-500' },
                { icon: Upload, label: 'Import', desc: 'Import docs', color: 'text-green-500' },
                { icon: Search, label: 'Search', desc: 'Find content', color: 'text-orange-500' },
                { icon: GitBranch, label: 'Git Sync', desc: 'Sync with repo', color: 'text-indigo-500' },
                { icon: Languages, label: 'Translate', desc: 'Add translation', color: 'text-pink-500' },
                { icon: Sparkles, label: 'AI Assist', desc: 'AI writing help', color: 'text-amber-500' },
                { icon: Download, label: 'Export', desc: 'Export docs', color: 'text-cyan-500' },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Recently Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPages.slice(0, 5).map(page => (
                      <div key={page.id} onClick={() => setSelectedPage(page)}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{page.title}</h4>
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
                  <Button className="w-full justify-start" variant="outline">
                    <Megaphone className="h-4 w-4 mr-2" />
                    New Changelog
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Changelogs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-purple-600" />
                  Recent Changelogs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockChangelogs.slice(0, 3).map(changelog => (
                    <div key={changelog.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getVersionTypeColor(changelog.type)}>{changelog.version}</Badge>
                        <Badge variant="outline">{changelog.type}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{changelog.title}</h4>
                      <p className="text-sm text-gray-500">{new Date(changelog.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spaces Tab */}
          <TabsContent value="spaces" className="space-y-6">
            {/* Spaces Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FolderOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Spaces</h2>
                    <p className="text-blue-100">{stats.totalSpaces} spaces with {stats.totalPages} total pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowNewSpace(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Space
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSpaces.map(space => (
                <Card key={space.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedSpace(space)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{space.icon}</span>
                        <div>
                          <h3 className="font-semibold">{space.name}</h3>
                          <code className="text-xs text-gray-500">/{space.key}</code>
                        </div>
                      </div>
                      {space.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{space.description}</p>
                    <div className="flex items-center gap-2 mb-4">
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
            {/* Pages Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">All Pages</h2>
                    <p className="text-emerald-100">{stats.publishedPages} published, {stats.draftPages} drafts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">{stats.avgReadTime} avg read</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <Card className="w-64 flex-shrink-0">
                <CardHeader>
                  <CardTitle className="text-sm">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[500px]">
                    {mockPages.filter(p => !p.parent_id).map(page => (
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
                        {expandedPages.includes(page.id) && mockPages.filter(p => p.parent_id === page.id).map(child => (
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

              <Card className="flex-1">
                <CardContent className="p-6">
                  {selectedPage ? (
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold">{selectedPage.title}</h2>
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
                      <h3 className="text-lg font-medium mb-2">Select a page</h3>
                      <p className="text-gray-500">Choose a page from the navigation to view its content</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Overview Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layout className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Templates</h2>
                    <p className="text-amber-100">{mockTemplates.length} templates available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{template.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
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

          {/* Changelogs Tab */}
          <TabsContent value="changelogs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Changelogs</h2>
                <p className="text-gray-500">Track product updates and release notes</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Changelog
              </Button>
            </div>

            <div className="space-y-4">
              {mockChangelogs.map(changelog => (
                <Card key={changelog.id} className={changelog.status === 'scheduled' ? 'border-dashed border-purple-300' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${changelog.type === 'major' ? 'text-red-600' : changelog.type === 'minor' ? 'text-blue-600' : 'text-gray-600'}`}>
                            {changelog.version}
                          </div>
                          <Badge className={getVersionTypeColor(changelog.type)}>{changelog.type}</Badge>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{changelog.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span>{new Date(changelog.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[6px]">{changelog.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              {changelog.author.name}
                            </span>
                            {changelog.status === 'published' && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {changelog.views}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {changelog.status === 'scheduled' && (
                          <Badge variant="outline" className="text-purple-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {changelog.changes.added.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-emerald-600 mb-2">Added ({changelog.changes.added.length})</div>
                          <ul className="space-y-1">
                            {changelog.changes.added.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-600 truncate">+ {item}</li>
                            ))}
                            {changelog.changes.added.length > 2 && <li className="text-xs text-gray-400">+{changelog.changes.added.length - 2} more</li>}
                          </ul>
                        </div>
                      )}
                      {changelog.changes.changed.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-blue-600 mb-2">Changed ({changelog.changes.changed.length})</div>
                          <ul className="space-y-1">
                            {changelog.changes.changed.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-600 truncate">~ {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {changelog.changes.fixed.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-amber-600 mb-2">Fixed ({changelog.changes.fixed.length})</div>
                          <ul className="space-y-1">
                            {changelog.changes.fixed.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-600 truncate">* {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {changelog.changes.security.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-red-600 mb-2">Security ({changelog.changes.security.length})</div>
                          <ul className="space-y-1">
                            {changelog.changes.security.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-600 truncate">! {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {changelog.changes.deprecated.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-2">Deprecated ({changelog.changes.deprecated.length})</div>
                          <ul className="space-y-1">
                            {changelog.changes.deprecated.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-600 truncate">- {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {changelog.changes.removed.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-red-600 mb-2">Removed ({changelog.changes.removed.length})</div>
                          <ul className="space-y-1">
                            {changelog.changes.removed.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-600 truncate">x {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="localization" className="space-y-6">
            {/* Localization Overview Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Languages className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Localization</h2>
                    <p className="text-pink-100">{stats.languages} languages, {stats.avgTranslation}% avg completion</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Language Management</h2>
                <p className="text-gray-500">Manage multi-language documentation</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Languages</span>
                  </div>
                  <div className="text-3xl font-bold">{mockLocales.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Avg. Completion</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.avgTranslation}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Pages Translated</span>
                  </div>
                  <div className="text-3xl font-bold">{mockLocales.reduce((sum, l) => sum + l.pages_translated, 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Translators</span>
                  </div>
                  <div className="text-3xl font-bold">{mockLocales.reduce((sum, l) => sum + l.contributors.length, 0)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLocales.map(locale => (
                <Card key={locale.id} className={locale.is_default ? 'border-purple-300' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{locale.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{locale.name}</h3>
                            {locale.is_default && <Badge className="bg-purple-100 text-purple-700">Default</Badge>}
                          </div>
                          <p className="text-sm text-gray-500">{locale.native_name} ({locale.code})</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        locale.status === 'active' ? 'text-emerald-600' :
                        locale.status === 'review' ? 'text-amber-600' : 'text-gray-600'
                      }>
                        {locale.status}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Translation Progress</span>
                        <span className={`font-medium ${locale.completion >= 80 ? 'text-emerald-600' : locale.completion >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {locale.completion}%
                        </span>
                      </div>
                      <Progress value={locale.completion} className={`h-2 ${
                        locale.completion >= 80 ? '[&>div]:bg-emerald-500' : locale.completion >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                      }`} />
                      <p className="text-xs text-gray-500 mt-1">
                        {locale.pages_translated} / {locale.pages_total} pages translated
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {locale.contributors.slice(0, 3).map((contributor, idx) => (
                          <Avatar key={idx} className="h-6 w-6 border-2 border-white -ml-1 first:ml-0">
                            <AvatarFallback className="text-[8px]">{contributor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        ))}
                        {locale.contributors.length > 3 && (
                          <span className="text-xs text-gray-500 ml-1">+{locale.contributors.length - 3}</span>
                        )}
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Analytics</h2>
                    <p className="text-violet-100">{stats.satisfaction}% reader satisfaction</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">{stats.totalViews.toLocaleString()} views</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>

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
                      <span className="text-xs text-emerald-600">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
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
                  {mockPages.slice(0, 5).map((page, i) => (
                    <div key={page.id} className="flex items-center gap-4">
                      <span className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs font-medium text-purple-600">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium">{page.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{page.views.toLocaleString()} views</span>
                          <span>{page.reading_time} avg time</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center gap-2 text-sm">
                          <ThumbsUp className="h-3 w-3 text-emerald-600" />
                          <span>{page.likes}</span>
                          <ThumbsDown className="h-3 w-3 text-red-500 ml-2" />
                          <span>{Math.round(page.likes * 0.05)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Settings</h2>
                    <p className="text-purple-100">Configure spaces, editor, SEO, and integration preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Configured</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <nav className="p-2 space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                      { id: 'editor', icon: PenTool, label: 'Editor', desc: 'Writing preferences' },
                      { id: 'seo', icon: Globe, label: 'SEO & Meta', desc: 'Search optimization' },
                      { id: 'integrations', icon: GitBranch, label: 'Integrations', desc: 'Connected services' },
                      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert settings' },
                      { id: 'advanced', icon: Database, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs opacity-70">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </Card>
              </div>

              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Space Defaults</CardTitle>
                        <CardDescription>Configure default settings for documentation spaces</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Space</Label>
                            <Select defaultValue="space1">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {mockSpaces.map(space => (
                                  <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Default Visibility</Label>
                            <Select defaultValue="public">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable Comments</Label>
                            <p className="text-sm text-gray-500">Allow readers to comment on pages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Page Feedback</Label>
                            <p className="text-sm text-gray-500">Show helpful/not helpful buttons</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Reading Time</Label>
                            <p className="text-sm text-gray-500">Display estimated reading time</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Display Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Table of Contents</Label>
                            <p className="text-sm text-gray-500">Show TOC on pages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Breadcrumbs</Label>
                            <p className="text-sm text-gray-500">Show navigation breadcrumbs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Page Contributors</Label>
                            <p className="text-sm text-gray-500">Display contributor avatars</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Editor Settings */}
                {settingsTab === 'editor' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Editor Preferences</CardTitle>
                        <CardDescription>Customize the documentation editor experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Editor Mode</Label>
                            <Select defaultValue="wysiwyg">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="wysiwyg">WYSIWYG Editor</SelectItem>
                                <SelectItem value="markdown">Markdown</SelectItem>
                                <SelectItem value="split">Split View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Font Size</Label>
                            <Select defaultValue="16">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="14">14px</SelectItem>
                                <SelectItem value="16">16px</SelectItem>
                                <SelectItem value="18">18px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-save</Label>
                            <p className="text-sm text-gray-500">Automatically save drafts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Spell Check</Label>
                            <p className="text-sm text-gray-500">Enable spell checking in editor</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Code Highlighting</Label>
                            <p className="text-sm text-gray-500">Syntax highlighting for code blocks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Assistant</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>AI Writing Suggestions</Label>
                            <p className="text-sm text-gray-500">Get AI-powered writing suggestions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-complete</Label>
                            <p className="text-sm text-gray-500">AI-powered sentence completion</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Grammar Correction</Label>
                            <p className="text-sm text-gray-500">Automatic grammar fixes</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* SEO Settings */}
                {settingsTab === 'seo' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Search Engine Optimization</CardTitle>
                        <CardDescription>Configure SEO settings for better discoverability</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-generate Meta</Label>
                            <p className="text-sm text-gray-500">Generate SEO meta from content</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>XML Sitemap</Label>
                            <p className="text-sm text-gray-500">Generate XML sitemap automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Robots.txt</Label>
                            <p className="text-sm text-gray-500">Allow search engine indexing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Open Graph Tags</Label>
                            <p className="text-sm text-gray-500">Generate social media preview tags</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Custom Domain</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Custom Domain URL</Label>
                          <Input placeholder="docs.example.com" className="mt-1" />
                          <p className="text-xs text-gray-500 mt-1">Point your CNAME to docs.kazi.com</p>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>SSL Certificate</Label>
                            <p className="text-sm text-gray-500">Auto-provision SSL</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-purple-600" />
                          Connected Services
                        </CardTitle>
                        <CardDescription>Manage integrations with external services</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockIntegrations.map(int => (
                            <div key={int.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                                  <int.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{int.name}</p>
                                  {int.last_sync && <p className="text-xs text-gray-500">Last sync: {int.last_sync}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={int.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                  {int.status}
                                </Badge>
                                <Button variant="outline" size="sm">Configure</Button>
                              </div>
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
                        <CardTitle>Git Sync</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable Git Sync</Label>
                            <p className="text-sm text-gray-500">Sync documentation with Git repository</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Repository URL</Label>
                            <Input placeholder="github.com/org/repo" className="mt-1" />
                          </div>
                          <div>
                            <Label>Branch</Label>
                            <Input placeholder="main" className="mt-1" defaultValue="main" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-sync on Push</Label>
                            <p className="text-sm text-gray-500">Automatically sync when changes pushed</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure when to receive email notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>New Comments</Label>
                            <p className="text-sm text-gray-500">Notify on new comments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Page Updates</Label>
                            <p className="text-sm text-gray-500">Notify when watched pages update</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Translation Updates</Label>
                            <p className="text-sm text-gray-500">Notify on translation changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Weekly Digest</Label>
                            <p className="text-sm text-gray-500">Receive weekly documentation summary</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>In-App Notifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Mentions</Label>
                            <p className="text-sm text-gray-500">Notify when mentioned</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Edit Suggestions</Label>
                            <p className="text-sm text-gray-500">Notify on suggested edits</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Review Requests</Label>
                            <p className="text-sm text-gray-500">Notify when review is requested</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Configure data retention and backups</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Automatic Backups</Label>
                            <p className="text-sm text-gray-500">Daily backup of all documentation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Version Retention</Label>
                            <p className="text-sm text-gray-500">How long to keep page versions</p>
                          </div>
                          <Select defaultValue="forever">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500">Log all changes to documentation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable API Access</Label>
                            <p className="text-sm text-gray-500">Allow programmatic access to docs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input value="doc_••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline">Regenerate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Webhook Notifications</Label>
                            <p className="text-sm text-gray-500">Send webhooks on doc changes</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Export All Data</Label>
                            <p className="text-sm text-gray-500">Download complete documentation backup</p>
                          </div>
                          <Button variant="outline">Export</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Delete All Documentation</Label>
                            <p className="text-sm text-gray-500">Permanently delete all docs</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Delete All</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockDocsAIInsights}
              title="Documentation Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockDocsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockDocsPredictions}
              title="Documentation Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockDocsActivities}
            title="Documentation Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockDocsQuickActions}
            variant="grid"
          />
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
                {mockVersions.map((version) => (
                  <div key={version.id} className={`p-4 rounded-lg border ${version.is_current ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={version.is_current ? 'default' : 'outline'}>v{version.version}</Badge>
                        {version.is_current && <Badge className="bg-emerald-100 text-emerald-700">Current</Badge>}
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
                        <span className="text-xs text-emerald-600">+{version.changes.additions}</span>
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
                <Label>Space Name</Label>
                <Input placeholder="My Documentation" className="mt-1" />
              </div>
              <div>
                <Label>URL Slug</Label>
                <Input placeholder="my-docs" className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="What is this space about?" className="mt-1" />
              </div>
              <div>
                <Label>Visibility</Label>
                <Select defaultValue="public">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="internal">Internal - Team members only</SelectItem>
                    <SelectItem value="private">Private - Invite only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="git-sync" />
                <Label htmlFor="git-sync">Enable Git Sync</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewSpace(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600">Create Space</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
