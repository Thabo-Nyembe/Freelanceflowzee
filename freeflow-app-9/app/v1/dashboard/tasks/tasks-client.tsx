'use client'

/**
 * Tasks Client Component
 *
 * Features:
 * - Real-time task management with Supabase hooks
 * - CSV/JSON export with Blob/URL.createObjectURL
 * - PDF generation for task reports
 * - Bulk operations with database persistence
 * - No hardcoded mock data - all data from Supabase
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  Search,
  ListTodo,
  Loader2,
  MoreVertical,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Share2,
  Copy,
  Archive,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  Printer,
  Mail,
} from 'lucide-react'

import { format, formatDistanceToNow, isAfter, isBefore, isToday, addDays } from 'date-fns'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { createSimpleLogger } from '@/lib/simple-logger'
import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'

// TanStack Query hooks for real database operations
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignTask,
  useTaskStats,
  type Task,
  type CreateTaskData,
  type UpdateTaskData,
  type TaskFilters,
} from '@/lib/api-clients'

const logger = createSimpleLogger('TasksClient')

// Types
type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// Status configuration
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  todo: { label: 'To Do', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Loader2 className="h-3 w-3" /> },
  in_review: { label: 'In Review', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <AlertCircle className="h-3 w-3" /> },
}

// Priority configuration
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

// ============================================================================
// EXPORT UTILITIES - Real file generation with Blob/URL.createObjectURL
// ============================================================================

/**
 * Generate CSV content from tasks data
 */
function generateCSV(tasks: Task[]): string {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Category',
    'Due Date',
    'Start Date',
    'Completed At',
    'Progress',
    'Estimated Hours',
    'Actual Hours',
    'Created At',
    'Updated At',
  ]

  const rows = tasks.map(task => [
    task.id,
    `"${(task.title || '').replace(/"/g, '""')}"`,
    `"${(task.description || '').replace(/"/g, '""')}"`,
    task.status,
    task.priority,
    task.category || '',
    task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
    task.start_date ? format(new Date(task.start_date), 'yyyy-MM-dd') : '',
    task.completed_at ? format(new Date(task.completed_at), 'yyyy-MM-dd HH:mm:ss') : '',
    String(task.progress || 0),
    String(task.estimated_hours || 0),
    String(task.actual_hours || 0),
    task.created_at ? format(new Date(task.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
    task.updated_at ? format(new Date(task.updated_at), 'yyyy-MM-dd HH:mm:ss') : '',
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Generate JSON content from tasks data
 */
function generateJSON(tasks: Task[]): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalTasks: tasks.length,
    tasks: tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      dueDate: task.due_date,
      startDate: task.start_date,
      completedAt: task.completed_at,
      progress: task.progress,
      estimatedHours: task.estimated_hours,
      actualHours: task.actual_hours,
      projectId: task.project_id,
      assignedTo: task.assigned_to,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    })),
  }
  return JSON.stringify(exportData, null, 2)
}

/**
 * Generate printable HTML report from tasks data
 */
