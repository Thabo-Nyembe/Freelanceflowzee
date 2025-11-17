"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommunicationStore, useChannelMessages, useTypingUsers } from '@/lib/communication/unified-communication-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Send,
  Paperclip,
  Image,
  Video,
  Mic,
  MicOff,
  Smile,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Download,
  Play,
  Pause,
  Phone,
  VideoIcon,
  Screen,
  Users,
  Search,
  Filter,
  Pin,
  Heart,
  ThumbsUp,
  Laugh,
  Surprised,
  Angry,
  Cry,
  Bookmark
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns'

// Emoji picker data
const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡', '👏', '🎉', '🔥', '💯']

const EMOJI_CATEGORIES = {
  'Smileys & People': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
  'Animals & Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🐦'],
  'Food & Drink': ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍅', '🥑', '🍆', '🥒', '🥕', '🌽', '🥔', '🍠', '🥜', '🍯'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🥍', '🏏', '⛳'],
  'Travel & Places': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼']
}

interface MessageItemProps {
  message: any
  currentUserId: string
  onReply: (messageId: string) => void
  onEdit: (messageId: string) => void
  onDelete: (messageId: string) => void
  onReact: (messageId: string, emoji: string) => void
  showAvatar?: boolean
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  showAvatar = true
}) => {
  const [showReactions, setShowReactions] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const isOwnMessage = message.authorId === currentUserId
  const messageTime = format(new Date(message.createdAt), 'HH:mm')

  const handleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setAudioProgress(progress)
    }
  }

  const renderAttachment = (attachment: any) => {
    const isImage = attachment.type.startsWith('image/')
    const isVideo = attachment.type.startsWith('video/')
    const isAudio = attachment.type.startsWith('audio/')

    if (isImage) {
      return (
        <div className="mt-2">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-sm max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
          />
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="mt-2">
          <video
            src={attachment.url}
            controls
            className="max-w-sm max-h-64 rounded-lg"
            preload="metadata"
          />
        </div>
      )
    }

    if (isAudio) {
      return (
        <div className="mt-2 flex items-center space-x-2 bg-muted p-3 rounded-lg max-w-xs">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAudioPlay}
            className="p-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">{attachment.name}</div>
            <div className="w-full bg-muted-foreground/20 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          </div>
          <audio
            ref={audioRef}
            src={attachment.url}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )
    }

    return (
      <div className="mt-2 flex items-center space-x-2 bg-muted p-3 rounded-lg max-w-xs">
        <Paperclip className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">
            {(attachment.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.open(attachment.url, '_blank')}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex gap-3 p-3 hover:bg-muted/50 transition-colors group",
        isOwnMessage && "flex-row-reverse"
      )}
    >
      {showAvatar && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.authorAvatar} />
          <AvatarFallback>
            {message.authorName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex-1 max-w-[70%]", isOwnMessage && "text-right")}>
        {/* Message Header */}
        <div className={cn("flex items-center gap-2 mb-1", isOwnMessage && "justify-end")}>
          <span className="text-sm font-medium">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">{messageTime}</span>
          {message.edited && (
            <Badge variant="secondary" className="text-xs">
              Edited
            </Badge>
          )}
        </div>

        {/* Message Content */}
        <div
          className={cn(
            "relative p-3 rounded-lg max-w-fit",
            isOwnMessage
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted"
          )}
        >
          {/* Reply indicator */}
          {message.replyTo && (
            <div className="text-xs opacity-70 mb-2 border-l-2 border-current pl-2">
              Replying to previous message
            </div>
          )}

          {/* Text content */}
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>

          {/* Attachments */}
          {message.attachments?.map((attachment: any) => (
            <div key={attachment.id}>
              {renderAttachment(attachment)}
            </div>
          ))}

          {/* Message Status */}
          {isOwnMessage && (
            <div className="text-xs opacity-70 mt-1 text-right">
              {message.status === 'sending' && 'Sending...'}
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && '✓✓ Read'}
              {message.status === 'failed' && '❌ Failed'}
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction: any) => (
              <Button
                key={reaction.id}
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => onReact(message.id, reaction.emoji)}
              >
                {reaction.emoji} {reaction.count || 1}
              </Button>
            ))}
          </div>
        )}

        {/* Quick reactions */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex gap-1 mt-2"
            >
              {EMOJI_REACTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    onReact(message.id, emoji)
                    setShowReactions(false)
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Actions */}
      <div className={cn(
        "opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
        isOwnMessage && "order-first"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowReactions(!showReactions)}
              className="h-8 w-8 p-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add reaction</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReply(message.id)}
              className="h-8 w-8 p-0"
            >
              <Reply className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-1">
              {isOwnMessage && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => onEdit(message.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => onDelete(message.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy text
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start"
              >
                <Pin className="w-4 h-4 mr-2" />
                Pin message
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save message
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  )
}

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void
  onTyping: (isTyping: boolean) => void
  replyingTo?: any
  onCancelReply?: () => void
  disabled?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  replyingTo,
  onCancelReply,
  disabled = false
}) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments)
      setMessage('')
      setAttachments([])
      onTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (value: string) => {
    setMessage(value)

    // Handle typing indicators
    onTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 2000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioChunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
          type: 'audio/webm'
        })
        setAttachments(prev => [...prev, audioFile])
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="border-t bg-background p-4">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between mb-3 p-2 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Reply className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Replying to <strong>{replyingTo.authorName}</strong>
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={onCancelReply}>
            ×
          </Button>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-muted p-2 rounded-lg"
            >
              <div className="flex items-center space-x-2 flex-1">
                {file.type.startsWith('image/') && <Image className="w-4 h-4" />}
                {file.type.startsWith('video/') && <Video className="w-4 h-4" />}
                {file.type.startsWith('audio/') && <Mic className="w-4 h-4" />}
                {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && (
                  <Paperclip className="w-4 h-4" />
                )}
                <span className="text-sm truncate max-w-32">{file.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeAttachment(index)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2 mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-700">
            Recording: {formatRecordingTime(recordingTime)}
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={stopRecording}
            className="ml-auto"
          >
            Stop Recording
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-2">
        {/* Attachment button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={disabled}
            className="min-h-[40px] max-h-32 resize-none pr-20"
            rows={1}
          />

          {/* Emoji picker */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                  <div className="space-y-4">
                    {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium mb-2">{category}</h4>
                        <div className="grid grid-cols-8 gap-1">
                          {emojis.map((emoji) => (
                            <Button
                              key={emoji}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-lg"
                              onClick={() => {
                                setMessage(prev => prev + emoji)
                                setShowEmojiPicker(false)
                              }}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Voice recording button */}
        <Button
          size="sm"
          variant="ghost"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          disabled={disabled}
          className={cn(
            "flex-shrink-0",
            isRecording && "bg-red-100 text-red-700"
          )}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  )
}

interface ChatInterfaceProps {
  channelId: string
  className?: string
  showHeader?: boolean
  enableCalls?: boolean
  enableFileSharing?: boolean
  enableVoiceRecording?: boolean
  maxHeight?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  channelId,
  className,
  showHeader = true,
  enableCalls = true,
  enableFileSharing = true,
  enableVoiceRecording = true,
  maxHeight = "600px"
}) => {
  const {
    currentUser,
    channels,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    replyToMessage,
    startTyping,
    stopTyping,
    initiateCall
  } = useCommunicationStore()

  const messages = useChannelMessages(channelId)
  const typingUsers = useTypingUsers(channelId)
  const channel = channels[channelId]

  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Group messages by date and author
  const groupedMessages = useMemo(() => {
    const groups: Array<{ date: string; messages: any[] }> = []
    let currentGroup: { date: string; messages: any[] } | null = null

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt)
      const dateKey = isToday(messageDate)
        ? 'Today'
        : isYesterday(messageDate)
        ? 'Yesterday'
        : format(messageDate, 'MMM dd, yyyy')

      // Create new group if date changed
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = { date: dateKey, messages: [] }
        groups.push(currentGroup)
      }

      // Determine if should show avatar (first message or different author)
      const prevMessage = messages[index - 1]
      const showAvatar = !prevMessage ||
        prevMessage.authorId !== message.authorId ||
        differenceInMinutes(new Date(message.createdAt), new Date(prevMessage.createdAt)) > 5

      currentGroup.messages.push({ ...message, showAvatar })
    })

    return groups
  }, [messages])

  // Filtered messages for search
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groupedMessages

    return groupedMessages.map(group => ({
      ...group,
      messages: group.messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.messages.length > 0)
  }, [groupedMessages, searchQuery])

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!currentUser) return

    try {
      if (replyingTo) {
        await replyToMessage(replyingTo.id, content)
        setReplyingTo(null)
      } else {
        await sendMessage(channelId, content, 'text', attachments)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleTyping = (isTyping: boolean) => {
    if (isTyping) {
      startTyping(channelId)
    } else {
      stopTyping(channelId)
    }
  }

  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setReplyingTo(message)
    }
  }

  const handleEdit = (messageId: string) => {
    setEditingMessage(messageId)
  }

  const handleDelete = async (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId)
    }
  }

  const handleReact = async (messageId: string, emoji: string) => {
    await reactToMessage(messageId, emoji)
  }

  const handleStartCall = (type: 'audio' | 'video') => {
    if (channel) {
      initiateCall(channelId, type)
    }
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Channel not found
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="font-semibold">{channel.name}</h2>
                {channel.description && (
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>

              {/* Call buttons */}
              {enableCalls && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartCall('audio')}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start voice call</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartCall('video')}
                      >
                        <VideoIcon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start video call</TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Participants */}
              <Sheet open={showParticipants} onOpenChange={setShowParticipants}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Users className="w-4 h-4" />
                    <span className="ml-1">{channel.participants.length}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Channel Participants</SheetTitle>
                    <SheetDescription>
                      {channel.participants.length} members in this channel
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    {channel.participants.map(userId => {
                      // This would normally come from user data
                      return (
                        <div key={userId} className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{userId.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">User {userId}</p>
                            <p className="text-sm text-muted-foreground">Online</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea
          ref={messagesContainerRef}
          className="flex-1"
          style={{ maxHeight }}
        >
          <div className="p-4 space-y-4">
            <AnimatePresence>
              {filteredGroups.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {group.date}
                    </div>
                  </div>

                  {/* Messages */}
                  {group.messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      currentUserId={currentUser?.id || ''}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReact={handleReact}
                      showAvatar={message.showAvatar}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>

            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center space-x-2 text-sm text-muted-foreground px-3"
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span>
                  {typingUsers.slice(0, 2).join(', ')}
                  {typingUsers.length > 2 && ` and ${typingUsers.length - 2} more`}
                  {typingUsers.length === 1 ? ' is' : ' are'} typing...
                </span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          disabled={!currentUser}
        />
      </div>
    </TooltipProvider>
  )
}

export default ChatInterface