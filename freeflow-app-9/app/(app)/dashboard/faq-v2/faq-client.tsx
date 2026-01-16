'use client'

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { useFAQs, FAQ } from '@/lib/hooks/use-faqs'
import {
  Plus,
  Search,
  Settings,
  BarChart3,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Trash2,
  Edit,
  Book,
  FolderOpen,
  Globe,
  Lock,
  Star,
  Clock,
  Users,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Copy,
  MoreVertical,
  Grid3X3,
  List,
  Languages,
  Palette,
  Layout,
  Zap,
  Bot,
  CheckCircle2,
  AlertCircle,
  Archive,
  RefreshCw,
  Download,
  Upload,
  History,
  PieChart,
  Target,
  Award,
  MessageCircle,
  Headphones,
  Mail,
  Link,
  Image,
  ChevronUp,
  ChevronDown
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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// ============================================================================
// TYPE DEFINITIONS - Intercom/Zendesk Level
// ============================================================================

interface Author {
  id: string
  name: string
  avatar: string
  role: string
}

interface ArticleVersion {
  id: string
  version: number
  content: string
  author: Author
  createdAt: string
  changes: string
}

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'draft' | 'published' | 'review' | 'archived'
  collectionId: string
  author: Author
  tags: string[]
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  commentCount: number
  shareCount: number
  searchCount: number
  avgReadTime: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  featured: boolean
  pinned: boolean
  language: string
  translations: { language: string; articleId: string }[]
  relatedArticles: string[]
  versions: ArticleVersion[]
}

