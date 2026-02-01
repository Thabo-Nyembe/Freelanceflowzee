"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from '@/lib/hooks/use-supabase-helpers'
import type {
  RoadmapInitiative,
  RoadmapMilestone,
} from '@/lib/hooks/use-roadmap'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Map,
  Target,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Plus,
  Eye,
  Layers,
  GitBranch,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  Search,
  Package,
  Rocket,
  Settings,
  GanttChart,
  LayoutGrid,
  List,
  Play,
  Link2,
  Brain,
  CircleDot,
  Share2,
  Download,
  Upload,
  Shield,
  Sliders,
  Bell,
  Webhook,
  Trash2,
  Globe,
  Terminal,
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
type InitiativeStatus = 'backlog' | 'planned' | 'in_progress' | 'review' | 'released' | 'archived'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ImpactLevel = 'transformational' | 'significant' | 'moderate' | 'minor'
type EffortLevel = 'xl' | 'large' | 'medium' | 'small'
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
type ViewMode = 'timeline' | 'kanban' | 'list' | 'swimlane'
type ReleaseStatus = 'planning' | 'development' | 'testing' | 'staged' | 'released'

interface Feature {
  id: string
  title: string
  description: string
  status: InitiativeStatus
  priority: Priority
  impact: ImpactLevel
  effort: EffortLevel
  impactScore: number
  effortScore: number
  riceScore: number
  progress: number
  quarter: Quarter
  year: number
  releaseId?: string
  theme: string
  team: string
  owner: {
    id: string
    name: string
    avatar: string
  }
  votes: number
  comments: number
  dependencies: string[]
  tags: string[]
  customerRequests: number
  createdAt: Date
  updatedAt: Date
  targetDate?: Date
}

interface Release {
  id: string
  name: string
  version: string
  status: ReleaseStatus
  targetDate: Date
  features: string[]
  progress: number
  description: string
}

interface CustomerInsight {
  id: string
  title: string
  source: string
  customer: string
  votes: number
  status: 'new' | 'reviewing' | 'planned' | 'declined'
  linkedFeatures: string[]
  createdAt: Date
}

interface Idea {
  id: string
  title: string
  description: string
  submittedBy: string
  votes: number
  status: 'new' | 'under_review' | 'accepted' | 'rejected'
  category: string
  createdAt: Date
}

interface Objective {
  id: string
  title: string
  description: string
  keyResults: string[]
  progress: number
  quarter: Quarter
  year: number
  features: string[]
}

// Helper: map DB impact to UI impact level
const mapImpact = (impact: string | null): ImpactLevel => {
  const map: Record<string, ImpactLevel> = {
    critical: 'transformational',
    very_high: 'transformational',
    high: 'significant',
    medium: 'moderate',
    low: 'minor',
  }
  return map[impact || 'medium'] || 'moderate'
}

// Helper: map DB effort to UI effort level
const mapEffort = (effort: string | null): EffortLevel => {
  const map: Record<string, EffortLevel> = {
    extra_large: 'xl',
    large: 'large',
    medium: 'medium',
    small: 'small',
  }
  return map[effort || 'medium'] || 'medium'
}

// Helper: numeric score for impact
const impactScore = (impact: string | null): number => {
  const map: Record<string, number> = { critical: 10, very_high: 8, high: 6, medium: 4, low: 2 }
  return map[impact || 'medium'] || 4
}

// Helper: numeric score for effort
const effortScore = (effort: string | null): number => {
  const map: Record<string, number> = { extra_large: 10, large: 8, medium: 5, small: 3 }
  return map[effort || 'medium'] || 5
}

// Map DB initiative status to UI initiative status
const mapStatus = (status: string): InitiativeStatus => {
  const map: Record<string, InitiativeStatus> = {
    planned: 'planned',
    in_progress: 'in_progress',
    completed: 'released',
    on_hold: 'archived',
    cancelled: 'archived',
  }
  return map[status] || 'backlog'
}

// Map DB priority to UI priority
const mapPriority = (priority: string): Priority => {
  const map: Record<string, Priority> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
  }
  return map[priority] || 'medium'
}

// Helper Functions
const getStatusColor = (status: InitiativeStatus): string => {
  const colors: Record<InitiativeStatus, string> = {
    backlog: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    released: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
  }
  return colors[status] || colors.backlog
}

const getStatusIcon = (status: InitiativeStatus) => {
  const icons: Record<InitiativeStatus, React.ReactNode> = {
    backlog: <CircleDot className="w-3 h-3" />,
    planned: <Calendar className="w-3 h-3" />,
    in_progress: <Play className="w-3 h-3" />,
    review: <Eye className="w-3 h-3" />,
    released: <Rocket className="w-3 h-3" />,
    archived: <Package className="w-3 h-3" />
  }
  return icons[status] || icons.backlog
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[priority] || colors.medium
}

