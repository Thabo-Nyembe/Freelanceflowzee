"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommunicationStore } from '@/lib/communication/unified-communication-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  Circle,
  Moon,
  Coffee,
  Phone,
  MapPin,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  Edit,
  MessageSquare,
  Video,
  Headphones,
  Gamepad,
  Car,
  Plane,
  Users,
  Search,
  ChevronDown,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday } from 'date-fns'

// Status types and configurations
const STATUS_TYPES = {
  online: {
    label: 'Online',
    color: 'bg-green-500',
    icon: Circle,
    description: 'Available for communication'
  },
  away: {
    label: 'Away',
    color: 'bg-yellow-500',
    icon: Moon,
    description: 'Away from desk'
  },
  busy: {
    label: 'Busy',
    color: 'bg-red-500',
    icon: Coffee,
    description: 'Do not disturb'
  },
  offline: {
    label: 'Offline',
    color: 'bg-gray-400',
    icon: Circle,
    description: 'Not available'
  }
} as const

const ACTIVITY_TYPES = {
  working: { label: 'Working', icon: Monitor, color: 'text-blue-600' },
  meeting: { label: 'In a meeting', icon: Users, color: 'text-purple-600' },
  call: { label: 'On a call', icon: Phone, color: 'text-green-600' },
  break: { label: 'Taking a break', icon: Coffee, color: 'text-orange-600' },
  lunch: { label: 'At lunch', icon: Coffee, color: 'text-yellow-600' },
  commuting: { label: 'Commuting', icon: Car, color: 'text-gray-600' },
  traveling: { label: 'Traveling', icon: Plane, color: 'text-blue-600' },
  gaming: { label: 'Gaming', icon: Gamepad, color: 'text-purple-600' },
  listening: { label: 'Listening to music', icon: Headphones, color: 'text-pink-600' },
  studying: { label: 'Studying', icon: Monitor, color: 'text-indigo-600' }
}

const DEVICE_TYPES = {
  desktop: { label: 'Desktop', icon: Monitor },
  mobile: { label: 'Mobile', icon: Smartphone },
  tablet: { label: 'Tablet', icon: Tablet },
  web: { label: 'Web Browser', icon: Globe }
}

interface StatusIndicatorProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showIcon?: boolean
  animate?: boolean
  className?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  showIcon = false,
  animate = true,
  className
}) => {
  const statusConfig = STATUS_TYPES[status as keyof typeof STATUS_TYPES] || STATUS_TYPES.offline
  const Icon = statusConfig.icon

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-full",
            statusConfig.color,
            sizeClasses[size],
            animate && status === 'online' && "animate-pulse"
          )}
        />
        {status === 'offline' && (
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-current",
            sizeClasses[size]
          )} />
        )}
      </div>
      {showIcon && <Icon className={sizeClasses[size]} />}
      {showLabel && (
        <span className="text-xs text-muted-foreground">{statusConfig.label}</span>
      )}
    </div>
  )
}

interface UserPresenceCardProps {
  user: any
  showDetails?: boolean
  showActivity?: boolean
  showDevice?: boolean
  showLastSeen?: boolean
  onStatusChange?: (userId: string, status: string) => void
  onActivityChange?: (userId: string, activity: string) => void
  onClick?: (user: any) => void
}

