'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
  Unlock,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Share2,
  Link,
  Copy,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Home,
  History,
  Tag,
  Hash,
  Filter,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  TrendingUp,
  Globe,
  FileCheck,
  FilePlus,
  FileEdit,
  Archive,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Calendar,
  Timer,
  Award,
  Lightbulb
} from 'lucide-react'

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

// Mock data
const mockAuthors: Author[] = [
  { id: 'a1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Technical Writer' },
  { id: 'a2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', role: 'Developer' },
  { id: 'a3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', role: 'Product Manager' },
  { id: 'a4', name: 'Alex Thompson', avatar: '/avatars/alex.jpg', role: 'Designer' }
]

const mockSpaces: Space[] = [
  { id: 's1', name: 'Engineering', key: 'ENG', description: 'Technical documentation and guides', icon: 'code', color: '#6366F1', articlesCount: 156, membersCount: 24, isPublic: false, isFavorite: true, createdAt: '2023-01-15', owner: mockAuthors[1] },
  { id: 's2', name: 'Product', key: 'PROD', description: 'Product specs and roadmaps', icon: 'package', color: '#F59E0B', articlesCount: 89, membersCount: 18, isPublic: false, isFavorite: true, createdAt: '2023-02-20', owner: mockAuthors[2] },
  { id: 's3', name: 'Design', key: 'DES', description: 'Design system and guidelines', icon: 'palette', color: '#EC4899', articlesCount: 67, membersCount: 12, isPublic: false, isFavorite: false, createdAt: '2023-03-10', owner: mockAuthors[3] },
  { id: 's4', name: 'Company Wiki', key: 'WIKI', description: 'Company policies and procedures', icon: 'building', color: '#10B981', articlesCount: 234, membersCount: 150, isPublic: true, isFavorite: true, createdAt: '2023-01-01', owner: mockAuthors[0] },
  { id: 's5', name: 'Help Center', key: 'HELP', description: 'Customer-facing documentation', icon: 'help-circle', color: '#3B82F6', articlesCount: 128, membersCount: 8, isPublic: true, isFavorite: false, createdAt: '2023-04-05', owner: mockAuthors[0] }
]

