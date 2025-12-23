'use client'
import { useState, useMemo} from 'react'
import { useCanvas, type Canvas, type CanvasType, type CanvasStatus } from '@/lib/hooks/use-canvas'
import {
  Layout, Square, Circle, Triangle, Minus, Type, Image, Sticky,
  MousePointer, Hand, Pencil, Eraser, PenTool, Palette, Layers,
  Plus, Search, Filter, Grid3X3, Users, Clock, Star, Heart,
  Folder, Tag, Settings, Zap, Play, Pause, ZoomIn, ZoomOut,
  Undo, Redo, Copy, Trash2, Edit2, Eye, Download, Share2,
  MessageSquare, Video, Link2, Lock, Unlock, ChevronRight,
  ArrowUpRight, CheckCircle2, MoreVertical, Move, Maximize2,
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical,
  AlignCenterVertical, AlignEndVertical, Sparkles, FileText,
  BarChart3, Workflow, GitBranch, Shapes, Frame, Component,
  Table2, Calendar, Map, Code, Database, Monitor, Smartphone
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

type ViewMode = 'canvases' | 'templates' | 'components' | 'recent'
type ToolType = 'select' | 'hand' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'sticky' | 'pen' | 'frame' | 'comment'

interface CanvasTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  description: string
  popular: boolean
}

interface ShapeComponent {
  id: string
  name: string
  category: string
  icon: any
  description: string
}

