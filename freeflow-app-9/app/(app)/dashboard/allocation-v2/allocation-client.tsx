'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useAllocations, useAllocationMutations } from '@/lib/hooks/use-allocations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  Search,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  DollarSign,
  UserCheck,
  Building,
  MapPin,
  Mail,
  Phone,
  Star,
  Target,
  Zap,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  CalendarRange,
  Layers,
  GitBranch,
  CheckCircle,
  ChevronRight,
  Percent,
  Award,
  Coffee,
  Plane,
  HeartPulse,
  Home,
  Loader2
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
// TYPE DEFINITIONS - Resource Guru Level Resource Management
// ============================================================================

type AllocationStatus = 'active' | 'pending' | 'completed' | 'cancelled' | 'on_hold'
type AllocationType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'freelance'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ResourceStatus = 'available' | 'partially_available' | 'unavailable' | 'on_leave'
type TimeOffType = 'vacation' | 'sick' | 'personal' | 'holiday' | 'remote'
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface Skill {
  name: string
  level: SkillLevel
  years_experience: number
}

interface Resource {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: string
  department: string
  location: string
  status: ResourceStatus
  hourly_rate: number
  cost_rate: number
  capacity_hours: number
  allocated_hours: number
  utilization: number
  skills: Skill[]
  manager_id: string | null
  manager_name: string | null
  start_date: string
  timezone: string
  is_billable: boolean
}

interface Project {
  id: string
  name: string
  code: string
  client_name: string
  status: 'active' | 'planning' | 'completed' | 'on_hold'
  priority: Priority
  start_date: string
  end_date: string
  budget_hours: number
  allocated_hours: number
  consumed_hours: number
  budget_amount: number
  spent_amount: number
  pm_name: string
  pm_avatar: string
  color: string
  team_size: number
}

interface Allocation {
  id: string
  resource_id: string
  resource_name: string
  resource_avatar: string
  resource_role: string
  project_id: string
  project_name: string
  project_code: string
  project_color: string
  status: AllocationStatus
  allocation_type: AllocationType
  priority: Priority
  hours_per_week: number
  start_date: string
  end_date: string
  billable_rate: number
  cost_rate: number
  notes: string
  created_at: string
  updated_at: string
  approved_by: string | null
  approved_at: string | null
}

interface TimeOff {
  id: string
  resource_id: string
  resource_name: string
  resource_avatar: string
  type: TimeOffType
  start_date: string
  end_date: string
  hours: number
  status: 'approved' | 'pending' | 'rejected'
  notes: string
  approved_by: string | null
}

interface CapacityForecast {
  week: string
  total_capacity: number
  allocated_hours: number
  available_hours: number
  utilization: number
  over_allocated: boolean
}

interface UtilizationData {
  period: string
  billable_hours: number
  non_billable_hours: number
  time_off_hours: number
  available_hours: number
  utilization_rate: number
  billable_rate: number
}

// ============================================================================
// DATA ARRAYS - Empty arrays for real data integration
// ============================================================================

const resources: Resource[] = []

const projects: Project[] = []

const allocations: Allocation[] = []

