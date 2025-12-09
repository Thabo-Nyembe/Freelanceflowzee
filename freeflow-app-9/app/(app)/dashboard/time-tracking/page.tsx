'use client'

import { useState, useEffect } from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Clock, BarChart3, Calendar, FileText, Edit, Trash2, Plus, Copy, Download, Filter, RotateCcw, Square, AlertTriangle } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('TimeTracking')

interface TimeEntry {
  id: string
  projectId: string
  taskId: string
  description: string
  startTime: Date
  endTime?: Date
  duration: number
  isRunning: boolean
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

export default function TimeTrackingPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [description, setDescription] = useState<any>('')
  const [elapsedTime, setElapsedTime] = useState<any>(0)
  const [timerDisplay, setTimerDisplay] = useState('00:00:00')

  // AlertDialog states for confirmations
  const [showDeleteEntryDialog, setShowDeleteEntryDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false)
  const [showArchiveEntryDialog, setShowArchiveEntryDialog] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [entryToArchive, setEntryToArchive] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Dialog states for prompt() replacements
  const [showEditEntryDialog, setShowEditEntryDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [newEntryDescription, setNewEntryDescription] = useState('')

  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false)
  const [manualHours, setManualHours] = useState('')

  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false)
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)
  const [editProjectName, setEditProjectName] = useState('')

  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')

  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false)
  const [editTaskName, setEditTaskName] = useState('')

  // Mock data - replace with real data from your API
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      tasks: [
        { id: '1', name: 'UI Design', projectId: '1' },
        { id: '2', name: 'Frontend Development', projectId: '1' },
      ],
    },
    {
      id: '2',
      name: 'Mobile App',
      tasks: [
        { id: '3', name: 'Wireframes', projectId: '2' },
        { id: '4', name: 'User Testing', projectId: '2' },
      ],
    },
  ]

  // A+++ LOAD TIME TRACKING DATA
  useEffect(() => {
    const loadTimeTrackingData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        logger.info('Loading time tracking data from Supabase', { userId })

        // Dynamic import for code splitting
        const {
          getTimeEntries,
          getTimeTrackingSummary
        } = await import('@/lib/time-tracking-queries')

        // Load running/paused timer and recent entries in parallel
        // We need to check both running and paused status
        const [entriesResult, summaryResult, activeTimerResult] = await Promise.all([
          getTimeEntries(userId, {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 7 days
          }),
          getTimeTrackingSummary(userId),
          // Get any running or paused timer
          getTimeEntries(userId, {}).then(res => {
            if (res.error) return { data: null, error: res.error }
            // Find the most recent running or paused timer
            const activeTimer = res.data.find(entry => entry.status === 'running' || entry.status === 'paused')
            return { data: activeTimer || null, error: null }
          })
        ])

        const runningResult = activeTimerResult

        if (runningResult.error || entriesResult.error || summaryResult.error) {
          throw new Error('Failed to load time tracking data')
        }

        // Set running or paused timer if exists
        if (runningResult.data) {
          const runningEntry = runningResult.data
          const startTime = new Date(runningEntry.start_time)
          const isPaused = runningEntry.status === 'paused'

          // Calculate elapsed time
          let elapsed: number
          if (isPaused) {
            // If paused, use the stored duration
            elapsed = runningEntry.duration
          } else {
            // If running, calculate elapsed since start
            elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
          }

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

          logger.info('Timer restored', {
            entryId: runningEntry.id,
            elapsed: elapsed,
            status: isPaused ? 'paused' : 'running'
          })
        }

        // Transform and set time entries
        if (entriesResult.data.length > 0) {
          const transformedEntries = entriesResult.data.map(entry => ({
            id: entry.id,
            projectId: entry.project_id || '',
            taskId: entry.task_id || '',
            description: entry.description,
            startTime: new Date(entry.start_time),
            endTime: entry.end_time ? new Date(entry.end_time) : undefined,
            duration: entry.duration,
            isRunning: entry.status === 'running'
          }))

          setTimeEntries(transformedEntries)

          logger.info('Time entries loaded', {
            count: transformedEntries.length,
            totalHours: summaryResult.data?.total_hours || 0
          })
        }

        setIsLoading(false)
        announce(`Time tracking dashboard loaded with ${entriesResult.data.length} entries`, 'polite')
      } catch (err) {
        logger.error('Failed to load time tracking data', { error: err })
        setError(err instanceof Error ? err.message : 'Failed to load time tracking data')
        setIsLoading(false)
        announce('Error loading time tracking dashboard', 'assertive')
      }
    }

    loadTimeTrackingData()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer && !activeTimer.isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev: number) => {
          const newElapsed = prev + 1
          // Update display
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
      // Update display for paused timer
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = async () => {
    if (!selectedProject || !selectedTask) return

    if (!userId) {
      toast.error('Please log in to start timer')
      logger.warn('Start timer attempted without authentication')
      return
    }

    // Stop any existing timer first
    if (activeTimer) {
      await stopTimer()
    }

    const projectObj = projects.find(p => p.id === selectedProject)
    const taskObj = projectObj?.tasks.find(t => t.id === selectedTask)

    try {
      logger.info('Starting timer', {
        projectId: selectedProject,
        taskId: selectedTask,
        description
      })

      // Dynamic import for code splitting
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

      logger.info('Timer started successfully', { entryId: data.id })
      toast.success('Timer Started', {
        description: `Tracking time for ${projectObj?.name} - ${taskObj?.name}`
      })
      announce(`Timer started for ${projectObj?.name} - ${taskObj?.name}`, 'polite')
    } catch (error) {
      logger.error('Failed to start timer', { error })
      toast.error('Failed to Start Timer', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
      announce('Failed to start timer', 'assertive')
    }
  }

  const stopTimer = async () => {
    if (!activeTimer) return

    if (!userId) {
      toast.error('Please log in to stop timer')
      logger.warn('Stop timer attempted without authentication')
      return
    }

    try {
      logger.info('Stopping timer', { entryId: activeTimer.id, duration: elapsedTime })

      // Dynamic import for code splitting
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
      const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

      logger.info('Timer stopped successfully', {
        entryId: data.id,
        duration: data.duration,
        durationText
      })

      toast.success('Timer Stopped', {
        description: `Duration: ${durationText}${data.is_billable ? ` • $${data.total_amount.toFixed(2)}` : ''}`
      })
      announce(`Timer stopped. Duration: ${durationText}`, 'polite')
    } catch (error) {
      logger.error('Failed to stop timer', { error })
      toast.error('Failed to Stop Timer', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
      announce('Failed to stop timer', 'assertive')
    }
  }

  const pauseTimer = async () => {
    if (!activeTimer || !userId) {
      toast.error('No active timer')
      logger.warn('Pause timer attempted without active timer')
      return
    }

    if (activeTimer.isPaused) {
      toast.info('Timer is already paused')
      return
    }

    try {
      logger.info('Pausing timer', { timerId: activeTimer.id, elapsed: elapsedTime })

      // Dynamic import for code splitting
      const { pauseTimeEntry } = await import('@/lib/time-tracking-queries')

      const { data, error } = await pauseTimeEntry(activeTimer.id, userId)

      if (error || !data) {
        throw new Error(error?.message || 'Failed to pause timer')
      }

      setActiveTimer(prev => prev ? { ...prev, isPaused: true, isRunning: false, duration: data.duration } : null)
      setElapsedTime(data.duration)

      toast.info('Timer Paused', {
        description: `Elapsed: ${timerDisplay}`
      })
      announce('Timer paused', 'polite')

      logger.info('Timer paused successfully', { timerId: activeTimer.id, elapsed: data.duration })

    } catch (err) {
      logger.error('Unexpected error pausing timer', { error: err })
      toast.error('Failed to Pause Timer', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
      announce('Error pausing timer', 'assertive')
    }
  }

  const resumeTimer = async () => {
    if (!activeTimer || !userId) {
      toast.error('No timer to resume')
      logger.warn('Resume timer attempted without paused timer')
      return
    }

    if (!activeTimer.isPaused) {
      toast.info('Timer is already running')
      return
    }

    try {
      logger.info('Resuming timer', { timerId: activeTimer.id })

      // Dynamic import for code splitting
      const { resumeTimeEntry } = await import('@/lib/time-tracking-queries')

      const { data, error } = await resumeTimeEntry(activeTimer.id, userId)

      if (error || !data) {
        throw new Error(error?.message || 'Failed to resume timer')
      }

      setActiveTimer(prev => prev ? {
        ...prev,
        isPaused: false,
        isRunning: true,
        startTime: new Date(data.start_time) // Use the new start time from database
      } : null)

      toast.info('Timer Resumed', {
        description: 'Continue tracking time'
      })
      announce('Timer resumed', 'polite')

      logger.info('Timer resumed successfully', { timerId: activeTimer.id })

    } catch (err) {
      logger.error('Unexpected error resuming timer', { error: err })
      toast.error('Failed to Resume Timer', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
      announce('Error resuming timer', 'assertive')
    }
  }

  const handleEditEntry = (entry: TimeEntry) => {
    logger.info('Edit entry initiated', {
      entryId: entry.id,
      currentDescription: entry.description
    })
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
    logger.info('Entry updated successfully', {
      entryId: editingEntry.id,
      newDescription: newEntryDescription
    })
    toast.success('Entry Updated', {
      description: 'Time entry description has been updated successfully'
    })
    announce('Time entry updated', 'polite')
    setShowEditEntryDialog(false)
    setEditingEntry(null)
    setNewEntryDescription('')
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!userId) {
      toast.error('Please log in to delete entries')
      logger.warn('Delete entry attempted without authentication')
      return
    }

    logger.info('Delete entry initiated', { entryId })
    setEntryToDelete(entryId)
    setShowDeleteEntryDialog(true)
  }

  const confirmDeleteEntry = async () => {
    if (!entryToDelete || !userId) return

    setIsDeleting(true)
    try {
      // Dynamic import for code splitting
      const { deleteTimeEntry } = await import('@/lib/time-tracking-queries')

      const { success, error } = await deleteTimeEntry(entryToDelete, userId)

      if (error || !success) {
        throw new Error(error?.message || 'Failed to delete entry')
      }

      setTimeEntries((prev) => prev.filter((e) => e.id !== entryToDelete))
      logger.info('Entry deleted successfully', {
        entryId: entryToDelete,
        remainingEntries: timeEntries.length - 1
      })
      toast.success('Entry Deleted', {
        description: 'Time entry has been permanently removed from your records'
      })
      announce('Time entry deleted', 'polite')
    } catch (error) {
      logger.error('Failed to delete entry', { error, entryId: entryToDelete })
      toast.error('Failed to Delete Entry', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteEntryDialog(false)
      setEntryToDelete(null)
    }
  }

  const handleAddManualEntry = () => {
    logger.info('Manual entry initiated', {
      projectSelected: !!selectedProject,
      taskSelected: !!selectedTask
    })
    if (!selectedProject || !selectedTask) {
      logger.warn('Missing project or task selection')
      toast.error('Selection Required', {
        description: 'Please select a project and task before adding a manual entry'
      })
      return
    }
    setManualHours('')
    setShowManualEntryDialog(true)
  }

  const confirmAddManualEntry = () => {
    const hours = parseFloat(manualHours)
    if (isNaN(hours) || hours <= 0) {
      toast.error('Invalid Hours', { description: 'Please enter a valid number of hours' })
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
    logger.info('Manual entry added successfully', {
      duration: hours + ' hour(s)',
      totalEntries: timeEntries.length + 1
    })
    toast.success('Manual Entry Added', {
      description: 'Added ' + hours + ' hour(s) to your time tracking records'
    })
    announce('Manual entry added', 'polite')
    setShowManualEntryDialog(false)
    setManualHours('')
  }

  const handleDuplicateEntry = (entry: TimeEntry) => {
    logger.info('Duplicate entry initiated', {
      sourceEntryId: entry.id,
      duration: formatTime(entry.duration)
    })
    const duplicated: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: new Date(),
      isRunning: false,
    }
    setTimeEntries((prev) => [...prev, duplicated])
    logger.info('Entry duplicated successfully', {
      newEntryId: duplicated.id,
      totalEntries: timeEntries.length + 1
    })
    toast.success('Entry Duplicated', {
      description: 'Time entry has been duplicated and added to your records'
    })
  }

  const handleExportReport = (format: 'csv' | 'pdf' | 'json') => {
    logger.info('Export report initiated', {
      format: format.toUpperCase(),
      entryCount: timeEntries.length
    })
    const data = timeEntries.map((entry) => ({
      project: projects.find((p) => p.id === entry.projectId)?.name || 'Unknown',
      task: projects.find((p) => p.id === entry.projectId)?.tasks.find((t) => t.id === entry.taskId)?.name || 'Unknown',
      description: entry.description,
      duration: formatTime(entry.duration),
      date: entry.startTime.toLocaleDateString(),
    }))

    let content: string
    let filename: string

    if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      filename = 'time-report.json'
    } else if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',')
      const rows = data.map((row) => Object.values(row).join(','))
      content = [headers, ...rows].join('\n')
      filename = 'time-report.csv'
    } else {
      content = `Time Tracking Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Entries: ${data.length}`
      filename = 'time-report.txt'
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    logger.info('Report exported successfully', {
      filename,
      entriesExported: data.length
    })
    toast.success('Report Exported', {
      description: 'Downloaded ' + filename + ' with ' + data.length + ' entries'
    })
  }

  const handleFilterByProject = () => {
    logger.debug('Filter options requested', {
      availableFilters: ['Project', 'Date Range', 'Task', 'Duration'],
      currentEntries: timeEntries.length
    })
    toast.info('Filter Options Available', {
      description: 'Filter by Project, Date Range, Task, or Duration'
    })
  }

  const handleFilterByDateRange = () => {
    logger.debug('Date range filter initiated')
    setFilterStartDate('')
    setFilterEndDate('')
    setShowDateRangeDialog(true)
  }

  const confirmFilterByDateRange = () => {
    if (!filterStartDate || !filterEndDate) {
      toast.error('Please select both start and end dates')
      return
    }

    logger.info('Date range filter applied', { start: filterStartDate, end: filterEndDate })
    toast.info('Date Filter Applied', {
      description: 'Filtering entries from ' + filterStartDate + ' to ' + filterEndDate
    })
    announce('Date filter applied', 'polite')
    setShowDateRangeDialog(false)
    setFilterStartDate('')
    setFilterEndDate('')
  }

  const handleClearFilters = () => {
    logger.info('Filters cleared successfully')
    toast.success('Filters Cleared', {
      description: 'All filters have been reset to show all time entries'
    })
  }

  const handleGenerateDailyReport = () => {
    const today = new Date().toLocaleDateString()
    const todayEntries = timeEntries.filter(
      (e) => e.startTime.toLocaleDateString() === today
    )
    const totalTime = todayEntries.reduce((sum, e) => sum + e.duration, 0)
    logger.info('Daily report generated', {
      date: today,
      entries: todayEntries.length,
      totalTime: formatTime(totalTime)
    })
    toast.info('Daily Report Generated', {
      description: today + ' - ' + todayEntries.length + ' entries, ' + formatTime(totalTime) + ' total'
    })
  }

  const handleGenerateWeeklyReport = () => {
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    logger.info('Weekly report generated', {
      entries: timeEntries.length,
      totalTime: formatTime(totalTime)
    })
    toast.info('Weekly Report Generated', {
      description: timeEntries.length + ' entries, ' + formatTime(totalTime) + ' total time tracked'
    })
  }

  const handleGenerateMonthlyReport = () => {
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    const avgPerDay = timeEntries.length > 0 ? totalTime / timeEntries.length : 0
    logger.info('Monthly report generated', {
      entries: timeEntries.length,
      totalTime: formatTime(totalTime),
      avgPerEntry: formatTime(avgPerDay)
    })
    toast.info('Monthly Report Generated', {
      description: timeEntries.length + ' entries, ' + formatTime(totalTime) + ' total, ' + formatTime(avgPerDay) + ' avg'
    })
  }

  const handleBulkDeleteEntries = () => {
    logger.info('Bulk delete initiated', { currentEntries: timeEntries.length })
    if (timeEntries.length === 0) {
      logger.warn('No entries available to delete')
      toast.error('No Entries', {
        description: 'There are no time entries to delete'
      })
      return
    }
    setShowDeleteAllDialog(true)
  }

  const confirmDeleteAllEntries = async () => {
    setIsDeleting(true)
    try {
      setTimeEntries([])
      // Persist to localStorage
      localStorage.setItem(`time_entries_${userId}`, JSON.stringify([]))
      logger.info('All entries deleted successfully')
      toast.success('All Entries Deleted', {
        description: 'All time entries have been permanently removed'
      })
      announce('All time entries deleted', 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteAllDialog(false)
    }
  }

  const handleAddProject = () => {
    logger.info('Add project initiated')
    setNewProjectName('')
    setShowAddProjectDialog(true)
  }

  const confirmAddProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    logger.info('Project added successfully', { projectName: newProjectName.trim() })
    toast.success('Project Added', {
      description: 'Project "' + newProjectName.trim() + '" created - you can now add tasks'
    })
    announce('Project added', 'polite')
    setShowAddProjectDialog(false)
    setNewProjectName('')
  }

  const handleEditProject = () => {
    logger.info('Edit project initiated')
    if (!selectedProject) {
      logger.warn('No project selected for editing')
      toast.error('No Project Selected', {
        description: 'Please select a project to edit'
      })
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

    const project = projects.find((p) => p.id === selectedProject)
    logger.info('Project updated successfully', {
      projectId: selectedProject,
      oldName: project?.name,
      newName: editProjectName.trim()
    })
    toast.success('Project Updated', {
      description: 'Project name changed to "' + editProjectName.trim() + '"'
    })
    announce('Project updated', 'polite')
    setShowEditProjectDialog(false)
    setEditProjectName('')
  }

  const handleDeleteProject = () => {
    logger.info('Delete project initiated')
    if (!selectedProject) {
      logger.warn('No project selected for deletion')
      toast.error('No Project Selected', {
        description: 'Please select a project to delete'
      })
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
      // Persist updated projects list to localStorage
      const updatedProjects = projects.filter(p => p.id !== projectToDelete)
      localStorage.setItem(`time_projects_${userId}`, JSON.stringify(updatedProjects))
      logger.info('Project deleted successfully', {
        projectId: projectToDelete,
        projectName: project?.name
      })
      toast.success('Project Deleted', {
        description: 'Project removed - all time entries have been preserved'
      })
      announce(`Project ${project?.name} deleted`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteProjectDialog(false)
      setProjectToDelete(null)
    }
  }

  const handleAddTask = () => {
    logger.info('Add task initiated')
    if (!selectedProject) {
      logger.warn('No project selected for task creation')
      toast.error('No Project Selected', {
        description: 'Please select a project before adding a task'
      })
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

    logger.info('Task added successfully', {
      taskName: newTaskName.trim(),
      projectId: selectedProject
    })
    toast.success('Task Added', {
      description: 'Task "' + newTaskName.trim() + '" added to project'
    })
    announce('Task added', 'polite')
    setShowAddTaskDialog(false)
    setNewTaskName('')
  }

  const handleEditTask = () => {
    logger.info('Edit task initiated')
    if (!selectedTask) {
      logger.warn('No task selected for editing')
      toast.error('No Task Selected', {
        description: 'Please select a task to edit'
      })
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

    const task = projects
      .find((p) => p.id === selectedProject)
      ?.tasks.find((t) => t.id === selectedTask)
    logger.info('Task updated successfully', {
      taskId: selectedTask,
      oldName: task?.name,
      newName: editTaskName.trim()
    })
    toast.success('Task Updated', {
      description: 'Task name changed to "' + editTaskName.trim() + '"'
    })
    announce('Task updated', 'polite')
    setShowEditTaskDialog(false)
    setEditTaskName('')
  }

  const handleDeleteTask = () => {
    logger.info('Delete task initiated')
    if (!selectedTask) {
      logger.warn('No task selected for deletion')
      toast.error('No Task Selected', {
        description: 'Please select a task to delete'
      })
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
      // Persist updated projects (with task removed) to localStorage
      const updatedProjects = projects.map(p => {
        if (p.id === selectedProject) {
          return { ...p, tasks: p.tasks.filter(t => t.id !== taskToDelete) }
        }
        return p
      })
      localStorage.setItem(`time_projects_${userId}`, JSON.stringify(updatedProjects))
      logger.info('Task deleted successfully', {
        taskId: taskToDelete,
        taskName: task?.name
      })
      toast.success('Task Deleted', {
        description: 'Task removed - all time entries have been preserved'
      })
      announce(`Task ${task?.name} deleted`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteTaskDialog(false)
      setTaskToDelete(null)
    }
  }

  const handleClearDescription = () => {
    logger.debug('Description cleared', {
      previousDescription: description || 'empty'
    })
    setDescription('')
    toast.success('Description Cleared', {
      description: 'Task description has been reset'
    })
  }

  const handleArchiveEntry = (entryId: string) => {
    logger.info('Archive entry initiated', { entryId })
    setEntryToArchive(entryId)
    setShowArchiveEntryDialog(true)
  }

  const confirmArchiveEntry = async () => {
    if (!entryToArchive) return

    setIsDeleting(true)
    try {
      // Archive the entry to localStorage
      const archivedEntries = JSON.parse(localStorage.getItem(`archived_entries_${userId}`) || '[]')
      const entryToMove = timeEntries.find(e => e.id === entryToArchive)
      if (entryToMove) {
        archivedEntries.push({ ...entryToMove, archivedAt: new Date().toISOString() })
        localStorage.setItem(`archived_entries_${userId}`, JSON.stringify(archivedEntries))
        setTimeEntries(prev => prev.filter(e => e.id !== entryToArchive))
        localStorage.setItem(`time_entries_${userId}`, JSON.stringify(timeEntries.filter(e => e.id !== entryToArchive)))
      }
      logger.info('Entry archived successfully', { entryId: entryToArchive })
      toast.success('Entry Archived', {
        description: 'Time entry archived - can be restored later'
      })
      announce('Time entry archived', 'polite')
    } finally {
      setIsDeleting(false)
      setShowArchiveEntryDialog(false)
      setEntryToArchive(null)
    }
  }

  const handleViewDetailedStats = () => {
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    const projectBreakdown = projects.map((project) => {
      const projectEntries = timeEntries.filter((e) => e.projectId === project.id)
      const projectTime = projectEntries.reduce((sum, e) => sum + e.duration, 0)
      return `${project.name}: ${formatTime(projectTime)}`
    }).join('\n')
    logger.info('Detailed statistics generated', {
      totalTime: formatTime(totalTime),
      totalEntries: timeEntries.length,
      projectCount: projects.length
    })
    toast.info('Detailed Statistics', {
      description: 'Total: ' + formatTime(totalTime) + ' across ' + timeEntries.length + ' entries'
    })
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen relative p-6">
        {/* Pattern Craft Background */}
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

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen relative p-6">
        {/* Pattern Craft Background */}
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
    <div className="min-h-screen relative p-6">
      {/* Pattern Craft Background */}
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
            <TextShimmer className="text-4xl font-bold text-white mb-2" duration={2}>
              Time Tracking
            </TextShimmer>
            <p className="text-gray-400">Track time across projects and tasks</p>
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
                  <CardTitle className="text-white">Timer</CardTitle>
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

                  <div className="grid grid-cols-2 gap-4">
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
                    <CardTitle className="text-white">Recent Time Entries</CardTitle>
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
                      className="flex items-center justify-between p-4 rounded-lg border group hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
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
                        <div className="text-sm text-gray-600">
                          {entry.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono mr-4">
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
                    <div className="text-center py-8 text-gray-500">
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
                  <CardTitle className="text-white">Reports</CardTitle>
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
                      <h3 className="text-xl font-semibold mb-2">
                        Daily Overview
                      </h3>
                      <p className="text-gray-600">
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
                      <h3 className="text-xl font-semibold mb-2">
                        Weekly Report
                      </h3>
                      <p className="text-gray-600">
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
                      <h3 className="text-xl font-semibold mb-2">
                        Monthly Analysis
                      </h3>
                      <p className="text-gray-600">
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
              {isDeleting ? 'Deleting...' : `Delete All ${timeEntries.length} Entries`}
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