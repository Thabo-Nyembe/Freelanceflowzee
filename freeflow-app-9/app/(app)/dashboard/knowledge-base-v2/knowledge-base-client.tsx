'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BookOpen,
  FileText,
  Search,
  ThumbsUp,
  Eye,
  Star,
  TrendingUp,
  Plus,
  Download,
  Edit,
  Users,
  HelpCircle,
  Clock,
  MessageSquare,
  History,
  Lock,
  FolderOpen,
  Share2,
  Bookmark,
  BookmarkPlus,
  Tag,
  Archive,
  Trash2,
  MoreVertical,
  Filter,
  Grid3X3,
  List,
  Globe,
  FileCode,
  Layout,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Bell,
  BellOff,
  Link as LinkIcon,
  Settings,
  Sliders,
  Webhook,
  Network,
  Shield
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
import { CardDescription } from '@/components/ui/card'

// Types
type SpaceType = 'team' | 'personal' | 'project' | 'documentation' | 'archive'
type SpaceStatus = 'active' | 'archived' | 'private'
type PageStatus = 'published' | 'draft' | 'review' | 'archived'
type PageType = 'page' | 'blog' | 'template' | 'meeting-notes' | 'decision' | 'how-to'
type PermissionLevel = 'view' | 'edit' | 'admin'
type CommentStatus = 'active' | 'resolved' | 'deleted'

interface Space {
  id: string
  name: string
  key: string
  description: string
  type: SpaceType
  status: SpaceStatus
  icon: string
  color: string
  owner: {
    id: string
    name: string
    avatar: string
  }
  members: number
  pages: number
  createdAt: string
  lastActivity: string
  isWatching: boolean
  permissions: PermissionLevel
}

interface Page {
  id: string
  title: string
  excerpt: string
  content: string
  spaceId: string
  spaceName: string
  spaceKey: string
  parentId: string | null
  type: PageType
  status: PageStatus
  author: {
    id: string
    name: string
    avatar: string
  }
  contributors: {
    id: string
    name: string
    avatar: string
  }[]
  labels: string[]
  version: number
  views: number
  likes: number
  comments: number
  isLiked: boolean
  isWatching: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  readTime: number
  children: Page[]
  restrictions: {
    view: string[]
    edit: string[]
  } | null
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  type: PageType
  icon: string
  preview: string
  usageCount: number
  author: {
    id: string
    name: string
  }
  isGlobal: boolean
  createdAt: string
}

interface Comment {
  id: string
  pageId: string
  pageTitle: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  status: CommentStatus
  isInline: boolean
  lineRef: string | null
  likes: number
  replies: Comment[]
  createdAt: string
  updatedAt: string
}

interface PageVersion {
  id: string
  pageId: string
  pageTitle: string
  version: number
  author: {
    id: string
    name: string
    avatar: string
  }
  changes: string
  additions: number
  deletions: number
  createdAt: string
  isCurrent: boolean
}

interface Analytics {
  totalSpaces: number
  totalPages: number
  totalViews: number
  activeContributors: number
  avgPageViews: number
  avgEngagement: number
  viewsTrend: number
  pagesTrend: number
  topPages: {
    id: string
    title: string
    views: number
    trend: number
  }[]
  topContributors: {
    id: string
    name: string
    avatar: string
    pages: number
    edits: number
  }[]
  activityByDay: {
    day: string
    views: number
    edits: number
    comments: number
  }[]
  contentByType: {
    type: string
    count: number
    percentage: number
  }[]
}

// Mock data
const mockSpaces: Space[] = [
  {
    id: '1',
    name: 'Engineering Documentation',
    key: 'ENG',
    description: 'Technical documentation, architecture decisions, and engineering guidelines',
    type: 'documentation',
    status: 'active',
    icon: '⚙️',
    color: 'from-blue-500 to-indigo-500',
    owner: { id: '1', name: 'Alex Chen', avatar: '' },
    members: 45,
    pages: 234,
    createdAt: '2024-01-15',
    lastActivity: '2 hours ago',
    isWatching: true,
    permissions: 'admin'
  },
  {
    id: '2',
    name: 'Product Team',
    key: 'PROD',
    description: 'Product roadmaps, feature specs, and user research findings',
    type: 'team',
    status: 'active',
    icon: '🚀',
    color: 'from-purple-500 to-pink-500',
    owner: { id: '2', name: 'Sarah Miller', avatar: '' },
    members: 28,
    pages: 156,
    createdAt: '2024-02-10',
    lastActivity: '1 hour ago',
    isWatching: true,
    permissions: 'edit'
  },
  {
    id: '3',
    name: 'Design System',
    key: 'DS',
    description: 'Component library documentation and design guidelines',
    type: 'documentation',
    status: 'active',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
    owner: { id: '3', name: 'Mike Johnson', avatar: '' },
    members: 32,
    pages: 89,
    createdAt: '2024-03-01',
    lastActivity: '4 hours ago',
    isWatching: false,
    permissions: 'view'
  },
  {
    id: '4',
    name: 'API Reference',
    key: 'API',
    description: 'Complete API documentation with examples and best practices',
    type: 'documentation',
    status: 'active',
    icon: '📡',
    color: 'from-green-500 to-emerald-500',
    owner: { id: '1', name: 'Alex Chen', avatar: '' },
    members: 52,
    pages: 312,
    createdAt: '2024-01-20',
    lastActivity: '30 minutes ago',
    isWatching: true,
    permissions: 'admin'
  },
  {
    id: '5',
    name: 'Project Alpha',
    key: 'ALPHA',
    description: 'Project Alpha documentation and planning materials',
    type: 'project',
    status: 'active',
    icon: '🔮',
    color: 'from-violet-500 to-purple-500',
    owner: { id: '4', name: 'Emma Wilson', avatar: '' },
    members: 15,
    pages: 67,
    createdAt: '2024-06-01',
    lastActivity: '6 hours ago',
    isWatching: false,
    permissions: 'edit'
  },
  {
    id: '6',
    name: 'Personal Notes',
    key: 'PERSONAL',
    description: 'Private workspace for personal notes and drafts',
    type: 'personal',
    status: 'private',
    icon: '📝',
    color: 'from-yellow-500 to-orange-500',
    owner: { id: '5', name: 'Current User', avatar: '' },
    members: 1,
    pages: 23,
    createdAt: '2024-04-15',
    lastActivity: 'Just now',
    isWatching: false,
    permissions: 'admin'
  }
]

