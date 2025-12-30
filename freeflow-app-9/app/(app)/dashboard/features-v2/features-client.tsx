'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Flag,
  ToggleLeft,
  ToggleRight,
  Users,
  TrendingUp,
  Settings,
  Target,
  Eye,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Search,
  Plus,
  Lightbulb,
  ThumbsUp,
  MessageSquare,
  Zap,
  GitBranch,
  Box,
  ExternalLink,
  Edit,
  Play,
  RefreshCcw,
  Code,
  Globe,
  Smartphone,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Activity,
  LayoutGrid,
  List,
  Kanban,
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
type FeatureStatus = 'idea' | 'planned' | 'in_progress' | 'testing' | 'released' | 'archived'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type RolloutStage = 'canary' | 'beta' | 'ga' | 'full'

interface FeatureOwner {
  id: string
  name: string
  avatar: string
  role: string
}

interface Vote {
  id: string
  userId: string
  userName: string
  createdAt: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
  reactions: { emoji: string; count: number }[]
}

interface RICEScore {
  reach: number
  impact: number
  confidence: number
  effort: number
  score: number
}

interface FeatureMetrics {
  adoption: number
  usage: number
  satisfaction: number
  errorRate: number
  latency: number
}

interface RolloutConfig {
  stage: RolloutStage
  percentage: number
  targetSegments: string[]
  environments: string[]
  startDate: string
  endDate?: string
}

interface ABTest {
  id: string
  name: string
  variants: { id: string; name: string; percentage: number }[]
  status: 'running' | 'paused' | 'completed'
  winner?: string
  metrics: { name: string; control: number; variant: number }[]
}

interface Feature {
  id: string
  key: string
  name: string
  description: string
  status: FeatureStatus
  priority: Priority
  category: string
  tags: string[]
  owner: FeatureOwner
  team: string
  createdAt: string
  updatedAt: string
  targetRelease?: string
  votes: Vote[]
  comments: Comment[]
  rice: RICEScore
  metrics?: FeatureMetrics
  rollout?: RolloutConfig
  abTest?: ABTest
  dependencies: string[]
  linkedIssues: string[]
  platforms: ('web' | 'ios' | 'android' | 'api')[]
}

interface Segment {
  id: string
  name: string
  description: string
  rules: { attribute: string; operator: string; value: string }[]
  userCount: number
}

