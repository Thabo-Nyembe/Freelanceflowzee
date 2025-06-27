'use client

import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react
 id: string; updates: Partial<CanvasObject> }
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
  onShare?: (shareData: unknown) => void
  className?: string
}

export function RealTimeCanvasCollaboration({
  projectId,
  currentUser,
  onSave,
  onShare,
  className = 
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
      ctx.strokeStyle = '#e5e7eb
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
          ctx.font = `${obj.fontSize || 16}px ${obj.fontFamily || 'Arial'}
          ctx.textAlign = 'center
          ctx.textBaseline = 'middle
          ctx.fillText(obj.text || 'Text', 0, 0)
          break
      }

      // Draw selection indicator
      if (state.selectedObjects.includes(obj.id)) {
        ctx.strokeStyle = '#6366f1
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
        ctx.fillStyle = 'white
        ctx.fillRect(16, -8, cursor.userName.length * 8, 16)
        ctx.fillStyle = cursor.userColor
        ctx.font = '12px Arial
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
      description: 'Auto-save checkpoint
    }
    dispatch({ type: 'SAVE_VERSION', version })
  }

  const exportCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `canvas-${projectId}.png
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div>
          <h2 className= "text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className= "h-6 w-6 text-purple-600" />
            Real-Time Canvas Collaboration
          </h2>
          <p className= "text-gray-600">Figma-level design collaboration with live cursors</p>
        </div>

        <div className= "flex items-center gap-2">
          {/* Collaborators */}
          <div className= "flex items-center gap-1">
            {collaborators.map(collab => (
              <div
                key={collab.id}
                className={`w-8 h-8 rounded-full border-2 ${collab.isActive ? 'border-green-400' : 'border-gray-300'}`}
                style={{ borderColor: collab.isActive ? collab.color : undefined }}
              >
                <img src={collab.avatar} alt={collab.name}>
              </div>
            ))}
            <Badge >
              <Users >
              {state.collaborators} online
            </Badge>
          </div>

          <Button onClick={saveVersion}>
            <GitBranch >
            Save Version
          </Button>

          <Button onClick={exportCanvas}>
            <Download >
            Export
          </Button>

          <Button > onShare?.({ projectId, objects: state.objects })} size= "sm">
            <Share2 >
            Share
          </Button>
        </div>
      </div>

      <div >
        {/* Toolbar */}
        <div >
          <Card >
            <CardHeader >
              <CardTitle >Tools</CardTitle>
            </CardHeader>
            <CardContent >
              {tools.map(tool => (
                <Button key={tool.id} variant={state.activeTool === tool.id ? &apos;default&apos; : &apos;outline&apos;}> dispatch({ type: &apos;SET_TOOL&apos;, tool: tool.id })}
                >
                  <tool >
                  {tool.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Component Library */}
          <Card >
            <CardHeader >
              <CardTitle >Components</CardTitle>
            </CardHeader>
            <CardContent >
              {state.componentLibrary.map(component => (
                <div key={component.id}> addComponentFromLibrary(component)}
                >
                  <div >{component.name}</div>
                  <div >{component.category}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Layers */}
          <Card >
            <CardHeader >
              <CardTitle >Layers</CardTitle>
            </CardHeader>
            <CardContent >
              {state.objects.map(obj => (
                <div key={obj.id} className={`flex items-center justify-between p-1 rounded text-xs ${
                    state.selectedObjects.includes(obj.id) ? 'bg-purple-100' : 'hover:bg-gray-50
                  }> dispatch({ type: 'SELECT_OBJECTS', ids: [obj.id] })}
                >
                  <span >
                    <Layers >
                    {obj.type} {obj.id.slice(-4)}
                  </span>
                  <Button > {
                      e.stopPropagation()
                      dispatch({
                        type: 'UPDATE_OBJECT',
                        id: obj.id,
                        updates: { visible: !obj.visible }
                      })
                    }}
                  >
                    {obj.visible ? <Eye > : <EyeOff >}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div >
          <Card >
            <CardHeader >
              <div >
                <CardTitle >Canvas</CardTitle>
                <div >
                  <Button > dispatch({ type: &apos;UNDO&apos; })}
                    disabled={state.undoStack.length === 0}
                  >
                    <Undo >
                  </Button>
                  <Button > dispatch({ type: &apos;REDO&apos; })}
                    disabled={state.redoStack.length === 0}
                  >
                    <Redo >
                  </Button>
                  <Button > dispatch({ type: &apos;TOGGLE_GRID&apos; })}
                  >
                    <Grid >
                  </Button>
                  <div >
                    <span >Zoom:</span>
                    <Slider value={[state.zoom]}> dispatch({ type: &apos;SET_ZOOM&apos;, zoom })}
                      min={10}
                      max={500}
                      step={10}
                      className= "w-20
                    />
                    <span >{state.zoom}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent >
              <canvas ref={canvasRef} width={800} height={600} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{ transform: `scale(${state.zoom / 100}>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div >
          <Card >
            <CardHeader >
              <CardTitle >Properties</CardTitle>
            </CardHeader>
            <CardContent >
              {state.selectedObjects.length > 0 ? (
                <>
                  <div >
                    <label >Fill Color</label>
                    <div >
                      <input > obj.id === state.selectedObjects[0])?.fill || &apos;#6366f1&apos;}
                        onChange={(e) => {
                          state.selectedObjects.forEach(id => {
                            dispatch({
                              type: 'UPDATE_OBJECT',
                              id,
                              updates: { fill: e.target.value }
                            })
                          })
                        }}
                        className= "w-8 h-8 rounded border
                      />
                      <Palette >
                    </div>
                  </div>

                  <div >
                    <label >Opacity</label>
                    <Slider > obj.id === state.selectedObjects[0])?.opacity || 1]}
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
                      className= "mt-1
                    />
                  </div>

                  <div >
                    <Button > {
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
                      <Copy >
                    </Button>
                    <Button > dispatch({ type: &apos;DELETE_OBJECTS&apos;, ids: state.selectedObjects })}
                    >
                      <Trash2 >
                    </Button>
                  </div>
                </>
              ) : (
                <p >Select an object to edit properties</p>
              )}
            </CardContent>
          </Card>

          {/* Version History */}
          <Card >
            <CardHeader >
              <CardTitle >Version History</CardTitle>
            </CardHeader>
            <CardContent >
              {state.versions.length > 0 ? (
                state.versions.slice(-5).map(version => (
                  <div key={version.id}> dispatch({ type: &apos;LOAD_VERSION&apos;, versionId: version.id })}
                  >
                    <div >
                      <div >{version.name}</div>
                      <div >
                        <Clock >
                        {new Date(version.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p >No versions saved yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 