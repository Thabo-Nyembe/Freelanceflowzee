// MIGRATED: Batch #30 - Removed mock data, using database hooks
'use client'

import { useState, useCallback, useReducer, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Target, Calendar, BarChart3, CheckCircle, Lightbulb, Plus, Edit2, Trash2, Download, RotateCcw, Loader2 } from 'lucide-react'
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
  calculateMetrics
} from '@/lib/my-day-utils'

// DATABASE QUERIES
import {
  Goal as DBGoal,
  getGoals,
  createGoal as createGoalDB,
  updateGoal as updateGoalDB,
  deleteGoal as deleteGoalDB
} from '@/lib/my-day-queries'

const logger = createFeatureLogger('MyDay-Goals')

interface Goal {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly'
  category: 'productivity' | 'communication' | 'learning' | 'health' | 'custom'
  target: number
  current: number
  unit: string
  status: 'pending' | 'in-progress' | 'completed' | 'on-track'
  dueDate?: string
}


const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  productivity: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', text: 'text-green-600', icon: 'bg-green-600' },
  communication: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-600', icon: 'bg-purple-600' },
  learning: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-600', icon: 'bg-blue-600' },
  health: { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-700', text: 'text-teal-600', icon: 'bg-teal-600' },
  custom: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-600', icon: 'bg-orange-600' }
}

const DEFAULT_GOAL: Omit<Goal, 'id'> = {
  title: '',
  description: '',
  type: 'daily',
  category: 'productivity',
  target: 1,
  current: 0,
  unit: 'tasks',
  status: 'pending'
}

