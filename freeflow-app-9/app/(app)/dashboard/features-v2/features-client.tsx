'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { downloadAsCsv, apiPost, deleteWithConfirmation } from '@/lib/button-handlers'
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
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

// Empty data arrays (connect to real data sources)
const features: Feature[] = []
const segments: Segment[] = []

const categories = ['All', 'AI & ML', 'Collaboration', 'Analytics', 'Mobile', 'Security', 'Integrations']

// Empty data arrays for competitive upgrade components (connect to real data sources)
const featuresAIInsights: { id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const featuresCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const featuresPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'high' | 'medium' | 'low' }[] = []

const featuresActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'update' | 'warning' }[] = []

// Quick actions will be defined inside the component to access state

export default function FeaturesClient() {
  const [featuresState] = useState<Feature[]>(features)
  const [segmentsState] = useState<Segment[]>(segments)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState<FeatureStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all')
  const [sortBy, setSortBy] = useState<'votes' | 'rice' | 'updated'>('votes')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [activeTab, setActiveTab] = useState('features')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states implementations
  const [showCreateSegmentDialog, setShowCreateSegmentDialog] = useState(false)
  const [showExperimentDialog, setShowExperimentDialog] = useState(false)
  const [showRolloutDialog, setShowRolloutDialog] = useState(false)

  // Form state for Create Segment dialog
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    attribute: 'sessions_per_week',
    operator: '>',
    value: ''
  })

  // Form state for A/B Experiment dialog
  const [experimentForm, setExperimentForm] = useState({
    name: '',
    featureId: '',
    controlName: 'Control',
    variantName: 'Variant A',
    controlPercentage: 50,
    metricName: ''
  })

  // Form state for Rollout Configuration dialog
  const [rolloutForm, setRolloutForm] = useState({
    stage: 'canary' as RolloutStage,
    percentage: 5,
    targetSegments: [] as string[],
    environments: ['staging'] as string[]
  })

  // Filtered and sorted features
  const filteredFeatures = useMemo(() => {
    let result = featuresState

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
  }, [featuresState, searchQuery, selectedCategory, selectedStatus, selectedPriority, sortBy])

  // Stats
  const stats = useMemo(() => ({
    totalFeatures: featuresState.length,
    inProgress: featuresState.filter(f => f.status === 'in_progress').length,
    released: featuresState.filter(f => f.status === 'released').length,
    totalVotes: featuresState.reduce((sum, f) => sum + f.votes.length, 0),
    avgRICE: featuresState.length > 0 ? featuresState.reduce((sum, f) => sum + f.rice.score, 0) / featuresState.length : 0
  }), [featuresState])

  // Real handlers for feature operations
  const handleCreateFeatureRequest = useCallback(() => {
    // Open feature request dialog - for now, show form info
    toast.info('Create Feature Request', {
      description: 'Opening feature request form. Fill in name, description, category, and priority.'
    })
    // In a full implementation, this would open a dialog/modal
  }, [])

  const handleViewRoadmap = useCallback(() => {
    setActiveTab('roadmap')
    toast.success('Roadmap View', {
      description: 'Switched to product roadmap view showing features across quarters'
    })
  }, [])

  const handleExportFeatures = useCallback(() => {
    const exportData = featuresState.map(f => ({
      id: f.id,
      key: f.key,
      name: f.name,
      description: f.description,
      status: f.status,
      priority: f.priority,
      category: f.category,
      team: f.team,
      owner: f.owner.name,
      votes: f.votes.length,
      rice_score: f.rice.score,
      platforms: f.platforms.join(', '),
      tags: f.tags.join(', '),
      target_release: f.targetRelease || '',
      created_at: f.createdAt,
      updated_at: f.updatedAt
    }))
    downloadAsCsv(exportData, `features-export-${new Date().toISOString().split('T')[0]}.csv`)
  }, [featuresState])

  const handleVoteForFeature = useCallback(async (featureId: string, featureName: string) => {
    const result = await apiPost(`/api/features/${featureId}/vote`, { vote: 1 }, {
      loading: `Voting for ${featureName}...`,
      success: `Your vote for "${featureName}" has been recorded`,
      error: 'Failed to record vote'
    })
    return result.success
  }, [])

  const handleToggleFeatureFlag = useCallback(async (featureId: string, featureName: string, currentEnabled: boolean) => {
    const result = await apiPost(`/api/features/${featureId}/toggle`, { enabled: !currentEnabled }, {
      loading: `${currentEnabled ? 'Disabling' : 'Enabling'} ${featureName}...`,
      success: `Feature "${featureName}" has been ${currentEnabled ? 'disabled' : 'enabled'}`,
      error: `Failed to ${currentEnabled ? 'disable' : 'enable'} feature`
    })
    return result.success
  }, [])

  const handleDeleteFeature = useCallback(async (featureId: string, featureName: string) => {
    await deleteWithConfirmation(
      async () => {
        const response = await fetch(`/api/features/${featureId}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Delete failed')
      },
      { itemName: `feature "${featureName}"` }
    )
  }, [])

  // Handler for creating a new segment
  const handleSubmitSegment = useCallback(() => {
    if (!segmentForm.name || !segmentForm.value) {
      toast.error('Please fill in all required fields', {
        description: 'Segment name and rule value are required'
      })
      return
    }
    toast.success('Segment created successfully', {
      description: `"${segmentForm.name}" segment has been created with ${segmentForm.attribute} ${segmentForm.operator} ${segmentForm.value}`
    })
    setShowCreateSegmentDialog(false)
    setSegmentForm({
      name: '',
      description: '',
      attribute: 'sessions_per_week',
      operator: '>',
      value: ''
    })
  }, [segmentForm])

  // Handler for creating a new A/B experiment
  const handleSubmitExperiment = useCallback(() => {
    if (!experimentForm.name || !experimentForm.featureId) {
      toast.error('Please fill in all required fields', {
        description: 'Experiment name and feature are required'
      })
      return
    }
    const selectedFeatureName = featuresState.find(f => f.id === experimentForm.featureId)?.name
    toast.success('A/B Experiment created successfully', {
      description: `"${experimentForm.name}" experiment started for ${selectedFeatureName} with ${experimentForm.controlPercentage}% / ${100 - experimentForm.controlPercentage}% split`
    })
    setShowExperimentDialog(false)
    setExperimentForm({
      name: '',
      featureId: '',
      controlName: 'Control',
      variantName: 'Variant A',
      controlPercentage: 50,
      metricName: ''
    })
  }, [experimentForm, featuresState])

  // Handler for configuring rollout
  const handleSubmitRollout = useCallback(() => {
    if (!selectedFeature) {
      toast.error('No feature selected')
      return
    }
    toast.success('Rollout configured successfully', {
      description: `${selectedFeature.name} configured for ${rolloutForm.stage} rollout at ${rolloutForm.percentage}% to ${rolloutForm.environments.join(', ')}`
    })
    setShowRolloutDialog(false)
    setRolloutForm({
      stage: 'canary',
      percentage: 5,
      targetSegments: [],
      environments: ['staging']
    })
  }, [rolloutForm, selectedFeature])

  // Quick actions for the toolbar
  const featuresQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Feature',
      icon: 'plus',
      action: handleCreateFeatureRequest,
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'View Roadmap',
      icon: 'map',
      action: handleViewRoadmap,
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Export Report',
      icon: 'download',
      action: handleExportFeatures,
      variant: 'outline' as const
    },
  ], [handleCreateFeatureRequest, handleViewRoadmap, handleExportFeatures])

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
            <Button className="bg-white text-indigo-600 hover:bg-white/90" onClick={handleCreateFeatureRequest}>
              <Plus className="h-4 w-4 mr-2" />
              New Feature
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mt-8">
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
                { label: 'New Feature', icon: Plus, color: 'from-indigo-500 to-purple-500', onClick: handleCreateFeatureRequest },
                { label: 'Toggle Flag', icon: ToggleRight, color: 'from-green-500 to-emerald-500', onClick: () => toast.info('Toggle Feature Flag', { description: 'Select a feature from the list to toggle its flag status' }) },
                { label: 'Start Rollout', icon: TrendingUp, color: 'from-blue-500 to-cyan-500', onClick: () => toast.info('Start Rollout', { description: 'Select a feature to configure and start a gradual rollout' }) },
                { label: 'A/B Test', icon: Target, color: 'from-orange-500 to-red-500', onClick: () => { setActiveTab('experiments'); toast.success('Switched to Experiments tab') } },
                { label: 'Add Segment', icon: Users, color: 'from-purple-500 to-pink-500', onClick: () => { setActiveTab('segments'); toast.success('Switched to Segments tab') } },
                { label: 'View Metrics', icon: BarChart3, color: 'from-teal-500 to-cyan-500', onClick: () => toast.info('View Metrics', { description: 'Select a released feature to view its performance metrics' }) },
                { label: 'Compare', icon: GitBranch, color: 'from-pink-500 to-rose-500', onClick: () => toast.info('Compare Features', { description: 'Select multiple features to compare RICE scores and metrics' }) },
                { label: 'Export', icon: ExternalLink, color: 'from-gray-500 to-gray-600', onClick: handleExportFeatures }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
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
                    <p className="text-3xl font-bold">{featuresState.filter(f => f.targetRelease).length}</p>
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
                    const quarterFeatures = featuresState.filter(f => f.targetRelease === quarter)
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
                    <p className="text-3xl font-bold">{segmentsState.length}</p>
                    <p className="text-sm text-green-200">Segments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{segmentsState.reduce((sum, s) => sum + s.userCount, 0).toLocaleString()}</p>
                    <p className="text-sm text-green-200">Total Users</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Segments</h2>
              <Button onClick={() => setShowCreateSegmentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segmentsState.map(segment => (
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
                    <p className="text-3xl font-bold">{featuresState.filter(f => f.abTest).length}</p>
                    <p className="text-sm text-orange-200">Active Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{featuresState.filter(f => f.abTest?.status === 'running').length}</p>
                    <p className="text-sm text-orange-200">Running</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">A/B Experiments</h2>
              <Button onClick={() => setShowExperimentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {featuresState.filter(f => f.abTest).map(feature => (
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
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={async () => {
                      const result = await apiPost('/api/features/sync', {}, {
                        loading: 'Syncing feature settings...',
                        success: 'Feature settings synchronized successfully',
                        error: 'Failed to sync settings'
                      })
                    }}
                  >
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
                            <Button
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-100"
                              onClick={async () => {
                                if (confirm('Are you sure you want to reset all feature flags? This action cannot be undone.')) {
                                  const result = await apiPost('/api/features/reset-all', {}, {
                                    loading: 'Resetting all feature flags...',
                                    success: 'All feature flags have been reset to their default state',
                                    error: 'Failed to reset feature flags'
                                  })
                                }
                              }}
                            >
                              Reset
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete Project</p>
                              <p className="text-sm text-red-600">Permanently delete this project</p>
                            </div>
                            <Button
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-100"
                              onClick={() => deleteWithConfirmation(
                                async () => {
                                  const response = await fetch('/api/features/project', { method: 'DELETE' })
                                  if (!response.ok) throw new Error('Delete failed')
                                },
                                { itemName: 'project and all its features' }
                              )}
                            >
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
              insights={featuresAIInsights}
              title="Feature Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={featuresCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={featuresPredictions}
              title="Feature Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={featuresActivities}
            title="Feature Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={featuresQuickActions}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <Button className="mt-4" onClick={() => setShowRolloutDialog(true)}>Configure Rollout</Button>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoteForFeature(selectedFeature.id, selectedFeature.name)}
                      >
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

      {/* Create Segment Dialog */}
      <Dialog open={showCreateSegmentDialog} onOpenChange={setShowCreateSegmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Create User Segment
            </DialogTitle>
            <DialogDescription>
              Define a new user segment with targeting rules for feature rollouts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="segment-name">Segment Name *</Label>
              <Input
                id="segment-name"
                placeholder="e.g., Power Users, Enterprise Customers"
                value={segmentForm.name}
                onChange={(e) => setSegmentForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segment-description">Description</Label>
              <Textarea
                id="segment-description"
                placeholder="Describe who belongs to this segment..."
                value={segmentForm.description}
                onChange={(e) => setSegmentForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Targeting Rule</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                <Select
                  value={segmentForm.attribute}
                  onValueChange={(value) => setSegmentForm(prev => ({ ...prev, attribute: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sessions_per_week">Sessions/Week</SelectItem>
                    <SelectItem value="plan">Plan Type</SelectItem>
                    <SelectItem value="beta_opt_in">Beta Opt-in</SelectItem>
                    <SelectItem value="primary_platform">Platform</SelectItem>
                    <SelectItem value="account_age_days">Account Age</SelectItem>
                    <SelectItem value="total_revenue">Total Revenue</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={segmentForm.operator}
                  onValueChange={(value) => setSegmentForm(prev => ({ ...prev, operator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value="!=">!=</SelectItem>
                    <SelectItem value=">">&gt;</SelectItem>
                    <SelectItem value="<">&lt;</SelectItem>
                    <SelectItem value=">=">&gt;=</SelectItem>
                    <SelectItem value="<=">&lt;=</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={segmentForm.value}
                  onChange={(e) => setSegmentForm(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <p className="text-xs text-gray-500">
                Example: sessions_per_week &gt; 10 targets users with high engagement
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSegmentDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitSegment} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create A/B Experiment Dialog */}
      <Dialog open={showExperimentDialog} onOpenChange={setShowExperimentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Create A/B Experiment
            </DialogTitle>
            <DialogDescription>
              Set up a new A/B test to measure feature impact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="experiment-name">Experiment Name *</Label>
              <Input
                id="experiment-name"
                placeholder="e.g., New Checkout Flow Test"
                value={experimentForm.name}
                onChange={(e) => setExperimentForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-feature">Feature *</Label>
              <Select
                value={experimentForm.featureId}
                onValueChange={(value) => setExperimentForm(prev => ({ ...prev, featureId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a feature to test" />
                </SelectTrigger>
                <SelectContent>
                  {featuresState.filter(f => !f.abTest).map(feature => (
                    <SelectItem key={feature.id} value={feature.id}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="control-name">Control Name</Label>
                <Input
                  id="control-name"
                  placeholder="Control"
                  value={experimentForm.controlName}
                  onChange={(e) => setExperimentForm(prev => ({ ...prev, controlName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-name">Variant Name</Label>
                <Input
                  id="variant-name"
                  placeholder="Variant A"
                  value={experimentForm.variantName}
                  onChange={(e) => setExperimentForm(prev => ({ ...prev, variantName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Traffic Split: {experimentForm.controlPercentage}% / {100 - experimentForm.controlPercentage}%</Label>
              <Slider
                value={[experimentForm.controlPercentage]}
                onValueChange={(value) => setExperimentForm(prev => ({ ...prev, controlPercentage: value[0] }))}
                max={100}
                min={0}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{experimentForm.controlName}: {experimentForm.controlPercentage}%</span>
                <span>{experimentForm.variantName}: {100 - experimentForm.controlPercentage}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric-name">Primary Metric</Label>
              <Input
                id="metric-name"
                placeholder="e.g., Conversion Rate, Time on Page"
                value={experimentForm.metricName}
                onChange={(e) => setExperimentForm(prev => ({ ...prev, metricName: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExperimentDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitExperiment} className="bg-orange-600 hover:bg-orange-700">
              <Play className="h-4 w-4 mr-2" />
              Start Experiment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Rollout Dialog */}
      <Dialog open={showRolloutDialog} onOpenChange={setShowRolloutDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-indigo-600" />
              Configure Rollout
            </DialogTitle>
            <DialogDescription>
              Set up progressive rollout for {selectedFeature?.name || 'this feature'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rollout-stage">Rollout Stage</Label>
              <Select
                value={rolloutForm.stage}
                onValueChange={(value) => setRolloutForm(prev => ({ ...prev, stage: value as RolloutStage }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rollout stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canary">Canary (1-5%)</SelectItem>
                  <SelectItem value="beta">Beta (10-25%)</SelectItem>
                  <SelectItem value="ga">General Availability (50-75%)</SelectItem>
                  <SelectItem value="full">Full Rollout (100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rollout Percentage: {rolloutForm.percentage}%</Label>
              <Slider
                value={[rolloutForm.percentage]}
                onValueChange={(value) => setRolloutForm(prev => ({ ...prev, percentage: value[0] }))}
                max={100}
                min={0}
                step={5}
                className="py-4"
              />
              <Progress value={rolloutForm.percentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <Label>Target Segments</Label>
              <div className="flex flex-wrap gap-2">
                {segmentsState.map(segment => (
                  <Badge
                    key={segment.id}
                    variant={rolloutForm.targetSegments.includes(segment.name.toLowerCase().replace(/\s+/g, '_')) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const segmentKey = segment.name.toLowerCase().replace(/\s+/g, '_')
                      setRolloutForm(prev => ({
                        ...prev,
                        targetSegments: prev.targetSegments.includes(segmentKey)
                          ? prev.targetSegments.filter(s => s !== segmentKey)
                          : [...prev.targetSegments, segmentKey]
                      }))
                    }}
                  >
                    {segment.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">Click to select/deselect target segments</p>
            </div>
            <div className="space-y-2">
              <Label>Environments</Label>
              <div className="flex gap-2">
                {['staging', 'production'].map(env => (
                  <Badge
                    key={env}
                    variant={rolloutForm.environments.includes(env) ? 'default' : 'outline'}
                    className={`cursor-pointer ${rolloutForm.environments.includes(env) ? (env === 'production' ? 'bg-green-600' : 'bg-blue-600') : ''}`}
                    onClick={() => {
                      setRolloutForm(prev => ({
                        ...prev,
                        environments: prev.environments.includes(env)
                          ? prev.environments.filter(e => e !== env)
                          : [...prev.environments, env]
                      }))
                    }}
                  >
                    {env}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRolloutDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitRollout} className="bg-indigo-600 hover:bg-indigo-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Rollout Config
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
