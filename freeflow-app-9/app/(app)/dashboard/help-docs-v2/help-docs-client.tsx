'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Search, FileText, MessageCircle, ThumbsUp, ThumbsDown,
  ChevronRight, ChevronDown, Plus, Eye, Clock, Star, TrendingUp, Users,
  FolderOpen, Tag,
  Edit, AlertCircle, CheckCircle, Home, Layers, Settings,
  MessageSquare, Globe, Zap, Phone, Mail, Video, Headphones, Bot,
  BarChart3, Ticket, Languages, History, Send, Play, Download, Upload, RefreshCw, Bell, Archive,
  Loader2, Check, X
} from 'lucide-react'

// Import real button handlers
import {
  downloadAsJson,
  apiPost,
  apiCall
} from '@/lib/button-handlers'

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

// Database Types
interface DbHelpArticle {
  id: string
  user_id: string
  article_code: string
  title: string
  slug: string | null
  content: string | null
  excerpt: string | null
  category: string
  status: string
  published_at: string | null
  views: number
  helpful_count: number
  not_helpful_count: number
  read_time_minutes: number
  meta_title: string | null
  meta_description: string | null
  keywords: string[]
  featured_image: string | null
  attachments: any[]
  author_id: string | null
  author_name: string | null
  sort_order: number
  parent_id: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface DbHelpCategory {
  id: string
  user_id: string
  name: string
  slug: string | null
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  article_count: number
  is_visible: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Zendesk Help Center level types
type ArticleStatus = 'published' | 'draft' | 'archived' | 'review' | 'scheduled'
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
type TicketStatus = 'new' | 'open' | 'pending' | 'solved' | 'closed'
type ContentType = 'article' | 'faq' | 'video' | 'tutorial' | 'guide'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  section: string
  status: ArticleStatus
  contentType: ContentType
  author: { id: string; name: string; avatar: string; role: string }
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledFor?: string
  views: number
  helpfulVotes: number
  notHelpfulVotes: number
  comments: number
  tags: string[]
  isFeatured: boolean
  isPromoted: boolean
  isPinned: boolean
  relatedArticles: string[]
  language: string
  translations: string[]
  readTime: number
  version: number
  seoTitle?: string
  seoDescription?: string
  lastReviewedAt?: string
  reviewedBy?: string
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  articleCount: number
  sections: Section[]
  order: number
  isVisible: boolean
  parentId?: string
}

interface Section {
  id: string
  categoryId: string
  name: string
  description: string
  articleCount: number
  order: number
  isVisible: boolean
}

interface SupportTicket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  requester: { name: string; email: string; avatar: string }
  assignee?: { name: string; avatar: string }
  createdAt: string
  updatedAt: string
  firstResponseAt?: string
  solvedAt?: string
  satisfaction?: 'good' | 'bad'
  tags: string[]
  messages: TicketMessage[]
}

interface TicketMessage {
  id: string
  content: string
  author: { name: string; avatar: string; isAgent: boolean }
  createdAt: string
  isInternal: boolean
  attachments: { name: string; url: string; size: number }[]
}

interface CommunityPost {
  id: string
  title: string
  content: string
  author: { name: string; avatar: string; badge?: string }
  createdAt: string
  replies: number
  votes: number
  views: number
  isAnswered: boolean
  isSolved: boolean
  isPinned: boolean
  category: string
  tags: string[]
}

interface HelpCenterStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalViews: number
  avgSatisfaction: number
  searchQueries: number
  ticketsDeflected: number
  topSearches: { query: string; count: number }[]
  viewsTrend: number
  satisfactionTrend: number
}

interface ChatbotSession {
  id: string
  status: 'active' | 'resolved' | 'escalated'
  startedAt: string
  messages: { role: 'user' | 'bot'; content: string; timestamp: string }[]
  satisfaction?: number
  wasHelpful?: boolean
}

// Mock data
const mockCategories: Category[] = [
  {
    id: 'cat1', name: 'Getting Started', description: 'Learn the basics and set up your account', icon: '🚀', color: 'blue',
    articleCount: 24, sections: [
      { id: 's1', categoryId: 'cat1', name: 'Quick Start Guide', description: 'Get up and running in minutes', articleCount: 8, order: 1, isVisible: true },
      { id: 's2', categoryId: 'cat1', name: 'Account Setup', description: 'Configure your account settings', articleCount: 6, order: 2, isVisible: true },
      { id: 's3', categoryId: 'cat1', name: 'First Steps', description: 'Your first actions in the platform', articleCount: 10, order: 3, isVisible: true }
    ], order: 1, isVisible: true
  },
  {
    id: 'cat2', name: 'Billing & Payments', description: 'Manage subscriptions, invoices, and payments', icon: '💳', color: 'green',
    articleCount: 18, sections: [
      { id: 's4', categoryId: 'cat2', name: 'Subscription Plans', description: 'Compare and choose plans', articleCount: 5, order: 1, isVisible: true },
      { id: 's5', categoryId: 'cat2', name: 'Payment Methods', description: 'Add and manage payment methods', articleCount: 7, order: 2, isVisible: true },
      { id: 's6', categoryId: 'cat2', name: 'Invoices', description: 'View and download invoices', articleCount: 6, order: 3, isVisible: true }
    ], order: 2, isVisible: true
  },
  {
    id: 'cat3', name: 'Troubleshooting', description: 'Solve common problems and errors', icon: '🔧', color: 'orange',
    articleCount: 32, sections: [
      { id: 's7', categoryId: 'cat3', name: 'Common Issues', description: 'Solutions to frequent problems', articleCount: 15, order: 1, isVisible: true },
      { id: 's8', categoryId: 'cat3', name: 'Error Messages', description: 'Understanding error codes', articleCount: 12, order: 2, isVisible: true },
      { id: 's9', categoryId: 'cat3', name: 'Performance', description: 'Speed and optimization tips', articleCount: 5, order: 3, isVisible: true }
    ], order: 3, isVisible: true
  },
  {
    id: 'cat4', name: 'API & Developers', description: 'Technical documentation and API reference', icon: '👨‍💻', color: 'purple',
    articleCount: 45, sections: [
      { id: 's10', categoryId: 'cat4', name: 'API Reference', description: 'Complete API documentation', articleCount: 20, order: 1, isVisible: true },
      { id: 's11', categoryId: 'cat4', name: 'SDKs & Libraries', description: 'Official client libraries', articleCount: 15, order: 2, isVisible: true },
      { id: 's12', categoryId: 'cat4', name: 'Webhooks', description: 'Event notifications setup', articleCount: 10, order: 3, isVisible: true }
    ], order: 4, isVisible: true
  },
  {
    id: 'cat5', name: 'Best Practices', description: 'Tips and recommendations for success', icon: '⭐', color: 'amber',
    articleCount: 22, sections: [
      { id: 's13', categoryId: 'cat5', name: 'Security', description: 'Keep your account secure', articleCount: 8, order: 1, isVisible: true },
      { id: 's14', categoryId: 'cat5', name: 'Workflows', description: 'Optimize your processes', articleCount: 14, order: 2, isVisible: true }
    ], order: 5, isVisible: true
  },
  {
    id: 'cat6', name: 'Video Tutorials', description: 'Learn visually with step-by-step videos', icon: '🎬', color: 'red',
    articleCount: 35, sections: [
      { id: 's15', categoryId: 'cat6', name: 'Beginner Series', description: 'Start from scratch', articleCount: 15, order: 1, isVisible: true },
      { id: 's16', categoryId: 'cat6', name: 'Advanced Topics', description: 'Deep dive tutorials', articleCount: 20, order: 2, isVisible: true }
    ], order: 6, isVisible: true
  }
]

