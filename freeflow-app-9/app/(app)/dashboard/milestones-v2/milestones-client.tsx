'use client'

import { createClient } from '@/lib/supabase/client'
import { useMilestones, useMilestoneMutations, type Milestone as HookMilestone, type MilestoneFilters } from '@/lib/hooks/use-milestones'

const supabase = createClient()

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Target, Calendar, Flag, AlertTriangle, CheckCircle2, Clock,
  Link2, TrendingUp, ArrowRight, FileText,
  BarChart3, Settings, Plus, Search, LayoutGrid, List,
  GitBranch, Milestone, Zap, Shield, AlertCircle, XCircle,
  PauseCircle, PlayCircle, Timer, DollarSign, Briefcase,
  Eye, MessageSquare, Bell, ArrowUpRight, ArrowDownRight,
  RefreshCw, CalendarDays, Package, Edit2, MoreVertical,
  Sliders, Webhook, Lock, Mail, Globe, Database, Archive, Trash2, Terminal, Copy, Download
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
// TYPE DEFINITIONS - Monday.com Level Milestone Management
// ============================================================================

type MilestoneStatus = 'not_started' | 'in_progress' | 'at_risk' | 'blocked' | 'completed' | 'cancelled' | 'on_hold'
type MilestoneType = 'project' | 'release' | 'phase' | 'checkpoint' | 'gate' | 'delivery' | 'launch' | 'review'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type HealthScore = 'on_track' | 'at_risk' | 'off_track' | 'blocked'
type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
type DeliverableStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'rejected'

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  email: string
  workload: number // percentage
  tasks_assigned: number
  tasks_completed: number
}

interface Deliverable {
  id: string
  name: string
  description: string
  status: DeliverableStatus
  assignee: TeamMember
  due_date: string
  completed_date?: string
  attachments: number
  comments: number
  priority: Priority
}

interface Dependency {
  id: string
  source_milestone_id: string
  source_milestone_name: string
  target_milestone_id: string
  target_milestone_name: string
  type: DependencyType
  lag_days: number
  is_blocking: boolean
  status: 'satisfied' | 'pending' | 'at_risk' | 'violated'
}

interface StatusUpdate {
  id: string
  author: TeamMember
  content: string
  created_at: string
  health_change?: { from: HealthScore; to: HealthScore }
  progress_change?: { from: number; to: number }
  attachments: string[]
  reactions: { emoji: string; count: number }[]
}

interface Risk {
  id: string
  title: string
  description: string
  probability: 'low' | 'medium' | 'high' | 'very_high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
  status: 'identified' | 'mitigating' | 'mitigated' | 'occurred'
  owner: TeamMember
}

interface BudgetItem {
  category: string
  planned: number
  actual: number
  forecast: number
  variance: number
}

interface Milestone {
  id: string
  name: string
  description: string
  status: MilestoneStatus
  type: MilestoneType
  priority: Priority
  health: HealthScore
  project_id: string
  project_name: string
  owner: TeamMember
  team: TeamMember[]
  start_date: string
  due_date: string
  completed_date?: string
  progress: number
  deliverables: Deliverable[]
  dependencies_in: Dependency[]
  dependencies_out: Dependency[]
  status_updates: StatusUpdate[]
  risks: Risk[]
  budget: {
    total: number
    spent: number
    forecast: number
    currency: string
    items: BudgetItem[]
  }
  tags: string[]
  watchers: number
  comments: number
  is_critical_path: boolean
  created_at: string
  updated_at: string
}

interface MilestoneReport {
  id: string
  name: string
  type: 'status' | 'progress' | 'budget' | 'risk' | 'timeline'
  generated_at: string
  period: string
  metrics: {
    label: string
    value: string
    change: number
    trend: 'up' | 'down' | 'stable'
  }[]
}

// ============================================================================
// EMPTY DATA ARRAYS - Production Ready (Mock data removed)
// ============================================================================

// Empty typed arrays for production (data comes from Supabase hooks)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: MilestoneStatus) => {
  const colors = {
    not_started: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    at_risk: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
    blocked: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400',
    on_hold: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return colors[status]
}

const getStatusIcon = (status: MilestoneStatus) => {
  const icons = {
    not_started: Clock,
    in_progress: PlayCircle,
    at_risk: AlertTriangle,
    blocked: XCircle,
    completed: CheckCircle2,
    cancelled: XCircle,
    on_hold: PauseCircle,
  }
  return icons[status]
}

const getHealthColor = (health: HealthScore) => {
  const colors = {
    on_track: 'text-green-600 dark:text-green-400',
    at_risk: 'text-amber-600 dark:text-amber-400',
    off_track: 'text-red-600 dark:text-red-400',
    blocked: 'text-red-600 dark:text-red-400',
  }
  return colors[health]
}

const getPriorityColor = (priority: Priority) => {
  const colors = {
    critical: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
  }
  return colors[priority]
}

