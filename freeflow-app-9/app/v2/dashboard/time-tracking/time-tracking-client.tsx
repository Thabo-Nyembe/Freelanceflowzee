'use client'

import { useState, useMemo, useEffect } from 'react'
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
  Printer, Copy, Repeat, RefreshCcw
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
import { useTimeTracking } from '@/lib/hooks/use-time-tracking'
import { toast } from 'sonner'
import { downloadAsCsv, downloadAsJson, printContent, apiPost } from '@/lib/button-handlers'

// Types
type TimeEntryStatus = 'running' | 'stopped' | 'approved' | 'rejected'
type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived'

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

// Database data - ready for integration
const projects: Project[] = []

const entries: TimeEntry[] = []

const team: TeamMember[] = []

const invoices: Invoice[] = []

const goals: Goal[] = []

const clients: Client[] = []

const tags: Tag[] = []

const timeOff: TimeOffRequest[] = []

const savedReports: SavedReport[] = []

const automations: Automation[] = []

const integrations: Integration[] = []

const workspaces: Workspace[] = []

// Competitive Upgrade Data - Toggl/Harvest Level Time Tracking Intelligence
const timeTrackingAIInsights: any[] = []
const timeTrackingCollaborators: any[] = []
const timeTrackingPredictions: any[] = []
const timeTrackingActivities: any[] = []

// Quick actions will be defined inside the component to access state setters
const timeTrackingQuickActionsBase: any[] = []

