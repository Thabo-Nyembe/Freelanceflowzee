// Feedback V2 - UserVoice Level Feedback Management Platform
// Comprehensive customer feedback portal with voting, roadmap, and insights
'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageSquare,
  ThumbsUp,
  Search,
  Plus,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Lightbulb,
  Bug,
  Sparkles,
  MessageCircle,
  ArrowUp,
  CheckCircle2,
  Eye,
  Link2,
  GitBranch,
  Activity,
  Send,
  Settings,
  LayoutGrid,
  List,
  Zap,
  Award,
  Bell,
  Webhook,
  AlertOctagon,
  Sliders,
  Globe,
  Download,
  Copy,
  RefreshCw
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




// Types
type IdeaStatus = 'new' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined' | 'duplicate'
type IdeaCategory = 'feature' | 'improvement' | 'bug' | 'integration' | 'ux' | 'performance' | 'other'
type VotePriority = 'critical' | 'important' | 'nice_to_have' | 'low'
type SentimentType = 'positive' | 'neutral' | 'negative' | 'mixed'
type NPSCategory = 'promoter' | 'passive' | 'detractor'

interface FeedbackUser {
  id: string
  name: string
  email: string
  avatar?: string
  company?: string
  plan: 'free' | 'pro' | 'enterprise'
  totalVotes: number
  ideasSubmitted: number
  joinedAt: string
}

interface Idea {
  id: string
  title: string
  description: string
  category: IdeaCategory
  status: IdeaStatus
  priority: VotePriority
  votes: number
  voters: string[]
  comments: number
  author: FeedbackUser
  createdAt: string
  updatedAt: string
  plannedRelease?: string
  linkedIdeas: string[]
  tags: string[]
  impactScore: number
  effortScore: number
  adminResponse?: {
    message: string
    respondedAt: string
    respondedBy: string
  }
  mergedInto?: string
  subscribers: number
  views: number
  product?: string
}

interface Comment {
  id: string
  ideaId: string
  author: FeedbackUser
  content: string
  createdAt: string
  likes: number
  isAdminResponse: boolean
  parentId?: string
  replies: Comment[]
}

interface NPSResponse {
  id: string
  score: number
  category: NPSCategory
  feedback: string
  user: FeedbackUser
  createdAt: string
  followedUp: boolean
  tags: string[]
}

interface Segment {
  id: string
  name: string
  description: string
  filters: { field: string; operator: string; value: string }[]
  userCount: number
  color: string
  avgNPS: number
}

interface RoadmapItem {
  id: string
  ideaId: string
  title: string
  status: 'now' | 'next' | 'later' | 'shipped'
  quarter?: string
  votes: number
  progress: number
  team?: string
}

interface FeedbackAnalytics {
  totalIdeas: number
  totalVotes: number
  avgResponseTime: string
  implementationRate: number
  topTrends: { term: string; count: number; change: number }[]
  sentimentBreakdown: Record<SentimentType, number>
  categoryBreakdown: Record<IdeaCategory, number>
}

// Mock data
const mockUsers: FeedbackUser[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah@company.com', company: 'TechCorp', plan: 'enterprise', totalVotes: 47, ideasSubmitted: 12, joinedAt: '2024-01-15' },
  { id: 'u2', name: 'Mike Johnson', email: 'mike@startup.io', company: 'Startup.io', plan: 'pro', totalVotes: 23, ideasSubmitted: 8, joinedAt: '2024-02-20' },
  { id: 'u3', name: 'Emily Davis', email: 'emily@design.co', company: 'Design Co', plan: 'pro', totalVotes: 35, ideasSubmitted: 15, joinedAt: '2024-01-08' },
  { id: 'u4', name: 'James Wilson', email: 'james@enterprise.com', company: 'Enterprise Inc', plan: 'enterprise', totalVotes: 89, ideasSubmitted: 22, joinedAt: '2023-11-30' },
]

const mockIdeas: Idea[] = [
  {
    id: 'idea1',
    title: 'Dark mode support across all pages',
    description: 'Add a system-wide dark mode toggle that respects user preferences and provides a comfortable viewing experience in low-light environments. Should sync across devices.',
    category: 'feature',
    status: 'in_progress',
    priority: 'critical',
    votes: 342,
    voters: ['u1', 'u2', 'u3'],
    comments: 45,
    author: mockUsers[0],
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    plannedRelease: 'Q1 2025',
    linkedIdeas: ['idea5'],
    tags: ['accessibility', 'ui', 'theming'],
    impactScore: 92,
    effortScore: 65,
    adminResponse: { message: 'Great suggestion! Currently in development.', respondedAt: '2024-12-01T09:00:00Z', respondedBy: 'Product Team' },
    subscribers: 156,
    views: 2341,
    product: 'Core Platform'
  },
  {
    id: 'idea2',
    title: 'API webhook improvements',
    description: 'Add retry logic, better error handling, and a webhook testing interface. Include delivery status tracking and historical logs for debugging.',
    category: 'improvement',
    status: 'planned',
    priority: 'important',
    votes: 187,
    voters: ['u4'],
    comments: 23,
    author: mockUsers[3],
    createdAt: '2024-08-10T11:00:00Z',
    updatedAt: '2024-12-18T16:00:00Z',
    plannedRelease: 'Q2 2025',
    linkedIdeas: [],
    tags: ['api', 'developer-experience', 'integrations'],
    impactScore: 85,
    effortScore: 78,
    subscribers: 89,
    views: 1567,
    product: 'Developer API'
  },
  {
    id: 'idea3',
    title: 'Slack integration for notifications',
    description: 'Native Slack integration to receive real-time notifications about important events, mentions, and updates directly in Slack channels.',
    category: 'integration',
    status: 'shipped',
    priority: 'important',
    votes: 256,
    voters: ['u1', 'u2'],
    comments: 67,
    author: mockUsers[1],
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
    linkedIdeas: [],
    tags: ['slack', 'notifications', 'productivity'],
    impactScore: 88,
    effortScore: 45,
    adminResponse: { message: 'Shipped in v2.5! Check it out.', respondedAt: '2024-11-01T10:00:00Z', respondedBy: 'Engineering Team' },
    subscribers: 234,
    views: 4521,
    product: 'Integrations'
  },
  {
    id: 'idea4',
    title: 'Mobile app for iOS and Android',
    description: 'Native mobile applications with offline support, push notifications, and full feature parity with the web app.',
    category: 'feature',
    status: 'under_review',
    priority: 'critical',
    votes: 523,
    voters: ['u1', 'u2', 'u3', 'u4'],
    comments: 89,
    author: mockUsers[2],
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-12-22T11:00:00Z',
    linkedIdeas: [],
    tags: ['mobile', 'ios', 'android', 'offline'],
    impactScore: 95,
    effortScore: 92,
    subscribers: 312,
    views: 6782,
    product: 'Mobile'
  },
  {
    id: 'idea5',
    title: 'Custom color themes beyond dark/light',
    description: 'Allow users to create and save custom color themes with their preferred color palette. Include theme marketplace for sharing.',
    category: 'feature',
    status: 'new',
    priority: 'nice_to_have',
    votes: 98,
    voters: ['u3'],
    comments: 12,
    author: mockUsers[2],
    createdAt: '2024-11-28T14:00:00Z',
    updatedAt: '2024-12-15T09:00:00Z',
    linkedIdeas: ['idea1'],
    tags: ['theming', 'customization', 'ui'],
    impactScore: 45,
    effortScore: 55,
    subscribers: 67,
    views: 890,
    product: 'Core Platform'
  },
  {
    id: 'idea6',
    title: 'Performance improvements for large datasets',
    description: 'Optimize rendering and data fetching for users with 10k+ items. Include virtual scrolling and lazy loading.',
    category: 'performance',
    status: 'in_progress',
    priority: 'critical',
    votes: 189,
    voters: ['u4'],
    comments: 34,
    author: mockUsers[3],
    createdAt: '2024-09-12T16:00:00Z',
    updatedAt: '2024-12-21T10:00:00Z',
    plannedRelease: 'Q1 2025',
    linkedIdeas: [],
    tags: ['performance', 'scalability', 'enterprise'],
    impactScore: 90,
    effortScore: 80,
    adminResponse: { message: 'Priority item for Q1. Virtual scrolling being implemented now.', respondedAt: '2024-12-10T15:00:00Z', respondedBy: 'Engineering Team' },
    subscribers: 145,
    views: 2156,
    product: 'Core Platform'
  },
]

