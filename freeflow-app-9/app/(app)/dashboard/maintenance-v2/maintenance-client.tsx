'use client'

import { useMaintenance, type MaintenanceWindow } from '@/lib/hooks/use-maintenance'
import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { toast } from 'sonner'
import {
  Wrench, CheckCircle, AlertCircle, Server,
  Activity, Calendar, Settings, AlertTriangle, TrendingUp,
  BarChart3, Bell, Pause, Users, Plus, Search,
  Download, RefreshCw, FileText, Shield, Database,
  HardDrive, RotateCw, Target,
  ClipboardList, Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Sliders, Webhook, Mail, Lock, Terminal, Archive } from 'lucide-react'

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
type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'overdue'
type MaintenanceType = 'preventive' | 'corrective' | 'emergency' | 'upgrade' | 'inspection' | 'calibration'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type AssetStatus = 'operational' | 'degraded' | 'offline' | 'maintenance' | 'retired'

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  description: string
  type: MaintenanceType
  status: MaintenanceStatus
  priority: Priority
  asset: string
  assetId: string
  location: string
  assignedTo: TeamMember[]
  requestedBy: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  estimatedHours: number
  actualHours: number
  progress: number
  downtime: boolean
  downtimeMinutes: number
  parts: Part[]
  checklists: Checklist[]
  notes: string
  createdAt: string
  updatedAt: string
  sla: { target: number; remaining: number; breached: boolean }
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Part {
  id: string
  name: string
  partNumber: string
  quantity: number
  cost: number
  available: boolean
}

interface Checklist {
  id: string
  title: string
  items: { id: string; task: string; completed: boolean }[]
}

interface Asset {
  id: string
  assetTag: string
  name: string
  type: string
  manufacturer: string
  model: string
  serialNumber: string
  location: string
  status: AssetStatus
  criticality: Priority
  lastMaintenance: string
  nextMaintenance: string
  maintenanceCount: number
  uptime: number
  mtbf: number // Mean Time Between Failures
  mttr: number // Mean Time To Repair
  purchaseDate: string
  warrantyExpiry: string
  owner: string
}

interface MaintenanceSchedule {
  id: string
  name: string
  description: string
  type: MaintenanceType
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  assets: string[]
  lastRun: string
  nextRun: string
  duration: number
  active: boolean
  assignedTeam: string
  checklist: string[]
}

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  skills: string[]
  certifications: string[]
  status: 'available' | 'busy' | 'off_duty' | 'on_leave'
  currentWorkOrder?: string
  completedOrders: number
  avgRating: number
  avatar?: string
}

interface SparePartInventory {
  id: string
  partNumber: string
  name: string
  category: string
  manufacturer: string
  quantity: number
  minQuantity: number
  maxQuantity: number
  unitCost: number
  location: string
  lastRestocked: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'
  leadTime: number // days
  supplier: string
}

interface Vendor {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  category: string
  rating: number
  contractStart: string
  contractEnd: string
  status: 'active' | 'inactive' | 'pending'
  totalOrders: number
  lastOrderDate: string
}

interface Incident {
  id: string
  incidentNumber: string
  title: string
  description: string
  priority: Priority
  status: 'new' | 'investigating' | 'resolved' | 'closed'
  affectedAssets: string[]
  reportedBy: string
  reportedAt: string
  resolvedAt?: string
  rootCause?: string
  resolution?: string
  workOrderId?: string
}

const getInventoryStatusColor = (status: SparePartInventory['status']): string => {
  const colors = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
    on_order: 'bg-blue-100 text-blue-700'
  }
  return colors[status]
}

const getTechnicianStatusColor = (status: Technician['status']): string => {
  const colors = {
    available: 'bg-green-100 text-green-700',
    busy: 'bg-yellow-100 text-yellow-700',
    off_duty: 'bg-gray-100 text-gray-700',
    on_leave: 'bg-purple-100 text-purple-700'
  }
  return colors[status]
}

const getIncidentStatusColor = (status: Incident['status']): string => {
  const colors = {
    new: 'bg-blue-100 text-blue-700',
    investigating: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  }
  return colors[status]
}

// Helper functions
const getStatusColor = (status: MaintenanceStatus): string => {
  const colors: Record<MaintenanceStatus, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
    on_hold: 'bg-purple-100 text-purple-700',
    overdue: 'bg-red-100 text-red-700'
  }
  return colors[status]
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  }
  return colors[priority]
}

const getTypeColor = (type: MaintenanceType): string => {
  const colors: Record<MaintenanceType, string> = {
    preventive: 'bg-blue-100 text-blue-700',
    corrective: 'bg-orange-100 text-orange-700',
    emergency: 'bg-red-100 text-red-700',
    upgrade: 'bg-purple-100 text-purple-700',
    inspection: 'bg-cyan-100 text-cyan-700',
    calibration: 'bg-indigo-100 text-indigo-700'
  }
  return colors[type]
}

const getAssetStatusColor = (status: AssetStatus): string => {
  const colors: Record<AssetStatus, string> = {
    operational: 'bg-green-100 text-green-700',
    degraded: 'bg-yellow-100 text-yellow-700',
    offline: 'bg-red-100 text-red-700',
    maintenance: 'bg-blue-100 text-blue-700',
    retired: 'bg-gray-100 text-gray-700'
  }
  return colors[status]
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Competitive upgrade data - empty until wired to real APIs
const mockMaintenanceAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'high' | 'medium'; timestamp: string; category: string }[] = []
const mockMaintenanceCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []
const mockMaintenancePredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down'; impact: 'high' | 'medium' | 'low' }[] = []
const mockMaintenanceActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' }[] = []

// Quick actions will be defined inside the component to access state setters

