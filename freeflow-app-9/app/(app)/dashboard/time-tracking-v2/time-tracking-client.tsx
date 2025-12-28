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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Clock, Play, Pause, Square, Plus, Calendar, BarChart3, Settings, Download, ChevronLeft,
  ChevronRight, DollarSign, Target, TrendingUp, Users, Briefcase, Tag, Timer, Zap, Edit2,
  Trash2, FileText, Check, X, RefreshCw, Coffee, AlertCircle, ArrowUp, Receipt, Send,
  CheckCircle, XCircle, Eye, MoreHorizontal, Building2, Mail, Bell, Shield, Lock, Filter,
  Key, Webhook, AlertOctagon, Sliders, Network, HardDrive, Cpu, Globe, CreditCard, Archive, Trash2 as TrashIcon,
  Printer, Copy, Repeat, RefreshCcw
} from 'lucide-react'
import { CardDescription } from '@/components/ui/card'

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

// Mock Data
const mockProjects: Project[] = [
  { id: '1', name: 'Website Redesign', client: 'Acme Corp', color: 'indigo', status: 'active', billable: true, hourlyRate: 150, budget: 20000, spent: 12500, totalHours: 83.3 },
  { id: '2', name: 'Mobile App Dev', client: 'TechStart', color: 'purple', status: 'active', billable: true, hourlyRate: 175, budget: 35000, spent: 28000, totalHours: 160 },
  { id: '3', name: 'Brand Strategy', client: 'Global Inc', color: 'pink', status: 'active', billable: true, hourlyRate: 200, budget: 15000, spent: 8000, totalHours: 40 },
  { id: '4', name: 'Internal Training', client: 'Internal', color: 'gray', status: 'active', billable: false, hourlyRate: 0, totalHours: 24, spent: 0 },
  { id: '5', name: 'Marketing Campaign', client: 'Acme Corp', color: 'emerald', status: 'completed', billable: true, hourlyRate: 125, budget: 10000, spent: 9500, totalHours: 76 }
]

const mockEntries: TimeEntry[] = [
  { id: '1', title: 'Homepage design review', projectId: '1', projectName: 'Website Redesign', startTime: '2024-01-16T09:00:00', endTime: '2024-01-16T11:30:00', durationSeconds: 9000, durationHours: 2.5, status: 'stopped', isBillable: true, billableAmount: 375, hourlyRate: 150, tags: ['design', 'review'] },
  { id: '2', title: 'API integration work', projectId: '2', projectName: 'Mobile App Dev', startTime: '2024-01-16T13:00:00', endTime: '2024-01-16T17:00:00', durationSeconds: 14400, durationHours: 4, status: 'stopped', isBillable: true, billableAmount: 700, hourlyRate: 175, tags: ['development', 'api'] },
  { id: '3', title: 'Client meeting', projectId: '3', projectName: 'Brand Strategy', startTime: '2024-01-16T10:00:00', endTime: '2024-01-16T11:00:00', durationSeconds: 3600, durationHours: 1, status: 'approved', isBillable: true, billableAmount: 200, hourlyRate: 200, tags: ['meeting'] },
  { id: '4', title: 'Bug fixing session', projectId: '2', projectName: 'Mobile App Dev', startTime: '2024-01-15T14:00:00', endTime: '2024-01-15T18:00:00', durationSeconds: 14400, durationHours: 4, status: 'stopped', isBillable: true, billableAmount: 700, hourlyRate: 175, tags: ['bug-fix'] },
  { id: '5', title: 'Working on feature X', projectId: '1', projectName: 'Website Redesign', startTime: '2024-01-16T14:00:00', durationSeconds: 3600, durationHours: 1, status: 'running', isBillable: true, billableAmount: 150, hourlyRate: 150, tags: ['feature'] }
]

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Lead Developer', todayHours: 6.5, weekHours: 32, activeProject: 'Website Redesign', isOnline: true },
  { id: '2', name: 'Mike Johnson', email: 'mike@company.com', role: 'Designer', todayHours: 4.2, weekHours: 28, activeProject: 'Brand Strategy', isOnline: true },
  { id: '3', name: 'Emily Davis', email: 'emily@company.com', role: 'Developer', todayHours: 7.0, weekHours: 35, activeProject: 'Mobile App Dev', isOnline: false },
  { id: '4', name: 'Alex Kim', email: 'alex@company.com', role: 'Project Manager', todayHours: 5.5, weekHours: 30, isOnline: true }
]

const mockInvoices: Invoice[] = [
  { id: '1', number: 'INV-001', client: 'Acme Corp', project: 'Website Redesign', amount: 12500, hours: 83.3, status: 'paid', dueDate: '2024-01-15', createdAt: '2024-01-01' },
  { id: '2', number: 'INV-002', client: 'TechStart', project: 'Mobile App Dev', amount: 28000, hours: 160, status: 'sent', dueDate: '2024-02-01', createdAt: '2024-01-16' },
  { id: '3', number: 'INV-003', client: 'Global Inc', project: 'Brand Strategy', amount: 8000, hours: 40, status: 'draft', dueDate: '2024-02-15', createdAt: '2024-01-16' },
  { id: '4', number: 'INV-004', client: 'Acme Corp', project: 'Marketing Campaign', amount: 9500, hours: 76, status: 'overdue', dueDate: '2024-01-10', createdAt: '2023-12-15' }
]

const mockGoals: Goal[] = [
  { id: '1', label: 'Daily Hours', target: 8, current: 6.5, unit: 'h' },
  { id: '2', label: 'Weekly Hours', target: 40, current: 32, unit: 'h' },
  { id: '3', label: 'Billable %', target: 80, current: 75, unit: '%' },
  { id: '4', label: 'Monthly Revenue', target: 15000, current: 12500, unit: '$' }
]

const mockClients: Client[] = [
  { id: '1', name: 'Acme Corp', email: 'billing@acme.com', phone: '+1 555-0101', address: '123 Business Ave, NYC', currency: 'USD', projects: 3, totalBilled: 125000, outstandingBalance: 12500, status: 'active', createdAt: '2023-01-15', color: 'blue' },
  { id: '2', name: 'TechStart', email: 'finance@techstart.io', phone: '+1 555-0102', address: '456 Innovation Blvd, SF', currency: 'USD', projects: 2, totalBilled: 85000, outstandingBalance: 28000, status: 'active', createdAt: '2023-03-22', color: 'purple' },
  { id: '3', name: 'Global Inc', email: 'accounts@global.com', phone: '+1 555-0103', address: '789 Enterprise Dr, LA', currency: 'USD', projects: 1, totalBilled: 45000, outstandingBalance: 8000, status: 'active', createdAt: '2023-06-10', color: 'green' },
  { id: '4', name: 'StartupXYZ', email: 'hello@startupxyz.com', phone: '+1 555-0104', address: '321 Launch St, Austin', currency: 'USD', projects: 1, totalBilled: 15000, outstandingBalance: 0, status: 'inactive', createdAt: '2022-11-05', color: 'orange' }
]

const mockTags: Tag[] = [
  { id: '1', name: 'design', color: 'pink', usageCount: 45, createdAt: '2023-01-10' },
  { id: '2', name: 'development', color: 'blue', usageCount: 128, createdAt: '2023-01-10' },
  { id: '3', name: 'meeting', color: 'purple', usageCount: 67, createdAt: '2023-01-10' },
  { id: '4', name: 'review', color: 'amber', usageCount: 34, createdAt: '2023-01-15' },
  { id: '5', name: 'bug-fix', color: 'red', usageCount: 89, createdAt: '2023-02-01' },
  { id: '6', name: 'research', color: 'green', usageCount: 23, createdAt: '2023-02-15' },
  { id: '7', name: 'planning', color: 'indigo', usageCount: 56, createdAt: '2023-03-01' },
  { id: '8', name: 'documentation', color: 'cyan', usageCount: 41, createdAt: '2023-03-10' }
]

