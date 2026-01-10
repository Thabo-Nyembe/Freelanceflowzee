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

// Quick actions will be defined inside component to access handlers

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
  const [showRespondDialog, setShowRespondDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

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

  // Respond Dialog Form State
  const [respondFormData, setRespondFormData] = useState({
    selectedFeedbackId: '',
    responseMessage: '',
    responseType: 'public' as 'public' | 'internal',
    updateStatus: '' as IdeaStatus | ''
  })

  // Merge Dialog Form State
  const [mergeFormData, setMergeFormData] = useState({
    primaryFeedbackId: '',
    secondaryFeedbackIds: [] as string[],
    mergeReason: ''
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

  // Respond to feedback
  const handleRespondToFeedback = async () => {
    if (!respondFormData.selectedFeedbackId) {
      toast.error('Please select a feedback item to respond to')
      return
    }
    if (!respondFormData.responseMessage.trim()) {
      toast.error('Please enter a response message')
      return
    }

    setSaving(true)
    try {
      // Update the feedback with the admin response
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      }

      // If status update is selected, apply it
      if (respondFormData.updateStatus) {
        updateData.status = respondFormData.updateStatus
      }

      const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', respondFormData.selectedFeedbackId)

      if (error) throw error

      // Also create a comment/response record if comments table exists
      try {
        await supabase.from('feedback_comments').insert({
          feedback_id: respondFormData.selectedFeedbackId,
          user_id: user?.id,
          content: respondFormData.responseMessage,
          is_admin_response: true,
          is_internal: respondFormData.responseType === 'internal'
        })
      } catch {
        // Comments table might not exist, that's okay
      }

      toast.success('Response sent', { description: 'Your response has been recorded' })
      setRespondFormData({ selectedFeedbackId: '', responseMessage: '', responseType: 'public', updateStatus: '' })
      setShowRespondDialog(false)
      fetchFeedback()
    } catch (error) {
      console.error('Error responding to feedback:', error)
      toast.error('Failed to send response')
    } finally {
      setSaving(false)
    }
  }

  // Merge feedback items
  const handleMergeFeedback = async () => {
    if (!mergeFormData.primaryFeedbackId) {
      toast.error('Please select a primary feedback item')
      return
    }
    if (mergeFormData.secondaryFeedbackIds.length === 0) {
      toast.error('Please select at least one feedback item to merge')
      return
    }

    setSaving(true)
    try {
      // Get primary feedback to aggregate votes
      const { data: primaryFeedback, error: fetchError } = await supabase
        .from('feedback')
        .select('upvotes_count')
        .eq('id', mergeFormData.primaryFeedbackId)
        .single()

      if (fetchError) throw fetchError

      // Get secondary feedback items to sum their votes
      const { data: secondaryFeedbacks, error: secondaryError } = await supabase
        .from('feedback')
        .select('upvotes_count')
        .in('id', mergeFormData.secondaryFeedbackIds)

      if (secondaryError) throw secondaryError

      const totalVotes = (primaryFeedback?.upvotes_count || 0) +
        (secondaryFeedbacks?.reduce((sum, f) => sum + (f.upvotes_count || 0), 0) || 0)

      // Update primary feedback with merged votes and note
      const mergeNote = mergeFormData.mergeReason
        ? ` [Merged: ${mergeFormData.mergeReason}]`
        : ' [Merged from duplicate items]'

      const { error: updateError } = await supabase
        .from('feedback')
        .update({
          upvotes_count: totalVotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', mergeFormData.primaryFeedbackId)

      if (updateError) throw updateError

      // Mark secondary feedback items as duplicates/merged
      const { error: mergeError } = await supabase
        .from('feedback')
        .update({
          status: 'duplicate',
          updated_at: new Date().toISOString()
        })
        .in('id', mergeFormData.secondaryFeedbackIds)

      if (mergeError) throw mergeError

      toast.success('Feedback merged', {
        description: `${mergeFormData.secondaryFeedbackIds.length + 1} items merged successfully`
      })
      setMergeFormData({ primaryFeedbackId: '', secondaryFeedbackIds: [], mergeReason: '' })
      setShowMergeDialog(false)
      fetchFeedback()
    } catch (error) {
      console.error('Error merging feedback:', error)
      toast.error('Failed to merge feedback items')
    } finally {
      setSaving(false)
    }
  }

  // Toggle secondary feedback selection for merge
  const toggleSecondaryFeedback = (feedbackId: string) => {
    setMergeFormData(prev => ({
      ...prev,
      secondaryFeedbackIds: prev.secondaryFeedbackIds.includes(feedbackId)
        ? prev.secondaryFeedbackIds.filter(id => id !== feedbackId)
        : [...prev.secondaryFeedbackIds, feedbackId]
    }))
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

  // Vote on idea via API
  const handleVote = async (idea: Idea) => {
    if (!user?.id) {
      toast.error('Please sign in to vote')
      return
    }

    toast.promise(
      fetch(`/api/feedback/${idea.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to record vote')
        }
        return res.json()
      }),
      {
        loading: 'Recording vote...',
        success: `Vote recorded for "${idea.title}"`,
        error: (err) => err.message || 'Failed to record vote'
      }
    )
  }

  // Reply to feedback via API
  const handleReplyToFeedback = async (feedbackId: string, message: string) => {
    if (!user?.id) {
      toast.error('Please sign in to reply')
      return
    }

    toast.promise(
      fetch(`/api/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, message })
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to post reply')
        }
        return res.json()
      }),
      {
        loading: 'Posting reply...',
        success: 'Reply posted successfully',
        error: (err) => err.message || 'Failed to post reply'
      }
    )
  }

  // Resolve/update feedback status via API
  const handleResolveFeedback = async (feedbackId: string, status: string) => {
    toast.promise(
      fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to update status')
        }
        fetchFeedback()
        return res.json()
      }),
      {
        loading: 'Updating status...',
        success: `Status updated to ${status}`,
        error: (err) => err.message || 'Failed to update status'
      }
    )
  }

  // Export feedback to CSV
  const handleExportCSV = async () => {
    toast.promise(
      (async () => {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user?.id)

        if (error) throw error

        // Convert to CSV
        const headers = ['ID', 'Title', 'Description', 'Type', 'Status', 'Priority', 'Category', 'Upvotes', 'Comments', 'Views', 'Created At']
        const csvRows = [headers.join(',')]

        for (const item of data || []) {
          const row = [
            item.id,
            `"${(item.title || '').replace(/"/g, '""')}"`,
            `"${(item.description || '').replace(/"/g, '""')}"`,
            item.feedback_type,
            item.status,
            item.priority,
            item.category || '',
            item.upvotes_count,
            item.comments_count,
            item.views_count,
            item.created_at
          ]
          csvRows.push(row.join(','))
        }

        const csvContent = csvRows.join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)

        return { success: true }
      })(),
      {
        loading: 'Exporting to CSV...',
        success: 'Feedback exported to CSV',
        error: 'Failed to export feedback'
      }
    )
  }

  // Delete feedback with confirmation
  const handleDeleteWithConfirm = async (feedbackId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    toast.promise(
      fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to delete feedback')
        }
        fetchFeedback()
        return res.json()
      }),
      {
        loading: 'Deleting feedback...',
        success: 'Feedback deleted successfully',
        error: (err) => err.message || 'Failed to delete feedback'
      }
    )
  }

  // Create segment via API
  const handleCreateSegment = async () => {
    toast.promise(
      fetch('/api/feedback/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Segment', filters: [] })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to create segment')
        return res.json()
      }),
      {
        loading: 'Creating segment...',
        success: 'Segment created successfully',
        error: 'Failed to create segment'
      }
    )
  }

  // Update category via API
  const handleUpdateCategory = async (categoryName: string) => {
    toast.promise(
      fetch('/api/feedback/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to update category')
        return res.json()
      }),
      {
        loading: `Updating ${categoryName}...`,
        success: `${categoryName} updated successfully`,
        error: 'Failed to update category'
      }
    )
  }

  // Add category via API
  const handleAddCategory = async () => {
    toast.promise(
      fetch('/api/feedback/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Category' })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to add category')
        return res.json()
      }),
      {
        loading: 'Adding category...',
        success: 'Category added successfully',
        error: 'Failed to add category'
      }
    )
  }

  // Configure status via API
  const handleConfigureStatus = async (statusName: string) => {
    toast.promise(
      fetch('/api/feedback/statuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: statusName })
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to configure status')
        return res.json()
      }),
      {
        loading: `Configuring ${statusName}...`,
        success: `${statusName} configured successfully`,
        error: 'Failed to configure status'
      }
    )
  }

  // Verify domain via API
  const handleVerifyDomain = async () => {
    toast.promise(
      fetch('/api/feedback/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to verify domain')
        return res.json()
      }),
      {
        loading: 'Verifying domain...',
        success: 'Domain verified successfully',
        error: 'Failed to verify domain'
      }
    )
  }

  // Test Slack connection via API
  const handleTestSlackConnection = async () => {
    toast.promise(
      fetch('/api/feedback/integrations/slack/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to connect to Slack')
        return res.json()
      }),
      {
        loading: 'Testing Slack connection...',
        success: 'Slack connection successful',
        error: 'Failed to connect to Slack'
      }
    )
  }

  // Connect Slack via API
  const handleConnectSlack = async () => {
    toast.promise(
      fetch('/api/feedback/integrations/slack/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to connect Slack')
        return res.json()
      }),
      {
        loading: 'Connecting to Slack...',
        success: 'Slack connected successfully',
        error: 'Failed to connect Slack'
      }
    )
  }

  // Regenerate API key via API
  const handleRegenerateApiKey = async () => {
    toast.promise(
      fetch('/api/feedback/api-keys/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to regenerate API key')
        return res.json()
      }),
      {
        loading: 'Regenerating API key...',
        success: 'API key regenerated',
        error: 'Failed to regenerate API key'
      }
    )
  }

  // Regenerate webhook secret via API
  const handleRegenerateWebhookSecret = async () => {
    toast.promise(
      fetch('/api/feedback/webhooks/regenerate-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to regenerate secret')
        return res.json()
      }),
      {
        loading: 'Regenerating webhook secret...',
        success: 'Webhook secret regenerated',
        error: 'Failed to regenerate secret'
      }
    )
  }

  // Test webhook via API
  const handleTestWebhook = async () => {
    toast.promise(
      fetch('/api/feedback/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Webhook test failed')
        return res.json()
      }),
      {
        loading: 'Testing webhook...',
        success: 'Webhook test successful',
        error: 'Webhook test failed'
      }
    )
  }

  // Connect/Configure integration via API
  const handleIntegrationAction = async (integration: { name: string; connected: boolean }) => {
    const action = integration.connected ? 'configure' : 'connect'
    toast.promise(
      fetch(`/api/feedback/integrations/${integration.name.toLowerCase()}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Failed to ${action} ${integration.name}`)
        return res.json()
      }),
      {
        loading: integration.connected ? `Configuring ${integration.name}...` : `Connecting ${integration.name}...`,
        success: integration.connected ? `${integration.name} configured successfully` : `${integration.name} connected successfully`,
        error: `Failed to ${action} ${integration.name}`
      }
    )
  }

  // Reset all votes via API with confirmation
  const handleResetAllVotes = async () => {
    if (!confirm('Are you sure you want to reset all votes? This action cannot be undone.')) {
      return
    }
    toast.promise(
      fetch('/api/feedback/admin/reset-votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to reset votes')
        return res.json()
      }),
      {
        loading: 'Resetting all votes...',
        success: 'All votes have been reset',
        error: 'Failed to reset votes'
      }
    )
  }

  // Archive all ideas via API with confirmation
  const handleArchiveAllIdeas = async () => {
    if (!confirm('Are you sure you want to archive all ideas? This action cannot be undone.')) {
      return
    }
    toast.promise(
      fetch('/api/feedback/admin/archive-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to archive ideas')
        return res.json()
      }),
      {
        loading: 'Archiving all ideas...',
        success: 'All ideas have been archived',
        error: 'Failed to archive ideas'
      }
    )
  }

  // Delete portal via API with confirmation
  const handleDeletePortal = async () => {
    if (!confirm('Are you sure you want to delete this portal? This action is PERMANENT and cannot be undone.')) {
      return
    }
    if (!confirm('This will delete ALL feedback, votes, and settings. Type "DELETE" to confirm.')) {
      return
    }
    toast.promise(
      fetch('/api/feedback/admin/delete-portal', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) throw new Error('Deletion blocked - confirm in settings first')
        return res.json()
      }),
      {
        loading: 'Deleting portal...',
        success: 'Portal deleted',
        error: 'Deletion blocked - confirm in settings first'
      }
    )
  }

  // Copy to clipboard helper
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch {
      toast.error(`Failed to copy ${label}`)
    }
  }

  // Quick actions defined inside component to access handlers
  const feedbackQuickActions = [
    { id: '1', label: 'New Idea', icon: 'Lightbulb', shortcut: 'N', action: () => setShowSubmitDialog(true) },
    { id: '2', label: 'Respond', icon: 'MessageSquare', shortcut: 'R', action: () => setShowRespondDialog(true) },
    { id: '3', label: 'Merge', icon: 'GitMerge', shortcut: 'M', action: () => setShowMergeDialog(true) },
    { id: '4', label: 'Export', icon: 'Download', shortcut: 'E', action: handleExportCSV },
  ]

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
            <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => {
                            e.stopPropagation()
                            handleVote(idea)
                          }}>
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
              <Button variant="outline" onClick={handleCreateSegment}>
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
                                <Button variant="ghost" size="sm" onClick={() => handleUpdateCategory(cat)}>Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleAddCategory}>
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
                              <Button variant="ghost" size="sm" onClick={() => handleConfigureStatus(item.status)}>Configure</Button>
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
                        <Button variant="outline" onClick={handleVerifyDomain}>Verify Domain</Button>
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
                          <Button variant="outline" className="flex-1" onClick={handleTestSlackConnection}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Test Connection
                          </Button>
                          <Button className="flex-1" onClick={handleConnectSlack}>Connect Slack</Button>
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
                            <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard('fb_live_xxxxxxxxxxxxxxxxxx', 'API key')}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleRegenerateApiKey}>
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
                            <Button variant="outline" size="icon" onClick={handleRegenerateWebhookSecret}>
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
                        <Button variant="outline" onClick={handleTestWebhook}>
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
                              <Button variant="outline" size="sm" className="w-full" onClick={() => handleIntegrationAction(integration)}>
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
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleResetAllVotes}>
                            Reset Votes
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Archive All Ideas</div>
                            <p className="text-sm text-gray-500">Archive all existing ideas</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleArchiveAllIdeas}>
                            Archive All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Delete Portal</div>
                            <p className="text-sm text-gray-500">Permanently delete this feedback portal</p>
                          </div>
                          <Button variant="destructive" onClick={handleDeletePortal}>
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
                    <Button className="flex-1" onClick={() => handleVote(selectedIdea)}>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Vote
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const comment = prompt('Enter your comment:')
                      if (comment) {
                        handleReplyToFeedback(selectedIdea.id, comment)
                      }
                    }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="outline" onClick={() => handleCopyToClipboard(`${window.location.origin}/feedback/${selectedIdea.id}`, 'Link')}>
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

        {/* Respond to Feedback Dialog */}
        <Dialog open={showRespondDialog} onOpenChange={setShowRespondDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Respond to Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Feedback Item</label>
                <select
                  className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                  value={respondFormData.selectedFeedbackId}
                  onChange={(e) => setRespondFormData(prev => ({ ...prev, selectedFeedbackId: e.target.value }))}
                >
                  <option value="">Choose a feedback item...</option>
                  {feedbackItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.status})
                    </option>
                  ))}
                  {mockIdeas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title} ({idea.status.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Response Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="responseType"
                      checked={respondFormData.responseType === 'public'}
                      onChange={() => setRespondFormData(prev => ({ ...prev, responseType: 'public' }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Public Response</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="responseType"
                      checked={respondFormData.responseType === 'internal'}
                      onChange={() => setRespondFormData(prev => ({ ...prev, responseType: 'internal' }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Internal Note</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Response Message</label>
                <textarea
                  className="w-full mt-1 p-3 rounded-lg border resize-none h-32 dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Write your response to the user..."
                  value={respondFormData.responseMessage}
                  onChange={(e) => setRespondFormData(prev => ({ ...prev, responseMessage: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Update Status (Optional)</label>
                <select
                  className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                  value={respondFormData.updateStatus}
                  onChange={(e) => setRespondFormData(prev => ({ ...prev, updateStatus: e.target.value as IdeaStatus | '' }))}
                >
                  <option value="">Keep current status</option>
                  <option value="under_review">Under Review</option>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="shipped">Shipped</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRespondDialog(false)} className="flex-1">Cancel</Button>
                <Button
                  onClick={handleRespondToFeedback}
                  disabled={saving || !respondFormData.selectedFeedbackId || !respondFormData.responseMessage.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {saving ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Merge Feedback Dialog */}
        <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Merge Feedback Items</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Primary Feedback (Keep This One)</label>
                <select
                  className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                  value={mergeFormData.primaryFeedbackId}
                  onChange={(e) => setMergeFormData(prev => ({
                    ...prev,
                    primaryFeedbackId: e.target.value,
                    secondaryFeedbackIds: prev.secondaryFeedbackIds.filter(id => id !== e.target.value)
                  }))}
                >
                  <option value="">Choose primary feedback...</option>
                  {feedbackItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} - {item.upvotes_count} votes
                    </option>
                  ))}
                  {mockIdeas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title} - {idea.votes} votes
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Select Items to Merge (Will be marked as duplicates)</label>
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto dark:border-gray-700">
                  {[...feedbackItems, ...mockIdeas.map(idea => ({
                    id: idea.id,
                    title: idea.title,
                    upvotes_count: idea.votes,
                    status: idea.status
                  }))].filter(item => item.id !== mergeFormData.primaryFeedbackId).map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 ${
                        mergeFormData.secondaryFeedbackIds.includes(item.id) ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={mergeFormData.secondaryFeedbackIds.includes(item.id)}
                        onChange={() => toggleSecondaryFeedback(item.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          {item.upvotes_count} votes - {item.status.replace('_', ' ')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {mergeFormData.secondaryFeedbackIds.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {mergeFormData.secondaryFeedbackIds.length} item(s) selected for merging
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Merge Reason (Optional)</label>
                <Input
                  placeholder="e.g., These are duplicate feature requests"
                  className="mt-1"
                  value={mergeFormData.mergeReason}
                  onChange={(e) => setMergeFormData(prev => ({ ...prev, mergeReason: e.target.value }))}
                />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Merging will combine vote counts and mark secondary items as duplicates.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowMergeDialog(false)} className="flex-1">Cancel</Button>
                <Button
                  onClick={handleMergeFeedback}
                  disabled={saving || !mergeFormData.primaryFeedbackId || mergeFormData.secondaryFeedbackIds.length === 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  {saving ? 'Merging...' : `Merge ${mergeFormData.secondaryFeedbackIds.length + 1} Items`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
