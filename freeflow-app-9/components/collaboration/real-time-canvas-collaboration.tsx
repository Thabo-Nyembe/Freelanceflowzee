'use client'

import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  MousePointer, 
  Square, 
  Circle, 
  Type, 
  Move, 
  RotateCcw, 
  Copy, 
  Trash2, 
  Layers, 
  Eye, 
  EyeOff, 
  Users, 
  Palette, 
  Grid, 
  Undo, 
  Redo,
  Download,
  Share2,
  GitBranch,
  Clock,
  Sparkles
} from 'lucide-react'

// Types for real-time collaboration
interface CanvasObject {
  id: string
  type: 'rectangle' | 'circle' | 'text' | 'line' | 'component'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  stroke: string
  strokeWidth: number
  text?: string
  fontSize?: number
  fontFamily?: string
  opacity: number
  locked: boolean
  visible: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

interface UserCursor {
  userId: string
  userName: string
  userColor: string
  x: number
  y: number
  isActive: boolean
  tool: string
  timestamp: number
}

interface CanvasVersion {
  id: string
  name: string
  timestamp: string
  objects: CanvasObject[]
  createdBy: string
  description: string
}

interface ComponentLibraryItem {
  id: string
  name: string
  category: string
  thumbnail: string
  objects: CanvasObject[]
  description: string
  tags: string[]
}

interface CanvasState {
  objects: CanvasObject[]
  selectedObjects: string[]
  activeTool: string
  zoom: number
  panX: number
  panY: number
  cursors: UserCursor[]
  isCollaborating: boolean
  versions: CanvasVersion[]
  currentVersion: string
  componentLibrary: ComponentLibraryItem[]
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  undoStack: CanvasObject[][]
  redoStack: CanvasObject[][]
  isRecording: boolean
  collaborators: number
}

type CanvasAction = 
  | { type: 'ADD_OBJECT'; object: CanvasObject }
  | { type: 'UPDATE_OBJECT'; id: string; updates: Partial<CanvasObject> }
  | { type: 'DELETE_OBJECTS'; ids: string[] }
  | { type: 'SELECT_OBJECTS'; ids: string[] }
  | { type: 'SET_TOOL'; tool: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'UPDATE_CURSOR'; cursor: UserCursor }
  | { type: 'SAVE_VERSION'; version: CanvasVersion }
  | { type: 'LOAD_VERSION'; versionId: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_GRID' }

const initialState: CanvasState = {
  objects: [],
  selectedObjects: [],
  activeTool: 'select',
  zoom: 100,
  panX: 0,
  panY: 0,
  cursors: [],
  isCollaborating: true,
  versions: [],
  currentVersion: 'main',
  componentLibrary: [
    {
      id: 'btn-primary',
      name: 'Primary Button',
      category: 'Buttons',
      thumbnail: '/components/button-primary.svg',
      objects: [{
        id: 'btn-1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 120,
        height: 40,
        rotation: 0,
        fill: '#6366f1',
        stroke: '#4f46e5',
        strokeWidth: 2,
        opacity: 1,
        locked: false,
        visible: true,
        userId: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      description: 'Standard primary button component',
      tags: ['button', 'primary', 'cta']
    }
  ],
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  undoStack: [],
  redoStack: [],
  isRecording: false,
  collaborators: 3
}

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'ADD_OBJECT':
      return {
        ...state,
        objects: [...state.objects, action.object],
        undoStack: [...state.undoStack, state.objects]
      }
    
    case 'UPDATE_OBJECT':
      return {
        ...state,
        objects: state.objects.map(obj => 
          obj.id === action.id ? { ...obj, ...action.updates, updatedAt: new Date().toISOString() } : obj
        )
      }
    
    case 'DELETE_OBJECTS':
      return {
        ...state,
        objects: state.objects.filter(obj => !action.ids.includes(obj.id)),
        selectedObjects: state.selectedObjects.filter(id => !action.ids.includes(id)),
        undoStack: [...state.undoStack, state.objects]
      }
    
    case 'SELECT_OBJECTS':
      return {
        ...state,
        selectedObjects: action.ids
      }
    
    case 'SET_TOOL':
      return {
        ...state,
        activeTool: action.tool,
        selectedObjects: action.tool === 'select' ? state.selectedObjects : []
      }
    
    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(10, Math.min(500, action.zoom))
      }
    
    case 'UPDATE_CURSOR':
      return {
        ...state,
        cursors: state.cursors.map(cursor => 
          cursor.userId === action.cursor.userId ? action.cursor : cursor
        ).concat(
          state.cursors.find(c => c.userId === action.cursor.userId) ? [] : [action.cursor]
        )
      }
    
    case 'UNDO':
      if (state.undoStack.length === 0) return state
      const previousState = state.undoStack[state.undoStack.length - 1]
      return {
        ...state,
        objects: previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.objects]
      }
    
    case 'REDO':
      if (state.redoStack.length === 0) return state
      const nextState = state.redoStack[state.redoStack.length - 1]
      return {
        ...state,
        objects: nextState,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.objects]
      }
    