const mockArticles: Article[] = [
  {
    id: 'art1',
    title: 'Getting Started with Our Platform',
    slug: 'getting-started',
    excerpt: 'A comprehensive guide to help you get up and running quickly with our platform.',
    content: 'Full article content here...',
    status: 'published',
    type: 'tutorial',
    level: 'beginner',
    spaceId: 's4',
    spaceName: 'Company Wiki',
    author: mockAuthors[0],
    contributors: [mockAuthors[0], mockAuthors[1]],
    labels: ['onboarding', 'getting-started', 'tutorial'],
    readTime: 8,
    views: 12450,
    likes: 342,
    bookmarks: 156,
    shares: 89,
    rating: 4.8,
    totalRatings: 127,
    commentsCount: 23,
    versions: [
      { id: 'v1', version: 3, author: mockAuthors[0], changes: 'Updated screenshots', createdAt: '2024-01-15' },
      { id: 'v2', version: 2, author: mockAuthors[1], changes: 'Added new section', createdAt: '2024-01-10' }
    ],
    comments: [],
    relatedArticles: ['art2', 'art3'],
    permissions: [],
    isStarred: true,
    isPinned: true,
    createdAt: '2023-06-15',
    updatedAt: '2024-01-15',
    publishedAt: '2023-06-20'
  },
  {
    id: 'art2',
    title: 'API Authentication Best Practices',
    slug: 'api-auth-best-practices',
    excerpt: 'Learn how to properly implement authentication in your API integrations.',
    content: 'Full article content here...',
    status: 'published',
    type: 'how-to',
    level: 'advanced',
    spaceId: 's1',
    spaceName: 'Engineering',
    author: mockAuthors[1],
    contributors: [mockAuthors[1]],
    labels: ['api', 'security', 'authentication'],
    readTime: 12,
    views: 8920,
    likes: 256,
    bookmarks: 198,
    shares: 67,
    rating: 4.9,
    totalRatings: 89,
    commentsCount: 15,
    versions: [],
    comments: [],
    relatedArticles: ['art1'],
    permissions: [],
    isStarred: true,
    isPinned: false,
    createdAt: '2023-09-10',
    updatedAt: '2024-01-12',
    publishedAt: '2023-09-15'
  },
  {
    id: 'art3',
    title: 'Design System Components Guide',
    slug: 'design-system-components',
    excerpt: 'Complete reference for all design system components and usage guidelines.',
    content: 'Full article content here...',
    status: 'published',
    type: 'reference',
    level: 'intermediate',
    spaceId: 's3',
    spaceName: 'Design',
    author: mockAuthors[3],
    contributors: [mockAuthors[3], mockAuthors[0]],
    labels: ['design', 'components', 'ui'],
    readTime: 15,
    views: 6780,
    likes: 189,
    bookmarks: 234,
    shares: 45,
    rating: 4.7,
    totalRatings: 56,
    commentsCount: 8,
    versions: [],
    comments: [],
    relatedArticles: [],
    permissions: [],
    isStarred: false,
    isPinned: false,
    createdAt: '2023-11-20',
    updatedAt: '2024-01-08',
    publishedAt: '2023-11-25'
  },
  {
    id: 'art4',
    title: 'Q1 2024 Product Roadmap',
    slug: 'q1-2024-roadmap',
    excerpt: 'Detailed overview of planned features and improvements for Q1 2024.',
    content: 'Full article content here...',
    status: 'draft',
    type: 'page',
    level: 'intermediate',
    spaceId: 's2',
    spaceName: 'Product',
    author: mockAuthors[2],
    contributors: [mockAuthors[2], mockAuthors[1]],
    labels: ['roadmap', 'planning', 'q1-2024'],
    readTime: 10,
    views: 0,
    likes: 0,
    bookmarks: 0,
    shares: 0,
    rating: 0,
    totalRatings: 0,
    commentsCount: 5,
    versions: [],
    comments: [],
    relatedArticles: [],
    permissions: [],
    isStarred: false,
    isPinned: false,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-14'
  },
  {
    id: 'art5',
    title: 'Deployment Pipeline Documentation',
    slug: 'deployment-pipeline',
    excerpt: 'Step-by-step guide for setting up and managing deployment pipelines.',
    content: 'Full article content here...',
    status: 'review',
    type: 'how-to',
    level: 'advanced',
    spaceId: 's1',
    spaceName: 'Engineering',
    author: mockAuthors[1],
    contributors: [mockAuthors[1]],
    labels: ['devops', 'ci-cd', 'deployment'],
    readTime: 20,
    views: 0,
    likes: 0,
    bookmarks: 0,
    shares: 0,
    rating: 0,
    totalRatings: 0,
    commentsCount: 12,
    versions: [],
    comments: [],
    relatedArticles: ['art2'],
    permissions: [],
    isStarred: false,
    isPinned: false,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-13'
  },
  {
    id: 'art6',
    title: 'Customer FAQ: Billing & Subscriptions',
    slug: 'faq-billing',
    excerpt: 'Answers to common questions about billing, payments, and subscriptions.',
    content: 'Full article content here...',
    status: 'published',
    type: 'faq',
    level: 'beginner',
    spaceId: 's5',
    spaceName: 'Help Center',
    author: mockAuthors[0],
    contributors: [mockAuthors[0]],
    labels: ['faq', 'billing', 'support'],
    readTime: 5,
    views: 15670,
    likes: 423,
    bookmarks: 89,
    shares: 34,
    rating: 4.6,
    totalRatings: 234,
    commentsCount: 45,
    versions: [],
    comments: [],
    relatedArticles: [],
    permissions: [],
    isStarred: false,
    isPinned: true,
    createdAt: '2023-05-10',
    updatedAt: '2024-01-10',
    publishedAt: '2023-05-12'
  }
]

