'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface _SearchResult {
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
// MOCK DATA
// ============================================================================

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Everything you need to begin your journey',
    icon: '🚀',
    color: 'from-blue-500 to-cyan-500',
    articleCount: 24,
    subcategories: [
      { id: 'sub-1', name: 'Quick Start', slug: 'quick-start', articleCount: 8 },
      { id: 'sub-2', name: 'Installation', slug: 'installation', articleCount: 6 },
      { id: 'sub-3', name: 'First Steps', slug: 'first-steps', articleCount: 10 }
    ],
    order: 1,
    visibility: 'public'
  },
  {
    id: 'cat-2',
    name: 'Features & Guides',
    slug: 'features-guides',
    description: 'Deep dive into all platform capabilities',
    icon: '📚',
    color: 'from-purple-500 to-pink-500',
    articleCount: 89,
    subcategories: [
      { id: 'sub-4', name: 'Core Features', slug: 'core-features', articleCount: 32 },
      { id: 'sub-5', name: 'Advanced Features', slug: 'advanced-features', articleCount: 28 },
      { id: 'sub-6', name: 'Integrations', slug: 'integrations', articleCount: 29 }
    ],
    order: 2,
    visibility: 'public'
  },
  {
    id: 'cat-3',
    name: 'Billing & Payments',
    slug: 'billing-payments',
    description: 'Manage subscriptions, invoices, and payments',
    icon: '💳',
    color: 'from-green-500 to-emerald-500',
    articleCount: 34,
    subcategories: [
      { id: 'sub-7', name: 'Pricing Plans', slug: 'pricing-plans', articleCount: 12 },
      { id: 'sub-8', name: 'Invoices', slug: 'invoices', articleCount: 10 },
      { id: 'sub-9', name: 'Payment Methods', slug: 'payment-methods', articleCount: 12 }
    ],
    order: 3,
    visibility: 'public'
  },
  {
    id: 'cat-4',
    name: 'Troubleshooting',
    slug: 'troubleshooting',
    description: 'Solutions to common problems and issues',
    icon: '🔧',
    color: 'from-orange-500 to-red-500',
    articleCount: 56,
    subcategories: [
      { id: 'sub-10', name: 'Common Issues', slug: 'common-issues', articleCount: 24 },
      { id: 'sub-11', name: 'Error Messages', slug: 'error-messages', articleCount: 18 },
      { id: 'sub-12', name: 'Performance', slug: 'performance', articleCount: 14 }
    ],
    order: 4,
    visibility: 'public'
  },
  {
    id: 'cat-5',
    name: 'API & Developers',
    slug: 'api-developers',
    description: 'Technical documentation for developers',
    icon: '⚡',
    color: 'from-indigo-500 to-purple-500',
    articleCount: 78,
    subcategories: [
      { id: 'sub-13', name: 'API Reference', slug: 'api-reference', articleCount: 35 },
      { id: 'sub-14', name: 'SDKs', slug: 'sdks', articleCount: 23 },
      { id: 'sub-15', name: 'Webhooks', slug: 'webhooks', articleCount: 20 }
    ],
    order: 5,
    visibility: 'public'
  },
  {
    id: 'cat-6',
    name: 'Account & Security',
    slug: 'account-security',
    description: 'Manage your account and security settings',
    icon: '🔒',
    color: 'from-gray-600 to-gray-800',
    articleCount: 42,
    subcategories: [
      { id: 'sub-16', name: 'Account Settings', slug: 'account-settings', articleCount: 16 },
      { id: 'sub-17', name: 'Security', slug: 'security', articleCount: 14 },
      { id: 'sub-18', name: 'Privacy', slug: 'privacy', articleCount: 12 }
    ],
    order: 6,
    visibility: 'public'
  }
]

const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'New User Onboarding',
    description: 'Essential guides for new users to get started quickly',
    icon: '🎯',
    color: 'from-blue-500 to-indigo-500',
    articleIds: ['art-1', 'art-2', 'art-3', 'art-4'],
    views: 12450,
    audience: 'customers',
    order: 1
  },
  {
    id: 'col-2',
    name: 'Best Practices',
    description: 'Expert tips and recommendations for optimal usage',
    icon: '⭐',
    color: 'from-yellow-500 to-orange-500',
    articleIds: ['art-5', 'art-6', 'art-7'],
    views: 8920,
    audience: 'all',
    order: 2
  },
  {
    id: 'col-3',
    name: 'Developer Resources',
    description: 'Technical documentation and API guides',
    icon: '💻',
    color: 'from-purple-500 to-pink-500',
    articleIds: ['art-8', 'art-9', 'art-10'],
    views: 15670,
    audience: 'developers',
    order: 3
  },
  {
    id: 'col-4',
    name: 'Enterprise Setup',
    description: 'Configuration guides for enterprise deployments',
    icon: '🏢',
    color: 'from-green-500 to-teal-500',
    articleIds: ['art-11', 'art-12'],
    views: 5430,
    audience: 'enterprise',
    order: 4
  }
]

