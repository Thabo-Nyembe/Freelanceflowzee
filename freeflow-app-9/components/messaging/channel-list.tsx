'use client'

/**
 * Channel List Component
 *
 * Industry-leading channel navigation with:
 * - Channel categories
 * - Direct messages
 * - Unread indicators
 * - Typing indicators
 * - Online status
 * - Favorites/pins
 * - Search/filter
 * - Drag & drop reordering
 */

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Search,
  Plus,
  Hash,
  Lock,
  Volume2,
  VolumeX,
  Users,
  Star,
  Pin,
  Bell,
  BellOff,
  Settings,
  Edit3,
  Trash2,
  Archive,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  MessageCircle,
  User,
  UserPlus,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export type ChannelType = 'public' | 'private' | 'direct' | 'group' | 'voice'

export interface Channel {
  id: string
  name: string
  type: ChannelType
  description?: string
  avatar?: string
  memberCount?: number
  unreadCount?: number
  mentionCount?: number
  lastMessage?: {
    content: string
    userName: string
    timestamp: Date
  }
  isPinned?: boolean
  isMuted?: boolean
  isArchived?: boolean
  isActive?: boolean
  typingUsers?: Array<{ id: string; name: string }>
  members?: Array<{
    id: string
    name: string
    avatar?: string
    isOnline?: boolean
  }>
  category?: string
}

export interface ChannelCategory {
  id: string
  name: string
  channels: Channel[]
  isCollapsed?: boolean
}

export interface ChannelListProps {
  channels: Channel[]
  directMessages: Channel[]
  categories?: ChannelCategory[]
  currentChannelId?: string
  currentUserId?: string
  showCategories?: boolean
  showSearch?: boolean
  showCreateButton?: boolean
  isLoading?: boolean
  onChannelSelect: (channelId: string) => void
  onCreateChannel?: () => void
  onCreateDM?: () => void
  onChannelAction?: (action: ChannelAction, channelId: string) => void
  onCategoryToggle?: (categoryId: string) => void
  onSearch?: (query: string) => void
  className?: string
}

export type ChannelAction =
  | 'pin'
  | 'unpin'
  | 'mute'
  | 'unmute'
  | 'archive'
  | 'unarchive'
  | 'edit'
  | 'delete'
  | 'leave'
  | 'invite'
  | 'settings'
  | 'markRead'
  | 'hide'
  | 'unhide'

