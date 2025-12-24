// Feedback V2 - UserVoice Level Feedback Management Platform
// Comprehensive customer feedback portal with voting, roadmap, and insights
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageSquare,
  ThumbsUp,
  Search,
  Filter,
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
  ArrowDown,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Link2,
  Merge,
  Tag,
  Star,
  AlertTriangle,
  ChevronRight,
  GitBranch,
  Activity,
  PieChart,
  Send,
  Settings,
  LayoutGrid,
  List,
  Zap,
  Award
} from 'lucide-react'

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

interface FeedbackClientProps {
  initialFeedback?: any[]
}

export default function FeedbackClient({ initialFeedback }: FeedbackClientProps) {
  const [activeTab, setActiveTab] = useState('ideas')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IdeaCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'trending'>('votes')
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

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
            <Button variant="outline" size="sm">
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
              <Button variant="outline">
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
        </Tabs>

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
                      <Button variant="outline" size="sm" className="mb-1">
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
                    <Button className="flex-1">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Vote
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="outline">
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
                <Input placeholder="Brief description of your idea" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full mt-1 p-3 rounded-lg border resize-none h-32"
                  placeholder="Detailed explanation of your idea and why it would be valuable..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full mt-1 p-2 rounded-lg border">
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
                  <select className="w-full mt-1 p-2 rounded-lg border">
                    <option value="core">Core Platform</option>
                    <option value="api">Developer API</option>
                    <option value="integrations">Integrations</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input placeholder="e.g., mobile, performance, api" className="mt-1" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Idea
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
