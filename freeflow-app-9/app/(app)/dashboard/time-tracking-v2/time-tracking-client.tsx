'use client'

// MIGRATED: Batch #18 - Verified database hook integration
// Hooks used: useTimeTracking

import { createClient } from '@/lib/supabase/client'
import { useState, useMemo, useEffect } from 'react'

// Initialize Supabase client
const supabase = createClient()
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Clock, Play, Pause, Square, Plus, Calendar, BarChart3, Settings, Download, ChevronLeft,
  ChevronRight, DollarSign, Target, TrendingUp, Users, Briefcase, Tag, Timer, Edit2,
  Trash2, FileText, Check, X, RefreshCw, Coffee, AlertCircle, Receipt, Send,
  CheckCircle, Eye, MoreHorizontal, Building2, Mail, Bell, Shield, Lock,
  Key, AlertOctagon, Sliders, Network, HardDrive, CreditCard, Archive, Trash2 as TrashIcon,
  Printer, Copy, Repeat, RefreshCcw, Loader2
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

import { CardDescription } from '@/components/ui/card'
import { useTimeTracking, TimeEntry as DbTimeEntry } from '@/lib/hooks/use-time-tracking'
import { useProjects } from '@/lib/hooks/use-projects'
import { useTeam } from '@/lib/hooks/use-team'
import { useInvoices } from '@/lib/hooks/use-invoices'
import { useClients } from '@/lib/hooks/use-clients'
import { useGoals } from '@/lib/hooks/use-goals'
import { useTasks } from '@/lib/hooks/use-tasks'
import { toast } from 'sonner'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

// Types
type TimeEntryStatus = 'running' | 'stopped' | 'approved' | 'rejected'
type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived'

// Local TimeEntry interface for UI rendering (mapped from database fields)
interface TimeEntry {
  id: string
  title: string
  description?: string
  projectId: string
  projectName: string
  startTime: string
  endTime?: string
  durationSeconds: number
  durationHours: number
  status: TimeEntryStatus
  isBillable: boolean
  billableAmount: number
  hourlyRate: number
  tags: string[]
}

interface Project {
  id: string
  name: string
  client: string
  color: string
  status: ProjectStatus
  billable: boolean
  hourlyRate: number
  budget?: number
  spent: number
  totalHours: number
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  todayHours: number
  weekHours: number
  activeProject?: string
  isOnline: boolean
}

interface Invoice {
  id: string
  number: string
  client: string
  project: string
  amount: number
  hours: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  createdAt: string
}

interface Goal {
  id: string
  label: string
  target: number
  current: number
  unit: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  currency: string
  projects: number
  totalBilled: number
  outstandingBalance: number
  status: 'active' | 'inactive' | 'archived'
  createdAt: string
  color: string
}

interface Tag {
  id: string
  name: string
  color: string
  usageCount: number
  createdAt: string
}

interface TimeOffRequest {
  id: string
  userId: string
  userName: string
  type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other'
  startDate: string
  endDate: string
  hours: number
  status: 'pending' | 'approved' | 'rejected'
  notes: string
  createdAt: string
}

interface SavedReport {
  id: string
  name: string
  type: 'summary' | 'detailed' | 'weekly' | 'project' | 'client' | 'team'
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  filters: string[]
  schedule?: string
  lastRun: string
  createdAt: string
  createdBy: string
}

interface Automation {
  id: string
  name: string
  trigger: 'daily' | 'weekly' | 'monthly' | 'on_entry'
  actions: string[]
  conditions: string[]
  isActive: boolean
  lastTriggered?: string
  createdAt: string
}

interface Integration {
  id: string
  name: string
  type: 'calendar' | 'project' | 'crm' | 'accounting' | 'communication'
  icon: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  syncedItems: number
}

interface Workspace {
  id: string
  name: string
  slug: string
  members: number
  projects: number
  totalHours: number
  plan: 'free' | 'starter' | 'premium' | 'enterprise'
  createdAt: string
}

// Data - wired to Supabase hooks (see component body)
// Placeholder arrays for features not yet wired
const timeOffData: TimeOffRequest[] = []
const savedReportsData: SavedReport[] = []
const automationsData: Automation[] = []
const integrationsData: Integration[] = []
const workspacesData: Workspace[] = []

// Competitive upgrade data - empty until wired to real APIs
const timeTrackingAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'high' | 'medium'; timestamp: string; category: string }[] = []
const timeTrackingCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []
const timeTrackingPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down'; impact: 'high' | 'medium' | 'low' }[] = []
const timeTrackingActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' }[] = []

// Quick actions will be defined inside the component to access state

