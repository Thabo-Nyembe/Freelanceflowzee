'use client'

import { useState, useMemo } from 'react'
import {
  Wrench, Clock, CheckCircle, AlertCircle, XCircle, Server,
  Activity, Calendar, Settings, AlertTriangle, TrendingUp, Zap,
  BarChart3, Bell, Pause, Play, Info, Users, Plus, Search,
  Download, RefreshCw, Eye, Trash2, FileText, Shield, Database,
  HardDrive, Cpu, Cloud, RotateCw, Timer, Target, Layers,
  ClipboardList, History, PenTool, Tag, MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

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

// Mock Data
const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'WO-2024-001',
    title: 'HVAC System Annual Inspection',
    description: 'Annual preventive maintenance for building HVAC system including filter replacement and coil cleaning.',
    type: 'preventive',
    status: 'in_progress',
    priority: 'high',
    asset: 'Main HVAC Unit - Building A',
    assetId: 'AST-001',
    location: 'Building A - Mechanical Room',
    assignedTo: [
      { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Maintenance Tech' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'HVAC Specialist' }
    ],
    requestedBy: 'Facilities Manager',
    scheduledStart: '2024-12-25T08:00:00Z',
    scheduledEnd: '2024-12-25T16:00:00Z',
    actualStart: '2024-12-25T08:15:00Z',
    estimatedHours: 8,
    actualHours: 4,
    progress: 65,
    downtime: false,
    downtimeMinutes: 0,
    parts: [
      { id: '1', name: 'Air Filter 24x24', partNumber: 'AF-2424-M', quantity: 4, cost: 25.00, available: true },
      { id: '2', name: 'Refrigerant R-410A', partNumber: 'REF-410A-25', quantity: 2, cost: 150.00, available: true }
    ],
    checklists: [
      {
        id: '1',
        title: 'Pre-Maintenance Checks',
        items: [
          { id: '1', task: 'Turn off power supply', completed: true },
          { id: '2', task: 'Check refrigerant levels', completed: true },
          { id: '3', task: 'Inspect electrical connections', completed: true }
        ]
      }
    ],
    notes: 'Filters were heavily soiled. Recommend quarterly replacement.',
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-25T12:30:00Z',
    sla: { target: 24, remaining: 8, breached: false }
  },
  {
    id: '2',
    orderNumber: 'WO-2024-002',
    title: 'Emergency Generator Repair',
    description: 'Emergency repair for backup generator that failed during testing. Fuel pump suspected.',
    type: 'emergency',
    status: 'completed',
    priority: 'critical',
    asset: 'Backup Generator - Unit 1',
    assetId: 'AST-002',
    location: 'Building B - Generator Room',
    assignedTo: [
      { id: '3', name: 'Mike Wilson', email: 'mike@company.com', role: 'Electrical Tech' }
    ],
    requestedBy: 'Operations Manager',
    scheduledStart: '2024-12-24T14:00:00Z',
    scheduledEnd: '2024-12-24T18:00:00Z',
    actualStart: '2024-12-24T14:10:00Z',
    actualEnd: '2024-12-24T17:45:00Z',
    estimatedHours: 4,
    actualHours: 3.5,
    progress: 100,
    downtime: true,
    downtimeMinutes: 225,
    parts: [
      { id: '3', name: 'Fuel Pump Assembly', partNumber: 'FP-GEN-100', quantity: 1, cost: 450.00, available: true }
    ],
    checklists: [],
    notes: 'Fuel pump replaced. Generator tested successfully under load.',
    createdAt: '2024-12-24T13:00:00Z',
    updatedAt: '2024-12-24T17:45:00Z',
    sla: { target: 4, remaining: 0, breached: false }
  },
  {
    id: '3',
    orderNumber: 'WO-2024-003',
    title: 'Server Room UPS Battery Replacement',
    description: 'Scheduled replacement of UPS batteries in server room. System is 3 years old.',
    type: 'preventive',
    status: 'scheduled',
    priority: 'high',
    asset: 'UPS System - Server Room',
    assetId: 'AST-003',
    location: 'Data Center - Server Room A',
    assignedTo: [
      { id: '4', name: 'Emily Brown', email: 'emily@company.com', role: 'IT Tech' }
    ],
    requestedBy: 'IT Manager',
    scheduledStart: '2024-12-26T22:00:00Z',
    scheduledEnd: '2024-12-27T02:00:00Z',
    estimatedHours: 4,
    actualHours: 0,
    progress: 0,
    downtime: true,
    downtimeMinutes: 30,
    parts: [
      { id: '4', name: 'UPS Battery Pack', partNumber: 'BAT-UPS-3000', quantity: 8, cost: 200.00, available: true }
    ],
    checklists: [],
    notes: 'Scheduled during off-peak hours. IT team on standby.',
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-15T09:00:00Z',
    sla: { target: 72, remaining: 48, breached: false }
  },
  {
    id: '4',
    orderNumber: 'WO-2024-004',
    title: 'Elevator Monthly Inspection',
    description: 'Monthly safety inspection and lubrication for passenger elevator.',
    type: 'inspection',
    status: 'scheduled',
    priority: 'medium',
    asset: 'Passenger Elevator - Building A',
    assetId: 'AST-004',
    location: 'Building A - Elevator Shaft',
    assignedTo: [],
    requestedBy: 'Safety Officer',
    scheduledStart: '2024-12-27T06:00:00Z',
    scheduledEnd: '2024-12-27T09:00:00Z',
    estimatedHours: 3,
    actualHours: 0,
    progress: 0,
    downtime: true,
    downtimeMinutes: 180,
    parts: [],
    checklists: [],
    notes: '',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-01T08:00:00Z',
    sla: { target: 168, remaining: 96, breached: false }
  },
  {
    id: '5',
    orderNumber: 'WO-2024-005',
    title: 'Production Line Conveyor Belt Replacement',
    description: 'Replace worn conveyor belt on production line 3. Belt showing signs of cracking.',
    type: 'corrective',
    status: 'on_hold',
    priority: 'high',
    asset: 'Conveyor System - Line 3',
    assetId: 'AST-005',
    location: 'Manufacturing - Line 3',
    assignedTo: [
      { id: '5', name: 'David Lee', email: 'david@company.com', role: 'Mechanical Tech' }
    ],
    requestedBy: 'Production Manager',
    scheduledStart: '2024-12-28T06:00:00Z',
    scheduledEnd: '2024-12-28T14:00:00Z',
    estimatedHours: 8,
    actualHours: 0,
    progress: 0,
    downtime: true,
    downtimeMinutes: 480,
    parts: [
      { id: '5', name: 'Conveyor Belt 100m', partNumber: 'CB-100M-HD', quantity: 1, cost: 2500.00, available: false }
    ],
    checklists: [],
    notes: 'Waiting for replacement belt delivery. ETA Dec 27.',
    createdAt: '2024-12-22T11:00:00Z',
    updatedAt: '2024-12-24T10:00:00Z',
    sla: { target: 48, remaining: 24, breached: false }
  }
]

