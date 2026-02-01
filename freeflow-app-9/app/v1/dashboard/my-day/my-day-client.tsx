'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { useMyDayTasks, useFocusSessions, type MyDayTask, type FocusSession } from '@/lib/hooks/use-my-day'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Target,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  FolderKanban,
  Plus,
  Search,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Timer,
  Sun,
  Sunrise,
  Star,
  Minus,
  Edit3,
  Trash2,
  Copy,
  Archive,
  Settings,
  TrendingUp,
  Flame,
  Zap,
  Award,
  Brain,
  Download,
  FileText,
  CalendarPlus,
  Share2,
  AlertTriangle,
  Video,
  Bell,
  Keyboard
} from 'lucide-react'

// Types for internal use
type TaskPriority = 'p1' | 'p2' | 'p3' | 'p4'
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

interface InternalTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId?: string
  projectName?: string
  projectColor?: string
  labels: string[]
  dueDate?: string
  dueTime?: string
  estimatedMinutes?: number
  actualMinutes?: number
  isStarred: boolean
  createdAt: string
  completedAt?: string
}

interface MyDayClientProps {
  initialTasks?: MyDayTask[]
  initialSessions?: FocusSession[]
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

const mapDbPriorityToInternal = (dbPriority: string): TaskPriority => {
  switch (dbPriority) {
    case 'urgent': return 'p1'
    case 'high': return 'p2'
    case 'medium': return 'p3'
    case 'low': return 'p4'
    default: return 'p3'
  }
}

const mapInternalPriorityToDb = (priority: TaskPriority): 'low' | 'medium' | 'high' | 'urgent' => {
  switch (priority) {
    case 'p1': return 'urgent'
    case 'p2': return 'high'
    case 'p3': return 'medium'
    case 'p4': return 'low'
    default: return 'medium'
  }
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

// ============================================================================
// REAL FILE EXPORT UTILITIES
// ============================================================================

/**
 * Downloads a file using the Blob/URL.createObjectURL pattern
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports tasks to CSV format
 */
const exportTasksToCSV = (tasks: InternalTask[]): string => {
  const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Due Time', 'Estimated Minutes', 'Labels', 'Created At', 'Completed At']
  const rows = tasks.map(task => [
    task.id,
    `"${(task.title || '').replace(/"/g, '""')}"`,
    `"${(task.description || '').replace(/"/g, '""')}"`,
    task.status,
    task.priority,
    task.dueDate || '',
    task.dueTime || '',
    task.estimatedMinutes?.toString() || '',
    `"${task.labels.join(', ')}"`,
    task.createdAt,
    task.completedAt || ''
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Exports tasks to JSON format
 */
const exportTasksToJSON = (tasks: InternalTask[]): string => {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    tasks: tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      estimatedMinutes: task.estimatedMinutes,
      labels: task.labels,
      isStarred: task.isStarred,
      createdAt: task.createdAt,
      completedAt: task.completedAt
    }))
  }, null, 2)
}

/**
 * Generates an ICS calendar file for a single task/event
 */
const generateICSFile = (event: {
  title: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
}): string => {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@kazi-app`
  const now = new Date()

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kazi App//My Day//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(event.endDate)}`,
    `SUMMARY:${event.title.replace(/[,;]/g, '')}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n').replace(/[,;]/g, '')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')
}

/**
 * Generates ICS calendar file for multiple tasks
 */
const generateMultiEventICS = (tasks: InternalTask[]): string => {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const now = new Date()
  const events = tasks
    .filter(task => task.dueDate)
    .map(task => {
      const startDate = new Date(task.dueDate!)
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':').map(Number)
        startDate.setHours(hours, minutes, 0, 0)
      } else {
        startDate.setHours(9, 0, 0, 0)
      }

      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + (task.estimatedMinutes || 60))

      const uid = `${task.id}-${Date.now()}@kazi-app`

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${task.title.replace(/[,;]/g, '')}`,
        task.description ? `DESCRIPTION:${task.description.replace(/\n/g, '\\n').replace(/[,;]/g, '')}` : '',
        `STATUS:${task.status === 'completed' ? 'CANCELLED' : 'CONFIRMED'}`,
        'END:VEVENT'
      ].filter(Boolean).join('\r\n')
    })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kazi App//My Day//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n')
}

