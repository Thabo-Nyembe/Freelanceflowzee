/**
 * Collaboration Demo Page
 * Showcases all collaboration features working together
 *
 * Features demonstrated:
 * - WebSocket real-time collaboration
 * - Video calls with WebRTC
 * - Remote cursors
 * - Chat integration
 * - Screen sharing
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { VideoCall } from '@/components/collaboration/video-call'
import { CollaborationPanel } from '@/components/collaboration/collaboration-panel'
import { RemoteCursors } from '@/components/collaboration/remote-cursors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { TextShimmer } from '@/components/ui/text-shimmer'
import {
  Users,
  Video,
  MessageSquare,
  Pencil,
  Presentation,
  Sparkles,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CollaborationDemo')

// Mock current user
const CURRENT_USER = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@kazi.app',
  avatar: '',
  color: '#3B82F6'
}

const DEMO_ROOM_ID = 'demo-collaboration-room-2025'

export default function CollaborationDemoPage() {
  const [activeMode, setActiveMode] = useState<'document' | 'video' | 'whiteboard'>('document')
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showCollabPanel, setShowCollabPanel] = useState(true)
  const [documentContent, setDocumentContent] = useState(`# Welcome to KAZI Collaboration Demo

This is a live collaborative document. Any changes you make will be synchronized in real-time with other users in the room.

## Features Available:

1. **Real-time Editing** - See others' changes as they type
2. **Live Cursors** - Watch where teammates are working
3. **Video Calls** - Start a face-to-face meeting instantly
4. **Chat** - Quick messages without leaving the document
5. **Screen Sharing** - Share your screen during calls

Try moving your cursor around to see it synchronized across all connected users!
`)

  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // WebSocket for real-time collaboration
  const {
    isConnected,
    isAuthenticated,
    currentRoom,
    remoteCursors,
    sendCursorPosition,
    sendCursorLeave,
    sendStateUpdate,
    messages
  } = useWebSocket({
    user: CURRENT_USER,
    autoConnect: true
  })

  // Track cursor movement in document
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || !isAuthenticated || !currentRoom) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = textarea.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY

      // Only send if cursor is over textarea
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        sendCursorPosition(x, y, DEMO_ROOM_ID)
      }
    }

    const handleMouseLeave = () => {
      sendCursorLeave(DEMO_ROOM_ID)
    }

    textarea.addEventListener('mousemove', handleMouseMove)
    textarea.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      textarea.removeEventListener('mousemove', handleMouseMove)
      textarea.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isAuthenticated, currentRoom, sendCursorPosition, sendCursorLeave])

  // Sync document changes
  const handleDocumentChange = (value: string) => {
    setDocumentContent(value)

    if (isAuthenticated && currentRoom) {
      sendStateUpdate(DEMO_ROOM_ID, {
        type: 'text',
        path: 'document.content',
        value
      })
    }
  }

  // Listen for remote document changes
  useEffect(() => {
    const handleStateUpdate = (event: CustomEvent) => {
      const update = event.detail

      if (update.type === 'text' && update.path === 'document.content') {
        setDocumentContent(update.value)
        logger.debug('Document updated remotely', { userId: update.userId })
      }
    }

    window.addEventListener('collaboration-state-update' as any, handleStateUpdate)

    return () => {
      window.removeEventListener('collaboration-state-update' as any, handleStateUpdate)
    }
  }, [])

  const handleStartVideoCall = () => {
    setShowVideoCall(true)
    logger.info('Video call started from demo')
    toast.success('Starting video call...')
  }

  const handleEndVideoCall = () => {
    setShowVideoCall(false)
    logger.info('Video call ended')
    toast.info('Video call ended')
  }

  // Video call fullscreen mode
  if (showVideoCall) {
    return (
      <VideoCall
        roomId={DEMO_ROOM_ID}
        userId={CURRENT_USER.id}
        userName={CURRENT_USER.name}
        onEnd={handleEndVideoCall}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <TextShimmer className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Collaboration Demo
              </TextShimmer>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                Live
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection status */}
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>

            {/* Active users */}
            {currentRoom && (
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {currentRoom.userCount} {currentRoom.userCount === 1 ? 'user' : 'users'}
              </Badge>
            )}

            {/* Video call button */}
            <Button onClick={handleStartVideoCall} className="bg-green-600 hover:bg-green-700">
              <Video className="w-4 h-4 mr-2" />
              Start Video Call
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Mode selector */}
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="document">
                  <Pencil className="w-4 h-4 mr-2" />
                  Document
                </TabsTrigger>
                <TabsTrigger value="whiteboard">
                  <Presentation className="w-4 h-4 mr-2" />
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger value="video">
                  <Video className="w-4 h-4 mr-2" />
                  Video Call
                </TabsTrigger>
              </TabsList>

              <TabsContent value="document" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pencil className="w-5 h-5" />
                      Real-time Document Editing
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      This document is synchronized in real-time. Changes you make will appear instantly for all connected users.
                      Move your cursor to see it tracked by others!
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative" ref={containerRef}>
                      {/* Remote cursors overlay */}
                      <RemoteCursors
                        cursors={remoteCursors}
                        containerRef={containerRef}
                      />

                      {/* Document editor */}
                      <Textarea
                        ref={textareaRef}
                        value={documentContent}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                        className="min-h-[500px] font-mono text-sm"
                        placeholder="Start typing... your changes will sync in real-time"
                      />

                      {/* Sync indicator */}
                      {isConnected && isAuthenticated && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                            Synced
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{documentContent.length} characters</span>
                      <span>•</span>
                      <span>{documentContent.split('\n').length} lines</span>
                      <span>•</span>
                      <span>{documentContent.split(' ').filter(Boolean).length} words</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whiteboard" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Presentation className="w-5 h-5" />
                      Collaborative Whiteboard
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Draw together in real-time! Perfect for brainstorming, diagramming, and visual collaboration.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Presentation className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Whiteboard feature coming soon!
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          Will integrate with the annotation overlay for real-time drawing
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="video" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Video Conferencing
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Start a face-to-face meeting with screen sharing and recording capabilities.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                        <div className="text-center">
                          <Video className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold mb-2">Ready to connect?</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Click the button above to start a video call with all connected users
                          </p>
                          <Button onClick={handleStartVideoCall} size="lg" className="bg-green-600 hover:bg-green-700">
                            <Video className="w-5 h-5 mr-2" />
                            Launch Video Call
                          </Button>
                        </div>
                      </div>

                      {/* Features list */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            HD Video & Audio
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Crystal clear 720p-1080p video with echo cancellation
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Screen Sharing
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Share your screen or specific windows with audio
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Local Recording
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Record meetings locally in WebM format
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Grid Layout
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Supports 1-8+ participants in responsive grid
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent chat messages preview */}
            {messages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Recent Messages ({messages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {messages.slice(-3).map((message) => (
                      <div key={message.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <span className="font-medium">{message.userName}:</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{message.content}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Collaboration panel (sidebar) */}
        {showCollabPanel && isConnected && (
          <CollaborationPanel
            user={CURRENT_USER}
            roomId={DEMO_ROOM_ID}
            roomName="Collaboration Demo"
            roomType="document"
            onClose={() => setShowCollabPanel(false)}
          />
        )}

        {/* Floating toggle for panel */}
        {!showCollabPanel && (
          <Button
            onClick={() => setShowCollabPanel(true)}
            className="fixed bottom-6 right-6 z-40 shadow-lg"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Show Collaboration
          </Button>
        )}
      </div>
    </div>
  )
}
