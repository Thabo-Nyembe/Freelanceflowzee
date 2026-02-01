'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'

// Import backend hooks for real data
import { useAuth } from '@/lib/hooks/use-auth'
import { useOnboardingFlows, useUserOnboardingProgress } from '@/lib/hooks/use-onboarding-extended'
import { useAnalyticsSegments, useAnalyticsDailyMetrics } from '@/lib/hooks/use-analytics-extended'
import { useUserActivityLogs } from '@/lib/hooks/use-user-extended'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Plus,
  Search,
  Mail,
  Settings,
  BarChart3,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Eye,
  Target,
  Layers,
  MessageSquare,
  MousePointer,
  Maximize2,
  CheckSquare,
  Filter,
  Download,
  Upload,
  Palette,
  Zap,
  RefreshCw,
  Info,
  ChevronRight,
  Sparkles,
  Flag,
  Timer,
  Activity,
  PieChart,
  UserCheck,
  UserX,
  Bell,
  Sliders,
  Webhook,
  Database,
  HardDrive,
  Terminal,
  Shield,
  Archive
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
type FlowStatus = 'active' | 'paused' | 'draft' | 'archived'
type FlowType = 'onboarding' | 'feature_adoption' | 'announcement' | 'survey' | 'checklist'
type StepType = 'modal' | 'tooltip' | 'hotspot' | 'slideout' | 'checklist' | 'banner'
type TriggerType = 'page_load' | 'click' | 'delay' | 'scroll' | 'event' | 'segment'
type SegmentOperator = 'is' | 'is_not' | 'contains' | 'greater_than' | 'less_than'

interface FlowStep {
  id: string
  type: StepType
  title: string
  content: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  order: number
}

interface FlowTrigger {
  type: TriggerType
  value: string
  delay?: number
}

interface Flow {
  id: string
  name: string
  description: string
  type: FlowType
  status: FlowStatus
  steps: FlowStep[]
  trigger: FlowTrigger
  segmentId?: string
  views: number
  completions: number
  completionRate: number
  dropoffRate: number
  avgTimeToComplete: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  order: number
  actionUrl?: string
  isRequired: boolean
}

interface Checklist {
  id: string
  name: string
  description: string
  items: ChecklistItem[]
  segmentId?: string
  status: FlowStatus
  usersStarted: number
  usersCompleted: number
  completionRate: number
  createdAt: string
}

interface UserJourney {
  userId: string
  userName: string
  userEmail: string
  avatar?: string
  flowsCompleted: number
  totalFlows: number
  checklistProgress: number
  lastActive: string
  signupDate: string
  segment: string
  status: 'active' | 'at_risk' | 'churned' | 'new'
}

interface Segment {
  id: string
  name: string
  description: string
  rules: SegmentRule[]
  userCount: number
  flowsUsing: number
  createdAt: string
}

interface SegmentRule {
  property: string
  operator: SegmentOperator
  value: string
}

interface FlowAnalytics {
  date: string
  views: number
  starts: number
  completions: number
}

interface OnboardingStats {
  totalFlows: number
  activeFlows: number
  totalUsers: number
  avgCompletionRate: number
  totalViews: number
  totalCompletions: number
  activeChecklists: number
  usersOnboarded: number
}

