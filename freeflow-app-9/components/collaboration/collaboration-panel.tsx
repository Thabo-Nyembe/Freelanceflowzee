/**
 * Collaboration Panel Component
 * Complete real-time collaboration interface
 *
 * Features:
 * - Active users list
 * - Live chat
 * - Presence indicators
 * - Typing indicators
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '@/hooks/use-websocket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  MessageSquare,
  Send,
  Wifi,
  WifiOff,
  Circle,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createFeatureLogger } from '@/lib/logger'
import type { User } from '@/lib/websocket/socket-server'

const logger = createFeatureLogger('CollaborationPanel')

export interface CollaborationPanelProps {
  user: User
  roomId: string
  roomName?: string
  roomType?: 'project' | 'document' | 'canvas' | 'video'
  onClose?: () => void
  className?: string
}

export function CollaborationPanel({
  user,
  roomId,
  roomName,
  roomType = 'document',
  onClose,
  className
}: CollaborationPanelProps) {
  const {
    isConnected,
    isAuthenticated,
    currentRoom,
    joinRoom,
    leaveRoom,
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  } = useWebSocket({ user, autoConnect: true })

  const [messageInput, setMessageInput] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'chat'>('users')
  const [isMinimized, setIsMinimized] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-join room when connected and authenticated
  useEffect(() => {
    if (isConnected && isAuthenticated && roomId) {
      joinRoom(roomId, roomName, roomType)
      logger.info('Auto-joining room', { roomId, roomName })
    }

    return () => {
      if (roomId) {
        leaveRoom(roomId)
      }
    }
  }, [isConnected, isAuthenticated, roomId, roomName, roomType, joinRoom, leaveRoom])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ============================================================================
  // CHAT HANDLERS
  // ============================================================================

  const handleSendMessage = () => {
    if (!messageInput.trim() || !roomId) return

    sendMessage(roomId, messageInput.trim())
    setMessageInput('')
    stopTyping(roomId)
  }

  const handleInputChange = (value: string) => {
    setMessageInput(value)

    if (value.trim()) {
      startTyping(roomId)
    } else {
      stopTyping(roomId)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          className
        )}
      >
        <Button
          size="lg"
          onClick={() => setIsMinimized(false)}
          className="shadow-lg relative"
        >
          <Users className="w-5 h-5 mr-2" />
          Collaboration
          {currentRoom && currentRoom.userCount > 1 && (
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
              {currentRoom.userCount}
            </Badge>
          )}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className={cn(
        'fixed right-0 top-0 h-screen w-80 bg-white dark:bg-gray-900 border-l shadow-2xl z-50 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-white" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-300" />
            )}
            <span className="text-sm font-medium text-white">
              {currentRoom?.name || 'Collaboration'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-950'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Users ({currentRoom?.userCount || 0})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'chat'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-950'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Chat
          {messages.length > 0 && activeTab !== 'chat' && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
              {messages.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full p-4"
            >
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {currentRoom?.users.map((roomUser) => (
                    <motion.div
                      key={roomUser.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={roomUser.avatar} />
                          <AvatarFallback className="text-xs" style={{ backgroundColor: roomUser.color }}>
                            {getUserInitials(roomUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Circle
                          className="absolute -bottom-1 -right-1 w-3 h-3 text-green-500 fill-green-500 bg-white dark:bg-gray-900 rounded-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {roomUser.name}
                          </p>
                          {roomUser.id === user.id && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {roomUser.email}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {(!currentRoom || currentRoom.users.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No users in this room</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwnMessage = message.userId === user.id

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex gap-2',
                          isOwnMessage && 'flex-row-reverse'
                        )}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {getUserInitials(message.userName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className={cn(
                          'flex-1 min-w-0',
                          isOwnMessage && 'text-right'
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            {!isOwnMessage && (
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {message.userName}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>

                          <div className={cn(
                            'inline-block px-3 py-2 rounded-lg text-sm',
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          )}>
                            {message.content}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}

                  {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Typing indicator */}
              <AnimatePresence>
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-2 text-xs text-gray-500"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <Circle className="w-2 h-2 fill-gray-400 animate-bounce" />
                        <Circle className="w-2 h-2 fill-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <Circle className="w-2 h-2 fill-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span>
                        {typingUsers.length === 1
                          ? 'Someone is typing...'
                          : `${typingUsers.length} people are typing...`}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!isConnected || !isAuthenticated}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isConnected || !isAuthenticated}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection status */}
      {!isConnected && (
        <div className="p-2 bg-red-500 text-white text-center text-xs">
          Disconnected - Attempting to reconnect...
        </div>
      )}
    </motion.div>
  )
}