const mockArticles: Article[] = [
  {
    id: 'art1', title: 'How to create your first project', excerpt: 'Learn how to set up and configure your first project in just a few simple steps.',
    content: 'Full article content here...', category: 'Getting Started', section: 'Quick Start Guide', status: 'published', contentType: 'guide',
    author: { id: 'u1', name: 'Sarah Chen', avatar: '', role: 'Content Lead' }, createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-15T14:30:00Z', publishedAt: '2024-01-10T10:00:00Z',
    views: 12500, helpfulVotes: 450, notHelpfulVotes: 12, comments: 28, tags: ['getting-started', 'projects', 'setup'],
    isFeatured: true, isPromoted: true, isPinned: false, relatedArticles: ['art2', 'art3'], language: 'en', translations: ['es', 'fr', 'de'], readTime: 5, version: 3,
    seoTitle: 'Create Your First Project - Complete Guide', seoDescription: 'Step-by-step guide to creating your first project'
  },
  {
    id: 'art2', title: 'Understanding your billing dashboard', excerpt: 'A comprehensive guide to managing your subscription, viewing invoices, and updating payment methods.',
    content: 'Full article content here...', category: 'Billing & Payments', section: 'Subscription Plans', status: 'published', contentType: 'article',
    author: { id: 'u2', name: 'Mike Johnson', avatar: '', role: 'Support Lead' }, createdAt: '2024-01-08T09:00:00Z', updatedAt: '2024-01-14T11:00:00Z', publishedAt: '2024-01-08T09:00:00Z',
    views: 8900, helpfulVotes: 320, notHelpfulVotes: 8, comments: 15, tags: ['billing', 'payments', 'subscription'],
    isFeatured: false, isPromoted: false, isPinned: false, relatedArticles: ['art1'], language: 'en', translations: ['es'], readTime: 8, version: 2
  },
  {
    id: 'art3', title: 'Fixing "Connection Timeout" errors', excerpt: 'Step-by-step guide to diagnose and resolve connection timeout issues.',
    content: 'Full article content here...', category: 'Troubleshooting', section: 'Error Messages', status: 'published', contentType: 'article',
    author: { id: 'u3', name: 'Emma Davis', avatar: '', role: 'Technical Writer' }, createdAt: '2024-01-12T15:00:00Z', updatedAt: '2024-01-15T09:00:00Z', publishedAt: '2024-01-12T15:00:00Z',
    views: 15600, helpfulVotes: 580, notHelpfulVotes: 25, comments: 42, tags: ['errors', 'connection', 'troubleshooting'],
    isFeatured: true, isPromoted: false, isPinned: true, relatedArticles: ['art4'], language: 'en', translations: ['es', 'fr'], readTime: 6, version: 4
  },
  {
    id: 'art4', title: 'REST API Authentication Guide', excerpt: 'Learn how to authenticate your API requests using OAuth 2.0 and API keys.',
    content: 'Full article content here...', category: 'API & Developers', section: 'API Reference', status: 'published', contentType: 'tutorial',
    author: { id: 'u4', name: 'Alex Kim', avatar: '', role: 'Developer Advocate' }, createdAt: '2024-01-05T10:00:00Z', updatedAt: '2024-01-13T16:00:00Z', publishedAt: '2024-01-05T10:00:00Z',
    views: 22000, helpfulVotes: 890, notHelpfulVotes: 15, comments: 65, tags: ['api', 'authentication', 'oauth', 'security'],
    isFeatured: true, isPromoted: true, isPinned: false, relatedArticles: ['art5'], language: 'en', translations: ['es', 'fr', 'de', 'ja'], readTime: 12, version: 5
  },
  {
    id: 'art5', title: 'Security best practices for your account', excerpt: 'Essential security measures to protect your account and data.',
    content: 'Full article content here...', category: 'Best Practices', section: 'Security', status: 'published', contentType: 'guide',
    author: { id: 'u1', name: 'Sarah Chen', avatar: '', role: 'Content Lead' }, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-10T12:00:00Z', publishedAt: '2024-01-01T08:00:00Z',
    views: 9800, helpfulVotes: 410, notHelpfulVotes: 5, comments: 18, tags: ['security', 'best-practices', '2fa', 'passwords'],
    isFeatured: false, isPromoted: false, isPinned: false, relatedArticles: ['art4'], language: 'en', translations: ['es'], readTime: 7, version: 2
  },
  {
    id: 'art6', title: 'Getting Started with Webhooks', excerpt: 'Complete guide to setting up and managing webhooks for real-time notifications.',
    content: 'Full article content here...', category: 'API & Developers', section: 'Webhooks', status: 'draft', contentType: 'tutorial',
    author: { id: 'u4', name: 'Alex Kim', avatar: '', role: 'Developer Advocate' }, createdAt: '2024-01-16T10:00:00Z', updatedAt: '2024-01-16T14:00:00Z',
    views: 0, helpfulVotes: 0, notHelpfulVotes: 0, comments: 0, tags: ['webhooks', 'api', 'events'],
    isFeatured: false, isPromoted: false, isPinned: false, relatedArticles: ['art4'], language: 'en', translations: [], readTime: 10, version: 1
  }
]

const mockTickets: SupportTicket[] = [
  {
    id: 'TKT-1001', subject: 'Unable to access billing dashboard', description: 'I cannot access my billing information',
    status: 'open', priority: 'high', category: 'Billing', requester: { name: 'John Smith', email: 'john@example.com', avatar: '' },
    assignee: { name: 'Mike Johnson', avatar: '' }, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T14:00:00Z',
    firstResponseAt: '2024-01-15T10:30:00Z', tags: ['billing', 'access'], messages: [
      { id: 'm1', content: 'I cannot access my billing dashboard. It shows a 403 error.', author: { name: 'John Smith', avatar: '', isAgent: false }, createdAt: '2024-01-15T10:00:00Z', isInternal: false, attachments: [] },
      { id: 'm2', content: 'Thanks for reaching out. Let me check your account permissions.', author: { name: 'Mike Johnson', avatar: '', isAgent: true }, createdAt: '2024-01-15T10:30:00Z', isInternal: false, attachments: [] }
    ]
  },
  {
    id: 'TKT-1002', subject: 'API rate limit exceeded', description: 'Getting rate limit errors on production',
    status: 'pending', priority: 'urgent', category: 'API', requester: { name: 'Jane Doe', email: 'jane@example.com', avatar: '' },
    assignee: { name: 'Alex Kim', avatar: '' }, createdAt: '2024-01-14T15:00:00Z', updatedAt: '2024-01-15T09:00:00Z',
    firstResponseAt: '2024-01-14T15:15:00Z', tags: ['api', 'rate-limit'], messages: []
  },
  {
    id: 'TKT-1003', subject: 'Feature request: Dark mode', description: 'Would love dark mode support',
    status: 'solved', priority: 'low', category: 'Feature Request', requester: { name: 'Bob Wilson', email: 'bob@example.com', avatar: '' },
    createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-12T16:00:00Z', solvedAt: '2024-01-12T16:00:00Z',
    satisfaction: 'good', tags: ['feature-request', 'ui'], messages: []
  }
]

