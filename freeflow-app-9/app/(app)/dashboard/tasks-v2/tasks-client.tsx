'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
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
  Zap,
  UserPlus,
  ArrowUpDown,
  ChevronDown,
  Layers,
  SquareCheck,
  Square,
  X
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

const SORT_OPTIONS = [
  { value: 'position', label: 'Default Order' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'updated_at', label: 'Recently Updated' }
]

// Mock team members for assignment - in production this would come from API
const TEAM_MEMBERS = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar_url: null },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar_url: null },
  { id: 'user-3', name: 'Mike Johnson', email: 'mike@example.com', avatar_url: null },
  { id: 'user-4', name: 'Sarah Williams', email: 'sarah@example.com', avatar_url: null }
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
  onChangeStatus: (taskId: string, status: TaskStatus) => void
  onChangePriority: (taskId: string, priority: TaskPriority) => void
  onAssign: (taskId: string, assigneeId: string | null) => void
  onUpdateDueDate: (taskId: string, dueDate: Date | null) => void
  onAddSubtask: (parentId: string) => void
  activeTimerId?: string
  isUpdating?: boolean
  isSelected?: boolean
  onSelectToggle?: (taskId: string) => void
  selectionMode?: boolean
}

function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onStartTimer,
  onStopTimer,
  onChangeStatus,
  onChangePriority,
  onAssign,
  onUpdateDueDate,
  onAddSubtask,
  activeTimerId,
  isUpdating,
  isSelected,
  onSelectToggle,
  selectionMode
}: TaskCardProps) {
  const [dueDateOpen, setDueDateOpen] = useState(false)
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
      } ${isOverdue ? 'border-red-300 bg-red-50/50' : ''} ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
    >
      {/* Selection checkbox in bulk mode */}
      {selectionMode && (
        <button
          onClick={() => onSelectToggle?.(task.id)}
          className="mt-1 flex-shrink-0"
        >
          {isSelected ? (
            <SquareCheck className="h-5 w-5 text-primary" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />
          )}
        </button>
      )}

      {/* Completion checkbox */}
      {!selectionMode && (
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
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4
              className={`font-medium truncate cursor-pointer hover:text-primary ${
                isCompleted ? 'line-through text-muted-foreground' : ''
              }`}
              onClick={() => onEdit(task)}
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>

              {/* Quick Status Change */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Target className="h-4 w-4 mr-2" />
                  Change Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={task.status} onValueChange={(v) => onChangeStatus(task.id, v as TaskStatus)}>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <DropdownMenuRadioItem key={key} value={key} className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Quick Priority Change */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Flag className="h-4 w-4 mr-2" />
                  Set Priority
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={task.priority} onValueChange={(v) => onChangePriority(task.id, v as TaskPriority)}>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <DropdownMenuRadioItem key={key} value={key} className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Assign to team member */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign To
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onAssign(task.id, null)}>
                    <User className="h-4 w-4 mr-2" />
                    Unassigned
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {TEAM_MEMBERS.map((member) => (
                    <DropdownMenuItem
                      key={member.id}
                      onClick={() => onAssign(task.id, member.id)}
                      className={task.assignee_id === member.id ? 'bg-accent' : ''}
                    >
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {member.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onAddSubtask(task.id)}>
                <Layers className="h-4 w-4 mr-2" />
                Add Subtask
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
          {/* Status Badge - Clickable */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge variant="secondary" className={`text-xs cursor-pointer hover:opacity-80 ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onChangeStatus(task.id, key as TaskStatus)}
                  className={task.status === key ? 'bg-accent' : ''}
                >
                  <span className={`flex items-center gap-2 ${config.color} px-2 py-0.5 rounded`}>
                    {config.icon}
                    {config.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Badge - Clickable */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge variant="outline" className={`text-xs cursor-pointer hover:opacity-80 ${priorityConfig.color}`}>
                {priorityConfig.icon}
                <span className="ml-1">{priorityConfig.label}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onChangePriority(task.id, key as TaskPriority)}
                  className={task.priority === key ? 'bg-accent' : ''}
                >
                  <span className={`flex items-center gap-2 ${config.color} px-2 py-0.5 rounded`}>
                    {config.icon}
                    {config.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Due Date - Clickable Popover */}
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <Badge
                variant="outline"
                className={`text-xs cursor-pointer hover:opacity-80 ${
                  isOverdue
                    ? 'border-red-300 text-red-700 bg-red-50'
                    : isDueToday
                    ? 'border-orange-300 text-orange-700 bg-orange-50'
                    : ''
                }`}
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                {task.due_date
                  ? isOverdue
                    ? `Overdue by ${formatDistanceToNow(new Date(task.due_date))}`
                    : isDueToday
                    ? 'Due today'
                    : format(new Date(task.due_date), 'MMM d')
                  : 'Set due date'}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 border-b">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateDueDate(task.id, new Date())
                      setDueDateOpen(false)
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateDueDate(task.id, addDays(new Date(), 1))
                      setDueDateOpen(false)
                    }}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateDueDate(task.id, addDays(new Date(), 7))
                      setDueDateOpen(false)
                    }}
                  >
                    Next Week
                  </Button>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={task.due_date ? new Date(task.due_date) : undefined}
                onSelect={(date) => {
                  onUpdateDueDate(task.id, date || null)
                  setDueDateOpen(false)
                }}
                initialFocus
              />
              {task.due_date && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-600"
                    onClick={() => {
                      onUpdateDueDate(task.id, null)
                      setDueDateOpen(false)
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove due date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Assignee - Clickable */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-pointer hover:opacity-80">
                {task.assignee ? (
                  <>
                    <Avatar className="h-4 w-4 mr-1">
                      <AvatarImage src={task.assignee.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px]">
                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {task.assignee.name}
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    Assign
                  </>
                )}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Assign to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAssign(task.id, null)}>
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                Unassigned
              </DropdownMenuItem>
              {TEAM_MEMBERS.map((member) => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => onAssign(task.id, member.id)}
                >
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {member.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
    search,
    changeTaskStatus,
    changeTaskPriority,
    assignTask,
    updateDueDate,
    bulkUpdateTasks,
    bulkDeleteTasks
  } = useTasks({ enableRealtime: true })

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('position')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Subtask state
  const [subtaskDialogOpen, setSubtaskDialogOpen] = useState(false)
  const [parentTaskId, setParentTaskId] = useState<string | null>(null)
  const [subtaskTitle, setSubtaskTitle] = useState('')

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

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

    // Sorting
    const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'due_date':
          if (!a.due_date && !b.due_date) comparison = 0
          else if (!a.due_date) comparison = 1
          else if (!b.due_date) comparison = -1
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          break
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        default:
          comparison = a.position - b.position
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder])

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

  // Delete with confirmation
  const handleDeleteClick = useCallback((taskId: string) => {
    setTaskToDelete(taskId)
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    const result = await deleteTask(taskToDelete, true) // permanent delete
    setIsDeleting(false)

    if (result.success) {
      toast.success('Task deleted permanently')
      setDeleteConfirmOpen(false)
      setTaskToDelete(null)
      // Remove from selection if in selection mode
      setSelectedTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskToDelete)
        return newSet
      })
    } else {
      toast.error(result.error || 'Failed to delete task')
    }
  }, [taskToDelete, deleteTask])

  const handleDuplicateTask = useCallback(async (taskId: string) => {
    toast.promise(
      duplicateTask(taskId),
      {
        loading: 'Duplicating task...',
        success: 'Task duplicated successfully',
        error: (err) => err?.error || 'Failed to duplicate task'
      }
    )
  }, [duplicateTask])

  const handleStartTimer = useCallback(async (taskId: string) => {
    toast.promise(
      startTimer(taskId),
      {
        loading: 'Starting timer...',
        success: 'Timer started',
        error: (err) => err?.error || 'Failed to start timer'
      }
    )
  }, [startTimer])

  const handleStopTimer = useCallback(async (taskId: string) => {
    const result = await stopTimer(taskId)
    if (result.success) {
      toast.success(`Timer stopped. Duration: ${result.duration} minutes`)
    } else {
      toast.error(result.error || 'Failed to stop timer')
    }
  }, [stopTimer])

  // Quick status change handler
  const handleChangeStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTaskId(taskId)
    const result = await changeTaskStatus(taskId, newStatus)
    setUpdatingTaskId(null)
    if (result.success) {
      toast.success(`Status changed to ${STATUS_CONFIG[newStatus].label}`)
    } else {
      toast.error(result.error || 'Failed to change status')
    }
  }, [changeTaskStatus])

  // Quick priority change handler
  const handleChangePriority = useCallback(async (taskId: string, newPriority: TaskPriority) => {
    setUpdatingTaskId(taskId)
    const result = await changeTaskPriority(taskId, newPriority)
    setUpdatingTaskId(null)
    if (result.success) {
      toast.success(`Priority changed to ${PRIORITY_CONFIG[newPriority].label}`)
    } else {
      toast.error(result.error || 'Failed to change priority')
    }
  }, [changeTaskPriority])

  // Assign task handler
  const handleAssignTask = useCallback(async (taskId: string, assigneeId: string | null) => {
    const result = await assignTask(taskId, assigneeId)
    if (result.success) {
      const member = assigneeId ? TEAM_MEMBERS.find(m => m.id === assigneeId) : null
      toast.success(member ? `Assigned to ${member.name}` : 'Task unassigned')
    } else {
      toast.error(result.error || 'Failed to assign task')
    }
  }, [assignTask])

  // Update due date handler
  const handleUpdateDueDate = useCallback(async (taskId: string, dueDate: Date | null) => {
    const result = await updateDueDate(taskId, dueDate?.toISOString() || null)
    if (result.success) {
      toast.success(dueDate ? `Due date set to ${format(dueDate, 'MMM d, yyyy')}` : 'Due date removed')
    } else {
      toast.error(result.error || 'Failed to update due date')
    }
  }, [updateDueDate])

  // Add subtask handler
  const handleAddSubtask = useCallback((parentId: string) => {
    setParentTaskId(parentId)
    setSubtaskTitle('')
    setSubtaskDialogOpen(true)
  }, [])

  const handleCreateSubtask = useCallback(async () => {
    if (!parentTaskId || !subtaskTitle.trim()) return

    setIsSaving(true)
    const result = await createTask({
      title: subtaskTitle.trim(),
      parent_id: parentTaskId,
      status: 'todo',
      priority: 'medium'
    })
    setIsSaving(false)

    if (result.success) {
      toast.success('Subtask created')
      setSubtaskDialogOpen(false)
      setSubtaskTitle('')
      setParentTaskId(null)
    } else {
      toast.error(result.error || 'Failed to create subtask')
    }
  }, [parentTaskId, subtaskTitle, createTask])

  // Bulk selection handlers
  const handleToggleSelection = useCallback((taskId: string) => {
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

  const handleClearSelection = useCallback(() => {
    setSelectedTasks(new Set())
    setSelectionMode(false)
  }, [])

  // Bulk action handlers
  const handleBulkStatusChange = useCallback(async (newStatus: TaskStatus) => {
    if (selectedTasks.size === 0) return

    setBulkActionLoading(true)
    const result = await bulkUpdateTasks(Array.from(selectedTasks), { status: newStatus })
    setBulkActionLoading(false)

    if (result.success) {
      toast.success(`${result.updatedCount} tasks updated to ${STATUS_CONFIG[newStatus].label}`)
      handleClearSelection()
    } else {
      toast.error(result.error || 'Failed to update tasks')
    }
  }, [selectedTasks, bulkUpdateTasks, handleClearSelection])

  const handleBulkPriorityChange = useCallback(async (newPriority: TaskPriority) => {
    if (selectedTasks.size === 0) return

    setBulkActionLoading(true)
    const result = await bulkUpdateTasks(Array.from(selectedTasks), { priority: newPriority })
    setBulkActionLoading(false)

    if (result.success) {
      toast.success(`${result.updatedCount} tasks updated to ${PRIORITY_CONFIG[newPriority].label} priority`)
      handleClearSelection()
    } else {
      toast.error(result.error || 'Failed to update tasks')
    }
  }, [selectedTasks, bulkUpdateTasks, handleClearSelection])

  const handleBulkDelete = useCallback(async () => {
    if (selectedTasks.size === 0) return

    setBulkActionLoading(true)
    const result = await bulkDeleteTasks(Array.from(selectedTasks), true)
    setBulkActionLoading(false)

    if (result.success) {
      toast.success(`${result.deletedCount} tasks deleted`)
      handleClearSelection()
    } else {
      toast.error(result.error || 'Failed to delete tasks')
    }
  }, [selectedTasks, bulkDeleteTasks, handleClearSelection])

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
          <Button
            variant={selectionMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode)
              if (selectionMode) {
                setSelectedTasks(new Set())
              }
            }}
          >
            {selectionMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <SquareCheck className="h-4 w-4 mr-2" />
                Select
              </>
            )}
          </Button>
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

      {/* Bulk Actions Bar */}
      {selectionMode && selectedTasks.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedTasks.size === filteredTasks.length ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <SquareCheck className="h-4 w-4 mr-2" />
                      Select All ({filteredTasks.length})
                    </>
                  )}
                </Button>
                <span className="text-sm font-medium">
                  {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Bulk Status Change */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={bulkActionLoading}>
                      <Target className="h-4 w-4 mr-2" />
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <DropdownMenuItem key={key} onClick={() => handleBulkStatusChange(key as TaskStatus)}>
                        {config.icon}
                        <span className="ml-2">{config.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Bulk Priority Change */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={bulkActionLoading}>
                      <Flag className="h-4 w-4 mr-2" />
                      Priority
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <DropdownMenuItem key={key} onClick={() => handleBulkPriorityChange(key as TaskPriority)}>
                        {config.icon}
                        <span className="ml-2">{config.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Bulk Delete */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>

                <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {/* Sort Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-accent' : ''}
                    >
                      {option.label}
                      {sortBy === option.value && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Order</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setSortOrder('asc')}
                    className={sortOrder === 'asc' ? 'bg-accent' : ''}
                  >
                    Ascending
                    {sortOrder === 'asc' && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOrder('desc')}
                    className={sortOrder === 'desc' ? 'bg-accent' : ''}
                  >
                    Descending
                    {sortOrder === 'desc' && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
                        onDelete={handleDeleteClick}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        onChangeStatus={handleChangeStatus}
                        onChangePriority={handleChangePriority}
                        onAssign={handleAssignTask}
                        onUpdateDueDate={handleUpdateDueDate}
                        onAddSubtask={handleAddSubtask}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                        isSelected={selectedTasks.has(task.id)}
                        onSelectToggle={handleToggleSelection}
                        selectionMode={selectionMode}
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
                        onDelete={handleDeleteClick}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        onChangeStatus={handleChangeStatus}
                        onChangePriority={handleChangePriority}
                        onAssign={handleAssignTask}
                        onUpdateDueDate={handleUpdateDueDate}
                        onAddSubtask={handleAddSubtask}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                        isSelected={selectedTasks.has(task.id)}
                        onSelectToggle={handleToggleSelection}
                        selectionMode={selectionMode}
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
                        onDelete={handleDeleteClick}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        onChangeStatus={handleChangeStatus}
                        onChangePriority={handleChangePriority}
                        onAssign={handleAssignTask}
                        onUpdateDueDate={handleUpdateDueDate}
                        onAddSubtask={handleAddSubtask}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                        isSelected={selectedTasks.has(task.id)}
                        onSelectToggle={handleToggleSelection}
                        selectionMode={selectionMode}
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
                        onDelete={handleDeleteClick}
                        onDuplicate={handleDuplicateTask}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                        onChangeStatus={handleChangeStatus}
                        onChangePriority={handleChangePriority}
                        onAssign={handleAssignTask}
                        onUpdateDueDate={handleUpdateDueDate}
                        onAddSubtask={handleAddSubtask}
                        activeTimerId={activeTimer?.task_id}
                        isUpdating={updatingTaskId === task.id}
                        isSelected={selectedTasks.has(task.id)}
                        onSelectToggle={handleToggleSelection}
                        selectionMode={selectionMode}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone and will permanently remove the task and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
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
      <Dialog open={subtaskDialogOpen} onOpenChange={setSubtaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
            <DialogDescription>
              Create a new subtask for the selected task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtask-title">Subtask Title</Label>
              <Input
                id="subtask-title"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Enter subtask title..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && subtaskTitle.trim()) {
                    handleCreateSubtask()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubtaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubtask} disabled={isSaving || !subtaskTitle.trim()}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Subtask
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TasksClient