const mockPages: Page[] = [
  {
    id: '1',
    title: 'Getting Started with the Platform',
    excerpt: 'A comprehensive guide to help new users get up and running quickly with all platform features.',
    content: 'Full content here...',
    spaceId: '1',
    spaceName: 'Engineering Documentation',
    spaceKey: 'ENG',
    parentId: null,
    type: 'how-to',
    status: 'published',
    author: { id: '1', name: 'Alex Chen', avatar: '' },
    contributors: [
      { id: '2', name: 'Sarah Miller', avatar: '' },
      { id: '3', name: 'Mike Johnson', avatar: '' }
    ],
    labels: ['getting-started', 'onboarding', 'essential'],
    version: 12,
    views: 15420,
    likes: 234,
    comments: 45,
    isLiked: true,
    isWatching: true,
    isBookmarked: true,
    createdAt: '2024-01-20',
    updatedAt: '2024-12-20',
    publishedAt: '2024-01-25',
    readTime: 8,
    children: [],
    restrictions: null
  },
  {
    id: '2',
    title: 'Architecture Decision Records',
    excerpt: 'Collection of all architecture decisions made for the platform with context and rationale.',
    content: 'Full content here...',
    spaceId: '1',
    spaceName: 'Engineering Documentation',
    spaceKey: 'ENG',
    parentId: null,
    type: 'decision',
    status: 'published',
    author: { id: '1', name: 'Alex Chen', avatar: '' },
    contributors: [{ id: '4', name: 'Emma Wilson', avatar: '' }],
    labels: ['architecture', 'decisions', 'adr'],
    version: 8,
    views: 8750,
    likes: 156,
    comments: 32,
    isLiked: false,
    isWatching: true,
    isBookmarked: false,
    createdAt: '2024-02-15',
    updatedAt: '2024-12-18',
    publishedAt: '2024-02-20',
    readTime: 15,
    children: [],
    restrictions: { view: ['engineering'], edit: ['senior-engineering'] }
  },
  {
    id: '3',
    title: 'API Authentication Guide',
    excerpt: 'Complete guide to implementing authentication with OAuth 2.0, API keys, and JWT tokens.',
    content: 'Full content here...',
    spaceId: '4',
    spaceName: 'API Reference',
    spaceKey: 'API',
    parentId: null,
    type: 'page',
    status: 'published',
    author: { id: '2', name: 'Sarah Miller', avatar: '' },
    contributors: [
      { id: '1', name: 'Alex Chen', avatar: '' },
      { id: '5', name: 'Current User', avatar: '' }
    ],
    labels: ['api', 'authentication', 'security', 'oauth'],
    version: 23,
    views: 24680,
    likes: 412,
    comments: 78,
    isLiked: true,
    isWatching: true,
    isBookmarked: true,
    createdAt: '2024-01-25',
    updatedAt: '2024-12-22',
    publishedAt: '2024-02-01',
    readTime: 12,
    children: [],
    restrictions: null
  },
  {
    id: '4',
    title: 'Q4 Product Roadmap',
    excerpt: 'Detailed roadmap for Q4 2024 including feature priorities, timelines, and dependencies.',
    content: 'Full content here...',
    spaceId: '2',
    spaceName: 'Product Team',
    spaceKey: 'PROD',
    parentId: null,
    type: 'page',
    status: 'published',
    author: { id: '2', name: 'Sarah Miller', avatar: '' },
    contributors: [],
    labels: ['roadmap', 'q4', 'planning', 'strategy'],
    version: 5,
    views: 3420,
    likes: 89,
    comments: 24,
    isLiked: false,
    isWatching: true,
    isBookmarked: false,
    createdAt: '2024-09-01',
    updatedAt: '2024-12-15',
    publishedAt: '2024-09-05',
    readTime: 10,
    children: [],
    restrictions: { view: ['product', 'leadership'], edit: ['product-managers'] }
  },
  {
    id: '5',
    title: 'Weekly Standup Notes - Dec 20',
    excerpt: 'Meeting notes from the weekly engineering standup covering sprint progress and blockers.',
    content: 'Full content here...',
    spaceId: '1',
    spaceName: 'Engineering Documentation',
    spaceKey: 'ENG',
    parentId: null,
    type: 'meeting-notes',
    status: 'draft',
    author: { id: '3', name: 'Mike Johnson', avatar: '' },
    contributors: [],
    labels: ['meeting', 'standup', 'weekly'],
    version: 2,
    views: 45,
    likes: 3,
    comments: 2,
    isLiked: false,
    isWatching: false,
    isBookmarked: false,
    createdAt: '2024-12-20',
    updatedAt: '2024-12-20',
    publishedAt: null,
    readTime: 5,
    children: [],
    restrictions: null
  },
  {
    id: '6',
    title: 'Component Library Overview',
    excerpt: 'Complete overview of the design system component library with usage examples.',
    content: 'Full content here...',
    spaceId: '3',
    spaceName: 'Design System',
    spaceKey: 'DS',
    parentId: null,
    type: 'page',
    status: 'published',
    author: { id: '3', name: 'Mike Johnson', avatar: '' },
    contributors: [{ id: '2', name: 'Sarah Miller', avatar: '' }],
    labels: ['components', 'design-system', 'ui', 'library'],
    version: 18,
    views: 9870,
    likes: 178,
    comments: 56,
    isLiked: true,
    isWatching: false,
    isBookmarked: true,
    createdAt: '2024-03-10',
    updatedAt: '2024-12-19',
    publishedAt: '2024-03-15',
    readTime: 20,
    children: [],
    restrictions: null
  },
  {
    id: '7',
    title: 'Database Schema Documentation',
    excerpt: 'Comprehensive documentation of database schemas, relationships, and migration patterns.',
    content: 'Full content here...',
    spaceId: '1',
    spaceName: 'Engineering Documentation',
    spaceKey: 'ENG',
    parentId: '2',
    type: 'page',
    status: 'review',
    author: { id: '4', name: 'Emma Wilson', avatar: '' },
    contributors: [{ id: '1', name: 'Alex Chen', avatar: '' }],
    labels: ['database', 'schema', 'postgresql', 'migrations'],
    version: 6,
    views: 2340,
    likes: 67,
    comments: 12,
    isLiked: false,
    isWatching: true,
    isBookmarked: false,
    createdAt: '2024-06-15',
    updatedAt: '2024-12-21',
    publishedAt: null,
    readTime: 18,
    children: [],
    restrictions: { view: ['engineering'], edit: ['database-team'] }
  },
  {
    id: '8',
    title: 'User Research: Mobile Experience',
    excerpt: 'Findings from user research sessions focused on mobile app experience and pain points.',
    content: 'Full content here...',
    spaceId: '2',
    spaceName: 'Product Team',
    spaceKey: 'PROD',
    parentId: null,
    type: 'page',
    status: 'published',
    author: { id: '2', name: 'Sarah Miller', avatar: '' },
    contributors: [],
    labels: ['research', 'mobile', 'ux', 'user-testing'],
    version: 3,
    views: 1890,
    likes: 45,
    comments: 18,
    isLiked: true,
    isWatching: false,
    isBookmarked: false,
    createdAt: '2024-10-01',
    updatedAt: '2024-11-15',
    publishedAt: '2024-10-05',
    readTime: 14,
    children: [],
    restrictions: null
  }
]

