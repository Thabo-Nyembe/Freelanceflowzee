'use client'

import { useState, useReducer, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, PlayCircle, PauseCircle, Plus, Target, Brain, Calendar, Timer, Zap, TrendingUp, AlertCircle, ArrowRight, Play, Pause, BarChart3, Trash2, MessageSquare, Briefcase, Lightbulb, Activity } from 'lucide-react'

// Type definitions
interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'work' | 'personal' | 'meeting' | 'break'
  estimatedTime: number
  completed: boolean
  startTime?: string
  endTime?: string
  projectId?: string
  tags: string[]
}

interface AIInsight {
  id: string
  type: 'productivity' | 'schedule' | 'health' | 'optimization'
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

interface TimeBlock {
  id: string
  title: string
  start: string
  end: string
  type: 'focus' | 'meeting' | 'break' | 'admin'
  tasks: string[]
  color: string
}

interface TaskState {
  tasks: Task[]
  completedTasks: number
  totalFocusTime: number
  currentTimer: string | null
  timerStartTime: number | null
  elapsedTime: number
  insights: AIInsight[]
}

type TaskAction = 
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'START_TIMER'; taskId: string }
  | { type: 'STOP_TIMER' }
  | { type: 'UPDATE_ELAPSED_TIME'; time: number }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'UPDATE_TASK'; id: string; updates: Partial<Task> }

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.task]
      }
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.id 
            ? { ...task, completed: !task.completed, endTime: !task.completed ? new Date().toISOString() : undefined }
            : task
        ),
        completedTasks: state.tasks.filter(t => t.id === action.id)[0]?.completed 
          ? state.completedTasks - 1 
          : state.completedTasks + 1
      }
    case 'START_TIMER':
      return {
        ...state,
        currentTimer: action.taskId,
        timerStartTime: Date.now(),
        elapsedTime: 0
      }
    case 'STOP_TIMER':
      return {
        ...state,
        currentTimer: null,
        timerStartTime: null,
        totalFocusTime: state.totalFocusTime + state.elapsedTime,
        elapsedTime: 0
      }
    case 'UPDATE_ELAPSED_TIME':
      return {
        ...state,
        elapsedTime: action.time
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.id)
      }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.id ? { ...task, ...action.updates } : task
        )
      }
    default:
      return state
  }
}

// Mock data
const mockAIInsights: AIInsight[] = [
  {
    id: 'insight_1',
    type: 'productivity',
    title: 'Peak Performance Window',
    description: 'Your most productive hours are between 9-11 AM. Schedule your most challenging tasks during this time.',
    actionable: true,
    priority: 'high'
  },
  {
    id: 'insight_2',
    type: 'schedule',
    title: 'Meeting Optimization',
    description: 'Consider batching your client calls in the afternoon to maintain focus during morning hours.',
    actionable: true,
    priority: 'medium'
  },
  {
    id: 'insight_3',
    type: 'health',
    title: 'Break Reminder',
    description: "You&apos;ve been working for 2.5 hours. Take a 15-minute break to maintain productivity.",
    actionable: true,
    priority: 'high'
  }
]