// Mock Data
const mockOwners: FeatureOwner[] = [
  { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Product Manager' },
  { id: '2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', role: 'Tech Lead' },
  { id: '3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', role: 'UX Designer' },
  { id: '4', name: 'Alex Kim', avatar: '/avatars/alex.jpg', role: 'Engineering Manager' },
]

const mockFeatures: Feature[] = [
  {
    id: '1',
    key: 'ai_copilot',
    name: 'AI Copilot Assistant',
    description: 'Intelligent assistant that helps users complete tasks faster with contextual suggestions and automation.',
    status: 'in_progress',
    priority: 'critical',
    category: 'AI & ML',
    tags: ['ai', 'productivity', 'flagship'],
    owner: mockOwners[0],
    team: 'Platform',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
    targetRelease: 'Q2 2024',
    votes: Array(156).fill({ id: '1', userId: '1', userName: 'User', createdAt: '2024-01-01' }),
    comments: [
      {
        id: '1',
        userId: '1',
        userName: 'John Doe',
        userAvatar: '/avatars/john.jpg',
        content: 'This will be a game changer for our workflow!',
        createdAt: '2024-03-18',
        reactions: [{ emoji: '👍', count: 12 }, { emoji: '🎉', count: 5 }]
      }
    ],
    rice: { reach: 95, impact: 3, confidence: 80, effort: 8, score: 28.5 },
    metrics: { adoption: 45, usage: 78, satisfaction: 92, errorRate: 0.5, latency: 120 },
    rollout: {
      stage: 'beta',
      percentage: 25,
      targetSegments: ['power_users', 'early_adopters'],
      environments: ['production'],
      startDate: '2024-03-01'
    },
    abTest: {
      id: 'ab1',
      name: 'AI Suggestions Placement',
      variants: [
        { id: 'control', name: 'Sidebar', percentage: 50 },
        { id: 'variant_a', name: 'Inline', percentage: 50 }
      ],
      status: 'running',
      metrics: [
        { name: 'Task Completion', control: 65, variant: 78 },
        { name: 'Time Saved', control: 12, variant: 23 }
      ]
    },
    dependencies: ['feature_2', 'feature_3'],
    linkedIssues: ['JIRA-1234', 'JIRA-1235'],
    platforms: ['web', 'ios', 'android']
  },
  {
    id: '2',
    key: 'real_time_collab',
    name: 'Real-Time Collaboration',
    description: 'Enable multiple users to work on the same document simultaneously with live cursors and presence indicators.',
    status: 'testing',
    priority: 'high',
    category: 'Collaboration',
    tags: ['collaboration', 'real-time', 'core'],
    owner: mockOwners[1],
    team: 'Frontend',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-19',
    targetRelease: 'Q2 2024',
    votes: Array(89).fill({ id: '1', userId: '1', userName: 'User', createdAt: '2024-01-01' }),
    comments: [],
    rice: { reach: 80, impact: 3, confidence: 90, effort: 6, score: 36 },
    metrics: { adoption: 62, usage: 85, satisfaction: 88, errorRate: 1.2, latency: 45 },
    rollout: {
      stage: 'beta',
      percentage: 50,
      targetSegments: ['teams'],
      environments: ['production', 'staging'],
      startDate: '2024-02-15'
    },
    dependencies: [],
    linkedIssues: ['JIRA-1240'],
    platforms: ['web']
  },
  {
    id: '3',
    key: 'advanced_analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Comprehensive analytics with custom reports, cohort analysis, and predictive insights.',
    status: 'planned',
    priority: 'high',
    category: 'Analytics',
    tags: ['analytics', 'reporting', 'enterprise'],
    owner: mockOwners[2],
    team: 'Data',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-15',
    targetRelease: 'Q3 2024',
    votes: Array(134).fill({ id: '1', userId: '1', userName: 'User', createdAt: '2024-01-01' }),
    comments: [],
    rice: { reach: 70, impact: 2, confidence: 85, effort: 5, score: 23.8 },
    dependencies: ['feature_2'],
    linkedIssues: ['JIRA-1250', 'JIRA-1251'],
    platforms: ['web', 'api']
  },
  {
    id: '4',
    key: 'mobile_offline',
    name: 'Offline Mobile Support',
    description: 'Full offline functionality for mobile apps with smart sync and conflict resolution.',
    status: 'idea',
    priority: 'medium',
    category: 'Mobile',
    tags: ['mobile', 'offline', 'sync'],
    owner: mockOwners[3],
    team: 'Mobile',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-18',
    votes: Array(67).fill({ id: '1', userId: '1', userName: 'User', createdAt: '2024-01-01' }),
    comments: [],
    rice: { reach: 40, impact: 2, confidence: 70, effort: 7, score: 8 },
    dependencies: [],
    linkedIssues: [],
    platforms: ['ios', 'android']
  },
  {
    id: '5',
    key: 'sso_saml',
    name: 'SSO & SAML Integration',
    description: 'Enterprise-grade single sign-on with SAML 2.0 and OIDC support.',
    status: 'released',
    priority: 'critical',
    category: 'Security',
    tags: ['security', 'enterprise', 'auth'],
    owner: mockOwners[0],
    team: 'Security',
    createdAt: '2023-11-01',
    updatedAt: '2024-02-28',
    votes: Array(203).fill({ id: '1', userId: '1', userName: 'User', createdAt: '2024-01-01' }),
    comments: [],
    rice: { reach: 60, impact: 3, confidence: 95, effort: 4, score: 42.75 },
    metrics: { adoption: 78, usage: 95, satisfaction: 94, errorRate: 0.1, latency: 200 },
    rollout: {
      stage: 'full',
      percentage: 100,
      targetSegments: ['enterprise'],
      environments: ['production'],
      startDate: '2024-01-01',
      endDate: '2024-02-28'
    },
    dependencies: [],
    linkedIssues: ['JIRA-1100', 'JIRA-1101'],
    platforms: ['web', 'api']
  },
  {
    id: '6',
    key: 'webhooks_v2',
    name: 'Webhooks 2.0',
    description: 'Redesigned webhook system with retry logic, filtering, and real-time debugging.',
    status: 'in_progress',
    priority: 'medium',
    category: 'Integrations',
    tags: ['api', 'integrations', 'developer'],
    owner: mockOwners[1],
    team: 'Platform',
    createdAt: '2024-02-10',
    updatedAt: '2024-03-17',
    targetRelease: 'Q2 2024',
    votes: Array(45).fill({ id: '1', userId: '1', userName: 'User', createdAt: '2024-01-01' }),
    comments: [],
    rice: { reach: 35, impact: 2, confidence: 90, effort: 3, score: 21 },
    rollout: {
      stage: 'canary',
      percentage: 5,
      targetSegments: ['developers'],
      environments: ['staging'],
      startDate: '2024-03-10'
    },
    dependencies: [],
    linkedIssues: ['JIRA-1300'],
    platforms: ['api']
  }
]

const mockSegments: Segment[] = [
  {
    id: '1',
    name: 'Power Users',
    description: 'Users with high engagement',
    rules: [{ attribute: 'sessions_per_week', operator: '>', value: '10' }],
    userCount: 12500
  },
  {
    id: '2',
    name: 'Enterprise',
    description: 'Enterprise plan customers',
    rules: [{ attribute: 'plan', operator: '=', value: 'enterprise' }],
    userCount: 850
  },
  {
    id: '3',
    name: 'Early Adopters',
    description: 'Users who opted into beta features',
    rules: [{ attribute: 'beta_opt_in', operator: '=', value: 'true' }],
    userCount: 5200
  },
  {
    id: '4',
    name: 'Mobile Users',
    description: 'Users primarily on mobile',
    rules: [{ attribute: 'primary_platform', operator: 'in', value: 'ios,android' }],
    userCount: 34000
  }
]

const categories = ['All', 'AI & ML', 'Collaboration', 'Analytics', 'Mobile', 'Security', 'Integrations']

// Enhanced Competitive Upgrade Mock Data
const mockFeaturesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Feature Adoption', description: 'AI features showing 45% higher adoption than projected.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Adoption' },
  { id: '2', type: 'info' as const, title: 'Rollout Progress', description: '3 features in beta with 92% positive feedback.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Rollout' },
  { id: '3', type: 'warning' as const, title: 'Low Usage Feature', description: 'Advanced Analytics feature has <5% adoption. Consider improvements.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Usage' },
]

