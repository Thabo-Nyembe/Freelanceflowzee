'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Calendar as CalendarIcon,
  User,
  Filter,
  ArrowUpDown,
  Search,
  ListTodo,
  Loader2,
  ChevronDown,
  Users,
  Flag,
} from 'lucide-react'

import { format } from 'date-fns'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('TasksPage')

// ============================================================================
// TYPES
// ============================================================================

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assignee: TeamMember | null
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
  projectId?: string
  projectName?: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com' },
]

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design Homepage Mockup',
    description: 'Create initial wireframes and high-fidelity mockups for the new homepage design',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_TEAM_MEMBERS[0],
    subtasks: [
      { id: '1-1', title: 'Research competitor designs', completed: true },
      { id: '1-2', title: 'Create wireframes', completed: true },
      { id: '1-3', title: 'Design high-fidelity mockup', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectName: 'Website Redesign',
  },
  {
    id: '2',
    title: 'Implement User Authentication',
    description: 'Set up OAuth 2.0 authentication with Google and GitHub providers',
    status: 'pending',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_TEAM_MEMBERS[1],
    subtasks: [
      { id: '2-1', title: 'Configure OAuth providers', completed: false },
      { id: '2-2', title: 'Implement login flow', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectName: 'Authentication System',
  },
  {
    id: '3',
    title: 'Write API Documentation',
    description: 'Document all REST API endpoints with examples and response schemas',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: MOCK_TEAM_MEMBERS[2],
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectName: 'API Development',
  },
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-3 w-3" />
    case 'in_progress':
      return <Loader2 className="h-3 w-3 animate-spin" />
    case 'completed':
      return <CheckCircle2 className="h-3 w-3" />
    case 'cancelled':
      return <AlertCircle className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'low':
      return 'bg-slate-100 text-slate-700'
    case 'medium':
      return 'bg-blue-100 text-blue-700'
    case 'high':
      return 'bg-orange-100 text-orange-700'
    case 'urgent':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
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
// MAIN COMPONENT
// ============================================================================

export default function TasksPage() {
  // STATE MANAGEMENT
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // DIALOG STATES
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  // FORM STATES
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: null as Date | null,
    assigneeId: '',
  })
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      logger.info('Fetching tasks')

      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()

      // Use API data if available, otherwise fall back to initial tasks
      const tasksData = data.tasks || data || INITIAL_TASKS
      setTasks(Array.isArray(tasksData) ? tasksData : INITIAL_TASKS)
      logger.info('Tasks loaded successfully', { count: tasksData.length })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks'
      setError(errorMessage)
      logger.error('Failed to fetch tasks', { error: err })
      toast.error('Failed to load tasks', { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ============================================================================
  // TASK OPERATIONS
  // ============================================================================

  /**
   * Create a new task with form dialog
   */
  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const actionKey = 'create-task'
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const createPromise = new Promise<Task>(async (resolve, reject) => {
      try {
        const taskData = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate?.toISOString() || null,
          assigneeId: formData.assigneeId || null,
        }

        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        })

        if (!response.ok) {
          throw new Error('Failed to create task')
        }

        const data = await response.json()
        const newTask: Task = data.task || {
          id: `task-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate?.toISOString() || null,
          assignee: formData.assigneeId
            ? MOCK_TEAM_MEMBERS.find((m) => m.id === formData.assigneeId) || null
            : null,
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setTasks((prev) => [newTask, ...prev])
        logger.info('Task created successfully', { taskId: newTask.id, title: newTask.title })
        resolve(newTask)
      } catch (err) {
        reject(err)
      }
    })

    toast.promise(createPromise, {
      loading: 'Creating task...',
      success: (task) => {
        setIsCreateDialogOpen(false)
        resetForm()
        return `Task "${task.title}" created successfully`
      },
      error: 'Failed to create task',
    })

    try {
      await createPromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Edit existing task with dialog
   */
  const handleEditTask = async () => {
    if (!selectedTask || !formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const actionKey = `edit-${selectedTask.id}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const updatePromise = new Promise<Task>(async (resolve, reject) => {
      try {
        const taskData = {
          id: selectedTask.id,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate?.toISOString() || null,
          assigneeId: formData.assigneeId || null,
        }

        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        })

        if (!response.ok) {
          throw new Error('Failed to update task')
        }

        const data = await response.json()
        const updatedTask: Task = data.task || {
          ...selectedTask,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate?.toISOString() || null,
          assignee: formData.assigneeId
            ? MOCK_TEAM_MEMBERS.find((m) => m.id === formData.assigneeId) || null
            : null,
          updatedAt: new Date().toISOString(),
        }

        setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updatedTask : t)))
        logger.info('Task updated successfully', { taskId: updatedTask.id })
        resolve(updatedTask)
      } catch (err) {
        reject(err)
      }
    })

    toast.promise(updatePromise, {
      loading: 'Updating task...',
      success: (task) => {
        setIsEditDialogOpen(false)
        setSelectedTask(null)
        resetForm()
        return `Task "${task.title}" updated successfully`
      },
      error: 'Failed to update task',
    })

    try {
      await updatePromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Delete task with confirmation dialog
   */
  const handleDeleteTask = async () => {
    if (!selectedTask) return

    const actionKey = `delete-${selectedTask.id}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const deletePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/tasks?id=${selectedTask.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete task')
        }

        setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id))
        logger.info('Task deleted successfully', { taskId: selectedTask.id })
        resolve()
      } catch (err) {
        reject(err)
      }
    })

    toast.promise(deletePromise, {
      loading: 'Deleting task...',
      success: () => {
        setIsDeleteDialogOpen(false)
        setSelectedTask(null)
        return `Task deleted successfully`
      },
      error: 'Failed to delete task',
    })

    try {
      await deletePromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Change task status with dropdown
   */
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const actionKey = `status-${taskId}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const statusPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, status: newStatus }),
        })

        if (!response.ok) {
          throw new Error('Failed to update status')
        }

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
              : t
          )
        )
        logger.info('Task status updated', { taskId, newStatus })
        resolve()
      } catch (err) {
        reject(err)
      }
    })

    toast.promise(statusPromise, {
      loading: 'Updating status...',
      success: `Status changed to ${newStatus.replace('_', ' ')}`,
      error: 'Failed to update status',
    })

    try {
      await statusPromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Assign task to team member
   */
  const handleAssignTask = async (taskId: string, memberId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    const member = MOCK_TEAM_MEMBERS.find((m) => m.id === memberId)
    if (!task) return

    const actionKey = `assign-${taskId}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const assignPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, assigneeId: memberId || null }),
        })

        if (!response.ok) {
          throw new Error('Failed to assign task')
        }

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, assignee: member || null, updatedAt: new Date().toISOString() }
              : t
          )
        )
        logger.info('Task assigned', { taskId, memberId })
        resolve()
      } catch (err) {
        reject(err)
      }
    })

    toast.promise(assignPromise, {
      loading: 'Assigning task...',
      success: member ? `Assigned to ${member.name}` : 'Assignee removed',
      error: 'Failed to assign task',
    })

    try {
      await assignPromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Set task due date with date picker
   */
  const handleSetDueDate = async (taskId: string, date: Date | null) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const actionKey = `duedate-${taskId}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const dueDatePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, dueDate: date?.toISOString() || null }),
        })

        if (!response.ok) {
          throw new Error('Failed to update due date')
        }

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, dueDate: date?.toISOString() || null, updatedAt: new Date().toISOString() }
              : t
          )
        )
        logger.info('Task due date updated', { taskId, dueDate: date })
        resolve()
      } catch (err) {
        reject(err)
      }
    })

    toast.promise(dueDatePromise, {
      loading: 'Updating due date...',
      success: date ? `Due date set to ${format(date, 'PPP')}` : 'Due date removed',
      error: 'Failed to update due date',
    })

    try {
      await dueDatePromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Add subtask to a task
   */
  const handleAddSubtask = async () => {
    if (!selectedTask || !newSubtaskTitle.trim()) {
      toast.error('Subtask title is required')
      return
    }

    const actionKey = `subtask-${selectedTask.id}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const subtaskPromise = new Promise<Subtask>(async (resolve, reject) => {
      try {
        const newSubtask: Subtask = {
          id: `subtask-${Date.now()}`,
          title: newSubtaskTitle,
          completed: false,
        }

        // Get current task to append subtask
        const currentTask = tasks.find((t) => t.id === selectedTask.id)
        const updatedSubtasks = currentTask ? [...currentTask.subtasks, newSubtask] : [newSubtask]

        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedTask.id, subtasks: updatedSubtasks }),
        })

        if (!response.ok) {
          throw new Error('Failed to add subtask')
        }

        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTask.id
              ? { ...t, subtasks: [...t.subtasks, newSubtask], updatedAt: new Date().toISOString() }
              : t
          )
        )
        logger.info('Subtask added', { taskId: selectedTask.id, subtaskId: newSubtask.id })
        resolve(newSubtask)
      } catch (err) {
        reject(err)
      }
    })

    toast.promise(subtaskPromise, {
      loading: 'Adding subtask...',
      success: () => {
        setNewSubtaskTitle('')
        return 'Subtask added successfully'
      },
      error: 'Failed to add subtask',
    })

    try {
      await subtaskPromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Toggle subtask completion
   */
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    const subtask = task?.subtasks.find((s) => s.id === subtaskId)
    if (!task || !subtask) return

    const newCompleted = !subtask.completed

    // Optimistically update UI
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: newCompleted } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    )

    try {
      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: newCompleted } : s
      )

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, subtasks: updatedSubtasks }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subtask')
      }

      toast.success(newCompleted ? 'Subtask completed' : 'Subtask marked incomplete')
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, completed: !newCompleted } : s
                ),
              }
            : t
        )
      )
      toast.error('Failed to update subtask')
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: null,
      assigneeId: '',
    })
  }

  const openEditDialog = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assigneeId: task.assignee?.id || '',
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const openSubtaskDialog = (task: Task) => {
    setSelectedTask(task)
    setNewSubtaskTitle('')
    setIsSubtaskDialogOpen(true)
  }

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          comparison = dateA - dateB
          break
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // ============================================================================
  // LOADING STATE
  // ============================================================================

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

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <EmptyState
            icon="Something went wrong"
            title="Error Loading Tasks"
            description={error}
            action={{
              label: 'Retry',
              onClick: fetchTasks,
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Tasks
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage your tasks and track progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <ListTodo className="h-4 w-4 mr-2" />
              {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
            </Badge>
            <Button
              onClick={() => {
                resetForm()
                setIsCreateDialogOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filterStatus}
                  onValueChange={(value) => setFilterStatus(value as TaskStatus | 'all')}
                >
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterPriority}
                  onValueChange={(value) => setFilterPriority(value as TaskPriority | 'all')}
                >
                  <SelectTrigger className="w-[140px]">
                    <Flag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy('dueDate')}>
                      Due Date {sortBy === 'dueDate' && '(active)'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('priority')}>
                      Priority {sortBy === 'priority' && '(active)'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                      Created Date {sortBy === 'createdAt' && '(active)'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                      {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon="No tasks"
            title="No tasks found"
            description={
              searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Create your first task to get started'
            }
            action={{
              label: 'Create Task',
              onClick: () => {
                resetForm()
                setIsCreateDialogOpen(true)
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusIcon(task.status)}
                              <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              <Flag className="h-3 w-3 mr-1" />
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm">{task.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openSubtaskDialog(task)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Subtask
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            {STATUS_OPTIONS.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleStatusChange(task.id, option.value)}
                                disabled={task.status === option.value}
                              >
                                {option.label}
                                {task.status === option.value && ' (current)'}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(task)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Task Meta Info */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {/* Assignee */}
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 font-normal"
                                disabled={actionLoading[`assign-${task.id}`]}
                              >
                                {actionLoading[`assign-${task.id}`] ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                {task.assignee ? task.assignee.name : 'Unassigned'}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAssignTask(task.id, '')}>
                                <Users className="h-4 w-4 mr-2" />
                                Unassigned
                              </DropdownMenuItem>
                              {MOCK_TEAM_MEMBERS.map((member) => (
                                <DropdownMenuItem
                                  key={member.id}
                                  onClick={() => handleAssignTask(task.id, member.id)}
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  {member.name}
                                  {task.assignee?.id === member.id && ' (current)'}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 font-normal"
                                disabled={actionLoading[`duedate-${task.id}`]}
                              >
                                {actionLoading[`duedate-${task.id}`] ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                onSelect={(date) => handleSetDueDate(task.id, date || null)}
                                initialFocus
                              />
                              {task.dueDate && (
                                <div className="p-2 border-t">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleSetDueDate(task.id, null)}
                                  >
                                    Clear due date
                                  </Button>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Project */}
                        {task.projectName && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{task.projectName}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Subtasks */}
                      {task.subtasks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                            </span>
                            <Progress
                              value={(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}
                              className="w-24 h-2"
                            />
                          </div>
                          <div className="space-y-1">
                            {task.subtasks.map((subtask) => (
                              <div
                                key={subtask.id}
                                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => handleToggleSubtask(task.id, subtask.id)}
                              >
                                <div
                                  className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                                    subtask.completed
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {subtask.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                                <span
                                  className={`text-sm ${
                                    subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'
                                  }`}
                                >
                                  {subtask.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={() => openSubtaskDialog(task)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Subtask
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            onClick={() => handleStatusChange(task.id, 'completed')}
                            disabled={actionLoading[`status-${task.id}`]}
                          >
                            {actionLoading[`status-${task.id}`] ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Task description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as TaskStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as TaskPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, assigneeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {MOCK_TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate || undefined}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, dueDate: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!formData.title.trim() || actionLoading['create-task']}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {actionLoading['create-task'] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Task description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as TaskStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as TaskPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, assigneeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {MOCK_TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate || undefined}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, dueDate: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditTask}
              disabled={!formData.title.trim() || actionLoading[`edit-${selectedTask?.id}`]}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {actionLoading[`edit-${selectedTask?.id}`] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
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
              Are you sure you want to delete &quot;{selectedTask?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading[`delete-${selectedTask?.id}`]}
            >
              {actionLoading[`delete-${selectedTask?.id}`] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Subtask Dialog */}
      <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
            <DialogDescription>
              Add a subtask to &quot;{selectedTask?.title}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtask-title">Subtask Title *</Label>
              <Input
                id="subtask-title"
                placeholder="Enter subtask title"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                    handleAddSubtask()
                  }
                }}
              />
            </div>
            {selectedTask && selectedTask.subtasks.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Subtasks</Label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {selectedTask.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 p-2 rounded bg-gray-50"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${subtask.completed ? 'text-green-500' : 'text-gray-300'}`}
                      />
                      <span
                        className={`text-sm ${subtask.completed ? 'line-through text-gray-400' : ''}`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubtaskDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim() || actionLoading[`subtask-${selectedTask?.id}`]}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {actionLoading[`subtask-${selectedTask?.id}`] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