const mockAssets: Asset[] = [
  { id: 'AST-001', assetTag: 'HVAC-001', name: 'Main HVAC Unit', type: 'HVAC', manufacturer: 'Carrier', model: 'WeatherMaker 9200', serialNumber: 'WM9200-12345', location: 'Building A', status: 'maintenance', criticality: 'high', lastMaintenance: '2024-12-25T08:00:00Z', nextMaintenance: '2025-03-25T08:00:00Z', maintenanceCount: 24, uptime: 99.2, mtbf: 4320, mttr: 2.5, purchaseDate: '2020-01-15', warrantyExpiry: '2025-01-15', owner: 'Facilities' },
  { id: 'AST-002', assetTag: 'GEN-001', name: 'Backup Generator', type: 'Generator', manufacturer: 'Caterpillar', model: 'C15', serialNumber: 'CAT-C15-67890', location: 'Building B', status: 'operational', criticality: 'critical', lastMaintenance: '2024-12-24T14:00:00Z', nextMaintenance: '2025-01-24T14:00:00Z', maintenanceCount: 36, uptime: 99.8, mtbf: 8760, mttr: 3.0, purchaseDate: '2018-06-01', warrantyExpiry: '2023-06-01', owner: 'Operations' },
  { id: 'AST-003', assetTag: 'UPS-001', name: 'Server Room UPS', type: 'UPS', manufacturer: 'APC', model: 'Smart-UPS 3000', serialNumber: 'APC-3000-11111', location: 'Data Center', status: 'operational', criticality: 'critical', lastMaintenance: '2024-09-15T22:00:00Z', nextMaintenance: '2024-12-26T22:00:00Z', maintenanceCount: 12, uptime: 100.0, mtbf: 52560, mttr: 0.5, purchaseDate: '2021-09-01', warrantyExpiry: '2026-09-01', owner: 'IT' },
  { id: 'AST-004', assetTag: 'ELV-001', name: 'Passenger Elevator', type: 'Elevator', manufacturer: 'Otis', model: 'Gen2', serialNumber: 'OTIS-GEN2-22222', location: 'Building A', status: 'operational', criticality: 'high', lastMaintenance: '2024-11-27T06:00:00Z', nextMaintenance: '2024-12-27T06:00:00Z', maintenanceCount: 60, uptime: 99.5, mtbf: 2160, mttr: 1.0, purchaseDate: '2015-03-20', warrantyExpiry: '2020-03-20', owner: 'Facilities' },
  { id: 'AST-005', assetTag: 'CONV-003', name: 'Production Line 3 Conveyor', type: 'Conveyor', manufacturer: 'Dorner', model: '3200 Series', serialNumber: 'DOR-3200-33333', location: 'Manufacturing', status: 'degraded', criticality: 'high', lastMaintenance: '2024-10-15T06:00:00Z', nextMaintenance: '2024-12-28T06:00:00Z', maintenanceCount: 48, uptime: 97.8, mtbf: 1440, mttr: 4.0, purchaseDate: '2019-08-10', warrantyExpiry: '2024-08-10', owner: 'Production' }
]

