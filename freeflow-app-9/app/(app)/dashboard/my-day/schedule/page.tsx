'use client'

import { useState, useCallback, useReducer } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Plus, Edit2, Trash2, Copy, Download, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

// MY DAY UTILITIES
import {
  taskReducer,
  initialTaskState,
  mockTimeBlocks,
  type TimeBlock
} from '@/lib/my-day-utils'

const logger = createFeatureLogger('MyDay-Schedule')

const BLOCK_TYPE_COLORS: Record<string, string> = {
  focus: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300',
  meeting: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  break: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  admin: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300'
}

const DEFAULT_BLOCK: Omit<TimeBlock, 'id'> = {
  title: '',
  start: '09:00',
  end: '10:00',
  type: 'focus',
  tasks: [],
  color: BLOCK_TYPE_COLORS.focus
}

export default function SchedulePage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [state] = useReducer(taskReducer, initialTaskState)
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(mockTimeBlocks)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
  const [deleteBlock, setDeleteBlock] = useState<TimeBlock | null>(null)
  const [formData, setFormData] = useState(DEFAULT_BLOCK)

  // Open create dialog
  const handleCreateBlock = useCallback(() => {
    setEditingBlock(null)
    setFormData(DEFAULT_BLOCK)
    setShowBlockDialog(true)
    logger.info('Opening create block dialog')
  }, [])

  // Open edit dialog
  const handleEditBlock = useCallback((block: TimeBlock) => {
    setEditingBlock(block)
    setFormData({
      title: block.title,
      start: block.start,
      end: block.end,
      type: block.type,
      tasks: block.tasks,
      color: block.color
    })
    setShowBlockDialog(true)
    logger.info('Opening edit block dialog', { blockId: block.id })
  }, [])

  // Save block (create or update)
  const handleSaveBlock = useCallback(() => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (formData.start >= formData.end) {
      toast.error('End time must be after start time')
      return
    }

    const blockColor = BLOCK_TYPE_COLORS[formData.type] || BLOCK_TYPE_COLORS.focus

    if (editingBlock) {
      // Update existing block
      setTimeBlocks(prev => prev.map(b =>
        b.id === editingBlock.id
          ? { ...b, ...formData, color: blockColor }
          : b
      ))
      toast.success('Time Block Updated', { description: formData.title })
      logger.info('Time block updated', { blockId: editingBlock.id })
      announce('Time block updated', 'polite')
    } else {
      // Create new block
      const newBlock: TimeBlock = {
        id: `block_${Date.now()}`,
        ...formData,
        color: blockColor
      }
      setTimeBlocks(prev => [...prev, newBlock].sort((a, b) => a.start.localeCompare(b.start)))
      toast.success('Time Block Created', { description: formData.title })
      logger.info('Time block created', { blockId: newBlock.id })
      announce('Time block created', 'polite')
    }

    setShowBlockDialog(false)
    setFormData(DEFAULT_BLOCK)
  }, [formData, editingBlock, announce])

  // Confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (!deleteBlock) return

    setTimeBlocks(prev => prev.filter(b => b.id !== deleteBlock.id))
    toast.success('Time Block Deleted', { description: deleteBlock.title })
    logger.info('Time block deleted', { blockId: deleteBlock.id })
    announce('Time block deleted', 'polite')
    setDeleteBlock(null)
  }, [deleteBlock, announce])

  // Duplicate block
  const handleDuplicateBlock = useCallback((block: TimeBlock) => {
    const newBlock: TimeBlock = {
      ...block,
      id: `block_${Date.now()}`,
      title: `${block.title} (Copy)`
    }
    setTimeBlocks(prev => [...prev, newBlock].sort((a, b) => a.start.localeCompare(b.start)))
    toast.success('Time Block Duplicated', { description: newBlock.title })
    logger.info('Time block duplicated', { originalId: block.id, newId: newBlock.id })
  }, [])

  // Export schedule
  const handleExportSchedule = useCallback(() => {
    const exportData = {
      schedule: timeBlocks,
      exportedAt: new Date().toISOString(),
      totalBlocks: timeBlocks.length
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-day-schedule-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Schedule Exported', { description: `${timeBlocks.length} time blocks` })
    logger.info('Schedule exported', { blockCount: timeBlocks.length })
  }, [timeBlocks])

  // Calculate total scheduled time
  const calculateTotalTime = useCallback(() => {
    let totalMinutes = 0
    timeBlocks.forEach(block => {
      const [startH, startM] = block.start.split(':').map(Number)
      const [endH, endM] = block.end.split(':').map(Number)
      totalMinutes += (endH * 60 + endM) - (startH * 60 + startM)
    })
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins}m`
  }, [timeBlocks])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Time Blocks</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your optimized schedule for maximum productivity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSchedule}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateBlock}>
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Blocks</p>
          <p className="text-2xl font-bold">{timeBlocks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Time</p>
          <p className="text-2xl font-bold">{calculateTotalTime()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Focus Blocks</p>
          <p className="text-2xl font-bold">{timeBlocks.filter(b => b.type === 'focus').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Meetings</p>
          <p className="text-2xl font-bold">{timeBlocks.filter(b => b.type === 'meeting').length}</p>
        </Card>
      </div>

      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time blocks scheduled</p>
              <Button variant="link" onClick={handleCreateBlock}>
                Create your first time block
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {timeBlocks.map(block => (
                <div
                  key={block.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:shadow-md group",
                    block.color
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 opacity-30 group-hover:opacity-100 cursor-grab" />
                      <div>
                        <h4 className="font-medium">{block.title}</h4>
                        <p className="text-sm opacity-75">{block.start} - {block.end}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {block.type}
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDuplicateBlock(block)}
                          title="Duplicate"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditBlock(block)}
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          onClick={() => setDeleteBlock(block)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {block.tasks.length > 0 && (
                    <div className="mt-3 space-y-1 pl-7">
                      {block.tasks.map(taskId => {
                        const task = state.tasks.find(t => t.id === taskId)
                        return task ? (
                          <div key={taskId} className="text-sm opacity-75 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {task.title}
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Edit Time Block' : 'Create Time Block'}</DialogTitle>
            <DialogDescription>
              {editingBlock ? 'Update your time block details' : 'Add a new time block to your schedule'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Deep Focus: Design Work"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start Time</Label>
                <Input
                  id="start"
                  type="time"
                  value={formData.start}
                  onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end">End Time</Label>
                <Input
                  id="end"
                  type="time"
                  value={formData.end}
                  onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Block Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'focus' | 'meeting' | 'break' | 'admin') =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="focus">🎯 Focus Time</SelectItem>
                  <SelectItem value="meeting">👥 Meeting</SelectItem>
                  <SelectItem value="break">☕ Break</SelectItem>
                  <SelectItem value="admin">📋 Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBlock}>
                {editingBlock ? 'Save Changes' : 'Create Block'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBlock} onOpenChange={() => setDeleteBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Block?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteBlock?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