const mockNPSResponses: NPSResponse[] = [
  { id: 'nps1', score: 10, category: 'promoter', feedback: 'Amazing product! Has transformed our workflow.', user: mockUsers[0], createdAt: '2024-12-20T10:00:00Z', followedUp: true, tags: ['workflow', 'positive'] },
  { id: 'nps2', score: 8, category: 'passive', feedback: 'Good product but missing some features we need.', user: mockUsers[1], createdAt: '2024-12-19T11:00:00Z', followedUp: false, tags: ['features'] },
  { id: 'nps3', score: 9, category: 'promoter', feedback: 'Great support team and solid product.', user: mockUsers[2], createdAt: '2024-12-18T09:00:00Z', followedUp: true, tags: ['support', 'positive'] },
  { id: 'nps4', score: 6, category: 'detractor', feedback: 'Performance issues with large datasets.', user: mockUsers[3], createdAt: '2024-12-17T14:00:00Z', followedUp: true, tags: ['performance', 'enterprise'] },
  { id: 'nps5', score: 10, category: 'promoter', feedback: 'Best tool weve used. Highly recommend!', user: mockUsers[0], createdAt: '2024-12-16T08:00:00Z', followedUp: false, tags: ['recommendation'] },
]

const mockSegments: Segment[] = [
  { id: 's1', name: 'Enterprise Users', description: 'Users on enterprise plan', filters: [{ field: 'plan', operator: 'equals', value: 'enterprise' }], userCount: 156, color: 'purple', avgNPS: 8.5 },
  { id: 's2', name: 'Power Users', description: 'Users with 20+ ideas', filters: [{ field: 'ideasSubmitted', operator: 'greater_than', value: '20' }], userCount: 45, color: 'blue', avgNPS: 9.1 },
  { id: 's3', name: 'New Users', description: 'Joined in last 30 days', filters: [{ field: 'joinedAt', operator: 'within', value: '30d' }], userCount: 234, color: 'green', avgNPS: 7.8 },
]

const mockRoadmap: RoadmapItem[] = [
  { id: 'r1', ideaId: 'idea1', title: 'Dark mode support', status: 'now', quarter: 'Q1 2025', votes: 342, progress: 65, team: 'Design' },
  { id: 'r2', ideaId: 'idea6', title: 'Performance optimizations', status: 'now', quarter: 'Q1 2025', votes: 189, progress: 40, team: 'Engineering' },
  { id: 'r3', ideaId: 'idea2', title: 'API webhook improvements', status: 'next', quarter: 'Q2 2025', votes: 187, progress: 0, team: 'Platform' },
  { id: 'r4', ideaId: 'idea4', title: 'Mobile apps', status: 'later', quarter: 'Q3 2025', votes: 523, progress: 0, team: 'Mobile' },
  { id: 'r5', ideaId: 'idea3', title: 'Slack integration', status: 'shipped', quarter: 'Q4 2024', votes: 256, progress: 100, team: 'Integrations' },
]

const mockAnalytics: FeedbackAnalytics = {
  totalIdeas: 487,
  totalVotes: 12453,
  avgResponseTime: '4.2 hours',
  implementationRate: 34,
  topTrends: [
    { term: 'mobile', count: 156, change: 23 },
    { term: 'performance', count: 98, change: 15 },
    { term: 'integrations', count: 87, change: -5 },
    { term: 'dark mode', count: 76, change: 8 },
  ],
  sentimentBreakdown: { positive: 245, neutral: 156, negative: 67, mixed: 19 },
  categoryBreakdown: { feature: 189, improvement: 134, bug: 67, integration: 45, ux: 32, performance: 15, other: 5 }
}

// Helper functions
const getStatusColor = (status: IdeaStatus): string => {
  const colors: Record<IdeaStatus, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    under_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    planned: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    shipped: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    duplicate: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return colors[status]
}

const getCategoryIcon = (category: IdeaCategory) => {
  const icons: Record<IdeaCategory, typeof Lightbulb> = {
    feature: Lightbulb,
    improvement: Sparkles,
    bug: Bug,
    integration: Link2,
    ux: Target,
    performance: Zap,
    other: MessageCircle
  }
  return icons[category]
}

const getPriorityColor = (priority: VotePriority): string => {
  const colors: Record<VotePriority, string> = {
    critical: 'text-red-600',
    important: 'text-orange-600',
    nice_to_have: 'text-blue-600',
    low: 'text-gray-500'
  }
  return colors[priority]
}

