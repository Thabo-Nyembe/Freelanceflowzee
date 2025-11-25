// MY DAY - SHARED UTILITIES, TYPES, AND MOCK DATA
// This file contains all shared functionality for the My Day feature

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Task {
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

export interface AIInsight {
  id: string
  type: 'productivity' | 'schedule' | 'health' | 'optimization'
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface TimeBlock {
  id: string
  title: string
  start: string
  end: string
  type: 'focus' | 'meeting' | 'break' | 'admin'
  tasks: string[]
  color: string
}

export interface TaskState {
  tasks: Task[]
  completedTasks: number
  totalFocusTime: number
  currentTimer: string | null
  timerStartTime: number | null
  elapsedTime: number
  insights: AIInsight[]
}

export type TaskAction =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'START_TIMER'; taskId: string }
  | { type: 'STOP_TIMER' }
  | { type: 'UPDATE_ELAPSED_TIME'; time: number }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'UPDATE_TASK'; id: string; updates: Partial<Task> }

// ============================================================================
// REDUCER
// ============================================================================

export const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
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

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockAIInsights: AIInsight[] = [
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

export const mockTimeBlocks: TimeBlock[] = [
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

export const initialTaskState: TaskState = {
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-300'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'low': return 'bg-green-100 text-green-800 border-green-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

export const calculateMetrics = (state: TaskState, workPatternAnalytics?: any) => {
  const totalTasks = state.tasks.length
  const completionRate = workPatternAnalytics?.insights?.completionRate ??
    (totalTasks > 0 ? Math.round((state.completedTasks / totalTasks) * 100) : 0)

  const focusTimeFromAnalytics = workPatternAnalytics?.insights?.focusTimePerDay
  const focusHours = focusTimeFromAnalytics
    ? Math.floor(focusTimeFromAnalytics / 60)
    : Math.floor(state.totalFocusTime / 60)
  const focusMinutes = focusTimeFromAnalytics
    ? focusTimeFromAnalytics % 60
    : state.totalFocusTime % 60

  const targetHours = 8 * 60 // 8 hours in minutes
  const productivityScore = workPatternAnalytics?.insights?.energyOptimizationScore ??
    Math.min(Math.round((state.totalFocusTime / targetHours) * 100), 100)

  return {
    totalTasks,
    completionRate,
    focusHours,
    focusMinutes,
    productivityScore
  }
}