export default function GoalsPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [state] = useReducer(taskReducer, initialTaskState)
  const { focusHours } = calculateMetrics(state)

  // State
  const [dailyGoals, setDailyGoals] = useState<Goal[]>([])
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([])
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteGoalState, setDeleteGoalState] = useState<Goal | null>(null)
  const [formData, setFormData] = useState(DEFAULT_GOAL)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch goals from database
  useEffect(() => {
    async function fetchGoals() {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [dailyResult, weeklyResult] = await Promise.all([
          getGoals(userId, 'daily'),
          getGoals(userId, 'weekly')
        ])

        if (dailyResult.data) {
          // Convert DB goals to UI format
          setDailyGoals(dailyResult.data.map(dbGoalToUIGoal))
        }
        if (weeklyResult.data) {
          setWeeklyGoals(weeklyResult.data.map(dbGoalToUIGoal))
        }
      } catch (error) {
        logger.error('Failed to fetch goals', { error })
        toast.error('Failed to load goals')
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading) {
      fetchGoals()
    }
  }, [userId, userLoading])

  // Convert DB goal to UI goal format
  function dbGoalToUIGoal(dbGoal: DBGoal): Goal {
    return {
      id: dbGoal.id,
      title: dbGoal.title,
      description: dbGoal.description || '',
      type: dbGoal.type === 'monthly' ? 'weekly' : dbGoal.type,
      category: 'productivity', // Default category
      target: 100,
      current: dbGoal.progress,
      unit: 'percent',
      status: dbGoal.status === 'completed' ? 'completed' :
              dbGoal.status === 'in_progress' ? 'in-progress' :
              dbGoal.status === 'not_started' ? 'pending' : 'pending',
      dueDate: dbGoal.target_date
    }
  }

  // Calculate progress percentage
  const calculateProgress = useCallback((goal: Goal) => {
    return Math.min(Math.round((goal.current / goal.target) * 100), 100)
  }, [])

  // Open create dialog
  const handleCreateGoal = useCallback((type: 'daily' | 'weekly') => {
    setEditingGoal(null)
    setFormData({ ...DEFAULT_GOAL, type })
    setShowGoalDialog(true)
    logger.info('Opening create goal dialog', { type })
  }, [])

  // Open edit dialog
  const handleEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      type: goal.type,
      category: goal.category,
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      status: goal.status,
      dueDate: goal.dueDate
    })
    setShowGoalDialog(true)
    logger.info('Opening edit goal dialog', { goalId: goal.id })
  }, [])

  // Save goal (create or update)
  const handleSaveGoal = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a goal title')
      return
    }

    setIsSaving(true)
    const setGoals = formData.type === 'daily' ? setDailyGoals : setWeeklyGoals

    try {
      if (userId) {
        // Database operation
        if (editingGoal) {
          const result = await updateGoalDB(userId, editingGoal.id, {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            progress: formData.current,
            status: formData.status === 'completed' ? 'completed' :
                    formData.status === 'in-progress' ? 'in_progress' : 'not_started'
          })
          if (result.error) throw result.error
        } else {
          const result = await createGoalDB(userId, {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: 'medium',
            progress: 0,
            status: 'not_started'
          })
          if (result.error) throw result.error
        }
      }

      // Update local state
      if (editingGoal) {
        setGoals(prev => prev.map(g =>
          g.id === editingGoal.id ? { ...g, ...formData } : g
        ))
        toast.success('Goal Updated', { description: formData.title })
        logger.info('Goal updated', { goalId: editingGoal.id })
        announce('Goal updated', 'polite')
      } else {
        const newGoal: Goal = {
          id: `goal_${Date.now()}`,
          ...formData
        }
        setGoals(prev => [...prev, newGoal])
        toast.success('Goal Created', { description: formData.title })
        logger.info('Goal created', { goalId: newGoal.id })
        announce('Goal created', 'polite')
      }

      setShowGoalDialog(false)
      setFormData(DEFAULT_GOAL)
    } catch (error) {
      logger.error('Failed to save goal', { error })
      toast.error('Failed to save goal')
    } finally {
      setIsSaving(false)
    }
  }, [formData, editingGoal, announce, userId])

  // Update progress
  const handleUpdateProgress = useCallback((goal: Goal, increment: number) => {
    const setGoals = goal.type === 'daily' ? setDailyGoals : setWeeklyGoals
    setGoals(prev => prev.map(g => {
      if (g.id === goal.id) {
        const newCurrent = Math.max(0, Math.min(g.current + increment, g.target))
        const newStatus = newCurrent >= g.target ? 'completed' : newCurrent > 0 ? 'in-progress' : 'pending'
        return { ...g, current: newCurrent, status: newStatus }
      }
      return g
    }))
    toast.success('Progress Updated')
    logger.info('Goal progress updated', { goalId: goal.id, increment })
  }, [])

  // Mark as complete
  const handleMarkComplete = useCallback((goal: Goal) => {
    const setGoals = goal.type === 'daily' ? setDailyGoals : setWeeklyGoals
    setGoals(prev => prev.map(g =>
      g.id === goal.id ? { ...g, current: g.target, status: 'completed' } : g
    ))
    toast.success('Goal Completed!', { description: goal.title })
    logger.info('Goal completed', { goalId: goal.id })
    announce('Goal marked as complete', 'polite')
  }, [announce])

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteGoalState) return

    try {
      if (userId) {
        const result = await deleteGoalDB(userId, deleteGoalState.id)
        if (result.error) throw result.error
      }

      const setGoals = deleteGoalState.type === 'daily' ? setDailyGoals : setWeeklyGoals
      setGoals(prev => prev.filter(g => g.id !== deleteGoalState.id))
      toast.success('Goal Deleted', { description: deleteGoalState.title })
      logger.info('Goal deleted', { goalId: deleteGoalState.id })
      announce('Goal deleted', 'polite')
    } catch (error) {
      logger.error('Failed to delete goal', { error })
      toast.error('Failed to delete goal')
    }
    setDeleteGoalState(null)
  }, [deleteGoalState, announce, userId])

  // Reset daily goals
  const handleResetDaily = useCallback(() => {
    setDailyGoals(prev => prev.map(g => ({ ...g, current: 0, status: 'pending' })))
    toast.success('Daily Goals Reset')
    logger.info('Daily goals reset')
    announce('Daily goals reset', 'polite')
  }, [announce])

  // Export goals
  const handleExportGoals = useCallback(() => {
    const exportData = {
      dailyGoals,
      weeklyGoals,
      exportedAt: new Date().toISOString(),
      analytics: {
        dailyCompletionRate: Math.round((dailyGoals.filter(g => g.status === 'completed').length / (dailyGoals.length || 1)) * 100),
        weeklyCompletionRate: Math.round((weeklyGoals.filter(g => g.status === 'completed').length / (weeklyGoals.length || 1)) * 100)
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goals-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Goals Exported')
    logger.info('Goals exported')
  }, [dailyGoals, weeklyGoals])

  // Calculate analytics
  const analytics = {
    overallAchievement: Math.round(
      ([...dailyGoals, ...weeklyGoals].reduce((acc, g) => acc + calculateProgress(g), 0)) /
      ([...dailyGoals, ...weeklyGoals].length || 1)
    ),
    dailyRate: Math.round((dailyGoals.filter(g => g.status === 'completed').length / (dailyGoals.length || 1)) * 100),
    weeklyRate: Math.round((weeklyGoals.filter(g => g.status === 'completed').length / (weeklyGoals.length || 1)) * 100)
  }

  // Render goal item
  const renderGoalItem = (goal: Goal) => {
    const colors = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.custom
    const progress = calculateProgress(goal)
    const isComplete = goal.status === 'completed'

    return (
      <div
        key={goal.id}
        className={`flex items-start gap-3 p-3 rounded-lg ${colors.bg} ${colors.border} border group transition-all hover:shadow-md`}
      >
        <div className={`h-5 w-5 mt-0.5 flex-shrink-0 rounded-full ${colors.icon} flex items-center justify-center`}>
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-white" />
          ) : (
            <span className="text-xs text-white font-bold">{progress}%</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={`font-medium ${isComplete ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {goal.title}
            </p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {!isComplete && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleMarkComplete(goal)} title="Mark Complete">
                  <CheckCircle className="h-3 w-3" />
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleEditGoal(goal)} title="Edit">
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => setDeleteGoalState(goal)} title="Delete">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current: {goal.current}/{goal.target} {goal.unit}
            {goal.dueDate && <span className="ml-2">• {goal.dueDate} remaining</span>}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className={`${colors.icon} h-2 rounded-full transition-all`} style={{ width: `${progress}%` }}></div>
            </div>
            {!isComplete && (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handleUpdateProgress(goal, -1)}>-</Button>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handleUpdateProgress(goal, 1)}>+</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading goals...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Goals Tracking</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your progress and achieve your objectives
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportGoals}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleResetDaily}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Daily
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goals */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Goals
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleCreateGoal('daily')}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyGoals.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No daily goals set</p>
            ) : (
              dailyGoals.map(renderGoalItem)
            )}
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleCreateGoal('weekly')}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyGoals.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No weekly goals set</p>
            ) : (
              weeklyGoals.map(renderGoalItem)
            )}
          </CardContent>
        </Card>

        {/* Goal Analytics */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Goal Achievement Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Achievement */}
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Achievement</p>
                <p className="text-4xl font-bold text-purple-700 dark:text-purple-400">{analytics.overallAchievement}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current average</p>
              </div>

              {/* Daily Goals */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Goals</p>
                <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{analytics.dailyRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Completion rate</p>
              </div>

              {/* Weekly Goals */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekly Goals</p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-400">{analytics.weeklyRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Completion rate</p>
              </div>
            </div>

            {/* Streak Tracking */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Current Streaks</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dailyGoals.filter(g => g.status === 'completed').length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Daily complete</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{focusHours}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Focus hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{weeklyGoals.filter(g => g.status === 'completed').length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Weekly complete</p>
                </div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Performance by Category</h4>
              <div className="space-y-3">
                {(['productivity', 'communication', 'learning'] as const).map(category => {
                  const categoryGoals = [...dailyGoals, ...weeklyGoals].filter(g => g.category === category)
                  const rate = categoryGoals.length > 0
                    ? Math.round(categoryGoals.reduce((acc, g) => acc + calculateProgress(g), 0) / categoryGoals.length)
                    : 0
                  const colors = CATEGORY_COLORS[category]
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{category}</span>
                        <span className="font-medium">{rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`${colors.icon} h-2 rounded-full transition-all`} style={{ width: `${rate}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Goal Suggestions */}
            <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI Goal Suggestions
              </h4>
              <div className="space-y-2">
                {analytics.overallAchievement > 80 && (
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">•</span>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Great progress! Consider adding a stretch goal to push yourself further.</p>
                  </div>
                )}
                {analytics.dailyRate < 50 && (
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">•</span>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Focus on completing daily goals first - they build momentum for weekly targets.</p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">Your productivity peaks in mornings - schedule important goals between 9-11 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
            <DialogDescription>
              {editingGoal ? 'Update your goal details' : `Add a new ${formData.type} goal`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                placeholder="e.g., Complete 5 tasks"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                placeholder="Brief description of your goal"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-target">Target</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min={1}
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="goal-unit">Unit</Label>
                <Input
                  id="goal-unit"
                  placeholder="tasks, hours, etc."
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="goal-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Goal['category']) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowGoalDialog(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveGoal} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingGoal ? 'Save Changes' : 'Create Goal'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteGoalState} onOpenChange={() => setDeleteGoalState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteGoalState?.title}". This action cannot be undone.
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