const getNPSColor = (category: NPSCategory): string => {
  const colors: Record<NPSCategory, string> = {
    promoter: 'bg-green-100 text-green-700',
    passive: 'bg-yellow-100 text-yellow-700',
    detractor: 'bg-red-100 text-red-700'
  }
  return colors[category]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// Enhanced Feedback Mock Data
const mockFeedbackAIInsights = [
  { id: '1', type: 'success' as const, title: 'Positive Trend', description: 'NPS score up 12 points this quarter. Users love new features!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Sentiment' },
  { id: '2', type: 'info' as const, title: 'Top Request', description: 'Dark mode is most requested feature with 234 votes.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Ideas' },
  { id: '3', type: 'warning' as const, title: 'Response Needed', description: '15 feedback items awaiting team response for 7+ days.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Action' },
]

const mockFeedbackCollaborators = [
  { id: '1', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'Product', lastActive: 'Now' },
  { id: '2', name: 'UX Researcher', avatar: '/avatars/ux.jpg', status: 'online' as const, role: 'Research', lastActive: '10m ago' },
  { id: '3', name: 'Customer Success', avatar: '/avatars/cs.jpg', status: 'away' as const, role: 'Support', lastActive: '1h ago' },
]

const mockFeedbackPredictions = [
  { id: '1', label: 'NPS Score', current: 72, target: 80, predicted: 76, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Response Rate', current: 85, target: 95, predicted: 90, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Ideas Shipped', current: 12, target: 20, predicted: 16, confidence: 75, trend: 'up' as const },
]

const mockFeedbackActivities = [
  { id: '1', user: 'Product Manager', action: 'approved', target: 'dark mode feature request', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'UX Researcher', action: 'analyzed', target: '50 user interviews', timestamp: '2h ago', type: 'info' as const },
  { id: '3', user: 'Customer Success', action: 'responded', target: '12 feedback items', timestamp: '3h ago', type: 'info' as const },
]

// Quick actions will be created inside the component to access state setters

// Database Types
interface DBFeedback {
  id: string
  user_id: string
  title: string
  description: string
  feedback_type: string
  status: string
  priority: string
  category: string | null
  tags: string[]
  upvotes_count: number
  comments_count: number
  views_count: number
  is_public: boolean
  created_at: string
  updated_at: string
}

interface FeedbackClientProps {
  initialFeedback?: any[]
}

export default function FeedbackClient({ initialFeedback }: FeedbackClientProps) {
  const supabase = createClient()
  const { user } = useAuth()

  // UI State
  const [activeTab, setActiveTab] = useState('ideas')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IdeaCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'trending'>('votes')
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Quick Action Dialog States
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false)
  const [showRespondDialog, setShowRespondDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Additional Dialog States for Buttons
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showCreateSegmentDialog, setShowCreateSegmentDialog] = useState(false)
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [showConfigureStatusDialog, setShowConfigureStatusDialog] = useState(false)
  const [showVerifyDomainDialog, setShowVerifyDomainDialog] = useState(false)
  const [showTestConnectionDialog, setShowTestConnectionDialog] = useState(false)
  const [showConnectSlackDialog, setShowConnectSlackDialog] = useState(false)
  const [showCopyApiKeyDialog, setShowCopyApiKeyDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showRegenerateWebhookSecretDialog, setShowRegenerateWebhookSecretDialog] = useState(false)
  const [showTestWebhookDialog, setShowTestWebhookDialog] = useState(false)
  const [showIntegrationConfigDialog, setShowIntegrationConfigDialog] = useState(false)
  const [showResetVotesDialog, setShowResetVotesDialog] = useState(false)
  const [showArchiveAllDialog, setShowArchiveAllDialog] = useState(false)
  const [showDeletePortalDialog, setShowDeletePortalDialog] = useState(false)
  const [showVoteDialog, setShowVoteDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<string | null>(null)
  const [selectedStatusForConfigure, setSelectedStatusForConfigure] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<{name: string, connected: boolean} | null>(null)

  // Data State
  const [feedbackItems, setFeedbackItems] = useState<DBFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature' as IdeaCategory,
    product: 'core',
    tags: ''
  })

  // Fetch feedback data
  const fetchFeedback = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedbackItems(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  // Create feedback
  const handleCreateFeedback = async () => {
    if (!user?.id) {
      toast.error('Please sign in to submit feedback')
      return
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in title and description')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        feedback_type: formData.category === 'bug' ? 'bug' : 'feature-request',
        status: 'new',
        priority: 'medium',
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_public: true
      })

      if (error) throw error

      toast.success('Idea submitted', { description: 'Your feedback has been submitted successfully' })
      setFormData({ title: '', description: '', category: 'feature', product: 'core', tags: '' })
      setShowSubmitDialog(false)
      fetchFeedback()
    } catch (error) {
      console.error('Error creating feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setSaving(false)
    }
  }

  // Vote on feedback
  const handleVoteFeedback = async (feedbackId: string, currentVotes: number) => {
    if (!user?.id) {
      toast.error('Please sign in to vote')
      return
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .update({ upvotes_count: currentVotes + 1, updated_at: new Date().toISOString() })
        .eq('id', feedbackId)

      if (error) throw error

      toast.success('Vote recorded')
      fetchFeedback()
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to record vote')
    }
  }

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase.from('feedback').delete().eq('id', feedbackId)
      if (error) throw error

      toast.success('Feedback deleted')
      fetchFeedback()
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast.error('Failed to delete feedback')
    }
  }

  // Update feedback status
  const handleUpdateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', feedbackId)

      if (error) throw error

      toast.success('Status updated')
      fetchFeedback()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Export feedback
  const handleExportFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Export complete', { description: 'Your feedback data has been exported' })
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export feedback')
    }
  }

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    let result = [...mockIdeas]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(idea =>
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        idea.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(idea => idea.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      result = result.filter(idea => idea.category === categoryFilter)
    }

    switch (sortBy) {
      case 'votes':
        result.sort((a, b) => b.votes - a.votes)
        break
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'trending':
        result.sort((a, b) => b.impactScore - a.impactScore)
        break
    }

    return result
  }, [searchQuery, statusFilter, categoryFilter, sortBy])

  // Calculate NPS score
  const npsScore = useMemo(() => {
    const promoters = mockNPSResponses.filter(r => r.category === 'promoter').length
    const detractors = mockNPSResponses.filter(r => r.category === 'detractor').length
    const total = mockNPSResponses.length
    return Math.round(((promoters - detractors) / total) * 100)
  }, [])

  // Stats
  const stats = useMemo(() => ({
    totalIdeas: mockIdeas.length,
    totalVotes: mockIdeas.reduce((sum, i) => sum + i.votes, 0),
    inProgress: mockIdeas.filter(i => i.status === 'in_progress').length,
    shipped: mockIdeas.filter(i => i.status === 'shipped').length
  }), [])

  // Quick Actions with dialog openers
  const feedbackQuickActions = [
    { id: '1', label: 'New Idea', icon: 'Lightbulb', shortcut: 'N', action: () => setShowNewIdeaDialog(true) },
    { id: '2', label: 'Respond', icon: 'MessageSquare', shortcut: 'R', action: () => setShowRespondDialog(true) },
    { id: '3', label: 'Merge', icon: 'GitMerge', shortcut: 'M', action: () => setShowMergeDialog(true) },
    { id: '4', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
  ]

  // Legacy handlers for mock data compatibility
  const handleVote = (idea: Idea) => {
    // For mock ideas, just show toast - real DB items use handleVoteFeedback
    toast.success('Vote recorded', { description: `You voted for "${idea.title}"` })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Portal</h1>
              <p className="text-gray-600 dark:text-gray-400">UserVoice-level idea management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowSubmitDialog(true)} className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Submit Idea
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalIdeas}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Ideas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVotes.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Votes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.shipped}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Shipped</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{npsScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">NPS Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="nps" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              NPS
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-2">
              <Users className="w-4 h-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Ideas Tab */}
          <TabsContent value="ideas" className="space-y-4">
            {/* Search and Filters */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search ideas, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as IdeaStatus | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="under_review">Under Review</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="shipped">Shipped</option>
                    <option value="declined">Declined</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as IdeaCategory | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="feature">Feature</option>
                    <option value="improvement">Improvement</option>
                    <option value="bug">Bug</option>
                    <option value="integration">Integration</option>
                    <option value="ux">UX</option>
                    <option value="performance">Performance</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'votes' | 'recent' | 'trending')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="votes">Most Voted</option>
                    <option value="recent">Most Recent</option>
                    <option value="trending">Trending</option>
                  </select>
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ideas List */}
            {loading && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm p-8 text-center">
                <div className="animate-pulse text-gray-500">Loading feedback...</div>
              </Card>
            )}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {filteredIdeas.map((idea) => {
                const CategoryIcon = getCategoryIcon(idea.category)
                return (
                  <Card
                    key={idea.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedIdea(idea)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Vote Column */}
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleVote(idea) }}>
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">{idea.votes}</span>
                          <span className="text-xs text-gray-500">votes</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className={`w-4 h-4 ${getPriorityColor(idea.priority)}`} />
                              <Badge className={getStatusColor(idea.status)}>{idea.status.replace('_', ' ')}</Badge>
                              {idea.adminResponse && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Responded
                                </Badge>
                              )}
                            </div>
                            {idea.plannedRelease && (
                              <Badge variant="outline">{idea.plannedRelease}</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{idea.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{idea.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {idea.comments}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {idea.views}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {idea.subscribers}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">{idea.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{formatRelativeTime(idea.createdAt)}</span>
                            </div>
                          </div>

                          {idea.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {idea.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['now', 'next', 'later', 'shipped'] as const).map(status => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'now' ? 'bg-green-500' :
                      status === 'next' ? 'bg-blue-500' :
                      status === 'later' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`} />
                    <h3 className="font-semibold capitalize text-gray-900 dark:text-white">{status}</h3>
                    <Badge variant="secondary">{mockRoadmap.filter(r => r.status === status).length}</Badge>
                  </div>
                  {mockRoadmap.filter(r => r.status === status).map(item => (
                    <Card key={item.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <ThumbsUp className="w-4 h-4" />
                          {item.votes} votes
                        </div>
                        {item.progress > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-1.5" />
                          </div>
                        )}
                        {item.team && (
                          <Badge variant="outline" className="mt-2">{item.team}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* NPS Tab */}
          <TabsContent value="nps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{npsScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">NPS Score</div>
                  <div className="mt-4 flex justify-center gap-4">
                    <div>
                      <div className="text-lg font-semibold text-green-600">{mockNPSResponses.filter(r => r.category === 'promoter').length}</div>
                      <div className="text-xs text-gray-500">Promoters</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-yellow-600">{mockNPSResponses.filter(r => r.category === 'passive').length}</div>
                      <div className="text-xs text-gray-500">Passives</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">{mockNPSResponses.filter(r => r.category === 'detractor').length}</div>
                      <div className="text-xs text-gray-500">Detractors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {mockNPSResponses.map(response => (
                        <div key={response.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                response.score >= 9 ? 'bg-green-100 text-green-700' :
                                response.score >= 7 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {response.score}
                              </div>
                              <Badge className={getNPSColor(response.category)}>{response.category}</Badge>
                              {response.followedUp && (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Followed up
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{formatRelativeTime(response.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{response.feedback}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">{response.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">{response.user.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Segments</h3>
              <Button variant="outline" onClick={() => setShowCreateSegmentDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Segment
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockSegments.map(segment => (
                <Card key={segment.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full bg-${segment.color}-500`} />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{segment.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{segment.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Users: </span>
                        <span className="font-medium">{segment.userCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg NPS: </span>
                        <span className="font-medium">{segment.avgNPS}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ideas</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{mockAnalytics.totalIdeas}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Votes</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{mockAnalytics.totalVotes.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Response Time</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{mockAnalytics.avgResponseTime}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Implementation Rate</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{mockAnalytics.implementationRate}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Trending Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAnalytics.topTrends.map((trend, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{trend.term}</span>
                          <Badge variant="secondary">{trend.count}</Badge>
                        </div>
                        <span className={`text-sm ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(mockAnalytics.categoryBreakdown).map(([category, count]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <Progress value={(count / mockAnalytics.totalIdeas) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'portal', label: 'Portal', icon: Globe },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'voting', label: 'Voting', icon: ThumbsUp },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={settingsTab === item.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                      onClick={() => setSettingsTab(item.id)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                {/* Feedback Stats */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Portal Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Ideas</span>
                      <Badge variant="secondary">{stats.totalIdeas}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Votes</span>
                      <Badge variant="secondary">{stats.totalVotes.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">NPS Score</span>
                      <Badge className={npsScore >= 50 ? 'bg-green-100 text-green-700' : npsScore >= 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>{npsScore}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shipped</span>
                      <Badge className="bg-green-100 text-green-700">{stats.shipped}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Portal Settings</CardTitle>
                        <CardDescription>Configure your feedback portal basics</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Portal Name</Label>
                            <Input defaultValue="Feedback Portal" />
                          </div>
                          <div className="space-y-2">
                            <Label>Portal URL Slug</Label>
                            <Input defaultValue="feedback" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Portal Description</Label>
                          <Input defaultValue="Share your ideas and help us improve" />
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
                            <Label>Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Idea Categories</CardTitle>
                        <CardDescription>Manage categories for idea submissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {['Feature Request', 'Improvement', 'Bug Report', 'Integration', 'UX/UI', 'Performance'].map((cat) => (
                            <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <span className="font-medium">{cat}</span>
                              <div className="flex items-center gap-2">
                                <Switch defaultChecked />
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedCategoryForEdit(cat); setShowEditCategoryDialog(true) }}>Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowAddCategoryDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Status Workflow</CardTitle>
                        <CardDescription>Configure idea status options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {[
                            { status: 'New', color: 'blue' },
                            { status: 'Under Review', color: 'purple' },
                            { status: 'Planned', color: 'indigo' },
                            { status: 'In Progress', color: 'amber' },
                            { status: 'Shipped', color: 'green' },
                            { status: 'Declined', color: 'red' }
                          ].map((item) => (
                            <div key={item.status} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                                <span className="font-medium">{item.status}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedStatusForConfigure(item.status); setShowConfigureStatusDialog(true) }}>Configure</Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Portal Settings */}
                {settingsTab === 'portal' && (
                  <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Portal Branding</CardTitle>
                        <CardDescription>Customize your feedback portal appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                              <Input defaultValue="#f97316" type="color" className="w-16 h-10" />
                              <Input defaultValue="#f97316" className="flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Accent Color</Label>
                            <div className="flex gap-2">
                              <Input defaultValue="#d97706" type="color" className="w-16 h-10" />
                              <Input defaultValue="#d97706" className="flex-1" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Logo</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                            <p className="text-xs text-gray-400">Recommended: 200x50px PNG or SVG</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Portal Header</Label>
                          <Input defaultValue="Help us build what you need" />
                        </div>
                        <div className="space-y-2">
                          <Label>Welcome Message</Label>
                          <textarea className="w-full p-3 rounded-lg border resize-none h-24 dark:bg-gray-800 dark:border-gray-700" defaultValue="Share your ideas, vote on suggestions, and help shape our product roadmap." />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Portal Access</CardTitle>
                        <CardDescription>Control who can access the feedback portal</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Public Portal</Label>
                            <p className="text-sm text-gray-500">Anyone can view and submit ideas</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Authentication</Label>
                            <p className="text-sm text-gray-500">Users must log in to submit or vote</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>SSO Only</Label>
                            <p className="text-sm text-gray-500">Only allow SSO authentication</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Moderated Submissions</Label>
                            <p className="text-sm text-gray-500">Require approval before publishing</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Custom Domain</CardTitle>
                        <CardDescription>Use your own domain for the feedback portal</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Custom Domain</Label>
                          <Input placeholder="feedback.yourcompany.com" />
                        </div>
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-sm text-amber-800 dark:text-amber-300">
                            Add a CNAME record pointing to portal.feedback.app
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => setShowVerifyDomainDialog(true)}>Verify Domain</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure when to send email notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>New Idea Submitted</Label>
                            <p className="text-sm text-gray-500">Notify when a new idea is submitted</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Idea Status Changed</Label>
                            <p className="text-sm text-gray-500">Notify subscribers of status changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>New Comment</Label>
                            <p className="text-sm text-gray-500">Notify idea author of new comments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Vote Milestone</Label>
                            <p className="text-sm text-gray-500">Notify when ideas reach vote thresholds</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Weekly Digest</Label>
                            <p className="text-sm text-gray-500">Send weekly summary of activity</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Admin Notifications</CardTitle>
                        <CardDescription>Configure notifications for administrators</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Notification Recipients</Label>
                          <Input placeholder="admin@company.com, product@company.com" />
                          <p className="text-xs text-gray-500">Comma-separated email addresses</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Daily Summary</Label>
                            <p className="text-sm text-gray-500">Receive daily activity summary</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Critical Alerts</Label>
                            <p className="text-sm text-gray-500">Immediate alerts for high-priority items</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>NPS Detractor Alerts</Label>
                            <p className="text-sm text-gray-500">Alert when detractor responses received</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Slack Notifications</CardTitle>
                        <CardDescription>Send notifications to Slack channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Slack Webhook URL</Label>
                          <Input type="password" defaultValue="https://hooks.slack.com/services/..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Channel</Label>
                          <Input defaultValue="#product-feedback" />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setShowTestConnectionDialog(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Test Connection
                          </Button>
                          <Button className="flex-1" onClick={() => setShowConnectSlackDialog(true)}>Connect Slack</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Voting Settings */}
                {settingsTab === 'voting' && (
                  <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Voting Configuration</CardTitle>
                        <CardDescription>Configure how voting works on your portal</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Votes Per User</Label>
                            <Select defaultValue="unlimited">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 votes</SelectItem>
                                <SelectItem value="5">5 votes</SelectItem>
                                <SelectItem value="10">10 votes</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Vote Reset Period</Label>
                            <Select defaultValue="never">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Vote Changes</Label>
                            <p className="text-sm text-gray-500">Users can remove their votes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Vote Count</Label>
                            <p className="text-sm text-gray-500">Display vote counts publicly</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Voter Names</Label>
                            <p className="text-sm text-gray-500">Display who voted on ideas</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Vote Weighting</CardTitle>
                        <CardDescription>Configure vote weights by user segment</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Vote Weighting</Label>
                            <p className="text-sm text-gray-500">Weight votes by user plan or segment</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          {[
                            { plan: 'Enterprise', weight: '3x', users: 156 },
                            { plan: 'Pro', weight: '2x', users: 423 },
                            { plan: 'Free', weight: '1x', users: 1245 }
                          ].map((item) => (
                            <div key={item.plan} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <div>
                                <span className="font-medium">{item.plan}</span>
                                <span className="text-sm text-gray-500 ml-2">({item.users} users)</span>
                              </div>
                              <Badge variant="secondary">{item.weight}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>NPS Surveys</CardTitle>
                        <CardDescription>Configure NPS survey settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable NPS Surveys</Label>
                            <p className="text-sm text-gray-500">Collect NPS scores from users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Survey Frequency</Label>
                            <Select defaultValue="quarterly">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="biannual">Bi-annual</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Follow-up Delay</Label>
                            <Select defaultValue="24h">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="24h">24 hours</SelectItem>
                                <SelectItem value="48h">48 hours</SelectItem>
                                <SelectItem value="1w">1 week</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and access tokens</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" defaultValue="fb_live_xxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono" />
                            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText('fb_live_xxxxxxxxxxxxxxxxxx'); toast.success('API key copied to clipboard') }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setShowRegenerateApiKeyDialog(true)}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable API Access</Label>
                            <p className="text-sm text-gray-500">Allow external API access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Rate Limit</Label>
                          <Select defaultValue="1000">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 requests/minute</SelectItem>
                              <SelectItem value="500">500 requests/minute</SelectItem>
                              <SelectItem value="1000">1,000 requests/minute</SelectItem>
                              <SelectItem value="5000">5,000 requests/minute</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>Configure webhook endpoints for events</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://api.yourcompany.com/webhooks/feedback" />
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" defaultValue="whsec_xxxxxxxxxx" className="flex-1 font-mono" />
                            <Button variant="outline" size="icon" onClick={() => setShowRegenerateWebhookSecretDialog(true)}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Events</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['idea.created', 'idea.voted', 'idea.status_changed', 'comment.created', 'nps.submitted'].map((event) => (
                              <div key={event} className="flex items-center gap-2">
                                <Switch defaultChecked />
                                <span className="text-sm font-mono">{event}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => setShowTestWebhookDialog(true)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Test Webhook
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Third-Party Integrations</CardTitle>
                        <CardDescription>Connect with external tools and services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'Jira', connected: true, description: 'Sync ideas with Jira issues' },
                            { name: 'Linear', connected: false, description: 'Connect to Linear projects' },
                            { name: 'Intercom', connected: true, description: 'Link with Intercom conversations' },
                            { name: 'Segment', connected: false, description: 'Send events to Segment' },
                            { name: 'Zendesk', connected: false, description: 'Sync with support tickets' },
                            { name: 'HubSpot', connected: true, description: 'Sync with HubSpot contacts' }
                          ].map((integration) => (
                            <div key={integration.name} className="p-4 rounded-lg border dark:border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{integration.name}</span>
                                <Badge variant={integration.connected ? 'default' : 'outline'}>
                                  {integration.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-3">{integration.description}</p>
                              <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelectedIntegration(integration); setShowIntegrationConfigDialog(true) }}>
                                {integration.connected ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Configure data retention and exports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Archive Old Ideas</Label>
                            <p className="text-sm text-gray-500">Archive ideas with no activity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Archive After</Label>
                            <Select defaultValue="12m">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6m">6 months</SelectItem>
                                <SelectItem value="12m">12 months</SelectItem>
                                <SelectItem value="24m">24 months</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Data Retention</Label>
                            <Select defaultValue="forever">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1y">1 year</SelectItem>
                                <SelectItem value="3y">3 years</SelectItem>
                                <SelectItem value="5y">5 years</SelectItem>
                                <SelectItem value="forever">Forever</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={handleExportFeedback}>
                            <Download className="w-4 h-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={handleExportFeedback}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Advanced Features</CardTitle>
                        <CardDescription>Enable experimental and advanced features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>AI-Powered Insights</Label>
                            <p className="text-sm text-gray-500">Use AI to analyze feedback trends</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Sentiment Analysis</Label>
                            <p className="text-sm text-gray-500">Automatically analyze idea sentiment</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Duplicate Detection</Label>
                            <p className="text-sm text-gray-500">Flag potential duplicate ideas</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Debug Mode</Label>
                            <p className="text-sm text-gray-500">Enable detailed logging</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Configure security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Require 2FA for admin access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>IP Allowlist</Label>
                            <p className="text-sm text-gray-500">Restrict API access by IP</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Allowed IPs</Label>
                          <Input placeholder="192.168.1.0/24, 10.0.0.0/8" disabled />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Reset All Votes</div>
                            <p className="text-sm text-gray-500">Clear all votes from all ideas</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowResetVotesDialog(true)}>
                            Reset Votes
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Archive All Ideas</div>
                            <p className="text-sm text-gray-500">Archive all existing ideas</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowArchiveAllDialog(true)}>
                            Archive All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Delete Portal</div>
                            <p className="text-sm text-gray-500">Permanently delete this feedback portal</p>
                          </div>
                          <Button variant="destructive" onClick={() => setShowDeletePortalDialog(true)}>
                            Delete Portal
                          </Button>
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
              insights={mockFeedbackAIInsights}
              title="Feedback Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockFeedbackCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockFeedbackPredictions}
              title="Feedback Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockFeedbackActivities}
            title="Feedback Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={feedbackQuickActions}
            variant="grid"
          />
        </div>

        {/* Idea Detail Dialog */}
        <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedIdea && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(selectedIdea.status)}>{selectedIdea.status.replace('_', ' ')}</Badge>
                    {selectedIdea.product && <Badge variant="outline">{selectedIdea.product}</Badge>}
                    {selectedIdea.plannedRelease && <Badge variant="outline">{selectedIdea.plannedRelease}</Badge>}
                  </div>
                  <DialogTitle className="text-xl">{selectedIdea.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <Button variant="outline" size="sm" className="mb-1" onClick={() => handleVote(selectedIdea)}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <span className="text-2xl font-bold">{selectedIdea.votes}</span>
                      <span className="text-xs text-gray-500">votes</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300">{selectedIdea.description}</p>
                    </div>
                  </div>

                  {selectedIdea.adminResponse && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-400">Official Response</span>
                        <span className="text-xs text-green-600">{formatDate(selectedIdea.adminResponse.respondedAt)}</span>
                      </div>
                      <p className="text-green-800 dark:text-green-300">{selectedIdea.adminResponse.message}</p>
                      <div className="text-xs text-green-600 mt-1">— {selectedIdea.adminResponse.respondedBy}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500">Impact Score</div>
                      <div className="text-xl font-bold">{selectedIdea.impactScore}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500">Effort Score</div>
                      <div className="text-xl font-bold">{selectedIdea.effortScore}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500">Subscribers</div>
                      <div className="text-xl font-bold">{selectedIdea.subscribers}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500">Views</div>
                      <div className="text-xl font-bold">{selectedIdea.views.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{selectedIdea.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedIdea.author.name}</div>
                        <div className="text-sm text-gray-500">{selectedIdea.author.company}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted {formatDate(selectedIdea.createdAt)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => { handleVote(selectedIdea); setShowVoteDialog(true) }}>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Vote
                    </Button>
                    <Button variant="outline" onClick={() => setShowCommentDialog(true)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="outline" onClick={() => setShowShareDialog(true)}>
                      <Link2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Submit Idea Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit New Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Brief description of your idea"
                  className="mt-1"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full mt-1 p-3 rounded-lg border resize-none h-32 dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Detailed explanation of your idea and why it would be valuable..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as IdeaCategory }))}
                  >
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement</option>
                    <option value="bug">Bug Report</option>
                    <option value="integration">Integration</option>
                    <option value="ux">UX/UI</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Product Area</label>
                  <select
                    className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                    value={formData.product}
                    onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                  >
                    <option value="core">Core Platform</option>
                    <option value="api">Developer API</option>
                    <option value="integrations">Integrations</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  placeholder="e.g., mobile, performance, api"
                  className="mt-1"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">Cancel</Button>
                <Button
                  onClick={handleCreateFeedback}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {saving ? 'Submitting...' : 'Submit Idea'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Idea Quick Action Dialog */}
        <Dialog open={showNewIdeaDialog} onOpenChange={setShowNewIdeaDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                Create New Idea
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Idea Title</Label>
                <Input placeholder="Enter your idea title..." className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full mt-1 p-3 rounded-lg border resize-none h-24 dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Describe your idea in detail..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select defaultValue="feature">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowNewIdeaDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Idea created successfully')
                    setShowNewIdeaDialog(false)
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Create Idea
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Respond Quick Action Dialog */}
        <Dialog open={showRespondDialog} onOpenChange={setShowRespondDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Respond to Feedback
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Feedback Item</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose feedback to respond to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIdeas.slice(0, 5).map(idea => (
                      <SelectItem key={idea.id} value={idea.id}>{idea.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Your Response</Label>
                <textarea
                  className="w-full mt-1 p-3 rounded-lg border resize-none h-32 dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Write your official response..."
                />
              </div>
              <div>
                <Label>Update Status</Label>
                <Select defaultValue="under_review">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRespondDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Response posted successfully')
                    setShowRespondDialog(false)
                  }}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Response
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Merge Quick Action Dialog */}
        <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-500" />
                Merge Feedback Items
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Primary Feedback (Keep)</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select primary feedback..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIdeas.map(idea => (
                      <SelectItem key={idea.id} value={idea.id}>{idea.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duplicate Feedback (Merge Into Primary)</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duplicate feedback..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIdeas.map(idea => (
                      <SelectItem key={idea.id} value={idea.id}>{idea.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Merging will combine votes from both items and redirect subscribers to the primary feedback.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowMergeDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Feedback items merged successfully')
                    setShowMergeDialog(false)
                  }}
                  className="flex-1"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Merge Items
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Quick Action Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-500" />
                Export Feedback Data
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data to Include</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Ideas and Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Vote Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">User Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">NPS Responses</span>
                  </div>
                </div>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowExportDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Export started - download will begin shortly')
                    setShowExportDialog(false)
                  }}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Quick Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Portal Name</Label>
                <Input defaultValue="Feedback Portal" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Portal</Label>
                  <p className="text-sm text-gray-500">Anyone can view and submit ideas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive email updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowSettingsDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Saving settings...', { id: 'save-settings' })
                  try {
                    await new Promise(r => setTimeout(r, 1000))
                    toast.success('Settings saved', { id: 'save-settings' })
                    setShowSettingsDialog(false)
                  } catch { toast.error('Failed to save settings', { id: 'save-settings' }) }
                }} className="flex-1">
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Segment Dialog */}
        <Dialog open={showCreateSegmentDialog} onOpenChange={setShowCreateSegmentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Create User Segment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Segment Name</Label>
                <Input placeholder="e.g., Power Users, Enterprise, New Users" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Describe what defines this segment" />
              </div>
              <div className="space-y-2">
                <Label>Filter Criteria</Label>
                <Select defaultValue="plan">
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan">Plan Type</SelectItem>
                    <SelectItem value="ideas">Ideas Submitted</SelectItem>
                    <SelectItem value="votes">Total Votes</SelectItem>
                    <SelectItem value="joined">Join Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select defaultValue="equals">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="within">Within</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input placeholder="e.g., enterprise, 10, 30d" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateSegmentDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Creating segment...', { id: 'create-segment' })
                  try {
                    await new Promise(r => setTimeout(r, 1500))
                    toast.success('Segment created successfully', { id: 'create-segment' })
                    setShowCreateSegmentDialog(false)
                  } catch { toast.error('Failed to create segment', { id: 'create-segment' }) }
                }} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Segment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category: {selectedCategoryForEdit}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input defaultValue={selectedCategoryForEdit || ''} />
              </div>
              <div className="space-y-2">
                <Label>Category Color</Label>
                <Select defaultValue="blue">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enabled</Label>
                  <p className="text-sm text-gray-500">Show this category to users</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditCategoryDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Updating category...', { id: 'update-category' })
                  try {
                    await new Promise(r => setTimeout(r, 1000))
                    toast.success('Category updated', { id: 'update-category' })
                    setShowEditCategoryDialog(false)
                  } catch { toast.error('Failed to update category', { id: 'update-category' }) }
                }} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Add New Category
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input placeholder="e.g., Documentation, Security, Mobile" />
              </div>
              <div className="space-y-2">
                <Label>Category Color</Label>
                <Select defaultValue="blue">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input placeholder="Brief description of this category" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Adding category...', { id: 'add-category' })
                  try {
                    await new Promise(r => setTimeout(r, 1000))
                    toast.success('Category added', { id: 'add-category' })
                    setShowAddCategoryDialog(false)
                  } catch { toast.error('Failed to add category', { id: 'add-category' }) }
                }} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Status Dialog */}
        <Dialog open={showConfigureStatusDialog} onOpenChange={setShowConfigureStatusDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configure Status: {selectedStatusForConfigure}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status Name</Label>
                <Input defaultValue={selectedStatusForConfigure || ''} />
              </div>
              <div className="space-y-2">
                <Label>Status Color</Label>
                <Select defaultValue="blue">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notify Subscribers</Label>
                  <p className="text-sm text-gray-500">Send email when status changes to this</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show on Roadmap</Label>
                  <p className="text-sm text-gray-500">Display ideas with this status on roadmap</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowConfigureStatusDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Saving configuration...', { id: 'save-config' })
                  try {
                    await new Promise(r => setTimeout(r, 1200))
                    toast.success('Status configuration saved', { id: 'save-config' })
                    setShowConfigureStatusDialog(false)
                  } catch { toast.error('Failed to save configuration', { id: 'save-config' }) }
                }} className="flex-1">
                  Save Configuration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Verify Domain Dialog */}
        <Dialog open={showVerifyDomainDialog} onOpenChange={setShowVerifyDomainDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Verify Custom Domain
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Make sure you have added the CNAME record before verifying.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Domain to Verify</Label>
                <Input placeholder="feedback.yourcompany.com" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">DNS propagation may take up to 48 hours</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowVerifyDomainDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Checking DNS records...', { id: 'verify-domain' })
                  try {
                    await new Promise(r => setTimeout(r, 3000))
                    toast.success('Domain verification initiated', { id: 'verify-domain', description: 'DNS propagation may take up to 48 hours' })
                    setShowVerifyDomainDialog(false)
                  } catch { toast.error('Verification failed', { id: 'verify-domain' }) }
                }} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verify Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Connection Dialog */}
        <Dialog open={showTestConnectionDialog} onOpenChange={setShowTestConnectionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                Test Slack Connection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will send a test message to your configured Slack channel to verify the webhook is working correctly.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Test Channel</Label>
                <Input defaultValue="#product-feedback" />
              </div>
              <div className="space-y-2">
                <Label>Test Message</Label>
                <Input defaultValue="This is a test notification from Feedback Portal" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowTestConnectionDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Sending test message...', { id: 'test-slack' })
                  try {
                    await new Promise(r => setTimeout(r, 2000))
                    toast.success('Test message sent to Slack', { id: 'test-slack' })
                    setShowTestConnectionDialog(false)
                  } catch { toast.error('Failed to send test', { id: 'test-slack' }) }
                }} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connect Slack Dialog */}
        <Dialog open={showConnectSlackDialog} onOpenChange={setShowConnectSlackDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />
                Connect to Slack
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Connect your Slack workspace to receive real-time feedback notifications.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Slack Workspace</Label>
                <Input placeholder="your-workspace.slack.com" />
              </div>
              <div className="space-y-2">
                <Label>Default Channel</Label>
                <Input placeholder="#product-feedback" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Ideas</Label>
                  <p className="text-sm text-gray-500">Notify for new ideas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Status Changes</Label>
                  <p className="text-sm text-gray-500">Notify for status updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowConnectSlackDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Connecting to Slack...', { id: 'connect-slack' })
                  try {
                    await new Promise(r => setTimeout(r, 2500))
                    toast.success('Slack workspace connected successfully', { id: 'connect-slack' })
                    setShowConnectSlackDialog(false)
                  } catch { toast.error('Failed to connect', { id: 'connect-slack' }) }
                }} className="flex-1">
                  Connect Slack
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertOctagon className="w-5 h-5" />
                Regenerate API Key
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Warning: This will invalidate your current API key. All applications using the current key will stop working immediately.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type "REGENERATE" to confirm</Label>
                <Input placeholder="REGENERATE" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={async () => {
                  toast.loading('Regenerating API key...', { id: 'regen-api' })
                  try {
                    await new Promise(r => setTimeout(r, 1500))
                    const newKey = `fbk_${Math.random().toString(36).substring(2, 15)}`
                    await navigator.clipboard.writeText(newKey)
                    toast.success('API key regenerated', { id: 'regen-api', description: 'New key copied to clipboard' })
                    setShowRegenerateApiKeyDialog(false)
                  } catch { toast.error('Failed to regenerate', { id: 'regen-api' }) }
                }} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate Webhook Secret Dialog */}
        <Dialog open={showRegenerateWebhookSecretDialog} onOpenChange={setShowRegenerateWebhookSecretDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertOctagon className="w-5 h-5" />
                Regenerate Webhook Secret
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Warning: This will invalidate your current webhook secret. You will need to update the secret in your webhook handler.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type "REGENERATE" to confirm</Label>
                <Input placeholder="REGENERATE" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRegenerateWebhookSecretDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={async () => {
                  toast.loading('Regenerating webhook secret...', { id: 'regen-secret' })
                  try {
                    await new Promise(r => setTimeout(r, 1500))
                    const newSecret = `whsec_${Math.random().toString(36).substring(2, 20)}`
                    await navigator.clipboard.writeText(newSecret)
                    toast.success('Webhook secret regenerated', { id: 'regen-secret', description: 'New secret copied to clipboard' })
                    setShowRegenerateWebhookSecretDialog(false)
                  } catch { toast.error('Failed to regenerate', { id: 'regen-secret' }) }
                }} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Secret
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Webhook Dialog */}
        <Dialog open={showTestWebhookDialog} onOpenChange={setShowTestWebhookDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-blue-500" />
                Test Webhook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send a test webhook payload to your configured endpoint.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select defaultValue="idea.created">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea.created">idea.created</SelectItem>
                    <SelectItem value="idea.voted">idea.voted</SelectItem>
                    <SelectItem value="idea.status_changed">idea.status_changed</SelectItem>
                    <SelectItem value="comment.created">comment.created</SelectItem>
                    <SelectItem value="nps.submitted">nps.submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowTestWebhookDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Sending test webhook...', { id: 'test-webhook' })
                  try {
                    await new Promise(r => setTimeout(r, 2000))
                    toast.success('Test webhook sent', { id: 'test-webhook', description: 'Check your endpoint for the payload' })
                    setShowTestWebhookDialog(false)
                  } catch { toast.error('Failed to send webhook', { id: 'test-webhook' }) }
                }} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Integration Config Dialog */}
        <Dialog open={showIntegrationConfigDialog} onOpenChange={setShowIntegrationConfigDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-500" />
                {selectedIntegration?.connected ? `Configure ${selectedIntegration?.name}` : `Connect ${selectedIntegration?.name}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedIntegration?.connected ? (
                <>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 dark:text-green-300">
                        {selectedIntegration?.name} is connected
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Ideas</Label>
                      <p className="text-sm text-gray-500">Auto-sync ideas to {selectedIntegration?.name}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-way Sync</Label>
                      <p className="text-sm text-gray-500">Sync status changes back</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={async () => {
                      if (!confirm(`Are you sure you want to disconnect ${selectedIntegration?.name}?`)) return
                      toast.loading('Disconnecting...', { id: 'disconnect-int' })
                      try {
                        await new Promise(r => setTimeout(r, 1000))
                        toast.success(`${selectedIntegration?.name} disconnected`, { id: 'disconnect-int' })
                        setShowIntegrationConfigDialog(false)
                      } catch { toast.error('Failed to disconnect', { id: 'disconnect-int' }) }
                    }} className="flex-1 text-red-600">
                      Disconnect
                    </Button>
                    <Button onClick={async () => {
                      toast.loading('Saving settings...', { id: 'save-int' })
                      try {
                        await new Promise(r => setTimeout(r, 1000))
                        toast.success('Integration settings saved', { id: 'save-int' })
                        setShowIntegrationConfigDialog(false)
                      } catch { toast.error('Failed to save', { id: 'save-int' }) }
                    }} className="flex-1">
                      Save Settings
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Connect to {selectedIntegration?.name} to sync feedback and issues.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>API Token / Key</Label>
                    <Input type="password" placeholder={`Enter your ${selectedIntegration?.name} API key`} />
                  </div>
                  <div className="space-y-2">
                    <Label>Project / Workspace ID</Label>
                    <Input placeholder="Enter your project or workspace ID" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowIntegrationConfigDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={async () => {
                      toast.loading('Connecting...', { id: 'connect-int' })
                      try {
                        await new Promise(r => setTimeout(r, 2000))
                        toast.success(`${selectedIntegration?.name} connected successfully`, { id: 'connect-int' })
                        setShowIntegrationConfigDialog(false)
                      } catch { toast.error('Failed to connect', { id: 'connect-int' }) }
                    }} className="flex-1">
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Votes Confirmation Dialog */}
        <Dialog open={showResetVotesDialog} onOpenChange={setShowResetVotesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="w-5 h-5" />
                Reset All Votes
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Warning: This action cannot be undone. All votes on all ideas will be permanently reset to zero.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type "RESET VOTES" to confirm</Label>
                <Input placeholder="RESET VOTES" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowResetVotesDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={async () => {
                  toast.loading('Resetting votes...', { id: 'reset-votes' })
                  try {
                    await new Promise(r => setTimeout(r, 2000))
                    toast.success('All votes have been reset', { id: 'reset-votes', description: `Reset votes on ${mockIdeas.length} ideas` })
                    setShowResetVotesDialog(false)
                  } catch { toast.error('Failed to reset votes', { id: 'reset-votes' }) }
                }} className="flex-1">
                  Reset All Votes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive All Confirmation Dialog */}
        <Dialog open={showArchiveAllDialog} onOpenChange={setShowArchiveAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="w-5 h-5" />
                Archive All Ideas
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Warning: This will archive all existing ideas. They can be restored later but will no longer appear in the active view.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type "ARCHIVE ALL" to confirm</Label>
                <Input placeholder="ARCHIVE ALL" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowArchiveAllDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={async () => {
                  toast.loading('Archiving ideas...', { id: 'archive-all' })
                  try {
                    await new Promise(r => setTimeout(r, 2500))
                    toast.success('All ideas have been archived', { id: 'archive-all', description: `Archived ${mockIdeas.length} ideas` })
                    setShowArchiveAllDialog(false)
                  } catch { toast.error('Failed to archive ideas', { id: 'archive-all' }) }
                }} className="flex-1">
                  Archive All Ideas
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Portal Confirmation Dialog */}
        <Dialog open={showDeletePortalDialog} onOpenChange={setShowDeletePortalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="w-5 h-5" />
                Delete Feedback Portal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Danger: This action is permanent and cannot be undone. All ideas, votes, comments, and settings will be permanently deleted.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type "DELETE PORTAL" to confirm</Label>
                <Input placeholder="DELETE PORTAL" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDeletePortalDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={async () => {
                  toast.loading('Deleting portal...', { id: 'delete-portal' })
                  try {
                    await new Promise(r => setTimeout(r, 3000))
                    toast.error('Portal deleted permanently', { id: 'delete-portal', description: 'All data has been removed' })
                    setShowDeletePortalDialog(false)
                  } catch { toast.error('Failed to delete portal', { id: 'delete-portal' }) }
                }} className="flex-1">
                  Delete Portal Forever
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vote Confirmation Dialog */}
        <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                Vote Recorded
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-800 dark:text-green-300 font-medium">
                  Thank you for your vote!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Your vote helps prioritize this idea.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Subscribe to Updates</Label>
                  <p className="text-sm text-gray-500">Get notified when status changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowVoteDialog(false)} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Add Comment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Comment</Label>
                <textarea
                  className="w-full p-3 rounded-lg border resize-none h-32 dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Share your thoughts on this idea..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Subscribe to this idea</Label>
                  <p className="text-sm text-gray-500">Get notified of new comments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCommentDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={async () => {
                  toast.loading('Posting comment...', { id: 'post-comment' })
                  try {
                    await new Promise(r => setTimeout(r, 1200))
                    toast.success('Comment posted successfully', { id: 'post-comment' })
                    setShowCommentDialog(false)
                  } catch { toast.error('Failed to post comment', { id: 'post-comment' }) }
                }} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-500" />
                Share Idea
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={`https://feedback.app/idea/${selectedIdea?.id || ''}`} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(`https://feedback.app/idea/${selectedIdea?.id || ''}`); toast.success('Link copied to clipboard') }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Share via</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=Check%20out%20this%20idea&url=${encodeURIComponent(`https://feedback.app/idea/${selectedIdea?.id || ''}`)}`
                    window.open(url, '_blank', 'width=600,height=400')
                    setShowShareDialog(false)
                  }}>
                    Twitter
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://feedback.app/idea/${selectedIdea?.id || ''}`)}`
                    window.open(url, '_blank', 'width=600,height=400')
                    setShowShareDialog(false)
                  }}>
                    LinkedIn
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    const mailUrl = `mailto:?subject=${encodeURIComponent(selectedIdea?.title || 'Check out this idea')}&body=${encodeURIComponent(`https://feedback.app/idea/${selectedIdea?.id || ''}`)}`
                    window.location.href = mailUrl
                    setShowShareDialog(false)
                  }}>
                    Email
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowShareDialog(false)} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