const mockTemplates: Template[] = [
  { id: 't1', name: 'How-To Guide', description: 'Step-by-step tutorial format', type: 'how-to', category: 'Documentation', usageCount: 156, preview: '', isGlobal: true, createdBy: mockAuthors[0] },
  { id: 't2', name: 'API Reference', description: 'API endpoint documentation', type: 'reference', category: 'Technical', usageCount: 89, preview: '', isGlobal: true, createdBy: mockAuthors[1] },
  { id: 't3', name: 'Meeting Notes', description: 'Meeting minutes template', type: 'page', category: 'General', usageCount: 234, preview: '', isGlobal: true, createdBy: mockAuthors[2] },
  { id: 't4', name: 'Product Spec', description: 'Product requirements document', type: 'page', category: 'Product', usageCount: 67, preview: '', isGlobal: true, createdBy: mockAuthors[2] },
  { id: 't5', name: 'FAQ Page', description: 'Frequently asked questions', type: 'faq', category: 'Support', usageCount: 45, preview: '', isGlobal: true, createdBy: mockAuthors[0] },
  { id: 't6', name: 'Tutorial', description: 'Interactive tutorial format', type: 'tutorial', category: 'Learning', usageCount: 78, preview: '', isGlobal: true, createdBy: mockAuthors[3] }
]

const mockStats: ContentStats = {
  totalArticles: 674,
  publishedArticles: 498,
  draftArticles: 89,
  totalViews: 156780,
  totalContributors: 45,
  avgReadTime: 8,
  topLabel: 'tutorial',
  growthRate: 23.5
}

interface KnowledgeArticlesClientProps {
  initialArticles?: Article[]
  initialStats?: ContentStats
}

export default function KnowledgeArticlesClient({ initialArticles, initialStats }: KnowledgeArticlesClientProps) {
  const [activeTab, setActiveTab] = useState('articles')
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [spaces] = useState<Space[]>(mockSpaces)
  const [templates] = useState<Template[]>(mockTemplates)
  const [stats] = useState<ContentStats>(mockStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ArticleType | 'all'>('all')
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set(['s1', 's4']))

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

    return result
  }, [articles, searchQuery, selectedSpace, statusFilter, typeFilter])

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
            <Button variant="outline" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2">
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Sort by</Button>
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
                              <AvatarImage src={article.author.avatar} />
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
          <TabsContent value="spaces" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">All Spaces ({spaces.length})</h3>
              <Button className="gap-2">
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
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Article Templates ({templates.length})</h3>
              <Button className="gap-2">
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
                    <Button size="sm" variant="outline">Use Template</Button>
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
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">space:engineering</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">author:sarah</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">label:tutorial</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">status:published</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">updated:7d</Badge>
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
                        {mockAuthors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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

                  <Button className="w-full">
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
                    {mockAuthors.map((author, i) => (
                      <div key={author.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={author.avatar} />
                          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{author.name}</p>
                          <p className="text-xs text-muted-foreground">{author.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{[45, 38, 27, 19][i]}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Settings</CardTitle>
                <CardDescription>Configure your knowledge base preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">General</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Public Access</p>
                          <p className="text-xs text-muted-foreground">Allow public access to published articles</p>
                        </div>
                        <Checkbox />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Comments</p>
                          <p className="text-xs text-muted-foreground">Enable comments on articles</p>
                        </div>
                        <Checkbox defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Ratings</p>
                          <p className="text-xs text-muted-foreground">Allow users to rate articles</p>
                        </div>
                        <Checkbox defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">New Comments</p>
                          <p className="text-xs text-muted-foreground">Get notified of new comments</p>
                        </div>
                        <Checkbox defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Article Updates</p>
                          <p className="text-xs text-muted-foreground">Notify when starred articles are updated</p>
                        </div>
                        <Checkbox defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Weekly Digest</p>
                          <p className="text-xs text-muted-foreground">Receive weekly content summary</p>
                        </div>
                        <Checkbox />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                    <AvatarImage src={selectedArticle?.author.avatar} />
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
                <div className="grid grid-cols-5 gap-4">
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
                          <AvatarImage src={contributor.avatar} />
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
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Copy className="w-4 h-4" /> Copy Link
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Archive className="w-4 h-4" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-500">
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
