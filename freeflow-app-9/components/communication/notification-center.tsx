"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommunicationStore } from '@/lib/communication/unified-communication-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Bell,
  MessageSquare,
  Phone,
  Users,
  CheckCircle,
  Info,
  Star,
  Archive,
  Trash2,
  MoreHorizontal,
  Search,
  Settings,
  Eye,
  Pin,
  Bookmark,
  Reply,
  Forward
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns'

interface NotificationItemProps {
  notification: any
  onRead: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onStar: (id: string) => void
  onPin: (id: string) => void
  onClick?: (notification: any) => void
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onArchive,
  onDelete,
  onStar,
  onPin,
  onClick,
  isSelected = false,
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'call': return <Phone className="w-4 h-4 text-green-500" />
      case 'mention': return <Users className="w-4 h-4 text-orange-500" />
      case 'reaction': return <Star className="w-4 h-4 text-yellow-500" />
      case 'channel_invite': return <Users className="w-4 h-4 text-purple-500" />
      case 'system': return <Info className="w-4 h-4 text-gray-500" />
      default: return <Bell className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-blue-500'
      case 'low': return 'bg-gray-400'
      default: return 'bg-blue-500'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMinutes = differenceInMinutes(now, date)

    if (diffMinutes < 1) return 'now'
    if (diffMinutes < 60) return `${diffMinutes}m`
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'yesterday'
    return format(date, 'MMM dd')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative group transition-all duration-200 cursor-pointer",
        isSelected && "ring-2 ring-primary",
        !notification.read && "bg-primary/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(notification)}
    >
      <Card className={cn(
        "transition-all duration-200",
        !notification.read && "border-primary/20",
        isHovered && "shadow-md"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Selection checkbox */}
            {onSelect && (
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation()
                    onSelect(notification.id, e.target.checked)
                  }}
                  className="rounded border-muted-foreground"
                />
              </div>
            )}

            {/* Priority indicator */}
            <div className="flex flex-col items-center space-y-2 pt-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                getPriorityColor(notification.priority)
              )} />
              {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={cn(
                      "text-sm font-medium truncate",
                      !notification.read && "font-semibold"
                    )}>
                      {notification.title}
                    </h4>
                    {notification.pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                    {notification.starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {notification.message}
                  </p>

                  {/* Channel/Context info */}
                  {notification.channelId && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MessageSquare className="w-3 h-3" />
                      <span>Channel Name</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-1 ml-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(new Date(notification.createdAt))}
                  </span>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center space-x-1 mt-3 pt-2 border-t border-muted"
                  >
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRead(notification.id)
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Mark Read
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStar(notification.id)
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Star className={cn(
                        "w-3 h-3 mr-1",
                        notification.starred && "fill-current text-yellow-500"
                      )} />
                      {notification.starred ? 'Unstar' : 'Star'}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPin(notification.id)
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Pin className="w-3 h-3 mr-1" />
                      {notification.pinned ? 'Unpin' : 'Pin'}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchive(notification.id)
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Archive className="w-3 h-3 mr-1" />
                      Archive
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48" align="end">
                        <div className="space-y-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => { /* TODO: Implement reply to notification */ }}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => { /* TODO: Implement forward notification */ }}
                          >
                            <Forward className="w-4 h-4 mr-2" />
                            Forward
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => { /* TODO: Implement save notification */ }}
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Separator />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-destructive"
                            onClick={() => onDelete(notification.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
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
  onFiltersChange: (filters: any) => void
  totalCount: number
  unreadCount: number
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  onFiltersChange,
  totalCount,
  unreadCount
}) => {
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    read: 'all',
    timeframe: 'all',
    search: ''
  })

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-4 p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{unreadCount} unread</Badge>
          <Badge variant="outline">{totalCount} total</Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search notifications..."
          value={filters.search}
          onChange={(e) => updateFilters('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.read} onValueChange={(value) => updateFilters('read', value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(value) => updateFilters('type', value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="mention">Mentions</SelectItem>
            <SelectItem value="reaction">Reactions</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value) => updateFilters('priority', value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.timeframe} onValueChange={(value) => updateFilters('timeframe', value)}>
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
    </div>
  )
}