const mockTimeOff: TimeOffRequest[] = [
  { id: '1', userId: '1', userName: 'Sarah Chen', type: 'vacation', startDate: '2024-02-15', endDate: '2024-02-20', hours: 40, status: 'approved', notes: 'Family vacation', createdAt: '2024-01-10' },
  { id: '2', userId: '2', userName: 'Mike Johnson', type: 'sick', startDate: '2024-01-18', endDate: '2024-01-19', hours: 16, status: 'approved', notes: 'Medical appointment', createdAt: '2024-01-17' },
  { id: '3', userId: '3', userName: 'Emily Davis', type: 'personal', startDate: '2024-02-01', endDate: '2024-02-01', hours: 8, status: 'pending', notes: 'Personal matter', createdAt: '2024-01-16' },
  { id: '4', userId: '4', userName: 'Alex Kim', type: 'holiday', startDate: '2024-02-19', endDate: '2024-02-19', hours: 8, status: 'approved', notes: 'Presidents Day', createdAt: '2024-01-05' }
]

const mockSavedReports: SavedReport[] = [
  { id: '1', name: 'Weekly Team Summary', type: 'weekly', dateRange: 'week', filters: ['all-projects'], schedule: 'Monday 9am', lastRun: '2024-01-15', createdAt: '2023-06-01', createdBy: 'Admin' },
  { id: '2', name: 'Monthly Client Billing', type: 'client', dateRange: 'month', filters: ['billable-only'], schedule: '1st of month', lastRun: '2024-01-01', createdAt: '2023-07-15', createdBy: 'Admin' },
  { id: '3', name: 'Project Budget Analysis', type: 'project', dateRange: 'quarter', filters: ['active-projects'], lastRun: '2024-01-10', createdAt: '2023-08-20', createdBy: 'Sarah Chen' },
  { id: '4', name: 'Team Utilization Report', type: 'team', dateRange: 'month', filters: ['all-members'], lastRun: '2024-01-12', createdAt: '2023-09-01', createdBy: 'Alex Kim' }
]

const mockAutomations: Automation[] = [
  { id: '1', name: 'Auto-stop timer at midnight', trigger: 'daily', actions: ['Stop running timers', 'Send notification'], conditions: ['Timer running > 8 hours'], isActive: true, lastTriggered: '2024-01-15', createdAt: '2023-06-15' },
  { id: '2', name: 'Weekly reminder to submit hours', trigger: 'weekly', actions: ['Email reminder', 'Slack notification'], conditions: ['Friday 4pm'], isActive: true, lastTriggered: '2024-01-12', createdAt: '2023-07-01' },
  { id: '3', name: 'Auto-tag based on project', trigger: 'on_entry', actions: ['Add project default tags'], conditions: ['New time entry created'], isActive: false, createdAt: '2023-08-10' },
  { id: '4', name: 'Monthly invoice generation', trigger: 'monthly', actions: ['Generate draft invoices', 'Notify admin'], conditions: ['Last day of month'], isActive: true, lastTriggered: '2024-01-31', createdAt: '2023-09-20' }
]

const mockIntegrations: Integration[] = [
  { id: '1', name: 'Google Calendar', type: 'calendar', icon: 'calendar', status: 'connected', lastSync: '2024-01-16 09:00', syncedItems: 156 },
  { id: '2', name: 'Jira', type: 'project', icon: 'folder', status: 'connected', lastSync: '2024-01-16 08:45', syncedItems: 89 },
  { id: '3', name: 'QuickBooks', type: 'accounting', icon: 'receipt', status: 'connected', lastSync: '2024-01-15 18:00', syncedItems: 234 },
  { id: '4', name: 'Slack', type: 'communication', icon: 'message', status: 'connected', lastSync: '2024-01-16 09:15', syncedItems: 45 },
  { id: '5', name: 'Salesforce', type: 'crm', icon: 'users', status: 'disconnected', lastSync: '2024-01-10 12:00', syncedItems: 0 },
  { id: '6', name: 'Asana', type: 'project', icon: 'check', status: 'error', lastSync: '2024-01-14 15:30', syncedItems: 67 }
]

