'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

// AI FEATURES
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel'
import { useCurrentUser } from '@/hooks/use-ai-data'

// MY DAY UTILITIES
import {
  taskReducer,
  initialTaskState,
  formatTime,
  formatDuration,
  getPriorityColor,
  calculateMetrics
} from '@/lib/my-day-utils'

import {
  CheckCircle,
  Plus,
  Target,
  Calendar,
  Timer,
  ArrowRight,
  TrendingUp,
  Brain,
  Play,
  Pause,
  Trash2,
  Zap,
  MessageSquare,
  Briefcase,
  Lightbulb,
  Clock,
  BarChart3,
  FolderKanban,
  CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer as TextShimmerComponent } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'

// Initialize logger
const logger = createFeatureLogger('MyDay-Today')

export default function MyDayTodayPage() {
  // REAL USER AUTH & AI DATA
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const router = useRouter()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // AI Insights Panel State
  const [showAIPanel, setShowAIPanel] = useState(true)

  // Delete confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const [state, dispatch] = useReducer(taskReducer, initialTaskState)

  // A+++ LOAD MY DAY DATA
  useEffect(() => {
    const loadMyDayData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch my day data from API
        const response = await fetch('/api/my-day').catch(() => null)
        if (response?.ok) {
          const data = await response.json()
          if (data.tasks) {
            data.tasks.forEach((task: any) => dispatch({ type: 'ADD_TASK', task }))
          }
        }

        setIsLoading(false)
        announce('My Day dashboard loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load My Day dashboard')
        setIsLoading(false)
        announce('Error loading My Day dashboard', 'assertive')
      }
    }

    loadMyDayData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const addTask = async () => {
    if (!newTaskTitle.trim()) return

    logger.info('Adding new task', {
      title: newTaskTitle,
      priority: newTaskPriority,
      description: newTaskDescription || '(none)'
    })

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            title: newTaskTitle,
            description: newTaskDescription,
            priority: newTaskPriority,
            category: 'work',
            estimatedTime: 60,
            tags: []
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'ADD_TASK', task: result.task })
        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskPriority('medium')
        setIsAddingTask(false)
        toast.success(result.message || 'Task added successfully!')

        logger.info('Task added successfully', {
          taskId: result.task.id,
          title: result.task.title
        })
      }
    } catch (error: any) {
      logger.error('Failed to add task', { error, title: newTaskTitle })
      toast.error('Failed to add task', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const toggleTask = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return

    const newCompleted = !task.completed
    logger.info('Toggling task', {
      taskId,
      title: task.title,
      from: task.completed ? 'completed' : 'pending',
      to: newCompleted ? 'completed' : 'pending'
    })

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          taskId,
          data: { completed: newCompleted }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle task')
      }

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'TOGGLE_TASK', id: taskId })
        logger.info('Task toggled successfully', { taskId, completed: newCompleted })

        if (newCompleted) {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 3000)
        }

        if (result.celebration) {
          toast.success(`${result.message} ${result.celebration.message} +${result.celebration.points} points! Streak: ${result.celebration.streak} days`)
        } else {
          toast.success(result.message || 'Task updated successfully!')
        }
      }
    } catch (error: any) {
      logger.error('Failed to toggle task', { error, taskId })
      toast.error('Failed to update task', {
        description: error.message || 'Please try again later'
      })
      // Optimistic update even if API fails
      dispatch({ type: 'TOGGLE_TASK', id: taskId })
    }
  }

  const startTimer = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId)

    logger.info('Starting timer for task', {
      taskId,
      taskTitle: task?.title,
      currentlyRunning: !!state.currentTimer
    })

    if (state.currentTimer) {
      dispatch({ type: 'STOP_TIMER' })
    }

    dispatch({ type: 'START_TIMER', taskId })
    toast.success(`Timer Started - Tracking time for: ${task?.title || 'Unknown task'}`)
  }

  const stopTimer = () => {
    const task = state.tasks.find(t => t.id === state.currentTimer || '')
    const totalTime = state.totalFocusTime + state.elapsedTime

    logger.info('Stopping timer', {
      taskId: state.currentTimer,
      taskTitle: task?.title,
      elapsedTime: state.elapsedTime,
      totalFocusTime: totalTime
    })

    dispatch({ type: 'STOP_TIMER' })
    toast.success(`Timer Stopped - ${task?.title || 'Unknown'} - ${formatTime(state.elapsedTime)} tracked`)
  }

  // Handle delete task with confirmation
  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    const task = state.tasks.find(t => t.id === taskToDelete)

    logger.info('Deleting task', {
      taskId: taskToDelete,
      taskTitle: task?.title
    })

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          taskId: taskToDelete
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      dispatch({ type: 'DELETE_TASK', id: taskToDelete })
      toast.success(`Task "${task?.title}" deleted successfully`)
      logger.info('Task deleted successfully', { taskId: taskToDelete, title: task?.title })
    } catch (error: any) {
      logger.error('Failed to delete task', { error, taskId: taskToDelete })
      // Optimistic deletion even if API fails
      dispatch({ type: 'DELETE_TASK', id: taskToDelete })
      toast.success(`Task "${task?.title}" deleted`)
    }

    setShowDeleteConfirm(false)
    setTaskToDelete(null)
  }

  // Calculate progress metrics
  const { totalTasks, completionRate, focusHours, focusMinutes, productivityScore } = calculateMetrics(state)

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-Page Navigation */}
      <LiquidGlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Day</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Plan and track your day</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link href="/dashboard/my-day/goals">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-300 dark:hover:border-orange-700 dark:bg-gray-800/50 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-white">Goals</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Set targets</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/my-day/schedule">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-300 dark:hover:border-orange-700 dark:bg-gray-800/50 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-white">Schedule</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Time blocks</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/my-day/projects">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-300 dark:hover:border-orange-700 dark:bg-gray-800/50 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderKanban className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-white">Projects</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Today's work</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/my-day/insights">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-300 dark:hover:border-orange-700 dark:bg-gray-800/50 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-white">Insights</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Productivity</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/my-day/analytics">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-300 dark:hover:border-orange-700 dark:bg-gray-800/50 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-white">Analytics</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trends</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <TextShimmerComponent className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent mb-2 block">
            Today&apos;s Tasks
          </TextShimmerComponent>
          <p className="text-lg text-gray-600 font-light">
            Focus on what matters most today
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <Brain className="h-4 w-4" />
            {showAIPanel ? 'Hide' : 'Show'} AI Insights
          </Button>

          <Button
            data-testid="back-to-dashboard-btn"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Dashboard
          </Button>

          <Button
            data-testid="add-task-header-btn"
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
        <LiquidGlassCard variant="gradient" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Tasks Progress</p>
                <div className="text-3xl font-bold text-gray-900">
                  <NumberFlow value={state.completedTasks} className="inline-block" />/<NumberFlow value={totalTasks} className="inline-block" />
                </div>
                <p className="text-sm text-gray-500">
                  <NumberFlow value={completionRate} suffix="%" className="inline-block" /> complete
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl backdrop-blur-sm">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Focus Time</p>
                <div className="text-3xl font-bold text-gray-900">
                  <NumberFlow value={focusHours} className="inline-block" />h <NumberFlow value={focusMinutes} className="inline-block" />m
                </div>
                <p className="text-sm text-gray-500">Today's work</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-xl backdrop-blur-sm">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="gradient" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Productivity</p>
                <div className="text-3xl font-bold text-gray-900">
                  <NumberFlow value={productivityScore} suffix="%" className="inline-block" />
                </div>
                <p className="text-sm text-gray-500">Efficiency score</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">AI Insights</p>
                <div className="text-3xl font-bold text-gray-900">
                  <NumberFlow value={3} className="inline-block" />
                </div>
                <p className="text-sm text-gray-500">Recommendations</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-xl backdrop-blur-sm">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* AI INSIGHTS PANEL */}
      {showAIPanel && userId && (
        <div>
          <AIInsightsPanel
            userId={userId}
            defaultExpanded={true}
            showHeader={true}
          />
        </div>
      )}

      {/* Active Timer Display */}
      {state.currentTimer && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
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
                  data-testid="stop-timer-btn"
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 dark:text-white">
                  <Target className="h-5 w-5" />
                  Today's Tasks
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {state.tasks.filter(t => !t.completed).length} remaining
                  </Badge>
                  <Button
                    data-testid="add-task-btn"
                    size="sm"
                    onClick={() => setIsAddingTask(true)}
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
                      ? "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-75"
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Button
                      data-testid="toggle-task-btn"
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => toggleTask(task.id)}
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
                            task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white")}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
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
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs">
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
                            data-testid="delete-task-btn"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteTask(task.id)}
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
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                data-testid="view-calendar-btn"
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => router.push('/dashboard/calendar')}
              >
                <Calendar className="h-4 w-4" />
                View Calendar
              </Button>

              <Button
                data-testid="check-messages-btn"
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => router.push('/dashboard/collaboration')}
              >
                <MessageSquare className="h-4 w-4" />
                Check Client Messages
              </Button>

              <Button
                data-testid="view-projects-btn"
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => router.push('/dashboard/projects-hub')}
              >
                <Briefcase className="h-4 w-4" />
                View Projects
              </Button>
            </CardContent>
          </Card>

          {/* AI Productivity Tips */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-slate-800 dark:from-transparent dark:to-transparent border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Lightbulb className="h-5 w-5" />
                AI Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
                  Peak Performance Window
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Your most productive hours are 9-11 AM. Schedule your challenging design work during this time.
                </p>
              </div>

              <div className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
                  Break Reminder
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Take a 15-minute break after every 90 minutes of focused work to maintain peak performance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  data-testid="confirm-add-task-btn"
                  className="flex-1"
                  onClick={addTask}
                  disabled={!newTaskTitle.trim()}
                >
                  Add Task
                </Button>
                <Button
                  data-testid="cancel-add-task-btn"
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

      {/* Delete Task Confirmation Dialog */}
      {showDeleteConfirm && taskToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete &quot;{state.tasks.find(t => t.id === taskToDelete)?.title}&quot;?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. The task and all associated time tracking data will be permanently removed.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  data-testid="confirm-delete-task-btn"
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmDeleteTask}
                >
                  Delete Task
                </Button>
                <Button
                  data-testid="cancel-delete-task-btn"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setTaskToDelete(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