/**
 * Exports focus sessions to CSV
 */
const exportFocusSessionsToCSV = (sessions: FocusSession[]): string => {
  const headers = ['ID', 'Task ID', 'Session Type', 'Start Time', 'End Time', 'Duration (minutes)', 'Notes']
  const rows = sessions.map(session => [
    session.id,
    session.task_id || '',
    session.session_type,
    session.start_time,
    session.end_time || '',
    session.duration_minutes?.toString() || '',
    `"${(session.notes || '').replace(/"/g, '""')}"`
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Generates a productivity report in Markdown format
 */
const generateProductivityReport = (
  tasks: InternalTask[],
  sessions: FocusSession[],
  stats: { total: number; completed: number; pending: number; highPriority: number }
): string => {
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const totalFocusMinutes = sessions
    .filter(s => s.session_type === 'focus' && s.duration_minutes)
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `# Productivity Report - ${today}

## Summary
- **Total Tasks:** ${stats.total}
- **Completed:** ${stats.completed}
- **Pending:** ${stats.pending}
- **Completion Rate:** ${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
- **High Priority Tasks:** ${stats.highPriority}
- **Total Focus Time:** ${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m

## Completed Tasks
${completedTasks.length > 0
  ? completedTasks.map(t => `- [x] ${t.title}${t.completedAt ? ` (completed: ${new Date(t.completedAt).toLocaleString()})` : ''}`).join('\n')
  : '- No tasks completed yet'}

## Pending Tasks
${pendingTasks.length > 0
  ? pendingTasks.map(t => `- [ ] ${t.title}${t.dueDate ? ` (due: ${t.dueDate})` : ''} [${t.priority}]`).join('\n')
  : '- All tasks completed!'}

## Focus Sessions Today
${sessions.length > 0
  ? sessions.map(s => `- ${s.session_type}: ${s.duration_minutes || 0} minutes${s.notes ? ` - ${s.notes}` : ''}`).join('\n')
  : '- No focus sessions recorded'}

---
*Generated by Kazi App - My Day Dashboard*
`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MyDayClient({ initialTasks = [], initialSessions = [] }: MyDayClientProps) {
  // Supabase hooks for real data
  const {
    tasks: dbTasks,
    stats: dbStats,
    isLoading,
    createTask: dbCreateTask,
    updateTask: dbUpdateTask,
    completeTask: dbCompleteTask,
    deleteTask: dbDeleteTask,
    fetchTasks
  } = useMyDayTasks(initialTasks)

  const {
    sessions: dbSessions,
    activeSession,
    totalFocusMinutes,
    startSession,
    endSession,
    fetchTodaySessions
  } = useFocusSessions(initialSessions)

  // Map DB tasks to internal format
  const tasks: InternalTask[] = useMemo(() => {
    return dbTasks.map((t: MyDayTask) => ({
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      status: t.status as TaskStatus,
      priority: mapDbPriorityToInternal(t.priority),
      projectId: t.project_id || undefined,
      labels: t.tags || [],
      dueDate: t.due_date || undefined,
      dueTime: t.due_time || undefined,
      estimatedMinutes: t.estimated_minutes || undefined,
      actualMinutes: t.actual_minutes || undefined,
      isStarred: false,
      createdAt: t.created_at,
      completedAt: t.completed_at || undefined
    }))
  }, [dbTasks])

  // UI State
  const [activeTab, setActiveTab] = useState('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<InternalTask | null>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)

  // Timer state
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  // Dialog states
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showScheduleMeetingDialog, setShowScheduleMeetingDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false)
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false)

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('p3')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskDueTime, setNewTaskDueTime] = useState('')
  const [newTaskEstimatedMinutes, setNewTaskEstimatedMinutes] = useState('60')

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingDuration, setMeetingDuration] = useState('30')

  const [editedTaskTitle, setEditedTaskTitle] = useState('')
  const [editedTaskDescription, setEditedTaskDescription] = useState('')
  const [editedTaskPriority, setEditedTaskPriority] = useState<TaskPriority>('p3')

  // Settings state
  const [settingsFocusDuration, setSettingsFocusDuration] = useState('25')

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
        // End focus session in database
        if (activeSession) {
          endSession().catch(console.error)
        }
        // Auto switch to break
        if ((pomodoroCount + 1) % 4 === 0) {
          setTimerMode('long_break')
          setTimerSeconds(15 * 60)
        } else {
          setTimerMode('short_break')
          setTimerSeconds(5 * 60)
        }
        toast.success('Focus session completed! Time for a break.')
      } else {
        setTimerMode('focus')
        setTimerSeconds(parseInt(settingsFocusDuration) * 60)
        toast.info('Break time over. Ready for another focus session?')
      }
    }
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds, timerMode, pomodoroCount, activeSession, endSession, settingsFocusDuration])

  // Load data on mount
  useEffect(() => {
    fetchTasks().catch(console.error)
    fetchTodaySessions().catch(console.error)
  }, [fetchTasks, fetchTodaySessions])

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetTimer = () => {
    setTimerActive(false)
    setTimerMode('focus')
    setTimerSeconds(parseInt(settingsFocusDuration) * 60)
    if (activeSession) {
      endSession().catch(console.error)
    }
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
    if (!searchQuery) return tasks
    const query = searchQuery.toLowerCase()
    return tasks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.labels.some(l => l.toLowerCase().includes(query))
    )
  }, [tasks, searchQuery])

  // ============================================================================
  // REAL ACTION HANDLERS
  // ============================================================================

  const handleToggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      if (task.status === 'completed') {
        await dbUpdateTask(taskId, { status: 'pending', completed_at: null })
        toast.success('Task reopened')
      } else {
        await dbCompleteTask(taskId)
        toast.success('Task completed!')
      }
    } catch (error) {
      toast.error('Failed to update task')
      console.error(error)
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Task title is required')
      return
    }

    try {
      await dbCreateTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        priority: mapInternalPriorityToDb(newTaskPriority),
        status: 'pending',
        due_date: newTaskDueDate || null,
        due_time: newTaskDueTime || null,
        estimated_minutes: parseInt(newTaskEstimatedMinutes) || null,
        tags: []
      })

      setShowAddTaskDialog(false)
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPriority('p3')
      setNewTaskDueDate('')
      setNewTaskDueTime('')
      setNewTaskEstimatedMinutes('60')
      toast.success('Task created successfully')
    } catch (error) {
      toast.error('Failed to create task')
      console.error(error)
    }
  }

  const handleScheduleMeeting = async () => {
    if (!meetingTitle.trim()) {
      toast.error('Meeting title is required')
      return
    }

    try {
      // Create task for the meeting
      await dbCreateTask({
        title: meetingTitle.trim(),
        description: `Meeting scheduled for ${meetingDate} at ${meetingTime}`,
        priority: 'high',
        status: 'pending',
        due_date: meetingDate || null,
        due_time: meetingTime || null,
        estimated_minutes: parseInt(meetingDuration) || 30,
        category: 'meeting',
        tags: ['meeting']
      })

      // Generate and download ICS file
      const startDate = new Date(meetingDate)
      if (meetingTime) {
        const [hours, minutes] = meetingTime.split(':').map(Number)
        startDate.setHours(hours, minutes, 0, 0)
      }
      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + parseInt(meetingDuration))

      const icsContent = generateICSFile({
        title: meetingTitle,
        startDate,
        endDate
      })

      downloadFile(icsContent, `meeting-${meetingTitle.toLowerCase().replace(/\s+/g, '-')}.ics`, 'text/calendar')

      setShowScheduleMeetingDialog(false)
      setMeetingTitle('')
      setMeetingDate('')
      setMeetingTime('')
      setMeetingDuration('30')
      toast.success('Meeting scheduled and calendar file downloaded')
    } catch (error) {
      toast.error('Failed to schedule meeting')
      console.error(error)
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask || !editedTaskTitle.trim()) {
      toast.error('Task title is required')
      return
    }

    try {
      await dbUpdateTask(selectedTask.id, {
        title: editedTaskTitle.trim(),
        description: editedTaskDescription.trim() || null,
        priority: mapInternalPriorityToDb(editedTaskPriority)
      })

      setShowEditTaskDialog(false)
      setShowTaskDialog(false)
      setSelectedTask(null)
      toast.success('Task updated successfully')
    } catch (error) {
      toast.error('Failed to update task')
      console.error(error)
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return

    try {
      await dbDeleteTask(selectedTask.id)
      setShowDeleteTaskDialog(false)
      setShowTaskDialog(false)
      setSelectedTask(null)
      toast.success('Task deleted')
    } catch (error) {
      toast.error('Failed to delete task')
      console.error(error)
    }
  }

  const handleDuplicateTask = async () => {
    if (!selectedTask) return

    try {
      await dbCreateTask({
        title: `${selectedTask.title} (Copy)`,
        description: selectedTask.description || null,
        priority: mapInternalPriorityToDb(selectedTask.priority),
        status: 'pending',
        due_date: selectedTask.dueDate || null,
        due_time: selectedTask.dueTime || null,
        estimated_minutes: selectedTask.estimatedMinutes || null,
        tags: selectedTask.labels
      })
      toast.success('Task duplicated')
    } catch (error) {
      toast.error('Failed to duplicate task')
      console.error(error)
    }
  }

  const handleStartFocusSession = async (taskId?: string) => {
    try {
      await startSession(taskId, 'focus')
      setActiveTaskId(taskId || null)
      setTimerMode('focus')
      setTimerSeconds(parseInt(settingsFocusDuration) * 60)
      setTimerActive(true)
      toast.success('Focus session started')
    } catch (error) {
      toast.error('Failed to start focus session')
      console.error(error)
    }
  }

  // ============================================================================
  // EXPORT HANDLERS - REAL FILE GENERATION
  // ============================================================================

  const handleExportTasksCSV = () => {
    const csvContent = exportTasksToCSV(tasks)
    const today = new Date().toISOString().split('T')[0]
    downloadFile(csvContent, `tasks-export-${today}.csv`, 'text/csv')
    toast.success('Tasks exported to CSV')
    setShowExportDialog(false)
  }

  const handleExportTasksJSON = () => {
    const jsonContent = exportTasksToJSON(tasks)
    const today = new Date().toISOString().split('T')[0]
    downloadFile(jsonContent, `tasks-export-${today}.json`, 'application/json')
    toast.success('Tasks exported to JSON')
    setShowExportDialog(false)
  }

  const handleExportCalendar = () => {
    const tasksWithDates = tasks.filter(t => t.dueDate)
    if (tasksWithDates.length === 0) {
      toast.error('No tasks with due dates to export')
      return
    }
    const icsContent = generateMultiEventICS(tasks)
    const today = new Date().toISOString().split('T')[0]
    downloadFile(icsContent, `calendar-export-${today}.ics`, 'text/calendar')
    toast.success('Calendar exported to ICS')
    setShowExportDialog(false)
  }

  const handleExportFocusSessions = () => {
    const csvContent = exportFocusSessionsToCSV(dbSessions)
    const today = new Date().toISOString().split('T')[0]
    downloadFile(csvContent, `focus-sessions-${today}.csv`, 'text/csv')
    toast.success('Focus sessions exported')
    setShowExportDialog(false)
  }

  const handleGenerateReport = () => {
    const reportContent = generateProductivityReport(tasks, dbSessions, dbStats)
    const today = new Date().toISOString().split('T')[0]
    downloadFile(reportContent, `productivity-report-${today}.md`, 'text/markdown')
    toast.success('Productivity report generated')
    setShowExportDialog(false)
  }

  const handleAddToCalendar = (task: InternalTask) => {
    if (!task.dueDate) {
      toast.error('Task has no due date')
      return
    }

    const startDate = new Date(task.dueDate)
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number)
      startDate.setHours(hours, minutes, 0, 0)
    } else {
      startDate.setHours(9, 0, 0, 0)
    }
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + (task.estimatedMinutes || 60))

    const icsContent = generateICSFile({
      title: task.title,
      description: task.description,
      startDate,
      endDate
    })

    downloadFile(icsContent, `${task.title.toLowerCase().replace(/\s+/g, '-')}.ics`, 'text/calendar')
    toast.success('Calendar event downloaded')
  }

  const openTaskDetail = (task: InternalTask) => {
    setSelectedTask(task)
    setShowTaskDialog(true)
  }

  const openEditDialog = () => {
    if (selectedTask) {
      setEditedTaskTitle(selectedTask.title)
      setEditedTaskDescription(selectedTask.description || '')
      setEditedTaskPriority(selectedTask.priority)
      setShowEditTaskDialog(true)
    }
  }

  // Stats
  const statCards = [
    { label: 'Today', value: todayTasks.length, icon: Sun, color: 'from-amber-500 to-orange-600' },
    { label: 'Overdue', value: overdueTasks.length, icon: Clock, color: 'from-red-500 to-rose-600' },
    { label: 'Completed', value: completedToday.length, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
    { label: 'Focus Time', value: `${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`, icon: Timer, color: 'from-purple-500 to-violet-600' },
    { label: 'Pomodoros', value: pomodoroCount, icon: Flame, color: 'from-orange-500 to-red-600' },
    { label: 'Upcoming', value: upcomingTasks.length, icon: Calendar, color: 'from-blue-500 to-indigo-600' }
  ]

  // Render task item
  const renderTaskItem = (task: InternalTask) => {
    const dueLabel = getDueLabel(task.dueDate)

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
            onClick={(e) => { e.stopPropagation(); handleToggleTaskComplete(task.id) }}
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
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>

              {dueLabel && (
                <span className={`flex items-center gap-1 text-xs ${dueLabel.color}`}>
                  {dueLabel.icon}
                  {dueLabel.label}
                  {task.dueTime && ` ${task.dueTime}`}
                </span>
              )}

              {task.estimatedMinutes && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Timer className="w-3 h-3" />
                  {task.estimatedMinutes}m
                </span>
              )}
            </div>

            {task.labels.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {task.labels.slice(0, 3).map(label => (
                  <span
                    key={label}
                    className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    @{label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {task.status !== 'completed' && task.dueDate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => { e.stopPropagation(); handleAddToCalendar(task) }}
                title="Add to calendar"
              >
                <CalendarPlus className="w-4 h-4" />
              </Button>
            )}

            {task.status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => { e.stopPropagation(); handleStartFocusSession(task.id) }}
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
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
                  onClick={() => {
                    if (!timerActive && !activeSession) {
                      handleStartFocusSession()
                    } else {
                      setTimerActive(!timerActive)
                    }
                  }}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={resetTimer}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant="outline" className="text-xs">
                {pomodoroCount}
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

            <Button variant="ghost" size="icon" onClick={() => setShowExportDialog(true)}>
              <Download className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="w-5 h-5" />
            </Button>

            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              onClick={() => {
                setNewTaskDueDate(new Date().toISOString().split('T')[0])
                setShowAddTaskDialog(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setMeetingDate(new Date().toISOString().split('T')[0])
                setMeetingTime('09:00')
                setShowScheduleMeetingDialog(true)
              }}
            >
              <Video className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="today" className="gap-2">
              <Sun className="w-4 h-4" />
              Today
              <Badge variant="secondary" className="ml-1">{todayTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <FolderKanban className="w-4 h-4" />
              All Tasks
              <Badge variant="secondary" className="ml-1">{tasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="focus" className="gap-2">
              <Brain className="w-4 h-4" />
              Focus
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
                        <AlertTriangle className="w-5 h-5" />
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
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowAddTaskDialog(true)}>
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
                        onClick={() => {
                          if (!timerActive && !activeSession) {
                            handleStartFocusSession()
                          } else {
                            setTimerActive(!timerActive)
                          }
                        }}
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
                        <div className="text-xl font-bold">{Math.floor(totalFocusMinutes / 60)}h</div>
                        <div className="text-xs opacity-80">Focus Time</div>
                      </div>
                      <div className="text-center p-2 bg-white/10 rounded-lg">
                        <div className="text-xl font-bold">{dbStats.completed}</div>
                        <div className="text-xs opacity-80">Done</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Upcoming ({upcomingTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {upcomingTasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => openTaskDetail(task)}
                      >
                        <span className="text-sm truncate flex-1">{task.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {task.dueDate && new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowAddTaskDialog(true)}>
                      <Plus className="w-4 h-4" /> Add Task
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowScheduleMeetingDialog(true)}>
                      <Video className="w-4 h-4" /> Schedule Meeting
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowExportDialog(true)}>
                      <Download className="w-4 h-4" /> Export Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* All Tasks Tab */}
          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
                <CardDescription>View and manage all your tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No tasks found</p>
                    <p className="text-sm">Create your first task to get started</p>
                  </div>
                ) : (
                  filteredTasks.map(task => renderTaskItem(task))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Focus Tab */}
          <TabsContent value="focus" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-6 h-6" />
                    Focus Session
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Deep work mode for maximum productivity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2">{formatTimer(timerSeconds)}</div>
                    <div className="text-purple-100">
                      {timerMode === 'focus' ? 'Focus Session' :
                        timerMode === 'short_break' ? 'Short Break' : 'Long Break'}
                    </div>
                  </div>

                  <Progress
                    value={(1 - timerSeconds / (parseInt(settingsFocusDuration) * 60)) * 100}
                    className="h-2 bg-white/20"
                  />

                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={() => {
                        if (!timerActive && !activeSession) {
                          handleStartFocusSession()
                        } else {
                          setTimerActive(!timerActive)
                        }
                      }}
                      className="bg-white text-purple-600 hover:bg-purple-50"
                    >
                      {timerActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      {timerActive ? 'Pause' : 'Start Focus'}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={resetTimer}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Focus Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-600">{pomodoroCount}</div>
                      <div className="text-sm text-purple-600/80">Pomodoros Today</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
                      </div>
                      <div className="text-sm text-blue-600/80">Total Focus Time</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">{dbStats.completed}</div>
                      <div className="text-sm text-green-600/80">Tasks Completed</div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                      <div className="text-3xl font-bold text-amber-600">
                        {dbStats.total > 0 ? Math.round((dbStats.completed / dbStats.total) * 100) : 0}%
                      </div>
                      <div className="text-sm text-amber-600/80">Completion Rate</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Recent Focus Sessions</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dbSessions.slice(0, 5).map(session => (
                        <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm">{session.session_type}</span>
                          <span className="text-xs text-muted-foreground">
                            {session.duration_minutes ? `${session.duration_minutes}m` : 'In progress'}
                          </span>
                        </div>
                      ))}
                      {dbSessions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No focus sessions yet. Start one above!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Task Detail Dialog */}
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <button onClick={() => selectedTask && handleToggleTaskComplete(selectedTask.id)}>
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
                  <Badge className={getPriorityColor(selectedTask?.priority || 'p4')}>
                    Priority {selectedTask?.priority?.toUpperCase()}
                  </Badge>
                  {getDueLabel(selectedTask?.dueDate) && (
                    <Badge variant="outline" className={getDueLabel(selectedTask?.dueDate)?.color}>
                      {getDueLabel(selectedTask?.dueDate)?.icon}
                      {getDueLabel(selectedTask?.dueDate)?.label}
                    </Badge>
                  )}
                  {selectedTask?.estimatedMinutes && (
                    <Badge variant="outline">
                      <Timer className="w-3 h-3 mr-1" />
                      {selectedTask.estimatedMinutes}m
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

                {/* Labels */}
                {selectedTask && selectedTask.labels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.labels.map(label => (
                        <Badge key={label} variant="outline">@{label}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={openEditDialog}>
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleDuplicateTask}>
                  <Copy className="w-4 h-4" /> Duplicate
                </Button>
                {selectedTask?.dueDate && (
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => selectedTask && handleAddToCalendar(selectedTask)}>
                    <CalendarPlus className="w-4 h-4" /> Add to Calendar
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-500 hover:text-red-600"
                  onClick={() => setShowDeleteTaskDialog(true)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Add New Task
              </DialogTitle>
              <DialogDescription>Create a new task with priority and due date.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Description (optional)</Label>
                <Textarea
                  id="task-description"
                  placeholder="Add more details..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p1"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-red-500" /> Urgent</span></SelectItem>
                      <SelectItem value="p2"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-orange-500" /> High</span></SelectItem>
                      <SelectItem value="p3"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-blue-500" /> Medium</span></SelectItem>
                      <SelectItem value="p4"><span className="flex items-center gap-2"><Minus className="w-3 h-3 text-gray-400" /> Low</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due">Due Date</Label>
                  <Input
                    id="task-due"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-time">Due Time (optional)</Label>
                  <Input
                    id="task-time"
                    type="time"
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-duration">Estimated Minutes</Label>
                  <Select value={newTaskEstimatedMinutes} onValueChange={setNewTaskEstimatedMinutes}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Meeting Dialog */}
        <Dialog open={showScheduleMeetingDialog} onOpenChange={setShowScheduleMeetingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Schedule Meeting
              </DialogTitle>
              <DialogDescription>Schedule a meeting and download calendar invite.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input
                  id="meeting-title"
                  placeholder="Enter meeting title..."
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-date">Date</Label>
                  <Input
                    id="meeting-date"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting-time">Time</Label>
                  <Input
                    id="meeting-time"
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-duration">Duration</Label>
                <Select value={meetingDuration} onValueChange={setMeetingDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleMeetingDialog(false)}>Cancel</Button>
              <Button onClick={handleScheduleMeeting}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Schedule & Download ICS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-500" />
                Export Data
              </DialogTitle>
              <DialogDescription>Download your tasks and focus sessions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleExportTasksCSV}>
                <FileText className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">Export Tasks (CSV)</div>
                  <div className="text-xs text-muted-foreground">Spreadsheet-compatible format</div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleExportTasksJSON}>
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Export Tasks (JSON)</div>
                  <div className="text-xs text-muted-foreground">Developer-friendly format</div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleExportCalendar}>
                <Calendar className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Export Calendar (ICS)</div>
                  <div className="text-xs text-muted-foreground">Import to any calendar app</div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleExportFocusSessions}>
                <Timer className="w-5 h-5 text-orange-500" />
                <div className="text-left">
                  <div className="font-medium">Export Focus Sessions (CSV)</div>
                  <div className="text-xs text-muted-foreground">Track your productivity history</div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleGenerateReport}>
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <div className="text-left">
                  <div className="font-medium">Generate Report (Markdown)</div>
                  <div className="text-xs text-muted-foreground">Daily productivity summary</div>
                </div>
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                Edit Task
              </DialogTitle>
              <DialogDescription>Update task details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-title">Task Title</Label>
                <Input
                  id="edit-task-title"
                  value={editedTaskTitle}
                  onChange={(e) => setEditedTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  value={editedTaskDescription}
                  onChange={(e) => setEditedTaskDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select value={editedTaskPriority} onValueChange={(v) => setEditedTaskPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p1"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-red-500" /> Urgent</span></SelectItem>
                    <SelectItem value="p2"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-orange-500" /> High</span></SelectItem>
                    <SelectItem value="p3"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-blue-500" /> Medium</span></SelectItem>
                    <SelectItem value="p4"><span className="flex items-center gap-2"><Minus className="w-3 h-3 text-gray-400" /> Low</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditTaskDialog(false)}>Cancel</Button>
              <Button onClick={handleEditTask}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Task Dialog */}
        <Dialog open={showDeleteTaskDialog} onOpenChange={setShowDeleteTaskDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Delete Task
              </DialogTitle>
              <DialogDescription>Are you sure you want to delete "{selectedTask?.title}"?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                This action cannot be undone. The task will be permanently deleted.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteTaskDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteTask}>Delete</Button>
            </DialogFooter>
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
              <DialogDescription>Customize your My Day experience.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Focus Mode Duration</p>
                  <p className="text-sm text-muted-foreground">Default pomodoro length</p>
                </div>
                <Select value={settingsFocusDuration} onValueChange={setSettingsFocusDuration}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setTimerSeconds(parseInt(settingsFocusDuration) * 60)
                setShowSettingsDialog(false)
                toast.success('Settings saved')
              }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
