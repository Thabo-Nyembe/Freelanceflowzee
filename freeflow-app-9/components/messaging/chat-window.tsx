'use client'

/**
 * Chat Window Component
 *
 * Industry-leading chat interface with:
 * - Real-time messaging
 * - Rich text formatting
 * - File attachments
 * - Emoji picker
 * - Typing indicators
 * - Message reactions
 * - Thread support
 * - Voice messages
 * - Search within chat
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Search,
  Phone,
  Video,
  Info,
  Pin,
  Reply,
  Forward,
  Copy,
  Trash2,
  Edit3,
  MessageSquare,
  Image as ImageIcon,
  File,
  X,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  AtSign,
  Hash,
  Bold,
  Italic,
  Code,
  Link2,
  List,
  ArrowDown,
  Settings,
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  htmlContent?: string
  type: 'text' | 'system' | 'file' | 'image' | 'video' | 'audio'
  attachments?: Attachment[]
  reactions?: Reaction[]
  replyTo?: MessageReply
  threadId?: string
  threadCount?: number
  isPinned?: boolean
  isEdited?: boolean
  isDeleted?: boolean
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  createdAt: Date
  editedAt?: Date
}

export interface Attachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
}

export interface Reaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

export interface MessageReply {
  id: string
  userId: string
  userName: string
  content: string
}

export interface TypingUser {
  userId: string
  userName: string
  userAvatar?: string
}

export interface ChannelInfo {
  id: string
  name: string
  type: 'direct' | 'group' | 'public' | 'private'
  description?: string
  memberCount: number
  avatar?: string
  isOnline?: boolean
  lastSeen?: Date
}

export interface ChatWindowProps {
  channel: ChannelInfo
  messages: Message[]
  currentUserId: string
  currentUserName: string
  typingUsers?: TypingUser[]
  isLoading?: boolean
  hasMoreMessages?: boolean
  onSendMessage: (content: string, attachments?: File[], replyTo?: string) => void
  onEditMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onReactToMessage?: (messageId: string, emoji: string) => void
  onPinMessage?: (messageId: string) => void
  onStartThread?: (messageId: string) => void
  onLoadMoreMessages?: () => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  onSearch?: (query: string) => void
  onCall?: (type: 'audio' | 'video') => void
  onShowInfo?: () => void
  className?: string
}

// ============================================================================
// Emoji Data
// ============================================================================

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏']

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'] },
  { name: 'Gestures', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐', '🤲', '🙏', '💪', '🤝'] },
  { name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💝'] },
  { name: 'Objects', emojis: ['🎉', '🎊', '🎁', '🏆', '🔥', '⭐', '✨', '💡', '📌', '📎', '✅', '❌', '⚡', '💰', '🎯'] },
]

// ============================================================================
// Chat Window Component
// ============================================================================

export default function ChatWindow({
  channel,
  messages,
  currentUserId,
  currentUserName,
  typingUsers = [],
  isLoading = false,
  hasMoreMessages = false,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onPinMessage,
  onStartThread,
  onLoadMoreMessages,
  onTypingStart,
  onTypingStop,
  onSearch,
  onCall,
  onShowInfo,
  className,
}: ChatWindowProps) {
  // State
  const [inputValue, setInputValue] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setShowScrollButton(!isNearBottom)

    // Load more when near top
    if (target.scrollTop < 100 && hasMoreMessages && !isLoading) {
      onLoadMoreMessages?.()
    }
  }, [hasMoreMessages, isLoading, onLoadMoreMessages])

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: 'smooth' })
      }
    }
  }

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)

    // Typing indicator logic
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

  // Handle send message
  const handleSend = () => {
    const content = inputValue.trim()
    if (!content && attachments.length === 0) return

    if (editingMessage) {
      onEditMessage?.(editingMessage.id, content)
      setEditingMessage(null)
    } else {
      onSendMessage(content, attachments, replyingTo?.id)
      setReplyingTo(null)
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
    setAttachments(prev => [...prev, ...files])
    e.target.value = ''
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji)
    setIsEmojiPickerOpen(false)
    inputRef.current?.focus()
  }

  // Format text
  const formatText = (format: 'bold' | 'italic' | 'code' | 'link') => {
    const formats: Record<string, { prefix: string; suffix: string }> = {
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '*', suffix: '*' },
      code: { prefix: '`', suffix: '`' },
      link: { prefix: '[', suffix: '](url)' },
    }

    const { prefix, suffix } = formats[format]
    setInputValue(prev => `${prev}${prefix}text${suffix}`)
    inputRef.current?.focus()
  }

  // Get delivery status icon
  const getDeliveryIcon = (status?: string) => {
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

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Render message content
  const renderMessageContent = (message: Message) => {
    if (message.isDeleted) {
      return <em className="text-muted-foreground">This message was deleted</em>
    }

    if (message.htmlContent) {
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: message.htmlContent }}
        />
      )
    }

    return <p className="whitespace-pre-wrap break-words">{message.content}</p>
  }

  // Render attachments
  const renderAttachments = (attachments: Attachment[]) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="relative group">
            {attachment.type === 'image' ? (
              <img
                src={attachment.thumbnail || attachment.url}
                alt={attachment.name}
                className="rounded-lg max-w-[200px] max-h-[200px] object-cover cursor-pointer hover:opacity-90"
              />
            ) : (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <File className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Render reactions
  const renderReactions = (message: Message) => {
    if (!message.reactions || message.reactions.length === 0) return null

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {message.reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={() => onReactToMessage?.(message.id, reaction.emoji)}
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs',
              'hover:bg-muted transition-colors',
              reaction.hasReacted
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-muted/50'
            )}
          >
            <span>{reaction.emoji}</span>
            <span className="text-muted-foreground">{reaction.count}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={channel.avatar} />
            <AvatarFallback>
              {channel.type === 'direct' ? channel.name.slice(0, 2).toUpperCase() : <Hash className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{channel.name}</h2>
            <p className="text-xs text-muted-foreground">
              {channel.type === 'direct' ? (
                channel.isOnline ? 'Online' : channel.lastSeen ? `Last seen ${formatTime(channel.lastSeen)}` : 'Offline'
              ) : (
                `${channel.memberCount} members`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isSearchOpen ? (
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-48 h-8"
                onKeyDown={(e) => e.key === 'Enter' && onSearch?.(searchQuery)}
              />
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onCall?.('audio')}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onCall?.('video')}>
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Video Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onShowInfo}>
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Channel Info</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4" onScrollCapture={handleScroll}>
        <div className="py-4 space-y-4">
          {isLoading && hasMoreMessages && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}

          {messages.map((message, index) => {
            const isOwnMessage = message.userId === currentUserId
            const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.userId !== message.userId)
            const isSystemMessage = message.type === 'system'

            if (isSystemMessage) {
              return (
                <div key={message.id} className="flex justify-center">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {message.content}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2 group',
                  isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                {!isOwnMessage && (
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.userAvatar} />
                        <AvatarFallback>{message.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className={cn('max-w-[70%]', isOwnMessage && 'items-end')}>
                  {/* Reply preview */}
                  {message.replyTo && (
                    <div className="text-xs text-muted-foreground mb-1 pl-2 border-l-2 border-muted-foreground/30">
                      <span className="font-medium">{message.replyTo.userName}</span>
                      <p className="truncate">{message.replyTo.content}</p>
                    </div>
                  )}

                  {/* Sender name */}
                  {!isOwnMessage && showAvatar && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">{message.userName}</p>
                  )}

                  {/* Message bubble */}
                  <div
                    className={cn(
                      'relative rounded-2xl px-3 py-2',
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm',
                      message.isPinned && 'ring-2 ring-yellow-500/50'
                    )}
                  >
                    {message.isPinned && (
                      <Pin className="absolute -top-2 -right-2 h-4 w-4 text-yellow-500" />
                    )}

                    {renderMessageContent(message)}

                    {message.attachments && renderAttachments(message.attachments)}

                    {/* Time and status */}
                    <div className={cn(
                      'flex items-center gap-1 mt-1 text-[10px]',
                      isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      <span>{formatTime(message.createdAt)}</span>
                      {message.isEdited && <span>(edited)</span>}
                      {isOwnMessage && getDeliveryIcon(message.deliveryStatus)}
                    </div>

                    {/* Thread indicator */}
                    {message.threadCount && message.threadCount > 0 && (
                      <button
                        onClick={() => onStartThread?.(message.id)}
                        className={cn(
                          'flex items-center gap-1 mt-2 text-xs hover:underline',
                          isOwnMessage ? 'text-primary-foreground/80' : 'text-primary'
                        )}
                      >
                        <MessageSquare className="h-3 w-3" />
                        {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                  </div>

                  {/* Reactions */}
                  {renderReactions(message)}
                </div>

                {/* Message actions */}
                <div className={cn(
                  'flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                  isOwnMessage && 'flex-row-reverse'
                )}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align={isOwnMessage ? 'end' : 'start'}>
                      <div className="flex gap-1">
                        {QUICK_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => onReactToMessage?.(message.id, emoji)}
                            className="text-xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
                      <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStartThread?.(message.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Thread
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPinMessage?.(message.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {message.isPinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                      {isOwnMessage && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setEditingMessage(message)
                            setInputValue(message.content)
                          }}>
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
          })}
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <div className="flex -space-x-2">
            {typingUsers.slice(0, 3).map((user) => (
              <Avatar key={user.userId} className="h-5 w-5 border-2 border-background">
                <AvatarImage src={user.userAvatar} />
                <AvatarFallback className="text-[8px]">{user.userName.slice(0, 2)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].userName} is typing`
              : typingUsers.length === 2
              ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`
              : `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing`}
          </span>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      )}

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-6">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Reply/Edit Preview */}
      {(replyingTo || editingMessage) && (
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {replyingTo ? (
              <>
                <Reply className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Replying to {replyingTo.userName}</p>
                  <p className="text-sm truncate max-w-[300px]">{replyingTo.content}</p>
                </div>
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Editing message</p>
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setReplyingTo(null)
              setEditingMessage(null)
              setInputValue('')
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-16 w-16 object-cover rounded-lg"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-lg">
                  <File className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 border-t">
        {/* Formatting toolbar */}
        {showFormatting && (
          <div className="flex items-center gap-1 pb-2 border-b mb-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => formatText('bold')}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => formatText('italic')}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => formatText('code')}>
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => formatText('link')}>
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attachment button */}
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
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-2xl border bg-muted/50 px-4 py-2 pr-24',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                'min-h-[40px] max-h-[120px]'
              )}
              style={{ height: 'auto', overflowY: inputValue.split('\n').length > 3 ? 'auto' : 'hidden' }}
            />

            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowFormatting(!showFormatting)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2" align="end">
                  <div className="space-y-2">
                    {EMOJI_CATEGORIES.map((category) => (
                      <div key={category.name}>
                        <p className="text-xs text-muted-foreground mb-1">{category.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {category.emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => insertEmoji(emoji)}
                              className="text-xl hover:bg-muted p-1 rounded transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() && attachments.length === 0}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
