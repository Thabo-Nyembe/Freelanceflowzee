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

// Enhanced Notifications Component
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
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
  onMarkAsRead?: (id: string) => void
  onClearAll?: () => void
  className?: string
}

export function EnhancedNotifications({
  notifications,
  title = 'Notifications',
  maxItems = 5,
  onMarkAsRead,
  onClearAll,
  className
}: EnhancedNotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length
  const displayNotifications = notifications.slice(0, maxItems)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'error': return <X className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-blue-600" />
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

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {onClearAll && notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No notifications
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'flex gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50',
                !notification.read && 'bg-muted/30 border-primary/20'
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    'text-sm font-medium',
                    !notification.read && 'text-foreground',
                    notification.read && 'text-muted-foreground'
                  )}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
                
                {/* Notification Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={action.onClick}
                        className="h-6 px-2 text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Mark as Read */}
                {!notification.read && onMarkAsRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        
        {notifications.length > maxItems && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View all {notifications.length} notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



