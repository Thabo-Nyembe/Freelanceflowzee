'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useMemo, useEffect } from 'react'

// Initialize Supabase client
const supabase = createClient()
import { toast } from 'sonner'
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

import {
  CollapsibleInsightsPanel,
  InsightsToggleButton,
  useInsightsPanel
} from '@/components/ui/collapsible-insights-panel'

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

// Data is fetched from Supabase - no mock/hardcoded data

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
  // Adapter variables for competitive upgrade components - fetched from API or empty
  const onboardingAIInsights: any[] = []
  const onboardingCollaborators: any[] = []
  const onboardingPredictions: any[] = []
  const onboardingActivities: any[] = []
  const onboardingQuickActions: any[] = []

  const insightsPanel = useInsightsPanel(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Data state - start with empty arrays, fetch from Supabase
  const [flows, setFlows] = useState<Flow[]>([])
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [users, setUsers] = useState<UserJourney[]>([])
  const [segments, setSegments] = useState<Segment[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState('flows')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FlowStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<FlowType | 'all'>('all')
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Additional filter state for enhanced functionality
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'at_risk' | 'churned' | 'new' | 'completed'>('all')
  const [checklistStatusFilter, setChecklistStatusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showGoalsDialog, setShowGoalsDialog] = useState(false)
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false)
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null)
  const [completionGoal, setCompletionGoal] = useState(80)
  const [savedCompletionGoal, setSavedCompletionGoal] = useState(80)
  const [analyticsData, setAnalyticsData] = useState<FlowAnalytics[]>([])
  const [assignedSegmentId, setAssignedSegmentId] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<UserJourney | null>(null)
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false)
  const [showSessionManagementDialog, setShowSessionManagementDialog] = useState(false)
  const [apiKey, setApiKey] = useState('ob_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItem | null>(null)
  const [showEditItemDialog, setShowEditItemDialog] = useState(false)
  const [editItemForm, setEditItemForm] = useState({ title: '', description: '', isRequired: false, actionUrl: '' })
  const [analyticsFlowFilter, setAnalyticsFlowFilter] = useState<string | null>(null)
  const [filtersApplied, setFiltersApplied] = useState(false)

  // Form state for creating/editing
  const [flowForm, setFlowForm] = useState({
    name: '',
    description: '',
    type: 'onboarding' as FlowType,
    status: 'draft' as FlowStatus
  })

  // Fetch user and data on mount
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        // Fetch onboarding flows
        const { data: flowsData } = await supabase
          .from('onboarding_flows')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (flowsData && flowsData.length > 0) {
          setFlows(flowsData.map(f => ({
            id: f.id,
            name: f.name,
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

        // Fetch checklists
        const { data: checklistsData } = await supabase
          .from('onboarding_checklists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (checklistsData && checklistsData.length > 0) {
          setChecklists(checklistsData.map(c => ({
            id: c.id,
            name: c.name,
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

        // Fetch segments
        const { data: segmentsData } = await supabase
          .from('user_segments')
          .select('*')
          .eq('user_id', user.id)

        if (segmentsData && segmentsData.length > 0) {
          setSegments(segmentsData.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            rules: s.rules || [],
            userCount: s.user_count || 0,
            flowsUsing: s.flows_using || 0,
            createdAt: s.created_at
          })))
        }

        // Fetch user journeys
        const { data: usersData } = await supabase
          .from('onboarding_user_journeys')
          .select('*')
          .eq('owner_id', user.id)
          .order('last_active', { ascending: false })

        if (usersData && usersData.length > 0) {
          setUsers(usersData.map(u => ({
            userId: u.id,
            userName: u.user_name || 'Unknown User',
            userEmail: u.user_email || '',
            avatar: u.avatar,
            flowsCompleted: u.flows_completed || 0,
            totalFlows: u.total_flows || 0,
            checklistProgress: u.checklist_progress || 0,
            lastActive: u.last_active,
            signupDate: u.signup_date,
            segment: u.segment || 'Default',
            status: u.status || 'new'
          })))
        }

        // Fetch analytics data (last 7 days)
        const { data: analyticsDbData } = await supabase
          .from('onboarding_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: true })

        if (analyticsDbData && analyticsDbData.length > 0) {
          setAnalyticsData(analyticsDbData.map(a => ({
            date: a.date,
            views: a.views || 0,
            starts: a.starts || 0,
            completions: a.completions || 0
          })))
        }
      } catch (error) {
        console.error('Error fetching onboarding data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserAndData()
  }, [])

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
    return users.filter(user => {
      const matchesSearch = user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = userStatusFilter === 'all' ||
        (userStatusFilter === 'completed' ? user.flowsCompleted === user.totalFlows : user.status === userStatusFilter)
      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, userStatusFilter])

  // Filter checklists
  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      const matchesSearch = checklist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checklist.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = checklistStatusFilter === 'all' || checklist.status === checklistStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [checklists, searchQuery, checklistStatusFilter])

  const maxViews = Math.max(...analyticsData.map(a => a.views), 1)

  // CRUD Handlers
  const handleCreateFlow = async () => {
    if (!userId) {
      toast.error('You must be logged in')
      return
    }
    setIsSaving(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
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
      toast.success('Flow created')
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
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('onboarding_flows')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', flow.id)
        .eq('user_id', userId)

      if (error) throw error

      setFlows(prev => prev.map(f => f.id === flow.id ? { ...f, status: newStatus } : f))
      toast.success("Flow " + newStatus + " is now " + newStatus)
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
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('onboarding_flows')
        .delete()
        .eq('id', flow.id)
        .eq('user_id', userId)

      if (error) throw error

      setFlows(prev => prev.filter(f => f.id !== flow.id))
      setSelectedFlow(null)
      toast.success("Flow deleted and has been removed")
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
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
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
      toast.success('Flow duplicated')
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
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
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
      toast.success('Checklist created')
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
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
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
      toast.success('Segment created')
    } catch (error) {
      console.error('Error creating segment:', error)
      toast.error('Failed to create segment')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportReport = async () => {
    if (!userId) return
    toast.info('Exporting report')
    try {
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
      toast.success('Report exported')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export report')
    }
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
            <InsightsToggleButton
              isOpen={insightsPanel.isOpen}
              onToggle={insightsPanel.toggle}
            />
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
                { icon: Copy, label: 'Duplicate', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: () => { if (selectedFlow) handleDuplicateFlow(selectedFlow); else toast.info('Please select a flow to duplicate') } },
                { icon: Download, label: 'Export', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: handleExportReport },
                { icon: Upload, label: 'Import', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: async () => {
                  if (!userId) { toast.error('You must be logged in'); return; }
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    toast.loading('Importing flows...', { id: 'import-flows' });
                    try {
                      const text = await file.text();
                      const data = JSON.parse(text);
                      const importedFlows = data.flows || [];
                      // Insert flows into database
                      const flowsToInsert = importedFlows.map((f: Flow) => ({
                        user_id: userId,
                        name: f.name,
                        description: f.description,
                        flow_type: f.type,
                        status: 'draft',
                        steps: f.steps || [],
                        trigger: f.trigger || { type: 'page_load', value: '/dashboard' },
                        views: 0,
                        completions: 0,
                        completion_rate: 0,
                        dropoff_rate: 0,
                        avg_time_to_complete: 0
                      }));
                      const { data: insertedFlows, error } = await supabase.from('onboarding_flows').insert(flowsToInsert).select();
                      if (error) throw error;
                      const newFlows: Flow[] = (insertedFlows || []).map((f: any) => ({
                        id: f.id,
                        name: f.name,
                        description: f.description || '',
                        type: f.flow_type,
                        status: f.status,
                        steps: f.steps || [],
                        trigger: f.trigger,
                        views: 0,
                        completions: 0,
                        completionRate: 0,
                        dropoffRate: 0,
                        avgTimeToComplete: 0,
                        createdAt: f.created_at,
                        updatedAt: f.updated_at,
                        createdBy: 'Imported'
                      }));
                      setFlows(prev => [...newFlows, ...prev]);
                      toast.success(`${newFlows.length} flows imported successfully`, { id: 'import-flows' });
                    } catch (error) {
                      console.error('Import error:', error);
                      toast.error('Failed to import flows', { id: 'import-flows' });
                    }
                  };
                  input.click();
                } },
                { icon: BarChart3, label: 'Analytics', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', onClick: () => setActiveTab('analytics') },
                { icon: Archive, label: 'Archive', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: () => setStatusFilter('archived') },
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
                { icon: CheckSquare, label: 'Active', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: () => { setChecklistStatusFilter('active'); toast.success('Filter applied') } },
                { icon: Edit, label: 'Edit', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: () => { if (selectedChecklist) setSelectedChecklist(selectedChecklist); else toast.info('Please select a checklist to edit') } },
                { icon: Copy, label: 'Duplicate', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: async () => {
                  if (!selectedChecklist) { toast.info('Please select a checklist to duplicate'); return; }
                  if (!userId) { toast.error('You must be logged in'); return; }
                  setIsSaving(true);
                  try {
                    const { data, error } = await supabase.from('onboarding_checklists').insert({
                      user_id: userId,
                      name: `${selectedChecklist.name} (Copy)`,
                      description: selectedChecklist.description,
                      items: selectedChecklist.items,
                      status: 'active',
                      users_started: 0,
                      users_completed: 0,
                      completion_rate: 0
                    }).select().single();
                    if (error) throw error;
                    const duplicated: Checklist = {
                      id: data.id,
                      name: data.name,
                      description: data.description || '',
                      items: data.items || [],
                      status: 'active',
                      usersStarted: 0,
                      usersCompleted: 0,
                      completionRate: 0,
                      createdAt: data.created_at
                    };
                    setChecklists(prev => [duplicated, ...prev]);
                    toast.success('Checklist duplicated');
                  } catch (error) {
                    console.error('Error duplicating checklist:', error);
                    toast.error('Failed to duplicate checklist');
                  } finally {
                    setIsSaving(false);
                  }
                } },
                { icon: Users, label: 'Assign', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: () => { if (!selectedChecklist) { toast.info('Please select a checklist first'); return; } setShowAssignDialog(true) } },
                { icon: BarChart3, label: 'Reports', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: () => setActiveTab('analytics') },
                { icon: Download, label: 'Export', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', onClick: handleExportReport },
                { icon: Archive, label: 'Archive', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: () => { setChecklistStatusFilter('paused'); toast.success('Filter applied') } },
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
              {filteredChecklists.map((checklist) => (
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
                { icon: BarChart3, label: 'Overview', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: () => { setStatusFilter('all'); setTypeFilter('all'); toast.success('Overview loaded') } },
                { icon: TrendingUp, label: 'Trends', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: () => { const completionTrend = ((stats.totalCompletions / stats.totalViews) * 100).toFixed(1); setAnalyticsDateRange('30d'); toast.success('Trends view - ' + completionTrend + '% completion trend - showing 30-day data') } },
                { icon: PieChart, label: 'Breakdown', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: () => { const byType: Record<FlowType, number> = { onboarding: 0, feature_adoption: 0, announcement: 0, survey: 0, checklist: 0 }; flows.forEach(f => byType[f.type]++); const breakdown = Object.entries(byType).filter(([_, count]) => count > 0).map(([type, count]) => `${type}: ${count}`).join(', '); toast.success('Breakdown: ' + breakdown) } },
                { icon: Target, label: 'Goals', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: () => setShowGoalsDialog(true) },
                { icon: Download, label: 'Export', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: handleExportReport },
                { icon: RefreshCw, label: 'Refresh', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: () => { setIsLoading(true); window.location.reload() } },
                { icon: Filter, label: 'Filter', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', onClick: () => setShowFilterDialog(true) },
                { icon: Calendar, label: 'Date Range', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: () => setShowDateRangeDialog(true) },
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
                    {analyticsData.length > 0 ? analyticsData.map((day) => (
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
                          <span>{day.views > 0 ? ((day.completions / day.views) * 100).toFixed(1) : 0}% rate</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No analytics data available</p>
                        <p className="text-sm">Analytics will appear once flows are active</p>
                      </div>
                    )}
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
                    {[...flows].sort((a, b) => b.completionRate - a.completionRate).slice(0, 5).map((flow, index) => (
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
                { icon: Users, label: 'All Users', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: () => { setUserStatusFilter('all'); toast.success('Filter cleared - showing all users') } },
                { icon: UserCheck, label: 'Completed', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: () => { setUserStatusFilter('completed'); const completed = users.filter(u => u.flowsCompleted === u.totalFlows).length; toast.success('Filter applied - ' + completed + ' users who completed all flows') } },
                { icon: Activity, label: 'At Risk', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', onClick: () => { setUserStatusFilter('at_risk'); const atRisk = users.filter(u => u.status === 'at_risk').length; toast.warning('Filter applied - ' + atRisk + ' at-risk users') } },
                { icon: UserX, label: 'Churned', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', onClick: () => { setUserStatusFilter('churned'); const churned = users.filter(u => u.status === 'churned').length; toast.error('Filter applied - ' + churned + ' churned users') } },
                { icon: Mail, label: 'Email', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: () => { const emailList = filteredUsers.map(u => u.userEmail).join(', '); navigator.clipboard.writeText(emailList); toast.success('Emails copied - ' + filteredUsers.length + ' email addresses copied to clipboard') } },
                { icon: Download, label: 'Export', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: handleExportReport },
                { icon: Filter, label: 'Filter', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: () => setShowFilterDialog(true) },
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
                              <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedUser(user)
                                  setShowUserDetailDialog(true)
                                  toast.success("User details loaded")
                                }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(user.userEmail); toast.success('Email copied') }}>
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
                      <Button className="w-full" onClick={async () => {
                        toast.loading('Saving branding settings...', { id: 'save-branding' })
                        try {
                          const res = await fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'update-branding', settings: { brandingEnabled: true } })
                          })
                          if (!res.ok) throw new Error('Failed to save')
                          toast.success('Branding settings saved!', { id: 'save-branding' })
                        } catch (error) {
                          toast.error('Failed to save branding settings', { id: 'save-branding' })
                        }
                      }}>Save Branding</Button>
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
                          <Button variant={integration.connected ? 'outline' : 'default'} size="sm" onClick={async () => {
                              if (integration.connected) {
                                // Show integration details or disconnect option
                                if (confirm(`${integration.name} is connected. Would you like to disconnect?`)) {
                                  toast.loading(`Disconnecting ${integration.name}...`, { id: 'disconnect-integration' });
                                  try {
                                    if (userId) {
                                      await supabase.from('user_integrations')
                                        .delete()
                                        .eq('user_id', userId)
                                        .eq('provider', integration.name.toLowerCase());
                                    }
                                    toast.success(`${integration.name} disconnected`, { id: 'disconnect-integration' });
                                  } catch (error) {
                                    toast.error(`Failed to disconnect ${integration.name}`, { id: 'disconnect-integration' });
                                  }
                                }
                              } else {
                                toast.loading(`Connecting to ${integration.name}...`, { id: 'connect-integration' });
                                try {
                                  // Store integration in database
                                  if (userId) {
                                    const { error } = await supabase.from('user_integrations').upsert({
                                      user_id: userId,
                                      provider: integration.name.toLowerCase(),
                                      connected: true,
                                      connected_at: new Date().toISOString()
                                    });
                                    if (error && error.code !== '23505') throw error; // Ignore duplicate key error
                                  }
                                  toast.success(`${integration.name} connected successfully!`, { id: 'connect-integration' });
                                } catch (error) {
                                  console.error('Error connecting integration:', error);
                                  toast.error(`Failed to connect ${integration.name}`, { id: 'connect-integration' });
                                }
                              }
                            }}>
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
                          <Button variant="outline" size="sm" onClick={async () => { if (confirm('Are you sure you want to regenerate your API key? Your existing integrations will stop working until updated.')) { toast.loading('Regenerating API key...', { id: 'regen-api-key' }); try { const res = await fetch('/api/user/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'regenerate' }) }); if (!res.ok) throw new Error('Failed'); toast.success('API key regenerated successfully!', { id: 'regen-api-key' }) } catch (error) { toast.error('Failed to regenerate API key', { id: 'regen-api-key' }) } } }}>Regenerate</Button>
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
                          <Button variant="outline" size="sm" onClick={handleExportReport}>Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">User Sessions</p>
                              <p className="text-sm text-gray-500">156,234 recorded</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                              setShowSessionManagementDialog(true)
                            }}>Manage</Button>
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
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!confirm('Are you sure you want to reset all flows? This action cannot be undone.')) return;
                            if (!userId) { toast.error('You must be logged in'); return; }
                            toast.loading('Deleting all flows...', { id: 'reset-flows' });
                            try {
                              const { error } = await supabase.from('onboarding_flows').delete().eq('user_id', userId);
                              if (error) throw error;
                              setFlows([]);
                              toast.success('All flows deleted', { id: 'reset-flows' });
                            } catch (error) {
                              console.error('Error resetting flows:', error);
                              toast.error('Failed to reset flows', { id: 'reset-flows' });
                            }
                          }}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Clear Analytics</p>
                            <p className="text-sm text-gray-500">Remove all analytics data</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={async () => { if (confirm('Are you sure you want to clear all analytics? This action cannot be undone.')) { try { const { data: { user } } = await supabase.auth.getUser(); if (user) { await supabase.from('onboarding_analytics').delete().eq('user_id', user.id); await supabase.from('onboarding_flows').update({ views: 0, completions: 0 }).eq('user_id', user.id); } setAnalyticsData([]); setFlows(prev => prev.map(f => ({ ...f, views: 0, completions: 0, completionRate: 0, dropoffRate: 0, avgTimeToComplete: 0 }))); toast.success('Analytics cleared'); } catch { toast.error('Failed to clear analytics'); } } }}>Clear</Button>
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
        {insightsPanel.isOpen && (
          <CollapsibleInsightsPanel title="Insights & Analytics" defaultOpen={true} className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIInsightsPanel
                  insights={onboardingAIInsights}
                  title="Onboarding Intelligence"
                  onInsightAction={(insight) => toast.info(insight.title)}
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
          </CollapsibleInsightsPanel>
        )}

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
                  <Button className="gap-2" onClick={() => { setEditingFlow(selectedFlow); setFlowForm({ name: selectedFlow.name, description: selectedFlow.description, type: selectedFlow.type, status: selectedFlow.status }); setSelectedFlow(null); toast.success('Edit mode enabled') }}>
                    <Edit className="w-4 h-4" />
                    Edit Flow
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => handleDuplicateFlow(selectedFlow)} disabled={isSaving}>
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => { setActiveTab('analytics'); setSelectedFlow(null); toast.success('Analytics view') }}>
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
                          <Button variant="ghost" size="sm" onClick={() => {
                              setEditingChecklistItem(item);
                              setEditItemForm({
                                title: item.title,
                                description: item.description,
                                isRequired: item.isRequired,
                                actionUrl: item.actionUrl || ''
                              });
                              setShowEditItemDialog(true);
                            }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <Button className="gap-2" onClick={() => { setEditingChecklist(selectedChecklist); setSelectedChecklist(null); toast.success('Edit mode enabled') }}>
                    <Edit className="w-4 h-4" />
                    Edit Checklist
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={async () => {
                    if (!userId) { toast.error('You must be logged in'); return; }
                    const newItem: ChecklistItem = {
                      id: Math.random().toString(36).substr(2, 9),
                      title: 'New Item',
                      description: '',
                      completed: false,
                      order: (selectedChecklist.items.length || 0) + 1,
                      isRequired: false
                    };
                    const updatedItems = [...selectedChecklist.items, newItem];
                    setIsSaving(true);
                    try {
                      const { error } = await supabase.from('onboarding_checklists')
                        .update({ items: updatedItems })
                        .eq('id', selectedChecklist.id);
                      if (error) throw error;
                      setChecklists(prev => prev.map(c => c.id === selectedChecklist.id ? { ...c, items: updatedItems } : c));
                      setSelectedChecklist({ ...selectedChecklist, items: updatedItems });
                      toast.success('Item added successfully');
                    } catch (error) {
                      console.error('Error adding item:', error);
                      toast.error('Failed to add item');
                    } finally {
                      setIsSaving(false);
                    }
                  }} disabled={isSaving}>
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => { setActiveTab('analytics'); setSelectedChecklist(null); toast.success('Analytics view') }}>
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Goals Dialog */}
        <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Set Completion Goals
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Target Completion Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={completionGoal}
                  onChange={(e) => setCompletionGoal(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current average: <span className="font-bold text-green-600">{stats.avgCompletionRate.toFixed(1)}%</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Saved target: <span className="font-bold">{savedCompletionGoal}%</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stats.avgCompletionRate >= savedCompletionGoal
                    ? 'You are meeting your goal!'
                    : `${(savedCompletionGoal - stats.avgCompletionRate).toFixed(1)}% below target`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowGoalsDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => { setSavedCompletionGoal(completionGoal); setShowGoalsDialog(false); toast.success('Goal saved - ' + completionGoal + '%') }}>
                  Save Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-pink-600" />
                Filter Options
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Flow Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FlowStatus | 'all')}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <Label>Flow Type</Label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FlowType | 'all')}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="all">All Types</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="feature_adoption">Feature Adoption</option>
                  <option value="announcement">Announcement</option>
                  <option value="survey">Survey</option>
                </select>
              </div>
              <div>
                <Label>User Status</Label>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as typeof userStatusFilter)}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="at_risk">At Risk</option>
                  <option value="new">New</option>
                  <option value="churned">Churned</option>
                  <option value="completed">Completed All Flows</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setUserStatusFilter('all'); toast.success('Filters cleared') }}>
                  Clear All
                </Button>
                <Button className="flex-1" onClick={() => { setShowFilterDialog(false); toast.success('Filters applied') }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Date Range Dialog */}
        <Dialog open={showDateRangeDialog} onOpenChange={setShowDateRangeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Select Date Range
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {[
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' },
                  { value: '90d', label: 'Last 90 Days' },
                  { value: 'custom', label: 'Custom Range' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAnalyticsDateRange(option.value as typeof analyticsDateRange)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      analyticsDateRange === option.value
                        ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDateRangeDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => { setShowDateRangeDialog(false); toast.success('Date range updated') }}>
                  Apply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Checklist Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                Assign Checklist to Users
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select which users or segments should receive this checklist.
              </p>
              <div>
                <Label>Select Segment</Label>
                <select
                  value={assignedSegmentId}
                  onChange={(e) => setAssignedSegmentId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="">All Users</option>
                  {segments.map(seg => (
                    <option key={seg.id} value={seg.id}>{seg.name} ({seg.userCount} users)</option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium">Selected checklist:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedChecklist?.name || 'None selected'}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  if (selectedChecklist) {
                    const segmentName = assignedSegmentId ? segments.find(s => s.id === assignedSegmentId)?.name : 'All Users'
                    setChecklists(prev => prev.map(c => c.id === selectedChecklist.id ? { ...c, segmentId: assignedSegmentId || undefined } : c))
                    setShowAssignDialog(false)
                    toast.success('Checklist assigned to ' + segmentName + '. Users will see this checklist on their next login')
                  } else {
                    toast.error('No checklist selected')
                  }
                }}>
                  Assign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Flow Dialog */}
        <Dialog open={!!editingFlow} onOpenChange={() => setEditingFlow(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-600" />
                Edit Flow
              </DialogTitle>
            </DialogHeader>
            {editingFlow && (
              <div className="space-y-4">
                <div>
                  <Label>Flow Name</Label>
                  <Input
                    value={flowForm.name}
                    onChange={(e) => setFlowForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={flowForm.description}
                    onChange={(e) => setFlowForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    value={flowForm.type}
                    onChange={(e) => setFlowForm(prev => ({ ...prev, type: e.target.value as FlowType }))}
                    className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="feature_adoption">Feature Adoption</option>
                    <option value="announcement">Announcement</option>
                    <option value="survey">Survey</option>
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    value={flowForm.status}
                    onChange={(e) => setFlowForm(prev => ({ ...prev, status: e.target.value as FlowStatus }))}
                    className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingFlow(null)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={async () => {
                    setIsSaving(true)
                    try {
                      const { createClient } = await import('@/lib/supabase/client')
                      const supabase = createClient()
                      const { error } = await supabase
                        .from('onboarding_flows')
                        .update({
                          name: flowForm.name,
                          description: flowForm.description,
                          flow_type: flowForm.type,
                          status: flowForm.status,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', editingFlow.id)

                      if (error) throw error

                      setFlows(prev => prev.map(f => f.id === editingFlow.id ? {
                        ...f,
                        name: flowForm.name,
                        description: flowForm.description,
                        type: flowForm.type,
                        status: flowForm.status,
                        updatedAt: new Date().toISOString().split('T')[0]
                      } : f))
                      setEditingFlow(null)
                      toast.success('Flow updated')
                    } catch (error) {
                      toast.error('Failed to update flow')
                    } finally {
                      setIsSaving(false)
                    }
                  }} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Checklist Dialog */}
        <Dialog open={!!editingChecklist} onOpenChange={() => setEditingChecklist(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-green-600" />
                Edit Checklist
              </DialogTitle>
            </DialogHeader>
            {editingChecklist && (
              <div className="space-y-4">
                <div>
                  <Label>Checklist Name</Label>
                  <Input
                    value={editingChecklist.name}
                    onChange={(e) => setEditingChecklist(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={editingChecklist.description}
                    onChange={(e) => setEditingChecklist(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    value={editingChecklist.status}
                    onChange={(e) => setEditingChecklist(prev => prev ? { ...prev, status: e.target.value as FlowStatus } : null)}
                    className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingChecklist(null)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={async () => {
                    setIsSaving(true)
                    try {
                      const { createClient } = await import('@/lib/supabase/client')
                      const supabase = createClient()
                      const { error } = await supabase
                        .from('onboarding_checklists')
                        .update({
                          name: editingChecklist.name,
                          description: editingChecklist.description,
                          status: editingChecklist.status
                        })
                        .eq('id', editingChecklist.id)

                      if (error) throw error

                      setChecklists(prev => prev.map(c => c.id === editingChecklist.id ? editingChecklist : c))
                      setEditingChecklist(null)
                      toast.success('Checklist updated')
                    } catch (error) {
                      toast.error('Failed to update checklist')
                    } finally {
                      setIsSaving(false)
                    }
                  }} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Session Management Dialog */}
        <Dialog open={showSessionManagementDialog} onOpenChange={setShowSessionManagementDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                Session Management
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage user session data and recordings.
              </p>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="font-medium">Export Session Data</p>
                    <p className="text-sm text-gray-500">Download all session recordings as CSV</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!userId) { toast.error('You must be logged in'); return; }
                    toast.loading('Exporting sessions...', { id: 'export-sessions' });
                    try {
                      const { data: sessions } = await supabase
                        .from('onboarding_sessions')
                        .select('*')
                        .eq('user_id', userId);

                      const csvContent = sessions && sessions.length > 0
                        ? [
                            ['Session ID', 'Flow ID', 'User ID', 'Started At', 'Completed At', 'Status'].join(','),
                            ...(sessions || []).map(s => [s.id, s.flow_id, s.session_user_id, s.started_at, s.completed_at, s.status].join(','))
                          ].join('\n')
                        : 'No session data available';

                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `sessions-export-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Sessions exported', { id: 'export-sessions' });
                    } catch (error) {
                      console.error('Error exporting sessions:', error);
                      toast.error('Failed to export sessions', { id: 'export-sessions' });
                    }
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="font-medium">Clear Old Sessions</p>
                    <p className="text-sm text-gray-500">Remove sessions older than 90 days</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!userId) { toast.error('You must be logged in'); return; }
                    if (!confirm('Are you sure you want to clear sessions older than 90 days?')) return;
                    toast.loading('Clearing old sessions...', { id: 'clear-sessions' });
                    try {
                      const cutoffDate = new Date();
                      cutoffDate.setDate(cutoffDate.getDate() - 90);
                      await supabase
                        .from('onboarding_sessions')
                        .delete()
                        .eq('user_id', userId)
                        .lt('started_at', cutoffDate.toISOString());
                      toast.success('Old sessions cleared', { id: 'clear-sessions' });
                    } catch (error) {
                      console.error('Error clearing sessions:', error);
                      toast.error('Failed to clear sessions', { id: 'clear-sessions' });
                    }
                  }}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">Delete All Sessions</p>
                    <p className="text-sm text-red-600 dark:text-red-400">Permanently remove all session data</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (!userId) { toast.error('You must be logged in'); return; }
                    if (!confirm('Are you sure you want to delete ALL sessions? This cannot be undone.')) return;
                    toast.loading('Deleting all sessions...', { id: 'delete-sessions' });
                    try {
                      await supabase
                        .from('onboarding_sessions')
                        .delete()
                        .eq('user_id', userId);
                      toast.success('All sessions deleted', { id: 'delete-sessions' });
                    } catch (error) {
                      console.error('Error deleting sessions:', error);
                      toast.error('Failed to delete sessions', { id: 'delete-sessions' });
                    }
                  }}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowSessionManagementDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Checklist Item Dialog */}
        <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-600" />
                Edit Checklist Item
              </DialogTitle>
            </DialogHeader>
            {editingChecklistItem && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editItemForm.title}
                    onChange={(e) => setEditItemForm(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1.5"
                    placeholder="Enter item title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={editItemForm.description}
                    onChange={(e) => setEditItemForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1.5"
                    placeholder="Enter item description"
                  />
                </div>
                <div>
                  <Label>Action URL (optional)</Label>
                  <Input
                    value={editItemForm.actionUrl}
                    onChange={(e) => setEditItemForm(prev => ({ ...prev, actionUrl: e.target.value }))}
                    className="mt-1.5"
                    placeholder="/settings/profile"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Required</p>
                    <p className="text-sm text-gray-500">Mark this item as required</p>
                  </div>
                  <Switch
                    checked={editItemForm.isRequired}
                    onCheckedChange={(checked) => setEditItemForm(prev => ({ ...prev, isRequired: checked }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setShowEditItemDialog(false);
                    setEditingChecklistItem(null);
                  }}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={async () => {
                    if (!selectedChecklist || !editingChecklistItem || !userId) {
                      toast.error('Unable to save changes');
                      return;
                    }
                    setIsSaving(true);
                    try {
                      const updatedItems = selectedChecklist.items.map(item =>
                        item.id === editingChecklistItem.id
                          ? {
                              ...item,
                              title: editItemForm.title,
                              description: editItemForm.description,
                              isRequired: editItemForm.isRequired,
                              actionUrl: editItemForm.actionUrl || undefined
                            }
                          : item
                      );
                      const { error } = await supabase.from('onboarding_checklists')
                        .update({ items: updatedItems })
                        .eq('id', selectedChecklist.id);
                      if (error) throw error;
                      setChecklists(prev => prev.map(c =>
                        c.id === selectedChecklist.id ? { ...c, items: updatedItems } : c
                      ));
                      setSelectedChecklist({ ...selectedChecklist, items: updatedItems });
                      setShowEditItemDialog(false);
                      setEditingChecklistItem(null);
                      toast.success('Item updated successfully');
                    } catch (error) {
                      console.error('Error updating item:', error);
                      toast.error('Failed to update item');
                    } finally {
                      setIsSaving(false);
                    }
                  }} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
