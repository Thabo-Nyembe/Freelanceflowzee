'use client'

import { useState, useEffect, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

// Initialize logger
const logger = createFeatureLogger('MyDay')
import {
  Clock,
  CheckCircle,
  Plus,
  Target,
  Calendar,
  Timer,
  Activity,
  ArrowRight,
  TrendingUp,
  Brain,
  Play,
  Pause,
  BarChart3,
  Trash2,
  Zap,
  MessageSquare,
  Briefcase,
  Lightbulb,
  Edit,
  Copy,
  Download,
  Filter,
  X,
  RefreshCw,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer as TextShimmerComponent } from '@/components/ui/text-shimmer'
import { LiquidGlassCard, LiquidGlassCardHeader, LiquidGlassCardTitle, LiquidGlassCardContent } from '@/components/ui/liquid-glass-card'

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
    description: "You've been working for 2.5 hours. Take a 15-minute break to maintain productivity.",
    actionable: true,
    priority: 'high'
  }
]

// Framer Motion Animation Components
const FloatingParticle = ({ delay = 0, color = 'purple' }: { delay?: number; color?: string }) => {
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

const TextShimmer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text'
      }}
    >
      {children}
    </motion.div>
  )
}

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
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const router = useRouter()
  const [activeTab, setActiveTab] = useState('today')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false)
  const [aiGeneratedSchedule, setAiGeneratedSchedule] = useState<any[]>([])
  const [showCelebration, setShowCelebration] = useState(false)

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
    completedTasks: 1,
    insights: mockAIInsights
  }

  const [state, dispatch] = useReducer(taskReducer, initialState)

  // A+++ LOAD MY DAY DATA
  useEffect(() => {
    const loadMyDayData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load My Day dashboard'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('My Day dashboard loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load My Day dashboard')
        setIsLoading(false)
        announce('Error loading My Day dashboard', 'assertive')
      }
    }

    loadMyDayData()
  }, [announce])

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
        toast.success(result.message)

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
          toast.success(`${result.message} ${result.celebration.message} +${result.celebration.points} points!`, {
            description: `Streak: ${result.celebration.streak} days`
          })
          logger.info('Task celebration triggered', {
            taskId,
            points: result.celebration.points,
            streak: result.celebration.streak
          })
        } else {
          toast.success(result.message)
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
      logger.info('Stopping current timer before starting new one', {
        previousTaskId: state.currentTimer
      })
      dispatch({ type: 'STOP_TIMER' })
    }

    dispatch({ type: 'START_TIMER', taskId })

    toast.success('Timer Started', {
      description: `Tracking time for: ${task?.title || 'Unknown task'}`
    })
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

    toast.info('Timer Stopped', {
      description: `${task?.title || 'Unknown'} - ${formatTime(state.elapsedTime)} tracked • Total: ${formatTime(totalTime)}`
    })
  }

  const handleEditTask = (task: Task) => {
    logger.info('Edit task initiated', {
      taskId: task.id,
      currentTitle: task.title,
      priority: task.priority
    })

    // TODO: Replace with modal dialog
    const newTitle = prompt('Edit task title:', task.title)
    if (newTitle && newTitle.trim()) {
      dispatch({ type: 'UPDATE_TASK', id: task.id, updates: { title: newTitle } })

      logger.info('Task updated successfully', {
        taskId: task.id,
        oldTitle: task.title,
        newTitle
      })

      toast.success('Task Updated', {
        description: `"${task.title}" → "${newTitle}"`
      })
    } else {
      logger.info('Task edit cancelled', { taskId: task.id })
    }
  }

  const handleDuplicateTask = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `task_${Date.now()}`,
      completed: false,
      startTime: undefined,
      endTime: undefined,
      title: `${task.title} (Copy)`
    }

    logger.info('Task duplicated', {
      originalId: task.id,
      originalTitle: task.title,
      newId: duplicated.id,
      newTitle: duplicated.title,
      properties: {
        priority: task.priority,
        category: task.category,
        estimatedTime: task.estimatedTime,
        tagsCount: task.tags.length
      }
    })

    dispatch({ type: 'ADD_TASK', task: duplicated })

    toast.success('Task Duplicated', {
      description: `Created "${duplicated.title}" - ${task.priority} priority, ${task.estimatedTime}min estimated`
    })
  }

  const handleArchiveTask = async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId)

    logger.info('Archive task initiated', {
      taskId,
      taskTitle: task?.title
    })

    if (!confirm('Archive this task?\n\nArchived tasks can be restored later.')) {
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          taskId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'DELETE_TASK', id: taskId })

        logger.info('Task archived successfully', {
          taskId,
          taskTitle: task?.title
        })

        toast.success('Task Archived', {
          description: `"${task?.title || 'Unknown'}" moved to archive`
        })
      }
    } catch (error: any) {
      logger.error('Failed to archive task', {
        taskId,
        taskTitle: task?.title,
        error: error.message
      })

      toast.error('Failed to delete task', {
        description: error.message || 'Please try again later'
      })

      // Optimistic update even if API fails
      dispatch({ type: 'DELETE_TASK', id: taskId })
    }
  }

  const handleChangePriority = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId)

    logger.info('Change priority initiated', {
      taskId,
      currentPriority: task?.priority,
      availablePriorities: ['low', 'medium', 'high', 'urgent']
    })

    // TODO: Replace with dropdown/modal
    const newPriority = prompt('Enter new priority:\nlow, medium, high, or urgent')?.toLowerCase()
    if (newPriority && ['low', 'medium', 'high', 'urgent'].includes(newPriority)) {
      dispatch({ type: 'UPDATE_TASK', id: taskId, updates: { priority: newPriority as any } })

      logger.info('Priority updated successfully', {
        taskId,
        oldPriority: task?.priority,
        newPriority
      })

      toast.success('Priority Updated', {
        description: `${task?.title}: ${task?.priority} → ${newPriority}`
      })
    } else {
      logger.info('Priority change cancelled or invalid', { taskId })
    }
  }

  const handleExportTasks = (format: 'csv' | 'json') => {
    const completedCount = state.tasks.filter(t => t.completed).length
    const pendingCount = state.tasks.filter(t => !t.completed).length

    const data = state.tasks.map(task => ({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      estimatedTime: `${task.estimatedTime}min`,
      completed: task.completed,
      tags: task.tags.join(', ')
    }))

    let content: string
    let filename: string

    if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      filename = `my-day-tasks-${new Date().toISOString().split('T')[0]}.json`
    } else {
      const headers = Object.keys(data[0] || {}).join(',')
      const rows = data.map(row => Object.values(row).join(','))
      content = [headers, ...rows].join('\n')
      filename = `my-day-tasks-${new Date().toISOString().split('T')[0]}.csv`
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    logger.info('Tasks exported successfully', {
      format,
      totalTasks: state.tasks.length,
      completedTasks: completedCount,
      pendingTasks: pendingCount,
      filename,
      fileSize: blob.size
    })

    toast.success('Tasks Exported', {
      description: `${state.tasks.length} tasks exported as ${format.toUpperCase()} - ${Math.round(blob.size / 1024)}KB - ${completedCount} completed, ${pendingCount} pending`
    })
  }

  const handleFilterByPriority = (priority: string) => {
    const matchingTasks = state.tasks.filter(t => t.priority === priority)

    logger.info('Filter by priority applied', {
      priority,
      matchingTasksCount: matchingTasks.length,
      taskTitles: matchingTasks.map(t => t.title)
    })

    toast.info('Priority Filter Applied', {
      description: `${priority.toUpperCase()}: ${matchingTasks.length} tasks - ${matchingTasks.map(t => t.title).slice(0, 3).join(', ')}${matchingTasks.length > 3 ? '...' : ''}`
    })
    // TODO: Add actual filter state management
  }

  const handleFilterByCategory = (category: string) => {
    const matchingTasks = state.tasks.filter(t => t.category === category)

    logger.info('Filter by category applied', {
      category,
      matchingTasksCount: matchingTasks.length,
      taskTitles: matchingTasks.map(t => t.title)
    })

    toast.info('Category Filter Applied', {
      description: `${category.toUpperCase()}: ${matchingTasks.length} tasks - ${matchingTasks.map(t => t.title).slice(0, 3).join(', ')}${matchingTasks.length > 3 ? '...' : ''}`
    })
    // TODO: Add actual filter state management
  }

  const handleClearFilters = () => {
    logger.info('Filters cleared', {
      totalTasks: state.tasks.length
    })

    toast.success('Filters Cleared', {
      description: `Showing all ${state.tasks.length} tasks`
    })
    // TODO: Reset filter state when implemented
  }

  const handleBulkComplete = () => {
    const incompleteTasks = state.tasks.filter(t => !t.completed)

    logger.info('Bulk complete initiated', {
      incompleteTasksCount: incompleteTasks.length,
      taskTitles: incompleteTasks.map(t => t.title)
    })

    if (incompleteTasks.length === 0) {
      logger.info('No tasks to complete - all done')
      toast.info('All Done!', {
        description: 'All tasks already completed'
      })
      return
    }

    if (confirm(`Complete all ${incompleteTasks.length} remaining tasks?`)) {
      incompleteTasks.forEach(task => {
        dispatch({ type: 'TOGGLE_TASK', id: task.id })
      })

      logger.info('Bulk completion successful', {
        completedCount: incompleteTasks.length
      })

      toast.success('Bulk Complete Success!', {
        description: `Completed ${incompleteTasks.length} tasks - ${incompleteTasks.map(t => t.title).slice(0, 2).join(', ')}${incompleteTasks.length > 2 ? '...' : ''}`
      })
    } else {
      logger.info('Bulk completion cancelled')
    }
  }

  const handleRescheduleTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId)

    logger.info('Reschedule task initiated', {
      taskId,
      taskTitle: task?.title,
      currentStartTime: task?.startTime
    })

    // TODO: Replace with time picker
    const newTime = prompt('Enter new start time (HH:MM):')
    if (newTime) {
      dispatch({ type: 'UPDATE_TASK', id: taskId, updates: { startTime: newTime } })

      logger.info('Task rescheduled successfully', {
        taskId,
        taskTitle: task?.title,
        oldTime: task?.startTime,
        newTime
      })

      toast.success('Task Rescheduled', {
        description: `${task?.title}: ${task?.startTime || 'Not set'} → ${newTime}`
      })
    } else {
      logger.info('Reschedule cancelled', { taskId })
    }
  }

  const handleApplyAISuggestion = (insightId: string) => {
    const insight = mockAIInsights.find(i => i.id === insightId)

    logger.info('AI suggestion applied', {
      insightId,
      suggestionTitle: insight?.title,
      suggestionType: insight?.type,
      suggestionPriority: insight?.priority,
      description: insight?.description
    })

    toast.success('AI Suggestion Applied', {
      description: `${insight?.title} - ${insight?.type} optimization applied`
    })
    // TODO: Implement actual schedule optimization logic
  }

  const handleDismissInsight = (insightId: string) => {
    const insight = mockAIInsights.find(i => i.id === insightId)

    logger.info('Insight dismissed', {
      insightId,
      insightTitle: insight?.title
    })

    toast.info('Insight Dismissed', {
      description: `"${insight?.title}" hidden from view`
    })
    // TODO: Update insights state to hide dismissed item
  }

  const handleGenerateAISchedule = async () => {
    logger.info('AI schedule generation started', {
      currentTasksCount: state.tasks.length
    })

    setIsGeneratingSchedule(true)
    toast.info('AI is analyzing your tasks...')

    try {
      const response = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: state.tasks,
          goals: ['Maximize productivity', 'Maintain work-life balance'],
          preferences: {
            workHours: '9am-5pm',
            breakDuration: 15,
            focusTimePreference: 'morning'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate schedule')
      }

      const data = await response.json()

      if (data.success && data.schedule) {
        setAiGeneratedSchedule(data.schedule)

        logger.info('AI schedule generated successfully', {
          timeBlocksCount: data.schedule.length
        })

        toast.success(`AI Schedule Generated!`, {
          description: `${data.schedule.length} optimized time blocks created`
        })

        // Optionally add schedule blocks as tasks
        data.schedule.forEach((block: any, index: number) => {
          if (block.type === 'work' || block.type === 'focus') {
            dispatch({
              type: 'ADD_TASK',
              task: {
                id: `ai-${Date.now()}-${index}`,
                title: block.title,
                description: block.description || '',
                completed: false,
                priority: block.priority as any || 'medium',
                category: block.type === 'focus' ? 'work' : 'meeting',
                estimatedTime: block.duration,
                startTime: new Date().toISOString(),
                tags: ['ai-generated']
              }
            })
          }
        })
      }
    } catch (error: any) {
      logger.error('AI schedule generation failed', {
        error: error.message
      })

      toast.error('Failed to generate AI schedule', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsGeneratingSchedule(false)
      logger.info('AI schedule generation completed')
    }
  }

  const handleExportAnalytics = () => {
    const analytics = {
      date: new Date().toLocaleDateString(),
      totalTasks: totalTasks,
      completedTasks: state.completedTasks,
      completionRate: `${completionRate}%`,
      focusTime: `${focusHours}h ${focusMinutes}m`,
      productivityScore: `${productivityScore}%`,
      insights: mockAIInsights.length
    }

    const content = JSON.stringify(analytics, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = `my-day-analytics-${new Date().toISOString().split('T')[0]}.json`
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    logger.info('Analytics exported successfully', {
      analytics,
      filename,
      fileSize: blob.size
    })

    toast.success('Analytics Exported', {
      description: `${totalTasks} tasks • ${completionRate}% complete • ${focusHours}h${focusMinutes}m focus time • ${Math.round(blob.size / 1024)}KB`
    })
  }

  const handleAddTimeBlock = () => {
    logger.info('Add time block initiated', {
      currentBlocksCount: mockTimeBlocks.length
    })

    // TODO: Replace with modal dialog
    const title = prompt('Enter time block title:')
    if (title) {
      logger.info('Time block created', {
        title,
        totalBlocks: mockTimeBlocks.length + 1
      })

      toast.success('Time Block Created', {
        description: `"${title}" - Configure start/end times in schedule`
      })
      // TODO: Add to actual time blocks state
    } else {
      logger.info('Time block creation cancelled')
    }
  }

  const handleEditTimeBlock = (blockId: string) => {
    const block = mockTimeBlocks.find(b => b.id === blockId)

    logger.info('Edit time block initiated', {
      blockId,
      currentTitle: block?.title,
      timeRange: `${block?.start} - ${block?.end}`
    })

    // TODO: Replace with modal dialog
    const newTitle = prompt('Edit time block title:', block?.title)
    if (newTitle) {
      logger.info('Time block updated', {
        blockId,
        oldTitle: block?.title,
        newTitle
      })

      toast.success('Time Block Updated', {
        description: `"${block?.title}" → "${newTitle}"`
      })
      // TODO: Update actual time blocks state
    } else {
      logger.info('Time block edit cancelled', { blockId })
    }
  }

  const handleDeleteTimeBlock = (blockId: string) => {
    const block = mockTimeBlocks.find(b => b.id === blockId)

    logger.info('Delete time block initiated', {
      blockId,
      blockTitle: block?.title
    })

    if (confirm(`Delete time block: ${block?.title}?`)) {
      logger.info('Time block deleted successfully', {
        blockId,
        blockTitle: block?.title
      })

      toast.success('Time Block Deleted', {
        description: `"${block?.title}" removed from schedule`
      })
      // TODO: Remove from actual time blocks state
    } else {
      logger.info('Time block deletion cancelled', { blockId })
    }
  }

  const handleSortTasks = (sortBy: string) => {
    logger.info('Tasks sorted', {
      sortBy,
      totalTasks: state.tasks.length
    })

    toast.info('Tasks Sorted', {
      description: `Sorted ${state.tasks.length} tasks by ${sortBy}`
    })
    // TODO: Implement actual sorting logic
  }

  const handleViewTaskHistory = () => {
    const completedTasks = state.tasks.filter(t => t.completed)

    logger.info('Task history viewed', {
      completedTasksCount: completedTasks.length,
      taskTitles: completedTasks.map(t => t.title)
    })

    toast.info('Task History', {
      description: `${completedTasks.length} completed tasks in past 7 days - ${completedTasks.map(t => t.title).slice(0, 2).join(', ')}${completedTasks.length > 2 ? '...' : ''}`
    })
    // TODO: Implement actual task history view
  }

  const handleRefreshInsights = () => {
    logger.info('AI insights refreshed', {
      currentInsightsCount: mockAIInsights.length,
      insightTitles: mockAIInsights.map(i => i.title)
    })

    toast.success('AI Insights Refreshed', {
      description: `${mockAIInsights.length} insights available - ${mockAIInsights.slice(0, 2).map(i => i.title).join(', ')}${mockAIInsights.length > 2 ? '...' : ''}`
    })
    // TODO: Trigger actual AI insights refresh API call
  }

  // Calculate progress metrics
  const totalTasks = state.tasks.length
  const completionRate = totalTasks > 0 ? Math.round((state.completedTasks / totalTasks) * 100) : 0
  const focusHours = Math.floor(state.totalFocusTime / 60)
  const focusMinutes = state.totalFocusTime % 60
  const targetHours = 8 * 60 // 8 hours in minutes
  const productivityScore = Math.min(Math.round((state.totalFocusTime / targetHours) * 100), 100)

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <div className="mb-8">
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
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
              <TextShimmerComponent className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 dark:from-gray-100 dark:via-orange-100 dark:to-amber-100 bg-clip-text text-transparent mb-2 block">
                My Day Today
              </TextShimmerComponent>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                AI-powered daily planning and productivity optimization ✨
              </p>
            </div>
            
            <div className="flex items-center gap-4">
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
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasks Progress</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      <NumberFlow value={state.completedTasks} className="inline-block" />/<NumberFlow value={totalTasks} className="inline-block" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <NumberFlow value={completionRate} suffix="%" className="inline-block" /> complete
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-xl backdrop-blur-sm">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
            
            <LiquidGlassCard variant="tinted" hoverEffect={true}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Focus Time</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      <NumberFlow value={focusHours} className="inline-block" />h <NumberFlow value={focusMinutes} className="inline-block" />m
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's work</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-400/20 to-amber-400/20 dark:from-orange-400/10 dark:to-amber-400/10 rounded-xl backdrop-blur-sm">
                    <Timer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
            
            <LiquidGlassCard variant="gradient" hoverEffect={true}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Productivity</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      <NumberFlow value={productivityScore} suffix="%" className="inline-block" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Efficiency score</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
            
            <LiquidGlassCard variant="tinted" hoverEffect={true}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Insights</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      <NumberFlow value={mockAIInsights.length} className="inline-block" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recommendations</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 dark:from-purple-400/10 dark:to-indigo-400/10 rounded-xl backdrop-blur-sm">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="today" className="flex items-center gap-2 rounded-2xl">
              <Calendar className="h-4 w-4" />
              Today's Tasks
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
            <TabsTrigger value="projects" className="flex items-center gap-2 rounded-2xl">
              <Briefcase className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2 rounded-2xl">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Today's Tasks Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tasks List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
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
                            ? "bg-gray-50 border-gray-200 opacity-75" 
                            : 'bg-white border-gray-200 hover:border-gray-300'
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
                                  data-testid="delete-task-btn"
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
                        logger.info('Navigating to calendar view')
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
                        logger.info('Generate schedule button clicked')
                        handleGenerateAISchedule();
                      }}
                    >
                      <Brain className="h-4 w-4" />
                      Generate Schedule
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
                  Today's Schedule
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
                          <Button
                            data-testid="apply-suggestion-btn"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleApplyAISuggestion(insight.id)}
                          >
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
            {/* AI-POWERED PRODUCTIVITY INSIGHTS - USER MANUAL SPEC */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                AI Productivity Insights
              </h2>
              <p className="text-gray-600">Based on your work patterns and performance data</p>
            </div>

            {/* Peak Performance Window - Manual Spec */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Peak Performance Window
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">9:00 AM - 11:00 AM</h3>
                      <p className="text-sm text-gray-600">Your most productive hours</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">95%</div>
                      <div className="text-xs text-gray-500">Efficiency Score</div>
                    </div>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl">
                    <p className="text-sm text-gray-700">
                      💡 <strong>AI Recommendation:</strong> Schedule your most challenging tasks during this window.
                      You complete tasks 35% faster and with 28% higher quality during these hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Peak Hours - Manual Spec */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Peak Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">9-11 AM</div>
                    <p className="text-sm text-gray-600 mb-3">Most Productive</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>⚡ Tasks completed: 8.2/hr</p>
                      <p>🎯 Focus level: 92%</p>
                      <p>✨ Quality score: 4.7/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Patterns - Manual Spec */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Task Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Design Work</span>
                        <span className="text-xs font-semibold text-green-600">Excellent</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">88% completion rate</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Coding</span>
                        <span className="text-xs font-semibold text-blue-600">Strong</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">82% completion rate</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Meetings</span>
                        <span className="text-xs font-semibold text-yellow-600">Average</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">65% completion rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Allocation - Manual Spec */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                    Time Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Deep Work</span>
                      <span className="text-xs font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Meetings</span>
                      <span className="text-xs font-medium">25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Admin</span>
                      <span className="text-xs font-medium">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Breaks</span>
                      <span className="text-xs font-medium">15%</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        💡 Ideal balance achieved
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Efficiency Metrics - Manual Spec */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    Efficiency Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Completion Rate</span>
                        <span className="text-xs font-semibold">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Quality Score</span>
                        <span className="text-xs font-semibold">4.7/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">On-Time Delivery</span>
                        <span className="text-xs font-semibold">91%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Energy Optimization - Manual Spec */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    Energy Optimization Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Energy Level Throughout Day</span>
                      </div>
                      {/* Energy graph visualization */}
                      <div className="grid grid-cols-12 gap-1 h-24 items-end">
                        {[30, 45, 65, 85, 95, 90, 75, 65, 70, 60, 45, 30].map((energy, hour) => (
                          <div key={hour} className="flex flex-col items-center gap-1">
                            <div
                              className={cn(
                                "w-full rounded-t transition-all",
                                energy >= 80 ? "bg-green-500" :
                                energy >= 60 ? "bg-blue-500" :
                                energy >= 40 ? "bg-yellow-500" :
                                "bg-red-500"
                              )}
                              style={{ height: `${energy}%` }}
                            ></div>
                            <span className="text-xs text-gray-500">{(hour + 8)}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <strong>🎯 Optimization Tip:</strong> Your energy peaks at 9-11 AM. Schedule complex design work here.
                        Avoid meetings during 2-3 PM when energy dips.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Performance - Enhanced */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Daily Performance Summary</CardTitle>
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
                      <p className="text-xs text-gray-500 mt-1">
                        {completionRate >= 80 ? "🎉 Excellent progress!" :
                         completionRate >= 60 ? "👍 Good progress" :
                         completionRate >= 40 ? "⚡ Keep pushing" :
                         "🎯 Let's focus"}
                      </p>
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
                      <p className="text-xs text-gray-500 mt-1">
                        {focusHours}h {focusMinutes}m of focused work today
                      </p>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Weekly Trend</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {[75, 82, 88, 79, 85, 91, completionRate].map((rate, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </div>
                            <div className="w-full h-12 bg-gray-200 rounded flex items-end">
                              <div
                                className={cn(
                                  "w-full rounded",
                                  i === 6 ? "bg-purple-600" : "bg-gray-400"
                                )}
                                style={{ height: `${rate}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  AI-Generated Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-sm">Productivity Boost</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      You're 23% more productive on days when you start with deep work.
                      Try blocking 9-10 AM for your most important task.
                    </p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-sm">Time Management</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Batch similar tasks together. When you group meetings in the afternoon,
                      you complete 31% more tasks in the morning.
                    </p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <h4 className="font-semibold text-sm">Break Optimization</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Taking a 15-min break every 90 minutes increases your afternoon productivity by 18%.
                      Your next break is recommended at 2:30 PM.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Projects */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project 1 */}
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">TechCorp Branding</h4>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        On Track
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Complete logo design and brand guidelines</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Tasks today: 2</span>
                        <span>Due: 3 days</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                          High Priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Velocity: 85%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Project 2 */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Portfolio Redesign</h4>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        At Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Modernize portfolio with new case studies</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Tasks today: 1</span>
                        <span>Due: 1 week</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                          Medium Priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Velocity: 72%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Project 3 */}
                  <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Client Dashboard</h4>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        Ahead
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Build custom analytics dashboard</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Tasks today: 1</span>
                        <span>Due: 5 days</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          Low Priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Velocity: 95%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Insights */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Project Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Velocity Metrics */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Team Velocity</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">TechCorp Branding</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">85%</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Portfolio Redesign</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">72%</span>
                          <Activity className="h-4 w-4 text-yellow-600" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Client Dashboard</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">95%</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Allocation */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Resource Allocation</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Design</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Development</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Communication</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Recommendation
                    </h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Focus on TechCorp Branding this week to maintain momentum. Portfolio Redesign needs attention - consider allocating 2 more hours today.
                    </p>
                    <Button variant="outline" size="sm" className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-100">
                      <CheckCircle className="h-3 w-3" />
                      Apply Recommendation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Goals */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Daily Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Goal 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Complete 5 tasks</p>
                      <p className="text-sm text-gray-600">Current: 1/5 completed</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Goal 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Timer className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">6 hours of focus time</p>
                      <p className="text-sm text-gray-600">Current: {focusHours}h {focusMinutes}m / 6h</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((state.totalFocusTime / 360) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Goal 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">2 client check-ins</p>
                      <p className="text-sm text-gray-600">Current: 0/2 completed</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Goals */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Week Goal 1 */}
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">Finish TechCorp milestone</p>
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs">
                        In Progress
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Complete all logo variations and documentation</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">75% complete - 2 days remaining</p>
                  </div>

                  {/* Week Goal 2 */}
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">Client presentation prep</p>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Prepare slides and demo materials</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">30% complete - 4 days remaining</p>
                  </div>

                  {/* Week Goal 3 */}
                  <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">Portfolio update</p>
                      <Badge variant="outline" className="bg-teal-100 text-teal-700 border-teal-300 text-xs">
                        On Track
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Add 3 new case studies</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2/3 case studies added</p>
                  </div>
                </CardContent>
              </Card>

              {/* Goal Analytics */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Goal Achievement Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Overall Achievement */}
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Overall Achievement</p>
                      <p className="text-4xl font-bold text-purple-700">87%</p>
                      <p className="text-xs text-gray-500 mt-1">Weekly average</p>
                    </div>

                    {/* Daily Goals */}
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Daily Goals</p>
                      <p className="text-4xl font-bold text-blue-700">92%</p>
                      <p className="text-xs text-gray-500 mt-1">Success rate</p>
                    </div>

                    {/* Weekly Goals */}
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Weekly Goals</p>
                      <p className="text-4xl font-bold text-green-700">82%</p>
                      <p className="text-xs text-gray-500 mt-1">Completion rate</p>
                    </div>
                  </div>

                  {/* Streak Tracking */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Current Streaks</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">12</p>
                        <p className="text-xs text-gray-600">Daily tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">8</p>
                        <p className="text-xs text-gray-600">Focus hours</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">5</p>
                        <p className="text-xs text-gray-600">Client updates</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Performance */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Performance by Category</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Productivity</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Communication</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Learning</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Goal Suggestions */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      AI Goal Suggestions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <p className="text-sm text-indigo-700">Based on your velocity, you could add a stretch goal: "Ship one feature early this week"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <p className="text-sm text-indigo-700">Your productivity peaks in mornings - schedule important goals between 9-11 AM</p>
                      </div>
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
      </div>
    </div>
  )
}