/**
 * KAZI Presence Indicators Component
 *
 * Shows online users and their activity status in real-time.
 *
 * Features:
 * - Online/offline status
 * - Activity indicators (viewing, editing, typing)
 * - User avatars with status dots
 * - Hover cards with details
 * - Compact and expanded views
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '@/hooks/use-websocket'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, MessageSquare, Circle } from 'lucide-react'

export interface OnlineUser {
  id: string
  name: string
  email?: string
  avatar?: string
  color?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  activity?: 'viewing' | 'editing' | 'typing' | 'idle'
  lastSeen?: Date
}

export interface PresenceIndicatorsProps {
  roomId?: string
  maxVisible?: number
  showActivity?: boolean
  compact?: boolean
  className?: string
}

const STATUS_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400'
}

const ACTIVITY_ICONS = {
  viewing: Eye,
  editing: Edit,
  typing: MessageSquare,
  idle: Circle
}

export function PresenceIndicators({
  roomId,
  maxVisible = 5,
  showActivity = true,
  compact = false,
  className
}: PresenceIndicatorsProps) {
  const { currentRoom, isConnected } = useWebSocket()
  const [users, setUsers] = useState<OnlineUser[]>([])

  // Get users from WebSocket room or fetch from API
  useEffect(() => {
    if (currentRoom?.users) {
      const roomUsers = currentRoom.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        color: u.color,
        status: 'online' as const,
        activity: 'viewing' as const,
        lastSeen: new Date(u.lastActivity)
      }))
      setUsers(roomUsers)
    } else {
      // Fetch from API as fallback
      fetchOnlineUsers()
    }
  }, [currentRoom])

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('/api/realtime?action=online-users')
      const data = await response.json()
      if (data.success && data.onlineUsers) {
        setUsers(data.onlineUsers.map((u: any) => ({
          ...u,
          status: 'online',
          activity: 'viewing'
        })))
      }
    } catch (error) {
      console.error('Failed to fetch online users:', error)
    }
  }

  // Periodic refresh
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(fetchOnlineUsers, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected])

  const visibleUsers = users.slice(0, maxVisible)
  const remainingCount = users.length - maxVisible

  if (users.length === 0) {
    return null
  }

  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn('flex items-center -space-x-2', className)}>
          <AnimatePresence mode="popLayout">
            {visibleUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback
                          style={{ backgroundColor: user.color }}
                          className="text-white text-xs"
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                          STATUS_COLORS[user.status]
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted">
                  <span className="text-xs font-medium">+{remainingCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{remainingCount} more users online</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Connection indicator */}
          <div className="ml-2">
            <span
              className={cn(
                'h-2 w-2 rounded-full inline-block',
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              )}
            />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Expanded view
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">
          Online ({users.length})
        </h4>
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-yellow-500'
          )}
        />
      </div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.03 }}
            >
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback
                          style={{ backgroundColor: user.color }}
                          className="text-white text-xs"
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                          STATUS_COLORS[user.status]
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      {showActivity && user.activity && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {React.createElement(ACTIVITY_ICONS[user.activity], {
                            className: 'h-3 w-3'
                          })}
                          <span className="capitalize">{user.activity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </HoverCardTrigger>

                <HoverCardContent className="w-64">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback
                        style={{ backgroundColor: user.color }}
                        className="text-white"
                      >
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{user.name}</h4>
                      {user.email && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={user.status === 'online' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {user.status}
                        </Badge>
                        {user.activity && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {user.activity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Minimal presence dot indicator
 */
export function PresenceDot({
  status,
  size = 'sm',
  className
}: {
  status: 'online' | 'away' | 'busy' | 'offline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3'
  }

  return (
    <span
      className={cn(
        'rounded-full',
        sizes[size],
        STATUS_COLORS[status],
        className
      )}
    />
  )
}

/**
 * User avatar with presence indicator
 */
export function PresenceAvatar({
  user,
  size = 'md',
  showStatus = true,
  className
}: {
  user: OnlineUser
  size?: 'sm' | 'md' | 'lg'
  showStatus?: boolean
  className?: string
}) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  }

  return (
    <div className={cn('relative', className)}>
      <Avatar className={sizes[size]}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback
          style={{ backgroundColor: user.color }}
          className="text-white text-xs"
        >
          {user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            dotSizes[size],
            STATUS_COLORS[user.status]
          )}
        />
      )}
    </div>
  )
}

export default PresenceIndicators
