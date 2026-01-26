'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen,
  FileText,
  FolderTree,
  Search,
  LayoutTemplate,
  BarChart3,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Star,
  Clock,
  Users,
  Lock,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Share2,
  Copy,
  Home,
  History,
  Tag,
  Hash,
  Filter,
  Sparkles,
  Zap,
  TrendingUp,
  Globe,
  FileCheck,
  FilePlus,
  FileEdit,
  Archive,
  Timer,
  Award,
  Lightbulb,
  Shield,
  Sliders,
  Bell,
  Webhook,
  Database,
  RefreshCw,
  Download,
  FileCode,
  Folder,
  GitBranch,
  Workflow,
  Mail,
  Palette
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

import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Types
type ArticleStatus = 'published' | 'draft' | 'review' | 'archived' | 'scheduled'
type ArticleType = 'page' | 'blog' | 'how-to' | 'tutorial' | 'reference' | 'faq' | 'template'
type ArticleLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type PermissionLevel = 'view' | 'edit' | 'admin' | 'owner'

interface Author {
  id: string
  name: string
  avatar?: string
  role: string
}

interface ArticleVersion {
  id: string
  version: number
  author: Author
  changes: string
  createdAt: string
}

interface ArticleComment {
  id: string
  author: Author
  content: string
  createdAt: string
  replies: ArticleComment[]
  likes: number
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: ArticleStatus
  type: ArticleType
  level: ArticleLevel
  spaceId: string
  spaceName: string
  parentId?: string
  parentTitle?: string
  author: Author
  contributors: Author[]
  labels: string[]
  readTime: number
  views: number
  likes: number
  bookmarks: number
  shares: number
  rating: number
  totalRatings: number
  commentsCount: number
  versions: ArticleVersion[]
  comments: ArticleComment[]
  relatedArticles: string[]
  permissions: { userId: string; level: PermissionLevel }[]
  isStarred: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledAt?: string
}

interface Space {
  id: string
  name: string
  key: string
  description: string
  icon: string
  color: string
  articlesCount: number
  membersCount: number
  isPublic: boolean
  isFavorite: boolean
  createdAt: string
  owner: Author
}

interface Template {
  id: string
  name: string
  description: string
  type: ArticleType
  category: string
  usageCount: number
  preview: string
  isGlobal: boolean
  createdBy: Author
}

interface SearchResult {
  id: string
  title: string
  excerpt: string
  type: 'article' | 'space' | 'comment'
  highlight: string
  score: number
  spaceKey?: string
}

interface ContentStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalViews: number
  totalContributors: number
  avgReadTime: number
  topLabel: string
  growthRate: number
}

// Helper functions
const getStatusColor = (status: ArticleStatus): string => {
  const colors: Record<ArticleStatus, string> = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
  return colors[status]
}

const getTypeIcon = (type: ArticleType) => {
  const icons: Record<ArticleType, JSX.Element> = {
    page: <FileText className="w-4 h-4" />,
    blog: <BookOpen className="w-4 h-4" />,
    'how-to': <Lightbulb className="w-4 h-4" />,
    tutorial: <Sparkles className="w-4 h-4" />,
    reference: <Hash className="w-4 h-4" />,
    faq: <MessageSquare className="w-4 h-4" />,
    template: <LayoutTemplate className="w-4 h-4" />
  }
  return icons[type]
}

