'use client'

/**
 * Thread View Component
 *
 * Industry-leading thread interface with:
 * - Parent message context
 * - Threaded replies
 * - Thread subscriptions
 * - Real-time updates
 * - Resolve/reopen threads
 * - Thread participants
 * - Search within thread
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  X,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Bell,
  BellOff,
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  Users,
  Pin,
  Copy,
  Trash2,
  Edit3,
  Reply,
  ArrowUpRight,
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  File,
  AtSign,
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface ThreadMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  htmlContent?: string
  attachments?: ThreadAttachment[]
  reactions?: ThreadReaction[]
  isEdited?: boolean
  isDeleted?: boolean
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  createdAt: Date
  editedAt?: Date
}

export interface ThreadAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
}

export interface ThreadReaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

export interface ThreadParticipant {
  id: string
  name: string
  avatar?: string
  isOnline?: boolean
  lastReadAt?: Date
}

export interface Thread {
  id: string
  channelId: string
  channelName: string
  parentMessage: ThreadMessage
  replies: ThreadMessage[]
  participants: ThreadParticipant[]
  replyCount: number
  isResolved: boolean
  isLocked: boolean
  isSubscribed: boolean
  isMuted: boolean
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export interface TypingUser {
  userId: string
  userName: string
}

export interface ThreadViewProps {
  thread: Thread
  currentUserId: string
  currentUserName: string
  typingUsers?: TypingUser[]
  isLoading?: boolean
  onClose: () => void
  onSendReply: (content: string, attachments?: File[]) => void
  onEditMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onReactToMessage?: (messageId: string, emoji: string) => void
  onResolve?: () => void
  onReopen?: () => void
  onLock?: () => void
  onUnlock?: () => void
  onSubscribe?: () => void
  onUnsubscribe?: () => void
  onMute?: () => void
  onUnmute?: () => void
  onGoToMessage?: () => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂'] },
  { name: 'Gestures', emojis: ['👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '💪', '🤝'] },
  { name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '💕', '💖', '💝'] },
]

// ============================================================================
// Utility Functions
// ============================================================================

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function formatDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${formatTime(date)}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${formatTime(date)}`
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ============================================================================
// Sub-Components
// ============================================================================

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

function ParticipantAvatars({ participants, maxShow = 5 }: { participants: ThreadParticipant[]; maxShow?: number }) {
  const shown = participants.slice(0, maxShow)
  const remaining = participants.length - maxShow

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center -space-x-2">
            {shown.map((participant) => (
              <div key={participant.id} className="relative">
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {participant.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {participant.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-background" />
                )}
              </div>
            ))}
            {remaining > 0 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                +{remaining}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-medium mb-1">{participants.length} participants</p>
            {participants.slice(0, 10).map((p) => (
              <p key={p.id}>{p.name}</p>
            ))}
            {participants.length > 10 && <p>and {participants.length - 10} more...</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function ThreadView({
  thread,
  currentUserId,
  currentUserName,
  typingUsers = [],
  isLoading = false,
  onClose,
  onSendReply,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onResolve,
  onReopen,
  onLock,
  onUnlock,
  onSubscribe,
  onUnsubscribe,
  onMute,
  onUnmute,
  onGoToMessage,
  onTypingStart,
  onTypingStop,
  className,
}: ThreadViewProps) {
  const [inputValue, setInputValue] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [thread.replies])

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (e.target.value.length > 0) {
      onTypingStart?.()
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop?.()
      }, 3000)
    } else {
      onTypingStop?.()
    }
  }

  // Handle send
  const handleSend = () => {
    const content = inputValue.trim()
    if (!content && attachments.length === 0) return

    if (editingMessageId) {
      onEditMessage?.(editingMessageId, content)
      setEditingMessageId(null)
      setEditContent('')
    } else {
      onSendReply(content, attachments)
    }

    setInputValue('')
    setAttachments([])
    onTypingStop?.()

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
    e.target.value = ''
  }

  // Start editing
  const startEditing = (message: ThreadMessage) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
    setInputValue(message.content)
    inputRef.current?.focus()
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessageId(null)
    setEditContent('')
    setInputValue('')
  }

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji)
    setIsEmojiPickerOpen(false)
    inputRef.current?.focus()
  }

  // Render message
  const renderMessage = (message: ThreadMessage, isParent: boolean = false) => {
    const isOwnMessage = message.userId === currentUserId
    const isHovered = hoveredMessageId === message.id
    const isEditing = editingMessageId === message.id

    return (
      <div
        key={message.id}
        className={cn(
          'flex gap-3 py-2 px-2 -mx-2 rounded-lg transition-colors group',
          isHovered && 'bg-muted/50',
          isParent && 'bg-muted/30 border-l-2 border-primary'
        )}
        onMouseEnter={() => setHoveredMessageId(message.id)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {/* Avatar */}
        <Avatar className={cn('flex-shrink-0', isParent ? 'h-10 w-10' : 'h-8 w-8')}>
          <AvatarImage src={message.userAvatar} />
          <AvatarFallback>{message.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm">{message.userName}</span>
            <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
            {message.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {isOwnMessage && <DeliveryStatusIcon status={message.deliveryStatus} />}
          </div>

          {/* Message content */}
          {message.isDeleted ? (
            <p className="text-sm text-muted-foreground italic">This message was deleted</p>
          ) : message.htmlContent ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: message.htmlContent }}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.thumbnail || attachment.url}
                      alt={attachment.name}
                      className="rounded-lg max-w-[200px] max-h-[150px] object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <File className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium truncate max-w-[150px]">{attachment.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => onReactToMessage?.(message.id, reaction.emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs',
                    'hover:bg-muted/80 transition-colors',
                    reaction.hasReacted
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50'
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-muted-foreground">{reaction.count}</span>
                </button>
              ))}
            </div>
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
          {onReactToMessage && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex gap-1">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReactToMessage(message.id, emoji)}
                      className="text-lg hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </DropdownMenuItem>
              {isParent && onGoToMessage && (
                <DropdownMenuItem onClick={onGoToMessage}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Go to Message
                </DropdownMenuItem>
              )}
              {isOwnMessage && !message.isDeleted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => startEditing(message)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDeleteMessage?.(message.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-background border-l', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Thread</h2>
            <p className="text-xs text-muted-foreground">
              #{thread.channelName} · {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Status badges */}
          {thread.isResolved && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
          {thread.isLocked && (
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}

          {/* Participants */}
          <ParticipantAvatars participants={thread.participants} />

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {thread.isSubscribed ? (
                <DropdownMenuItem onClick={onUnsubscribe}>
                  <BellOff className="h-4 w-4 mr-2" />
                  Unsubscribe
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onSubscribe}>
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe
                </DropdownMenuItem>
              )}
              {thread.isMuted ? (
                <DropdownMenuItem onClick={onUnmute}>
                  <Bell className="h-4 w-4 mr-2" />
                  Unmute
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onMute}>
                  <BellOff className="h-4 w-4 mr-2" />
                  Mute
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {thread.isResolved ? (
                <DropdownMenuItem onClick={onReopen}>
                  <Circle className="h-4 w-4 mr-2" />
                  Reopen Thread
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onResolve}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </DropdownMenuItem>
              )}
              {thread.isLocked ? (
                <DropdownMenuItem onClick={onUnlock}>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Thread
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onLock}>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock Thread
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close button */}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="py-4 space-y-1">
          {/* Parent message */}
          {renderMessage(thread.parentMessage, true)}

          {/* Replies separator */}
          {thread.replies.length > 0 && (
            <div className="flex items-center gap-2 py-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              </span>
              <Separator className="flex-1" />
            </div>
          )}

          {/* Replies */}
          {thread.replies.map((reply) => renderMessage(reply))}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].userName} is typing`
              : `${typingUsers.length} people are typing`}
          </span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      )}

      {/* Resolved/Locked notice */}
      {(thread.isResolved || thread.isLocked) && (
        <div className={cn(
          'px-4 py-2 text-sm flex items-center gap-2',
          thread.isLocked ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'
        )}>
          {thread.isLocked ? (
            <>
              <Lock className="h-4 w-4" />
              <span>This thread is locked. Only moderators can reply.</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>This thread has been marked as resolved.</span>
            </>
          )}
        </div>
      )}

      {/* Input area */}
      {!thread.isLocked && (
        <div className="px-4 py-3 border-t">
          {/* Editing indicator */}
          {editingMessageId && (
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-muted-foreground">Editing message</span>
              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          )}

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="h-12 w-12 flex items-center justify-center bg-muted rounded-lg">
                    <File className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Reply to thread..."
                rows={1}
                className={cn(
                  'w-full resize-none rounded-lg border bg-muted/50 px-3 py-2 pr-20',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'min-h-[36px] max-h-[100px] text-sm'
                )}
              />

              <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="end">
                    {EMOJI_CATEGORIES.map((category) => (
                      <div key={category.name} className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">{category.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {category.emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => insertEmoji(emoji)}
                              className="text-lg hover:bg-muted p-1 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <AtSign className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Send button */}
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() && attachments.length === 0}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