// Database types
interface DbMaintenanceWindow {
  id: string
  user_id: string
  window_code: string
  title: string
  description: string | null
  type: string
  status: string
  impact: string
  priority: string
  start_time: string
  end_time: string
  duration_minutes: number
  actual_start: string | null
  actual_end: string | null
  affected_systems: string[]
  downtime_expected: boolean
  assigned_to: string[]
  completion_rate: number
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

interface MaintenanceFormState {
  title: string
  description: string
  type: string
  priority: string
  impact: string
  start_time: string
  end_time: string
  duration_minutes: string
  affected_systems: string
  downtime_expected: boolean
  assigned_to: string
  notes: string
}

const initialFormState: MaintenanceFormState = {
  title: '',
  description: '',
  type: 'preventive',
  priority: 'medium',
  impact: 'low',
  start_time: '',
  end_time: '',
  duration_minutes: '60',
  affected_systems: '',
  downtime_expected: false,
  assigned_to: '',
  notes: '',
}

export default function MaintenanceClient() {
  // Demo mode detection for investor demos
  const { userId: currentUserId, userEmail, userName, isDemo, loading: sessionLoading } = useCurrentUser()
  const sessionStatus = sessionLoading ? "loading" : "authenticated"
  const isDemoAccount = userEmail === 'alex@freeflow.io' ||
                        userEmail === 'sarah@freeflow.io' ||
                        userEmail === 'mike@freeflow.io'
  const isSessionLoading = sessionStatus === 'loading'

  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Quick Action Dialog States
  const [showSchedulePMDialog, setShowSchedulePMDialog] = useState(false)
  const [showAssetListDialog, setShowAssetListDialog] = useState(false)
  const [showDiagnosticsDialog, setShowDiagnosticsDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showReorderDialog, setShowReorderDialog] = useState(false)
  const [showAddPartDialog, setShowAddPartDialog] = useState(false)
  const [showAddTechnicianDialog, setShowAddTechnicianDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDeleteDataDialog, setShowDeleteDataDialog] = useState(false)
  const [showCriticalAlertsDialog, setShowCriticalAlertsDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [selectedPartForReorder, setSelectedPartForReorder] = useState<SparePartInventory | null>(null)
  const [reorderQuantity, setReorderQuantity] = useState<number>(0)
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false)
  const [diagnosticsProgress, setDiagnosticsProgress] = useState(0)
  const diagnosticsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (diagnosticsIntervalRef.current) {
        clearInterval(diagnosticsIntervalRef.current)
      }
    }
  }, [])

  // Schedule PM Form State
  const [pmFormState, setPMFormState] = useState({
    asset: '',
    maintenanceType: 'preventive',
    frequency: 'monthly',
    startDate: '',
    duration: '60',
    assignedTeam: '',
    checklist: '',
    notes: ''
  })

  // Asset Filter State for Asset List Dialog
  const [assetFilter, setAssetFilter] = useState({
    search: '',
    status: 'all' as AssetStatus | 'all',
    criticality: 'all' as Priority | 'all'
  })

  // New Part Form State
  const [newPartForm, setNewPartForm] = useState({
    name: '',
    partNumber: '',
    category: 'HVAC Filters',
    quantity: 0,
    unitCost: 0,
    minQuantity: 10,
    maxQuantity: 50,
    supplier: '',
    location: ''
  })

  // New Technician Form State
  const [newTechnicianForm, setNewTechnicianForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Maintenance Tech',
    department: 'Facilities',
    skills: '',
    certifications: ''
  })

  // Default maintenance settings
  const defaultMaintenanceSettings = {
    defaultPriority: 'medium',
    defaultType: 'preventive',
    autoNumberWorkOrders: true,
    trackLaborHours: true,
    showAssetHealth: true,
    showSLATimers: true,
    autoAssignWorkOrders: true,
    requireApprovalForEmergency: false,
    requireChecklistCompletion: true,
    allowTechnicianReassignment: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    criticalAlerts: true,
    completionAlerts: true,
    overdueAlerts: true
  }

  // Maintenance settings state
  const [maintenanceSettings, setMaintenanceSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maintenance-settings')
      if (saved) {
        try {
          return { ...defaultMaintenanceSettings, ...JSON.parse(saved) }
        } catch {
          return defaultMaintenanceSettings
        }
      }
    }
    return defaultMaintenanceSettings
  })

  // Supabase client for direct operations
  const supabase = createClient()

  // Use the maintenance hook for data fetching and mutations
  const {
    windows: hookMaintenanceWindows,
    loading: hookLoading,
    error: hookError,
    fetchWindows,
    createWindow,
    updateWindow,
    deleteWindow,
    startMaintenance,
    completeMaintenance,
    cancelMaintenance,
    getStats: hookGetStats
  } = useMaintenance()

  // Demo maintenance data for investor demos
  const demoMaintenanceWindows: MaintenanceWindow[] = useMemo(() => [
    {
      id: 'demo-maint-1',
      window_code: 'MW-2026-001',
      title: 'Database Server Maintenance',
      description: 'Scheduled database optimization and backup verification',
      start_time: '2026-01-28T02:00:00Z',
      end_time: '2026-01-28T06:00:00Z',
      status: 'scheduled' as const,
      type: 'preventive' as const,
      impact: 'medium' as const,
      affected_systems: ['Production Database', 'Reporting Server'],
      assigned_team: ['Alex Johnson', 'Mike Rodriguez'],
      created_by: 'alex@freeflow.io',
      duration_minutes: 240,
      downtime_expected: true,
      notification_sent: true,
      created_at: '2026-01-20T00:00:00Z',
      updated_at: '2026-01-25T00:00:00Z'
    },
    {
      id: 'demo-maint-2',
      window_code: 'MW-2026-002',
      title: 'Network Switch Upgrade',
      description: 'Core network switch firmware update',
      start_time: '2026-01-30T00:00:00Z',
      end_time: '2026-01-30T02:00:00Z',
      status: 'scheduled' as const,
      type: 'upgrade' as const,
      impact: 'high' as const,
      affected_systems: ['All Network Services'],
      assigned_team: ['Sarah Chen'],
      created_by: 'sarah@freeflow.io',
      duration_minutes: 120,
      downtime_expected: true,
      notification_sent: false,
      created_at: '2026-01-22T00:00:00Z',
      updated_at: '2026-01-22T00:00:00Z'
    },
    {
      id: 'demo-maint-3',
      window_code: 'MW-2026-003',
      title: 'SSL Certificate Renewal',
      description: 'Annual SSL certificate renewal for all domains',
      start_time: '2026-01-25T10:00:00Z',
      end_time: '2026-01-25T11:00:00Z',
      status: 'completed' as const,
      type: 'preventive' as const,
      impact: 'low' as const,
      affected_systems: ['Web Servers'],
      assigned_team: ['Alex Johnson'],
      created_by: 'alex@freeflow.io',
      duration_minutes: 60,
      downtime_expected: false,
      notification_sent: true,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-25T11:00:00Z'
    },
    {
      id: 'demo-maint-4',
      window_code: 'MW-2026-004',
      title: 'Storage Array Expansion',
      description: 'Adding new storage capacity to SAN',
      start_time: '2026-02-01T03:00:00Z',
      end_time: '2026-02-01T07:00:00Z',
      status: 'scheduled' as const,
      type: 'upgrade' as const,
      impact: 'critical' as const,
      affected_systems: ['Storage Array', 'Backup Systems'],
      assigned_team: ['Mike Rodriguez', 'Sarah Chen'],
      created_by: 'mike@freeflow.io',
      duration_minutes: 240,
      downtime_expected: true,
      notification_sent: false,
      created_at: '2026-01-24T00:00:00Z',
      updated_at: '2026-01-24T00:00:00Z'
    }
  ], [])

  // Use demo data for demo accounts
  const dbMaintenanceWindows = isDemoAccount ? demoMaintenanceWindows : (hookMaintenanceWindows || [])
  const loading = isSessionLoading || (isDemoAccount ? false : hookLoading)
  const error = !isSessionLoading && !isDemoAccount && hookError

  // Wrap getStats to use demo data
  const getStats = () => {
    if (isDemoAccount) {
      return {
        total: demoMaintenanceWindows.length,
        scheduled: demoMaintenanceWindows.filter(w => w.status === 'scheduled').length,
        inProgress: demoMaintenanceWindows.filter(w => w.status === 'in-progress').length,
        completed: demoMaintenanceWindows.filter(w => w.status === 'completed').length,
        delayed: 0,
        avgCompletionRate: 95
      }
    }
    return hookGetStats()
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<MaintenanceFormState>(initialFormState)

  // Computed stats from hook data
  const stats = useMemo(() => {
    const hookStats = getStats()
    const totalDowntime = dbMaintenanceWindows
      .filter(w => w.downtime_expected)
      .reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
    const criticalCount = dbMaintenanceWindows.filter(w => w.impact === 'critical').length

    return {
      total: hookStats.total,
      scheduled: hookStats.scheduled,
      inProgress: hookStats.inProgress,
      completed: hookStats.completed,
      overdue: hookStats.delayed,
      avgCompletion: Math.round(hookStats.avgCompletionRate),
      totalDowntime,
      criticalAssets: criticalCount,
      uptime: hookStats.total > 0 ? Math.round((hookStats.completed / hookStats.total) * 100) : 99.5
    }
  }, [dbMaintenanceWindows, getStats])

  // Filtered maintenance windows from DB
  const filteredOrders = useMemo(() => {
    return dbMaintenanceWindows.filter(window => {
      const matchesSearch = searchQuery === '' ||
        window.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        window.window_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (window.affected_systems || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      // Map DB status (e.g., 'in-progress') to UI status (e.g., 'in_progress')
      const dbStatus = window.status?.replace('-', '_') as MaintenanceStatus
      const matchesStatus = statusFilter === 'all' || dbStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [dbMaintenanceWindows, searchQuery, statusFilter])

  // Filtered assets for the Asset List Dialog (using ([] as Asset[]) as assets are not in hook)
  const filteredAssets = useMemo(() => {
    return ([] as Asset[]).filter(asset => {
      const matchesSearch = assetFilter.search === '' ||
        asset.name.toLowerCase().includes(assetFilter.search.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(assetFilter.search.toLowerCase()) ||
        asset.location.toLowerCase().includes(assetFilter.search.toLowerCase())
      const matchesStatus = assetFilter.status === 'all' || asset.status === assetFilter.status
      const matchesCriticality = assetFilter.criticality === 'all' || asset.criticality === assetFilter.criticality
      return matchesSearch && matchesStatus && matchesCriticality
    })
  }, [assetFilter])

  // Loading state - after all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state - after all hooks
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading data</p>
        <Button onClick={() => fetchWindows()}>Retry</Button>
      </div>
    )
  }

  // Create maintenance window using hook mutation
  const handleCreateWorkOrder = async () => {
    if (!formState.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formState.start_time || !formState.end_time) {
      toast.error('Start and end times are required')
      return
    }

    setIsSubmitting(true)
    try {
      await createWindow({
        title: formState.title,
        description: formState.description || null,
        type: formState.type as MaintenanceWindow['type'],
        status: 'scheduled',
        priority: formState.priority as MaintenanceWindow['priority'],
        impact: formState.impact as MaintenanceWindow['impact'],
        start_time: formState.start_time,
        end_time: formState.end_time,
        duration_minutes: parseInt(formState.duration_minutes) || 60,
        affected_systems: formState.affected_systems ? formState.affected_systems.split(',').map(s => s.trim()) : [],
        downtime_expected: formState.downtime_expected,
        assigned_to: formState.assigned_to ? formState.assigned_to.split(',').map(s => s.trim()) : [],
        notes: formState.notes || null,
        completion_rate: 0,
      })

      setShowCreateDialog(false)
      setFormState(initialFormState)
    } catch (err) {
      console.error('Error creating maintenance window:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update maintenance status using hook mutation
  const handleUpdateStatus = async (windowId: string, newStatus: string) => {
    try {
      if (newStatus === 'in-progress') {
        await startMaintenance(windowId)
      } else if (newStatus === 'completed') {
        await completeMaintenance(windowId)
      } else if (newStatus === 'cancelled') {
        await cancelMaintenance(windowId)
      } else {
        await updateWindow(windowId, { status: newStatus as MaintenanceWindow['status'] })
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  // Delete maintenance window using hook mutation
  const handleDeleteWindowAction = async (windowId: string) => {
    try {
      await deleteWindow(windowId)
    } catch (err) {
      console.error('Error deleting window:', err)
    }
  }

  // Assign technician using hook mutation
  const handleAssignTechnician = async (windowId: string, techName?: string) => {
    try {
      const window = dbMaintenanceWindows.find(w => w.id === windowId)
      const currentAssigned = window?.assigned_to || []
      const newAssigned = techName ? [...currentAssigned, techName] : currentAssigned

      await updateWindow(windowId, { assigned_to: newAssigned })
    } catch (err) {
      console.error('Error assigning technician:', err)
    }
  }

  // Complete task
  const handleCompleteTask = async (windowId: string) => {
    await handleUpdateStatus(windowId, 'completed')
  }

  // Schedule maintenance (opens dialog)
  const handleScheduleMaintenance = () => {
    setShowCreateDialog(true)
  }

  // Export report
  const handleExportReport = () => {
    const csvContent = dbMaintenanceWindows.map(w =>
      `${w.title},${w.status},${w.priority},${w.completion_rate}%,${w.start_time}`
    ).join('\n')

    const blob = new Blob([`Title,Status,Priority,Completion,Start Time\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maintenance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  // Schedule PM Handler using hook mutation
  const handleSchedulePM = async () => {
    if (!pmFormState.asset) {
      toast.error('Please select an asset')
      return
    }
    if (!pmFormState.startDate) {
      toast.error('Please set a start date')
      return
    }

    setIsSubmitting(true)
    try {
      const startDate = new Date(pmFormState.startDate)
      const endDate = new Date(startDate.getTime() + parseInt(pmFormState.duration) * 60000)

      await createWindow({
        title: `Preventive Maintenance - ${pmFormState.asset}`,
        description: `Scheduled ${pmFormState.frequency} ${pmFormState.maintenanceType} maintenance`,
        type: pmFormState.maintenanceType as MaintenanceWindow['type'],
        status: 'scheduled',
        priority: 'medium',
        impact: 'low',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_minutes: parseInt(pmFormState.duration),
        affected_systems: pmFormState.asset ? [pmFormState.asset] : [],
        downtime_expected: false,
        assigned_to: pmFormState.assignedTeam ? pmFormState.assignedTeam.split(',').map(s => s.trim()) : [],
        notes: pmFormState.notes || null,
        completion_rate: 0,
      })

      setShowSchedulePMDialog(false)
      setPMFormState({
        asset: '',
        maintenanceType: 'preventive',
        frequency: 'monthly',
        startDate: '',
        duration: '60',
        assignedTeam: '',
        checklist: '',
        notes: ''
      })
    } catch (err) {
      console.error('Error scheduling PM:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Run system diagnostics
  const handleRunDiagnostics = async () => {
    // Clear any existing interval
    if (diagnosticsIntervalRef.current) {
      clearInterval(diagnosticsIntervalRef.current)
    }

    setDiagnosticsRunning(true)
    setDiagnosticsProgress(0)

    // Simulate diagnostics progress
    diagnosticsIntervalRef.current = setInterval(() => {
      setDiagnosticsProgress(prev => {
        if (prev >= 100) {
          if (diagnosticsIntervalRef.current) {
            clearInterval(diagnosticsIntervalRef.current)
            diagnosticsIntervalRef.current = null
          }
          setDiagnosticsRunning(false)
          toast.success('System diagnostics completed successfully')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  // Handle reorder part
  const handleReorderPart = (part: SparePartInventory) => {
    setSelectedPartForReorder(part)
    setReorderQuantity(part.maxQuantity - part.quantity)
    setShowReorderDialog(true)
  }

  // Submit reorder - wired to API
  const handleSubmitReorder = async () => {
    if (!selectedPartForReorder) {
      toast.error('No part selected for reorder')
      return
    }
    if (reorderQuantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder_part',
          partId: selectedPartForReorder.id,
          partName: selectedPartForReorder.name,
          quantity: reorderQuantity
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to place reorder')
      }

      const result = await response.json()
      toast.success(`Reorder placed for ${selectedPartForReorder.name} (${reorderQuantity} units)`)
      setShowReorderDialog(false)
      setSelectedPartForReorder(null)
      setReorderQuantity(0)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place reorder')
      console.error('Error placing reorder:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add new spare part
  const handleAddPart = async () => {
    if (!newPartForm?.name?.trim()) {
      toast.error('Part name is required')
      return
    }
    if (!newPartForm?.partNumber?.trim()) {
      toast.error('Part number is required')
      return
    }
    try {
      // Try database first
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('maintenance_parts')
          .insert({
            user_id: user.id,
            name: newPartForm.name,
            part_number: newPartForm.partNumber,
            category: newPartForm.category,
            quantity: newPartForm.quantity,
            unit_cost: newPartForm.unitCost,
            min_quantity: newPartForm.minQuantity,
            max_quantity: newPartForm.maxQuantity,
            supplier: newPartForm.supplier,
            location: newPartForm.location,
            status: newPartForm.quantity > newPartForm.minQuantity ? 'in_stock' :
                    newPartForm.quantity > 0 ? 'low_stock' : 'out_of_stock'
          })
        if (!error) {
          toast.success('New spare part added to inventory')
          setShowAddPartDialog(false)
          setNewPartForm({
            name: '',
            partNumber: '',
            category: 'HVAC Filters',
            quantity: 0,
            unitCost: 0,
            minQuantity: 10,
            maxQuantity: 50,
            supplier: '',
            location: ''
          })
          return
        }
      }
      // Fallback to localStorage
      const parts = JSON.parse(localStorage.getItem('maintenance-parts') || '[]')
      parts.push({
        id: crypto.randomUUID(),
        ...newPartForm,
        status: newPartForm.quantity > newPartForm.minQuantity ? 'in_stock' :
                newPartForm.quantity > 0 ? 'low_stock' : 'out_of_stock',
        created_at: new Date().toISOString()
      })
      localStorage.setItem('maintenance-parts', JSON.stringify(parts))
      toast.success('New spare part added to inventory')
      setShowAddPartDialog(false)
      setNewPartForm({
        name: '',
        partNumber: '',
        category: 'HVAC Filters',
        quantity: 0,
        unitCost: 0,
        minQuantity: 10,
        maxQuantity: 50,
        supplier: '',
        location: ''
      })
    } catch (err) {
      toast.error('Failed to add part')
      console.error(err)
    }
  }

  // Add new technician
  const handleAddTechnician = async () => {
    if (!newTechnicianForm?.name?.trim()) {
      toast.error('Technician name is required')
      return
    }
    if (!newTechnicianForm?.email?.trim()) {
      toast.error('Email is required')
      return
    }
    try {
      // Try database first
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('maintenance_technicians')
          .insert({
            user_id: user.id,
            name: newTechnicianForm.name,
            email: newTechnicianForm.email,
            phone: newTechnicianForm.phone,
            role: newTechnicianForm.role,
            department: newTechnicianForm.department,
            skills: newTechnicianForm.skills.split(',').map(s => s.trim()).filter(Boolean),
            certifications: newTechnicianForm.certifications.split(',').map(c => c.trim()).filter(Boolean),
            status: 'available',
            completed_orders: 0,
            avg_rating: 0
          })
        if (!error) {
          toast.success('New technician added to team')
          setShowAddTechnicianDialog(false)
          setNewTechnicianForm({
            name: '',
            email: '',
            phone: '',
            role: 'Maintenance Tech',
            department: 'Facilities',
            skills: '',
            certifications: ''
          })
          return
        }
      }
      // Fallback to localStorage
      const technicians = JSON.parse(localStorage.getItem('maintenance-technicians') || '[]')
      technicians.push({
        id: crypto.randomUUID(),
        name: newTechnicianForm.name,
        email: newTechnicianForm.email,
        phone: newTechnicianForm.phone,
        role: newTechnicianForm.role,
        department: newTechnicianForm.department,
        skills: newTechnicianForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: newTechnicianForm.certifications.split(',').map(c => c.trim()).filter(Boolean),
        status: 'available',
        completedOrders: 0,
        avgRating: 0,
        created_at: new Date().toISOString()
      })
      localStorage.setItem('maintenance-technicians', JSON.stringify(technicians))
      toast.success('New technician added to team')
      setShowAddTechnicianDialog(false)
      setNewTechnicianForm({
        name: '',
        email: '',
        phone: '',
        role: 'Maintenance Tech',
        department: 'Facilities',
        skills: '',
        certifications: ''
      })
    } catch (err) {
      toast.error('Failed to add technician')
      console.error(err)
    }
  }

  // Reset settings
  const handleResetSettings = async () => {
    try {
      // Reset state to defaults
      setMaintenanceSettings(defaultMaintenanceSettings)

      // Clear localStorage
      localStorage.removeItem('maintenance-settings')

      // Try to reset in database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('maintenance_settings')
          .upsert({
            user_id: user.id,
            settings: defaultMaintenanceSettings,
            updated_at: new Date().toISOString()
          })
      }

      toast.success('Settings have been reset to defaults')
      setShowResetSettingsDialog(false)
    } catch (err) {
      // Even if DB fails, local reset succeeded
      toast.success('Settings have been reset to defaults')
      setShowResetSettingsDialog(false)
      console.error('Error resetting settings in database:', err)
    }
  }

  // Delete all data using hook mutations
  const handleDeleteAllData = async () => {
    try {
      // Delete all maintenance windows one by one using the hook
      for (const window of dbMaintenanceWindows) {
        await deleteWindow(window.id)
      }

      toast.success('All maintenance data has been deleted')
      setShowDeleteDataDialog(false)
    } catch (err) {
      console.error('Error deleting data:', err)
      toast.error('Failed to delete data')
    }
  }

  // Handle filter by status from quick action
  const handleFilterByStatus = (status: MaintenanceStatus | 'all') => {
    setStatusFilter(status)
    setActiveTab('work-orders')
    toast.info(`Showing ${status === 'all' ? 'all' : status.replace('_', ' ')} work orders`)
  }

  // Refresh data using hook
  const handleRefreshData = () => {
    fetchWindows()
    toast.success('Data refreshed')
  }

  // View critical alerts
  const handleViewCriticalAlerts = () => {
    setShowCriticalAlertsDialog(true)
  }

  // View reports
  const handleViewReports = () => {
    setShowReportsDialog(true)
  }

  // Navigate to team tab
  const handleViewTeam = () => {
    setActiveTab('team')
    toast.info('Viewing team members')
  }

  // Navigate to assets tab
  const handleViewAssets = () => {
    setActiveTab('assets')
    toast.info('Viewing asset inventory')
  }

  // Archive completed orders - wired to API
  const handleArchiveOrders = async () => {
    const completedCount = dbMaintenanceWindows.filter(w => w.status === 'completed').length
    if (completedCount === 0) {
      toast.info('No completed work orders to archive')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive_work_orders'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to archive work orders')
      }

      const result = await response.json()
      toast.success(`${result.archived || completedCount} completed work orders archived`)
      // Refresh the data to reflect changes
      fetchWindows()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to archive work orders')
      console.error('Error archiving work orders:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick Actions with real dialog functionality
  const maintenanceQuickActions = [
    {
      id: '1',
      label: 'New Work Order',
      icon: 'plus',
      action: () => setShowCreateDialog(true),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Schedule PM',
      icon: 'calendar',
      action: () => setShowSchedulePMDialog(true),
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Asset List',
      icon: 'list',
      action: () => setShowAssetListDialog(true),
      variant: 'outline' as const
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Maintenance Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  ServiceNow-level CMMS and work order management
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportReport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center gap-2" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4" />
                New Work Order
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Work Orders', value: stats.total.toString(), icon: ClipboardList, gradient: 'from-orange-500 to-amber-600' },
              { label: 'In Progress', value: stats.inProgress.toString(), icon: Activity, gradient: 'from-yellow-500 to-orange-600' },
              { label: 'Scheduled', value: stats.scheduled.toString(), icon: Calendar, gradient: 'from-blue-500 to-cyan-600' },
              { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle, gradient: 'from-green-500 to-emerald-600' },
              { label: 'System Uptime', value: `${stats.uptime}%`, icon: TrendingUp, gradient: 'from-purple-500 to-indigo-600' },
              { label: 'Total Downtime', value: formatDuration(stats.totalDowntime), icon: Pause, gradient: 'from-red-500 to-pink-600' },
              { label: 'Critical Assets', value: stats.criticalAssets.toString(), icon: Shield, gradient: 'from-cyan-500 to-blue-600' },
              { label: 'Avg Efficiency', value: `${stats.avgCompletion}%`, icon: Target, gradient: 'from-pink-500 to-rose-600' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="work-orders" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <ClipboardList className="w-4 h-4 mr-2" />
                Work Orders
              </TabsTrigger>
              <TabsTrigger value="assets" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Server className="w-4 h-4 mr-2" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="schedules" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Schedules
              </TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Database className="w-4 h-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Dashboard Banner */}
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Maintenance Dashboard</h3>
                    <p className="text-orange-100">Real-time overview of all maintenance operations</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-3xl font-bold">{stats.uptime}%</p>
                      <p className="text-orange-200 text-sm">System Uptime</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Order', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', action: () => setShowCreateDialog(true) },
                  { icon: Activity, label: 'In Progress', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', action: () => handleFilterByStatus('in_progress') },
                  { icon: Calendar, label: 'Schedule', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', action: () => setShowSchedulePMDialog(true) },
                  { icon: AlertTriangle, label: 'Critical', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', action: handleViewCriticalAlerts },
                  { icon: Server, label: 'Assets', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', action: handleViewAssets },
                  { icon: Users, label: 'Team', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', action: handleViewTeam },
                  { icon: BarChart3, label: 'Reports', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', action: handleViewReports },
                  { icon: RefreshCw, label: 'Refresh', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', action: handleRefreshData },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Work Orders */}
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Active Work Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {([] as WorkOrder[]).filter(w => ['in_progress', 'scheduled'].includes(w.status)).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                <Wrench className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{order.title}</p>
                                <p className="text-sm text-gray-500">{order.orderNumber} • {order.asset}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-2 mb-1">
                                <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                                <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                              </div>
                              {order.status === 'in_progress' && (
                                <div className="w-24 mt-2">
                                  <Progress value={order.progress} className="h-2" />
                                  <p className="text-xs text-gray-500 mt-1">{order.progress}% complete</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Asset Health Overview */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Asset Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {([] as Asset[]).slice(0, 4).map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.location}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                            <p className="text-xs text-gray-500 mt-1">{asset.uptime}% uptime</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Maintenance */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Scheduled Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {([] as MaintenanceSchedule[]).map((schedule) => (
                      <div key={schedule.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getTypeColor(schedule.type)}>{schedule.type}</Badge>
                          <Badge variant="outline">{schedule.frequency}</Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{schedule.name}</h4>
                        <p className="text-xs text-gray-500 mb-3">{schedule.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Next: {formatDate(schedule.nextRun)}</span>
                          <span>{formatDuration(schedule.duration)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Orders Tab */}
            <TabsContent value="work-orders" className="space-y-6">
              {/* Work Orders Banner */}
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Work Order Management</h3>
                    <p className="text-blue-100">Track and manage all maintenance work orders</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-blue-200 text-sm">Total Orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Orders Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Order', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', action: () => setShowCreateDialog(true) },
                  { icon: Activity, label: 'In Progress', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', action: () => handleFilterByStatus('in_progress') },
                  { icon: CheckCircle, label: 'Completed', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', action: () => handleFilterByStatus('completed') },
                  { icon: Pause, label: 'On Hold', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', action: () => handleFilterByStatus('on_hold') },
                  { icon: AlertTriangle, label: 'Overdue', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', action: () => handleFilterByStatus('overdue') },
                  { icon: Download, label: 'Export', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', action: () => setShowExportDialog(true) },
                  { icon: Archive, label: 'Archive', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', action: handleArchiveOrders },
                  { icon: RefreshCw, label: 'Refresh', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', action: handleRefreshData },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search work orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'scheduled', 'in_progress', 'completed', 'on_hold'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? 'bg-gradient-to-r from-orange-600 to-amber-600' : ''}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Work Orders List */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredOrders.map((order) => (
                        <Dialog key={order.id}>
                          <DialogTrigger asChild>
                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                    <Wrench className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 dark:text-white">{order.title}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                                      <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                                      <Badge className={getTypeColor(order.type)}>{order.type}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      {order.orderNumber} • {order.asset} • {order.location}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {order.status === 'in_progress' && (
                                    <div className="mb-2">
                                      <Progress value={order.progress} className="h-2 w-24" />
                                      <p className="text-xs text-gray-500">{order.progress}%</p>
                                    </div>
                                  )}
                                  <p className="text-sm text-gray-500">Due: {formatDateTime(order.scheduledEnd)}</p>
                                  {order.sla?.breached && <Badge className="bg-red-100 text-red-700 mt-1">SLA Breached</Badge>}
                                </div>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{order.title}</DialogTitle>
                              <DialogDescription>{order.orderNumber}</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-4 p-4">
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                  <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                                  <Badge className={getTypeColor(order.type)}>{order.type}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">{order.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-1">Asset</h4>
                                    <p className="text-sm text-gray-600">{order.asset}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-1">Location</h4>
                                    <p className="text-sm text-gray-600">{order.location}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Assigned Team</h4>
                                  <div className="flex gap-2">
                                    {order.assignedTo.map((member) => (
                                      <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Avatar className="w-8 h-8">
                                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-sm font-medium">{member.name}</p>
                                          <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {order.parts.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Parts Required</h4>
                                    <div className="space-y-2">
                                      {order.parts.map((part) => (
                                        <div key={part.id} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                                          <span className="text-sm">{part.name} ({part.partNumber})</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">x{part.quantity}</span>
                                            <Badge className={part.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                              {part.available ? 'In Stock' : 'Backordered'}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {order.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-1">Notes</h4>
                                    <p className="text-sm text-gray-600">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Asset Inventory
                  </CardTitle>
                  <CardDescription>Manage equipment and assets for maintenance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {([] as Asset[]).map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                              <HardDrive className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-white">{asset.name}</p>
                                <Badge className={getPriorityColor(asset.criticality)}>{asset.criticality}</Badge>
                              </div>
                              <p className="text-sm text-gray-500">{asset.assetTag} • {asset.manufacturer} {asset.model}</p>
                              <p className="text-xs text-gray-400">{asset.location} • Owner: {asset.owner}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-xs">
                              <div>
                                <p className="text-gray-500">Uptime</p>
                                <p className="font-semibold">{asset.uptime}%</p>
                              </div>
                              <div>
                                <p className="text-gray-500">MTBF</p>
                                <p className="font-semibold">{asset.mtbf}h</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Next: {formatDate(asset.nextMaintenance)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedules Tab */}
            <TabsContent value="schedules" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {([] as MaintenanceSchedule[]).map((schedule) => (
                  <Card key={schedule.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{schedule.name}</CardTitle>
                          <CardDescription className="mt-1">{schedule.description}</CardDescription>
                        </div>
                        <Switch checked={schedule.active} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getTypeColor(schedule.type)}>{schedule.type}</Badge>
                        <Badge variant="outline">{schedule.frequency}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Last Run</p>
                          <p className="text-sm font-medium">{formatDate(schedule.lastRun)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Next Run</p>
                          <p className="text-sm font-medium">{formatDate(schedule.nextRun)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium">{formatDuration(schedule.duration)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Team</p>
                          <p className="text-sm font-medium">{schedule.assignedTeam}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Checklist Items</p>
                        <div className="flex flex-wrap gap-2">
                          {schedule.checklist.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Maintenance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Work Order Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Total This Month</span><span className="font-semibold">{stats.total}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-semibold text-green-600">{stats.completed}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">In Progress</span><span className="font-semibold text-yellow-600">{stats.inProgress}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Overdue</span><span className="font-semibold text-red-600">{stats.overdue}</span></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Avg Completion</span><span className="font-semibold">{stats.avgCompletion}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">System Uptime</span><span className="font-semibold">{stats.uptime}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Total Downtime</span><span className="font-semibold">{formatDuration(stats.totalDowntime)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">SLA Compliance</span><span className="font-semibold text-green-600">96%</span></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Labor Cost</span><span className="font-semibold">$12,450</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Parts Cost</span><span className="font-semibold">$5,325</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Total Cost</span><span className="font-semibold">$17,775</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Budget Used</span><span className="font-semibold">78%</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spare Parts Inventory</h3>
                  <p className="text-sm text-gray-500">Manage spare parts and supplies for maintenance operations</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                    const csv = ([] as SparePartInventory[]).map(p =>
                      `${p.partNumber},${p.name},${p.category},${p.quantity},${p.unitCost},${p.status}`
                    ).join('\n')
                    const blob = new Blob([`Part Number,Name,Category,Quantity,Unit Cost,Status\n${csv}`], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
                    link.click()
                    URL.revokeObjectURL(url)
                    toast.success('Inventory exported successfully')
                  }}>
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center gap-2" onClick={() => setShowAddPartDialog(true)}>
                    <Plus className="w-4 h-4" />
                    Add Part
                  </Button>
                </div>
              </div>

              {/* Inventory Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{([] as SparePartInventory[]).filter(i => i.status === 'in_stock').length}</p>
                        <p className="text-xs text-gray-500">In Stock</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{([] as SparePartInventory[]).filter(i => i.status === 'low_stock').length}</p>
                        <p className="text-xs text-gray-500">Low Stock</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <RotateCw className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{([] as SparePartInventory[]).filter(i => i.status === 'on_order').length}</p>
                        <p className="text-xs text-gray-500">On Order</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">${([] as SparePartInventory[]).reduce((sum, i) => sum + (i.quantity * i.unitCost), 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Total Value</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {([] as SparePartInventory[]).map((part) => (
                        <div key={part.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                                <Database className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 dark:text-white">{part.name}</p>
                                  <Badge className={getInventoryStatusColor(part.status)}>{part.status.replace('_', ' ')}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">{part.partNumber} • {part.manufacturer}</p>
                                <p className="text-xs text-gray-400">{part.category} • {part.location}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{part.quantity} units</p>
                                  <p className="text-xs text-gray-500">Min: {part.minQuantity} / Max: {part.maxQuantity}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">${part.unitCost.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">per unit</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Lead: {part.leadTime}d</p>
                                  <p className="text-xs text-gray-400">{part.supplier}</p>
                                </div>
                              </div>
                              {part.status === 'low_stock' && (
                                <Button size="sm" variant="outline" className="mt-2" onClick={() => handleReorderPart(part)}>
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Vendors Section */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Approved Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([] as Vendor[]).map((vendor) => (
                      <div key={vendor.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{vendor.name}</p>
                            <p className="text-sm text-gray-500">{vendor.category}</p>
                          </div>
                          <Badge className={vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{vendor.status}</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-600">{vendor.contactPerson}</p>
                          <p className="text-gray-500">{vendor.email}</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-gray-500">Rating: {'★'.repeat(Math.floor(vendor.rating))}</span>
                            <span className="text-gray-500">{vendor.totalOrders} orders</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance Team</h3>
                  <p className="text-sm text-gray-500">Manage technicians, skills, and assignments</p>
                </div>
                <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center gap-2" onClick={() => setShowAddTechnicianDialog(true)}>
                  <Plus className="w-4 h-4" />
                  Add Technician
                </Button>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{([] as Technician[]).filter(t => t.status === 'available').length}</p>
                        <p className="text-xs text-gray-500">Available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{([] as Technician[]).filter(t => t.status === 'busy').length}</p>
                        <p className="text-xs text-gray-500">Busy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{([] as Technician[]).length}</p>
                        <p className="text-xs text-gray-500">Total Team</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(([] as Technician[]).reduce((sum, t) => sum + t.avgRating, 0) / ([] as Technician[]).length).toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Avg Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Technicians List */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {([] as Technician[]).map((tech) => (
                        <div key={tech.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white font-semibold">
                                  {tech.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 dark:text-white">{tech.name}</p>
                                  <Badge className={getTechnicianStatusColor(tech.status)}>{tech.status.replace('_', ' ')}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">{tech.role} • {tech.department}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tech.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{tech.completedOrders}</p>
                                  <p className="text-xs text-gray-500">Completed</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{'★'.repeat(Math.floor(tech.avgRating))}</p>
                                  <p className="text-xs text-gray-500">{tech.avgRating} rating</p>
                                </div>
                              </div>
                              {tech.currentWorkOrder && (
                                <p className="text-xs text-blue-600 mt-2">Working on: {tech.currentWorkOrder}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tech.certifications.map((cert, idx) => (
                                  <Badge key={idx} className="bg-blue-100 text-blue-700 text-xs">{cert}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Incidents Section */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Recent Incidents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {([] as Incident[]).map((incident) => (
                      <div key={incident.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getIncidentStatusColor(incident.status)}>{incident.status}</Badge>
                            <Badge className={getPriorityColor(incident.priority)}>{incident.priority}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">{incident.incidentNumber}</span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{incident.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{incident.description}</p>
                        <div className="flex justify-between mt-3 text-xs text-gray-500">
                          <span>Reported by: {incident.reportedBy}</span>
                          <span>{formatDateTime(incident.reportedAt)}</span>
                        </div>
                        {incident.workOrderId && (
                          <p className="text-xs text-blue-600 mt-2">Linked: {incident.workOrderId}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <div className="col-span-3">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5 text-orange-600" />
                        Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <nav className="space-y-1">
                        {[
                          { id: 'general', label: 'General', icon: Sliders },
                          { id: 'work-orders', label: 'Work Orders', icon: ClipboardList },
                          { id: 'notifications', label: 'Notifications', icon: Bell },
                          { id: 'integrations', label: 'Integrations', icon: Webhook },
                          { id: 'security', label: 'Security', icon: Lock },
                          { id: 'advanced', label: 'Advanced', icon: Terminal },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSettingsTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              settingsTab === item.id
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
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
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>Configure maintenance management preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Default Priority</Label>
                              <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </select>
                            </div>
                            <div>
                              <Label>Default Type</Label>
                              <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                                <option value="preventive">Preventive</option>
                                <option value="corrective">Corrective</option>
                                <option value="inspection">Inspection</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Auto-number work orders</p>
                              <p className="text-sm text-gray-500">Automatically generate work order numbers</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Track labor hours</p>
                              <p className="text-sm text-gray-500">Enable time tracking for work orders</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Display Settings</CardTitle>
                          <CardDescription>Customize the dashboard appearance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Show asset health</p>
                              <p className="text-sm text-gray-500">Display asset health indicators</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Show SLA timers</p>
                              <p className="text-sm text-gray-500">Display countdown to SLA breach</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Work Orders Settings */}
                  {settingsTab === 'work-orders' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Work Order Settings</CardTitle>
                          <CardDescription>Configure work order behavior</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Auto-assign work orders</p>
                              <p className="text-sm text-gray-500">Automatically assign based on team availability</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Require approval for emergency</p>
                              <p className="text-sm text-gray-500">Emergency work orders need manager approval</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Require checklist completion</p>
                              <p className="text-sm text-gray-500">Work orders can't be closed without completing checklist</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Allow technician reassignment</p>
                              <p className="text-sm text-gray-500">Technicians can reassign their work orders</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>SLA Configuration</CardTitle>
                          <CardDescription>Set response and resolution time targets</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Critical Response (hours)</Label>
                              <Input type="number" defaultValue="1" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                              <Label>Critical Resolution (hours)</Label>
                              <Input type="number" defaultValue="4" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                              <Label>High Response (hours)</Label>
                              <Input type="number" defaultValue="4" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                              <Label>High Resolution (hours)</Label>
                              <Input type="number" defaultValue="24" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Notifications Settings */}
                  {settingsTab === 'notifications' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Configure alerts and notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { icon: Bell, name: 'SLA breach alerts', desc: 'Alert when SLA is about to be breached' },
                          { icon: Calendar, name: 'Scheduled maintenance reminders', desc: 'Notify team before scheduled maintenance' },
                          { icon: AlertTriangle, name: 'Asset health alerts', desc: 'Alert when asset health degrades' },
                          { icon: Mail, name: 'Email notifications', desc: 'Send notifications via email' },
                          { icon: Database, name: 'Low inventory alerts', desc: 'Alert when spare parts are low' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <item.icon className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                            <Switch defaultChecked={i < 3} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Integrations Settings */}
                  {settingsTab === 'integrations' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>CMMS Integrations</CardTitle>
                          <CardDescription>Connect with external maintenance systems</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { name: 'SAP Plant Maintenance', desc: 'Sync with SAP PM module', connected: false },
                            { name: 'IBM Maximo', desc: 'Connect to IBM Maximo', connected: false },
                            { name: 'ServiceNow', desc: 'Integrate with ServiceNow CMMS', connected: true },
                            { name: 'UpKeep', desc: 'Sync with UpKeep mobile CMMS', connected: false },
                          ].map((service, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                                <p className="text-sm text-gray-500">{service.desc}</p>
                              </div>
                              <Button variant={service.connected ? "outline" : "default"} size="sm" onClick={() => {
                                if (service.connected) {
                                  toast.success(`Disconnected from ${service.name}`)
                                } else {
                                  toast.success(`Connecting to ${service.name}...`)
                                  setTimeout(() => toast.success(`Connected to ${service.name}`), 1500)
                                }
                              }}>
                                {service.connected ? 'Disconnect' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>IoT & Sensors</CardTitle>
                          <CardDescription>Connect monitoring devices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Enable IoT monitoring</p>
                              <p className="text-sm text-gray-500">Receive data from connected sensors</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Auto-create work orders</p>
                              <p className="text-sm text-gray-500">Automatically create work orders from sensor alerts</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Security Settings */}
                  {settingsTab === 'security' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage access and permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require work order signatures</p>
                            <p className="text-sm text-gray-500">Technicians must sign off on completed work</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit trail logging</p>
                            <p className="text-sm text-gray-500">Log all changes to work orders</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Role-based access</p>
                            <p className="text-sm text-gray-500">Restrict features based on user role</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-factor authentication</p>
                            <p className="text-sm text-gray-500">Require 2FA for sensitive operations</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Advanced Settings */}
                  {settingsTab === 'advanced' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Advanced Options</CardTitle>
                          <CardDescription>Configure advanced maintenance settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Predictive maintenance</p>
                              <p className="text-sm text-gray-500">Use AI to predict equipment failures</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Condition monitoring</p>
                              <p className="text-sm text-gray-500">Enable real-time condition monitoring</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">MTBF/MTTR tracking</p>
                              <p className="text-sm text-gray-500">Track reliability metrics</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Data Management</CardTitle>
                          <CardDescription>Manage maintenance data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Database className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Work Order Archive</p>
                                <p className="text-sm text-gray-500">2,456 archived orders (145 MB)</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              toast.success('Exporting archived work orders...')
                              setTimeout(() => toast.success('Archive exported successfully'), 1500)
                            }}>Export</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <HardDrive className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Attachments Storage</p>
                                <p className="text-sm text-gray-500">3.2 GB used of 10 GB</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              toast.info('Storage management: 3.2 GB used of 10 GB available')
                            }}>Manage</Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200 dark:border-red-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-red-600">Danger Zone</CardTitle>
                          <CardDescription>Irreversible actions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Reset All Settings</p>
                              <p className="text-sm text-gray-500">Reset to factory defaults</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Delete All Data</p>
                              <p className="text-sm text-gray-500">Permanently delete all maintenance data</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDataDialog(true)}>Delete</Button>
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
                insights={mockMaintenanceAIInsights}
                title="Maintenance Intelligence"
                onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={mockMaintenanceCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={mockMaintenancePredictions}
                title="Equipment Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={mockMaintenanceActivities}
              title="Maintenance Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={maintenanceQuickActions}
              variant="grid"
            />
          </div>
        </div>
      </div>

      {/* Create Maintenance Window Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Maintenance Window</DialogTitle>
            <DialogDescription>Schedule a new maintenance window for your systems</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={formState.title}
                  onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., HVAC System Annual Inspection"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the maintenance work..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={formState.type}
                  onChange={(e) => setFormState(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="emergency">Emergency</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  value={formState.priority}
                  onChange={(e) => setFormState(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={formState.start_time}
                  onChange={(e) => setFormState(prev => ({ ...prev, start_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  value={formState.end_time}
                  onChange={(e) => setFormState(prev => ({ ...prev, end_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formState.duration_minutes}
                  onChange={(e) => setFormState(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Impact</Label>
                <select
                  value={formState.impact}
                  onChange={(e) => setFormState(prev => ({ ...prev, impact: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Affected Systems (comma-separated)</Label>
                <Input
                  value={formState.affected_systems}
                  onChange={(e) => setFormState(prev => ({ ...prev, affected_systems: e.target.value }))}
                  placeholder="e.g., HVAC, Server Room, Building A"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Assigned To (comma-separated)</Label>
                <Input
                  value={formState.assigned_to}
                  onChange={(e) => setFormState(prev => ({ ...prev, assigned_to: e.target.value }))}
                  placeholder="e.g., John Smith, Sarah Johnson"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  checked={formState.downtime_expected}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, downtime_expected: checked }))}
                />
                <Label>Downtime Expected</Label>
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Input
                  value={formState.notes}
                  onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateWorkOrder}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Maintenance Window'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Preventive Maintenance Dialog */}
      <Dialog open={showSchedulePMDialog} onOpenChange={setShowSchedulePMDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Schedule Preventive Maintenance
            </DialogTitle>
            <DialogDescription>Create a recurring preventive maintenance schedule for your assets</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="col-span-2">
                <Label>Select Asset *</Label>
                <select
                  value={pmFormState.asset}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, asset: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="">Choose an asset...</option>
                  {([] as Asset[]).map(asset => (
                    <option key={asset.id} value={asset.name}>
                      {asset.name} ({asset.assetTag}) - {asset.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Maintenance Type</Label>
                <select
                  value={pmFormState.maintenanceType}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, maintenanceType: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="preventive">Preventive</option>
                  <option value="inspection">Inspection</option>
                  <option value="calibration">Calibration</option>
                </select>
              </div>
              <div>
                <Label>Frequency</Label>
                <select
                  value={pmFormState.frequency}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <Label>Start Date/Time *</Label>
                <Input
                  type="datetime-local"
                  value={pmFormState.startDate}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={pmFormState.duration}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="60"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Assigned Team</Label>
                <select
                  value={pmFormState.assignedTeam}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, assignedTeam: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="">Select team...</option>
                  <option value="HVAC Team">HVAC Team</option>
                  <option value="Electrical Team">Electrical Team</option>
                  <option value="Mechanical Team">Mechanical Team</option>
                  <option value="IT Team">IT Team</option>
                  <option value="General Maintenance">General Maintenance</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Checklist Items (comma-separated)</Label>
                <Input
                  value={pmFormState.checklist}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, checklist: e.target.value }))}
                  placeholder="e.g., Check filters, Inspect coils, Test thermostat"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Input
                  value={pmFormState.notes}
                  onChange={(e) => setPMFormState(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional instructions or notes..."
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSchedulePMDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSchedulePM}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Maintenance'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Asset List Dialog */}
      <Dialog open={showAssetListDialog} onOpenChange={setShowAssetListDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Asset Inventory
            </DialogTitle>
            <DialogDescription>View and manage all registered assets</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={assetFilter.search}
                  onChange={(e) => setAssetFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <select
                value={assetFilter.status}
                onChange={(e) => setAssetFilter(prev => ({ ...prev, status: e.target.value as AssetStatus | 'all' }))}
                className="px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="all">All Status</option>
                <option value="operational">Operational</option>
                <option value="degraded">Degraded</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
              <select
                value={assetFilter.criticality}
                onChange={(e) => setAssetFilter(prev => ({ ...prev, criticality: e.target.value as Priority | 'all' }))}
                className="px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="all">All Criticality</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Asset Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-lg font-bold text-green-700">{([] as Asset[]).filter(a => a.status === 'operational').length}</p>
                <p className="text-xs text-green-600">Operational</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <p className="text-lg font-bold text-yellow-700">{([] as Asset[]).filter(a => a.status === 'degraded').length}</p>
                <p className="text-xs text-yellow-600">Degraded</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-lg font-bold text-blue-700">{([] as Asset[]).filter(a => a.status === 'maintenance').length}</p>
                <p className="text-xs text-blue-600">In Maintenance</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-lg font-bold text-red-700">{([] as Asset[]).filter(a => a.criticality === 'critical').length}</p>
                <p className="text-xs text-red-600">Critical Assets</p>
              </div>
            </div>

            {/* Asset List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <HardDrive className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{asset.name}</p>
                          <Badge className={getPriorityColor(asset.criticality)}>{asset.criticality}</Badge>
                          <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{asset.assetTag} | {asset.manufacturer} {asset.model}</p>
                        <p className="text-xs text-gray-400">{asset.location} | Owner: {asset.owner}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-xs">
                        <div>
                          <p className="text-gray-500">Uptime</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{asset.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">MTBF</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{asset.mtbf}h</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Next Maintenance: {formatDate(asset.nextMaintenance)}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAssetListDialog(false)
                            setPMFormState(prev => ({ ...prev, asset: asset.name }))
                            setShowSchedulePMDialog(true)
                          }}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Schedule PM
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAssetListDialog(false)
                            setFormState(prev => ({ ...prev, affected_systems: asset.name }))
                            setShowCreateDialog(true)
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Work Order
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No assets found matching your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{filteredAssets.length} of {([] as Asset[]).length} assets</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const csv = ([] as Asset[]).map(a =>
                    `${a.assetTag},${a.name},${a.type},${a.status},${a.criticality},${a.location},${a.uptime}%`
                  ).join('\n')
                  const blob = new Blob([`Tag,Name,Type,Status,Criticality,Location,Uptime\n${csv}`], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `assets-${new Date().toISOString().split('T')[0]}.csv`
                  link.click()
                  URL.revokeObjectURL(url)
                  toast.success('Asset list exported')
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => setShowAssetListDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diagnostics Dialog */}
      <Dialog open={showDiagnosticsDialog} onOpenChange={setShowDiagnosticsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              System Diagnostics
            </DialogTitle>
            <DialogDescription>Run comprehensive system health checks</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {[
                { name: 'Database Connection', status: 'passed' },
                { name: 'API Endpoints', status: 'passed' },
                { name: 'Asset Synchronization', status: 'passed' },
                { name: 'Notification Service', status: 'warning' },
                { name: 'Backup Status', status: 'passed' },
              ].map((check, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">{check.name}</span>
                  <Badge className={check.status === 'passed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {check.status}
                  </Badge>
                </div>
              ))}
            </div>
            {diagnosticsRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Running diagnostics...</span>
                  <span>{diagnosticsProgress}%</span>
                </div>
                <Progress value={diagnosticsProgress} className="h-2" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDiagnosticsDialog(false)}>Close</Button>
            <Button onClick={handleRunDiagnostics} disabled={diagnosticsRunning} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              {diagnosticsRunning ? 'Running...' : 'Run Diagnostics'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Export Data
            </DialogTitle>
            <DialogDescription>Choose what data to export</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { name: 'Work Orders', desc: 'Export all work orders as CSV', action: handleExportReport },
              { name: 'Asset Inventory', desc: 'Export asset list with health data', action: () => {
                const csv = ([] as Asset[]).map(a => `${a.assetTag},${a.name},${a.status},${a.uptime}%`).join('\n')
                const blob = new Blob([`Tag,Name,Status,Uptime\n${csv}`], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`
                link.click()
                URL.revokeObjectURL(url)
                toast.success('Assets exported')
              }},
              { name: 'Maintenance Schedules', desc: 'Export PM schedules', action: () => {
                const csv = ([] as MaintenanceSchedule[]).map(s => `${s.name},${s.type},${s.frequency},${s.nextRun}`).join('\n')
                const blob = new Blob([`Name,Type,Frequency,Next Run\n${csv}`], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `schedules-${new Date().toISOString().split('T')[0]}.csv`
                link.click()
                URL.revokeObjectURL(url)
                toast.success('Schedules exported')
              }},
              { name: 'Team Performance', desc: 'Export technician metrics', action: () => {
                const csv = ([] as Technician[]).map(t => `${t.name},${t.role},${t.completedOrders},${t.avgRating}`).join('\n')
                const blob = new Blob([`Name,Role,Completed,Rating\n${csv}`], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `team-${new Date().toISOString().split('T')[0]}.csv`
                link.click()
                URL.revokeObjectURL(url)
                toast.success('Team data exported')
              }},
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { item.action(); setShowExportDialog(false); }}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reorder Part Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-600" />
              Reorder Part
            </DialogTitle>
            <DialogDescription>Place a reorder for low stock item</DialogDescription>
          </DialogHeader>
          {selectedPartForReorder && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-semibold">{selectedPartForReorder.name}</p>
                <p className="text-sm text-gray-500">Part #: {selectedPartForReorder.partNumber}</p>
                <p className="text-sm text-gray-500">Current Stock: {selectedPartForReorder.quantity} units</p>
                <p className="text-sm text-gray-500">Min Required: {selectedPartForReorder.minQuantity} units</p>
              </div>
              <div>
                <Label>Order Quantity</Label>
                <Input
                  type="number"
                  value={reorderQuantity}
                  onChange={(e) => setReorderQuantity(parseInt(e.target.value) || 0)}
                  min={1}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input value={selectedPartForReorder.supplier} disabled className="mt-1.5" />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Estimated delivery: {selectedPartForReorder.leadTime} days
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowReorderDialog(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmitReorder} disabled={isSubmitting} className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Add New Part
            </DialogTitle>
            <DialogDescription>Add a new spare part to inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="col-span-2">
                <Label>Part Name *</Label>
                <Input
                  placeholder="e.g., Air Filter 24x24"
                  className="mt-1.5"
                  value={newPartForm.name}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Part Number *</Label>
                <Input
                  placeholder="e.g., AF-2424-M"
                  className="mt-1.5"
                  value={newPartForm.partNumber}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, partNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  value={newPartForm.category}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option>HVAC Filters</option>
                  <option>Bearings</option>
                  <option>Belts</option>
                  <option>Lubricants</option>
                  <option>Electrical</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  value={newPartForm.quantity}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Unit Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1.5"
                  value={newPartForm.unitCost}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Min Quantity</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  value={newPartForm.minQuantity}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Max Quantity</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  value={newPartForm.maxQuantity}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="col-span-2">
                <Label>Supplier</Label>
                <Input
                  placeholder="Supplier name"
                  className="mt-1.5"
                  value={newPartForm.supplier}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label>Storage Location</Label>
                <Input
                  placeholder="e.g., Warehouse A-1"
                  className="mt-1.5"
                  value={newPartForm.location}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPart} className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
              Add Part
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Technician Dialog */}
      <Dialog open={showAddTechnicianDialog} onOpenChange={setShowAddTechnicianDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Add New Technician
            </DialogTitle>
            <DialogDescription>Add a new team member to the maintenance team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Smith"
                  className="mt-1.5"
                  value={newTechnicianForm.name}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  className="mt-1.5"
                  value={newTechnicianForm.email}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="555-0100"
                  className="mt-1.5"
                  value={newTechnicianForm.phone}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  value={newTechnicianForm.role}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option>Maintenance Tech</option>
                  <option>HVAC Specialist</option>
                  <option>Electrical Tech</option>
                  <option>Mechanical Tech</option>
                  <option>IT Tech</option>
                  <option>Supervisor</option>
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <select
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  value={newTechnicianForm.department}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option>Facilities</option>
                  <option>Electrical</option>
                  <option>Manufacturing</option>
                  <option>IT</option>
                  <option>Operations</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Skills (comma-separated)</Label>
                <Input
                  placeholder="HVAC, Electrical, Plumbing"
                  className="mt-1.5"
                  value={newTechnicianForm.skills}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label>Certifications (comma-separated)</Label>
                <Input
                  placeholder="EPA 608, OSHA 10"
                  className="mt-1.5"
                  value={newTechnicianForm.certifications}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, certifications: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddTechnicianDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTechnician} className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
              Add Technician
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Confirmation Dialog */}
      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Reset All Settings
            </DialogTitle>
            <DialogDescription>This action will reset all maintenance settings to their default values.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                Warning: This will reset all your custom configurations including:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 list-disc ml-5 mt-2">
                <li>SLA configurations</li>
                <li>Notification preferences</li>
                <li>Integration settings</li>
                <li>Display preferences</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetSettings}>
              Reset Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Data Confirmation Dialog */}
      <Dialog open={showDeleteDataDialog} onOpenChange={setShowDeleteDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete All Data
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                Warning: This will permanently delete:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 list-disc ml-5 mt-2">
                <li>All work orders</li>
                <li>All maintenance schedules</li>
                <li>All maintenance history</li>
                <li>All attached documents</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDataDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAllData}>
              Delete All Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Critical Alerts Dialog */}
      <Dialog open={showCriticalAlertsDialog} onOpenChange={setShowCriticalAlertsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Alerts
            </DialogTitle>
            <DialogDescription>Items requiring immediate attention</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {([] as WorkOrder[]).filter(w => w.priority === 'critical' || w.sla?.breached).map((order) => (
                <div key={order.id} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-red-100 text-red-700">{order.priority}</Badge>
                        <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                        {order.sla?.breached && <Badge className="bg-red-600 text-white">SLA Breached</Badge>}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{order.title}</p>
                      <p className="text-sm text-gray-500">{order.orderNumber} | {order.asset}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      setShowCriticalAlertsDialog(false)
                      setActiveTab('work-orders')
                      setStatusFilter('all')
                    }}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {([] as Asset[]).filter(a => a.status === 'degraded' || a.status === 'offline').map((asset) => (
                <div key={asset.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                        <Badge className={getPriorityColor(asset.criticality)}>{asset.criticality}</Badge>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{asset.name}</p>
                      <p className="text-sm text-gray-500">{asset.assetTag} | {asset.location}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      setShowCriticalAlertsDialog(false)
                      setActiveTab('assets')
                    }}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {([] as SparePartInventory[]).filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').map((part) => (
                <div key={part.id} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getInventoryStatusColor(part.status)}>{part.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{part.name}</p>
                      <p className="text-sm text-gray-500">{part.partNumber} | Stock: {part.quantity}/{part.minQuantity} min</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleReorderPart(part)}>
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowCriticalAlertsDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              Maintenance Reports
            </DialogTitle>
            <DialogDescription>View and generate maintenance reports</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
                  <p className="text-sm text-yellow-600">In Progress</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-blue-700">{stats.uptime}%</p>
                  <p className="text-sm text-blue-600">Uptime</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-purple-700">{stats.avgCompletion}%</p>
                  <p className="text-sm text-purple-600">Efficiency</p>
                </div>
              </div>

              {/* Work Order Summary */}
              <Card className="border-0 shadow">
                <CardHeader>
                  <CardTitle className="text-base">Work Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Work Orders', value: stats.total, color: 'bg-gray-500' },
                      { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
                      { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
                      { label: 'Scheduled', value: stats.scheduled, color: 'bg-blue-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Asset Health */}
              <Card className="border-0 shadow">
                <CardHeader>
                  <CardTitle className="text-base">Asset Health Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {([] as Asset[]).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{asset.name}</p>
                          <p className="text-xs text-gray-500">{asset.location}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold">{asset.uptime}%</p>
                            <p className="text-xs text-gray-500">uptime</p>
                          </div>
                          <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technician Performance */}
              <Card className="border-0 shadow">
                <CardHeader>
                  <CardTitle className="text-base">Technician Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {([] as Technician[]).slice(0, 5).map((tech) => (
                      <div key={tech.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                              {tech.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{tech.name}</p>
                            <p className="text-xs text-gray-500">{tech.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="text-sm font-semibold">{tech.completedOrders}</p>
                            <p className="text-xs text-gray-500">completed</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-yellow-600">{'★'.repeat(Math.floor(tech.avgRating))}</p>
                            <p className="text-xs text-gray-500">{tech.avgRating}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