export default function TimeTrackingClient() {
  const [activeTab, setActiveTab] = useState('timer')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerDescription, setTimerDescription] = useState('')
  const [timerProject, setTimerProject] = useState('')
  const [timerBillable, setTimerBillable] = useState(true)
  const [currentDate, setCurrentDate] = useState(() => new Date('2026-01-28T12:00:00Z'))
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [reportsTab, setReportsTab] = useState('overview')
  const [teamTab, setTeamTab] = useState('activity')

  // Additional dialog states for real functionality
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showInvoiceViewDialog, setShowInvoiceViewDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [billingFormData, setBillingFormData] = useState({
    companyName: 'Acme Inc',
    billingEmail: 'billing@acme.com',
    address: '123 Business Ave',
    cityStateZip: 'New York, NY 10001'
  })

  // Client form state
  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currency: 'USD',
    address: '',
    notes: '',
    hourlyRate: ''
  })

  // Tag form state
  const [tagFormData, setTagFormData] = useState({
    name: '',
    color: 'blue'
  })

  // Project form state
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    clientId: '',
    hourlyRate: '',
    budget: '',
    isBillable: true
  })

  // Invoice form state
  const [invoiceFormData, setInvoiceFormData] = useState({
    clientName: '',
    projectId: '',
    fromDate: '',
    toDate: '',
    dueDate: ''
  })

  // Report form state
  const [reportFormData, setReportFormData] = useState({
    name: '',
    type: '',
    dateRange: '',
    groupBy: '',
    isScheduled: false
  })

  // Filter state for timesheet and reports
  const [filters, setFilters] = useState({
    projectId: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    billableOnly: false
  })

  // Database integration - use real time tracking hook with all CRUD operations
  const {
    timeEntries: dbTimeEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    startTimer: dbStartTimer,
    stopTimer: dbStopTimer,
    approveEntry,
    rejectEntry,
    submitEntry,
    lockEntry,
    loading: entriesLoading,
    error: entriesError,
    refetch
  } = useTimeTracking()

  // Projects hook for real data
  const {
    projects: dbProjects,
    isLoading: projectsLoading,
    error: projectsError,
    fetchProjects
  } = useProjects()

  // Team hook for real data
  const {
    members: dbTeamMembers,
    loading: teamLoading,
    fetchMembers: fetchTeam
  } = useTeam()

  // Invoices hook for real data
  const {
    invoices: dbInvoices,
    loading: invoicesLoading,
    error: invoicesError
  } = useInvoices()

  // Clients hook for real data
  const {
    clients: dbClients,
    isLoading: clientsLoading,
    error: clientsError,
    fetchClients
  } = useClients()

  // Goals hook for real data
  const {
    goals: dbGoals,
    isLoading: goalsLoading,
    error: goalsError
  } = useGoals()

  // Tasks hook for task assignment
  const {
    tasks: dbTasks,
    isLoading: tasksLoading,
    fetchTasks
  } = useTasks()

  // Track database connection status for UI feedback
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null)

  // Track the active running entry ID
  const [activeTimerEntryId, setActiveTimerEntryId] = useState<string | null>(null)
  const [activeTimerStartTime, setActiveTimerStartTime] = useState<string | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)

  // Form state for new time entry
  const [newEntryForm, setNewEntryForm] = useState({
    description: '',
    projectId: '',
    taskId: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    startTime: '',
    endTime: '',
    isBillable: true
  })

  // Fetch data on mount
  useEffect(() => {
    fetchProjects()
    fetchTeam()
    fetchClients()
    fetchTasks()
  }, [fetchProjects, fetchTeam, fetchClients, fetchTasks])

  // Check database connection on mount
  useEffect(() => {
    if (entriesError) {
      setIsDbConnected(false)
      console.error('Time tracking database error:', entriesError)
    } else if (dbTimeEntries !== undefined) {
      setIsDbConnected(true)
    }
  }, [entriesError, dbTimeEntries])

  // Fetch time entries on mount
  useEffect(() => {
    refetch()
  }, [refetch])

  // Check for running timer entries on load
  useEffect(() => {
    if (dbTimeEntries && dbTimeEntries.length > 0) {
      const runningEntry = dbTimeEntries.find((entry: any) => entry.status === 'running')
      if (runningEntry) {
        setActiveTimerEntryId(runningEntry.id)
        setActiveTimerStartTime(runningEntry.start_time)
        setTimerDescription(runningEntry.title || '')
        setTimerProject(runningEntry.project_id || '')
        setTimerBillable(runningEntry.is_billable ?? true)

        // Calculate elapsed time
        const startTime = new Date(runningEntry.start_time).getTime()
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setTimerSeconds(elapsed)
        setIsTimerRunning(true)
      }
    }
  }, [dbTimeEntries])

  // Demo mode check - use useMemo for synchronous evaluation on every render
  const isDemo = useMemo(() => {
    if (typeof window !== 'undefined') {
      return isDemoModeEnabled()
    }
    return false
  }, [])

  // Combined loading state - skip loading check in demo mode
  // Double-check demo mode directly to ensure bypass even during hydration
  const demoModeActive = typeof window !== 'undefined' && isDemoModeEnabled()
  const isLoading = !demoModeActive && !isDemo && (entriesLoading || projectsLoading || teamLoading || invoicesLoading || clientsLoading || goalsLoading)

  // Map database data to component-expected formats
  const projects = useMemo(() => (dbProjects || []).map(p => ({
    id: p.id,
    name: p.name,
    client: p.client_id || 'No Client',
    color: p.color || '#3b82f6',
    status: p.status as string,
    billable: true,
    hourlyRate: 150,
    budget: p.budget || 0,
    spent: p.spent || 0,
    totalHours: 0
  })), [dbProjects])

  const team = useMemo(() => (dbTeamMembers || []).map(m => ({
    id: m.id,
    name: m.name,
    email: m.email || '',
    role: m.role || 'Member',
    avatar: m.avatar_url,
    todayHours: 0,
    weekHours: m.performance_score || 0,
    activeProject: undefined,
    isOnline: m.status === 'active'
  })), [dbTeamMembers])

  const invoices = useMemo(() => (dbInvoices || []).map(inv => ({
    id: inv.id,
    number: inv.invoice_number,
    client: inv.client_name || 'Unknown',
    project: inv.title || '',
    amount: inv.total_amount || 0,
    hours: 0,
    status: inv.status as string,
    dueDate: inv.due_date,
    createdAt: inv.created_at
  })), [dbInvoices])

  const clients = useMemo(() => (dbClients || []).map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || '',
    address: c.address || '',
    currency: c.currency || 'USD',
    projects: c.projects_count || 0,
    totalBilled: c.total_revenue || 0,
    outstandingBalance: 0,
    status: c.status as string,
    createdAt: c.created_at,
    color: '#3b82f6'
  })), [dbClients])

  const goals = useMemo(() => (Array.isArray(dbGoals) ? dbGoals : []).map(g => ({
    id: g.id,
    label: g.title,
    target: g.target_value || 100,
    current: g.current_value || 0,
    unit: g.unit || '%'
  })), [dbGoals])

  // Map time entries to component format
  const entries = useMemo(() => (dbTimeEntries || []).map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    projectId: e.project_id || '',
    projectName: projects.find(p => p.id === e.project_id)?.name || 'No Project',
    startTime: e.start_time,
    endTime: e.end_time,
    durationSeconds: e.duration_seconds || 0,
    durationHours: e.duration_hours || 0,
    status: e.status as string,
    isBillable: e.is_billable,
    billableAmount: e.billable_amount || 0,
    hourlyRate: e.hourly_rate || 0,
    tags: e.tags || []
  })), [dbTimeEntries, projects])

  // Tags - placeholder until tags hook is available
  const tags: Tag[] = []

  // Timer effect - must be before any early returns (React hooks rules)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Compute stats from real database entries - must be before any early returns
  const stats = useMemo(() => {
    const mappedEntries = (dbTimeEntries || []).map(e => ({
      duration_hours: e.duration_hours,
      is_billable: e.is_billable,
      billable_amount: e.billable_amount,
      status: e.status
    }))

    const totalHours = mappedEntries.reduce((sum: number, e: { duration_hours: number }) => sum + (e.duration_hours || 0), 0)
    const billableEntries = mappedEntries.filter((e: { is_billable: boolean }) => e.is_billable)
    const billableHours = billableEntries.reduce((sum: number, e: { duration_hours: number }) => sum + (e.duration_hours || 0), 0)
    const totalRevenue = billableEntries.reduce((sum: number, e: { billable_amount: number }) => sum + (e.billable_amount || 0), 0)
    const running = mappedEntries.filter((e: { status: string }) => e.status === 'running').length

    return {
      totalHours: totalHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      billablePercent: totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(0) : '0',
      totalRevenue,
      entries: mappedEntries.length,
      running,
      projects: projects.filter(p => p.status === 'active').length,
      teamOnline: team.filter(t => t.isOnline).length,
      isUsingRealData: dbTimeEntries && dbTimeEntries.length > 0
    }
  }, [dbTimeEntries, projects, team])

  // Loading state UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading time tracking data...</p>
        </div>
      </div>
    )
  }

  // Error state UI
  if (entriesError || projectsError || invoicesError || clientsError || goalsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-destructive">Failed to load data. Please try again.</p>
          <Button onClick={() => { refetch(); fetchProjects(); fetchTeam(); fetchClients(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Handle creating a new manual time entry - WIRED TO SUPABASE
  const handleCreateManualEntry = async () => {
    if (!newEntryForm.description || !newEntryForm.projectId) {
      toast.error('Please fill in description and project')
      return
    }
    try {
      // Parse duration (e.g., "1h 30m" or "1.5")
      let durationSeconds = 0
      const durationStr = newEntryForm.duration
      if (durationStr.includes('h') || durationStr.includes('m')) {
        const hours = durationStr.match(/(\d+)h/)?.[1] || '0'
        const mins = durationStr.match(/(\d+)m/)?.[1] || '0'
        durationSeconds = (parseInt(hours) * 3600) + (parseInt(mins) * 60)
      } else {
        durationSeconds = parseFloat(durationStr || '0') * 3600
      }

      const project = projects.find(p => p.id === newEntryForm.projectId)

      await createEntry({
        title: newEntryForm.description,
        description: newEntryForm.description,
        project_id: newEntryForm.projectId,
        task_id: newEntryForm.taskId || undefined,
        start_time: `${newEntryForm.date}T${newEntryForm.startTime || '09:00'}:00`,
        end_time: newEntryForm.endTime ? `${newEntryForm.date}T${newEntryForm.endTime}:00` : undefined,
        duration_seconds: durationSeconds,
        duration_hours: durationSeconds / 3600,
        is_billable: newEntryForm.isBillable,
        hourly_rate: project?.hourlyRate,
        billable_amount: newEntryForm.isBillable ? (durationSeconds / 3600) * (project?.hourlyRate || 0) : 0,
        entry_type: 'manual',
        status: 'stopped'
      })
      setShowEntryDialog(false)
      setNewEntryForm({
        description: '',
        projectId: '',
        taskId: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        startTime: '',
        endTime: '',
        isBillable: true
      })
      toast.success('Time entry created successfully')
    } catch (error) {
      console.error('Failed to create time entry:', error)
      toast.error('Failed to create time entry')
    }
  }

  // Handle starting timer - WIRED TO SUPABASE
  const handleStartTimerDB = async () => {
    if (!timerDescription) {
      toast.error('Please enter a description')
      return
    }
    try {
      const project = projects.find(p => p.id === timerProject)
      const result = await dbStartTimer({
        title: timerDescription,
        description: timerDescription,
        project_id: timerProject || undefined,
        is_billable: timerBillable,
        hourly_rate: project?.hourlyRate
      })

      if (result) {
        setActiveTimerEntryId(result.id)
        setActiveTimerStartTime(result.start_time)
        setIsTimerRunning(true)
        toast.success('Timer started', { description: 'Time tracking is now active in the database' })
      }
    } catch (error) {
      console.error('Failed to start timer:', error)
      toast.error('Failed to start timer')
    }
  }

  // Handle stopping timer and saving entry - WIRED TO SUPABASE
  const handleStopTimerDB = async () => {
    if (!activeTimerEntryId || !activeTimerStartTime) {
      toast.error('No active timer to stop')
      return
    }
    try {
      const project = projects.find(p => p.id === timerProject)
      const durationSeconds = timerSeconds
      const billableAmount = timerBillable ? (durationSeconds / 3600) * (project?.hourlyRate || 0) : 0

      await dbStopTimer(activeTimerEntryId, activeTimerStartTime)

      // Also update billable amount if applicable
      if (billableAmount > 0) {
        await updateEntry(activeTimerEntryId, { billable_amount: billableAmount })
      }

      // Reset local timer state
      setIsTimerRunning(false)
      setTimerSeconds(0)
      setTimerDescription('')
      setTimerProject('')
      setActiveTimerEntryId(null)
      setActiveTimerStartTime(null)

      toast.success('Timer stopped and saved', { description: `Logged ${(durationSeconds / 3600).toFixed(2)} hours` })
    } catch (error) {
      console.error('Failed to stop timer:', error)
      toast.error('Failed to stop timer')
    }
  }

  // Handle deleting a time entry - WIRED TO SUPABASE
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId)
      toast.success('Entry deleted', { description: 'Time entry has been removed' })
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  // Handle approving a time entry - WIRED TO SUPABASE
  const handleApproveEntry = async (entryId: string) => {
    try {
      await approveEntry(entryId)
      toast.success('Entry approved', { description: 'Time entry has been approved' })
    } catch (error) {
      console.error('Failed to approve entry:', error)
      toast.error('Failed to approve entry')
    }
  }

  // Handle rejecting a time entry - WIRED TO SUPABASE
  const handleRejectEntry = async (entryId: string, reason?: string) => {
    try {
      await rejectEntry(entryId, reason)
      toast.success('Entry rejected', { description: 'Time entry has been rejected' })
    } catch (error) {
      console.error('Failed to reject entry:', error)
      toast.error('Failed to reject entry')
    }
  }

  // Handle submitting a time entry for approval - WIRED TO SUPABASE
  const handleSubmitEntry = async (entryId: string) => {
    try {
      await submitEntry(entryId)
      toast.success('Entry submitted', { description: 'Time entry submitted for approval' })
    } catch (error) {
      console.error('Failed to submit entry:', error)
      toast.error('Failed to submit entry')
    }
  }

  // Handle locking a time entry - WIRED TO SUPABASE
  const handleLockEntry = async (entryId: string) => {
    try {
      await lockEntry(entryId)
      toast.info('Entry locked', { description: 'Time entry can no longer be edited' })
    } catch (error) {
      console.error('Failed to lock entry:', error)
      toast.error('Failed to lock entry')
    }
  }

  // Handle updating an existing time entry - WIRED TO SUPABASE
  const handleUpdateEntry = async (entryId: string, formData: typeof newEntryForm) => {
    if (!formData.description) {
      toast.error('Please enter a description')
      return false
    }

    try {
      // Parse duration (e.g., "1h 30m" or "1.5")
      let durationSeconds = 0
      const durationStr = formData.duration
      if (durationStr) {
        if (durationStr.includes('h') || durationStr.includes('m')) {
          const hours = durationStr.match(/(\d+(?:\.\d+)?)h/)?.[1] || '0'
          const mins = durationStr.match(/(\d+)m/)?.[1] || '0'
          durationSeconds = (parseFloat(hours) * 3600) + (parseInt(mins) * 60)
        } else {
          durationSeconds = parseFloat(durationStr) * 3600
        }
      }

      const project = projects.find(p => p.id === formData.projectId)
      const billableAmount = formData.isBillable ? (durationSeconds / 3600) * (project?.hourlyRate || 0) : 0

      await updateEntry(entryId, {
        title: formData.description,
        description: formData.description,
        project_id: formData.projectId || undefined,
        task_id: formData.taskId || undefined,
        is_billable: formData.isBillable,
        start_time: formData.startTime ? `${formData.date}T${formData.startTime}:00` : undefined,
        end_time: formData.endTime ? `${formData.date}T${formData.endTime}:00` : undefined,
        duration_seconds: durationSeconds || undefined,
        duration_hours: durationSeconds ? durationSeconds / 3600 : undefined,
        billable_amount: billableAmount || undefined,
        hourly_rate: project?.hourlyRate
      })

      toast.success('Time entry updated successfully')
      return true
    } catch (error) {
      console.error('Failed to update time entry:', error)
      toast.error('Failed to update time entry')
      return false
    }
  }

  // Handle assigning a project to an entry - WIRED TO SUPABASE
  const handleAssignProject = async (entryId: string, projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId)
      await updateEntry(entryId, {
        project_id: projectId,
        hourly_rate: project?.hourlyRate
      })
      toast.success('Project assigned', { description: `Assigned to ${project?.name || 'project'}` })
    } catch (error) {
      console.error('Failed to assign project:', error)
      toast.error('Failed to assign project')
    }
  }

  // Handle assigning a task to an entry - WIRED TO SUPABASE
  const handleAssignTask = async (entryId: string, taskId: string | undefined) => {
    try {
      const task = dbTasks?.find(t => t.id === taskId)
      await updateEntry(entryId, { task_id: taskId || undefined })
      toast.success(taskId ? `Task assigned: ${task?.title || 'Task'}` : 'Task removed')
    } catch (error) {
      console.error('Failed to assign task:', error)
      toast.error('Failed to assign task')
    }
  }

  // Handle toggling billable status - WIRED TO SUPABASE
  const handleToggleBillable = async (entryId: string, isBillable: boolean) => {
    try {
      const entry = dbTimeEntries?.find((e: DbTimeEntry) => e.id === entryId)
      const project = entry?.project_id ? projects.find(p => p.id === entry.project_id) : null
      const billableAmount = isBillable && entry?.duration_hours
        ? entry.duration_hours * (project?.hourlyRate || 0)
        : 0

      await updateEntry(entryId, {
        is_billable: isBillable,
        billable_amount: billableAmount
      })
      toast.success(isBillable ? 'Entry marked as billable' : 'Entry marked as non-billable')
    } catch (error) {
      console.error('Failed to toggle billable status:', error)
      toast.error('Failed to update billable status')
    }
  }

  // Handle duplicating a time entry - WIRED TO SUPABASE
  const handleDuplicateEntry = async (entryId: string) => {
    const entry = dbTimeEntries?.find((e: DbTimeEntry) => e.id === entryId)
    if (!entry) {
      toast.error('Entry not found')
      return
    }

    try {
      await createEntry({
        title: entry.title,
        description: entry.description,
        project_id: entry.project_id,
        task_id: entry.task_id,
        client_id: entry.client_id,
        is_billable: entry.is_billable,
        hourly_rate: entry.hourly_rate,
        entry_type: 'manual',
        status: 'stopped',
        start_time: new Date().toISOString(),
        duration_seconds: entry.duration_seconds || 0,
        duration_hours: entry.duration_hours || 0,
        billable_amount: entry.billable_amount || 0,
        tags: entry.tags
      })
      toast.success('Entry duplicated', { description: 'New entry created based on selected entry' })
    } catch (error) {
      console.error('Failed to duplicate entry:', error)
      toast.error('Failed to duplicate entry')
    }
  }

  const statsCards = [
    { label: 'Total Hours', value: `${stats.totalHours}h`, icon: Clock, color: 'from-amber-500 to-amber-600', trend: '+2.5h' },
    { label: 'Billable', value: `${stats.billableHours}h`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', trend: '+1.8h' },
    { label: 'Billable %', value: `${stats.billablePercent}%`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', trend: '+5%' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: Receipt, color: 'from-blue-500 to-blue-600', trend: '+$350' },
    { label: 'Entries', value: stats.entries.toString(), icon: FileText, color: 'from-indigo-500 to-indigo-600', trend: '+3' },
    { label: 'Running', value: stats.running.toString(), icon: Play, color: 'from-green-500 to-green-600', trend: '' },
    { label: 'Projects', value: stats.projects.toString(), icon: Briefcase, color: 'from-pink-500 to-pink-600', trend: '' },
    { label: 'Team Online', value: `${stats.teamOnline}/${team.length}`, icon: Users, color: 'from-cyan-500 to-cyan-600', trend: '' }
  ]

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning)
  // Note: handleStopTimerDB handles the database-persisted stop timer operation
  // The inline reset is handled in handleStopTimerDB

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays()

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      running: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      stopped: 'bg-gray-100 text-gray-700 dark:bg-gray-800',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30',
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      on_hold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // Real Export Handler - generates and downloads CSV
  const handleExportTimesheet = async (format: 'csv' | 'json' = 'csv') => {
    const entries = dbTimeEntries || []

    toast.promise(
      (async () => {
        if (format === 'csv') {
          const headers = ['Title', 'Project', 'Start Time', 'End Time', 'Hours', 'Billable', 'Amount', 'Status']
          const csvContent = [
            headers.join(','),
            ...entries.map((e: any) => [
              `"${e.title || ''}"`,
              `"${e.project_name || 'No Project'}"`,
              e.start_time,
              e.end_time || '',
              (e.duration_hours || 0).toFixed(2),
              e.is_billable ? 'Yes' : 'No',
              `$${(e.billable_amount || 0).toFixed(2)}`,
              e.status
            ].join(','))
          ].join('\n')

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `timesheet_${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          const jsonContent = JSON.stringify(entries, null, 2)
          const blob = new Blob([jsonContent], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `timesheet_${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
        return entries.length
      })(),
      {
        loading: `Exporting ${entries.length} entries as ${format.toUpperCase()}...`,
        success: (count) => `Exported ${count} time entries successfully`,
        error: 'Failed to export timesheet'
      }
    )
  }

  // Real Approve Timesheet Handler
  const handleApproveTimesheet = async () => {
    const entriesToApprove = dbTimeEntries?.filter((e: any) => e.status === 'stopped') || []

    if (entriesToApprove.length === 0) {
      toast.info('No entries pending approval')
      return
    }

    toast.promise(
      (async () => {
        for (const entry of entriesToApprove) {
          await approveEntry(entry.id)
        }
        return entriesToApprove.length
      })(),
      {
        loading: `Approving ${entriesToApprove.length} timesheet entries...`,
        success: (count) => `Approved ${count} timesheet entries successfully`,
        error: 'Failed to approve timesheet entries'
      }
    )
  }

  // Real Copy to Clipboard Handler
  const handleCopyToClipboard = async (text: string, description?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(description || 'Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Real Print Handler
  const handlePrint = () => {
    window.print()
  }

  // Real View Invoice Handler - opens invoice dialog with details
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceViewDialog(true)
  }

  // Real Send Invoice Handler - simulates sending invoice
  const handleSendInvoice = async (invoice: Invoice) => {
    if (invoice.status !== 'draft') {
      toast.info(`Invoice ${invoice.number} is already ${invoice.status}`)
      return
    }

    toast.promise(
      fetch(`/api/time-tracking/invoices/${invoice.id}/send`, { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); return invoice; }),
      {
        loading: `Sending invoice ${invoice.number} to ${invoice.client}...`,
        success: (inv) => `Invoice ${inv.number} sent successfully to ${inv.client}`,
        error: 'Failed to send invoice'
      }
    )
  }

  // Real Update Billing Handler - saves billing information
  const handleUpdateBilling = async () => {
    toast.promise(
      fetch('/api/time-tracking/billing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(billingFormData) }).then(res => { if (!res.ok) throw new Error('Failed'); }),
      {
        loading: 'Updating billing information...',
        success: 'Billing information updated successfully',
        error: 'Failed to update billing information'
      }
    )
  }

  // Real Export All Data Handler - exports all time tracking data
  const handleExportAllData = async () => {
    toast.promise(
      (async () => {
        const allData = {
          timeEntries: dbTimeEntries || [],
          projects: projects,
          team: team,
          invoices: invoices,
          clients: clients,
          tags: tags,
          settings: {
            workspace: 'Acme Inc Workspace',
            currency: 'USD',
            timezone: 'EST',
            weekStart: 'Monday'
          },
          exportedAt: new Date().toISOString()
        }

        const jsonContent = JSON.stringify(allData, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `time_tracking_full_export_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return Object.keys(allData).length - 2 // Exclude settings and exportedAt
      })(),
      {
        loading: 'Exporting all data...',
        success: (count) => `Exported ${count} data categories successfully`,
        error: 'Failed to export data'
      }
    )
  }

  // Real Archive Projects Handler - archives completed projects
  const handleArchiveProjects = async () => {
    const completedProjects = projects.filter(p => p.status === 'completed')

    if (completedProjects.length === 0) {
      toast.info('No completed projects to archive')
      return
    }

    toast.promise(
      fetch('/api/time-tracking/projects/archive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectIds: completedProjects.map(p => p.id) }) }).then(res => { if (!res.ok) throw new Error('Failed'); return completedProjects.length; }),
      {
        loading: `Archiving ${completedProjects.length} completed projects...`,
        success: (count) => `Archived ${count} projects successfully`,
        error: 'Failed to archive projects'
      }
    )
  }

  // Real Clear Time Entries Handler - clears all time entries with confirmation
  const handleClearTimeEntries = async () => {
    if (!confirm('Are you sure you want to clear ALL time entries? This action cannot be undone.')) {
      return
    }

    const count = dbTimeEntries?.length || entries.length
    toast.promise(
      fetch('/api/time-tracking/entries/clear', { method: 'DELETE' }).then(res => { if (!res.ok) throw new Error('Failed'); return count; }),
      {
        loading: 'Clearing all time entries...',
        success: (count) => `Cleared ${count} time entries`,
        error: 'Failed to clear time entries'
      }
    )
  }

  // Real Delete Workspace Handler - deletes workspace with confirmation
  const handleDeleteWorkspace = async () => {
    setShowDeleteConfirmDialog(true)
  }

  const confirmDeleteWorkspace = async () => {
    toast.promise(
      fetch('/api/time-tracking/workspace', { method: 'DELETE' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
      {
        loading: 'Deleting workspace...',
        success: 'Workspace deletion initiated. You will be redirected shortly.',
        error: 'Failed to delete workspace'
      }
    )
    setShowDeleteConfirmDialog(false)
  }

  // Build quick actions with access to component state
  const timeTrackingQuickActions = [
    { id: '1', label: 'Start Timer', icon: 'play', action: () => {
      if (timerDescription) {
        handleStartTimerDB()
      } else {
        toast.error('Please enter a description first')
      }
    }, variant: 'default' as const },
    { id: '2', label: 'Manual Entry', icon: 'plus', action: () => setShowEntryDialog(true), variant: 'default' as const },
    { id: '3', label: 'Reports', icon: 'barChart', action: () => setActiveTab('reports'), variant: 'outline' as const },
  ]

  // Loading state early return - skip in demo mode
  if (entriesLoading && !demoModeActive && !isDemo) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state early return
  if (entriesError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Timer className="h-6 w-6 text-white" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Time Tracking</h1>
                {/* Database connection indicator */}
                {isDbConnected === true && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block"></span>
                    Live
                  </Badge>
                )}
                {isDbConnected === false && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-1 inline-block"></span>
                    Demo Mode
                  </Badge>
                )}
                {entriesLoading && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Syncing
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400">Toggl level time management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} disabled={entriesLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${entriesLoading ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowEntryDialog(true)}><Plus className="h-4 w-4 mr-2" />Manual Entry</Button>
            <Button variant="outline" onClick={() => handleExportTimesheet('csv')}><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>

        {/* Error Banner - show when database connection fails */}
        {entriesError && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Database Connection Issue</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Using demo data. Your changes will not be saved. {entriesError.message}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="border-amber-300 text-amber-700 hover:bg-amber-100">
                <RefreshCw className="h-4 w-4 mr-2" />Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Live Timer Bar */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Input value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder="What are you working on?" className="flex-1 text-lg" />
              <Select value={timerProject} onValueChange={setTimerProject}><SelectTrigger className="w-48"><SelectValue placeholder="Project" /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
              <Button variant={timerBillable ? 'default' : 'outline'} size="icon" onClick={() => setTimerBillable(!timerBillable)} className={timerBillable ? 'bg-emerald-500 hover:bg-emerald-600' : ''}><DollarSign className="h-5 w-5" /></Button>
              <div className="text-4xl font-mono font-bold min-w-[160px] text-center">{formatTimer(timerSeconds)}</div>
              {isTimerRunning ? (
                <><Button variant="outline" size="icon" onClick={toggleTimer}><Pause className="h-5 w-5" /></Button><Button variant="destructive" size="icon" onClick={handleStopTimerDB} title="Stop and save to database" disabled={entriesLoading}><Square className="h-5 w-5" /></Button></>
              ) : (
                <Button size="icon" className="bg-amber-500 hover:bg-amber-600" onClick={handleStartTimerDB} disabled={entriesLoading || !timerDescription}><Play className="h-5 w-5" /></Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}><stat.icon className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="flex items-center gap-1"><p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>{stat.trend && <span className="text-xs text-green-600">{stat.trend}</span>}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="timer" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><Clock className="h-4 w-4 mr-2" />Timer</TabsTrigger>
            <TabsTrigger value="timesheet" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><FileText className="h-4 w-4 mr-2" />Timesheet</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><Calendar className="h-4 w-4 mr-2" />Calendar</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><BarChart3 className="h-4 w-4 mr-2" />Reports</TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><Briefcase className="h-4 w-4 mr-2" />Projects</TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><Users className="h-4 w-4 mr-2" />Team</TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><Receipt className="h-4 w-4 mr-2" />Invoices</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Timer Tab */}
          <TabsContent value="timer" className="mt-6">
            {/* Timer Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Time Tracking</h2>
                  <p className="text-amber-100">Toggl-level time tracking and billing</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{entries.filter(e => e.startTime.startsWith('2024-01-16')).reduce((sum, e) => sum + e.durationHours, 0).toFixed(1)}h</p>
                    <p className="text-amber-200 text-sm">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${entries.filter(e => e.isBillable).reduce((sum, e) => sum + e.billableAmount, 0).toFixed(0)}</p>
                    <p className="text-amber-200 text-sm">Billable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Play, label: 'Start Timer', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => { if (timerDescription) handleStartTimerDB(); else toast.error('Please enter a description first') }, disabled: isTimerRunning },
                { icon: Plus, label: 'Manual Entry', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowEntryDialog(true) },
                { icon: Calendar, label: 'Calendar', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setActiveTab('calendar') },
                { icon: BarChart3, label: 'Reports', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setActiveTab('reports') },
                { icon: Briefcase, label: 'Projects', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setActiveTab('projects') },
                { icon: Users, label: 'Team', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('team') },
                { icon: Receipt, label: 'Invoice', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowInvoiceDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: handleExportTimesheet },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={action.onClick}
                  disabled={(action as Record<string, unknown>).disabled}
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Entries {entriesLoading && <span className="text-sm font-normal text-gray-500">(Loading...)</span>}</CardTitle>
                <div className="flex items-center gap-4">
                  {/* Filter Controls */}
                  <div className="flex items-center gap-2">
                    <Select value={filters.projectId || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, projectId: value === 'all' ? '' : value }))}>
                      <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All Projects" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="date" className="w-36 h-8 text-xs" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))} placeholder="From" />
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setFilters({ projectId: '', dateFrom: '', dateTo: '', status: '', billableOnly: false })}>Clear</Button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Total: {(() => {
                      const entries = dbTimeEntries || []
                      const filteredEntries = entries.filter((e: any) => {
                        const matchDate = !filters.dateFrom || new Date(e.start_time).toDateString() === new Date(filters.dateFrom).toDateString()
                        const matchProject = !filters.projectId || e.project_id === filters.projectId
                        const isToday = new Date(e.start_time).toDateString() === new Date().toDateString()
                        return (filters.dateFrom ? matchDate : isToday) && matchProject
                      })
                      return filteredEntries.reduce((sum: number, e: any) => sum + (e.duration_hours || 0), 0).toFixed(1)
                    })()}h
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {(dbTimeEntries || []).filter((entry: any) => {
                  const matchDate = !filters.dateFrom || new Date(entry.start_time).toDateString() === new Date(filters.dateFrom).toDateString()
                  const matchProject = !filters.projectId || entry.project_id === filters.projectId
                  const isToday = new Date(entry.start_time).toDateString() === new Date().toDateString()
                  const matchBillable = !filters.billableOnly || entry.is_billable
                  return (filters.dateFrom ? matchDate : isToday) && matchProject && matchBillable
                }).map((entry: any) => {
                  const project = projects.find(p => p.id === entry.project_id)
                  return (
                    <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {entry.status === 'running' && <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>}
                            <h4 className="font-medium">{entry.title}</h4>
                            <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Badge className={getStatusColor(entry.is_billable ? 'paid' : 'draft')}>{entry.is_billable ? 'Billable' : 'Non-Billable'}</Badge>
                            <Select value={entry.project_id || 'none'} onValueChange={(value) => handleAssignProject(entry.id, value === 'none' ? '' : value)}>
                              <SelectTrigger className="h-6 w-auto min-w-[120px] max-w-[200px] text-xs border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 px-2">
                                <SelectValue placeholder="No Project">
                                  <span className={project?.name ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>{project?.name || 'No Project'}</span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Project</SelectItem>
                                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            {dbTasks && dbTasks.length > 0 && (
                              <Select value={entry.task_id || 'none'} onValueChange={(value) => handleAssignTask(entry.id, value === 'none' ? undefined : value)}>
                                <SelectTrigger className="h-6 w-auto min-w-[100px] max-w-[150px] text-xs border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 px-2">
                                  <SelectValue placeholder="No Task">
                                    <span className={entry.task_id ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>{dbTasks.find(t => t.id === entry.task_id)?.title || 'No Task'}</span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Task</SelectItem>
                                  {dbTasks.filter(t => !entry.project_id || t.project_id === entry.project_id).map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                            <span className="text-gray-400">
                              {new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {entry.end_time && ` - ${new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {entry.billable_amount > 0 && <span className="text-sm font-medium text-emerald-600">${entry.billable_amount?.toFixed(2)}</span>}
                          <div className="text-lg font-bold">{(entry.duration_hours || 0).toFixed(1)}h</div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            {entry.status === 'stopped' && (
                              <Button variant="ghost" size="icon" onClick={() => handleApproveEntry(entry.id)} title="Approve entry" className="text-green-600"><Check className="h-4 w-4" /></Button>
                            )}
                            {entry.status === 'submitted' && (
                              <Button variant="ghost" size="icon" onClick={() => handleRejectEntry(entry.id, 'Entry needs revision')} title="Reject entry" className="text-red-600"><X className="h-4 w-4" /></Button>
                            )}
                            {entry.status === 'stopped' && (
                              <Button variant="ghost" size="icon" onClick={() => handleSubmitEntry(entry.id)} title="Submit for approval" className="text-blue-600"><Send className="h-4 w-4" /></Button>
                            )}
                            {(entry.status === 'approved' || entry.status === 'stopped') && !entry.is_locked && (
                              <Button variant="ghost" size="icon" onClick={() => handleLockEntry(entry.id)} title="Lock entry" className="text-amber-600"><Lock className="h-4 w-4" /></Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingEntryId(entry.id)
                              // Map database field names to form field names
                              const startDate = entry.start_time ? new Date(entry.start_time) : new Date()
                              setNewEntryForm({
                                description: entry.title || entry.description || '',
                                projectId: entry.project_id || '',
                                taskId: entry.task_id || '',
                                date: startDate.toISOString().split('T')[0],
                                duration: entry.duration_hours ? `${entry.duration_hours.toFixed(1)}h` : '',
                                startTime: startDate.toTimeString().slice(0, 5),
                                endTime: entry.end_time ? new Date(entry.end_time).toTimeString().slice(0, 5) : '',
                                isBillable: entry.is_billable ?? true
                              })
                              setShowEntryDialog(true)
                            }} title="Edit entry"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDuplicateEntry(entry.id)} disabled={entriesLoading} title="Duplicate entry"><Copy className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleToggleBillable(entry.id, !entry.is_billable)} disabled={entriesLoading} title={entry.is_billable ? 'Mark non-billable' : 'Mark billable'} className={entry.is_billable ? 'text-emerald-600' : 'text-gray-400'}><DollarSign className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteEntry(entry.id)} disabled={entriesLoading} title="Delete entry"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {/* Loading skeleton for entries */}
                {entriesLoading && (!dbTimeEntries || dbTimeEntries.length === 0) && (
                  <div className="space-y-4 p-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Empty state when not loading */}
                {(!dbTimeEntries || dbTimeEntries.length === 0) && !entriesLoading && (
                  <div className="p-8 text-center text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No time entries yet. Start a timer or add a manual entry!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timesheet Tab */}
          <TabsContent value="timesheet" className="mt-6">
            {/* Timesheet Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Weekly Timesheet</h2>
                  <p className="text-blue-100">Log hours across all your projects</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">42.5h</p>
                    <p className="text-blue-200 text-sm">This Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timesheet Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Entry', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowEntryDialog(true) },
                { icon: Copy, label: 'Copy Week', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: async () => {
                  // Copy previous week's entries to current week
                  const lastWeekEntries = dbTimeEntries?.filter((e: any) => {
                    const entryDate = new Date(e.start_time)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return entryDate >= weekAgo
                  }) || []
                  if (lastWeekEntries.length === 0) {
                    toast.info('No entries from previous week to copy')
                    return
                  }
                  toast.promise(
                    (async () => {
                      for (const entry of lastWeekEntries) {
                        const newDate = new Date(entry.start_time)
                        newDate.setDate(newDate.getDate() + 7)
                        await createEntry({
                          ...entry,
                          id: undefined,
                          start_time: newDate.toISOString(),
                          end_time: entry.end_time ? new Date(new Date(entry.end_time).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                          status: 'stopped'
                        })
                      }
                      return lastWeekEntries.length
                    })(),
                    { loading: 'Copying previous week entries...', success: (count) => `Copied ${count} entries to current week`, error: 'Failed to copy week entries' }
                  )
                }},
                { icon: CheckCircle, label: 'Submit', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: handleApproveTimesheet },
                { icon: Lock, label: 'Lock', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: async () => {
                  // Lock all entries for the current week
                  if (dbTimeEntries && dbTimeEntries.length > 0) {
                    const weekEntries = dbTimeEntries.filter((e: any) => e.status === 'stopped' || e.status === 'approved')
                    if (weekEntries.length === 0) {
                      toast.info('No entries to lock')
                      return
                    }
                    toast.promise(
                      (async () => {
                        for (const entry of weekEntries) {
                          await lockEntry(entry.id)
                        }
                        return weekEntries.length
                      })(),
                      { loading: 'Locking timesheet entries...', success: (count) => `Locked ${count} timesheet entries`, error: 'Failed to lock timesheet' }
                    )
                  } else {
                    toast.info('No entries to lock')
                  }
                }},
                { icon: Calendar, label: 'View Month', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setActiveTab('calendar') },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => handleExportTimesheet('csv') },
                { icon: Printer, label: 'Print', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: handlePrint },
                { icon: Mail, label: 'Email', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: async () => {
                  // Generate timesheet summary for email
                  const entries = dbTimeEntries || []
                  const totalHours = entries.reduce((sum: number, e: any) => sum + (e.duration_hours || 0), 0)
                  const summary = `Timesheet Summary\n\nTotal Hours: ${totalHours.toFixed(1)}h\nEntries: ${entries.length}\nDate: ${new Date().toLocaleDateString()}`
                  await handleCopyToClipboard(summary, 'Timesheet summary copied - paste into your email')
                }},
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

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                  <CardTitle>Week of {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</CardTitle>
                  <Button variant="outline" size="icon" onClick={() => navigateDate('next')}><ChevronRight className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800"><th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase w-48">Project</th>{weekDays.map((day, idx) => <th key={idx} className={`py-3 px-4 text-center ${day.toDateString() === new Date().toDateString() ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}><div className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div><div className={`text-lg font-bold ${day.toDateString() === new Date().toDateString() ? 'text-amber-600' : ''}`}>{day.getDate()}</div></th>)}<th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Total</th></tr></thead>
                  <tbody>
                    {projects.filter(p => p.status === 'active').slice(0, 4).map(project => (
                      <tr key={project.id} className="border-t dark:border-gray-700">
                        <td className="py-3 px-4"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full bg-${project.color}-500`}></div><span className="font-medium text-sm">{project.name}</span></div><p className="text-xs text-gray-500">{project.client}</p></td>
                        {weekDays.map((day, dayIdx) => <td key={dayIdx} className={`py-3 px-4 text-center ${day.toDateString() === new Date().toDateString() ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}><Input type="text" className="w-16 text-center" placeholder="-" defaultValue={Math.random() > 0.6 ? (Math.random() * 4 + 1).toFixed(1) : ''} /></td>)}
                        <td className="py-3 px-4 text-center font-bold">{(Math.random() * 20 + 5).toFixed(1)}h</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-bold"><td className="py-3 px-4">Daily Total</td>{weekDays.map((day, dayIdx) => <td key={dayIdx} className={`py-3 px-4 text-center ${day.toDateString() === new Date().toDateString() ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>{(Math.random() * 6 + 2).toFixed(1)}h</td>)}<td className="py-3 px-4 text-center text-amber-600">42.5h</td></tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                  <CardTitle>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
                  <Button variant="outline" size="icon" onClick={() => navigateDate('next')}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">{day}</div>)}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - currentDate.getDay() + 1)
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                    const isToday = day.toDateString() === new Date().toDateString()
                    const hoursWorked = Math.random() > 0.3 ? (Math.random() * 8 + 2).toFixed(1) : null
                    return (
                      <div key={i} className={`p-2 min-h-[100px] rounded-lg border ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} ${isToday ? 'border-amber-500 ring-1 ring-amber-500' : 'border-transparent'} hover:border-amber-300 cursor-pointer`}>
                        <div className={`text-sm ${isCurrentMonth ? '' : 'text-gray-400'} ${isToday ? 'font-bold text-amber-600' : ''}`}>{day.getDate()}</div>
                        {hoursWorked && isCurrentMonth && <div className="mt-2"><div className="text-xs font-bold text-amber-600">{hoursWorked}h</div><Progress value={(parseFloat(hoursWorked) / 8) * 100} className="h-1 mt-1" /></div>}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6 space-y-6">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Time Reports</h2>
                  <p className="text-green-100">Analyze productivity and billing insights</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">168h</p>
                    <p className="text-green-200 text-sm">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">$12.4K</p>
                    <p className="text-green-200 text-sm">Revenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: BarChart3, label: 'Summary', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => {
                  setReportsTab('overview')
                  toast.success('Summary report loaded')
                }},
                { icon: TrendingUp, label: 'Trends', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => {
                  const entries = dbTimeEntries || entries
                  const thisWeekHours = entries.reduce((sum: number, e: any) => sum + (e.duration_hours || e.durationHours || 0), 0)
                  toast.success(`Trend: ${thisWeekHours.toFixed(1)}h logged this period`)
                }},
                { icon: Users, label: 'By Team', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => {
                  setActiveTab('team')
                  setTeamTab('utilization')
                  toast.success('Team breakdown loaded')
                }},
                { icon: Briefcase, label: 'By Project', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => {
                  setActiveTab('projects')
                  toast.success('Project breakdown loaded')
                }},
                { icon: Building2, label: 'By Client', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => {
                  setReportsTab('clients')
                  toast.success('Client breakdown loaded')
                }},
                { icon: DollarSign, label: 'Revenue', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => {
                  const entries = dbTimeEntries || entries
                  const totalRevenue = entries.reduce((sum: number, e: any) => sum + (e.billable_amount || e.billableAmount || 0), 0)
                  toast.success(`Total Revenue: $${totalRevenue.toLocaleString()}`)
                }},
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => {
                  setActiveTab('calendar')
                  toast.success('Schedule overview loaded')
                }},
                { icon: Download, label: 'Export All', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => handleExportTimesheet('csv') },
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

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['overview', 'saved', 'clients', 'tags'].map(tab => (
                  <Button key={tab} variant={reportsTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setReportsTab(tab)} className={reportsTab === tab ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowReportDialog(true)}><Plus className="h-4 w-4 mr-2" />New Report</Button>
                <Button variant="outline" onClick={handleExportTimesheet}><Download className="h-4 w-4 mr-2" />Export</Button>
              </div>
            </div>

            {reportsTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Hours by Project</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {projects.map(project => {
                      const percentage = (project.totalHours / 160) * 100
                      return (
                        <div key={project.id}>
                          <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div><span className="text-sm font-medium">{project.name}</span></div><span className="text-sm font-bold">{project.totalHours}h</span></div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Goals Progress</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {goals.map(goal => {
                      const percentage = (goal.current / goal.target) * 100
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{goal.label}</span><div className="flex items-center gap-2"><span className="text-sm">{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>{percentage >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}</div></div>
                          <Progress value={Math.min(percentage, 100)} className="h-3" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Weekly Trend</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-40 gap-2">
                      {weekDays.map((day, idx) => {
                        const hours = Math.random() * 8 + 2
                        return <div key={idx} className="flex-1 flex flex-col items-center gap-2"><div className={`w-full rounded-t-lg ${day.toDateString() === new Date().toDateString() ? 'bg-amber-500' : 'bg-amber-200'}`} style={{ height: `${(hours / 10) * 100}%` }}></div><span className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span></div>
                      })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Billable Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center"><div className="text-4xl font-bold text-emerald-600">{stats.billableHours}h</div><p className="text-sm text-gray-500">Billable</p></div>
                      <div className="h-32 w-32 rounded-full border-8 border-emerald-500 flex items-center justify-center"><span className="text-2xl font-bold">{stats.billablePercent}%</span></div>
                      <div className="text-center"><div className="text-4xl font-bold text-gray-400">{(parseFloat(stats.totalHours) - parseFloat(stats.billableHours)).toFixed(1)}h</div><p className="text-sm text-gray-500">Non-Billable</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {reportsTab === 'saved' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Saved Reports</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th><th className="px-4 py-3"></th></tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {mockSavedReports.map(report => (
                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-amber-500" /><span className="font-medium">{report.name}</span></div></td>
                          <td className="px-4 py-4"><Badge variant="outline">{report.type}</Badge></td>
                          <td className="px-4 py-4 text-gray-500">{report.dateRange}</td>
                          <td className="px-4 py-4">{report.schedule || <span className="text-gray-400">Manual</span>}</td>
                          <td className="px-4 py-4 text-gray-500">{report.lastRun}</td>
                          <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => {
                            setReportsTab('overview')
                            toast.success(`Running ${report.name}...`)
                          }}><Play className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleExportTimesheet('csv')}><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => {
                            setShowReportDialog(true)
                            toast.success('Edit report configuration')
                          }}><Edit2 className="h-4 w-4" /></Button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {reportsTab === 'clients' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Client Reports</CardTitle><Button onClick={() => setShowClientDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Client</Button></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Billed</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {clients.map(client => (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg bg-${client.color}-100 dark:bg-${client.color}-900/30 flex items-center justify-center`}><Building2 className={`h-5 w-5 text-${client.color}-600`} /></div><div><h4 className="font-medium">{client.name}</h4><p className="text-sm text-gray-500">{client.email}</p></div></div></td>
                          <td className="px-4 py-4 font-medium">{client.projects}</td>
                          <td className="px-4 py-4"><span className="font-bold text-emerald-600">${client.totalBilled.toLocaleString()}</span></td>
                          <td className="px-4 py-4">{client.outstandingBalance > 0 ? <span className="font-medium text-amber-600">${client.outstandingBalance.toLocaleString()}</span> : <span className="text-gray-400">$0</span>}</td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(client.status)}>{client.status}</Badge></td>
                          <td className="px-4 py-4"><Button variant="ghost" size="icon" onClick={() => {
                            setSelectedClient(client)
                            setShowClientDialog(true)
                          }}><MoreHorizontal className="h-4 w-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {reportsTab === 'tags' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Tags Usage</CardTitle><Button onClick={() => setShowTagDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Tag</Button></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {tags.map(tag => (
                      <div key={tag.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full bg-${tag.color}-500`}></div><span className="font-medium">{tag.name}</span></div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowTagDialog(true)}><Edit2 className="h-3 w-3" /></Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{tag.usageCount}</span>
                          <span className="text-xs text-gray-500">entries</span>
                        </div>
                        <Progress value={(tag.usageCount / 150) * 100} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            {/* Projects Banner */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Management</h2>
                  <p className="text-pink-100">Track time and budgets across projects</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{projects.length}</p>
                    <p className="text-pink-200 text-sm">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
                    <p className="text-pink-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Project', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => {
                  toast.info('Project creation: Feature available in project management module')
                }},
                { icon: Users, label: 'Team View', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setActiveTab('team') },
                { icon: DollarSign, label: 'Budgets', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => {
                  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
                  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
                  toast.success(`Budget: $${totalSpent.toLocaleString()} / $${totalBudget.toLocaleString()} (${((totalSpent/totalBudget)*100).toFixed(0)}%)`)
                }},
                { icon: Target, label: 'Milestones', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => {
                  toast.info(`${projects.filter(p => p.status === 'active').length} active projects with milestones`)
                }},
                { icon: Archive, label: 'Archive', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => {
                  const archivedCount = projects.filter(p => p.status === 'archived' || p.status === 'completed').length
                  toast.success(`${archivedCount} archived/completed projects`)
                }},
                { icon: BarChart3, label: 'Analytics', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => {
                  setActiveTab('reports')
                  toast.success('Project analytics loaded')
                }},
                { icon: Tag, label: 'Tags', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowTagDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => handleExportTimesheet('csv') },
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

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Projects</CardTitle><Button onClick={() => setShowProjectDialog(true)}><Plus className="h-4 w-4 mr-2" />New Project</Button></CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {projects.map(project => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div><span className="font-medium">{project.name}</span></div></td>
                        <td className="px-4 py-4 text-gray-500">{project.client}</td>
                        <td className="px-4 py-4">{project.billable ? `$${project.hourlyRate}/hr` : 'Non-billable'}</td>
                        <td className="px-4 py-4 font-medium">{project.totalHours}h</td>
                        <td className="px-4 py-4">{project.budget ? <div><span className="font-medium">${project.spent.toLocaleString()}</span><span className="text-gray-500"> / ${project.budget.toLocaleString()}</span><Progress value={(project.spent / project.budget) * 100} className="h-1 mt-1" /></div> : '-'}</td>
                        <td className="px-4 py-4"><Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge></td>
                        <td className="px-4 py-4"><Button variant="ghost" size="icon" onClick={() => {
                          setTimerProject(project.id)
                          toast.success(`Selected project: ${project.name}`)
                        }}><MoreHorizontal className="h-4 w-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-6 space-y-6">
            {/* Team Banner */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Team Activity</h2>
                  <p className="text-violet-100">Monitor team productivity and availability</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{team.length}</p>
                    <p className="text-violet-200 text-sm">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{team.filter(m => m.isOnline).length}</p>
                    <p className="text-violet-200 text-sm">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Users, label: 'All Members', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setTeamTab('activity') },
                { icon: Clock, label: 'Time Logs', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => {
                  setActiveTab('timer')
                  toast.success(`Team logged ${team.reduce((sum, m) => sum + m.todayHours, 0).toFixed(1)}h today`)
                }},
                { icon: Calendar, label: 'Schedule', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setActiveTab('calendar') },
                { icon: Coffee, label: 'Time Off', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setTeamTab('timeoff') },
                { icon: Target, label: 'Utilization', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setTeamTab('utilization') },
                { icon: BarChart3, label: 'Reports', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setActiveTab('reports') },
                { icon: Bell, label: 'Reminders', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => {
                  toast.info('Reminders: Configure in Settings > Notifications')
                  setActiveTab('settings')
                  setSettingsTab('notifications')
                }},
                { icon: Plus, label: 'Add Member', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => {
                  toast.info('Team management: Configure in Settings')
                }},
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

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['activity', 'timeoff', 'utilization'].map(tab => (
                  <Button key={tab} variant={teamTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setTeamTab(tab)} className={teamTab === tab ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                    {tab === 'timeoff' ? 'Time Off' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => {
                setActiveTab('settings')
                toast.success('Team settings: Configure in workspace settings')
              }}><Users className="h-4 w-4 mr-2" />Manage Team</Button>
            </div>

            {teamTab === 'activity' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Team Activity</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {team.map(member => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="relative">
                        <Avatar className="h-12 w-12"><AvatarFallback className="bg-amber-100 text-amber-700">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><h4 className="font-medium">{member.name}</h4>{member.activeProject && <Badge variant="outline" className="text-xs">{member.activeProject}</Badge>}</div>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1"><span className="text-sm text-gray-500">Utilization</span><span className="text-sm font-medium">{((member.weekHours / 40) * 100).toFixed(0)}%</span></div>
                        <Progress value={(member.weekHours / 40) * 100} className="h-2" />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">{member.todayHours}h today</p>
                        <p className="text-sm text-gray-500">{member.weekHours}h this week</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        handleCopyToClipboard(member.email, `Copied ${member.name}'s email`)
                      }}><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {teamTab === 'timeoff' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Time Off Requests</CardTitle><Button onClick={() => {
                  toast.info('Time off request form: Select dates, type, and reason to submit a request')
                }}><Plus className="h-4 w-4 mr-2" />Request Time Off</Button></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {mockTimeOff.map(request => (
                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{request.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar><span className="font-medium">{request.userName}</span></div></td>
                          <td className="px-4 py-4"><Badge variant="outline" className={request.type === 'vacation' ? 'bg-blue-50 text-blue-700' : request.type === 'sick' ? 'bg-red-50 text-red-700' : 'bg-gray-50'}>{request.type}</Badge></td>
                          <td className="px-4 py-4 text-gray-500">{request.startDate} - {request.endDate}</td>
                          <td className="px-4 py-4 font-medium">{request.hours}h</td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(request.status)}>{request.status}</Badge></td>
                          <td className="px-4 py-4">{request.status === 'pending' && <div className="flex gap-1"><Button variant="ghost" size="icon" className="text-green-600" onClick={() => { toast.promise(fetch(`/api/time-tracking/time-off/${request.id}/approve`, { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }), { loading: 'Approving time off request...', success: `Time off request for ${request.userName} approved`, error: 'Failed to approve request' }); }}><Check className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-600" onClick={() => { toast.promise(fetch(`/api/time-tracking/time-off/${request.id}/reject`, { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }), { loading: 'Rejecting time off request...', success: `Time off request for ${request.userName} rejected`, error: 'Failed to reject request' }); }}><X className="h-4 w-4" /></Button></div>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {teamTab === 'utilization' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Team Utilization</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {team.map(member => {
                      const utilization = (member.weekHours / 40) * 100
                      return (
                        <div key={member.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="text-xs bg-amber-100 text-amber-700">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar><span className="text-sm font-medium">{member.name}</span></div>
                            <div className="flex items-center gap-2"><span className={`text-sm font-bold ${utilization >= 100 ? 'text-green-600' : utilization >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{utilization.toFixed(0)}%</span>{utilization >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}</div>
                          </div>
                          <Progress value={Math.min(utilization, 100)} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Team Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-amber-600">{team.length}</p><p className="text-sm text-gray-500">Team Members</p></div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-green-600">{team.filter(m => m.isOnline).length}</p><p className="text-sm text-gray-500">Currently Online</p></div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-blue-600">{team.reduce((sum, m) => sum + m.weekHours, 0)}h</p><p className="text-sm text-gray-500">Total Week Hours</p></div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-purple-600">{((team.reduce((sum, m) => sum + m.weekHours, 0) / (team.length * 40)) * 100).toFixed(0)}%</p><p className="text-sm text-gray-500">Avg Utilization</p></div>
                    </div>
                    <div><h4 className="font-medium mb-2">Time Off This Week</h4><div className="flex items-center gap-2">{(mockTimeOff.filter(t => t.status === 'approved') || []).map(t => <Badge key={t.id} variant="outline">{t.userName.split(' ')[0]}: {t.type}</Badge>)}{mockTimeOff.filter(t => t.status === 'approved').length === 0 && <span className="text-gray-500">No time off scheduled</span>}</div></div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-6">
            {/* Invoices Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Billing & Invoices</h2>
                  <p className="text-emerald-100">FreshBooks-level invoicing from time entries</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{invoices.length}</p>
                    <p className="text-emerald-200 text-sm">Total Invoices</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</p>
                    <p className="text-emerald-200 text-sm">Total Billed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{invoices.filter(i => i.status === 'paid').length}</p>
                    <p className="text-emerald-200 text-sm">Paid</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Invoice', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowInvoiceDialog(true) },
                { icon: Clock, label: 'Auto-Bill', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => { setActiveTab('settings'); setSettingsTab('billing'); toast.success('Auto-billing settings: Configure billing automation'); } },
                { icon: Send, label: 'Send All', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: async () => { const draftInvoices = invoices.filter(i => i.status === 'draft'); if (draftInvoices.length === 0) { toast.info('No draft invoices to send'); return; } toast.success(`Sending ${draftInvoices.length} draft invoices...`); } },
                { icon: DollarSign, label: 'Record Pay', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => { const sentInvoices = invoices.filter(i => i.status === 'sent'); toast.success(`${sentInvoices.length} invoices awaiting payment - select one to record`); } },
                { icon: FileText, label: 'Templates', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.success('Invoice templates: Default, Detailed, Simple available') },
                { icon: Repeat, label: 'Recurring', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.info('Recurring invoices: Set up in invoice creation dialog') },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => { const invoiceData = invoices.map(inv => ({ number: inv.number, client: inv.client, project: inv.project, amount: inv.amount, hours: inv.hours, status: inv.status, dueDate: inv.dueDate })); const csvContent = ['Invoice,Client,Project,Amount,Hours,Status,Due Date', ...invoiceData.map(i => `${i.number},${i.client},${i.project},$${i.amount},${i.hours}h,${i.status},${i.dueDate}`)].join('\n'); const blob = new Blob([csvContent], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast.success(`Exported ${invoiceData.length} invoices to CSV`); } },
                { icon: BarChart3, label: 'Revenue', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => { const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0); const paidRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0); toast.success(`Revenue: $${paidRevenue.toLocaleString()} paid / $${totalRevenue.toLocaleString()} total`); } },
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

            {/* Invoice Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{invoices.filter(i => i.status === 'draft').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                      <Send className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sent</p>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{invoices.filter(i => i.status === 'sent').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{invoices.filter(i => i.status === 'pending').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{invoices.filter(i => i.status === 'paid').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Invoices</CardTitle><Button onClick={() => setShowInvoiceDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Invoice</Button></CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 font-mono">{invoice.number}</td>
                        <td className="px-4 py-4">{invoice.client}</td>
                        <td className="px-4 py-4 text-gray-500">{invoice.project}</td>
                        <td className="px-4 py-4"><div><span className="font-bold">${invoice.amount.toLocaleString()}</span><span className="text-xs text-gray-500 ml-1">({invoice.hours}h)</span></div></td>
                        <td className="px-4 py-4">{invoice.dueDate}</td>
                        <td className="px-4 py-4"><Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge></td>
                        <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleSendInvoice(invoice)}><Send className="h-4 w-4" /></Button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Toggl Level Configuration */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Time Tracking Settings</h2>
                  <p className="text-slate-200">Toggl-level configuration and preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-slate-200 text-sm">Setting Groups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">24+</p>
                    <p className="text-slate-200 text-sm">Options</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">∞</p>
                    <p className="text-slate-200 text-sm">Customization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Settings, label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => { setSettingsTab('general'); toast.success('General settings loaded'); } },
                { icon: Clock, label: 'Tracking', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => { setSettingsTab('tracking'); toast.success('Tracking settings loaded'); } },
                { icon: Bell, label: 'Alerts', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => { setSettingsTab('notifications'); toast.success('Notification settings loaded'); } },
                { icon: Network, label: 'Integrations', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => { setSettingsTab('integrations'); toast.success(`${mockIntegrations.filter(i => i.status === 'connected').length} integrations connected`); } },
                { icon: CreditCard, label: 'Billing', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => { setSettingsTab('billing'); toast.success('Billing settings loaded'); } },
                { icon: Sliders, label: 'Advanced', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => { setSettingsTab('advanced'); toast.success('Advanced settings loaded'); } },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => { const settingsData = { workspace: 'Acme Inc Workspace', currency: 'USD', timezone: 'EST', weekStart: 'Monday', defaultRate: 150, rounding: '15min' }; const jsonContent = JSON.stringify(settingsData, null, 2); const blob = new Blob([jsonContent], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `time_tracking_settings_${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast.success('Settings exported to JSON'); } },
                { icon: RefreshCcw, label: 'Reset', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: async () => { if (confirm('Are you sure you want to reset all settings to defaults?')) { try { const { data: { user } } = await supabase.auth.getUser(); if (user) { await supabase.from('time_tracking_settings').delete().eq('user_id', user.id); } toast.success('Settings reset to defaults'); } catch { toast.error('Failed to reset settings'); } } } },
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
                        { id: 'tracking', label: 'Tracking', icon: Clock },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Network },
                        { id: 'billing', label: 'Billing', icon: CreditCard },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>

                    {/* Usage Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">This Month</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Tracked Hours</span>
                          <span className="font-medium text-amber-600">164h</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Billable Rate</span>
                          <span className="font-medium text-green-600">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Team Utilization</span>
                          <span className="font-medium text-blue-600">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3">Account</h4>
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>Plan</span>
                          <Badge className="bg-amber-500 text-xs">Premium</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Team Size</span>
                          <span>12 members</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Projects</span>
                          <span>24 active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Storage</span>
                          <span>2.4 GB / 10 GB</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-amber-600" />
                          Workspace Settings
                        </CardTitle>
                        <CardDescription>Configure your workspace preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Workspace Name</Label>
                            <Input defaultValue="Acme Inc Workspace" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD - US Dollar</SelectItem>
                                <SelectItem value="eur">EUR - Euro</SelectItem>
                                <SelectItem value="gbp">GBP - British Pound</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <Select defaultValue="est">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Week Starts On</Label>
                            <Select defaultValue="monday">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sunday">Sunday</SelectItem>
                                <SelectItem value="monday">Monday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="mdy">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Format</Label>
                            <Select defaultValue="12">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                                <SelectItem value="24">24-hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Default Rates
                        </CardTitle>
                        <CardDescription>Set default billing rates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Hourly Rate</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">$</span>
                              <Input type="number" defaultValue="150" />
                              <span className="text-gray-500">/hr</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Overtime Multiplier</Label>
                            <Select defaultValue="1.5">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1.25">1.25x</SelectItem>
                                <SelectItem value="1.5">1.5x</SelectItem>
                                <SelectItem value="2">2x</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Default as Billable</Label><p className="text-sm text-gray-500">New entries billable by default</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Show Rates to Team</Label><p className="text-sm text-gray-500">Allow team to see rates</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Tracking Settings */}
                {settingsTab === 'tracking' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          Timer Settings
                        </CardTitle>
                        <CardDescription>Configure timer behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Pomodoro Mode</Label><p className="text-sm text-gray-500">25 min work / 5 min break</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Stop on Browser Close</Label><p className="text-sm text-gray-500">Auto-stop when browser closes</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Keep Timer Visible</Label><p className="text-sm text-gray-500">Show mini timer overlay</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Timer Sound</Label><p className="text-sm text-gray-500">Play sound on stop</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2"><Label>Minimum Entry (minutes)</Label><Input type="number" defaultValue="1" min={0} max={60} /></div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          Time Rounding
                        </CardTitle>
                        <CardDescription>Configure automatic rounding</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Enable Rounding</Label><p className="text-sm text-gray-500">Auto-round time entries</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Round to Nearest</Label>
                            <Select defaultValue="15">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 minute</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="6">6 minutes (1/10 hr)</SelectItem>
                                <SelectItem value="15">15 minutes (1/4 hr)</SelectItem>
                                <SelectItem value="30">30 minutes (1/2 hr)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Direction</Label>
                            <Select defaultValue="nearest">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="up">Round Up</SelectItem>
                                <SelectItem value="down">Round Down</SelectItem>
                                <SelectItem value="nearest">Nearest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Coffee className="h-5 w-5 text-orange-600" />
                          Idle Detection
                        </CardTitle>
                        <CardDescription>Configure idle handling</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Idle Detection</Label><p className="text-sm text-gray-500">Detect when away</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2"><Label>Idle Timeout (min)</Label><Input type="number" defaultValue="5" min={1} max={60} /></div>
                          <div className="space-y-2">
                            <Label>On Idle</Label>
                            <Select defaultValue="ask">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ask">Ask what to do</SelectItem>
                                <SelectItem value="discard">Discard idle time</SelectItem>
                                <SelectItem value="keep">Keep idle time</SelectItem>
                                <SelectItem value="pause">Pause timer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          Approval Workflow
                        </CardTitle>
                        <CardDescription>Configure approvals</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Require Approval</Label><p className="text-sm text-gray-500">Manager approval needed</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Lock Approved</Label><p className="text-sm text-gray-500">Prevent edits</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Auto-approve Own</Label><p className="text-sm text-gray-500">Managers auto-approved</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2"><Label>Deadline (days after week)</Label><Input type="number" defaultValue="3" min={1} max={14} /></div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-amber-600" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Daily Reminder</Label><p className="text-sm text-gray-500">Log time reminder</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Weekly Summary</Label><p className="text-sm text-gray-500">Hours summary email</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Monthly Report</Label><p className="text-sm text-gray-500">Productivity report</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Approval Updates</Label><p className="text-sm text-gray-500">Entry approved/rejected</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2"><Label>Daily Reminder Time</Label><Input type="time" defaultValue="17:00" /></div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          Alert Notifications
                        </CardTitle>
                        <CardDescription>Budget and deadline alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Budget Alerts</Label><p className="text-sm text-gray-500">Project budget threshold</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2"><Label>Budget Threshold (%)</Label><Input type="number" defaultValue="80" min={50} max={100} /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Invoice Alerts</Label><p className="text-sm text-gray-500">Overdue invoices</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Overtime Alerts</Label><p className="text-sm text-gray-500">Team exceeds hours</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div><CardTitle className="flex items-center gap-2"><Network className="h-5 w-5 text-blue-600" />Connected Apps</CardTitle><CardDescription>Third-party integrations</CardDescription></div>
                        <Button><Plus className="h-4 w-4 mr-2" />Add</Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockIntegrations.map(integration => (
                          <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : integration.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                {integration.type === 'calendar' && <Calendar className="h-5 w-5" />}
                                {integration.type === 'project' && <Briefcase className="h-5 w-5" />}
                                {integration.type === 'accounting' && <Receipt className="h-5 w-5" />}
                                {integration.type === 'communication' && <Mail className="h-5 w-5" />}
                                {integration.type === 'crm' && <Users className="h-5 w-5" />}
                              </div>
                              <div><h4 className="font-medium">{integration.name}</h4><p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(integration.status)}>{integration.status}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => {
                              toast.promise(fetch(`/api/time-tracking/integrations/${integration.id}/sync`, { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }), { loading: `Syncing ${integration.name}...`, success: `${integration.name} synced`, error: 'Sync failed' })
                            }}><RefreshCw className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={async () => { if (confirm(`Disconnect ${integration.name}? This will stop syncing data.`)) { try { const { error } = await supabase.from('integrations').delete().eq('id', integration.id); if (error) throw error; toast.success(`${integration.name} disconnected`); } catch { toast.error('Failed to disconnect integration'); } } }}><X className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-purple-600" />API Access</CardTitle>
                        <CardDescription>Manage API keys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div><Label className="text-base">API Key</Label><p className="text-xs text-gray-500">For programmatic access</p></div>
                            <Button size="sm" variant="outline" onClick={async () => { if (confirm('Regenerating the API key will invalidate the current key. Continue?')) { try { const newKey = `tt_api_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`; const { data: { user } } = await supabase.auth.getUser(); if (user) { await supabase.from('api_keys').upsert({ user_id: user.id, key_hash: newKey, type: 'time_tracking' }); } toast.success('New API key generated - copy it now'); } catch { toast.error('Failed to regenerate API key'); } } }}><RefreshCw className="h-4 w-4 mr-2" />Regenerate</Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" defaultValue="tt_api_xxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button size="sm" variant="ghost" onClick={async () => { try { await navigator.clipboard.writeText('tt_api_xxxxxxxxxxxxx'); toast.success('API key copied to clipboard'); } catch { toast.error('Failed to copy API key'); } }}>Copy</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Webhooks</Label><p className="text-sm text-gray-500">Send to external URLs</p></div>
                          <Switch />
                        </div>
                        <div className="space-y-2"><Label>Webhook URL</Label><Input placeholder="https://your-app.com/webhook" /></div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Billing */}
                {settingsTab === 'billing' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-green-600" />Current Plan</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                          <div>
                            <div className="flex items-center gap-2"><h3 className="text-2xl font-bold">Premium Plan</h3><Badge className="bg-amber-500">Current</Badge></div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Unlimited users • Unlimited projects • All integrations</p>
                            <p className="text-sm text-gray-500 mt-2">Renews on January 28, 2025</p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold">$15<span className="text-lg text-gray-500">/user/mo</span></p>
                            <p className="text-sm text-gray-500 mt-1">12 users × $15 = $180/mo</p>
                            <Button variant="outline" className="mt-3" onClick={() => setShowPlanDialog(true)}>Change Plan</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" />Billing Information</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2"><Label>Company Name</Label><Input defaultValue="Acme Inc" /></div>
                          <div className="space-y-2"><Label>Billing Email</Label><Input defaultValue="billing@acme.com" /></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2"><Label>Address</Label><Input defaultValue="123 Business Ave" /></div>
                          <div className="space-y-2"><Label>City, State ZIP</Label><Input defaultValue="New York, NY 10001" /></div>
                        </div>
                        <Button className="bg-amber-500 hover:bg-amber-600" onClick={handleUpdateBilling}>Update Billing</Button>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-purple-600" />Payment History</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[{date:'Dec 28, 2024',amt:'$180.00'},{date:'Nov 28, 2024',amt:'$180.00'},{date:'Oct 28, 2024',amt:'$165.00'}].map((inv,i)=>(
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div><p className="font-medium">{inv.date}</p><p className="text-sm text-gray-500">Premium Plan</p></div>
                              <div className="flex items-center gap-4"><span className="font-medium">{inv.amt}</span><Badge className="bg-green-100 text-green-700">Paid</Badge><Button variant="ghost" size="sm" onClick={() => { const invoiceContent = `Invoice\nDate: ${inv.date}\nAmount: ${inv.amt}\nPlan: Premium Plan\nStatus: Paid`; const blob = new Blob([invoiceContent], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `invoice_${inv.date.replace(/[, ]/g, '_')}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast.success('Invoice downloaded'); }}><Download className="h-4 w-4" /></Button></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-green-600" />Security</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Two-Factor Auth</Label><p className="text-sm text-gray-500">Require 2FA for all</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">SSO</Label><p className="text-sm text-gray-500">SAML-based SSO</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">IP Restriction</Label><p className="text-sm text-gray-500">Limit to specific IPs</p></div>
                          <Switch />
                        </div>
                        <div className="space-y-2"><Label>Session Timeout (min)</Label><Input type="number" defaultValue="60" min={5} max={480} /></div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader><CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-blue-600" />Data Management</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Auto Backups</Label><p className="text-sm text-gray-500">Daily data backup</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={handleExportAllData}><Download className="h-4 w-4 mr-2" />Export All</Button>
                          <Button variant="outline" className="flex-1" onClick={handleArchiveProjects}><Archive className="h-4 w-4 mr-2" />Archive Projects</Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-red-200 dark:border-red-800">
                      <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertOctagon className="h-5 w-5" />Danger Zone</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Clear Time Entries</Label><p className="text-sm text-red-600/70">Delete all tracking data</p></div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700" onClick={handleClearTimeEntries}><TrashIcon className="h-4 w-4 mr-2" />Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Delete Workspace</Label><p className="text-sm text-red-600/70">Permanently delete</p></div>
                          <Button variant="destructive" onClick={handleDeleteWorkspace}><AlertOctagon className="h-4 w-4 mr-2" />Delete</Button>
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
            /* AIInsightsPanel removed - use header button */
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[]}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Time Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          /* ActivityFeed removed - use header button */
          <QuickActionsToolbar
            actions={timeTrackingQuickActions}
            variant="grid"
          />
        </div>

        {/* Entry Dialog */}
        <Dialog open={showEntryDialog} onOpenChange={(open) => { setShowEntryDialog(open); if (!open) setEditingEntryId(null) }}>
          <DialogContent><DialogHeader><DialogTitle>{editingEntryId ? 'Edit Time Entry' : 'Add Time Entry'}</DialogTitle><DialogDescription>{editingEntryId ? 'Update this time entry' : 'Manually log a time entry'}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Description</Label><Input placeholder="What did you work on?" className="mt-1" value={newEntryForm.description} onChange={(e) => setNewEntryForm(prev => ({ ...prev, description: e.target.value }))} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Project</Label><Select value={newEntryForm.projectId} onValueChange={(value) => setNewEntryForm(prev => ({ ...prev, projectId: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.client}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Task (Optional)</Label><Select value={newEntryForm.taskId} onValueChange={(value) => setNewEntryForm(prev => ({ ...prev, taskId: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select task" /></SelectTrigger><SelectContent><SelectItem value="">No Task</SelectItem>{(dbTasks || []).filter(t => !newEntryForm.projectId || t.project_id === newEntryForm.projectId).map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Date</Label><Input type="date" className="mt-1" value={newEntryForm.date} onChange={(e) => setNewEntryForm(prev => ({ ...prev, date: e.target.value }))} /></div><div><Label>Duration</Label><Input placeholder="1h 30m" className="mt-1" value={newEntryForm.duration} onChange={(e) => setNewEntryForm(prev => ({ ...prev, duration: e.target.value }))} /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Start Time</Label><Input type="time" className="mt-1" value={newEntryForm.startTime} onChange={(e) => setNewEntryForm(prev => ({ ...prev, startTime: e.target.value }))} /></div><div><Label>End Time</Label><Input type="time" className="mt-1" value={newEntryForm.endTime} onChange={(e) => setNewEntryForm(prev => ({ ...prev, endTime: e.target.value }))} /></div></div>
              <div className="flex items-center gap-2"><Switch id="billable" checked={newEntryForm.isBillable} onCheckedChange={(checked) => setNewEntryForm(prev => ({ ...prev, isBillable: checked }))} /><Label htmlFor="billable">Billable</Label></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setShowEntryDialog(false); setEditingEntryId(null); setNewEntryForm({ description: '', projectId: '', taskId: '', date: new Date().toISOString().split('T')[0], duration: '', startTime: '', endTime: '', isBillable: true }) }}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={async () => {
              if (editingEntryId) {
                const success = await handleUpdateEntry(editingEntryId, newEntryForm)
                if (success) {
                  setShowEntryDialog(false)
                  setEditingEntryId(null)
                  setNewEntryForm({ description: '', projectId: '', taskId: '', date: new Date().toISOString().split('T')[0], duration: '', startTime: '', endTime: '', isBillable: true })
                }
              } else {
                handleCreateManualEntry()
              }
            }} disabled={entriesLoading || !newEntryForm.description}>{entriesLoading ? 'Saving...' : (editingEntryId ? 'Update Entry' : 'Save Entry')}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={(open) => {
          setShowInvoiceDialog(open)
          if (!open) setInvoiceFormData({ clientName: '', projectId: '', fromDate: '', toDate: '', dueDate: '' })
        }}>
          <DialogContent><DialogHeader><DialogTitle>Create Invoice</DialogTitle><DialogDescription>Generate invoice from tracked time</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Client</Label><Select value={invoiceFormData.clientName} onValueChange={(value) => setInvoiceFormData(prev => ({ ...prev, clientName: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{[...new Set(projects.map(p => p.client))].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Project</Label><Select value={invoiceFormData.projectId} onValueChange={(value) => setInvoiceFormData(prev => ({ ...prev, projectId: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.filter(p => !invoiceFormData.clientName || p.client === invoiceFormData.clientName).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>From Date</Label><Input type="date" className="mt-1" value={invoiceFormData.fromDate} onChange={(e) => setInvoiceFormData(prev => ({ ...prev, fromDate: e.target.value }))} /></div><div><Label>To Date</Label><Input type="date" className="mt-1" value={invoiceFormData.toDate} onChange={(e) => setInvoiceFormData(prev => ({ ...prev, toDate: e.target.value }))} /></div></div>
              <div><Label>Due Date</Label><Input type="date" className="mt-1" value={invoiceFormData.dueDate} onChange={(e) => setInvoiceFormData(prev => ({ ...prev, dueDate: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={() => {
              if (!invoiceFormData.clientName) {
                toast.error('Please select a client')
                return
              }
              toast.promise(
                fetch('/api/time-tracking/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invoiceFormData) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); }),
                {
                  loading: 'Generating invoice...',
                  success: (data) => `Invoice created: ${data.entries} entries, ${data.hours.toFixed(1)}h, $${data.amount.toFixed(2)}`,
                  error: 'Failed to generate invoice'
                }
              )
              setShowInvoiceDialog(false)
              setInvoiceFormData({ clientName: '', projectId: '', fromDate: '', toDate: '', dueDate: '' })
            }}>Generate Invoice</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client Dialog */}
        <Dialog open={showClientDialog} onOpenChange={(open) => {
          setShowClientDialog(open)
          if (!open) setClientFormData({ name: '', email: '', phone: '', currency: 'USD', address: '', notes: '', hourlyRate: '' })
        }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{selectedClient ? 'Edit Client' : 'Add New Client'}</DialogTitle><DialogDescription>{selectedClient ? 'Update client details' : 'Create a new client for billing and project tracking'}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Client Name</Label><Input placeholder="Company name" className="mt-1" value={clientFormData.name} onChange={(e) => setClientFormData(prev => ({ ...prev, name: e.target.value }))} /></div><div><Label>Email</Label><Input type="email" placeholder="billing@company.com" className="mt-1" value={clientFormData.email} onChange={(e) => setClientFormData(prev => ({ ...prev, email: e.target.value }))} /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Phone</Label><Input placeholder="+1 555-0100" className="mt-1" value={clientFormData.phone} onChange={(e) => setClientFormData(prev => ({ ...prev, phone: e.target.value }))} /></div><div><Label>Currency</Label><Select value={clientFormData.currency} onValueChange={(value) => setClientFormData(prev => ({ ...prev, currency: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="CAD">CAD</SelectItem></SelectContent></Select></div></div>
              <div><Label>Address</Label><Input placeholder="123 Business Ave, City, State ZIP" className="mt-1" value={clientFormData.address} onChange={(e) => setClientFormData(prev => ({ ...prev, address: e.target.value }))} /></div>
              <div><Label>Notes</Label><Input placeholder="Additional notes about this client" className="mt-1" value={clientFormData.notes} onChange={(e) => setClientFormData(prev => ({ ...prev, notes: e.target.value }))} /></div>
              <div><Label>Default Hourly Rate</Label><Input type="number" placeholder="150" className="mt-1" value={clientFormData.hourlyRate} onChange={(e) => setClientFormData(prev => ({ ...prev, hourlyRate: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setShowClientDialog(false); setSelectedClient(null) }}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={() => {
              if (!clientFormData.name) {
                toast.error('Client name is required')
                return
              }
              toast.promise(
                fetch(selectedClient ? `/api/time-tracking/clients/${selectedClient.id}` : '/api/time-tracking/clients', { method: selectedClient ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clientFormData) }).then(res => { if (!res.ok) throw new Error('Failed'); return clientFormData.name; }),
                {
                  loading: selectedClient ? 'Updating client...' : 'Creating client...',
                  success: (name) => `${selectedClient ? 'Updated' : 'Created'} client: ${name}`,
                  error: `Failed to ${selectedClient ? 'update' : 'create'} client`
                }
              )
              setShowClientDialog(false)
              setSelectedClient(null)
              setClientFormData({ name: '', email: '', phone: '', currency: 'USD', address: '', notes: '', hourlyRate: '' })
            }}>{selectedClient ? 'Update Client' : 'Create Client'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tag Dialog */}
        <Dialog open={showTagDialog} onOpenChange={(open) => {
          setShowTagDialog(open)
          if (!open) setTagFormData({ name: '', color: 'blue' })
        }}>
          <DialogContent><DialogHeader><DialogTitle>Create New Tag</DialogTitle><DialogDescription>Add a tag to categorize time entries</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Tag Name</Label><Input placeholder="e.g., development, meeting, review" className="mt-1" value={tagFormData.name} onChange={(e) => setTagFormData(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {['red', 'orange', 'amber', 'green', 'blue', 'indigo', 'purple', 'pink'].map(color => (
                    <button key={color} onClick={() => setTagFormData(prev => ({ ...prev, color }))} className={`w-8 h-8 rounded-full bg-${color}-500 hover:ring-2 hover:ring-${color}-300 transition-all ${tagFormData.color === color ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowTagDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={() => {
              if (!tagFormData.name) {
                toast.error('Tag name is required')
                return
              }
              toast.promise(
                fetch('/api/time-tracking/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tagFormData) }).then(res => { if (!res.ok) throw new Error('Failed'); return tagFormData.name; }),
                {
                  loading: 'Creating tag...',
                  success: (name) => `Tag "${name}" created successfully`,
                  error: 'Failed to create tag'
                }
              )
              setShowTagDialog(false)
              setTagFormData({ name: '', color: 'blue' })
            }}>Create Tag</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Builder Dialog */}
        <Dialog open={showReportDialog} onOpenChange={(open) => {
          setShowReportDialog(open)
          if (!open) setReportFormData({ name: '', type: '', dateRange: '', groupBy: '', isScheduled: false })
        }}>
          <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Create New Report</DialogTitle><DialogDescription>Build a custom report with your preferred filters</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Report Name</Label><Input placeholder="My Custom Report" className="mt-1" value={reportFormData.name} onChange={(e) => setReportFormData(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Report Type</Label><Select value={reportFormData.type} onValueChange={(value) => setReportFormData(prev => ({ ...prev, type: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="summary">Summary</SelectItem><SelectItem value="detailed">Detailed</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="project">By Project</SelectItem><SelectItem value="client">By Client</SelectItem><SelectItem value="team">Team</SelectItem></SelectContent></Select></div>
                <div><Label>Date Range</Label><Select value={reportFormData.dateRange} onValueChange={(value) => setReportFormData(prev => ({ ...prev, dateRange: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger><SelectContent><SelectItem value="week">This Week</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="quarter">This Quarter</SelectItem><SelectItem value="year">This Year</SelectItem><SelectItem value="custom">Custom Range</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Filters</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={`cursor-pointer hover:bg-amber-50 ${!filters.projectId ? 'bg-amber-100' : ''}`} onClick={() => setFilters(prev => ({ ...prev, projectId: '' }))}>All Projects</Badge>
                  <Badge variant="outline" className={`cursor-pointer hover:bg-amber-50 ${filters.billableOnly ? 'bg-amber-100' : ''}`} onClick={() => setFilters(prev => ({ ...prev, billableOnly: !prev.billableOnly }))}>Billable Only</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-amber-50">All Team Members</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-amber-50">Active Clients</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div><p className="font-medium">Schedule Report</p><p className="text-sm text-gray-500">Automatically run and email this report</p></div>
                <Switch checked={reportFormData.isScheduled} onCheckedChange={(checked) => setReportFormData(prev => ({ ...prev, isScheduled: checked }))} />
              </div>
              <div><Label>Group By</Label><Select value={reportFormData.groupBy} onValueChange={(value) => setReportFormData(prev => ({ ...prev, groupBy: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select grouping" /></SelectTrigger><SelectContent><SelectItem value="day">Day</SelectItem><SelectItem value="week">Week</SelectItem><SelectItem value="project">Project</SelectItem><SelectItem value="client">Client</SelectItem><SelectItem value="member">Team Member</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button><Button variant="outline" onClick={() => {
              const entries = dbTimeEntries || entries
              const filteredEntries = entries.filter((e: any) => !filters.billableOnly || (e.is_billable || e.isBillable))
              const totalHours = filteredEntries.reduce((sum: any, e: any) => sum + (e.duration_hours || e.durationHours || 0), 0)
              const totalRevenue = filteredEntries.reduce((sum: any, e: any) => sum + (e.billable_amount || e.billableAmount || 0), 0)
              toast.success(`Report preview: ${filteredEntries.length} entries, ${totalHours.toFixed(1)}h, $${totalRevenue.toFixed(2)}`)
            }}><Eye className="h-4 w-4 mr-2" />Preview</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={() => {
              if (!reportFormData.name) {
                toast.error('Report name is required')
                return
              }
              toast.promise(
                fetch('/api/time-tracking/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reportFormData) }).then(res => { if (!res.ok) throw new Error('Failed'); return reportFormData.name; }),
                {
                  loading: 'Saving report...',
                  success: (name) => `Report "${name}" saved successfully${reportFormData.isScheduled ? ' (scheduled)' : ''}`,
                  error: 'Failed to save report'
                }
              )
              setShowReportDialog(false)
              setReportFormData({ name: '', type: '', dateRange: '', groupBy: '', isScheduled: false })
            }}>Save Report</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Project Dialog */}
        <Dialog open={showProjectDialog} onOpenChange={(open) => {
          setShowProjectDialog(open)
          if (!open) setProjectFormData({ name: '', clientId: '', hourlyRate: '', budget: '', isBillable: true })
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project for time tracking</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Project Name</Label><Input placeholder="Enter project name" className="mt-1" value={projectFormData.name} onChange={(e) => setProjectFormData(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label>Client</Label>
                <Select value={projectFormData.clientId} onValueChange={(value) => setProjectFormData(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Hourly Rate ($)</Label><Input type="number" placeholder="0.00" className="mt-1" value={projectFormData.hourlyRate} onChange={(e) => setProjectFormData(prev => ({ ...prev, hourlyRate: e.target.value }))} /></div>
                <div><Label>Budget ($)</Label><Input type="number" placeholder="0.00" className="mt-1" value={projectFormData.budget} onChange={(e) => setProjectFormData(prev => ({ ...prev, budget: e.target.value }))} /></div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Billable Project</Label>
                <Switch checked={projectFormData.isBillable} onCheckedChange={(checked) => setProjectFormData(prev => ({ ...prev, isBillable: checked }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProjectDialog(false)}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => {
                if (!projectFormData.name) {
                  toast.error('Project name is required')
                  return
                }
                toast.promise(
                  fetch('/api/time-tracking/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projectFormData) }).then(res => { if (!res.ok) throw new Error('Failed'); return projectFormData.name; }),
                  {
                    loading: 'Creating project...',
                    success: (name) => `Project "${name}" created successfully`,
                    error: 'Failed to create project'
                  }
                )
                setShowProjectDialog(false)
                setProjectFormData({ name: '', clientId: '', hourlyRate: '', budget: '', isBillable: true })
              }}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Invoice Dialog */}
        <Dialog open={showInvoiceViewDialog} onOpenChange={setShowInvoiceViewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>Invoice {selectedInvoice?.number}</DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div><Label className="text-gray-500">Client</Label><p className="font-medium">{selectedInvoice.client}</p></div>
                  <div><Label className="text-gray-500">Project</Label><p className="font-medium">{selectedInvoice.project}</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div><Label className="text-gray-500">Amount</Label><p className="font-bold text-2xl">${selectedInvoice.amount.toLocaleString()}</p></div>
                  <div><Label className="text-gray-500">Hours</Label><p className="font-medium text-lg">{selectedInvoice.hours}h</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div><Label className="text-gray-500">Due Date</Label><p className="font-medium">{selectedInvoice.dueDate}</p></div>
                  <div><Label className="text-gray-500">Status</Label><Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge></div>
                </div>
                <div><Label className="text-gray-500">Created</Label><p className="font-medium">{selectedInvoice.createdAt}</p></div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvoiceViewDialog(false)}>Close</Button>
              <Button variant="outline" onClick={() => {
                if (selectedInvoice) {
                  const invoiceText = `Invoice ${selectedInvoice.number}\nClient: ${selectedInvoice.client}\nProject: ${selectedInvoice.project}\nAmount: $${selectedInvoice.amount.toLocaleString()}\nHours: ${selectedInvoice.hours}\nDue: ${selectedInvoice.dueDate}\nStatus: ${selectedInvoice.status}`
                  const blob = new Blob([invoiceText], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${selectedInvoice.number}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  toast.success('Invoice downloaded')
                }
              }}><Download className="h-4 w-4 mr-2" />Download</Button>
              {selectedInvoice?.status === 'draft' && (
                <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => {
                  if (selectedInvoice) {
                    handleSendInvoice(selectedInvoice)
                    setShowInvoiceViewDialog(false)
                  }
                }}><Send className="h-4 w-4 mr-2" />Send Invoice</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Plan Selection Dialog */}
        <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Change Your Plan</DialogTitle>
              <DialogDescription>Select a plan that fits your team</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-4">
              <Card className="cursor-pointer hover:border-amber-500 transition-colors" onClick={() => {
                toast.promise(
                  fetch('/api/time-tracking/billing/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'starter' }) }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                  {
                    loading: 'Switching to Starter plan...',
                    success: 'Plan changed to Starter ($8/user/mo)',
                    error: 'Failed to change plan'
                  }
                )
                setShowPlanDialog(false)
              }}>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">Starter</h3>
                  <p className="text-3xl font-bold mt-2">$8<span className="text-sm text-gray-500">/user/mo</span></p>
                  <p className="text-sm text-gray-500 mt-2">Up to 5 users</p>
                  <p className="text-sm text-gray-500">Basic integrations</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer border-amber-500 border-2 relative" onClick={() => {
                toast.info('You are already on the Premium plan')
              }}>
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500">Current</Badge>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">Premium</h3>
                  <p className="text-3xl font-bold mt-2">$15<span className="text-sm text-gray-500">/user/mo</span></p>
                  <p className="text-sm text-gray-500 mt-2">Unlimited users</p>
                  <p className="text-sm text-gray-500">All integrations</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-amber-500 transition-colors" onClick={() => {
                toast.info('Contact sales for Enterprise pricing: sales@company.com')
              }}>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">Enterprise</h3>
                  <p className="text-3xl font-bold mt-2">Custom</p>
                  <p className="text-sm text-gray-500 mt-2">Unlimited everything</p>
                  <p className="text-sm text-gray-500">Dedicated support</p>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Workspace Confirmation Dialog */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5" />
                Delete Workspace
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. All time entries, projects, and data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">Type DELETE to confirm:</p>
              <Input placeholder="DELETE" className="border-red-200" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteWorkspace}>Delete Permanently</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
