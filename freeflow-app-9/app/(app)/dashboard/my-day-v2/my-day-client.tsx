'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Target,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  FolderKanban,
  Filter,
  BarChart3,
  Plus,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Bell,
  Repeat,
  MessageSquare,
  Paperclip,
  Timer,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Inbox,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  Edit3,
  Trash2,
  Copy,
  Move,
  Archive,
  Settings,
  Keyboard,
  TrendingUp,
  Flame,
  Zap,
  Award,
  Brain,
  ListTodo,
  CalendarDays,
  Hash,
  Layers
} from 'lucide-react'

// Types
type TaskPriority = 'p1' | 'p2' | 'p3' | 'p4'
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'none'
type ViewType = 'list' | 'board' | 'calendar'

interface SubTask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

interface TaskComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  attachments?: string[]
}

interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId?: string
  projectName?: string
  projectColor?: string
  sectionId?: string
  sectionName?: string
  labels: string[]
  dueDate?: string
  dueTime?: string
  reminder?: string
  recurrence?: {
    type: RecurrenceType
    interval?: number
    days?: string[]
    endDate?: string
  }
  estimatedMinutes?: number
  actualMinutes?: number
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  subTasks: SubTask[]
  comments: TaskComment[]
  attachments: number
  isStarred: boolean
  createdAt: string
  completedAt?: string
  order: number
}

interface Project {
  id: string
  name: string
  color: string
  icon?: string
  description?: string
  taskCount: number
  completedCount: number
  isFavorite: boolean
  isShared: boolean
  members?: number
  sections: Section[]
  createdAt: string
}

interface Section {
  id: string
  name: string
  projectId: string
  taskCount: number
  order: number
}

interface Label {
  id: string
  name: string
  color: string
  taskCount: number
}

interface SavedFilter {
  id: string
  name: string
  icon: string
  query: string
  color: string
  taskCount: number
}

interface FocusSession {
  id: string
  taskId: string
  taskTitle: string
  type: 'focus' | 'short_break' | 'long_break'
  duration: number
  startedAt: string
  endedAt?: string
  completed: boolean
}

interface ProductivityStats {
  tasksCompletedToday: number
  tasksCompletedThisWeek: number
  streakDays: number
  focusMinutesToday: number
  averageTasksPerDay: number
  onTimeCompletionRate: number
  topProductiveHour: string
  karmaPoints: number
}

// Helper functions
const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    p1: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    p2: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    p3: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    p4: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
  return colors[priority]
}

const getPriorityIcon = (priority: TaskPriority) => {
  const icons: Record<TaskPriority, JSX.Element> = {
    p1: <Flag className="w-3 h-3 text-red-500" />,
    p2: <Flag className="w-3 h-3 text-orange-500" />,
    p3: <Flag className="w-3 h-3 text-blue-500" />,
    p4: <Minus className="w-3 h-3 text-gray-400" />
  }
  return icons[priority]
}

const getStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status]
}

