'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Palette,
  Share2,
  Download,
  Undo,
  Redo,
  Move,
  Square,
  Circle,
  Type,
  Brush,
  Eraser,
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Save,
  Plus,
  Trash2,
  MousePointer2,
  Hand,
  Sparkles
} from 'lucide-react'

interface CanvasLayer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  type: 'drawing' | 'text' | 'shape' | 'image'
}

interface Collaborator {
  id: string
  name: string
  avatar: string
  color: string
  cursor: { x: number; y: number } | null
  isActive: boolean
  tool: string
}

interface CanvasProject {
  id: string
  name: string
  thumbnail: string
  lastModified: string
  collaborators: string[]
  size: string
}

export default function CanvasCollaboration() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTool, setSelectedTool] = useState<any>('select')
  const [brushSize, setBrushSize] = useState<any>(5)
  const [selectedColor, setSelectedColor] = useState<any>('#000000')
  const [zoom, setZoom] = useState<any>(100)
  const [isGridVisible, setIsGridVisible] = useState<any>(true)
  const [activeTab, setActiveTab] = useState<any>('canvas')
  const [isVideoCallActive, setIsVideoCallActive] = useState<any>(false)
  const [isMuted, setIsMuted] = useState<any>(false)
  const [isVideoOff, setIsVideoOff] = useState<any>(false)
  const [isDrawing, setIsDrawing] = useState<any>(false)
  const [lastPosition, setLastPosition] = useState<any>({ x: 0, y: 0 })
  const [canvasHistory, setCanvasHistory] = useState<string[]>([])
  const [historyStep, setHistoryStep] = useState<any>(-1)

  const [layers, setLayers] = useState<CanvasLayer[]>([
    { id: '1', name: 'Background', visible: true, locked: false, opacity: 100, type: 'drawing' },
    { id: '2', name: 'Sketch', visible: true, locked: false, opacity: 80, type: 'drawing' },
    { id: '3', name: 'Details', visible: true, locked: false, opacity: 100, type: 'drawing' }
  ])

  const [collaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      color: '#FF6B6B',
      cursor: { x: 150, y: 200 },
      isActive: true,
      tool: 'brush'
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      avatar: '/avatars/mike.jpg',
      color: '#4ECDC4',
      cursor: { x: 300, y: 150 },
      isActive: true,
      tool: 'select'
    },
    {
      id: '3',
      name: 'Emma Thompson',
      avatar: '/avatars/emma.jpg',
      color: '#45B7D1',
      cursor: null,
      isActive: false,
      tool: 'text'
    }
  ])

  const [recentProjects] = useState<CanvasProject[]>([
    {
      id: '1',
      name: 'Brand Identity Design',
      thumbnail: '/canvas-thumbnails/brand.jpg',
      lastModified: '2 hours ago',
      collaborators: ['Sarah', 'Mike'],
      size: '1920x1080'
    },
    {
      id: '2',
      name: 'Mobile App Wireframes',
      thumbnail: '/canvas-thumbnails/wireframes.jpg',
      lastModified: '1 day ago',
      collaborators: ['Emma', 'You'],
      size: '375x812'
    },
    {
      id: '3',
      name: 'Website Homepage',
      thumbnail: '/canvas-thumbnails/homepage.jpg',
      lastModified: '3 days ago',
      collaborators: ['Sarah', 'Mike', 'Emma'],
      size: '1440x900'
    }
  ])

  const tools = [
    { id: 'select', icon: MousePointer2, name: 'Select' },
    { id: 'hand', icon: Hand, name: 'Hand' },
    { id: 'brush', icon: Brush, name: 'Brush' },
    { id: 'eraser', icon: Eraser, name: 'Eraser' },
    { id: 'text', icon: Type, name: 'Text' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
    { id: 'line', icon: Move, name: 'Line' }
  ]

  const colors = [
    '#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#10AC84', '#EE5A24'
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize canvas
    canvas.width = 1200
    canvas.height = 800
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state to history
    if (canvasHistory.length === 0) {
      const imageData = canvas.toDataURL()
      setCanvasHistory([imageData])
      setHistoryStep(0)
    }

    // Draw grid if visible
    if (isGridVisible) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      const gridSize = 20

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw collaborator cursors
    collaborators.forEach(collaborator => {
      if (collaborator.cursor && collaborator.isActive) {
        ctx.fillStyle = collaborator.color
        ctx.beginPath()
        ctx.arc(collaborator.cursor.x, collaborator.cursor.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        // Draw name label
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '12px Arial'
        ctx.fillText(collaborator.name, collaborator.cursor.x + 15, collaborator.cursor.y - 5)
      }
    })
  }, [isGridVisible, collaborators, canvasHistory.length])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'select' || selectedTool === 'hand') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    
    setIsDrawing(true)
    setLastPosition({ x, y })
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = brushSize
    ctx.globalCompositeOperation = selectedTool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = selectedColor
    
    if (selectedTool === 'brush' || selectedTool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    if (selectedTool === 'brush' || selectedTool === 'eraser') {
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (selectedTool === 'rectangle') {
      // Clear and redraw for shape preview
      const imageData = canvasHistory[historyStep]
      if (imageData) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          
          // Draw rectangle preview
          ctx.strokeStyle = selectedColor
          ctx.lineWidth = brushSize
          ctx.strokeRect(lastPosition.x, lastPosition.y, x - lastPosition.x, y - lastPosition.y)
        }
        img.src = imageData
      }
    } else if (selectedTool === 'circle') {
      // Clear and redraw for shape preview
      const imageData = canvasHistory[historyStep]
      if (imageData) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          
          // Draw circle preview
          const radius = Math.sqrt(Math.pow(x - lastPosition.x, 2) + Math.pow(y - lastPosition.y, 2))
          ctx.strokeStyle = selectedColor
          ctx.lineWidth = brushSize
          ctx.beginPath()
          ctx.arc(lastPosition.x, lastPosition.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }
        img.src = imageData
      }
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current
      if (canvas) {
        // Save to history
        const imageData = canvas.toDataURL()
        const newHistory = canvasHistory.slice(0, historyStep + 1)
        newHistory.push(imageData)
        setCanvasHistory(newHistory)
        setHistoryStep(newHistory.length - 1)
      }
    }
    setIsDrawing(false)
  }

  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const imageData = canvas.toDataURL()
    const newHistory = canvasHistory.slice(0, historyStep + 1)
    newHistory.push(imageData)
    setCanvasHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      
      const newStep = historyStep - 1
      const imageData = canvasHistory[newStep]
      
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = imageData
      
      setHistoryStep(newStep)
    }
  }

  const redo = () => {
    if (historyStep < canvasHistory.length - 1) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      
      const newStep = historyStep + 1
      const imageData = canvasHistory[newStep]
      
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = imageData
      
      setHistoryStep(newStep)
    }
  }

  const _clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveCanvasState()
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'canvas-design.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
  }

  const handleZoomIn = () => setZoom(Math.min(500, zoom + 25))
  const handleZoomOut = () => setZoom(Math.max(25, zoom - 25))

  const toggleLayer = (layerId: string, property: 'visible' | 'locked') => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, [property]: !layer[property] }
        : layer
    ))
  }

  const startVideoCall = () => {
    setIsVideoCallActive(true)
  }

  const endVideoCall = () => {
    setIsVideoCallActive(false)
    setIsMuted(false)
    setIsVideoOff(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Canvas Collaboration</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Untitled Canvas" 
                className="w-48 text-sm"
                defaultValue="Brand Identity Design"
              />
              <Badge variant="outline" className="text-green-600 border-green-200">
                Auto-saved 2 min ago
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Collaborators */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id} className="relative">
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                      <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {collaborator.isActive && (
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: collaborator.color }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </div>

            {/* Video Call Controls */}
            <div className="flex items-center gap-2">
              {!isVideoCallActive ? (
                <Button onClick={startVideoCall} variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-1" />
                  Start Call
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    variant={isVideoOff ? "destructive" : "outline"}
                    size="sm"
                  >
                    {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </Button>
                  <Button onClick={endVideoCall} variant="destructive" size="sm">
                    End Call
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCanvas}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={saveCanvasState}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
          {tools.map(tool => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              size="sm"
              className="w-10 h-10 p-0"
              onClick={() => handleToolSelect(tool.id)}
              title={tool.name}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
          
          <div className="my-2 w-8 h-px bg-gray-200" />
          
          {/* Color Palette */}
          <div className="grid grid-cols-2 gap-1">
            {colors.slice(0, 8).map(color => (
              <button
                key={color}
                className={`w-4 h-4 rounded border ${selectedColor === color ? 'ring-2 ring-purple-500' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" title="Undo" onClick={undo} disabled={historyStep <= 0}>
                  <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Redo" onClick={redo} disabled={historyStep >= canvasHistory.length - 1}>
                  <Redo className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="w-px h-6 bg-gray-200" />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Brush:</span>
                <Input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20 h-2"
                />
                <span className="text-sm text-gray-500 w-6">{brushSize}px</span>
              </div>
              
              <div className="w-px h-6 bg-gray-200" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsGridVisible(!isGridVisible)}
                className={isGridVisible ? 'bg-gray-100' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 relative overflow-auto bg-gray-100">
            <div className="flex items-center justify-center min-h-full p-8">
              <div 
                className="bg-white shadow-lg relative"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300"
                  style={{ 
                    imageRendering: 'pixelated',
                    cursor: selectedTool === 'hand' ? 'grab' : selectedTool === 'select' ? 'default' : 'crosshair'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                
                {/* Real-time Comments */}
                <div className="absolute top-20 left-20">
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-medium text-yellow-800">Sarah Chen</span>
                    </div>
                    <p className="text-xs text-yellow-700">Let&apos;s adjust the logo size here</p>
                  </div>
                </div>
                
                <div className="absolute top-40 right-32">
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-800">Mike Rodriguez</span>
                    </div>
                    <p className="text-xs text-blue-700">Color looks great! 👍</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers & Properties */}
        <div className="w-80 bg-white border-l border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3 p-1 m-1">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas" className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Canvas Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="1920" />
                      <Input placeholder="1080" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value="#FFFFFF"
                        className="w-10 h-8 rounded border border-gray-300"
                      />
                      <Input value="#FFFFFF" className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Grid Settings</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Show Grid</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsGridVisible(!isGridVisible)}
                        >
                          {isGridVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Input placeholder="20px" defaultValue="20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline" onClick={() => alert('AI will generate creative ideas based on your current canvas!')}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => alert('AI will analyze your design and suggest complementary colors!')}>
                    <Palette className="w-4 h-4 mr-2" />
                    Suggest Colors
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => alert('AI will analyze your layout and suggest improvements!')}>
                    <Type className="w-4 h-4 mr-2" />
                    Improve Layout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="layers" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Layers</h3>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {layers.map(layer => (
                  <div key={layer.id} className="flex items-center gap-2 p-2 rounded border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 w-6 h-6"
                      onClick={() => toggleLayer(layer.id, 'visible')}
                    >
                      {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 w-6 h-6"
                      onClick={() => toggleLayer(layer.id, 'locked')}
                    >
                      {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </Button>
                    <span className="flex-1 text-sm">{layer.name}</span>
                    <Button variant="ghost" size="sm" className="p-0 w-6 h-6">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="projects" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Projects</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentProjects.map(project => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded border flex-shrink-0 flex items-center justify-center">
                          <Palette className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                          <p className="text-xs text-gray-500">{project.size}</p>
                          <p className="text-xs text-gray-400 mt-1">{project.lastModified}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {project.collaborators.map((collaborator, index) => (
                              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {collaborator}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}