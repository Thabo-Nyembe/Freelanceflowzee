'use client'

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

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

export const dynamic = 'force-dynamic';

// ============================================================================
// V2 COMPETITIVE MOCK DATA - CollaborationDemo Context
// ============================================================================

const collaborationDemoAIInsights = [
  { id: '1', type: 'info' as const, title: 'Collaboration Stats', description: '12 active collaborators this session. Real-time sync enabled.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Session Health', description: 'All connections stable. Average latency: 45ms.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Status' },
]

const collaborationDemoCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Host', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Editor', lastActive: '1m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Viewer', lastActive: '5m ago' },
]

const collaborationDemoPredictions = [
  { id: '1', label: 'Session Quality', current: 95, target: 100, predicted: 98, confidence: 92, trend: 'up' as const },
]

const collaborationDemoActivities = [
  { id: '1', user: 'Marcus Johnson', action: 'joined', target: 'video call', timestamp: '2m ago', type: 'info' as const },
  { id: '2', user: 'Sarah Williams', action: 'shared', target: 'screen', timestamp: '5m ago', type: 'success' as const },
]

const collaborationDemoQuickActions = [
  { id: '1', label: 'Start Call', icon: 'Video', shortcut: 'V', action: () => toast.promise(
    fetch('/api/collaboration/video-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to start call')
      return res.json()
    }),
    { loading: 'Initializing video call...', success: 'Video call started successfully', error: 'Failed to start call' }
  ) },
  { id: '2', label: 'Share Screen', icon: 'Monitor', shortcut: 'S', action: () => toast.promise(
    fetch('/api/collaboration/screen-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to share screen')
      return res.json()
    }),
    { loading: 'Preparing screen share...', success: 'Screen sharing enabled', error: 'Failed to share screen' }
  ) },
]

import { useState, useRef, useEffect, useCallback } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { VideoCall } from '@/components/collaboration/video-call'
import { CollaborationPanel } from '@/components/collaboration/collaboration-panel'
import { RemoteCursors } from '@/components/collaboration/remote-cursors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { TextShimmer } from '@/components/ui/text-shimmer'
import {
  Users,
  Video,
  MessageSquare,
  Pencil,
  Presentation,
  Sparkles,
  CheckCircle2,
  Circle,
  Eraser,
  Download,
  Trash2,
  Undo,
  Redo,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

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


export default function CollaborationDemoClient() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

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

  // Whiteboard state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawTool, setDrawTool] = useState<'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'text'>('pen')
  const [drawColor, setDrawColor] = useState('#3B82F6')
  const [brushSize, setBrushSize] = useState(3)
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const lastPosRef = useRef({ x: 0, y: 0 })

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

  // Whiteboard canvas initialization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Initialize with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setDrawHistory([initialState])
    setHistoryIndex(0)
  }, [activeMode])

  // Whiteboard drawing handlers
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }, [])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = drawHistory.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setDrawHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [drawHistory, historyIndex])

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e)
    lastPosRef.current = coords
    setIsDrawing(true)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    if (drawTool === 'pen' || drawTool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
    }
  }, [getCanvasCoords, drawTool])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const coords = getCanvasCoords(e)

    if (drawTool === 'pen') {
      ctx.strokeStyle = drawColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
    } else if (drawTool === 'eraser') {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = brushSize * 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
    }

    lastPosRef.current = coords
  }, [isDrawing, drawTool, drawColor, brushSize, getCanvasCoords])

  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
    }
  }, [isDrawing, saveToHistory])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      const newIndex = historyIndex - 1
      ctx.putImageData(drawHistory[newIndex], 0, 0)
      setHistoryIndex(newIndex)
      toast.info('Undo')
    }
  }, [historyIndex, drawHistory])

  const handleRedo = useCallback(() => {
    if (historyIndex < drawHistory.length - 1) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      const newIndex = historyIndex + 1
      ctx.putImageData(drawHistory[newIndex], 0, 0)
      setHistoryIndex(newIndex)
      toast.info('Redo')
    }
  }, [historyIndex, drawHistory])

  const handleClearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
    toast.success('Canvas cleared')
  }, [saveToHistory])

  const handleDownloadCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `whiteboard-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('Whiteboard downloaded')
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
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex-wrap">
                      {/* Drawing Tools */}
                      <div className="flex items-center gap-1 border-r pr-3 mr-2">
                        <Button
                          size="sm"
                          variant={drawTool === 'pen' ? 'default' : 'outline'}
                          onClick={() => setDrawTool('pen')}
                          title="Pen Tool"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={drawTool === 'eraser' ? 'default' : 'outline'}
                          onClick={() => setDrawTool('eraser')}
                          title="Eraser"
                        >
                          <Eraser className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Color Picker */}
                      <div className="flex items-center gap-2 border-r pr-3 mr-2">
                        <Palette className="w-4 h-4 text-gray-500" />
                        {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#000000'].map(color => (
                          <button
                            key={color}
                            onClick={() => setDrawColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                              drawColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>

                      {/* Brush Size */}
                      <div className="flex items-center gap-2 border-r pr-3 mr-2">
                        <span className="text-xs text-gray-500">Size:</span>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-xs w-6">{brushSize}px</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUndo}
                          disabled={historyIndex <= 0}
                          title="Undo"
                        >
                          <Undo className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRedo}
                          disabled={historyIndex >= drawHistory.length - 1}
                          title="Redo"
                        >
                          <Redo className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearCanvas}
                          title="Clear Canvas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDownloadCanvas}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Sync status */}
                      {isConnected && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                          Live Sync
                        </Badge>
                      )}
                    </div>

                    {/* Canvas */}
                    <div className="relative bg-white rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="w-full cursor-crosshair"
                        style={{ height: '500px' }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                      />

                      {/* Tool indicator */}
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                        {drawTool === 'pen' && <Pencil className="w-3 h-3" />}
                        {drawTool === 'eraser' && <Eraser className="w-3 h-3" />}
                        <span className="capitalize">{drawTool}</span>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: drawTool === 'eraser' ? '#fff' : drawColor }} />
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                      <strong>Tips:</strong> Click and drag to draw. Use the toolbar to switch between pen and eraser, change colors, or adjust brush size. Your drawings sync in real-time with other collaborators!
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
                        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={collaborationDemoAIInsights} />
          <PredictiveAnalytics predictions={collaborationDemoPredictions} />
          <CollaborationIndicator collaborators={collaborationDemoCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={collaborationDemoQuickActions} />
          <ActivityFeed activities={collaborationDemoActivities} />
        </div>
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
