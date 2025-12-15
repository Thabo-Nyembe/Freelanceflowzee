'use client'

import { useState } from 'react'
import { useIntegrations, Integration, IntegrationStats } from '@/lib/hooks/use-integrations'
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
  Plug,
  CheckCircle,
  Plus,
  Search,
  Settings,
  BarChart3,
  Zap,
  Mail,
  Calendar,
  MessageSquare,
  Database,
  Cloud,
  X,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react'

interface IntegrationsClientProps {
  initialIntegrations: Integration[]
  initialStats: IntegrationStats
}

export default function IntegrationsClient({ initialIntegrations, initialStats }: IntegrationsClientProps) {
  const {
    integrations,
    stats,
    loading,
    createIntegration,
    deleteIntegration,
    connectIntegration,
    disconnectIntegration,
    syncIntegration
  } = useIntegrations(initialIntegrations, initialStats)

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'connected' | 'available'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    provider: '',
    description: '',
    category: ''
  })

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'connected' && integration.is_connected) ||
      (selectedFilter === 'available' && !integration.is_connected)
    return matchesSearch && matchesFilter
  })

  const handleCreateIntegration = async () => {
    if (!newIntegration.name.trim() || !newIntegration.provider.trim()) return
    await createIntegration(newIntegration)
    setShowCreateModal(false)
    setNewIntegration({ name: '', provider: '', description: '', category: '' })
  }

  const displayStats = [
    { label: 'Connected', value: stats.connected.toString(), change: 12.5, icon: <Plug className="w-5 h-5" /> },
    { label: 'Available', value: stats.disconnected.toString(), change: 8.3, icon: <Cloud className="w-5 h-5" /> },
    { label: 'API Calls', value: stats.totalApiCalls.toLocaleString(), change: 25.3, icon: <Database className="w-5 h-5" /> },
    { label: 'Data Synced', value: stats.totalDataSynced.toLocaleString(), change: 15.7, icon: <CheckCircle className="w-5 h-5" /> }
  ]

  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'marketing': return '📧'
      case 'productivity': return '📅'
      case 'communication': return '💬'
      case 'storage': return '📦'
      case 'automation': return '⚡'
      case 'development': return '🐙'
      case 'payments': return '💳'
      default: return '🔌'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 dark:from-cyan-950 dark:via-blue-950/30 dark:to-indigo-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Plug className="w-10 h-10 text-cyan-600" />
              Integrations
            </h1>
            <p className="text-muted-foreground">Connect your favorite tools and services</p>
          </div>
          <GradientButton from="cyan" to="blue" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Integration
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plug />} title="Connect New" description="Add integration" onClick={() => setShowCreateModal(true)} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Manage" onClick={() => console.log('Settings')} />
          <BentoQuickAction icon={<BarChart3 />} title="Usage Stats" description="Analytics" onClick={() => console.log('Stats')} />
          <BentoQuickAction icon={<Zap />} title="API Keys" description="Manage" onClick={() => console.log('Keys')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>
              All
            </PillButton>
            <PillButton variant={selectedFilter === 'connected' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('connected')}>
              Connected
            </PillButton>
            <PillButton variant={selectedFilter === 'available' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('available')}>
              Available
            </PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading && integrations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              </div>
            ) : filteredIntegrations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Plug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No integrations found</p>
                <ModernButton
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Integration
                </ModernButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIntegrations.map((integration) => (
                  <BentoCard key={integration.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-3 rounded-lg bg-muted">
                            <span className="text-2xl">{integration.icon || getCategoryIcon(integration.category)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{integration.name}</h3>
                            <p className="text-xs text-muted-foreground">{integration.category || integration.provider}</p>
                          </div>
                        </div>
                        {integration.is_connected && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-md text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Connected
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">{integration.description || 'No description'}</p>

                      {integration.is_connected && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">API Calls</p>
                            <p className="font-medium">{integration.api_calls_count}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Data Synced</p>
                            <p className="font-medium">{integration.data_synced_count}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t">
                        {integration.is_connected ? (
                          <>
                            <ModernButton variant="outline" size="sm" onClick={() => syncIntegration(integration.id)}>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Sync
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => disconnectIntegration(integration.id)}>
                              Disconnect
                            </ModernButton>
                          </>
                        ) : (
                          <ModernButton variant="primary" size="sm" onClick={() => connectIntegration(integration.id)}>
                            <Plug className="w-3 h-3 mr-1" />
                            Connect
                          </ModernButton>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => deleteIntegration(integration.id)}>
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
              <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Marketing</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{integrations.filter(i => i.category === 'Marketing').length} apps</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Productivity</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{integrations.filter(i => i.category === 'Productivity').length} apps</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Communication</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{integrations.filter(i => i.category === 'Communication').length} apps</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{integrations.filter(i => i.category === 'Storage').length} apps</span>
                </div>
              </div>
            </BentoCard>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Integrations" value={stats.total.toString()} change={12.5} />
                <MiniKPI label="Connected" value={stats.connected.toString()} change={8.3} />
                <MiniKPI label="API Calls" value={stats.totalApiCalls.toLocaleString()} change={25.3} />
                <MiniKPI label="Data Synced" value={stats.totalDataSynced.toLocaleString()} change={15.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Create Integration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Integration</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Stripe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Provider *</label>
                <input
                  type="text"
                  value={newIntegration.provider}
                  onChange={(e) => setNewIntegration({ ...newIntegration, provider: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., stripe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newIntegration.category}
                  onChange={(e) => setNewIntegration({ ...newIntegration, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select category</option>
                  <option value="Payments">Payments</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Communication">Communication</option>
                  <option value="Storage">Storage</option>
                  <option value="Development">Development</option>
                  <option value="Automation">Automation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newIntegration.description}
                  onChange={(e) => setNewIntegration({ ...newIntegration, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Brief description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </ModernButton>
                <GradientButton
                  from="cyan"
                  to="blue"
                  className="flex-1"
                  onClick={handleCreateIntegration}
                  disabled={loading || !newIntegration.name.trim() || !newIntegration.provider.trim()}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Integration'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