export default function CanvasClient({ initialCanvases }: { initialCanvases: Canvas[] }) {
  const [canvasTypeFilter, setCanvasTypeFilter] = useState<CanvasType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CanvasStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('canvases')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null)
  const [showNewCanvas, setShowNewCanvas] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [zoom, setZoom] = useState(100)
  const [showEditor, setShowEditor] = useState(false)
  const { canvases, loading, error } = useCanvas({ canvasType: canvasTypeFilter, status: statusFilter })
  const displayCanvases = canvases.length > 0 ? canvases : initialCanvases

  // Mock templates
  const templates: CanvasTemplate[] = [
    { id: '1', name: 'Brainstorming Session', category: 'Workshop', thumbnail: '💡', description: 'Collaborative idea generation', popular: true },
    { id: '2', name: 'User Journey Map', category: 'UX', thumbnail: '🗺️', description: 'Map user experience flows', popular: true },
    { id: '3', name: 'Sprint Retrospective', category: 'Agile', thumbnail: '🔄', description: 'Team reflection template', popular: false },
    { id: '4', name: 'Mind Map', category: 'Planning', thumbnail: '🧠', description: 'Visual thinking canvas', popular: true },
    { id: '5', name: 'Kanban Board', category: 'Project', thumbnail: '📋', description: 'Task management board', popular: true },
    { id: '6', name: 'Wireframe Kit', category: 'Design', thumbnail: '🖼️', description: 'UI wireframing components', popular: false },
    { id: '7', name: 'Flowchart', category: 'Process', thumbnail: '📊', description: 'Process flow diagrams', popular: true },
    { id: '8', name: 'Org Chart', category: 'Team', thumbnail: '👥', description: 'Organization structure', popular: false }
  ]

  // Shape components
  const components: ShapeComponent[] = [
    { id: '1', name: 'Rectangle', category: 'Shapes', icon: Square, description: 'Basic rectangle shape' },
    { id: '2', name: 'Ellipse', category: 'Shapes', icon: Circle, description: 'Circle and oval shapes' },
    { id: '3', name: 'Line', category: 'Shapes', icon: Minus, description: 'Lines and arrows' },
    { id: '4', name: 'Triangle', category: 'Shapes', icon: Triangle, description: 'Triangle shape' },
    { id: '5', name: 'Frame', category: 'Layout', icon: Frame, description: 'Container frame' },
    { id: '6', name: 'Text', category: 'Content', icon: Type, description: 'Text element' },
    { id: '7', name: 'Sticky Note', category: 'Content', icon: Sticky, description: 'Sticky note' },
    { id: '8', name: 'Image', category: 'Media', icon: Image, description: 'Image placeholder' },
    { id: '9', name: 'Table', category: 'Data', icon: Table2, description: 'Data table' },
    { id: '10', name: 'Flowchart Node', category: 'Diagram', icon: Workflow, description: 'Process node' },
    { id: '11', name: 'Connector', category: 'Diagram', icon: GitBranch, description: 'Connection line' },
    { id: '12', name: 'Code Block', category: 'Dev', icon: Code, description: 'Code snippet' }
  ]

  const tools = [
    { id: 'select' as ToolType, name: 'Select', icon: MousePointer, shortcut: 'V' },
    { id: 'hand' as ToolType, name: 'Hand', icon: Hand, shortcut: 'H' },
    { id: 'frame' as ToolType, name: 'Frame', icon: Frame, shortcut: 'F' },
    { id: 'rectangle' as ToolType, name: 'Rectangle', icon: Square, shortcut: 'R' },
    { id: 'ellipse' as ToolType, name: 'Ellipse', icon: Circle, shortcut: 'O' },
    { id: 'line' as ToolType, name: 'Line', icon: Minus, shortcut: 'L' },
    { id: 'text' as ToolType, name: 'Text', icon: Type, shortcut: 'T' },
    { id: 'sticky' as ToolType, name: 'Sticky', icon: Sticky, shortcut: 'S' },
    { id: 'pen' as ToolType, name: 'Pen', icon: PenTool, shortcut: 'P' },
    { id: 'comment' as ToolType, name: 'Comment', icon: MessageSquare, shortcut: 'C' }
  ]

  const stats = useMemo(() => ({
    total: displayCanvases.length,
    active: displayCanvases.filter(c => c.status === 'active').length,
    shared: displayCanvases.filter(c => c.is_shared).length,
    collaborative: displayCanvases.filter(c => c.collaborators_count > 1).length,
    totalElements: displayCanvases.reduce((sum, c) => sum + c.object_count, 0),
    totalCollaborators: displayCanvases.reduce((sum, c) => sum + (c.collaborators_count || 0), 0)
  }), [displayCanvases])

  const filteredCanvases = useMemo(() => {
    let filtered = displayCanvases
    if (canvasTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.canvas_type === canvasTypeFilter)
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.canvas_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [displayCanvases, canvasTypeFilter, statusFilter, searchQuery])

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => direction === 'in' ? Math.min(prev + 10, 200) : Math.max(prev - 10, 25))
  }

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  // Full Editor View
  if (showEditor && selectedCanvas) {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Editor Toolbar */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEditor(false)}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <div className="text-white font-medium">{selectedCanvas.canvas_name}</div>
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-700 rounded px-2 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Live
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
              <Undo className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
              <Redo className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            <div className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1">
              <button onClick={() => handleZoom('out')} className="p-1 text-gray-400 hover:text-white">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-white text-sm w-12 text-center">{zoom}%</span>
              <button onClick={() => handleZoom('in')} className="p-1 text-gray-400 hover:text-white">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Toolbar */}
          <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2 gap-1">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-2 rounded-lg transition-colors group relative ${
                  selectedTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={`${tool.name} (${tool.shortcut})`}
              >
                <tool.icon className="h-5 w-5" />
              </button>
            ))}
            <div className="flex-1"></div>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-950 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
                backgroundSize: `${20 * zoom / 100}px ${20 * zoom / 100}px`
              }}
            ></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-white rounded-lg shadow-2xl"
                style={{
                  width: `${800 * zoom / 100}px`,
                  height: `${600 * zoom / 100}px`
                }}
              >
                <div className="w-full h-full p-8 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Layout className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Start creating</p>
                    <p className="text-sm text-gray-400">Use the tools on the left to add elements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-64 bg-gray-800 border-l border-gray-700">
            <Tabs defaultValue="properties" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3 m-2 bg-gray-700">
                <TabsTrigger value="properties" className="text-xs">Props</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
                <TabsTrigger value="components" className="text-xs">Assets</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="properties" className="mt-0 space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Position</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">X</label>
                        <input type="number" className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" defaultValue="0" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Y</label>
                        <input type="number" className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" defaultValue="0" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Fill</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded cursor-pointer"></div>
                      <input type="text" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" defaultValue="#3B82F6" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layers" className="mt-0 space-y-2">
                  <div className="space-y-1">
                    {['Frame 1', 'Rectangle 1', 'Text 1'].map((layer, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                        <Layers className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300 flex-1">{layer}</span>
                        <Eye className="h-4 w-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="components" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {components.slice(0, 6).map(comp => (
                      <button key={comp.id} className="flex flex-col items-center gap-1 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                        <comp.icon className="h-6 w-6 text-gray-300" />
                        <span className="text-xs text-gray-400">{comp.name}</span>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Layout className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Canvas</h1>
              </div>
              <p className="text-indigo-100">Infinite canvas for visual collaboration</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Users className="h-4 w-4" />
                <span className="text-sm">Real-time Collab</span>
              </div>
              <button
                onClick={() => setShowNewCanvas(true)}
                className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Canvas
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Folder className="h-4 w-4 text-indigo-200" />
                <span className="text-indigo-200 text-sm">Canvases</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-indigo-200" />
                <span className="text-indigo-200 text-sm">Active</span>
              </div>
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="h-4 w-4 text-indigo-200" />
                <span className="text-indigo-200 text-sm">Shared</span>
              </div>
              <div className="text-2xl font-bold">{stats.shared}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-indigo-200" />
                <span className="text-indigo-200 text-sm">Live Collab</span>
              </div>
              <div className="text-2xl font-bold">{stats.collaborative}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shapes className="h-4 w-4 text-indigo-200" />
                <span className="text-indigo-200 text-sm">Elements</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalElements}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-indigo-200" />
                <span className="text-indigo-200 text-sm">Collaborators</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalCollaborators}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* View Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {([
              { key: 'canvases', label: 'My Canvases', icon: Folder },
              { key: 'templates', label: 'Templates', icon: Layout },
              { key: 'components', label: 'Components', icon: Component },
              { key: 'recent', label: 'Recent', icon: Clock }
            ] as { key: ViewMode, label: string, icon: any }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search canvases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          </div>
        )}

        {/* Canvases View */}
        {viewMode === 'canvases' && !loading && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <select value={canvasTypeFilter} onChange={(e) => setCanvasTypeFilter(e.target.value as any)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="all">All Types</option>
                <option value="whiteboard">Whiteboard</option>
                <option value="diagram">Diagram</option>
                <option value="wireframe">Wireframe</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {filteredCanvases.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No canvases found</p>
                <button onClick={() => setShowNewCanvas(true)} className="mt-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  <Plus className="h-4 w-4" />
                  Create your first canvas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCanvases.map(canvas => (
                  <div key={canvas.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                    <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 relative">
                      <div className="absolute inset-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                        <div className="text-4xl">
                          {canvas.canvas_type === 'diagram' ? '📊' : canvas.canvas_type === 'wireframe' ? '🖼️' : '📝'}
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedCanvas(canvas); setShowEditor(true); }} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50">
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50">
                          <Share2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4" onClick={() => setSelectedCanvas(canvas)}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${canvas.is_shared ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {canvas.is_shared ? 'Shared' : 'Private'}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-xs">
                          {canvas.canvas_type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{canvas.canvas_name}</h3>
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1"><Shapes className="h-3 w-3" />{canvas.object_count} elements</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{canvas.collaborators_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Templates View */}
        {viewMode === 'templates' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center relative">
                  <span className="text-5xl">{template.thumbnail}</span>
                  {template.popular && <div className="absolute top-2 right-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs">Popular</div>}
                </div>
                <div className="p-4">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">{template.category}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                  <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-all">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Components View */}
        {viewMode === 'components' && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {components.map(comp => (
              <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer text-center group">
                <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <comp.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{comp.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{comp.category}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent View */}
        {viewMode === 'recent' && !loading && (
          <div className="space-y-3">
            {filteredCanvases.slice(0, 10).map(canvas => (
              <div key={canvas.id} onClick={() => setSelectedCanvas(canvas)} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                  <Layout className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{canvas.canvas_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-xs">{canvas.canvas_type}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">{canvas.object_count} elements</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSelectedCanvas(canvas); setShowEditor(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Canvas Modal */}
      <Dialog open={showNewCanvas} onOpenChange={setShowNewCanvas}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Plus className="h-6 w-6 text-indigo-600" />
              Create New Canvas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canvas Name</label>
              <input type="text" placeholder="Untitled canvas" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Canvas Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'whiteboard', name: 'Whiteboard', icon: Sticky, desc: 'Free-form collaboration' },
                  { id: 'diagram', name: 'Diagram', icon: Workflow, desc: 'Flowcharts & processes' },
                  { id: 'wireframe', name: 'Wireframe', icon: Monitor, desc: 'UI/UX mockups' },
                  { id: 'mindmap', name: 'Mind Map', icon: GitBranch, desc: 'Visual thinking' }
                ].map(type => (
                  <button key={type.id} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-400 transition-colors text-left">
                    <type.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{type.name}</p>
                      <p className="text-xs text-gray-500">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNewCanvas(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Create Canvas</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canvas Detail Modal */}
      <Dialog open={!!selectedCanvas && !showEditor} onOpenChange={() => setSelectedCanvas(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Layout className="h-6 w-6 text-indigo-600" />
              {selectedCanvas?.canvas_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Layout className="h-16 w-16 mx-auto mb-4 text-indigo-400" />
                <p className="text-gray-600 dark:text-gray-400">Canvas Preview</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCanvas?.object_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Elements</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCanvas?.collaborators_count || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Collaborators</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCanvas?.layer_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Layers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowEditor(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Edit2 className="h-4 w-4" />Open Editor
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
