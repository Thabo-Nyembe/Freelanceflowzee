'use client'

import { useState, useEffect } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoQuickAction,
  BentoProgress,
  BentoList
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  CircularProgress,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Target,
  Timer,
  TrendingUp,
  Brain,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Briefcase,
  Lightbulb,
  Zap,
  Clock,
  Settings,
  BarChart3,
  CalendarDays,
  FolderKanban,
  Flame,
  Award,
  Trash2
} from 'lucide-react'
import { useMyDayTasks, useFocusSessions, MyDayTask } from '@/lib/hooks/use-my-day'
import { createMyDayTask, completeMyDayTask, deleteMyDayTask, startFocusSession, endFocusSession } from '@/app/actions/my-day'

interface MyDayClientProps {
  initialTasks: MyDayTask[]
  initialSessions: any[]
}

export default function MyDayClient({ initialTasks, initialSessions }: MyDayClientProps) {
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'urgent'>('all')
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as const })

  const { tasks, stats, fetchTasks, completeTask } = useMyDayTasks(initialTasks)
  const { sessions, activeSession, totalFocusMinutes, startSession, endSession, fetchTodaySessions } = useFocusSessions(initialSessions)

  useEffect(() => {
    fetchTasks()
    fetchTodaySessions()
  }, [fetchTasks, fetchTodaySessions])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const completedTasks = stats.completed
  const totalTasks = stats.total
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const displayStats = [
    { label: 'Tasks Completed', value: `${completedTasks}/${totalTasks}`, change: 12.5, icon: <Target className="w-5 h-5" /> },
    { label: 'Focus Time', value: `${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`, change: 8.3, icon: <Timer className="w-5 h-5" /> },
    { label: 'Productivity', value: `${completionRate}%`, change: 5.2, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'High Priority', value: String(stats.highPriority), change: 0, icon: <Flame className="w-5 h-5" /> }
  ]

  const recentActivity = [
    { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Tasks completed today', description: `${completedTasks} tasks done`, time: 'Today', status: 'success' as const },
    { icon: <Play className="w-5 h-5" />, title: 'Focus sessions', description: `${sessions.length} sessions`, time: 'Today', status: 'info' as const }
  ]

  const progressItems = [
    { label: 'Daily Goal Progress', value: completedTasks, total: Math.max(totalTasks, 1), color: 'bg-violet-600' },
    { label: 'Focus Time Goal', value: totalFocusMinutes, total: 240, color: 'bg-green-600' }
  ]

  const subPages = [
    { icon: <Target className="w-6 h-6" />, title: 'Goals', description: 'Set targets', onClick: () => window.location.href = '/dashboard/roadmap-v2' },
    { icon: <CalendarDays className="w-6 h-6" />, title: 'Schedule', description: 'Time blocks', onClick: () => window.location.href = '/dashboard/calendar-v2' },
    { icon: <FolderKanban className="w-6 h-6" />, title: 'Projects', description: "Today's work", onClick: () => window.location.href = '/dashboard/projects-hub-v2' },
    { icon: <Lightbulb className="w-6 h-6" />, title: 'Insights', description: 'Productivity', onClick: () => window.location.href = '/dashboard/analytics-v2' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Analytics', description: 'Trends', onClick: () => window.location.href = '/dashboard/performance-analytics-v2' }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return
    try {
      await createMyDayTask({
        title: newTask.title,
        priority: newTask.priority,
        due_date: new Date().toISOString().split('T')[0]
      })
      setNewTask({ title: '', priority: 'medium' })
      setShowAddTask(false)
      fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeMyDayTask(taskId)
      fetchTasks()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteMyDayTask(taskId)
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleStartTimer = async (taskId: string) => {
    if (activeTimer === taskId) {
      // Stop timer
      if (activeSession) {
        await endFocusSession(activeSession.id)
      }
      setActiveTimer(null)
      setTimerSeconds(0)
    } else {
      // Start timer
      await startFocusSession(taskId, 'focus')
      setActiveTimer(taskId)
      setTimerSeconds(0)
    }
    fetchTodaySessions()
  }

  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'urgent') return task.priority === 'urgent' || task.priority === 'high'
    if (selectedFilter === 'today') return task.due_date === new Date().toISOString().split('T')[0]
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/40 dark:from-orange-950 dark:via-amber-950/30 dark:to-yellow-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-10 h-10 text-orange-600" />
              My Day
            </h1>
            <p className="text-muted-foreground">Focus on what matters most today</p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton icon={<Brain />} ariaLabel="AI Insights" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="orange" to="amber" onClick={() => setShowAddTask(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </GradientButton>
          </div>
        </div>

        {/* Quick Stats */}
        <StatGrid columns={4} stats={displayStats} />

        {/* Sub-Page Navigation */}
        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {subPages.map((page, index) => (
              <BentoQuickAction
                key={index}
                icon={page.icon}
                title={page.title}
                description={page.description}
                onClick={page.onClick}
              />
            ))}
          </div>
        </BentoCard>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Task Form */}
            {showAddTask && (
              <BentoCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                      <PillButton
                        key={p}
                        variant={newTask.priority === p ? 'primary' : 'ghost'}
                        onClick={() => setNewTask(prev => ({ ...prev, priority: p }))}
                      >
                        {p}
                      </PillButton>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <ModernButton variant="primary" onClick={handleAddTask}>Add Task</ModernButton>
                    <ModernButton variant="ghost" onClick={() => setShowAddTask(false)}>Cancel</ModernButton>
                  </div>
                </div>
              </BentoCard>
            )}

            {/* Active Timer */}
            {activeTimer && (
              <BentoCard gradient="orange" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Timer Active</h3>
                      <p className="text-white/80 text-sm">
                        Working on: {tasks.find(t => t.id === activeTimer)?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-white text-right">
                      <div className="text-3xl font-bold">{formatTime(timerSeconds)}</div>
                      <div className="text-white/80 text-sm">Elapsed time</div>
                    </div>
                    <ModernButton
                      variant="ghost"
                      onClick={() => handleStartTimer(activeTimer)}
                      className="text-white hover:bg-white/20"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </ModernButton>
                  </div>
                </div>
              </BentoCard>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Filter:</span>
              <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All Tasks</PillButton>
              <PillButton variant={selectedFilter === 'today' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('today')}>Today</PillButton>
              <PillButton variant={selectedFilter === 'urgent' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('urgent')}>Urgent</PillButton>
            </div>

            {/* Tasks List */}
            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Today's Tasks
                </h3>
                <div className="text-sm text-muted-foreground">
                  {stats.pending} remaining
                </div>
              </div>

              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks yet. Add your first task!</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all ${
                        task.status === 'completed'
                          ? 'bg-gray-50 border-gray-200 opacity-75'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button className="mt-1" onClick={() => handleCompleteTask(task.id)}>
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              task.status === 'completed' ? 'text-green-600 fill-green-100' : 'text-gray-400'
                            }`}
                          />
                        </button>

                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.estimated_minutes && (
                              <span className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {task.estimated_minutes}m
                              </span>
                            )}
                            {task.due_time && (
                              <span className="text-xs px-2 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.due_time}
                              </span>
                            )}
                          </div>

                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {task.status !== 'completed' && (
                            <ModernButton
                              variant={activeTimer === task.id ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleStartTimer(task.id)}
                            >
                              {activeTimer === task.id ? (
                                <><Pause className="w-3 h-3 mr-1" />Active</>
                              ) : (
                                <><Play className="w-3 h-3 mr-1" />Start</>
                              )}
                            </ModernButton>
                          )}
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            ariaLabel="Delete task"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress Metrics */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Progress</h3>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <CircularProgress value={completionRate} max={100} size={120} strokeWidth={10} label="Today" />
                  <p className="mt-3 text-sm text-muted-foreground">Daily completion</p>
                </div>

                <div className="space-y-3">
                  {progressItems.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{Math.round((item.value / item.total) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${Math.min((item.value / item.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Quick Actions */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/calendar-v2'}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/messages-v2'}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Check Messages
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/projects-hub-v2'}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  View Projects
                </ModernButton>
              </div>
            </BentoCard>

            {/* Recent Activity */}
            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            {/* AI Tips */}
            <BentoCard gradient="violet" className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI Productivity Tips
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-white font-medium">Peak Performance Window</p>
                  <p className="text-xs text-white/80 mt-1">Your most productive hours are 9-11 AM. Schedule challenging work during this time.</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-white font-medium">Break Reminder</p>
                  <p className="text-xs text-white/80 mt-1">Take a 15-minute break after 90 minutes of focused work.</p>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