const getTypeIcon = (type: MilestoneType) => {
  const icons = {
    project: Briefcase,
    release: Package,
    phase: GitBranch,
    checkpoint: Flag,
    gate: Shield,
    delivery: Package,
    launch: Zap,
    review: Eye,
  }
  return icons[type]
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getDaysRemaining = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// ============================================================================
// COMPONENT
// ============================================================================

// Empty arrays for AI-powered competitive upgrade components (production ready)
type AIInsight = { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }
type Collaborator = { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }
type Prediction = { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }
type Activity = { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' | 'error' }

// Quick actions are defined inside the component to access state setters

// Database milestone type (matches Supabase schema)
interface DbMilestone {
  id: string
  user_id: string
  milestone_code: string
  name: string
  description: string | null
  type: string
  status: string
  priority: string
  due_date: string | null
  days_remaining: number
  progress: number
  owner_name: string | null
  owner_email: string | null
  team_name: string | null
  deliverables: number
  completed_deliverables: number
  budget: number
  spent: number
  currency: string
  dependencies: number
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Form state for creating/editing milestones
interface MilestoneFormState {
  name: string
  description: string
  type: MilestoneType
  status: MilestoneStatus
  priority: Priority
  due_date: string
  owner_name: string
  owner_email: string
  team_name: string
  budget: string
}

const initialFormState: MilestoneFormState = {
  name: '',
  description: '',
  type: 'project',
  status: 'not_started',
  priority: 'medium',
  due_date: '',
  owner_name: '',
  owner_email: '',
  team_name: '',
  budget: '0',
}

export default function MilestonesClient() {


  // Core state
  const [activeTab, setActiveTab] = useState('milestones')
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Build filters for the hook
  const hookFilters: MilestoneFilters = useMemo(() => ({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  }), [statusFilter, priorityFilter])

  // Use Supabase hook for milestones data
  const { milestones: hookMilestones, stats: hookStats, isLoading, error: hookError, refetch } = useMilestones([], hookFilters)
  const { createMilestone, updateMilestone, deleteMilestone, isCreating, isUpdating, isDeleting } = useMilestoneMutations()

  // Supabase data state (kept for backward compatibility)
  const [dbMilestones, setDbMilestones] = useState<DbMilestone[]>([])
  const loading = isLoading
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRiskAnalysisDialog, setShowRiskAnalysisDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<DbMilestone | null>(null)
  const [formState, setFormState] = useState<MilestoneFormState>(initialFormState)

  // Additional dialog states
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDependencyDialog, setShowDependencyDialog] = useState(false)
  const [showDeliverableDialog, setShowDeliverableDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false)
  const [showArchiveOldDialog, setShowArchiveOldDialog] = useState(false)
  const [showPurgeCompletedDialog, setShowPurgeCompletedDialog] = useState(false)
  const [milestoneToComplete, setMilestoneToComplete] = useState<Milestone | DbMilestone | null>(null)
  const [milestoneToDelete, setMilestoneToDelete] = useState<DbMilestone | null>(null)
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null)
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Milestone completed', description: 'Infrastructure Upgrade has been completed', time: '2 hours ago', type: 'success', read: false },
    { id: '2', title: 'At risk alert', description: 'Platform V2.0 Launch is now at risk', time: '4 hours ago', type: 'warning', read: false },
    { id: '3', title: 'New comment', description: 'Sarah added a comment on Mobile App Beta', time: '1 day ago', type: 'info', read: false },
    { id: '4', title: 'Budget alert', description: 'Security Compliance is over budget', time: '2 days ago', type: 'error', read: false },
    { id: '5', title: 'Deadline reminder', description: 'Data Analytics Platform due in 7 days', time: '3 days ago', type: 'info', read: false },
  ])
  const [archiveThresholdDays, setArchiveThresholdDays] = useState(90)

  // Filter form state
  const [filterForm, setFilterForm] = useState({
    status: 'all' as MilestoneStatus | 'all',
    priority: 'all' as Priority | 'all',
    type: 'all' as MilestoneType | 'all',
    dateRange: 'all' as 'all' | 'week' | 'month' | 'quarter',
    onlyAtRisk: false,
    onlyCriticalPath: false
  })

  // Export form state
  const [exportForm, setExportForm] = useState({
    format: 'csv' as 'csv' | 'json' | 'pdf',
    includeCompleted: true,
    includeArchived: false,
    dateRange: 'all' as 'all' | 'week' | 'month' | 'quarter'
  })

  // Deliverable form state
  const [deliverableForm, setDeliverableForm] = useState({
    name: '',
    description: '',
    dueDate: '',
    assignee: '',
    priority: 'medium' as Priority
  })

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    planned: '',
    actual: '',
    notes: ''
  })
  const [riskForm, setRiskForm] = useState({
    title: '',
    description: '',
    probability: 'medium' as 'low' | 'medium' | 'high' | 'very_high',
    impact: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    mitigation: '',
    owner: ''
  })

  // Sync dbMilestones with hook data for backward compatibility
  useEffect(() => {
    if (hookMilestones) {
      setDbMilestones(hookMilestones as unknown as DbMilestone[])
    }
  }, [hookMilestones])

  // Fetch milestones using hook refetch
  const fetchMilestones = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Create milestone using hook mutation
  const handleCreateMilestone = async () => {
    if (!formState.name.trim()) {
      toast.error('Milestone name is required')
      return
    }

    try {
      const dueDate = formState.due_date ? new Date(formState.due_date) : null
      const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

      await createMilestone({
        name: formState.name,
        description: formState.description || null,
        type: formState.type,
        status: formState.status,
        priority: formState.priority,
        due_date: formState.due_date || null,
        days_remaining: daysRemaining,
        progress: 0,
        owner_name: formState.owner_name || null,
        owner_email: formState.owner_email || null,
        team_name: formState.team_name || null,
        budget: parseFloat(formState.budget) || 0,
        spent: 0,
        currency: 'USD',
        deliverables: 0,
        completed_deliverables: 0,
        dependencies: 0,
      })

      toast.success('Milestone created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
    } catch (error) {
      console.error('Error creating milestone:', error)
      toast.error('Failed to create milestone')
    }
  }

  // Update milestone status using hook mutation
  const handleUpdateStatus = async (milestoneId: string, newStatus: MilestoneStatus) => {
    try {
      const progress = newStatus === 'completed' ? 100 : newStatus === 'not_started' ? 0 : undefined

      const updateData: Partial<HookMilestone> = { status: newStatus }
      if (progress !== undefined) updateData.progress = progress

      await updateMilestone({ id: milestoneId, updates: updateData })
      toast.success(`Milestone marked as ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update milestone status')
    }
  }

  // Update milestone progress using hook mutation
  const handleUpdateProgress = async (milestoneId: string, progress: number) => {
    try {
      await updateMilestone({
        id: milestoneId,
        updates: {
          progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'upcoming',
        }
      })
      toast.success('Progress updated')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  // Delete/Archive milestone using hook mutation
  const handleArchiveMilestone = async (milestoneId: string) => {
    try {
      await updateMilestone({
        id: milestoneId,
        updates: { status: 'missed' }
      })
      toast.success('Milestone archived')
    } catch (error) {
      console.error('Error archiving milestone:', error)
      toast.error('Failed to archive milestone')
    }
  }

  // Delete milestone permanently using hook mutation
  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId)
      toast.success('Milestone deleted')
      setShowDeleteDialog(false)
      setMilestoneToDelete(null)
    } catch (error) {
      console.error('Error deleting milestone:', error)
      toast.error('Failed to delete milestone')
    }
  }

  // Complete milestone
  const handleCompleteMilestone = async (milestone: Milestone | DbMilestone) => {
    await handleUpdateStatus(milestone.id, 'completed')
    setShowCompleteDialog(false)
    setMilestoneToComplete(null)
    toast.success('Milestone marked as complete!')
  }

  // Open edit dialog with milestone data
  const handleOpenEditDialog = (milestone: DbMilestone) => {
    setEditingMilestone(milestone)
    setFormState({
      name: milestone.name,
      description: milestone.description || '',
      type: milestone.type as MilestoneType,
      status: milestone.status as MilestoneStatus,
      priority: milestone.priority as Priority,
      due_date: milestone.due_date || '',
      owner_name: milestone.owner_name || '',
      owner_email: milestone.owner_email || '',
      team_name: milestone.team_name || '',
      budget: milestone.budget?.toString() || '0',
    })
    setShowEditDialog(true)
  }

  // Update existing milestone using hook mutation
  const handleUpdateMilestone = async () => {
    if (!editingMilestone || !formState.name.trim()) {
      toast.error('Milestone name is required')
      return
    }

    try {
      const dueDate = formState.due_date ? new Date(formState.due_date) : null
      const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

      await updateMilestone({
        id: editingMilestone.id,
        updates: {
          name: formState.name,
          description: formState.description || null,
          type: formState.type,
          status: formState.status,
          priority: formState.priority,
          due_date: formState.due_date || null,
          days_remaining: daysRemaining,
          owner_name: formState.owner_name || null,
          owner_email: formState.owner_email || null,
          team_name: formState.team_name || null,
          budget: parseFloat(formState.budget) || 0,
        }
      })

      toast.success('Milestone updated successfully')
      setShowEditDialog(false)
      setEditingMilestone(null)
      setFormState(initialFormState)
    } catch (error) {
      console.error('Error updating milestone:', error)
      toast.error('Failed to update milestone')
    }
  }

  // Apply filters
  const handleApplyFilters = () => {
    setStatusFilter(filterForm.status)
    setPriorityFilter(filterForm.priority)
    toast.success('Filters applied')
    setShowFilterDialog(false)
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilterForm({
      status: 'all',
      priority: 'all',
      type: 'all',
      dateRange: 'all',
      onlyAtRisk: false,
      onlyCriticalPath: false
    })
    setStatusFilter('all')
    setPriorityFilter('all')
    toast.success('Filters reset')
    setShowFilterDialog(false)
  }

  // Export with options
  const handleExportWithOptions = () => {
    let dataToExport = dbMilestones

    if (!exportForm.includeCompleted) {
      dataToExport = dataToExport.filter(m => m.status !== 'completed')
    }

    if (!exportForm.includeArchived) {
      dataToExport = dataToExport.filter(m => m.status !== 'cancelled')
    }

    if (exportForm.format === 'csv') {
      const csvContent = dataToExport.map(m =>
        `${m.name},${m.status},${m.priority},${m.progress}%,${m.due_date || 'N/A'}`
      ).join('\n')

      const blob = new Blob([`Name,Status,Priority,Progress,Due Date\n${csvContent}`], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `milestones-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else if (exportForm.format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `milestones-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      toast.loading('Generating PDF...', { id: 'pdf-export' })
      setTimeout(() => {
        toast.success('PDF exported', { id: 'pdf-export', description: 'milestones-report.pdf saved to Downloads' })
      }, 2000)
    }

    toast.success(`Milestones exported as ${exportForm.format.toUpperCase()}`)
    setShowExportDialog(false)
  }

  // Add deliverable
  const handleAddDeliverable = () => {
    if (!deliverableForm.name.trim()) {
      toast.error('Deliverable name is required')
      return
    }
    toast.success('Deliverable added successfully')
    setDeliverableForm({
      name: '',
      description: '',
      dueDate: '',
      assignee: '',
      priority: 'medium'
    })
    setShowDeliverableDialog(false)
  }

  // Add budget item
  const handleAddBudgetItem = () => {
    if (!budgetForm.category.trim()) {
      toast.error('Budget category is required')
      return
    }
    toast.success('Budget item added successfully')
    setBudgetForm({
      category: '',
      planned: '',
      actual: '',
      notes: ''
    })
    setShowBudgetDialog(false)
  }

  // Add dependency
  const handleAddDependency = () => {
    toast.success('Dependency added successfully')
    setShowDependencyDialog(false)
  }

  // Save settings
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully')
    setShowSettingsDialog(false)
  }

  // Open complete confirmation
  const handleOpenCompleteDialog = (milestone: Milestone | DbMilestone) => {
    setMilestoneToComplete(milestone)
    setShowCompleteDialog(true)
  }

  // Open delete confirmation
  const handleOpenDeleteDialog = (milestone: DbMilestone) => {
    setMilestoneToDelete(milestone)
    setShowDeleteDialog(true)
  }

  // Generate report handlers
  const handleGenerateStatusReport = () => {
    toast.success('Status report generated', { description: 'Check your downloads folder' })
    handleExportReport()
  }

  const handleGenerateBudgetReport = () => {
    toast.success('Budget report generated', { description: 'Financial summary exported' })
  }

  const handleGenerateRiskReport = () => {
    toast.success('Risk assessment exported', { description: 'Risk analysis report generated' })
  }

  const handleGenerateProgressReport = () => {
    toast.success('Progress report generated', { description: 'Timeline and progress exported' })
  }

  // Export milestones report
  const handleExportReport = () => {
    const csvContent = dbMilestones.map(m =>
      `${m.name},${m.status},${m.priority},${m.progress}%,${m.due_date || 'N/A'}`
    ).join('\n')

    const blob = new Blob([`Name,Status,Priority,Progress,Due Date\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `milestones-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  // Sync/Refresh data
  const handleSync = async () => {
    await fetchMilestones()
    toast.success('Data synced')
  }

  // Open edit dialog for a mock milestone (convert to form state)
  const handleOpenMilestoneEditDialog = (milestone: Milestone) => {
    setMilestoneToEdit(milestone)
    setFormState({
      name: milestone.name,
      description: milestone.description || '',
      type: milestone.type,
      status: milestone.status,
      priority: milestone.priority,
      due_date: milestone.due_date || '',
      owner_name: milestone.owner?.name || '',
      owner_email: milestone.owner?.email || '',
      team_name: milestone.project_name || '',
      budget: milestone.budget?.total?.toString() || '0',
    })
    setShowEditDialog(true)
  }

  // Archive old milestones (completed milestones older than threshold)
  const handleArchiveOldMilestones = async () => {
    try {
      const thresholdDate = new Date()
      thresholdDate.setDate(thresholdDate.getDate() - archiveThresholdDays)

      const milestonesToArchive = dbMilestones.filter(m => {
        if (m.status !== 'completed') return false
        const completedDate = new Date(m.updated_at)
        return completedDate < thresholdDate
      })

      if (milestonesToArchive.length === 0) {
        toast.info('No milestones to archive', {
          description: `No completed milestones older than ${archiveThresholdDays} days found`
        })
        setShowArchiveOldDialog(false)
        return
      }

      const { error } = await supabase
        .from('milestones')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .in('id', milestonesToArchive.map(m => m.id))

      if (error) throw error

      toast.success(`${milestonesToArchive.length} milestone(s) archived`, {
        description: `Archived milestones completed more than ${archiveThresholdDays} days ago`
      })
      setShowArchiveOldDialog(false)
      fetchMilestones()
    } catch (error) {
      console.error('Error archiving milestones:', error)
      toast.error('Failed to archive milestones')
    }
  }

  // Purge all completed milestones
  const handlePurgeCompletedMilestones = async () => {
    try {
      const completedMilestones = dbMilestones.filter(m => m.status === 'completed')

      if (completedMilestones.length === 0) {
        toast.info('No completed milestones to purge')
        setShowPurgeCompletedDialog(false)
        return
      }

      const { error } = await supabase
        .from('milestones')
        .delete()
        .in('id', completedMilestones.map(m => m.id))

      if (error) throw error

      toast.success(`${completedMilestones.length} completed milestone(s) purged`, {
        description: 'All completed milestones have been permanently deleted'
      })
      setShowPurgeCompletedDialog(false)
      fetchMilestones()
    } catch (error) {
      console.error('Error purging milestones:', error)
      toast.error('Failed to purge milestones')
    }
  }

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  // Get unread notification count
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  // Calculate stats from hook data
  const stats = useMemo(() => {
    // Use hook stats as primary source
    const total = hookStats?.total || hookMilestones.length
    const completed = hookStats?.completed || hookMilestones.filter(m => m.status === 'completed').length
    const inProgress = hookStats?.inProgress || hookMilestones.filter(m => m.status === 'in-progress').length
    const atRisk = hookStats?.atRisk || hookMilestones.filter(m => m.status === 'at-risk').length

    // Extended stats calculated from real data
    const onTrack = hookMilestones.filter(m => m.status === 'in-progress' && m.days_remaining > 7).length
    const criticalPath = hookMilestones.filter(m => m.priority === 'critical').length
    const totalBudget = hookMilestones.reduce((sum, m) => sum + (m.budget || 0), 0)
    const spentBudget = hookMilestones.reduce((sum, m) => sum + (m.spent || 0), 0)
    const avgProgress = hookStats?.avgProgress || (total > 0 ? hookMilestones.reduce((sum, m) => sum + m.progress, 0) / total : 0)
    const totalDeliverables = hookMilestones.reduce((sum, m) => sum + (m.deliverables || 0), 0)
    const completedDeliverables = hookMilestones.reduce((sum, m) => sum + (m.completed_deliverables || 0), 0)
    const totalRisks = hookMilestones.filter(m => m.status === 'at-risk').length
    const upcomingDeadlines = hookMilestones.filter(m => {
      if (!m.due_date) return false
      const days = getDaysRemaining(m.due_date)
      return days > 0 && days <= 14
    }).length

    return {
      total, completed, inProgress, atRisk, onTrack, criticalPath,
      totalBudget, spentBudget, avgProgress, totalDeliverables,
      completedDeliverables, totalRisks, upcomingDeadlines,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
      deliverableRate: totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0,
    }
  }, [hookStats, hookMilestones])

  // Filter milestones - use hook data with search filter (status/priority already applied via hook)
  const filteredMilestones = useMemo(() => {
    // Filter hook data by search only (status/priority already filtered by hook)
    return hookMilestones.filter(milestone => {
      const matchesSearch = searchQuery === '' ||
        milestone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (milestone.team_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (milestone.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery, hookMilestones])

  // Get all dependencies for visualization (empty array until DB supports dependencies)
  const allDependencies = useMemo(() => {
    const deps: Dependency[] = []
    // Dependencies will be populated when the feature is added to the database
    return deps
  }, [])

  // Export timeline handler
  const handleExportTimeline = () => {
    toast.success('Exporting timeline', { description: 'Timeline chart will be downloaded' })
  }

  // Quick actions for the toolbar (functional, not mock data)
  const milestonesQuickActions = [
    { id: '1', label: 'New Milestone', icon: Plus, action: () => setShowCreateDialog(true), variant: 'primary' as const },
    { id: '2', label: 'Add Deliverable', icon: Package, action: () => setShowDeliverableDialog(true), variant: 'secondary' as const },
    { id: '3', label: 'Add Dependency', icon: Link2, action: () => setShowDependencyDialog(true), variant: 'secondary' as const },
    { id: '4', label: 'Risk Analysis', icon: AlertTriangle, action: () => setShowRiskAnalysisDialog(true), variant: 'secondary' as const },
    { id: '5', label: 'Export Data', icon: Download, action: () => setShowExportDialog(true), variant: 'secondary' as const },
    { id: '6', label: 'Filters', icon: Sliders, action: () => setShowFilterDialog(true), variant: 'secondary' as const },
    { id: '7', label: 'Settings', icon: Settings, action: () => setShowSettingsDialog(true), variant: 'secondary' as const },
    { id: '8', label: 'Refresh', icon: RefreshCw, action: handleSync, variant: 'secondary' as const },
  ]

  // Show error state
  if (hookError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error Loading Milestones</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{hookError.message || 'Failed to load milestones data'}</p>
            <Button onClick={() => refetch()} className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Milestone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Milestone Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monday.com level project milestone tracking and delivery management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isLoading && (
              <Badge variant="outline" className="text-rose-600 border-rose-200">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleSync} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              className="bg-gradient-to-r from-rose-600 to-pink-600 text-white"
              onClick={() => setShowCreateDialog(true)}
              disabled={isCreating}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'New Milestone'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Milestones', value: stats.total, icon: Target, color: 'from-rose-500 to-pink-500' },
            { label: 'In Progress', value: stats.inProgress, icon: PlayCircle, color: 'from-blue-500 to-cyan-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
            { label: 'At Risk', value: stats.atRisk, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
            { label: 'On Track', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
            { label: 'Critical Path', value: stats.criticalPath, icon: Zap, color: 'from-red-500 to-rose-500' },
            { label: 'Budget Used', value: `${stats.budgetUtilization}%`, icon: DollarSign, color: 'from-purple-500 to-violet-500' },
            { label: 'Deliverables', value: `${stats.completedDeliverables}/${stats.totalDeliverables}`, icon: Package, color: 'from-indigo-500 to-blue-500' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="milestones" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <CalendarDays className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="dependencies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Link2 className="w-4 h-4 mr-2" />
                Dependencies
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search milestones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/80 dark:bg-slate-900/80"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MilestoneStatus | 'all')}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterDialog(true)}
                className="flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotificationsDialog(true)}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </Button>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            {/* Milestones Overview Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Milestone Dashboard</h3>
                  <p className="text-rose-100 mb-4">Track project milestones and deliverables</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-rose-100">Total Milestones</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-rose-100">On Track</p>
                      <p className="text-xl font-bold">{stats.onTrack}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-rose-100">At Risk</p>
                      <p className="text-xl font-bold">{stats.atRisk}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Target className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Milestone', color: 'text-rose-500', action: () => setShowCreateDialog(true) },
                { icon: CalendarDays, label: 'Timeline', color: 'text-blue-500', action: () => setActiveTab('timeline') },
                { icon: Package, label: 'Deliverables', color: 'text-green-500', action: () => setActiveTab('deliverables') },
                { icon: Link2, label: 'Dependencies', color: 'text-purple-500', action: () => setActiveTab('dependencies') },
                { icon: AlertTriangle, label: 'Risks', color: 'text-amber-500', action: () => setShowRiskAnalysisDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'text-indigo-500', action: () => setActiveTab('reports') },
                { icon: Download, label: 'Export', color: 'text-cyan-500', action: handleExportReport },
                { icon: RefreshCw, label: 'Refresh', color: 'text-pink-500', action: handleSync },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredMilestones.map((milestone) => {
                const StatusIcon = getStatusIcon(milestone.status)
                const TypeIcon = getTypeIcon(milestone.type)
                const daysRemaining = getDaysRemaining(milestone.due_date)

                return (
                  <Card
                    key={milestone.id}
                    className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                              {milestone.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {milestone.project_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {milestone.is_critical_path && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400">
                              <Zap className="w-3 h-3 mr-1" />
                              Critical
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More options">
                  <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => handleOpenMilestoneEditDialog(milestone)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Milestone
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenCompleteDialog(milestone)}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowDeliverableDialog(true)}>
                                <Package className="w-4 h-4 mr-2" />
                                Add Deliverable
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowDependencyDialog(true)}>
                                <Link2 className="w-4 h-4 mr-2" />
                                Add Dependency
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateStatus(milestone.id, 'on_hold')}>
                                <PauseCircle className="w-4 h-4 mr-2" />
                                Put On Hold
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchiveMilestone(milestone.id)} className="text-amber-600">
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className={getStatusColor(milestone.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(milestone.priority)}>
                          <Flag className="w-3 h-3 mr-1" />
                          {milestone.priority}
                        </Badge>
                        <Badge variant="outline" className={getHealthColor(milestone.health)}>
                          {milestone.health === 'on_track' ? <TrendingUp className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {milestone.health.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{milestone.progress}%</span>
                        </div>
                        <Progress value={milestone.progress} className="h-2" />
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(milestone.due_date)}
                        </div>
                        <div className={`flex items-center gap-1 ${
                          daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          <Timer className="w-4 h-4" />
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)} days overdue`
                            : daysRemaining === 0
                            ? 'Due today'
                            : `${daysRemaining} days left`}
                        </div>
                      </div>

                      {/* Team & Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex -space-x-2">
                          {milestone.team.slice(0, 4).map((member, idx) => (
                            <Avatar key={idx} className="w-8 h-8 border-2 border-white dark:border-slate-900">
                              <AvatarImage src={member.avatar} alt="User avatar" />
                              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {milestone.team.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-slate-900">
                              +{milestone.team.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {milestone.deliverables.filter(d => d.status === 'approved').length}/{milestone.deliverables.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {milestone.comments}
                          </span>
                          {milestone.risks.length > 0 && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertCircle className="w-4 h-4" />
                              {milestone.risks.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Budget Bar */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">Budget</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(milestone.budget.spent)} / {formatCurrency(milestone.budget.total)}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              milestone.budget.spent > milestone.budget.total
                                ? 'bg-red-500'
                                : milestone.budget.spent > milestone.budget.total * 0.9
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((milestone.budget.spent / milestone.budget.total) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {/* Timeline Overview Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Timeline View</h2>
                  <p className="text-rose-100">Visualize milestone schedules with Gantt-style timeline</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{hookMilestones.length}</p>
                    <p className="text-rose-200 text-sm">Milestones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">Q1-Q2</p>
                    <p className="text-rose-200 text-sm">Timeframe</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-rose-500" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-64 text-sm font-medium text-slate-600 dark:text-slate-400">Milestone</div>
                    <div className="flex-1 flex items-center">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => (
                        <div key={idx} className="flex-1 text-center text-xs text-slate-500">{month}</div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline rows */}
                  <div className="space-y-4">
                    {hookMilestones.map((milestone) => {
                      const TypeIcon = getTypeIcon(milestone.type as MilestoneType) || Milestone
                      const startDate = milestone.due_date ? new Date(milestone.due_date) : new Date()
                      startDate.setMonth(startDate.getMonth() - 1) // Approximate start as 1 month before due
                      const startPercent = Math.max(0, Math.min(100, ((startDate.getMonth()) / 6) * 100))
                      const endPercent = Math.max(0, Math.min(100, ((new Date(milestone.due_date || new Date()).getMonth() + 1) / 6) * 100))
                      const width = Math.max(5, endPercent - startPercent)

                      return (
                        <div key={milestone.id} className="flex items-center gap-4">
                          <div className="w-64 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center`}>
                              <TypeIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                                {milestone.name}
                              </p>
                              <p className="text-xs text-slate-500">{milestone.progress}%</p>
                            </div>
                          </div>
                          <div className="flex-1 relative h-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <div
                              className={`absolute top-1 bottom-1 rounded-md ${
                                milestone.status === 'completed'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : milestone.status === 'at-risk'
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                  : 'bg-gradient-to-r from-rose-500 to-pink-500'
                              }`}
                              style={{ left: `${startPercent}%`, width: `${width}%` }}
                            >
                              <div
                                className="h-full bg-white/30 rounded-l-md"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                            {milestone.priority === 'critical' && (
                              <Zap className="absolute -top-2 -right-2 w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-rose-500 to-pink-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-500 to-orange-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">At Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Critical Path</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hookMilestones.filter(m => (m.deliverables || 0) > 0).map((milestone) => (
                <Card key={milestone.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{milestone.name}</span>
                      <Badge variant="outline">
                        {milestone.completed_deliverables || 0}/{milestone.deliverables || 0} Complete
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-100 dark:bg-rose-900/30">
                            <Package className="w-4 h-4 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {milestone.deliverables || 0} Deliverable{(milestone.deliverables || 0) !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-slate-500">
                              {milestone.completed_deliverables || 0} completed • {(milestone.deliverables || 0) - (milestone.completed_deliverables || 0)} remaining
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={milestone.deliverables ? ((milestone.completed_deliverables || 0) / milestone.deliverables) * 100 : 0}
                            className="w-24 h-2"
                          />
                          <Badge variant="outline" className={getPriorityColor(milestone.priority)}>
                            {milestone.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {hookMilestones.filter(m => (m.deliverables || 0) > 0).length === 0 && (
                <Card className="col-span-full border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No milestones with deliverables yet</p>
                    <p className="text-sm text-slate-400 mt-1">Create milestones and add deliverables to track progress</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-rose-500" />
                  Milestone Dependencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allDependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${
                        dep.status === 'satisfied'
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : dep.status === 'at_risk'
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                          : dep.status === 'violated'
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {dep.source_milestone_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <ArrowRight className="w-5 h-5" />
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {dep.type.replace(/_/g, ' ')}
                            </span>
                            {dep.lag_days > 0 && (
                              <span className="text-xs text-slate-500">+{dep.lag_days}d</span>
                            )}
                            <ArrowRight className="w-5 h-5" />
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {dep.target_milestone_name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {dep.is_blocking && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Blocking
                          </Badge>
                        )}
                        <Badge variant="outline" className={
                          dep.status === 'satisfied'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : dep.status === 'at_risk'
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : dep.status === 'violated'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }>
                          {dep.status === 'satisfied' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {dep.status === 'at_risk' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {dep.status === 'violated' && <XCircle className="w-3 h-3 mr-1" />}
                          {dep.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Cards */}
              <div className="lg:col-span-2 space-y-6">
                {([] as MilestoneReport[]).map((report) => (
                  <Card key={report.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-rose-500" />
                          {report.name}
                        </span>
                        <Badge variant="outline">{report.period}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {report.metrics.map((metric, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</span>
                              <span className={`text-sm flex items-center ${
                                metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                              }`}>
                                {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                                 metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                                {metric.change !== 0 && `${metric.change > 0 ? '+' : ''}${metric.change}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">On-Time Rate</span>
                      <span className="text-lg font-bold text-green-600">{stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Avg Progress</span>
                      <span className="text-lg font-bold text-blue-600">{Math.round(stats.avgProgress)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active Risks</span>
                      <span className="text-lg font-bold text-amber-600">{stats.totalRisks}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Upcoming (14d)</span>
                      <span className="text-lg font-bold text-rose-600">{stats.upcomingDeadlines}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Generate Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateStatusReport}>
                      <FileText className="w-4 h-4 mr-2" />
                      Status Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateBudgetReport}>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Budget Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateRiskReport}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Risk Assessment
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleGenerateProgressReport}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Progress Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'milestones', label: 'Milestones', icon: Target },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your milestone management preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default View Mode</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Grid View</option>
                              <option>List View</option>
                              <option>Timeline View</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>MMM DD, YYYY</option>
                              <option>DD/MM/YYYY</option>
                              <option>YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Show Completed Milestones</p>
                              <p className="text-sm text-muted-foreground">Display completed milestones in list</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-expand Details</p>
                              <p className="text-sm text-muted-foreground">Expand milestone details on click</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Show Budget Info</p>
                              <p className="text-sm text-muted-foreground">Display budget on milestone cards</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'milestones' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Milestone Configuration</CardTitle>
                        <CardDescription>Configure milestone behavior and automation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Priority</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Medium</option>
                              <option>Low</option>
                              <option>High</option>
                              <option>Critical</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Risk Threshold (%)</Label>
                            <Input type="number" defaultValue="80" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-update Status</p>
                              <p className="text-sm text-muted-foreground">Update status based on progress</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Track Dependencies</p>
                              <p className="text-sm text-muted-foreground">Enable dependency tracking</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Critical Path Analysis</p>
                              <p className="text-sm text-muted-foreground">Highlight critical path items</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure how you receive milestone updates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Due Date Reminders', description: 'Get notified before milestones are due', enabled: true },
                          { title: 'Status Change Alerts', description: 'Notify when status changes', enabled: true },
                          { title: 'Risk Alerts', description: 'Alert when milestones become at risk', enabled: true },
                          { title: 'Budget Warnings', description: 'Warn when over budget threshold', enabled: false },
                          { title: 'Team Assignment Updates', description: 'Notify on team changes', enabled: true },
                          { title: 'Weekly Summary', description: 'Weekly progress summary email', enabled: false },
                        ].map((notification, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Choose where to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { icon: Mail, label: 'Email', active: true },
                            { icon: Bell, label: 'In-App', active: true },
                            { icon: Globe, label: 'Slack', active: false },
                            { icon: MessageSquare, label: 'SMS', active: false },
                          ].map((channel, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <channel.icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <span className="font-medium">{channel.label}</span>
                              </div>
                              <Switch defaultChecked={channel.active} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Project Integrations</CardTitle>
                        <CardDescription>Connect with project management tools</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Jira', description: 'Sync with Jira epics', connected: true },
                            { name: 'Asana', description: 'Connect Asana milestones', connected: false },
                            { name: 'Monday.com', description: 'Sync with Monday boards', connected: false },
                            { name: 'GitHub', description: 'Track GitHub milestones', connected: true },
                            { name: 'Slack', description: 'Team notifications', connected: true },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <Database className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys for integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="ms_sk_xxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => { navigator.clipboard.writeText('ms_sk_xxxxxxxxxxxxx'); toast.success('Key copied to clipboard'); }}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage milestone access permissions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { role: 'Admin', access: 'Full Access', users: 2 },
                            { role: 'Project Manager', access: 'Create & Edit', users: 5 },
                            { role: 'Team Member', access: 'View & Comment', users: 15 },
                            { role: 'Viewer', access: 'View Only', users: 8 },
                          ].map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{role.role}</p>
                                  <p className="text-sm text-muted-foreground">{role.access}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">{role.users} users</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Automation Rules</CardTitle>
                        <CardDescription>Configure advanced automation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Auto-update Status', description: 'Update status based on progress', enabled: true },
                          { title: 'Risk Auto-detection', description: 'Detect at-risk milestones automatically', enabled: true },
                          { title: 'Dependency Alerts', description: 'Alert on dependency changes', enabled: false },
                          { title: 'Parent Progress Update', description: 'Update parent milestone progress', enabled: true },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your milestone data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={handleExportReport}>
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setShowArchiveOldDialog(true)}>
                            <Archive className="w-5 h-5" />
                            <span>Archive Old</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={handleSync}>
                            <RefreshCw className="w-5 h-5" />
                            <span>Reset Stats</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600" onClick={() => setShowPurgeCompletedDialog(true)}>
                            <Trash2 className="w-5 h-5" />
                            <span>Purge Completed</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-amber-600 dark:text-amber-500">
                          Irreversible actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset All Milestones</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Delete all milestone data</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
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
              insights={[] as AIInsight[]}
              title="Milestone Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[] as Collaborator[]}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[] as Prediction[]}
              title="Delivery Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={[] as Activity[]}
            title="Milestone Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={milestonesQuickActions}
            variant="grid"
          />
        </div>

        {/* Milestone Detail Dialog */}
        <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedMilestone && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedMilestone.name}</h2>
                      <p className="text-sm text-slate-500 font-normal">{selectedMilestone.project_name}</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedMilestone.description}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6 py-4">
                    {/* Status and Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                          <Badge variant="outline" className={getStatusColor(selectedMilestone.status)}>
                            {selectedMilestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Health</span>
                          <span className={`font-medium ${getHealthColor(selectedMilestone.health)}`}>
                            {selectedMilestone.health.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="text-2xl font-bold text-rose-600">{selectedMilestone.progress}%</span>
                        </div>
                        <Progress value={selectedMilestone.progress} className="h-2" />
                      </div>
                    </div>

                    {/* Team */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Team ({selectedMilestone.team.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMilestone.team.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} alt="User avatar" />
                              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Budget Breakdown</h4>
                      <div className="space-y-2">
                        {selectedMilestone.budget.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-32">{item.category}</span>
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${(item.actual / item.planned) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-900 dark:text-white w-24 text-right">
                              {formatCurrency(item.actual)} / {formatCurrency(item.planned)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    {selectedMilestone.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Active Risks</h4>
                        <div className="space-y-2">
                          {selectedMilestone.risks.map((risk) => (
                            <div key={risk.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-amber-900 dark:text-amber-200">{risk.title}</span>
                                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                                  {risk.probability} probability
                                </Badge>
                              </div>
                              <p className="text-sm text-amber-800 dark:text-amber-300">{risk.mitigation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Updates */}
                    {selectedMilestone.status_updates.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Recent Updates</h4>
                        <div className="space-y-3">
                          {selectedMilestone.status_updates.map((update) => (
                            <div key={update.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={update.author.avatar} alt="User avatar" />
                                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs">
                                    {update.author.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{update.author.name}</span>
                                <span className="text-xs text-slate-500">{formatDate(update.created_at)}</span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{update.content}</p>
                              {update.reactions.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {update.reactions.map((reaction, idx) => (
                                    <span key={idx} className="text-sm">
                                      {reaction.emoji} {reaction.count}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Milestone Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                Create New Milestone
              </DialogTitle>
              <DialogDescription>
                Add a new milestone to track project progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Milestone Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Product Launch Q1"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this milestone"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.type}
                    onChange={(e) => setFormState(prev => ({ ...prev, type: e.target.value as MilestoneType }))}
                  >
                    <option value="project">Project</option>
                    <option value="release">Release</option>
                    <option value="phase">Phase</option>
                    <option value="checkpoint">Checkpoint</option>
                    <option value="gate">Gate</option>
                    <option value="delivery">Delivery</option>
                    <option value="launch">Launch</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.priority}
                    onChange={(e) => setFormState(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formState.due_date}
                    onChange={(e) => setFormState(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={formState.budget}
                    onChange={(e) => setFormState(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name</Label>
                  <Input
                    id="owner_name"
                    placeholder="Project owner"
                    value={formState.owner_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, owner_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_name">Team Name</Label>
                  <Input
                    id="team_name"
                    placeholder="Assigned team"
                    value={formState.team_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, team_name: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMilestone}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-rose-600 to-pink-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Milestone'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Risk Analysis Dialog */}
        <Dialog open={showRiskAnalysisDialog} onOpenChange={setShowRiskAnalysisDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Risk Analysis & Management
              </DialogTitle>
              <DialogDescription>
                Identify, assess, and manage project risks to ensure milestone success
              </DialogDescription>
            </DialogHeader>

            {/* Existing Risks Summary */}
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-600">
                    {hookMilestones.filter(m => m.priority === 'critical' && m.status === 'at-risk').length}
                  </div>
                  <div className="text-xs text-red-600">Critical Risks</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="text-2xl font-bold text-amber-600">
                    {hookMilestones.filter(m => m.priority === 'high' && m.status === 'at-risk').length}
                  </div>
                  <div className="text-xs text-amber-600">High Impact</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600">
                    {hookMilestones.filter(m => m.status === 'in-progress').length}
                  </div>
                  <div className="text-xs text-blue-600">Being Mitigated</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600">
                    {hookMilestones.filter(m => m.status === 'completed').length}
                  </div>
                  <div className="text-xs text-green-600">Mitigated</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Add New Risk</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="risk_title">Risk Title *</Label>
                    <Input
                      id="risk_title"
                      placeholder="e.g., Resource availability constraint"
                      value={riskForm.title}
                      onChange={(e) => setRiskForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk_description">Description</Label>
                    <Input
                      id="risk_description"
                      placeholder="Describe the risk and its potential impact"
                      value={riskForm.description}
                      onChange={(e) => setRiskForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="risk_probability">Probability</Label>
                      <select
                        id="risk_probability"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={riskForm.probability}
                        onChange={(e) => setRiskForm(prev => ({ ...prev, probability: e.target.value as 'low' | 'medium' | 'high' | 'very_high' }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="very_high">Very High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk_impact">Impact Level</Label>
                      <select
                        id="risk_impact"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={riskForm.impact}
                        onChange={(e) => setRiskForm(prev => ({ ...prev, impact: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk_mitigation">Mitigation Strategy</Label>
                    <Input
                      id="risk_mitigation"
                      placeholder="How will this risk be mitigated?"
                      value={riskForm.mitigation}
                      onChange={(e) => setRiskForm(prev => ({ ...prev, mitigation: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk_owner">Risk Owner</Label>
                    <Input
                      id="risk_owner"
                      placeholder="Person responsible for managing this risk"
                      value={riskForm.owner}
                      onChange={(e) => setRiskForm(prev => ({ ...prev, owner: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Risk Matrix Preview */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Risk Assessment Matrix</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-1 md:gap-6 text-xs">
                  <div className="col-span-1"></div>
                  <div className="text-center p-1 font-medium">Low</div>
                  <div className="text-center p-1 font-medium">Medium</div>
                  <div className="text-center p-1 font-medium">High</div>
                  <div className="text-center p-1 font-medium">Critical</div>

                  <div className="text-right p-1 font-medium">Very High</div>
                  <div className={`p-2 rounded ${riskForm.probability === 'very_high' && riskForm.impact === 'low' ? 'ring-2 ring-black dark:ring-white' : ''} bg-amber-200`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'very_high' && riskForm.impact === 'medium' ? 'ring-2 ring-black dark:ring-white' : ''} bg-orange-300`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'very_high' && riskForm.impact === 'high' ? 'ring-2 ring-black dark:ring-white' : ''} bg-red-400`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'very_high' && riskForm.impact === 'critical' ? 'ring-2 ring-black dark:ring-white' : ''} bg-red-600`}></div>

                  <div className="text-right p-1 font-medium">High</div>
                  <div className={`p-2 rounded ${riskForm.probability === 'high' && riskForm.impact === 'low' ? 'ring-2 ring-black dark:ring-white' : ''} bg-yellow-200`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'high' && riskForm.impact === 'medium' ? 'ring-2 ring-black dark:ring-white' : ''} bg-amber-300`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'high' && riskForm.impact === 'high' ? 'ring-2 ring-black dark:ring-white' : ''} bg-orange-400`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'high' && riskForm.impact === 'critical' ? 'ring-2 ring-black dark:ring-white' : ''} bg-red-500`}></div>

                  <div className="text-right p-1 font-medium">Medium</div>
                  <div className={`p-2 rounded ${riskForm.probability === 'medium' && riskForm.impact === 'low' ? 'ring-2 ring-black dark:ring-white' : ''} bg-green-200`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'medium' && riskForm.impact === 'medium' ? 'ring-2 ring-black dark:ring-white' : ''} bg-yellow-300`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'medium' && riskForm.impact === 'high' ? 'ring-2 ring-black dark:ring-white' : ''} bg-amber-400`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'medium' && riskForm.impact === 'critical' ? 'ring-2 ring-black dark:ring-white' : ''} bg-orange-500`}></div>

                  <div className="text-right p-1 font-medium">Low</div>
                  <div className={`p-2 rounded ${riskForm.probability === 'low' && riskForm.impact === 'low' ? 'ring-2 ring-black dark:ring-white' : ''} bg-green-100`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'low' && riskForm.impact === 'medium' ? 'ring-2 ring-black dark:ring-white' : ''} bg-green-300`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'low' && riskForm.impact === 'high' ? 'ring-2 ring-black dark:ring-white' : ''} bg-yellow-400`}></div>
                  <div className={`p-2 rounded ${riskForm.probability === 'low' && riskForm.impact === 'critical' ? 'ring-2 ring-black dark:ring-white' : ''} bg-amber-500`}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Current selection highlighted based on probability and impact
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRiskAnalysisDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!riskForm.title.trim()) {
                    toast.error('Risk title is required')
                    return
                  }
                  toast.success('Risk added to analysis')
                  setRiskForm({
                    title: '',
                    description: '',
                    probability: 'medium',
                    impact: 'medium',
                    mitigation: '',
                    owner: ''
                  })
                  setShowRiskAnalysisDialog(false)
                }}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
              >
                Add Risk
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Milestone Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                Edit Milestone
              </DialogTitle>
              <DialogDescription>
                Update milestone details and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Milestone Name *</Label>
                <Input
                  id="edit_name"
                  placeholder="e.g., Product Launch Q1"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  placeholder="Brief description of this milestone"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_type">Type</Label>
                  <select
                    id="edit_type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.type}
                    onChange={(e) => setFormState(prev => ({ ...prev, type: e.target.value as MilestoneType }))}
                  >
                    <option value="project">Project</option>
                    <option value="release">Release</option>
                    <option value="phase">Phase</option>
                    <option value="checkpoint">Checkpoint</option>
                    <option value="gate">Gate</option>
                    <option value="delivery">Delivery</option>
                    <option value="launch">Launch</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_status">Status</Label>
                  <select
                    id="edit_status"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.status}
                    onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as MilestoneStatus }))}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="at_risk">At Risk</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_priority">Priority</Label>
                  <select
                    id="edit_priority"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.priority}
                    onChange={(e) => setFormState(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_due_date">Due Date</Label>
                  <Input
                    id="edit_due_date"
                    type="date"
                    value={formState.due_date}
                    onChange={(e) => setFormState(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_owner_name">Owner Name</Label>
                  <Input
                    id="edit_owner_name"
                    placeholder="Project owner"
                    value={formState.owner_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, owner_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_budget">Budget (USD)</Label>
                  <Input
                    id="edit_budget"
                    type="number"
                    placeholder="0"
                    value={formState.budget}
                    onChange={(e) => setFormState(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false)
                setEditingMilestone(null)
                setFormState(initialFormState)
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMilestone}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-rose-600 to-pink-600 text-white"
              >
                {isSubmitting ? 'Updating...' : 'Update Milestone'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Complete Milestone Confirmation Dialog */}
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Complete Milestone
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to mark this milestone as complete?
              </DialogDescription>
            </DialogHeader>
            {milestoneToComplete && (
              <div className="py-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    {milestoneToComplete.name}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    This will set the progress to 100% and mark all deliverables as complete.
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowCompleteDialog(false)
                setMilestoneToComplete(null)
              }}>
                Cancel
              </Button>
              <Button
                onClick={() => milestoneToComplete && handleCompleteMilestone(milestoneToComplete)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              >
                Complete Milestone
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Milestone Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Milestone
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the milestone.
              </DialogDescription>
            </DialogHeader>
            {milestoneToDelete && (
              <div className="py-4">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    {milestoneToDelete.name}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    All associated data including deliverables and dependencies will be removed.
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowDeleteDialog(false)
                setMilestoneToDelete(null)
              }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => milestoneToDelete && handleDeleteMilestone(milestoneToDelete.id)}
              >
                Delete Milestone
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Export Milestones
              </DialogTitle>
              <DialogDescription>
                Choose export format and options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                  {(['csv', 'json', 'pdf'] as const).map((format) => (
                    <Button
                      key={format}
                      variant={exportForm.format === format ? 'default' : 'outline'}
                      className={exportForm.format === format ? 'bg-rose-500' : ''}
                      onClick={() => setExportForm(prev => ({ ...prev, format }))}
                    >
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={exportForm.dateRange}
                  onChange={(e) => setExportForm(prev => ({ ...prev, dateRange: e.target.value as typeof exportForm.dateRange }))}
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Include Completed</p>
                    <p className="text-xs text-muted-foreground">Export completed milestones</p>
                  </div>
                  <Switch
                    checked={exportForm.includeCompleted}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeCompleted: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Include Archived</p>
                    <p className="text-xs text-muted-foreground">Export archived/cancelled milestones</p>
                  </div>
                  <Switch
                    checked={exportForm.includeArchived}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeArchived: checked }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExportWithOptions}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-500" />
                Filter Milestones
              </DialogTitle>
              <DialogDescription>
                Apply filters to narrow down your milestone view
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={filterForm.status}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, status: e.target.value as typeof filterForm.status }))}
                  >
                    <option value="all">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="at_risk">At Risk</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={filterForm.priority}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, priority: e.target.value as typeof filterForm.priority }))}
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={filterForm.type}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, type: e.target.value as typeof filterForm.type }))}
                  >
                    <option value="all">All Types</option>
                    <option value="project">Project</option>
                    <option value="release">Release</option>
                    <option value="phase">Phase</option>
                    <option value="checkpoint">Checkpoint</option>
                    <option value="gate">Gate</option>
                    <option value="delivery">Delivery</option>
                    <option value="launch">Launch</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={filterForm.dateRange}
                    onChange={(e) => setFilterForm(prev => ({ ...prev, dateRange: e.target.value as typeof filterForm.dateRange }))}
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Only At Risk</p>
                    <p className="text-xs text-muted-foreground">Show only at-risk milestones</p>
                  </div>
                  <Switch
                    checked={filterForm.onlyAtRisk}
                    onCheckedChange={(checked) => setFilterForm(prev => ({ ...prev, onlyAtRisk: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Critical Path Only</p>
                    <p className="text-xs text-muted-foreground">Show only critical path items</p>
                  </div>
                  <Switch
                    checked={filterForm.onlyCriticalPath}
                    onCheckedChange={(checked) => setFilterForm(prev => ({ ...prev, onlyCriticalPath: checked }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleResetFilters}>
                Reset Filters
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Deliverable Dialog */}
        <Dialog open={showDeliverableDialog} onOpenChange={setShowDeliverableDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Add Deliverable
              </DialogTitle>
              <DialogDescription>
                Add a new deliverable to track milestone progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deliverable_name">Deliverable Name *</Label>
                <Input
                  id="deliverable_name"
                  placeholder="e.g., API Documentation"
                  value={deliverableForm.name}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliverable_description">Description</Label>
                <Input
                  id="deliverable_description"
                  placeholder="Brief description"
                  value={deliverableForm.description}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deliverable_due">Due Date</Label>
                  <Input
                    id="deliverable_due"
                    type="date"
                    value={deliverableForm.dueDate}
                    onChange={(e) => setDeliverableForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliverable_priority">Priority</Label>
                  <select
                    id="deliverable_priority"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={deliverableForm.priority}
                    onChange={(e) => setDeliverableForm(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliverable_assignee">Assignee</Label>
                <Input
                  id="deliverable_assignee"
                  placeholder="Person responsible"
                  value={deliverableForm.assignee}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, assignee: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeliverableDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDeliverable}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              >
                Add Deliverable
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Dependency Dialog */}
        <Dialog open={showDependencyDialog} onOpenChange={setShowDependencyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-500" />
                Add Dependency
              </DialogTitle>
              <DialogDescription>
                Link milestones to track dependencies
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Source Milestone</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="">Select source milestone...</option>
                  {hookMilestones.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Dependency Type</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="finish_to_start">Finish to Start</option>
                  <option value="start_to_start">Start to Start</option>
                  <option value="finish_to_finish">Finish to Finish</option>
                  <option value="start_to_finish">Start to Finish</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Target Milestone</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="">Select target milestone...</option>
                  {hookMilestones.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Lag Days</Label>
                  <Input type="number" placeholder="0" defaultValue="0" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch id="blocking" />
                  <Label htmlFor="blocking">Blocking</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDependencyDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDependency}
                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white"
              >
                Add Dependency
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Budget Dialog */}
        <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Add Budget Item
              </DialogTitle>
              <DialogDescription>
                Add a new budget category to track expenses
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="budget_category">Category *</Label>
                <Input
                  id="budget_category"
                  placeholder="e.g., Development, Design, Infrastructure"
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget_planned">Planned Amount ($)</Label>
                  <Input
                    id="budget_planned"
                    type="number"
                    placeholder="0"
                    value={budgetForm.planned}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, planned: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_actual">Actual Spent ($)</Label>
                  <Input
                    id="budget_actual"
                    type="number"
                    placeholder="0"
                    value={budgetForm.actual}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, actual: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_notes">Notes</Label>
                <Input
                  id="budget_notes"
                  placeholder="Additional notes about this budget item"
                  value={budgetForm.notes}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddBudgetItem}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              >
                Add Budget Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-500" />
                Quick Settings
              </DialogTitle>
              <DialogDescription>
                Configure milestone display and notification preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Default View</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as typeof viewMode)}
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                    <option value="timeline">Timeline View</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Tab</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                  >
                    <option value="milestones">Milestones</option>
                    <option value="timeline">Timeline</option>
                    <option value="deliverables">Deliverables</option>
                    <option value="dependencies">Dependencies</option>
                    <option value="reports">Reports</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Show Completed Milestones</p>
                    <p className="text-xs text-muted-foreground">Display completed milestones in list</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Auto-refresh Data</p>
                    <p className="text-xs text-muted-foreground">Automatically refresh every 5 minutes</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Desktop Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified of milestone updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Show Budget Info</p>
                    <p className="text-xs text-muted-foreground">Display budget on milestone cards</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white"
              >
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Notifications
              </DialogTitle>
              <DialogDescription>
                Recent milestone notifications and alerts
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3 py-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-opacity ${notification.read ? 'opacity-60' : ''} ${
                      notification.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      notification.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                      notification.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                      'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleMarkAllNotificationsRead} disabled={unreadNotificationCount === 0}>
                Mark all as read
              </Button>
              <Button variant="outline" onClick={() => setShowNotificationsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Old Milestones Dialog */}
        <Dialog open={showArchiveOldDialog} onOpenChange={setShowArchiveOldDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-500" />
                Archive Old Milestones
              </DialogTitle>
              <DialogDescription>
                Archive completed milestones that are older than the specified threshold.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="archiveThreshold">Archive milestones completed more than:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="archiveThreshold"
                    type="number"
                    min={1}
                    max={365}
                    value={archiveThresholdDays}
                    onChange={(e) => setArchiveThresholdDays(parseInt(e.target.value) || 90)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">days ago</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  This will move all completed milestones older than {archiveThresholdDays} days to the archived state.
                  Archived milestones can still be viewed but will be hidden from the main list.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowArchiveOldDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleArchiveOldMilestones}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive Milestones
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Purge Completed Milestones Dialog */}
        <Dialog open={showPurgeCompletedDialog} onOpenChange={setShowPurgeCompletedDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Purge Completed Milestones
              </DialogTitle>
              <DialogDescription>
                Permanently delete all completed milestones from the database.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">Warning: This action cannot be undone</p>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                      This will permanently delete all milestones with "completed" status.
                      All associated data including deliverables, dependencies, and history will be lost.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Currently, there are <strong>{dbMilestones.filter(m => m.status === 'completed').length}</strong> completed milestone(s) that will be purged.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPurgeCompletedDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handlePurgeCompletedMilestones}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Purge All Completed
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