const mockSchedules: MaintenanceSchedule[] = [
  { id: '1', name: 'HVAC Quarterly Inspection', description: 'Quarterly preventive maintenance for all HVAC units', type: 'preventive', frequency: 'quarterly', assets: ['AST-001'], lastRun: '2024-09-25', nextRun: '2024-12-25', duration: 480, active: true, assignedTeam: 'HVAC Team', checklist: ['Check filters', 'Inspect coils', 'Test thermostat', 'Check refrigerant'] },
  { id: '2', name: 'Generator Monthly Test', description: 'Monthly load test for backup generators', type: 'inspection', frequency: 'monthly', assets: ['AST-002'], lastRun: '2024-11-24', nextRun: '2024-12-24', duration: 120, active: true, assignedTeam: 'Electrical Team', checklist: ['Start generator', 'Run under load', 'Check fuel levels', 'Log readings'] },
  { id: '3', name: 'UPS Battery Check', description: 'Quarterly battery health check and capacity test', type: 'preventive', frequency: 'quarterly', assets: ['AST-003'], lastRun: '2024-09-15', nextRun: '2024-12-15', duration: 60, active: true, assignedTeam: 'IT Team', checklist: ['Check battery voltage', 'Test runtime', 'Inspect connections'] },
  { id: '4', name: 'Elevator Safety Inspection', description: 'Monthly safety inspection as per regulations', type: 'inspection', frequency: 'monthly', assets: ['AST-004'], lastRun: '2024-11-27', nextRun: '2024-12-27', duration: 180, active: true, assignedTeam: 'Elevator Contractor', checklist: ['Safety brake test', 'Door sensor test', 'Emergency phone test', 'Lubrication'] }
]

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

export default function MaintenanceClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all')

  // Computed stats
  const stats = useMemo(() => {
    const total = mockWorkOrders.length
    const scheduled = mockWorkOrders.filter(w => w.status === 'scheduled').length
    const inProgress = mockWorkOrders.filter(w => w.status === 'in_progress').length
    const completed = mockWorkOrders.filter(w => w.status === 'completed').length
    const overdue = mockWorkOrders.filter(w => w.sla.breached).length
    const avgCompletion = mockWorkOrders.filter(w => w.status === 'completed').reduce((sum, w) => sum + (w.actualHours / w.estimatedHours) * 100, 0) / (completed || 1)
    const totalDowntime = mockWorkOrders.reduce((sum, w) => sum + w.downtimeMinutes, 0)
    const criticalAssets = mockAssets.filter(a => a.criticality === 'critical').length

    return {
      total,
      scheduled,
      inProgress,
      completed,
      overdue,
      avgCompletion: Math.round(avgCompletion),
      totalDowntime,
      criticalAssets,
      uptime: 99.5
    }
  }, [])

  // Filtered work orders
  const filteredOrders = useMemo(() => {
    return mockWorkOrders.filter(order => {
      const matchesSearch = searchQuery === '' ||
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.asset.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

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
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center gap-2">
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
              <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
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
                        {mockWorkOrders.filter(w => ['in_progress', 'scheduled'].includes(w.status)).map((order) => (
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
                      {mockAssets.slice(0, 4).map((asset) => (
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
                    {mockSchedules.map((schedule) => (
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
                                  {order.sla.breached && <Badge className="bg-red-100 text-red-700 mt-1">SLA Breached</Badge>}
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
                                <div className="grid grid-cols-2 gap-4">
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
                      {mockAssets.map((asset) => (
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
                            <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
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
                {mockSchedules.map((schedule) => (
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
                      <div className="grid grid-cols-2 gap-4 mb-4">
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

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Work Order Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Auto-assign work orders</p>
                        <p className="text-sm text-gray-500">Automatically assign based on team availability</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Require approval for emergency</p>
                        <p className="text-sm text-gray-500">Emergency work orders need manager approval</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
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
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">SLA breach alerts</p>
                        <p className="text-sm text-gray-500">Alert when SLA is about to be breached</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Scheduled maintenance reminders</p>
                        <p className="text-sm text-gray-500">Notify team before scheduled maintenance</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Asset health alerts</p>
                        <p className="text-sm text-gray-500">Alert when asset health degrades</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
