'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { format, formatDistanceToNow, isAfter, isBefore, isToday, addDays } from 'date-fns'
import { useTasks, type Task, type TaskStatus, type TaskPriority, type TaskCategory } from '@/lib/hooks/use-tasks'
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar as CalendarIcon,
  Flag,
  User,
  Trash2,
  Edit,
  Copy,
  Play,
  Pause,
  AlertCircle,
  ListTodo,
  CheckCheck,
  Loader2,
  RefreshCw,
  LayoutGrid,
  List,
  Kanban,
  Timer,
  Sparkles,
  Tag,
  FolderOpen,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react'

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700', icon: <Circle className="h-4 w-4" /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-4 w-4" /> },
  review: { label: 'In Review', color: 'bg-purple-100 text-purple-700', icon: <Target className="h-4 w-4" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: <Circle className="h-4 w-4" /> },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-4 w-4" /> }
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: React.ReactNode }> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="h-4 w-4" /> },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <ArrowUpCircle className="h-4 w-4" /> },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Flag className="h-4 w-4" /> },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 border-green-200', icon: <ArrowDownCircle className="h-4 w-4" /> }
}

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'admin', label: 'Admin' },
  { value: 'creative', label: 'Creative' },
  { value: 'break', label: 'Break' }
]

// ============================================================================
// LOADING SKELETON
// ============================================================================

function TasksLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Task list skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="h-5 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// ERROR STATE
// ============================================================================

function TasksErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        {error.message || 'An error occurred while loading your tasks. Please try again.'}
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function TasksEmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        Create your first task to start organizing your work and boost productivity.
      </p>
      <Button onClick={onCreateTask}>
        <Plus className="h-4 w-4 mr-2" />
        Create Task
      </Button>
    </div>
  )
}

// ============================================================================
// TASK CARD COMPONENT
// ============================================================================

interface TaskCardProps {
  task: Task
  onToggleComplete: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onDuplicate: (taskId: string) => void
  onStartTimer: (taskId: string) => void
  onStopTimer: (taskId: string) => void
  activeTimerId?: string
  isUpdating?: boolean
}