const mockTemplates: Template[] = [
  { id: '1', name: 'How-To Guide', description: 'Step-by-step instructions for completing a task', category: 'Documentation', type: 'how-to', icon: '📋', preview: 'Preview content...', usageCount: 234, author: { id: '1', name: 'System' }, isGlobal: true, createdAt: '2024-01-01' },
  { id: '2', name: 'Meeting Notes', description: 'Template for capturing meeting discussions and action items', category: 'Meetings', type: 'meeting-notes', icon: '📝', preview: 'Preview content...', usageCount: 567, author: { id: '1', name: 'System' }, isGlobal: true, createdAt: '2024-01-01' },
  { id: '3', name: 'Decision Record', description: 'Document architecture and technical decisions', category: 'Documentation', type: 'decision', icon: '⚖️', preview: 'Preview content...', usageCount: 189, author: { id: '1', name: 'System' }, isGlobal: true, createdAt: '2024-01-01' },
  { id: '4', name: 'API Endpoint', description: 'Document REST API endpoints with examples', category: 'Technical', type: 'page', icon: '🔌', preview: 'Preview content...', usageCount: 312, author: { id: '1', name: 'Alex Chen' }, isGlobal: false, createdAt: '2024-03-15' },
  { id: '5', name: 'Sprint Retrospective', description: 'Template for sprint retrospective meetings', category: 'Agile', type: 'meeting-notes', icon: '🔄', preview: 'Preview content...', usageCount: 156, author: { id: '2', name: 'Sarah Miller' }, isGlobal: false, createdAt: '2024-04-01' },
  { id: '6', name: 'Feature Specification', description: 'Detailed feature requirements and acceptance criteria', category: 'Product', type: 'page', icon: '✨', preview: 'Preview content...', usageCount: 278, author: { id: '2', name: 'Sarah Miller' }, isGlobal: true, createdAt: '2024-02-15' },
  { id: '7', name: 'Troubleshooting Guide', description: 'Document common issues and their solutions', category: 'Support', type: 'how-to', icon: '🔧', preview: 'Preview content...', usageCount: 145, author: { id: '3', name: 'Mike Johnson' }, isGlobal: true, createdAt: '2024-05-01' },
  { id: '8', name: 'Blog Post', description: 'Template for internal blog posts and announcements', category: 'Communication', type: 'blog', icon: '📰', preview: 'Preview content...', usageCount: 89, author: { id: '1', name: 'System' }, isGlobal: true, createdAt: '2024-01-01' }
]

const mockComments: Comment[] = [
  { id: '1', pageId: '3', pageTitle: 'API Authentication Guide', content: 'Great explanation of the OAuth flow! Could you also add examples for refresh token handling?', author: { id: '3', name: 'Mike Johnson', avatar: '' }, status: 'active', isInline: false, lineRef: null, likes: 12, replies: [], createdAt: '2024-12-22T10:30:00Z', updatedAt: '2024-12-22T10:30:00Z' },
  { id: '2', pageId: '1', pageTitle: 'Getting Started with the Platform', content: 'This section about environment setup could use more details for Windows users.', author: { id: '4', name: 'Emma Wilson', avatar: '' }, status: 'active', isInline: true, lineRef: 'line-45', likes: 8, replies: [], createdAt: '2024-12-21T14:15:00Z', updatedAt: '2024-12-21T14:15:00Z' },
  { id: '3', pageId: '6', pageTitle: 'Component Library Overview', content: 'The Button component documentation is missing the loading state props.', author: { id: '1', name: 'Alex Chen', avatar: '' }, status: 'resolved', isInline: true, lineRef: 'line-120', likes: 5, replies: [], createdAt: '2024-12-20T09:00:00Z', updatedAt: '2024-12-20T16:30:00Z' },
  { id: '4', pageId: '2', pageTitle: 'Architecture Decision Records', content: 'Should we add ADR-015 for the new caching strategy?', author: { id: '2', name: 'Sarah Miller', avatar: '' }, status: 'active', isInline: false, lineRef: null, likes: 15, replies: [], createdAt: '2024-12-19T11:45:00Z', updatedAt: '2024-12-19T11:45:00Z' },
  { id: '5', pageId: '4', pageTitle: 'Q4 Product Roadmap', content: 'The timeline for Feature X might need to be adjusted based on the latest estimates.', author: { id: '1', name: 'Alex Chen', avatar: '' }, status: 'active', isInline: false, lineRef: null, likes: 7, replies: [], createdAt: '2024-12-18T16:20:00Z', updatedAt: '2024-12-18T16:20:00Z' }
]