export default function TimeTrackingClient() {
  const [activeTab, setActiveTab] = useState('timer')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerDescription, setTimerDescription] = useState('')
  const [timerProject, setTimerProject] = useState('')
  const [timerBillable, setTimerBillable] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [reportsTab, setReportsTab] = useState('overview')
  const [teamTab, setTeamTab] = useState('activity')

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
    refetch
  } = useTimeTracking()

  // Track the active running entry ID
  const [activeTimerEntryId, setActiveTimerEntryId] = useState<string | null>(null)
  const [activeTimerStartTime, setActiveTimerStartTime] = useState<string | null>(null)

  // Form state for new time entry
  const [newEntryForm, setNewEntryForm] = useState({
    description: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    startTime: '',
    endTime: '',
    isBillable: true
  })

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
        toast.success('Timer started')
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

      toast.success('Timer stopped and saved')
    } catch (error) {
      console.error('Failed to stop timer:', error)
      toast.error('Failed to stop timer')
    }
  }

  // Handle deleting a time entry - WIRED TO SUPABASE
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId)
      toast.success('Entry deleted')
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  // Handle approving a time entry - WIRED TO SUPABASE
  const handleApproveEntry = async (entryId: string) => {
    try {
      await approveEntry(entryId)
      toast.success('Entry approved')
    } catch (error) {
      console.error('Failed to approve entry:', error)
      toast.error('Failed to approve entry')
    }
  }

  // Handle rejecting a time entry - WIRED TO SUPABASE
  const handleRejectEntry = async (entryId: string, reason?: string) => {
    try {
      await rejectEntry(entryId, reason)
      toast.success('Entry rejected')
    } catch (error) {
      console.error('Failed to reject entry:', error)
      toast.error('Failed to reject entry')
    }
  }

  // Handle submitting a time entry for approval - WIRED TO SUPABASE
  const handleSubmitEntry = async (entryId: string) => {
    try {
      await submitEntry(entryId)
      toast.success('Entry submitted')
    } catch (error) {
      console.error('Failed to submit entry:', error)
      toast.error('Failed to submit entry')
    }
  }

  // Handle locking a time entry - WIRED TO SUPABASE
  const handleLockEntry = async (entryId: string) => {
    try {
      await lockEntry(entryId)
      toast.info('Entry locked')
    } catch (error) {
      console.error('Failed to lock entry:', error)
      toast.error('Failed to lock entry')
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const stats = useMemo(() => {
    const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0)
    const billableHours = entries.filter(e => e.isBillable).reduce((sum, e) => sum + e.durationHours, 0)
    const totalRevenue = entries.reduce((sum, e) => sum + e.billableAmount, 0)
    const running = entries.filter(e => e.status === 'running').length
    return {
      totalHours: totalHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      billablePercent: totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(0) : '0',
      totalRevenue,
      entries: entries.length,
      running,
      projects: projects.filter(p => p.status === 'active').length,
      teamOnline: team.filter(t => t.isOnline).length
    }
  }, [])

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
  const stopTimer = () => { setIsTimerRunning(false); setTimerSeconds(0); setTimerDescription(''); setTimerProject('') }

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

  // Real Export Handler - generates actual CSV/JSON files
  const handleExportTimesheet = () => {
    const entries = dbTimeEntries && dbTimeEntries.length > 0 ? dbTimeEntries : entries.map(e => ({
      id: e.id,
      title: e.title,
      project_name: e.projectName,
      start_time: e.startTime,
      end_time: e.endTime || '',
      duration_hours: e.durationHours,
      billable_amount: e.billableAmount,
      status: e.status,
      is_billable: e.isBillable
    }))

    const csvData = entries.map((entry: any) => ({
      ID: entry.id,
      Description: entry.title || entry.description || '',
      Project: entry.project_name || entry.projectName || '',
      'Start Time': entry.start_time || entry.startTime || '',
      'End Time': entry.end_time || entry.endTime || '',
      'Duration (Hours)': entry.duration_hours || entry.durationHours || 0,
      'Billable Amount': entry.billable_amount || entry.billableAmount || 0,
      Status: entry.status || '',
      Billable: entry.is_billable || entry.isBillable ? 'Yes' : 'No'
    }))

    const filename = `timesheet-${new Date().toISOString().split('T')[0]}`
    downloadAsCsv(csvData, filename)
  }

  const handleApproveTimesheet = async () => {
    // Approve all stopped entries for the current week
    if (dbTimeEntries && dbTimeEntries.length > 0) {
      const stoppedEntries = dbTimeEntries.filter((e: any) => e.status === 'stopped')
      for (const entry of stoppedEntries) {
        await approveEntry(entry.id)
      }
      toast.success('Timesheet approved')
    } else {
      toast.info('No entries to approve')
    }
  }

  // Real dialog state handlers
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false)
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showAddIntegrationDialog, setShowAddIntegrationDialog] = useState(false)
  const [showReportPreviewDialog, setShowReportPreviewDialog] = useState(false)
  const [apiKey, setApiKey] = useState('tt_api_xxxxxxxxxxxxx')
  const [showClearEntriesDialog, setShowClearEntriesDialog] = useState(false)
  const [showDeleteWorkspaceDialog, setShowDeleteWorkspaceDialog] = useState(false)
  const [showArchiveProjectsDialog, setShowArchiveProjectsDialog] = useState(false)
  const [integrationToRemove, setIntegrationToRemove] = useState<string | null>(null)

  // Real Quick Actions with actual functionality
  const timeTrackingQuickActions = timeTrackingQuickActionsBase.map(action => ({
    ...action,
    action: action.id === '1'
      ? () => { if (timerDescription) handleStartTimerDB(); else toast.info('Enter a description to start the timer') }
      : action.id === '2'
      ? () => setShowEntryDialog(true)
      : () => setActiveTab('reports')
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Timer className="h-6 w-6 text-white" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Time Tracking</h1><p className="text-gray-500 dark:text-gray-400">Toggl level time management</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowEntryDialog(true)}><Plus className="h-4 w-4 mr-2" />Manual Entry</Button>
            <Button variant="outline" onClick={handleExportTimesheet}><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>

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
                  <div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + stat.color + " flex items-center justify-center"}><stat.icon className="h-5 w-5 text-white" /></div>
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
                { icon: Play, label: 'Start Timer', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => { if (timerDescription) handleStartTimerDB(); else toast.promise(Promise.resolve(), { loading: 'Checking...', success: 'Please enter a description first', error: 'Error' }) }, disabled: isTimerRunning },
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
                  disabled={(action as any).disabled}
                  className={"h-20 flex-col gap-2 " + action.color + " hover:scale-105 transition-all duration-200"}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Entries {entriesLoading && <span className="text-sm font-normal text-gray-500">(Loading...)</span>}</CardTitle>
                <span className="text-sm text-gray-500">
                  Total: {dbTimeEntries && dbTimeEntries.length > 0
                    ? dbTimeEntries.filter((e: any) => new Date(e.start_time).toDateString() === new Date().toDateString())
                        .reduce((sum: number, e: any) => sum + (e.duration_hours || 0), 0).toFixed(1)
                    : entries.filter(e => e.startTime.startsWith('2024-01-16')).reduce((sum, e) => sum + e.durationHours, 0).toFixed(1)}h
                </span>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {/* Show database entries if available, otherwise show mock data */}
                {(dbTimeEntries && dbTimeEntries.length > 0 ? dbTimeEntries : entries.map(e => ({
                  id: e.id,
                  title: e.title,
                  status: e.status,
                  is_billable: e.isBillable,
                  project_id: e.projectId,
                  start_time: e.startTime,
                  end_time: e.endTime,
                  duration_hours: e.durationHours,
                  billable_amount: e.billableAmount
                }))).map((entry: any) => {
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
                            <span className="text-gray-500">{project?.name || 'No Project'}</span>
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
                            {entry.status === 'stopped' && (
                              <Button variant="ghost" size="icon" onClick={() => handleSubmitEntry(entry.id)} title="Submit for approval" className="text-blue-600"><Send className="h-4 w-4" /></Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(entry); setShowEntryDialog(true) }} title="Edit entry"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteEntry(entry.id)} disabled={entriesLoading} title="Delete entry"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                  // Copy entries from last week to this week
                  const lastWeekStart = new Date()
                  lastWeekStart.setDate(lastWeekStart.getDate() - 7 - lastWeekStart.getDay())
                  const lastWeekEntries = (dbTimeEntries || []).filter((e: any) => {
                    const entryDate = new Date(e.start_time)
                    return entryDate >= lastWeekStart && entryDate < new Date(lastWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
                  })
                  if (lastWeekEntries.length > 0) {
                    toast.loading('Copying entries from last week...')
                    for (const entry of lastWeekEntries) {
                      const newStartTime = new Date(entry.start_time)
                      newStartTime.setDate(newStartTime.getDate() + 7)
                      await createEntry({
                        ...entry,
                        id: undefined,
                        start_time: newStartTime.toISOString(),
                        end_time: entry.end_time ? new Date(new Date(entry.end_time).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                        status: 'stopped'
                      })
                    }
                    toast.dismiss()
                    toast.success('Week copied')
                  } else {
                    toast.info('No entries found from last week to copy')
                  }
                } },
                { icon: CheckCircle, label: 'Submit', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: handleApproveTimesheet },
                { icon: Lock, label: 'Lock', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: async () => {
                  // Lock all entries for the current week
                  if (dbTimeEntries && dbTimeEntries.length > 0) {
                    const weekEntries = dbTimeEntries.filter((e: any) => e.status === 'stopped' || e.status === 'approved')
                    for (const entry of weekEntries) {
                      await handleLockEntry(entry.id)
                    }
                    toast.info('Timesheet Locked')
                  } else {
                    toast.info('No entries to lock')
                  }
                }},
                { icon: Calendar, label: 'View Month', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setActiveTab('calendar') },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: handleExportTimesheet },
                { icon: Printer, label: 'Print', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => printContent() },
                { icon: Mail, label: 'Email', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => {
                  const weekTotal = dbTimeEntries && dbTimeEntries.length > 0
                    ? dbTimeEntries.reduce((sum: number, e: any) => sum + (e.duration_hours || 0), 0).toFixed(1)
                    : '42.5'
                  const subject = encodeURIComponent(`Timesheet for Week of ${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
                  const body = encodeURIComponent(`Please find my timesheet summary:\n\nTotal Hours: ${weekTotal}h\nWeek: ${weekDays[0].toLocaleDateString()} - ${weekDays[6].toLocaleDateString()}\n\nBest regards`)
                  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
                  toast.success('Email client opened')
                } },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={action.onClick}
                  className={"h-20 flex-col gap-2 " + action.color + " hover:scale-105 transition-all duration-200"}
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
                  <thead><tr className="bg-gray-50 dark:bg-gray-800"><th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase w-48">Project</th>{weekDays.map((day, idx) => <th key={idx} className={"py-3 px-4 text-center " + (day.toDateString() === new Date().toDateString() ? "bg-amber-50 dark:bg-amber-900/20" : "")}><div className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div><div className={"text-lg font-bold " + (day.toDateString() === new Date().toDateString() ? "text-amber-600" : "")}>{day.getDate()}</div></th>)}<th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Total</th></tr></thead>
                  <tbody>
                    {projects.filter(p => p.status === 'active').slice(0, 4).map(project => (
                      <tr key={project.id} className="border-t dark:border-gray-700">
                        <td className="py-3 px-4"><div className="flex items-center gap-2"><div className={"w-2 h-2 rounded-full bg-" + project.color + "-500"}></div><span className="font-medium text-sm">{project.name}</span></div><p className="text-xs text-gray-500">{project.client}</p></td>
                        {weekDays.map((day, dayIdx) => <td key={dayIdx} className={"py-3 px-4 text-center " + (day.toDateString() === new Date().toDateString() ? "bg-amber-50 dark:bg-amber-900/20" : "")}><Input type="text" className="w-16 text-center" placeholder="-" defaultValue={Math.random() > 0.6 ? (Math.random() * 4 + 1).toFixed(1) : ''} /></td>)}
                        <td className="py-3 px-4 text-center font-bold">{(Math.random() * 20 + 5).toFixed(1)}h</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-bold"><td className="py-3 px-4">Daily Total</td>{weekDays.map((day, dayIdx) => <td key={dayIdx} className={"py-3 px-4 text-center " + (day.toDateString() === new Date().toDateString() ? "bg-amber-50 dark:bg-amber-900/20" : "")}>{(Math.random() * 6 + 2).toFixed(1)}h</td>)}<td className="py-3 px-4 text-center text-amber-600">42.5h</td></tr>
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
                      <div key={i} className={"p-2 min-h-[100px] rounded-lg border " + (isCurrentMonth ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900") + " " + (isToday ? "border-amber-500 ring-1 ring-amber-500" : "border-transparent") + " hover:border-amber-300 cursor-pointer"}>
                        <div className={"text-sm " + (isCurrentMonth ? "" : "text-gray-400") + " " + (isToday ? "font-bold text-amber-600" : "")}>{day.getDate()}</div>
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
                  const summaryData = projects.map(p => ({
                    Project: p.name,
                    Client: p.client,
                    Hours: p.totalHours,
                    Rate: p.hourlyRate,
                    Revenue: p.spent,
                    Status: p.status
                  }))
                  downloadAsCsv(summaryData, `summary-report-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: TrendingUp, label: 'Trends', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => {
                  const trendsData = weekDays.map((day, idx) => ({
                    Date: day.toLocaleDateString(),
                    Hours: (Math.random() * 8 + 2).toFixed(1),
                    Billable: (Math.random() * 6 + 1).toFixed(1)
                  }))
                  downloadAsCsv(trendsData, `trends-report-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Users, label: 'By Team', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => {
                  const teamData = team.map(m => ({
                    Name: m.name,
                    Role: m.role,
                    'Today Hours': m.todayHours,
                    'Week Hours': m.weekHours,
                    'Active Project': m.activeProject || 'None',
                    Status: m.isOnline ? 'Online' : 'Offline'
                  }))
                  downloadAsCsv(teamData, `team-report-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Briefcase, label: 'By Project', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => {
                  const projectData = projects.map(p => ({
                    Project: p.name,
                    Client: p.client,
                    Status: p.status,
                    Hours: p.totalHours,
                    Budget: p.budget || 0,
                    Spent: p.spent
                  }))
                  downloadAsCsv(projectData, `project-report-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Building2, label: 'By Client', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => {
                  const clientData = clients.map(c => ({
                    Client: c.name,
                    Email: c.email,
                    Projects: c.projects,
                    'Total Billed': c.totalBilled,
                    Outstanding: c.outstandingBalance,
                    Status: c.status
                  }))
                  downloadAsCsv(clientData, `client-report-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: DollarSign, label: 'Revenue', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => {
                  const revenueData = invoices.map(inv => ({
                    Invoice: inv.number,
                    Client: inv.client,
                    Project: inv.project,
                    Amount: inv.amount,
                    Hours: inv.hours,
                    Status: inv.status,
                    'Due Date': inv.dueDate
                  }))
                  downloadAsCsv(revenueData, `revenue-report-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => {
                  const scheduleData = timeOff.map(t => ({
                    Employee: t.userName,
                    Type: t.type,
                    'Start Date': t.startDate,
                    'End Date': t.endDate,
                    Hours: t.hours,
                    Status: t.status
                  }))
                  downloadAsCsv(scheduleData, `schedule-report-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Download, label: 'Export All', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: handleExportTimesheet },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={action.onClick}
                  className={"h-20 flex-col gap-2 " + action.color + " hover:scale-105 transition-all duration-200"}
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
                          <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><div className={"w-3 h-3 rounded-full bg-" + project.color + "-500"}></div><span className="text-sm font-medium">{project.name}</span></div><span className="text-sm font-bold">{project.totalHours}h</span></div>
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
                        return <div key={idx} className="flex-1 flex flex-col items-center gap-2"><div className={"w-full rounded-t-lg " + (day.toDateString() === new Date().toDateString() ? "bg-amber-500" : "bg-amber-200")} style={{ height: ((hours / 10) * 100) + "%" }}></div><span className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span></div>
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
                      {savedReports.map(report => (
                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-amber-500" /><span className="font-medium">{report.name}</span></div></td>
                          <td className="px-4 py-4"><Badge variant="outline">{report.type}</Badge></td>
                          <td className="px-4 py-4 text-gray-500">{report.dateRange}</td>
                          <td className="px-4 py-4">{report.schedule || <span className="text-gray-400">Manual</span>}</td>
                          <td className="px-4 py-4 text-gray-500">{report.lastRun}</td>
                          <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => {
                            // Run the report - generate data based on report type
                            const reportData = report.type === 'summary'
                              ? projects.map(p => ({ Project: p.name, Hours: p.totalHours, Revenue: p.spent }))
                              : report.type === 'team'
                              ? team.map(m => ({ Name: m.name, Hours: m.weekHours }))
                              : report.type === 'project'
                              ? projects.map(p => ({ Project: p.name, Budget: p.budget, Spent: p.spent }))
                              : clients.map(c => ({ Client: c.name, Billed: c.totalBilled }))
                            downloadAsCsv(reportData, `${report.name.toLowerCase().replace(/ /g, '-')}-${new Date().toISOString().split('T')[0]}`)
                          }} title="Run report"><Play className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={handleExportTimesheet} title="Download"><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => { setSelectedReport(report); setShowReportDialog(true) }} title="Edit report"><Edit2 className="h-4 w-4" /></Button></div></td>
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
                          <td className="px-4 py-4"><div className="flex items-center gap-3"><div className={"w-10 h-10 rounded-lg bg-" + client.color + "-100 dark:bg-" + client.color + "-900/30 flex items-center justify-center"}><Building2 className={"h-5 w-5 text-" + client.color + "-600"} /></div><div><h4 className="font-medium">{client.name}</h4><p className="text-sm text-gray-500">{client.email}</p></div></div></td>
                          <td className="px-4 py-4 font-medium">{client.projects}</td>
                          <td className="px-4 py-4"><span className="font-bold text-emerald-600">${client.totalBilled.toLocaleString()}</span></td>
                          <td className="px-4 py-4">{client.outstandingBalance > 0 ? <span className="font-medium text-amber-600">${client.outstandingBalance.toLocaleString()}</span> : <span className="text-gray-400">$0</span>}</td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(client.status)}>{client.status}</Badge></td>
                          <td className="px-4 py-4"><Button variant="ghost" size="icon" onClick={() => { setSelectedClient(client); setShowClientDialog(true) }}><MoreHorizontal className="h-4 w-4" /></Button></td>
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
                          <div className="flex items-center gap-2"><div className={"w-3 h-3 rounded-full bg-" + tag.color + "-500"}></div><span className="font-medium">{tag.name}</span></div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setSelectedTag(tag); setShowTagDialog(true) }}><Edit2 className="h-3 w-3" /></Button>
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
                { icon: Plus, label: 'New Project', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowNewProjectDialog(true) },
                { icon: Users, label: 'Team View', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setActiveTab('team') },
                { icon: DollarSign, label: 'Budgets', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => {
                  // Export budget data
                  const budgetData = projects.filter(p => p.budget).map(p => ({
                    Project: p.name,
                    Client: p.client,
                    Budget: p.budget,
                    Spent: p.spent,
                    Remaining: (p.budget || 0) - p.spent,
                    'Percentage Used': ((p.spent / (p.budget || 1)) * 100).toFixed(1) + '%'
                  }))
                  downloadAsCsv(budgetData, `project-budgets-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Target, label: 'Milestones', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowMilestoneDialog(true) },
                { icon: Archive, label: 'Archive', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => {
                  const archivedProjects = projects.filter(p => p.status === 'completed' || p.status === 'archived')
                  if (archivedProjects.length > 0) {
                    toast.info('Archived projects')
                  } else {
                    toast.info('No archived projects')
                  }
                } },
                { icon: BarChart3, label: 'Analytics', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => {
                  // Export analytics data
                  const analyticsData = projects.map(p => ({
                    Project: p.name,
                    Client: p.client,
                    Status: p.status,
                    'Total Hours': p.totalHours,
                    'Hourly Rate': p.hourlyRate,
                    'Total Revenue': p.totalHours * p.hourlyRate,
                    Billable: p.billable ? 'Yes' : 'No'
                  }))
                  downloadAsCsv(analyticsData, `project-analytics-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Tag, label: 'Tags', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowTagDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: handleExportTimesheet },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={action.onClick}
                  className={"h-20 flex-col gap-2 " + action.color + " hover:scale-105 transition-all duration-200"}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Projects</CardTitle><Button onClick={() => setShowNewProjectDialog(true)}><Plus className="h-4 w-4 mr-2" />New Project</Button></CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {projects.map(project => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4"><div className="flex items-center gap-2"><div className={"w-3 h-3 rounded-full bg-" + project.color + "-500"}></div><span className="font-medium">{project.name}</span></div></td>
                        <td className="px-4 py-4 text-gray-500">{project.client}</td>
                        <td className="px-4 py-4">{project.billable ? `$${project.hourlyRate}/hr` : 'Non-billable'}</td>
                        <td className="px-4 py-4 font-medium">{project.totalHours}h</td>
                        <td className="px-4 py-4">{project.budget ? <div><span className="font-medium">${project.spent.toLocaleString()}</span><span className="text-gray-500"> / ${project.budget.toLocaleString()}</span><Progress value={(project.spent / project.budget) * 100} className="h-1 mt-1" /></div> : '-'}</td>
                        <td className="px-4 py-4"><Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge></td>
                        <td className="px-4 py-4"><Button variant="ghost" size="icon" onClick={() => {
                          const projectData = [{
                            Project: project.name,
                            Client: project.client,
                            Status: project.status,
                            Hours: project.totalHours,
                            Rate: project.hourlyRate,
                            Budget: project.budget || 'N/A',
                            Spent: project.spent
                          }]
                          downloadAsJson(projectData[0], `project-${project.name.toLowerCase().replace(/ /g, '-')}`)
                        }} title="Export project data"><MoreHorizontal className="h-4 w-4" /></Button></td>
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
                  // Export team time logs
                  const timeLogsData = team.map(m => ({
                    Name: m.name,
                    Role: m.role,
                    Email: m.email,
                    'Today Hours': m.todayHours,
                    'Week Hours': m.weekHours,
                    'Active Project': m.activeProject || 'None',
                    Status: m.isOnline ? 'Online' : 'Offline'
                  }))
                  downloadAsCsv(timeLogsData, `team-time-logs-${new Date().toISOString().split('T')[0]}`)
                } },
                { icon: Calendar, label: 'Schedule', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setActiveTab('calendar') },
                { icon: Coffee, label: 'Time Off', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setTeamTab('timeoff') },
                { icon: Target, label: 'Utilization', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setTeamTab('utilization') },
                { icon: BarChart3, label: 'Reports', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setActiveTab('reports') },
                { icon: Bell, label: 'Reminders', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowReminderDialog(true) },
                { icon: Plus, label: 'Add Member', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowTeamMemberDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={action.onClick}
                  className={"h-20 flex-col gap-2 " + action.color + " hover:scale-105 transition-all duration-200"}
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
                // Export team management data
                const teamExport = team.map(m => ({
                  Name: m.name,
                  Email: m.email,
                  Role: m.role,
                  'Today Hours': m.todayHours,
                  'Week Hours': m.weekHours,
                  'Utilization %': ((m.weekHours / 40) * 100).toFixed(0)
                }))
                downloadAsCsv(teamExport, `team-management-${new Date().toISOString().split('T')[0]}`)
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
                        <div className={"absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white " + (member.isOnline ? "bg-green-500" : "bg-gray-400")}></div>
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
                        const memberData = {
                          Name: member.name,
                          Email: member.email,
                          Role: member.role,
                          'Today Hours': member.todayHours,
                          'Week Hours': member.weekHours,
                          'Active Project': member.activeProject || 'None',
                          'Utilization': ((member.weekHours / 40) * 100).toFixed(0) + '%'
                        }
                        downloadAsJson(memberData, `team-member-${member.name.toLowerCase().replace(/ /g, '-')}`)
                      }} title="Export member data"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {teamTab === 'timeoff' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Time Off Requests</CardTitle><Button onClick={() => setShowTimeOffDialog(true)}><Plus className="h-4 w-4 mr-2" />Request Time Off</Button></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {timeOff.map(request => (
                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{request.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar><span className="font-medium">{request.userName}</span></div></td>
                          <td className="px-4 py-4"><Badge variant="outline" className={request.type === 'vacation' ? 'bg-blue-50 text-blue-700' : request.type === 'sick' ? 'bg-red-50 text-red-700' : 'bg-gray-50'}>{request.type}</Badge></td>
                          <td className="px-4 py-4 text-gray-500">{request.startDate} - {request.endDate}</td>
                          <td className="px-4 py-4 font-medium">{request.hours}h</td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(request.status)}>{request.status}</Badge></td>
                          <td className="px-4 py-4">{request.status === 'pending' && <div className="flex gap-1"><Button variant="ghost" size="icon" className="text-green-600" onClick={async () => {
                            if (confirm(`Approve time off request for ${request.userName}?`)) {
                              await apiPost('/api/time-off/approve', { requestId: request.id }, { loading: 'Approving...', success: 'Time off approved', error: 'Failed to approve' })
                            }
                          }} title="Approve request"><Check className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-600" onClick={async () => {
                            if (confirm(`Reject time off request for ${request.userName}?`)) {
                              await apiPost('/api/time-off/reject', { requestId: request.id }, { loading: 'Rejecting...', success: 'Time off rejected', error: 'Failed to reject' })
                            }
                          }} title="Reject request"><X className="h-4 w-4" /></Button></div>}</td>
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
                            <div className="flex items-center gap-2"><span className={"text-sm font-bold " + (utilization >= 100 ? "text-green-600" : utilization >= 80 ? "text-amber-600" : "text-red-600")}>{utilization.toFixed(0)}%</span>{utilization >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}</div>
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
                    <div><h4 className="font-medium mb-2">Time Off This Week</h4><div className="flex items-center gap-2">{timeOff.filter(t => t.status === 'approved').length > 0 ? timeOff.filter(t => t.status === 'approved').map(t => <Badge key={t.id} variant="outline">{t.userName.split(' ')[0]}: {t.type}</Badge>) : <span className="text-gray-500">No time off scheduled</span>}</div></div>
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
                { icon: Plus, label: 'New Invoice', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Clock, label: 'Auto-Bill', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Send, label: 'Send All', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: DollarSign, label: 'Record Pay', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: FileText, label: 'Templates', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Repeat, label: 'Recurring', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: BarChart3, label: 'Revenue', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={"h-20 flex-col gap-2 " + action.color + " hover:scale-105 transition-all duration-200"}
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
                        <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => {
                          // Export invoice as JSON for viewing
                          const invoiceData = {
                            'Invoice Number': invoice.number,
                            Client: invoice.client,
                            Project: invoice.project,
                            Amount: `$${invoice.amount.toLocaleString()}`,
                            Hours: invoice.hours,
                            Status: invoice.status,
                            'Due Date': invoice.dueDate,
                            'Created At': invoice.createdAt
                          }
                          downloadAsJson(invoiceData, `invoice-${invoice.number}`)
                        }} title="View invoice"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => {
                          // Open email client to send invoice
                          const subject = encodeURIComponent(`Invoice ${invoice.number} - ${invoice.project}`)
                          const body = encodeURIComponent(`Dear ${invoice.client},\n\nPlease find attached invoice ${invoice.number} for ${invoice.project}.\n\nAmount Due: $${invoice.amount.toLocaleString()}\nDue Date: ${invoice.dueDate}\n\nBest regards`)
                          window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
                          toast.success('Email client opened')
                        }} title="Send invoice"><Send className="h-4 w-4" /></Button></div></td>
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
                { icon: Settings, label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
                { icon: Clock, label: 'Tracking', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Bell, label: 'Alerts', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Network, label: 'Integrations', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: CreditCard, label: 'Billing', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Sliders, label: 'Advanced', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: RefreshCcw, label: 'Reset', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  onClick={() => action.id && setSettingsTab(action.id)}
                  className={"h-20 flex-col gap-2 " + action.color + " hover:scale-105 transition-all duration-200"}
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
                          className={"w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all " + (
                            settingsTab === item.id
                              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          )}
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
                        <Button onClick={() => setShowAddIntegrationDialog(true)}><Plus className="h-4 w-4 mr-2" />Add</Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {integrations.map(integration => (
                          <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={"w-10 h-10 rounded-lg flex items-center justify-center " + (integration.status === 'connected' ? "bg-green-100 dark:bg-green-900/30" : integration.status === 'error' ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-700")}>
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
                              <Button variant="ghost" size="sm" onClick={async () => {
                                await apiPost('/api/integrations/' + integration.id + '/sync', {}, { loading: 'Syncing ' + integration.name + '...', success: 'Sync completed', error: 'Sync failed' })
                              }}><RefreshCw className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setIntegrationToRemove(integration.id)}><X className="h-4 w-4" /></Button>
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
                            <Button size="sm" variant="outline" onClick={async () => {
                              const newKey = "tt_api_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                              setApiKey(newKey)
                              toast.success('API key regenerated')
                            }}><RefreshCw className="h-4 w-4 mr-2" />Regenerate</Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" value={apiKey} readOnly className="font-mono" />
                            <Button size="sm" variant="ghost" onClick={() => {
                              navigator.clipboard.writeText(apiKey)
                              toast.success('API key copied to clipboard')
                            }}>Copy</Button>
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
                            <Button variant="outline" className="mt-3">Change Plan</Button>
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
                        <Button className="bg-amber-500 hover:bg-amber-600">Update Billing</Button>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-purple-600" />Payment History</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[{date:'Dec 28, 2024',amt:'$180.00'},{date:'Nov 28, 2024',amt:'$180.00'},{date:'Oct 28, 2024',amt:'$165.00'}].map((inv,i)=>(
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div><p className="font-medium">{inv.date}</p><p className="text-sm text-gray-500">Premium Plan</p></div>
                              <div className="flex items-center gap-4"><span className="font-medium">{inv.amt}</span><Badge className="bg-green-100 text-green-700">Paid</Badge><Button variant="ghost" size="sm" onClick={() => {
                                const invoiceData = { Date: inv.date, Amount: inv.amt, Plan: 'Premium Plan', Status: 'Paid' }
                                downloadAsJson(invoiceData, "payment-receipt-" + inv.date.replace(/, /g, '-').replace(/ /g, '-'))
                              }}><Download className="h-4 w-4" /></Button></div>
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
                          <Button variant="outline" className="flex-1" onClick={() => {
                            const exportData = { entries: mockTimeEntries, projects: projects, exportDate: new Date().toISOString() }
                            downloadAsJson(exportData, "time-tracking-export-" + new Date().toISOString().split('T')[0])
                            toast.success('Data exported successfully')
                          }}><Download className="h-4 w-4 mr-2" />Export All</Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowArchiveProjectsDialog(true)}><Archive className="h-4 w-4 mr-2" />Archive Projects</Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-red-200 dark:border-red-800">
                      <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertOctagon className="h-5 w-5" />Danger Zone</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Clear Time Entries</Label><p className="text-sm text-red-600/70">Delete all tracking data</p></div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700" onClick={() => setShowClearEntriesDialog(true)}><TrashIcon className="h-4 w-4 mr-2" />Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Delete Workspace</Label><p className="text-sm text-red-600/70">Permanently delete</p></div>
                          <Button variant="destructive" onClick={() => setShowDeleteWorkspaceDialog(true)}><AlertOctagon className="h-4 w-4 mr-2" />Delete</Button>
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
              insights={timeTrackingAIInsights}
              title="Time Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={timeTrackingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={timeTrackingPredictions}
              title="Time Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={timeTrackingActivities}
            title="Time Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={timeTrackingQuickActions}
            variant="grid"
          />
        </div>

        {/* Entry Dialog */}
        <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add Time Entry</DialogTitle><DialogDescription>Manually log a time entry</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Description</Label><Input placeholder="What did you work on?" className="mt-1" value={newEntryForm.description} onChange={(e) => setNewEntryForm(prev => ({ ...prev, description: e.target.value }))} /></div>
              <div><Label>Project</Label><Select value={newEntryForm.projectId} onValueChange={(value) => setNewEntryForm(prev => ({ ...prev, projectId: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.client}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Date</Label><Input type="date" className="mt-1" value={newEntryForm.date} onChange={(e) => setNewEntryForm(prev => ({ ...prev, date: e.target.value }))} /></div><div><Label>Duration</Label><Input placeholder="1h 30m" className="mt-1" value={newEntryForm.duration} onChange={(e) => setNewEntryForm(prev => ({ ...prev, duration: e.target.value }))} /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Start Time</Label><Input type="time" className="mt-1" value={newEntryForm.startTime} onChange={(e) => setNewEntryForm(prev => ({ ...prev, startTime: e.target.value }))} /></div><div><Label>End Time</Label><Input type="time" className="mt-1" value={newEntryForm.endTime} onChange={(e) => setNewEntryForm(prev => ({ ...prev, endTime: e.target.value }))} /></div></div>
              <div className="flex items-center gap-2"><Switch id="billable" checked={newEntryForm.isBillable} onCheckedChange={(checked) => setNewEntryForm(prev => ({ ...prev, isBillable: checked }))} /><Label htmlFor="billable">Billable</Label></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowEntryDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={handleCreateManualEntry} disabled={entriesLoading || !newEntryForm.description || !newEntryForm.projectId}>{entriesLoading ? 'Saving...' : 'Save Entry'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create Invoice</DialogTitle><DialogDescription>Generate invoice from tracked time</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Client</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{[...new Set(projects.map(p => p.client))].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Project</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>From Date</Label><Input type="date" className="mt-1" /></div><div><Label>To Date</Label><Input type="date" className="mt-1" /></div></div>
              <div><Label>Due Date</Label><Input type="date" className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Generate Invoice</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client Dialog */}
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add New Client</DialogTitle><DialogDescription>Create a new client for billing and project tracking</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Client Name</Label><Input placeholder="Company name" className="mt-1" /></div><div><Label>Email</Label><Input type="email" placeholder="billing@company.com" className="mt-1" /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Phone</Label><Input placeholder="+1 555-0100" className="mt-1" /></div><div><Label>Currency</Label><Select defaultValue="USD"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="CAD">CAD</SelectItem></SelectContent></Select></div></div>
              <div><Label>Address</Label><Input placeholder="123 Business Ave, City, State ZIP" className="mt-1" /></div>
              <div><Label>Notes</Label><Input placeholder="Additional notes about this client" className="mt-1" /></div>
              <div><Label>Default Hourly Rate</Label><Input type="number" placeholder="150" className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowClientDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Create Client</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tag Dialog */}
        <Dialog open={showTagDialog} onOpenChange={(open) => { setShowTagDialog(open); if (!open) setSelectedTag(null); }}>
          <DialogContent><DialogHeader><DialogTitle>{selectedTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle><DialogDescription>{selectedTag ? 'Editing tag: ' + selectedTag.name : 'Add a tag to categorize time entries'}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Tag Name</Label><Input placeholder="e.g., development, meeting, review" className="mt-1" defaultValue={selectedTag?.name || ''} /></div>
              <div><Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {['red', 'orange', 'amber', 'green', 'blue', 'indigo', 'purple', 'pink'].map(color => (
                    <button key={color} className={"w-8 h-8 rounded-full bg-" + color + "-500 hover:ring-2 hover:ring-" + color + "-300 transition-all " + (selectedTag?.color === color ? "ring-2 ring-offset-2" : "")} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setShowTagDialog(false); setSelectedTag(null); }}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">{selectedTag ? 'Save Changes' : 'Create Tag'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Builder Dialog */}
        <Dialog open={showReportDialog} onOpenChange={(open) => { setShowReportDialog(open); if (!open) setSelectedReport(null); }}>
          <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>{selectedReport ? 'Edit Report' : 'Create New Report'}</DialogTitle><DialogDescription>{selectedReport ? 'Editing: ' + selectedReport.name : 'Build a custom report with your preferred filters'}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Report Name</Label><Input placeholder="My Custom Report" className="mt-1" defaultValue={selectedReport?.name || ''} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Report Type</Label><Select defaultValue={selectedReport?.type}><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="summary">Summary</SelectItem><SelectItem value="detailed">Detailed</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="project">By Project</SelectItem><SelectItem value="client">By Client</SelectItem><SelectItem value="team">Team</SelectItem></SelectContent></Select></div>
                <div><Label>Date Range</Label><Select defaultValue={selectedReport?.dateRange}><SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger><SelectContent><SelectItem value="week">This Week</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="quarter">This Quarter</SelectItem><SelectItem value="year">This Year</SelectItem><SelectItem value="custom">Custom Range</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Filters</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-amber-50">All Projects</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-amber-50">Billable Only</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-amber-50">All Team Members</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-amber-50">Active Clients</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div><p className="font-medium">Schedule Report</p><p className="text-sm text-gray-500">Automatically run and email this report</p></div>
                <Switch defaultChecked={!!selectedReport?.schedule} />
              </div>
              <div><Label>Group By</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select grouping" /></SelectTrigger><SelectContent><SelectItem value="day">Day</SelectItem><SelectItem value="week">Week</SelectItem><SelectItem value="project">Project</SelectItem><SelectItem value="client">Client</SelectItem><SelectItem value="member">Team Member</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setShowReportDialog(false); setSelectedReport(null); }}>Cancel</Button><Button variant="outline" onClick={() => setShowReportPreviewDialog(true)}><Eye className="h-4 w-4 mr-2" />Preview</Button><Button className="bg-amber-500 hover:bg-amber-600">{selectedReport ? 'Save Changes' : 'Save Report'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Project Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create New Project</DialogTitle><DialogDescription>Add a new project for time tracking</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Project Name</Label><Input placeholder="e.g., Website Redesign" className="mt-1" /></div>
              <div><Label>Client</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{[...new Set(projects.map(p => p.client))].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Hourly Rate</Label><Input type="number" placeholder="150" className="mt-1" /></div>
                <div><Label>Budget</Label><Input type="number" placeholder="20000" className="mt-1" /></div>
              </div>
              <div className="flex items-center gap-2"><Switch id="project-billable" defaultChecked /><Label htmlFor="project-billable">Billable Project</Label></div>
              <div><Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {['red', 'orange', 'amber', 'green', 'blue', 'indigo', 'purple', 'pink'].map(color => (
                    <button key={color} className={"w-8 h-8 rounded-full bg-" + color + "-500 hover:ring-2 hover:ring-" + color + "-300 transition-all"} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Create Project</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Off Request Dialog */}
        <Dialog open={showTimeOffDialog} onOpenChange={setShowTimeOffDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Request Time Off</DialogTitle><DialogDescription>Submit a time off request for approval</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Type</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="vacation">Vacation</SelectItem><SelectItem value="sick">Sick Leave</SelectItem><SelectItem value="personal">Personal</SelectItem><SelectItem value="holiday">Holiday</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Start Date</Label><Input type="date" className="mt-1" /></div>
                <div><Label>End Date</Label><Input type="date" className="mt-1" /></div>
              </div>
              <div><Label>Estimated Hours</Label><Input type="number" placeholder="8" className="mt-1" /></div>
              <div><Label>Notes</Label><Input placeholder="Reason for time off request" className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowTimeOffDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Submit Request</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Integration Dialog */}
        <Dialog open={showAddIntegrationDialog} onOpenChange={setShowAddIntegrationDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add Integration</DialogTitle><DialogDescription>Connect a third-party service</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[{name:'Google Calendar', icon:'📅', type:'calendar'},{name:'Asana', icon:'📋', type:'project'},{name:'QuickBooks', icon:'💰', type:'accounting'},{name:'Slack', icon:'💬', type:'communication'},{name:'Salesforce', icon:'☁️', type:'crm'},{name:'Jira', icon:'🎯', type:'project'}].map(app => (
                  <button key={app.name} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" onClick={async () => {
                    await apiPost('/api/integrations', { name: app.name, type: app.type }, { loading: 'Connecting ' + app.name + '...', success: app.name + ' connected successfully', error: 'Connection failed' })
                    setShowAddIntegrationDialog(false)
                  }}>
                    <span className="text-2xl">{app.icon}</span>
                    <div><p className="font-medium">{app.name}</p><p className="text-xs text-gray-500">{app.type}</p></div>
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowAddIntegrationDialog(false)}>Cancel</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Integration Confirmation Dialog */}
        <Dialog open={!!integrationToRemove} onOpenChange={(open) => !open && setIntegrationToRemove(null)}>
          <DialogContent><DialogHeader><DialogTitle>Remove Integration</DialogTitle><DialogDescription>Are you sure you want to disconnect this integration? You can reconnect it later.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIntegrationToRemove(null)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                await apiPost('/api/integrations/' + integrationToRemove + '/disconnect', {}, { loading: 'Disconnecting...', success: 'Integration removed', error: 'Failed to disconnect' })
                setIntegrationToRemove(null)
              }}>Remove</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Preview Dialog */}
        <Dialog open={showReportPreviewDialog} onOpenChange={setShowReportPreviewDialog}>
          <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Report Preview</DialogTitle><DialogDescription>Preview of your custom report</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-bold text-lg mb-4">Time Summary Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                  <div className="p-3 bg-white dark:bg-gray-700 rounded"><p className="text-sm text-gray-500">Total Hours</p><p className="text-2xl font-bold">164.5h</p></div>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded"><p className="text-sm text-gray-500">Billable</p><p className="text-2xl font-bold text-green-600">142.0h</p></div>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded"><p className="text-sm text-gray-500">Revenue</p><p className="text-2xl font-bold">$21,300</p></div>
                </div>
                <div className="space-y-2">
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between p-2 bg-white dark:bg-gray-700 rounded"><span>{p.name}</span><span className="font-medium">{Math.floor(Math.random() * 40 + 10)}h</span></div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowReportPreviewDialog(false)}>Close</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={() => {
              toast.success('Report exported')
              setShowReportPreviewDialog(false)
            }}><Download className="h-4 w-4 mr-2" />Export</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Projects Dialog */}
        <Dialog open={showArchiveProjectsDialog} onOpenChange={setShowArchiveProjectsDialog}>
          <DialogContent><DialogHeader><DialogTitle>Archive Projects</DialogTitle><DialogDescription>Select projects to archive. Archived projects will be hidden but not deleted.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              {projects.filter(p => p.status === 'completed').slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-sm text-gray-500">{p.client} • Completed</p></div>
                </div>
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowArchiveProjectsDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600" onClick={async () => {
              await apiPost('/api/projects/archive', { projectIds: [] }, { loading: 'Archiving projects...', success: 'Projects archived', error: 'Archive failed' })
              setShowArchiveProjectsDialog(false)
            }}><Archive className="h-4 w-4 mr-2" />Archive Selected</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Time Entries Confirmation */}
        <Dialog open={showClearEntriesDialog} onOpenChange={setShowClearEntriesDialog}>
          <DialogContent><DialogHeader><DialogTitle className="text-red-600">Clear All Time Entries</DialogTitle><DialogDescription>This action cannot be undone. All time tracking data will be permanently deleted.</DialogDescription></DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Type <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">DELETE</span> to confirm:</p>
              <Input className="mt-2" placeholder="Type DELETE to confirm" id="confirm-clear" />
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowClearEntriesDialog(false)}>Cancel</Button><Button variant="destructive" onClick={async () => {
              const input = document.getElementById('confirm-clear') as HTMLInputElement
              if (input?.value !== 'DELETE') { toast.error('Please type DELETE to confirm'); return }
              await apiPost('/api/time-entries/clear', {}, { loading: 'Clearing entries...', success: 'All time entries cleared', error: 'Failed to clear entries' })
              setShowClearEntriesDialog(false)
            }}><TrashIcon className="h-4 w-4 mr-2" />Clear All</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Workspace Confirmation */}
        <Dialog open={showDeleteWorkspaceDialog} onOpenChange={setShowDeleteWorkspaceDialog}>
          <DialogContent><DialogHeader><DialogTitle className="text-red-600">Delete Workspace</DialogTitle><DialogDescription>This will permanently delete your workspace, all projects, time entries, and settings. This cannot be undone.</DialogDescription></DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Type <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">DELETE WORKSPACE</span> to confirm:</p>
              <Input className="mt-2" placeholder="Type DELETE WORKSPACE to confirm" id="confirm-delete-workspace" />
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowDeleteWorkspaceDialog(false)}>Cancel</Button><Button variant="destructive" onClick={async () => {
              const input = document.getElementById('confirm-delete-workspace') as HTMLInputElement
              if (input?.value !== 'DELETE WORKSPACE') { toast.error('Please type DELETE WORKSPACE to confirm'); return }
              await apiPost('/api/workspace/delete', {}, { loading: 'Deleting workspace...', success: 'Workspace deleted', error: 'Failed to delete workspace' })
              setShowDeleteWorkspaceDialog(false)
            }}><AlertOctagon className="h-4 w-4 mr-2" />Delete Workspace</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