const mockFeaturesCollaborators = [
  { id: '1', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'PM' },
  { id: '2', name: 'Engineering Lead', avatar: '/avatars/eng.jpg', status: 'online' as const, role: 'Engineering' },
  { id: '3', name: 'UX Designer', avatar: '/avatars/ux.jpg', status: 'away' as const, role: 'Design' },
]

const mockFeaturesPredictions = [
  { id: '1', title: 'Feature Completion', prediction: '2 major features on track for Q1 release', confidence: 85, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'User Requests', prediction: 'Dark mode most requested - priority recommendation', confidence: 94, trend: 'up' as const, impact: 'medium' as const },
]

const mockFeaturesActivities = [
  { id: '1', user: 'Product', action: 'Released', target: 'AI Assistant to 100% of users', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Engineering', action: 'Started', target: 'development on Real-time Collaboration', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'QA', action: 'Approved', target: 'Mobile App v2 for beta', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockFeaturesQuickActions = [
  { id: '1', label: 'New Feature', icon: 'plus', action: () => console.log('New feature'), variant: 'default' as const },
  { id: '2', label: 'View Roadmap', icon: 'map', action: () => console.log('Roadmap'), variant: 'default' as const },
  { id: '3', label: 'Export Report', icon: 'download', action: () => console.log('Export'), variant: 'outline' as const },
]

export default function FeaturesClient() {
  const [features] = useState<Feature[]>(mockFeatures)
  const [segments] = useState<Segment[]>(mockSegments)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState<FeatureStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all')
  const [sortBy, setSortBy] = useState<'votes' | 'rice' | 'updated'>('votes')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [activeTab, setActiveTab] = useState('features')
  const [settingsTab, setSettingsTab] = useState('general')

  // Filtered and sorted features
  const filteredFeatures = useMemo(() => {
    let result = features

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.key.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'All') {
      result = result.filter(f => f.category === selectedCategory)
    }

    if (selectedStatus !== 'all') {
      result = result.filter(f => f.status === selectedStatus)
    }

    if (selectedPriority !== 'all') {
      result = result.filter(f => f.priority === selectedPriority)
    }

    result.sort((a, b) => {
      if (sortBy === 'votes') return b.votes.length - a.votes.length
      if (sortBy === 'rice') return b.rice.score - a.rice.score
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return result
  }, [features, searchQuery, selectedCategory, selectedStatus, selectedPriority, sortBy])

  // Stats
  const stats = useMemo(() => ({
    totalFeatures: features.length,
    inProgress: features.filter(f => f.status === 'in_progress').length,
    released: features.filter(f => f.status === 'released').length,
    totalVotes: features.reduce((sum, f) => sum + f.votes.length, 0),
    avgRICE: features.reduce((sum, f) => sum + f.rice.score, 0) / features.length
  }), [features])

  const getStatusColor = (status: FeatureStatus) => {
    const colors: Record<FeatureStatus, string> = {
      idea: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      testing: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      released: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: Priority) => {
    const colors: Record<Priority, string> = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[priority]
  }

  const getPriorityIcon = (priority: Priority) => {
    const icons: Record<Priority, React.ReactNode> = {
      critical: <ArrowUp className="h-3 w-3" />,
      high: <ArrowUp className="h-3 w-3" />,
      medium: <Minus className="h-3 w-3" />,
      low: <ArrowDown className="h-3 w-3" />
    }
    return icons[priority]
  }

  const getStatusIcon = (status: FeatureStatus) => {
    const icons: Record<FeatureStatus, React.ReactNode> = {
      idea: <Lightbulb className="h-4 w-4" />,
      planned: <Calendar className="h-4 w-4" />,
      in_progress: <Play className="h-4 w-4" />,
      testing: <Activity className="h-4 w-4" />,
      released: <CheckCircle className="h-4 w-4" />,
      archived: <Box className="h-4 w-4" />
    }
    return icons[status]
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, React.ReactNode> = {
      web: <Globe className="h-3 w-3" />,
      ios: <Smartphone className="h-3 w-3" />,
      android: <Smartphone className="h-3 w-3" />,
      api: <Code className="h-3 w-3" />
    }
    return icons[platform]
  }

  // Kanban columns
  const kanbanColumns: { status: FeatureStatus; title: string }[] = [
    { status: 'idea', title: 'Ideas' },
    { status: 'planned', title: 'Planned' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'testing', title: 'Testing' },
    { status: 'released', title: 'Released' }
  ]

  // Handlers
  const handleCreateFeature = () => {
    toast.info('Create Feature', {
      description: 'Opening feature form...'
    })
  }

  const handleMoveFeature = (featureId: string, newStatus: string) => {
    toast.success('Feature moved', {
      description: `Feature moved to ${newStatus}`
    })
  }

  const handleExportRoadmap = () => {
    toast.success('Exporting roadmap', {
      description: 'Roadmap will be downloaded'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Flag className="h-8 w-8" />
                Feature Management
              </h1>
              <p className="mt-2 text-white/80">
                Plan, prioritize, and ship features with confidence
              </p>
            </div>
            <Button className="bg-white text-indigo-600 hover:bg-white/90">
              <Plus className="h-4 w-4 mr-2" />
              New Feature
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.totalFeatures}</div>
              <div className="text-sm text-white/70">Total Features</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.inProgress}</div>
              <div className="text-sm text-white/70">In Progress</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.released}</div>
              <div className="text-sm text-white/70">Released</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.totalVotes}</div>
              <div className="text-sm text-white/70">Total Votes</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.avgRICE.toFixed(1)}</div>
              <div className="text-sm text-white/70">Avg RICE Score</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800">
              <TabsTrigger value="features" className="gap-2">
                <Flag className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="gap-2">
                <GitBranch className="h-4 w-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="segments" className="gap-2">
                <Users className="h-4 w-4" />
                Segments
              </TabsTrigger>
              <TabsTrigger value="experiments" className="gap-2">
                <Target className="h-4 w-4" />
                Experiments
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <Kanban className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="features" className="space-y-6">
            {/* Features Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Flag className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Feature Flags Dashboard</h2>
                    <p className="text-indigo-100">Manage, prioritize, and ship features with confidence</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalFeatures}</p>
                    <p className="text-sm text-indigo-200">Features</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.inProgress}</p>
                    <p className="text-sm text-indigo-200">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.released}</p>
                    <p className="text-sm text-indigo-200">Released</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'New Feature', icon: Plus, color: 'from-indigo-500 to-purple-500' },
                { label: 'Toggle Flag', icon: ToggleRight, color: 'from-green-500 to-emerald-500' },
                { label: 'Start Rollout', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
                { label: 'A/B Test', icon: Target, color: 'from-orange-500 to-red-500' },
                { label: 'Add Segment', icon: Users, color: 'from-purple-500 to-pink-500' },
                { label: 'View Metrics', icon: BarChart3, color: 'from-teal-500 to-cyan-500' },
                { label: 'Compare', icon: GitBranch, color: 'from-pink-500 to-rose-500' },
                { label: 'Export', icon: ExternalLink, color: 'from-gray-500 to-gray-600' }
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all group"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {categories.map(cat => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as FeatureStatus | 'all')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Status</option>
                      <option value="idea">Idea</option>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="released">Released</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'votes' | 'rice' | 'updated')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="votes">Most Voted</option>
                      <option value="rice">RICE Score</option>
                      <option value="updated">Recently Updated</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature List/Grid/Kanban */}
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-5 gap-4">
                {kanbanColumns.map(col => (
                  <div key={col.status} className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(col.status)}
                        <span className="font-semibold">{col.title}</span>
                      </div>
                      <Badge variant="secondary">
                        {filteredFeatures.filter(f => f.status === col.status).length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {filteredFeatures
                        .filter(f => f.status === col.status)
                        .map(feature => (
                          <Card
                            key={feature.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedFeature(feature)}
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-sm">{feature.name}</h4>
                                <Badge className={getPriorityColor(feature.priority)} variant="secondary">
                                  {feature.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {feature.platforms.map(p => (
                                  <span key={p} className="text-gray-400">
                                    {getPlatformIcon(p)}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  {feature.votes.length}
                                </div>
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback>{feature.owner.name[0]}</AvatarFallback>
                                </Avatar>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left p-4 font-medium">Feature</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Priority</th>
                        <th className="text-left p-4 font-medium">Owner</th>
                        <th className="text-left p-4 font-medium">RICE</th>
                        <th className="text-left p-4 font-medium">Votes</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeatures.map(feature => (
                        <tr
                          key={feature.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setSelectedFeature(feature)}
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{feature.name}</div>
                              <code className="text-xs text-gray-500">{feature.key}</code>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(feature.status)} variant="secondary">
                              {feature.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={getPriorityColor(feature.priority)} variant="secondary">
                              {getPriorityIcon(feature.priority)}
                              <span className="ml-1">{feature.priority}</span>
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{feature.owner.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{feature.owner.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold">{feature.rice.score.toFixed(1)}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-gray-400" />
                              <span>{feature.votes.length}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFeatures.map(feature => (
                  <Card
                    key={feature.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{feature.name}</h3>
                          <code className="text-xs text-gray-500">{feature.key}</code>
                        </div>
                        <Badge className={getStatusColor(feature.status)} variant="secondary">
                          {getStatusIcon(feature.status)}
                          <span className="ml-1">{feature.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {feature.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {feature.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {feature.votes.length}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {feature.comments.length}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(feature.priority)} variant="secondary">
                            {feature.priority}
                          </Badge>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{feature.owner.name[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      {feature.rollout && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Rollout</span>
                            <span className="font-medium">{feature.rollout.percentage}%</span>
                          </div>
                          <Progress value={feature.rollout.percentage} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            {/* Roadmap Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <GitBranch className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Product Roadmap</h2>
                    <p className="text-blue-100">Plan and visualize your feature pipeline across quarters</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{features.filter(f => f.targetRelease).length}</p>
                    <p className="text-sm text-blue-200">Planned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">4</p>
                    <p className="text-sm text-blue-200">Quarters</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feature Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'].map(quarter => {
                    const quarterFeatures = features.filter(f => f.targetRelease === quarter)
                    return (
                      <div key={quarter} className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                          {quarter}
                          <Badge variant="secondary">{quarterFeatures.length} features</Badge>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-7">
                          {quarterFeatures.map(feature => (
                            <Card key={feature.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedFeature(feature)}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{feature.name}</span>
                                  <Badge className={getStatusColor(feature.status)} variant="secondary">
                                    {feature.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{feature.team}</span>
                                  <span>•</span>
                                  <span>{feature.owner.name}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            {/* Segments Overview Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">User Segments</h2>
                    <p className="text-green-100">Target features to specific user groups with precision</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{segments.length}</p>
                    <p className="text-sm text-green-200">Segments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{segments.reduce((sum, s) => sum + s.userCount, 0).toLocaleString()}</p>
                    <p className="text-sm text-green-200">Total Users</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Segments</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segments.map(segment => (
                <Card key={segment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{segment.name}</h3>
                        <p className="text-sm text-gray-500">{segment.description}</p>
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {segment.userCount.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">Rules</div>
                      {segment.rules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <code className="text-indigo-600">{rule.attribute}</code>
                          <span className="text-gray-400">{rule.operator}</span>
                          <code className="text-green-600">{rule.value}</code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experiments" className="space-y-6">
            {/* Experiments Overview Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Target className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">A/B Experiments</h2>
                    <p className="text-orange-100">Run data-driven experiments to optimize features</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{features.filter(f => f.abTest).length}</p>
                    <p className="text-sm text-orange-200">Active Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{features.filter(f => f.abTest?.status === 'running').length}</p>
                    <p className="text-sm text-orange-200">Running</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">A/B Experiments</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {features.filter(f => f.abTest).map(feature => (
                <Card key={feature.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{feature.abTest!.name}</h3>
                        <p className="text-sm text-gray-500">Feature: {feature.name}</p>
                      </div>
                      <Badge
                        className={feature.abTest!.status === 'running'
                          ? 'bg-green-100 text-green-700'
                          : feature.abTest!.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'}
                      >
                        {feature.abTest!.status}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {feature.abTest!.variants.map(v => (
                          <div key={v.id} className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                            <div className="font-medium text-sm">{v.name}</div>
                            <div className="text-2xl font-bold text-indigo-600">{v.percentage}%</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 font-medium">Metrics</div>
                        {feature.abTest!.metrics.map((m, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{m.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500">Control: {m.control}%</span>
                              <span className={m.variant > m.control ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                Variant: {m.variant}%
                                {m.variant > m.control && <ArrowUp className="h-3 w-3 inline ml-1" />}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Feature Management Settings</h2>
                    <p className="text-gray-300">Configure feature flags, rollouts, and experiments</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">All Systems Operational</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Sync Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                        { id: 'flags', icon: Flag, label: 'Feature Flags', desc: 'Flag config' },
                        { id: 'rollouts', icon: TrendingUp, label: 'Rollouts', desc: 'Deploy rules' },
                        { id: 'segments', icon: Users, label: 'Segments', desc: 'User targeting' },
                        { id: 'notifications', icon: AlertCircle, label: 'Notifications', desc: 'Alert prefs' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power settings' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                            settingsTab === item.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div className="text-left">
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
              <div className="col-span-9">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
                        <Input defaultValue="FreeFlow Features" className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Environment</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>Production</option>
                          <option>Staging</option>
                          <option>Development</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Feature Flags</p>
                          <p className="text-sm text-gray-500">Allow feature flag evaluations</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Real-time Updates</p>
                          <p className="text-sm text-gray-500">Push flag changes instantly</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Debug Mode</p>
                          <p className="text-sm text-gray-500">Enable verbose logging</p>
                        </div>
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">RICE Scoring</p>
                          <p className="text-sm text-gray-500">Automatic prioritization scoring</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Feature Flags Settings */}
                {settingsTab === 'flags' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flag className="w-5 h-5 text-purple-600" />
                        Feature Flags Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Default Flag State</p>
                          <p className="text-sm text-gray-500">New flags start as disabled</p>
                        </div>
                        <Badge>Off</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Require Approval</p>
                          <p className="text-sm text-gray-500">Production changes need approval</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-cleanup Stale Flags</p>
                          <p className="text-sm text-gray-500">Remove flags not accessed in 90 days</p>
                        </div>
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Flag Dependencies</p>
                          <p className="text-sm text-gray-500">Track flag relationships</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stale Flag Threshold</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>30 days</option>
                          <option>60 days</option>
                          <option>90 days</option>
                          <option>180 days</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Version Control</p>
                          <p className="text-sm text-gray-500">Track all flag configuration changes</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rollouts Settings */}
                {settingsTab === 'rollouts' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Rollout Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Rollout Strategy</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>Percentage-based</option>
                          <option>User segment</option>
                          <option>Gradual rollout</option>
                          <option>Ring-based</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Canary Deployments</p>
                          <p className="text-sm text-gray-500">Start with small percentage</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Automatic Rollbacks</p>
                          <p className="text-sm text-gray-500">Rollback on error threshold breach</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Error Rate Threshold</label>
                        <Input type="number" defaultValue="5" className="max-w-md" />
                        <p className="text-sm text-gray-500 mt-1">Rollback if error rate exceeds this percentage</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sticky Bucketing</p>
                          <p className="text-sm text-gray-500">Keep users in same variant</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Schedule Rollouts</p>
                          <p className="text-sm text-gray-500">Plan rollouts for specific times</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Segments Settings */}
                {settingsTab === 'segments' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        User Segments Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Dynamic Segments</p>
                          <p className="text-sm text-gray-500">Auto-update segment membership</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Segment Analytics</p>
                          <p className="text-sm text-gray-500">Track segment performance</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Import Segments</p>
                          <p className="text-sm text-gray-500">Sync from external sources</p>
                        </div>
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Segment Operator</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>AND (all rules must match)</option>
                          <option>OR (any rule must match)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">User Attributes</p>
                          <p className="text-sm text-gray-500">Custom targeting attributes</p>
                        </div>
                        <Badge>12 configured</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Segment Versioning</p>
                          <p className="text-sm text-gray-500">Track segment rule changes</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Flag Changes</p>
                          <p className="text-sm text-gray-500">When flags are toggled or modified</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Rollout Progress</p>
                          <p className="text-sm text-gray-500">Rollout milestone notifications</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Error Alerts</p>
                          <p className="text-sm text-gray-500">High error rate notifications</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Experiment Results</p>
                          <p className="text-sm text-gray-500">A/B test completion alerts</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Stale Flag Warnings</p>
                          <p className="text-sm text-gray-500">Alert when flags become stale</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Weekly Digest</p>
                          <p className="text-sm text-gray-500">Weekly feature summary email</p>
                        </div>
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Channels</label>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-100 text-blue-700">Email</Badge>
                          <Badge className="bg-purple-100 text-purple-700">Slack</Badge>
                          <Badge variant="outline">Webhook</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">SDK Caching</p>
                          <p className="text-sm text-gray-500">Cache flag evaluations locally</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cache TTL</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>5 minutes</option>
                          <option>15 minutes</option>
                          <option>30 minutes</option>
                          <option>1 hour</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">API Rate Limiting</p>
                          <p className="text-sm text-gray-500">Limit SDK requests per minute</p>
                        </div>
                        <Badge>1000/min</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                          <p className="text-sm text-gray-500">Log all flag evaluations</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Offline Mode</p>
                          <p className="text-sm text-gray-500">Enable offline flag evaluation</p>
                        </div>
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Custom Events</p>
                          <p className="text-sm text-gray-500">Track custom analytics events</p>
                        </div>
                        <ToggleRight className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="pt-6 border-t dark:border-gray-700">
                        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Reset All Flags</p>
                              <p className="text-sm text-red-600">Reset all flags to default state</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                              Reset
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete Project</p>
                              <p className="text-sm text-red-600">Permanently delete this project</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                              Delete
                            </Button>
                          </div>
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
              insights={mockFeaturesAIInsights}
              title="Feature Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockFeaturesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockFeaturesPredictions}
              title="Feature Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockFeaturesActivities}
            title="Feature Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockFeaturesQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Feature Detail Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedFeature && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedFeature.name}</DialogTitle>
                    <code className="text-sm text-gray-500">{selectedFeature.key}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedFeature.status)}>
                      {selectedFeature.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(selectedFeature.priority)}>
                      {selectedFeature.priority}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rollout">Rollout</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="overview" className="p-4 space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedFeature.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Owner</h4>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{selectedFeature.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{selectedFeature.owner.name}</div>
                            <div className="text-sm text-gray-500">{selectedFeature.owner.role}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Team</h4>
                        <Badge variant="outline">{selectedFeature.team}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">RICE Score</h4>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">{selectedFeature.rice.reach}</div>
                          <div className="text-xs text-gray-500">Reach</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">{selectedFeature.rice.impact}</div>
                          <div className="text-xs text-gray-500">Impact</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">{selectedFeature.rice.confidence}%</div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">{selectedFeature.rice.effort}</div>
                          <div className="text-xs text-gray-500">Effort</div>
                        </div>
                        <div className="text-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">{selectedFeature.rice.score.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Platforms</h4>
                      <div className="flex gap-2">
                        {selectedFeature.platforms.map(p => (
                          <Badge key={p} variant="outline" className="gap-1">
                            {getPlatformIcon(p)}
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFeature.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rollout" className="p-4 space-y-6">
                    {selectedFeature.rollout ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-gray-500">Stage</div>
                              <div className="text-xl font-bold capitalize">{selectedFeature.rollout.stage}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-gray-500">Percentage</div>
                              <div className="text-xl font-bold">{selectedFeature.rollout.percentage}%</div>
                            </CardContent>
                          </Card>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Rollout Progress</h4>
                          <Progress value={selectedFeature.rollout.percentage} className="h-3" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Target Segments</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedFeature.rollout.targetSegments.map(s => (
                              <Badge key={s} variant="outline">{s}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Environments</h4>
                          <div className="flex gap-2">
                            {selectedFeature.rollout.environments.map(e => (
                              <Badge key={e} className={e === 'production' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                {e}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Flag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No rollout configured yet</p>
                        <Button className="mt-4">Configure Rollout</Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="metrics" className="p-4 space-y-6">
                    {selectedFeature.metrics ? (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Adoption</div>
                            <div className="text-2xl font-bold text-green-600">{selectedFeature.metrics.adoption}%</div>
                            <Progress value={selectedFeature.metrics.adoption} className="h-1 mt-2" />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Usage</div>
                            <div className="text-2xl font-bold text-blue-600">{selectedFeature.metrics.usage}%</div>
                            <Progress value={selectedFeature.metrics.usage} className="h-1 mt-2" />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Satisfaction</div>
                            <div className="text-2xl font-bold text-purple-600">{selectedFeature.metrics.satisfaction}%</div>
                            <Progress value={selectedFeature.metrics.satisfaction} className="h-1 mt-2" />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Error Rate</div>
                            <div className="text-2xl font-bold text-red-600">{selectedFeature.metrics.errorRate}%</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Latency</div>
                            <div className="text-2xl font-bold text-amber-600">{selectedFeature.metrics.latency}ms</div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Metrics available after release</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-5 w-5 text-indigo-600" />
                        <span className="font-semibold">{selectedFeature.votes.length} votes</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Vote
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Comments ({selectedFeature.comments.length})</h4>
                      {selectedFeature.comments.map(comment => (
                        <Card key={comment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{comment.userName}</span>
                                  <span className="text-xs text-gray-500">{comment.createdAt}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                                <div className="flex gap-2 mt-2">
                                  {comment.reactions.map((r, i) => (
                                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                                      {r.emoji} {r.count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