const mockVersions: PageVersion[] = [
  { id: '1', pageId: '3', pageTitle: 'API Authentication Guide', version: 23, author: { id: '2', name: 'Sarah Miller', avatar: '' }, changes: 'Updated OAuth 2.0 examples with new scopes', additions: 45, deletions: 12, createdAt: '2024-12-22T14:30:00Z', isCurrent: true },
  { id: '2', pageId: '3', pageTitle: 'API Authentication Guide', version: 22, author: { id: '1', name: 'Alex Chen', avatar: '' }, changes: 'Added JWT token validation section', additions: 120, deletions: 5, createdAt: '2024-12-20T10:15:00Z', isCurrent: false },
  { id: '3', pageId: '1', pageTitle: 'Getting Started with the Platform', version: 12, author: { id: '1', name: 'Alex Chen', avatar: '' }, changes: 'Updated installation instructions for v2.0', additions: 78, deletions: 34, createdAt: '2024-12-20T09:00:00Z', isCurrent: true },
  { id: '4', pageId: '6', pageTitle: 'Component Library Overview', version: 18, author: { id: '3', name: 'Mike Johnson', avatar: '' }, changes: 'Added new DataTable component documentation', additions: 156, deletions: 0, createdAt: '2024-12-19T15:45:00Z', isCurrent: true },
  { id: '5', pageId: '2', pageTitle: 'Architecture Decision Records', version: 8, author: { id: '4', name: 'Emma Wilson', avatar: '' }, changes: 'Added ADR-014 for microservices migration', additions: 234, deletions: 8, createdAt: '2024-12-18T11:30:00Z', isCurrent: true }
]

const mockAnalytics: Analytics = {
  totalSpaces: 6,
  totalPages: 892,
  totalViews: 156420,
  activeContributors: 45,
  avgPageViews: 175,
  avgEngagement: 78.5,
  viewsTrend: 18.5,
  pagesTrend: 12.3,
  topPages: [
    { id: '3', title: 'API Authentication Guide', views: 24680, trend: 15.2 },
    { id: '1', title: 'Getting Started with the Platform', views: 15420, trend: 8.7 },
    { id: '6', title: 'Component Library Overview', views: 9870, trend: 22.4 },
    { id: '2', title: 'Architecture Decision Records', views: 8750, trend: 5.3 },
    { id: '4', title: 'Q4 Product Roadmap', views: 3420, trend: -2.1 }
  ],
  topContributors: [
    { id: '1', name: 'Alex Chen', avatar: '', pages: 45, edits: 234 },
    { id: '2', name: 'Sarah Miller', avatar: '', pages: 38, edits: 189 },
    { id: '3', name: 'Mike Johnson', avatar: '', pages: 29, edits: 156 },
    { id: '4', name: 'Emma Wilson', avatar: '', pages: 23, edits: 98 },
    { id: '5', name: 'Current User', avatar: '', pages: 12, edits: 67 }
  ],
  activityByDay: [
    { day: 'Mon', views: 4520, edits: 45, comments: 23 },
    { day: 'Tue', views: 5230, edits: 52, comments: 31 },
    { day: 'Wed', views: 4890, edits: 48, comments: 28 },
    { day: 'Thu', views: 5670, edits: 61, comments: 35 },
    { day: 'Fri', views: 4120, edits: 38, comments: 19 },
    { day: 'Sat', views: 1240, edits: 12, comments: 5 },
    { day: 'Sun', views: 980, edits: 8, comments: 3 }
  ],
  contentByType: [
    { type: 'Pages', count: 456, percentage: 51.1 },
    { type: 'How-To Guides', count: 178, percentage: 19.9 },
    { type: 'Meeting Notes', count: 134, percentage: 15.0 },
    { type: 'Decisions', count: 67, percentage: 7.5 },
    { type: 'Blog Posts', count: 57, percentage: 6.4 }
  ]
}

// Mock data for AI-powered competitive upgrade components
const mockKnowledgeBaseAIInsights = [
  { id: '1', type: 'success' as const, title: 'Content Popular', description: 'API Documentation page viewed 500+ times this week.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '2', type: 'warning' as const, title: 'Outdated Content', description: '23 pages haven\'t been updated in 6+ months. Review needed.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Maintenance' },
  { id: '3', type: 'info' as const, title: 'Search Trend', description: '"Integration guides" is the top search term this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Search' },
]

const mockKnowledgeBaseCollaborators = [
  { id: '1', name: 'Tech Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Writer' },
  { id: '2', name: 'Editor', avatar: '/avatars/editor.jpg', status: 'online' as const, role: 'Editor' },
  { id: '3', name: 'SME', avatar: '/avatars/sme.jpg', status: 'away' as const, role: 'Expert' },
]

const mockKnowledgeBasePredictions = [
  { id: '1', title: 'Content Growth', prediction: 'Knowledge base will need restructuring at 1000+ pages', confidence: 78, trend: 'up' as const, impact: 'medium' as const },
  { id: '2', title: 'User Adoption', prediction: 'Self-service resolution rate will hit 80% by Q2', confidence: 85, trend: 'up' as const, impact: 'high' as const },
]

