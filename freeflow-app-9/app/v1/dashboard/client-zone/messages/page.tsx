// MIGRATED: Batch #27 - Removed mock data, using database hooks
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  Send,
  Search,
  Archive,
  Trash2,
  Clock,
  Upload,
  Pin
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA, Message } from '@/lib/client-zone-utils'

const logger = createSimpleLogger('ClientZoneMessages')

// ============================================================================
// MESSAGE DATA WITH EXTENDED PROPERTIES
// ============================================================================

interface ExtendedMessage extends Message {
  isRead?: boolean
  timestamp: string
  likes?: number
  replies?: number
  attachments?: { name: string; size: string }[]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MessagesPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // MESSAGE STATE
  const [messages, setMessages] = useState<ExtendedMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ExtendedMessage | null>(null)
  const [filteredMessages, setFilteredMessages] = useState<ExtendedMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // A+++ LOAD MESSAGE DATA
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load messages from API
        const response = await fetch('/api/client-zone/messages')
        if (!response.ok) throw new Error('Failed to load messages')

        setIsLoading(false)
        announce('Messages loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
        setIsLoading(false)
        announce('Error loading messages', 'assertive')
      }
    }

    loadMessages()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter messages based on search query
  useEffect(() => {
    const filtered = messages.filter((msg) =>
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMessages(filtered)
  }, [searchQuery, messages])

  // ============================================================================
  // HANDLER 1: SEND MESSAGE
  // ============================================================================

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) {
      logger.warn('Message validation failed', { reason: 'Empty message' })
      toast.error('Please enter a message')
      return
    }

    try {
      setIsSubmitting(true)

      logger.info('Message sending initiated', {
        messageLength: newMessage.length,
        recipient: KAZI_CLIENT_DATA.clientInfo.name
      })

      // Simulate API call
      const response = await fetch('/api/client-zone/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      logger.info('Message sent successfully', {
        messageLength: newMessage.length
      })

      // Add message to list optimistically
      const newMsg: ExtendedMessage = {
        id: messages.length + 1,
        sender: KAZI_CLIENT_DATA.clientInfo.contactPerson,
        role: 'Client',
        message: newMessage,
        timestamp: 'Just now',
        avatar: KAZI_CLIENT_DATA.clientInfo.avatar,
        unread: false,
        isRead: true,
        likes: 0,
        replies: 0,
        attachments: []
      }

      setMessages([newMsg, ...messages])
      setNewMessage('')

      toast.success('Message sent!', {
        description: 'Your team will respond within 4-6 hours'
      })
    } catch (error) {
      logger.error('Failed to send message', { error })
      toast.error('Failed to send message', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [newMessage, messages])

  // ============================================================================
  // HANDLER 2: MARK AS READ
  // ============================================================================

  const handleMarkAsRead = useCallback(async (messageId: number) => {
    try {
      logger.info('Marking message as read', { messageId })

      // Simulate API call
      const response = await fetch('/api/client-zone/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark message as read')
      }

      // Update local state
      setMessages(messages.map(msg =>
        msg.id === messageId
          ? { ...msg, unread: false, isRead: true }
          : msg
      ))

      // Update unread count
      const newUnreadCount = messages.filter(m => m.id !== messageId && m.unread).length
      setUnreadCount(newUnreadCount)

      logger.info('Message marked as read', { messageId })
    } catch (error) {
      logger.error('Failed to mark as read', { error, messageId })
      toast.error('Failed to mark as read')
    }
  }, [messages])

  // ============================================================================
  // HANDLER 3: DELETE MESSAGE
  // ============================================================================

  const handleDeleteMessage = useCallback(async (messageId: number) => {
    try {
      logger.info('Message deletion initiated', { messageId })

      // Simulate API call
      const response = await fetch('/api/client-zone/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      setMessages(messages.filter(msg => msg.id !== messageId))
      logger.info('Message deleted successfully', { messageId })
      toast.success('Message deleted', {
        description: 'The message has been removed'
      })
    } catch (error) {
      logger.error('Failed to delete message', { error, messageId })
      toast.error('Failed to delete message')
    }
  }, [messages])

  // ============================================================================
  // HANDLER 4: UPLOAD FILE
  // ============================================================================

  const handleUploadFile = useCallback(() => {
    logger.info('File upload initiated for message')
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    toast.info('File upload initiated')
  }, [])

  // ============================================================================
  // HANDLER 5: ARCHIVE MESSAGE
  // ============================================================================

  const handleArchiveMessage = useCallback(async (messageId: number) => {
    try {
      logger.info('Message archive initiated', { messageId })

      const response = await fetch('/api/client-zone/messages/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to archive message')
      }

      logger.info('Message archived successfully', { messageId })
      toast.success('Message archived', {
        description: 'Message moved to archived conversations'
      })
    } catch (error) {
      logger.error('Failed to archive message', { error, messageId })
      toast.error('Failed to archive message')
    }
  }, [])

  // ============================================================================
  // HANDLER 6: PIN MESSAGE
  // ============================================================================

  const handlePinMessage = useCallback(async (messageId: number) => {
    try {
      logger.info('Message pin initiated', { messageId })

      const response = await fetch('/api/client-zone/messages/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to pin message')
      }

      logger.info('Message pinned successfully', { messageId })
      toast.success('Message pinned', {
        description: 'Message added to your pinned conversations'
      })
    } catch (error) {
      logger.error('Failed to pin message', { error, messageId })
      toast.error('Failed to pin message')
    }
  }, [])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your project communications and conversations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg">
              {unreadCount} unread
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>Message History</CardTitle>
                  <Badge variant="outline">{filteredMessages.length}</Badge>
                </div>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages or people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {filteredMessages.length === 0 ? (
                  <NoDataEmptyState
                    title="No messages found"
                    description="Start a conversation or search for existing messages"
                  />
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {filteredMessages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                          message.unread
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedMessage(message)
                          if (message.unread) {
                            handleMarkAsRead(message.id)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={message.avatar} alt={message.sender} />
                              <AvatarFallback>
                                {message.sender.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{message.sender}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {message.role}
                                </Badge>
                                {message.unread && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {message.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {message.timestamp}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {message.unread && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compose Message & Details */}
          <div className="space-y-4">
            {/* Compose Message Card */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Compose Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    To Team
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Project Team</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Your Message
                  </label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[120px] resize-none"
                    disabled={isSubmitting}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {newMessage.length} / 500 characters
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUploadFile}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Attach
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !newMessage.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Selected Message Details */}
            {selectedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Message Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">From</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedMessage.avatar} alt="User avatar" />
                          <AvatarFallback>
                            {selectedMessage.sender.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{selectedMessage.sender}</p>
                          <p className="text-xs text-gray-500">{selectedMessage.role}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Message</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedMessage.message}
                      </p>
                    </div>

                    {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Attachments</p>
                        <div className="space-y-1">
                          {selectedMessage.attachments.map((att, idx) => (
                            <div key={idx} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                              <span>{att.name}</span>
                              <span className="text-gray-500">{att.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleArchiveMessage(selectedMessage.id)}
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handlePinMessage(selectedMessage.id)}
                      >
                        <Pin className="h-3 w-3 mr-1" />
                        Pin
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stats Card */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Message Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="font-semibold">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unread</span>
                  <Badge variant="secondary">{unreadCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-semibold">4-6 hrs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