// Helper Functions
const getFlowStatusColor = (status: FlowStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'archived': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getFlowTypeColor = (type: FlowType) => {
  switch (type) {
    case 'onboarding': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'feature_adoption': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'announcement': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'survey': return 'bg-pink-100 text-pink-800 border-pink-200'
    case 'checklist': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStepTypeIcon = (type: StepType) => {
  switch (type) {
    case 'modal': return Maximize2
    case 'tooltip': return MessageSquare
    case 'hotspot': return MousePointer
    case 'slideout': return Layers
    case 'checklist': return CheckSquare
    case 'banner': return Flag
    default: return Info
  }
}

const getUserStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'churned': return 'bg-red-100 text-red-800 border-red-200'
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export default function OnboardingClient() {
  // Create supabase client for CRUD operations
  const supabase = createClient()

  // Define adapter variables locally (removed mock data imports)
  const onboardingAIInsights: any[] = []
  const onboardingCollaborators: any[] = []
  const onboardingPredictions: any[] = []
  const onboardingActivities: any[] = []
  const onboardingQuickActions: any[] = []

  // Get authenticated user from hook
  const { user: authUser, loading: authLoading } = useAuth()
  const userId = authUser?.id || null

  // Use backend hooks for data fetching
  const { data: onboardingFlowsData, isLoading: flowsLoading, refresh: refreshFlows } = useOnboardingFlows()
  const { data: userProgressData, isLoading: progressLoading } = useUserOnboardingProgress(userId || undefined)
  const { data: segmentsData, isLoading: segmentsLoading, refresh: refreshSegments } = useAnalyticsSegments(userId || undefined)
  const { data: dailyMetricsData, isLoading: metricsLoading } = useAnalyticsDailyMetrics(userId || undefined, 7)
  const { data: userActivityData, isLoading: activityLoading } = useUserActivityLogs(userId || undefined)

  // Combine loading states
  const isLoading = authLoading || flowsLoading || segmentsLoading
  const [isSaving, setIsSaving] = useState(false)

  // Local state for data that syncs from hooks
  const [flows, setFlows] = useState<Flow[]>([])
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [users, setUsers] = useState<UserJourney[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [analytics, setAnalytics] = useState<FlowAnalytics[]>([])

  // Sync flows from hook data
  useEffect(() => {
    if (onboardingFlowsData && onboardingFlowsData.length > 0) {
      setFlows(onboardingFlowsData.map((f: any) => ({
        id: f.id,
        name: f.name || 'Untitled Flow',
        description: f.description || '',
        type: f.flow_type || 'onboarding',
        status: f.status || 'draft',
        steps: f.steps || [],
        trigger: f.trigger || { type: 'page_load', value: '/dashboard' },
        segmentId: f.segment_id,
        views: f.views || 0,
        completions: f.completions || 0,
        completionRate: f.completion_rate || 0,
        dropoffRate: f.dropoff_rate || 0,
        avgTimeToComplete: f.avg_time_to_complete || 0,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
        createdBy: f.created_by || 'System'
      })))
    }
  }, [onboardingFlowsData])

  // Sync segments from hook data
  useEffect(() => {
    if (segmentsData && segmentsData.length > 0) {
      setSegments(segmentsData.map((s: any) => ({
        id: s.id,
        name: s.name || 'Untitled Segment',
        description: s.description || '',
        rules: s.rules || [],
        userCount: s.user_count || 0,
        flowsUsing: s.flows_using || 0,
        createdAt: s.created_at
      })))
    }
  }, [segmentsData])

  // Sync analytics from daily metrics hook data
  useEffect(() => {
    if (dailyMetricsData && dailyMetricsData.length > 0) {
      setAnalytics(dailyMetricsData.map((m: any) => ({
        date: m.date || m.created_at,
        views: m.page_views || m.views || 0,
        starts: m.sessions || m.starts || 0,
        completions: m.conversions || m.completions || 0
      })))
    }
  }, [dailyMetricsData])

  // Sync users from user activity hook data (convert to UserJourney format)
  useEffect(() => {
    if (userActivityData && userActivityData.length > 0) {
      // Transform activity logs to user journey format
      const userMap = new Map<string, UserJourney>()
      userActivityData.forEach((activity: any) => {
        if (!userMap.has(activity.user_id)) {
          userMap.set(activity.user_id, {
            userId: activity.user_id,
            userName: activity.user_name || activity.user_email?.split('@')[0] || 'Unknown User',
            userEmail: activity.user_email || '',
            flowsCompleted: 0,
            totalFlows: flows.length,
            checklistProgress: 0,
            lastActive: activity.created_at || new Date().toISOString(),
            signupDate: activity.created_at || new Date().toISOString(),
            segment: 'Default',
            status: 'active'
          })
        }
      })
      setUsers(Array.from(userMap.values()))
    }
  }, [userActivityData, flows.length])

  // Fetch checklists directly (no hook available)
  useEffect(() => {
    const fetchChecklists = async () => {
      if (!userId) return
      try {
        const { data: checklistsData } = await supabase
          .from('onboarding_checklists')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (checklistsData && checklistsData.length > 0) {
          setChecklists(checklistsData.map((c: any) => ({
            id: c.id,
            name: c.name || 'Untitled Checklist',
            description: c.description || '',
            items: c.items || [],
            segmentId: c.segment_id,
            status: c.status || 'active',
            usersStarted: c.users_started || 0,
            usersCompleted: c.users_completed || 0,
            completionRate: c.completion_rate || 0,
            createdAt: c.created_at
          })))
        }
      } catch (error) {
        console.error('Error fetching checklists:', error)
      }
    }
    fetchChecklists()
  }, [userId, supabase])

  // UI state
  const [activeTab, setActiveTab] = useState('flows')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FlowStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<FlowType | 'all'>('all')
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Form state for creating/editing
  const [flowForm, setFlowForm] = useState({
    name: '',
    description: '',
    type: 'onboarding' as FlowType,
    status: 'draft' as FlowStatus
  })

  // API helper functions for real functionality
  const completeOnboardingStep = async (stepId: string, stepData?: Record<string, unknown>) => {
    const response = await fetch('/api/onboarding/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId, stepData, completed: true })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to complete step')
    }
    return response.json()
  }

  const skipOnboardingStep = async (stepId: string) => {
    const response = await fetch('/api/onboarding/skip', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId, skipped: true })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to skip step')
    }
    return response.json()
  }

  const savePreferences = async (category: string, preferences: Record<string, unknown>) => {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save-preferences', category, ...preferences })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save preferences')
    }
    return response.json()
  }

  const inviteTeamMembers = async (emails: string[]) => {
    const response = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send invites')
    }
    return response.json()
  }

  const connectIntegration = (provider: string) => {
    // Redirect to OAuth flow for the integration
    window.location.href = `/api/integrations/${provider}/auth`
  }

  const importFlowsFromFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/onboarding/import', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to import flows')
    }
    return response.json()
  }

  const fetchArchivedFlows = async () => {
    const response = await fetch('/api/onboarding/flows?status=archived')
    if (!response.ok) {
      throw new Error('Failed to load archived flows')
    }
    return response.json()
  }

  const fetchAnalytics = async (type: string, dateRange?: { start: string; end: string }) => {
    const params = new URLSearchParams({ type })
    if (dateRange) {
      params.append('startDate', dateRange.start)
      params.append('endDate', dateRange.end)
    }
    const response = await fetch(`/api/onboarding/analytics?${params}`)
    if (!response.ok) {
      throw new Error('Failed to load analytics')
    }
    return response.json()
  }

  const sendBulkEmail = async (userIds: string[], template: string) => {
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, template })
    })
    if (!response.ok) {
      throw new Error('Failed to send emails')
    }
    return response.json()
  }

  // Data fetching is now handled by the backend hooks above
  // useOnboardingFlows, useAnalyticsSegments, useAnalyticsDailyMetrics, useUserActivityLogs

  // Calculate stats
  const stats: OnboardingStats = useMemo(() => ({
    totalFlows: flows.length,
    activeFlows: flows.filter(f => f.status === 'active').length,
    totalUsers: users.length,
    avgCompletionRate: flows.length > 0 ? flows.reduce((sum, f) => sum + f.completionRate, 0) / flows.length : 0,
    totalViews: flows.reduce((sum, f) => sum + f.views, 0),
    totalCompletions: flows.reduce((sum, f) => sum + f.completions, 0),
    activeChecklists: checklists.filter(c => c.status === 'active').length,
    usersOnboarded: users.filter(u => u.flowsCompleted === u.totalFlows).length
  }), [flows, checklists, users])

  // Filter flows
  const filteredFlows = useMemo(() => {
    return flows.filter(flow => {
      const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flow.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || flow.status === statusFilter
      const matchesType = typeFilter === 'all' || flow.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [flows, searchQuery, statusFilter, typeFilter])

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  const maxViews = analytics.length > 0 ? Math.max(...analytics.map(a => a.views)) : 1

  // CRUD Handlers
  const handleCreateFlow = async () => {
    if (!userId) {
      toast.error('You must be logged in')
      return
    }
    setIsSaving(true)
    try {
      const { data, error } = await supabase.from('onboarding_flows').insert({
        user_id: userId,
        name: flowForm.name || 'New Flow',
        description: flowForm.description || '',
        flow_type: flowForm.type,
        status: 'draft',
        steps: [],
        trigger: { type: 'page_load', value: '/dashboard' },
        views: 0,
        completions: 0,
        completion_rate: 0,
        dropoff_rate: 0,
        avg_time_to_complete: 0
      }).select().single()

      if (error) throw error

      const newFlow: Flow = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: data.flow_type,
        status: data.status,
        steps: [],
        trigger: data.trigger,
        views: 0,
        completions: 0,
        completionRate: 0,
        dropoffRate: 0,
        avgTimeToComplete: 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: 'You'
      }
      setFlows(prev => [newFlow, ...prev])
      setFlowForm({ name: '', description: '', type: 'onboarding', status: 'draft' })
      toast.success('Flow created', { description: 'Your new onboarding flow has been created' })
    } catch (error) {
      console.error('Error creating flow:', error)
      toast.error('Failed to create flow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateFlowStatus = async (flow: Flow, newStatus: FlowStatus) => {
    if (!userId) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('onboarding_flows')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', flow.id)
        .eq('user_id', userId)

      if (error) throw error

      setFlows(prev => prev.map(f => f.id === flow.id ? { ...f, status: newStatus } : f))
      toast.success(`Flow ${newStatus}`, { description: `"${flow.name}" is now ${newStatus}` })
    } catch (error) {
      console.error('Error updating flow:', error)
      toast.error('Failed to update flow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFlow = async (flow: Flow) => {
    if (!userId) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('onboarding_flows')
        .delete()
        .eq('id', flow.id)
        .eq('user_id', userId)

      if (error) throw error

      setFlows(prev => prev.filter(f => f.id !== flow.id))
      setSelectedFlow(null)
      toast.success('Flow deleted', { description: `"${flow.name}" has been removed` })
    } catch (error) {
      console.error('Error deleting flow:', error)
      toast.error('Failed to delete flow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicateFlow = async (flow: Flow) => {
    if (!userId) return
    setIsSaving(true)
    try {
      const { data, error } = await supabase.from('onboarding_flows').insert({
        user_id: userId,
        name: `${flow.name} (Copy)`,
        description: flow.description,
        flow_type: flow.type,
        status: 'draft',
        steps: flow.steps,
        trigger: flow.trigger,
        segment_id: flow.segmentId,
        views: 0,
        completions: 0,
        completion_rate: 0,
        dropoff_rate: 0,
        avg_time_to_complete: 0
      }).select().single()

      if (error) throw error

      const newFlow: Flow = {
        ...flow,
        id: data.id,
        name: `${flow.name} (Copy)`,
        status: 'draft',
        views: 0,
        completions: 0,
        completionRate: 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
      setFlows(prev => [newFlow, ...prev])
      toast.success('Flow duplicated', { description: `Created copy of "${flow.name}"` })
    } catch (error) {
      console.error('Error duplicating flow:', error)
      toast.error('Failed to duplicate flow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateChecklist = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const { data, error } = await supabase.from('onboarding_checklists').insert({
        user_id: userId,
        name: 'New Checklist',
        description: '',
        items: [],
        status: 'active',
        users_started: 0,
        users_completed: 0,
        completion_rate: 0
      }).select().single()

      if (error) throw error

      const newChecklist: Checklist = {
        id: data.id,
        name: data.name,
        description: '',
        items: [],
        status: 'active',
        usersStarted: 0,
        usersCompleted: 0,
        completionRate: 0,
        createdAt: data.created_at
      }
      setChecklists(prev => [newChecklist, ...prev])
      toast.success('Checklist created', { description: 'Your new checklist has been created' })
    } catch (error) {
      console.error('Error creating checklist:', error)
      toast.error('Failed to create checklist')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateSegment = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const { data, error } = await supabase.from('user_segments').insert({
        user_id: userId,
        name: 'New Segment',
        description: '',
        rules: [],
        user_count: 0,
        flows_using: 0
      }).select().single()

      if (error) throw error

      const newSegment: Segment = {
        id: data.id,
        name: data.name,
        description: '',
        rules: [],
        userCount: 0,
        flowsUsing: 0,
        createdAt: data.created_at
      }
      setSegments(prev => [newSegment, ...prev])
      toast.success('Segment created', { description: 'Your new segment has been created' })
    } catch (error) {
      console.error('Error creating segment:', error)
      toast.error('Failed to create segment')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportReport = async () => {
    if (!userId) return

    const exportPromise = async () => {
      const { data: flowsData } = await supabase.from('onboarding_flows').select('*').eq('user_id', userId)
      const { data: checklistsData } = await supabase.from('onboarding_checklists').select('*').eq('user_id', userId)

      const exportData = { flows: flowsData, checklists: checklistsData, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `onboarding-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      return exportData
    }

    toast.promise(exportPromise(), {
      loading: 'Exporting report...',
      success: 'Report exported! Your onboarding data has been downloaded',
      error: 'Failed to export report'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:bg-none dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading onboarding data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Onboarding Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Build engaging user experiences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportReport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" onClick={handleCreateFlow}>
              <Plus className="w-4 h-4" />
              Create Flow
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Total Flows</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalFlows}</p>
              <p className="text-xs text-green-600">+2 this week</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Active Flows</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeFlows}</p>
              <p className="text-xs text-blue-600">Running</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Total Views</span>
              </div>
              <p className="text-2xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</p>
              <p className="text-xs text-purple-600">+12% vs last week</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-500">Completions</span>
              </div>
              <p className="text-2xl font-bold">{(stats.totalCompletions / 1000).toFixed(1)}K</p>
              <p className="text-xs text-emerald-600">+8% vs last week</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Avg Completion</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</p>
              <p className="text-xs text-orange-600">+5% improvement</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-gray-500">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-pink-600">Active today</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-500">Onboarded</span>
              </div>
              <p className="text-2xl font-bold">{stats.usersOnboarded}</p>
              <p className="text-xs text-cyan-600">Fully complete</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-gray-500">Checklists</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeChecklists}</p>
              <p className="text-xs text-teal-600">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="flows" className="gap-2">
              <Layers className="w-4 h-4" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="checklists" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Checklists
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-2">
              <Target className="w-4 h-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Flows Tab */}
          <TabsContent value="flows" className="space-y-6">
            {/* Flows Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Onboarding Flows</h3>
                  <p className="text-green-100">Create engaging user onboarding experiences</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.activeFlows}</p>
                    <p className="text-green-200 text-sm">Active Flows</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flows Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Flow', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: handleCreateFlow },
                { icon: Play, label: 'Run All', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: () => { flows.filter(f => f.status !== 'active').forEach(f => handleUpdateFlowStatus(f, 'active')) } },
                { icon: Pause, label: 'Pause All', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: () => { flows.filter(f => f.status === 'active').forEach(f => handleUpdateFlowStatus(f, 'paused')) } },
                { icon: Copy, label: 'Duplicate', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: async () => {
                  if (selectedFlow) {
                    await handleDuplicateFlow(selectedFlow)
                  } else {
                    toast.info('Select a flow to duplicate')
                  }
                } },
                { icon: Download, label: 'Export', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: handleExportReport },
                { icon: Upload, label: 'Import', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: async () => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.json'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      toast.promise(importFlowsFromFile(file), {
                        loading: 'Importing flows...',
                        success: 'Flows imported successfully',
                        error: 'Failed to import flows'
                      })
                    }
                  }
                  input.click()
                } },
                { icon: BarChart3, label: 'Analytics', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', onClick: () => setActiveTab('analytics') },
                { icon: Archive, label: 'Archive', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: async () => {
                  toast.promise(fetchArchivedFlows(), {
                    loading: 'Loading archived flows...',
                    success: (data) => `Found ${data.flows?.length || 0} archived flows`,
                    error: 'Failed to load archived flows'
                  })
                } },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                  disabled={isSaving}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search flows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FlowStatus | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FlowType | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Types</option>
                <option value="onboarding">Onboarding</option>
                <option value="feature_adoption">Feature Adoption</option>
                <option value="announcement">Announcement</option>
                <option value="survey">Survey</option>
              </select>
            </div>

            {/* Flow Cards */}
            <div className="grid gap-4">
              {filteredFlows.map((flow) => (
                <Card key={flow.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedFlow(flow)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{flow.name}</h3>
                          <Badge className={getFlowStatusColor(flow.status)}>
                            {flow.status}
                          </Badge>
                          <Badge variant="outline" className={getFlowTypeColor(flow.type)}>
                            {flow.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {flow.description}
                        </p>

                        {/* Steps Preview */}
                        <div className="flex items-center gap-2 mb-4">
                          {flow.steps.map((step, index) => {
                            const StepIcon = getStepTypeIcon(step.type)
                            return (
                              <div key={step.id} className="flex items-center">
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                  <StepIcon className="w-3 h-3" />
                                  {step.type}
                                </div>
                                {index < flow.steps.length - 1 && (
                                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{flow.views.toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-gray-400" />
                            <span>{flow.completions.toLocaleString()} completions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span>{flow.completionRate}% completion rate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-gray-400" />
                            <span>{formatDuration(flow.avgTimeToComplete)} avg time</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {flow.status === 'active' ? (
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateFlowStatus(flow, 'paused') }} disabled={isSaving}>
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateFlowStatus(flow, 'active') }} disabled={isSaving}>
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedFlow(flow) }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDuplicateFlow(flow) }} disabled={isSaving}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteFlow(flow) }} disabled={isSaving}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Checklists Tab */}
          <TabsContent value="checklists" className="space-y-6">
            {/* Checklists Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">User Checklists</h3>
                  <p className="text-blue-100">Guide users through setup with interactive checklists</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.activeChecklists}</p>
                    <p className="text-blue-200 text-sm">Active Checklists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklists Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Create', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: handleCreateChecklist },
                { icon: CheckSquare, label: 'Active', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: async () => {
                  const activeCount = checklists.filter(c => c.status === 'active').length
                  toast.success(`${activeCount} active checklists`)
                } },
                { icon: Edit, label: 'Edit', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: async () => {
                  if (selectedChecklist) {
                    setSelectedChecklist(selectedChecklist)
                  } else {
                    toast.info('Select a checklist to edit')
                  }
                } },
                { icon: Copy, label: 'Duplicate', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: async () => {
                  if (selectedChecklist && userId) {
                    toast.promise(
                      (async () => {
                        const { data, error } = await supabase.from('onboarding_checklists').insert({
                          user_id: userId,
                          name: `${selectedChecklist.name} (Copy)`,
                          description: selectedChecklist.description,
                          items: selectedChecklist.items,
                          status: 'active'
                        }).select().single()
                        if (error) throw error
                        setChecklists(prev => [{
                          ...selectedChecklist,
                          id: data.id,
                          name: `${selectedChecklist.name} (Copy)`,
                          createdAt: data.created_at
                        }, ...prev])
                        return data
                      })(),
                      {
                        loading: 'Duplicating checklist...',
                        success: 'Checklist duplicated successfully',
                        error: 'Failed to duplicate checklist'
                      }
                    )
                  } else {
                    toast.info('Select a checklist to duplicate')
                  }
                } },
                { icon: Users, label: 'Assign', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: async () => {
                  if (selectedChecklist) {
                    toast.promise(
                      (async () => {
                        const response = await fetch('/api/onboarding/checklists/assign', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ checklistId: selectedChecklist.id })
                        })
                        if (!response.ok) throw new Error('Failed to load assignment options')
                        return response.json()
                      })(),
                      {
                        loading: 'Loading assignment options...',
                        success: 'Assignment options loaded',
                        error: 'Failed to load assignment options'
                      }
                    )
                  } else {
                    toast.info('Select a checklist to assign')
                  }
                } },
                { icon: BarChart3, label: 'Reports', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: () => setActiveTab('analytics') },
                { icon: Download, label: 'Export', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', onClick: handleExportReport },
                { icon: Archive, label: 'Archive', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: async () => {
                  toast.promise(
                    (async () => {
                      const response = await fetch('/api/onboarding/checklists?status=archived')
                      if (!response.ok) throw new Error('Failed to load archived checklists')
                      return response.json()
                    })(),
                    {
                      loading: 'Loading archived checklists...',
                      success: (data) => `Found ${data.checklists?.length || 0} archived checklists`,
                      error: 'Failed to load archived checklists'
                    }
                  )
                } },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                  disabled={isSaving}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search checklists..." className="pl-9" />
              </div>
              <Button className="gap-2" onClick={handleCreateChecklist} disabled={isSaving}>
                <Plus className="w-4 h-4" />
                Create Checklist
              </Button>
            </div>

            <div className="grid gap-4">
              {checklists.map((checklist) => (
                <Card key={checklist.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedChecklist(checklist)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{checklist.name}</h3>
                          <Badge className={getFlowStatusColor(checklist.status)}>
                            {checklist.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {checklist.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{checklist.completionRate}%</p>
                        <p className="text-xs text-gray-500">Completion Rate</p>
                      </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2 mb-4">
                      {checklist.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center">
                            {item.completed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                          {item.isRequired && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{checklist.usersStarted.toLocaleString()} users started</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <span>{checklist.usersCompleted.toLocaleString()} users completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-gray-400" />
                        <span>{checklist.items.length} tasks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Flow Analytics</h3>
                  <p className="text-purple-100">Track and optimize your onboarding performance</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</p>
                    <p className="text-purple-200 text-sm">Avg Completion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: BarChart3, label: 'Overview', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: async () => {
                  toast.promise(fetchAnalytics('overview'), {
                    loading: 'Loading analytics overview...',
                    success: 'Analytics overview loaded',
                    error: 'Failed to load overview'
                  })
                } },
                { icon: TrendingUp, label: 'Trends', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: async () => {
                  toast.promise(fetchAnalytics('trends'), {
                    loading: 'Analyzing performance trends...',
                    success: 'Performance trends loaded',
                    error: 'Failed to load trends'
                  })
                } },
                { icon: PieChart, label: 'Breakdown', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: async () => {
                  toast.promise(fetchAnalytics('breakdown'), {
                    loading: 'Loading detailed breakdown...',
                    success: 'Detailed breakdown loaded',
                    error: 'Failed to load breakdown'
                  })
                } },
                { icon: Target, label: 'Goals', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: async () => {
                  toast.promise(fetchAnalytics('goals'), {
                    loading: 'Loading goals...',
                    success: 'Goals data loaded',
                    error: 'Failed to load goals'
                  })
                } },
                { icon: Download, label: 'Export', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: handleExportReport },
                { icon: RefreshCw, label: 'Refresh', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: () => { setIsLoading(true); window.location.reload() } },
                { icon: Filter, label: 'Filter', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', onClick: async () => {
                  toast.promise(
                    (async () => {
                      const response = await fetch('/api/onboarding/analytics/filters')
                      if (!response.ok) throw new Error('Failed to load filters')
                      return response.json()
                    })(),
                    {
                      loading: 'Loading filter options...',
                      success: 'Filter options loaded',
                      error: 'Failed to load filters'
                    }
                  )
                } },
                { icon: Calendar, label: 'Date Range', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: async () => {
                  // Show date range picker (this would normally open a modal/dialog)
                  toast.info('Select a date range from the chart controls')
                } },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Views & Completions Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flow Performance (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.map((day) => (
                      <div key={day.date} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="font-medium">{day.completions} completions</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${(day.views / maxViews) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{day.views} views</span>
                          <span>{((day.completions / day.views) * 100).toFixed(1)}% rate</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Flows */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Flows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flows.sort((a, b) => b.completionRate - a.completionRate).slice(0, 5).map((flow, index) => (
                      <div key={flow.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{flow.name}</p>
                          <p className="text-xs text-gray-500">{flow.completions.toLocaleString()} completions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{flow.completionRate}%</p>
                          <p className="text-xs text-gray-500">completion</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Drop-off Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drop-off Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flows.filter(f => f.status === 'active').map((flow) => (
                      <div key={flow.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{flow.name}</span>
                          <span className="text-sm text-red-600">{flow.dropoffRate}% drop-off</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                            style={{ width: `${flow.dropoffRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time to Complete */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Time to Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flows.filter(f => f.avgTimeToComplete > 0).map((flow) => (
                      <div key={flow.id} className="flex items-center gap-4">
                        <Timer className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{flow.name}</p>
                          <p className="text-xs text-gray-500">{flow.steps.length} steps</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatDuration(flow.avgTimeToComplete)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Users Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">User Journeys</h3>
                  <p className="text-orange-100">Track individual user progress through onboarding</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.usersOnboarded}</p>
                    <p className="text-orange-200 text-sm">Fully Onboarded</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Users, label: 'All Users', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: async () => {
                  toast.success(`${users.length} users total`)
                } },
                { icon: UserCheck, label: 'Completed', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: async () => {
                  const completedCount = users.filter(u => u.flowsCompleted === u.totalFlows).length
                  toast.success(`${completedCount} users completed onboarding`)
                } },
                { icon: Activity, label: 'At Risk', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', onClick: async () => {
                  const atRiskCount = users.filter(u => u.status === 'at_risk').length
                  toast.warning(`${atRiskCount} users at risk`)
                } },
                { icon: UserX, label: 'Churned', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', onClick: async () => {
                  const churnedCount = users.filter(u => u.status === 'churned').length
                  toast.error(`${churnedCount} users churned`)
                } },
                { icon: Mail, label: 'Email', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: async () => {
                  const userIds = users.map(u => u.userId)
                  toast.promise(sendBulkEmail(userIds, 'onboarding_reminder'), {
                    loading: 'Preparing bulk email...',
                    success: 'Email campaign started',
                    error: 'Failed to send emails'
                  })
                } },
                { icon: Download, label: 'Export', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: handleExportReport },
                { icon: Filter, label: 'Filter', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: async () => {
                  toast.promise(
                    (async () => {
                      const response = await fetch('/api/onboarding/users/filters')
                      if (!response.ok) throw new Error('Failed to load filters')
                      return response.json()
                    })(),
                    {
                      loading: 'Loading filter options...',
                      success: 'Filter options loaded',
                      error: 'Failed to load filters'
                    }
                  )
                } },
                { icon: RefreshCw, label: 'Refresh', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: () => { setIsLoading(true); window.location.reload() } },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="at_risk">At Risk</option>
                <option value="new">New</option>
                <option value="churned">Churned</option>
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Segments</option>
                {segments.map(seg => (
                  <option key={seg.id} value={seg.id}>{seg.name}</option>
                ))}
              </select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flows</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checklist</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.avatar} alt="User avatar" />
                                <AvatarFallback>{user.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.userName}</p>
                                <p className="text-xs text-gray-500">{user.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getUserStatusColor(user.status)}>
                              {user.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">{user.segment}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{user.flowsCompleted}/{user.totalFlows}</span>
                              <Progress value={(user.flowsCompleted / user.totalFlows) * 100} className="w-16 h-2" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{user.checklistProgress}%</span>
                              <Progress value={user.checklistProgress} className="w-16 h-2" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">{user.lastActive}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            {/* Segments Banner */}
            <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">User Segments</h3>
                  <p className="text-cyan-100">Target specific user groups with personalized flows</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{segments.length}</p>
                    <p className="text-cyan-200 text-sm">Active Segments</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search segments..." className="pl-9" />
              </div>
              <Button className="gap-2" onClick={handleCreateSegment} disabled={isSaving}>
                <Plus className="w-4 h-4" />
                Create Segment
              </Button>
            </div>

            <div className="grid gap-4">
              {segments.map((segment) => (
                <Card key={segment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <h3 className="text-lg font-semibold">{segment.name}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {segment.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{segment.userCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">users</p>
                      </div>
                    </div>

                    {/* Rules */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase mb-2">Rules</p>
                      <div className="flex flex-wrap gap-2">
                        {segment.rules.map((rule, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {rule.property} {rule.operator} {rule.value}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span>{segment.flowsUsing} flows using this segment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Created {segment.createdAt}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-0">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'branding', label: 'Branding', icon: Palette },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
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
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Skip</p>
                            <p className="text-sm text-gray-500">Let users skip flows</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Progress</p>
                            <p className="text-sm text-gray-500">Display step progress indicator</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Keyboard Navigation</p>
                            <p className="text-sm text-gray-500">Allow arrow key navigation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Click Outside to Close</p>
                            <p className="text-sm text-gray-500">Close modals on backdrop click</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-advance</p>
                            <p className="text-sm text-gray-500">Automatically move to next step</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Display Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Default Position</Label>
                            <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>Center</option>
                              <option>Top</option>
                              <option>Bottom</option>
                            </select>
                          </div>
                          <div>
                            <Label>Animation Style</Label>
                            <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>Fade</option>
                              <option>Slide</option>
                              <option>Scale</option>
                              <option>None</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Branding Settings */}
                {settingsTab === 'branding' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Branding Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="w-10 h-10 rounded-lg bg-green-600 border-2 border-gray-200" />
                          <Input defaultValue="#16a34a" className="max-w-[150px] dark:bg-gray-800" />
                        </div>
                      </div>
                      <div>
                        <Label>Secondary Color</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500 border-2 border-gray-200" />
                          <Input defaultValue="#10b981" className="max-w-[150px] dark:bg-gray-800" />
                        </div>
                      </div>
                      <div>
                        <Label>Font Family</Label>
                        <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>Open Sans</option>
                          <option>System Default</option>
                        </select>
                      </div>
                      <div>
                        <Label>Border Radius</Label>
                        <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                          <option>Rounded (8px)</option>
                          <option>Square (0px)</option>
                          <option>Pill (999px)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Dark Mode Support</p>
                          <p className="text-sm text-gray-500">Adapt to user's theme preference</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button className="w-full" onClick={() => toast.success('Saved', { description: 'Branding settings saved successfully' })}>Save Branding</Button>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Email on Flow Completion', desc: 'Get notified when users complete flows', enabled: true },
                        { name: 'Weekly Reports', desc: 'Receive weekly performance summary', enabled: true },
                        { name: 'Low Completion Alerts', desc: 'Alert when completion drops below 50%', enabled: false },
                        { name: 'New User Notifications', desc: 'Notify when new users start onboarding', enabled: true },
                        { name: 'Drop-off Alerts', desc: 'Alert on high drop-off rates', enabled: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.enabled} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5" />
                        Integrations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Segment', description: 'Send events to Segment', connected: true },
                        { name: 'Mixpanel', description: 'Track flow analytics', connected: true },
                        { name: 'Slack', description: 'Get notified on completions', connected: false },
                        { name: 'HubSpot', description: 'Sync user data', connected: false },
                        { name: 'Intercom', description: 'Sync with Intercom contacts', connected: false },
                      ].map((integration, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                            <p className="text-sm text-gray-500">{integration.description}</p>
                          </div>
                          <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                            {integration.connected ? 'Connected' : 'Connect'}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">API Key Access</p>
                          <p className="text-sm text-gray-500">Require API key for SDK</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Domain Whitelist</p>
                          <p className="text-sm text-gray-500">Only load on approved domains</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                          <p className="text-sm text-gray-500">Log all configuration changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <Label>API Key</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input type="password" value="ob_live_************************" readOnly className="font-mono dark:bg-gray-900" />
                          <Button variant="outline" size="sm">Regenerate</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Advanced Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Debug Mode</p>
                            <p className="text-sm text-gray-500">Show debug info in console</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Custom CSS</p>
                            <p className="text-sm text-gray-500">Allow custom styling</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">A/B Testing</p>
                            <p className="text-sm text-gray-500">Enable flow experiments</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Analytics Data</p>
                              <p className="text-sm text-gray-500">2.4 GB stored</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">User Sessions</p>
                              <p className="text-sm text-gray-500">156,234 recorded</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset All Flows</p>
                            <p className="text-sm text-gray-500">Delete all flow configurations</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => toast.warning('Reset', { description: 'Are you sure? This will delete all flow configurations.' })}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Clear Analytics</p>
                            <p className="text-sm text-gray-500">Remove all analytics data</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => toast.warning('Clear', { description: 'Are you sure? This will remove all analytics data.' })}>Clear</Button>
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
              insights={onboardingAIInsights}
              title="Onboarding Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={onboardingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={onboardingPredictions}
              title="User Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={onboardingActivities}
            title="Onboarding Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={onboardingQuickActions}
            variant="grid"
          />
        </div>

        {/* Flow Detail Dialog */}
        <Dialog open={!!selectedFlow} onOpenChange={() => setSelectedFlow(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-green-600" />
                {selectedFlow?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedFlow && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className={getFlowStatusColor(selectedFlow.status)}>
                    {selectedFlow.status}
                  </Badge>
                  <Badge variant="outline" className={getFlowTypeColor(selectedFlow.type)}>
                    {selectedFlow.type.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                  {selectedFlow.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="text-2xl font-bold">{selectedFlow.views.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Completions</p>
                    <p className="text-2xl font-bold">{selectedFlow.completions.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-600">{selectedFlow.completionRate}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Avg Time</p>
                    <p className="text-2xl font-bold">{formatDuration(selectedFlow.avgTimeToComplete)}</p>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="font-semibold mb-4">Flow Steps</h4>
                  <div className="space-y-3">
                    {selectedFlow.steps.map((step, index) => {
                      const StepIcon = getStepTypeIcon(step.type)
                      return (
                        <div key={step.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <StepIcon className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium">{step.title}</p>
                            <p className="text-sm text-gray-500">{step.content}</p>
                          </div>
                          <Badge variant="outline">{step.type}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Trigger */}
                <div>
                  <h4 className="font-semibold mb-2">Trigger</h4>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium capitalize">{selectedFlow.trigger.type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">{selectedFlow.trigger.value}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t">
                  <span>Created by {selectedFlow.createdBy}</span>
                  <span>Created {selectedFlow.createdAt}</span>
                  <span>Updated {selectedFlow.updatedAt}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <Button className="gap-2" onClick={async () => {
                    toast.promise(
                      (async () => {
                        const response = await fetch(`/api/onboarding/flows/${selectedFlow.id}/editor`)
                        if (!response.ok) throw new Error('Failed to load editor')
                        return response.json()
                      })(),
                      {
                        loading: 'Opening flow editor...',
                        success: 'Flow editor ready',
                        error: 'Failed to load editor'
                      }
                    )
                  }}>
                    <Edit className="w-4 h-4" />
                    Edit Flow
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => handleDuplicateFlow(selectedFlow)} disabled={isSaving}>
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={async () => {
                    toast.promise(fetchAnalytics('flow', { start: '', end: '' }), {
                      loading: 'Loading flow analytics...',
                      success: 'Analytics loaded',
                      error: 'Failed to load analytics'
                    })
                  }}>
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                  {selectedFlow.status === 'active' ? (
                    <Button variant="outline" className="gap-2" onClick={() => handleUpdateFlowStatus(selectedFlow, 'paused')} disabled={isSaving}>
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" className="gap-2" onClick={() => handleUpdateFlowStatus(selectedFlow, 'active')} disabled={isSaving}>
                      <Play className="w-4 h-4" />
                      Activate
                    </Button>
                  )}
                  <Button variant="destructive" className="gap-2" onClick={() => handleDeleteFlow(selectedFlow)} disabled={isSaving}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Checklist Detail Dialog */}
        <Dialog open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-green-600" />
                {selectedChecklist?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedChecklist && (
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedChecklist.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedChecklist.usersStarted.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Users Started</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedChecklist.usersCompleted.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Users Completed</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedChecklist.completionRate}%</p>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                  </div>
                </div>

                {/* Checklist Items */}
                <div>
                  <h4 className="font-semibold mb-4">Checklist Items</h4>
                  <div className="space-y-3">
                    {selectedChecklist.items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.isRequired && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <Button className="gap-2" onClick={async () => {
                    toast.promise(
                      (async () => {
                        const response = await fetch(`/api/onboarding/checklists/${selectedChecklist.id}/editor`)
                        if (!response.ok) throw new Error('Failed to load editor')
                        return response.json()
                      })(),
                      {
                        loading: 'Opening checklist editor...',
                        success: 'Checklist editor ready',
                        error: 'Failed to load editor'
                      }
                    )
                  }}>
                    <Edit className="w-4 h-4" />
                    Edit Checklist
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={async () => {
                    toast.promise(
                      (async () => {
                        const response = await fetch(`/api/onboarding/checklists/${selectedChecklist.id}/items`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: 'New Item',
                            description: '',
                            isRequired: false,
                            order: selectedChecklist.items.length + 1
                          })
                        })
                        if (!response.ok) throw new Error('Failed to add item')
                        return response.json()
                      })(),
                      {
                        loading: 'Adding new item...',
                        success: 'New item added',
                        error: 'Failed to add item'
                      }
                    )
                  }}>
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={async () => {
                    toast.promise(fetchAnalytics('checklist'), {
                      loading: 'Loading checklist analytics...',
                      success: 'Analytics loaded',
                      error: 'Failed to load analytics'
                    })
                  }}>
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