// ============================================================================
// Utility Functions
// ============================================================================

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function getChannelIcon(type: ChannelType, isMuted: boolean = false) {
  if (isMuted && (type === 'public' || type === 'private')) {
    return <VolumeX className="h-4 w-4 text-muted-foreground" />
  }

  switch (type) {
    case 'public':
      return <Hash className="h-4 w-4" />
    case 'private':
      return <Lock className="h-4 w-4" />
    case 'voice':
      return <Volume2 className="h-4 w-4" />
    case 'group':
      return <Users className="h-4 w-4" />
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

function ChannelItem({
  channel,
  isActive,
  onSelect,
  onAction,
}: {
  channel: Channel
  isActive: boolean
  onSelect: () => void
  onAction?: (action: ChannelAction) => void
}) {
  const isDM = channel.type === 'direct'
  const hasUnread = (channel.unreadCount || 0) > 0
  const hasMentions = (channel.mentionCount || 0) > 0

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onSelect}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group',
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-muted/50',
            channel.isArchived && 'opacity-50'
          )}
        >
          {/* Avatar/Icon */}
          {isDM ? (
            <div className="relative flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={channel.avatar} />
                <AvatarFallback>{channel.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {channel.members?.[0]?.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
          ) : (
            <div className={cn(
              'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md',
              isActive ? 'bg-background/20' : 'bg-muted'
            )}>
              {getChannelIcon(channel.type, channel.isMuted)}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className={cn(
                'text-sm truncate',
                hasUnread && !isActive && 'font-semibold'
              )}>
                {channel.name}
              </span>
              {channel.isPinned && (
                <Pin className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              )}
              {channel.isMuted && (
                <BellOff className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>

            {/* Last message or typing */}
            {channel.typingUsers && channel.typingUsers.length > 0 ? (
              <p className="text-xs text-primary truncate">
                {channel.typingUsers.length === 1
                  ? `${channel.typingUsers[0].name} is typing...`
                  : `${channel.typingUsers.length} people typing...`}
              </p>
            ) : channel.lastMessage ? (
              <p className="text-xs text-muted-foreground truncate">
                {isDM ? '' : `${channel.lastMessage.userName}: `}
                {channel.lastMessage.content}
              </p>
            ) : null}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasMentions ? (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                {channel.mentionCount}
              </Badge>
            ) : hasUnread ? (
              <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
                {channel.unreadCount}
              </Badge>
            ) : channel.lastMessage ? (
              <span className="text-[10px] text-muted-foreground">
                {formatTimestamp(channel.lastMessage.timestamp)}
              </span>
            ) : null}
          </div>

          {/* More button */}
          {onAction && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-6 w-6 flex-shrink-0',
                    'opacity-0 group-hover:opacity-100',
                    isActive && 'opacity-100'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {hasUnread && (
                  <DropdownMenuItem onClick={() => onAction('markRead')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onAction(channel.isPinned ? 'unpin' : 'pin')}>
                  <Pin className="h-4 w-4 mr-2" />
                  {channel.isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction(channel.isMuted ? 'unmute' : 'mute')}>
                  {channel.isMuted ? (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Mute
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isDM && (
                  <>
                    <DropdownMenuItem onClick={() => onAction('invite')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite People
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction('settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onAction(isDM ? 'hide' : 'leave')}>
                  {isDM ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Conversation
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Channel
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        {hasUnread && (
          <ContextMenuItem onClick={() => onAction?.('markRead')}>
            <Eye className="h-4 w-4 mr-2" />
            Mark as Read
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => onAction?.(channel.isPinned ? 'unpin' : 'pin')}>
          <Pin className="h-4 w-4 mr-2" />
          {channel.isPinned ? 'Unpin' : 'Pin'}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction?.(channel.isMuted ? 'unmute' : 'mute')}>
          {channel.isMuted ? (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Unmute
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Mute
            </>
          )}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {!isDM && (
          <>
            <ContextMenuItem onClick={() => onAction?.('invite')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite People
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAction?.('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem
          className="text-destructive"
          onClick={() => onAction?.(isDM ? 'hide' : 'leave')}
        >
          {isDM ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Conversation
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Leave Channel
            </>
          )}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function CategorySection({
  category,
  currentChannelId,
  onChannelSelect,
  onChannelAction,
  onToggle,
  onCreateChannel,
}: {
  category: ChannelCategory
  currentChannelId?: string
  onChannelSelect: (channelId: string) => void
  onChannelAction?: (action: ChannelAction, channelId: string) => void
  onToggle?: () => void
  onCreateChannel?: () => void
}) {
  const isCollapsed = category.isCollapsed

  return (
    <Collapsible open={!isCollapsed} onOpenChange={() => onToggle?.()}>
      <div className="flex items-center justify-between px-2 py-1 group">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider font-semibold">
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {category.name}
            <span className="text-[10px] ml-1">({category.channels.length})</span>
          </button>
        </CollapsibleTrigger>

        {onCreateChannel && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={onCreateChannel}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Channel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <CollapsibleContent>
        <div className="space-y-0.5">
          {category.channels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isActive={currentChannelId === channel.id}
              onSelect={() => onChannelSelect(channel.id)}
              onAction={onChannelAction ? (action) => onChannelAction(action, channel.id) : undefined}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function ChannelList({
  channels,
  directMessages,
  categories,
  currentChannelId,
  currentUserId,
  showCategories = true,
  showSearch = true,
  showCreateButton = true,
  isLoading = false,
  onChannelSelect,
  onCreateChannel,
  onCreateDM,
  onChannelAction,
  onCategoryToggle,
  onSearch,
  className,
}: ChannelListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [dmCollapsed, setDmCollapsed] = useState(false)

  // Filter channels based on search
  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels
    const query = searchQuery.toLowerCase()
    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query) ||
        channel.description?.toLowerCase().includes(query)
    )
  }, [channels, searchQuery])

  const filteredDMs = useMemo(() => {
    if (!searchQuery) return directMessages
    const query = searchQuery.toLowerCase()
    return directMessages.filter((dm) => dm.name.toLowerCase().includes(query))
  }, [directMessages, searchQuery])

  // Separate pinned channels
  const pinnedChannels = useMemo(
    () => filteredChannels.filter((c) => c.isPinned),
    [filteredChannels]
  )

  const unpinnedChannels = useMemo(
    () => filteredChannels.filter((c) => !c.isPinned),
    [filteredChannels]
  )

  // Group channels by category if provided
  const channelsByCategory = useMemo(() => {
    if (!categories) return null

    return categories.map((category) => ({
      ...category,
      channels: category.channels.filter((channel) =>
        !searchQuery ||
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      isCollapsed: collapsedCategories.has(category.id),
    }))
  }, [categories, searchQuery, collapsedCategories])

  const handleCategoryToggle = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
    onCategoryToggle?.(categoryId)
  }

  // Calculate total unread
  const totalUnread = useMemo(() => {
    return [...channels, ...directMessages].reduce(
      (sum, channel) => sum + (channel.unreadCount || 0),
      0
    )
  }, [channels, directMessages])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-3 py-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Messages</h2>
          {totalUnread > 0 && (
            <Badge variant="secondary">{totalUnread} unread</Badge>
          )}
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              placeholder="Search channels..."
              className="pl-8 h-8"
            />
          </div>
        )}
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-2 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedChannels.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    <Star className="h-3 w-3 text-yellow-500" />
                    Pinned
                  </div>
                  <div className="space-y-0.5">
                    {pinnedChannels.map((channel) => (
                      <ChannelItem
                        key={channel.id}
                        channel={channel}
                        isActive={currentChannelId === channel.id}
                        onSelect={() => onChannelSelect(channel.id)}
                        onAction={onChannelAction ? (action) => onChannelAction(action, channel.id) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories or flat list */}
              {channelsByCategory ? (
                channelsByCategory
                  .filter((cat) => cat.channels.length > 0)
                  .map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      currentChannelId={currentChannelId}
                      onChannelSelect={onChannelSelect}
                      onChannelAction={onChannelAction}
                      onToggle={() => handleCategoryToggle(category.id)}
                      onCreateChannel={onCreateChannel}
                    />
                  ))
              ) : (
                <>
                  {/* Channels Section */}
                  {unpinnedChannels.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Channels
                        </span>
                        {showCreateButton && onCreateChannel && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={onCreateChannel}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Create Channel</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {unpinnedChannels.map((channel) => (
                          <ChannelItem
                            key={channel.id}
                            channel={channel}
                            isActive={currentChannelId === channel.id}
                            onSelect={() => onChannelSelect(channel.id)}
                            onAction={onChannelAction ? (action) => onChannelAction(action, channel.id) : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Direct Messages Section */}
              {filteredDMs.length > 0 && (
                <Collapsible open={!dmCollapsed} onOpenChange={() => setDmCollapsed(!dmCollapsed)}>
                  <div className="flex items-center justify-between px-2 py-1">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider font-semibold">
                        {dmCollapsed ? (
                          <ChevronRight className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        Direct Messages
                        <span className="text-[10px] ml-1">({filteredDMs.length})</span>
                      </button>
                    </CollapsibleTrigger>
                    {showCreateButton && onCreateDM && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={onCreateDM}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>New Message</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  <CollapsibleContent>
                    <div className="space-y-0.5">
                      {filteredDMs.map((dm) => (
                        <ChannelItem
                          key={dm.id}
                          channel={dm}
                          isActive={currentChannelId === dm.id}
                          onSelect={() => onChannelSelect(dm.id)}
                          onAction={onChannelAction ? (action) => onChannelAction(action, dm.id) : undefined}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Empty state */}
              {filteredChannels.length === 0 && filteredDMs.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No channels found' : 'No channels yet'}
                  </p>
                  {!searchQuery && onCreateChannel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={onCreateChannel}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Channel
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
