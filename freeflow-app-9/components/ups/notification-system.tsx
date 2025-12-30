"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUPSNotifications } from '@/hooks/use-ups-integration'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  Filter,
  Search,
  Settings,
  AlertCircle,
  Info,
  AlertTriangle,
  Zap,
  MessageSquare,
  Users,
  Brain,
  Archive,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'

interface NotificationItemProps {
  notification: any
  onRead: (id: string) => void
  onArchive?: (id: string) => void
  onStar?: (id: string) => void
  isSelected?: boolean
  onSelect?: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onArchive,
  onStar,
  isSelected,
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Zap className="w-4 h-4 text-red-500" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium': return <Info className="w-4 h-4 text-blue-500" />
      case 'low': return <AlertCircle className="w-4 h-4 text-gray-400" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4" />
      case 'reply': return <MessageSquare className="w-4 h-4" />
      case 'mention': return <Users className="w-4 h-4" />
      case 'assignment': return <Users className="w-4 h-4" />
      case 'status_change': return <CheckCheck className="w-4 h-4" />
      case 'ai_insight': return <Brain className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date) => {
    if (isToday(date)) return format(date, 'h:mm a')
    if (isYesterday(date)) return 'Yesterday'
    if (isThisWeek(date)) return format(date, 'EEE')
    return format(date, 'MMM d')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative group transition-all duration-200",
        isSelected && "ring-2 ring-primary"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "cursor-pointer transition-all duration-200",
        !notification.read && "bg-primary/5 border-primary/20",
        notification.read && "opacity-75",
        isHovered && "shadow-md"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Priority & Type Icons */}
            <div className="flex flex-col items-center space-y-1 mt-1">
              {getPriorityIcon(notification.priority)}
              {getTypeIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0" onClick={() => onSelect?.(notification.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={cn(
                    "text-sm font-medium truncate",
                    !notification.read && "font-semibold"
                  )}>
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(new Date(notification.createdAt))}
                  </span>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center space-x-1 mt-2"
                  >
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRead(notification.id)
                        }}
                        className="h-6 px-2"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark Read
                      </Button>
                    )}

                    {onStar && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStar(notification.id)
                        }}
                        className="h-6 px-2"
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                    )}

                    {onArchive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onArchive(notification.id)
                        }}
                        className="h-6 px-2"
                      >
                        <Archive className="w-3 h-3" />
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface NotificationFiltersProps {
  priorityFilter: string[]
  onPriorityFilterChange: (priorities: string[]) => void
  typeFilter: string[]
  onTypeFilterChange: (types: string[]) => void
  dateFilter: 'all' | 'today' | 'week' | 'month'
  onDateFilterChange: (filter: string) => void
  readFilter: 'all' | 'unread' | 'read'
  onReadFilterChange: (filter: string) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  priorityFilter,
  onPriorityFilterChange,
  typeFilter,
  onTypeFilterChange,
  dateFilter,
  onDateFilterChange,
  readFilter,
  onReadFilterChange,
  searchQuery,
  onSearchQueryChange
}) => {
  const priorities = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
    { value: 'low', label: 'Low', color: 'bg-gray-400' }
  ]

  const types = [
    { value: 'comment', label: 'Comments', icon: MessageSquare },
    { value: 'reply', label: 'Replies', icon: MessageSquare },
    { value: 'mention', label: 'Mentions', icon: Users },
    { value: 'assignment', label: 'Assignments', icon: Users },
    { value: 'status_change', label: 'Status Changes', icon: CheckCheck },
    { value: 'ai_insight', label: 'AI Insights', icon: Brain }
  ]

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={readFilter} onValueChange={onReadFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Filter */}
      <div>
        <Label className="text-sm font-medium">Priority</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {priorities.map((priority) => (
            <div key={priority.value} className="flex items-center space-x-2">
              <Switch
                id={`priority-${priority.value}`}
                checked={priorityFilter.includes(priority.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onPriorityFilterChange([...priorityFilter, priority.value])
                  } else {
                    onPriorityFilterChange(priorityFilter.filter(p => p !== priority.value))
                  }
                }}
              />
              <Label
                htmlFor={`priority-${priority.value}`}
                className="flex items-center space-x-2 text-sm"
              >
                <div className={cn("w-2 h-2 rounded-full", priority.color)} />
                <span>{priority.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <Label className="text-sm font-medium">Type</Label>
        <div className="grid grid-cols-1 gap-1 mt-2">
          {types.map((type) => {
            const Icon = type.icon
            return (
              <div key={type.value} className="flex items-center space-x-2">
                <Switch
                  id={`type-${type.value}`}
                  checked={typeFilter.includes(type.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onTypeFilterChange([...typeFilter, type.value])
                    } else {
                      onTypeFilterChange(typeFilter.filter(t => t !== type.value))
                    }
                  }}
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Icon className="w-3 h-3" />
                  <span>{type.label}</span>
                </Label>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface NotificationSettingsProps {
  isNotificationsEnabled: boolean
  onNotificationsEnabledChange: (enabled: boolean) => void
  priorityFilter: string[]
  onPriorityFilterChange: (priorities: string[]) => void
  soundEnabled: boolean
  onSoundEnabledChange: (enabled: boolean) => void
  desktopEnabled: boolean
  onDesktopEnabledChange: (enabled: boolean) => void
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isNotificationsEnabled,
  onNotificationsEnabledChange,
  priorityFilter,
  onPriorityFilterChange,
  soundEnabled,
  onSoundEnabledChange,
  desktopEnabled,
  onDesktopEnabledChange
}) => {
  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Enable Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive notifications for UPS activities
          </p>
        </div>
        <Switch
          checked={isNotificationsEnabled}
          onCheckedChange={onNotificationsEnabledChange}
        />
      </div>

      <Separator />

      {/* Sound Settings */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Sound Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Play sound for new notifications
          </p>
        </div>
        <Switch
          checked={soundEnabled}
          onCheckedChange={onSoundEnabledChange}
          disabled={!isNotificationsEnabled}
        />
      </div>

      {/* Desktop Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Desktop Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Show desktop notifications when browser is in background
          </p>
        </div>
        <Switch
          checked={desktopEnabled}
          onCheckedChange={onDesktopEnabledChange}
          disabled={!isNotificationsEnabled}
        />
      </div>

      <Separator />

      {/* Priority Settings */}
      <div>
        <Label className="text-base font-medium">Priority Notifications</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose which priority levels to receive notifications for
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'urgent', label: 'Urgent', description: 'Critical issues' },
            { value: 'high', label: 'High', description: 'Important updates' },
            { value: 'medium', label: 'Medium', description: 'General updates' },
            { value: 'low', label: 'Low', description: 'Minor updates' }
          ].map((priority) => (
            <div key={priority.value} className="flex items-start space-x-2">
              <Switch
                id={`setting-priority-${priority.value}`}
                checked={priorityFilter.includes(priority.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onPriorityFilterChange([...priorityFilter, priority.value])
                  } else {
                    onPriorityFilterChange(priorityFilter.filter(p => p !== priority.value))
                  }
                }}
                disabled={!isNotificationsEnabled}
              />
              <div>
                <Label
                  htmlFor={`setting-priority-${priority.value}`}
                  className="text-sm font-medium"
                >
                  {priority.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {priority.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface UPSNotificationSystemProps {
  className?: string
  maxHeight?: string
  showInlineSettings?: boolean
  onNotificationClick?: (notification: any) => void
}

export const UPSNotificationSystem: React.FC<UPSNotificationSystemProps> = ({
  className,
  maxHeight = "600px",
  showInlineSettings = false,
  onNotificationClick
}) => {
  const {
    notifications,
    unreadCount,
    priorityFilter,
    isNotificationsEnabled,
    markAsRead,
    markAllAsRead,
    clearAll,
    setPriorityFilter,
    setIsNotificationsEnabled
  } = useUPSNotifications()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string[]>(['comment', 'reply', 'mention', 'assignment', 'status_change', 'ai_insight'])
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [desktopEnabled, setDesktopEnabled] = useState(false)

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    filtered = filtered.filter(n => typeFilter.includes(n.type))

    // Read filter
    if (readFilter === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (readFilter === 'read') {
      filtered = filtered.filter(n => n.read)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(n => {
        const notificationDate = new Date(n.createdAt)
        switch (dateFilter) {
          case 'today':
            return isToday(notificationDate)
          case 'week':
            return isThisWeek(notificationDate)
          case 'month':
            return notificationDate.getMonth() === now.getMonth() &&
                   notificationDate.getFullYear() === now.getFullYear()
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, searchQuery, typeFilter, readFilter, dateFilter])

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, any[]> = {}

    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt)
      let key: string

      if (isToday(date)) {
        key = 'Today'
      } else if (isYesterday(date)) {
        key = 'Yesterday'
      } else if (isThisWeek(date)) {
        key = format(date, 'EEEE')
      } else {
        key = format(date, 'MMM d, yyyy')
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(notification)
    })

    return groups
  }, [filteredNotifications])

  // Handle bulk actions
  const handleSelectAll = useCallback(() => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }, [selectedNotifications, filteredNotifications])

  const handleMarkSelectedAsRead = useCallback(() => {
    selectedNotifications.forEach(id => markAsRead(id))
    setSelectedNotifications([])
  }, [selectedNotifications, markAsRead])

  // Desktop notifications
  useEffect(() => {
    if (desktopEnabled && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [desktopEnabled])

  // Show desktop notification for new notifications
  useEffect(() => {
    if (desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const latestNotification = notifications[0]
      if (latestNotification && !latestNotification.read && latestNotification.priority !== 'low') {
        new Notification(latestNotification.title, {
          body: latestNotification.message,
          icon: '/favicon.ico'
        })
      }
    }
  }, [notifications, desktopEnabled])

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="relative">
            {isNotificationsEnabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <NotificationFilters
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                dateFilter={dateFilter}
                onDateFilterChange={(filter) => setDateFilter(filter as any)}
                readFilter={readFilter}
                onReadFilterChange={(filter) => setReadFilter(filter as any)}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </PopoverContent>
          </Popover>

          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notification Settings</SheetTitle>
                <SheetDescription>
                  Configure your notification preferences
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <NotificationSettings
                  isNotificationsEnabled={isNotificationsEnabled}
                  onNotificationsEnabledChange={setIsNotificationsEnabled}
                  priorityFilter={priorityFilter}
                  onPriorityFilterChange={setPriorityFilter}
                  soundEnabled={soundEnabled}
                  onSoundEnabledChange={setSoundEnabled}
                  desktopEnabled={desktopEnabled}
                  onDesktopEnabledChange={setDesktopEnabled}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
          <span className="text-sm text-muted-foreground">
            {selectedNotifications.length} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkSelectedAsRead}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedNotifications([])}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSelectAll}
            >
              {selectedNotifications.length === filteredNotifications.length ? (
                <CheckCheck className="w-4 h-4 mr-1" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
            >
              <Archive className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea className="flex-1" style={{ maxHeight }}>
        <div className="p-4 space-y-4">
          {Object.keys(groupedNotifications).length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || readFilter !== 'all' || typeFilter.length < 6
                  ? 'No notifications match your current filters'
                  : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, groupNotifications]) => (
              <div key={date}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur py-2">
                  {date}
                </h4>
                <div className="space-y-2">
                  <AnimatePresence>
                    {groupNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={markAsRead}
                        isSelected={selectedNotifications.includes(notification.id)}
                        onSelect={(id) => {
                          if (selectedNotifications.includes(id)) {
                            setSelectedNotifications(prev => prev.filter(nId => nId !== id))
                          } else {
                            setSelectedNotifications(prev => [...prev, id])
                          }

                          if (onNotificationClick) {
                            onNotificationClick(notification)
                          }
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default UPSNotificationSystem