interface NotificationSettingsProps {
  settings: any
  onSettingsChange: (settings: any) => void
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const updateSetting = (key: string, value: boolean) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="font-medium mb-4">Notification Preferences</h3>

        <div className="space-y-4">
          {/* Global toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive all communication notifications
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          <Separator />

          {/* Delivery methods */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Delivery Methods</Label>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Desktop Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Show notifications on your desktop
                </p>
              </div>
              <Switch
                checked={settings.desktop}
                onCheckedChange={(checked) => updateSetting('desktop', checked)}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Sound Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Play sound for new notifications
                </p>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(checked) => updateSetting('sound', checked)}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send notifications to your email
                </p>
              </div>
              <Switch
                checked={settings.email}
                onCheckedChange={(checked) => updateSetting('email', checked)}
                disabled={!settings.enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Content preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Content Preferences</Label>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Message Previews</Label>
                <p className="text-xs text-muted-foreground">
                  Show message content in notifications
                </p>
              </div>
              <Switch
                checked={settings.previews}
                onCheckedChange={(checked) => updateSetting('previews', checked)}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Group Similar</Label>
                <p className="text-xs text-muted-foreground">
                  Group notifications from same source
                </p>
              </div>
              <Switch
                checked={settings.grouping}
                onCheckedChange={(checked) => updateSetting('grouping', checked)}
                disabled={!settings.enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Notification types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notification Types</Label>

            {[
              { key: 'messages', label: 'New Messages', description: 'Direct and channel messages' },
              { key: 'mentions', label: 'Mentions', description: 'When someone mentions you' },
              { key: 'calls', label: 'Calls', description: 'Incoming voice and video calls' },
              { key: 'reactions', label: 'Reactions', description: 'Reactions to your messages' },
              { key: 'system', label: 'System Updates', description: 'System and admin notifications' }
            ].map((type) => (
              <div key={type.key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{type.label}</Label>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
                <Switch
                  checked={settings.types?.[type.key] !== false}
                  onCheckedChange={(checked) => updateSetting(`types.${type.key}`, checked)}
                  disabled={!settings.enabled}
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Quiet hours */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quiet Hours</Label>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Enable Quiet Hours</Label>
                <p className="text-xs text-muted-foreground">
                  Pause notifications during specified hours
                </p>
              </div>
              <Switch
                checked={settings.quietHours?.enabled}
                onCheckedChange={(checked) => updateSetting('quietHours.enabled', checked)}
                disabled={!settings.enabled}
              />
            </div>

            {settings.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={settings.quietHours?.start || '22:00'}
                    onChange={(e) => updateSetting('quietHours.start', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={settings.quietHours?.end || '08:00'}
                    onChange={(e) => updateSetting('quietHours.end', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NotificationCenterProps {
  className?: string
  maxHeight?: string
  showSettings?: boolean
  onNotificationClick?: (notification: any) => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
  maxHeight = "600px",
  showSettings = true,
  onNotificationClick
}) => {
  const {
    notifications,
    markNotificationAsRead,
    clearNotifications,
    settings,
    updateSettings
  } = useCommunicationStore()

  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    read: 'all',
    timeframe: 'all',
    search: ''
  })
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Apply filters
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type)
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority)
    }

    if (filters.read !== 'all') {
      filtered = filtered.filter(n => filters.read === 'read' ? n.read : !n.read)
    }

    if (filters.search) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        n.message.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.timeframe !== 'all') {
      const now = new Date()
      filtered = filtered.filter(n => {
        const notificationDate = new Date(n.createdAt)
        switch (filters.timeframe) {
          case 'today':
            return isToday(notificationDate)
          case 'week':
            return differenceInMinutes(now, notificationDate) <= 7 * 24 * 60
          case 'month':
            return differenceInMinutes(now, notificationDate) <= 30 * 24 * 60
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, filters])

  // Tab-specific filtering
  const tabNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return filteredNotifications.filter(n => !n.read)
      case 'mentions':
        return filteredNotifications.filter(n => n.type === 'mention')
      case 'calls':
        return filteredNotifications.filter(n => n.type === 'call')
      case 'starred':
        return filteredNotifications.filter(n => n.starred)
      default:
        return filteredNotifications
    }
  }, [filteredNotifications, activeTab])

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, any[]> = {}

    tabNotifications.forEach(notification => {
      const date = new Date(notification.createdAt)
      let key: string

      if (isToday(date)) {
        key = 'Today'
      } else if (isYesterday(date)) {
        key = 'Yesterday'
      } else if (differenceInMinutes(new Date(), date) <= 7 * 24 * 60) {
        key = format(date, 'EEEE')
      } else {
        key = format(date, 'MMM dd, yyyy')
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(notification)
    })

    return groups
  }, [tabNotifications])

  const unreadCount = notifications.filter(n => !n.read).length
  const totalCount = notifications.length

  const handleNotificationRead = useCallback((id: string) => {
    markNotificationAsRead(id)
  }, [markNotificationAsRead])

  const handleNotificationAction = useCallback((id: string, action: string) => {
    console.log(`${action} notification:`, id)
    // Implement actions like archive, star, pin, delete
  }, [])

  const handleBulkAction = useCallback((action: string) => {
    selectedNotifications.forEach(id => {
      if (action === 'read') {
        markNotificationAsRead(id)
      } else {
        handleNotificationAction(id, action)
      }
    })
    setSelectedNotifications([])
  }, [selectedNotifications, markNotificationAsRead, handleNotificationAction])

  const handleSelectNotification = useCallback((id: string, selected: boolean) => {
    setSelectedNotifications(prev =>
      selected
        ? [...prev, id]
        : prev.filter(nId => nId !== id)
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedNotifications.length === tabNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(tabNotifications.map(n => n.id))
    }
  }, [selectedNotifications, tabNotifications])

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="flex items-center justify-between p-4 pb-0">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="text-xs">
                All
                <Badge variant="secondary" className="ml-1 text-xs">{totalCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
                <Badge variant="destructive" className="ml-1 text-xs">{unreadCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="mentions" className="text-xs">Mentions</TabsTrigger>
              <TabsTrigger value="calls" className="text-xs">Calls</TabsTrigger>
              <TabsTrigger value="starred" className="text-xs">Starred</TabsTrigger>
            </TabsList>

            {showSettings && (
              <Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
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
                  <NotificationSettings
                    settings={settings}
                    onSettingsChange={updateSettings}
                  />
                </SheetContent>
              </Sheet>
            )}
          </div>

          <NotificationFilters
            onFiltersChange={setFilters}
            totalCount={totalCount}
            unreadCount={unreadCount}
          />
        </div>

        {/* Bulk actions */}
        {selectedNotifications.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.length} selected
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedNotifications.length === tabNotifications.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleBulkAction('read')}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Mark Read
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleBulkAction('archive')}
                className="text-xs"
              >
                <Archive className="w-3 h-3 mr-1" />
                Archive
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleBulkAction('delete')}
                className="text-xs text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markNotificationAsRead('all')}
              disabled={unreadCount === 0}
              className="text-xs"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Mark All Read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearNotifications}
              className="text-xs"
            >
              <Archive className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {tabNotifications.length} notifications
          </div>
        </div>

        {/* Notification list */}
        <TabsContent value={activeTab} className="m-0 flex-1">
          <ScrollArea className="flex-1" style={{ maxHeight }}>
            <div className="p-4 space-y-4">
              {Object.keys(groupedNotifications).length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filters.search || filters.type !== 'all' || filters.read !== 'all'
                      ? 'No notifications match your current filters'
                      : 'You\'re all caught up!'}
                  </p>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                  <div key={date}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur py-2">
                      {date}
                    </h4>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {dateNotifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={handleNotificationRead}
                            onArchive={(id) => handleNotificationAction(id, 'archive')}
                            onDelete={(id) => handleNotificationAction(id, 'delete')}
                            onStar={(id) => handleNotificationAction(id, 'star')}
                            onPin={(id) => handleNotificationAction(id, 'pin')}
                            onClick={onNotificationClick}
                            isSelected={selectedNotifications.includes(notification.id)}
                            onSelect={handleSelectNotification}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotificationCenter