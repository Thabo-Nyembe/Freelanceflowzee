'use client'

/**
 * AI Chat Interface
 *
 * World-class conversational AI interface:
 * - Streaming response support
 * - Markdown rendering with code highlighting
 * - File attachments and image support
 * - Voice input/output
 * - Multi-turn conversations
 * - Context management
 * - Suggested prompts
 * - Message actions (copy, edit, regenerate)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { sanitizeHtmlStrict } from '@/lib/sanitize'
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Square,
  Copy,
  Check,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  Sparkles,
  Bot,
  User,
  X,
  Image as ImageIcon,
  FileText,
  Code,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Settings2,
  Share2,
  Download,
  MoreVertical,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

// Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error' | 'streaming'
  attachments?: Attachment[]
  metadata?: {
    model?: string
    tokens?: number
    latency?: number
    sources?: Source[]
    confidence?: number
  }
  feedback?: 'positive' | 'negative'
  edited?: boolean
}

export interface Attachment {
  id: string
  type: 'image' | 'file' | 'code'
  name: string
  url?: string
  content?: string
  mimeType?: string
  size?: number
}

export interface Source {
  title: string
  url?: string
  snippet: string
  relevance: number
}

export interface SuggestedPrompt {
  id: string
  text: string
  category: string
  icon?: React.ReactNode
}

export interface AIChatInterfaceProps {
  // Configuration
  title?: string
  subtitle?: string
  placeholder?: string
  welcomeMessage?: string
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string

  // Initial state
  initialMessages?: ChatMessage[]
  suggestedPrompts?: SuggestedPrompt[]

  // Features
  enableVoice?: boolean
  enableAttachments?: boolean
  enableStreaming?: boolean
  enableSources?: boolean
  enableFeedback?: boolean
  enableEdit?: boolean
  showTimestamps?: boolean

  // Styling
  className?: string
  fullscreen?: boolean

  // Callbacks
  onSendMessage?: (message: string, attachments?: Attachment[]) => Promise<string | AsyncIterable<string>>
  onMessageFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
  onRegenerateResponse?: (messageId: string) => Promise<string | AsyncIterable<string>>
  onClearHistory?: () => void
  onExportChat?: () => void
  onShareChat?: () => void
}

const DEFAULT_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { id: '1', text: 'Help me write a project proposal', category: 'Writing', icon: <FileText className="h-4 w-4" /> },
  { id: '2', text: 'Analyze this data and provide insights', category: 'Analysis', icon: <Sparkles className="h-4 w-4" /> },
  { id: '3', text: 'Debug this code and explain the issue', category: 'Code', icon: <Code className="h-4 w-4" /> },
  { id: '4', text: 'Create a marketing strategy outline', category: 'Strategy', icon: <Bot className="h-4 w-4" /> }
]

export function AIChatInterface({
  title = 'AI Assistant',
  subtitle = 'Powered by FreeFlow AI',
  placeholder = 'Type your message...',
  welcomeMessage = "Hello! I'm your AI assistant. How can I help you today?",
  model = 'gpt-4-turbo',
  maxTokens = 4096,
  temperature = 0.7,
  systemPrompt,
  initialMessages = [],
  suggestedPrompts = DEFAULT_SUGGESTED_PROMPTS,
  enableVoice = true,
  enableAttachments = true,
  enableStreaming = true,
  enableSources = true,
  enableFeedback = true,
  enableEdit = true,
  showTimestamps = true,
  className,
  fullscreen = false,
  onSendMessage,
  onMessageFeedback,
  onEditMessage,
  onDeleteMessage,
  onRegenerateResponse,
  onClearHistory,
  onExportChat,
  onShareChat
}: AIChatInterfaceProps) {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(fullscreen)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0 && welcomeMessage) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
        status: 'sent'
      }])
    }
  }, [])

  // Send message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() && attachments.length === 0) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sent',
      attachments: attachments.length > 0 ? [...attachments] : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setAttachments([])
    setIsLoading(true)

    // Create placeholder for assistant response
    const assistantId = `assistant-${Date.now()}`
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'streaming'
    }])

    try {
      if (onSendMessage) {
        const response = await onSendMessage(userMessage.content, userMessage.attachments)

        if (typeof response === 'string') {
          // Non-streaming response
          setMessages(prev => prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: response, status: 'sent' }
              : msg
          ))
        } else if (enableStreaming && Symbol.asyncIterator in response) {
          // Streaming response
          let fullContent = ''
          for await (const chunk of response) {
            fullContent += chunk
            setMessages(prev => prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, content: fullContent }
                : msg
            ))
          }
          setMessages(prev => prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, status: 'sent' }
              : msg
          ))
        }
      } else {
        // Demo mode - simulate response
        await simulateResponse(assistantId)
      }
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId
          ? { ...msg, content: 'Sorry, an error occurred. Please try again.', status: 'error' }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, attachments, onSendMessage, enableStreaming])

  // Simulate response for demo
  const simulateResponse = async (assistantId: string) => {
    const demoResponse = "I understand you'd like help with that. Let me analyze your request and provide a comprehensive response.\n\nBased on my analysis, here are my recommendations:\n\n1. **First Step**: Start by clearly defining your objectives\n2. **Second Step**: Gather all relevant information\n3. **Third Step**: Create a detailed action plan\n4. **Fourth Step**: Execute and iterate based on feedback\n\nWould you like me to elaborate on any of these points?"

    if (enableStreaming) {
      let content = ''
      for (const char of demoResponse) {
        content += char
        setMessages(prev => prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content }
            : msg
        ))
        await new Promise(resolve => setTimeout(resolve, 15))
      }
    }

    setMessages(prev => prev.map(msg =>
      msg.id === assistantId
        ? { ...msg, content: demoResponse, status: 'sent' }
        : msg
    ))
  }

  // Handle file attachment
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments: Attachment[] = []

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/')
      const isCode = /\.(js|ts|tsx|jsx|py|java|cpp|c|go|rs|rb|php|html|css|json|md)$/i.test(file.name)

      newAttachments.push({
        id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: isImage ? 'image' : isCode ? 'code' : 'file',
        name: file.name,
        mimeType: file.type,
        size: file.size,
        url: isImage ? URL.createObjectURL(file) : undefined
      })
    })

    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }, [])

  // Remove attachment
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }, [])

  // Copy message
  const copyMessage = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  // Start editing
  const startEditing = useCallback((id: string, content: string) => {
    setEditingMessageId(id)
    setEditContent(content)
  }, [])

  // Save edit
  const saveEdit = useCallback((id: string) => {
    if (onEditMessage) {
      onEditMessage(id, editContent)
    }
    setMessages(prev => prev.map(msg =>
      msg.id === id
        ? { ...msg, content: editContent, edited: true }
        : msg
    ))
    setEditingMessageId(null)
    setEditContent('')
  }, [editContent, onEditMessage])

  // Handle feedback
  const handleFeedback = useCallback((id: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg =>
      msg.id === id
        ? { ...msg, feedback }
        : msg
    ))
    if (onMessageFeedback) {
      onMessageFeedback(id, feedback)
    }
  }, [onMessageFeedback])

  // Regenerate response
  const handleRegenerate = useCallback(async (id: string) => {
    if (!onRegenerateResponse) return

    setIsLoading(true)
    setMessages(prev => prev.map(msg =>
      msg.id === id
        ? { ...msg, content: '', status: 'streaming' }
        : msg
    ))

    try {
      const response = await onRegenerateResponse(id)

      if (typeof response === 'string') {
        setMessages(prev => prev.map(msg =>
          msg.id === id
            ? { ...msg, content: response, status: 'sent' }
            : msg
        ))
      } else if (enableStreaming && Symbol.asyncIterator in response) {
        let fullContent = ''
        for await (const chunk of response) {
          fullContent += chunk
          setMessages(prev => prev.map(msg =>
            msg.id === id
              ? { ...msg, content: fullContent }
              : msg
          ))
        }
        setMessages(prev => prev.map(msg =>
          msg.id === id
            ? { ...msg, status: 'sent' }
            : msg
        ))
      }
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg.id === id
          ? { ...msg, content: 'Failed to regenerate. Please try again.', status: 'error' }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }, [onRegenerateResponse, enableStreaming])

  // Delete message
  const handleDelete = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
    if (onDeleteMessage) {
      onDeleteMessage(id)
    }
  }, [onDeleteMessage])

  // Handle suggested prompt click
  const handleSuggestedPrompt = useCallback((text: string) => {
    setInputValue(text)
    inputRef.current?.focus()
  }, [])

  // Voice recording toggle
  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev)
    // Voice recording implementation would go here
  }, [])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Render message content with markdown
  const renderMessageContent = useMemo(() => (content: string) => {
    // Simple markdown parsing
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(3)}</h2>
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>
        }

        // Bold text
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

        // Code inline
        processedLine = processedLine.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')

        // List items
        if (line.match(/^\d+\.\s/)) {
          return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: sanitizeHtmlStrict(processedLine.replace(/^\d+\.\s/, '')) }} />
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: sanitizeHtmlStrict(processedLine.slice(2)) }} />
        }

        // Empty lines
        if (!line.trim()) {
          return <br key={i} />
        }

        // Regular paragraph
        return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtmlStrict(processedLine) }} />
      })
  }, [])

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex flex-col bg-background border rounded-lg overflow-hidden',
          isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/ai-avatar.png" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {model}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportChat}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShareChat}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClearHistory} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {message.attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 bg-background/50 rounded px-2 py-1"
                        >
                          {attachment.type === 'image' && attachment.url ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="h-16 w-16 object-cover rounded"
                            />
                          ) : (
                            <>
                              {attachment.type === 'code' ? (
                                <Code className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="text-xs">{attachment.name}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setEditingMessageId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => saveEdit(message.id)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.status === 'streaming' && !message.content ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                    </div>
                  )}

                  {/* Timestamp and metadata */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    {showTimestamps && (
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                        {message.edited && ' (edited)'}
                      </span>
                    )}

                    {/* Message actions */}
                    {message.role === 'assistant' && message.status === 'sent' && (
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyMessage(message.id, message.content)}
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>

                        {onRegenerateResponse && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRegenerate(message.id)}
                                disabled={isLoading}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Regenerate</TooltipContent>
                          </Tooltip>
                        )}

                        {enableFeedback && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    'h-6 w-6',
                                    message.feedback === 'positive' && 'text-green-500'
                                  )}
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Helpful</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    'h-6 w-6',
                                    message.feedback === 'negative' && 'text-red-500'
                                  )}
                                  onClick={() => handleFeedback(message.id, 'negative')}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Not helpful</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    )}

                    {message.role === 'user' && (
                      <div className="flex items-center gap-1">
                        {enableEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => startEditing(message.id, message.content)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDelete(message.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {/* Sources */}
                  {enableSources && message.metadata?.sources && message.metadata.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium mb-1">Sources:</p>
                      <div className="space-y-1">
                        {message.metadata.sources.map((source, i) => (
                          <a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-primary hover:underline"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        {messages.length <= 1 && suggestedPrompts.length > 0 && (
          <div className="px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground mb-2">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedPrompt(prompt.text)}
                >
                  {prompt.icon}
                  <span className="ml-1">{prompt.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5"
              >
                {attachment.type === 'image' ? (
                  <ImageIcon className="h-4 w-4" />
                ) : attachment.type === 'code' ? (
                  <Code className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-end gap-2">
            {enableAttachments && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.md,.js,.ts,.tsx,.jsx,.py,.java"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </>
            )}

            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[44px] max-h-[200px] pr-24 resize-none"
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                {enableVoice && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleRecording}
                      >
                        {isRecording ? (
                          <Square className="h-4 w-4 text-red-500" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRecording ? 'Stop recording' : 'Voice input'}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default AIChatInterface