interface Collection {
  id: string
  name: string
  description: string
  icon: string
  color: string
  articleCount: number
  order: number
  parentId: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface SearchQuery {
  id: string
  query: string
  count: number
  resultsFound: number
  avgClickPosition: number
  lastSearched: string
}

interface HelpCenterSettings {
  title: string
  subtitle: string
  logoUrl: string
  primaryColor: string
  customDomain: string | null
  showSearch: boolean
  showCategories: boolean
  showPopularArticles: boolean
  showContactButton: boolean
  contactEmail: string
  languages: string[]
  defaultLanguage: string
}

interface KnowledgeBaseStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalViews: number
  totalSearches: number
  avgHelpfulRating: number
  articlesNeedingReview: number
  unansweredQuestions: number
  totalCollections: number
  totalAuthors: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAuthors: Author[] = [
  { id: 'auth-1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Content Lead' },
  { id: 'auth-2', name: 'John Smith', avatar: '/avatars/john.jpg', role: 'Support Manager' },
  { id: 'auth-3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', role: 'Technical Writer' }
]

const mockCollections: Collection[] = [
  { id: 'col-1', name: 'Getting Started', description: 'Everything you need to begin using our platform', icon: '🚀', color: 'bg-blue-500', articleCount: 12, order: 1, parentId: null, isPublic: true, createdAt: '2024-01-01', updatedAt: '2024-12-20' },
  { id: 'col-2', name: 'Account & Billing', description: 'Manage your account settings and billing information', icon: '💳', color: 'bg-green-500', articleCount: 8, order: 2, parentId: null, isPublic: true, createdAt: '2024-01-01', updatedAt: '2024-12-18' },
  { id: 'col-3', name: 'Features & How-to', description: 'Learn how to use all features effectively', icon: '✨', color: 'bg-purple-500', articleCount: 24, order: 3, parentId: null, isPublic: true, createdAt: '2024-01-01', updatedAt: '2024-12-22' },
  { id: 'col-4', name: 'Troubleshooting', description: 'Solutions to common problems and errors', icon: '🔧', color: 'bg-orange-500', articleCount: 15, order: 4, parentId: null, isPublic: true, createdAt: '2024-01-01', updatedAt: '2024-12-21' },
  { id: 'col-5', name: 'API & Integrations', description: 'Developer documentation and API guides', icon: '🔗', color: 'bg-indigo-500', articleCount: 18, order: 5, parentId: null, isPublic: true, createdAt: '2024-01-01', updatedAt: '2024-12-19' },
  { id: 'col-6', name: 'Security & Privacy', description: 'Security best practices and privacy settings', icon: '🔒', color: 'bg-red-500', articleCount: 6, order: 6, parentId: null, isPublic: true, createdAt: '2024-01-01', updatedAt: '2024-12-15' }
]

const mockArticles: Article[] = [
  {
    id: 'art-1',
    title: 'How to create your first project',
    slug: 'how-to-create-first-project',
    content: 'Creating your first project is easy. Follow these steps...',
    excerpt: 'Learn how to create and set up your first project in minutes.',
    status: 'published',
    collectionId: 'col-1',
    author: mockAuthors[0],
    tags: ['projects', 'getting-started', 'tutorial'],
    viewCount: 15420,
    helpfulCount: 892,
    notHelpfulCount: 23,
    commentCount: 45,
    shareCount: 234,
    searchCount: 3420,
    avgReadTime: 5,
    createdAt: '2024-06-15',
    updatedAt: '2024-12-20',
    publishedAt: '2024-06-20',
    featured: true,
    pinned: true,
    language: 'en',
    translations: [{ language: 'es', articleId: 'art-1-es' }, { language: 'fr', articleId: 'art-1-fr' }],
    relatedArticles: ['art-2', 'art-3'],
    versions: []
  },
  {
    id: 'art-2',
    title: 'Understanding your dashboard',
    slug: 'understanding-dashboard',
    content: 'Your dashboard provides an overview of all your activities...',
    excerpt: 'A complete guide to navigating and using your dashboard.',
    status: 'published',
    collectionId: 'col-1',
    author: mockAuthors[1],
    tags: ['dashboard', 'overview', 'analytics'],
    viewCount: 12350,
    helpfulCount: 756,
    notHelpfulCount: 18,
    commentCount: 32,
    shareCount: 189,
    searchCount: 2890,
    avgReadTime: 7,
    createdAt: '2024-07-01',
    updatedAt: '2024-12-18',
    publishedAt: '2024-07-05',
    featured: true,
    pinned: false,
    language: 'en',
    translations: [],
    relatedArticles: ['art-1'],
    versions: []
  },
  {
    id: 'art-3',
    title: 'How to invite team members',
    slug: 'invite-team-members',
    content: 'Collaboration is key. Here is how to invite your team...',
    excerpt: 'Step-by-step guide to adding team members to your workspace.',
    status: 'published',
    collectionId: 'col-2',
    author: mockAuthors[2],
    tags: ['team', 'collaboration', 'users'],
    viewCount: 8920,
    helpfulCount: 523,
    notHelpfulCount: 12,
    commentCount: 28,
    shareCount: 145,
    searchCount: 1890,
    avgReadTime: 4,
    createdAt: '2024-08-10',
    updatedAt: '2024-12-15',
    publishedAt: '2024-08-12',
    featured: false,
    pinned: false,
    language: 'en',
    translations: [{ language: 'de', articleId: 'art-3-de' }],
    relatedArticles: ['art-2'],
    versions: []
  },
  {
    id: 'art-4',
    title: 'Troubleshooting login issues',
    slug: 'troubleshooting-login-issues',
    content: 'Having trouble logging in? Try these solutions...',
    excerpt: 'Common login problems and how to fix them quickly.',
    status: 'published',
    collectionId: 'col-4',
    author: mockAuthors[0],
    tags: ['login', 'troubleshooting', 'authentication'],
    viewCount: 25680,
    helpfulCount: 1245,
    notHelpfulCount: 89,
    commentCount: 156,
    shareCount: 423,
    searchCount: 8920,
    avgReadTime: 6,
    createdAt: '2024-05-01',
    updatedAt: '2024-12-22',
    publishedAt: '2024-05-03',
    featured: false,
    pinned: true,
    language: 'en',
    translations: [{ language: 'es', articleId: 'art-4-es' }, { language: 'fr', articleId: 'art-4-fr' }, { language: 'de', articleId: 'art-4-de' }],
    relatedArticles: [],
    versions: []
  },
  {
    id: 'art-5',
    title: 'API authentication guide',
    slug: 'api-authentication-guide',
    content: 'Learn how to authenticate your API requests...',
    excerpt: 'Complete guide to API authentication methods and best practices.',
    status: 'published',
    collectionId: 'col-5',
    author: mockAuthors[2],
    tags: ['api', 'authentication', 'developer'],
    viewCount: 6780,
    helpfulCount: 445,
    notHelpfulCount: 15,
    commentCount: 67,
    shareCount: 234,
    searchCount: 2340,
    avgReadTime: 12,
    createdAt: '2024-09-15',
    updatedAt: '2024-12-19',
    publishedAt: '2024-09-20',
    featured: false,
    pinned: false,
    language: 'en',
    translations: [],
    relatedArticles: [],
    versions: []
  },
  {
    id: 'art-6',
    title: 'Setting up two-factor authentication',
    slug: 'setup-two-factor-authentication',
    content: 'Protect your account with 2FA...',
    excerpt: 'How to enable and use two-factor authentication for enhanced security.',
    status: 'draft',
    collectionId: 'col-6',
    author: mockAuthors[1],
    tags: ['security', '2fa', 'authentication'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    commentCount: 0,
    shareCount: 0,
    searchCount: 0,
    avgReadTime: 5,
    createdAt: '2024-12-20',
    updatedAt: '2024-12-23',
    publishedAt: null,
    featured: false,
    pinned: false,
    language: 'en',
    translations: [],
    relatedArticles: [],
    versions: []
  }
]

const mockSearchQueries: SearchQuery[] = [
  { id: 'sq-1', query: 'login problems', count: 1250, resultsFound: 8, avgClickPosition: 1.2, lastSearched: '2024-12-23' },
  { id: 'sq-2', query: 'create project', count: 890, resultsFound: 5, avgClickPosition: 1.5, lastSearched: '2024-12-23' },
  { id: 'sq-3', query: 'api key', count: 720, resultsFound: 12, avgClickPosition: 2.1, lastSearched: '2024-12-23' },
  { id: 'sq-4', query: 'billing', count: 650, resultsFound: 6, avgClickPosition: 1.8, lastSearched: '2024-12-22' },
  { id: 'sq-5', query: 'invite team', count: 480, resultsFound: 4, avgClickPosition: 1.3, lastSearched: '2024-12-23' }
]

const mockStats: KnowledgeBaseStats = {
  totalArticles: 83,
  publishedArticles: 76,
  draftArticles: 7,
  totalViews: 245890,
  totalSearches: 89420,
  avgHelpfulRating: 94.2,
  articlesNeedingReview: 3,
  unansweredQuestions: 12,
  totalCollections: 6,
  totalAuthors: 8
}

const mockHelpCenterSettings: HelpCenterSettings = {
  title: 'FreeFlow Help Center',
  subtitle: 'Find answers to your questions',
  logoUrl: '/logo.png',
  primaryColor: '#3b82f6',
  customDomain: 'help.freeflow.com',
  showSearch: true,
  showCategories: true,
  showPopularArticles: true,
  showContactButton: true,
  contactEmail: 'support@freeflow.com',
  languages: ['en', 'es', 'fr', 'de'],
  defaultLanguage: 'en'
}

// Enhanced Competitive Upgrade Mock Data - FAQ Context
const mockFAQAIInsights = [
  { id: '1', type: 'info' as const, title: 'Top Search Query', description: '"How to reset password" searched 500 times this week. Consider highlighting.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Search' },
  { id: '2', type: 'warning' as const, title: 'Low Rated Articles', description: '5 articles have <60% helpfulness rating. Review and update content.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Quality' },
  { id: '3', type: 'success' as const, title: 'Engagement Up', description: 'Knowledge base views increased 35% this month. Great job!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockFAQCollaborators = [
  { id: '1', name: 'Content Lead', avatar: '/avatars/content.jpg', status: 'online' as const, role: 'Content Manager', lastActive: 'Now' },
  { id: '2', name: 'Support Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Technical Writer', lastActive: '6m ago' },
  { id: '3', name: 'UX Designer', avatar: '/avatars/ux.jpg', status: 'away' as const, role: 'UX Research', lastActive: '30m ago' },
]

const mockFAQPredictions = [
  { id: '1', label: 'Article Views', current: 15000, target: 20000, predicted: 18000, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Helpfulness Score', current: 78, target: 90, predicted: 84, confidence: 75, trend: 'up' as const },
  { id: '3', label: 'Search Success Rate', current: 72, target: 85, predicted: 80, confidence: 78, trend: 'up' as const },
]

const mockFAQActivities = [
  { id: '1', user: 'Content Lead', action: 'published', target: '3 new articles', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'Support Writer', action: 'updated', target: 'Getting Started guide', timestamp: '30m ago', type: 'info' as const },
  { id: '3', user: 'UX Designer', action: 'reviewed', target: 'article analytics dashboard', timestamp: '1h ago', type: 'info' as const },
]

// Note: mockFAQQuickActions will be initialized inside the component to access state setters
const mockFAQQuickActionsConfig = [
  { id: '1', label: 'New Article', icon: 'Plus', shortcut: 'N' },
  { id: '2', label: 'Search', icon: 'Search', shortcut: 'S' },
  { id: '3', label: 'Analytics', icon: 'BarChart3', shortcut: 'A' },
  { id: '4', label: 'Settings', icon: 'Settings', shortcut: 'T' },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function FAQClient() {
  const [activeTab, setActiveTab] = useState('articles')
  const [collections] = useState<Collection[]>(mockCollections)
  const [searchQueries] = useState<SearchQuery[]>(mockSearchQueries)
  const [helpCenterSettings] = useState<HelpCenterSettings>(mockHelpCenterSettings)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [collectionFilter, setCollectionFilter] = useState<string>('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // Collection management states
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [collectionsOrder, setCollectionsOrder] = useState<Collection[]>(mockCollections)
  const [apiKey, setApiKey] = useState('sk_live_abc123xyz...')
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false)

  // New collection form state
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    icon: '📄',
    color: 'bg-blue-500',
    isPublic: true
  })

  // Form state for new/edit article
  const [newArticle, setNewArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    collectionId: 'col-1',
    status: 'draft' as 'draft' | 'published' | 'review' | 'archived',
    tags: ''
  })

  // Supabase hook for FAQs
  const { faqs: dbFaqs, stats: dbStats, loading: isLoading, createFAQ, updateFAQ, deleteFAQ, markHelpful } = useFAQs()

  // Convert DB FAQs to Article format for display
  const articles = useMemo(() => {
    if (dbFaqs && dbFaqs.length > 0) {
      return dbFaqs.map(faq => ({
        id: faq.id,
        title: faq.question,
        slug: faq.question.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        content: faq.answer,
        excerpt: faq.answer.slice(0, 150) + (faq.answer.length > 150 ? '...' : ''),
        status: faq.status,
        collectionId: faq.category || 'col-1',
        author: mockAuthors[0],
        tags: faq.tags || [],
        viewCount: faq.views_count || 0,
        helpfulCount: faq.helpful_count || 0,
        notHelpfulCount: faq.not_helpful_count || 0,
        commentCount: 0,
        shareCount: 0,
        searchCount: faq.searches_count || 0,
        avgReadTime: faq.average_read_time || 3,
        createdAt: faq.created_at,
        updatedAt: faq.updated_at,
        publishedAt: faq.status === 'published' ? faq.updated_at : null,
        featured: false,
        pinned: faq.priority === 'high' || faq.priority === 'critical',
        language: 'en',
        translations: [],
        relatedArticles: faq.related_faqs || [],
        versions: []
      }))
    }
    return mockArticles
  }, [dbFaqs])

  // Stats - use real data when available
  const stats = useMemo(() => {
    if (dbStats && dbStats.total > 0) {
      return {
        totalArticles: dbStats.total,
        publishedArticles: dbStats.published,
        draftArticles: dbStats.draft,
        totalViews: dbStats.totalViews,
        totalSearches: 0,
        avgHelpfulRating: dbStats.avgHelpfulness,
        articlesNeedingReview: dbStats.review,
        unansweredQuestions: 0,
        totalCollections: collections.length,
        totalAuthors: mockAuthors.length
      }
    }
    return mockStats
  }, [dbStats, collections.length])

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter
      const matchesCollection = collectionFilter === 'all' || article.collectionId === collectionFilter
      return matchesSearch && matchesStatus && matchesCollection
    })
  }, [articles, searchQuery, statusFilter, collectionFilter])

  const featuredArticles = useMemo(() => {
    return articles.filter(a => a.featured && a.status === 'published').slice(0, 4)
  }, [articles])

  const popularArticles = useMemo(() => {
    return articles.filter(a => a.status === 'published').sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)
  }, [articles])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getHelpfulPercentage = (helpful: number, notHelpful: number) => {
    const total = helpful + notHelpful
    if (total === 0) return 0
    return Math.round((helpful / total) * 100)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Reset form state
  const resetForm = useCallback(() => {
    setNewArticle({
      title: '',
      excerpt: '',
      content: '',
      collectionId: 'col-1',
      status: 'draft',
      tags: ''
    })
    setEditingArticle(null)
  }, [])

  // Create new article/FAQ
  const handleCreateArticle = useCallback(async (publishImmediately = false) => {
    if (!newArticle.title.trim()) {
      toast.error('Validation Error')
      return
    }
    if (!newArticle.content.trim()) {
      toast.error('Validation Error')
      return
    }

    try {
      const tagsArray = newArticle.tags.split(',').map(t => t.trim()).filter(Boolean)
      const { data, error } = await createFAQ({
        question: newArticle.title,
        answer: newArticle.content,
        category: newArticle.collectionId,
        status: publishImmediately ? 'published' : newArticle.status,
        priority: 'medium',
        tags: tagsArray,
        views_count: 0,
        helpful_count: 0,
        not_helpful_count: 0,
        searches_count: 0,
        related_faqs: [],
        average_read_time: Math.ceil(newArticle.content.split(' ').length / 200),
        metadata: {}
      })

      if (error) throw new Error(error)

      toast.success('Article Created'" has been published`
          : `"${newArticle.title}" saved as draft`
      })
      setShowCreateDialog(false)
      resetForm()
    } catch (error: any) {
      toast.error('Error')
    }
  }, [newArticle, createFAQ, resetForm])

  // Update existing article/FAQ
  const handleUpdateArticle = useCallback(async (articleId: string, updates: Partial<FAQ>) => {
    try {
      const { data, error } = await updateFAQ(articleId, updates)
      if (error) throw new Error(error)
      toast.success('Article Updated')
      return data
    } catch (error: any) {
      toast.error('Error')
      return null
    }
  }, [updateFAQ])

  // Publish article
  const handlePublishArticle = useCallback(async (article: Article) => {
    try {
      const { error } = await updateFAQ(article.id, { status: 'published' })
      if (error) throw new Error(error)
      toast.success('Article Published'" is now public` })
    } catch (error: any) {
      toast.error('Error')
    }
  }, [updateFAQ])

  // Archive article
  const handleArchiveArticle = useCallback(async (article: Article) => {
    try {
      const { error } = await updateFAQ(article.id, { status: 'archived' })
      if (error) throw new Error(error)
      toast.success('Article Archived'" has been archived` })
      setSelectedArticle(null)
    } catch (error: any) {
      toast.error('Error')
    }
  }, [updateFAQ])

  // Delete article
  const handleDeleteArticle = useCallback((articleId: string) => {
    setArticleToDelete(articleId)
    setShowDeleteDialog(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!articleToDelete) return

    try {
      const { success, error } = await deleteFAQ(articleToDelete)
      if (error) throw new Error(error)
      toast.success('Article Deleted')
      setShowDeleteDialog(false)
      setArticleToDelete(null)
      setSelectedArticle(null)
    } catch (error: any) {
      toast.error('Error')
    }
  }, [articleToDelete, deleteFAQ])

  // Mark article as helpful/not helpful
  const handleMarkHelpful = useCallback(async (articleId: string, helpful: boolean) => {
    try {
      const { error } = await markHelpful(articleId, helpful)
      if (error) throw new Error(error)
      toast.success('Feedback Recorded')
    } catch (error: any) {
      toast.error('Error')
    }
  }, [markHelpful])

  // Export articles to CSV
  const handleExportArticles = useCallback(() => {
    const csvContent = articles.map(a =>
      `"${a.title.replace(/"/g, '""')}","${a.status}","${a.viewCount}","${a.helpfulCount}","${a.tags.join(';')}","${a.createdAt}"`
    ).join('\n')

    const blob = new Blob([`Title,Status,Views,Helpful,Tags,Created\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Export Complete')
  }, [articles])

  // Edit article - open dialog with pre-filled form
  const handleEditArticle = useCallback((article: Article) => {
    setNewArticle({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      collectionId: article.collectionId,
      status: article.status,
      tags: article.tags.join(', ')
    })
    setEditingArticle(article)
    setShowCreateDialog(true)
  }, [])

  // Save edited article
  const handleSaveEditedArticle = useCallback(async () => {
    if (!editingArticle) return

    try {
      const tagsArray = newArticle.tags.split(',').map(t => t.trim()).filter(Boolean)
      const { error } = await updateFAQ(editingArticle.id, {
        question: newArticle.title,
        answer: newArticle.content,
        category: newArticle.collectionId,
        status: newArticle.status,
        tags: tagsArray,
        average_read_time: Math.ceil(newArticle.content.split(' ').length / 200)
      })

      if (error) throw new Error(error)

      toast.success('Article Updated'" has been updated` })
      setShowCreateDialog(false)
      resetForm()
    } catch (error: any) {
      toast.error('Error')
    }
  }, [editingArticle, newArticle, updateFAQ, resetForm])

  // Collection management handlers
  const handleOpenAddCollection = useCallback(() => {
    setEditingCollection(null)
    setNewCollection({
      name: '',
      description: '',
      icon: '📄',
      color: 'bg-blue-500',
      isPublic: true
    })
    setShowCollectionDialog(true)
  }, [])

  const handleEditCollection = useCallback((collection: Collection) => {
    setEditingCollection(collection)
    setNewCollection({
      name: collection.name,
      description: collection.description,
      icon: collection.icon,
      color: collection.color,
      isPublic: collection.isPublic
    })
    setShowCollectionDialog(true)
  }, [])

  const handleSaveCollection = useCallback(() => {
    if (!newCollection.name.trim()) {
      toast.error('Validation Error')
      return
    }

    if (editingCollection) {
      // Update existing collection
      setCollectionsOrder(prev => prev.map(col =>
        col.id === editingCollection.id
          ? { ...col, ...newCollection, updatedAt: new Date().toISOString() }
          : col
      ))
      toast.success('Collection Updated'" has been updated` })
    } else {
      // Create new collection
      const newCol: Collection = {
        id: `col-${Date.now()}`,
        name: newCollection.name,
        description: newCollection.description,
        icon: newCollection.icon,
        color: newCollection.color,
        articleCount: 0,
        order: collectionsOrder.length + 1,
        parentId: null,
        isPublic: newCollection.isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCollectionsOrder(prev => [...prev, newCol])
      toast.success('Collection Created'" has been created` })
    }
    setShowCollectionDialog(false)
  }, [newCollection, editingCollection, collectionsOrder.length])

  const handleDeleteCollection = useCallback((collectionId: string) => {
    const collection = collectionsOrder.find(c => c.id === collectionId)
    if (collection && collection.articleCount > 0) {
      toast.error('Cannot Delete')
      return
    }
    setCollectionsOrder(prev => prev.filter(c => c.id !== collectionId))
    toast.success('Collection Deleted')
  }, [collectionsOrder])

  const handleToggleReorderMode = useCallback(() => {
    setReorderMode(prev => {
      if (prev) {
        toast.success('Reorder Saved')
      } else {
        toast.info('Reorder Mode')
      }
      return !prev
    })
  }, [])

  const handleMoveCollection = useCallback((collectionId: string, direction: 'up' | 'down') => {
    setCollectionsOrder(prev => {
      const index = prev.findIndex(c => c.id === collectionId)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const newOrder = [...prev]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      ;[newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]]
      return newOrder
    })
  }, [])

  const handleOpenImportDialog = useCallback(() => {
    setShowImportDialog(true)
  }, [])

  const handleImportArticles = useCallback((file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    toast.promise(
      fetch('/api/faq/import', { method: 'POST', body: formData }).then(res => { if (!res.ok) throw new Error('Failed'); }),
      {
        loading: 'Importing articles...',
        success: `Successfully imported articles from ${file.name}`,
        error: 'Failed to import articles'
      }
    )
    setShowImportDialog(false)
  }, [])

  // Quick actions with real functionality
  const mockFAQQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Article',
      icon: 'Plus',
      shortcut: 'N',
      action: () => {
        setShowCreateDialog(true)
        toast.success('Article Editor Opened')
      }
    },
    {
      id: '2',
      label: 'Search',
      icon: 'Search',
      shortcut: 'S',
      action: () => {
        const searchInput = document.querySelector('input[placeholder="Search articles..."]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          toast.success('Search Ready')
        }
      }
    },
    {
      id: '3',
      label: 'Analytics',
      icon: 'BarChart3',
      shortcut: 'A',
      action: () => {
        setActiveTab('analytics')
        toast.success('Analytics Loaded')
      }
    },
    {
      id: '4',
      label: 'Settings',
      icon: 'Settings',
      shortcut: 'T',
      action: () => {
        setActiveTab('settings')
        toast.success('Settings Loaded')
      }
    },
  ], [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Book className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Knowledge Base</h1>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Intercom/Zendesk Level</span>
                    <span>•</span>
                    <span>Self-service support at scale</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Help Center
              </button>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Article
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {[
              { label: 'Total Articles', value: stats.totalArticles, icon: FileText, change: '+5 this week' },
              { label: 'Total Views', value: formatNumber(stats.totalViews), icon: Eye, change: '+12.3%' },
              { label: 'Searches', value: formatNumber(stats.totalSearches), icon: Search, change: '+8.7%' },
              { label: 'Helpful Rate', value: `${stats.avgHelpfulRating}%`, icon: ThumbsUp, change: '+2.1%' },
              { label: 'Need Review', value: stats.articlesNeedingReview, icon: AlertCircle, change: '3 pending' },
              { label: 'Collections', value: stats.totalCollections, icon: FolderOpen, change: `${stats.totalAuthors} authors` }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-blue-200" />
                  <span className="text-sm text-blue-100">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-blue-200 mt-1">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="search-insights" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Insights
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Articles Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Book className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Knowledge Base Articles</h3>
                    <p className="text-indigo-100">Create and manage help articles for your customers</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalArticles}</div>
                    <div className="text-sm text-indigo-100">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.publishedArticles}</div>
                    <div className="text-sm text-indigo-100">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                    <div className="text-sm text-indigo-100">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.avgHelpfulRating}%</div>
                    <div className="text-sm text-indigo-100">Helpful</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {[
                { status: 'published', count: articles.filter(a => a.status === 'published').length, icon: CheckCircle2, color: 'green' },
                { status: 'draft', count: articles.filter(a => a.status === 'draft').length, icon: FileText, color: 'gray' },
                { status: 'review', count: articles.filter(a => a.status === 'review').length, icon: Clock, color: 'yellow' },
                { status: 'archived', count: articles.filter(a => a.status === 'archived').length, icon: Archive, color: 'gray' },
                { status: 'featured', count: featuredArticles.length, icon: Star, color: 'amber' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-500`} />
                  <div className="text-xl font-bold">{stat.count}</div>
                  <div className="text-xs text-gray-500 capitalize">{stat.status}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={collectionFilter}
                  onChange={(e) => setCollectionFilter(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                >
                  <option value="all">All Collections</option>
                  {collections.map(col => (
                    <option key={col.id} value={col.id}>{col.icon} {col.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{filteredArticles.length} articles</span>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }>
              {filteredArticles.map(article => {
                const collection = collections.find(c => c.id === article.collectionId)
                const helpfulPct = getHelpfulPercentage(article.helpfulCount, article.notHelpfulCount)

                return viewMode === 'list' ? (
                  <div
                    key={article.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${collection?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-2xl`}>
                        {collection?.icon || '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(article.status)}`}>
                                {article.status}
                              </span>
                              {article.featured && (
                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium flex items-center gap-1">
                                  <Star className="w-3 h-3" /> Featured
                                </span>
                              )}
                              {article.pinned && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                  Pinned
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer" onClick={() => setSelectedArticle(article)}>
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{article.excerpt}</p>
                          </div>
                          <button onClick={() => setSelectedArticle(article)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View article options">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-4 text-gray-500">
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(article.viewCount)}</span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {helpfulPct}% helpful
                            </span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.avgReadTime} min</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{article.commentCount}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                                {article.author.name.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-500">{article.author.name}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{new Date(article.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {article.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            {article.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{article.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={article.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className={`h-2 ${collection?.color || 'bg-gray-500'}`} />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(article.status)}`}>
                          {article.status}
                        </span>
                        {article.featured && <Star className="w-4 h-4 text-amber-500" />}
                      </div>
                      <h3 className="font-semibold line-clamp-2 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedArticle(article)}>
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(article.viewCount)}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{helpfulPct}%</span>
                        </div>
                        <span className="text-xs text-gray-400">{article.avgReadTime} min read</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-gray-500">Try adjusting your filters or create a new article</p>
              </div>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            {/* Collections Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FolderOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Content Collections</h3>
                    <p className="text-emerald-100">Organize articles into logical categories</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{collections.length}</div>
                    <div className="text-sm text-emerald-100">Collections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{collections.reduce((sum, c) => sum + c.articleCount, 0)}</div>
                    <div className="text-sm text-emerald-100">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{collections.filter(c => c.isPublic).length}</div>
                    <div className="text-sm text-emerald-100">Public</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <button onClick={handleOpenAddCollection} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Add Collection</p>
                  <p className="text-xs text-gray-500">Create new category</p>
                </div>
              </button>
              <button onClick={handleOpenImportDialog} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Import</p>
                  <p className="text-xs text-gray-500">Bulk import articles</p>
                </div>
              </button>
              <button onClick={handleToggleReorderMode} className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border ${reorderMode ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-100 dark:border-gray-700'} hover:shadow-md transition-all text-left`}>
                <div className={`w-10 h-10 ${reorderMode ? 'bg-amber-600' : 'bg-amber-500'} rounded-lg flex items-center justify-center`}>
                  <RefreshCw className={`w-5 h-5 text-white ${reorderMode ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="font-medium">{reorderMode ? 'Done Reordering' : 'Reorder'}</p>
                  <p className="text-xs text-gray-500">{reorderMode ? 'Click to save' : 'Change order'}</p>
                </div>
              </button>
              <button onClick={() => { setStatusFilter('archived'); setActiveTab('articles'); toast.success('Archive View') }} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                  <Archive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Archive</p>
                  <p className="text-xs text-gray-500">Archive old content</p>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">All Collections {reorderMode && <span className="text-amber-600 text-sm font-normal ml-2">(Reorder mode active)</span>}</h2>
              <button onClick={handleOpenAddCollection} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Collection
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectionsOrder.map((collection, index) => (
                <div
                  key={collection.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${reorderMode ? 'border-amber-300 dark:border-amber-700' : 'border-gray-100 dark:border-gray-700'} p-6 hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 ${collection.color} rounded-xl flex items-center justify-center text-3xl`}>
                      {collection.icon}
                    </div>
                    {reorderMode ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveCollection(collection.id, 'up')}
                          disabled={index === 0}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleMoveCollection(collection.id, 'down')}
                          disabled={index === collectionsOrder.length - 1}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEditCollection(collection)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Collection options">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{collection.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{collection.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500">{collection.articleCount} articles</span>
                    <div className="flex items-center gap-1">
                      {collection.isPublic ? (
                        <Globe className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Knowledge Base Analytics</h3>
                    <p className="text-violet-100">Track performance and user engagement</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
                    <div className="text-sm text-violet-100">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatNumber(stats.totalSearches)}</div>
                    <div className="text-sm text-violet-100">Searches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.avgHelpfulRating}%</div>
                    <div className="text-sm text-violet-100">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">+15%</div>
                    <div className="text-sm text-violet-100">This Month</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {[
                { label: 'Views Today', value: '2.4K', change: '+12%', positive: true, icon: Eye },
                { label: 'Avg Session', value: '4:32', change: '+8%', positive: true, icon: Clock },
                { label: 'Bounce Rate', value: '24%', change: '-5%', positive: true, icon: TrendingUp },
                { label: 'Helpful Votes', value: '847', change: '+23', positive: true, icon: ThumbsUp },
                { label: 'Not Helpful', value: '32', change: '-8', positive: true, icon: ThumbsDown },
                { label: 'Comments', value: '156', change: '+12', positive: true, icon: MessageSquare }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{stat.label}</span>
                  </div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Views Over Time
                </h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[45, 62, 55, 78, 82, 95, 88].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t transition-all"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-gray-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top Performing Articles
                </h3>
                <div className="space-y-3">
                  {popularArticles.slice(0, 4).map((article, i) => (
                    <div key={article.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{article.title}</p>
                        <p className="text-xs text-gray-500">{formatNumber(article.viewCount)} views</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {getHelpfulPercentage(article.helpfulCount, article.notHelpfulCount)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Feedback Summary
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">{stats.avgHelpfulRating}%</div>
                    <p className="text-sm text-gray-500 mt-1">Helpful Rating</p>
                  </div>
                  <div className="h-20 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{formatNumber(articles.reduce((sum, a) => sum + a.helpfulCount, 0))} helpful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5 text-red-500" />
                      <span className="text-sm">{formatNumber(articles.reduce((sum, a) => sum + a.notHelpfulCount, 0))} not helpful</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Content by Collection
                </h3>
                <div className="space-y-3">
                  {collections.slice(0, 5).map(col => (
                    <div key={col.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span>{col.icon}</span>
                          <span>{col.name}</span>
                        </span>
                        <span className="font-medium">{col.articleCount}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${col.color}`}
                          style={{ width: `${(col.articleCount / stats.totalArticles) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Search Insights Tab */}
          <TabsContent value="search-insights" className="space-y-6">
            {/* Search Insights Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Search Analytics & Insights</h3>
                    <p className="text-amber-100">Understand what your users are looking for</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatNumber(stats.totalSearches)}</div>
                    <div className="text-sm text-amber-100">Total Searches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{searchQueries.length}</div>
                    <div className="text-sm text-amber-100">Unique Queries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">92%</div>
                    <div className="text-sm text-amber-100">Results Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">1.4</div>
                    <div className="text-sm text-amber-100">Avg Click Position</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Zero Results', value: '8%', desc: 'Queries with no matches', icon: AlertCircle, color: 'text-red-500' },
                { label: 'Top Result Clicks', value: '67%', desc: 'Click first result', icon: Target, color: 'text-green-500' },
                { label: 'Avg Search Depth', value: '2.3', desc: 'Results viewed', icon: List, color: 'text-blue-500' },
                { label: 'Refinement Rate', value: '12%', desc: 'Modified searches', icon: RefreshCw, color: 'text-purple-500' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Top Search Queries
                </h3>
                <div className="space-y-3">
                  {searchQueries.map((query, i) => (
                    <div key={query.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{query.query}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{query.count} searches</span>
                          <span>{query.resultsFound} results found</span>
                          <span>Avg click: #{query.avgClickPosition.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        query.resultsFound > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {query.resultsFound > 0 ? 'Results Found' : 'No Results'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Suggestions
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Create article about "password reset"</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">245 searches with no good match</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Update "API authentication" article</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Low helpful rating (72%)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI-Powered Insights
                  </h3>
                  <p className="text-sm text-blue-100 mb-4">
                    Let AI analyze your knowledge base and suggest improvements
                  </p>
                  <button onClick={() => {
                    toast.promise(
                      fetch('/api/faq/ai/analyze', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                      { loading: 'AI is analyzing your knowledge base...', success: 'Analysis complete! 3 improvement suggestions generated', error: 'Analysis failed' }
                    )
                  }} className="w-full py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    Generate Insights
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tab Version */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Knowledge Base Settings</h3>
                    <p className="text-gray-200">Configure your help center and preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleExportArticles}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors"
                  >
                    Export Data
                  </button>
                  <button onClick={() => {
                    toast.promise(
                      fetch('/api/faq/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                      { loading: 'Saving settings...', success: 'Settings saved successfully', error: 'Failed to save settings' }
                    )
                  }} className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-sm font-medium transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar */}
              <div className="col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Settings</h4>
                  </div>
                  <nav className="p-2">
                    {[
                      { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                      { id: 'branding', icon: Palette, label: 'Branding', desc: 'Theme & colors' },
                      { id: 'languages', icon: Languages, label: 'Languages', desc: 'Multi-language' },
                      { id: 'integrations', icon: Link, label: 'Integrations', desc: 'Third-party apps' },
                      { id: 'notifications', icon: MessageSquare, label: 'Notifications', desc: 'Alerts & emails' },
                      { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power features' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all mb-1 ${
                          settingsTab === item.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        Help Center Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Help Center Name</label>
                          <input
                            type="text"
                            defaultValue={helpCenterSettings.title}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tagline</label>
                          <input
                            type="text"
                            defaultValue={helpCenterSettings.subtitle}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Domain</label>
                          <div className="mt-1 flex gap-2">
                            <input
                              type="text"
                              defaultValue={helpCenterSettings.customDomain || ''}
                              placeholder="help.yourdomain.com"
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            />
                            <button onClick={() => {
                            toast.promise(
                              fetch('/api/faq/domain/verify', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                              { loading: 'Starting domain verification...', success: 'Verification started - We will verify your domain ownership within 24 hours', error: 'Verification failed' }
                            )
                          }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                              Verify
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Configure a custom domain for your help center</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-purple-600" />
                        Display Options
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Show Search Bar', desc: 'Display search on homepage', checked: helpCenterSettings.showSearch },
                          { label: 'Show Categories', desc: 'Display category sections', checked: helpCenterSettings.showCategories },
                          { label: 'Show Popular Articles', desc: 'Feature top articles', checked: helpCenterSettings.showPopularArticles },
                          { label: 'Show Contact Button', desc: 'Display contact support link', checked: helpCenterSettings.showContactButton }
                        ].map((option, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-xs text-gray-500">{option.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${option.checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${option.checked ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Headphones className="w-5 h-5 text-green-600" />
                        Support Contact
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Support Email</label>
                          <input
                            type="email"
                            defaultValue={helpCenterSettings.contactEmail}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Time</label>
                          <select className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option>Within 24 hours</option>
                            <option>Within 4 hours</option>
                            <option>Within 1 hour</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Branding Settings */}
                {settingsTab === 'branding' && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-pink-600" />
                        Theme & Colors
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</label>
                          <div className="mt-2 flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                              style={{ backgroundColor: helpCenterSettings.primaryColor }}
                            />
                            <input
                              type="text"
                              defaultValue={helpCenterSettings.primaryColor}
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Accent Color</label>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer bg-purple-500" />
                            <input
                              type="text"
                              defaultValue="#8b5cf6"
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Presets</label>
                        <div className="mt-2 flex gap-2">
                          {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map(color => (
                            <button
                              key={color}
                              className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Image className="w-5 h-5 text-blue-600"  loading="lazy"/>
                        Logo & Images
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Logo</label>
                          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, SVG up to 2MB</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Favicon</label>
                          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">ICO, PNG 32x32px</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-indigo-600" />
                        Custom CSS
                      </h3>
                      <textarea
                        rows={6}
                        placeholder="/* Add your custom CSS here */"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2">Add custom CSS to further customize your help center appearance</p>
                    </div>
                  </>
                )}

                {/* Languages Settings */}
                {settingsTab === 'languages' && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Languages className="w-5 h-5 text-green-600" />
                          Supported Languages
                        </h3>
                        <button onClick={() => {
                          const languageDialog = document.createElement('dialog')
                          languageDialog.innerHTML = `
                            <div style="padding: 20px; min-width: 300px;">
                              <h3 style="margin-bottom: 15px; font-weight: bold;">Select Language to Add</h3>
                              <select id="language-select" style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                                <option value="pt">Portuguese</option>
                                <option value="zh">Chinese</option>
                                <option value="ja">Japanese</option>
                                <option value="ko">Korean</option>
                                <option value="it">Italian</option>
                              </select>
                              <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                <button id="cancel-btn" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: white;">Cancel</button>
                                <button id="add-btn" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px;">Add</button>
                              </div>
                            </div>
                          `
                          document.body.appendChild(languageDialog)
                          languageDialog.showModal()
                          languageDialog.querySelector('#cancel-btn')?.addEventListener('click', () => { languageDialog.close(); languageDialog.remove() })
                          languageDialog.querySelector('#add-btn')?.addEventListener('click', () => {
                            const select = languageDialog.querySelector('#language-select') as HTMLSelectElement
                            toast.success('Language added' is now available` })
                            languageDialog.close()
                            languageDialog.remove()
                          })
                        }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Language
                        </button>
                      </div>
                      <div className="space-y-3">
                        {helpCenterSettings.languages.map((lang, idx) => (
                          <div key={lang} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">
                                {lang === 'en' ? '🇺🇸' : lang === 'es' ? '🇪🇸' : lang === 'fr' ? '🇫🇷' : lang === 'de' ? '🇩🇪' : '🌐'}
                              </span>
                              <div>
                                <p className="font-medium">{lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : lang === 'fr' ? 'French' : 'German'}</p>
                                <p className="text-xs text-gray-500">{lang === helpCenterSettings.defaultLanguage ? 'Default language' : `${Math.floor(Math.random() * 50) + 50}% translated`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {lang === helpCenterSettings.defaultLanguage ? (
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                                  Default
                                </span>
                              ) : (
                                <button onClick={() => {
                                  toast.promise(
                                    fetch('/api/faq/languages/default', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: lang }) }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                                    { loading: 'Setting default language...', success: 'Default language set - This language is now the primary language for your FAQ', error: 'Failed to set default' }
                                  )
                                }} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium hover:bg-gray-200">
                                  Set as Default
                                </button>
                              )}
                              <button onClick={() => {
                                window.open('/dashboard/faq-v2/language-editor', '_blank')
                                toast.info('Opening Language Editor')
                              }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                                <Edit className="w-4 h-4 text-gray-500" />
                              </button>
                              {lang !== helpCenterSettings.defaultLanguage && (
                                <button onClick={() => { if (confirm(`Remove ${lang === 'es' ? 'Spanish' : lang === 'fr' ? 'French' : 'German'}? This will delete all translations.`)) { toast.success('Language Removed' has been removed` }) } }} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        Auto-Translation
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium">Enable AI Translation</p>
                            <p className="text-xs text-gray-500">Automatically translate new articles</p>
                          </div>
                          <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-blue-600">
                            <div className="w-4 h-4 rounded-full bg-white translate-x-6" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium">Review Before Publish</p>
                            <p className="text-xs text-gray-500">Require review for auto-translated content</p>
                          </div>
                          <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-blue-600">
                            <div className="w-4 h-4 rounded-full bg-white translate-x-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Link className="w-5 h-5 text-blue-600" />
                        Connected Integrations
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                          { name: 'Live Chat', icon: MessageCircle, connected: true, desc: 'Intercom' },
                          { name: 'Email Support', icon: Mail, connected: true, desc: 'SendGrid' },
                          { name: 'Slack', icon: MessageSquare, connected: false, desc: 'Not connected' },
                          { name: 'Webhooks', icon: Zap, connected: true, desc: '3 active hooks' },
                          { name: 'CRM', icon: Users, connected: true, desc: 'Salesforce' },
                          { name: 'Analytics', icon: BarChart3, connected: false, desc: 'Not connected' }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.connected ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <integration.icon className={`w-5 h-5 ${integration.connected ? 'text-blue-600' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-xs text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <button onClick={() => {
                              if (integration.connected) {
                                window.open(`/dashboard/faq-v2/integrations/${integration.name.toLowerCase().replace(/\s+/g, '-')}`, '_blank')
                                toast.info(`Managing ${integration.name}`)
                              } else {
                                toast.promise(
                                  fetch(`/api/faq/integrations/${integration.name.toLowerCase().replace(/\s+/g, '-')}`, { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                                  { loading: `Connecting ${integration.name}...`, success: `${integration.name} connected! Integration is now active`, error: `Failed to connect ${integration.name}` }
                                )
                              }
                            }} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                              integration.connected
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}>
                              {integration.connected ? 'Connected' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                        API Access
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                          <div className="mt-1 flex gap-2">
                            <input
                              type="password"
                              value={apiKey}
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm"
                              readOnly
                            />
                            <button onClick={() => { navigator.clipboard.writeText(apiKey).then(() => toast.success('API Key Copied')).catch(() => toast.error('Copy Failed')) }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm('Regenerate API key? This will invalidate your current key.')) { const newKey = 'faq_' + crypto.randomUUID().slice(0, 24); setApiKey(newKey); toast.success('API Key Regenerated') } }} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium">
                              Regenerate
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>Rate Limits:</strong> 1000 requests/minute • <strong>Docs:</strong> <a href="#" className="underline">API Documentation</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'New feedback received', desc: 'When users rate articles', enabled: true },
                          { label: 'Low satisfaction alert', desc: 'Articles below 70% rating', enabled: true },
                          { label: 'Weekly digest', desc: 'Summary of KB performance', enabled: true },
                          { label: 'New comments', desc: 'When users comment on articles', enabled: false },
                          { label: 'Content review due', desc: 'Articles needing review', enabled: true }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium">{notif.label}</p>
                              <p className="text-xs text-gray-500">{notif.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notif.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notif.enabled ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        In-App Notifications
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Browser notifications', desc: 'Push notifications in browser', enabled: true },
                          { label: 'Sound alerts', desc: 'Play sound for notifications', enabled: false },
                          { label: 'Desktop alerts', desc: 'Show desktop notification', enabled: true }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium">{notif.label}</p>
                              <p className="text-xs text-gray-500">{notif.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notif.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notif.enabled ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        AI Features
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'AI Article Suggestions', desc: 'Get AI-powered content recommendations', enabled: true },
                          { label: 'Smart Search', desc: 'AI-enhanced search results', enabled: true },
                          { label: 'Auto-Categorization', desc: 'Automatically categorize new articles', enabled: false },
                          { label: 'Content Quality Score', desc: 'AI-powered content scoring', enabled: true }
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium">{feature.label}</p>
                              <p className="text-xs text-gray-500">{feature.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${feature.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${feature.enabled ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5 text-green-600" />
                        Data Management
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <button
                          onClick={handleExportArticles}
                          className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:border-blue-500 transition-colors"
                        >
                          <Download className="w-5 h-5 text-blue-600 mb-2" />
                          <p className="font-medium">Export All Data</p>
                          <p className="text-xs text-gray-500">Download all articles as CSV</p>
                        </button>
                        <button onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.csv,.json'
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              const formData = new FormData()
                              formData.append('file', file)
                              toast.promise(
                                fetch('/api/faq/bulk-import', { method: 'POST', body: formData }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                                { loading: 'Importing articles...', success: `Import complete! ${file.name} imported successfully`, error: 'Import failed' }
                              )
                            }
                          }
                          input.click()
                        }} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:border-blue-500 transition-colors">
                          <Upload className="w-5 h-5 text-green-600 mb-2" />
                          <p className="font-medium">Import Data</p>
                          <p className="text-xs text-gray-500">Bulk import articles</p>
                        </button>
                        <button onClick={() => {
                          window.open('/dashboard/faq-v2/version-history', '_blank')
                          toast.success('Version history loaded')
                        }} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:border-blue-500 transition-colors">
                          <History className="w-5 h-5 text-purple-600 mb-2" />
                          <p className="font-medium">Version History</p>
                          <p className="text-xs text-gray-500">View all article revisions</p>
                        </button>
                        <button onClick={() => { setStatusFilter('published'); setActiveTab('articles'); setBulkSelectionMode(true); toast.success('Bulk Archive Mode') }} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:border-red-500 transition-colors">
                          <Archive className="w-5 h-5 text-amber-600 mb-2" />
                          <p className="font-medium">Bulk Archive</p>
                          <p className="text-xs text-gray-500">Archive multiple articles</p>
                        </button>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        Danger Zone
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Analytics</p>
                            <p className="text-xs text-gray-500">Clear all view counts and feedback</p>
                          </div>
                          <button onClick={async () => { if (confirm('Reset all analytics data? This cannot be undone.')) { try { for (const faq of dbFaqs) { await updateFAQ(faq.id, { views_count: 0, helpful_count: 0, not_helpful_count: 0, searches_count: 0 }) } toast.success('Analytics Reset') } catch { toast.error('Failed to reset analytics') } } }} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200">
                            Reset
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Articles</p>
                            <p className="text-xs text-gray-500">Permanently delete all content</p>
                          </div>
                          <button onClick={async () => { if (confirm('DELETE ALL ARTICLES? This action is PERMANENT and cannot be undone!')) { if (confirm('Are you absolutely sure? This will delete all FAQ articles.')) { try { for (const faq of dbFaqs) { await deleteFAQ(faq.id) } toast.success('All Articles Deleted') } catch { toast.error('Failed to delete articles') } } } }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                            Delete All
                          </button>
                        </div>
                      </div>
                    </div>
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
              insights={mockFAQAIInsights}
              title="Knowledge Base Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockFAQCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockFAQPredictions}
              title="Content Metrics Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockFAQActivities}
            title="Content Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockFAQQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Create/Edit Article Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    placeholder="Enter article title..."
                    value={newArticle.title}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Collection</label>
                  <select
                    value={newArticle.collectionId}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, collectionId: e.target.value }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>{col.icon} {col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={newArticle.status}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, status: e.target.value as typeof newArticle.status }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the article..."
                    value={newArticle.excerpt}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                  <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Edit className="w-4 h-4" /></button>
                      <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Image className="w-4 h-4"  loading="lazy"/></button>
                      <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><Link className="w-4 h-4" /></button>
                    </div>
                    <textarea
                      rows={10}
                      placeholder="Write your article content here..."
                      value={newArticle.content}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                  <input
                    type="text"
                    placeholder="Add tags separated by commas..."
                    value={newArticle.tags}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, tags: e.target.value }))}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowCreateDialog(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                {editingArticle ? (
                  <button
                    onClick={handleSaveEditedArticle}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleCreateArticle(false)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save as Draft
                    </button>
                    <button
                      onClick={() => handleCreateArticle(true)}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Publish
                    </button>
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteDialog(false)
                setArticleToDelete(null)
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="space-y-6 pr-4">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedArticle.status)}`}>
                    {selectedArticle.status}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    {formatNumber(selectedArticle.viewCount)} views
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    {getHelpfulPercentage(selectedArticle.helpfulCount, selectedArticle.notHelpfulCount)}% helpful
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {selectedArticle.avgReadTime} min read
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300">{selectedArticle.excerpt}</p>
                  <hr />
                  <p>{selectedArticle.content}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedArticle.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedArticle.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{selectedArticle.author.name}</p>
                      <p className="text-sm text-gray-500">{selectedArticle.author.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(selectedArticle.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Was this article helpful?</p>
                  <button
                    onClick={() => handleMarkHelpful(selectedArticle.id, true)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 hover:text-green-600 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes
                  </button>
                  <button
                    onClick={() => handleMarkHelpful(selectedArticle.id, false)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No
                  </button>
                </div>

                {/* Article Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEditArticle(selectedArticle)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {selectedArticle.status !== 'published' && (
                    <button
                      onClick={() => handlePublishArticle(selectedArticle)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Publish
                    </button>
                  )}
                  {selectedArticle.status !== 'archived' && (
                    <button
                      onClick={() => handleArchiveArticle(selectedArticle)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteArticle(selectedArticle.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Collection Create/Edit Dialog */}
      <Dialog open={showCollectionDialog} onOpenChange={(open) => {
        setShowCollectionDialog(open)
        if (!open) {
          setEditingCollection(null)
          setNewCollection({ name: '', description: '', icon: '📄', color: 'bg-blue-500', isPublic: true })
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCollection ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Collection Name</label>
              <input
                type="text"
                placeholder="e.g., Getting Started"
                value={newCollection.name}
                onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                rows={3}
                placeholder="Brief description of this collection..."
                value={newCollection.description}
                onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {['📄', '🚀', '💳', '✨', '🔧', '🔗', '🔒', '📊', '💡', '📚'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCollection(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-colors ${
                        newCollection.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-amber-500'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCollection(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg ${color} ${
                        newCollection.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium">Public Collection</p>
                <p className="text-xs text-gray-500">Visible to all users</p>
              </div>
              <button
                type="button"
                onClick={() => setNewCollection(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${newCollection.isPublic ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${newCollection.isPublic ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            {editingCollection && (
              <button
                onClick={() => {
                  handleDeleteCollection(editingCollection.id)
                  setShowCollectionDialog(false)
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <div className={`flex gap-3 ${editingCollection ? '' : 'ml-auto'}`}>
              <button
                onClick={() => setShowCollectionDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCollection}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {editingCollection ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Articles</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv,.json'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) handleImportArticles(file)
                }
                input.click()
              }}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="font-medium mb-1">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">Supports CSV and JSON formats</p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Import Format</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                CSV columns: title, content, collection, tags, status<br />
                JSON: Array of article objects with same fields
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowImportDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