const timeOffData: TimeOff[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: AllocationStatus): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'on_hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getResourceStatusColor = (status: ResourceStatus): string => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'partially_available': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'unavailable': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'on_leave': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getSkillLevelColor = (level: SkillLevel): string => {
  switch (level) {
    case 'expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'advanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'intermediate': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'beginner': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getTimeOffIcon = (type: TimeOffType) => {
  switch (type) {
    case 'vacation': return <Plane className="w-4 h-4" />
    case 'sick': return <HeartPulse className="w-4 h-4" />
    case 'personal': return <Coffee className="w-4 h-4" />
    case 'holiday': return <Star className="w-4 h-4" />
    case 'remote': return <Home className="w-4 h-4" />
    default: return <Calendar className="w-4 h-4" />
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getUtilizationColor = (utilization: number): string => {
  if (utilization >= 100) return 'text-red-600'
  if (utilization >= 80) return 'text-green-600'
  if (utilization >= 50) return 'text-yellow-600'
  return 'text-gray-600'
}

// ============================================================================
// COMPETITIVE UPGRADE DATA - Empty arrays for real data integration
// ============================================================================

const allocationAIInsights: { id: string; type: 'success' | 'warning' | 'info' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const allocationCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const allocationPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[] = []

const allocationActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' | 'error' }[] = []

const allocationQuickActions: { id: string; label: string; icon: React.ReactNode; shortcut?: string; action: () => void; category?: string; description?: string }[] = []

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Form state type
interface AllocationForm {
  resource_name: string
  resource_role: string
  project_name: string
  allocation_type: string
  status: string
  priority: string
  hours_per_week: number
  allocated_hours: number
  start_date: string
  end_date: string
  billable_rate: number
  notes: string
}

const initialFormState: AllocationForm = {
  resource_name: '',
  resource_role: '',
  project_name: '',
  allocation_type: 'full-time',
  status: 'pending',
  priority: 'medium',
  hours_per_week: 40,
  allocated_hours: 0,
  start_date: '',
  end_date: '',
  billable_rate: 150,
  notes: '',
}

export default function AllocationClient() {

  // Supabase hooks
  const { allocations: dbAllocations, stats: dbStats, isLoading, refetch } = useAllocations()
  const {
    createAllocation,
    updateAllocation,
    deleteAllocation,
    activateAllocation,
    completeAllocation,
    cancelAllocation,
    isCreating,
    isUpdating,
    isDeleting
  } = useAllocationMutations()

  const [activeTab, setActiveTab] = useState('allocations')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AllocationStatus | 'all'>('all')
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [formData, setFormData] = useState<AllocationForm>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [timeEntryData, setTimeEntryData] = useState({ hours: 0, description: '', date: '' })
  const [transferData, setTransferData] = useState({ targetProject: '', notes: '' })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [alertSettings, setAlertSettings] = useState({
    overAllocation: true,
    pendingApprovals: true,
    capacityWarnings: true
  })

  // Filtered data
  const filteredAllocations = useMemo(() => {
    return allocations.filter(allocation => {
      const matchesSearch =
        allocation.resource_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allocation.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allocation.project_code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const activeAllocations = allocations.filter(a => a.status === 'active').length
    const totalHours = allocations.reduce((acc, a) => acc + a.hours_per_week, 0)
    const totalBillable = allocations.reduce((acc, a) => acc + (a.hours_per_week * a.billable_rate), 0)
    const avgUtilization = resources.length > 0
      ? resources.reduce((acc, r) => acc + r.utilization, 0) / resources.length
      : 0
    const availableResources = resources.filter(r => r.status === 'available').length
    const overAllocated = resources.filter(r => r.utilization > 100).length
    const pendingRequests = allocations.filter(a => a.status === 'pending').length
    const activeProjects = projects.filter(p => p.status === 'active').length

    return {
      activeAllocations,
      totalHours,
      totalBillable,
      avgUtilization,
      availableResources,
      totalResources: resources.length,
      overAllocated,
      pendingRequests,
      activeProjects
    }
  }, [])

  // CRUD Handlers
  const handleCreateAllocation = async () => {
    if (!formData.resource_name || !formData.project_name) {
      toast.error('Validation Error')
      return
    }
    try {
      await createAllocation({
        resource_name: formData.resource_name,
        resource_role: formData.resource_role,
        project_name: formData.project_name,
        allocation_type: formData.allocation_type,
        status: formData.status,
        priority: formData.priority,
        hours_per_week: formData.hours_per_week,
        allocated_hours: formData.allocated_hours,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        billable_rate: formData.billable_rate,
        notes: formData.notes,
      })
      toast.success(`${formData.employee_name} allocated to ${formData.project_name}`)
      setShowCreateDialog(false)
      setFormData(initialFormState)
      refetch()
    } catch (error) {
      toast.error('Failed to create allocation')
    }
  }

  const handleUpdateAllocation = async () => {
    if (!editingId) return
    try {
      await updateAllocation({
        id: editingId,
        updates: {
          resource_name: formData.resource_name,
          resource_role: formData.resource_role,
          project_name: formData.project_name,
          allocation_type: formData.allocation_type,
          status: formData.status,
          priority: formData.priority,
          hours_per_week: formData.hours_per_week,
          allocated_hours: formData.allocated_hours,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          billable_rate: formData.billable_rate,
          notes: formData.notes,
        }
      })
      toast.success('Allocation Updated')
      setShowEditDialog(false)
      setSelectedAllocation(null)
      setEditingId(null)
      setFormData(initialFormState)
      refetch()
    } catch (error) {
      toast.error('Failed to update allocation')
    }
  }

  const handleDeleteAllocation = async (id: string, resourceName: string) => {
    try {
      await deleteAllocation(id)
      toast.success(`Allocation Deleted: ${resourceName}'s allocation removed`)
      setSelectedAllocation(null)
      refetch()
    } catch (error) {
      toast.error('Failed to delete allocation')
    }
  }

  const handleApproveAllocation = async (id: string, resourceName: string) => {
    try {
      await activateAllocation(id)
      toast.success(`Allocation Approved: ${resourceName}'s allocation is now active`)
      refetch()
    } catch (error) {
      toast.error('Failed to approve allocation')
    }
  }

  const handleCompleteAllocation = async (id: string, resourceName: string) => {
    try {
      await completeAllocation(id)
      toast.success(`Allocation Completed: ${resourceName}'s allocation marked complete`)
      refetch()
    } catch (error) {
      toast.error('Failed to complete allocation')
    }
  }

  const handleCancelAllocation = async (id: string, resourceName: string) => {
    try {
      await cancelAllocation(id)
      toast.info(`Allocation Cancelled: ${resourceName}'s allocation was cancelled`)
      refetch()
    } catch (error) {
      toast.error('Failed to cancel allocation')
    }
  }

  const openEditDialog = (allocation: Allocation) => {
    setFormData({
      resource_name: allocation.resource_name,
      resource_role: allocation.resource_role,
      project_name: allocation.project_name,
      allocation_type: allocation.allocation_type,
      status: allocation.status,
      priority: allocation.priority,
      hours_per_week: allocation.hours_per_week,
      allocated_hours: 0,
      start_date: allocation.start_date,
      end_date: allocation.end_date,
      billable_rate: allocation.billable_rate,
      notes: allocation.notes,
    })
    setEditingId(allocation.id)
    setShowEditDialog(true)
  }

  const handleExportAllocations = async () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        allocations: allocations.map(a => ({
          member: a.member_name,
          project: a.project_name,
          type: a.allocation_type,
          status: a.status,
          hoursPerWeek: a.hours_per_week,
          allocatedHours: a.allocated_hours,
          startDate: a.start_date,
          endDate: a.end_date,
          billableRate: a.billable_rate,
          notes: a.notes
        })),
        summary: {
          totalAllocations: allocations.length,
          totalHours: allocations.reduce((sum, a) => sum + (a.allocated_hours || 0), 0),
          byStatus: allocations.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `allocations-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Allocation report downloaded')
    } catch (error) {
      toast.error('Export failed', { description: error.message })
    }
  }

  const handleRefresh = async () => {
    toast.promise(
      refetch(),
      {
        loading: 'Refreshing data...',
        success: 'Data updated successfully',
        error: 'Failed to refresh data'
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Allocation</h1>
              <p className="text-gray-500 dark:text-gray-400">Resource Guru level resource management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            <Button
              className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white"
              onClick={() => { setFormData(initialFormState); setShowCreateDialog(true) }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Allocation
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Active Allocations', value: stats.activeAllocations.toString(), icon: UserCheck, color: 'from-fuchsia-500 to-purple-500', change: 8.5 },
            { label: 'Total Hours/Week', value: `${stats.totalHours}h`, icon: Clock, color: 'from-blue-500 to-cyan-500', change: 12.3 },
            { label: 'Weekly Revenue', value: formatCurrency(stats.totalBillable), icon: DollarSign, color: 'from-green-500 to-emerald-500', change: 15.2 },
            { label: 'Avg Utilization', value: `${stats.avgUtilization.toFixed(0)}%`, icon: Percent, color: 'from-orange-500 to-amber-500', change: 3.4 },
            { label: 'Available', value: `${stats.availableResources}/${stats.totalResources}`, icon: Users, color: 'from-teal-500 to-cyan-500', change: 0 },
            { label: 'Over-Allocated', value: stats.overAllocated.toString(), icon: AlertTriangle, color: 'from-red-500 to-rose-500', change: -2.1 },
            { label: 'Pending', value: stats.pendingRequests.toString(), icon: Clock, color: 'from-yellow-500 to-orange-500', change: 5.0 },
            { label: 'Active Projects', value: stats.activeProjects.toString(), icon: Briefcase, color: 'from-purple-500 to-violet-500', change: 0 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="allocations" className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4" />
              Allocations
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Capacity
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Allocations Tab */}
          <TabsContent value="allocations" className="mt-6">
            {/* Allocations Banner */}
            <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Resource Allocations</h2>
                  <p className="text-fuchsia-100">Resource Guru-level allocation management with real-time tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{allocations.length}</p>
                    <p className="text-fuchsia-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{allocations.filter(a => a.status === 'active').length}</p>
                    <p className="text-fuchsia-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{allocations.filter(a => a.status === 'pending').length}</p>
                    <p className="text-fuchsia-200 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocations Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Allocation', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => { setFormData(initialFormState); setShowCreateDialog(true) } },
                { icon: UserCheck, label: 'Assign', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowAssignDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setActiveTab('schedule') },
                { icon: Clock, label: 'Time Entry', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowTimeEntryDialog(true) },
                { icon: CheckCircle, label: 'Approve', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowApproveDialog(true) },
                { icon: GitBranch, label: 'Transfer', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowTransferDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setActiveTab('reports') },
                { icon: Settings, label: 'Settings', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>All Allocations</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search allocations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'active', 'pending', 'completed'] as const).map(status => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className={statusFilter === status ? 'bg-fuchsia-600' : ''}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredAllocations.map(allocation => (
                    <div
                      key={allocation.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedAllocation(allocation)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={allocation.resource_avatar} alt="User avatar" />
                          <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white text-sm">
                            {allocation.resource_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {allocation.resource_name}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="font-medium" style={{ color: allocation.project_color }}>
                              {allocation.project_name}
                            </span>
                            <Badge className={getStatusColor(allocation.status)}>
                              {allocation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            {allocation.resource_role} • {allocation.allocation_type}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {allocation.hours_per_week}h/week
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {allocation.start_date} to {allocation.end_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(allocation.billable_rate)}/hr
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getPriorityColor(allocation.priority)}>
                            {allocation.priority}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-2">
                            {allocation.project_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-6">
            {/* Resources Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Team Resources</h2>
                  <p className="text-blue-100">Manage team capacity, skills, and availability</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{resources.length}</p>
                    <p className="text-blue-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{resources.filter(r => r.status === 'available').length}</p>
                    <p className="text-blue-200 text-sm">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{resources.length > 0 ? (resources.reduce((acc, r) => acc + r.utilization, 0) / resources.length).toFixed(0) : 0}%</p>
                    <p className="text-blue-200 text-sm">Avg Util</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Resource', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => { setFormData(initialFormState); setShowCreateDialog(true) } },
                { icon: Users, label: 'Team View', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setViewMode('grid') },
                { icon: Star, label: 'Skills', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setActiveTab('capacity') },
                { icon: BarChart3, label: 'Utilization', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('reports') },
                { icon: Plane, label: 'Time Off', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setActiveTab('schedule') },
                { icon: DollarSign, label: 'Rates', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setActiveTab('settings') },
                { icon: Eye, label: 'Availability', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setActiveTab('schedule') },
                { icon: Settings, label: 'Settings', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(resource => (
                <Card
                  key={resource.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedResource(resource)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={resource.avatar} alt="User avatar" />
                        <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white">
                          {resource.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{resource.name}</h3>
                        <p className="text-sm text-gray-500">{resource.role}</p>
                        <Badge className={`mt-1 ${getResourceStatusColor(resource.status)}`}>
                          {resource.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Utilization</span>
                        <span className={`font-semibold ${getUtilizationColor(resource.utilization)}`}>
                          {resource.utilization}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(resource.utilization, 100)}
                        className="h-2"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 pt-3 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Allocated</p>
                          <p className="font-semibold">{resource.allocated_hours}h/week</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="font-semibold">{resource.capacity_hours}h/week</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bill Rate</p>
                          <p className="font-semibold">${resource.hourly_rate}/hr</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cost Rate</p>
                          <p className="font-semibold">${resource.cost_rate}/hr</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">Top Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {resource.skills.slice(0, 3).map(skill => (
                            <Badge key={skill.name} variant="outline" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Capacity Tab */}
          <TabsContent value="capacity" className="mt-6">
            {/* Capacity Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Capacity Planning</h2>
                  <p className="text-orange-100">Forecast-level capacity management and workload balancing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{resources.reduce((acc, r) => acc + r.capacity_hours, 0)}h</p>
                    <p className="text-orange-200 text-sm">Total Capacity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{resources.reduce((acc, r) => acc + r.allocated_hours, 0)}h</p>
                    <p className="text-orange-200 text-sm">Allocated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.max(0, resources.reduce((acc, r) => acc + (r.capacity_hours - r.allocated_hours), 0))}h</p>
                    <p className="text-orange-200 text-sm">Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: BarChart3, label: 'Forecast', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setActiveTab('reports') },
                { icon: TrendingUp, label: 'Trends', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setActiveTab('reports') },
                { icon: AlertTriangle, label: 'Alerts', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setAlertSettings(prev => ({ ...prev, capacityWarnings: !prev.capacityWarnings })) },
                { icon: Users, label: 'Hiring', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setActiveTab('resources') },
                { icon: Layers, label: 'Balance', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowAssignDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('schedule') },
                { icon: RefreshCw, label: 'Optimize', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => handleRefresh() },
                { icon: Settings, label: 'Settings', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Team Capacity Overview</CardTitle>
                  <CardDescription>Weekly capacity and allocation forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resources.map(resource => (
                      <div key={resource.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white">
                                {resource.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getUtilizationColor(resource.utilization)}`}>
                              {resource.utilization}%
                            </p>
                            <p className="text-xs text-gray-500">
                              {resource.allocated_hours}/{resource.capacity_hours}h
                            </p>
                          </div>
                        </div>
                        <Progress
                          value={Math.min(resource.utilization, 100)}
                          className={`h-3 ${resource.utilization > 100 ? 'bg-red-100' : ''}`}
                        />
                        {resource.utilization > 100 && (
                          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Over-allocated by {resource.allocated_hours - resource.capacity_hours}h
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Capacity Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Total Capacity</span>
                        <span className="font-bold">{resources.reduce((acc, r) => acc + r.capacity_hours, 0)}h/week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Allocated</span>
                        <span className="font-bold">{resources.reduce((acc, r) => acc + r.allocated_hours, 0)}h/week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Available</span>
                        <span className="font-bold text-green-600">
                          {Math.max(0, resources.reduce((acc, r) => acc + (r.capacity_hours - r.allocated_hours), 0))}h/week
                        </span>
                      </div>
                      <Progress
                        value={resources.reduce((acc, r) => acc + r.capacity_hours, 0) > 0 ? (resources.reduce((acc, r) => acc + r.allocated_hours, 0) / resources.reduce((acc, r) => acc + r.capacity_hours, 0)) * 100 : 0}
                        className="h-3"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Time Off</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {timeOffData.slice(0, 4).map(timeOff => (
                        <div key={timeOff.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            timeOff.type === 'vacation' ? 'bg-blue-100 text-blue-600' :
                            timeOff.type === 'sick' ? 'bg-red-100 text-red-600' :
                            timeOff.type === 'remote' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getTimeOffIcon(timeOff.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{timeOff.resource_name}</p>
                            <p className="text-xs text-gray-500">{timeOff.start_date}</p>
                          </div>
                          <Badge variant={timeOff.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                            {timeOff.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            {/* Schedule Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Schedule</h2>
                  <p className="text-green-100">Gantt-level project timeline and milestone tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{projects.length}</p>
                    <p className="text-green-200 text-sm">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
                    <p className="text-green-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{projects.reduce((acc, p) => acc + p.team_size, 0)}</p>
                    <p className="text-green-200 text-sm">Team Size</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Project', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => { setFormData(initialFormState); setShowCreateDialog(true) } },
                { icon: Calendar, label: 'Timeline', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setViewMode(viewMode === 'list' ? 'grid' : 'list') },
                { icon: Target, label: 'Milestones', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setActiveTab('allocations') },
                { icon: Briefcase, label: 'Resources', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('resources') },
                { icon: GitBranch, label: 'Dependencies', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: () => setShowTransferDialog(true) },
                { icon: Clock, label: 'Deadlines', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setActiveTab('schedule') },
                { icon: BarChart3, label: 'Reports', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setActiveTab('reports') },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Schedule</CardTitle>
                    <CardDescription>Timeline view of all projects and allocations</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const prevMonth = new Date(currentMonth)
                      prevMonth.setMonth(prevMonth.getMonth() - 1)
                      setCurrentMonth(prevMonth)
                      toast.success(`Viewing ${prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
                    }}>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </Button>
                    <span className="text-sm font-medium">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <Button variant="outline" size="sm" onClick={() => {
                      const nextMonth = new Date(currentMonth)
                      nextMonth.setMonth(nextMonth.getMonth() + 1)
                      setCurrentMonth(nextMonth)
                      toast.success(`Viewing ${nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
                    }}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.filter(p => p.status === 'active').map(project => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <div>
                            <h4 className="font-semibold">{project.name}</h4>
                            <p className="text-xs text-gray-500">{project.code} • {project.client_name}</p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 text-xs">Team Size</p>
                          <p className="font-semibold">{project.team_size} members</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Hours Used</p>
                          <p className="font-semibold">{project.consumed_hours}/{project.budget_hours}h</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Budget</p>
                          <p className="font-semibold">{formatCurrency(project.spent_amount)}/{formatCurrency(project.budget_amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Timeline</p>
                          <p className="font-semibold">{project.start_date} - {project.end_date}</p>
                        </div>
                      </div>
                      <Progress
                        value={(project.consumed_hours / project.budget_hours) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analytics & Reports</h2>
                  <p className="text-indigo-100">Tableau-level reporting with real-time insights</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{formatCurrency(stats.totalBillable)}</p>
                    <p className="text-indigo-200 text-sm">Weekly Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.avgUtilization.toFixed(0)}%</p>
                    <p className="text-indigo-200 text-sm">Avg Util</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">42%</p>
                    <p className="text-indigo-200 text-sm">Margin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: PieChart, label: 'Utilization', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setActiveTab('capacity') },
                { icon: BarChart3, label: 'Revenue', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setActiveTab('settings') },
                { icon: TrendingUp, label: 'Trends', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('capacity') },
                { icon: Users, label: 'Team', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setActiveTab('resources') },
                { icon: Briefcase, label: 'Projects', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('schedule') },
                { icon: DollarSign, label: 'Billing', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setActiveTab('settings') },
                { icon: Calendar, label: 'Schedule', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setActiveTab('schedule') },
                { icon: ArrowUpRight, label: 'Export', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => { toast.success('Exporting report data...'); const blob = new Blob(['Report Data Export'], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'allocation-report.txt'; a.click() } },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Utilization by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Engineering', 'Design', 'Operations'].map((dept, i) => {
                      const deptResources = resources.filter(r => r.department === dept)
                      const avgUtil = deptResources.length > 0
                        ? deptResources.reduce((acc, r) => acc + r.utilization, 0) / deptResources.length
                        : 0
                      return (
                        <div key={dept} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium">{dept}</div>
                          <div className="flex-1">
                            <Progress value={avgUtil} className="h-3" />
                          </div>
                          <div className={`w-16 text-right font-semibold ${getUtilizationColor(avgUtil)}`}>
                            {avgUtil.toFixed(0)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Project Allocation Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 4).map(project => (
                      <div key={project.id} className="flex items-center gap-4">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="w-32 text-sm font-medium truncate">{project.name}</div>
                        <div className="flex-1">
                          <Progress
                            value={(project.allocated_hours / project.budget_hours) * 100}
                            className="h-3"
                          />
                        </div>
                        <div className="w-20 text-right text-sm">
                          {project.allocated_hours}/{project.budget_hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Weekly Billable</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBillable)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Monthly Projection</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalBillable * 4)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Avg Bill Rate</p>
                      <p className="text-2xl font-bold">{formatCurrency(resources.length > 0 ? resources.reduce((acc, r) => acc + r.hourly_rate, 0) / resources.length : 0)}/hr</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Gross Margin</p>
                      <p className="text-2xl font-bold text-green-600">42%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resources
                      .sort((a, b) => b.utilization - a.utilization)
                      .slice(0, 5)
                      .map((resource, i) => (
                        <div key={resource.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {resource.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{resource.name}</p>
                            <p className="text-xs text-gray-500">{resource.role}</p>
                          </div>
                          <span className={`font-semibold ${getUtilizationColor(resource.utilization)}`}>
                            {resource.utilization}%
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Settings & Configuration</h2>
                  <p className="text-slate-100">Customize allocation rules, rates, and notifications</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">40h</p>
                    <p className="text-slate-200 text-sm">Work Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">80%</p>
                    <p className="text-slate-200 text-sm">Target Util</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">$150</p>
                    <p className="text-slate-200 text-sm">Default Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Clock, label: 'Work Hours', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowTimeEntryDialog(true) },
                { icon: Target, label: 'Targets', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', onClick: () => setActiveTab('capacity') },
                { icon: DollarSign, label: 'Billing', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400', onClick: () => setActiveTab('reports') },
                { icon: AlertTriangle, label: 'Alerts', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/30 dark:text-neutral-400', onClick: () => setAlertSettings(prev => ({ ...prev, overAllocation: !prev.overAllocation, pendingApprovals: !prev.pendingApprovals, capacityWarnings: !prev.capacityWarnings })) },
                { icon: Users, label: 'Roles', color: 'bg-stone-100 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400', onClick: () => setActiveTab('resources') },
                { icon: Calendar, label: 'Holidays', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setActiveTab('schedule') },
                { icon: RefreshCw, label: 'Sync', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => handleRefresh() },
                { icon: Zap, label: 'Integrations', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setActiveTab('reports') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Working Hours
                  </CardTitle>
                  <CardDescription>Default working hours configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Standard Work Week</p>
                        <p className="text-sm text-gray-500">Default hours per week</p>
                      </div>
                      <Input type="number" defaultValue={40} className="w-20 text-center" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Work Day Start</p>
                        <p className="text-sm text-gray-500">Default start time</p>
                      </div>
                      <Input type="time" defaultValue="09:00" className="w-32" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Work Day End</p>
                        <p className="text-sm text-gray-500">Default end time</p>
                      </div>
                      <Input type="time" defaultValue="18:00" className="w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Utilization Targets
                  </CardTitle>
                  <CardDescription>Team utilization thresholds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Target Utilization</p>
                        <p className="text-sm text-gray-500">Optimal utilization rate</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={80} className="w-20 text-center" />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Over-allocation Warning</p>
                        <p className="text-sm text-gray-500">Threshold for alerts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={100} className="w-20 text-center" />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Under-utilization Warning</p>
                        <p className="text-sm text-gray-500">Low utilization threshold</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={50} className="w-20 text-center" />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Billing Defaults
                  </CardTitle>
                  <CardDescription>Default rates and billing settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Default Bill Rate</p>
                        <p className="text-sm text-gray-500">Standard hourly rate</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <Input type="number" defaultValue={150} className="w-24 text-center" />
                        <span className="text-gray-500">/hr</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Overtime Multiplier</p>
                        <p className="text-sm text-gray-500">Rate multiplier for overtime</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={1.5} step={0.1} className="w-20 text-center" />
                        <span className="text-gray-500">x</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Alert and notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Over-allocation Alerts</p>
                        <p className="text-sm text-gray-500">Notify when resources are over-booked</p>
                      </div>
                      <Button
                        variant={alertSettings.overAllocation ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = !alertSettings.overAllocation
                          setAlertSettings(prev => ({ ...prev, overAllocation: newValue }))
                          toast.success(newValue ? 'Over-allocation alerts enabled' : 'Over-allocation alerts disabled')
                        }}
                      >
                        {alertSettings.overAllocation ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pending Approvals</p>
                        <p className="text-sm text-gray-500">Daily digest of pending requests</p>
                      </div>
                      <Button
                        variant={alertSettings.pendingApprovals ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = !alertSettings.pendingApprovals
                          setAlertSettings(prev => ({ ...prev, pendingApprovals: newValue }))
                          toast.success(newValue ? 'Pending approvals digest enabled' : 'Pending approvals digest disabled')
                        }}
                      >
                        {alertSettings.pendingApprovals ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Capacity Warnings</p>
                        <p className="text-sm text-gray-500">Alert when capacity runs low</p>
                      </div>
                      <Button
                        variant={alertSettings.capacityWarnings ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = !alertSettings.capacityWarnings
                          setAlertSettings(prev => ({ ...prev, capacityWarnings: newValue }))
                          toast.success(newValue ? 'Capacity warnings enabled' : 'Capacity warnings disabled')
                        }}
                      >
                        {alertSettings.capacityWarnings ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={allocationCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={allocationPredictions}
              title="Capacity Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={allocationQuickActions}
            variant="grid"
          />
        </div>

        {/* Allocation Detail Dialog */}
        <Dialog open={!!selectedAllocation} onOpenChange={() => setSelectedAllocation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <CalendarRange className="w-5 h-5" />
                Allocation Details
              </DialogTitle>
              <DialogDescription>
                {selectedAllocation?.project_name} • {selectedAllocation?.project_code}
              </DialogDescription>
            </DialogHeader>
            {selectedAllocation && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white">
                        {selectedAllocation.resource_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedAllocation.resource_name}</h3>
                      <p className="text-gray-500">{selectedAllocation.resource_role}</p>
                    </div>
                    <Badge className={`ml-auto ${getStatusColor(selectedAllocation.status)}`}>
                      {selectedAllocation.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Hours/Week</p>
                      <p className="font-semibold">{selectedAllocation.hours_per_week}h</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Bill Rate</p>
                      <p className="font-semibold">${selectedAllocation.billable_rate}/hr</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="font-semibold">{selectedAllocation.start_date}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">End Date</p>
                      <p className="font-semibold">{selectedAllocation.end_date}</p>
                    </div>
                  </div>

                  {selectedAllocation.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Notes</p>
                      <p className="text-sm">{selectedAllocation.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        openEditDialog(selectedAllocation)
                        setSelectedAllocation(null)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      disabled={isDeleting}
                      onClick={() => handleDeleteAllocation(selectedAllocation.id, selectedAllocation.resource_name)}
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Delete
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Allocation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Allocation</DialogTitle>
              <DialogDescription>Assign a resource to a project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="resource_name">Resource Name *</Label>
                  <Input
                    id="resource_name"
                    value={formData.resource_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource_role">Role</Label>
                  <Input
                    id="resource_role"
                    value={formData.resource_role}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_role: e.target.value }))}
                    placeholder="Senior Developer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                  placeholder="Platform Redesign"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Allocation Type</Label>
                  <Select
                    value={formData.allocation_type}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, allocation_type: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hours_per_week">Hours/Week</Label>
                  <Input
                    id="hours_per_week"
                    type="number"
                    value={formData.hours_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_per_week: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billable_rate">Bill Rate ($/hr)</Label>
                  <Input
                    id="billable_rate"
                    type="number"
                    value={formData.billable_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, billable_rate: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Allocation notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAllocation} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Allocation Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Allocation</DialogTitle>
              <DialogDescription>Update allocation details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_resource_name">Resource Name *</Label>
                  <Input
                    id="edit_resource_name"
                    value={formData.resource_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_resource_role">Role</Label>
                  <Input
                    id="edit_resource_role"
                    value={formData.resource_role}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_role: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_project_name">Project Name *</Label>
                <Input
                  id="edit_project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_hours">Hours/Week</Label>
                  <Input
                    id="edit_hours"
                    type="number"
                    value={formData.hours_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_per_week: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_rate">Bill Rate ($/hr)</Label>
                  <Input
                    id="edit_rate"
                    type="number"
                    value={formData.billable_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, billable_rate: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_start">Start Date</Label>
                  <Input
                    id="edit_start"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_end">End Date</Label>
                  <Input
                    id="edit_end"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingId(null) }}>Cancel</Button>
              <Button onClick={handleUpdateAllocation} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Resource Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <UserCheck className="w-5 h-5" />
                Assign Resource
              </DialogTitle>
              <DialogDescription>Select a resource to assign to a project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assign_resource">Select Resource</Label>
                <Select
                  value={formData.resource_name}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, resource_name: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Choose a resource" /></SelectTrigger>
                  <SelectContent>
                    {resources.filter(r => r.status === 'available').map(resource => (
                      <SelectItem key={resource.id} value={resource.name}>{resource.name} - {resource.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign_project">Select Project</Label>
                <Select
                  value={formData.project_name}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, project_name: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Choose a project" /></SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => p.status === 'active').map(project => (
                      <SelectItem key={project.id} value={project.name}>{project.name} ({project.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="assign_hours">Hours/Week</Label>
                  <Input
                    id="assign_hours"
                    type="number"
                    value={formData.hours_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_per_week: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assign_rate">Bill Rate ($/hr)</Label>
                  <Input
                    id="assign_rate"
                    type="number"
                    value={formData.billable_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, billable_rate: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (formData.resource_name && formData.project_name) {
                    handleCreateAllocation()
                    setShowAssignDialog(false)
                  } else {
                    toast.error('Please select both resource and project')
                  }
                }}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                Assign Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Entry Dialog */}
        <Dialog open={showTimeEntryDialog} onOpenChange={setShowTimeEntryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                Time Entry
              </DialogTitle>
              <DialogDescription>Log time for an allocation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="time_resource">Resource</Label>
                <Select
                  value={formData.resource_name}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, resource_name: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select resource" /></SelectTrigger>
                  <SelectContent>
                    {resources.map(resource => (
                      <SelectItem key={resource.id} value={resource.name}>{resource.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="time_hours">Hours</Label>
                  <Input
                    id="time_hours"
                    type="number"
                    value={timeEntryData.hours}
                    onChange={(e) => setTimeEntryData(prev => ({ ...prev, hours: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_date">Date</Label>
                  <Input
                    id="time_date"
                    type="date"
                    value={timeEntryData.date}
                    onChange={(e) => setTimeEntryData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_description">Description</Label>
                <Textarea
                  id="time_description"
                  value={timeEntryData.description}
                  onChange={(e) => setTimeEntryData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="What did you work on?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTimeEntryDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (timeEntryData.hours > 0 && timeEntryData.date) {
                    toast.success(`Time Entry Logged: ${timeEntryData.hours} hours recorded for ${timeEntryData.date}`)
                    setTimeEntryData({ hours: 0, description: '', date: '' })
                    setShowTimeEntryDialog(false)
                  } else {
                    toast.error('Please enter hours and date')
                  }
                }}
              >
                <Clock className="w-4 h-4 mr-2" />
                Log Time
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Allocations Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                Pending Approvals
              </DialogTitle>
              <DialogDescription>Review and approve pending resource allocations</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {allocations.filter(a => a.status === 'pending').length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No pending allocations to approve</p>
                  ) : (
                    allocations.filter(a => a.status === 'pending').map(allocation => (
                      <div key={allocation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{allocation.resource_name}</p>
                          <p className="text-sm text-gray-500">{allocation.project_name} - {allocation.hours_per_week}h/week</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelAllocation(allocation.id, allocation.resource_name)}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveAllocation(allocation.id, allocation.resource_name)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Allocation Dialog */}
        <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <GitBranch className="w-5 h-5" />
                Transfer Allocation
              </DialogTitle>
              <DialogDescription>Move a resource allocation to a different project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Allocation to Transfer</Label>
                <Select
                  value={formData.resource_name}
                  onValueChange={(v) => {
                    const allocation = allocations.find(a => a.resource_name === v)
                    if (allocation) {
                      setFormData(prev => ({
                        ...prev,
                        resource_name: allocation.resource_name,
                        project_name: allocation.project_name
                      }))
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select allocation" /></SelectTrigger>
                  <SelectContent>
                    {allocations.filter(a => a.status === 'active').map(allocation => (
                      <SelectItem key={allocation.id} value={allocation.resource_name}>
                        {allocation.resource_name} → {allocation.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Project</Label>
                <Select
                  value={transferData.targetProject}
                  onValueChange={(v) => setTransferData(prev => ({ ...prev, targetProject: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select target project" /></SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => p.status === 'active' && p.name !== formData.project_name).map(project => (
                      <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer_notes">Transfer Notes</Label>
                <Textarea
                  id="transfer_notes"
                  value={transferData.notes}
                  onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Reason for transfer..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (formData.resource_name && transferData.targetProject) {
                    toast.success(`Allocation Transferred: moved to ${transferData.targetProject}`)
                    setTransferData({ targetProject: '', notes: '' })
                    setFormData(initialFormState)
                    setShowTransferDialog(false)
                  } else {
                    toast.error('Please select allocation and target project')
                  }
                }}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resource Detail Dialog */}
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Resource Profile
              </DialogTitle>
            </DialogHeader>
            {selectedResource && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white text-xl">
                        {selectedResource.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-xl">{selectedResource.name}</h3>
                      <p className="text-gray-500">{selectedResource.role}</p>
                      <p className="text-sm text-gray-400">{selectedResource.department}</p>
                    </div>
                    <Badge className={`ml-auto ${getResourceStatusColor(selectedResource.status)}`}>
                      {selectedResource.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedResource.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedResource.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedResource.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400" />
                      {selectedResource.department}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Utilization</span>
                      <span className={`font-bold ${getUtilizationColor(selectedResource.utilization)}`}>
                        {selectedResource.utilization}%
                      </span>
                    </div>
                    <Progress value={Math.min(selectedResource.utilization, 100)} className="h-3" />
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedResource.allocated_hours}h allocated of {selectedResource.capacity_hours}h capacity
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-3">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedResource.skills.map(skill => (
                        <Badge key={skill.name} className={getSkillLevelColor(skill.level)}>
                          {skill.name} • {skill.level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => { setSearchQuery(selectedResource?.name || ''); setSelectedResource(null); setActiveTab('allocations') }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Allocations
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white" onClick={() => { setSelectedResource(null); setFormData(prev => ({ ...prev, resource_name: selectedResource?.name || '' })); setShowCreateDialog(true) }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Allocation
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