const mockArticles: Article[] = [
  {
    id: 'art-1',
    title: 'Getting Started with FreeFlow Kazi',
    slug: 'getting-started-freeflow-kazi',
    excerpt: 'Learn how to set up your account and start using FreeFlow Kazi in minutes.',
    content: 'Complete guide to getting started with the platform...',
    type: 'guide',
    status: 'published',
    format: 'text',
    categoryId: 'cat-1',
    subcategoryId: 'sub-1',
    collectionId: 'col-1',
    author: { id: 'auth-1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Documentation Lead' },
    language: 'en',
    translations: ['es', 'fr', 'de'],
    audience: 'all',
    tags: ['getting-started', 'basics', 'onboarding'],
    views: 45230,
    helpfulCount: 3842,
    notHelpfulCount: 156,
    avgRating: 4.8,
    readTime: 5,
    relatedArticles: ['art-2', 'art-3', 'art-4'],
    version: 12,
    publishedAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    createdAt: '2024-08-01T09:00:00Z',
    seoTitle: 'Getting Started Guide - FreeFlow Kazi Help Center',
    seoDescription: 'Learn how to set up and use FreeFlow Kazi with our comprehensive getting started guide.',
    featured: true,
    pinned: true
  },
  {
    id: 'art-2',
    title: 'How to Create Your First Project',
    slug: 'create-first-project',
    excerpt: 'Step-by-step guide to creating and managing your first project.',
    content: 'Detailed instructions for project creation...',
    type: 'tutorial',
    status: 'published',
    format: 'interactive',
    categoryId: 'cat-1',
    subcategoryId: 'sub-3',
    collectionId: 'col-1',
    author: { id: 'auth-2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', role: 'Product Specialist' },
    language: 'en',
    translations: ['es', 'pt'],
    audience: 'customers',
    tags: ['projects', 'tutorial', 'basics'],
    views: 32150,
    helpfulCount: 2890,
    notHelpfulCount: 98,
    avgRating: 4.9,
    readTime: 8,
    relatedArticles: ['art-1', 'art-5'],
    version: 8,
    publishedAt: '2024-09-20T11:00:00Z',
    updatedAt: '2024-12-18T09:15:00Z',
    createdAt: '2024-08-15T14:00:00Z',
    featured: true,
    pinned: false
  },
  {
    id: 'art-3',
    title: 'Understanding Billing and Invoices',
    slug: 'understanding-billing-invoices',
    excerpt: 'Everything you need to know about billing cycles, invoices, and payments.',
    content: 'Comprehensive billing documentation...',
    type: 'article',
    status: 'published',
    format: 'text',
    categoryId: 'cat-3',
    subcategoryId: 'sub-8',
    author: { id: 'auth-3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', role: 'Support Manager' },
    language: 'en',
    translations: ['es', 'fr', 'de', 'pt', 'ja'],
    audience: 'all',
    tags: ['billing', 'invoices', 'payments'],
    views: 28450,
    helpfulCount: 2456,
    notHelpfulCount: 187,
    avgRating: 4.6,
    readTime: 6,
    relatedArticles: ['art-4'],
    version: 15,
    publishedAt: '2024-07-10T08:00:00Z',
    updatedAt: '2024-12-15T16:45:00Z',
    createdAt: '2024-06-01T10:00:00Z',
    featured: false,
    pinned: false
  },
  {
    id: 'art-4',
    title: 'Video: Platform Overview Tour',
    slug: 'platform-overview-tour-video',
    excerpt: 'Watch our comprehensive video tour of the entire platform.',
    content: 'Video transcript and key points...',
    type: 'video',
    status: 'published',
    format: 'video',
    categoryId: 'cat-1',
    subcategoryId: 'sub-1',
    collectionId: 'col-1',
    author: { id: 'auth-1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Documentation Lead' },
    language: 'en',
    translations: ['es'],
    audience: 'all',
    tags: ['video', 'overview', 'tour'],
    views: 67890,
    helpfulCount: 5234,
    notHelpfulCount: 89,
    avgRating: 4.9,
    readTime: 12,
    videoUrl: 'https://videos.example.com/platform-tour.mp4',
    videoDuration: 720,
    relatedArticles: ['art-1', 'art-2'],
    version: 4,
    publishedAt: '2024-11-01T12:00:00Z',
    updatedAt: '2024-12-10T11:00:00Z',
    createdAt: '2024-10-15T09:00:00Z',
    featured: true,
    pinned: true
  },
  {
    id: 'art-5',
    title: 'API Authentication Guide',
    slug: 'api-authentication-guide',
    excerpt: 'Learn how to authenticate with our REST API using OAuth 2.0 and API keys.',
    content: 'Technical API authentication documentation...',
    type: 'guide',
    status: 'published',
    format: 'text',
    categoryId: 'cat-5',
    subcategoryId: 'sub-13',
    collectionId: 'col-3',
    author: { id: 'auth-4', name: 'Alex Rivera', avatar: '/avatars/alex.jpg', role: 'Developer Advocate' },
    language: 'en',
    translations: ['ja', 'zh'],
    audience: 'developers',
    tags: ['api', 'authentication', 'oauth', 'security'],
    views: 41230,
    helpfulCount: 3567,
    notHelpfulCount: 145,
    avgRating: 4.7,
    readTime: 10,
    relatedArticles: ['art-8', 'art-9'],
    version: 20,
    publishedAt: '2024-06-15T14:00:00Z',
    updatedAt: '2024-12-22T10:30:00Z',
    createdAt: '2024-05-01T08:00:00Z',
    featured: false,
    pinned: false
  },
  {
    id: 'art-6',
    title: 'Troubleshooting Login Issues',
    slug: 'troubleshooting-login-issues',
    excerpt: 'Solutions to common login and authentication problems.',
    content: 'Step-by-step troubleshooting guide...',
    type: 'troubleshooting',
    status: 'published',
    format: 'checklist',
    categoryId: 'cat-4',
    subcategoryId: 'sub-10',
    author: { id: 'auth-3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', role: 'Support Manager' },
    language: 'en',
    translations: ['es', 'fr', 'de', 'pt'],
    audience: 'all',
    tags: ['troubleshooting', 'login', 'authentication', 'errors'],
    views: 54320,
    helpfulCount: 4890,
    notHelpfulCount: 234,
    avgRating: 4.5,
    readTime: 4,
    relatedArticles: ['art-7'],
    version: 18,
    publishedAt: '2024-04-20T09:00:00Z',
    updatedAt: '2024-12-21T15:00:00Z',
    createdAt: '2024-03-10T11:00:00Z',
    featured: false,
    pinned: false
  },
  {
    id: 'art-7',
    title: 'Password Reset FAQ',
    slug: 'password-reset-faq',
    excerpt: 'Frequently asked questions about resetting your password.',
    content: 'FAQ content...',
    type: 'faq',
    status: 'published',
    format: 'text',
    categoryId: 'cat-6',
    subcategoryId: 'sub-16',
    author: { id: 'auth-2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', role: 'Product Specialist' },
    language: 'en',
    translations: ['es', 'fr'],
    audience: 'all',
    tags: ['faq', 'password', 'account', 'security'],
    views: 38670,
    helpfulCount: 3234,
    notHelpfulCount: 156,
    avgRating: 4.6,
    readTime: 3,
    relatedArticles: ['art-6'],
    version: 9,
    publishedAt: '2024-05-10T10:00:00Z',
    updatedAt: '2024-12-19T12:00:00Z',
    createdAt: '2024-04-01T09:00:00Z',
    featured: false,
    pinned: false
  },
  {
    id: 'art-8',
    title: 'Webhook Integration Setup',
    slug: 'webhook-integration-setup',
    excerpt: 'Configure webhooks to receive real-time event notifications.',
    content: 'Webhook setup instructions...',
    type: 'tutorial',
    status: 'published',
    format: 'interactive',
    categoryId: 'cat-5',
    subcategoryId: 'sub-15',
    collectionId: 'col-3',
    author: { id: 'auth-4', name: 'Alex Rivera', avatar: '/avatars/alex.jpg', role: 'Developer Advocate' },
    language: 'en',
    translations: ['ja'],
    audience: 'developers',
    tags: ['webhooks', 'api', 'integration', 'events'],
    views: 23450,
    helpfulCount: 2156,
    notHelpfulCount: 78,
    avgRating: 4.8,
    readTime: 15,
    relatedArticles: ['art-5', 'art-9'],
    version: 11,
    publishedAt: '2024-08-05T11:00:00Z',
    updatedAt: '2024-12-17T14:00:00Z',
    createdAt: '2024-07-01T10:00:00Z',
    featured: false,
    pinned: false
  },
  {
    id: 'art-9',
    title: 'Best Practices for Team Collaboration',
    slug: 'best-practices-team-collaboration',
    excerpt: 'Learn how to effectively collaborate with your team using our platform.',
    content: 'Collaboration best practices...',
    type: 'guide',
    status: 'draft',
    format: 'text',
    categoryId: 'cat-2',
    subcategoryId: 'sub-4',
    collectionId: 'col-2',
    author: { id: 'auth-1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Documentation Lead' },
    language: 'en',
    translations: [],
    audience: 'team',
    tags: ['collaboration', 'teams', 'best-practices'],
    views: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    avgRating: 0,
    readTime: 7,
    relatedArticles: [],
    version: 1,
    publishedAt: '',
    updatedAt: '2024-12-23T09:00:00Z',
    createdAt: '2024-12-20T10:00:00Z',
    featured: false,
    pinned: false
  },
  {
    id: 'art-10',
    title: 'Enterprise SSO Configuration',
    slug: 'enterprise-sso-configuration',
    excerpt: 'Set up Single Sign-On for your enterprise organization.',
    content: 'SSO configuration guide...',
    type: 'guide',
    status: 'review',
    format: 'text',
    categoryId: 'cat-6',
    subcategoryId: 'sub-17',
    collectionId: 'col-4',
    author: { id: 'auth-4', name: 'Alex Rivera', avatar: '/avatars/alex.jpg', role: 'Developer Advocate' },
    language: 'en',
    translations: [],
    audience: 'enterprise',
    tags: ['enterprise', 'sso', 'security', 'authentication'],
    views: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    avgRating: 0,
    readTime: 12,
    relatedArticles: ['art-5'],
    version: 3,
    publishedAt: '',
    updatedAt: '2024-12-22T16:00:00Z',
    createdAt: '2024-12-15T11:00:00Z',
    featured: false,
    pinned: false
  }
]