const getDueLabel = (dueDate?: string): { label: string; color: string; icon: JSX.Element } | null => {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { label: 'Overdue', color: 'text-red-500', icon: <Clock className="w-3 h-3" /> }
  if (diff === 0) return { label: 'Today', color: 'text-green-500', icon: <Sun className="w-3 h-3" /> }
  if (diff === 1) return { label: 'Tomorrow', color: 'text-orange-500', icon: <Sunrise className="w-3 h-3" /> }
  if (diff <= 7) return { label: due.toLocaleDateString('en-US', { weekday: 'short' }), color: 'text-purple-500', icon: <Calendar className="w-3 h-3" /> }
  return { label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-gray-500', icon: <Calendar className="w-3 h-3" /> }
}

// Mock data
const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Review Q4 financial reports',
    description: 'Analyze quarterly financial statements and prepare summary for board meeting',
    status: 'pending',
    priority: 'p1',
    projectId: 'proj1',
    projectName: 'Finance',
    projectColor: '#10B981',
    sectionId: 'sec1',
    sectionName: 'Reports',
    labels: ['urgent', 'finance'],
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '14:00',
    reminder: '30min',
    estimatedMinutes: 90,
    subTasks: [
      { id: 'st1', title: 'Download financial statements', completed: true, createdAt: '2024-01-10' },
      { id: 'st2', title: 'Analyze revenue trends', completed: false, createdAt: '2024-01-10' },
      { id: 'st3', title: 'Prepare executive summary', completed: false, createdAt: '2024-01-10' }
    ],
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Sarah Chen', content: 'CFO needs this by EOD', createdAt: '2024-01-14T09:00:00' }
    ],
    attachments: 3,
    isStarred: true,
    createdAt: '2024-01-10',
    order: 1
  },
  {
    id: 't2',
    title: 'Team standup meeting',
    description: 'Daily sync with engineering team',
    status: 'completed',
    priority: 'p2',
    projectId: 'proj2',
    projectName: 'Engineering',
    projectColor: '#6366F1',
    labels: ['meeting', 'recurring'],
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '09:00',
    recurrence: { type: 'daily', interval: 1 },
    estimatedMinutes: 30,
    actualMinutes: 25,
    subTasks: [],
    comments: [],
    attachments: 0,
    isStarred: false,
    createdAt: '2024-01-01',
    completedAt: new Date().toISOString(),
    order: 2
  },
  {
    id: 't3',
    title: 'Update product roadmap',
    description: 'Revise Q1 milestones based on new priorities',
    status: 'in_progress',
    priority: 'p2',
    projectId: 'proj3',
    projectName: 'Product',
    projectColor: '#F59E0B',
    sectionId: 'sec2',
    sectionName: 'Planning',
    labels: ['roadmap', 'strategy'],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedMinutes: 120,
    actualMinutes: 45,
    assigneeId: 'u2',
    assigneeName: 'Mike Johnson',
    assigneeAvatar: '/avatars/mike.jpg',
    subTasks: [
      { id: 'st4', title: 'Review current milestones', completed: true, createdAt: '2024-01-12' },
      { id: 'st5', title: 'Gather stakeholder feedback', completed: true, createdAt: '2024-01-12' },
      { id: 'st6', title: 'Draft new timeline', completed: false, createdAt: '2024-01-12' },
      { id: 'st7', title: 'Get approval from leadership', completed: false, createdAt: '2024-01-12' }
    ],
    comments: [
      { id: 'c2', userId: 'u3', userName: 'Lisa Park', content: 'Please include mobile app milestones', createdAt: '2024-01-13T14:30:00' },
      { id: 'c3', userId: 'u2', userName: 'Mike Johnson', content: 'Added mobile section', createdAt: '2024-01-13T16:00:00' }
    ],
    attachments: 2,
    isStarred: true,
    createdAt: '2024-01-12',
    order: 3
  },
  {
    id: 't4',
    title: 'Prepare client presentation',
    description: 'Create slides for upcoming client demo',
    status: 'pending',
    priority: 'p1',
    projectId: 'proj4',
    projectName: 'Sales',
    projectColor: '#EC4899',
    labels: ['client', 'presentation'],
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:00',
    estimatedMinutes: 180,
    subTasks: [
      { id: 'st8', title: 'Create outline', completed: true, createdAt: '2024-01-13' },
      { id: 'st9', title: 'Design slides', completed: false, createdAt: '2024-01-13' },
      { id: 'st10', title: 'Add demo videos', completed: false, createdAt: '2024-01-13' }
    ],
    comments: [],
    attachments: 5,
    isStarred: false,
    createdAt: '2024-01-13',
    order: 4
  },
  {
    id: 't5',
    title: 'Code review for authentication module',
    description: 'Review PR #234 for new OAuth implementation',
    status: 'pending',
    priority: 'p2',
    projectId: 'proj2',
    projectName: 'Engineering',
    projectColor: '#6366F1',
    labels: ['code-review', 'security'],
    dueDate: new Date().toISOString().split('T')[0],
    estimatedMinutes: 60,
    subTasks: [],
    comments: [],
    attachments: 1,
    isStarred: false,
    createdAt: '2024-01-14',
    order: 5
  },
  {
    id: 't6',
    title: 'Weekly team retrospective',
    description: 'Discuss wins, challenges, and improvements',
    status: 'pending',
    priority: 'p3',
    projectId: 'proj2',
    projectName: 'Engineering',
    projectColor: '#6366F1',
    labels: ['meeting', 'recurring'],
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    dueTime: '15:00',
    recurrence: { type: 'weekly', interval: 1, days: ['Friday'] },
    estimatedMinutes: 60,
    subTasks: [],
    comments: [],
    attachments: 0,
    isStarred: false,
    createdAt: '2024-01-01',
    order: 6
  },
  {
    id: 't7',
    title: 'Update documentation',
    description: 'Refresh API documentation with new endpoints',
    status: 'pending',
    priority: 'p3',
    projectId: 'proj2',
    projectName: 'Engineering',
    projectColor: '#6366F1',
    sectionId: 'sec3',
    sectionName: 'Documentation',
    labels: ['docs'],
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedMinutes: 90,
    subTasks: [
      { id: 'st11', title: 'List new endpoints', completed: false, createdAt: '2024-01-14' },
      { id: 'st12', title: 'Write request/response examples', completed: false, createdAt: '2024-01-14' }
    ],
    comments: [],
    attachments: 0,
    isStarred: false,
    createdAt: '2024-01-14',
    order: 7
  },
  {
    id: 't8',
    title: 'Personal: Schedule dentist appointment',
    description: 'Annual checkup',
    status: 'pending',
    priority: 'p4',
    labels: ['personal', 'health'],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    subTasks: [],
    comments: [],
    attachments: 0,
    isStarred: false,
    createdAt: '2024-01-10',
    order: 8
  }
]

const mockProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Finance',
    color: '#10B981',
    description: 'Financial planning and reporting',
    taskCount: 12,
    completedCount: 8,
    isFavorite: true,
    isShared: false,
    sections: [
      { id: 'sec1', name: 'Reports', projectId: 'proj1', taskCount: 5, order: 1 },
      { id: 'sec4', name: 'Budgeting', projectId: 'proj1', taskCount: 7, order: 2 }
    ],
    createdAt: '2024-01-01'
  },
  {
    id: 'proj2',
    name: 'Engineering',
    color: '#6366F1',
    description: 'Product development and technical tasks',
    taskCount: 34,
    completedCount: 21,
    isFavorite: true,
    isShared: true,
    members: 8,
    sections: [
      { id: 'sec3', name: 'Documentation', projectId: 'proj2', taskCount: 6, order: 1 },
      { id: 'sec5', name: 'Backend', projectId: 'proj2', taskCount: 15, order: 2 },
      { id: 'sec6', name: 'Frontend', projectId: 'proj2', taskCount: 13, order: 3 }
    ],
    createdAt: '2024-01-01'
  },
  {
    id: 'proj3',
    name: 'Product',
    color: '#F59E0B',
    description: 'Product strategy and roadmap',
    taskCount: 18,
    completedCount: 10,
    isFavorite: false,
    isShared: true,
    members: 5,
    sections: [
      { id: 'sec2', name: 'Planning', projectId: 'proj3', taskCount: 8, order: 1 },
      { id: 'sec7', name: 'Research', projectId: 'proj3', taskCount: 10, order: 2 }
    ],
    createdAt: '2024-01-01'
  },
  {
    id: 'proj4',
    name: 'Sales',
    color: '#EC4899',
    description: 'Sales activities and client management',
    taskCount: 25,
    completedCount: 18,
    isFavorite: false,
    isShared: true,
    members: 6,
    sections: [],
    createdAt: '2024-01-01'
  },
  {
    id: 'proj5',
    name: 'Marketing',
    color: '#8B5CF6',
    description: 'Marketing campaigns and content',
    taskCount: 15,
    completedCount: 9,
    isFavorite: false,
    isShared: false,
    sections: [],
    createdAt: '2024-01-05'
  }
]

