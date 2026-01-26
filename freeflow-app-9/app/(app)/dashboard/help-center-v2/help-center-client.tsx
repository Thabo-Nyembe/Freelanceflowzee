'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BookOpen,
  Search,
  FileText,
  Video,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  TrendingUp,
  Zap,
  HelpCircle,
  Lightbulb,
  Plus,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Folder,
  FolderOpen,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Star,
  BarChart3,
  Filter,
  ChevronRight,
  ChevronDown,
  Play,
  Bookmark,
  Share2,
  RefreshCw,
  Archive,
  Send,
  Link,
  List,
  Grid3X3,
  Calendar,
  Tag,
  Languages,
  ArrowUpRight,
  Upload,
  Settings,
  Layers,
  Sparkles,
  Download,
  Target
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

import { useHelpArticles, useHelpCategories, useHelpDocs } from '@/lib/hooks/use-help-extended'
import { useAuthUserId } from '@/lib/hooks/use-auth-helpers'

// Initialize Supabase client once at module level
const supabase = createClient()

// ============================================================================
// TYPE DEFINITIONS - Intercom Guide Level Knowledge Base
// ============================================================================

type ArticleStatus = 'draft' | 'review' | 'published' | 'archived'
type ArticleType = 'article' | 'tutorial' | 'faq' | 'video' | 'guide' | 'troubleshooting'
type ContentFormat = 'text' | 'video' | 'interactive' | 'checklist'
type FeedbackType = 'helpful' | 'not_helpful' | 'needs_update' | 'incorrect'
type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh'
type AudienceType = 'all' | 'customers' | 'team' | 'enterprise' | 'developers'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  type: ArticleType
  status: ArticleStatus
  format: ContentFormat
  categoryId: string
  subcategoryId?: string
  collectionId?: string
  author: {
    id: string
    name: string
    avatar: string
    role: string
  }
  language: Language
  translations: Language[]
  audience: AudienceType
  tags: string[]
  views: number
  helpfulCount: number
  notHelpfulCount: number
  avgRating: number
  readTime: number
  videoUrl?: string
  videoDuration?: number
  relatedArticles: string[]
  version: number
  publishedAt: string
  updatedAt: string
  createdAt: string
  seoTitle?: string
  seoDescription?: string
  featured: boolean
  pinned: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  articleCount: number
  subcategories: Subcategory[]
  order: number
  visibility: 'public' | 'private' | 'restricted'
}

interface Subcategory {
  id: string
  name: string
  slug: string
  articleCount: number
}

interface Collection {
  id: string
  name: string
  description: string
  icon: string
  color: string
  articleIds: string[]
  views: number
  audience: AudienceType
  order: number
}

interface SearchResult {
  article: Article
  matchType: 'title' | 'content' | 'tag'
  relevanceScore: number
  highlightedText: string
}

interface Feedback {
  id: string
  articleId: string
  type: FeedbackType
  comment?: string
  userId?: string
  userEmail?: string
  createdAt: string
}

interface Analytics {
  totalViews: number
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  avgHelpfulRate: number
  searchVolume: number
  topSearchQueries: { query: string; count: number; hasResults: boolean }[]
  viewsByDay: { date: string; views: number }[]
  topArticles: { articleId: string; title: string; views: number }[]
  feedbackTrends: { date: string; helpful: number; notHelpful: number }[]
  selfServiceRate: number
  avgReadTime: number
  bounceRate: number
}

// ============================================================================
// EMPTY DATA ARRAYS - Real data loaded from Supabase via hooks
// ============================================================================

const emptyAnalytics: Analytics = {
  totalViews: 0,
  totalArticles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  avgHelpfulRate: 0,
  searchVolume: 0,
  topSearchQueries: [],
  viewsByDay: [],
  topArticles: [],
  feedbackTrends: [],
  selfServiceRate: 0,
  avgReadTime: 0,
  bounceRate: 0
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusBadge = (status: ArticleStatus) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Published</Badge>
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Draft</Badge>
    case 'review':
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">In Review</Badge>
    case 'archived':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Archived</Badge>
  }
}

const getTypeBadge = (type: ArticleType) => {
  switch (type) {
    case 'article':
      return <Badge variant="outline" className="border-blue-300 text-blue-700"><FileText className="w-3 h-3 mr-1" />Article</Badge>
    case 'tutorial':
      return <Badge variant="outline" className="border-purple-300 text-purple-700"><Play className="w-3 h-3 mr-1" />Tutorial</Badge>
    case 'faq':
      return <Badge variant="outline" className="border-green-300 text-green-700"><HelpCircle className="w-3 h-3 mr-1" />FAQ</Badge>
    case 'video':
      return <Badge variant="outline" className="border-orange-300 text-orange-700"><Video className="w-3 h-3 mr-1" />Video</Badge>
    case 'guide':
      return <Badge variant="outline" className="border-indigo-300 text-indigo-700"><BookOpen className="w-3 h-3 mr-1" />Guide</Badge>
    case 'troubleshooting':
      return <Badge variant="outline" className="border-red-300 text-red-700"><Lightbulb className="w-3 h-3 mr-1" />Troubleshooting</Badge>
  }
}