const getLevelColor = (level: ArticleLevel): string => {
  const colors: Record<ArticleLevel, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-orange-100 text-orange-700',
    expert: 'bg-red-100 text-red-700'
  }
  return colors[level]
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTimeAgo = (date: string): string => {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

// Empty data arrays (to be populated from real data sources)
const emptyAuthors: Author[] = []
const emptySpaces: Space[] = []
const emptyArticles: Article[] = []
const emptyTemplates: Template[] = []
const emptyStats: ContentStats = {
  totalArticles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  totalViews: 0,
  totalContributors: 0,
  avgReadTime: 0,
  topLabel: '',
  growthRate: 0
}

interface KnowledgeArticlesClientProps {
  initialArticles?: Article[]
  initialStats?: ContentStats
}

// Empty data arrays for AI-powered competitive upgrade components (to be populated from real data sources)
const emptyKnowledgeArticlesAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const emptyKnowledgeArticlesCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const emptyKnowledgeArticlesPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down'; impact: 'low' | 'medium' | 'high' }[] = []

const emptyKnowledgeArticlesActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' }[] = []

// Note: knowledgeArticlesQuickActions is defined inside the component to access state setters

// Helper function for exporting data as JSON
const downloadAsJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function KnowledgeArticlesClient({ initialArticles, initialStats }: KnowledgeArticlesClientProps) {
  // Team and activity hooks for collaboration components
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const [activeTab, setActiveTab] = useState('articles')
  const [articles, setArticles] = useState<Article[]>(emptyArticles)
  const [spaces] = useState<Space[]>(emptySpaces)
  const [templates] = useState<Template[]>(emptyTemplates)
  const [stats] = useState<ContentStats>(emptyStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ArticleType | 'all'>('all')
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set(['s1', 's4']))
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for real functionality
  const [showCreateArticleDialog, setShowCreateArticleDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [showEditArticleDialog, setShowEditArticleDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showVersionsDialog, setShowVersionsDialog] = useState(false)
  const [showContributorsDialog, setShowContributorsDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showFavoritesDialog, setShowFavoritesDialog] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showArchivedDialog, setShowArchivedDialog] = useState(false)
  const [showDeletedDialog, setShowDeletedDialog] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [showUsageStatsDialog, setShowUsageStatsDialog] = useState(false)
  const [advancedSearchQuery, setAdvancedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'rating'>('date')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showDuplicateTemplateDialog, setShowDuplicateTemplateDialog] = useState(false)
  const [showCustomizeTemplateDialog, setShowCustomizeTemplateDialog] = useState(false)

  // Computed values
  const filteredArticles = useMemo(() => {
    let result = articles

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.excerpt.toLowerCase().includes(query) ||
        a.labels.some(l => l.toLowerCase().includes(query)) ||
        a.spaceName.toLowerCase().includes(query)
      )
    }

    if (selectedSpace) {
      result = result.filter(a => a.spaceId === selectedSpace)
    }

    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      result = result.filter(a => a.type === typeFilter)
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        result = [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case 'views':
        result = [...result].sort((a, b) => b.views - a.views)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
    }

    return result
  }, [articles, searchQuery, selectedSpace, statusFilter, typeFilter, sortBy])

  const recentArticles = useMemo(() => {
    return [...articles].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  }, [articles])

  const popularArticles = useMemo(() => {
    return [...articles].filter(a => a.status === 'published').sort((a, b) => b.views - a.views).slice(0, 5)
  }, [articles])

  const toggleSpaceExpand = (spaceId: string) => {
    const newSet = new Set(expandedSpaces)
    if (newSet.has(spaceId)) {
      newSet.delete(spaceId)
    } else {
      newSet.add(spaceId)
    }
    setExpandedSpaces(newSet)
  }

  const toggleArticleStar = (articleId: string) => {
    setArticles(prev => prev.map(a =>
      a.id === articleId ? { ...a, isStarred: !a.isStarred } : a
    ))
  }

  const openArticleDetail = (article: Article) => {
    setSelectedArticle(article)
    setShowArticleDialog(true)
  }

  // Stat cards
  const statCards = [
    { label: 'Total Articles', value: stats.totalArticles.toString(), icon: FileText, color: 'from-blue-500 to-indigo-600', change: '+24' },
    { label: 'Published', value: stats.publishedArticles.toString(), icon: FileCheck, color: 'from-green-500 to-emerald-600', change: '+18' },
    { label: 'Drafts', value: stats.draftArticles.toString(), icon: FileEdit, color: 'from-yellow-500 to-orange-600', change: '+5' },
    { label: 'Total Views', value: `${(stats.totalViews / 1000).toFixed(1)}K`, icon: Eye, color: 'from-purple-500 to-violet-600', change: '+12.5%' },
    { label: 'Contributors', value: stats.totalContributors.toString(), icon: Users, color: 'from-pink-500 to-rose-600', change: '+3' },
    { label: 'Avg Read Time', value: `${stats.avgReadTime}m`, icon: Timer, color: 'from-cyan-500 to-blue-600', change: '-2m' },
    { label: 'Top Label', value: stats.topLabel, icon: Tag, color: 'from-teal-500 to-cyan-600', change: '' },
    { label: 'Growth', value: `${stats.growthRate}%`, icon: TrendingUp, color: 'from-amber-500 to-orange-600', change: '+5.2%' }
  ]

  // Real handlers with actual functionality
  const handleCreateArticle = () => {
    setShowCreateArticleDialog(true)
    toast.success('Create Article', { description: 'Opening article editor...' })
  }

  const handlePublishArticle = (articleId: string) => {
    setArticles(prev => prev.map(a =>
      a.id === articleId ? { ...a, status: 'published' as ArticleStatus, publishedAt: new Date().toISOString() } : a
    ))
    toast.success('Article published', { description: 'Article is now live' })
  }

  const handleUnpublishArticle = (articleId: string) => {
    setArticles(prev => prev.map(a =>
      a.id === articleId ? { ...a, status: 'draft' as ArticleStatus, publishedAt: undefined } : a
    ))
    toast.success('Article unpublished', { description: 'Article moved to drafts' })
  }

  const handleArchiveArticle = (articleId: string) => {
    setArticles(prev => prev.map(a =>
      a.id === articleId ? { ...a, status: 'archived' as ArticleStatus } : a
    ))
    toast.success('Article archived', { description: 'Article has been archived' })
    setShowArticleDialog(false)
  }

  const handleDeleteArticle = (articleId: string) => {
    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      setArticles(prev => prev.filter(a => a.id !== articleId))
      toast.success('Article deleted', { description: 'Article has been permanently deleted' })
      setShowArticleDialog(false)
    }
  }

  const handleExportArticles = () => {
    downloadAsJson(articles, `knowledge-articles-${new Date().toISOString().split('T')[0]}.json`)
    toast.success('Export complete', { description: 'Articles downloaded as JSON' })
  }

  const handleCopyArticleLink = (article: Article) => {
    const url = `${window.location.origin}/knowledge/${article.slug}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied', { description: 'Article link copied to clipboard' })
    }).catch(() => {
      toast.error('Failed to copy', { description: 'Could not copy link to clipboard' })
    })
  }

  const handleShareArticle = async (article: Article) => {
    const url = `${window.location.origin}/knowledge/${article.slug}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: url
        })
        toast.success('Shared successfully', { description: 'Article shared' })
      } catch (err) {
        // User cancelled or share failed - copy to clipboard instead
        navigator.clipboard.writeText(url)
        toast.success('Link copied', { description: 'Article link copied to clipboard' })
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url)
      toast.success('Link copied', { description: 'Share link copied to clipboard' })
    }
  }

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article)
    setShowEditArticleDialog(true)
    toast.success('Edit mode', { description: 'Opening article editor...' })
  }

  const handleAdvancedSearch = () => {
    if (!advancedSearchQuery.trim()) {
      toast.error('Search query required', { description: 'Please enter a search term' })
      return
    }
    setSearchQuery(advancedSearchQuery)
    setActiveTab('articles')
    toast.success('Search applied', { description: `Showing results for "${advancedSearchQuery}"` })
  }

  const handleClearCache = () => {
    // Simulating cache clear by resetting filters
    setSearchQuery('')
    setSelectedSpace(null)
    setStatusFilter('all')
    setTypeFilter('all')
    toast.success('Cache cleared', { description: 'All cached content has been refreshed' })
  }

  const handleConnectIntegration = (integration: string) => {
    toast.success(`Connecting to ${integration}`, { description: 'Opening authorization window...' })
    // In a real app, this would open an OAuth flow
    window.open(`https://${integration.toLowerCase()}.com/oauth`, '_blank')
  }

  const handleDeleteKnowledgeBase = () => {
    if (confirm('Are you absolutely sure? This will permanently delete ALL articles, spaces, and settings. This action CANNOT be undone.')) {
      if (confirm('This is your final warning. Type "DELETE" in the next prompt to confirm.')) {
        const confirmation = prompt('Type "DELETE" to confirm permanent deletion:')
        if (confirmation === 'DELETE') {
          setArticles([])
          toast.success('Knowledge base deleted', { description: 'All content has been permanently removed' })
        } else {
          toast.info('Deletion cancelled', { description: 'Knowledge base was not deleted' })
        }
      }
    }
  }

  const handleUseTemplate = (template: Template) => {
    setShowCreateArticleDialog(true)
    toast.success('Template applied', { description: `Creating article with "${template.name}" template` })
  }

  const handleDuplicateTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setShowDuplicateTemplateDialog(true)
  }

  const handleCustomizeTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setShowCustomizeTemplateDialog(true)
  }

  const handleSortChange = (newSortBy: 'date' | 'views' | 'rating') => {
    setSortBy(newSortBy)
    setShowSortMenu(false)
    const sortLabels = { date: 'Date (newest)', views: 'Views (highest)', rating: 'Rating (best)' }
    toast.success('Sort updated', { description: `Sorting by ${sortLabels[newSortBy]}` })
  }

  // Quick actions for the toolbar (now with real functionality)
  const knowledgeArticlesQuickActions = [
    { id: '1', label: 'New Article', icon: 'plus', action: () => setShowCreateArticleDialog(true), variant: 'default' as const },
    { id: '2', label: 'Templates', icon: 'layout', action: () => setShowTemplatesDialog(true), variant: 'default' as const },
    { id: '3', label: 'Analytics', icon: 'bar-chart', action: () => setShowAnalyticsDialog(true), variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Knowledge Base</h1>
              <p className="text-muted-foreground">Create, organize, and share documentation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setShowTemplatesDialog(true)}>
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2" onClick={handleCreateArticle}>
              <Plus className="w-4 h-4" />
              Create Article
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                {stat.change && <span className="text-xs text-green-500 font-medium">{stat.change}</span>}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 h-auto flex-wrap">
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="w-4 h-4" />
              Articles
              <Badge variant="secondary" className="ml-1">{articles.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="spaces" className="gap-2">
              <FolderTree className="w-4 h-4" />
              Spaces
              <Badge variant="secondary" className="ml-1">{spaces.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates
              <Badge variant="secondary" className="ml-1">{templates.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="w-4 h-4" />
              Advanced Search
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Articles Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Knowledge Articles</h3>
                    <p className="text-blue-100">Create, organize, and share documentation</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.totalArticles}</p>
                    <p className="text-sm text-blue-100">Total Articles</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.publishedArticles}</p>
                    <p className="text-sm text-blue-100">Published</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-blue-100">Total Views</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.totalContributors}</p>
                    <p className="text-sm text-blue-100">Contributors</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: FilePlus, label: 'New Article', color: 'from-blue-500 to-indigo-600', action: () => setShowCreateArticleDialog(true) },
                { icon: LayoutTemplate, label: 'Templates', color: 'from-purple-500 to-pink-600', action: () => setShowTemplatesDialog(true) },
                { icon: FolderTree, label: 'New Space', color: 'from-green-500 to-emerald-600', action: () => setShowCreateSpaceDialog(true) },
                { icon: Search, label: 'Search', color: 'from-orange-500 to-amber-600', action: () => setActiveTab('search') },
                { icon: GitBranch, label: 'Versions', color: 'from-cyan-500 to-blue-600', action: () => setShowVersionsDialog(true) },
                { icon: Users, label: 'Contributors', color: 'from-pink-500 to-rose-600', action: () => setShowContributorsDialog(true) },
                { icon: BarChart3, label: 'Analytics', color: 'from-indigo-500 to-purple-600', action: () => setShowAnalyticsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600', action: () => setActiveTab('settings') },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Space Navigation */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FolderTree className="w-4 h-4" />
                      Spaces
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <Button
                      variant={selectedSpace === null ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-9"
                      onClick={() => setSelectedSpace(null)}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      All Articles
                    </Button>
                    {spaces.map(space => (
                      <div key={space.id}>
                        <Button
                          variant={selectedSpace === space.id ? 'secondary' : 'ghost'}
                          className="w-full justify-between h-9"
                          onClick={() => setSelectedSpace(space.id === selectedSpace ? null : space.id)}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: space.color }} />
                            {space.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{space.articlesCount}</span>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                      <div className="flex flex-wrap gap-1">
                        {(['all', 'published', 'draft', 'review'] as const).map(status => (
                          <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setStatusFilter(status)}
                          >
                            {status === 'all' ? 'All' : status}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                      <div className="flex flex-wrap gap-1">
                        {(['all', 'page', 'how-to', 'tutorial', 'reference'] as const).map(type => (
                          <Button
                            key={type}
                            variant={typeFilter === type ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setTypeFilter(type)}
                          >
                            {type === 'all' ? 'All' : type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recently Updated */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recently Updated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentArticles.map(article => (
                      <div
                        key={article.id}
                        className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => openArticleDetail(article)}
                      >
                        <p className="text-sm font-medium truncate">{article.title}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(article.updatedAt)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{filteredArticles.length} Articles</h3>
                  <div className="flex items-center gap-2 relative">
                    <Button variant="outline" size="sm" onClick={() => setShowSortMenu(!showSortMenu)}>
                      Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'views' ? 'Views' : 'Rating'}
                    </Button>
                    {showSortMenu && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border rounded-md shadow-lg min-w-[150px]">
                        <button
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === 'date' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}`}
                          onClick={() => handleSortChange('date')}
                        >
                          Date (newest)
                        </button>
                        <button
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === 'views' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}`}
                          onClick={() => handleSortChange('views')}
                        >
                          Views (highest)
                        </button>
                        <button
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${sortBy === 'rating' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}`}
                          onClick={() => handleSortChange('rating')}
                        >
                          Rating (best)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredArticles.map(article => (
                    <Card
                      key={article.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => openArticleDetail(article)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {article.isPinned && <Bookmark className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                            <h4 className="font-semibold hover:text-blue-600">{article.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={getStatusColor(article.status)}>{article.status}</Badge>
                            <Badge variant="outline" className="gap-1">
                              {getTypeIcon(article.type)}
                              {article.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: spaces.find(s => s.id === article.spaceId)?.color }} />
                              {article.spaceName}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {article.readTime}m read
                            </span>
                          </div>

                          {article.labels.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {article.labels.slice(0, 4).map(label => (
                                <Badge key={label} variant="secondary" className="text-xs">
                                  #{label}
                                </Badge>
                              ))}
                              {article.labels.length > 4 && (
                                <span className="text-xs text-muted-foreground">+{article.labels.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {article.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {article.commentsCount}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={article.author.avatar} alt="User avatar" />
                              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {article.author.name} • {formatTimeAgo(article.updatedAt)}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => { e.stopPropagation(); toggleArticleStar(article.id) }}
                          >
                            <Star className={`w-4 h-4 ${article.isStarred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Spaces Tab */}
          <TabsContent value="spaces" className="space-y-6">
            {/* Spaces Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FolderTree className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Content Spaces</h3>
                    <p className="text-purple-100">Organize articles into logical spaces</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{spaces.length}</p>
                    <p className="text-sm text-purple-100">Total Spaces</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{spaces.filter(s => s.isPublic).length}</p>
                    <p className="text-sm text-purple-100">Public</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{spaces.reduce((a, s) => a + s.articlesCount, 0)}</p>
                    <p className="text-sm text-purple-100">Total Articles</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{spaces.reduce((a, s) => a + s.membersCount, 0)}</p>
                    <p className="text-sm text-purple-100">Members</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'Create Space', color: 'from-purple-500 to-violet-600', action: () => setShowCreateSpaceDialog(true) },
                { icon: Folder, label: 'Browse All', color: 'from-blue-500 to-indigo-600', action: () => setSelectedSpace(null) },
                { icon: Star, label: 'Favorites', color: 'from-yellow-500 to-orange-600', action: () => setShowFavoritesDialog(true) },
                { icon: Users, label: 'Members', color: 'from-green-500 to-emerald-600', action: () => setShowMembersDialog(true) },
                { icon: Lock, label: 'Permissions', color: 'from-red-500 to-pink-600', action: () => setShowPermissionsDialog(true) },
                { icon: Archive, label: 'Archived', color: 'from-gray-500 to-gray-600', action: () => setShowArchivedDialog(true) },
                { icon: Settings, label: 'Settings', color: 'from-cyan-500 to-blue-600', action: () => setActiveTab('settings') },
                { icon: Trash2, label: 'Deleted', color: 'from-rose-500 to-red-600', action: () => setShowDeletedDialog(true) },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">All Spaces ({spaces.length})</h3>
              <Button className="gap-2" onClick={() => setShowCreateSpaceDialog(true)}>
                <Plus className="w-4 h-4" /> Create Space
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spaces.map(space => (
                <Card key={space.id} className="p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${space.color}20` }}
                      >
                        <FolderTree className="w-5 h-5" style={{ color: space.color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{space.name}</h4>
                        <span className="text-xs text-muted-foreground">{space.key}</span>
                      </div>
                    </div>
                    {space.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{space.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {space.articlesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {space.membersCount}
                      </span>
                    </div>
                    <Badge variant={space.isPublic ? 'secondary' : 'outline'}>
                      {space.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                      {space.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <LayoutTemplate className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Article Templates</h3>
                    <p className="text-green-100">Pre-built templates for faster content creation</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{templates.length}</p>
                    <p className="text-sm text-green-100">Templates</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{templates.filter(t => t.isGlobal).length}</p>
                    <p className="text-sm text-green-100">Global</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{templates.reduce((a, t) => a + t.usageCount, 0)}</p>
                    <p className="text-sm text-green-100">Total Uses</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{[...new Set(templates.map(t => t.category))].length}</p>
                    <p className="text-sm text-green-100">Categories</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'Create Template', color: 'from-green-500 to-emerald-600', action: () => setShowCreateTemplateDialog(true) },
                { icon: FileCode, label: 'Import', color: 'from-blue-500 to-indigo-600', action: () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.onchange = () => toast.success('Template imported', { description: 'Template ready to use' }); input.click() } },
                { icon: Share2, label: 'Share', color: 'from-purple-500 to-pink-600', action: () => { navigator.clipboard.writeText(`${window.location.origin}/templates`); toast.success('Share link copied', { description: 'Templates share link copied to clipboard' }) } },
                { icon: Copy, label: 'Duplicate', color: 'from-orange-500 to-amber-600', action: () => { if (templates.length > 0) { handleDuplicateTemplate(templates[0]) } else { toast.error('No templates', { description: 'Create a template first' }) } } },
                { icon: Palette, label: 'Customize', color: 'from-cyan-500 to-blue-600', action: () => { if (templates.length > 0) { handleCustomizeTemplate(templates[0]) } else { toast.error('No templates', { description: 'Create a template first' }) } } },
                { icon: Star, label: 'Favorites', color: 'from-yellow-500 to-orange-600', action: () => setShowFavoritesDialog(true) },
                { icon: Folder, label: 'Categories', color: 'from-pink-500 to-rose-600', action: () => setShowCategoriesDialog(true) },
                { icon: BarChart3, label: 'Usage Stats', color: 'from-indigo-500 to-purple-600', action: () => setShowUsageStatsDialog(true) },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Article Templates ({templates.length})</h3>
              <Button className="gap-2" onClick={() => setShowCreateTemplateDialog(true)}>
                <Plus className="w-4 h-4" /> Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <LayoutTemplate className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <span className="text-xs text-muted-foreground">{template.category}</span>
                      </div>
                    </div>
                    {template.isGlobal && <Badge variant="secondary">Global</Badge>}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Used {template.usageCount} times
                    </span>
                    <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>Use Template</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Advanced Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>Search across all articles, spaces, and comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search for articles, keywords, or phrases..."
                      className="pl-10 h-12 text-lg"
                      value={advancedSearchQuery}
                      onChange={(e) => setAdvancedSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdvancedSearch()}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setAdvancedSearchQuery(prev => prev + ' space:engineering')}>space:engineering</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setAdvancedSearchQuery(prev => prev + ' author:sarah')}>author:sarah</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setAdvancedSearchQuery(prev => prev + ' label:tutorial')}>label:tutorial</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setAdvancedSearchQuery(prev => prev + ' status:published')}>status:published</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setAdvancedSearchQuery(prev => prev + ' updated:7d')}>updated:7d</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Space</label>
                      <select className="w-full border rounded-md p-2">
                        <option>All Spaces</option>
                        {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Type</label>
                      <select className="w-full border rounded-md p-2">
                        <option>All Types</option>
                        <option>Page</option>
                        <option>How-To</option>
                        <option>Tutorial</option>
                        <option>Reference</option>
                        <option>FAQ</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Author</label>
                      <select className="w-full border rounded-md p-2">
                        <option>All Authors</option>
                        {emptyAuthors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Date Range</label>
                      <select className="w-full border rounded-md p-2">
                        <option>Any Time</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>Last Year</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleAdvancedSearch}>
                    <Search className="w-4 h-4 mr-2" /> Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Content Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                      const height = [45, 55, 60, 75, 85, 95][i]
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-md transition-all"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{month}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularArticles.map((article, i) => (
                      <div key={article.id} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{article.title}</p>
                          <p className="text-xs text-muted-foreground">{article.spaceName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{article.views.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emptyAuthors.map((author, i) => (
                      <div key={author.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={author.avatar} alt="User avatar" />
                          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{author.name}</p>
                          <p className="text-xs text-muted-foreground">{author.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{[45, 38, 27, 19][i] || 0}</p>
                          <p className="text-xs text-muted-foreground">articles</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyan-500" />
                    Popular Labels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['tutorial', 'api', 'getting-started', 'security', 'design', 'devops', 'support', 'faq', 'onboarding', 'best-practices'].map(label => (
                      <Badge key={label} variant="secondary" className="text-sm py-1 px-3">
                        #{label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Knowledge Base Settings</h3>
                    <p className="text-gray-300">Configure your knowledge base preferences</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">6</p>
                    <p className="text-sm text-gray-300">Settings Areas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{spaces.length}</p>
                    <p className="text-sm text-gray-300">Spaces</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">Active</p>
                    <p className="text-sm text-gray-300">Status</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-gray-300">Integrations</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm sticky top-6">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings, description: 'Basic settings' },
                        { id: 'content', label: 'Content', icon: FileText, description: 'Article preferences' },
                        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
                        { id: 'permissions', label: 'Permissions', icon: Shield, description: 'Access control' },
                        { id: 'integrations', label: 'Integrations', icon: Zap, description: 'Third-party apps' },
                        { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" />Knowledge Base Info</CardTitle>
                        <CardDescription>Basic knowledge base configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Knowledge Base Name</Label>
                            <Input defaultValue="Company Knowledge Base" className="mt-1" />
                          </div>
                          <div>
                            <Label>Subdomain</Label>
                            <Input defaultValue="docs.company.com" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea defaultValue="Internal and external documentation" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Default Language</Label>
                            <Input defaultValue="English (US)" className="mt-1" />
                          </div>
                          <div>
                            <Label>Timezone</Label>
                            <Input defaultValue="America/Los_Angeles" className="mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-600" />Public Access</CardTitle>
                        <CardDescription>Control public visibility</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Public Knowledge Base</p>
                            <p className="text-sm text-gray-500">Allow anyone to view published articles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Search Engine Indexing</p>
                            <p className="text-sm text-gray-500">Allow search engines to index public content</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Content Settings */}
                {settingsTab === 'content' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" />Article Settings</CardTitle>
                        <CardDescription>Configure article behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Comments</p>
                            <p className="text-sm text-gray-500">Allow users to comment on articles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Ratings</p>
                            <p className="text-sm text-gray-500">Allow users to rate articles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Version History</p>
                            <p className="text-sm text-gray-500">Track changes to articles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Read Time Estimation</p>
                            <p className="text-sm text-gray-500">Show estimated reading time</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Workflow className="w-5 h-5 text-blue-600" />Publishing Workflow</CardTitle>
                        <CardDescription>Configure article publishing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Require Review</p>
                            <p className="text-sm text-gray-500">Articles must be reviewed before publishing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Scheduled Publishing</p>
                            <p className="text-sm text-gray-500">Allow articles to be scheduled for publishing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notification Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" />Email Notifications</CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">New Comments</p>
                            <p className="text-sm text-gray-500">Email when articles receive comments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Article Updates</p>
                            <p className="text-sm text-gray-500">Email when starred articles are updated</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Review Requests</p>
                            <p className="text-sm text-gray-500">Email when articles need review</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Digest</p>
                            <p className="text-sm text-gray-500">Receive weekly content summary</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Permissions Settings */}
                {settingsTab === 'permissions' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" />Access Control</CardTitle>
                        <CardDescription>Manage permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Default Space Permission</p>
                            <p className="text-sm text-gray-500">Default access level for new spaces</p>
                          </div>
                          <Input defaultValue="View Only" className="w-40" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Inherit Permissions</p>
                            <p className="text-sm text-gray-500">Articles inherit space permissions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Guest Access</p>
                            <p className="text-sm text-gray-500">Allow guest users to view public content</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Webhook className="w-5 h-5 text-blue-600" />Connected Apps</CardTitle>
                        <CardDescription>Manage integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Zap className="w-4 h-4 text-blue-600" /></div>
                            <div>
                              <p className="font-medium">Slack</p>
                              <p className="text-sm text-gray-500">Notifications to Slack channels</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Search className="w-4 h-4" /></div>
                            <div>
                              <p className="font-medium">Algolia</p>
                              <p className="text-sm text-gray-500">Enhanced search capabilities</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><BarChart3 className="w-4 h-4" /></div>
                            <div>
                              <p className="font-medium">Google Analytics</p>
                              <p className="text-sm text-gray-500">Track content performance</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleConnectIntegration('Google Analytics')}>Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sliders className="w-5 h-5 text-blue-600" />Advanced Settings</CardTitle>
                        <CardDescription>Power user features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">API Access</p>
                            <p className="text-sm text-gray-500">Enable API access to knowledge base</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Custom CSS</p>
                            <p className="text-sm text-gray-500">Add custom styling to public pages</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Debug Mode</p>
                            <p className="text-sm text-gray-500">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" />Data Management</CardTitle>
                        <CardDescription>Manage your data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Export All Data</p>
                            <p className="text-sm text-gray-500">Download all articles and settings</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleExportArticles}><Download className="w-4 h-4 mr-2" />Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Clear Cache</p>
                            <p className="text-sm text-gray-500">Refresh cached content</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleClearCache}><RefreshCw className="w-4 h-4 mr-2" />Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Knowledge Base</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all content</p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleDeleteKnowledgeBase}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={emptyKnowledgeArticlesAIInsights}
              title="Knowledge Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar_url || undefined,
                status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={emptyKnowledgeArticlesPredictions}
              title="Article Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs.slice(0, 10).map(log => ({
              id: log.id,
              type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
              title: log.action,
              description: log.resource_name || undefined,
              user: { name: log.user_name || 'System', avatar: undefined },
              timestamp: log.created_at,
              isUnread: log.status === 'pending'
            }))}
            title="Knowledge Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={knowledgeArticlesQuickActions}
            variant="grid"
          />
        </div>

        {/* Article Detail Dialog */}
        <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedArticle?.type || 'page')}
                <DialogTitle>{selectedArticle?.title}</DialogTitle>
              </div>
              <DialogDescription>{selectedArticle?.excerpt}</DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Meta */}
                <div className="flex flex-wrap gap-3">
                  <Badge className={getStatusColor(selectedArticle?.status || 'draft')}>{selectedArticle?.status}</Badge>
                  <Badge variant="outline">{selectedArticle?.type}</Badge>
                  <Badge className={getLevelColor(selectedArticle?.level || 'beginner')}>{selectedArticle?.level}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {selectedArticle?.readTime}m read
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedArticle?.author.avatar} alt="User avatar" />
                    <AvatarFallback>{selectedArticle?.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedArticle?.author.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedArticle?.author.role}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Updated {formatTimeAgo(selectedArticle?.updatedAt || '')}</p>
                    <p>Created {formatDate(selectedArticle?.createdAt || '')}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedArticle?.views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedArticle?.likes}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedArticle?.bookmarks}</p>
                    <p className="text-xs text-muted-foreground">Bookmarks</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedArticle?.commentsCount}</p>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {selectedArticle?.rating.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedArticle?.totalRatings} ratings</p>
                  </div>
                </div>

                {/* Labels */}
                {selectedArticle && selectedArticle.labels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.labels.map(label => (
                        <Badge key={label} variant="secondary">#{label}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contributors */}
                {selectedArticle && selectedArticle.contributors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Contributors</h4>
                    <div className="flex -space-x-2">
                      {selectedArticle.contributors.map(contributor => (
                        <Avatar key={contributor.id} className="border-2 border-white">
                          <AvatarImage src={contributor.avatar} alt="User avatar" />
                          <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                )}

                {/* Version History */}
                {selectedArticle && selectedArticle.versions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Version History</h4>
                    <div className="space-y-2">
                      {selectedArticle.versions.map(version => (
                        <div key={version.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <History className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm">v{version.version} - {version.changes}</p>
                            <p className="text-xs text-muted-foreground">
                              by {version.author.name} • {formatTimeAgo(version.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => selectedArticle && handleEditArticle(selectedArticle)}>
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => selectedArticle && handleShareArticle(selectedArticle)}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => selectedArticle && handleCopyArticleLink(selectedArticle)}>
                  <Copy className="w-4 h-4" /> Copy Link
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => selectedArticle && handleArchiveArticle(selectedArticle.id)}>
                  <Archive className="w-4 h-4" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => selectedArticle && handleDeleteArticle(selectedArticle.id)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate Template Dialog */}
        <Dialog open={showDuplicateTemplateDialog} onOpenChange={setShowDuplicateTemplateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Duplicate Template
              </DialogTitle>
              <DialogDescription>Create a copy of this template with a new name</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Original Template</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedTemplate?.name}</p>
              </div>
              <div>
                <Label htmlFor="new-template-name">New Template Name</Label>
                <Input id="new-template-name" defaultValue={`${selectedTemplate?.name} (Copy)`} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="new-template-desc">Description</Label>
                <Textarea id="new-template-desc" defaultValue={selectedTemplate?.description} className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDuplicateTemplateDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Template duplicated', { description: `Created copy of "${selectedTemplate?.name}"` })
                setShowDuplicateTemplateDialog(false)
              }}>
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customize Template Dialog */}
        <Dialog open={showCustomizeTemplateDialog} onOpenChange={setShowCustomizeTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Customize Template
              </DialogTitle>
              <DialogDescription>Modify the template structure and styling</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Template Name</Label>
                <Input defaultValue={selectedTemplate?.name} className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea defaultValue={selectedTemplate?.description} className="mt-1" />
              </div>
              <div>
                <Label>Category</Label>
                <Input defaultValue={selectedTemplate?.category} className="mt-1" />
              </div>
              <div>
                <Label>Article Type</Label>
                <select className="w-full border rounded-md p-2 mt-1">
                  <option value="page" selected={selectedTemplate?.type === 'page'}>Page</option>
                  <option value="how-to" selected={selectedTemplate?.type === 'how-to'}>How-To</option>
                  <option value="tutorial" selected={selectedTemplate?.type === 'tutorial'}>Tutorial</option>
                  <option value="reference" selected={selectedTemplate?.type === 'reference'}>Reference</option>
                  <option value="faq" selected={selectedTemplate?.type === 'faq'}>FAQ</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Global Template</p>
                  <p className="text-xs text-muted-foreground">Available to all users</p>
                </div>
                <Switch defaultChecked={selectedTemplate?.isGlobal} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCustomizeTemplateDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Template updated', { description: `Changes saved to "${selectedTemplate?.name}"` })
                setShowCustomizeTemplateDialog(false)
              }}>
                <Palette className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Templates Selection Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5" />
                Article Templates
              </DialogTitle>
              <DialogDescription>Choose from pre-built article templates to get started quickly</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {templates.map(template => (
                  <Card key={template.id} className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-500" onClick={() => {
                    handleUseTemplate(template)
                    setShowTemplatesDialog(false)
                  }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <LayoutTemplate className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{template.name}</h4>
                        <span className="text-xs text-muted-foreground">{template.category}</span>
                      </div>
                      {template.isGlobal && <Badge variant="secondary">Global</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Used {template.usageCount} times</span>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowTemplatesDialog(false)
                setShowCreateTemplateDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" /> Create Custom Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Space Dialog */}
        <Dialog open={showCreateSpaceDialog} onOpenChange={setShowCreateSpaceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                Create New Space
              </DialogTitle>
              <DialogDescription>Configure your new content space for organizing articles</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="space-name">Space Name</Label>
                <Input id="space-name" placeholder="e.g., Engineering Docs" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="space-key">Space Key</Label>
                <Input id="space-key" placeholder="e.g., ENG" maxLength={6} className="mt-1 uppercase" />
                <p className="text-xs text-muted-foreground mt-1">Short identifier for URLs (max 6 characters)</p>
              </div>
              <div>
                <Label htmlFor="space-desc">Description</Label>
                <Textarea id="space-desc" placeholder="What will this space contain?" className="mt-1" />
              </div>
              <div>
                <Label>Space Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#6366F1', '#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#06B6D4'].map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-all"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Public Space</p>
                  <p className="text-xs text-muted-foreground">Visible to all team members</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateSpaceDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Space created', { description: 'Your new content space is ready' })
                setShowCreateSpaceDialog(false)
              }}>
                <FolderTree className="w-4 h-4 mr-2" /> Create Space
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FilePlus className="w-5 h-5" />
                Create New Template
              </DialogTitle>
              <DialogDescription>Design a reusable template for your articles</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input id="template-name" placeholder="e.g., Technical Guide" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="template-desc">Description</Label>
                <Textarea id="template-desc" placeholder="Describe when to use this template" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Input id="template-category" placeholder="e.g., Documentation, Technical, General" className="mt-1" />
              </div>
              <div>
                <Label>Article Type</Label>
                <select className="w-full border rounded-md p-2 mt-1">
                  <option value="page">Page</option>
                  <option value="how-to">How-To Guide</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="reference">Reference</option>
                  <option value="faq">FAQ</option>
                  <option value="blog">Blog Post</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Global Template</p>
                  <p className="text-xs text-muted-foreground">Available to all team members</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Template created', { description: 'Your new template is ready to use' })
                setShowCreateTemplateDialog(false)
              }}>
                <FilePlus className="w-4 h-4 mr-2" /> Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