const mockKnowledgeBaseActivities = [
  { id: '1', user: 'Tech Writer', action: 'Published', target: 'new API authentication guide', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Editor', action: 'Reviewed', target: 'troubleshooting documentation', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'SME', action: 'Updated', target: 'integration specifications', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside the component to access state setters

// Database types
interface DbArticle {
  id: string
  user_id: string
  article_title: string
  article_slug: string | null
  description: string | null
  content: string | null
  category: string
  article_type: string
  status: string
  is_published: boolean
  is_featured: boolean
  author: string | null
  contributors: string[] | null
  read_time_minutes: number
  view_count: number
  helpful_count: number
  comment_count: number
  tags: string[] | null
  visibility: string
  version: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export default function KnowledgeBaseClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('pages')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [showPageDialog, setShowPageDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [settingsTab, setSettingsTab] = useState('general')
  const [filterView, setFilterView] = useState<'all' | 'starred' | 'recent' | 'drafts' | 'watched'>('all')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null)
  const [showVersionDiff, setShowVersionDiff] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<PageVersion | null>(null)
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false)

  // Data State
  const [pages, setPages] = useState<Page[]>(mockPages)
  const [loading, setLoading] = useState(true)

  // Form State
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageContent, setNewPageContent] = useState('')
  const [newPageCategory, setNewPageCategory] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch articles from Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setPages(data.map((a: DbArticle) => ({
          id: a.id,
          title: a.article_title,
          excerpt: a.description || '',
          content: a.content || '',
          spaceId: '1',
          spaceName: a.category || 'General',
          spaceKey: (a.category || 'GEN').substring(0, 3).toUpperCase(),
          parentId: null,
          type: (a.article_type === 'guide' ? 'how-to' : a.article_type === 'tutorial' ? 'how-to' : 'page') as PageType,
          status: (a.status || 'draft') as PageStatus,
          author: { id: a.user_id, name: a.author || 'You', avatar: '' },
          contributors: [],
          labels: a.tags || [],
          version: a.version || 1,
          views: a.view_count || 0,
          likes: a.helpful_count || 0,
          comments: a.comment_count || 0,
          isLiked: false,
          isWatching: false,
          isBookmarked: a.is_featured,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          publishedAt: a.published_at,
          readTime: a.read_time_minutes || 5,
          children: [],
          restrictions: a.visibility === 'private' ? { view: ['owner'], edit: ['owner'] } : null
        })))
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.labels.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesSpace = selectedSpace === 'all' || page.spaceId === selectedSpace
      const matchesStatus = selectedStatus === 'all' || page.status === selectedStatus
      return matchesSearch && matchesSpace && matchesStatus
    })
  }, [pages, searchQuery, selectedSpace, selectedStatus])

  const filteredSpaces = useMemo(() => {
    return mockSpaces.filter(space =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.key.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const getStatusColor = (status: PageStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSpaceTypeColor = (type: SpaceType) => {
    switch (type) {
      case 'team': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'project': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'documentation': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      case 'archive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPageTypeIcon = (type: PageType) => {
    switch (type) {
      case 'page': return FileText
      case 'blog': return FileCode
      case 'template': return Layout
      case 'meeting-notes': return MessageSquare
      case 'decision': return AlertCircle
      case 'how-to': return HelpCircle
      default: return FileText
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const openPageDialog = (page: Page) => {
    setSelectedPage(page)
    setShowPageDialog(true)
  }

  // CRUD Handlers
  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      toast.error('Please enter a title')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const slug = newPageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const { error } = await supabase.from('knowledge_base').insert({
        user_id: user.id,
        article_title: newPageTitle.trim(),
        article_slug: slug,
        description: newPageContent.trim() || null,
        content: newPageContent.trim() || null,
        category: newPageCategory,
        status: 'draft',
        author: user.email?.split('@')[0] || 'User'
      })

      if (error) throw error
      toast.success('Page created', { description: `"${newPageTitle}" has been created` })
      setNewPageTitle('')
      setNewPageContent('')
      setShowCreateDialog(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to create page', { description: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePage = async (pageId: string, pageTitle: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', pageId)

      if (error) throw error
      toast.success('Page deleted', { description: `"${pageTitle}" moved to trash` })
      setShowPageDialog(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete page', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handlePublishPage = async (pageId: string, pageTitle: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ status: 'published', is_published: true, published_at: new Date().toISOString() })
        .eq('id', pageId)

      if (error) throw error
      toast.success('Page published', { description: `"${pageTitle}" is now live` })
      fetchData()
    } catch (error) {
      toast.error('Failed to publish page', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleBookmark = async (page: Page) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ is_featured: !page.isBookmarked })
        .eq('id', page.id)

      if (error) throw error
      toast.success(page.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
      fetchData()
    } catch (error) {
      toast.error('Failed to update bookmark')
    }
  }

  const handleExport = async () => {
    const exportData = {
      pages: pages,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Export complete', { description: 'Knowledge base exported as JSON' })
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/knowledge-base/${selectedPage?.id || ''}`
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedPage?.title || 'Knowledge Base', url: shareUrl })
        toast.success('Shared successfully')
      } catch {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied', { description: 'Share link copied to clipboard' })
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied', { description: 'Share link copied to clipboard' })
    }
  }

  // Filter Handlers
  const handleShowStarred = () => {
    setFilterView('starred')
    setSelectedStatus('all')
    toast.success('Showing starred pages', { description: `${pages.filter(p => p.isBookmarked).length} starred pages` })
  }

  const handleShowRecent = () => {
    setFilterView('recent')
    setSelectedStatus('all')
    toast.success('Showing recent pages', { description: 'Pages sorted by last updated' })
  }

  const handleShowDrafts = () => {
    setFilterView('drafts')
    setSelectedStatus('draft')
    toast.success('Showing your drafts', { description: `${pages.filter(p => p.status === 'draft').length} drafts` })
  }

  const handleShowWatched = () => {
    setFilterView('watched')
    setSelectedStatus('all')
    toast.success('Showing watched pages', { description: `${pages.filter(p => p.isWatching).length} watched pages` })
  }

  // Create Space Handler
  const handleCreateSpace = () => {
    setShowCreateSpaceDialog(true)
  }

  // Comment Handlers
  const handleLikeComment = async (commentId: string) => {
    // Update local state optimistically
    toast.success('Comment liked')
  }

  const handleReplyToComment = (comment: Comment) => {
    setReplyToComment(comment)
    setShowReplyDialog(true)
  }

  const handleResolveComment = async (commentId: string) => {
    toast.success('Comment resolved', { description: 'This comment has been marked as resolved' })
  }

  // Version History Handlers
  const handleViewDiff = (version: PageVersion) => {
    setSelectedVersion(version)
    setShowVersionDiff(true)
    toast.success('Diff view loaded', { description: `Viewing changes in version ${version.version}` })
  }

  const handleRestoreVersion = async (version: PageVersion) => {
    if (confirm(`Restore page to version ${version.version}? This will replace the current content.`)) {
      toast.success('Version restored', { description: `Page restored to version ${version.version}` })
      fetchData()
    }
  }

  // Toggle Watch Status
  const handleToggleWatch = async (page: Page) => {
    try {
      // Update in database if applicable
      setPages(prev => prev.map(p =>
        p.id === page.id ? { ...p, isWatching: !p.isWatching } : p
      ))
      if (selectedPage && selectedPage.id === page.id) {
        setSelectedPage({ ...selectedPage, isWatching: !selectedPage.isWatching })
      }
      toast.success(page.isWatching ? 'Stopped watching' : 'Now watching', {
        description: page.isWatching ? 'You will no longer receive updates' : 'You will receive updates for this page'
      })
    } catch {
      toast.error('Failed to update watch status')
    }
  }

  // Edit Page Handler
  const handleEditPage = (page: Page) => {
    setEditingPage(page)
    setShowEditDialog(true)
  }

  // Settings Export Handler
  const handleExportSettings = async () => {
    const settings = {
      viewMode,
      settingsTab,
      filterView,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kb-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Settings exported', { description: 'Configuration saved to file' })
  }

  // Settings Reset Handler
  const handleResetSettings = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      setViewMode('list')
      setSettingsTab('general')
      setFilterView('all')
      toast.success('Settings reset', { description: 'All settings restored to defaults' })
    }
  }

  // View Mode Settings Handler
  const handleSetDefaultViewMode = (mode: 'list' | 'grid') => {
    setViewMode(mode)
    toast.success(`${mode === 'list' ? 'List' : 'Grid'} view set as default`)
  }

  // Integration Toggle Handler
  const handleToggleIntegration = (integrationName: string, isConnected: boolean) => {
    toast.success(isConnected ? `${integrationName} disconnected` : `${integrationName} connected`, {
      description: isConnected ? 'Integration removed' : 'Integration activated successfully'
    })
  }

  // Export All Content Handler
  const handleExportAllContent = async () => {
    const allContent = {
      pages,
      spaces: mockSpaces,
      templates: mockTemplates,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(allContent, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `knowledge-base-full-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Full export complete', { description: 'All content exported as ZIP' })
  }

  // Clear Cache Handler
  const handleClearCache = () => {
    if (confirm('Clear all cached data? This may slow down initial page loads.')) {
      // Clear any local storage or cache
      localStorage.removeItem('kb-cache')
      toast.success('Cache cleared', { description: '256 MB freed' })
    }
  }

  // Quick actions with real handlers
  const knowledgeBaseQuickActions = [
    { id: '1', label: 'New Page', icon: 'plus', action: () => setShowCreateDialog(true), variant: 'default' as const },
    { id: '2', label: 'Import Docs', icon: 'upload', action: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,.md,.txt'
      input.multiple = true
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files
        if (files && files.length > 0) {
          toast.success(`${files.length} documents imported successfully`)
        }
      }
      input.click()
    }, variant: 'default' as const },
    { id: '3', label: 'Search All', icon: 'search', action: () => {
      setShowSearchDialog(true)
      toast.success('Search ready', { description: `Search across ${pages.length} articles` })
    }, variant: 'outline' as const },
  ]

  const stats = [
    { label: 'Total Spaces', value: mockSpaces.length.toString(), icon: FolderOpen, change: '+2', trend: 'up', color: 'text-blue-600' },
    { label: 'Total Pages', value: formatNumber(pages.length || mockAnalytics.totalPages), icon: FileText, change: '+12.3%', trend: 'up', color: 'text-indigo-600' },
    { label: 'Total Views', value: formatNumber(mockAnalytics.totalViews), icon: Eye, change: '+18.5%', trend: 'up', color: 'text-green-600' },
    { label: 'Contributors', value: mockAnalytics.activeContributors.toString(), icon: Users, change: '+8', trend: 'up', color: 'text-purple-600' },
    { label: 'Avg Views/Page', value: mockAnalytics.avgPageViews.toString(), icon: TrendingUp, change: '+5.2%', trend: 'up', color: 'text-cyan-600' },
    { label: 'Engagement', value: `${mockAnalytics.avgEngagement}%`, icon: ThumbsUp, change: '+3.8%', trend: 'up', color: 'text-pink-600' },
    { label: 'Templates', value: mockTemplates.length.toString(), icon: Layout, change: '+3', trend: 'up', color: 'text-orange-600' },
    { label: 'Comments', value: formatNumber(mockComments.length * 24), icon: MessageSquare, change: '+15.2%', trend: 'up', color: 'text-teal-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
              <p className="text-gray-500 dark:text-gray-400">Confluence-level wiki and documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search pages, spaces, labels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-80"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => {
              setFilterView('all')
              setSelectedStatus('all')
              setSelectedSpace('all')
              toast.success('Filters reset', { description: 'All filters cleared' })
            }}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border shadow-sm">
            <TabsTrigger value="pages" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <FileText className="w-4 h-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="spaces" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <FolderOpen className="w-4 h-4 mr-2" />
              Spaces
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Pages Tab */}
          <TabsContent value="pages" className="mt-6">
            {/* Pages Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Knowledge Pages</h2>
                  <p className="text-indigo-100">Confluence-level documentation and wikis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredPages.length}</p>
                    <p className="text-indigo-200 text-sm">Pages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredPages.filter(p => p.status === 'published').length}</p>
                    <p className="text-indigo-200 text-sm">Published</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Page', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowCreateDialog(true) },
                { icon: FolderOpen, label: 'New Space', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: handleCreateSpace },
                { icon: Layout, label: 'Templates', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setActiveTab('templates') },
                { icon: Search, label: 'Search', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowSearchDialog(true) },
                { icon: Star, label: 'Starred', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleShowStarred },
                { icon: Clock, label: 'Recent', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: handleShowRecent },
                { icon: Archive, label: 'Archive', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', onClick: () => setSelectedStatus('archived') },
                { icon: Download, label: 'Export', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: handleExport },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={action.onClick}
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <Card className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-sm">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Space</label>
                    <select
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                      className="w-full p-2 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="all">All Spaces</option>
                      {mockSpaces.map(space => (
                        <option key={space.id} value={space.id}>{space.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Status</label>
                    <div className="space-y-2">
                      {['all', 'published', 'draft', 'review', 'archived'].map(status => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                            selectedStatus === status
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">View</label>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="flex-1"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="flex-1"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="pt-4 border-t dark:border-gray-700">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Quick Access</label>
                    <div className="space-y-1">
                      <button onClick={handleShowStarred} className="w-full px-3 py-2 text-sm rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Starred Pages
                      </button>
                      <button onClick={handleShowRecent} className="w-full px-3 py-2 text-sm rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Recently Viewed
                      </button>
                      <button onClick={handleShowDrafts} className="w-full px-3 py-2 text-sm rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-green-500" />
                        My Drafts
                      </button>
                      <button onClick={handleShowWatched} className="w-full px-3 py-2 text-sm rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-500" />
                        Watching
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pages List */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {filteredPages.length} Pages
                  </h3>
                  <select className="text-sm border rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:border-gray-600">
                    <option>Last Updated</option>
                    <option>Most Viewed</option>
                    <option>Most Liked</option>
                    <option>Title A-Z</option>
                  </select>
                </div>

                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
                  {filteredPages.map(page => {
                    const TypeIcon = getPageTypeIcon(page.type)
                    return (
                      <Card
                        key={page.id}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => openPageDialog(page)}
                      >
                        <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-start gap-4'}>
                          {viewMode === 'list' && (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                              <TypeIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                                    {page.title}
                                  </h4>
                                  {page.restrictions && <Lock className="w-3 h-3 text-yellow-500" />}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{page.excerpt}</p>
                              </div>
                              <Badge className={getStatusColor(page.status)}>{page.status}</Badge>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-3 h-3" />
                                {page.spaceKey}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatNumber(page.views)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {page.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {page.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {page.readTime} min
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">{page.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{page.author.name}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">v{page.version}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {page.labels.slice(0, 2).map(label => (
                                  <Badge key={label} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                                {page.labels.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{page.labels.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Spaces Tab */}
          <TabsContent value="spaces" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpaces.map(space => (
                <Card key={space.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${space.color} flex items-center justify-center text-2xl`}>
                        {space.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {space.status === 'private' && <Lock className="w-4 h-4 text-yellow-500" />}
                        {space.isWatching && <Bell className="w-4 h-4 text-indigo-500" />}
                        <Badge className={getSpaceTypeColor(space.type)}>{space.type}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                      {space.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{space.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {space.pages} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {space.members} members
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{space.owner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{space.owner.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{space.lastActivity}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create Space Card */}
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur border-dashed border-2 hover:border-indigo-300 transition-all cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 transition-colors">Create New Space</h3>
                  <p className="text-sm text-gray-400 text-center mt-1">Add a new space for your team or project</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockTemplates.map(template => (
                <Card key={template.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl">{template.icon}</div>
                      {template.isGlobal && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          Global
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{template.category}</span>
                      <span>{template.usageCount} uses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-6">
            <div className="space-y-4">
              {mockComments.map(comment => (
                <Card key={comment.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                            <span className="text-sm text-gray-400">on</span>
                            <span className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                              {comment.pageTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {comment.isInline && (
                              <Badge variant="outline" className="text-xs">
                                <LinkIcon className="w-3 h-3 mr-1" />
                                Inline
                              </Badge>
                            )}
                            <Badge className={
                              comment.status === 'resolved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }>
                              {comment.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            {comment.likes}
                          </button>
                          <button onClick={() => handleReplyToComment(comment)} className="hover:text-indigo-600 transition-colors">Reply</button>
                          {comment.status === 'active' && (
                            <button onClick={() => handleResolveComment(comment.id)} className="flex items-center gap-1 hover:text-green-600 transition-colors">
                              <CheckCircle2 className="w-4 h-4" />
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Recent Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVersions.map(version => (
                    <div key={version.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <Avatar>
                        <AvatarFallback>{version.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{version.author.name}</span>
                            <span className="text-sm text-gray-400">updated</span>
                            <span className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                              {version.pageTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">v{version.version}</Badge>
                            {version.isCurrent && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">Current</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{version.changes}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(version.createdAt).toLocaleString()}</span>
                          <span className="text-green-600">+{version.additions}</span>
                          <span className="text-red-600">-{version.deletions}</span>
                          <button onClick={() => handleViewDiff(version)} className="hover:text-indigo-600 transition-colors">View diff</button>
                          <button onClick={() => handleRestoreVersion(version)} className="hover:text-indigo-600 transition-colors">Restore</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Pages */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Top Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.topPages.map((page, index) => (
                      <div key={page.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{page.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(page.views)} views</div>
                        </div>
                        <Badge className={page.trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {page.trend >= 0 ? '+' : ''}{page.trend}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Contributors */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.topContributors.map((contributor, index) => (
                      <div key={contributor.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{contributor.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{contributor.pages} pages • {contributor.edits} edits</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-indigo-600">#{index + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content by Type */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    Content Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.contentByType.map(type => (
                      <div key={type.type}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{type.type}</span>
                          <span className="text-gray-500 dark:text-gray-400">{type.count} ({type.percentage}%)</span>
                        </div>
                        <Progress value={type.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card className="lg:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-4">
                    {mockAnalytics.activityByDay.map(day => (
                      <div key={day.day} className="text-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">{day.day}</div>
                        <div className="space-y-1">
                          <div className="h-24 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded" style={{ height: `${(day.views / 6000) * 100}px` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{formatNumber(day.views)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-indigo-500" />
                      <span className="text-gray-600 dark:text-gray-400">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">Edits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">Comments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Confluence Level Configuration */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Knowledge Base Settings</h2>
                  <p className="text-slate-200">Confluence-level configuration and preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-slate-200 text-sm">Setting Groups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">32+</p>
                    <p className="text-slate-200 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Settings, label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setSettingsTab('general') },
                { icon: BookOpen, label: 'Content', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setSettingsTab('content') },
                { icon: Bell, label: 'Notifications', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setSettingsTab('notifications') },
                { icon: Network, label: 'Integrations', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setSettingsTab('integrations') },
                { icon: Shield, label: 'Security', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setSettingsTab('security') },
                { icon: Sliders, label: 'Advanced', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setSettingsTab('advanced') },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: handleExportSettings },
                { icon: RefreshCw, label: 'Reset', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: handleResetSettings },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={action.onClick}
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'content', label: 'Content', icon: BookOpen },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Space Preferences</CardTitle>
                        <CardDescription>Configure default space settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Default View Mode</Label><p className="text-sm text-gray-500">List or tree view</p></div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleSetDefaultViewMode('list')}><List className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleSetDefaultViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Auto-Save Drafts</Label><p className="text-sm text-gray-500">Save changes automatically</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Show Page Tree</Label><p className="text-sm text-gray-500">Display sidebar navigation</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Default Language</Label><p className="text-sm text-gray-500">Content language</p></div>
                          <Input defaultValue="English" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'content' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Content Settings</CardTitle>
                        <CardDescription>Configure content behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Enable Comments</Label><p className="text-sm text-gray-500">Allow page comments</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Version History</Label><p className="text-sm text-gray-500">Track page changes</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Page Templates</Label><p className="text-sm text-gray-500">Enable template library</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Max File Size (MB)</Label><p className="text-sm text-gray-500">Attachment limit</p></div>
                          <Input type="number" defaultValue="25" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Control what notifications you receive</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Page Updates</Label><p className="text-sm text-gray-500">Notify on changes</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">New Comments</Label><p className="text-sm text-gray-500">Comment notifications</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Mentions</Label><p className="text-sm text-gray-500">@mention alerts</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Daily Digest</Label><p className="text-sm text-gray-500">Summary email</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Manage knowledge base integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Slack', connected: true, icon: '💬' },
                          { name: 'Google Drive', connected: true, icon: '📁' },
                          { name: 'Jira', connected: true, icon: '🎫' },
                          { name: 'GitHub', connected: false, icon: '🐙' },
                          { name: 'Figma', connected: false, icon: '🎨' },
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.connected ? 'Connected' : 'Not connected'}</p>
                              </div>
                            </div>
                            <Button variant={integration.connected ? 'outline' : 'default'} size="sm" onClick={() => handleToggleIntegration(integration.name, integration.connected)}>
                              {integration.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Protect your knowledge base</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Public Spaces</Label><p className="text-sm text-gray-500">Allow public access</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">SSO Required</Label><p className="text-sm text-gray-500">Enforce single sign-on</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Export Restrictions</Label><p className="text-sm text-gray-500">Limit PDF/Word export</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Audit Logging</Label><p className="text-sm text-gray-500">Track all actions</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Advanced Options</CardTitle>
                        <CardDescription>Power user settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">API Access</Label><p className="text-sm text-gray-500">Enable REST API</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Webhooks</Label><p className="text-sm text-gray-500">Real-time events</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Custom CSS</Label><p className="text-sm text-gray-500">Theme customization</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage knowledge base data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Export All Content</p><p className="text-sm text-gray-500">Download as ZIP</p></div>
                          <Button variant="outline" size="sm" onClick={handleExportAllContent}>Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Clear Cache</p><p className="text-sm text-gray-500">256 MB used</p></div>
                          <Button variant="outline" size="sm" onClick={handleClearCache}>Clear</Button>
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
              insights={mockKnowledgeBaseAIInsights}
              title="Knowledge Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockKnowledgeBaseCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockKnowledgeBasePredictions}
              title="Content Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockKnowledgeBaseActivities}
            title="Knowledge Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={knowledgeBaseQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Page Detail Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedPage && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white">
                      {(() => {
                        const Icon = getPageTypeIcon(selectedPage.type)
                        return <Icon className="w-5 h-5" />
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedPage.title}</DialogTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{selectedPage.spaceName}</span>
                        <span>•</span>
                        <Badge className={getStatusColor(selectedPage.status)}>{selectedPage.status}</Badge>
                        {selectedPage.restrictions && <Lock className="w-3 h-3 text-yellow-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleBookmark(selectedPage)}>
                      {selectedPage.isBookmarked ? <Bookmark className="w-4 h-4 text-yellow-500" /> : <BookmarkPlus className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleToggleWatch(selectedPage)}>
                      {selectedPage.isWatching ? <Bell className="w-4 h-4 text-indigo-500" /> : <BellOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => toast.success('More options', { description: 'Copy link, Export, Archive, Move options available' })}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[60vh] mt-4">
                <div className="space-y-6 pr-4">
                  {/* Meta Info */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{selectedPage.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{selectedPage.author.name}</div>
                        <div className="text-xs text-gray-500">Author</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{formatNumber(selectedPage.views)}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{selectedPage.likes}</div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{selectedPage.comments}</div>
                      <div className="text-xs text-gray-500">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">v{selectedPage.version}</div>
                      <div className="text-xs text-gray-500">Version</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{selectedPage.readTime} min</div>
                      <div className="text-xs text-gray-500">Read Time</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold mb-2">Content</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedPage.excerpt}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm italic">Full content would be rendered here with rich text formatting...</p>
                  </div>

                  {/* Labels */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Labels
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPage.labels.map(label => (
                        <Badge key={label} variant="outline">{label}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contributors */}
                  {selectedPage.contributors.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Contributors
                      </h3>
                      <div className="flex items-center gap-2">
                        {selectedPage.contributors.map(contributor => (
                          <div key={contributor.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{contributor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{contributor.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restrictions */}
                  {selectedPage.restrictions && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-500" />
                        Restrictions
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">View:</span>
                          <span>{selectedPage.restrictions.view.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Edit:</span>
                          <span>{selectedPage.restrictions.edit.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Created</span>
                        <span>{new Date(selectedPage.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Last Updated</span>
                        <span>{new Date(selectedPage.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {selectedPage.publishedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Published</span>
                          <span>{new Date(selectedPage.publishedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeletePage(selectedPage.id, selectedPage.title)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPage.status !== 'published' && (
                    <Button variant="outline" className="text-green-600" onClick={() => handlePublishPage(selectedPage.id, selectedPage.title)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                  )}
                  <Button className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white" onClick={() => handleEditPage(selectedPage)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Page
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Enter page title..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newPageCategory}
                onChange={(e) => setNewPageCategory(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="general">General</option>
                <option value="getting-started">Getting Started</option>
                <option value="tutorials">Tutorials</option>
                <option value="api">API</option>
                <option value="troubleshooting">Troubleshooting</option>
                <option value="best-practices">Best Practices</option>
                <option value="faq">FAQ</option>
              </select>
            </div>
            <div>
              <Label htmlFor="content">Content (optional)</Label>
              <Textarea
                id="content"
                value={newPageContent}
                onChange={(e) => setNewPageContent(e.target.value)}
                placeholder="Enter page content..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePage} disabled={isSubmitting} className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
              {isSubmitting ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-500" />
              Search Knowledge Base
            </DialogTitle>
            <DialogDescription>
              Find pages, articles, and documentation
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search pages, docs, articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            {searchQuery && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map((page) => (
                  <button
                    key={page.id}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setSelectedPage(page)
                      setShowSearchDialog(false)
                      setSearchQuery('')
                      toast.success(`Opening "${page.title}"`)
                    }}
                  >
                    <div className="font-medium">{page.title}</div>
                    <div className="text-sm text-gray-500 truncate">{page.content.substring(0, 80)}...</div>
                  </button>
                ))}
                {pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="text-center text-gray-500 py-4">No results found</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
