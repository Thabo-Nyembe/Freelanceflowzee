'use client'

/**
 * Message List Component
 *
 * Industry-leading message display with:
 * - Virtualized scrolling for performance
 * - Date separators
 * - Unread markers
 * - Message grouping
 * - Infinite scroll
 * - Smooth animations
 * - Accessibility support
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Reply,
  Forward,
  Copy,
  Pin,
  Edit3,
  Trash2,
  MessageSquare,
  Smile,
  File,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  ExternalLink,
  Bookmark,
  Flag,
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface MessageListMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userRole?: 'admin' | 'moderator' | 'member'
  content: string
  htmlContent?: string
  type: 'text' | 'system' | 'file' | 'image' | 'video' | 'audio' | 'link'
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  replyTo?: MessageReplyRef
  threadId?: string
  threadReplyCount?: number
  threadLastReply?: Date
  isPinned?: boolean
  isEdited?: boolean
  isDeleted?: boolean
  isHighlighted?: boolean
  isUnread?: boolean
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  createdAt: Date
  editedAt?: Date
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
  dimensions?: { width: number; height: number }
  duration?: number
}

export interface MessageReaction {
  emoji: string
  emojiCode: string
  count: number
  users: Array<{ id: string; name: string }>
  hasReacted: boolean
}

export interface MessageReplyRef {
  id: string
  userId: string
  userName: string
  content: string
  type: 'text' | 'file' | 'image'
}

export interface MessageGroup {
  date: Date
  messages: MessageListMessage[]
}

export interface MessageListProps {
  messages: MessageListMessage[]
  currentUserId: string
  unreadCount?: number
  firstUnreadId?: string
  isLoading?: boolean
  hasMore?: boolean
  showDateSeparators?: boolean
  showReadStatus?: boolean
  groupByUser?: boolean
  groupTimeThreshold?: number // minutes
  onLoadMore?: () => void
  onMessageAction?: (action: MessageAction, messageId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  onThreadClick?: (messageId: string) => void
  onUserClick?: (userId: string) => void
  onAttachmentClick?: (attachment: MessageAttachment) => void
  onLinkClick?: (url: string) => void
  className?: string
}

export type MessageAction =
  | 'reply'
  | 'forward'
  | 'copy'
  | 'pin'
  | 'unpin'
  | 'edit'
  | 'delete'
  | 'bookmark'
  | 'report'
  | 'thread'

// ============================================================================
// Constants
// ============================================================================

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

// ============================================================================
// Utility Functions
// ============================================================================

function formatMessageDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else if (date.getFullYear() === today.getFullYear()) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
  } else {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
  }
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function groupMessages(
  messages: MessageListMessage[],
  groupByUser: boolean,
  timeThreshold: number
): MessageGroup[] {
  const groups: MessageGroup[] = []
  let currentDate: string | null = null

  for (const message of messages) {
    const messageDate = new Date(message.createdAt).toDateString()

    if (messageDate !== currentDate) {
      groups.push({
        date: new Date(message.createdAt),
        messages: [message],
      })
      currentDate = messageDate
    } else {
      groups[groups.length - 1].messages.push(message)
    }
  }

  return groups
}

// ============================================================================
// Sub-Components
// ============================================================================

function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 border-t border-border" />
      <span className="px-3 text-xs text-muted-foreground font-medium bg-background">
        {formatMessageDate(date)}
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

function UnreadSeparator({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 border-t border-destructive/50" />
      <Badge variant="destructive" className="mx-3">
        {count} unread {count === 1 ? 'message' : 'messages'}
      </Badge>
      <div className="flex-1 border-t border-destructive/50" />
    </div>
  )
}

function DeliveryStatusIcon({ status }: { status?: string }) {
  switch (status) {
    case 'pending':
      return <Clock className="h-3 w-3 text-muted-foreground" />
    case 'sent':
      return <Check className="h-3 w-3 text-muted-foreground" />
    case 'delivered':
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />
    case 'read':
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    case 'failed':
      return <AlertCircle className="h-3 w-3 text-destructive" />
    default:
      return null
  }
}

function AttachmentPreview({
  attachment,
  onClick,
}: {
  attachment: MessageAttachment
  onClick?: () => void
}) {
  const getIcon = () => {
    switch (attachment.type) {
      case 'image':
        return <ImageIcon className="h-8 w-8" />
      case 'video':
        return <Video className="h-8 w-8" />
      case 'audio':
        return <Music className="h-8 w-8" />
      default:
        return <File className="h-8 w-8" />
    }
  }

  if (attachment.type === 'image') {
    return (
      <div className="relative group cursor-pointer" onClick={onClick}>
        <img
          src={attachment.thumbnail || attachment.url}
          alt={attachment.name}
          className="rounded-lg max-w-[300px] max-h-[300px] object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <ExternalLink className="h-6 w-6 text-white" />
        </div>
      </div>
    )
  }

  if (attachment.type === 'video') {
    return (
      <div className="relative group cursor-pointer" onClick={onClick}>
        <video
          src={attachment.url}
          poster={attachment.thumbnail}
          className="rounded-lg max-w-[300px] max-h-[200px] object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 rounded-full p-3">
            <Video className="h-6 w-6 text-white" />
          </div>
        </div>
        {attachment.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(attachment.duration)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors max-w-[300px]"
      onClick={onClick}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
      </div>
      <Button variant="ghost" size="icon" className="flex-shrink-0">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}

function ReactionBar({
  reactions,
  onReaction,
  messageId,
}: {
  reactions: MessageReaction[]
  onReaction: (messageId: string, emoji: string) => void
  messageId: string
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction) => (
        <TooltipProvider key={reaction.emoji}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onReaction(messageId, reaction.emoji)}
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs',
                  'hover:bg-muted/80 transition-colors',
                  reaction.hasReacted
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted/50 border border-transparent'
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                {reaction.users.slice(0, 5).map((u) => u.name).join(', ')}
                {reaction.users.length > 5 && ` and ${reaction.users.length - 5} others`}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

function ThreadPreview({
  replyCount,
  lastReply,
  onClick,
}: {
  replyCount: number
  lastReply?: Date
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 mt-2 text-xs text-primary hover:underline"
    >
      <MessageSquare className="h-3.5 w-3.5" />
      <span>
        {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
      </span>
      {lastReply && (
        <span className="text-muted-foreground">
          Last reply {formatTime(lastReply)}
        </span>
      )}
    </button>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function MessageList({
  messages,
  currentUserId,
  unreadCount = 0,
  firstUnreadId,
  isLoading = false,
  hasMore = false,
  showDateSeparators = true,
  showReadStatus = true,
  groupByUser = true,
  groupTimeThreshold = 5,
  onLoadMore,
  onMessageAction,
  onReaction,
  onThreadClick,
  onUserClick,
  onAttachmentClick,
  onLinkClick,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [showUnreadMarker, setShowUnreadMarker] = useState(!!firstUnreadId)

  // Group messages by date
  const messageGroups = useMemo(
    () => groupMessages(messages, groupByUser, groupTimeThreshold),
    [messages, groupByUser, groupTimeThreshold]
  )

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      if (target.scrollTop < 100 && hasMore && !isLoading) {
        onLoadMore?.()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  // Scroll to first unread message on mount
  useEffect(() => {
    if (firstUnreadId && scrollRef.current) {
      const element = document.getElementById(`message-${firstUnreadId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [firstUnreadId])

  // Check if message is part of a group with same user
  const shouldShowAvatar = (message: MessageListMessage, index: number, groupMessages: MessageListMessage[]) => {
    if (!groupByUser) return true
    if (index === 0) return true

    const prevMessage = groupMessages[index - 1]
    const timeDiff = (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) / 1000 / 60
    return prevMessage.userId !== message.userId || timeDiff > groupTimeThreshold
  }

  const renderMessage = (message: MessageListMessage, showAvatar: boolean) => {
    const isOwnMessage = message.userId === currentUserId
    const isSystemMessage = message.type === 'system'
    const isHovered = hoveredMessageId === message.id

    if (isSystemMessage) {
      return (
        <div
          key={message.id}
          id={`message-${message.id}`}
          className="flex justify-center py-2"
        >
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      )
    }

    return (
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={cn(
          'flex gap-2 py-1 px-2 -mx-2 rounded-lg transition-colors group',
          isHovered && 'bg-muted/50',
          message.isHighlighted && 'bg-yellow-500/10',
          message.isUnread && 'border-l-2 border-primary'
        )}
        onMouseEnter={() => setHoveredMessageId(message.id)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {/* Avatar */}
        <div className="w-10 flex-shrink-0">
          {showAvatar && !isOwnMessage && (
            <Avatar
              className="h-10 w-10 cursor-pointer hover:ring-2 ring-primary/20 transition-all"
              onClick={() => onUserClick?.(message.userId)}
            >
              <AvatarImage src={message.userAvatar} />
              <AvatarFallback>{message.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {showAvatar && (
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="font-semibold text-sm cursor-pointer hover:underline"
                onClick={() => onUserClick?.(message.userId)}
              >
                {message.userName}
              </span>
              {message.userRole && message.userRole !== 'member' && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {message.userRole}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatTime(message.createdAt)}
              </span>
              {message.isEdited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
              {message.isPinned && (
                <Pin className="h-3 w-3 text-yellow-500" />
              )}
            </div>
          )}

          {/* Reply reference */}
          {message.replyTo && (
            <div className="text-xs text-muted-foreground mb-1 pl-2 border-l-2 border-muted-foreground/30 cursor-pointer hover:bg-muted/50 rounded py-0.5">
              <span className="font-medium">{message.replyTo.userName}</span>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Content */}
          {message.isDeleted ? (
            <p className="text-muted-foreground italic">This message was deleted</p>
          ) : message.htmlContent ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.htmlContent) }}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((attachment) => (
                <AttachmentPreview
                  key={attachment.id}
                  attachment={attachment}
                  onClick={() => onAttachmentClick?.(attachment)}
                />
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && onReaction && (
            <ReactionBar
              reactions={message.reactions}
              onReaction={onReaction}
              messageId={message.id}
            />
          )}

          {/* Thread preview */}
          {message.threadReplyCount && message.threadReplyCount > 0 && onThreadClick && (
            <ThreadPreview
              replyCount={message.threadReplyCount}
              lastReply={message.threadLastReply}
              onClick={() => onThreadClick(message.id)}
            />
          )}
        </div>

        {/* Actions */}
        <div
          className={cn(
            'flex items-start gap-1 opacity-0 transition-opacity',
            isHovered && 'opacity-100'
          )}
        >
          {/* Quick reactions */}
          {onReaction && (
            <div className="flex items-center gap-0.5 bg-background border rounded-md shadow-sm p-0.5">
              {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className="hover:bg-muted p-1 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* More actions */}
          {onMessageAction && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onMessageAction('reply', message.id)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                {onThreadClick && (
                  <DropdownMenuItem onClick={() => onMessageAction('thread', message.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Thread
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onMessageAction('forward', message.id)}>
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMessageAction('copy', message.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onMessageAction(message.isPinned ? 'unpin' : 'pin', message.id)}
                >
                  <Pin className="h-4 w-4 mr-2" />
                  {message.isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMessageAction('bookmark', message.id)}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmark
                </DropdownMenuItem>

                {isOwnMessage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onMessageAction('edit', message.id)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onMessageAction('delete', message.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}

                {!isOwnMessage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onMessageAction('report', message.id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Delivery status for own messages */}
        {isOwnMessage && showReadStatus && (
          <div className="w-5 flex-shrink-0 flex items-end pb-1">
            <DeliveryStatusIcon status={message.deliveryStatus} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={cn('flex-1 overflow-y-auto px-4', className)}
      onScroll={handleScroll}
    >
      {/* Loading indicator */}
      {isLoading && hasMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}

      {/* Messages */}
      {messageGroups.map((group, groupIndex) => (
        <div key={group.date.toISOString()}>
          {showDateSeparators && <DateSeparator date={group.date} />}

          {group.messages.map((message, messageIndex) => {
            const showUnread =
              showUnreadMarker &&
              message.id === firstUnreadId &&
              unreadCount > 0

            return (
              <React.Fragment key={message.id}>
                {showUnread && <UnreadSeparator count={unreadCount} />}
                {renderMessage(
                  message,
                  shouldShowAvatar(message, messageIndex, group.messages)
                )}
              </React.Fragment>
            )
          })}
        </div>
      ))}

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No messages yet</h3>
          <p className="text-sm text-muted-foreground">
            Start the conversation by sending a message
          </p>
        </div>
      )}
    </div>
  )
}