function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onStartTimer,
  onStopTimer,
  activeTimerId,
  isUpdating
}: TaskCardProps) {
  const isCompleted = task.status === 'completed'
  const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && !isCompleted
  const isDueToday = task.due_date && isToday(new Date(task.due_date))
  const isTimerActive = activeTimerId === task.id
  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 border rounded-lg transition-all hover:shadow-md ${
        isCompleted ? 'bg-muted/50 opacity-75' : 'bg-card'
      } ${isOverdue ? 'border-red-300 bg-red-50/50' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleComplete(task.id)}
        disabled={isUpdating}
        className={`mt-1 flex-shrink-0 rounded-full p-0.5 transition-colors ${
          isCompleted
            ? 'text-green-600 hover:text-green-700'
            : 'text-muted-foreground hover:text-primary'
        }`}
      >
        {isUpdating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4
              className={`font-medium truncate ${
                isCompleted ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(task.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {isTimerActive ? (
                <DropdownMenuItem onClick={() => onStopTimer(task.id)}>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Timer
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onStartTimer(task.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Status Badge */}
          <Badge variant="secondary" className={`text-xs ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>

          {/* Priority Badge */}
          <Badge variant="outline" className={`text-xs ${priorityConfig.color}`}>
            {priorityConfig.icon}
            <span className="ml-1">{priorityConfig.label}</span>
          </Badge>

          {/* Due Date */}
          {task.due_date && (
            <Badge
              variant="outline"
              className={`text-xs ${
                isOverdue
                  ? 'border-red-300 text-red-700 bg-red-50'
                  : isDueToday
                  ? 'border-orange-300 text-orange-700 bg-orange-50'
                  : ''
              }`}
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              {isOverdue
                ? `Overdue by ${formatDistanceToNow(new Date(task.due_date))}`
                : isDueToday
                ? 'Due today'
                : format(new Date(task.due_date), 'MMM d')}
            </Badge>
          )}

          {/* Assignee */}
          {task.assignee && (
            <Badge variant="outline" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              {task.assignee.name}
            </Badge>
          )}

          {/* Time estimate */}
          {task.estimated_minutes > 0 && (
            <Badge variant="outline" className="text-xs">
              <Timer className="h-3 w-3 mr-1" />
              {task.actual_minutes}/{task.estimated_minutes}m
            </Badge>
          )}

          {/* Timer active indicator */}
          {isTimerActive && (
            <Badge className="text-xs bg-green-100 text-green-700 animate-pulse">
              <Play className="h-3 w-3 mr-1" />
              Timer Running
            </Badge>
          )}

          {/* Tags */}
          {task.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CREATE/EDIT TASK DIALOG
// ============================================================================

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  onSave: (data: Partial<Task>) => Promise<void>
  isSaving: boolean
}

function TaskDialog({ open, onOpenChange, task, onSave, isSaving }: TaskDialogProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium')
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'work')
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : undefined
  )
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimated_minutes || 60)
  const [tags, setTags] = useState<string>(task?.tags?.join(', ') || '')

  const isEdit = !!task

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    await onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      due_date: dueDate?.toISOString() || null,
      estimated_minutes: estimatedMinutes,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    })
  }

  // Reset form when task changes
  useMemo(() => {
    setTitle(task?.title || '')
    setDescription(task?.description || '')
    setStatus(task?.status || 'todo')
    setPriority(task?.priority || 'medium')
    setCategory(task?.category || 'work')
    setDueDate(task?.due_date ? new Date(task.due_date) : undefined)
    setEstimatedMinutes(task?.estimated_minutes || 60)
    setTags(task?.tags?.join(', ') || '')
  }, [task])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the task details below'
              : 'Fill in the details to create a new task'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Time */}
            <div className="space-y-2">
              <Label>Estimated Time (min)</Label>
              <Input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="design, urgent, client"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TasksClient() {
  const {
    tasks,
    stats,
    isLoading,
    error,
    todoTasks,
    inProgressTasks,
    completedTasks,
    urgentTasks,
    overdueTasks,
    todaysTasks,
    upcomingTasks,
    activeTimer,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    duplicateTask,
    startTimer,
    stopTimer,
    search
  } = useTasks({ enableRealtime: true })

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = tasks

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.length >= 3) {
      search(query)
    }
  }, [search])

  const handleToggleComplete = useCallback(async (taskId: string) => {
    setUpdatingTaskId(taskId)
    const result = await toggleTaskCompletion(taskId)
    setUpdatingTaskId(null)
    if (result.success) {
      if (result.celebration) {
        toast.success(result.celebration.message)
      } else {
        toast.success('Task updated')
      }
    } else {
      toast.error(result.error || 'Failed to update task')
    }
  }, [toggleTaskCompletion])

  const handleCreateTask = useCallback(() => {
    setEditingTask(null)
    setTaskDialogOpen(true)
  }, [])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }, [])

  const handleSaveTask = useCallback(async (data: Partial<Task>) => {
    setIsSaving(true)
    try {
      if (editingTask) {
        const result = await updateTask(editingTask.id, data)
        if (result.success) {
          toast.success('Task updated successfully')
          setTaskDialogOpen(false)
        } else {
          toast.error(result.error || 'Failed to update task')
        }
      } else {
        const result = await createTask(data)
        if (result.success) {
          toast.success('Task created successfully')
          setTaskDialogOpen(false)
        } else {
          toast.error(result.error || 'Failed to create task')
        }
      }
    } finally {
      setIsSaving(false)
    }
  }, [editingTask, createTask, updateTask])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    const result = await deleteTask(taskId)
    if (result.success) {
      toast.success('Task deleted')
    } else {
      toast.error(result.error || 'Failed to delete task')
    }
  }, [deleteTask])

  const handleDuplicateTask = useCallback(async (taskId: string) => {
    const result = await duplicateTask(taskId)
    if (result.success) {
      toast.success('Task duplicated')
    } else {
      toast.error(result.error || 'Failed to duplicate task')
    }
  }, [duplicateTask])

  const handleStartTimer = useCallback(async (taskId: string) => {
    const result = await startTimer(taskId)
    if (result.success) {
      toast.success('Timer started')
    } else {
      toast.error(result.error || 'Failed to start timer')
    }
  }, [startTimer])

  const handleStopTimer = useCallback(async (taskId: string) => {
    const result = await stopTimer(taskId)
    if (result.success) {
      toast.success(`Timer stopped. Duration: ${result.duration} minutes`)
    } else {
      toast.error(result.error || 'Failed to stop timer')
    }
  }, [stopTimer])

  // Loading state
  if (isLoading && tasks.length === 0) {
    return <TasksLoadingSkeleton />
  }

  // Error state
  if (error && tasks.length === 0) {
    return <TasksErrorState error={error} onRetry={refresh} />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            Tasks
          </h1>
          <p className="text-muted-foreground">
            Manage your tasks and boost productivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">To Do</p>
                <p className="text-2xl font-bold">{stats.todo}</p>
              </div>
              <Circle className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{stats.completion_rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={stats.completion_rate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('kanban')}
              >
                <Kanban className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Sections */}
      {(urgentTasks.length > 0 || overdueTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
                  <Zap className="h-4 w-4" />
                  Urgent Tasks ({urgentTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {urgentTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEditTask(task)}
                    >
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm truncate flex-1">{task.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {overdueTasks.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEditTask(task)}
                    >
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm truncate flex-1">{task.title}</span>
                      <span className="text-xs text-orange-600">
                        {formatDistanceToNow(new Date(task.due_date!), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Task List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            All ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Today ({todaysTasks.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming ({upcomingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4" />
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-4">
              {filteredTasks.length === 0 ? (
                <TasksEmptyState onCreateTask={handleCreateTask} />
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today">
          <Card>
            <CardContent className="p-4">
              {todaysTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>No tasks due today</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {todaysTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardContent className="p-4">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No upcoming tasks this week</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-4">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                  <p>No completed tasks yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
        isSaving={isSaving}
      />
    </div>
  )
}

export default TasksClient