const mockLabels: Label[] = [
  { id: 'l1', name: 'urgent', color: '#EF4444', taskCount: 5 },
  { id: 'l2', name: 'meeting', color: '#3B82F6', taskCount: 8 },
  { id: 'l3', name: 'code-review', color: '#10B981', taskCount: 3 },
  { id: 'l4', name: 'client', color: '#F59E0B', taskCount: 6 },
  { id: 'l5', name: 'docs', color: '#6366F1', taskCount: 4 },
  { id: 'l6', name: 'personal', color: '#EC4899', taskCount: 2 },
  { id: 'l7', name: 'recurring', color: '#8B5CF6', taskCount: 7 },
  { id: 'l8', name: 'finance', color: '#14B8A6', taskCount: 3 }
]

const mockFilters: SavedFilter[] = [
  { id: 'f1', name: 'Priority 1', icon: 'flag', query: 'priority:p1', color: '#EF4444', taskCount: 5 },
  { id: 'f2', name: 'Due This Week', icon: 'calendar', query: 'due:7d', color: '#3B82F6', taskCount: 12 },
  { id: 'f3', name: 'Assigned to Me', icon: 'user', query: 'assignee:me', color: '#10B981', taskCount: 8 },
  { id: 'f4', name: 'No Due Date', icon: 'help', query: 'no:due', color: '#6B7280', taskCount: 15 },
  { id: 'f5', name: 'Completed Today', icon: 'check', query: 'completed:today', color: '#22C55E', taskCount: 6 }
]

const mockStats: ProductivityStats = {
  tasksCompletedToday: 6,
  tasksCompletedThisWeek: 28,
  streakDays: 14,
  focusMinutesToday: 185,
  averageTasksPerDay: 5.2,
  onTimeCompletionRate: 87,
  topProductiveHour: '10:00 AM',
  karmaPoints: 2847
}

interface MyDayClientProps {
  initialTasks?: Task[]
  initialSessions?: FocusSession[]
}

