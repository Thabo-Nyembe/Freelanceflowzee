'use client'

import { useState, useEffect } from 'react'
import { 
  Play, Pause, Square, Clock, Calendar, Filter, Download, 
  BarChart3, TrendingUp, DollarSign, Target, ChevronDown,
  Plus, Edit3, Trash2, Search, Timer, Briefcase, User,
  FileText, Settings, MoreHorizontal, Save, X, CheckCircle,
  AlertCircle, Activity, PieChart, ArrowUp, ArrowDown, Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface TimeEntry {
  id: string
  projectId: string
  projectName: string
  client: string
  task: string
  description: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  hourlyRate: number
  earnings: number
  billable: boolean
  status: 'running' | 'completed' | 'paused'
  tags: string[]
  date: string
}

interface Project {
  id: string
  name: string
  client: string
  hourlyRate: number
  totalHours: number
  totalEarnings: number
  color: string
  isActive: boolean
}

interface TimeStats {
  todayHours: number
  weekHours: number
  monthHours: number
  todayEarnings: number
  weekEarnings: number
  monthEarnings: number
  billableRatio: number
  activeProjects: number
}

export default function TimeTrackingPage() {
  const [currentTimer, setCurrentTimer] = useState<TimeEntry | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [projectFilter, setProjectFilter] = useState('all')
  const [showNewEntryModal, setShowNewEntryModal] = useState(false)

  // Sample data
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Website',
      client: 'TechCorp Solutions',
      hourlyRate: 125,
      totalHours: 45.5,
      totalEarnings: 5687.50,
      color: 'bg-blue-500',
      isActive: true
    },
    {
      id: '2',
      name: 'Mobile App Design',
      client: 'Fashion Forward Inc.',
      hourlyRate: 100,
      totalHours: 32.0,
      totalEarnings: 3200.00,
      color: 'bg-purple-500',
      isActive: true
    },
    {
      id: '3',
      name: 'Brand Identity',
      client: 'Startup Ventures',
      hourlyRate: 150,
      totalHours: 28.5,
      totalEarnings: 4275.00,
      color: 'bg-green-500',
      isActive: false
    },
    {
      id: '4',
      name: 'Marketing Website',
      client: 'Local Business',
      hourlyRate: 85,
      totalHours: 15.0,
      totalEarnings: 1275.00,
      color: 'bg-orange-500',
      isActive: true
    }
  ])

  const [timeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      projectId: '1',
      projectName: 'E-commerce Website',
      client: 'TechCorp Solutions',
      task: 'Homepage Development',
      description: 'Implementing responsive homepage layout with React components',
      startTime: new Date('2024-12-10T09:00:00'),
      endTime: new Date('2024-12-10T12:30:00'),
      duration: 210,
      hourlyRate: 125,
      earnings: 437.50,
      billable: true,
      status: 'completed',
      tags: ['frontend', 'react', 'responsive'],
      date: '2024-12-10'
    },
    {
      id: '2',
      projectId: '1',
      projectName: 'E-commerce Website',
      client: 'TechCorp Solutions',
      task: 'Product Page Integration',
      description: 'Connecting product pages to backend API and implementing search',
      startTime: new Date('2024-12-10T14:00:00'),
      endTime: new Date('2024-12-10T17:15:00'),
      duration: 195,
      hourlyRate: 125,
      earnings: 406.25,
      billable: true,
      status: 'completed',
      tags: ['backend', 'api', 'search'],
      date: '2024-12-10'
    },
    {
      id: '3',
      projectId: '2',
      projectName: 'Mobile App Design',
      client: 'Fashion Forward Inc.',
      task: 'UI Design Review',
      description: 'Client feedback review and design iterations',
      startTime: new Date('2024-12-10T10:30:00'),
      endTime: new Date('2024-12-10T11:45:00'),
      duration: 75,
      hourlyRate: 100,
      earnings: 125.00,
      billable: true,
      status: 'completed',
      tags: ['design', 'review', 'client'],
      date: '2024-12-10'
    },
    {
      id: '4',
      projectId: '3',
      projectName: 'Brand Identity',
      client: 'Startup Ventures',
      task: 'Logo Refinements',
      description: 'Final logo adjustments and color variations',
      startTime: new Date('2024-12-09T15:00:00'),
      endTime: new Date('2024-12-09T16:30:00'),
      duration: 90,
      hourlyRate: 150,
      earnings: 225.00,
      billable: true,
      status: 'completed',
      tags: ['logo', 'branding', 'design'],
      date: '2024-12-09'
    },
    {
      id: '5',
      projectId: '4',
      projectName: 'Marketing Website',
      client: 'Local Business',
      task: 'Content Management',
      description: 'Setting up CMS and training client on content updates',
      startTime: new Date('2024-12-09T09:00:00'),
      endTime: new Date('2024-12-09T11:00:00'),
      duration: 120,
      hourlyRate: 85,
      earnings: 170.00,
      billable: true,
      status: 'completed',
      tags: ['cms', 'training', 'content'],
      date: '2024-12-09'
    }
  ])

  // Calculate stats
  const stats: TimeStats = {
    todayHours: timeEntries
      .filter(entry => entry.date === '2024-12-10')
      .reduce((sum, entry) => sum + entry.duration, 0) / 60,
    weekHours: timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60,
    monthHours: timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60,
    todayEarnings: timeEntries
      .filter(entry => entry.date === '2024-12-10')
      .reduce((sum, entry) => sum + entry.earnings, 0),
    weekEarnings: timeEntries.reduce((sum, entry) => sum + entry.earnings, 0),
    monthEarnings: timeEntries.reduce((sum, entry) => sum + entry.earnings, 0),
    billableRatio: (timeEntries.filter(entry => entry.billable).length / timeEntries.length) * 100,
    activeProjects: projects.filter(project => project.isActive).length
  }

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentTimer && currentTimer.status === 'running') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentTimer])

  const startTimer = () => {
    if (selectedProject && taskDescription) {
      const project = projects.find(p => p.id === selectedProject)
      if (project) {
        const newTimer: TimeEntry = {
          id: Date.now().toString(),
          projectId: project.id,
          projectName: project.name,
          client: project.client,
          task: taskDescription,
          description: '',
          startTime: new Date(),
          duration: 0,
          hourlyRate: project.hourlyRate,
          earnings: 0,
          billable: true,
          status: 'running',
          tags: [],
          date: new Date().toISOString().split('T')[0]
        }
        setCurrentTimer(newTimer)
        setTimerSeconds(0)
      }
    }
  }

  const pauseTimer = () => {
    if (currentTimer) {
      setCurrentTimer({
        ...currentTimer,
        status: 'paused',
        duration: Math.floor(timerSeconds / 60)
      })
    }
  }

  const resumeTimer = () => {
    if (currentTimer) {
      setCurrentTimer({
        ...currentTimer,
        status: 'running'
      })
    }
  }

  const stopTimer = () => {
    if (currentTimer) {
      const finalDuration = Math.floor(timerSeconds / 60)
      const finalEarnings = (finalDuration / 60) * currentTimer.hourlyRate
      
      setCurrentTimer({
        ...currentTimer,
        endTime: new Date(),
        duration: finalDuration,
        earnings: finalEarnings,
        status: 'completed'
      })
      
      // Here you would save to database
      setTimerSeconds(0)
      setTaskDescription('')
      setSelectedProject('')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProject = projectFilter === 'all' || entry.projectId === projectFilter
    const matchesDate = dateFilter === 'all' || entry.date === '2024-12-10' // Simplified for demo
    return matchesSearch && matchesProject && matchesDate
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Track your time, monitor productivity, and maximize earnings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </Button>
          <Button className="gap-2" onClick={() => setShowNewEntryModal(true)}>
            <Plus className="h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.todayHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.todayEarnings.toFixed(0)}</p>
                <p className="text-sm text-gray-500">Earned Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.weekHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-500">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.billableRatio.toFixed(0)}%</p>
                <p className="text-sm text-gray-500">Billable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                  {formatTime(timerSeconds)}
                </div>
                {currentTimer && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{currentTimer.task}</p>
                    <p className="text-xs">{currentTimer.projectName}</p>
                  </div>
                )}
              </div>

              {/* Project Selection */}
              {!currentTimer && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="project-select">Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.filter(p => p.isActive).map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-input">Task</Label>
                    <Input
                      id="task-input"
                      placeholder="What are you working on?"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Timer Controls */}
              <div className="flex gap-2">
                {!currentTimer ? (
                  <Button 
                    onClick={startTimer}
                    disabled={!selectedProject || !taskDescription}
                    className="flex-1 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                ) : currentTimer.status === 'running' ? (
                  <>
                    <Button onClick={pauseTimer} variant="outline" className="flex-1 gap-2">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                    <Button onClick={stopTimer} variant="destructive" className="flex-1 gap-2">
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={resumeTimer} className="flex-1 gap-2">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                    <Button onClick={stopTimer} variant="outline" className="flex-1 gap-2">
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  </>
                )}
              </div>

              {/* Current Session Info */}
              {currentTimer && (
                <div className="pt-4 border-t">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span>{currentTimer.startTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span>${currentTimer.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earnings:</span>
                      <span className="font-semibold">
                        ${((timerSeconds / 3600) * currentTimer.hourlyRate).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.filter(p => p.isActive).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{project.totalHours}h</p>
                      <p className="text-xs text-gray-500">${project.hourlyRate}/hr</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Entries */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Time Entries</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search entries..." 
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{entry.task}</h3>
                          <Badge 
                            variant={entry.billable ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {entry.billable ? 'Billable' : 'Non-billable'}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              entry.status === 'completed' ? 'text-green-600' : 
                              entry.status === 'running' ? 'text-blue-600' : 'text-yellow-600'
                            }`}
                          >
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entry.projectName} • {entry.client}</p>
                        {entry.description && (
                          <p className="text-sm text-gray-500 mb-2">{entry.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-lg">{formatDuration(entry.duration)}</p>
                        <p className="text-sm text-gray-500">
                          {entry.startTime.toLocaleTimeString()} - {entry.endTime?.toLocaleTimeString()}
                        </p>
                        <p className="text-sm font-semibold text-green-600">${entry.earnings.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">${entry.hourlyRate}/hr</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const hours = Math.random() * 8 + 2 // Mock data
              const earnings = hours * 110 // Mock calculation
              
              return (
                <div key={day} className="text-center">
                  <div className="mb-2">
                    <div className="text-sm font-medium text-gray-900">{day}</div>
                    <div className="text-xs text-gray-500">Dec {11 + index}</div>
                  </div>
                  <div className="h-20 bg-gray-100 rounded relative overflow-hidden mb-2">
                    <div 
                      className="absolute bottom-0 w-full bg-blue-500 transition-all"
                      style={{ height: `${(hours / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">{hours.toFixed(1)}h</div>
                    <div className="text-gray-500">${earnings.toFixed(0)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Manual Entry</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewEntryModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="modal-project">Project</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modal-task">Task</Label>
                <Input id="modal-task" placeholder="Task description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modal-start">Start Time</Label>
                  <Input id="modal-start" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="modal-end">End Time</Label>
                  <Input id="modal-end" type="datetime-local" />
                </div>
              </div>
              <div>
                <Label htmlFor="modal-description">Description</Label>
                <Textarea id="modal-description" placeholder="Optional description" rows={3} />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowNewEntryModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowNewEntryModal(false)}>
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 