const mockWorkspaces: Workspace[] = [
  { id: '1', name: 'Main Workspace', slug: 'main', members: 12, projects: 8, totalHours: 4560, plan: 'premium', createdAt: '2023-01-01' },
  { id: '2', name: 'Design Team', slug: 'design', members: 4, projects: 3, totalHours: 1200, plan: 'starter', createdAt: '2023-03-15' }
]

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
  const [settingsTab, setSettingsTab] = useState('general')
  const [reportsTab, setReportsTab] = useState('overview')
  const [teamTab, setTeamTab] = useState('activity')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const stats = useMemo(() => {
    const totalHours = mockEntries.reduce((sum, e) => sum + e.durationHours, 0)
    const billableHours = mockEntries.filter(e => e.isBillable).reduce((sum, e) => sum + e.durationHours, 0)
    const totalRevenue = mockEntries.reduce((sum, e) => sum + e.billableAmount, 0)
    const running = mockEntries.filter(e => e.status === 'running').length
    return {
      totalHours: totalHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      billablePercent: totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(0) : '0',
      totalRevenue,
      entries: mockEntries.length,
      running,
      projects: mockProjects.filter(p => p.status === 'active').length,
      teamOnline: mockTeam.filter(t => t.isOnline).length
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
    { label: 'Team Online', value: `${stats.teamOnline}/${mockTeam.length}`, icon: Users, color: 'from-cyan-500 to-cyan-600', trend: '' }
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
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>

        {/* Live Timer Bar */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Input value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder="What are you working on?" className="flex-1 text-lg" />
              <Select value={timerProject} onValueChange={setTimerProject}><SelectTrigger className="w-48"><SelectValue placeholder="Project" /></SelectTrigger><SelectContent>{mockProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
              <Button variant={timerBillable ? 'default' : 'outline'} size="icon" onClick={() => setTimerBillable(!timerBillable)} className={timerBillable ? 'bg-emerald-500 hover:bg-emerald-600' : ''}><DollarSign className="h-5 w-5" /></Button>
              <div className="text-4xl font-mono font-bold min-w-[160px] text-center">{formatTimer(timerSeconds)}</div>
              {isTimerRunning ? (
                <><Button variant="outline" size="icon" onClick={toggleTimer}><Pause className="h-5 w-5" /></Button><Button variant="destructive" size="icon" onClick={stopTimer}><Square className="h-5 w-5" /></Button></>
              ) : (
                <Button size="icon" className="bg-amber-500 hover:bg-amber-600" onClick={toggleTimer}><Play className="h-5 w-5" /></Button>
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
                    <p className="text-3xl font-bold">{mockEntries.filter(e => e.startTime.startsWith('2024-01-16')).reduce((sum, e) => sum + e.durationHours, 0).toFixed(1)}h</p>
                    <p className="text-amber-200 text-sm">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${mockEntries.filter(e => e.isBillable).reduce((sum, e) => sum + e.billableAmount, 0).toFixed(0)}</p>
                    <p className="text-amber-200 text-sm">Billable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Play, label: 'Start Timer', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Plus, label: 'Manual Entry', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Calendar, label: 'Calendar', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Briefcase, label: 'Projects', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Users, label: 'Team', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Receipt, label: 'Invoice', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Today's Entries</CardTitle><span className="text-sm text-gray-500">Total: {mockEntries.filter(e => e.startTime.startsWith('2024-01-16')).reduce((sum, e) => sum + e.durationHours, 0).toFixed(1)}h</span></CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {mockEntries.map(entry => (
                  <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          {entry.status === 'running' && <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>}
                          <h4 className="font-medium">{entry.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge className={getStatusColor(entry.isBillable ? 'paid' : 'draft')}>{entry.isBillable ? 'Billable' : 'Non-Billable'}</Badge>
                          <span className="text-gray-500">{entry.projectName}</span>
                          <span className="text-gray-400">{new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{entry.endTime && ` - ${new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {entry.billableAmount > 0 && <span className="text-sm font-medium text-emerald-600">${entry.billableAmount}</span>}
                        <div className="text-lg font-bold">{entry.durationHours.toFixed(1)}h</div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <p className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timesheet Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Entry', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Copy, label: 'Copy Week', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: CheckCircle, label: 'Submit', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Lock, label: 'Lock', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Calendar, label: 'View Month', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Printer, label: 'Print', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Mail, label: 'Email', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
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
                    {mockProjects.filter(p => p.status === 'active').slice(0, 4).map(project => (
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
                { icon: BarChart3, label: 'Summary', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: TrendingUp, label: 'Trends', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Users, label: 'By Team', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Briefcase, label: 'By Project', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Building2, label: 'By Client', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: DollarSign, label: 'Revenue', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Download, label: 'Export All', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
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
                <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
              </div>
            </div>

            {reportsTab === 'overview' && (
              <div className="grid grid-cols-2 gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Hours by Project</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockProjects.map(project => {
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
                    {mockGoals.map(goal => {
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
                          <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon"><Play className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button></div></td>
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
                      {mockClients.map(client => (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg bg-${client.color}-100 dark:bg-${client.color}-900/30 flex items-center justify-center`}><Building2 className={`h-5 w-5 text-${client.color}-600`} /></div><div><h4 className="font-medium">{client.name}</h4><p className="text-sm text-gray-500">{client.email}</p></div></div></td>
                          <td className="px-4 py-4 font-medium">{client.projects}</td>
                          <td className="px-4 py-4"><span className="font-bold text-emerald-600">${client.totalBilled.toLocaleString()}</span></td>
                          <td className="px-4 py-4">{client.outstandingBalance > 0 ? <span className="font-medium text-amber-600">${client.outstandingBalance.toLocaleString()}</span> : <span className="text-gray-400">$0</span>}</td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(client.status)}>{client.status}</Badge></td>
                          <td className="px-4 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></td>
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
                  <div className="grid grid-cols-4 gap-4">
                    {mockTags.map(tag => (
                      <div key={tag.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full bg-${tag.color}-500`}></div><span className="font-medium">{tag.name}</span></div>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><Edit2 className="h-3 w-3" /></Button>
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
                    <p className="text-3xl font-bold">{mockProjects.length}</p>
                    <p className="text-pink-200 text-sm">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'active').length}</p>
                    <p className="text-pink-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Project', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Users, label: 'Team View', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: DollarSign, label: 'Budgets', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Target, label: 'Milestones', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Archive, label: 'Archive', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: Tag, label: 'Tags', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: Download, label: 'Export', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Projects</CardTitle><Button><Plus className="h-4 w-4 mr-2" />New Project</Button></CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {mockProjects.map(project => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div><span className="font-medium">{project.name}</span></div></td>
                        <td className="px-4 py-4 text-gray-500">{project.client}</td>
                        <td className="px-4 py-4">{project.billable ? `$${project.hourlyRate}/hr` : 'Non-billable'}</td>
                        <td className="px-4 py-4 font-medium">{project.totalHours}h</td>
                        <td className="px-4 py-4">{project.budget ? <div><span className="font-medium">${project.spent.toLocaleString()}</span><span className="text-gray-500"> / ${project.budget.toLocaleString()}</span><Progress value={(project.spent / project.budget) * 100} className="h-1 mt-1" /></div> : '-'}</td>
                        <td className="px-4 py-4"><Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge></td>
                        <td className="px-4 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></td>
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
                    <p className="text-3xl font-bold">{mockTeam.length}</p>
                    <p className="text-violet-200 text-sm">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTeam.filter(m => m.isOnline).length}</p>
                    <p className="text-violet-200 text-sm">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Users, label: 'All Members', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Clock, label: 'Time Logs', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Calendar, label: 'Schedule', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Coffee, label: 'Time Off', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Target, label: 'Utilization', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Bell, label: 'Reminders', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Plus, label: 'Add Member', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
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
              <Button variant="outline"><Users className="h-4 w-4 mr-2" />Manage Team</Button>
            </div>

            {teamTab === 'activity' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Team Activity</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {mockTeam.map(member => (
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
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {teamTab === 'timeoff' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Time Off Requests</CardTitle><Button><Plus className="h-4 w-4 mr-2" />Request Time Off</Button></CardHeader>
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
                          <td className="px-4 py-4">{request.status === 'pending' && <div className="flex gap-1"><Button variant="ghost" size="icon" className="text-green-600"><Check className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-600"><X className="h-4 w-4" /></Button></div>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {teamTab === 'utilization' && (
              <div className="grid grid-cols-2 gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Team Utilization</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockTeam.map(member => {
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-amber-600">{mockTeam.length}</p><p className="text-sm text-gray-500">Team Members</p></div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-green-600">{mockTeam.filter(m => m.isOnline).length}</p><p className="text-sm text-gray-500">Currently Online</p></div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-blue-600">{mockTeam.reduce((sum, m) => sum + m.weekHours, 0)}h</p><p className="text-sm text-gray-500">Total Week Hours</p></div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center"><p className="text-3xl font-bold text-purple-600">{((mockTeam.reduce((sum, m) => sum + m.weekHours, 0) / (mockTeam.length * 40)) * 100).toFixed(0)}%</p><p className="text-sm text-gray-500">Avg Utilization</p></div>
                    </div>
                    <div><h4 className="font-medium mb-2">Time Off This Week</h4><div className="flex items-center gap-2">{mockTimeOff.filter(t => t.status === 'approved').length > 0 ? mockTimeOff.filter(t => t.status === 'approved').map(t => <Badge key={t.id} variant="outline">{t.userName.split(' ')[0]}: {t.type}</Badge>) : <span className="text-gray-500">No time off scheduled</span>}</div></div>
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
                    <p className="text-3xl font-bold">{mockInvoices.length}</p>
                    <p className="text-emerald-200 text-sm">Total Invoices</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${mockInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</p>
                    <p className="text-emerald-200 text-sm">Total Billed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockInvoices.filter(i => i.status === 'paid').length}</p>
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
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{mockInvoices.filter(i => i.status === 'draft').length}</p>
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
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{mockInvoices.filter(i => i.status === 'sent').length}</p>
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
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{mockInvoices.filter(i => i.status === 'pending').length}</p>
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
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{mockInvoices.filter(i => i.status === 'paid').length}</p>
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
                    {mockInvoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 font-mono">{invoice.number}</td>
                        <td className="px-4 py-4">{invoice.client}</td>
                        <td className="px-4 py-4 text-gray-500">{invoice.project}</td>
                        <td className="px-4 py-4"><div><span className="font-bold">${invoice.amount.toLocaleString()}</span><span className="text-xs text-gray-500 ml-1">({invoice.hours}h)</span></div></td>
                        <td className="px-4 py-4">{invoice.dueDate}</td>
                        <td className="px-4 py-4"><Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge></td>
                        <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Send className="h-4 w-4" /></Button></div></td>
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
                              <Button variant="ghost" size="sm"><RefreshCw className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500"><X className="h-4 w-4" /></Button>
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
                            <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Regenerate</Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" defaultValue="tt_api_xxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button size="sm" variant="ghost">Copy</Button>
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
                              <div className="flex items-center gap-4"><span className="font-medium">{inv.amt}</span><Badge className="bg-green-100 text-green-700">Paid</Badge><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></div>
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
                          <Button variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />Export All</Button>
                          <Button variant="outline" className="flex-1"><Archive className="h-4 w-4 mr-2" />Archive Projects</Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-red-200 dark:border-red-800">
                      <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertOctagon className="h-5 w-5" />Danger Zone</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Clear Time Entries</Label><p className="text-sm text-red-600/70">Delete all tracking data</p></div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700"><TrashIcon className="h-4 w-4 mr-2" />Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Delete Workspace</Label><p className="text-sm text-red-600/70">Permanently delete</p></div>
                          <Button variant="destructive"><AlertOctagon className="h-4 w-4 mr-2" />Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Entry Dialog */}
        <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add Time Entry</DialogTitle><DialogDescription>Manually log a time entry</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Description</Label><Input placeholder="What did you work on?" className="mt-1" /></div>
              <div><Label>Project</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{mockProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.client}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Date</Label><Input type="date" className="mt-1" defaultValue={new Date().toISOString().split('T')[0]} /></div><div><Label>Duration</Label><Input placeholder="1h 30m" className="mt-1" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Start Time</Label><Input type="time" className="mt-1" /></div><div><Label>End Time</Label><Input type="time" className="mt-1" /></div></div>
              <div className="flex items-center gap-2"><Switch id="billable" defaultChecked /><Label htmlFor="billable">Billable</Label></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowEntryDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Save Entry</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create Invoice</DialogTitle><DialogDescription>Generate invoice from tracked time</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Client</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{[...new Set(mockProjects.map(p => p.client))].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Project</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{mockProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>From Date</Label><Input type="date" className="mt-1" /></div><div><Label>To Date</Label><Input type="date" className="mt-1" /></div></div>
              <div><Label>Due Date</Label><Input type="date" className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Generate Invoice</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client Dialog */}
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add New Client</DialogTitle><DialogDescription>Create a new client for billing and project tracking</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4"><div><Label>Client Name</Label><Input placeholder="Company name" className="mt-1" /></div><div><Label>Email</Label><Input type="email" placeholder="billing@company.com" className="mt-1" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Phone</Label><Input placeholder="+1 555-0100" className="mt-1" /></div><div><Label>Currency</Label><Select defaultValue="USD"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="CAD">CAD</SelectItem></SelectContent></Select></div></div>
              <div><Label>Address</Label><Input placeholder="123 Business Ave, City, State ZIP" className="mt-1" /></div>
              <div><Label>Notes</Label><Input placeholder="Additional notes about this client" className="mt-1" /></div>
              <div><Label>Default Hourly Rate</Label><Input type="number" placeholder="150" className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowClientDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Create Client</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tag Dialog */}
        <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create New Tag</DialogTitle><DialogDescription>Add a tag to categorize time entries</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Tag Name</Label><Input placeholder="e.g., development, meeting, review" className="mt-1" /></div>
              <div><Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {['red', 'orange', 'amber', 'green', 'blue', 'indigo', 'purple', 'pink'].map(color => (
                    <button key={color} className={`w-8 h-8 rounded-full bg-${color}-500 hover:ring-2 hover:ring-${color}-300 transition-all`} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowTagDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600">Create Tag</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Builder Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Create New Report</DialogTitle><DialogDescription>Build a custom report with your preferred filters</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Report Name</Label><Input placeholder="My Custom Report" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Report Type</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="summary">Summary</SelectItem><SelectItem value="detailed">Detailed</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="project">By Project</SelectItem><SelectItem value="client">By Client</SelectItem><SelectItem value="team">Team</SelectItem></SelectContent></Select></div>
                <div><Label>Date Range</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger><SelectContent><SelectItem value="week">This Week</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="quarter">This Quarter</SelectItem><SelectItem value="year">This Year</SelectItem><SelectItem value="custom">Custom Range</SelectItem></SelectContent></Select></div>
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
                <Switch />
              </div>
              <div><Label>Group By</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select grouping" /></SelectTrigger><SelectContent><SelectItem value="day">Day</SelectItem><SelectItem value="week">Week</SelectItem><SelectItem value="project">Project</SelectItem><SelectItem value="client">Client</SelectItem><SelectItem value="member">Team Member</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button><Button variant="outline"><Eye className="h-4 w-4 mr-2" />Preview</Button><Button className="bg-amber-500 hover:bg-amber-600">Save Report</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