export default function MyDayClient({ initialTasks, initialSessions }: MyDayClientProps) {
  const [activeTab, setActiveTab] = useState('today')
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [projects] = useState<Project[]>(mockProjects)
  const [labels] = useState<Label[]>(mockLabels)
  const [filters] = useState<SavedFilter[]>(mockFilters)
  const [stats] = useState<ProductivityStats>(mockStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['proj1', 'proj2']))
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

  // Pomodoro timer state
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  // New task state
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddText, setQuickAddText] = useState('')

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false)
      if (timerMode === 'focus') {
        setPomodoroCount(prev => prev + 1)
        // Auto switch to break
        if ((pomodoroCount + 1) % 4 === 0) {
          setTimerMode('long_break')
          setTimerSeconds(15 * 60)
        } else {
          setTimerMode('short_break')
          setTimerSeconds(5 * 60)
        }
      } else {
        setTimerMode('focus')
        setTimerSeconds(25 * 60)
      }
    }
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds, timerMode, pomodoroCount])

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetTimer = () => {
    setTimerActive(false)
    setTimerMode('focus')
    setTimerSeconds(25 * 60)
  }

  // Computed values
  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(t => t.dueDate === today && t.status !== 'completed')
  }, [tasks])

  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'completed')
  }, [tasks])

  const upcomingTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    return tasks.filter(t => t.dueDate && t.dueDate > today && t.dueDate <= nextWeek && t.status !== 'completed')
  }, [tasks])

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(t => t.completedAt && t.completedAt.startsWith(today))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.labels.some(l => l.toLowerCase().includes(query)) ||
        t.projectName?.toLowerCase().includes(query)
      )
    }

    if (selectedProject) {
      result = result.filter(t => t.projectId === selectedProject)
    }

    if (selectedLabel) {
      result = result.filter(t => t.labels.includes(selectedLabel))
    }

    return result
  }, [tasks, searchQuery, selectedProject, selectedLabel])

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === 'completed' ? 'pending' : 'completed'
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        }
      }
      return t
    }))
  }

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          )
        }
      }
      return t
    }))
  }

  const startTaskTimer = (taskId: string) => {
    setActiveTaskId(taskId)
    setTimerMode('focus')
    setTimerSeconds(25 * 60)
    setTimerActive(true)
  }

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDialog(true)
  }

  // Stat cards
  const statCards = [
    { label: 'Today', value: todayTasks.length, icon: Sun, color: 'from-amber-500 to-orange-600', change: '+2' },
    { label: 'Overdue', value: overdueTasks.length, icon: Clock, color: 'from-red-500 to-rose-600', change: '-1' },
    { label: 'Completed', value: completedToday.length, icon: CheckCircle2, color: 'from-green-500 to-emerald-600', change: '+6' },
    { label: 'Focus Time', value: `${Math.floor(stats.focusMinutesToday / 60)}h ${stats.focusMinutesToday % 60}m`, icon: Timer, color: 'from-purple-500 to-violet-600', change: '+45m' },
    { label: 'This Week', value: stats.tasksCompletedThisWeek, icon: BarChart3, color: 'from-blue-500 to-indigo-600', change: '+8' },
    { label: 'Streak', value: `${stats.streakDays} days`, icon: Flame, color: 'from-orange-500 to-red-600', change: '+1' },
    { label: 'On-time Rate', value: `${stats.onTimeCompletionRate}%`, icon: TrendingUp, color: 'from-teal-500 to-cyan-600', change: '+3%' },
    { label: 'Karma', value: stats.karmaPoints.toLocaleString(), icon: Award, color: 'from-pink-500 to-rose-600', change: '+127' }
  ]

  // Render task item
  const renderTaskItem = (task: Task, showProject = true) => {
    const dueLabel = getDueLabel(task.dueDate)
    const completedSubTasks = task.subTasks.filter(st => st.completed).length

    return (
      <div
        key={task.id}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
          task.status === 'completed'
            ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60'
            : 'bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        onClick={() => openTaskDetail(task)}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id) }}
            className="mt-0.5 flex-shrink-0"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className={`w-5 h-5 ${
                task.priority === 'p1' ? 'text-red-400' :
                task.priority === 'p2' ? 'text-orange-400' :
                task.priority === 'p3' ? 'text-blue-400' : 'text-gray-300'
              }`} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </span>
              {task.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {showProject && task.projectName && (
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.projectColor }} />
                  {task.projectName}
                </span>
              )}

              {dueLabel && (
                <span className={`flex items-center gap-1 text-xs ${dueLabel.color}`}>
                  {dueLabel.icon}
                  {dueLabel.label}
                  {task.dueTime && ` ${task.dueTime}`}
                </span>
              )}

              {task.recurrence && task.recurrence.type !== 'none' && (
                <span className="flex items-center gap-1 text-xs text-purple-500">
                  <Repeat className="w-3 h-3" />
                  {task.recurrence.type}
                </span>
              )}

              {task.estimatedMinutes && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Timer className="w-3 h-3" />
                  {task.estimatedMinutes}m
                </span>
              )}

              {task.subTasks.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ListTodo className="w-3 h-3" />
                  {completedSubTasks}/{task.subTasks.length}
                </span>
              )}

              {task.comments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MessageSquare className="w-3 h-3" />
                  {task.comments.length}
                </span>
              )}

              {task.attachments > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Paperclip className="w-3 h-3" />
                  {task.attachments}
                </span>
              )}
            </div>

            {task.labels.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {task.labels.slice(0, 3).map(label => {
                  const labelData = labels.find(l => l.name === label)
                  return (
                    <span
                      key={label}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: `${labelData?.color}20`,
                        color: labelData?.color
                      }}
                    >
                      @{label}
                    </span>
                  )
                })}
                {task.labels.length > 3 && (
                  <span className="text-xs text-gray-500">+{task.labels.length - 3}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {task.assigneeAvatar && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assigneeAvatar} />
                <AvatarFallback>{task.assigneeName?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}

            {task.status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => { e.stopPropagation(); startTaskTimer(task.id) }}
              >
                <Play className="w-4 h-4" />
              </Button>
            )}

            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Day</h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pomodoro Timer */}
            <Card className="flex items-center gap-3 px-4 py-2">
              <div className={`text-lg font-mono font-bold ${
                timerMode === 'focus' ? 'text-red-500' :
                timerMode === 'short_break' ? 'text-green-500' : 'text-blue-500'
              }`}>
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTimerActive(!timerActive)}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={resetTimer}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant="outline" className="text-xs">
                🍅 {pomodoroCount}
              </Badge>
            </Card>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <Button variant="ghost" size="icon">
              <Keyboard className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>

            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              onClick={() => setShowQuickAdd(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Quick Add Bar */}
        {showQuickAdd && (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder='Add task e.g. "Review report tomorrow #work @urgent"'
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button onClick={() => { setShowQuickAdd(false); setQuickAddText('') }}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => { setShowQuickAdd(false); setQuickAddText('') }}>
                Cancel
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> today, tomorrow, next week</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> #project</span>
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> @label</span>
              <span className="flex items-center gap-1"><Flag className="w-3 h-3" /> p1-p4</span>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-green-500 font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 h-auto flex-wrap">
            <TabsTrigger value="today" className="gap-2">
              <Sun className="w-4 h-4" />
              Today
              <Badge variant="secondary" className="ml-1">{todayTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="labels" className="gap-2">
              <Tag className="w-4 h-4" />
              Labels
            </TabsTrigger>
            <TabsTrigger value="filters" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Task List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Overdue */}
                {overdueTasks.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                        <Clock className="w-5 h-5" />
                        Overdue ({overdueTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {overdueTasks.map(task => renderTaskItem(task))}
                    </CardContent>
                  </Card>
                )}

                {/* Today's Tasks */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        Today ({todayTasks.length})
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Plus className="w-4 h-4" /> Add Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {todayTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">All caught up!</p>
                        <p className="text-sm">No tasks due today</p>
                      </div>
                    ) : (
                      todayTasks.map(task => renderTaskItem(task))
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sunrise className="w-5 h-5 text-purple-500" />
                      Upcoming ({upcomingTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {upcomingTasks.map(task => renderTaskItem(task))}
                  </CardContent>
                </Card>

                {/* Completed Today */}
                {completedToday.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        Completed Today ({completedToday.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {completedToday.map(task => renderTaskItem(task))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Focus Stats */}
                <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Focus Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold">{formatTimer(timerSeconds)}</div>
                      <div className="text-sm opacity-80 mt-1">
                        {timerMode === 'focus' ? 'Focus Session' :
                         timerMode === 'short_break' ? 'Short Break' : 'Long Break'}
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setTimerActive(!timerActive)}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {timerActive ? 'Pause' : 'Start'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={resetTimer}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-2 bg-white/10 rounded-lg">
                        <div className="text-xl font-bold">{pomodoroCount}</div>
                        <div className="text-xs opacity-80">Pomodoros</div>
                      </div>
                      <div className="text-center p-2 bg-white/10 rounded-lg">
                        <div className="text-xl font-bold">{Math.floor(stats.focusMinutesToday / 60)}h</div>
                        <div className="text-xs opacity-80">Focus Time</div>
                      </div>
                      <div className="text-center p-2 bg-white/10 rounded-lg">
                        <div className="text-xl font-bold">{stats.streakDays}</div>
                        <div className="text-xs opacity-80">Day Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Projects */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FolderKanban className="w-4 h-4" />
                      Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {projects.slice(0, 5).map(project => (
                      <Button
                        key={project.id}
                        variant="ghost"
                        className="w-full justify-between h-9"
                        onClick={() => { setSelectedProject(project.id); setActiveTab('projects') }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{project.taskCount}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Labels */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Labels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {labels.map(label => (
                      <Badge
                        key={label.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{ borderColor: label.color, color: label.color }}
                        onClick={() => { setSelectedLabel(label.name); setActiveTab('labels') }}
                      >
                        @{label.name} ({label.taskCount})
                      </Badge>
                    ))}
                  </CardContent>
                </Card>

                {/* Productivity Insights */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Productivity Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">Peak Performance</p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        You're most productive at {stats.topProductiveHour}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Weekly Average</p>
                      <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                        {stats.averageTasksPerDay} tasks completed per day
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-400">On-Time Rate</p>
                      <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                        {stats.onTimeCompletionRate}% of tasks completed on time
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Project List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">All Projects</h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {projects.map(project => (
                  <Card
                    key={project.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedProject === project.id
                        ? 'ring-2 ring-amber-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: project.color }} />
                        <span className="font-medium">{project.name}</span>
                        {project.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        {project.isShared && <Users className="w-3 h-3 text-blue-500" />}
                      </div>
                      <span className="text-sm text-muted-foreground">{project.taskCount}</span>
                    </div>
                    <Progress
                      value={(project.completedCount / project.taskCount) * 100}
                      className="h-1 mt-2"
                    />
                  </Card>
                ))}
              </div>

              {/* Project Tasks */}
              <div className="lg:col-span-3">
                {selectedProject ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: projects.find(p => p.id === selectedProject)?.color }}
                          />
                          <CardTitle>{projects.find(p => p.id === selectedProject)?.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Layers className="w-4 h-4" /> Add Section
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Plus className="w-4 h-4" /> Add Task
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {projects.find(p => p.id === selectedProject)?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {filteredTasks.filter(t => t.projectId === selectedProject).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No tasks in this project</p>
                        </div>
                      ) : (
                        filteredTasks.filter(t => t.projectId === selectedProject).map(task => renderTaskItem(task, false))
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Select a project</p>
                      <p className="text-sm">Choose a project from the list to view its tasks</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Labels Tab */}
          <TabsContent value="labels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Label List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">All Labels</h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {labels.map(label => (
                  <Card
                    key={label.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedLabel === label.name
                        ? 'ring-2 ring-amber-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedLabel(label.name === selectedLabel ? null : label.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" style={{ color: label.color }} />
                        <span className="font-medium">@{label.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{label.taskCount}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Label Tasks */}
              <div className="lg:col-span-3">
                {selectedLabel ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag
                          className="w-5 h-5"
                          style={{ color: labels.find(l => l.name === selectedLabel)?.color }}
                        />
                        @{selectedLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {filteredTasks.filter(t => t.labels.includes(selectedLabel)).map(task => renderTaskItem(task))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Select a label</p>
                      <p className="text-sm">Choose a label from the list to view its tasks</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map(filter => (
                <Card key={filter.id} className="cursor-pointer hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="w-4 h-4" style={{ color: filter.color }} />
                        {filter.name}
                      </CardTitle>
                      <Badge variant="secondary">{filter.taskCount}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {filter.query}
                    </code>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <CardContent className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                  <Plus className="w-8 h-8 mb-2" />
                  <span>Create Filter</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calendar View</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Today</Button>
                    <Button variant="ghost" size="sm">Week</Button>
                    <Button variant="ghost" size="sm">Month</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-100 dark:bg-gray-800 p-3 text-center text-sm font-medium">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayNum = i - 3 // Offset for starting day
                    const isToday = dayNum === new Date().getDate()
                    const dayTasks = tasks.filter(t => {
                      if (!t.dueDate) return false
                      const d = new Date(t.dueDate).getDate()
                      return d === dayNum
                    })

                    return (
                      <div
                        key={i}
                        className={`bg-white dark:bg-gray-900 min-h-[100px] p-2 ${
                          isToday ? 'ring-2 ring-amber-500 ring-inset' : ''
                        }`}
                      >
                        <div className={`text-sm mb-1 ${
                          dayNum > 0 && dayNum <= 31 ? '' : 'text-gray-300 dark:text-gray-700'
                        } ${isToday ? 'font-bold text-amber-600' : ''}`}>
                          {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                        </div>
                        {dayTasks.slice(0, 3).map(task => (
                          <div
                            key={task.id}
                            className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80"
                            style={{ backgroundColor: `${task.projectColor}20`, color: task.projectColor }}
                            onClick={() => openTaskDetail(task)}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} more</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Productivity Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const height = [65, 80, 45, 90, 75, 30, 20][i]
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-md transition-all"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{day}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-blue-500" />
                    Tasks by Project
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </span>
                        <span className="text-muted-foreground">
                          {project.completedCount}/{project.taskCount}
                        </span>
                      </div>
                      <Progress value={(project.completedCount / project.taskCount) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Time Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{stats.focusMinutesToday}</div>
                      <div className="text-sm text-purple-600/80">Focus Minutes Today</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{pomodoroCount}</div>
                      <div className="text-sm text-blue-600/80">Pomodoros Today</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{stats.topProductiveHour}</div>
                      <div className="text-sm text-green-600/80">Peak Hour</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-amber-600">{stats.streakDays}</div>
                      <div className="text-sm text-amber-600/80">Day Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
                        <Flame className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="text-xs font-medium">14 Day Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-xs font-medium">100 Tasks Done</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                        <Timer className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-xs font-medium">50 Focus Hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Task Detail Dialog */}
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <button onClick={() => selectedTask && toggleTaskComplete(selectedTask.id)}>
                  {selectedTask?.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className={`w-6 h-6 ${
                      selectedTask?.priority === 'p1' ? 'text-red-400' :
                      selectedTask?.priority === 'p2' ? 'text-orange-400' :
                      selectedTask?.priority === 'p3' ? 'text-blue-400' : 'text-gray-300'
                    }`} />
                  )}
                </button>
                <DialogTitle className={selectedTask?.status === 'completed' ? 'line-through text-gray-500' : ''}>
                  {selectedTask?.title}
                </DialogTitle>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-3">
                  {selectedTask?.projectName && (
                    <Badge variant="outline" className="gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTask.projectColor }} />
                      {selectedTask.projectName}
                    </Badge>
                  )}
                  <Badge className={getPriorityColor(selectedTask?.priority || 'p4')}>
                    {getPriorityIcon(selectedTask?.priority || 'p4')}
                    Priority {selectedTask?.priority?.toUpperCase()}
                  </Badge>
                  {getDueLabel(selectedTask?.dueDate) && (
                    <Badge variant="outline" className={getDueLabel(selectedTask?.dueDate)?.color}>
                      {getDueLabel(selectedTask?.dueDate)?.icon}
                      {getDueLabel(selectedTask?.dueDate)?.label}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {selectedTask?.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </div>
                )}

                {/* Sub-tasks */}
                {selectedTask && selectedTask.subTasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Sub-tasks ({selectedTask.subTasks.filter(st => st.completed).length}/{selectedTask.subTasks.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedTask.subTasks.map(st => (
                        <div key={st.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={st.completed}
                            onCheckedChange={() => toggleSubTask(selectedTask.id, st.id)}
                          />
                          <span className={st.completed ? 'line-through text-muted-foreground' : ''}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Labels */}
                {selectedTask && selectedTask.labels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.labels.map(label => {
                        const labelData = labels.find(l => l.name === label)
                        return (
                          <Badge
                            key={label}
                            variant="outline"
                            style={{ borderColor: labelData?.color, color: labelData?.color }}
                          >
                            @{label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {selectedTask && selectedTask.comments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Comments ({selectedTask.comments.length})</h4>
                    <div className="space-y-3">
                      {selectedTask.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.userAvatar} />
                            <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Comment */}
                <div>
                  <Textarea placeholder="Add a comment..." className="min-h-[80px]" />
                  <div className="flex justify-end mt-2">
                    <Button size="sm">Post Comment</Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Move className="w-4 h-4" /> Move
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Copy className="w-4 h-4" /> Duplicate
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Archive className="w-4 h-4" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