const mockTimeBlocks: TimeBlock[] = [
  {
    id: 'block_1',
    title: 'Deep Focus: Design Work',
    start: '09:00',
    end: '11:00',
    type: 'focus',
    tasks: ['task_1', 'task_2'],
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  {
    id: 'block_2',
    title: 'Client Communication',
    start: '11:00',
    end: '12:00',
    type: 'meeting',
    tasks: ['task_3'],
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 'block_3',
    title: 'Lunch & Recharge',
    start: '12:00',
    end: '13:00',
    type: 'break',
    tasks: [],
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: 'block_4',
    title: 'Project Development',
    start: '14:00',
    end: '16:30',
    type: 'focus',
    tasks: ['task_4', 'task_5'],
    color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
  }
]

export default function MyDayPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('today')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [isAddingTask, setIsAddingTask] = useState(false)

  // Initialize state with mock data
  const initialState: TaskState = {
    tasks: [
      {
        id: 'task_1',
        title: 'Complete logo design mockups',
        description: 'Create 3 logo variations for TechCorp client',
        priority: 'high',
        category: 'work',
        estimatedTime: 120,
        completed: false,
        projectId: 'proj_001',
        tags: ['design', 'branding', 'urgent']
      },
      {
        id: 'task_2',
        title: 'Review brand guidelines document',
        description: 'Final review before client presentation',
        priority: 'medium',
        category: 'work',
        estimatedTime: 45,
        completed: true,
        projectId: 'proj_001',
        tags: ['review', 'documentation']
      },
      {
        id: 'task_3',
        title: 'Client call with Sarah Johnson',
        description: 'Project status update and feedback session',
        priority: 'high',
        category: 'meeting',
        estimatedTime: 60,
        completed: false,
        startTime: '14:00',
        tags: ['meeting', 'client']
      },
      {
        id: 'task_4',
        title: 'Team standup meeting',
        description: 'Weekly sync with development team',
        priority: 'medium',
        category: 'meeting',
        estimatedTime: 30,
        completed: false,
        startTime: '10:00',
        tags: ['meeting', 'team']
      },
      {
        id: 'task_5',
        title: 'Update portfolio website',
        description: 'Add recent project showcase',
        priority: 'low',
        category: 'personal',
        estimatedTime: 90,
        completed: false,
        tags: ['portfolio', 'personal']
      },
      {
        id: 'task_6',
        title: 'Review project proposals',
        description: 'Evaluate 3 new project opportunities',
        priority: 'medium',
        category: 'work',
        estimatedTime: 75,
        completed: false,
        tags: ['business', 'proposals']
      }
    ],
    currentTimer: null,
    timerStartTime: null,
    elapsedTime: 0,
    totalFocusTime: 210, // 3.5 hours in minutes
    completedTasks: 2,
    insights: mockAIInsights
  }

  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.currentTimer && state.timerStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.timerStartTime!) / 1000)
        dispatch({ type: 'UPDATE_ELAPSED_TIME', time: elapsed })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state.currentTimer, state.timerStartTime])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      category: 'work',
      estimatedTime: 60,
      completed: false,
      tags: []
    }

    dispatch({ type: 'ADD_TASK', task: newTask })
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
    setIsAddingTask(false)
  }

  const startTimer = (taskId: string) => {
    if (state.currentTimer) {
      dispatch({ type: 'STOP_TIMER' })
    }
    dispatch({ type: 'START_TIMER', taskId })
  }

  const stopTimer = () => {
    dispatch({ type: 'STOP_TIMER' })
  }

  // Calculate progress metrics
  const totalTasks = state.tasks.length
  const completionRate = totalTasks > 0 ? Math.round((state.completedTasks / totalTasks) * 100) : 0
  const totalEstimatedTime = state.tasks.reduce((acc, task) => acc + task.estimatedTime, 0)
  const focusHours = Math.floor(state.totalFocusTime / 60)
  const focusMinutes = state.totalFocusTime % 60
  const targetHours = 8 * 60 // 8 hours in minutes
  const productivityScore = Math.min(Math.round((state.totalFocusTime / targetHours) * 100), 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 p-6">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent mb-2">
                My Day Today
              </h1>
              <p className="text-lg text-gray-600 font-light">
                AI-powered daily planning and productivity optimization ✨
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Button>
              
              <Button 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasks Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{state.completedTasks}/{totalTasks}</p>
                    <p className="text-sm text-gray-500">{completionRate}% complete</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Focus Time</p>
                    <p className="text-3xl font-bold text-gray-900">{focusHours}h {focusMinutes}m</p>
                    <p className="text-sm text-gray-500">Today&apos;s work</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Timer className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Productivity</p>
                    <p className="text-3xl font-bold text-gray-900">{productivityScore}%</p>
                    <p className="text-sm text-gray-500">Efficiency score</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Insights</p>
                    <p className="text-3xl font-bold text-gray-900">{mockAIInsights.length}</p>
                    <p className="text-sm text-gray-500">Recommendations</p>
                  </div>
                  <div className="p-3 bg-rose-100 rounded-xl">
                    <Brain className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Timer Display */}
        {state.currentTimer && (
          <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Play className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Timer Active</h3>
                    <p className="text-purple-100">
                      Working on: {state.tasks.find(t => t.id === state.currentTimer)?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold">{formatTime(state.elapsedTime)}</div>
                    <div className="text-purple-100 text-sm">Elapsed time</div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={stopTimer}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="today" className="flex items-center gap-2 rounded-2xl">
              <Calendar className="h-4 w-4" />
              Today&apos;s Tasks
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2 rounded-2xl">
              <Clock className="h-4 w-4" />
              Time Blocks
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 rounded-2xl">
              <Brain className="h-4 w-4" />
              AI Insights
              <Badge variant="secondary" className="text-xs">
                {mockAIInsights.filter(i => i.priority === 'high').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-2xl">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Today&apos;s Tasks Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tasks List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Today&apos;s Tasks
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {state.tasks.filter(t => !t.completed).length} remaining
                        </Badge>
                        <Button 
                          data-testid="add-task-btn"
                          size="sm" 
                          onClick={addTask}
                          className="gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          Add Task
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {state.tasks.map(task => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
                          task.completed 
                            ? "bg-gray-50 border-gray-200 opacity-75" 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => dispatch({ type: 'TOGGLE_TASK', id: task.id })}
                          >
                            <CheckCircle 
                              className={cn("h-5 w-5", task.completed ? "text-green-600 fill-green-100" : "text-gray-400")} 
                            />
                          </Button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className={cn(
                                  "font-medium",
                                  task.completed ? "line-through text-gray-500" : "text-gray-900")}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                )}
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs", getPriorityColor(task.priority))}
                                  >
                                    {task.priority}
                                  </Badge>
                                  
                                  <Badge variant="outline" className="text-xs">
                                    <Timer className="h-3 w-3 mr-1" />
                                    {formatDuration(task.estimatedTime)}
                                  </Badge>
                                  
                                  {task.category === 'meeting' && task.startTime && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {task.startTime}
                                    </Badge>
                                  )}
                                </div>
                                
                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.map(tag => (
                                      <span 
                                        key={tag}
                                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {!task.completed && (
                                  <Button
                                    data-testid="start-timer-btn"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => startTimer(task.id)}
                                    disabled={state.currentTimer === task.id}
                                  >
                                    {state.currentTimer === task.id ? (
                                      <>
                                        <Pause className="h-3 w-3" />
                                        Active
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-3 w-3" />
                                        Start
                                      </>
                                    )}
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => dispatch({ type: 'DELETE_TASK', id: task.id })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      data-testid="view-calendar-btn"
                      className="w-full justify-start gap-2"
                      variant="outline"
                      onClick={() => {
                        console.log('View calendar clicked');
                        router.push('/dashboard/calendar');
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                      View Calendar
                    </Button>
                    
                    <Button 
                      data-testid="generate-schedule-btn"
                      className="w-full justify-start gap-2"
                      variant="outline"
                      onClick={() => {
                        console.log('Generate schedule clicked');
                        alert('AI-powered schedule generation started!');
                      }}
                    >
                      <Brain className="h-4 w-4" />
                      Generate Schedule
                    </Button>
                    
                    <Button 
                      className="w-full justify-start gap-2"
                      variant="outline"
                      onClick={() => router.push('/dashboard/collaboration')}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Check Client Messages
                    </Button>
                    
                    <Button 
                      className="w-full justify-start gap-2"
                      variant="outline"
                      onClick={() => router.push('/dashboard/projects-hub')}
                    >
                      <Briefcase className="h-4 w-4" />
                      View Projects
                    </Button>
                    
                    <Button 
                      className="w-full justify-start gap-2"
                      variant="outline"
                      onClick={() => router.push('/dashboard/time-tracking')}
                    >
                      <Clock className="h-4 w-4" />
                      Time Tracking
                    </Button>
                    
                    <Button 
                      className="w-full justify-start gap-2"
                      variant="outline"
                      onClick={() => router.push('/dashboard/escrow')}
                    >
                      <Target className="h-4 w-4" />
                      Check Escrow
                    </Button>
                  </CardContent>
                </Card>

                {/* AI Productivity Tips */}
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Lightbulb className="h-5 w-5" />
                      AI Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-white/70 rounded-lg">
                      <p className="text-sm text-purple-800 font-medium">
                        Peak Performance Window
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Your most productive hours are 9-11 AM. Schedule your challenging design work during this time.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white/70 rounded-lg">
                      <p className="text-sm text-purple-800 font-medium">
                        Break Reminder
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Take a 15-minute break after every 90 minutes of focused work to maintain peak performance.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Time Blocks Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today&apos;s Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTimeBlocks.map(block => (
                    <div key={block.id} className={cn("p-4 rounded-xl border", block.color)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{block.title}</h4>
                          <p className="text-sm opacity-75">{block.start} - {block.end}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {block.type}
                        </Badge>
                      </div>
                      {block.tasks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {block.tasks.map(taskId => {
                            const task = state.tasks.find(t => t.id === taskId)
                            return task ? (
                              <div key={taskId} className="text-sm opacity-75">
                                • {task.title}
                              </div>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {mockAIInsights.map(insight => (
                <Card key={insight.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        insight.type === 'productivity' ? 'bg-purple-100' :
                        insight.type === 'schedule' ? 'bg-blue-100' :
                        insight.type === 'health' ? 'bg-green-100' : 'bg-orange-100'
                      )}>
                        {insight.type === 'productivity' && <TrendingUp className="h-6 w-6 text-purple-600" />}
                        {insight.type === 'schedule' && <Calendar className="h-6 w-6 text-blue-600" />}
                        {insight.type === 'health' && <Activity className="h-6 w-6 text-green-600" />}
                        {insight.type === 'optimization' && <Zap className="h-6 w-6 text-orange-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              insight.priority === 'high' ? 'border-red-300 text-red-700' :
                              insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' : 'border-green-300 text-green-700'
                            )}
                          >
                            {insight.priority} priority
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{insight.description}</p>
                        
                        {insight.actionable && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <CheckCircle className="h-3 w-3" />
                            Apply Suggestion
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Daily Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Task Completion</span>
                        <span className="text-sm font-medium">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Focus Time Goal</span>
                        <span className="text-sm font-medium">{productivityScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${productivityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Design Work</span>
                      <span className="text-sm font-medium">2.5h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Client Communication</span>
                      <span className="text-sm font-medium">1h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Administration</span>
                      <span className="text-sm font-medium">0.5h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Breaks</span>
                      <span className="text-sm font-medium">0.5h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Task Modal */}
        {isAddingTask && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Task Title
                  </label>
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description (Optional)
                  </label>
                  <Textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add task description..."
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={addTask}
                    disabled={!newTaskTitle.trim()}
                  >
                    Add Task
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddingTask(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}
