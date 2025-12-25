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
  CheckCircle, XCircle, Eye, MoreHorizontal, Building2, Mail, Bell, Shield, Lock, Filter
} from 'lucide-react'

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
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)

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
          <TabsContent value="reports" className="mt-6">
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
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
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
          <TabsContent value="team" className="mt-6">
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
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{member.todayHours}h today</p>
                      <p className="text-sm text-gray-500">{member.weekHours}h this week</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-6">
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />General</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-medium">Default Billable</p><p className="text-sm text-gray-500">New entries are billable by default</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Round Time Entries</p><p className="text-sm text-gray-500">Round to nearest interval</p></div><Select defaultValue="none"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No rounding</SelectItem><SelectItem value="5">5 minutes</SelectItem><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem></SelectContent></Select></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Week Starts On</p><p className="text-sm text-gray-500">First day of the week</p></div><Select defaultValue="sunday"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sunday">Sunday</SelectItem><SelectItem value="monday">Monday</SelectItem></SelectContent></Select></div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Reminders</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-medium">Daily Reminder</p><p className="text-sm text-gray-500">Remind to log time at 5:00 PM</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Idle Detection</p><p className="text-sm text-gray-500">Detect when you're idle</p></div><Switch /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Summary</p><p className="text-sm text-gray-500">Email summary every Monday</p></div><Switch defaultChecked /></div>
                </CardContent>
              </Card>
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
      </div>
    </div>
  )
}
