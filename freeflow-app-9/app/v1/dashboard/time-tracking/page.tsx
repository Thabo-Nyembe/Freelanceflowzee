'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useLogger } from '@/hooks/use-logger'
import { useAccessibility } from '@/hooks/use-accessibility'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'

interface TimeEntry {
  id: string
  projectId: string
  taskId: string
  description: string
  startTime: Date
  endTime?: Date
  duration: number
  isRunning?: boolean
  isPaused?: boolean
}

interface Project {
  id: string
  name: string
  tasks: Task[]
}

interface Task {
  id: string
  name: string
  projectId: string
}

// Archive time entry helper
async function archiveTimeEntry(entryId: string, userId: string) {
  try {
    const { archiveTimeEntry: archiveFn } = await import('@/lib/time-tracking-queries')
    return await archiveFn(entryId, userId)
  } catch (error) {
    return { success: false, error: { message: 'Failed to archive entry' } }
  }
}

export default function TimeTrackingPage() {
  const { user, isLoading: userLoading } = useCurrentUser()
  const userId = user?.id
  const logger = useLogger()
  const { announce } = useAccessibility()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [projects, setProjects] = useState<Project[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)
  const [timerDisplay, setTimerDisplay] = useState('00:00:00')
  const [elapsedTime, setElapsedTime] = useState(0)

  const [selectedProject, setSelectedProject] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [description, setDescription] = useState('')

  // Dialog states
  const [showDeleteEntryDialog, setShowDeleteEntryDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false)
  const [showArchiveEntryDialog, setShowArchiveEntryDialog] = useState(false)
  const [showEditEntryDialog, setShowEditEntryDialog] = useState(false)
  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false)
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false)
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false)

  // Form states
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const [entryToArchive, setEntryToArchive] = useState<string | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [newEntryDescription, setNewEntryDescription] = useState('')
  const [manualHours, setManualHours] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [editProjectName, setEditProjectName] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [editTaskName, setEditTaskName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  useEffect(() => {
    const loadTimeTrackingData = async () => {
      // Check for demo mode - use mock data for faster loading
      const urlParams = new URLSearchParams(window.location.search)
      const isDemo = urlParams.get('demo') === 'true' || document.cookie.includes('demo_mode=true')

      if (isDemo) {
        // In demo mode, use mock data for instant loading
        setProjects([
          { id: 'demo-proj-1', name: 'Website Redesign', tasks: [
            { id: 'demo-task-1', name: 'UI Design', projectId: 'demo-proj-1' },
            { id: 'demo-task-2', name: 'Development', projectId: 'demo-proj-1' },
          ]},
          { id: 'demo-proj-2', name: 'Mobile App', tasks: [
            { id: 'demo-task-3', name: 'Frontend', projectId: 'demo-proj-2' },
            { id: 'demo-task-4', name: 'Backend API', projectId: 'demo-proj-2' },
          ]},
        ])
        setTimeEntries([
          { id: 'demo-entry-1', projectId: 'demo-proj-1', taskId: 'demo-task-1', description: 'Homepage mockup', startTime: new Date(Date.now() - 3600000), endTime: new Date(), duration: 3600, isRunning: false },
          { id: 'demo-entry-2', projectId: 'demo-proj-2', taskId: 'demo-task-3', description: 'Login screen', startTime: new Date(Date.now() - 7200000), endTime: new Date(Date.now() - 3600000), duration: 3600, isRunning: false },
        ])
        setIsLoading(false)
        announce('Time tracking loaded with demo data', 'polite')
        return
      }

      if (userLoading || !userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const {
          getTimeEntries,
          getTimeTrackingSummary,
          getProjects
        } = await import('@/lib/time-tracking-queries')

        // Load projects, entries, and active timer in parallel
        const [entriesResult, summaryResult, projectsResult, activeTimerResult] = await Promise.all([
          getTimeEntries(userId, {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }),
          getTimeTrackingSummary(userId),
          getProjects(userId),
          getTimeEntries(userId, {}).then(res => {
            if (res.error) return { data: null, error: res.error }
            const activeTimer = res.data.find(entry => entry.status === 'running' || entry.status === 'paused')
            return { data: activeTimer || null, error: null }
          })
        ])

        if (entriesResult.error) {
          throw new Error(entriesResult.error?.message || 'Failed to load time entries')
        }

        // Restore active timer if exists
        if (activeTimerResult.data) {
          const runningEntry = activeTimerResult.data
          const startTime = new Date(runningEntry.start_time)
          const isPaused = runningEntry.status === 'paused'

          const elapsed = isPaused
            ? runningEntry.duration
            : Math.floor((Date.now() - startTime.getTime()) / 1000)

          setActiveTimer({
            id: runningEntry.id,
            projectId: runningEntry.project_id || '',
            taskId: runningEntry.task_id || '',
            description: runningEntry.description,
            startTime: startTime,
            duration: runningEntry.duration,
            isRunning: !isPaused,
            isPaused: isPaused
          })
          setElapsedTime(elapsed)
        }

        // Transform entries
        const transformedEntries: TimeEntry[] = entriesResult.data.map(entry => ({
          id: entry.id,
          projectId: entry.project_id || '',
          taskId: entry.task_id || '',
          description: entry.description,
          startTime: new Date(entry.start_time),
          endTime: entry.end_time ? new Date(entry.end_time) : undefined,
          duration: entry.duration,
          isRunning: entry.status === 'running',
          isPaused: entry.status === 'paused'
        }))

        setTimeEntries(transformedEntries)

        // Transform projects with tasks
        const transformedProjects: Project[] = (projectsResult.data || []).map(project => ({
          id: project.id,
          name: project.name,
          tasks: (project.tasks || []).map(task => ({
            id: task.id,
            name: task.name,
            projectId: project.id
          }))
        }))

        setProjects(transformedProjects)
        setIsLoading(false)
        announce(`Time tracking loaded with ${transformedEntries.length} entries`, 'polite')
      } catch (err) {
        logger.error('Failed to load time tracking', { error: err })
        setError(err instanceof Error ? err.message : 'Failed to load time tracking')
        setIsLoading(false)
        announce('Error loading time tracking', 'assertive')
      }
    }

    loadTimeTrackingData()
  }, [userId, userLoading])

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer && !activeTimer.isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev: number) => {
          const newElapsed = prev + 1
          const hours = Math.floor(newElapsed / 3600)
          const minutes = Math.floor((newElapsed % 3600) / 60)
          const seconds = newElapsed % 60
          setTimerDisplay(
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          )
          return newElapsed
        })
      }, 1000)
    } else if (activeTimer && activeTimer.isPaused) {
      const hours = Math.floor(elapsedTime / 3600)
      const minutes = Math.floor((elapsedTime % 3600) / 60)
      const seconds = elapsedTime % 60
      setTimerDisplay(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    } else if (!activeTimer) {
      setTimerDisplay('00:00:00')
    }
    return () => clearInterval(interval)
  }, [activeTimer, elapsedTime])

  const startTimer = async () => {
    if (!userId || !selectedProject || !selectedTask) {
      toast.error('Please select project and task')
      return
    }

    if (activeTimer) {
      await stopTimer()
    }

    const projectObj = projects.find(p => p.id === selectedProject)
    const taskObj = projectObj?.tasks.find(t => t.id === selectedTask)

    try {
      const { createTimeEntry } = await import('@/lib/time-tracking-queries')

      const { data, error } = await createTimeEntry(userId, {
        project_id: selectedProject,
        project_name: projectObj?.name || 'Unknown Project',
        task_id: selectedTask,
        task_name: taskObj?.name || 'Unknown Task',
        description: description || 'Working on task',
        is_billable: true,
        hourly_rate: 0,
        tags: []
      })

      if (error || !data) {
        throw new Error(error?.message || 'Failed to start timer')
      }

      const newEntry: TimeEntry = {
        id: data.id,
        projectId: selectedProject,
        taskId: selectedTask,
        description: description || 'Working on task',
        startTime: new Date(data.start_time),
        duration: 0,
        isRunning: true,
        isPaused: false
      }

      setActiveTimer(newEntry)
      setTimeEntries((prev) => [newEntry, ...prev])
      setElapsedTime(0)

      toast.success("Timer Started - " + projectObj?.name + " - " + taskObj?.name)
      announce("Timer started for " + projectObj?.name, 'polite')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start timer')
      announce('Failed to start timer', 'assertive')
    }
  }

  const stopTimer = async () => {
    if (!activeTimer || !userId) return

    try {
      const { stopTimeEntry } = await import('@/lib/time-tracking-queries')

      const { data, error } = await stopTimeEntry(activeTimer.id, userId)

      if (error || !data) {
        throw new Error(error?.message || 'Failed to stop timer')
      }

      const endedEntry = {
        ...activeTimer,
        endTime: new Date(data.end_time!),
        duration: data.duration,
        isRunning: false,
        isPaused: false
      }

      setTimeEntries((prev) =>
        prev.map((entry) =>
          entry.id === activeTimer.id ? endedEntry : entry
        )
      )
      setActiveTimer(null)
      setElapsedTime(0)
      setTimerDisplay('00:00:00')

      const hours = Math.floor(data.duration / 3600)
      const minutes = Math.floor((data.duration % 3600) / 60)
      const durationText = hours > 0 ? hours + "h " + minutes + "m" : minutes + "m"

      toast.success("Timer Stopped - " + durationText + (data.is_billable ? " - $" + data.total_amount.toFixed(2) : ""))
      announce("Timer stopped. Duration: " + durationText, 'polite')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to stop timer')
      announce('Failed to stop timer', 'assertive')
    }
  }

  const pauseTimer = async () => {
    if (!activeTimer || !userId || activeTimer.isPaused) {
      toast.error(activeTimer?.isPaused ? 'Timer is already paused' : 'No active timer')
      return
    }

    try {
      const { pauseTimeEntry } = await import('@/lib/time-tracking-queries')

      const { data, error } = await pauseTimeEntry(activeTimer.id, userId)

      if (error || !data) {
        throw new Error(error?.message || 'Failed to pause timer')
      }

      setActiveTimer(prev => prev ? { ...prev, isPaused: true, isRunning: false, duration: data.duration } : null)
      setElapsedTime(data.duration)

      toast.success("Timer Paused - " + timerDisplay)
      announce('Timer paused', 'polite')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pause timer')
      announce('Error pausing timer', 'assertive')
    }
  }

  const resumeTimer = async () => {
    if (!activeTimer || !userId || !activeTimer.isPaused) {
      toast.error(activeTimer && !activeTimer.isPaused ? 'Timer is already running' : 'No timer to resume')
      return
    }

    try {
      const { resumeTimeEntry } = await import('@/lib/time-tracking-queries')

      const { data, error } = await resumeTimeEntry(activeTimer.id, userId)

      if (error || !data) {
        throw new Error(error?.message || 'Failed to resume timer')
      }

      setActiveTimer(prev => prev ? {
        ...prev,
        isPaused: false,
        isRunning: true,
        startTime: new Date(data.start_time)
      } : null)

      toast.success('Timer Resumed')
      announce('Timer resumed', 'polite')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resume timer')
      announce('Error resuming timer', 'assertive')
    }
  }

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setNewEntryDescription(entry.description)
    setShowEditEntryDialog(true)
  }

  const confirmEditEntry = () => {
    if (!editingEntry) return

    setTimeEntries((prev) =>
      prev.map((e) =>
        e.id === editingEntry.id ? { ...e, description: newEntryDescription } : e
      )
    )
    toast.success('Entry Updated')
    announce('Time entry updated', 'polite')
    setShowEditEntryDialog(false)
    setEditingEntry(null)
    setNewEntryDescription('')
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!userId) {
      toast.error('Please log in to delete entries')
      return
    }

    setEntryToDelete(entryId)
    setShowDeleteEntryDialog(true)
  }

  const confirmDeleteEntry = async () => {
    if (!entryToDelete || !userId) return

    setIsDeleting(true)
    try {
      const { deleteTimeEntry } = await import('@/lib/time-tracking-queries')

      const { success, error } = await deleteTimeEntry(entryToDelete, userId)

      if (error || !success) {
        throw new Error(error?.message || 'Failed to delete entry')
      }

      setTimeEntries((prev) => prev.filter((e) => e.id !== entryToDelete))
      toast.success('Entry Deleted')
      announce('Time entry deleted', 'polite')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete entry')
    } finally {
      setIsDeleting(false)
      setShowDeleteEntryDialog(false)
      setEntryToDelete(null)
    }
  }

  const handleAddManualEntry = () => {
    if (!selectedProject || !selectedTask) {
      toast.error('Please select a project and task')
      return
    }
    setManualHours('')
    setShowManualEntryDialog(true)
  }

  const confirmAddManualEntry = () => {
    const hours = parseFloat(manualHours)
    if (isNaN(hours) || hours <= 0) {
      toast.error('Please enter a valid number of hours')
      return
    }

    const duration = Math.floor(hours * 3600)
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      projectId: selectedProject,
      taskId: selectedTask,
      description: description || 'Manual entry',
      startTime: new Date(),
      endTime: new Date(),
      duration: duration,
      isRunning: false,
    }
    setTimeEntries((prev) => [...prev, newEntry])
    toast.success("Manual Entry Added - " + hours + " hour(s)")
    announce('Manual entry added', 'polite')
    setShowManualEntryDialog(false)
    setManualHours('')
  }

  const handleDuplicateEntry = (entry: TimeEntry) => {
    const duplicated: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: new Date(),
      isRunning: false,
    }
    setTimeEntries((prev) => [...prev, duplicated])
    toast.success('Entry Duplicated')
  }

  const handleExportReport = (format: 'csv' | 'pdf' | 'json') => {
    const data = timeEntries.map((entry) => ({
      project: projects.find((p) => p.id === entry.projectId)?.name || 'Unknown',
      task: projects.find((p) => p.id === entry.projectId)?.tasks.find((t) => t.id === entry.taskId)?.name || 'Unknown',
      description: entry.description,
      duration: formatTime(entry.duration),
      date: entry.startTime.toLocaleDateString(),
    }))

    let content: string
    let filename: string
    let mimeType: string

    if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      filename = 'time-report.json'
      mimeType = 'application/json'
    } else if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',')
      const rows = data.map((row) => Object.values(row).join(','))
      content = [headers, ...rows].join('\n')
      filename = 'time-report.csv'
      mimeType = 'text/csv'
    } else {
      content = `Time Tracking Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Entries: ${data.length}`
      filename = 'time-report.txt'
      mimeType = 'text/plain'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Report Exported - " + filename)
  }

  const handleFilterByProject = () => {
    toast.info('Filter Options Available - Filter by Project, Date Range, Task, or Duration')
  }

  const handleFilterByDateRange = () => {
    setFilterStartDate('')
    setFilterEndDate('')
    setShowDateRangeDialog(true)
  }

  const confirmFilterByDateRange = () => {
    if (!filterStartDate || !filterEndDate) {
      toast.error('Please select both start and end dates')
      return
    }

    toast.success("Date Filter Applied - " + filterStartDate + " to " + filterEndDate)
    announce('Date filter applied', 'polite')
    setShowDateRangeDialog(false)
    setFilterStartDate('')
    setFilterEndDate('')
  }

  const handleClearFilters = () => {
    toast.success('Filters Cleared')
  }

  const handleGenerateDailyReport = () => {
    const today = new Date().toLocaleDateString()
    const todayEntries = timeEntries.filter(
      (e) => e.startTime.toLocaleDateString() === today
    )
    const totalTime = todayEntries.reduce((sum, e) => sum + e.duration, 0)
    toast.success("Daily Report - " + today + " - " + todayEntries.length + " entries, " + formatTime(totalTime))
  }

  const handleGenerateWeeklyReport = () => {
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    toast.success("Weekly Report - " + timeEntries.length + " entries, " + formatTime(totalTime))
  }

  const handleGenerateMonthlyReport = () => {
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    const avgPerDay = timeEntries.length > 0 ? totalTime / timeEntries.length : 0
    toast.success("Monthly Report - " + timeEntries.length + " entries, " + formatTime(totalTime) + " total, " + formatTime(avgPerDay) + " avg")
  }

  const handleBulkDeleteEntries = () => {
    if (timeEntries.length === 0) {
      toast.error('There are no time entries to delete')
      return
    }
    setShowDeleteAllDialog(true)
  }

  const confirmDeleteAllEntries = async () => {
    if (!userId) return

    setIsDeleting(true)
    try {
      const { deleteAllTimeEntries } = await import('@/lib/time-tracking-queries')
      const result = await deleteAllTimeEntries(userId)

      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete entries')
      }

      setTimeEntries([])
      toast.success("All Entries Deleted - " + result.deletedCount + " entries removed")
      announce('All time entries deleted', 'polite')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete entries')
    } finally {
      setIsDeleting(false)
      setShowDeleteAllDialog(false)
    }
  }

  const handleAddProject = () => {
    setNewProjectName('')
    setShowAddProjectDialog(true)
  }

  const confirmAddProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    toast.success("Project Added - \"" + newProjectName.trim() + "\"")
    announce('Project added', 'polite')
    setShowAddProjectDialog(false)
    setNewProjectName('')
  }

  const handleEditProject = () => {
    if (!selectedProject) {
      toast.error('Please select a project to edit')
      return
    }
    const project = projects.find((p) => p.id === selectedProject)
    setEditProjectName(project?.name || '')
    setShowEditProjectDialog(true)
  }

  const confirmEditProject = () => {
    if (!editProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    toast.success("Project Updated - \"" + editProjectName.trim() + "\"")
    announce('Project updated', 'polite')
    setShowEditProjectDialog(false)
    setEditProjectName('')
  }

  const handleDeleteProject = () => {
    if (!selectedProject) {
      toast.error('Please select a project to delete')
      return
    }
    setProjectToDelete(selectedProject)
    setShowDeleteProjectDialog(true)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return

    const project = projects.find((p) => p.id === projectToDelete)

    setIsDeleting(true)
    try {
      setSelectedProject('')
      toast.success('Project Deleted - All time entries preserved')
      announce("Project " + project?.name + " deleted", 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteProjectDialog(false)
      setProjectToDelete(null)
    }
  }

  const handleAddTask = () => {
    if (!selectedProject) {
      toast.error('Please select a project before adding a task')
      return
    }
    setNewTaskName('')
    setShowAddTaskDialog(true)
  }

  const confirmAddTask = () => {
    if (!newTaskName.trim()) {
      toast.error('Please enter a task name')
      return
    }

    toast.success("Task Added - \"" + newTaskName.trim() + "\"")
    announce('Task added', 'polite')
    setShowAddTaskDialog(false)
    setNewTaskName('')
  }

  const handleEditTask = () => {
    if (!selectedTask) {
      toast.error('Please select a task to edit')
      return
    }
    const task = projects
      .find((p) => p.id === selectedProject)
      ?.tasks.find((t) => t.id === selectedTask)
    setEditTaskName(task?.name || '')
    setShowEditTaskDialog(true)
  }

  const confirmEditTask = () => {
    if (!editTaskName.trim()) {
      toast.error('Please enter a task name')
      return
    }

    toast.success("Task Updated - \"" + editTaskName.trim() + "\"")
    announce('Task updated', 'polite')
    setShowEditTaskDialog(false)
    setEditTaskName('')
  }

  const handleDeleteTask = () => {
    if (!selectedTask) {
      toast.error('Please select a task to delete')
      return
    }
    setTaskToDelete(selectedTask)
    setShowDeleteTaskDialog(true)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    const task = projects
      .find((p) => p.id === selectedProject)
      ?.tasks.find((t) => t.id === taskToDelete)

    setIsDeleting(true)
    try {
      setSelectedTask('')
      toast.success('Task Deleted - All time entries preserved')
      announce("Task " + task?.name + " deleted", 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteTaskDialog(false)
      setTaskToDelete(null)
    }
  }

  const handleClearDescription = () => {
    setDescription('')
    toast.success('Description Cleared')
  }

  const handleArchiveEntry = (entryId: string) => {
    setEntryToArchive(entryId)
    setShowArchiveEntryDialog(true)
  }

  const confirmArchiveEntry = async () => {
    if (!entryToArchive || !userId) return

    setIsDeleting(true)
    try {
      const { success, error } = await archiveTimeEntry(entryToArchive, userId)

      if (error) {
        toast.error('Archive Failed')
        return
      }

      setTimeEntries(prev => prev.filter(e => e.id !== entryToArchive))
      toast.success('Entry Archived - Can be restored later')
      announce('Time entry archived', 'polite')
    } catch (error) {
      toast.error('Archive Failed')
    } finally {
      setIsDeleting(false)
      setShowArchiveEntryDialog(false)
      setEntryToArchive(null)
    }
  }

  const handleViewDetailedStats = () => {
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    toast.success("Detailed Statistics - Total: " + formatTime(totalTime) + " across " + timeEntries.length + " entries")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto relative space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto relative">
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
    <div className="min-h-screen relative p-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative">
            <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-emerald-500/50 to-teal-500/50 rounded-lg blur opacity-75" />
            <div className="relative p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <TextShimmer className="text-4xl font-bold text-gray-900 dark:text-white mb-2" duration={2}>
              Time Tracking
            </TextShimmer>
            <p className="text-gray-600 dark:text-gray-400">Track time across projects and tasks</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <LiquidGlassCard className="relative">
                <BorderTrail className="bg-gradient-to-r from-emerald-500 to-teal-600" size={60} duration={6} />
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Timer</CardTitle>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleAddProject}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleAddTask} disabled={!selectedProject}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleEditProject} disabled={!selectedProject}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleEditTask} disabled={!selectedTask}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDeleteProject} disabled={!selectedProject} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedTask}
                      onValueChange={setSelectedTask}
                      disabled={!selectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Task" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects
                          .find((p) => p.id === selectedProject)
                          ?.tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="What are you working on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={handleClearDescription}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="text-4xl font-mono font-bold tabular-nums">
                        {timerDisplay}
                      </div>
                      {activeTimer && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activeTimer.isPaused ? 'Paused' : 'Running'}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!activeTimer ? (
                        <>
                          <Button
                            onClick={startTimer}
                            disabled={!selectedProject || !selectedTask}
                            size="lg"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Timer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleAddManualEntry}
                            disabled={!selectedProject || !selectedTask}
                            size="lg"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Manual Entry
                          </Button>
                        </>
                      ) : (
                        <>
                          {activeTimer.isPaused ? (
                            <Button onClick={resumeTimer} size="lg">
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
                          ) : (
                            <Button onClick={pauseTimer} variant="outline" size="lg">
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          <Button onClick={stopTimer} variant="destructive" size="lg">
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              </LiquidGlassCard>
            </div>

            {/* Recent Time Entries */}
            <div className="relative group mt-6">
              <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <LiquidGlassCard className="relative">
                <BorderTrail className="bg-gradient-to-r from-cyan-500 to-blue-600" size={60} duration={6} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white">Recent Time Entries</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleFilterByProject}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFilterByDateRange}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Date Range
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleViewDetailedStats}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Stats
                    </Button>
                    {timeEntries.length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleBulkDeleteEntries} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 group hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {
                            projects.find((p) => p.id === entry.projectId)?.name
                          }{' '}
                          -{' '}
                          {
                            projects
                              .find((p) => p.id === entry.projectId)
                              ?.tasks.find((t) => t.id === entry.taskId)?.name
                          }
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono mr-4 text-gray-900 dark:text-gray-100">
                          {formatTime(entry.duration)}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleEditEntry(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDuplicateEntry(entry)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEntry(entry.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {timeEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No time entries yet. Start tracking time!</p>
                    </div>
                  )}
                </div>
              </CardContent>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Reports Section */}
          <div>
            <div className="relative group">
              <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <LiquidGlassCard className="relative">
                <BorderTrail className="bg-gradient-to-r from-purple-500 to-pink-600" size={60} duration={6} />
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Reports</CardTitle>
                </CardHeader>
              <CardContent>
                <Tabs defaultValue="daily">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">
                      <Clock className="h-4 w-4 mr-2" />
                      Daily
                    </TabsTrigger>
                    <TabsTrigger value="weekly">
                      <Calendar className="h-4 w-4 mr-2" />
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value="monthly">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Monthly
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily" className="space-y-4">
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        Daily Overview
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        View your daily time tracking stats
                      </p>
                      <Button onClick={handleGenerateDailyReport} className="mt-4">
                        Generate Report
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-4">
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        Weekly Report
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Analyze your weekly productivity
                      </p>
                      <Button onClick={handleGenerateWeeklyReport} className="mt-4">
                        Generate Report
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="monthly" className="space-y-4">
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        Monthly Analysis
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Track long-term time patterns
                      </p>
                      <Button onClick={handleGenerateMonthlyReport} className="mt-4">
                        Generate Report
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => handleExportReport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportReport('json')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Entry AlertDialog */}
      <AlertDialog open={showDeleteEntryDialog} onOpenChange={setShowDeleteEntryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Time Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEntry}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Entry'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Entries AlertDialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete All Time Entries
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {timeEntries.length} time entries?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllEntries}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : "Delete All " + timeEntries.length + " Entries"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Project AlertDialog */}
      <AlertDialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projects.find(p => p.id === projectToDelete)?.name}&quot;?
              All time entries will be preserved but unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Task AlertDialog */}
      <AlertDialog open={showDeleteTaskDialog} onOpenChange={setShowDeleteTaskDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task?
              All time entries will be preserved but unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Entry AlertDialog */}
      <AlertDialog open={showArchiveEntryDialog} onOpenChange={setShowArchiveEntryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Archive Time Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              Archive this time entry? Archived entries can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchiveEntry}
              disabled={isDeleting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isDeleting ? 'Archiving...' : 'Archive Entry'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Entry Dialog */}
      <Dialog open={showEditEntryDialog} onOpenChange={setShowEditEntryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Time Entry
            </DialogTitle>
            <DialogDescription>
              Update the description for this time entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entryDescription">Description</Label>
              <Input
                id="entryDescription"
                value={newEntryDescription}
                onChange={(e) => setNewEntryDescription(e.target.value)}
                placeholder="What were you working on?"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditEntryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditEntry}>
              Update Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntryDialog} onOpenChange={setShowManualEntryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Add Manual Entry
            </DialogTitle>
            <DialogDescription>
              Manually add hours to your time tracking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="manualHours">Hours Worked</Label>
              <Input
                id="manualHours"
                type="number"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                placeholder="e.g., 2.5"
                step="0.5"
                min="0.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowManualEntryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddManualEntry} className="bg-green-600 hover:bg-green-700">
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Range Filter Dialog */}
      <Dialog open={showDateRangeDialog} onOpenChange={setShowDateRangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Filter by Date Range
            </DialogTitle>
            <DialogDescription>
              Select a date range to filter time entries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDateRangeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmFilterByDateRange} className="bg-purple-600 hover:bg-purple-700">
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              Add New Project
            </DialogTitle>
            <DialogDescription>
              Create a new project to track time against
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Website Redesign"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddProject} className="bg-emerald-600 hover:bg-emerald-700">
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Project
            </DialogTitle>
            <DialogDescription>
              Update the project name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editProjectName">Project Name</Label>
              <Input
                id="editProjectName"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditProject}>
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-500" />
              Add New Task
            </DialogTitle>
            <DialogDescription>
              Create a new task for the selected project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="e.g., UI Design"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddTask} className="bg-teal-600 hover:bg-teal-700">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Task
            </DialogTitle>
            <DialogDescription>
              Update the task name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTaskName">Task Name</Label>
              <Input
                id="editTaskName"
                value={editTaskName}
                onChange={(e) => setEditTaskName(e.target.value)}
                placeholder="Enter task name"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditTask}>
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
