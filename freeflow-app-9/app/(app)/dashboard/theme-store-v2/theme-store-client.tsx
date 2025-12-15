'use client'

import { useState } from 'react'
import { useThemes, Theme, ThemesStats } from '@/lib/hooks/use-themes'
import { createTheme, deleteTheme, activateTheme, installTheme, uninstallTheme, deactivateTheme } from '@/app/actions/themes'

type ThemeStatus = 'active' | 'available' | 'installed' | 'preview' | 'deprecated'
type ThemeCategory = 'minimal' | 'professional' | 'creative' | 'dark' | 'light' | 'colorful' | 'modern' | 'classic'
type ThemePricing = 'free' | 'premium' | 'bundle' | 'enterprise'

interface ThemeStoreClientProps {
  initialThemes: Theme[]
  initialStats: ThemesStats
}

export default function ThemeStoreClient({ initialThemes, initialStats }: ThemeStoreClientProps) {
  const { themes, stats } = useThemes(initialThemes, initialStats)
  const [statusFilter, setStatusFilter] = useState<ThemeStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ThemeCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<ThemePricing | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', description: '', designer: '', category: 'modern' as ThemeCategory,
    pricing: 'free' as ThemePricing, price: 'Free', dark_mode: false, responsive: true, customizable: true
  })

  const filteredThemes = themes.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (pricingFilter !== 'all' && t.pricing !== pricingFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Themes', value: stats.total.toString(), trend: '+28' },
    { label: 'Installed', value: stats.installed.toString(), trend: '+42%' },
    { label: 'Avg Rating', value: `${stats.avgRating.toFixed(1)}/5`, trend: '+0.3' },
    { label: 'Downloads', value: `${(stats.totalDownloads / 1000).toFixed(0)}K`, trend: '+38%' }
  ]

  const handleCreate = async () => {
    try {
      await createTheme(formData)
      setShowCreateModal(false)
      setFormData({ name: '', description: '', designer: '', category: 'modern', pricing: 'free', price: 'Free', dark_mode: false, responsive: true, customizable: true })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => { if (confirm('Delete theme?')) await deleteTheme(id) }
  const handleActivate = async (id: string) => { await activateTheme(id) }
  const handleInstall = async (id: string) => { await installTheme(id) }
  const handleUninstall = async (id: string) => { await uninstallTheme(id) }
  const handleDeactivate = async (id: string) => { await deactivateTheme(id) }

  const getStatusColor = (s: ThemeStatus) => ({ active: 'bg-green-100 text-green-700', available: 'bg-blue-100 text-blue-700', installed: 'bg-purple-100 text-purple-700', preview: 'bg-yellow-100 text-yellow-700', deprecated: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700')
  const getCategoryColor = (c: ThemeCategory) => ({ minimal: 'bg-gray-100 text-gray-700', professional: 'bg-blue-100 text-blue-700', creative: 'bg-purple-100 text-purple-700', dark: 'bg-slate-700 text-white', light: 'bg-amber-100 text-amber-700', colorful: 'bg-pink-100 text-pink-700', modern: 'bg-teal-100 text-teal-700', classic: 'bg-orange-100 text-orange-700' }[c] || 'bg-gray-100 text-gray-700')
  const getPricingColor = (p: ThemePricing) => ({ free: 'bg-green-100 text-green-700', premium: 'bg-purple-100 text-purple-700', bundle: 'bg-orange-100 text-orange-700', enterprise: 'bg-blue-100 text-blue-700' }[p] || 'bg-gray-100 text-gray-700')

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">Theme Store</h1>
          <p className="text-gray-600 mt-1">Customize your interface with beautiful themes</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white rounded-lg">Add Theme</button>
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
          {(['all', 'active', 'installed', 'available'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-rose-600 text-white' : 'bg-white text-gray-700'}`}>
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'professional', 'dark', 'creative', 'modern'] as const).map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2 rounded-full text-sm ${categoryFilter === c ? 'bg-rose-600 text-white' : 'bg-white text-gray-700'}`}>
              {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'free', 'premium'] as const).map(p => (
            <button key={p} onClick={() => setPricingFilter(p)} className={`px-4 py-2 rounded-full text-sm ${pricingFilter === p ? 'bg-rose-600 text-white' : 'bg-white text-gray-700'}`}>
              {p === 'all' ? 'All Pricing' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Themes ({filteredThemes.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100'}`}>Grid</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100'}`}>List</button>
              </div>
            </div>

            {filteredThemes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No themes found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg">Add First Theme</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredThemes.map(theme => (
                  <div key={theme.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">v{theme.version} • {theme.file_size} • {theme.designer || 'Unknown'}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{theme.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(theme.status)}`}>{theme.status}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(theme.category)}`}>{theme.category}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPricingColor(theme.pricing)}`}>{theme.pricing}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div><span className="text-gray-500">Downloads</span><div className="font-semibold">{(theme.downloads_count || 0).toLocaleString()}</div></div>
                      <div><span className="text-gray-500">Price</span><div className="font-semibold text-rose-600">{theme.price}</div></div>
                      <div><span className="text-gray-500">Components</span><div className="font-semibold">{theme.components_count}</div></div>
                      <div><span className="text-gray-500">Layouts</span><div className="font-semibold">{theme.layouts_count}</div></div>
                    </div>

                    <div className="mb-3 text-xs space-y-1">
                      <div className="flex items-center justify-between"><span className="text-gray-500">Dark Mode</span><span className="font-medium">{theme.dark_mode ? '✓' : '✗'}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-500">Responsive</span><span className="font-medium">{theme.responsive ? '✓' : '✗'}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-500">Customizable</span><span className="font-medium">{theme.customizable ? '✓' : '✗'}</span></div>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1"><span className="text-yellow-500">★</span><span className="font-semibold">{theme.rating || 0}</span><span className="text-gray-500">({(theme.reviews_count || 0).toLocaleString()})</span></div>
                      <span className="text-gray-500">{theme.colors_count} colors</span>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      {theme.status === 'active' ? (
                        <>
                          <button className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded text-xs font-medium">Customize</button>
                          <button onClick={() => handleDeactivate(theme.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Deactivate</button>
                        </>
                      ) : theme.status === 'installed' ? (
                        <>
                          <button onClick={() => handleActivate(theme.id)} className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded text-xs font-medium">Activate</button>
                          <button onClick={() => handleUninstall(theme.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Uninstall</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleInstall(theme.id)} className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded text-xs font-medium">Install</button>
                          <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Preview</button>
                        </>
                      )}
                      <button onClick={() => handleDelete(theme.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-600">Installed</span><span className="font-semibold">{stats.installed}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Active</span><span className="font-semibold text-green-600">{stats.active}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Downloads</span><span className="font-semibold">{stats.totalDownloads.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Avg Rating</span><span className="font-semibold">{stats.avgRating.toFixed(1)}/5</span></div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add Theme</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Designer</label><input type="text" value={formData.designer} onChange={e => setFormData({...formData, designer: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ThemeCategory})} className="w-full px-3 py-2 border rounded-lg"><option value="modern">Modern</option><option value="professional">Professional</option><option value="creative">Creative</option><option value="dark">Dark</option><option value="light">Light</option><option value="minimal">Minimal</option></select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.dark_mode} onChange={e => setFormData({...formData, dark_mode: e.target.checked})} className="rounded" /><span className="text-sm">Dark Mode</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.responsive} onChange={e => setFormData({...formData, responsive: e.target.checked})} className="rounded" /><span className="text-sm">Responsive</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.customizable} onChange={e => setFormData({...formData, customizable: e.target.checked})} className="rounded" /><span className="text-sm">Customizable</span></label>
              </div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg">Create</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
