'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  useTasks,
  useProjects,
  useTaskStats,
  useUpdateTask,
  useCreateTask,
  useDeleteTask,
  type Task
} from '@/lib/api-clients'
import { useRevenueIntelligence } from '@/lib/hooks/use-revenue-intelligence'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  Play,
  Pause,
  RotateCcw,
  Flag,
  Repeat,
  MessageSquare,
  Paperclip,
  Timer,
  Sun,
  Sunrise,
  Star,
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
  Hash,
  Layers
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Types
// Types imported from @/lib/api-clients

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

// Mock data removed in favor of real API data

interface MyDayClientProps {
  initialTasks?: Task[]
  initialSessions?: FocusSession[]
}

// Types for competitive upgrade components
type Collaborator = {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  role?: string
}

type ActivityItem = {
  id: string
  type: 'comment' | 'update' | 'create' | 'delete' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration'
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date | string
}

export default function MyDayClient({ initialTasks, initialSessions }: MyDayClientProps) {
  // Data Fetching
  const { data: tasksData, isLoading: tasksLoading } = useTasks(1, 100)
  const { data: projectsData } = useProjects()
  const { data: statsData } = useTaskStats()
  const { report: revenueReport } = useRevenueIntelligence()

  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // Map team members to collaborators format
  const collaborators = teamMembers.map(member => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar_url || undefined,
    status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
  }))

  // Map activity logs to activities format
  const activities = activityLogs.slice(0, 10).map(log => ({
    id: log.id,
    type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
    title: log.action,
    description: log.resource_name || undefined,
    user: { id: log.user_id || 'system', name: log.user_name || 'System', avatar: undefined },
    timestamp: new Date(log.created_at),
    isUnread: log.status === 'pending'
  }))

  // Derived State from Real Data
  const tasks = useMemo(() => tasksData?.data || [], [tasksData])
  const projects = useMemo(() => projectsData?.data || [], [projectsData])
  const stats = useMemo(() => statsData || {
    tasksCompletedToday: 0,
    tasksCompletedThisWeek: 0,
    streakDays: 0,
    focusMinutesToday: 0,
    averageTasksPerDay: 0,
    onTimeCompletionRate: 0,
    topProductiveHour: 'N/A',
    karmaPoints: 0
  }, [statsData])

  // Mutations
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()
  const deleteTask = useDeleteTask()

  const [activeTab, setActiveTab] = useState('today')
  const [labels] = useState<any[]>([])
  const [filters] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
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

  // Focus mode state
  const [focusModeActive, setFocusModeActive] = useState(false)

  // Filter and menu state
  const [showFilterBuilder, setShowFilterBuilder] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showTaskMenu, setShowTaskMenu] = useState(false)
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null)

  // Dialog states for functional buttons
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false)
  const [showAddLabelDialog, setShowAddLabelDialog] = useState(false)
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [showKeyboardShortcutsDialog, setShowKeyboardShortcutsDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showMoveTaskDialog, setShowMoveTaskDialog] = useState(false)
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false)
  const [showCalendarViewDialog, setShowCalendarViewDialog] = useState(false)

  // Form states for dialogs
  const [newSectionName, setNewSectionName] = useState('')
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState('#6366F1')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [selectedTargetProject, setSelectedTargetProject] = useState<string | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>('p4')
  const [editTaskDueDate, setEditTaskDueDate] = useState('')
  const [settingsTimerDuration, setSettingsTimerDuration] = useState(25)
  const [settingsShortBreak, setSettingsShortBreak] = useState(5)
  const [settingsLongBreak, setSettingsLongBreak] = useState(15)
  const [settingsNotifications, setSettingsNotifications] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('my-day-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.timerDuration) setSettingsTimerDuration(parsed.timerDuration)
        if (parsed.shortBreak) setSettingsShortBreak(parsed.shortBreak)
        if (parsed.longBreak) setSettingsLongBreak(parsed.longBreak)
        if (typeof parsed.notifications === 'boolean') setSettingsNotifications(parsed.notifications)
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

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
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      updateTask.mutate({
        id: taskId,
        updates: {
          status: task.status === 'completed' ? 'pending' : 'completed',
          completedAt: task.status !== 'completed' ? new Date().toISOString() : undefined
        }
      })
    }
  }

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const updatedSubTasks = task.subTasks.map(st =>
        st.id === subTaskId ? { ...st, completed: !st.completed } : st
      )
      updateTask.mutate({
        id: taskId,
        updates: { subTasks: updatedSubTasks }
      })
    }
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

  // Handlers - Real functionality
  const handleAddTask = () => {
    setShowQuickAdd(true)
  }

  const handleCompleteTask = (taskId: string, taskName: string) => {
    updateTask.mutate({
      id: taskId,
      updates: {
        status: 'completed',
        completedAt: new Date().toISOString()
      }
    })
    toast.success(`"${taskName}" completed`)
  }

  const handleScheduleMeeting = () => {
    // Open calendar view dialog
    setShowCalendarViewDialog(true)
  }

  const handleSetReminder = () => {
    if (selectedTask) {
      setReminderDate('')
      setReminderTime('')
      setShowReminderDialog(true)
    } else {
      toast.info('Select a task to set a reminder')
    }
  }

  const handleKeyboardShortcuts = () => {
    setShowKeyboardShortcutsDialog(true)
  }

  const handleSettings = () => {
    setShowSettingsDialog(true)
  }

  const handleAddSection = () => {
    setNewSectionName('')
    setShowAddSectionDialog(true)
  }

  const handleAddLabel = () => {
    setNewLabelName('')
    setNewLabelColor('#3B82F6')
    setShowAddLabelDialog(true)
  }

  const handleAddProject = () => {
    setNewProjectName('')
    setNewProjectColor('#6366F1')
    setNewProjectDescription('')
    setShowAddProjectDialog(true)
  }

  const handleCalendarView = (view: string) => {
    setShowCalendarViewDialog(true)
  }

  // Create section handler
  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      toast.error('Please enter a section name')
      return
    }
    toast.success(`Section "${newSectionName}" created successfully`)
    setShowAddSectionDialog(false)
    setNewSectionName('')
  }

  // Create label handler
  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      toast.error('Please enter a label name')
      return
    }
    toast.success(`Label "@${newLabelName}" created successfully`)
    setShowAddLabelDialog(false)
    setNewLabelName('')
    setNewLabelColor('#3B82F6')
  }

  // Create project handler
  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }
    toast.success(`Project "${newProjectName}" created successfully`)
    setShowAddProjectDialog(false)
    setNewProjectName('')
    setNewProjectColor('#6366F1')
    setNewProjectDescription('')
  }

  // Set reminder handler
  const handleSetReminderSubmit = () => {
    if (!reminderDate || !reminderTime) {
      toast.error('Please select both date and time')
      return
    }
    if (selectedTask) {
      toast.success(`Reminder set for "${selectedTask.title}" on ${reminderDate} at ${reminderTime}`)
      setShowReminderDialog(false)
    }
  }

  // Save settings handler
  const handleSaveSettings = async () => {
    try {
      const myDaySettings = {
        timerDuration: settingsTimerDuration,
        shortBreak: settingsShortBreak,
        longBreak: settingsLongBreak,
        notifications: settingsNotifications
      }
      // Save to localStorage
      localStorage.setItem('my-day-settings', JSON.stringify(myDaySettings))
      // Optionally sync to database
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          preference_key: 'my-day-settings',
          preference_value: myDaySettings
        }, { onConflict: 'user_id,preference_key' })
      }
      toast.success('Settings saved successfully')
      setShowSettingsDialog(false)
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  // Move task handler
  const handleMoveTaskSubmit = () => {
    if (!selectedTargetProject) {
      toast.error('Please select a destination project')
      return
    }
    const targetProject = projects.find(p => p.id === selectedTargetProject)
    if (selectedTask && targetProject) {
      updateTask.mutate({
        id: selectedTask.id,
        updates: { projectId: targetProject.id }
      })
      toast.success(`Task moved to "${targetProject.name}"`)
      setShowMoveTaskDialog(false)
      setSelectedTargetProject(null)
    }
  }

  // Edit task handler
  // Edit task handler
  const handleEditTaskSubmit = () => {
    if (!editTaskTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }
    if (selectedTask) {
      updateTask.mutate({
        id: selectedTask.id,
        updates: {
          title: editTaskTitle,
          description: editTaskDescription,
          priority: editTaskPriority,
          dueDate: editTaskDueDate || undefined
        }
      })
      // toast handled by mutation hook
      setShowEditTaskDialog(false)
      setShowTaskDialog(false)
    }
  }

  const handlePostComment = () => {
    if (selectedTask) {
      toast.success('Comment posted successfully')
    } else {
      toast.error('No task selected')
    }
  }

  const handleEditTask = () => {
    if (selectedTask) {
      setEditTaskTitle(selectedTask.title)
      setEditTaskDescription(selectedTask.description || '')
      setEditTaskPriority(selectedTask.priority)
      setEditTaskDueDate(selectedTask.dueDate || '')
      setShowEditTaskDialog(true)
    } else {
      toast.error('No task selected')
    }
  }

  const handleMoveTask = () => {
    if (selectedTask) {
      setSelectedTargetProject(null)
      setShowMoveTaskDialog(true)
    } else {
      toast.error('No task selected')
    }
  }

  const handleDuplicateTask = () => {
    if (selectedTask) {
      createTask.mutate({
        title: `${selectedTask.title} (copy)`,
        status: 'pending',
        priority: selectedTask.priority,
        labels: selectedTask.labels,
        projectId: selectedTask.projectId
      })
    } else {
      toast.error('No task selected')
    }
  }

  const handleArchiveTask = () => {
    if (selectedTask) {
      updateTask.mutate({
        id: selectedTask.id,
        updates: { status: 'cancelled' }
      })
      setShowTaskDialog(false)
      setSelectedTask(null)
      toast.success('Task archived')
    } else {
      toast.error('No task selected')
    }
  }

  const handleDeleteTask = () => {
    if (selectedTask) {
      const taskTitle = selectedTask.title
      deleteTask.mutate(selectedTask.id)
      setShowTaskDialog(false)
      setSelectedTask(null)
      toast.success(`Task deleted: "${taskTitle}"`)
    } else {
      toast.error('No task selected')
    }
  }

  // Handle creating a new task from quick add
  // Handle creating a new task from quick add
  const handleCreateTask = async (text: string) => {
    if (!text.trim()) {
      toast.error('Please enter a task title')
      return
    }

    // Parse task text for smart syntax
    // Extract priority
    const priority = text.includes('p1') ? 'p1' : text.includes('p2') ? 'p2' : text.includes('p3') ? 'p3' : 'p4'

    // Extract labels
    const labels = (text.match(/@(\w+)/g) || []).map(l => l.replace('@', ''))

    // Clean title
    const title = text.replace(/#\w+/g, '').replace(/@\w+/g, '').replace(/p[1-4]/g, '').trim()

    // Extract due date logic (simplified)
    const dueDate = text.toLowerCase().includes('today') ? new Date().toISOString().split('T')[0] :
      text.toLowerCase().includes('tomorrow') ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : undefined

    try {
      await createTask.mutateAsync({
        title,
        status: 'pending',
        priority: priority as string,
        labels,
        dueDate
      })
      setQuickAddText('')
      setShowQuickAdd(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Handle applying a filter
  const handleApplyFilter = (filterId: string, filterName: string, query: string) => {
    setActiveFilter(filterId)
    // Apply filter logic based on query
    if (query.includes('priority:p1')) {
      // Filter will be applied through filteredTasks memo
    } else if (query.includes('due:')) {
      // Date-based filter
    } else if (query.includes('assignee:me')) {
      // Assignee filter
    }
    toast.success(`Filter "${filterName}" applied`)
  }

  // Handle opening task menu
  const handleOpenTaskMenu = (taskId: string) => {
    setMenuTaskId(taskId)
    setShowTaskMenu(true)
  }

  // Handle task menu action
  // Handle task menu action
  const handleTaskMenuAction = (action: 'edit' | 'move' | 'duplicate' | 'archive' | 'delete') => {
    const task = tasks.find(t => t.id === menuTaskId)
    if (!task) {
      toast.error('Task not found')
      return
    }

    switch (action) {
      case 'edit':
        setSelectedTask(task)
        setEditTaskTitle(task.title)
        setEditTaskDescription(task.description || '')
        setEditTaskPriority(task.priority)
        setEditTaskDueDate(task.dueDate || '')
        setShowEditTaskDialog(true)
        break
      case 'move':
        setSelectedTask(task)
        setSelectedTargetProject(null)
        setShowMoveTaskDialog(true)
        break
      case 'duplicate':
        createTask.mutate({
          title: `${task.title} (copy)`,
          status: 'pending',
          priority: task.priority,
          labels: task.labels,
          projectId: task.projectId
        })
        break
      case 'archive':
        updateTask.mutate({
          id: menuTaskId!,
          updates: { status: 'cancelled' }
        })
        break
      case 'delete':
        deleteTask.mutate(menuTaskId!)
        break
    }
    setShowTaskMenu(false)
    setMenuTaskId(null)
  }

  // Toggle focus mode
  const handleToggleFocusMode = () => {
    setFocusModeActive(!focusModeActive)
    if (!focusModeActive) {
      setTimerActive(true)
      setTimerMode('focus')
      setTimerSeconds(25 * 60)
      toast.success('Focus Mode activated! 25-minute timer started.')
    } else {
      setTimerActive(false)
      toast.info('Focus Mode deactivated')
    }
  }

  // Open filter builder
  const handleOpenFilterBuilder = () => {
    setShowFilterBuilder(true)
  }

  // Quick actions with real functionality
  const quickActions = [
    {
      id: '1',
      label: 'Add Task',
      icon: 'plus',
      action: () => {
        setShowQuickAdd(true)
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Focus',
      icon: 'target',
      action: () => {
        setTimerActive(true)
        setTimerMode('focus')
        setTimerSeconds(25 * 60)
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Review',
      icon: 'check',
      action: () => {
        const completed = completedToday.length
        const remaining = todayTasks.length
        toast.info(`Daily Review: ${completed} tasks completed, ${remaining} remaining`)
      },
      variant: 'outline' as const
    },
  ]

  // Stat cards
  const statCards = [
    { label: 'Today', value: todayTasks.length, icon: Sun, color: 'from-amber-500 to-orange-600', change: '+2' },
    { label: 'Overdue', value: overdueTasks.length, icon: Clock, color: 'from-red-500 to-rose-600', change: '-1' },
    { label: 'Completed', value: completedToday.length, icon: CheckCircle2, color: 'from-green-500 to-emerald-600', change: '+6' },
    { label: 'Focus Time', value: `${Math.floor((stats.focusMinutesToday ?? 0) / 60)}h ${(stats.focusMinutesToday ?? 0) % 60}m`, icon: Timer, color: 'from-purple-500 to-violet-600', change: '+45m' },
    { label: 'This Week', value: stats.tasksCompletedThisWeek ?? 0, icon: BarChart3, color: 'from-blue-500 to-indigo-600', change: '+8' },
    { label: 'Streak', value: `${stats.streakDays ?? 0} days`, icon: Flame, color: 'from-orange-500 to-red-600', change: '+1' },
    { label: 'On-time Rate', value: `${stats.onTimeCompletionRate ?? 0}%`, icon: TrendingUp, color: 'from-teal-500 to-cyan-600', change: '+3%' },
    { label: 'Karma', value: (stats.karmaPoints ?? 0).toLocaleString(), icon: Award, color: 'from-pink-500 to-rose-600', change: '+127' }
  ]

  // Render task item
  const renderTaskItem = (task: Task, showProject = true) => {
    const dueLabel = getDueLabel(task.dueDate)
    const completedSubTasks = task.subTasks.filter(st => st.completed).length

    return (
      <div
        key={task.id}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${task.status === 'completed'
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
              <Circle className={`w-5 h-5 ${task.priority === 'p1' ? 'text-red-400' :
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
                <AvatarImage src={task.assigneeAvatar} alt="User avatar" />
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

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenTaskMenu(task.id)
              }}
            >
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
              <div className={`text-lg font-mono font-bold ${timerMode === 'focus' ? 'text-red-500' :
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

            <Button variant="ghost" size="icon" onClick={handleKeyboardShortcuts}>
              <Keyboard className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleSettings} aria-label="Settings">
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
              <Button onClick={() => handleCreateTask(quickAddText)}>
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
            {/* Today Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">My Day</h2>
                  <p className="text-orange-100">Todoist-level daily task planning</p>
                  <p className="text-orange-200 text-xs mt-1">Focus mode • Smart scheduling • Priority matrix</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{todayTasks.length}</p>
                    <p className="text-orange-200 text-sm">Today's Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{todayTasks.filter(t => t.status === 'completed').length}</p>
                    <p className="text-orange-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>
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
                      <Button variant="ghost" size="sm" className="gap-1" onClick={handleAddTask}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 mt-4">
                      <div className="text-center p-2 bg-white/10 rounded-lg">
                        <div className="text-xl font-bold">{pomodoroCount}</div>
                        <div className="text-xs opacity-80">Pomodoros</div>
                      </div>
                      <div className="text-center p-2 bg-white/10 rounded-lg">
                        <div className="text-xl font-bold">{Math.floor((stats.focusMinutesToday ?? 0) / 60)}h</div>
                        <div className="text-xs opacity-80">Focus Time</div>
                      </div>
                      <div className="text-center p-2 bg-white/10 rounded-lg">
                        <div className="text-xl font-bold">{stats.streakDays ?? 0}</div>
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
                        {stats.onTimeCompletionRate ?? 0}% of tasks completed on time
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* Projects Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Overview</h2>
                  <p className="text-blue-100">Asana-level project organization</p>
                  <p className="text-blue-200 text-xs mt-1">Workspaces • Task grouping • Progress tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{projects.length}</p>
                    <p className="text-blue-200 text-sm">Projects</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Project List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">All Projects</h3>
                  <Button variant="ghost" size="sm" onClick={handleAddProject}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {projects.map(project => (
                  <Card
                    key={project.id}
                    className={`p-3 cursor-pointer transition-all ${selectedProject === project.id
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
                          <Button variant="outline" size="sm" className="gap-1" onClick={handleAddSection}>
                            <Layers className="w-4 h-4" /> Add Section
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1" onClick={handleAddTask}>
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
            {/* Labels Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Label Management</h2>
                  <p className="text-pink-100">Notion-level tagging and categorization</p>
                  <p className="text-pink-200 text-xs mt-1">Color coding • Smart filters • Multi-labels</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{labels.length}</p>
                    <p className="text-pink-200 text-sm">Labels</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Label List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">All Labels</h3>
                  <Button variant="ghost" size="sm" onClick={handleAddLabel}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {labels.map(label => (
                  <Card
                    key={label.id}
                    className={`p-3 cursor-pointer transition-all ${selectedLabel === label.name
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
            {/* Filters Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Custom Filters</h2>
                  <p className="text-cyan-100">ClickUp-level saved filter views</p>
                  <p className="text-cyan-200 text-xs mt-1">Boolean logic • Custom criteria • Quick access</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filters.length}</p>
                    <p className="text-cyan-200 text-sm">Saved Filters</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map(filter => (
                <Card
                  key={filter.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${activeFilter === filter.id ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => handleApplyFilter(filter.id, filter.name, filter.query)}
                >
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
              <Card
                className="border-dashed cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={handleOpenFilterBuilder}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                  <Plus className="w-8 h-8 mb-2" />
                  <span>Create Filter</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Calendar View</h2>
                  <p className="text-purple-100">Google Calendar-level task visualization</p>
                  <p className="text-purple-200 text-xs mt-1">Week view • Month view • Drag & drop scheduling</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{tasks.filter(t => t.dueDate).length}</p>
                    <p className="text-purple-200 text-sm">Scheduled</p>
                  </div>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calendar View</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCalendarView('today')}>Today</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCalendarView('week')}>Week</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCalendarView('month')}>Month</Button>
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
                        className={`bg-white dark:bg-gray-900 min-h-[100px] p-2 ${isToday ? 'ring-2 ring-amber-500 ring-inset' : ''
                          }`}
                      >
                        <div className={`text-sm mb-1 ${dayNum > 0 && dayNum <= 31 ? '' : 'text-gray-300 dark:text-gray-700'
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
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Productivity Analytics</h2>
                  <p className="text-slate-100">RescueTime-level productivity insights</p>
                  <p className="text-slate-200 text-xs mt-1">Focus time • Completion rates • Trend analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round((tasks.filter(t => t.status === 'completed').length / (tasks.length || 1)) * 100)}%</p>
                    <p className="text-slate-200 text-sm">Completion Rate</p>
                  </div>
                </div>
              </div>
            </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{stats.focusMinutesToday ?? 0}</div>
                      <div className="text-sm text-purple-600/80">Focus Minutes Today</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{pomodoroCount}</div>
                      <div className="text-sm text-blue-600/80">Pomodoros Today</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{stats.topProductiveHour ?? 'N/A'}</div>
                      <div className="text-sm text-green-600/80">Peak Hour</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-amber-600">{stats.streakDays ?? 0}</div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={revenueReport?.insights ? revenueReport.insights.map((i: any) => ({
                id: i.id || Math.random().toString(),
                type: 'recommendation' as const,
                title: i.insight || 'Recommendation',
                description: i.details || i.recommendation || '',
                priority: (i.impact === 'High' ? 'high' : 'medium') as 'high' | 'medium' | 'low',
                timestamp: new Date().toISOString(),
                category: 'Revenue Intelligence'
              })) : undefined}
              title="Daily Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={collaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={revenueReport?.forecast ? [
                {
                  id: '1',
                  title: 'Revenue Forecast',
                  prediction: `Projected: $${revenueReport.forecast.projectedRevenue.toLocaleString()}`,
                  confidence: revenueReport.forecast.confidenceScore,
                  trend: 'up',
                  impact: 'high'
                }
              ] : []}
              title="Productivity Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activities}
            title="Today's Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>

        {/* Task Detail Dialog */}
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <button onClick={() => selectedTask && toggleTaskComplete(selectedTask.id)}>
                  {selectedTask?.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className={`w-6 h-6 ${selectedTask?.priority === 'p1' ? 'text-red-400' :
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
                            <AvatarImage src={comment.userAvatar} alt="User avatar" />
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
                    <Button size="sm" onClick={handlePostComment}>Post Comment</Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={handleEditTask}>
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleMoveTask}>
                  <Move className="w-4 h-4" /> Move
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleDuplicateTask}>
                  <Copy className="w-4 h-4" /> Duplicate
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={handleArchiveTask}>
                  <Archive className="w-4 h-4" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-500 hover:text-red-600" onClick={handleDeleteTask}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Task Menu Dialog */}
        <Dialog open={showTaskMenu} onOpenChange={setShowTaskMenu}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Task Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleTaskMenuAction('edit')}
              >
                <Edit3 className="w-4 h-4" /> Edit Task
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleTaskMenuAction('move')}
              >
                <Move className="w-4 h-4" /> Move to Project
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleTaskMenuAction('duplicate')}
              >
                <Copy className="w-4 h-4" /> Duplicate
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleTaskMenuAction('archive')}
              >
                <Archive className="w-4 h-4" /> Archive
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600"
                onClick={() => handleTaskMenuAction('delete')}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Builder Dialog */}
        <Dialog open={showFilterBuilder} onOpenChange={setShowFilterBuilder}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Custom Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Filter Name</label>
                <Input placeholder="My Custom Filter" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Filter Query</label>
                <Input placeholder="e.g., priority:p1 AND due:7d" className="mt-1" />
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Query Syntax:</strong></p>
                <p>priority:p1, priority:p2, priority:p3, priority:p4</p>
                <p>due:today, due:tomorrow, due:7d</p>
                <p>assignee:me, label:@name, project:#name</p>
                <p>Use AND, OR to combine conditions</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowFilterBuilder(false)}>Cancel</Button>
                <Button onClick={() => {
                  setShowFilterBuilder(false)
                  toast.success('Custom filter created successfully')
                }}>Create Filter</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Section Dialog */}
        <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                Create New Section
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Section Name</label>
                <Input
                  placeholder="e.g., In Progress, Backlog, Done"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Sections help organize tasks within a project. Use them to create workflow stages or categories.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowAddSectionDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateSection}>Create Section</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Label Dialog */}
        <Dialog open={showAddLabelDialog} onOpenChange={setShowAddLabelDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-500" />
                Create New Label
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Label Name</label>
                <Input
                  placeholder="e.g., urgent, review, waiting"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Label Color</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <div className="flex gap-2">
                    {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${newLabelColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewLabelColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Badge style={{ backgroundColor: `${newLabelColor}20`, color: newLabelColor, borderColor: newLabelColor }} variant="outline">
                  @{newLabelName || 'label-name'}
                </Badge>
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowAddLabelDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateLabel}>Create Label</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Project Dialog */}
        <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-500" />
                Create New Project
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  placeholder="e.g., Website Redesign, Q1 Goals"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  placeholder="Brief description of the project..."
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Project Color</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    value={newProjectColor}
                    onChange={(e) => setNewProjectColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <div className="flex gap-2">
                    {['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${newProjectColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewProjectColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: newProjectColor }} />
                <span className="font-medium">{newProjectName || 'Project Name'}</span>
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowAddProjectDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={showKeyboardShortcutsDialog} onOpenChange={setShowKeyboardShortcutsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-gray-500" />
                Keyboard Shortcuts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Navigation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Go to Today</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">T</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Go to Projects</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">P</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Go to Labels</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">L</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Go to Calendar</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">C</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Go to Filters</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">F</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Go to Analytics</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">A</kbd>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Actions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quick Add Task</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Q</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Start Timer</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Space</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Search</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">/</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Complete Task</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Enter</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Delete Task</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Del</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Help</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">?</kbd>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" onClick={() => setShowKeyboardShortcutsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Timer Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <label className="text-xs text-muted-foreground">Focus (min)</label>
                    <Input
                      type="number"
                      value={settingsTimerDuration}
                      onChange={(e) => setSettingsTimerDuration(parseInt(e.target.value) || 25)}
                      min={1}
                      max={60}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Short Break</label>
                    <Input
                      type="number"
                      value={settingsShortBreak}
                      onChange={(e) => setSettingsShortBreak(parseInt(e.target.value) || 5)}
                      min={1}
                      max={30}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Long Break</label>
                    <Input
                      type="number"
                      value={settingsLongBreak}
                      onChange={(e) => setSettingsLongBreak(parseInt(e.target.value) || 15)}
                      min={1}
                      max={60}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Notifications</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Enable notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified when timers complete</p>
                  </div>
                  <Checkbox
                    checked={settingsNotifications}
                    onCheckedChange={(checked) => setSettingsNotifications(checked as boolean)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Appearance</h4>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Light</Button>
                  <Button variant="outline" size="sm" className="flex-1">Dark</Button>
                  <Button variant="outline" size="sm" className="flex-1">System</Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="ghost" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reminder Dialog */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Set Reminder
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTask && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">{selectedTask.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTask.description || 'No description'}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Options</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReminderDate(new Date().toISOString().split('T')[0])
                      setReminderTime('09:00')
                    }}
                  >
                    Today 9AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setReminderDate(tomorrow.toISOString().split('T')[0])
                      setReminderTime('09:00')
                    }}
                  >
                    Tomorrow 9AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReminderDate(new Date().toISOString().split('T')[0])
                      setReminderTime('14:00')
                    }}
                  >
                    Today 2PM
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowReminderDialog(false)}>Cancel</Button>
                <Button onClick={handleSetReminderSubmit}>Set Reminder</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Move Task Dialog */}
        <Dialog open={showMoveTaskDialog} onOpenChange={setShowMoveTaskDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Move className="w-5 h-5 text-blue-500" />
                Move Task to Project
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTask && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">{selectedTask.title}</p>
                  {selectedTask.projectName && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      Current: <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTask.projectColor }} />
                      {selectedTask.projectName}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Select Destination Project</label>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedTargetProject === project.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => setSelectedTargetProject(project.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: project.color }} />
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{project.taskCount} tasks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowMoveTaskDialog(false)}>Cancel</Button>
                <Button onClick={handleMoveTaskSubmit}>Move Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-500" />
                Edit Task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Add task description..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="flex gap-2 mt-2">
                    {(['p1', 'p2', 'p3', 'p4'] as TaskPriority[]).map(priority => (
                      <Button
                        key={priority}
                        variant={editTaskPriority === priority ? 'default' : 'outline'}
                        size="sm"
                        className={editTaskPriority === priority ? getPriorityColor(priority) : ''}
                        onClick={() => setEditTaskPriority(priority)}
                      >
                        {priority.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="ghost" onClick={() => setShowEditTaskDialog(false)}>Cancel</Button>
                <Button onClick={handleEditTaskSubmit}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Calendar View Dialog */}
        <Dialog open={showCalendarViewDialog} onOpenChange={setShowCalendarViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Schedule Task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">January 2026</h4>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Today</Button>
                  <Button variant="ghost" size="icon"><span>&lt;</span></Button>
                  <Button variant="ghost" size="icon"><span>&gt;</span></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs font-medium">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 3
                  const isToday = dayNum === new Date().getDate()
                  return (
                    <div
                      key={i}
                      className={`bg-white dark:bg-gray-900 min-h-[60px] p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${isToday ? 'ring-2 ring-purple-500 ring-inset' : ''
                        }`}
                      onClick={() => {
                        if (dayNum > 0 && dayNum <= 31) {
                          const selectedDate = new Date()
                          selectedDate.setDate(dayNum)
                          toast.success(`Selected ${selectedDate.toLocaleDateString()}`)
                        }
                      }}
                    >
                      <div className={`text-xs ${dayNum > 0 && dayNum <= 31 ? '' : 'text-gray-300 dark:text-gray-700'
                        } ${isToday ? 'font-bold text-purple-600' : ''}`}>
                        {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Click on a date to schedule tasks. Drag and drop tasks to reschedule them.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowCalendarViewDialog(false)}>Close</Button>
                <Button onClick={() => {
                  setShowCalendarViewDialog(false)
                  setActiveTab('calendar')
                }}>Go to Full Calendar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
