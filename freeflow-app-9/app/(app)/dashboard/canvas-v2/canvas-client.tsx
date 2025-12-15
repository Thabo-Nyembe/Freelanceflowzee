'use client'
import { useState } from 'react'
import { useCanvas, type Canvas, type CanvasType, type CanvasStatus } from '@/lib/hooks/use-canvas'

export default function CanvasClient({ initialCanvases }: { initialCanvases: Canvas[] }) {
  const [canvasTypeFilter, setCanvasTypeFilter] = useState<CanvasType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CanvasStatus | 'all'>('all')
  const { canvases, loading, error } = useCanvas({ canvasType: canvasTypeFilter, status: statusFilter })
  const displayCanvases = canvases.length > 0 ? canvases : initialCanvases

  const stats = {
    total: displayCanvases.length,
    active: displayCanvases.filter(c => c.status === 'active').length,
    shared: displayCanvases.filter(c => c.is_shared).length,
    totalObjects: displayCanvases.reduce((sum, c) => sum + c.object_count, 0)
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Canvas Studio</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Canvases</div><div className="text-3xl font-bold text-pink-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Shared</div><div className="text-3xl font-bold text-blue-600">{stats.shared}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Objects</div><div className="text-3xl font-bold text-purple-600">{stats.totalObjects}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={canvasTypeFilter} onChange={(e) => setCanvasTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="whiteboard">Whiteboard</option><option value="design">Design</option><option value="diagram">Diagram</option><option value="wireframe">Wireframe</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="active">Active</option><option value="archived">Archived</option><option value="locked">Locked</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayCanvases.filter(c => (canvasTypeFilter === 'all' || c.canvas_type === canvasTypeFilter) && (statusFilter === 'all' || c.status === statusFilter)).map(canvas => (
          <div key={canvas.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${canvas.status === 'active' ? 'bg-green-100 text-green-700' : canvas.status === 'locked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{canvas.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-700">{canvas.canvas_type}</span>
                  {canvas.is_shared && <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Shared</span>}
                  {canvas.is_published && <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">Published</span>}
                  {canvas.is_template && <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">Template</span>}
                </div>
                <h3 className="text-lg font-semibold">{canvas.canvas_name}</h3>
                {canvas.description && <p className="text-sm text-gray-600 mt-1">{canvas.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>📐 {canvas.width}×{canvas.height}</span>
                  <span>🎨 {canvas.object_count} objects</span>
                  <span>📚 {canvas.layer_count} layers</span>
                  {canvas.shared_with && canvas.shared_with.length > 0 && <span>👥 {canvas.shared_with.length} shared with</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">v{canvas.version}</div>
                <div className="text-xs text-gray-500">version</div>
                {canvas.auto_save && <div className="text-xs text-gray-600 mt-1">💾 auto-save on</div>}
                {canvas.grid_enabled && <div className="text-xs text-gray-600">🔲 grid enabled</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