const getImpactColor = (impact: ImpactLevel): string => {
  const colors: Record<ImpactLevel, string> = {
    transformational: 'text-purple-600 dark:text-purple-400',
    significant: 'text-blue-600 dark:text-blue-400',
    moderate: 'text-green-600 dark:text-green-400',
    minor: 'text-gray-600 dark:text-gray-400'
  }
  return colors[impact] || colors.moderate
}

const getReleaseStatusColor = (status: ReleaseStatus): string => {
  const colors: Record<ReleaseStatus, string> = {
    planning: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    development: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    testing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    staged: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    released: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return colors[status] || colors.planning
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

interface RoadmapClientProps {
  initialInitiatives?: any[]
  initialMilestones?: any[]
}

// Competitive upgrade placeholder arrays (populated when AI analytics integration is available)
const roadmapAIInsights: { id: string; type: 'success' | 'warning' | 'info' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const roadmapCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const roadmapPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'high' | 'medium' | 'low' }[] = []

const roadmapActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' | 'error' }[] = []

export default function RoadmapClient({ initialInitiatives, initialMilestones }: RoadmapClientProps) {
  // ── Real Supabase Data ──────────────────────────────────────────────
  const {
    data: rawInitiatives,
    isLoading: initiativesLoading,
    error: initiativesError,
    refetch: refetchInitiatives,
  } = useSupabaseQuery<RoadmapInitiative>({
    table: 'roadmap_initiatives',
    orderBy: { column: 'created_at', ascending: false },
  })

  const {
    data: rawMilestones,
    isLoading: milestonesLoading,
    error: milestonesError,
    refetch: refetchMilestones,
  } = useSupabaseQuery<RoadmapMilestone>({
    table: 'roadmap_milestones',
    orderBy: { column: 'target_date', ascending: true },
  })

  const {
    mutate: mutateInitiative,
    remove: removeInitiative,
    isLoading: isMutating,
  } = useSupabaseMutation<RoadmapInitiative>({
    table: 'roadmap_initiatives',
    onSuccess: () => { refetchInitiatives() },
  })

  const {
    mutate: mutateMilestone,
    remove: removeMilestone,
  } = useSupabaseMutation<RoadmapMilestone>({
    table: 'roadmap_milestones',
    onSuccess: () => { refetchMilestones() },
  })

  const isLoading = initiativesLoading || milestonesLoading
  const dataError = initiativesError || milestonesError

  // Map DB records to UI Feature type
  const features: Feature[] = useMemo(() => {
    return (rawInitiatives || []).map((init) => {
      const iScore = impactScore(init.impact)
      const eScore = effortScore(init.effort)
      const rice = iScore > 0 && eScore > 0 ? Math.round((iScore * (init.progress_percentage || 1)) / eScore) : 0
      return {
        id: init.id,
        title: init.title,
        description: init.description || '',
        status: mapStatus(init.status),
        priority: mapPriority(init.priority),
        impact: mapImpact(init.impact),
        effort: mapEffort(init.effort),
        impactScore: iScore,
        effortScore: eScore,
        riceScore: rice,
        progress: init.progress_percentage || 0,
        quarter: (init.quarter as Quarter) || 'Q1',
        year: init.year || new Date().getFullYear(),
        theme: init.theme || 'General',
        team: init.team || 'Unassigned',
        owner: {
          id: init.owner_id || init.user_id,
          name: init.owner_id ? 'Team Member' : 'You',
          avatar: '',
        },
        votes: 0,
        comments: 0,
        dependencies: init.dependencies || [],
        tags: init.tags || [],
        customerRequests: 0,
        createdAt: new Date(init.created_at),
        updatedAt: new Date(init.updated_at),
        targetDate: init.target_date ? new Date(init.target_date) : undefined,
      } satisfies Feature
    })
  }, [rawInitiatives])

  // Map DB milestones to Release type for the Releases tab
  const releases: Release[] = useMemo(() => {
    return (rawMilestones || []).map((ms) => {
      const releaseStatus: ReleaseStatus =
        ms.status === 'completed' ? 'released'
        : ms.status === 'on_track' ? 'development'
        : ms.status === 'at_risk' ? 'testing'
        : ms.status === 'delayed' ? 'testing'
        : 'planning'
      return {
        id: ms.id,
        name: ms.milestone_name,
        version: '1.0',
        status: releaseStatus,
        targetDate: new Date(ms.target_date),
        features: [],
        progress: ms.completion_percentage || 0,
        description: ms.description || '',
      } satisfies Release
    })
  }, [rawMilestones])

  // Empty placeholder arrays for features not yet backed by DB tables
  const insights: CustomerInsight[] = []
  const ideas: Idea[] = []
  const objectives: Objective[] = []
  const [activeTab, setActiveTab] = useState('roadmap')
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | 'all'>('all')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [showNewInitiativeDialog, setShowNewInitiativeDialog] = useState(false)
  const [showTimelineDialog, setShowTimelineDialog] = useState(false)

  // Form states for New Initiative dialog
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    objective: '',
    quarter: 'Q1' as Quarter,
    priority: 'medium' as Priority,
    theme: '',
    keyResults: ''
  })

  // Form state for Timeline dialog
  const [timelineSettings, setTimelineSettings] = useState({
    startQuarter: 'Q1' as Quarter,
    endQuarter: 'Q4' as Quarter,
    year: 2025,
    showMilestones: true,
    showDependencies: true,
    groupBy: 'quarter' as 'quarter' | 'theme' | 'team'
  })

  // Quick actions with dialog-based workflows
  const roadmapQuickActions = [
    { id: '1', label: 'New Initiative', icon: 'plus', action: () => setShowNewInitiativeDialog(true), variant: 'default' as const },
    { id: '2', label: 'Timeline', icon: 'calendar', action: () => setShowTimelineDialog(true), variant: 'default' as const },
    { id: '3', label: 'Share', icon: 'share', action: () => { navigator.clipboard.writeText('https://kazi.app/roadmap/2024'); toast.success('Link Copied', { description: 'Roadmap link copied to clipboard' }); }, variant: 'outline' as const },
  ]

  // Computed Statistics
  const stats = useMemo(() => {
    const totalFeatures = features.length
    const inProgress = features.filter(f => f.status === 'in_progress').length
    const released = features.filter(f => f.status === 'released').length
    const avgProgress = totalFeatures > 0 ? features.reduce((sum, f) => sum + f.progress, 0) / totalFeatures : 0
    const totalVotes = features.reduce((sum, f) => sum + f.votes, 0)
    const totalCustomerRequests = features.reduce((sum, f) => sum + f.customerRequests, 0)
    const upcomingReleases = releases.filter(r => r.status !== 'released').length

    return {
      totalFeatures,
      inProgress,
      released,
      avgProgress,
      totalVotes,
      totalCustomerRequests,
      upcomingReleases,
      totalIdeas: ideas.length
    }
  }, [features, releases, ideas])

  // Filtered Features
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesQuarter = selectedQuarter === 'all' || feature.quarter === selectedQuarter
      return matchesSearch && matchesQuarter
    })
  }, [features, searchQuery, selectedQuarter])

  const openFeatureDetail = (feature: Feature) => {
    setSelectedFeature(feature)
    setIsFeatureDialogOpen(true)
  }

  // Handlers
  const handleShareRoadmap = () => {
    navigator.clipboard.writeText('https://app.example.com/roadmap')
    toast.success('Roadmap link copied to clipboard')
  }

  const handleNewFeature = () => toast.success('Feature creation form ready')

  const handleVote = () => {
    if (!selectedFeature) return
    toast.promise(
      fetch(`/api/roadmap/features/${selectedFeature.id}/vote`, { method: 'POST' }).then(res => {
        if (!res.ok) throw new Error('Vote failed')
        return res.json()
      }),
      { loading: 'Recording vote...', success: `Vote recorded for ${selectedFeature.title}`, error: 'Failed to record vote' }
    )
  }

  const handleComment = () => {
    if (!selectedFeature) return
    toast.success('Comment editor ready')
  }

  const handleShareFeature = () => {
    if (!selectedFeature) return
    navigator.clipboard.writeText(`https://app.example.com/feature/${selectedFeature.id}`)
    toast.success(`Share link for ${selectedFeature.title} copied`)
  }

  const handleAddMilestone = () => toast.success('Milestone form ready')

  const handleEditMilestone = (n: string) => toast.success(`Editing "${n}"`)

  const handleCompleteMilestone = (n: string) => toast.promise(
    fetch('/api/roadmap/milestones/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: n })
    }).then(res => {
      if (!res.ok) throw new Error('Failed')
      return res.json()
    }),
    { loading: `Completing "${n}"...`, success: `"${n}" marked as complete`, error: 'Failed to complete milestone' }
  )

  const handleExportRoadmap = () => toast.promise(
    fetch('/api/roadmap/export').then(res => {
      if (!res.ok) throw new Error('Export failed')
      return res.blob()
    }).then(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'roadmap.json'
      a.click()
      URL.revokeObjectURL(url)
    }),
    { loading: 'Preparing export...', success: 'Roadmap exported successfully', error: 'Failed to export roadmap' }
  )

  const handleQuickAction = (actionLabel: string) => toast.success(`${actionLabel} completed`)

  const handleNewRelease = () => toast.success('Release creation form ready')

  const handleSubmitIdea = () => toast.success('Idea submission form ready')

  const handleSetOKR = () => toast.success('OKR configuration ready')

  const handleSyncJira = () => toast.promise(
    fetch('/api/integrations/jira/sync', { method: 'POST' }).then(res => {
      if (!res.ok) throw new Error('Sync failed')
      return res.json()
    }),
    { loading: 'Syncing with Jira...', success: 'Jira sync completed', error: 'Failed to sync with Jira' }
  )

  const handleViewAnalytics = () => toast.success('Analytics dashboard ready')

  const handleRecalculateScores = () => toast.promise(
    fetch('/api/roadmap/recalculate-scores', { method: 'POST' }).then(res => {
      if (!res.ok) throw new Error('Recalculate failed')
      return res.json()
    }),
    { loading: 'Recalculating RICE scores...', success: 'RICE scores updated', error: 'Failed to recalculate scores' }
  )

  const handleAddFeature = () => toast.success('Feature creation form ready')

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText('https://roadmap.yourcompany.com')
    toast.success('Public roadmap URL copied to clipboard')
  }

  const handleManageIntegration = (integrationName: string) => toast.success(`${integrationName} settings ready`)

  const handleConnectIntegration = (integrationName: string) => toast.promise(
    fetch('/api/integrations/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integration: integrationName })
    }).then(res => {
      if (!res.ok) throw new Error('Connection failed')
      return res.json()
    }),
    { loading: `Connecting to ${integrationName}...`, success: `Connected to ${integrationName}`, error: `Failed to connect to ${integrationName}` }
  )

  const handleImportFeatures = () => toast.success('CSV import wizard ready')

  const handleArchiveCompleted = () => toast.promise(
    fetch('/api/roadmap/archive-completed', { method: 'POST' }).then(res => {
      if (!res.ok) throw new Error('Archive failed')
      return res.json()
    }),
    { loading: 'Archiving released features...', success: 'All released features archived', error: 'Failed to archive features' }
  )

  const handleDeleteRoadmap = () => {
    toast.error('Delete Roadmap', { description: 'This action cannot be undone' })
  }

  // Handler for creating new initiative via Supabase mutation
  const handleCreateInitiative = useCallback(async () => {
    if (!newInitiative.title.trim()) {
      toast.error('Validation Error', { description: 'Initiative title is required' })
      return
    }
    toast.promise(
      mutateInitiative({
        title: newInitiative.title,
        description: newInitiative.description || null,
        quarter: newInitiative.quarter,
        year: new Date().getFullYear(),
        priority: newInitiative.priority as string,
        theme: newInitiative.theme || null,
        status: 'planned' as any,
        progress_percentage: 0,
        impact: 'medium' as any,
        effort: 'medium' as any,
        stakeholders: [],
        tags: [],
        dependencies: [],
        metadata: newInitiative.objective ? { objective: newInitiative.objective, keyResults: newInitiative.keyResults } : {},
      }).then(result => {
        if (!result) throw new Error('Failed to create initiative')
        setShowNewInitiativeDialog(false)
        setNewInitiative({
          title: '',
          description: '',
          objective: '',
          quarter: 'Q1',
          priority: 'medium',
          theme: '',
          keyResults: ''
        })
        return result
      }),
      {
        loading: 'Creating initiative...',
        success: `Initiative "${newInitiative.title}" created successfully`,
        error: 'Failed to create initiative'
      }
    )
  }, [newInitiative, mutateInitiative])

  // Handler for applying timeline settings
  const handleApplyTimelineSettings = () => {
    setShowTimelineDialog(false)
    setViewMode('timeline')
    toast.success(`Timeline configured: ${timelineSettings.startQuarter}-${timelineSettings.endQuarter} ${timelineSettings.year}`)
  }

  // Group features by status for Kanban view
  const featuresByStatus = useMemo(() => {
    const grouped: Record<InitiativeStatus, Feature[]> = {
      backlog: [],
      planned: [],
      in_progress: [],
      review: [],
      released: [],
      archived: []
    }
    filteredFeatures.forEach(feature => {
      grouped[feature.status].push(feature)
    })
    return grouped
  }, [filteredFeatures])

  // ── Loading State ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          <p className="text-sm text-muted-foreground">Loading roadmap data...</p>
        </div>
      </div>
    )
  }

  // ── Error State ─────────────────────────────────────────────────────
  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Map className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-destructive font-medium">Failed to load roadmap data</p>
        <p className="text-sm text-muted-foreground max-w-md text-center">{dataError.message}</p>
        <Button variant="outline" size="sm" onClick={() => { refetchInitiatives(); refetchMilestones() }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Map className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Product Roadmap</h1>
              <p className="text-muted-foreground">ProductBoard-level feature planning and prioritization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleShareRoadmap}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={handleNewFeature}>
              <Plus className="w-4 h-4 mr-2" />
              New Feature
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalFeatures}</p>
                  <p className="text-xs text-muted-foreground">Features</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.released}</p>
                  <p className="text-xs text-muted-foreground">Released</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgProgress.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalVotes}</p>
                  <p className="text-xs text-muted-foreground">Total Votes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCustomerRequests}</p>
                  <p className="text-xs text-muted-foreground">Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcomingReleases}</p>
                  <p className="text-xs text-muted-foreground">Releases</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalIdeas}</p>
                  <p className="text-xs text-muted-foreground">Ideas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="roadmap" className="gap-2">
              <Map className="w-4 h-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Layers className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="releases" className="gap-2">
              <Package className="w-4 h-4" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="mt-6 space-y-6">
            {/* Roadmap Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Map className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Product Roadmap</h2>
                    <p className="text-white/80">Strategic feature planning and prioritization</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Features</p>
                    <p className="text-2xl font-bold">{stats.totalFeatures}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">In Progress</p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Released</p>
                    <p className="text-2xl font-bold">{stats.released}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg Progress</p>
                    <p className="text-2xl font-bold">{stats.avgProgress.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'New Feature', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600', handler: handleNewFeature },
                { icon: Package, label: 'New Release', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', handler: handleNewRelease },
                { icon: Lightbulb, label: 'Submit Idea', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', handler: handleSubmitIdea },
                { icon: Target, label: 'Set OKR', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', handler: handleSetOKR },
                { icon: Share2, label: 'Share', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600', handler: handleShareRoadmap },
                { icon: Download, label: 'Export', color: 'bg-green-100 dark:bg-green-900/30 text-green-600', handler: handleExportRoadmap },
                { icon: GitBranch, label: 'Sync Jira', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600', handler: handleSyncJira },
                { icon: BarChart3, label: 'Analytics', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600', handler: handleViewAnalytics },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.handler}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search features..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                        <Button
                          key={q}
                          variant={selectedQuarter === q ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setSelectedQuarter(q)}
                        >
                          {q === 'all' ? 'All' : `${q} 2025`}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('timeline')}
                    >
                      <GanttChart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('kanban')}
                    >
                      <LayoutGrid className="w-4 h-4" />
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
              </CardHeader>
              <CardContent>
                {viewMode === 'kanban' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                    {(['backlog', 'planned', 'in_progress', 'review', 'released'] as InitiativeStatus[]).map((status) => (
                      <div key={status} className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="font-semibold capitalize">{status.replace('_', ' ')}</span>
                          </div>
                          <Badge variant="secondary">{featuresByStatus[status].length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {featuresByStatus[status].map((feature) => (
                            <Card
                              key={feature.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => openFeatureDetail(feature)}
                            >
                              <CardContent className="p-3">
                                <p className="font-medium text-sm mb-2">{feature.title}</p>
                                <div className="flex items-center gap-1 mb-2 flex-wrap">
                                  <Badge className={getPriorityColor(feature.priority)} variant="secondary">
                                    {feature.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{feature.quarter}</Badge>
                                </div>
                                <Progress value={feature.progress} className="h-1.5 mb-2" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    {feature.votes}
                                  </span>
                                  <span>{feature.progress}%</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="space-y-2">
                    {filteredFeatures.map((feature) => (
                      <div
                        key={feature.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-4"
                        onClick={() => openFeatureDetail(feature)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{feature.title}</h4>
                            <Badge className={getStatusColor(feature.status)}>
                              {getStatusIcon(feature.status)}
                              <span className="ml-1 capitalize">{feature.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {feature.quarter} {feature.year}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {feature.team}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {feature.votes}
                            </span>
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium">{feature.progress}%</span>
                          </div>
                          <Progress value={feature.progress} className="h-2" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-teal-600">{feature.riceScore}</p>
                          <p className="text-xs text-muted-foreground">RICE</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Timeline view
                  <div className="space-y-6">
                    {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((quarter) => {
                      const quarterFeatures = filteredFeatures.filter(f => f.quarter === quarter)
                      if (quarterFeatures.length === 0 && selectedQuarter !== 'all') return null
                      return (
                        <div key={quarter}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                              {quarter}
                            </div>
                            <div>
                              <h3 className="font-semibold">{quarter} 2025</h3>
                              <p className="text-sm text-muted-foreground">{quarterFeatures.length} features</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-14">
                            {quarterFeatures.map((feature) => (
                              <Card
                                key={feature.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => openFeatureDetail(feature)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                                      <div className="flex items-center gap-1">
                                        <Badge className={getStatusColor(feature.status)}>
                                          {feature.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge className={getPriorityColor(feature.priority)}>
                                          {feature.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-teal-600">{feature.riceScore}</p>
                                      <p className="text-xs text-muted-foreground">RICE</p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{feature.description}</p>
                                  <Progress value={feature.progress} className="h-2 mb-3" />
                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {feature.team}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <ThumbsUp className="w-4 h-4" />
                                      {feature.votes}
                                    </span>
                                    <span>{feature.progress}%</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            {/* Features Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Feature Prioritization</h2>
                    <p className="text-white/80">RICE scoring and impact analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <button onClick={handleRecalculateScores} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Recalculate
                  </button>
                  <button onClick={handleAddFeature} className="px-4 py-2 bg-white text-violet-600 rounded-lg hover:bg-white/90 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Feature
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Prioritization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {features.sort((a, b) => b.riceScore - a.riceScore).map((feature, index) => (
                        <div
                          key={feature.id}
                          className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                          onClick={() => openFeatureDetail(feature)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{feature.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(feature.status)}>{feature.status.replace('_', ' ')}</Badge>
                                <span className="text-sm text-muted-foreground">{feature.theme}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-center">
                              <div>
                                <p className="text-lg font-bold">{feature.impactScore}</p>
                                <p className="text-xs text-muted-foreground">Impact</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{feature.effortScore}</p>
                                <p className="text-xs text-muted-foreground">Effort</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{feature.customerRequests}</p>
                                <p className="text-xs text-muted-foreground">Requests</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-teal-600">{feature.riceScore}</p>
                                <p className="text-xs text-muted-foreground">RICE</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Objectives</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {objectives.map((objective) => (
                      <div key={objective.id} className="p-4 rounded-lg border">
                        <h4 className="font-semibold mb-2">{objective.title}</h4>
                        <Progress value={objective.progress} className="h-2 mb-2" />
                        <p className="text-sm text-muted-foreground">{objective.progress}% complete</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>By Theme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.from(new Set(features.map(f => f.theme))).map((theme, i) => {
                      const count = features.filter(f => f.theme === theme).length
                      return (
                        <div key={theme} className="flex items-center justify-between">
                          <span className="text-sm">{theme}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Releases Tab */}
          <TabsContent value="releases" className="mt-6 space-y-6">
            {/* Releases Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Release Management</h2>
                    <p className="text-white/80">Plan and track your product releases</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Releases</p>
                    <p className="text-2xl font-bold">{releases.length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">In Development</p>
                    <p className="text-2xl font-bold">{releases.filter(r => r.status === 'development').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Released</p>
                    <p className="text-2xl font-bold">{releases.filter(r => r.status === 'released').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Upcoming</p>
                    <p className="text-2xl font-bold">{stats.upcomingReleases}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {releases.map((release) => (
                <Card key={release.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-teal-500" />
                          {release.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">v{release.version}</p>
                      </div>
                      <Badge className={getReleaseStatusColor(release.status)}>
                        {release.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{release.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="font-medium">{release.progress}%</span>
                    </div>
                    <Progress value={release.progress} className="h-2 mb-4" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(release.targetDate)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Layers className="w-4 h-4" />
                        {release.features.length} features
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-500" />
                    Customer Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight: CustomerInsight) => (
                      <div key={insight.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground">{insight.source} • {insight.customer}</p>
                          </div>
                          <Badge variant="outline">{insight.votes} votes</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={insight.status === 'planned' ? 'default' : 'secondary'}>
                            {insight.status}
                          </Badge>
                          {insight.linkedFeatures.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {insight.linkedFeatures.length} linked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Request Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {features.sort((a, b) => b.customerRequests - a.customerRequests).slice(0, 5).map((feature, i) => (
                      <div key={feature.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{feature.title}</span>
                          <span className="text-sm">{feature.customerRequests}</span>
                        </div>
                        <Progress value={(feature.customerRequests / stats.totalCustomerRequests) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ideas Tab */}
          <TabsContent value="ideas" className="mt-6 space-y-6">
            {/* Ideas Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Idea Portal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stats.totalIdeas} ideas submitted • Accept feature requests from users</p>
                </div>
              </div>
              <Button onClick={handleSubmitIdea} className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Submit Idea
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{idea.category}</Badge>
                      <Badge variant={idea.status === 'accepted' ? 'default' : 'secondary'}>
                        {idea.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{idea.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">by {idea.submittedBy}</span>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{idea.votes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card onClick={handleSubmitIdea} className="border-dashed cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all flex items-center justify-center min-h-[200px]">
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="font-medium mb-1">Submit Idea</h4>
                  <p className="text-sm text-muted-foreground">Share your product ideas</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'visibility', label: 'Visibility', icon: Globe },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'integrations', label: 'Integrations', icon: Webhook },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'advanced', label: 'Advanced', icon: Terminal },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Roadmap Preferences</CardTitle>
                        <CardDescription>Configure default roadmap behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label htmlFor="defaultView">Default View</Label>
                            <select id="defaultView" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>Timeline</option>
                              <option>Kanban</option>
                              <option>List</option>
                              <option>Swimlane</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="defaultQuarter">Default Quarter</Label>
                            <select id="defaultQuarter" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>Current Quarter</option>
                              <option>All Quarters</option>
                              <option>Next Quarter</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-prioritization</p>
                            <p className="text-sm text-gray-500">Calculate RICE scores automatically</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Archived Features</p>
                            <p className="text-sm text-gray-500">Include archived items in views</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Scoring Configuration</CardTitle>
                        <CardDescription>Customize RICE scoring weights</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label htmlFor="reachWeight">Reach Weight</Label>
                            <Input id="reachWeight" type="number" className="mt-1" defaultValue="1.0" />
                          </div>
                          <div>
                            <Label htmlFor="impactWeight">Impact Weight</Label>
                            <Input id="impactWeight" type="number" className="mt-1" defaultValue="2.0" />
                          </div>
                          <div>
                            <Label htmlFor="confidenceWeight">Confidence Weight</Label>
                            <Input id="confidenceWeight" type="number" className="mt-1" defaultValue="1.0" />
                          </div>
                          <div>
                            <Label htmlFor="effortWeight">Effort Weight</Label>
                            <Input id="effortWeight" type="number" className="mt-1" defaultValue="1.5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'visibility' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Public Roadmap</CardTitle>
                        <CardDescription>Control external access to your roadmap</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Public Roadmap</p>
                            <p className="text-sm text-gray-500">Allow anyone to view the roadmap</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Voting</p>
                            <p className="text-sm text-gray-500">Let users vote on features</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Progress</p>
                            <p className="text-sm text-gray-500">Display feature progress publicly</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label htmlFor="publicUrl">Public URL</Label>
                          <div className="mt-1 flex gap-2">
                            <Input id="publicUrl" type="text" className="flex-1" defaultValue="roadmap.yourcompany.com" readOnly />
                            <Button variant="outline" onClick={handleCopyPublicUrl}>Copy</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Idea Portal</CardTitle>
                        <CardDescription>Accept feature requests from users</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Idea Portal</p>
                            <p className="text-sm text-gray-500">Accept feature suggestions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Email</p>
                            <p className="text-sm text-gray-500">Collect submitter email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure notification preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'New Feature Added', desc: 'When a new feature is created', enabled: true },
                          { name: 'Status Changes', desc: 'When feature status updates', enabled: true },
                          { name: 'New Votes', desc: 'When features receive votes', enabled: false },
                          { name: 'New Ideas', desc: 'When users submit ideas', enabled: true },
                          { name: 'Release Updates', desc: 'When releases are published', enabled: true },
                        ].map((notification) => (
                          <div key={notification.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notification.name}</p>
                              <p className="text-sm text-gray-500">{notification.desc}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Sync with your existing tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Jira', desc: 'Sync features with Jira issues', status: 'connected', icon: '📋' },
                          { name: 'Slack', desc: 'Post updates to channels', status: 'connected', icon: '💬' },
                          { name: 'GitHub', desc: 'Link to repositories', status: 'disconnected', icon: '🐙' },
                          { name: 'Intercom', desc: 'Connect customer feedback', status: 'disconnected', icon: '💭' },
                          { name: 'Segment', desc: 'Product analytics', status: 'disconnected', icon: '📊' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button
                              variant={integration.status === 'connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => integration.status === 'connected' ? handleManageIntegration(integration.name) : handleConnectIntegration(integration.name)}
                            >
                              {integration.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage who can access the roadmap</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SSO Required</p>
                            <p className="text-sm text-gray-500">Require single sign-on</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Auth</p>
                            <p className="text-sm text-gray-500">Require 2FA for team members</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                            <p className="text-sm text-gray-500">Track all changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Export and manage roadmap data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export Roadmap</p>
                            <p className="text-sm text-gray-500">Download all features and releases</p>
                          </div>
                          <Button onClick={handleExportRoadmap}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Import Features</p>
                            <p className="text-sm text-gray-500">Bulk import from CSV</p>
                          </div>
                          <Button variant="outline" onClick={handleImportFeatures}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Archive All Completed</p>
                            <p className="text-sm text-gray-500">Move all released features to archive</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleArchiveCompleted}>
                            Archive
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Delete Roadmap</p>
                            <p className="text-sm text-gray-500">Permanently delete all data</p>
                          </div>
                          <Button variant="destructive" onClick={handleDeleteRoadmap}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
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
              insights={roadmapAIInsights}
              title="Roadmap Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={roadmapCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={roadmapPredictions}
              title="Delivery Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={roadmapActivities}
            title="Roadmap Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={roadmapQuickActions}
            variant="grid"
          />
        </div>

        {/* Feature Detail Dialog */}
        <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedFeature && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                      <Layers className="w-5 h-5" />
                    </div>
                    {selectedFeature.title}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 p-1">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedFeature.status)}>
                        {getStatusIcon(selectedFeature.status)}
                        <span className="ml-1 capitalize">{selectedFeature.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={getPriorityColor(selectedFeature.priority)}>
                        {selectedFeature.priority} priority
                      </Badge>
                      <Badge variant="outline">{selectedFeature.quarter} {selectedFeature.year}</Badge>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedFeature.description}</p>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Progress</h4>
                        <span className="text-sm font-medium">{selectedFeature.progress}%</span>
                      </div>
                      <Progress value={selectedFeature.progress} className="h-2" />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Impact Score</p>
                        <p className="text-2xl font-bold">{selectedFeature.impactScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Effort Score</p>
                        <p className="text-2xl font-bold">{selectedFeature.effortScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">RICE Score</p>
                        <p className="text-2xl font-bold text-teal-600">{selectedFeature.riceScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Customer Requests</p>
                        <p className="text-2xl font-bold">{selectedFeature.customerRequests}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Theme</p>
                        <p className="font-medium">{selectedFeature.theme}</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Team</p>
                        <p className="font-medium">{selectedFeature.team}</p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Impact</p>
                        <p className={`font-medium capitalize ${getImpactColor(selectedFeature.impact)}`}>
                          {selectedFeature.impact}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground">Effort</p>
                        <p className="font-medium uppercase">{selectedFeature.effort}</p>
                      </div>
                    </div>

                    {/* Owner */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Owner</h4>
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <Avatar>
                          <AvatarFallback>{selectedFeature.owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedFeature.owner.name}</p>
                          <p className="text-sm text-muted-foreground">Feature Owner</p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFeature.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center gap-6 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{selectedFeature.votes} votes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{selectedFeature.comments} comments</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button className="flex-1" onClick={handleVote}>
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Vote
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleComment}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                      </Button>
                      <Button variant="outline" onClick={handleShareFeature}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* New Initiative Dialog */}
        <Dialog open={showNewInitiativeDialog} onOpenChange={setShowNewInitiativeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                Create New Initiative
              </DialogTitle>
              <DialogDescription>
                Define the initiative details, objectives, timeline, and key results
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="initiative-title">Initiative Title *</Label>
                <Input
                  id="initiative-title"
                  placeholder="e.g., Mobile App Launch, Enterprise Features"
                  value={newInitiative.title}
                  onChange={(e) => setNewInitiative(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initiative-description">Description</Label>
                <Textarea
                  id="initiative-description"
                  placeholder="Describe the initiative's purpose and scope..."
                  rows={3}
                  value={newInitiative.description}
                  onChange={(e) => setNewInitiative(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="initiative-quarter">Target Quarter</Label>
                  <Select
                    value={newInitiative.quarter}
                    onValueChange={(value) => setNewInitiative(prev => ({ ...prev, quarter: value as Quarter }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 2025</SelectItem>
                      <SelectItem value="Q2">Q2 2025</SelectItem>
                      <SelectItem value="Q3">Q3 2025</SelectItem>
                      <SelectItem value="Q4">Q4 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initiative-priority">Priority</Label>
                  <Select
                    value={newInitiative.priority}
                    onValueChange={(value) => setNewInitiative(prev => ({ ...prev, priority: value as Priority }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
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

              <div className="space-y-2">
                <Label htmlFor="initiative-objective">Strategic Objective</Label>
                <Input
                  id="initiative-objective"
                  placeholder="e.g., Increase user engagement by 30%"
                  value={newInitiative.objective}
                  onChange={(e) => setNewInitiative(prev => ({ ...prev, objective: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initiative-theme">Theme</Label>
                <Select
                  value={newInitiative.theme}
                  onValueChange={(value) => setNewInitiative(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI & Intelligence">AI & Intelligence</SelectItem>
                    <SelectItem value="Platform">Platform</SelectItem>
                    <SelectItem value="Collaboration">Collaboration</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initiative-key-results">Key Results</Label>
                <Textarea
                  id="initiative-key-results"
                  placeholder="Enter key results (one per line)..."
                  rows={3}
                  value={newInitiative.keyResults}
                  onChange={(e) => setNewInitiative(prev => ({ ...prev, keyResults: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewInitiativeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInitiative} className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Initiative
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Timeline Settings Dialog */}
        <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                Timeline View Settings
              </DialogTitle>
              <DialogDescription>
                Configure the timeline view for your roadmap with milestones
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Start Quarter</Label>
                  <Select
                    value={timelineSettings.startQuarter}
                    onValueChange={(value) => setTimelineSettings(prev => ({ ...prev, startQuarter: value as Quarter }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>End Quarter</Label>
                  <Select
                    value={timelineSettings.endQuarter}
                    onValueChange={(value) => setTimelineSettings(prev => ({ ...prev, endQuarter: value as Quarter }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={String(timelineSettings.year)}
                  onValueChange={(value) => setTimelineSettings(prev => ({ ...prev, year: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Group By</Label>
                <Select
                  value={timelineSettings.groupBy}
                  onValueChange={(value) => setTimelineSettings(prev => ({ ...prev, groupBy: value as 'quarter' | 'theme' | 'team' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Milestones</Label>
                    <p className="text-sm text-muted-foreground">Display milestone markers on timeline</p>
                  </div>
                  <Switch
                    checked={timelineSettings.showMilestones}
                    onCheckedChange={(checked) => setTimelineSettings(prev => ({ ...prev, showMilestones: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Dependencies</Label>
                    <p className="text-sm text-muted-foreground">Display feature dependency lines</p>
                  </div>
                  <Switch
                    checked={timelineSettings.showDependencies}
                    onCheckedChange={(checked) => setTimelineSettings(prev => ({ ...prev, showDependencies: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTimelineDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyTimelineSettings} className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                <Calendar className="w-4 h-4 mr-2" />
                Apply Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
