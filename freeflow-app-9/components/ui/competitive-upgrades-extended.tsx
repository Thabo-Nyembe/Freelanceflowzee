"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  Flag,
  Hash,
  Inbox,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  User,
  Zap,
  Calendar,
  ArrowRight,
  Pin,
  Archive,
  Trash2,
  Edit,
  RefreshCw,
  List,
  LayoutGrid,
  SlidersHorizontal,
  Activity,
  FileText,
  FolderOpen,
  Trophy,
  Crown,
  Flame,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// ============================================================================
// 1. ADVANCED ACTIVITY FEED (Like Slack + Notion Combined)
// ============================================================================

interface ActivityItem {
  id: string
  type: 'comment' | 'update' | 'create' | 'delete' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration'
  title: string
  description?: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  target?: {
    type: string
    name: string
    url?: string
  }
  metadata?: Record<string, unknown>
  timestamp: Date
  isRead?: boolean
  isPinned?: boolean
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'default' | 'destructive'
  }>
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onPin?: (id: string) => void
  onArchive?: (id: string) => void
  filters?: string[]
  className?: string
}

export function ActivityFeed({
  activities = [],
  onMarkRead,
  onMarkAllRead,
  onPin,
  onArchive,
  filters = ['all', 'mentions', 'updates', 'comments'],
  className
}: ActivityFeedProps) {
  const [activeFilter, setActiveFilter] = React.useState('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false)

  if (!activities || activities.length === 0) return null

  const unreadCount = activities.filter(a => !a.isRead).length

  const filteredActivities = React.useMemo(() => {
    return activities.filter(activity => {
      // Filter by type
      if (activeFilter !== 'all') {
        if (activeFilter === 'mentions' && activity.type !== 'mention') return false
        if (activeFilter === 'updates' && !['update', 'status_change'].includes(activity.type)) return false
        if (activeFilter === 'comments' && activity.type !== 'comment') return false
      }

      // Filter unread
      if (showUnreadOnly && activity.isRead) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          activity.title.toLowerCase().includes(query) ||
          activity.description?.toLowerCase().includes(query) ||
          activity.user.name.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [activities, activeFilter, showUnreadOnly, searchQuery])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'update': return <Edit className="h-4 w-4 text-amber-500" />
      case 'create': return <Plus className="h-4 w-4 text-green-500" />
      case 'delete': return <Trash2 className="h-4 w-4 text-red-500" />
      case 'mention': return <Hash className="h-4 w-4 text-purple-500" />
      case 'assignment': return <User className="h-4 w-4 text-indigo-500" />
      case 'status_change': return <RefreshCw className="h-4 w-4 text-cyan-500" />
      case 'milestone': return <Flag className="h-4 w-4 text-emerald-500" />
      case 'integration': return <Zap className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date()
    const dateObj = date instanceof Date ? date : new Date(date)
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return dateObj.toLocaleDateString()
  }

  const groupActivitiesByDate = (items: ActivityItem[]) => {
    const groups: Record<string, ActivityItem[]> = {}

    items.forEach(item => {
      const timestamp = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)
      const date = timestamp.toDateString()
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()

      let key = date
      if (date === today) key = 'Today'
      else if (date === yesterday) key = 'Yesterday'

      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })

    return groups
  }

  const groupedActivities = groupActivitiesByDate(filteredActivities)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Activity Feed</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark all notifications as read</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="unread-only"
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
            />
            <Label htmlFor="unread-only" className="text-sm">Unread only</Label>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-3">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="capitalize"
            >
              {filter}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {Object.keys(groupedActivities).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-4 opacity-50" />
              <p>No activities found</p>
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(groupedActivities).map(([date, items]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-muted/50 backdrop-blur-sm px-4 py-2">
                    <p className="text-xs font-medium text-muted-foreground">{date}</p>
                  </div>
                  <div className="divide-y">
                    {items.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                          !activity.isRead && "bg-primary/5",
                          activity.isPinned && "border-l-2 border-l-amber-500"
                        )}
                        onClick={() => onMarkRead?.(activity.id)}
                      >
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {activity.user?.avatar ? (
                              <AvatarImage src={activity.user.avatar} />
                            ) : null}
                            <AvatarFallback>
                              {(activity.user?.name || 'U').split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getActivityIcon(activity.type)}
                                <span className="font-medium text-sm">{activity.user?.name || 'User'}</span>
                                <span className="text-sm text-muted-foreground">{activity.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>

                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {activity.description}
                              </p>
                            )}

                            {activity.target && (
                              <div className="flex items-center gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {activity.target.type}
                                </Badge>
                                <span className="text-xs text-primary hover:underline">
                                  {activity.target.name}
                                </span>
                              </div>
                            )}

                            {/* Quick Actions */}
                            {activity.actions && (
                              <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {activity.actions.map((action, i) => (
                                  <Button
                                    key={i}
                                    variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      action.action()
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Pin/Archive Actions */}
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onPin?.(activity.id)
                                    }}
                                  >
                                    <Pin className={cn("h-3 w-3", activity.isPinned && "text-amber-500")} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{activity.isPinned ? 'Unpin' : 'Pin'}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onArchive?.(activity.id)
                                    }}
                                  >
                                    <Archive className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Archive</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 2. GOAL TRACKING & OKR WIDGET (Like Asana Goals + Lattice)
// ============================================================================

interface KeyResult {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit: string
  status: 'on_track' | 'at_risk' | 'behind' | 'completed'
}

interface Goal {
  id: string
  title: string
  description?: string
  owner: {
    id: string
    name: string
    avatar?: string
  }
  team?: string
  progress: number
  status: 'on_track' | 'at_risk' | 'behind' | 'completed' | 'not_started'
  priority: 'critical' | 'high' | 'medium' | 'low'
  dueDate: Date
  keyResults?: KeyResult[]
  linkedProjects?: string[]
  updates?: Array<{
    content: string
    author: string
    date: Date
  }>
}

interface GoalTrackerProps {
  goals: Goal[]
  onUpdateProgress?: (goalId: string, progress: number) => void
  onAddUpdate?: (goalId: string, update: string) => void
  className?: string
}

export function GoalTracker({
  goals,
  onUpdateProgress,
  onAddUpdate,
  className
}: GoalTrackerProps) {
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null)
  const [viewMode, setViewMode] = React.useState<'list' | 'board'>('list')

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'on_track': return 'bg-green-500'
      case 'at_risk': return 'bg-amber-500'
      case 'behind': return 'bg-red-500'
      case 'completed': return 'bg-blue-500'
      case 'not_started': return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: Goal['status']) => {
    switch (status) {
      case 'on_track': return 'On Track'
      case 'at_risk': return 'At Risk'
      case 'behind': return 'Behind'
      case 'completed': return 'Completed'
      case 'not_started': return 'Not Started'
    }
  }

  const getPriorityIcon = (priority: Goal['priority']) => {
    switch (priority) {
      case 'critical': return <Flame className="h-4 w-4 text-red-500" />
      case 'high': return <ArrowRight className="h-4 w-4 text-orange-500 rotate-[-45deg]" />
      case 'medium': return <ArrowRight className="h-4 w-4 text-yellow-500" />
      case 'low': return <ArrowRight className="h-4 w-4 text-green-500 rotate-45" />
    }
  }

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0

  const statusCounts = goals.reduce((acc, goal) => {
    acc[goal.status] = (acc[goal.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Goals & OKRs</CardTitle>
            <Badge variant="secondary">{goals.length} active</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('board')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{overallProgress}%</p>
            <p className="text-xs text-muted-foreground">Overall Progress</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <p className="text-2xl font-bold text-green-600">{statusCounts['on_track'] || 0}</p>
            <p className="text-xs text-muted-foreground">On Track</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <p className="text-2xl font-bold text-amber-600">{statusCounts['at_risk'] || 0}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <p className="text-2xl font-bold text-blue-600">{statusCounts['completed'] || 0}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          {viewMode === 'list' ? (
            <div className="divide-y">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-1 h-full self-stretch rounded-full", getStatusColor(goal.status))} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(goal.priority)}
                        <h4 className="font-medium truncate">{goal.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {getStatusLabel(goal.status)}
                        </Badge>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {goal.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Progress value={goal.progress} className="h-2" />
                          <span className="text-sm font-medium w-12">{goal.progress}%</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            {goal.owner.avatar ? (
                              <AvatarImage src={goal.owner.avatar} />
                            ) : null}
                            <AvatarFallback className="text-[10px]">
                              {goal.owner.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{goal.owner.name}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {goal.dueDate.toLocaleDateString()}
                        </div>
                      </div>

                      {/* Expanded Key Results */}
                      <AnimatePresence>
                        {selectedGoal?.id === goal.id && goal.keyResults && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t space-y-3"
                          >
                            <p className="text-sm font-medium">Key Results</p>
                            {goal.keyResults.map((kr) => (
                              <div key={kr.id} className="flex items-center gap-3">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  kr.status === 'completed' ? 'bg-green-500' :
                                  kr.status === 'on_track' ? 'bg-blue-500' :
                                  kr.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'
                                )} />
                                <span className="text-sm flex-1">{kr.title}</span>
                                <span className="text-sm font-medium">
                                  {kr.currentValue} / {kr.targetValue} {kr.unit}
                                </span>
                                <Progress
                                  value={(kr.currentValue / kr.targetValue) * 100}
                                  className="w-20 h-2"
                                />
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      selectedGoal?.id === goal.id && "rotate-90"
                    )} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 p-4">
              {(['not_started', 'on_track', 'completed'] as const).map((status) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(status))} />
                    <span className="font-medium text-sm capitalize">{getStatusLabel(status)}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {goals.filter(g => g.status === status).length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {goals
                      .filter(g => g.status === status)
                      .map((goal) => (
                        <motion.div
                          key={goal.id}
                          layout
                          className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(goal.priority)}
                            <span className="font-medium text-sm truncate">{goal.title}</span>
                          </div>
                          <Progress value={goal.progress} className="h-1.5 mt-2" />
                          <div className="flex items-center justify-between mt-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {goal.owner.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 3. SMART SEARCH WITH FILTERS (Like Algolia + Notion Combined)
// ============================================================================

interface SearchResult {
  id: string
  type: 'page' | 'project' | 'task' | 'document' | 'person' | 'message' | 'file'
  title: string
  description?: string
  url?: string
  icon?: React.ReactNode
  metadata?: Record<string, string>
  score?: number
  highlights?: string[]
}

interface SmartSearchProps {
  onSearch?: (query: string, filters: Record<string, string[]>) => Promise<SearchResult[]>
  recentSearches?: string[]
  suggestedFilters?: Array<{ key: string; values: string[] }>
  className?: string
}

export function SmartSearch({
  onSearch,
  recentSearches = [],
  suggestedFilters = [],
  className
}: SmartSearchProps) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [showFilters, setShowFilters] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'page': return <FileText className="h-4 w-4" />
      case 'project': return <FolderOpen className="h-4 w-4" />
      case 'task': return <CheckCircle className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'person': return <User className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'file': return <FileText className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      if (onSearch) {
        const searchResults = await onSearch(query, activeFilters)
        setResults(searchResults)
      } else {
        // Mock search results
        await new Promise(resolve => setTimeout(resolve, 500))
        setResults([
          { id: '1', type: 'project', title: 'Marketing Campaign Q1', description: 'Main marketing initiative for Q1 2025', score: 0.95 },
          { id: '2', type: 'task', title: 'Update brand guidelines', description: 'Review and update brand guidelines document', score: 0.88 },
          { id: '3', type: 'document', title: 'Marketing Strategy 2025', description: 'Comprehensive marketing strategy document', score: 0.82 },
          { id: '4', type: 'person', title: 'Sarah Marketing', description: 'Marketing Manager', score: 0.75 },
          { id: '5', type: 'message', title: 'Meeting notes: Marketing sync', description: 'Notes from last week\'s marketing sync', score: 0.70 },
        ])
      }
    } finally {
      setIsSearching(false)
    }
  }

  React.useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, activeFilters])

  const toggleFilter = (key: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[key] || []
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) }
      }
      return { ...prev, [key]: [...current, value] }
    })
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className={cn("h-4 w-4", showFilters && "text-primary")} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && suggestedFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {suggestedFilters.map((filter) => (
                <div key={filter.key}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 capitalize">{filter.key}</p>
                  <div className="flex flex-wrap gap-1">
                    {filter.values.map((value) => (
                      <Button
                        key={value}
                        variant={activeFilters[filter.key]?.includes(value) ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleFilter(filter.key, value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {isSearching ? (
          <div className="mt-4 flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Search className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          </div>
        ) : results.length > 0 ? (
          <div className="mt-4 space-y-1">
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="p-2 rounded bg-muted">
                  {result.icon || getTypeIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {result.type}
                </Badge>
                {result.score && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(result.score * 100)}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        ) : query.length === 0 && recentSearches.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent searches</p>
            <div className="space-y-1">
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(search)}
                  className="flex items-center gap-2 w-full p-2 text-sm text-left rounded-lg hover:bg-muted transition-colors"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        ) : query.length >= 2 ? (
          <div className="mt-4 text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No results found for "{query}"</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 4. QUICK ACTIONS TOOLBAR (Like Linear + Notion Combined)
// ============================================================================

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  category?: string
  description?: string
}

interface QuickActionsToolbarProps {
  actions: QuickAction[]
  position?: 'bottom' | 'top' | 'floating'
  variant?: 'default' | 'grid' | 'compact' | 'inline'
  className?: string
}

export function QuickActionsToolbar({
  actions = [],
  position = 'bottom',
  variant = 'default',
  className
}: QuickActionsToolbarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (!actions || actions.length === 0) return null

  const groupedActions = React.useMemo(() => {
    const groups: Record<string, QuickAction[]> = {}
    actions.forEach(action => {
      const category = action.category || 'General'
      if (!groups[category]) groups[category] = []
      groups[category].push(action)
    })
    return groups
  }, [actions])

  const positionClasses = {
    bottom: 'fixed bottom-4 left-1/2 -translate-x-1/2',
    top: 'fixed top-4 left-1/2 -translate-x-1/2',
    floating: 'fixed bottom-20 right-4',
  }

  // Grid variant - displays actions in a grid layout (non-fixed position)
  if (variant === 'grid') {
    return (
      <div
        className={cn(
          "p-4 bg-background border rounded-xl",
          className
        )}
      >
        <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-muted"
              onClick={action.action}
            >
              {action.icon}
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // Compact variant - horizontal list of small buttons
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          "flex items-center gap-1 p-1 bg-background border rounded-lg",
          className
        )}
      >
        {actions.map((action) => (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={action.action}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>{action.label}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  // Inline variant - horizontal list with labels
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          className
        )}
      >
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="h-8"
            onClick={action.action}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}
      </div>
    )
  }

  // Default variant - floating toolbar with expand functionality
  return (
    <motion.div
      className={cn(
        "z-50",
        positionClasses[position],
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-2 p-4 bg-background border rounded-xl shadow-2xl min-w-[300px]"
          >
            {Object.entries(groupedActions).map(([category, categoryActions]) => (
              <div key={category} className="mb-4 last:mb-0">
                <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                <div className="grid grid-cols-2 gap-1">
                  {categoryActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action()
                        setIsExpanded(false)
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      {action.icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{action.label}</p>
                        {action.description && (
                          <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                        )}
                      </div>
                      {action.shortcut && (
                        <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">{action.shortcut}</kbd>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 p-1 bg-background border rounded-full shadow-lg">
        {/* Primary Actions */}
        {actions.slice(0, 4).map((action) => (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={action.action}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <span>{action.label}</span>
                  {action.shortcut && <kbd className="text-xs bg-muted px-1 rounded">{action.shortcut}</kbd>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Expand Button */}
        {actions.length > 4 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <motion.div animate={{ rotate: isExpanded ? 45 : 0 }}>
              <Plus className="h-5 w-5" />
            </motion.div>
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// 5. GAMIFICATION & ACHIEVEMENTS (Like Duolingo + LinkedIn)
// ============================================================================

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  target: number
  isUnlocked: boolean
  unlockedAt?: Date
  xp: number
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface UserStats {
  level: number
  currentXP: number
  nextLevelXP: number
  streak: number
  totalAchievements: number
  rank?: number
}

interface GamificationWidgetProps {
  stats: UserStats
  achievements: Achievement[]
  onClaim?: (achievementId: string) => void
  className?: string
}

export function GamificationWidget({
  stats,
  achievements,
  onClaim,
  className
}: GamificationWidgetProps) {
  const [showAllAchievements, setShowAllAchievements] = React.useState(false)

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-amber-400 to-orange-500'
    }
  }

  const getRarityBorder = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-400'
      case 'rare': return 'border-blue-500'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-amber-500'
    }
  }

  const unclaimedAchievements = achievements.filter(a => a.isUnlocked && !a.unlockedAt)
  const recentAchievements = achievements
    .filter(a => a.isUnlocked)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 4)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </div>
          {stats.rank && (
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500">
              <Crown className="h-3 w-3 mr-1" />
              Rank #{stats.rank}
            </Badge>
          )}
        </div>

        {/* Level Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {stats.level}
              </div>
              <div>
                <p className="font-medium">Level {stats.level}</p>
                <p className="text-xs text-muted-foreground">{stats.currentXP} / {stats.nextLevelXP} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-5 w-5" />
              <span className="font-bold">{stats.streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
          </div>
          <Progress value={(stats.currentXP / stats.nextLevelXP) * 100} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Unclaimed Achievements Alert */}
        {unclaimedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="font-medium">You have {unclaimedAchievements.length} new achievement{unclaimedAchievements.length > 1 ? 's' : ''} to claim!</span>
            </div>
          </motion.div>
        )}

        {/* Recent Achievements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Recent Achievements</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllAchievements(true)}
            >
              View all ({stats.totalAchievements})
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative p-3 rounded-xl border-2 overflow-hidden",
                  getRarityBorder(achievement.rarity),
                  achievement.isUnlocked ? 'opacity-100' : 'opacity-50'
                )}
              >
                {/* Rarity Gradient Background */}
                <div className={cn(
                  "absolute inset-0 opacity-10 bg-gradient-to-br",
                  getRarityColor(achievement.rarity)
                )} />

                <div className="relative flex items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br",
                    getRarityColor(achievement.rarity)
                  )}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">+{achievement.xp} XP</p>
                  </div>
                </div>

                {!achievement.unlockedAt && achievement.isUnlocked && (
                  <Button
                    size="sm"
                    className="w-full mt-2 h-7"
                    onClick={() => onClaim?.(achievement.id)}
                  >
                    Claim Reward
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress on Locked Achievements */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">In Progress</p>
          {achievements
            .filter(a => !a.isUnlocked && a.progress > 0)
            .slice(0, 3)
            .map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-50">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm truncate">{achievement.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <Progress value={(achievement.progress / achievement.target) * 100} className="h-1.5 mt-1" />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  type ActivityItem,
  type Goal,
  type KeyResult,
  type SearchResult,
  type QuickAction,
  type Achievement,
  type UserStats,
}
