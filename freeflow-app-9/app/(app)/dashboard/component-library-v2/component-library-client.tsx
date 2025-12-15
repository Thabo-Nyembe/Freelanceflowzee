'use client'

import { useState } from 'react'
import { useUIComponents, UIComponent, UIComponentStats } from '@/lib/hooks/use-ui-components'
import { createUIComponent, deleteUIComponent, publishComponent, deprecateComponent, setBetaComponent } from '@/app/actions/ui-components'

type ComponentStatus = 'published' | 'draft' | 'deprecated' | 'beta' | 'archived'
type ComponentCategory = 'layout' | 'navigation' | 'forms' | 'data-display' | 'feedback' | 'media' | 'buttons' | 'overlays'
type ComponentFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'

interface ComponentLibraryClientProps {
  initialComponents: UIComponent[]
  initialStats: UIComponentStats
}

export default function ComponentLibraryClient({ initialComponents, initialStats }: ComponentLibraryClientProps) {
  const { components, stats } = useUIComponents(initialComponents, initialStats)
  const [statusFilter, setStatusFilter] = useState<ComponentStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'layout' as ComponentCategory, framework: 'react' as ComponentFramework,
    version: 'v1.0', author: '', file_size: '', tags: ''
  })

  const filteredComponents = components.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Components', value: stats.total.toString(), trend: '+32%' },
    { label: 'Published', value: stats.published.toString(), trend: '+18%' },
    { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), trend: '+48%' },
    { label: 'Avg Rating', value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5` : 'N/A', trend: '+0.3' }
  ]

  const handleCreate = async () => {
    try {
      await createUIComponent({
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      })
      setShowCreateModal(false)
      setFormData({ name: '', description: '', category: 'layout', framework: 'react', version: 'v1.0', author: '', file_size: '', tags: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => { if (confirm('Delete component?')) await deleteUIComponent(id) }
  const handlePublish = async (id: string) => { await publishComponent(id) }
  const handleDeprecate = async (id: string) => { await deprecateComponent(id) }
  const handleSetBeta = async (id: string) => { await setBetaComponent(id) }

  const getStatusColor = (s: ComponentStatus) => ({ published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-700', deprecated: 'bg-red-100 text-red-700', beta: 'bg-blue-100 text-blue-700', archived: 'bg-yellow-100 text-yellow-700' }[s] || 'bg-gray-100 text-gray-700')
  const getCategoryColor = (c: ComponentCategory) => ({ layout: 'bg-blue-100 text-blue-700', navigation: 'bg-green-100 text-green-700', forms: 'bg-purple-100 text-purple-700', 'data-display': 'bg-orange-100 text-orange-700', feedback: 'bg-pink-100 text-pink-700', media: 'bg-indigo-100 text-indigo-700', buttons: 'bg-teal-100 text-teal-700', overlays: 'bg-red-100 text-red-700' }[c] || 'bg-gray-100 text-gray-700')
  const getFrameworkColor = (f: ComponentFramework) => ({ react: 'bg-cyan-100 text-cyan-700', vue: 'bg-green-100 text-green-700', angular: 'bg-red-100 text-red-700', svelte: 'bg-orange-100 text-orange-700', vanilla: 'bg-yellow-100 text-yellow-700' }[f] || 'bg-gray-100 text-gray-700')

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Component Library</h1>
            <p className="text-gray-600 mt-1">Discover and use reusable UI components</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-lg">New Component</button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statsDisplay.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
              <p className="text-sm text-green-600 mt-1">{s.trend}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'published', 'beta', 'draft'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-violet-600 text-white' : 'bg-white text-gray-700'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'forms', 'data-display', 'navigation'] as const).map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2 rounded-full text-sm ${categoryFilter === c ? 'bg-violet-600 text-white' : 'bg-white text-gray-700'}`}>
                {c === 'all' ? 'All Categories' : c === 'data-display' ? 'Data Display' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredComponents.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500 mb-4">No components found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg">Create First Component</button>
              </div>
            ) : filteredComponents.map(comp => (
              <div key={comp.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🧩</span>
                      <h3 className="font-semibold text-lg">{comp.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comp.description}</p>
                    <p className="text-xs text-gray-500">v{comp.version} • {comp.file_size || 'N/A'} • {comp.author || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(comp.status)}`}>{comp.status}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(comp.category)}`}>{comp.category}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFrameworkColor(comp.framework)}`}>{comp.framework}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500 text-xs">Downloads</span><p className="font-semibold">{(comp.downloads_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Usage</span><p className="font-semibold">{(comp.usage_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Props</span><p className="font-semibold">{comp.props_count || 0}</p></div>
                  <div><span className="text-gray-500 text-xs">Examples</span><p className="font-semibold">{comp.examples_count || 0}</p></div>
                </div>

                <div className="mb-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Accessibility</span>
                    <span className="font-medium text-green-600">{comp.accessibility_level || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Responsive</span>
                    <span className="font-medium">{comp.is_responsive ? '✓ Yes' : '✗ No'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{comp.rating || 0}</span>
                    <span className="text-gray-500">({comp.reviews_count || 0})</span>
                  </div>
                  <span className="text-gray-500">{comp.dependencies_count || 0} deps</span>
                </div>

                {comp.tags && comp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {comp.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs">#{tag}</span>)}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {comp.status === 'draft' && <button onClick={() => handlePublish(comp.id)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium">Publish</button>}
                  {comp.status === 'draft' && <button onClick={() => handleSetBeta(comp.id)} className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">Set Beta</button>}
                  {comp.status === 'published' && <button onClick={() => handleDeprecate(comp.id)} className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded text-xs font-medium">Deprecate</button>}
                  <button onClick={() => handleDelete(comp.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Published</span><span className="font-semibold text-green-600">{stats.published}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Beta</span><span className="font-semibold text-blue-600">{stats.beta}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Draft</span><span className="font-semibold">{stats.draft}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Downloads</span><span className="font-semibold">{stats.totalDownloads.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">New Component</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ComponentCategory})} className="w-full px-3 py-2 border rounded-lg"><option value="layout">Layout</option><option value="navigation">Navigation</option><option value="forms">Forms</option><option value="data-display">Data Display</option><option value="feedback">Feedback</option><option value="media">Media</option><option value="buttons">Buttons</option><option value="overlays">Overlays</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Framework</label><select value={formData.framework} onChange={e => setFormData({...formData, framework: e.target.value as ComponentFramework})} className="w-full px-3 py-2 border rounded-lg"><option value="react">React</option><option value="vue">Vue</option><option value="angular">Angular</option><option value="svelte">Svelte</option><option value="vanilla">Vanilla</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Version</label><input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">File Size</label><input type="text" value={formData.file_size} onChange={e => setFormData({...formData, file_size: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 24 KB" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Tags (comma-separated)</label><input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