const mockCommunityPosts: CommunityPost[] = [
  { id: 'cp1', title: 'How do I integrate with Slack?', content: 'Looking for guidance on Slack integration...', author: { name: 'John Doe', avatar: '', badge: 'Power User' }, createdAt: '2024-01-15T10:00:00Z', replies: 5, votes: 12, views: 245, isAnswered: true, isSolved: true, isPinned: false, category: 'Integrations', tags: ['slack', 'integration'] },
  { id: 'cp2', title: 'Best practices for team collaboration', content: 'What are your recommendations for team workflows?', author: { name: 'Jane Smith', avatar: '', badge: 'Contributor' }, createdAt: '2024-01-14T15:00:00Z', replies: 8, votes: 24, views: 412, isAnswered: true, isSolved: false, isPinned: true, category: 'Best Practices', tags: ['team', 'collaboration'] },
  { id: 'cp3', title: 'Feature request: Dark mode', content: 'Would love to see dark mode support...', author: { name: 'Bob Wilson', avatar: '' }, createdAt: '2024-01-13T09:00:00Z', replies: 15, votes: 89, views: 890, isAnswered: false, isSolved: false, isPinned: false, category: 'Feature Requests', tags: ['dark-mode', 'ui'] },
  { id: 'cp4', title: 'Tips for optimizing API performance', content: 'Sharing my experience with API optimization...', author: { name: 'Alex Kim', avatar: '', badge: 'Expert' }, createdAt: '2024-01-12T11:00:00Z', replies: 12, votes: 45, views: 678, isAnswered: false, isSolved: false, isPinned: true, category: 'Tips & Tricks', tags: ['api', 'performance'] }
]

const mockStats: HelpCenterStats = {
  totalArticles: 176, publishedArticles: 165, draftArticles: 11, totalViews: 245000, avgSatisfaction: 94.5,
  searchQueries: 12500, ticketsDeflected: 8900, viewsTrend: 12.5, satisfactionTrend: 2.3,
  topSearches: [
    { query: 'api authentication', count: 450 }, { query: 'billing', count: 380 },
    { query: 'connection timeout', count: 320 }, { query: 'webhook setup', count: 290 },
    { query: 'password reset', count: 245 }
  ]
}

const getStatusColor = (status: ArticleStatus): string => {
  const colors: Record<ArticleStatus, string> = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return colors[status]
}

const getTicketStatusColor = (status: TicketStatus): string => {
  const colors: Record<TicketStatus, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    open: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    solved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
  return colors[status]
}

const getPriorityColor = (priority: TicketPriority): string => {
  const colors: Record<TicketPriority, string> = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[priority]
}

const calculateHelpfulness = (helpful: number, notHelpful: number): number => {
  const total = helpful + notHelpful
  if (total === 0) return 0
  return Math.round((helpful / total) * 100)
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Enhanced Competitive Upgrade Mock Data
const mockHelpDocsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Self-Service Rate', description: '78% of users finding answers without tickets. Knowledge base effective.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Effectiveness' },
  { id: '2', type: 'info' as const, title: 'Popular Topics', description: '"API Authentication" searched 500+ times. Consider video tutorial.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Content' },
  { id: '3', type: 'warning' as const, title: 'Outdated Content', description: '12 articles flagged as potentially outdated. Review needed.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Maintenance' },
]