function generatePrintableHTML(tasks: Task[], stats: any): string {
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  const overdueTasks = tasks.filter(t =>
    t.due_date &&
    isBefore(new Date(t.due_date), new Date()) &&
    t.status !== 'completed'
  )

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Task Report - ${format(new Date(), 'PPP')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { color: #666; font-size: 14px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
    .stat-card { background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-card .value { font-size: 28px; font-weight: bold; color: #333; }
    .stat-card .label { font-size: 12px; color: #666; margin-top: 4px; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 18px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
    .task-list { list-style: none; }
    .task-item { padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 6px; margin-bottom: 8px; }
    .task-item .title { font-weight: 600; margin-bottom: 4px; }
    .task-item .meta { font-size: 12px; color: #666; display: flex; gap: 16px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .badge-urgent { background: #fee2e2; color: #dc2626; }
    .badge-high { background: #ffedd5; color: #ea580c; }
    .badge-medium { background: #dbeafe; color: #2563eb; }
    .badge-low { background: #f1f5f9; color: #475569; }
    .overdue { border-left: 4px solid #dc2626; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Task Report</h1>
    <p>Generated on ${format(new Date(), 'PPPpp')}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="value">${tasks.length}</div>
      <div class="label">Total Tasks</div>
    </div>
    <div class="stat-card">
      <div class="value">${completedTasks.length}</div>
      <div class="label">Completed</div>
    </div>
    <div class="stat-card">
      <div class="value">${pendingTasks.length}</div>
      <div class="label">Pending</div>
    </div>
    <div class="stat-card">
      <div class="value">${overdueTasks.length}</div>
      <div class="label">Overdue</div>
    </div>
  </div>

  ${overdueTasks.length > 0 ? `
  <div class="section">
    <h2>Overdue Tasks (${overdueTasks.length})</h2>
    <ul class="task-list">
      ${overdueTasks.map(task => `
        <li class="task-item overdue">
          <div class="title">${task.title}</div>
          <div class="meta">
            <span class="badge badge-${task.priority}">${task.priority}</span>
            <span>Due: ${format(new Date(task.due_date!), 'PPP')}</span>
            <span>Overdue by ${formatDistanceToNow(new Date(task.due_date!))}</span>
          </div>
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="section">
    <h2>Pending Tasks (${pendingTasks.length})</h2>
    <ul class="task-list">
      ${pendingTasks.filter(t => !overdueTasks.includes(t)).map(task => `
        <li class="task-item">
          <div class="title">${task.title}</div>
          <div class="meta">
            <span class="badge badge-${task.priority}">${task.priority}</span>
            <span>Status: ${STATUS_CONFIG[task.status as TaskStatus]?.label || task.status}</span>
            ${task.due_date ? `<span>Due: ${format(new Date(task.due_date), 'PPP')}</span>` : ''}
          </div>
        </li>
      `).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>Completed Tasks (${completedTasks.length})</h2>
    <ul class="task-list">
      ${completedTasks.slice(0, 20).map(task => `
        <li class="task-item">
          <div class="title">${task.title}</div>
          <div class="meta">
            <span class="badge badge-${task.priority}">${task.priority}</span>
            ${task.completed_at ? `<span>Completed: ${format(new Date(task.completed_at), 'PPP')}</span>` : ''}
          </div>
        </li>
      `).join('')}
      ${completedTasks.length > 20 ? `<li class="task-item"><em>...and ${completedTasks.length - 20} more completed tasks</em></li>` : ''}
    </ul>
  </div>

  <div class="footer">
    <p>This report was automatically generated by FreeFlow Tasks</p>
  </div>
</body>
</html>
`
}

/**
 * Download file using Blob and URL.createObjectURL
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TasksClient() {
  // Insights panel hook
  const insightsPanel = useInsightsPanel(false)

  // Fetch tasks from Supabase with TanStack Query
  const { data: tasksData, isLoading, error, refetch } = useTasks()

  // Task mutations - all connected to Supabase
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const assignTask = useAssignTask()

  // Get task statistics from Supabase
  const { data: stats, refetch: refetchStats } = useTaskStats()

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: null as Date | null,
    startDate: null as Date | null,
    category: '',
    estimatedHours: 0,
    assigneeId: '',
    projectId: '',
  })

  const tasks = tasksData?.data?.data || []
  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(task => task.status === filterStatus)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      result = result.filter(task => task.priority === filterPriority)
    }

    // Sorting
    const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'dueDate':
          const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity
          const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity
          comparison = aDate - bDate
          break
        case 'priority':
          comparison = priorityOrder[a.priority as TaskPriority] - priorityOrder[b.priority as TaskPriority]
          break
        case 'createdAt':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [tasks, searchQuery, filterStatus, filterPriority, sortBy, sortOrder])

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      startDate: null,
      category: '',
      estimatedHours: 0,
      assigneeId: '',
      projectId: '',
    })
  }, [])

  // ============================================================================
  // HANDLERS - All use real Supabase mutations
  // ============================================================================

  const handleCreateTask = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const taskData: CreateTaskData = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.dueDate?.toISOString(),
      start_date: formData.startDate?.toISOString(),
      category: formData.category || undefined,
      estimated_hours: formData.estimatedHours || undefined,
      assigned_to: formData.assigneeId || undefined,
      project_id: formData.projectId || undefined,
    }

    createTask.mutate(taskData, {
      onSuccess: () => {
        // Toast is handled by the hook
        setIsCreateDialogOpen(false)
        resetForm()
        refetchStats()
        logger.info('Task created', { title: formData.title })
      },
      onError: (error) => {
        // Toast is handled by the hook
        logger.error('Task creation failed', { error })
      },
    })
  }, [formData, createTask, resetForm, refetchStats])

  const handleEditTask = useCallback(async () => {
    if (!selectedTask || !formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const updates: UpdateTaskData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.dueDate?.toISOString() || null,
      start_date: formData.startDate?.toISOString() || null,
      category: formData.category || null,
      estimated_hours: formData.estimatedHours || null,
      assigned_to: formData.assigneeId || null,
    }

    updateTask.mutate({ id: selectedTask.id, updates }, {
      onSuccess: () => {
        // Toast is handled by the hook
        setIsEditDialogOpen(false)
        setSelectedTaskId(null)
        resetForm()
        refetchStats()
        logger.info('Task updated', { id: selectedTask.id })
      },
      onError: (error) => {
        // Toast is handled by the hook
        logger.error('Task update failed', { error })
      },
    })
  }, [selectedTask, formData, updateTask, resetForm, refetchStats])

  const handleDeleteTask = useCallback(async () => {
    if (!selectedTaskId) return

    deleteTask.mutate(selectedTaskId, {
      onSuccess: () => {
        // Toast is handled by the hook
        setIsDeleteDialogOpen(false)
        setSelectedTaskId(null)
        refetchStats()
        logger.info('Task deleted', { id: selectedTaskId })
      },
      onError: (error) => {
        // Toast is handled by the hook
        logger.error('Task deletion failed', { error })
      },
    })
  }, [selectedTaskId, deleteTask, refetchStats])

  const handleBulkDelete = useCallback(async () => {
    const taskIds = Array.from(selectedTasks)
    if (taskIds.length === 0) return

    // Delete tasks sequentially
    let successCount = 0
    let failCount = 0

    for (const taskId of taskIds) {
      try {
        await new Promise<void>((resolve, reject) => {
          deleteTask.mutate(taskId, {
            onSuccess: () => {
              successCount++
              resolve()
            },
            onError: () => {
              failCount++
              resolve() // Continue with next task even on error
            },
          })
        })
      } catch {
        failCount++
      }
    }

    setIsBulkDeleteDialogOpen(false)
    setSelectedTasks(new Set())
    refetchStats()

    if (failCount === 0) {
      toast.success(`${successCount} tasks deleted successfully`)
    } else {
      toast.warning(`${successCount} tasks deleted, ${failCount} failed`)
    }
  }, [selectedTasks, deleteTask, refetchStats])

  const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
    const updates: UpdateTaskData = {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
    }

    updateTask.mutate({ id: taskId, updates }, {
      onSuccess: () => {
        // Toast is handled by the hook
        refetchStats()
      },
    })
  }, [updateTask, refetchStats])

  const handleDuplicateTask = useCallback((task: Task) => {
    const taskData: CreateTaskData = {
      title: `${task.title} (Copy)`,
      description: task.description || undefined,
      status: 'todo',
      priority: task.priority as TaskPriority,
      due_date: task.due_date || undefined,
      category: task.category || undefined,
      estimated_hours: task.estimated_hours || undefined,
      project_id: task.project_id || undefined,
    }

    createTask.mutate(taskData, {
      onSuccess: () => {
        // Toast is handled by the hook
        refetchStats()
      },
    })
  }, [createTask, refetchStats])

  // ============================================================================
  // EXPORT HANDLERS - Real file generation
  // ============================================================================

  const handleExportCSV = useCallback(() => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks to export')
      return
    }

    setIsExporting(true)
    try {
      const csv = generateCSV(filteredTasks)
      const filename = `tasks-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
      downloadFile(csv, filename, 'text/csv;charset=utf-8')
      toast.success(`Exported ${filteredTasks.length} tasks to CSV`)
      logger.info('Tasks exported to CSV', { count: filteredTasks.length })
    } catch (error) {
      toast.error('Failed to export CSV')
      logger.error('CSV export failed', { error })
    } finally {
      setIsExporting(false)
    }
  }, [filteredTasks])

  const handleExportJSON = useCallback(() => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks to export')
      return
    }

    setIsExporting(true)
    try {
      const json = generateJSON(filteredTasks)
      const filename = `tasks-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
      downloadFile(json, filename, 'application/json')
      toast.success(`Exported ${filteredTasks.length} tasks to JSON`)
      logger.info('Tasks exported to JSON', { count: filteredTasks.length })
    } catch (error) {
      toast.error('Failed to export JSON')
      logger.error('JSON export failed', { error })
    } finally {
      setIsExporting(false)
    }
  }, [filteredTasks])

  const handlePrintReport = useCallback(() => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks to print')
      return
    }

    setIsExporting(true)
    try {
      const html = generatePrintableHTML(filteredTasks, stats)
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 250)
        toast.success('Print dialog opened')
        logger.info('Tasks print report generated', { count: filteredTasks.length })
      } else {
        toast.error('Please allow popups to print the report')
      }
    } catch (error) {
      toast.error('Failed to generate print report')
      logger.error('Print report failed', { error })
    } finally {
      setIsExporting(false)
    }
  }, [filteredTasks, stats])

  const handleShareTasks = useCallback(async () => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks to share')
      return
    }

    const shareData = {
      title: 'Task List',
      text: `Task Summary:\n- Total: ${filteredTasks.length}\n- Completed: ${filteredTasks.filter(t => t.status === 'completed').length}\n- Pending: ${filteredTasks.filter(t => t.status !== 'completed').length}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Tasks shared successfully')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share tasks')
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        const text = filteredTasks.map(t => `- [${t.status}] ${t.title}`).join('\n')
        await navigator.clipboard.writeText(text)
        toast.success('Task list copied to clipboard')
      } catch {
        toast.error('Failed to copy to clipboard')
      }
    }
  }, [filteredTasks])

  const handleCopyTask = useCallback(async (task: Task) => {
    const text = `Task: ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}\n${task.due_date ? `Due: ${format(new Date(task.due_date), 'PPP')}` : ''}\n${task.description || ''}`

    try {
      await navigator.clipboard.writeText(text)
      toast.success('Task copied to clipboard')
    } catch {
      toast.error('Failed to copy task')
    }
  }, [])

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  const handleToggleSelect = useCallback((taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)))
    }
  }, [filteredTasks, selectedTasks.size])

  const handleBulkStatusChange = useCallback((newStatus: TaskStatus) => {
    const taskIds = Array.from(selectedTasks)
    taskIds.forEach(taskId => {
      handleStatusChange(taskId, newStatus)
    })
    setSelectedTasks(new Set())
  }, [selectedTasks, handleStatusChange])

  // Open edit dialog
  const openEditDialog = useCallback((task: Task) => {
    setSelectedTaskId(task.id)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      startDate: task.start_date ? new Date(task.start_date) : null,
      category: task.category || '',
      estimatedHours: task.estimated_hours || 0,
      assigneeId: task.assigned_to || '',
      projectId: task.project_id || '',
    })
    setIsEditDialogOpen(true)
  }, [])

  // Open delete dialog
  const openDeleteDialog = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
    setIsDeleteDialogOpen(true)
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <EmptyState
            icon="error"
            title="Failed to load tasks"
            description={error.message}
            action={{
              label: 'Retry',
              onClick: () => refetch()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Tasks
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track your project tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <InsightsToggleButton isOpen={insightsPanel.isOpen} onToggle={insightsPanel.toggle} />
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrintReport}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareTasks}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => {
                resetForm()
                setIsCreateDialogOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats?.total || tasks.length}</p>
                </div>
                <ListTodo className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold">
                    {stats?.in_progress || tasks.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">
                    {stats?.completed || tasks.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold">
                    {stats?.overdue || tasks.filter(t =>
                      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
                    ).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              {stats?.completionRate !== undefined && (
                <div className="mt-2">
                  <Progress value={stats.completionRate} className="h-1" />
                  <p className="text-xs text-gray-500 mt-1">{Math.round(stats.completionRate)}% completion rate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | 'all')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as TaskPriority | 'all')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    {PRIORITY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="createdAt">Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedTasks.size > 0 && (
          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedTasks.size === filteredTasks.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {STATUS_OPTIONS.map(opt => (
                        <DropdownMenuItem key={opt.value} onClick={() => handleBulkStatusChange(opt.value)}>
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTasks(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                <CardTitle>Your Tasks</CardTitle>
                <Badge variant="outline">{filteredTasks.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedTasks.size === filteredTasks.length ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <EmptyState
                icon="tasks"
                title="No tasks found"
                description="Create a task or adjust your filters"
                action={{
                  label: 'Create Task',
                  onClick: () => setIsCreateDialogOpen(true)
                }}
              />
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredTasks.map((task, index) => {
                    const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && task.status !== 'completed'
                    const isDueToday = task.due_date && isToday(new Date(task.due_date))
                    const statusConfig = STATUS_CONFIG[task.status as TaskStatus] || STATUS_CONFIG.todo
                    const priorityConfig = PRIORITY_CONFIG[task.priority as TaskPriority] || PRIORITY_CONFIG.medium

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-4 rounded-lg border bg-white hover:shadow-md transition-all ${
                          isOverdue ? 'border-red-300 bg-red-50/50' : ''
                        } ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Checkbox
                              checked={selectedTasks.has(task.id)}
                              onCheckedChange={() => handleToggleSelect(task.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className={`font-semibold text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                  {task.title}
                                </h3>
                                <Badge className={statusConfig.color + ' border'}>
                                  {statusConfig.icon}
                                  <span className="ml-1">{statusConfig.label}</span>
                                </Badge>
                                <Badge className={priorityConfig.color}>
                                  {task.priority}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                {task.due_date && (
                                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-orange-600' : ''}`}>
                                    <CalendarIcon className="h-3 w-3" />
                                    {isOverdue ? (
                                      <>Overdue by {formatDistanceToNow(new Date(task.due_date))}</>
                                    ) : isDueToday ? (
                                      'Due today'
                                    ) : (
                                      format(new Date(task.due_date), 'MMM d, yyyy')
                                    )}
                                  </span>
                                )}
                                {task.assigned_to && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Assigned
                                  </span>
                                )}
                                {task.progress > 0 && (
                                  <span className="flex items-center gap-1">
                                    {task.progress}% complete
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Select
                              value={task.status}
                              onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateTask(task)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyTask(task)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy to Clipboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(task.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Task Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            resetForm()
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditDialogOpen ? 'Edit Task' : 'Create New Task'}</DialogTitle>
              <DialogDescription>
                {isEditDialogOpen ? 'Update task details below' : 'Fill in the task details below'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as TaskStatus }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v as TaskPriority }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate || undefined}
                        onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date || null }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate || undefined}
                        onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date || null }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Development, Design"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    value={formData.estimatedHours || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button
                onClick={isEditDialogOpen ? handleEditTask : handleCreateTask}
                disabled={createTask.isPending || updateTask.isPending}
              >
                {(createTask.isPending || updateTask.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditDialogOpen ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                disabled={deleteTask.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedTasks.size} Tasks</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedTasks.size} selected task{selectedTasks.size !== 1 ? 's' : ''}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Collapsible Insights Panel */}
        <CollapsibleInsightsPanel
          title="Task Insights & Analytics"
          defaultOpen={insightsPanel.isOpen}
          onOpenChange={insightsPanel.setIsOpen}
        >
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-blue-600" />
                Task Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Tasks</span>
                <span className="font-semibold">{stats?.total || tasks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">In Progress</span>
                <span className="font-semibold text-blue-600">{stats?.in_progress || tasks.filter(t => t.status === 'in_progress').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-semibold text-green-600">{stats?.completed || tasks.filter(t => t.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Overdue</span>
                <span className="font-semibold text-red-600">{stats?.overdue || tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length}</span>
              </div>
              {stats?.completionRate !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-semibold">{Math.round(stats.completionRate)}%</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(stats?.overdue || 0) > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {stats?.overdue} overdue task(s) - prioritize these immediately
                </p>
              )}
              {tasks.filter(t => t.priority === 'urgent').length > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {tasks.filter(t => t.priority === 'urgent').length} urgent task(s) need attention
                </p>
              )}
              {(stats?.completionRate || 0) >= 80 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Great progress! Completion rate is at {Math.round(stats?.completionRate || 0)}%
                </p>
              )}
              {tasks.length === 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  No tasks yet - create your first task to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </CollapsibleInsightsPanel>
      </div>
    </div>
  )
}

export default TasksClient