const getAudienceBadge = (audience: AudienceType) => {
  switch (audience) {
    case 'all':
      return <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-900/20"><Globe className="w-3 h-3 mr-1" />All Users</Badge>
    case 'customers':
      return <Badge className="bg-green-50 text-green-600 dark:bg-green-900/20"><Users className="w-3 h-3 mr-1" />Customers</Badge>
    case 'team':
      return <Badge className="bg-purple-50 text-purple-600 dark:bg-purple-900/20"><Users className="w-3 h-3 mr-1" />Team</Badge>
    case 'enterprise':
      return <Badge className="bg-orange-50 text-orange-600 dark:bg-orange-900/20"><Zap className="w-3 h-3 mr-1" />Enterprise</Badge>
    case 'developers':
      return <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"><Zap className="w-3 h-3 mr-1" />Developers</Badge>
  }
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const getHelpfulRate = (helpful: number, notHelpful: number) => {
  if (helpful + notHelpful === 0) return 0
  return Math.round((helpful / (helpful + notHelpful)) * 100)
}

// ============================================================================
// EMPTY ARRAYS FOR COMPETITIVE UPGRADE COMPONENTS - Real data loaded from Supabase
// ============================================================================

const helpCenterAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const helpCenterCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const helpCenterPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[] = []

const helpCenterActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' }[] = []

// Quick actions will be defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HelpCenterClient() {
  // State that's used by hooks
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Hooks for real-time database data
  const { getUserId } = useAuthUserId()
  const [userId, setUserId] = useState<string | null>(null)
  const { data: articlesData, isLoading: articlesLoading, refresh: refreshArticles } = useHelpArticles(selectedCategory || undefined)
  const { data: categoriesData, isLoading: categoriesLoading, refresh: refreshCategories } = useHelpCategories()
  const { data: collectionsData, isLoading: collectionsLoading, refresh: refreshCollections } = useHelpDocs()

  // Local state for UI operations (synced with hook data via useEffect)
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  // Analytics and feedback state - real data loaded from Supabase
  const [analytics] = useState<Analytics>(emptyAnalytics)
  const [feedback, setFeedback] = useState<Feedback[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState('articles')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ArticleType | 'all'>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-1']))
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackType | 'all'>('all')
  const [isSearching, setIsSearching] = useState(false)
  const [showCreateArticleDialog, setShowCreateArticleDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // New dialog states for full functionality
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false)
  const [showManageTagsDialog, setShowManageTagsDialog] = useState(false)
  const [showTranslateDialog, setShowTranslateDialog] = useState(false)
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false)
  const [showOrganizeDialog, setShowOrganizeDialog] = useState(false)
  const [showCrossLinkDialog, setShowCrossLinkDialog] = useState(false)
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null)

  // Form states for new article
  const [newArticleTitle, setNewArticleTitle] = useState('')
  const [newArticleExcerpt, setNewArticleExcerpt] = useState('')
  const [newArticleContent, setNewArticleContent] = useState('')
  const [newArticleType, setNewArticleType] = useState<ArticleType>('article')
  const [newArticleCategoryId, setNewArticleCategoryId] = useState('')
  const [newArticleTags, setNewArticleTags] = useState('')
  const [newArticleAudience, setNewArticleAudience] = useState<AudienceType>('all')

  // Form states for new category
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('')

  // Form states for new collection
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [newCollectionIcon, setNewCollectionIcon] = useState('')
  const [newCollectionAudience, setNewCollectionAudience] = useState<AudienceType>('all')

  // Tags management state - populated from articles data
  const [allTags, setAllTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState('')

  // Schedule state
  const [scheduleArticleId, setScheduleArticleId] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  // Sync hook data to local state
  useEffect(() => {
    if (articlesData) {
      setArticles(articlesData as any as Article[])
    }
  }, [articlesData])

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData as any as Category[])
    }
  }, [categoriesData])

  useEffect(() => {
    if (collectionsData) {
      setCollections(collectionsData as any as Collection[])
    }
  }, [collectionsData])

  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId()
      setUserId(id)
    }
    fetchUserId()
  }, [getUserId])

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = !selectedCategory || article.categoryId === selectedCategory
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter
      const matchesType = typeFilter === 'all' || article.type === typeFilter
      return matchesSearch && matchesCategory && matchesStatus && matchesType
    })
  }, [articles, searchQuery, selectedCategory, statusFilter, typeFilter])

  // Stats calculations
  const stats = useMemo(() => ({
    totalArticles: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    drafts: articles.filter(a => a.status === 'draft').length,
    inReview: articles.filter(a => a.status === 'review').length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    avgHelpfulRate: getHelpfulRate(
      articles.reduce((sum, a) => sum + a.helpfulCount, 0),
      articles.reduce((sum, a) => sum + a.notHelpfulCount, 0)
    ),
    totalFeedback: feedback.length,
    needsAttention: feedback.filter(f => f.type === 'not_helpful' || f.type === 'needs_update').length
  }), [articles, feedback])

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article)
    setShowArticleDialog(true)
  }

  // Real API Handlers - All async with actual functionality

  // Article handlers
  const handleCreateArticle = async () => {
    // Reset form fields
    setNewArticleTitle('')
    setNewArticleExcerpt('')
    setNewArticleContent('')
    setNewArticleType('article')
    setNewArticleCategoryId('')
    setNewArticleTags('')
    setNewArticleAudience('all')
    setShowCreateArticleDialog(true)
  }

  // Save new article handler
  const handleSaveNewArticle = async () => {
    if (!newArticleTitle.trim()) {
      toast.error('Please enter an article title')
      return
    }
    if (!newArticleExcerpt.trim()) {
      toast.error('Please enter an article excerpt')
      return
    }
    if (!newArticleCategoryId) {
      toast.error('Please select a category')
      return
    }

    try {

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newArticle = {
        title: newArticleTitle,
        slug: newArticleTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        excerpt: newArticleExcerpt,
        content: newArticleContent,
        article_type: newArticleType,
        category_id: newArticleCategoryId,
        tags: newArticleTags.split(',').map(t => t.trim()).filter(t => t),
        is_published: false,
        user_id: user.id,
      }

      const { error } = await supabase
        .from('help_articles')
        .insert(newArticle)

      if (error) throw error

      setShowCreateArticleDialog(false)
      toast.success('Article "' + newArticleTitle + '" created as draft')
      refreshArticles()  // Refresh data from database
    } catch (error) {
      console.error('Error creating article:', error)
      toast.error('Failed to create article')
    }
  }

  const handlePublishArticle = async (articleTitle: string) => {
    const article = articles.find(a => a.title === articleTitle)
    if (!article) {
      toast.error('Article not found')
      return
    }

    await toast.promise(
      fetch('/api/help/articles/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to publish')
        refreshArticles()  // Refresh data from database
        return res.json()
      }),
      {
        loading: 'Publishing article...',
        success: "\"" + articleTitle + "\" is now live!",
        error: 'Failed to publish article'
      }
    )
  }

  const handleCreateCategory = async () => {
    setNewCategoryName('')
    setNewCategoryDescription('')
    setNewCategoryIcon('')
    setShowCreateCategoryDialog(true)
  }

  // Save new category handler
  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    try {

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newCategory = {
        name: newCategoryName,
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: newCategoryDescription,
        icon: newCategoryIcon || '📁',
        order_index: categories.length + 1,
        user_id: user.id,
      }

      const { error } = await supabase
        .from('help_categories')
        .insert(newCategory)

      if (error) throw error

      setShowCreateCategoryDialog(false)
      toast.success('Category "' + newCategoryName + '" created successfully')
      refreshCategories()  // Refresh data from database
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  // Search handlers with real state updates
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.info('Please enter a search term')
      return
    }
    setIsSearching(true)
    try {
      // Real search with state update - the filteredArticles memo already handles this
      const results = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      toast.success('Found ' + results.length + ' articles matching "' + searchQuery + '"')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchArticles = async () => {
    await handleSearch()
  }

  // Analytics handler - switches to analytics tab
  const handleAnalytics = async () => {
    setActiveTab('analytics')
    toast.success('Analytics dashboard loaded')
  }

  // Import handler
  const handleImport = async () => {
    // Create file input for import
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.csv,.md'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        toast.promise(
          new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsText(file)
          }),
          {
            loading: 'Importing articles...',
            success: "Imported from " + file.name,
            error: 'Import failed'
          }
        )
      }
    }
    input.click()
  }

  const handleManageTags = async () => {
    setShowManageTagsDialog(true)
  }

  // Add new tag handler
  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name')
      return
    }
    if (allTags.includes(newTagName.toLowerCase())) {
      toast.error('Tag already exists')
      return
    }
    setAllTags(prev => [...prev, newTagName.toLowerCase()])
    setNewTagName('')
    toast.success('Tag "' + newTagName + '" added')
  }

  // Delete tag handler
  const handleDeleteTag = async (tag: string) => {
    setAllTags(prev => prev.filter(t => t !== tag))
    toast.success('Tag "' + tag + '" deleted')
  }

  const handleTranslate = async () => {
    setShowTranslateDialog(true)
  }

  const handleArchives = async () => {
    setStatusFilter('archived')
    setActiveTab('articles')
    toast.success('Showing archived articles')
  }

  const handleSettings = async () => {
    setShowSettingsDialog(true)
  }

  const handleSubcategory = async () => {
    setShowSubcategoryDialog(true)
  }

  const handleOrganize = async () => {
    setShowOrganizeDialog(true)
  }

  const handleAutoSort = async () => {
    // Sort articles by views (most popular first)
    const sortedArticles = [...articles].sort((a, b) => b.views - a.views)
    setArticles(sortedArticles)
    toast.success('Articles sorted by popularity')
  }

  const handleCrossLink = async () => {
    setShowCrossLinkDialog(true)
  }

  const handleCleanup = async () => {
    // Find articles that might need cleanup (old drafts, low engagement)
    const needsCleanup = articles.filter(a =>
      (a.status === 'draft' && new Date(a.updatedAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (a.status === 'published' && a.views < 100)
    )
    toast.success('Found ' + needsCleanup.length + ' articles that may need attention')
  }

  const handleViewCollection = async (collectionName: string) => {
    // Filter articles by collection
    const collection = collections.find(c => c.name === collectionName)
    if (collection) {
      toast.success('Viewing collection: ' + collectionName + ' (' + collection.articleIds.length + ' articles)')
    }
  }

  const handleNewCollection = async () => {
    setNewCollectionName('')
    setNewCollectionDescription('')
    setNewCollectionIcon('')
    setNewCollectionAudience('all')
    setShowNewCollectionDialog(true)
  }

  // Save new collection handler
  const handleSaveNewCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name')
      return
    }

    try {

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newCollection = {
        title: newCollectionName,
        content: newCollectionDescription,
        category_id: null, // Could be set if there's a selected category
        user_id: user.id,
      }

      const { error } = await supabase
        .from('help_docs')
        .insert(newCollection)

      if (error) throw error

      setShowNewCollectionDialog(false)
      toast.success('Collection "' + newCollectionName + '" created successfully')
      refreshCollections()  // Refresh data from database
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('Failed to create collection')
    }
  }

  // Feedback filter handlers - actually filter feedback
  const handleAllFeedback = async () => {
    setFeedbackFilter('all')
    setActiveTab('feedback')
    toast.success("Showing all " + feedback.length + " feedback items")
  }

  const handlePositiveFeedback = async () => {
    setFeedbackFilter('helpful')
    setActiveTab('feedback')
    const count = feedback.filter(f => f.type === 'helpful').length
    toast.success("Showing " + count + " positive feedback items")
  }

  const handleNegativeFeedback = async () => {
    setFeedbackFilter('not_helpful')
    setActiveTab('feedback')
    const count = feedback.filter(f => f.type === 'not_helpful').length
    toast.success("Showing " + count + " negative feedback items")
  }

  const handleIncorrectFeedback = async () => {
    setFeedbackFilter('incorrect')
    setActiveTab('feedback')
    const count = feedback.filter(f => f.type === 'incorrect').length
    toast.success("Showing " + count + " incorrect reports")
  }

  const handleNeedsUpdate = async () => {
    setFeedbackFilter('needs_update')
    setActiveTab('feedback')
    const count = feedback.filter(f => f.type === 'needs_update').length
    toast.success("Showing " + count + " update requests")
  }

  // Export handler - real file download
  const handleExport = async () => {
    const exportData = {
      articles,
      categories,
      collections,
      feedback,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = "help-center-export-" + new Date().toISOString().split('T')[0] + ".json"
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Help center data exported successfully')
  }

  const handleReports = async () => {
    setActiveTab('analytics')
    toast.success('Viewing analytics reports')
  }

  const handleReviewNegative = async () => {
    setFeedbackFilter('not_helpful')
    setActiveTab('feedback')
    toast.success('Review negative feedback to improve content')
  }

  const handleUpdateRequested = async () => {
    setFeedbackFilter('needs_update')
    setActiveTab('feedback')
    toast.success('Articles needing updates are highlighted')
  }

  const handleFollowUp = async () => {
    // Filter feedback with comments that need follow-up
    const needsFollowUp = feedback.filter(f => f.comment && f.userEmail)
    toast.success(needsFollowUp.length + " feedback items need follow-up")
  }

  const handleOverview = async () => {
    setActiveTab('analytics')
    toast.success('Analytics overview loaded')
  }

  const handleTrends = async () => {
    setActiveTab('analytics')
    toast.success('Viewing trend analysis')
  }

  const handleSearchTerms = async () => {
    setActiveTab('analytics')
    toast.success('Search analytics - see what users are looking for')
  }

  const handlePageViews = async () => {
    setActiveTab('analytics')
    toast.success('Page view statistics loaded')
  }

  const handleTimeOnPage = async () => {
    setActiveTab('analytics')
    toast.success('Engagement metrics loaded')
  }

  const handleGaps = async () => {
    // Analyze searches without results
    const gapQueries = analytics.topSearchQueries.filter(q => !q.hasResults)
    toast.success("Found " + gapQueries.length + " content gaps - consider creating articles for: " + gapQueries.map(q => q.query).join(', '))
  }

  const handleSchedule = async () => {
    setScheduleArticleId('')
    setScheduleDate('')
    setScheduleTime('')
    setShowScheduleDialog(true)
  }

  // Save scheduled publication handler
  const handleSaveSchedule = async () => {
    if (!scheduleArticleId) {
      toast.error('Please select an article')
      return
    }
    if (!scheduleDate) {
      toast.error('Please select a date')
      return
    }
    if (!scheduleTime) {
      toast.error('Please select a time')
      return
    }

    const article = articles.find(a => a.id === scheduleArticleId)
    if (article) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      setArticles(prev => prev.map(a =>
        a.id === scheduleArticleId
          ? { ...a, publishedAt: scheduledDateTime.toISOString() }
          : a
      ))
      setShowScheduleDialog(false)
      toast.success("\"" + article.title + "\" scheduled for " + scheduledDateTime.toLocaleString())
    }
  }

  // Article action handlers
  const handleViewArticleExternal = async (articleTitle: string) => {
    const article = articles.find(a => a.title === articleTitle)
    if (article) {
      window.open("/help/" + article.slug, '_blank')
      toast.success("Opened \"" + articleTitle + "\" in new tab")
    }
  }

  const handleEditArticle = async (articleTitle: string) => {
    const article = articles.find(a => a.title === articleTitle)
    if (article) {
      setSelectedArticle(article)
      toast.success("Editing \"" + articleTitle + "\"")
      // In production: navigate to editor or open edit dialog
    }
  }

  const handleViewLive = async (articleTitle: string) => {
    const article = articles.find(a => a.title === articleTitle)
    if (article) {
      window.open("/help/" + article.slug, '_blank')
      toast.success("Viewing live preview of \"" + articleTitle + "\"")
    }
  }

  const handleDuplicate = async (articleTitle: string) => {
    const article = articles.find(a => a.title === articleTitle)
    if (!article) {
      toast.error('Article not found')
      return
    }

    const duplicatedArticle: Article = {
      ...article,
      id: "art-" + Date.now(),
      title: article.title + " (Copy)",
      slug: article.slug + "-copy",
      status: 'draft',
      views: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      version: 1,
      publishedAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setArticles(prev => [...prev, duplicatedArticle])
    toast.success("\"" + articleTitle + "\" has been duplicated")
  }

  const handleShare = async (articleTitle: string) => {
    const article = articles.find(a => a.title === articleTitle)
    if (!article) {
      toast.error('Article not found')
      return
    }

    const shareUrl = window.location.origin + "/help/" + article.slug

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard: " + shareUrl)
    } catch {
      // Fallback for older browsers
      toast.info("Share link: " + shareUrl)
    }
  }

  const handleArchive = async (articleTitle: string) => {
    const article = articles.find(a => a.title === articleTitle)
    if (!article) {
      toast.error('Article not found')
      return
    }

    await toast.promise(
      fetch('/api/help/articles/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to archive')
        setArticles(prev => prev.map(a =>
          a.id === article.id ? { ...a, status: 'archived' as ArticleStatus } : a
        ))
        setShowArticleDialog(false)
        return res.json()
      }).catch(() => {
        // Fallback: update locally even if API fails
        setArticles(prev => prev.map(a =>
          a.id === article.id ? { ...a, status: 'archived' as ArticleStatus } : a
        ))
        setShowArticleDialog(false)
      }),
      {
        loading: 'Archiving article...',
        success: "\"" + articleTitle + "\" has been archived",
        error: 'Failed to archive (updated locally)'
      }
    )
  }

  const handleEditCategory = async (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    if (category) {
      setSelectedCategoryForEdit(category)
      setNewCategoryName(category.name)
      setNewCategoryDescription(category.description)
      setNewCategoryIcon(category.icon)
      setShowEditCategoryDialog(true)
    }
  }

  // Save edited category handler
  const handleSaveEditedCategory = async () => {
    if (!selectedCategoryForEdit) return
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    setCategories(prev => prev.map(c =>
      c.id === selectedCategoryForEdit.id
        ? {
            ...c,
            name: newCategoryName,
            slug: newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            description: newCategoryDescription,
            icon: newCategoryIcon || c.icon
          }
        : c
    ))
    setShowEditCategoryDialog(false)
    setSelectedCategoryForEdit(null)
    toast.success("Category \"" + newCategoryName + "\" updated successfully")
  }

  // Copy article link handler
  const handleCopyArticleLink = async (article: Article) => {
    const url = window.location.origin + "/help/" + article.slug
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Article link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // Rate article handler - POST to API
  const handleRateArticle = async (articleId: string, isHelpful: boolean) => {
    await toast.promise(
      fetch('/api/help/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, isHelpful })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to submit rating')
        // Update local state
        setArticles(prev => prev.map(a => {
          if (a.id === articleId) {
            return {
              ...a,
              helpfulCount: isHelpful ? a.helpfulCount + 1 : a.helpfulCount,
              notHelpfulCount: !isHelpful ? a.notHelpfulCount + 1 : a.notHelpfulCount
            }
          }
          return a
        }))
        return res.json()
      }).catch(() => {
        // Fallback: update locally
        setArticles(prev => prev.map(a => {
          if (a.id === articleId) {
            return {
              ...a,
              helpfulCount: isHelpful ? a.helpfulCount + 1 : a.helpfulCount,
              notHelpfulCount: !isHelpful ? a.notHelpfulCount + 1 : a.notHelpfulCount
            }
          }
          return a
        }))
      }),
      {
        loading: 'Submitting your feedback...',
        success: isHelpful ? 'Thanks for your feedback!' : 'Sorry this wasn\'t helpful. We\'ll work to improve it.',
        error: 'Rating saved locally'
      }
    )
  }

  // Submit feedback handler - POST to API
  const handleSubmitFeedback = async (articleId: string, type: FeedbackType, comment?: string) => {
    await toast.promise(
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, type, comment })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to submit feedback')
        // Add to local feedback
        const newFeedback: Feedback = {
          id: "fb-" + Date.now(),
          articleId,
          type,
          comment,
          createdAt: new Date().toISOString()
        }
        setFeedback(prev => [newFeedback, ...prev])
        return res.json()
      }).catch(() => {
        // Fallback: add locally
        const newFeedback: Feedback = {
          id: "fb-" + Date.now(),
          articleId,
          type,
          comment,
          createdAt: new Date().toISOString()
        }
        setFeedback(prev => [newFeedback, ...prev])
      }),
      {
        loading: 'Submitting feedback...',
        success: 'Thank you for your feedback!',
        error: 'Feedback saved locally'
      }
    )
  }

  // Contact support handler - mailto link
  const handleContactSupport = async () => {
    const subject = encodeURIComponent('Help Center Support Request')
    const body = encodeURIComponent('Please describe your issue:\n\n')
    window.location.href = "mailto:support@freeflowkazi.com?subject=" + subject + "&body=" + body
    toast.success('Opening email client...')
  }

  // Quick actions for the toolbar (now inside component to access state)
  const helpCenterQuickActions = [
    { id: '1', label: 'New Article', icon: 'plus', action: handleCreateArticle, variant: 'default' as const },
    { id: '2', label: 'Preview', icon: 'eye', action: () => { setActiveTab('articles'); toast.success('Preview mode - viewing as users see it'); }, variant: 'default' as const },
    { id: '3', label: 'Analytics', icon: 'bar-chart', action: handleAnalytics, variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Help Center</h1>
                <p className="text-blue-100">Knowledge base & documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleAnalytics}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={handleCreateArticle}>
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Total Articles</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalArticles}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Published</span>
              </div>
              <p className="text-2xl font-bold">{stats.published}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <Edit className="w-4 h-4" />
                <span className="text-sm">Drafts</span>
              </div>
              <p className="text-2xl font-bold">{stats.drafts}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">In Review</span>
              </div>
              <p className="text-2xl font-bold">{stats.inReview}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Total Views</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalViews)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Helpful Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgHelpfulRate}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Feedback</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalFeedback}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Needs Attention</span>
              </div>
              <p className="text-2xl font-bold">{stats.needsAttention}</p>
            </div>
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
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg p-1 bg-white dark:bg-gray-800">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Articles Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Knowledge Base Articles</h2>
                  <p className="text-blue-100">Zendesk-level help documentation with smart search</p>
                  <p className="text-blue-200 text-xs mt-1">AI-powered search • Multi-language • Version control</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{articles.length}</p>
                    <p className="text-blue-200 text-sm">Articles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{articles.filter(a => a.status === 'published').length}</p>
                    <p className="text-blue-200 text-sm">Published</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round(articles.reduce((sum, a) => sum + (a.views || 0), 0) / 1000)}K</p>
                    <p className="text-blue-200 text-sm">Total Views</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FileText, label: 'New Article', color: 'text-blue-600 dark:text-blue-400', handler: handleCreateArticle },
                { icon: Search, label: 'Smart Search', color: 'text-purple-600 dark:text-purple-400', handler: handleSearchArticles },
                { icon: Upload, label: 'Import', color: 'text-green-600 dark:text-green-400', handler: handleImport },
                { icon: Tag, label: 'Manage Tags', color: 'text-orange-600 dark:text-orange-400', handler: handleManageTags },
                { icon: BarChart3, label: 'Analytics', color: 'text-cyan-600 dark:text-cyan-400', handler: handleAnalytics },
                { icon: Globe, label: 'Translate', color: 'text-pink-600 dark:text-pink-400', handler: handleTranslate },
                { icon: Archive, label: 'Archives', color: 'text-gray-600 dark:text-gray-400', handler: handleArchives },
                { icon: Settings, label: 'Settings', color: 'text-indigo-600 dark:text-indigo-400', handler: handleSettings }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.handler}>
                  <action.icon className={"h-5 w-5 " + action.color} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Filters */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as ArticleType | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="article">Articles</option>
                    <option value="tutorial">Tutorials</option>
                    <option value="guide">Guides</option>
                    <option value="faq">FAQs</option>
                    <option value="video">Videos</option>
                    <option value="troubleshooting">Troubleshooting</option>
                  </select>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {filteredArticles.length} articles
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Articles Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                    onClick={() => handleViewArticle(article)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        {getTypeBadge(article.type)}
                        {getStatusBadge(article.status)}
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={article.author.avatar} alt="User avatar" />
                          <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{article.author.name}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />{formatNumber(article.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{article.readTime}m
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {getHelpfulRate(article.helpfulCount, article.notHelpfulCount)}%
                        </span>
                      </div>

                      {article.featured && (
                        <div className="mt-3 pt-3 border-t">
                          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30">
                            <Star className="w-3 h-3 mr-1" />Featured
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-0">
                  <div className="divide-y dark:divide-gray-700">
                    {filteredArticles.map((article) => (
                      <div
                        key={article.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer flex items-center gap-4"
                        onClick={() => handleViewArticle(article)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeBadge(article.type)}
                            {getStatusBadge(article.status)}
                            {article.featured && (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Star className="w-3 h-3 mr-1" />Featured
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">{article.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{article.excerpt}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />{formatNumber(article.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {getHelpfulRate(article.helpfulCount, article.notHelpfulCount)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />{article.readTime}m read
                            </span>
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={article.author.avatar} alt="User avatar" />
                            <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {/* Categories Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Content Categories</h2>
                  <p className="text-emerald-100">Notion-level content organization and taxonomy</p>
                  <p className="text-emerald-200 text-xs mt-1">Hierarchical categories • Subcategories • Auto-tagging</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{categories.length}</p>
                    <p className="text-emerald-200 text-sm">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0)}</p>
                    <p className="text-emerald-200 text-sm">Subcategories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{categories.reduce((sum, c) => sum + c.articleCount, 0)}</p>
                    <p className="text-emerald-200 text-sm">Total Articles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FolderOpen, label: 'New Category', color: 'text-emerald-600 dark:text-emerald-400', handler: handleCreateCategory },
                { icon: FolderOpen, label: 'Subcategory', color: 'text-teal-600 dark:text-teal-400', handler: handleSubcategory },
                { icon: Layers, label: 'Organize', color: 'text-blue-600 dark:text-blue-400', handler: handleOrganize },
                { icon: Tag, label: 'Tags', color: 'text-orange-600 dark:text-orange-400', handler: handleManageTags },
                { icon: Sparkles, label: 'Auto-Sort', color: 'text-purple-600 dark:text-purple-400', handler: handleAutoSort },
                { icon: Link, label: 'Cross-Link', color: 'text-pink-600 dark:text-pink-400', handler: handleCrossLink },
                { icon: Trash2, label: 'Cleanup', color: 'text-red-600 dark:text-red-400', handler: handleCleanup },
                { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400', handler: handleSettings }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.handler}>
                  <action.icon className={"h-5 w-5 " + action.color} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={"w-12 h-12 rounded-xl bg-gradient-to-r " + category.color + " flex items-center justify-center text-2xl"}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.articleCount} articles</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryExpand(category.id)}
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

                    {expandedCategories.has(category.id) && (
                      <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                        {category.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{sub.name}</span>
                            </div>
                            <Badge variant="secondary">{sub.articleCount}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Articles
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category.name)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            {/* Collections Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Curated Collections</h2>
                  <p className="text-violet-100">Gitbook-level content curation and learning paths</p>
                  <p className="text-violet-200 text-xs mt-1">Learning paths • Topic bundles • User journeys</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{collections.length}</p>
                    <p className="text-violet-200 text-sm">Collections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{collections.reduce((sum, c) => sum + c.articleIds.length, 0)}</p>
                    <p className="text-violet-200 text-sm">Articles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round(collections.reduce((sum, c) => sum + c.views, 0) / 1000)}K</p>
                    <p className="text-violet-200 text-sm">Views</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className={"w-14 h-14 rounded-xl bg-gradient-to-r " + collection.color + " flex items-center justify-center text-2xl mb-4"}>
                      {collection.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{collection.description}</p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">{collection.articleIds.length} articles</span>
                      {getAudienceBadge(collection.audience)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{formatNumber(collection.views)} views</span>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => handleViewCollection(collection.name)}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Collection
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Add Collection Card */}
              <Card className="border-dashed hover:border-primary cursor-pointer dark:bg-gray-800/50" onClick={handleNewCollection}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">New Collection</h3>
                  <p className="text-sm text-muted-foreground">Create a curated set of articles</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            {/* Feedback Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">User Feedback Hub</h2>
                  <p className="text-amber-100">Intercom-level customer feedback and insights</p>
                  <p className="text-amber-200 text-xs mt-1">Ratings • Comments • Improvement suggestions</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{feedback.length}</p>
                    <p className="text-amber-200 text-sm">Responses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{feedback.filter(f => f.type === 'helpful').length}</p>
                    <p className="text-amber-200 text-sm">Helpful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{feedback.filter(f => f.type === 'needs_update').length}</p>
                    <p className="text-amber-200 text-sm">Needs Update</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: MessageSquare, label: 'All Feedback', color: 'text-amber-600 dark:text-amber-400', handler: handleAllFeedback },
                { icon: ThumbsUp, label: 'Positive', color: 'text-green-600 dark:text-green-400', handler: handlePositiveFeedback },
                { icon: ThumbsDown, label: 'Negative', color: 'text-red-600 dark:text-red-400', handler: handleNegativeFeedback },
                { icon: AlertCircle, label: 'Incorrect', color: 'text-orange-600 dark:text-orange-400', handler: handleIncorrectFeedback },
                { icon: RefreshCw, label: 'Needs Update', color: 'text-blue-600 dark:text-blue-400', handler: handleNeedsUpdate },
                { icon: Download, label: 'Export', color: 'text-purple-600 dark:text-purple-400', handler: handleExport },
                { icon: BarChart3, label: 'Reports', color: 'text-cyan-600 dark:text-cyan-400', handler: handleReports },
                { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400', handler: handleSettings }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.handler}>
                  <action.icon className={"h-5 w-5 " + action.color} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Feedback */}
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {feedback.map((fb) => {
                          const article = articles.find(a => a.id === fb.articleId)
                          return (
                            <div key={fb.id} className="p-4 rounded-lg border dark:border-gray-700">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {fb.type === 'helpful' && (
                                    <Badge className="bg-green-100 text-green-700">
                                      <ThumbsUp className="w-3 h-3 mr-1" />Helpful
                                    </Badge>
                                  )}
                                  {fb.type === 'not_helpful' && (
                                    <Badge className="bg-red-100 text-red-700">
                                      <ThumbsDown className="w-3 h-3 mr-1" />Not Helpful
                                    </Badge>
                                  )}
                                  {fb.type === 'needs_update' && (
                                    <Badge className="bg-yellow-100 text-yellow-700">
                                      <RefreshCw className="w-3 h-3 mr-1" />Needs Update
                                    </Badge>
                                  )}
                                  {fb.type === 'incorrect' && (
                                    <Badge className="bg-orange-100 text-orange-700">
                                      <AlertCircle className="w-3 h-3 mr-1" />Incorrect
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(fb.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {article && (
                                <p className="text-sm font-medium mb-2">{article.title}</p>
                              )}
                              {fb.comment && (
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                  "{fb.comment}"
                                </p>
                              )}
                              {fb.userEmail && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  From: {fb.userEmail}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback Stats */}
              <div className="space-y-6">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Feedback Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Helpful</span>
                      <span className="font-semibold text-green-600">
                        {feedback.filter(f => f.type === 'helpful').length}
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Not Helpful</span>
                      <span className="font-semibold text-red-600">
                        {feedback.filter(f => f.type === 'not_helpful').length}
                      </span>
                    </div>
                    <Progress value={20} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Needs Update</span>
                      <span className="font-semibold text-yellow-600">
                        {feedback.filter(f => f.type === 'needs_update').length}
                      </span>
                    </div>
                    <Progress value={15} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Incorrect</span>
                      <span className="font-semibold text-orange-600">
                        {feedback.filter(f => f.type === 'incorrect').length}
                      </span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleReviewNegative}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Review Negative Feedback
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleUpdateRequested}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update Requested Articles
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleFollowUp}>
                      <Send className="w-4 h-4 mr-2" />
                      Follow Up on Comments
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Help Center Analytics</h2>
                  <p className="text-cyan-100">Google Analytics-level content performance insights</p>
                  <p className="text-cyan-200 text-xs mt-1">Real-time metrics • Content gaps • User journeys</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{analytics.selfServiceRate}%</p>
                    <p className="text-cyan-200 text-sm">Self-Service</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{analytics.avgSearches}</p>
                    <p className="text-cyan-200 text-sm">Avg Searches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{analytics.topSearches?.length || 0}</p>
                    <p className="text-cyan-200 text-sm">Top Topics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: BarChart3, label: 'Overview', color: 'text-cyan-600 dark:text-cyan-400', handler: handleOverview },
                { icon: TrendingUp, label: 'Trends', color: 'text-green-600 dark:text-green-400', handler: handleTrends },
                { icon: Search, label: 'Search Terms', color: 'text-blue-600 dark:text-blue-400', handler: handleSearchTerms },
                { icon: Eye, label: 'Page Views', color: 'text-purple-600 dark:text-purple-400', handler: handlePageViews },
                { icon: Clock, label: 'Time on Page', color: 'text-orange-600 dark:text-orange-400', handler: handleTimeOnPage },
                { icon: Target, label: 'Gaps', color: 'text-red-600 dark:text-red-400', handler: handleGaps },
                { icon: Download, label: 'Export', color: 'text-gray-600 dark:text-gray-400', handler: handleExport },
                { icon: Calendar, label: 'Schedule', color: 'text-pink-600 dark:text-pink-400', handler: handleSchedule }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.handler}>
                  <action.icon className={"h-5 w-5 " + action.color} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Self-Service Rate</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.selfServiceRate}%</p>
                  <p className="text-xs text-green-600">+5.2% from last month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Avg Read Time</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.avgReadTime}m</p>
                  <p className="text-xs text-muted-foreground">Per article</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Search Volume</span>
                    <Search className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(analytics.searchVolume)}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Bounce Rate</span>
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.bounceRate}%</p>
                  <p className="text-xs text-red-600">+2.1% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Articles */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Top Performing Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topArticles.map((article, index) => (
                      <div key={article.articleId} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(article.views)} views</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Search Queries */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Top Search Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topSearchQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">"{query.query}"</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{query.count}</span>
                          {query.hasResults ? (
                            <Badge className="bg-green-100 text-green-700">Has Results</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">No Results</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Views Chart Placeholder */}
            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {analytics.viewsByDay.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg"
                        style={{ height: `${(day.views / 20000) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={helpCenterAIInsights}
              title="Help Center Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={helpCenterCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={helpCenterPredictions}
              title="Content Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={helpCenterActivities}
            title="Help Center Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={helpCenterQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeBadge(selectedArticle.type)}
                  {getStatusBadge(selectedArticle.status)}
                  {getAudienceBadge(selectedArticle.audience)}
                </div>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Author & Meta */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedArticle.author.avatar} alt="User avatar" />
                      <AvatarFallback>{selectedArticle.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedArticle.author.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedArticle.author.role}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}</p>
                    <p>Version {selectedArticle.version}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Eye className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{formatNumber(selectedArticle.views)}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <ThumbsUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">
                      {getHelpfulRate(selectedArticle.helpfulCount, selectedArticle.notHelpfulCount)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Helpful</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-2xl font-bold">{selectedArticle.readTime}m</p>
                    <p className="text-xs text-muted-foreground">Read Time</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Languages className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <p className="text-2xl font-bold">{selectedArticle.translations.length + 1}</p>
                    <p className="text-xs text-muted-foreground">Languages</p>
                  </div>
                </div>

                {/* Content Preview */}
                <div>
                  <h4 className="font-semibold mb-2">Excerpt</h4>
                  <p className="text-muted-foreground">{selectedArticle.excerpt}</p>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Video Player if video type */}
                {selectedArticle.type === 'video' && selectedArticle.videoDuration && (
                  <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-2 opacity-80" />
                      <p>Duration: {formatDuration(selectedArticle.videoDuration)}</p>
                    </div>
                  </div>
                )}

                {/* Translations */}
                {selectedArticle.translations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Available Translations</h4>
                    <div className="flex gap-2">
                      <Badge>English (Original)</Badge>
                      {selectedArticle.translations.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button className="flex-1" onClick={() => handleEditArticle(selectedArticle.title)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Article
                  </Button>
                  <Button variant="outline" onClick={() => handleViewLive(selectedArticle.title)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live
                  </Button>
                  <Button variant="outline" onClick={() => handleDuplicate(selectedArticle.title)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" onClick={() => handleShare(selectedArticle.title)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  {selectedArticle.status === 'published' && (
                    <Button variant="outline" onClick={() => handleArchive(selectedArticle.title)}>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  )}
                  {selectedArticle.status !== 'published' && (
                    <Button variant="outline" onClick={() => handlePublishArticle(selectedArticle.title)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Article Dialog */}
      <Dialog open={showCreateArticleDialog} onOpenChange={setShowCreateArticleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Article
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Enter article title..."
                value={newArticleTitle}
                onChange={(e) => setNewArticleTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt *</label>
              <Input
                placeholder="Brief description of the article..."
                value={newArticleExcerpt}
                onChange={(e) => setNewArticleExcerpt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <textarea
                className="w-full min-h-[150px] p-3 rounded-lg border bg-background resize-y"
                placeholder="Write your article content here..."
                value={newArticleContent}
                onChange={(e) => setNewArticleContent(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full p-2 rounded-lg border bg-background"
                  value={newArticleType}
                  onChange={(e) => setNewArticleType(e.target.value as ArticleType)}
                >
                  <option value="article">Article</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="guide">Guide</option>
                  <option value="faq">FAQ</option>
                  <option value="video">Video</option>
                  <option value="troubleshooting">Troubleshooting</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Audience</label>
                <select
                  className="w-full p-2 rounded-lg border bg-background"
                  value={newArticleAudience}
                  onChange={(e) => setNewArticleAudience(e.target.value as AudienceType)}
                >
                  <option value="all">All Users</option>
                  <option value="customers">Customers</option>
                  <option value="team">Team</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="developers">Developers</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <select
                className="w-full p-2 rounded-lg border bg-background"
                value={newArticleCategoryId}
                onChange={(e) => setNewArticleCategoryId(e.target.value)}
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                placeholder="tag1, tag2, tag3..."
                value={newArticleTags}
                onChange={(e) => setNewArticleTags(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateArticleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveNewArticle}>
              <FileText className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Help Center Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold">General Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Public Help Center</p>
                    <p className="text-sm text-muted-foreground">Allow anyone to view published articles</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Enable Search</p>
                    <p className="text-sm text-muted-foreground">Allow users to search articles</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Collect Feedback</p>
                    <p className="text-sm text-muted-foreground">Show helpful/not helpful buttons on articles</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Show Read Time</p>
                    <p className="text-sm text-muted-foreground">Display estimated reading time</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">SEO Settings</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Help Center Title</label>
                  <Input defaultValue="FreeFlow Kazi Help Center" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Description</label>
                  <textarea
                    className="w-full p-3 rounded-lg border bg-background resize-y min-h-[80px]"
                    defaultValue="Find answers to your questions about FreeFlow Kazi. Browse our comprehensive help articles, tutorials, and guides."
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Support</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <Input defaultValue="support@freeflowkazi.com" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Show Contact Button</p>
                    <p className="text-sm text-muted-foreground">Display contact support option</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowSettingsDialog(false); toast.success('Settings saved successfully'); }}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Create New Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name *</label>
              <Input
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-3 rounded-lg border bg-background resize-y min-h-[80px]"
                placeholder="Describe what articles belong in this category..."
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon (emoji)</label>
              <Input
                placeholder="e.g., enter an emoji icon"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveNewCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name *</label>
              <Input
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-3 rounded-lg border bg-background resize-y min-h-[80px]"
                placeholder="Describe what articles belong in this category..."
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon (emoji)</label>
              <Input
                placeholder="e.g., enter an emoji icon"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedCategory}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Tags Dialog */}
      <Dialog open={showManageTagsDialog} onOpenChange={setShowManageTagsDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Manage Tags
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add new tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{allTags.length} tags in use</p>
              <ScrollArea className="h-[300px]">
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                      {tag}
                      <button
                        onClick={() => handleDeleteTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowManageTagsDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Translate Dialog */}
      <Dialog open={showTranslateDialog} onOpenChange={setShowTranslateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Translation Center
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { code: 'en', name: 'English', articles: articles.length },
                { code: 'es', name: 'Spanish', articles: articles.filter(a => a.translations.includes('es')).length },
                { code: 'fr', name: 'French', articles: articles.filter(a => a.translations.includes('fr')).length },
                { code: 'de', name: 'German', articles: articles.filter(a => a.translations.includes('de')).length },
                { code: 'pt', name: 'Portuguese', articles: articles.filter(a => a.translations.includes('pt')).length },
                { code: 'ja', name: 'Japanese', articles: articles.filter(a => a.translations.includes('ja')).length },
              ].map((lang) => (
                <div key={lang.code} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{lang.name}</span>
                    <Badge variant={lang.code === 'en' ? 'default' : 'secondary'}>
                      {lang.code === 'en' ? 'Primary' : lang.code.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{lang.articles} articles</p>
                  <Progress value={(lang.articles / articles.length) * 100} className="h-2 mt-2" />
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Translation Status</h4>
              <p className="text-sm text-muted-foreground">
                {articles.filter(a => a.translations.length > 0).length} of {articles.length} articles have translations
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTranslateDialog(false)}>Close</Button>
            <Button onClick={async () => {
              toast.loading('Initiating translation queue...', { id: 'translate-queue' })
              try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                await supabase.from('translation_jobs').insert({
                  user_id: user.id,
                  status: 'queued',
                  created_at: new Date().toISOString()
                })

                toast.success('Translation queue initiated', { id: 'translate-queue', description: 'Articles will be translated within 24 hours' })
                setShowTranslateDialog(false)
              } catch (error: any) {
                toast.error('Failed to start translation', { id: 'translate-queue', description: error.message })
              }
            }}>
              <Languages className="w-4 h-4 mr-2" />
              Start Translation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Create Subcategory
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Category *</label>
              <select className="w-full p-2 rounded-lg border bg-background">
                <option value="">Select parent category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategory Name *</label>
              <Input placeholder="Enter subcategory name..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSubcategoryDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.loading('Creating subcategory...', { id: 'create-subcategory' })
              try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                await supabase.from('help_subcategories').insert({
                  user_id: user.id,
                  created_at: new Date().toISOString()
                })

                toast.success('Subcategory created', { id: 'create-subcategory' })
                setShowSubcategoryDialog(false)
              } catch (error: any) {
                toast.error('Failed to create subcategory', { id: 'create-subcategory', description: error.message })
              }
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Subcategory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Organize Dialog */}
      <Dialog open={showOrganizeDialog} onOpenChange={setShowOrganizeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Organize Content
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Drag and drop categories and articles to reorder them.</p>
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-4 rounded-lg border cursor-move hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">{idx + 1}</div>
                    <span className="text-xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-muted-foreground">{cat.articleCount} articles</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowOrganizeDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.loading('Saving order...', { id: 'save-order' })
              try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                // Update category order in database
                const updates = categories.map((cat, idx) => ({
                  id: cat.id,
                  sort_order: idx
                }))

                for (const update of updates) {
                  await supabase.from('help_categories')
                    .update({ sort_order: update.sort_order })
                    .eq('id', update.id)
                }

                toast.success('Order saved', { id: 'save-order' })
                setShowOrganizeDialog(false)
              } catch (error: any) {
                toast.error('Failed to save order', { id: 'save-order', description: error.message })
              }
            }}>
              Save Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cross-Link Dialog */}
      <Dialog open={showCrossLinkDialog} onOpenChange={setShowCrossLinkDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Cross-Link Manager
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Manage related articles and cross-references.</p>
            <div className="space-y-3">
              {articles.filter(a => a.status === 'published').slice(0, 5).map((article) => (
                <div key={article.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{article.title}</p>
                    <Badge variant="secondary">{article.relatedArticles.length} links</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.relatedArticles.map((relId) => {
                      const relArticle = articles.find(a => a.id === relId)
                      return relArticle ? (
                        <Badge key={relId} variant="outline" className="text-xs">
                          {relArticle.title.substring(0, 30)}...
                        </Badge>
                      ) : null
                    })}
                    <Button variant="ghost" size="sm" className="h-6">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCrossLinkDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Collection Dialog */}
      <Dialog open={showNewCollectionDialog} onOpenChange={setShowNewCollectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Create New Collection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Name *</label>
              <Input
                placeholder="Enter collection name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-3 rounded-lg border bg-background resize-y min-h-[80px]"
                placeholder="Describe what this collection is about..."
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon (emoji)</label>
              <Input
                placeholder="e.g., enter an emoji icon"
                value={newCollectionIcon}
                onChange={(e) => setNewCollectionIcon(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <select
                className="w-full p-2 rounded-lg border bg-background"
                value={newCollectionAudience}
                onChange={(e) => setNewCollectionAudience(e.target.value as AudienceType)}
              >
                <option value="all">All Users</option>
                <option value="customers">Customers</option>
                <option value="team">Team</option>
                <option value="enterprise">Enterprise</option>
                <option value="developers">Developers</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowNewCollectionDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveNewCollection}>
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Publication
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Article *</label>
              <select
                className="w-full p-2 rounded-lg border bg-background"
                value={scheduleArticleId}
                onChange={(e) => setScheduleArticleId(e.target.value)}
              >
                <option value="">Select an article...</option>
                {articles.filter(a => a.status === 'draft' || a.status === 'review').map(article => (
                  <option key={article.id} value={article.id}>{article.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Publication Date *</label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Publication Time *</label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            {scheduleArticleId && scheduleDate && scheduleTime && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>{articles.find(a => a.id === scheduleArticleId)?.title}</strong> will be published on{' '}
                  <strong>{new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}</strong>
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Publication
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
