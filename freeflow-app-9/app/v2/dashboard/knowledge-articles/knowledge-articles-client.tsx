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

// Mock data for AI-powered competitive upgrade components
const mockKnowledgeArticlesAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Engagement', description: 'Getting Started guide has 95% completion rate!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Engagement' },
  { id: '2', type: 'warning' as const, title: 'Content Gap', description: 'No articles covering "API rate limits" - top search term.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Content' },
  { id: '3', type: 'info' as const, title: 'SEO Performance', description: 'Documentation driving 40% of organic traffic.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'SEO' },
]

const mockKnowledgeArticlesCollaborators = [
  { id: '1', name: 'Documentation Lead', avatar: '/avatars/docs-lead.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Technical Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Writer' },
  { id: '3', name: 'Product Expert', avatar: '/avatars/expert.jpg', status: 'away' as const, role: 'SME' },
]

const mockKnowledgeArticlesPredictions = [
  { id: '1', title: 'Search Trend', prediction: 'Integration docs will see 50% more traffic after API launch', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Update Needed', prediction: '8 articles will need updates after next release', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
]

const mockKnowledgeArticlesActivities = [
  { id: '1', user: 'Technical Writer', action: 'Published', target: 'OAuth 2.0 integration guide', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Documentation Lead', action: 'Reviewed', target: 'API reference documentation', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Product Expert', action: 'Updated', target: 'troubleshooting guide', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are defined inside the component to access state setters

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
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for QuickActions
  const [showNewArticleDialog, setShowNewArticleDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)

  // Additional dialog states
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [showVersionsDialog, setShowVersionsDialog] = useState(false)
  const [showContributorsDialog, setShowContributorsDialog] = useState(false)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showFavoritesDialog, setShowFavoritesDialog] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showArchivedDialog, setShowArchivedDialog] = useState(false)
  const [showDeletedDialog, setShowDeletedDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [showUsageStatsDialog, setShowUsageStatsDialog] = useState(false)
  const [showConnectIntegrationDialog, setShowConnectIntegrationDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showDeleteKnowledgeBaseDialog, setShowDeleteKnowledgeBaseDialog] = useState(false)
  const [showEditArticleDialog, setShowEditArticleDialog] = useState(false)
  const [showShareArticleDialog, setShowShareArticleDialog] = useState(false)
  const [showArchiveArticleDialog, setShowArchiveArticleDialog] = useState(false)
  const [showDeleteArticleDialog, setShowDeleteArticleDialog] = useState(false)
  const [showSortDialog, setShowSortDialog] = useState(false)
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)

  // Form states for new space
  const [newSpaceName, setNewSpaceName] = useState('')
  const [newSpaceKey, setNewSpaceKey] = useState('')
  const [newSpaceDescription, setNewSpaceDescription] = useState('')
  const [newSpaceIsPublic, setNewSpaceIsPublic] = useState(false)

  // Form states for new template
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [newTemplateType, setNewTemplateType] = useState<ArticleType>('page')
  const [newTemplateCategory, setNewTemplateCategory] = useState('')

  // Edit article form state
  const [editArticleTitle, setEditArticleTitle] = useState('')
  const [editArticleExcerpt, setEditArticleExcerpt] = useState('')
  const [editArticleContent, setEditArticleContent] = useState('')

  // New Article form state
  const [newArticleTitle, setNewArticleTitle] = useState('')
  const [newArticleExcerpt, setNewArticleExcerpt] = useState('')
  const [newArticleContent, setNewArticleContent] = useState('')
  const [newArticleType, setNewArticleType] = useState<ArticleType>('page')
  const [newArticleLevel, setNewArticleLevel] = useState<ArticleLevel>('beginner')
  const [newArticleSpaceId, setNewArticleSpaceId] = useState('')
  const [newArticleLabels, setNewArticleLabels] = useState('')

  // Selected template for preview
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // Quick actions with real dialog functionality
  const knowledgeArticlesQuickActions = [
    { id: '1', label: 'New Article', icon: 'plus', action: () => setShowNewArticleDialog(true), variant: 'default' as const },
    { id: '2', label: 'Templates', icon: 'layout', action: () => setShowTemplatesDialog(true), variant: 'default' as const },
    { id: '3', label: 'Analytics', icon: 'bar-chart', action: () => setShowAnalyticsDialog(true), variant: 'outline' as const },
  ]

  // Handler for creating a new article
  const handleCreateNewArticle = () => {
    if (!newArticleTitle.trim()) {
      toast.error('Title required', { description: 'Please enter an article title' })
      return
    }
    if (!newArticleSpaceId) {
      toast.error('Space required', { description: 'Please select a space for the article' })
      return
    }

    const newArticle: Article = {
      id: `art${Date.now()}`,
      title: newArticleTitle.trim(),
      slug: newArticleTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      excerpt: newArticleExcerpt.trim() || 'No description provided',
      content: newArticleContent.trim() || '',
      status: 'draft',
      type: newArticleType,
      level: newArticleLevel,
      spaceId: newArticleSpaceId,
      spaceName: spaces.find(s => s.id === newArticleSpaceId)?.name || 'Unknown',
      author: mockAuthors[0],
      contributors: [mockAuthors[0]],
      labels: newArticleLabels.split(',').map(l => l.trim()).filter(Boolean),
      readTime: Math.max(1, Math.ceil((newArticleContent.length || 100) / 1000)),
      views: 0,
      likes: 0,
      bookmarks: 0,
      shares: 0,
      rating: 0,
      totalRatings: 0,
      commentsCount: 0,
      versions: [],
      comments: [],
      relatedArticles: [],
      permissions: [],
      isStarred: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setArticles(prev => [newArticle, ...prev])
    setShowNewArticleDialog(false)
    setNewArticleTitle('')
    setNewArticleExcerpt('')
    setNewArticleContent('')
    setNewArticleType('page')
    setNewArticleLevel('beginner')
    setNewArticleSpaceId('')
    setNewArticleLabels('')
    toast.success('Article created', { description: `"${newArticle.title}" has been created as a draft` })
  }

  // Handler for using a template
  const handleUseTemplate = (template: Template) => {
    setNewArticleType(template.type)
    setShowTemplatesDialog(false)
    setShowNewArticleDialog(true)
    toast.success('Template applied', { description: `Using "${template.name}" template` })
  }

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

  // Handlers
  const handleCreateArticle = () => {
    toast.info('Create Article', {
      description: 'Opening article editor...'
    })
  }

  const handlePublishArticle = (articleId: string) => {
    toast.success('Article published', {
      description: 'Article is now live'
    })
  }

  const handleExportArticles = () => {
    toast.success('Exporting articles', {
      description: 'Articles will be downloaded'
    })
  }

  // Handler for creating a new space
  const handleCreateSpace = () => {
    if (!newSpaceName.trim()) {
      toast.error('Name required', { description: 'Please enter a space name' })
      return
    }
    if (!newSpaceKey.trim()) {
      toast.error('Key required', { description: 'Please enter a space key' })
      return
    }
    toast.success('Space created', { description: `"${newSpaceName}" has been created successfully` })
    setShowCreateSpaceDialog(false)
    setNewSpaceName('')
    setNewSpaceKey('')
    setNewSpaceDescription('')
    setNewSpaceIsPublic(false)
  }

  // Handler for creating a new template
  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Name required', { description: 'Please enter a template name' })
      return
    }
    toast.success('Template created', { description: `"${newTemplateName}" template has been created` })
    setShowCreateTemplateDialog(false)
    setNewTemplateName('')
    setNewTemplateDescription('')
    setNewTemplateType('page')
    setNewTemplateCategory('')
  }

  // Handler for editing article
  const handleEditArticle = () => {
    if (!editArticleTitle.trim()) {
      toast.error('Title required', { description: 'Please enter an article title' })
      return
    }
    if (selectedArticle) {
      setArticles(prev => prev.map(a =>
        a.id === selectedArticle.id
          ? { ...a, title: editArticleTitle, excerpt: editArticleExcerpt, content: editArticleContent, updatedAt: new Date().toISOString() }
          : a
      ))
      toast.success('Article updated', { description: `"${editArticleTitle}" has been updated` })
    }
    setShowEditArticleDialog(false)
  }

  // Handler for archiving article
  const handleArchiveArticle = () => {
    if (selectedArticle) {
      setArticles(prev => prev.map(a =>
        a.id === selectedArticle.id ? { ...a, status: 'archived' as ArticleStatus, updatedAt: new Date().toISOString() } : a
      ))
      toast.success('Article archived', { description: `"${selectedArticle.title}" has been archived` })
    }
    setShowArchiveArticleDialog(false)
    setShowArticleDialog(false)
  }

  // Handler for deleting article
  const handleDeleteArticle = () => {
    if (selectedArticle) {
      setArticles(prev => prev.filter(a => a.id !== selectedArticle.id))
      toast.success('Article deleted', { description: `"${selectedArticle.title}" has been deleted` })
    }
    setShowDeleteArticleDialog(false)
    setShowArticleDialog(false)
    setSelectedArticle(null)
  }

  // Handler for copying article link
  const handleCopyArticleLink = () => {
    if (selectedArticle) {
      navigator.clipboard.writeText(`https://docs.company.com/${selectedArticle.slug}`)
      toast.success('Link copied', { description: 'Article link has been copied to clipboard' })
    }
  }

  // Handler for sharing article
  const handleShareArticle = () => {
    toast.success('Article shared', { description: 'Share link has been generated' })
    setShowShareArticleDialog(false)
  }

  // Handler for exporting data
  const handleExportData = () => {
    toast.success('Export started', { description: 'Your data export is being prepared' })
    setShowExportDataDialog(false)
  }

  // Handler for clearing cache
  const handleClearCache = () => {
    toast.success('Cache cleared', { description: 'All cached content has been refreshed' })
    setShowClearCacheDialog(false)
  }

  // Handler for deleting knowledge base
  const handleDeleteKnowledgeBase = () => {
    toast.error('Knowledge base deleted', { description: 'All content has been permanently deleted' })
    setShowDeleteKnowledgeBaseDialog(false)
  }

  // Handler for connecting integration
  const handleConnectIntegration = () => {
    toast.success('Integration connected', { description: 'Google Analytics has been connected' })
    setShowConnectIntegrationDialog(false)
  }

  // Handler for export report
  const handleExportReport = () => {
    toast.success('Report exported', { description: 'Analytics report has been downloaded' })
    setShowExportReportDialog(false)
  }

  // Open edit dialog with current article data
  const openEditArticleDialog = () => {
    if (selectedArticle) {
      setEditArticleTitle(selectedArticle.title)
      setEditArticleExcerpt(selectedArticle.excerpt)
      setEditArticleContent(selectedArticle.content)
      setShowEditArticleDialog(true)
    }
  }

  // Quick action handlers mapped to labels
  const quickActionHandlers: Record<string, () => void> = {
    'New Article': () => setShowNewArticleDialog(true),
    'Templates': () => setShowTemplatesDialog(true),
    'New Space': () => setShowCreateSpaceDialog(true),
    'Search': () => setShowSearchDialog(true),
    'Versions': () => setShowVersionsDialog(true),
    'Contributors': () => setShowContributorsDialog(true),
    'Analytics': () => setShowAnalyticsDialog(true),
    'Settings': () => setActiveTab('settings'),
    'Create Space': () => setShowCreateSpaceDialog(true),
    'Browse All': () => setSelectedSpace(null),
    'Favorites': () => setShowFavoritesDialog(true),
    'Members': () => setShowMembersDialog(true),
    'Permissions': () => setShowPermissionsDialog(true),
    'Archived': () => setShowArchivedDialog(true),
    'Deleted': () => setShowDeletedDialog(true),
    'Create Template': () => setShowCreateTemplateDialog(true),
    'Import': () => setShowImportDialog(true),
    'Share': () => setShowShareDialog(true),
    'Duplicate': () => setShowDuplicateDialog(true),
    'Customize': () => setShowCustomizeDialog(true),
    'Categories': () => setShowCategoriesDialog(true),
    'Usage Stats': () => setShowUsageStatsDialog(true),
  }

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
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2" onClick={() => setShowNewArticleDialog(true)}>
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
                { icon: FilePlus, label: 'New Article', color: 'from-blue-500 to-indigo-600' },
                { icon: LayoutTemplate, label: 'Templates', color: 'from-purple-500 to-pink-600' },
                { icon: FolderTree, label: 'New Space', color: 'from-green-500 to-emerald-600' },
                { icon: Search, label: 'Search', color: 'from-orange-500 to-amber-600' },
                { icon: GitBranch, label: 'Versions', color: 'from-cyan-500 to-blue-600' },
                { icon: Users, label: 'Contributors', color: 'from-pink-500 to-rose-600' },
                { icon: BarChart3, label: 'Analytics', color: 'from-indigo-500 to-purple-600' },
                { icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={quickActionHandlers[action.label]}
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowSortDialog(true)}>Sort by</Button>
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
                { icon: Plus, label: 'Create Space', color: 'from-purple-500 to-violet-600' },
                { icon: Folder, label: 'Browse All', color: 'from-blue-500 to-indigo-600' },
                { icon: Star, label: 'Favorites', color: 'from-yellow-500 to-orange-600' },
                { icon: Users, label: 'Members', color: 'from-green-500 to-emerald-600' },
                { icon: Lock, label: 'Permissions', color: 'from-red-500 to-pink-600' },
                { icon: Archive, label: 'Archived', color: 'from-gray-500 to-gray-600' },
                { icon: Settings, label: 'Settings', color: 'from-cyan-500 to-blue-600' },
                { icon: Trash2, label: 'Deleted', color: 'from-rose-500 to-red-600' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={quickActionHandlers[action.label]}
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
                { icon: Plus, label: 'Create Template', color: 'from-green-500 to-emerald-600' },
                { icon: FileCode, label: 'Import', color: 'from-blue-500 to-indigo-600' },
                { icon: Share2, label: 'Share', color: 'from-purple-500 to-pink-600' },
                { icon: Copy, label: 'Duplicate', color: 'from-orange-500 to-amber-600' },
                { icon: Palette, label: 'Customize', color: 'from-cyan-500 to-blue-600' },
                { icon: Star, label: 'Favorites', color: 'from-yellow-500 to-orange-600' },
                { icon: Folder, label: 'Categories', color: 'from-pink-500 to-rose-600' },
                { icon: BarChart3, label: 'Usage Stats', color: 'from-indigo-500 to-purple-600' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={quickActionHandlers[action.label]}
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery('space:engineering')}>space:engineering</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery('author:sarah')}>author:sarah</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery('label:tutorial')}>label:tutorial</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery('status:published')}>status:published</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery('updated:7d')}>updated:7d</Badge>
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

                  <Button className="w-full" onClick={() => { setActiveTab('articles'); toast.success('Search applied', { description: `Searching for "${searchQuery}"` }) }}>
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
                          <Button variant="outline" size="sm" onClick={() => setShowConnectIntegrationDialog(true)}>Connect</Button>
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
                          <Button variant="outline" size="sm" onClick={() => setShowExportDataDialog(true)}><Download className="w-4 h-4 mr-2" />Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Clear Cache</p>
                            <p className="text-sm text-gray-500">Refresh cached content</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowClearCacheDialog(true)}><RefreshCw className="w-4 h-4 mr-2" />Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Knowledge Base</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all content</p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDeleteKnowledgeBaseDialog(true)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
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
              insights={mockKnowledgeArticlesAIInsights}
              title="Knowledge Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockKnowledgeArticlesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockKnowledgeArticlesPredictions}
              title="Article Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockKnowledgeArticlesActivities}
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
                <Button variant="outline" size="sm" className="gap-1" onClick={openEditArticleDialog}>
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowShareArticleDialog(true)}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleCopyArticleLink}>
                  <Copy className="w-4 h-4" /> Copy Link
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowArchiveArticleDialog(true)}>
                  <Archive className="w-4 h-4" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => setShowDeleteArticleDialog(true)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Article Dialog */}
        <Dialog open={showNewArticleDialog} onOpenChange={setShowNewArticleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-blue-600" />
                Create New Article
              </DialogTitle>
              <DialogDescription>
                Create a new knowledge base article. Fill in the details below.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="article-title">Title *</Label>
                  <Input
                    id="article-title"
                    placeholder="Enter article title"
                    value={newArticleTitle}
                    onChange={(e) => setNewArticleTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="article-excerpt">Excerpt / Summary</Label>
                  <Textarea
                    id="article-excerpt"
                    placeholder="Brief description of the article"
                    value={newArticleExcerpt}
                    onChange={(e) => setNewArticleExcerpt(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="article-space">Space *</Label>
                    <select
                      id="article-space"
                      value={newArticleSpaceId}
                      onChange={(e) => setNewArticleSpaceId(e.target.value)}
                      className="w-full mt-1 border rounded-md p-2 bg-background"
                    >
                      <option value="">Select a space</option>
                      {spaces.map(space => (
                        <option key={space.id} value={space.id}>{space.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="article-type">Type</Label>
                    <select
                      id="article-type"
                      value={newArticleType}
                      onChange={(e) => setNewArticleType(e.target.value as ArticleType)}
                      className="w-full mt-1 border rounded-md p-2 bg-background"
                    >
                      <option value="page">Page</option>
                      <option value="blog">Blog</option>
                      <option value="how-to">How-To</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="reference">Reference</option>
                      <option value="faq">FAQ</option>
                      <option value="template">Template</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="article-level">Difficulty Level</Label>
                    <select
                      id="article-level"
                      value={newArticleLevel}
                      onChange={(e) => setNewArticleLevel(e.target.value as ArticleLevel)}
                      className="w-full mt-1 border rounded-md p-2 bg-background"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="article-labels">Labels (comma separated)</Label>
                    <Input
                      id="article-labels"
                      placeholder="tutorial, api, guide"
                      value={newArticleLabels}
                      onChange={(e) => setNewArticleLabels(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="article-content">Content</Label>
                  <Textarea
                    id="article-content"
                    placeholder="Write your article content here..."
                    value={newArticleContent}
                    onChange={(e) => setNewArticleContent(e.target.value)}
                    className="mt-1 min-h-[200px] font-mono"
                    rows={8}
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewArticleDialog(false)}>
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowTemplatesDialog(true)}>
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <Button onClick={handleCreateNewArticle} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  <FilePlus className="w-4 h-4 mr-2" />
                  Create Article
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Templates Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-purple-600" />
                Article Templates
              </DialogTitle>
              <DialogDescription>
                Choose a template to quickly create structured content
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplateId === template.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                          <LayoutTemplate className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <span className="text-xs text-muted-foreground">{template.category}</span>
                        </div>
                      </div>
                      {template.isGlobal && <Badge variant="secondary">Global</Badge>}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{template.type}</Badge>
                        <span>Used {template.usageCount} times</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const template = templates.find(t => t.id === selectedTemplateId)
                  if (template) {
                    handleUseTemplate(template)
                  } else {
                    toast.error('Select a template', { description: 'Please select a template to use' })
                  }
                }}
                disabled={!selectedTemplateId}
                className="bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Knowledge Base Analytics
              </DialogTitle>
              <DialogDescription>
                Performance metrics and insights for your knowledge base
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Total Articles</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalArticles}</p>
                    <p className="text-xs text-green-600">+24 this month</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Total Views</span>
                    </div>
                    <p className="text-2xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-green-600">+12.5% vs last month</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-muted-foreground">Contributors</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalContributors}</p>
                    <p className="text-xs text-green-600">+3 this month</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-muted-foreground">Growth Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.growthRate}%</p>
                    <p className="text-xs text-green-600">+5.2% vs last month</p>
                  </Card>
                </div>

                {/* Content Distribution */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-blue-600" />
                    Content by Space
                  </h4>
                  <div className="space-y-3">
                    {spaces.map(space => {
                      const percentage = Math.round((space.articlesCount / stats.totalArticles) * 100)
                      return (
                        <div key={space.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{space.name}</span>
                            <span className="text-xs text-muted-foreground">{space.articlesCount} articles ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%`, backgroundColor: space.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Top Performing Articles */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Top Performing Articles
                  </h4>
                  <div className="space-y-3">
                    {popularArticles.slice(0, 5).map((article, index) => (
                      <div key={article.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
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
                </Card>

                {/* Status Distribution */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-green-600" />
                    Content Status
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">{stats.publishedArticles}</p>
                      <p className="text-xs text-muted-foreground">Published</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-700">{stats.draftArticles}</p>
                      <p className="text-xs text-muted-foreground">Drafts</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-700">{articles.filter(a => a.status === 'review').length}</p>
                      <p className="text-xs text-muted-foreground">In Review</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-red-700">{articles.filter(a => a.status === 'archived').length}</p>
                      <p className="text-xs text-muted-foreground">Archived</p>
                    </div>
                  </div>
                </Card>

                {/* Reading Time Distribution */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-cyan-600" />
                    Reading Time Insights
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xl font-bold">{stats.avgReadTime}m</p>
                      <p className="text-xs text-muted-foreground">Avg Read Time</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xl font-bold">{Math.min(...articles.map(a => a.readTime))}m</p>
                      <p className="text-xs text-muted-foreground">Shortest</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xl font-bold">{Math.max(...articles.map(a => a.readTime))}m</p>
                      <p className="text-xs text-muted-foreground">Longest</p>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>
                Close
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowExportReportDialog(true)}>
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Space Dialog */}
        <Dialog open={showCreateSpaceDialog} onOpenChange={setShowCreateSpaceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-purple-600" />
                Create New Space
              </DialogTitle>
              <DialogDescription>
                Create a new space to organize your articles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="space-name">Space Name *</Label>
                <Input
                  id="space-name"
                  placeholder="Enter space name"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="space-key">Space Key *</Label>
                <Input
                  id="space-key"
                  placeholder="e.g., ENG, PROD"
                  value={newSpaceKey}
                  onChange={(e) => setNewSpaceKey(e.target.value.toUpperCase())}
                  className="mt-1"
                  maxLength={6}
                />
              </div>
              <div>
                <Label htmlFor="space-description">Description</Label>
                <Textarea
                  id="space-description"
                  placeholder="Brief description of this space"
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Public Space</p>
                  <p className="text-sm text-muted-foreground">Allow anyone to view articles in this space</p>
                </div>
                <Switch checked={newSpaceIsPublic} onCheckedChange={setNewSpaceIsPublic} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateSpaceDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateSpace} className="bg-gradient-to-r from-purple-500 to-indigo-600">
                <FolderTree className="w-4 h-4 mr-2" />
                Create Space
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-green-600" />
                Create New Template
              </DialogTitle>
              <DialogDescription>
                Create a reusable template for articles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-type">Type</Label>
                <select
                  id="template-type"
                  value={newTemplateType}
                  onChange={(e) => setNewTemplateType(e.target.value as ArticleType)}
                  className="w-full mt-1 border rounded-md p-2 bg-background"
                >
                  <option value="page">Page</option>
                  <option value="how-to">How-To</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="reference">Reference</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Input
                  id="template-category"
                  placeholder="e.g., Documentation, Technical"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  placeholder="Brief description of this template"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTemplate} className="bg-gradient-to-r from-green-500 to-emerald-600">
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Article Dialog */}
        <Dialog open={showEditArticleDialog} onOpenChange={setShowEditArticleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Edit Article
              </DialogTitle>
              <DialogDescription>
                Make changes to the article
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={editArticleTitle}
                    onChange={(e) => setEditArticleTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-excerpt">Excerpt / Summary</Label>
                  <Textarea
                    id="edit-excerpt"
                    value={editArticleExcerpt}
                    onChange={(e) => setEditArticleExcerpt(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editArticleContent}
                    onChange={(e) => setEditArticleContent(e.target.value)}
                    className="mt-1 min-h-[200px] font-mono"
                    rows={8}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditArticleDialog(false)}>Cancel</Button>
              <Button onClick={handleEditArticle} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <Edit3 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Article Dialog */}
        <Dialog open={showShareArticleDialog} onOpenChange={setShowShareArticleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Share Article
              </DialogTitle>
              <DialogDescription>
                Share "{selectedArticle?.title}" with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Share Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    readOnly
                    value={`https://docs.company.com/${selectedArticle?.slug || ''}`}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleCopyArticleLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Email Share</Label>
                <Input
                  placeholder="Enter email addresses"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Allow public access</p>
                  <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowShareArticleDialog(false)}>Cancel</Button>
              <Button onClick={handleShareArticle} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Article Dialog */}
        <Dialog open={showArchiveArticleDialog} onOpenChange={setShowArchiveArticleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-yellow-600" />
                Archive Article
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to archive "{selectedArticle?.title}"?
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Archived articles are hidden from search results but can be restored later.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowArchiveArticleDialog(false)}>Cancel</Button>
              <Button onClick={handleArchiveArticle} className="bg-yellow-600 hover:bg-yellow-700">
                <Archive className="w-4 h-4 mr-2" />
                Archive Article
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Article Dialog */}
        <Dialog open={showDeleteArticleDialog} onOpenChange={setShowDeleteArticleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Article
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedArticle?.title}"?
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                This action cannot be undone. The article and all its versions will be permanently deleted.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDeleteArticleDialog(false)}>Cancel</Button>
              <Button onClick={handleDeleteArticle} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Article
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Versions Dialog */}
        <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-600" />
                Version History
              </DialogTitle>
              <DialogDescription>
                View and manage article versions across all content
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {articles.flatMap(article =>
                  article.versions.map(version => (
                    <div key={`${article.id}-${version.id}`} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{article.title}</p>
                        <Badge variant="outline">v{version.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{version.changes}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>by {version.author.name}</span>
                        <span>{formatTimeAgo(version.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
                {articles.flatMap(a => a.versions).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No version history available</p>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowVersionsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contributors Dialog */}
        <Dialog open={showContributorsDialog} onOpenChange={setShowContributorsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" />
                Contributors
              </DialogTitle>
              <DialogDescription>
                All contributors to the knowledge base
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {mockAuthors.map((author, i) => (
                  <div key={author.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Avatar>
                      <AvatarImage src={author.avatar} />
                      <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{author.name}</p>
                      <p className="text-sm text-muted-foreground">{author.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{[45, 38, 27, 19][i]}</p>
                      <p className="text-xs text-muted-foreground">articles</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowContributorsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search Dialog */}
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-600" />
                Quick Search
              </DialogTitle>
              <DialogDescription>
                Search for articles, spaces, and templates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Type to search..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                  {filteredArticles.slice(0, 10).map(article => (
                    <div
                      key={article.id}
                      className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => { openArticleDetail(article); setShowSearchDialog(false) }}
                    >
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{article.excerpt}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => { setActiveTab('search'); setShowSearchDialog(false) }}>
                Advanced Search
              </Button>
              <Button variant="outline" onClick={() => setShowSearchDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Favorites Dialog */}
        <Dialog open={showFavoritesDialog} onOpenChange={setShowFavoritesDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Favorite Spaces
              </DialogTitle>
              <DialogDescription>
                Your favorite spaces for quick access
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {spaces.filter(s => s.isFavorite).map(space => (
                  <div key={space.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${space.color}20` }}>
                        <FolderTree className="w-5 h-5" style={{ color: space.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{space.name}</p>
                        <p className="text-sm text-muted-foreground">{space.description}</p>
                      </div>
                      <Badge variant="outline">{space.articlesCount} articles</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowFavoritesDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Members Dialog */}
        <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Space Members
              </DialogTitle>
              <DialogDescription>
                Manage members across all spaces
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {mockAuthors.map(author => (
                  <div key={author.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Avatar>
                      <AvatarImage src={author.avatar} />
                      <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{author.name}</p>
                      <p className="text-sm text-muted-foreground">{author.role}</p>
                    </div>
                    <Badge variant="outline">Member</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => {
                  toast.loading('Sending invitation...', { id: 'invite-member' })
                  setTimeout(() => {
                    toast.success('Invitation sent successfully!', { id: 'invite-member' })
                  }, 1000)
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
              <Button variant="outline" onClick={() => setShowMembersDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                Permissions
              </DialogTitle>
              <DialogDescription>
                Manage access permissions for spaces
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {spaces.slice(0, 4).map(space => (
                <div key={space.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${space.color}20` }}>
                      <FolderTree className="w-4 h-4" style={{ color: space.color }} />
                    </div>
                    <div>
                      <p className="font-medium">{space.name}</p>
                      <p className="text-xs text-muted-foreground">{space.membersCount} members</p>
                    </div>
                  </div>
                  <Badge variant={space.isPublic ? 'secondary' : 'outline'}>
                    {space.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archived Dialog */}
        <Dialog open={showArchivedDialog} onOpenChange={setShowArchivedDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-gray-500" />
                Archived Content
              </DialogTitle>
              <DialogDescription>
                View and restore archived articles and spaces
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {articles.filter(a => a.status === 'archived').map(article => (
                  <div key={article.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.spaceName}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setArticles(prev => prev.map(a => a.id === article.id ? { ...a, status: 'draft' as ArticleStatus } : a))
                          toast.success('Article restored', { description: `"${article.title}" has been restored` })
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
                {articles.filter(a => a.status === 'archived').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No archived content</p>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowArchivedDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deleted Dialog */}
        <Dialog open={showDeletedDialog} onOpenChange={setShowDeletedDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Deleted Content
              </DialogTitle>
              <DialogDescription>
                Permanently deleted content cannot be recovered
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 text-center text-muted-foreground">
              <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recently deleted content</p>
              <p className="text-sm mt-2">Deleted items are permanently removed after 30 days</p>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDeletedDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                Import Templates
              </DialogTitle>
              <DialogDescription>
                Import templates from a file or URL
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileCode className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Supports JSON, YAML, and Markdown files</p>
              </div>
              <div>
                <Label>Import from URL</Label>
                <Input placeholder="https://example.com/template.json" className="mt-1" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.loading('Importing template...', { id: 'import-template' })
                  setTimeout(() => {
                    toast.success('Template imported successfully!', { id: 'import-template' })
                    setShowImportDialog(false)
                  }, 1000)
                }}>
                <FileCode className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-600" />
                Share Templates
              </DialogTitle>
              <DialogDescription>
                Share your templates with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Share Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input readOnly value="https://docs.company.com/templates/shared" className="flex-1" />
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText('https://docs.company.com/templates/shared'); toast.success('Link copied'); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Make templates public</p>
                  <p className="text-xs text-muted-foreground">Anyone can use your shared templates</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-orange-600" />
                Duplicate Template
              </DialogTitle>
              <DialogDescription>
                Select a template to duplicate
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-2">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border"
                    onClick={() => {
                      toast.loading('Duplicating template...', { id: 'duplicate-template' })
                      setTimeout(() => {
                        toast.success('Template duplicated successfully!', { id: 'duplicate-template' })
                        setShowDuplicateDialog(false)
                      }, 1000)
                    }}
                  >
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customize Dialog */}
        <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-600" />
                Customize Templates
              </DialogTitle>
              <DialogDescription>
                Customize the appearance of your templates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        toast.success(`Color ${color} selected!`)
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Font Family</Label>
                <select className="w-full mt-1 border rounded-md p-2 bg-background">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                  <option>Lato</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Dark mode support</p>
                  <p className="text-xs text-muted-foreground">Enable dark mode for templates</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.loading('Saving customizations...', { id: 'save-customizations' })
                  setTimeout(() => {
                    toast.success('Customizations saved successfully!', { id: 'save-customizations' })
                    setShowCustomizeDialog(false)
                  }, 1000)
                }}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Categories Dialog */}
        <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-pink-600" />
                Template Categories
              </DialogTitle>
              <DialogDescription>
                Manage template categories
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-2">
                {[...new Set(templates.map(t => t.category))].map(category => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{category}</p>
                        <p className="text-xs text-muted-foreground">
                          {templates.filter(t => t.category === category).length} templates
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => {
                  toast.loading('Adding category...', { id: 'add-category' })
                  setTimeout(() => {
                    toast.success('Category added successfully!', { id: 'add-category' })
                  }, 1000)
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
              <Button variant="outline" onClick={() => setShowCategoriesDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Usage Stats Dialog */}
        <Dialog open={showUsageStatsDialog} onOpenChange={setShowUsageStatsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Template Usage Stats
              </DialogTitle>
              <DialogDescription>
                View usage statistics for your templates
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {templates.sort((a, b) => b.usageCount - a.usageCount).map((template, i) => (
                  <div key={template.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{template.name}</p>
                      <Badge variant="outline">{template.usageCount} uses</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${(template.usageCount / templates[0].usageCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowUsageStatsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connect Integration Dialog */}
        <Dialog open={showConnectIntegrationDialog} onOpenChange={setShowConnectIntegrationDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Connect Google Analytics
              </DialogTitle>
              <DialogDescription>
                Connect your Google Analytics account to track content performance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tracking ID</Label>
                <Input placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX" className="mt-1" />
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You can find your tracking ID in your Google Analytics dashboard under Admin &gt; Property Settings.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowConnectIntegrationDialog(false)}>Cancel</Button>
              <Button onClick={handleConnectIntegration}>
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Export All Data
              </DialogTitle>
              <DialogDescription>
                Download all your knowledge base content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Include articles</p>
                  <p className="text-xs text-muted-foreground">{stats.totalArticles} articles</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Include templates</p>
                  <p className="text-xs text-muted-foreground">{templates.length} templates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Include settings</p>
                  <p className="text-xs text-muted-foreground">All configurations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label>Export format</Label>
                <select className="w-full mt-1 border rounded-md p-2 bg-background">
                  <option>JSON</option>
                  <option>CSV</option>
                  <option>Markdown (ZIP)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Cache Dialog */}
        <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Clear Cache
              </DialogTitle>
              <DialogDescription>
                Refresh all cached content in your knowledge base
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This will clear all cached data and may temporarily slow down page loads while the cache rebuilds.
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
              <Button onClick={handleClearCache}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Knowledge Base Dialog */}
        <Dialog open={showDeleteKnowledgeBaseDialog} onOpenChange={setShowDeleteKnowledgeBaseDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Knowledge Base
              </DialogTitle>
              <DialogDescription>
                This action is permanent and cannot be undone
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                Warning: This will permanently delete all {stats.totalArticles} articles, {spaces.length} spaces, and {templates.length} templates. This action cannot be reversed.
              </p>
            </div>
            <div>
              <Label>Type "DELETE" to confirm</Label>
              <Input placeholder="DELETE" className="mt-1" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDeleteKnowledgeBaseDialog(false)}>Cancel</Button>
              <Button onClick={handleDeleteKnowledgeBase} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Everything
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sort Dialog */}
        <Dialog open={showSortDialog} onOpenChange={setShowSortDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Sort Articles</DialogTitle>
              <DialogDescription>
                Choose how to sort articles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {[
                { label: 'Recently Updated', value: 'updated' },
                { label: 'Recently Created', value: 'created' },
                { label: 'Most Views', value: 'views' },
                { label: 'Most Likes', value: 'likes' },
                { label: 'Alphabetical', value: 'alpha' },
              ].map(option => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    toast.success('Sort applied', { description: `Sorting by ${option.label}` })
                    setShowSortDialog(false)
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Report Dialog */}
        <Dialog open={showExportReportDialog} onOpenChange={setShowExportReportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Export Analytics Report
              </DialogTitle>
              <DialogDescription>
                Download a detailed analytics report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Report Period</Label>
                <select className="w-full mt-1 border rounded-md p-2 bg-background">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Last Year</option>
                  <option>All Time</option>
                </select>
              </div>
              <div>
                <Label>Report Format</Label>
                <select className="w-full mt-1 border rounded-md p-2 bg-background">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Include charts</p>
                  <p className="text-xs text-muted-foreground">Visual representations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportReportDialog(false)}>Cancel</Button>
              <Button onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
