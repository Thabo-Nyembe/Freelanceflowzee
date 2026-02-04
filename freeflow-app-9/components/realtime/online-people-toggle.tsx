/**
 * Online People Toggle Component
 *
 * A collapsible button that shows online users in a popover
 * Can be placed in headers, toolbars, or dashboards
 *
 * USAGE:
 * ```tsx
 * // In header or toolbar
 * <OnlinePeopleToggle position="header" />
 *
 * // As floating button
 * <OnlinePeopleToggle position="floating" />
 * ```
 */

'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useOnlinePresence } from '@/lib/messages-realtime'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================

export type UserStatus = 'online' | 'away' | 'busy' | 'offline'

interface OnlinePeopleToggleProps {
  position?: 'header' | 'floating' | 'inline'
  className?: string
  maxDisplay?: number
}

// ==================== ONLINE PEOPLE TOGGLE ====================

export function OnlinePeopleToggle({
  position = 'header',
  className,
  maxDisplay = 10
}: OnlinePeopleToggleProps) {
  const [open, setOpen] = useState(false)
  const { onlineUsers } = useOnlinePresence()

  // Filter online users
  const activeUsers = onlineUsers.filter((u: any) => u.status !== 'offline')
  const onlineCount = activeUsers.length

  // Status color mapping
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  }

  const statusLabels = {
    online: 'Online',
    away: 'Away',
    busy: 'Busy',
    offline: 'Offline'
  }

  // Position-specific styling
  const positionStyles = {
    header: 'relative',
    floating: 'fixed bottom-4 right-4 z-50',
    inline: 'relative'
  }

  return (
    <div className={cn(positionStyles[position], className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={position === 'floating' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'gap-2',
              position === 'floating' && 'rounded-full shadow-lg h-12 px-4'
            )}
          >
            <Users className="h-4 w-4" />
            {onlineCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-xs font-semibold bg-green-500 text-white"
              >
                {onlineCount}
              </Badge>
            )}
            {position !== 'floating' && (
              <>
                <span className="hidden sm:inline">Online</span>
                {open ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-80 p-0"
          sideOffset={8}
        >
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Online Users</h3>
              <Badge variant="secondary" className="bg-green-500 text-white">
                {onlineCount} online
              </Badge>
            </div>
          </div>

          {/* Users List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {activeUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">No users online</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activeUsers.slice(0, maxDisplay).map((user: any) => (
                    <div
                      key={user.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {/* Avatar with status indicator */}
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {user.username?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
                            statusColors[user.status as UserStatus]
                          )}
                        />
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.username || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Circle
                            className={cn(
                              'h-2 w-2 fill-current',
                              user.status === 'online' && 'text-green-500',
                              user.status === 'away' && 'text-yellow-500',
                              user.status === 'busy' && 'text-red-500'
                            )}
                          />
                          <span className="text-xs text-muted-foreground">
                            {statusLabels[user.status as UserStatus]}
                          </span>
                        </div>
                      </div>

                      {/* Last seen */}
                      {user.last_seen && (
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(user.last_seen), {
                            addSuffix: false
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeUsers.length > maxDisplay && (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  +{activeUsers.length - maxDisplay} more online
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Real-time presence updates
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ==================== COMPACT ONLINE AVATARS ====================

interface CompactOnlineAvatarsProps {
  maxDisplay?: number
  className?: string
}

/**
 * Compact view showing overlapping avatars of online users
 * Perfect for headers and compact spaces
 */
export function CompactOnlineAvatars({
  maxDisplay = 5,
  className
}: CompactOnlineAvatarsProps) {
  const { onlineUsers } = useOnlinePresence()
  const activeUsers = onlineUsers.filter((u: any) => u.status !== 'offline')
  const displayUsers = activeUsers.slice(0, maxDisplay)
  const remainingCount = Math.max(0, activeUsers.length - maxDisplay)

  if (activeUsers.length === 0) return null

  return (
    <div className={cn('flex items-center', className)}>
      {/* Overlapping avatars */}
      <div className="flex -space-x-2">
        {displayUsers.map((user: any, index: number) => (
          <Avatar
            key={user.user_id}
            className="h-8 w-8 ring-2 ring-background"
            style={{ zIndex: maxDisplay - index }}
          >
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xs">
              {user.username?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <div className="h-8 w-8 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
            <span className="text-xs font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>

      {/* Online indicator */}
      <div className="ml-3 flex items-center gap-1.5">
        <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">
          {activeUsers.length} online
        </span>
      </div>
    </div>
  )
}

export default OnlinePeopleToggle