    case 'TOGGLE_GRID':
      return {
        ...state,
        showGrid: !state.showGrid
      }
    
    default:
      return state
  }
}

interface RealTimeCanvasCollaborationProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    avatar: string
    color: string
  }
  onSave?: (objects: CanvasObject[]) => void
  onShare?: (shareData: any) => void
  className?: string
}

export function RealTimeCanvasCollaboration({
  projectId,
  currentUser,
  onSave,
  onShare,
  className = ''
}: RealTimeCanvasCollaborationProps) {
  const [state, dispatch] = useReducer(canvasReducer, initialState)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Sample collaborators for demo
  const collaborators = [
    { id: 'user-1', name: 'Sarah Chen', avatar: '/avatars/sarah-chen.jpg', color: '#ef4444', isActive: true },
    { id: 'user-2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', color: '#10b981', isActive: true },
    { id: 'user-3', name: 'Emma Wilson', avatar: '/avatars/emily.jpg', color: '#f59e0b', isActive: false }
  ]

  // Real-time cursor simulation
  useEffect(() => {
    const interval = setInterval(() => {
      collaborators.forEach(collab => {
        if (collab.isActive && collab.id !== currentUser.id) {
          dispatch({
            type: 'UPDATE_CURSOR',
            cursor: {
              userId: collab.id,
              userName: collab.name,
              userColor: collab.color,
              x: Math.random() * 800,
              y: Math.random() * 600,
              isActive: true,
              tool: state.activeTool,
              timestamp: Date.now()
            }
          })
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [state.activeTool])

  // Canvas drawing functions
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid if enabled
    if (state.showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += state.gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += state.gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw objects
    state.objects.forEach(obj => {
      if (!obj.visible) return

      ctx.save()
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2)
      ctx.rotate((obj.rotation * Math.PI) / 180)
      ctx.globalAlpha = obj.opacity

      switch (obj.type) {
        case 'rectangle':
          ctx.fillStyle = obj.fill
          ctx.strokeStyle = obj.stroke
          ctx.lineWidth = obj.strokeWidth
          ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height)
          if (obj.strokeWidth > 0) {
            ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height)
          }
          break

        case 'circle':
          ctx.fillStyle = obj.fill
          ctx.strokeStyle = obj.stroke
          ctx.lineWidth = obj.strokeWidth
          ctx.beginPath()
          ctx.arc(0, 0, Math.min(obj.width, obj.height) / 2, 0, 2 * Math.PI)
          ctx.fill()
          if (obj.strokeWidth > 0) {
            ctx.stroke()
          }
          break

        case 'text':
          ctx.fillStyle = obj.fill
          ctx.font = `${obj.fontSize || 16}px ${obj.fontFamily || 'Arial'}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(obj.text || 'Text', 0, 0)
          break
      }

      // Draw selection indicator
      if (state.selectedObjects.includes(obj.id)) {
        ctx.strokeStyle = '#6366f1'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(-obj.width / 2 - 5, -obj.height / 2 - 5, obj.width + 10, obj.height + 10)
        ctx.setLineDash([])
      }

      ctx.restore()
    })

    // Draw collaborator cursors
    state.cursors.forEach(cursor => {
      if (cursor.isActive && cursor.userId !== currentUser.id) {
        ctx.save()
        ctx.translate(cursor.x, cursor.y)
        
        // Draw cursor
        ctx.fillStyle = cursor.userColor
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, 16)
        ctx.lineTo(4, 12)
        ctx.lineTo(8, 16)
        ctx.lineTo(12, 12)
        ctx.lineTo(8, 8)
        ctx.closePath()
        ctx.fill()

        // Draw user name
        ctx.fillStyle = 'white'
        ctx.fillRect(16, -8, cursor.userName.length * 8, 16)
        ctx.fillStyle = cursor.userColor
        ctx.font = '12px Arial'
        ctx.fillText(cursor.userName, 18, 2)
        
        ctx.restore()
      }
    })
  }, [state, currentUser.id])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setLastMousePos({ x, y })
    setIsDrawing(true)

    if (state.activeTool === 'rectangle') {
      const newObject: CanvasObject = {
        id: `obj-${Date.now()}`,
        type: 'rectangle',
        x,
        y,
        width: 0,
        height: 0,
        rotation: 0,
        fill: '#6366f1',
        stroke: '#4f46e5',
        strokeWidth: 2,
        opacity: 1,
        locked: false,
        visible: true,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      dispatch({ type: 'ADD_OBJECT', object: newObject })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update current user cursor
    dispatch({
      type: 'UPDATE_CURSOR',
      cursor: {
        userId: currentUser.id,
        userName: currentUser.name,
        userColor: currentUser.color,
        x,
        y,
        isActive: true,
        tool: state.activeTool,
        timestamp: Date.now()
      }
    })

    if (isDrawing && state.activeTool === 'rectangle' && state.objects.length > 0) {
      const lastObject = state.objects[state.objects.length - 1]
      const width = x - lastMousePos.x
      const height = y - lastMousePos.y
      
      dispatch({
        type: 'UPDATE_OBJECT',
        id: lastObject.id,
        updates: { width, height }
      })
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'move', icon: Move, label: 'Move' }
  ]

  const addComponentFromLibrary = (component: ComponentLibraryItem) => {
    component.objects.forEach(obj => {
      const newObject: CanvasObject = {
        ...obj,
        id: `obj-${Date.now()}-${obj.id}`,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      dispatch({ type: 'ADD_OBJECT', object: newObject })
    })
  }

  const saveVersion = () => {
    const version: CanvasVersion = {
      id: `v-${Date.now()}`,
      name: `Version ${state.versions.length + 1}`,
      timestamp: new Date().toISOString(),
      objects: [...state.objects],
      createdBy: currentUser.id,
      description: 'Auto-save checkpoint'
    }
    dispatch({ type: 'SAVE_VERSION', version })
  }

  const exportCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `canvas-${projectId}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Real-Time Canvas Collaboration
          </h2>
          <p className="text-gray-600">Figma-level design collaboration with live cursors</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Collaborators */}
          <div className="flex items-center gap-1">
            {collaborators.map(collab => (
              <div
                key={collab.id}
                className={`w-8 h-8 rounded-full border-2 ${collab.isActive ? 'border-green-400' : 'border-gray-300'}`}
                style={{ borderColor: collab.isActive ? collab.color : undefined }}
              >
                <img
                  src={collab.avatar}
                  alt={collab.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ))}
            <Badge variant="outline" className="ml-2">
              <Users className="h-3 w-3 mr-1" />
              {state.collaborators} online
            </Badge>
          </div>

          <Button onClick={saveVersion} size="sm" variant="outline">
            <GitBranch className="h-4 w-4 mr-2" />
            Save Version
          </Button>

          <Button onClick={exportCanvas} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => onShare?.({ projectId, objects: state.objects })} size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Toolbar */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tools.map(tool => (
                <Button
                  key={tool.id}
                  variant={state.activeTool === tool.id ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => dispatch({ type: 'SET_TOOL', tool: tool.id })}
                >
                  <tool.icon className="h-4 w-4 mr-2" />
                  {tool.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Component Library */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.componentLibrary.map(component => (
                <div
                  key={component.id}
                  className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => addComponentFromLibrary(component)}
                >
                  <div className="text-xs font-medium">{component.name}</div>
                  <div className="text-xs text-gray-500">{component.category}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Layers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Layers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {state.objects.map(obj => (
                <div
                  key={obj.id}
                  className={`flex items-center justify-between p-1 rounded text-xs ${
                    state.selectedObjects.includes(obj.id) ? 'bg-purple-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => dispatch({ type: 'SELECT_OBJECTS', ids: [obj.id] })}
                >
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {obj.type} {obj.id.slice(-4)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch({
                        type: 'UPDATE_OBJECT',
                        id: obj.id,
                        updates: { visible: !obj.visible }
                      })
                    }}
                  >
                    {obj.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Canvas</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch({ type: 'UNDO' })}
                    disabled={state.undoStack.length === 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch({ type: 'REDO' })}
                    disabled={state.redoStack.length === 0}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Zoom:</span>
                    <Slider
                      value={[state.zoom]}
                      onValueChange={([zoom]) => dispatch({ type: 'SET_ZOOM', zoom })}
                      min={10}
                      max={500}
                      step={10}
                      className="w-20"
                    />
                    <span className="text-xs w-12">{state.zoom}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-200 rounded-lg bg-white cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ transform: `scale(${state.zoom / 100})`, transformOrigin: 'top left' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.selectedObjects.length > 0 ? (
                <>
                  <div>
                    <label className="text-xs font-medium">Fill Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={state.objects.find(obj => obj.id === state.selectedObjects[0])?.fill || '#6366f1'}
                        onChange={(e) => {
                          state.selectedObjects.forEach(id => {
                            dispatch({
                              type: 'UPDATE_OBJECT',
                              id,
                              updates: { fill: e.target.value }
                            })
                          })
                        }}
                        className="w-8 h-8 rounded border"
                      />
                      <Palette className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Opacity</label>
                    <Slider
                      value={[state.objects.find(obj => obj.id === state.selectedObjects[0])?.opacity || 1]}
                      onValueChange={([opacity]) => {
                        state.selectedObjects.forEach(id => {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            id,
                            updates: { opacity: opacity / 100 }
                          })
                        })
                      }}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // Copy selected objects
                        const selectedObjs = state.objects.filter(obj => state.selectedObjects.includes(obj.id))
                        selectedObjs.forEach(obj => {
                          const newObj = {
                            ...obj,
                            id: `obj-${Date.now()}-${obj.id}`,
                            x: obj.x + 20,
                            y: obj.y + 20,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                          }
                          dispatch({ type: 'ADD_OBJECT', object: newObj })
                        })
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => dispatch({ type: 'DELETE_OBJECTS', ids: state.selectedObjects })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500">Select an object to edit properties</p>
              )}
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Version History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.versions.length > 0 ? (
                state.versions.slice(-5).map(version => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-2 border rounded text-xs hover:bg-gray-50 cursor-pointer"
                    onClick={() => dispatch({ type: 'LOAD_VERSION', versionId: version.id })}
                  >
                    <div>
                      <div className="font-medium">{version.name}</div>
                      <div className="text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(version.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No versions saved yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 