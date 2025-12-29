'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Clock, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Bell,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced Widget Types
interface WidgetData {
  id: string
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  status?: 'success' | 'warning' | 'error' | 'info'
  progress?: number
  trend?: Array<{ label: string; value: number }>
}

interface EnhancedWidgetProps {
  data: WidgetData
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'minimal' | 'detailed'
  className?: string
  onRefresh?: () => void
  onSettings?: () => void
  onMaximize?: () => void
  onClose?: () => void
  isLoading?: boolean
  isMaximized?: boolean
}

// Enhanced Dashboard Widget Component
export function EnhancedDashboardWidget({
  data,
  size = 'medium',
  variant = 'default',
  className,
  onRefresh,
  onSettings,
  onMaximize,
  onClose,
  isLoading = false,
  isMaximized = false,
  ...props
}: EnhancedWidgetProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      await onRefresh()
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  const sizeClasses = {
    small: 'h-32',
    medium: 'h-40',
    large: 'h-48'
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <X className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        sizeClasses[size],
        isMaximized && 'fixed inset-4 z-50 h-auto',
        isLoading && 'animate-pulse',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Widget Header */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {data.status && getStatusIcon(data.status)}
            {data.title}
          </CardTitle>
          
          {/* Widget Actions */}
          <div className={cn(
            'flex items-center gap-1 opacity-0 transition-opacity duration-200',
            isHovered && 'opacity-100'
          )}>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
              </Button>
            )}
            {onSettings && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onSettings}
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            {onMaximize && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onMaximize}
              >
                {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Widget Content */}
      <CardContent className="space-y-3">
        {/* Main Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{data.value}</span>
          
          {/* Change Indicator */}
          {data.change && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              data.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            )}>
              {data.change.type === 'increase' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{Math.abs(data.change.value)}%</span>
              <span className="text-muted-foreground">vs {data.change.period}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {data.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{data.progress}%</span>
            </div>
            <Progress value={data.progress} className="h-2" />
          </div>
        )}

        {/* Status Badge */}
        {data.status && (
          <Badge variant="outline" className={cn('text-xs', getStatusColor(data.status))}>
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </Badge>
        )}

        {/* Trend Data (for detailed variant) */}
        {variant === 'detailed' && data.trend && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Recent Activity</span>
            <div className="flex justify-between items-end h-8 gap-1">
              {data.trend.map((point, index) => (
                <div
                  key={index}
                  className="bg-primary/20 hover:bg-primary/30 transition-colors rounded-sm flex-1"
                  style={{ height: `${(point.value / Math.max(...data.trend!.map(p => p.value))) * 100}%` }}
                  title={`${point.label}: ${point.value}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </Card>
  )
}

// Quick Actions Component
interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  badge?: string | number
  variant?: 'default' | 'primary' | 'secondary' | 'destructive'
  disabled?: boolean
  shortcut?: string
}

interface EnhancedQuickActionsProps {
  actions: QuickAction[]
  title?: string
  className?: string
  layout?: 'grid' | 'list' | 'compact'
}

export function EnhancedQuickActions({
  actions,
  title = 'Quick Actions',
  className,
  layout = 'grid'
}: EnhancedQuickActionsProps) {
  const layoutClasses = {
    grid: 'grid grid-cols-2 gap-2',
    list: 'space-y-2',
    compact: 'flex flex-wrap gap-2'
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={layoutClasses[layout]}>
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size={layout === 'compact' ? 'sm' : 'default'}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  'relative justify-start gap-2 h-auto p-3',
                  layout === 'compact' && 'h-auto p-2'
                )}
                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
              >
                <Icon className={cn('h-4 w-4', layout === 'compact' && 'h-3 w-3')} />
                <span className={layout === 'compact' ? 'text-xs' : 'text-sm'}>
                  {action.label}
                </span>
                
                {/* Badge */}
                {action.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto text-xs h-5 px-1.5"
                  >
                    {action.badge}
                  </Badge>
                )}
                
                {/* Keyboard Shortcut */}
                {action.shortcut && layout !== 'compact' && (
                  <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {action.shortcut}
                  </kbd>
                )}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Notifications Component with Cascade/Collapse functionality
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date | string
  read?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'primary' | 'destructive'
  }>
}

interface EnhancedNotificationsProps {
  notifications: Notification[]
  title?: string
  maxItems?: number
  maxVisible?: number  // How many to show in cascade view
  onMarkAsRead?: (id: string) => void
  onClearAll?: () => void
  onDismiss?: (id: string) => void
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function EnhancedNotifications({
  notifications,
  title = 'Notifications',
  maxItems = 5,
  maxVisible = 3,
  onMarkAsRead,
  onClearAll,
  onDismiss,
  className,
  position = 'bottom-right'
}: EnhancedNotificationsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id))
  const unreadCount = visibleNotifications.filter(n => !n.read).length
  const displayNotifications = isExpanded
    ? visibleNotifications.slice(0, maxItems)
    : visibleNotifications.slice(0, maxVisible)

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
    onDismiss?.(id)
  }

  const handleClearAll = () => {
    setDismissedIds(new Set(notifications.map(n => n.id)))
    onClearAll?.()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'error': return <X className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50/90 dark:bg-green-950/50'
      case 'warning': return 'border-l-amber-500 bg-amber-50/90 dark:bg-amber-950/50'
      case 'error': return 'border-l-red-500 bg-red-50/90 dark:bg-red-950/50'
      default: return 'border-l-blue-500 bg-blue-50/90 dark:bg-blue-950/50'
    }
  }

  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date()
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // If collapsed, show only the bell icon with count
  if (isCollapsed) {
    return (
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsCollapsed(false)}
        className={cn(
          'relative h-12 w-12 rounded-full shadow-lg',
          'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
          'border border-gray-200 dark:border-gray-700',
          className
        )}
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    )
  }

  // If no notifications, show minimized state
  if (visibleNotifications.length === 0) {
    return (
      <div className={cn('w-80', className)}>
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('w-80 space-y-2', className)}>
      {/* Header Card */}
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {visibleNotifications.length > maxVisible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 px-2 text-xs"
                >
                  {isExpanded ? 'Less' : `+${visibleNotifications.length - maxVisible} more`}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 w-6 p-0"
                title="Clear all"
              >
                <X className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="h-6 w-6 p-0"
                title="Minimize"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stacked Notification Cards with Cascade Effect */}
      <div className="relative">
        {displayNotifications.map((notification, index) => {
          // Calculate cascade offset for stacked appearance
          const stackOffset = isExpanded ? 0 : index * 4
          const stackScale = isExpanded ? 1 : 1 - (index * 0.02)
          const stackOpacity = isExpanded ? 1 : 1 - (index * 0.1)

          return (
            <div
              key={notification.id}
              className={cn(
                'transition-all duration-300 ease-out',
                !isExpanded && index > 0 && 'absolute left-0 right-0'
              )}
              style={{
                top: isExpanded ? 'auto' : `${stackOffset}px`,
                transform: `scale(${stackScale})`,
                opacity: stackOpacity,
                zIndex: maxVisible - index,
                marginBottom: isExpanded ? '8px' : '0'
              }}
            >
              <Card
                className={cn(
                  'shadow-md border-l-4 overflow-hidden',
                  'hover:shadow-lg transition-shadow duration-200',
                  getTypeColor(notification.type)
                )}
              >
                <div className="p-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          'text-sm font-medium truncate',
                          !notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(notification.id)}
                            className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Actions Row */}
                      <div className="flex items-center gap-2 mt-2">
                        {notification.actions?.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant="outline"
                            size="sm"
                            onClick={action.onClick}
                            className="h-6 px-2 text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                        {!notification.read && onMarkAsRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-auto"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Spacer for stacked cards when not expanded */}
      {!isExpanded && displayNotifications.length > 1 && (
        <div style={{ height: `${(displayNotifications.length - 1) * 4}px` }} />
      )}
    </div>
  )
}