const mockHelpDocsCollaborators = [
  { id: '1', name: 'Docs Lead', avatar: '/avatars/docs.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Tech Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Writer' },
  { id: '3', name: 'Support Liaison', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const mockHelpDocsPredictions = [
  { id: '1', title: 'Ticket Deflection', prediction: '85% deflection rate achievable', confidence: 78, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Content Coverage', prediction: '95% topic coverage by Q2', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
]

const mockHelpDocsActivities = [
  { id: '1', user: 'Tech Writer', action: 'Published article', target: 'Getting Started Guide v2', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'AI Assistant', action: 'Suggested updates for', target: '5 outdated articles', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Analytics', action: 'Report generated', target: 'Monthly search trends', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockHelpDocsQuickActions = [
  { id: '1', label: 'New Article', icon: 'file-plus', action: async () => {
    const result = await apiPost('/api/help-docs/articles', { title: 'New Article Draft', status: 'draft' }, { loading: 'Creating new article...', success: 'Article draft created', error: 'Failed to create article' })
    return result
  }, variant: 'default' as const },
  { id: '2', label: 'Review Queue', icon: 'list', action: async () => {
    const result = await apiCall('/api/help-docs/articles?status=review', {}, { loading: 'Loading review queue...', success: '5 articles pending review', error: 'Failed to load review queue' })
    return result
  }, variant: 'default' as const },
  { id: '3', label: 'Analytics', icon: 'chart', action: async () => {
    const result = await apiCall('/api/help-docs/analytics', {}, { loading: 'Loading analytics...', success: 'Documentation analytics ready', error: 'Failed to load analytics' })
    return result
  }, variant: 'outline' as const },
]

export default function HelpDocsClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['cat1'])
  const [articleFilter, setArticleFilter] = useState<string>('all')
  const [ticketFilter, setTicketFilter] = useState<string>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Data State
  const [dbArticles, setDbArticles] = useState<DbHelpArticle[]>([])
  const [dbCategories, setDbCategories] = useState<DbHelpCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog State
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingArticle, setEditingArticle] = useState<DbHelpArticle | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'guide',
    status: 'draft',
    tags: '',
    meta_title: '',
    meta_description: ''
  })

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const stats = useMemo(() => ({
    totalArticles: mockArticles.length,
    totalCategories: mockCategories.length,
    totalViews: mockArticles.reduce((sum, a) => sum + a.views, 0),
    avgHelpfulness: mockArticles.filter(a => a.status === 'published').reduce((sum, a) => sum + calculateHelpfulness(a.helpfulVotes, a.notHelpfulVotes), 0) / mockArticles.filter(a => a.status === 'published').length,
    openTickets: mockTickets.filter(t => t.status === 'open' || t.status === 'new').length,
    pendingTickets: mockTickets.filter(t => t.status === 'pending').length
  }), [])

  const featuredArticles = mockArticles.filter(a => a.isFeatured && a.status === 'published')
  const popularArticles = [...mockArticles].filter(a => a.status === 'published').sort((a, b) => b.views - a.views).slice(0, 5)

  const filteredArticles = useMemo(() => {
    return mockArticles.filter(article => {
      if (articleFilter !== 'all' && article.status !== articleFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return article.title.toLowerCase().includes(query) ||
               article.excerpt.toLowerCase().includes(query) ||
               article.tags.some(t => t.toLowerCase().includes(query))
      }
      return true
    })
  }, [articleFilter, searchQuery])

  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      if (ticketFilter !== 'all' && ticket.status !== ticketFilter) return false
      return true
    })
  }, [ticketFilter])

  // Generate article code
  const generateArticleCode = () => `ART-${Date.now().toString(36).toUpperCase()}`

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Create article
  const handleCreateArticle = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create articles')
        return
      }

      const { error } = await supabase.from('help_articles').insert({
        user_id: user.id,
        article_code: generateArticleCode(),
        title: formData.title,
        content: formData.content || null,
        excerpt: formData.excerpt || null,
        category: formData.category,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        author_name: user.email?.split('@')[0] || 'Author',
        author_id: user.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      })

      if (error) throw error

      toast.success('Article created successfully')
      setShowCreateDialog(false)
      resetForm()
      fetchArticles()
    } catch (error) {
      console.error('Error creating article:', error)
      toast.error('Failed to create article')
    } finally {
      setIsSaving(false)
    }
  }

  // Update article
  const handleUpdateArticle = async () => {
    if (!editingArticle) return
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('help_articles')
        .update({
          title: formData.title,
          content: formData.content || null,
          excerpt: formData.excerpt || null,
          category: formData.category,
          status: formData.status,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          meta_title: formData.meta_title || null,
          meta_description: formData.meta_description || null,
          updated_at: new Date().toISOString(),
          published_at: formData.status === 'published' && !editingArticle.published_at ? new Date().toISOString() : editingArticle.published_at
        })
        .eq('id', editingArticle.id)

      if (error) throw error

      toast.success('Article updated successfully')
      setShowEditDialog(false)
      setEditingArticle(null)
      resetForm()
      fetchArticles()
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error('Failed to update article')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete article
  const handleDeleteArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('help_articles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', articleId)

      if (error) throw error

      toast.success('Article deleted successfully')
      fetchArticles()
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article')
    }
  }

  // Update article status
  const handleUpdateStatus = async (articleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('help_articles')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', articleId)

      if (error) throw error

      toast.success(`Article status updated to ${newStatus}`)
      fetchArticles()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Submit article feedback
  const handleSubmitFeedback = async (articleId: string, isHelpful: boolean) => {
    try {
      const article = dbArticles.find(a => a.id === articleId)
      if (!article) return

      const { error } = await supabase
        .from('help_articles')
        .update({
          helpful_count: isHelpful ? article.helpful_count + 1 : article.helpful_count,
          not_helpful_count: !isHelpful ? article.not_helpful_count + 1 : article.not_helpful_count
        })
        .eq('id', articleId)

      if (error) throw error

      toast.success('Thank you for your feedback!')
      fetchArticles()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    }
  }

  // Increment article views
  const handleIncrementViews = async (articleId: string) => {
    try {
      const article = dbArticles.find(a => a.id === articleId)
      if (!article) return

      await supabase
        .from('help_articles')
        .update({ views: article.views + 1 })
        .eq('id', articleId)
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'guide',
      status: 'draft',
      tags: '',
      meta_title: '',
      meta_description: ''
    })
  }

  // Open edit dialog
  const openEditDialog = (article: DbHelpArticle) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      content: article.content || '',
      excerpt: article.excerpt || '',
      category: article.category,
      status: article.status,
      tags: article.tags?.join(', ') || '',
      meta_title: article.meta_title || '',
      meta_description: article.meta_description || ''
    })
    setShowEditDialog(true)
  }

  // Load data on mount
  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  // Legacy handlers for UI compatibility
  const handleContactSupport = () => {
    setShowContactDialog(true)
  }

  const handleBookmarkArticle = async (articleId: string, articleTitle: string) => {
    await apiPost('/api/help-docs/bookmarks', { articleId, articleTitle }, {
      loading: 'Bookmarking article...',
      success: `"${articleTitle}" saved to bookmarks`,
      error: 'Failed to bookmark article'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/20 text-white border-white/30">Zendesk Help Center Level</Badge>
                <Badge className="bg-white/20 text-white border-white/30">AI-Powered Support</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">How can we help you?</h1>
              <p className="text-sky-100 text-lg">Search our knowledge base or browse categories below</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => setShowChatbot(true)}>
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => setShowContactDialog(true)}>
                <Headphones className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                placeholder="Search articles, guides, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 text-lg bg-white border-0 text-gray-900 placeholder:text-gray-400"
              />
              {searchQuery && (
                <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery('')}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {mockStats.topSearches.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm text-sky-100">
                <span>Popular:</span>
                {mockStats.topSearches.slice(0, 4).map(s => (
                  <button key={s.query} className="hover:text-white underline" onClick={() => setSearchQuery(s.query)}>
                    {s.query}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{mockStats.totalArticles}</div>
              <div className="text-xs text-sky-200">Articles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-500">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{mockStats.publishedArticles}</div>
              <div className="text-xs text-sky-200">Published</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{formatNumber(mockStats.totalViews)}</div>
              <div className="text-xs text-sky-200">Total Views</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500">
                  <ThumbsUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{mockStats.avgSatisfaction}%</div>
              <div className="text-xs text-sky-200">Satisfaction</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500">
                  <Search className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{formatNumber(mockStats.searchQueries)}</div>
              <div className="text-xs text-sky-200">Searches</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{formatNumber(mockStats.ticketsDeflected)}</div>
              <div className="text-xs text-sky-200">Deflected</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500">
                  <Ticket className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.openTickets}</div>
              <div className="text-xs text-sky-200">Open Tickets</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-500">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">+{mockStats.viewsTrend}%</div>
              <div className="text-xs text-sky-200">Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="home" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <Home className="w-4 h-4 mr-2" />Home
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <FolderOpen className="w-4 h-4 mr-2" />Categories
              </TabsTrigger>
              <TabsTrigger value="articles" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <FileText className="w-4 h-4 mr-2" />Articles
              </TabsTrigger>
              <TabsTrigger value="tickets" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <Ticket className="w-4 h-4 mr-2" />Tickets
              </TabsTrigger>
              <TabsTrigger value="community" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <Users className="w-4 h-4 mr-2" />Community
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <BarChart3 className="w-4 h-4 mr-2" />Analytics
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <Video className="w-4 h-4 mr-2" />Videos
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                <Settings className="w-4 h-4 mr-2" />Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-8">
            {/* Categories Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mockCategories.map(category => (
                  <Card
                    key={category.id}
                    className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-t-4"
                    style={{ borderTopColor: category.color === 'blue' ? '#3b82f6' : category.color === 'green' ? '#22c55e' : category.color === 'orange' ? '#f97316' : category.color === 'purple' ? '#a855f7' : category.color === 'amber' ? '#f59e0b' : '#ef4444' }}
                    onClick={() => { setSelectedCategory(category); setActiveTab('categories'); }}
                  >
                    <span className="text-4xl mb-3 block">{category.icon}</span>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.articleCount} articles</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Articles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Featured Articles</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('articles')}>View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredArticles.map(article => (
                  <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Star className="w-3 h-3 mr-1" />Featured
                      </Badge>
                      {article.isPromoted && <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Promoted</Badge>}
                      {article.isPinned && <Badge variant="outline">📌 Pinned</Badge>}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(article.views)}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{calculateHelpfulness(article.helpfulVotes, article.notHelpfulVotes)}%</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime} min</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Articles & Help */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
                <Card>
                  {popularArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${index < popularArticles.length - 1 ? 'border-b dark:border-gray-700' : ''}`}
                      onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}
                    >
                      <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 w-8">{index + 1}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{article.title}</h3>
                        <p className="text-sm text-gray-500">{article.category}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(article.views)} views</p>
                        <p className="text-gray-500">{calculateHelpfulness(article.helpfulVotes, article.notHelpfulVotes)}% helpful</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </Card>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
                <div className="space-y-4">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowChatbot(true)}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-sm text-gray-500">Get instant answers</p>
                      </div>
                    </div>
                    <Button className="w-full" size="sm" onClick={() => {
                      setShowChatbot(true)
                      toast.success('Chat session started')
                    }}>Start Chat</Button>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email Support</h3>
                        <p className="text-sm text-gray-500">Response in 24h</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="sm" onClick={() => {
                      window.location.href = 'mailto:support@freeflow.app?subject=Help%20Request'
                    }}>Send Email</Button>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Video Tutorials</h3>
                        <p className="text-sm text-gray-500">Learn visually</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="sm" onClick={() => setActiveTab('videos')}>Browse Videos</Button>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {/* Categories Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Knowledge Base Categories</h2>
                  <p className="text-blue-100">Organize and manage your help center content structure</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={async () => {
                    await apiPost('/api/help-docs/categories', { name: 'New Category' }, {
                      loading: 'Creating category...',
                      success: 'Category created',
                      error: 'Failed to create category'
                    })
                  }}>
                    <Plus className="w-4 h-4 mr-2" />Add Category
                  </Button>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={async () => {
                    await apiCall('/api/help-docs/structure', {}, {
                      loading: 'Loading structure manager...',
                      success: 'Structure manager loaded',
                      error: 'Failed to load structure manager'
                    })
                  }}>
                    <Settings className="w-4 h-4 mr-2" />Manage Structure
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockCategories.length}</div>
                  <div className="text-sm text-blue-100">Categories</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockCategories.reduce((acc, c) => acc + c.sections.length, 0)}</div>
                  <div className="text-sm text-blue-100">Sections</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockCategories.reduce((acc, c) => acc + c.articleCount, 0)}</div>
                  <div className="text-sm text-blue-100">Total Articles</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-blue-100">Content Coverage</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'New Category', desc: 'Create category', color: 'blue' },
                { icon: Layers, label: 'Reorder', desc: 'Change order', color: 'purple' },
                { icon: Archive, label: 'Archive', desc: 'Manage archived', color: 'orange' },
                { icon: Download, label: 'Export', desc: 'Export structure', color: 'green' }
              ].map(action => (
                <Card key={action.label} className="p-4 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-1">
                      {mockCategories.map(category => (
                        <div key={category.id}>
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedCategory?.id === category.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => { setSelectedCategory(category); toggleCategoryExpand(category.id); }}
                          >
                            <span>{category.icon}</span>
                            <span className="flex-1 font-medium text-gray-900 dark:text-white">{category.name}</span>
                            <Badge variant="outline" className="text-xs">{category.articleCount}</Badge>
                            {expandedCategories.includes(category.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                          {expandedCategories.includes(category.id) && (
                            <div className="ml-8 space-y-1 mt-1">
                              {category.sections.map(section => (
                                <div key={section.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm">
                                  <span className="text-gray-700 dark:text-gray-300">{section.name}</span>
                                  <span className="text-gray-500">{section.articleCount}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              <div className="col-span-3">
                {selectedCategory ? (
                  <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl">{selectedCategory.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCategory.name}</h2>
                        <p className="text-gray-500">{selectedCategory.description}</p>
                      </div>
                    </div>
                    {selectedCategory.sections.map(section => (
                      <div key={section.id} className="mb-6">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{section.name}</h3>
                        <div className="space-y-2">
                          {mockArticles.filter(a => a.section === section.name && a.status === 'published').map(article => (
                            <div
                              key={article.id}
                              className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{article.title}</h4>
                                  {article.translations.length > 0 && (
                                    <Badge variant="outline" className="text-xs"><Globe className="w-3 h-3 mr-1" />{article.translations.length + 1}</Badge>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{article.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Select a Category</h3>
                    <p className="text-gray-500">Choose a category from the left to view articles</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Articles Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Article Management</h2>
                  <p className="text-emerald-100">Create, edit, and publish knowledge base articles</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.json,.csv,.md'
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        toast.loading('Importing articles...')
                        const formData = new FormData()
                        formData.append('file', file)
                        try {
                          const res = await fetch('/api/help-docs/import', { method: 'POST', body: formData })
                          if (res.ok) {
                            toast.dismiss()
                            toast.success('Articles imported successfully')
                          } else {
                            toast.dismiss()
                            toast.error('Failed to import articles')
                          }
                        } catch {
                          toast.dismiss()
                          toast.error('Failed to import articles')
                        }
                      }
                    }
                    input.click()
                  }}>
                    <Upload className="w-4 h-4 mr-2" />Import
                  </Button>
                  <Button className="bg-white text-emerald-600 hover:bg-emerald-50" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />New Article
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{dbArticles.length || mockArticles.length}</div>
                  <div className="text-sm text-emerald-100">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockArticles.filter(a => a.status === 'published').length}</div>
                  <div className="text-sm text-emerald-100">Published</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockArticles.filter(a => a.status === 'draft').length}</div>
                  <div className="text-sm text-emerald-100">Drafts</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockArticles.filter(a => a.status === 'review').length}</div>
                  <div className="text-sm text-emerald-100">In Review</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(mockArticles.reduce((sum, a) => sum + a.views, 0))}</div>
                  <div className="text-sm text-emerald-100">Total Views</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-6 gap-4">
              {[
                { icon: Plus, label: 'New Article', color: 'emerald' },
                { icon: Edit, label: 'Edit Draft', color: 'blue' },
                { icon: Eye, label: 'Preview', color: 'purple' },
                { icon: Languages, label: 'Translate', color: 'orange' },
                { icon: History, label: 'Versions', color: 'gray' },
                { icon: Archive, label: 'Archive', color: 'red' }
              ].map(action => (
                <Card key={action.label} className="p-3 hover:shadow-lg transition-all cursor-pointer group text-center">
                  <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 mx-auto w-fit group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <p className="text-sm font-medium mt-2 text-gray-900 dark:text-white">{action.label}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Articles ({filteredArticles.length})</h2>
              <div className="flex items-center gap-2">
                <Select value={articleFilter} onValueChange={setArticleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />New Article
                </Button>
              </div>
            </div>

            <Card>
              <ScrollArea className="h-[600px]">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredArticles.map(article => (
                  <div
                    key={article.id}
                    className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => { setSelectedArticle(article); setShowArticleDialog(true); }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                          <Badge className={getStatusColor(article.status)}>{article.status}</Badge>
                          {article.isFeatured && <Star className="w-4 h-4 text-yellow-500" />}
                          {article.isPinned && <span className="text-sm">📌</span>}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{article.category} / {article.section}</span>
                          <span className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px]">{article.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            {article.author.name}
                          </span>
                          <span>v{article.version}</span>
                          <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(article.views)} views</p>
                        <p className="text-gray-500">{calculateHelpfulness(article.helpfulVotes, article.notHelpfulVotes)}% helpful</p>
                        {article.translations.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">{article.translations.length} translations</p>
                        )}
                      </div>
                    </div>
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {/* Tickets Overview Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Support Ticket Management</h2>
                  <p className="text-orange-100">Track, respond, and resolve customer support requests</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={async () => {
                    await apiCall('/api/help-docs/tickets/reports', {}, {
                      loading: 'Loading reports...',
                      success: 'Reports loaded',
                      error: 'Failed to load reports'
                    })
                  }}>
                    <BarChart3 className="w-4 h-4 mr-2" />Reports
                  </Button>
                  <Button className="bg-white text-orange-600 hover:bg-orange-50" onClick={async () => {
                    await apiPost('/api/help-docs/tickets', { status: 'new' }, {
                      loading: 'Creating new ticket...',
                      success: 'Ticket created',
                      error: 'Failed to create ticket'
                    })
                  }}>
                    <Plus className="w-4 h-4 mr-2" />New Ticket
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockTickets.length}</div>
                  <div className="text-sm text-orange-100">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockTickets.filter(t => t.status === 'new').length}</div>
                  <div className="text-sm text-orange-100">New</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockTickets.filter(t => t.status === 'open').length}</div>
                  <div className="text-sm text-orange-100">Open</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockTickets.filter(t => t.status === 'pending').length}</div>
                  <div className="text-sm text-orange-100">Pending</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockTickets.filter(t => t.status === 'solved').length}</div>
                  <div className="text-sm text-orange-100">Solved</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">2.5h</div>
                  <div className="text-sm text-orange-100">Avg Response</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: Plus, label: 'New Ticket', desc: 'Create ticket', color: 'orange' },
                { icon: Users, label: 'Assign', desc: 'Bulk assign', color: 'blue' },
                { icon: Tag, label: 'Tag', desc: 'Manage tags', color: 'purple' },
                { icon: Send, label: 'Respond', desc: 'Quick reply', color: 'green' },
                { icon: Archive, label: 'Close', desc: 'Close tickets', color: 'gray' }
              ].map(action => (
                <Card key={action.label} className="p-4 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Support Tickets</h2>
              <div className="flex items-center gap-2">
                <Select value={ticketFilter} onValueChange={setTicketFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={async () => {
                  await apiPost('/api/help-docs/tickets', { status: 'new' }, {
                    loading: 'Creating new ticket...',
                    success: 'Ticket created',
                    error: 'Failed to create ticket'
                  })
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Ticket
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-600">{mockTickets.filter(t => t.status === 'new').length}</div>
                <div className="text-sm text-gray-500">New</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{mockTickets.filter(t => t.status === 'open').length}</div>
                <div className="text-sm text-gray-500">Open</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-orange-600">{mockTickets.filter(t => t.status === 'pending').length}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-600">{mockTickets.filter(t => t.status === 'solved').length}</div>
                <div className="text-sm text-gray-500">Solved</div>
              </Card>
            </div>

            <Card>
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
                        <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status}</Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{ticket.requester.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {ticket.requester.name}
                        </span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.assignee && <span>Assigned to {ticket.assignee.name}</span>}
                      </div>
                    </div>
                    {ticket.satisfaction && (
                      <Badge className={ticket.satisfaction === 'good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {ticket.satisfaction === 'good' ? '👍' : '👎'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            {/* Community Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Community Forum</h2>
                  <p className="text-purple-100">Connect with users, share knowledge, and find solutions</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={async () => {
                    await apiCall('/api/help-docs/community/members', {}, {
                      loading: 'Loading members...',
                      success: 'Members list loaded',
                      error: 'Failed to load members'
                    })
                  }}>
                    <Users className="w-4 h-4 mr-2" />Members
                  </Button>
                  <Button className="bg-white text-purple-600 hover:bg-purple-50" onClick={async () => {
                    await apiPost('/api/help-docs/community/posts', { title: 'New Post' }, {
                      loading: 'Creating new post...',
                      success: 'Post created',
                      error: 'Failed to create post'
                    })
                  }}>
                    <Plus className="w-4 h-4 mr-2" />New Post
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockCommunityPosts.length}</div>
                  <div className="text-sm text-purple-100">Posts</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockCommunityPosts.filter(p => p.isSolved).length}</div>
                  <div className="text-sm text-purple-100">Solved</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockCommunityPosts.reduce((sum, p) => sum + p.replies, 0)}</div>
                  <div className="text-sm text-purple-100">Replies</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">3.4K</div>
                  <div className="text-sm text-purple-100">Active Users</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-sm text-purple-100">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: Plus, label: 'New Post', desc: 'Start discussion', color: 'purple' },
                { icon: MessageCircle, label: 'Reply', desc: 'Respond to posts', color: 'blue' },
                { icon: Star, label: 'Featured', desc: 'Feature posts', color: 'amber' },
                { icon: CheckCircle, label: 'Mark Solved', desc: 'Close threads', color: 'green' },
                { icon: AlertCircle, label: 'Moderate', desc: 'Review content', color: 'red' }
              ].map(action => (
                <Card key={action.label} className="p-4 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Community Discussions</h2>
              <Button onClick={async () => {
                await apiPost('/api/help-docs/community/posts', { title: 'New Post' }, {
                  loading: 'Creating new post...',
                  success: 'Post created',
                  error: 'Failed to create post'
                })
              }}><Plus className="w-4 h-4 mr-2" />New Post</Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                {mockCommunityPosts.map(post => (
                  <Card key={post.id} className={`p-4 ${post.isPinned ? 'border-amber-300 dark:border-amber-700' : ''}`}>
                    <div className="flex items-start gap-4">
                      <Avatar><AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && <Badge variant="outline" className="text-amber-600 border-amber-300">📌 Pinned</Badge>}
                          {post.isSolved && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><Check className="w-3 h-3 mr-1" />Solved</Badge>}
                          {post.isAnswered && !post.isSolved && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Answered</Badge>}
                          <Badge variant="outline" className="text-xs">{post.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            {post.author.name}
                            {post.author.badge && <Badge variant="outline" className="text-xs ml-1">{post.author.badge}</Badge>}
                          </span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.replies}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.votes}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Community Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Total Posts</span><span className="font-semibold">1,245</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Solved</span><span className="font-semibold text-green-600">892</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Active Users</span><span className="font-semibold">3,450</span></div>
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Top Contributors</h3>
                  <div className="space-y-3">
                    {['Sarah Chen', 'Mike Johnson', 'Alex Kim'].map((name, i) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-300">{i + 1}</span>
                        <Avatar className="h-8 w-8"><AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Help Center Analytics</h2>
                  <p className="text-cyan-100">Track performance, engagement, and customer satisfaction</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => {
                    downloadAsJson(mockStats, 'help-center-analytics.json')
                  }}>
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button className="bg-white text-cyan-600 hover:bg-cyan-50" onClick={async () => {
                    await apiCall('/api/help-docs/analytics', {}, {
                      loading: 'Refreshing analytics...',
                      success: 'Analytics refreshed',
                      error: 'Failed to refresh analytics'
                    })
                  }}>
                    <RefreshCw className="w-4 h-4 mr-2" />Refresh
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(mockStats.totalViews)}</div>
                  <div className="text-sm text-cyan-100">Total Views</div>
                  <div className="text-xs text-green-300 mt-1">↑ {mockStats.viewsTrend}%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{mockStats.avgSatisfaction}%</div>
                  <div className="text-sm text-cyan-100">Satisfaction</div>
                  <div className="text-xs text-green-300 mt-1">↑ {mockStats.satisfactionTrend}%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(mockStats.searchQueries)}</div>
                  <div className="text-sm text-cyan-100">Searches</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{formatNumber(mockStats.ticketsDeflected)}</div>
                  <div className="text-sm text-cyan-100">Deflected</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">4.2min</div>
                  <div className="text-sm text-cyan-100">Avg Read Time</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-sm text-cyan-100">Self-Service</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: BarChart3, label: 'View Reports', desc: 'Detailed analytics', color: 'cyan' },
                { icon: TrendingUp, label: 'Trends', desc: 'Performance trends', color: 'green' },
                { icon: Search, label: 'Search Analytics', desc: 'Query insights', color: 'blue' },
                { icon: Users, label: 'User Behavior', desc: 'Journey analytics', color: 'purple' },
                { icon: Download, label: 'Export Data', desc: 'Download reports', color: 'gray' }
              ].map(action => (
                <Card key={action.label} className="p-4 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="text-3xl font-bold text-blue-600">{formatNumber(mockStats.totalViews)}</div>
                <div className="text-sm text-gray-500">Total Views</div>
                <div className="text-xs text-green-600 mt-1">↑ {mockStats.viewsTrend}% vs last month</div>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-green-600">{mockStats.avgSatisfaction}%</div>
                <div className="text-sm text-gray-500">Satisfaction</div>
                <div className="text-xs text-green-600 mt-1">↑ {mockStats.satisfactionTrend}% vs last month</div>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-purple-600">{formatNumber(mockStats.searchQueries)}</div>
                <div className="text-sm text-gray-500">Search Queries</div>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-amber-600">{formatNumber(mockStats.ticketsDeflected)}</div>
                <div className="text-sm text-gray-500">Tickets Deflected</div>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Top Searches</h3>
                <div className="space-y-3">
                  {mockStats.topSearches.map((search, idx) => (
                    <div key={search.query} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300 w-6">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{search.query}</span>
                          <span className="text-sm text-gray-500">{search.count}</span>
                        </div>
                        <Progress value={(search.count / mockStats.topSearches[0].count) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Article Performance</h3>
                <div className="space-y-3">
                  {popularArticles.slice(0, 5).map(article => (
                    <div key={article.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium text-sm truncate flex-1">{article.title}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{formatNumber(article.views)} views</span>
                        <span className="text-green-600">{calculateHelpfulness(article.helpfulVotes, article.notHelpfulVotes)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            {/* Videos Overview Banner */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Video Learning Center</h2>
                  <p className="text-red-100">Create and manage video tutorials for your help center</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={async () => {
                    await apiPost('/api/help-docs/videos/livestream', { action: 'start' }, {
                      loading: 'Starting live stream...',
                      success: 'Live stream ready',
                      error: 'Failed to start live stream'
                    })
                  }}>
                    <Play className="w-4 h-4 mr-2" />Live Stream
                  </Button>
                  <Button className="bg-white text-red-600 hover:bg-red-50" onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'video/*'
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        toast.loading('Uploading video...')
                        const formData = new FormData()
                        formData.append('video', file)
                        try {
                          const res = await fetch('/api/help-docs/videos/upload', { method: 'POST', body: formData })
                          if (res.ok) {
                            toast.dismiss()
                            toast.success('Video uploaded successfully')
                          } else {
                            toast.dismiss()
                            toast.error('Failed to upload video')
                          }
                        } catch {
                          toast.dismiss()
                          toast.error('Failed to upload video')
                        }
                      }
                    }
                    input.click()
                  }}>
                    <Upload className="w-4 h-4 mr-2" />Upload Video
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">35</div>
                  <div className="text-sm text-red-100">Videos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">57.6K</div>
                  <div className="text-sm text-red-100">Total Views</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">12.5h</div>
                  <div className="text-sm text-red-100">Total Duration</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-sm text-red-100">Avg Rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-red-100">Completion</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: Upload, label: 'Upload', desc: 'Add new video', color: 'red' },
                { icon: Edit, label: 'Edit', desc: 'Modify videos', color: 'blue' },
                { icon: Layers, label: 'Playlist', desc: 'Create playlist', color: 'purple' },
                { icon: Languages, label: 'Subtitles', desc: 'Add captions', color: 'green' },
                { icon: BarChart3, label: 'Analytics', desc: 'View stats', color: 'cyan' }
              ].map(action => (
                <Card key={action.label} className="p-4 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video Tutorials</h2>
              <Button onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'video/*'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    toast.loading('Uploading video...')
                    const formData = new FormData()
                    formData.append('video', file)
                    try {
                      const res = await fetch('/api/help-docs/videos/upload', { method: 'POST', body: formData })
                      if (res.ok) {
                        toast.dismiss()
                        toast.success('Video uploaded successfully')
                      } else {
                        toast.dismiss()
                        toast.error('Failed to upload video')
                      }
                    } catch {
                      toast.dismiss()
                      toast.error('Failed to upload video')
                    }
                  }
                }
                input.click()
              }}><Upload className="w-4 h-4 mr-2" />Upload Video</Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { title: 'Getting Started Tutorial', duration: '5:32', views: 12500, category: 'Beginner' },
                { title: 'API Authentication Deep Dive', duration: '15:45', views: 8900, category: 'Advanced' },
                { title: 'Building Your First Integration', duration: '12:20', views: 6700, category: 'Intermediate' },
                { title: 'Dashboard Overview', duration: '8:15', views: 15200, category: 'Beginner' },
                { title: 'Advanced Workflow Automation', duration: '20:30', views: 4500, category: 'Advanced' },
                { title: 'Security Best Practices', duration: '10:45', views: 9800, category: 'All Levels' }
              ].map((video, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative">
                    <Play className="w-12 h-12 text-white opacity-80" />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{video.duration}</span>
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="text-xs mb-2">{video.category}</Badge>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{video.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatNumber(video.views)} views</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure your help center</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                        { id: 'content', icon: FileText, label: 'Content', desc: 'Article settings' },
                        { id: 'ai', icon: Bot, label: 'AI & Chatbot', desc: 'AI assistant' },
                        { id: 'languages', icon: Languages, label: 'Languages', desc: 'Translations' },
                        { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert preferences' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power settings' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
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
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        General Settings
                      </CardTitle>
                      <CardDescription>Configure basic help center settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Help Center Name</Label>
                          <Input defaultValue="Knowledge Base" placeholder="Your help center name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Support Email</Label>
                          <Input defaultValue="support@company.com" placeholder="support@example.com" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Help Center Description</Label>
                        <Input defaultValue="Find answers to your questions and get support" placeholder="Describe your help center" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Enable Help Center</h4>
                          <p className="text-sm text-gray-500">Make help center accessible to users</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Require Login</h4>
                          <p className="text-sm text-gray-500">Users must sign in to view articles</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Show Article Views</h4>
                          <p className="text-sm text-gray-500">Display view counts on articles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Enable Search Suggestions</h4>
                          <p className="text-sm text-gray-500">Show popular searches as users type</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Settings */}
                {settingsTab === 'content' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Content Settings
                      </CardTitle>
                      <CardDescription>Configure article and content preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Article Feedback</h4>
                          <p className="text-sm text-gray-500">Show "Was this helpful?" on articles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Allow Comments</h4>
                          <p className="text-sm text-gray-500">Enable comments on articles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Show Related Articles</h4>
                          <p className="text-sm text-gray-500">Display related content suggestions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Enable Version History</h4>
                          <p className="text-sm text-gray-500">Track article revisions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Community Features</h4>
                          <p className="text-sm text-gray-500">Enable community discussions and Q&A</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Auto-Archive Old Articles</h4>
                          <p className="text-sm text-gray-500">Archive articles after 12 months without updates</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI & Chatbot Settings */}
                {settingsTab === 'ai' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        AI & Chatbot Settings
                      </CardTitle>
                      <CardDescription>Configure AI assistant and chatbot features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Enable AI Assistant</h4>
                          <p className="text-sm text-gray-500">Allow users to chat with AI for instant help</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">AI-Powered Search</h4>
                          <p className="text-sm text-gray-500">Use AI to improve search results</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Auto-Suggest Articles</h4>
                          <p className="text-sm text-gray-500">AI suggests relevant articles during chat</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Smart Ticket Routing</h4>
                          <p className="text-sm text-gray-500">AI assigns tickets to appropriate agents</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Sentiment Analysis</h4>
                          <p className="text-sm text-gray-500">Analyze customer sentiment in tickets</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Auto-Generate FAQs</h4>
                          <p className="text-sm text-gray-500">AI creates FAQs from common queries</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Language Settings */}
                {settingsTab === 'languages' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="w-5 h-5 text-orange-600" />
                        Language Settings
                      </CardTitle>
                      <CardDescription>Configure multi-language support and translations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Multi-language Support</h4>
                          <p className="text-sm text-gray-500">Enable article translations</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Default Language</Label>
                          <Select defaultValue="en">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Fallback Language</Label>
                          <Select defaultValue="en">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label>Enabled Languages</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'].map(lang => (
                            <div key={lang} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Switch defaultChecked={lang === 'English' || lang === 'Spanish'} />
                              <span className="text-sm text-gray-900 dark:text-white">{lang}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Auto-Translate</h4>
                          <p className="text-sm text-gray-500">Automatically translate new articles</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notification Settings */}
                {settingsTab === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-600" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>Configure alert and notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">New Ticket Alerts</h4>
                          <p className="text-sm text-gray-500">Get notified when new tickets arrive</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Article Comments</h4>
                          <p className="text-sm text-gray-500">Notify when articles receive comments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Community Mentions</h4>
                          <p className="text-sm text-gray-500">Alert when mentioned in discussions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Negative Feedback</h4>
                          <p className="text-sm text-gray-500">Notify on negative article feedback</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Weekly Reports</h4>
                          <p className="text-sm text-gray-500">Receive weekly analytics summary</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Slack Integration</h4>
                          <p className="text-sm text-gray-500">Send notifications to Slack</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-red-600" />
                        Advanced Settings
                      </CardTitle>
                      <CardDescription>Configure power user settings and integrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">API Access</h4>
                          <p className="text-sm text-gray-500">Enable REST API access</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Custom Domain</h4>
                          <p className="text-sm text-gray-500">Use custom domain for help center</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">SSO Integration</h4>
                          <p className="text-sm text-gray-500">Enable single sign-on</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Custom CSS</h4>
                          <p className="text-sm text-gray-500">Add custom styling</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Webhooks</h4>
                          <p className="text-sm text-gray-500">Send events to external services</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Analytics Export</h4>
                          <p className="text-sm text-gray-500">Export analytics to third-party tools</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="pt-6 border-t dark:border-gray-700">
                        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-red-700 dark:text-red-400">Reset Help Center</h4>
                            <p className="text-sm text-red-600 dark:text-red-500">This will reset all settings to defaults</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={async () => {
                            if (confirm('Are you sure you want to reset all help center settings to defaults? This action cannot be undone.')) {
                              await apiPost('/api/help-docs/settings/reset', {}, {
                                loading: 'Resetting help center settings...',
                                success: 'Help center settings reset to defaults',
                                error: 'Failed to reset settings'
                              })
                            }
                          }}>
                            Reset
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockHelpDocsAIInsights}
              title="Help Center Intelligence"
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockHelpDocsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockHelpDocsPredictions}
              title="Documentation Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockHelpDocsActivities}
            title="Help Center Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockHelpDocsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Article Dialog */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          {selectedArticle && (
            <ScrollArea className="max-h-[75vh]">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(selectedArticle.status)}>{selectedArticle.status}</Badge>
                  {selectedArticle.isFeatured && <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>}
                  {selectedArticle.translations.length > 0 && (
                    <Badge variant="outline"><Globe className="w-3 h-3 mr-1" />{selectedArticle.translations.length + 1} languages</Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{selectedArticle.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    {selectedArticle.author.name} • {selectedArticle.author.role}
                  </span>
                  <span>v{selectedArticle.version}</span>
                  <span>Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                  <span>{selectedArticle.readTime} min read</span>
                </div>

                <div className="prose dark:prose-invert">
                  <p className="text-lg text-gray-600 dark:text-gray-400">{selectedArticle.excerpt}</p>
                  <p className="text-gray-500 mt-4">Full article content would be displayed here with rich formatting...</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedArticle.tags.map(tag => (<Badge key={tag} variant="outline">{tag}</Badge>))}
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Was this article helpful?</h4>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={async () => {
                      await apiPost('/api/help-docs/articles/feedback', { articleId: selectedArticle.id, helpful: true }, {
                        loading: 'Recording your feedback...',
                        success: 'Thank you for your feedback!',
                        error: 'Failed to submit feedback'
                      })
                    }}><ThumbsUp className="w-4 h-4 mr-2" />Yes ({selectedArticle.helpfulVotes})</Button>
                    <Button variant="outline" onClick={async () => {
                      await apiPost('/api/help-docs/articles/feedback', { articleId: selectedArticle.id, helpful: false }, {
                        loading: 'Recording your feedback...',
                        success: 'Thank you for your feedback. We will improve this article.',
                        error: 'Failed to submit feedback'
                      })
                    }}><ThumbsDown className="w-4 h-4 mr-2" />No ({selectedArticle.notHelpfulVotes})</Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(selectedArticle.views)} views</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{selectedArticle.comments} comments</span>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Contact Support</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { icon: Bot, title: 'AI Assistant', desc: 'Instant answers', color: 'blue' },
              { icon: MessageSquare, title: 'Live Chat', desc: 'Avg wait: 2 min', color: 'green' },
              { icon: Mail, title: 'Email', desc: 'Response: 24h', color: 'purple' },
              { icon: Phone, title: 'Phone', desc: '24/7 available', color: 'orange' }
            ].map(item => (
              <Card key={item.title} className="p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <item.icon className={`w-8 h-8 mx-auto mb-2 text-${item.color}-600`} />
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chatbot Dialog */}
      <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
        <DialogContent className="max-w-md h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />AI Assistant
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                <p className="text-sm">Hello! How can I help you today? You can ask me about:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Getting started guides</li>
                  <li>• Troubleshooting issues</li>
                  <li>• API documentation</li>
                  <li>• Billing questions</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <Input placeholder="Type your question..." className="flex-1" id="chat-input" />
              <Button onClick={async () => {
                const input = document.getElementById('chat-input') as HTMLInputElement
                const message = input?.value?.trim()
                if (!message) {
                  toast.error('Please enter a message')
                  return
                }
                await apiPost('/api/help-docs/chat', { message }, {
                  loading: 'Sending message...',
                  success: 'AI assistant responded',
                  error: 'Failed to send message'
                })
                if (input) input.value = ''
              }}><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Article Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
            <DialogDescription>Add a new article to your knowledge base</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the article"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Article content..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., getting-started, api, tutorial"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreateArticle} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>Update article details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Excerpt</Label>
              <Textarea
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the article"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Article content..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., getting-started, api, tutorial"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingArticle(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleUpdateArticle} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
