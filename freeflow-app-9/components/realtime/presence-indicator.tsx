/**
 * Online Presence Indicator Component
 *
 * Real-time presence indicator that can be used anywhere in the app.
 * Shows user's online status with real-time updates.
 *
 * FEATURES:
 * - Real-time status updates
 * - Visual status indicators
 * - Status change controls
 * - Global presence tracking
 *
 * USAGE:
 * ```tsx
 * // Simple indicator
 * <PresenceIndicator userId="user-123" showLabel />
 *
 * // With status controls
 * <PresenceIndicator userId="user-123" showControls />
 *
 * // Global presence widget
 * <GlobalPresenceWidget />
 * ```
 */

'use client'

import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Circle, Users, ChevronDown } from 'lucide-react'
import { useOnlinePresence } from '@/lib/messages-realtime'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('PresenceIndicator')

// ==================== TYPES ====================

export type UserStatus = 'online' | 'away' | 'busy' | 'offline'

export interface PresenceIndicatorProps {
  userId: string
  username?: string
  showLabel?: boolean
  showControls?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ==================== PRESENCE INDICATOR ====================

export function PresenceIndicator({
  userId,
  username,
  showLabel = false,
  showControls = false,
  size = 'md',
  className = ''
}: PresenceIndicatorProps) {
  const { onlineUsers, updateStatus, isUserOnline } = useOnlinePresence(userId)

  // Get user's current status
  const userStatus = onlineUsers.find((u: any) => u.user_id === userId)?.status || 'offline'

  // Status configurations
  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online', textColor: 'text-green-500' },
    away: { color: 'bg-yellow-500', label: 'Away', textColor: 'text-yellow-500' },
    busy: { color: 'bg-red-500', label: 'Busy', textColor: 'text-red-500' },
    offline: { color: 'bg-gray-400', label: 'Offline', textColor: 'text-gray-400' }
  }

  const config = statusConfig[userStatus as UserStatus]

  // Size configurations
  const sizeConfig = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const handleStatusChange = async (newStatus: UserStatus) => {
    await updateStatus(newStatus)
    toast.success(`Status changed to ${newStatus}`)
    logger.info('Status changed', { userId, newStatus })
  }

  if (showControls) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <div className={`${sizeConfig[size]} rounded-full ${config.color} mr-2`} />
            <span className="text-sm">{config.label}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="end">
          <div className="space-y-1">
            {Object.entries(statusConfig).map(([status, cfg]) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status as UserStatus)}
                className="w-full flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                <span className="text-sm">{cfg.label}</span>
                {userStatus === status && <Circle className="w-3 h-3 ml-auto fill-current" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeConfig[size]} rounded-full ${config.color} ${
        userStatus === 'online' ? 'animate-pulse' : ''
      }`} />
      {showLabel && (
        <span className={`text-sm ${config.textColor}`}>
          {username || config.label}
        </span>
      )}
    </div>
  )
}

// ==================== GLOBAL PRESENCE WIDGET ====================

export function GlobalPresenceWidget({ userId }: { userId: string }) {
  const { onlineUsers, count, updateStatus } = useOnlinePresence(userId)

  useEffect(() => {
    updateStatus('online')
    logger.info('Global presence initialized', { userId })
  }, [userId, updateStatus])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Online Now
          </CardTitle>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <CardDescription className="text-xs">
          Real-time presence tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {onlineUsers.slice(0, 5).map((user: any, index) => {
          const status = user.status || 'online'
          const config = {
            online: 'bg-green-500',
            away: 'bg-yellow-500',
            busy: 'bg-red-500',
            offline: 'bg-gray-400'
          }[status]

          return (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config}`} />
                <span className="text-sm font-medium">
                  {user.username || user.user_id}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {status}
              </Badge>
            </div>
          )
        })}

        {count > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{count - 5} more online
          </p>
        )}

        {count === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No one else is online
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== ONLINE USERS LIST ====================

export function OnlineUsersList({ currentUserId }: { currentUserId: string }) {
  const { onlineUsers, count } = useOnlinePresence(currentUserId)

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    away: { color: 'bg-yellow-500', label: 'Away' },
    busy: { color: 'bg-red-500', label: 'Busy' },
    offline: { color: 'bg-gray-400', label: 'Offline' }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-medium">Online Users</h4>
        <Badge variant="secondary" className="text-xs">
          <Circle className="w-2 h-2 mr-1 fill-green-500 text-green-500" />
          {count} online
        </Badge>
      </div>

      <div className="space-y-1">
        {onlineUsers.map((user: any, index) => {
          const status = (user.status || 'online') as UserStatus
          const config = statusConfig[status]

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {(user.username || user.user_id).substring(0, 2).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {user.username || user.user_id}
                    {user.user_id === currentUserId && (
                      <span className="text-xs text-muted-foreground ml-1">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.label}
                  </p>
                </div>
              </div>

              {user.last_seen && (
                <span className="text-xs text-muted-foreground">
                  {new Date(user.last_seen).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          )
        })}

        {count === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No users online</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== EXPORT ====================

export default PresenceIndicator
