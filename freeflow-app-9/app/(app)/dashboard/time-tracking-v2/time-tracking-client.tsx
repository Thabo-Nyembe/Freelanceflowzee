'use client'
import { useState, useMemo, useEffect } from 'react'
import { useTimeTracking, type TimeEntry, type TimeTrackingStatus } from '@/lib/hooks/use-time-tracking'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock, Play, Pause, Square, Plus, Calendar, BarChart3, Settings,
  Download, ChevronLeft, ChevronRight, DollarSign, Target, TrendingUp,
  Users, Briefcase, Tag, Timer, Zap, Edit2, Trash2, MoreVertical,
  FileText, Check, X, RefreshCw, Coffee, AlertCircle, ArrowUp
} from 'lucide-react'

// View types
type ViewType = 'timer' | 'timesheet' | 'calendar' | 'reports'
type TimesheetView = 'day' | 'week' | 'month'

// Project type
interface Project {
  id: string
  name: string
  color: string
  client: string
  billable: boolean
  hourlyRate: number
}

// Goal tracking
interface Goal {
  id: string
  label: string
  target: number
  current: number
  unit: string
}

export default function TimeTrackingClient({ initialTimeEntries }: { initialTimeEntries: TimeEntry[] }) {
  const [statusFilter, setStatusFilter] = useState<TimeTrackingStatus | 'all'>('all')
  const [isBillableFilter, setIsBillableFilter] = useState<boolean | undefined>(undefined)
  const [view, setView] = useState<ViewType>('timer')
  const [timesheetView, setTimesheetView] = useState<TimesheetView>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerDescription, setTimerDescription] = useState('')
  const [timerProject, setTimerProject] = useState('')
  const [timerBillable, setTimerBillable] = useState(true)

  const { timeEntries, loading, error } = useTimeTracking({ status: statusFilter, isBillable: isBillableFilter })
  const displayEntries = timeEntries.length > 0 ? timeEntries : initialTimeEntries

  // Projects
  const projects: Project[] = [
    { id: '1', name: 'Website Redesign', color: 'indigo', client: 'Acme Corp', billable: true, hourlyRate: 150 },
    { id: '2', name: 'Mobile App Dev', color: 'purple', client: 'TechStart', billable: true, hourlyRate: 175 },
    { id: '3', name: 'Brand Strategy', color: 'pink', client: 'Global Inc', billable: true, hourlyRate: 200 },
    { id: '4', name: 'Internal Training', color: 'gray', client: 'Internal', billable: false, hourlyRate: 0 },
    { id: '5', name: 'Marketing Campaign', color: 'emerald', client: 'Acme Corp', billable: true, hourlyRate: 125 }
  ]

  // Goals
  const goals: Goal[] = [
    { id: '1', label: 'Daily Hours', target: 8, current: 6.5, unit: 'h' },
    { id: '2', label: 'Weekly Hours', target: 40, current: 32, unit: 'h' },
    { id: '3', label: 'Billable %', target: 80, current: 75, unit: '%' },
    { id: '4', label: 'Monthly Revenue', target: 15000, current: 12500, unit: '$' }
  ]

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Comprehensive stats
  const stats = useMemo(() => {
    const total = displayEntries.length
    const running = displayEntries.filter(e => e.status === 'running').length
    const billable = displayEntries.filter(e => e.is_billable).length
    const totalHours = displayEntries.reduce((sum, e) => sum + (e.duration_hours || 0), 0)
    const billableHours = displayEntries.filter(e => e.is_billable).reduce((sum, e) => sum + (e.duration_hours || 0), 0)
    const totalRevenue = displayEntries.reduce((sum, e) => sum + (e.billable_amount || 0), 0)
    const avgProductivity = displayEntries.length > 0
      ? displayEntries.reduce((sum, e) => sum + (e.productivity_score || 0), 0) / displayEntries.length
      : 0

    return {
      total,
      running,
      billable,
      totalHours: totalHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      billablePercentage: totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(1) : '0',
      totalRevenue,
      avgProductivity: avgProductivity.toFixed(0)
    }
  }, [displayEntries])

  // Get week days
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

  // Format timer display
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0h 0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (timesheetView === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (timesheetView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    // Here you would save the time entry
    setTimerSeconds(0)
    setTimerDescription('')
    setTimerProject('')
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Timer className="h-8 w-8" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Time Pro
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                    Toggl-Level
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Time Tracking</h1>
                <p className="text-white/80">
                  One-click timer • Detailed reports • Goal tracking • Invoicing ready
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Manual Entry
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Time Entry</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="What did you work on?" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Project</label>
                        <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                          <option value="">Select project...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - {p.client}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Date</label>
                          <input type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration</label>
                          <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="1h 30m" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Start Time</label>
                          <input type="time" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Time</label>
                          <input type="time" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Billable</span>
                      </label>
                      <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setShowNewEntry(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Save Entry</button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Download className="h-5 w-5" />
                </button>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                      <Settings className="h-5 w-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Time Tracking Settings</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="general" className="mt-4">
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="goals">Goals</TabsTrigger>
                        <TabsTrigger value="reminders">Reminders</TabsTrigger>
                      </TabsList>
                      <TabsContent value="general" className="mt-4 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-3">Default Settings</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Default billable status</span>
                              <select className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                <option>Billable</option>
                                <option>Non-billable</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Round time entries</span>
                              <select className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                <option>No rounding</option>
                                <option>5 minutes</option>
                                <option>15 minutes</option>
                                <option>30 minutes</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Week starts on</span>
                              <select className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                <option>Sunday</option>
                                <option>Monday</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="projects" className="mt-4 space-y-4">
                        {projects.map(project => (
                          <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div>
                              <div>
                                <p className="font-medium">{project.name}</p>
                                <p className="text-sm text-gray-500">{project.client}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded text-xs ${project.billable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {project.billable ? `$${project.hourlyRate}/hr` : 'Non-billable'}
                              </span>
                              <button className="text-sm text-amber-600 hover:underline">Edit</button>
                            </div>
                          </div>
                        ))}
                        <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-500">
                          + Add Project
                        </button>
                      </TabsContent>
                      <TabsContent value="goals" className="mt-4 space-y-4">
                        {goals.map(goal => (
                          <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{goal.label}</span>
                              <span className="text-sm text-gray-500">Target: {goal.target}{goal.unit}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${goal.current >= goal.target ? 'bg-green-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {goal.current}{goal.unit} of {goal.target}{goal.unit}
                            </p>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="reminders" className="mt-4 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Daily reminder to track time</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                          </div>
                          <p className="text-sm text-gray-500">Get reminded at 5:00 PM to log your hours</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Idle detection</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                          </div>
                          <p className="text-sm text-gray-500">Detect when you're idle and adjust time automatically</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Live Timer Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              placeholder="What are you working on?"
              className="flex-1 text-lg px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <select
              value={timerProject}
              onChange={(e) => setTimerProject(e.target.value)}
              className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => setTimerBillable(!timerBillable)}
              className={`p-3 rounded-lg transition-all ${
                timerBillable ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <DollarSign className="h-5 w-5" />
            </button>
            <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white min-w-[160px] text-center">
              {formatTimer(timerSeconds)}
            </div>
            {isTimerRunning ? (
              <>
                <button
                  onClick={toggleTimer}
                  className="p-4 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-all"
                >
                  <Pause className="h-6 w-6" />
                </button>
                <button
                  onClick={stopTimer}
                  className="p-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                >
                  <Square className="h-6 w-6" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleTimer}
                className="p-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
              >
                <Play className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-gray-500">Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHours}h</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-500">Billable</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.billableHours}h</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-500">Billable %</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.billablePercentage}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-sky-600" />
              <span className="text-sm text-gray-500">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-sky-600">${stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-gray-500">Entries</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-pink-600" />
              <span className="text-sm text-gray-500">Productivity</span>
            </div>
            <div className="text-2xl font-bold text-pink-600">{stats.avgProductivity}%</div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
            {(['timer', 'timesheet', 'calendar', 'reports'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  view === v
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="approved">Approved</option>
            </select>
            <select
              value={isBillableFilter === undefined ? 'all' : isBillableFilter ? 'true' : 'false'}
              onChange={(e) => setIsBillableFilter(e.target.value === 'all' ? undefined : e.target.value === 'true')}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Types</option>
              <option value="true">Billable</option>
              <option value="false">Non-Billable</option>
            </select>
          </div>
        </div>

        {/* Timer/List View */}
        {view === 'timer' && (
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div>
              </div>
            )}

            {/* Today's Entries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold">Today</h3>
                <span className="text-sm text-gray-500">
                  Total: {displayEntries.filter(e => new Date(e.start_time).toDateString() === new Date().toDateString()).reduce((sum, e) => sum + (e.duration_hours || 0), 0).toFixed(1)}h
                </span>
              </div>
              <div className="divide-y dark:divide-gray-700">
                {displayEntries
                  .filter(e => (statusFilter === 'all' || e.status === statusFilter) && (isBillableFilter === undefined || e.is_billable === isBillableFilter))
                  .map(entry => (
                    <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {entry.status === 'running' && (
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                            )}
                            <h4 className="font-medium">{entry.title}</h4>
                          </div>
                          {entry.description && (
                            <p className="text-sm text-gray-500 mb-2">{entry.description}</p>
                          )}
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              entry.is_billable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {entry.is_billable ? 'Billable' : 'Non-Billable'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                              {entry.entry_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {entry.end_time && ` - ${new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {entry.billable_amount > 0 && (
                            <span className="text-sm font-medium text-emerald-600">${entry.billable_amount.toFixed(2)}</span>
                          )}
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {entry.duration_hours ? `${entry.duration_hours.toFixed(1)}h` : formatDuration(entry.duration_seconds)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {entry.status === 'running' ? (
                              <button className="p-1.5 hover:bg-red-100 text-red-600 rounded">
                                <Square className="h-4 w-4" />
                              </button>
                            ) : (
                              <button className="p-1.5 hover:bg-green-100 text-green-600 rounded">
                                <Play className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                              <Edit2 className="h-4 w-4 text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-red-100 rounded">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Timesheet View */}
        {view === 'timesheet' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
            {/* Timesheet Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {timesheetView === 'week'
                    ? `Week of ${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => navigateDate('next')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200">
                  Today
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['day', 'week', 'month'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setTimesheetView(v)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all capitalize ${
                      timesheetView === v ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Week View */}
            {timesheetView === 'week' && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-48">Project</th>
                      {weekDays.map((day, idx) => (
                        <th key={idx} className={`py-3 px-4 text-center ${
                          day.toDateString() === new Date().toDateString() ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                        }`}>
                          <div className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className={`text-lg font-bold ${
                            day.toDateString() === new Date().toDateString() ? 'text-amber-600' : ''
                          }`}>{day.getDate()}</div>
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 4).map((project, idx) => (
                      <tr key={project.id} className="border-t dark:border-gray-700">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${project.color}-500`}></div>
                            <span className="font-medium text-sm">{project.name}</span>
                          </div>
                          <p className="text-xs text-gray-500">{project.client}</p>
                        </td>
                        {weekDays.map((day, dayIdx) => (
                          <td key={dayIdx} className={`py-3 px-4 text-center ${
                            day.toDateString() === new Date().toDateString() ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                          }`}>
                            <input
                              type="text"
                              className="w-16 text-center py-1 border rounded hover:border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
                              placeholder="-"
                              defaultValue={Math.random() > 0.6 ? (Math.random() * 4 + 1).toFixed(1) : ''}
                            />
                          </td>
                        ))}
                        <td className="py-3 px-4 text-center font-bold">{(Math.random() * 20 + 5).toFixed(1)}h</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold">
                      <td className="py-3 px-4">Daily Total</td>
                      {weekDays.map((day, dayIdx) => (
                        <td key={dayIdx} className={`py-3 px-4 text-center ${
                          day.toDateString() === new Date().toDateString() ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                        }`}>
                          {(Math.random() * 6 + 2).toFixed(1)}h
                        </td>
                      ))}
                      <td className="py-3 px-4 text-center text-amber-600">42.5h</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Day View */}
            {timesheetView === 'day' && (
              <div className="p-4">
                <h4 className="font-medium mb-4">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                <div className="space-y-4">
                  {displayEntries.slice(0, 5).map(entry => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{entry.title}</p>
                        <p className="text-sm text-gray-500">{entry.entry_type}</p>
                      </div>
                      <div className="text-lg font-bold">{entry.duration_hours?.toFixed(1) || '0'}h</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => navigateDate('next')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">{day}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - currentDate.getDay() + 1)
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isToday = day.toDateString() === new Date().toDateString()
                  const hoursWorked = Math.random() > 0.3 ? (Math.random() * 8 + 2).toFixed(1) : null

                  return (
                    <div
                      key={i}
                      className={`p-2 min-h-[100px] rounded-lg border ${
                        isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      } ${isToday ? 'border-amber-500 ring-1 ring-amber-500' : 'border-transparent'} hover:border-amber-300 cursor-pointer`}
                    >
                      <div className={`text-sm ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'} ${isToday ? 'font-bold text-amber-600' : ''}`}>
                        {day.getDate()}
                      </div>
                      {hoursWorked && isCurrentMonth && (
                        <div className="mt-2">
                          <div className="text-xs font-bold text-amber-600">{hoursWorked}h</div>
                          <div className="h-1 bg-amber-200 rounded-full mt-1">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${Math.min((parseFloat(hoursWorked) / 8) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reports View */}
        {view === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hours by Project */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Hours by Project</h3>
              <div className="space-y-4">
                {projects.map(project => {
                  const hours = Math.random() * 30 + 5
                  const percentage = (hours / 40) * 100
                  return (
                    <div key={project.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div>
                          <span className="text-sm font-medium">{project.name}</span>
                        </div>
                        <span className="text-sm font-bold">{hours.toFixed(1)}h</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${project.color}-500 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Billable vs Non-Billable */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Billable Breakdown</h3>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">{stats.billableHours}h</div>
                  <p className="text-sm text-gray-500">Billable</p>
                </div>
                <div className="h-32 w-32 rounded-full border-8 border-emerald-500 relative">
                  <div
                    className="absolute inset-0 rounded-full border-8 border-gray-200"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats.billablePercentage}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-400">{(parseFloat(stats.totalHours) - parseFloat(stats.billableHours)).toFixed(1)}h</div>
                  <p className="text-sm text-gray-500">Non-Billable</p>
                </div>
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Weekly Trend</h3>
              <div className="flex items-end justify-between h-40 gap-2">
                {weekDays.map((day, idx) => {
                  const hours = Math.random() * 8 + 2
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full rounded-t-lg ${
                          day.toDateString() === new Date().toDateString() ? 'bg-amber-500' : 'bg-amber-200'
                        }`}
                        style={{ height: `${(hours / 10) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Goals Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Goals Progress</h3>
              <div className="space-y-4">
                {goals.map(goal => {
                  const percentage = (goal.current / goal.target) * 100
                  const isComplete = percentage >= 100
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{goal.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
                          {isComplete && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isComplete ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick Entry Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Coffee className="h-6 w-6 text-amber-600" />
              <div>
                <h4 className="font-semibold">Need a break?</h4>
                <p className="text-sm text-gray-500">Taking regular breaks improves productivity</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Take a Break
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