const mockFeedback: Feedback[] = [
  { id: 'fb-1', articleId: 'art-1', type: 'helpful', comment: 'Very clear instructions!', userId: 'user-1', createdAt: '2024-12-23T10:00:00Z' },
  { id: 'fb-2', articleId: 'art-1', type: 'helpful', createdAt: '2024-12-23T09:30:00Z' },
  { id: 'fb-3', articleId: 'art-6', type: 'not_helpful', comment: 'Steps didnt work for me', userEmail: 'user@example.com', createdAt: '2024-12-22T15:00:00Z' },
  { id: 'fb-4', articleId: 'art-3', type: 'needs_update', comment: 'Pricing info is outdated', createdAt: '2024-12-21T11:00:00Z' },
  { id: 'fb-5', articleId: 'art-5', type: 'helpful', createdAt: '2024-12-23T08:00:00Z' }
]

const mockAnalytics: Analytics = {
  totalViews: 458920,
  totalArticles: 323,
  publishedArticles: 289,
  draftArticles: 34,
  avgHelpfulRate: 92.4,
  searchVolume: 12450,
  topSearchQueries: [
    { query: 'password reset', count: 1245, hasResults: true },
    { query: 'billing', count: 987, hasResults: true },
    { query: 'api authentication', count: 756, hasResults: true },
    { query: 'integrations', count: 654, hasResults: true },
    { query: 'webhook setup', count: 543, hasResults: true },
    { query: 'sso configuration', count: 432, hasResults: true },
    { query: 'export data', count: 321, hasResults: false },
    { query: 'mobile app', count: 298, hasResults: false }
  ],
  viewsByDay: [
    { date: '2024-12-17', views: 12450 },
    { date: '2024-12-18', views: 14230 },
    { date: '2024-12-19', views: 13890 },
    { date: '2024-12-20', views: 15670 },
    { date: '2024-12-21', views: 8920 },
    { date: '2024-12-22', views: 9450 },
    { date: '2024-12-23', views: 11230 }
  ],
  topArticles: [
    { articleId: 'art-4', title: 'Video: Platform Overview Tour', views: 67890 },
    { articleId: 'art-6', title: 'Troubleshooting Login Issues', views: 54320 },
    { articleId: 'art-1', title: 'Getting Started with FreeFlow Kazi', views: 45230 },
    { articleId: 'art-5', title: 'API Authentication Guide', views: 41230 },
    { articleId: 'art-7', title: 'Password Reset FAQ', views: 38670 }
  ],
  feedbackTrends: [
    { date: '2024-12-17', helpful: 234, notHelpful: 18 },
    { date: '2024-12-18', helpful: 267, notHelpful: 21 },
    { date: '2024-12-19', helpful: 245, notHelpful: 15 },
    { date: '2024-12-20', helpful: 289, notHelpful: 23 },
    { date: '2024-12-21', helpful: 156, notHelpful: 12 },
    { date: '2024-12-22', helpful: 178, notHelpful: 14 },
    { date: '2024-12-23', helpful: 198, notHelpful: 16 }
  ],
  selfServiceRate: 76.8,
  avgReadTime: 4.2,
  bounceRate: 23.5
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
// COMPETITIVE UPGRADE MOCK DATA - Intercom/Zendesk Guide Level Intelligence
// ============================================================================

const mockHelpCenterAIInsights = [
  { id: '1', type: 'success' as const, title: 'Self-Service Rate', description: '78% of users find answers without contacting support!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Metrics' },
  { id: '2', type: 'warning' as const, title: 'Outdated Content', description: '12 articles need review - last updated 90+ days ago.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Quality' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: '"API authentication" is trending - create a guide.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockHelpCenterCollaborators = [
  { id: '1', name: 'Content Lead', avatar: '/avatars/content.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Tech Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Writer' },
  { id: '3', name: 'Support Lead', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const mockHelpCenterPredictions = [
  { id: '1', title: 'Ticket Deflection', prediction: 'New FAQ articles will reduce tickets by 20%', confidence: 86, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Search Success', prediction: 'Search improvements will boost find rate to 85%', confidence: 79, trend: 'up' as const, impact: 'medium' as const },
]

const mockHelpCenterActivities = [
  { id: '1', user: 'Content Lead', action: 'Published', target: 'Getting Started guide v2', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Tech Writer', action: 'Updated', target: 'API troubleshooting article', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Support Lead', action: 'Flagged', target: '3 articles for review', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are now defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HelpCenterClient() {
  const [activeTab, setActiveTab] = useState('articles')
  const [articles] = useState<Article[]>(mockArticles)
  const [categories] = useState<Category[]>(mockCategories)
  const [collections] = useState<Collection[]>(mockCollections)
  const [analytics] = useState<Analytics>(mockAnalytics)
  const [feedback] = useState<Feedback[]>(mockFeedback)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ArticleType | 'all'>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-1']))

  // Dialog states for real functionality
  const [showCreateArticleDialog, setShowCreateArticleDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false)
  const [showSmartSearchDialog, setShowSmartSearchDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showManageTagsDialog, setShowManageTagsDialog] = useState(false)
  const [showTranslateDialog, setShowTranslateDialog] = useState(false)
  const [showArchivesDialog, setShowArchivesDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false)
  const [showOrganizeDialog, setShowOrganizeDialog] = useState(false)
  const [showAutoSortDialog, setShowAutoSortDialog] = useState(false)
  const [showCrossLinkDialog, setShowCrossLinkDialog] = useState(false)
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false)
  const [showFeedbackFilterDialog, setShowFeedbackFilterDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false)
  const [showEditArticleDialog, setShowEditArticleDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showContentGapsDialog, setShowContentGapsDialog] = useState(false)

  // Form states
  const [newArticleTitle, setNewArticleTitle] = useState('')
  const [newArticleContent, setNewArticleContent] = useState('')
  const [newArticleType, setNewArticleType] = useState<ArticleType>('article')
  const [newArticleCategory, setNewArticleCategory] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [selectedCollectionForView, setSelectedCollectionForView] = useState<Collection | null>(null)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null)
  const [feedbackFilterType, setFeedbackFilterType] = useState<FeedbackType | 'all'>('all')
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [smartSearchQuery, setSmartSearchQuery] = useState('')
  const [translationLanguage, setTranslationLanguage] = useState<Language>('es')

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

  // Handlers with real dialog functionality
  const handleCreateArticle = () => {
    setNewArticleTitle('')
    setNewArticleContent('')
    setNewArticleType('article')
    setNewArticleCategory('')
    setShowCreateArticleDialog(true)
  }

  const handleSubmitNewArticle = () => {
    if (!newArticleTitle.trim()) {
      toast.error('Title Required')
      return
    }
    setShowCreateArticleDialog(false)
    toast.success(`Article "${newArticleTitle}" created successfully`)
  }

  const handlePublishArticle = (n: string) => {
    toast.success(`"${n}" is now live`)
  }

  const handleCreateCategory = () => {
    setNewCategoryName('')
    setNewCategoryDescription('')
    setShowCreateCategoryDialog(true)
  }

  const handleSubmitNewCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Name Required')
      return
    }
    setShowCreateCategoryDialog(false)
    toast.success(`Category "${newCategoryName}" created`)
  }

  const handleSearch = () => setShowSmartSearchDialog(true)

  const handleSearchArticles = () => {
    setSmartSearchQuery('')
    setShowSmartSearchDialog(true)
  }

  const handleExecuteSmartSearch = () => {
    if (!smartSearchQuery.trim()) {
      toast.error('Query Required')
      return
    }
    setShowSmartSearchDialog(false)
    setSearchQuery(smartSearchQuery)
    toast.success(`Found results for "${smartSearchQuery}"`)
  }

  const handleAnalytics = () => setShowAnalyticsDialog(true)

  const handleImport = () => {
    setImportFile(null)
    setShowImportDialog(true)
  }

  const handleExecuteImport = () => {
    setShowImportDialog(false)
    toast.success('Articles imported successfully')
  }

  const handleManageTags = () => setShowManageTagsDialog(true)

  const handleTranslate = () => {
    setTranslationLanguage('es')
    setShowTranslateDialog(true)
  }

  const handleExecuteTranslation = () => {
    setShowTranslateDialog(false)
    toast.success(`Content translated to ${translationLanguage.toUpperCase()}`)
  }

  const handleArchives = () => setShowArchivesDialog(true)

  const handleSettings = () => setShowSettingsDialog(true)

  const handleSubcategory = () => setShowSubcategoryDialog(true)

  const handleOrganize = () => setShowOrganizeDialog(true)

  const handleAutoSort = () => {
    setShowAutoSortDialog(true)
  }

  const handleExecuteAutoSort = () => {
    setShowAutoSortDialog(false)
    toast.success('Content auto-sorted successfully')
  }

  const handleCrossLink = () => setShowCrossLinkDialog(true)

  const handleCleanup = () => setShowCleanupDialog(true)

  const handleExecuteCleanup = () => {
    setShowCleanupDialog(false)
    toast.success('Content cleanup completed')
  }

  const handleViewCollection = (collectionName: string) => {
    const collection = collections.find(c => c.name === collectionName)
    if (collection) {
      setSelectedCollectionForView(collection)
      setShowCollectionDialog(true)
    }
  }

  const handleNewCollection = () => {
    setNewCollectionName('')
    setNewCollectionDescription('')
    setShowNewCollectionDialog(true)
  }

  const handleSubmitNewCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error('Name Required')
      return
    }
    setShowNewCollectionDialog(false)
    toast.success(`Collection "${newCollectionName}" created`)
  }

  const handleAllFeedback = () => {
    setFeedbackFilterType('all')
    setShowFeedbackFilterDialog(true)
  }

  const handlePositiveFeedback = () => {
    setFeedbackFilterType('helpful')
    setShowFeedbackFilterDialog(true)
  }

  const handleNegativeFeedback = () => {
    setFeedbackFilterType('not_helpful')
    setShowFeedbackFilterDialog(true)
  }

  const handleIncorrectFeedback = () => {
    setFeedbackFilterType('incorrect')
    setShowFeedbackFilterDialog(true)
  }

  const handleNeedsUpdate = () => {
    setFeedbackFilterType('needs_update')
    setShowFeedbackFilterDialog(true)
  }

  const handleExport = () => {
    setExportFormat('csv')
    setShowExportDialog(true)
  }

  const handleExecuteExport = () => {
    setShowExportDialog(false)
    toast.success(`Export completed (${exportFormat.toUpperCase()})`)
  }

  const handleReports = () => setShowReportsDialog(true)

  const handleReviewNegative = () => {
    setFeedbackFilterType('not_helpful')
    setShowFeedbackFilterDialog(true)
  }

  const handleUpdateRequested = () => {
    setFeedbackFilterType('needs_update')
    setShowFeedbackFilterDialog(true)
  }

  const handleFollowUp = () => {
    setFollowUpMessage('')
    setShowFollowUpDialog(true)
  }

  const handleSendFollowUp = () => {
    if (!followUpMessage.trim()) {
      toast.error('Message Required')
      return
    }
    setShowFollowUpDialog(false)
    toast.success('Follow-up sent successfully')
  }

  const handleOverview = () => setShowAnalyticsDialog(true)
  const handleTrends = () => setShowAnalyticsDialog(true)
  const handleSearchTerms = () => setShowAnalyticsDialog(true)
  const handlePageViews = () => setShowAnalyticsDialog(true)
  const handleTimeOnPage = () => setShowAnalyticsDialog(true)

  const handleGaps = () => setShowContentGapsDialog(true)

  const handleSchedule = () => {
    setScheduleDate('')
    setShowScheduleDialog(true)
  }

  const handleSaveSchedule = () => {
    if (!scheduleDate) {
      toast.error('Date Required')
      return
    }
    setShowScheduleDialog(false)
    toast.success('Content scheduled successfully')
  }

  const handleEditArticle = () => {
    setShowEditArticleDialog(true)
  }

  const handleSaveArticleEdit = () => {
    setShowEditArticleDialog(false)
    toast.success('Article updated successfully')
  }

  const handleViewLive = (articleTitle: string) => {
    window.open(`/help/${articleTitle.toLowerCase().replace(/\s+/g, '-')}`, '_blank')
  }

  const handleDuplicate = (articleTitle: string) => {
    toast.success(`"${articleTitle}" duplicated`)
  }

  const handleShare = () => {
    setShareEmail('')
    setShowShareDialog(true)
  }

  const handleSendShare = () => {
    if (!shareEmail.trim()) {
      toast.error('Email Required')
      return
    }
    setShowShareDialog(false)
    toast.success(`Article shared with ${shareEmail}`)
  }

  const handleArchive = (articleTitle: string) => {
    toast.success(`"${articleTitle}" archived`)
  }

  const handleEditCategory = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    if (category) {
      setSelectedCategoryForEdit(category)
      setNewCategoryName(category.name)
      setNewCategoryDescription(category.description)
      setShowEditCategoryDialog(true)
    }
  }

  const handleSaveCategoryEdit = () => {
    setShowEditCategoryDialog(false)
    toast.success('Category updated successfully')
  }

  const handleSaveSettings = () => {
    setShowSettingsDialog(false)
    toast.success('Help center settings saved successfully')
  }

  const handleSubmitSubcategory = () => {
    setShowSubcategoryDialog(false)
    toast.success('Subcategory created successfully')
  }

  const handleSaveOrganize = () => {
    setShowOrganizeDialog(false)
    toast.success('Content organization saved')
  }

  const handleCreateCrossLink = () => {
    setShowCrossLinkDialog(false)
    toast.success('Articles linked successfully')
  }

  // Quick actions with real handlers
  const helpCenterQuickActions = [
    { id: '1', label: 'New Article', icon: 'plus', action: handleCreateArticle, variant: 'default' as const },
    { id: '2', label: 'Preview', icon: 'eye', action: () => setShowAnalyticsDialog(true), variant: 'default' as const },
    { id: '3', label: 'Analytics', icon: 'bar-chart', action: () => setShowAnalyticsDialog(true), variant: 'outline' as const },
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
                  <action.icon className={`h-5 w-5 ${action.color}`} />
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
                  <action.icon className={`h-5 w-5 ${action.color}`} />
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
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl`}>
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
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${collection.color} flex items-center justify-center text-2xl mb-4`}>
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
                  <action.icon className={`h-5 w-5 ${action.color}`} />
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
                  <action.icon className={`h-5 w-5 ${action.color}`} />
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
                        <Button variant="ghost" size="sm" onClick={() => {
                          window.open(`/help/${article.title.toLowerCase().replace(/\s+/g, '-')}`, '_blank')
                          toast.success("Opening article in new tab")
                        }}>
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
              insights={mockHelpCenterAIInsights}
              title="Help Center Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockHelpCenterCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockHelpCenterPredictions}
              title="Content Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockHelpCenterActivities}
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
                  <Button className="flex-1" onClick={handleEditArticle}>
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
                  <Button variant="outline" onClick={handleShare} aria-label="Share">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
            <DialogDescription>Write a new help center article</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="articleTitle">Title</Label>
              <Input
                id="articleTitle"
                value={newArticleTitle}
                onChange={(e) => setNewArticleTitle(e.target.value)}
                placeholder="Enter article title..."
              />
            </div>
            <div>
              <Label htmlFor="articleType">Type</Label>
              <Select value={newArticleType} onValueChange={(v) => setNewArticleType(v as ArticleType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="articleCategory">Category</Label>
              <Select value={newArticleCategory} onValueChange={setNewArticleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="articleContent">Content</Label>
              <Textarea
                id="articleContent"
                value={newArticleContent}
                onChange={(e) => setNewArticleContent(e.target.value)}
                placeholder="Write your article content..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateArticleDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitNewArticle}>Create Article</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Help Center Analytics</DialogTitle>
            <DialogDescription>Comprehensive metrics and insights</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{formatNumber(analytics.totalViews)}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{analytics.selfServiceRate}%</p>
                  <p className="text-sm text-muted-foreground">Self-Service Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">{analytics.avgReadTime}m</p>
                  <p className="text-sm text-muted-foreground">Avg Read Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">{analytics.bounceRate}%</p>
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-lg">Top Performing Articles</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topArticles.slice(0, 5).map((article, i) => (
                    <div key={article.articleId} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">{i + 1}</span>
                        <span className="font-medium">{article.title}</span>
                      </div>
                      <span className="text-muted-foreground">{formatNumber(article.views)} views</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>Add a new category to organize articles</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Getting Started"
              />
            </div>
            <div>
              <Label htmlFor="categoryDesc">Description</Label>
              <Textarea
                id="categoryDesc"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Brief description of this category..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitNewCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Smart Search Dialog */}
      <Dialog open={showSmartSearchDialog} onOpenChange={setShowSmartSearchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI-Powered Smart Search</DialogTitle>
            <DialogDescription>Search articles with natural language</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={smartSearchQuery}
                onChange={(e) => setSmartSearchQuery(e.target.value)}
                placeholder="How do I reset my password?"
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteSmartSearch()}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Try searching for:</p>
              <ul className="space-y-1">
                <li className="cursor-pointer hover:text-foreground" onClick={() => setSmartSearchQuery('billing and invoices')}>billing and invoices</li>
                <li className="cursor-pointer hover:text-foreground" onClick={() => setSmartSearchQuery('API authentication')}>API authentication</li>
                <li className="cursor-pointer hover:text-foreground" onClick={() => setSmartSearchQuery('getting started')}>getting started</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSmartSearchDialog(false)}>Cancel</Button>
            <Button onClick={handleExecuteSmartSearch}>
              <Sparkles className="w-4 h-4 mr-2" />
              Search with AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Articles</DialogTitle>
            <DialogDescription>Import articles from external sources</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground">Supports CSV, JSON, and Markdown files</p>
              <Input
                type="file"
                className="mt-4"
                accept=".csv,.json,.md"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            {importFile && (
              <p className="text-sm text-green-600">Selected: {importFile.name}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button onClick={handleExecuteImport} disabled={!importFile}>Import Articles</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Tags Dialog */}
      <Dialog open={showManageTagsDialog} onOpenChange={setShowManageTagsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>Organize and manage article tags</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Add new tag..." id="new-tag-input" />
              <Button onClick={() => {
                const input = document.getElementById('new-tag-input') as HTMLInputElement
                if (input?.value.trim()) {
                  toast.success("Tag '" + input.value.trim() + "' has been created")
                  input.value = ''
                } else {
                  toast.error('Tag Required')
                }
              }}>Add Tag</Button>
            </div>
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-3">Existing Tags</p>
              <div className="flex flex-wrap gap-2">
                {['getting-started', 'billing', 'api', 'authentication', 'troubleshooting', 'faq', 'tutorial', 'security', 'integration', 'webhook'].map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground">
                    {tag}
                    <span className="ml-1">x</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageTagsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Translate Dialog */}
      <Dialog open={showTranslateDialog} onOpenChange={setShowTranslateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Translate Content</DialogTitle>
            <DialogDescription>Translate articles to different languages</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Language</Label>
              <Select value={translationLanguage} onValueChange={(v) => setTranslationLanguage(v as Language)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Articles to Translate</p>
              <p className="text-sm text-muted-foreground">
                {articles.filter(a => !a.translations.includes(translationLanguage)).length} articles pending translation
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTranslateDialog(false)}>Cancel</Button>
            <Button onClick={handleExecuteTranslation}>
              <Languages className="w-4 h-4 mr-2" />
              Start Translation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archives Dialog */}
      <Dialog open={showArchivesDialog} onOpenChange={setShowArchivesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Archived Articles</DialogTitle>
            <DialogDescription>View and restore archived content</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {articles.filter(a => a.status === 'archived').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No archived articles</p>
              ) : (
                articles.filter(a => a.status === 'archived').map(article => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground">Archived on {new Date(article.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.success('"' + article.title + '" has been restored')
                    }}>Restore</Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchivesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Help Center Settings</DialogTitle>
            <DialogDescription>Configure your help center</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Help Center Name</Label>
              <Input defaultValue="FreeFlow Kazi Help Center" />
            </div>
            <div>
              <Label>Default Language</Label>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable AI Search</p>
                <p className="text-sm text-muted-foreground">Use AI to improve search results</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow User Feedback</p>
                <p className="text-sm text-muted-foreground">Let users rate articles</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Subcategory</DialogTitle>
            <DialogDescription>Add a subcategory to organize articles</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Parent Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subcategory Name</Label>
              <Input placeholder="e.g., Advanced Topics" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubcategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitSubcategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organize Dialog */}
      <Dialog open={showOrganizeDialog} onOpenChange={setShowOrganizeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Organize Content</DialogTitle>
            <DialogDescription>Drag and drop to reorganize articles</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-4 min-h-[300px]">
            <p className="text-center text-muted-foreground">Drag articles between categories to reorganize</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
              {categories.slice(0, 4).map(cat => (
                <div key={cat.id} className="border rounded p-3">
                  <p className="font-medium mb-2">{cat.icon} {cat.name}</p>
                  <div className="space-y-1">
                    {articles.filter(a => a.categoryId === cat.id).slice(0, 3).map(a => (
                      <p key={a.id} className="text-sm p-2 bg-muted rounded cursor-move">{a.title}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrganizeDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveOrganize}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Sort Dialog */}
      <Dialog open={showAutoSortDialog} onOpenChange={setShowAutoSortDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Auto-Sort</DialogTitle>
            <DialogDescription>Let AI organize your content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <p className="font-medium">AI Analysis</p>
              </div>
              <p className="text-sm text-muted-foreground">AI will analyze your articles and suggest optimal categorization based on content similarity and user behavior.</p>
            </div>
            <div>
              <Label>Sort Strategy</Label>
              <Select defaultValue="smart">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart">Smart (AI-powered)</SelectItem>
                  <SelectItem value="popularity">By Popularity</SelectItem>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="alpha">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoSortDialog(false)}>Cancel</Button>
            <Button onClick={handleExecuteAutoSort}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start Auto-Sort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cross-Link Dialog */}
      <Dialog open={showCrossLinkDialog} onOpenChange={setShowCrossLinkDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cross-Link Articles</DialogTitle>
            <DialogDescription>Create links between related articles</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Source Article</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select article" />
                </SelectTrigger>
                <SelectContent>
                  {articles.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Link To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select related article" />
                </SelectTrigger>
                <SelectContent>
                  {articles.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="bidirectional" className="h-4 w-4" />
              <Label htmlFor="bidirectional">Create bidirectional link</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCrossLinkDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCrossLink}>Create Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cleanup Dialog */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Content Cleanup</DialogTitle>
            <DialogDescription>Remove outdated or duplicate content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-2">Cleanup Options</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span>Find duplicate articles</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span>Identify outdated content (90+ days)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Remove broken links</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Archive low-traffic articles</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCleanupDialog(false)}>Cancel</Button>
            <Button onClick={handleExecuteCleanup} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Start Cleanup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Collection Dialog */}
      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCollectionForView?.name}</DialogTitle>
            <DialogDescription>{selectedCollectionForView?.description}</DialogDescription>
          </DialogHeader>
          {selectedCollectionForView && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={"w-12 h-12 rounded-xl bg-gradient-to-r " + selectedCollectionForView.color + " flex items-center justify-center text-xl"}>
                  {selectedCollectionForView.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{selectedCollectionForView.articleIds.length} articles</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(selectedCollectionForView.views)} views</p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-medium mb-3">Articles in this collection</p>
                <div className="space-y-2">
                  {articles.filter(a => selectedCollectionForView.articleIds.includes(a.id)).map(article => (
                    <div key={article.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span>{article.title}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleViewArticle(article)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollectionDialog(false)}>Close</Button>
            <Button onClick={() => {
              if (selectedCollectionForView) {
                toast.success("Editing Collection: " + selectedCollectionForView.name)
                setShowCollectionDialog(false)
              }
            }}>Edit Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Collection Dialog */}
      <Dialog open={showNewCollectionDialog} onOpenChange={setShowNewCollectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>Group related articles together</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Collection Name</Label>
              <Input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g., Getting Started Guide"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Brief description of this collection..."
              />
            </div>
            <div>
              <Label>Add Articles</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select articles to add" />
                </SelectTrigger>
                <SelectContent>
                  {articles.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCollectionDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitNewCollection}>Create Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Filter Dialog */}
      <Dialog open={showFeedbackFilterDialog} onOpenChange={setShowFeedbackFilterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {feedbackFilterType === 'all' ? 'All Feedback' :
               feedbackFilterType === 'helpful' ? 'Positive Feedback' :
               feedbackFilterType === 'not_helpful' ? 'Negative Feedback' :
               feedbackFilterType === 'incorrect' ? 'Incorrect Reports' :
               'Update Requests'}
            </DialogTitle>
            <DialogDescription>Review and manage user feedback</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {feedback.filter(f => feedbackFilterType === 'all' || f.type === feedbackFilterType).map(fb => {
                const article = articles.find(a => a.id === fb.articleId)
                return (
                  <div key={fb.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={fb.type === 'helpful' ? 'default' : 'destructive'}>
                        {fb.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {article && <p className="font-medium">{article.title}</p>}
                    {fb.comment && <p className="text-sm text-muted-foreground mt-2">"{fb.comment}"</p>}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => {
                        toast.success('Responding')
                      }}>Respond</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        toast.success('Feedback Dismissed')
                      }}>Dismiss</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackFilterDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>Export help center data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'csv' | 'json' | 'pdf')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data to Export</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span>Articles</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span>Categories</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Feedback</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Analytics</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button onClick={handleExecuteExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reports</DialogTitle>
            <DialogDescription>Generate and view reports</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="cursor-pointer hover:border-primary">
              <CardContent className="p-4">
                <BarChart3 className="w-8 h-8 mb-2 text-blue-500" />
                <p className="font-medium">Content Performance</p>
                <p className="text-sm text-muted-foreground">Views, engagement, and ratings</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary">
              <CardContent className="p-4">
                <Search className="w-8 h-8 mb-2 text-purple-500" />
                <p className="font-medium">Search Analytics</p>
                <p className="text-sm text-muted-foreground">Top queries and success rate</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary">
              <CardContent className="p-4">
                <MessageSquare className="w-8 h-8 mb-2 text-orange-500" />
                <p className="font-medium">Feedback Summary</p>
                <p className="text-sm text-muted-foreground">User satisfaction trends</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary">
              <CardContent className="p-4">
                <TrendingUp className="w-8 h-8 mb-2 text-green-500" />
                <p className="font-medium">Growth Report</p>
                <p className="text-sm text-muted-foreground">Month-over-month trends</p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow Up Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Follow Up on Feedback</DialogTitle>
            <DialogDescription>Send a response to users who left feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Feedback to Address</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback" />
                </SelectTrigger>
                <SelectContent>
                  {feedback.filter(f => f.comment).map(fb => (
                    <SelectItem key={fb.id} value={fb.id}>
                      {fb.comment?.substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Your Response</Label>
              <Textarea
                value={followUpMessage}
                onChange={(e) => setFollowUpMessage(e.target.value)}
                placeholder="Thank you for your feedback..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowUpDialog(false)}>Cancel</Button>
            <Button onClick={handleSendFollowUp}>
              <Send className="w-4 h-4 mr-2" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={showEditArticleDialog} onOpenChange={setShowEditArticleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>Make changes to {selectedArticle?.title}</DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input defaultValue={selectedArticle.title} />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea defaultValue={selectedArticle.excerpt} />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea defaultValue={selectedArticle.content} className="min-h-[200px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Status</Label>
                  <Select defaultValue={selectedArticle.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select defaultValue={selectedArticle.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditArticleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveArticleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Article</DialogTitle>
            <DialogDescription>Share {selectedArticle?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>
            <div>
              <Label>Article Link</Label>
              <div className="flex gap-2">
                <Input readOnly value={"https://help.freeflowkazi.com/" + (selectedArticle?.slug || "")} />
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText("https://help.freeflowkazi.com/" + (selectedArticle?.slug || ""))
                  toast.success('Link copied!')
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
            <Button onClick={handleSendShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Visibility</Label>
              <Select defaultValue={selectedCategoryForEdit?.visibility || 'public'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategoryEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Content</DialogTitle>
            <DialogDescription>Schedule articles for publishing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Article</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose article to schedule" />
                </SelectTrigger>
                <SelectContent>
                  {articles.filter(a => a.status === 'draft' || a.status === 'review').map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Publish Date</Label>
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notify" className="h-4 w-4" />
              <Label htmlFor="notify">Notify team when published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Gaps Dialog */}
      <Dialog open={showContentGapsDialog} onOpenChange={setShowContentGapsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Gaps Analysis</DialogTitle>
            <DialogDescription>Identify missing content based on user searches</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="font-medium text-red-700 dark:text-red-400 mb-2">Top Searches Without Results</p>
              <div className="space-y-2">
                {analytics.topSearchQueries.filter(q => !q.hasResults).map((query, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                    <span>"{query.query}"</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{query.count} searches</span>
                      <Button size="sm" onClick={() => {
                        setNewArticleTitle(query.query)
                        setShowContentGapsDialog(false)
                        setShowCreateArticleDialog(true)
                      }}>Create Article</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Suggested Topics</p>
              <ul className="space-y-1 text-sm">
                <li>Mobile app usage guide</li>
                <li>Data export documentation</li>
                <li>Enterprise SSO setup</li>
                <li>Team collaboration best practices</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentGapsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
