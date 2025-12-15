'use client'

import { useState } from 'react'
import { useWidgets, Widget, WidgetStats } from '@/lib/hooks/use-widgets'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Package,
  Plus,
  Search,
  Settings,
  BarChart3,
  Download,
  Star,
  Users,
  Code,
  X,
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react'

interface WidgetLibraryClientProps {
  initialWidgets: Widget[]
  initialStats: WidgetStats
}

export default function WidgetLibraryClient({ initialWidgets, initialStats }: WidgetLibraryClientProps) {
  const {
    widgets,
    stats,
    loading,
    createWidget,
    deleteWidget,
    installWidget
  } = useWidgets(initialWidgets, initialStats)

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'beta' | 'maintenance'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'analytics' | 'productivity' | 'commerce'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWidget, setNewWidget] = useState({
    name: '',
    description: '',
    category: '',
    widget_type: 'display' as const,
    version: '1.0.0'
  })

  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (widget.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || widget.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || widget.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleCreateWidget = async () => {
    if (!newWidget.name.trim()) return
    await createWidget(newWidget)
    setShowCreateModal(false)
    setNewWidget({ name: '', description: '', category: '', widget_type: 'display', version: '1.0.0' })
  }

  const displayStats = [
    { label: 'Total Widgets', value: stats.total.toString(), change: 18.5, icon: <Package className="w-5 h-5" /> },
    { label: 'Total Installs', value: stats.totalInstalls.toLocaleString(), change: 24.3, icon: <Download className="w-5 h-5" /> },
    { label: 'Active Users', value: stats.totalActiveUsers.toLocaleString(), change: 32.1, icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: stats.avgRating.toFixed(1), change: 5.2, icon: <Star className="w-5 h-5" /> }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'beta': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'deprecated': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      case 'maintenance': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'coming-soon': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'analytics': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'productivity': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      case 'commerce': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
      case 'communication': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'media': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      case 'utilities': return 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-orange-50/40 dark:from-purple-950 dark:via-pink-950/30 dark:to-orange-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Package className="w-10 h-10 text-purple-600" />
              Widget Library
            </h1>
            <p className="text-muted-foreground">Browse and manage reusable widgets</p>
          </div>
          <GradientButton from="purple" to="pink" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Widget
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Search />} title="Browse" description="Explore widgets" onClick={() => console.log('Browse')} />
          <BentoQuickAction icon={<Plus />} title="Create" description="New widget" onClick={() => setShowCreateModal(true)} />
          <BentoQuickAction icon={<Code />} title="API" description="Documentation" onClick={() => console.log('API')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>All</PillButton>
            <PillButton variant={statusFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('active')}>Active</PillButton>
            <PillButton variant={statusFilter === 'beta' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('beta')}>Beta</PillButton>
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={categoryFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setCategoryFilter('all')}>All</PillButton>
            <PillButton variant={categoryFilter === 'analytics' ? 'primary' : 'ghost'} onClick={() => setCategoryFilter('analytics')}>Analytics</PillButton>
            <PillButton variant={categoryFilter === 'productivity' ? 'primary' : 'ghost'} onClick={() => setCategoryFilter('productivity')}>Productivity</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading && widgets.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : filteredWidgets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No widgets found</p>
                <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Widget
                </ModernButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWidgets.map((widget) => (
                  <BentoCard key={widget.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{widget.name}</h3>
                          <p className="text-xs text-muted-foreground">v{widget.version} {widget.size && `• ${widget.size}`}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{widget.description || 'No description'}</p>

                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(widget.status)}`}>{widget.status}</span>
                        {widget.category && <span className={`text-xs px-2 py-1 rounded-md ${getCategoryColor(widget.category)}`}>{widget.category}</span>}
                        <span className="text-xs px-2 py-1 rounded-md bg-muted">{widget.widget_type}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Installs</span>
                          <p className="font-semibold">{widget.installs_count.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active Users</span>
                          <p className="font-semibold">{widget.active_users_count.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Downloads</span>
                          <p className="font-semibold">{widget.downloads_count.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rating</span>
                          <p className="font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {widget.rating} ({widget.total_ratings})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <ModernButton variant="primary" size="sm" onClick={() => installWidget(widget.id)}>
                          <Download className="w-3 h-3 mr-1" />Install
                        </ModernButton>
                        {widget.demo_url && (
                          <ModernButton variant="outline" size="sm" onClick={() => window.open(widget.demo_url!, '_blank')}>
                            <ExternalLink className="w-3 h-3 mr-1" />Demo
                          </ModernButton>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => deleteWidget(widget.id)}>
                          <Trash2 className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Active Widgets" value={stats.active.toString()} change={18.5} />
                <MiniKPI label="Beta Widgets" value={stats.beta.toString()} change={12.3} />
                <MiniKPI label="Total Installs" value={stats.totalInstalls.toLocaleString()} change={24.3} />
                <MiniKPI label="Avg Rating" value={stats.avgRating.toFixed(1)} change={5.2} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
              <div className="space-y-2">
                {['analytics', 'productivity', 'commerce', 'media', 'utilities'].map(cat => {
                  const count = widgets.filter(w => w.category === cat).length
                  return (
                    <div key={cat} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <span className="text-sm font-medium capitalize">{cat}</span>
                      <span className="text-xs text-muted-foreground">{count} widgets</span>
                    </div>
                  )
                })}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Widget</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newWidget.name}
                  onChange={(e) => setNewWidget({ ...newWidget, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter widget name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newWidget.description}
                  onChange={(e) => setNewWidget({ ...newWidget, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newWidget.category}
                    onChange={(e) => setNewWidget({ ...newWidget, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select category</option>
                    <option value="analytics">Analytics</option>
                    <option value="productivity">Productivity</option>
                    <option value="commerce">Commerce</option>
                    <option value="communication">Communication</option>
                    <option value="media">Media</option>
                    <option value="utilities">Utilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newWidget.widget_type}
                    onChange={(e) => setNewWidget({ ...newWidget, widget_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="display">Display</option>
                    <option value="interactive">Interactive</option>
                    <option value="visualization">Visualization</option>
                    <option value="form">Form</option>
                    <option value="embed">Embed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="purple" to="pink" className="flex-1" onClick={handleCreateWidget} disabled={loading || !newWidget.name.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Widget'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