const UserPresenceCard: React.FC<UserPresenceCardProps> = ({
  user,
  showDetails = true,
  showActivity = true,
  showDevice = true,
  showLastSeen = true,
  onStatusChange,
  onActivityChange,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const presence = user.presence || {}

  const formatLastSeen = (date: Date) => {
    if (!date) return 'Never'

    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  const getActivityIcon = (activity: string) => {
    const activityConfig = ACTIVITY_TYPES[activity as keyof typeof ACTIVITY_TYPES]
    return activityConfig ? activityConfig.icon : Activity
  }

  const getDeviceIcon = (device: string) => {
    const deviceConfig = DEVICE_TYPES[device as keyof typeof DEVICE_TYPES]
    return deviceConfig ? deviceConfig.icon : Monitor
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(user)}
    >
      <Card className={cn(
        "transition-all duration-200",
        isHovered && "shadow-md border-primary/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Avatar with status */}
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <StatusIndicator
                  status={user.status}
                  size="md"
                  animate={user.status === 'online'}
                />
              </div>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium truncate">{user.name}</h4>
                {user.role && (
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                )}
              </div>

              {/* Status and activity */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm">
                  <StatusIndicator
                    status={user.status}
                    size="sm"
                    showLabel
                  />
                  {showActivity && user.currentActivity && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center space-x-1">
                        {React.createElement(getActivityIcon(user.currentActivity), {
                          className: "w-3 h-3"
                        })}
                        <span className="text-xs text-muted-foreground">
                          {ACTIVITY_TYPES[user.currentActivity as keyof typeof ACTIVITY_TYPES]?.label || user.currentActivity}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional details */}
                {showDetails && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {showDevice && presence.device && (
                      <div className="flex items-center space-x-1">
                        {React.createElement(getDeviceIcon(presence.device), {
                          className: "w-3 h-3"
                        })}
                        <span>
                          {DEVICE_TYPES[presence.device as keyof typeof DEVICE_TYPES]?.label || presence.device}
                        </span>
                      </div>
                    )}

                    {presence.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{presence.location}</span>
                      </div>
                    )}

                    {user.timezone && (
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{user.timezone}</span>
                      </div>
                    )}

                    {showLastSeen && user.status !== 'online' && user.lastSeen && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Last seen {formatLastSeen(new Date(user.lastSeen))}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col space-y-1"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Start chat with', user.name)
                        }}
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>

                  {user.status === 'online' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Start call with', user.name)
                          }}
                        >
                          <Video className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Start call</TooltipContent>
                    </Tooltip>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface StatusSelectorProps {
  currentStatus: string
  currentActivity?: string
  onStatusChange: (status: string) => void
  onActivityChange: (activity: string) => void
  onCustomActivity: (activity: string) => void
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  currentActivity,
  onStatusChange,
  onActivityChange,
  onCustomActivity
}) => {
  const [customActivity, setCustomActivity] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleCustomActivitySubmit = () => {
    if (customActivity.trim()) {
      onCustomActivity(customActivity.trim())
      setCustomActivity('')
      setShowCustom(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Status</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(STATUS_TYPES).map(([status, config]) => (
            <Button
              key={status}
              variant={currentStatus === status ? "default" : "outline"}
              className="justify-start h-auto p-3"
              onClick={() => onStatusChange(status)}
            >
              <div className="flex items-center space-x-2">
                <StatusIndicator status={status} size="sm" />
                <div className="text-left">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Activity selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Activity</Label>
        <div className="space-y-2">
          <Button
            variant={!currentActivity ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onActivityChange('')}
          >
            <Circle className="w-4 h-4 mr-2" />
            Clear activity
          </Button>

          {Object.entries(ACTIVITY_TYPES).map(([activity, config]) => (
            <Button
              key={activity}
              variant={currentActivity === activity ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => onActivityChange(activity)}
            >
              <config.icon className={cn("w-4 h-4 mr-2", config.color)} />
              {config.label}
            </Button>
          ))}

          <Button
            variant={showCustom ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => setShowCustom(!showCustom)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Custom activity
          </Button>

          {showCustom && (
            <div className="flex space-x-2 mt-2">
              <Input
                placeholder="What are you doing?"
                value={customActivity}
                onChange={(e) => setCustomActivity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomActivitySubmit()}
                className="flex-1"
              />
              <Button
                onClick={handleCustomActivitySubmit}
                disabled={!customActivity.trim()}
              >
                Set
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PresenceSettingsProps {
  settings: any
  onSettingsChange: (settings: any) => void
}

const PresenceSettings: React.FC<PresenceSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Presence Settings</h3>

        <div className="space-y-4">
          {/* Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show online status</Label>
              <p className="text-xs text-muted-foreground">
                Let others see when you're online
              </p>
            </div>
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show last seen</Label>
              <p className="text-xs text-muted-foreground">
                Show when you were last active
              </p>
            </div>
            <Switch
              checked={settings.showLastSeen}
              onCheckedChange={(checked) => updateSetting('showLastSeen', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show current activity</Label>
              <p className="text-xs text-muted-foreground">
                Display your current activity status
              </p>
            </div>
            <Switch
              checked={settings.showActivity}
              onCheckedChange={(checked) => updateSetting('showActivity', checked)}
            />
          </div>

          <Separator />

          {/* Auto-away */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Auto-away</Label>
              <Switch
                checked={settings.autoAway}
                onCheckedChange={(checked) => updateSetting('autoAway', checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Automatically set status to away when idle
            </p>

            {settings.autoAway && (
              <div className="space-y-2">
                <Label className="text-xs">Away after (minutes)</Label>
                <Select
                  value={settings.awayTimeout?.toString() || '5'}
                  onValueChange={(value) => updateSetting('awayTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* Location sharing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Share location</Label>
              <Switch
                checked={settings.shareLocation}
                onCheckedChange={(checked) => updateSetting('shareLocation', checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Share your current location with team members
            </p>

            {settings.shareLocation && (
              <div className="space-y-2">
                <Label className="text-xs">Location</Label>
                <Input
                  placeholder="e.g., New York, Remote, Office"
                  value={settings.location || ''}
                  onChange={(e) => updateSetting('location', e.target.value)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Timezone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Timezone</Label>
            <Select
              value={settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
              onValueChange={(value) => updateSetting('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PresenceStatusSystemProps {
  className?: string
  showUserList?: boolean
  showQuickActions?: boolean
  showSettings?: boolean
  maxHeight?: string
}

export const PresenceStatusSystem: React.FC<PresenceStatusSystemProps> = ({
  className,
  showUserList = true,
  showQuickActions = true,
  showSettings = true,
  maxHeight = "600px"
}) => {
  const {
    currentUser,
    users,
    userPresence,
    updateUserStatus,
    updateSettings,
    settings
  } = useCommunicationStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showStatusSelector, setShowStatusSelector] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [sortBy, setSortBy] = useState('name')

  // Combine users with presence data
  const usersWithPresence = useMemo(() => {
    return Object.values(users).map(user => ({
      ...user,
      presence: userPresence[user.id] || {}
    }))
  }, [users, userPresence])

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = usersWithPresence

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.currentActivity?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 }
          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
        case 'lastSeen':
          return new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime()
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [usersWithPresence, searchQuery, statusFilter, sortBy])

  // Group users by status
  const groupedUsers = useMemo(() => {
    const groups = {
      online: filteredUsers.filter(u => u.status === 'online'),
      away: filteredUsers.filter(u => u.status === 'away'),
      busy: filteredUsers.filter(u => u.status === 'busy'),
      offline: filteredUsers.filter(u => u.status === 'offline')
    }

    return Object.entries(groups).filter(([_, users]) => users.length > 0)
  }, [filteredUsers])

  const handleStatusChange = useCallback((status: string) => {
    updateUserStatus(status)
    setShowStatusSelector(false)
  }, [updateUserStatus])

  const handleActivityChange = useCallback((activity: string) => {
    updateUserStatus(currentUser?.status || 'online', activity)
  }, [updateUserStatus, currentUser])

  const handleCustomActivity = useCallback((activity: string) => {
    updateUserStatus(currentUser?.status || 'online', activity)
  }, [updateUserStatus, currentUser])

  const statusCounts = useMemo(() => {
    const counts = { online: 0, away: 0, busy: 0, offline: 0 }
    usersWithPresence.forEach(user => {
      if (counts[user.status as keyof typeof counts] !== undefined) {
        counts[user.status as keyof typeof counts]++
      }
    })
    return counts
  }, [usersWithPresence])

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Team Presence</h2>
            <div className="flex items-center space-x-2">
              {showSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsPanel(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Current user status */}
          {currentUser && (
            <div className="mb-4">
              <Popover open={showStatusSelector} onOpenChange={setShowStatusSelector}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <StatusIndicator status={currentUser.status} size="sm" />
                          <span className="font-medium">{STATUS_TYPES[currentUser.status as keyof typeof STATUS_TYPES]?.label}</span>
                        </div>
                        {currentUser.currentActivity && (
                          <div className="text-xs text-muted-foreground">{currentUser.currentActivity}</div>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <StatusSelector
                    currentStatus={currentUser.status}
                    currentActivity={currentUser.currentActivity}
                    onStatusChange={handleStatusChange}
                    onActivityChange={handleActivityChange}
                    onCustomActivity={handleCustomActivity}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Status summary */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                key={status}
                className={cn(
                  "flex items-center space-x-1 p-2 rounded-lg cursor-pointer transition-colors",
                  statusFilter === status ? "bg-primary/10" : "hover:bg-muted"
                )}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <StatusIndicator status={status} size="sm" />
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>

          {/* Search and filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="lastSeen">Last Seen</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="secondary" className="text-xs">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'}
              </Badge>
            </div>
          </div>
        </div>

        {/* User list */}
        {showUserList && (
          <ScrollArea className="flex-1" style={{ maxHeight }}>
            <div className="p-4 space-y-4">
              {groupedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No team members found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search query' : 'No team members are available'}
                  </p>
                </div>
              ) : (
                groupedUsers.map(([status, statusUsers]) => (
                  <div key={status}>
                    <div className="flex items-center space-x-2 mb-3">
                      <StatusIndicator status={status} size="sm" />
                      <h3 className="font-medium text-sm">
                        {STATUS_TYPES[status as keyof typeof STATUS_TYPES]?.label}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {statusUsers.length}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-6">
                      <AnimatePresence>
                        {statusUsers.map((user) => (
                          <UserPresenceCard
                            key={user.id}
                            user={user}
                            showDetails={true}
                            showActivity={true}
                            showDevice={true}
                            showLastSeen={true}
                            onClick={(user) => console.log('View user profile:', user)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {/* Settings panel */}
        {showSettings && (
          <div
            className={cn(
              "fixed inset-y-0 right-0 w-80 bg-background border-l shadow-lg transform transition-transform duration-300 z-50",
              showSettingsPanel ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Presence Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsPanel(false)}
              >
                ×
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <PresenceSettings
                settings={settings}
                onSettingsChange={updateSettings}
              />
            </ScrollArea>
          </div>
        )}

        {/* Overlay for settings panel */}
        {showSettingsPanel && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowSettingsPanel(false)}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

export default PresenceStatusSystem