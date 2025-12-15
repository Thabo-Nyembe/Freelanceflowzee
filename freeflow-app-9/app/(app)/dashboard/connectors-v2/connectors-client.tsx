'use client'

import { useState } from 'react'
import { useConnectors, type Connector, type ConnectorType, type ConnectorStatus } from '@/lib/hooks/use-connectors'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { Link2, Database, Cloud, CheckCircle, AlertCircle, RefreshCw, Settings, Play, Pause } from 'lucide-react'

export default function ConnectorsClient({ initialConnectors }: { initialConnectors: Connector[] }) {
  const [connectorTypeFilter, setConnectorTypeFilter] = useState<ConnectorType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ConnectorStatus | 'all'>('all')
  const { connectors, loading, error } = useConnectors({ connectorType: connectorTypeFilter, status: statusFilter })

  const displayConnectors = connectors.length > 0 ? connectors : initialConnectors

  const stats = [
    {
      label: 'Active Connectors',
      value: displayConnectors.filter(c => c.is_active).length.toString(),
      change: 28.4,
      icon: <Link2 className="w-5 h-5" />
    },
    {
      label: 'Total Requests',
      value: displayConnectors.reduce((sum, c) => sum + c.request_count, 0).toLocaleString(),
      change: 42.1,
      icon: <Database className="w-5 h-5" />
    },
    {
      label: 'Success Rate',
      value: displayConnectors.length > 0
        ? `${(displayConnectors.reduce((sum, c) => sum + (c.success_rate || 0), 0) / displayConnectors.length).toFixed(1)}%`
        : '0%',
      change: 5.3,
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      label: 'Avg Response',
      value: displayConnectors.length > 0
        ? `${Math.round(displayConnectors.reduce((sum, c) => sum + (c.avg_response_time || 0), 0) / displayConnectors.length)}ms`
        : '0ms',
      change: -18.7,
      icon: <RefreshCw className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: ConnectorStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'testing': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getHealthColor = (health?: number) => {
    if (!health) return 'text-gray-600'
    if (health >= 90) return 'text-green-600'
    if (health >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const recentActivity = displayConnectors.slice(0, 4).map((c, idx) => ({
    icon: <Link2 className="w-5 h-5" />,
    title: c.is_connected ? 'Connected' : 'Disconnected',
    description: c.connector_name,
    time: new Date(c.updated_at).toLocaleDateString(),
    status: c.is_connected ? 'success' as const : 'error' as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Link2 className="w-10 h-10 text-teal-600" />
              Data Connectors
            </h1>
            <p className="text-muted-foreground">Manage data sources and integrations</p>
          </div>
          <GradientButton from="teal" to="cyan" onClick={() => console.log('New connector')}>
            <Link2 className="w-5 h-5 mr-2" />
            New Connector
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={connectorTypeFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setConnectorTypeFilter('all')}>
            All Types
          </PillButton>
          <PillButton variant={connectorTypeFilter === 'api' ? 'primary' : 'ghost'} onClick={() => setConnectorTypeFilter('api')}>
            API
          </PillButton>
          <PillButton variant={connectorTypeFilter === 'database' ? 'primary' : 'ghost'} onClick={() => setConnectorTypeFilter('database')}>
            Database
          </PillButton>
          <PillButton variant={connectorTypeFilter === 'webhook' ? 'primary' : 'ghost'} onClick={() => setConnectorTypeFilter('webhook')}>
            Webhook
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {displayConnectors.map((connector) => (
                <BentoCard key={connector.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white">
                        <Link2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{connector.connector_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(connector.status)}`}>
                            {connector.status}
                          </span>
                          <span className="text-xs text-muted-foreground">{connector.provider_name}</span>
                        </div>
                      </div>
                    </div>
                    {connector.uptime_percentage !== undefined && (
                      <p className={`text-2xl font-bold ${getHealthColor(connector.uptime_percentage)}`}>
                        {connector.uptime_percentage.toFixed(0)}%
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-xs mb-3">
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-semibold">{(connector.request_count / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-semibold">{connector.success_rate?.toFixed(1) || 0}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Response</p>
                      <p className="font-semibold">{connector.avg_response_time || 0}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Errors</p>
                      <p className="font-semibold text-red-600">{connector.error_count}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    {connector.is_active ? (
                      <ModernButton variant="outline" size="sm">
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </ModernButton>
                    ) : (
                      <ModernButton variant="outline" size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </ModernButton>
                    )}
                    <ModernButton variant="outline" size="sm">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </ModernButton>
                  </div>
                </BentoCard>
              ))}

              {displayConnectors.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Connectors</h3>
                  <p className="text-gray-600">Add your first data connector</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Requests" value={displayConnectors.reduce((sum, c) => sum + c.request_count, 0).toLocaleString()} change={42.1} />
                <MiniKPI label="Success Rate" value={`${displayConnectors.length > 0 ? (displayConnectors.reduce((sum, c) => sum + (c.success_rate || 0), 0) / displayConnectors.length).toFixed(1) : 0}%`} change={5.3} />
                <MiniKPI label="Active Connectors" value={displayConnectors.filter(c => c.is_active).length.toString()} change={28.4} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
