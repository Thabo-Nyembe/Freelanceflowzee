"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Link2,
  Database,
  Cloud,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Play,
  Pause,
  TrendingUp,
  Server,
  Zap,
  Clock
} from 'lucide-react'

/**
 * Connectors V2 - Groundbreaking Data Connectors
 * Showcases data sources, ETL pipelines, and sync operations
 */
export default function ConnectorsV2() {
  const [selectedType, setSelectedType] = useState<'all' | 'database' | 'cloud' | 'api'>('all')

  const stats = [
    { label: 'Active Connectors', value: '24', change: 28.4, icon: <Link2 className="w-5 h-5" /> },
    { label: 'Data Synced', value: '2.4TB', change: 42.1, icon: <Database className="w-5 h-5" /> },
    { label: 'Success Rate', value: '98.7%', change: 5.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Sync Frequency', value: '15min', change: -18.7, icon: <Clock className="w-5 h-5" /> }
  ]

  const connectors = [
    {
      id: '1',
      name: 'PostgreSQL Production',
      type: 'database',
      source: 'PostgreSQL',
      status: 'syncing',
      lastSync: '5 minutes ago',
      nextSync: '10 minutes',
      dataVolume: 847000000,
      recordsProcessed: 2847000,
      frequency: '15min',
      health: 98,
      color: 'from-blue-500 to-cyan-500',
      icon: '🐘'
    },
    {
      id: '2',
      name: 'AWS S3 Storage',
      type: 'cloud',
      source: 'Amazon S3',
      status: 'active',
      lastSync: '2 hours ago',
      nextSync: '2 hours',
      dataVolume: 1240000000000,
      recordsProcessed: 124000,
      frequency: '4h',
      health: 100,
      color: 'from-orange-500 to-red-500',
      icon: '☁️'
    },
    {
      id: '3',
      name: 'Salesforce CRM',
      type: 'api',
      source: 'Salesforce API',
      status: 'active',
      lastSync: '30 minutes ago',
      nextSync: '30 minutes',
      dataVolume: 456000000,
      recordsProcessed: 89200,
      frequency: '1h',
      health: 95,
      color: 'from-blue-400 to-sky-500',
      icon: '📊'
    },
    {
      id: '4',
      name: 'MySQL Analytics',
      type: 'database',
      source: 'MySQL',
      status: 'error',
      lastSync: '3 hours ago',
      nextSync: 'Paused',
      dataVolume: 234000000,
      recordsProcessed: 67800,
      frequency: '30min',
      health: 42,
      color: 'from-green-500 to-emerald-500',
      icon: '🐬'
    },
    {
      id: '5',
      name: 'Google Cloud Storage',
      type: 'cloud',
      source: 'GCS',
      status: 'active',
      lastSync: '1 hour ago',
      nextSync: '1 hour',
      dataVolume: 678000000000,
      recordsProcessed: 45600,
      frequency: '2h',
      health: 97,
      color: 'from-green-400 to-green-600',
      icon: '☁️'
    },
    {
      id: '6',
      name: 'Stripe Payments',
      type: 'api',
      source: 'Stripe API',
      status: 'active',
      lastSync: '15 minutes ago',
      nextSync: '15 minutes',
      dataVolume: 124000000,
      recordsProcessed: 24700,
      frequency: '30min',
      health: 99,
      color: 'from-indigo-500 to-purple-500',
      icon: '💳'
    }
  ]

  const syncHistory = [
    {
      id: '1',
      connector: 'PostgreSQL Production',
      timestamp: '2024-02-12 14:32:45',
      status: 'success',
      records: 2847,
      duration: 45,
      dataSize: 124
    },
    {
      id: '2',
      connector: 'AWS S3 Storage',
      timestamp: '2024-02-12 12:15:30',
      status: 'success',
      records: 124,
      duration: 120,
      dataSize: 2400
    },
    {
      id: '3',
      connector: 'Salesforce CRM',
      timestamp: '2024-02-12 14:00:15',
      status: 'success',
      records: 892,
      duration: 38,
      dataSize: 67
    },
    {
      id: '4',
      connector: 'MySQL Analytics',
      timestamp: '2024-02-12 11:45:00',
      status: 'failed',
      records: 0,
      duration: 5,
      dataSize: 0
    }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Sync completed', description: 'PostgreSQL - 2,847 records synced', time: '5 minutes ago', status: 'success' as const },
    { icon: <RefreshCw className="w-5 h-5" />, title: 'Sync started', description: 'AWS S3 - Full data refresh', time: '2 hours ago', status: 'info' as const },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Sync failed', description: 'MySQL Analytics - Connection timeout', time: '3 hours ago', status: 'error' as const },
    { icon: <Zap className="w-5 h-5" />, title: 'Connector added', description: 'Google Cloud Storage connected', time: '1 day ago', status: 'success' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing': return 'bg-blue-100 text-blue-700'
      case 'active': return 'bg-green-100 text-green-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'success': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      default: return <Link2 className="w-4 h-4" />
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600'
    if (health >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1099511627776) return `${(bytes / 1099511627776).toFixed(1)}TB`
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)}GB`
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)}MB`
    return `${(bytes / 1024).toFixed(0)}KB`
  }

  const maxDataVolume = Math.max(...connectors.map(c => c.dataVolume))

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Link2 className="w-10 h-10 text-teal-600" />
              Data Connectors
            </h1>
            <p className="text-muted-foreground">Manage data sources and sync operations</p>
          </div>
          <GradientButton from="teal" to="cyan" onClick={() => console.log('New connector')}>
            <Link2 className="w-5 h-5 mr-2" />
            New Connector
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Database />} title="Databases" description="SQL sources" onClick={() => console.log('Databases')} />
          <BentoQuickAction icon={<Cloud />} title="Cloud" description="Storage" onClick={() => console.log('Cloud')} />
          <BentoQuickAction icon={<Server />} title="APIs" description="External data" onClick={() => console.log('APIs')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedType === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedType('all')}>
            All Connectors
          </PillButton>
          <PillButton variant={selectedType === 'database' ? 'primary' : 'ghost'} onClick={() => setSelectedType('database')}>
            <Database className="w-4 h-4 mr-2" />
            Databases
          </PillButton>
          <PillButton variant={selectedType === 'cloud' ? 'primary' : 'ghost'} onClick={() => setSelectedType('cloud')}>
            <Cloud className="w-4 h-4 mr-2" />
            Cloud Storage
          </PillButton>
          <PillButton variant={selectedType === 'api' ? 'primary' : 'ghost'} onClick={() => setSelectedType('api')}>
            <Zap className="w-4 h-4 mr-2" />
            APIs
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Active Connectors</h3>
              <div className="space-y-3">
                {connectors.map((connector) => {
                  const volumePercent = (connector.dataVolume / maxDataVolume) * 100

                  return (
                    <div key={connector.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${connector.color} flex items-center justify-center text-2xl`}>
                              {connector.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{connector.name}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(connector.status)}`}>
                                  {getStatusIcon(connector.status)}
                                  {connector.status}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-md bg-muted">
                                  {connector.source}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getHealthColor(connector.health)}`}>
                              {connector.health}%
                            </p>
                            <p className="text-xs text-muted-foreground">Health</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Data Volume</p>
                            <p className="font-semibold">{formatBytes(connector.dataVolume)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Records</p>
                            <p className="font-semibold">{(connector.recordsProcessed / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Sync</p>
                            <p className="font-semibold">{connector.lastSync}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Frequency</p>
                            <p className="font-semibold">{connector.frequency}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Sync Progress</span>
                            <span className="font-semibold">Next: {connector.nextSync}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${connector.color}`}
                              style={{ width: `${connector.health}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          {connector.status === 'syncing' ? (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Pause', connector.id)}>
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </ModernButton>
                          ) : connector.status === 'error' ? (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Retry', connector.id)}>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </ModernButton>
                          ) : (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Sync', connector.id)}>
                              <Play className="w-3 h-3 mr-1" />
                              Sync Now
                            </ModernButton>
                          )}
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Configure', connector.id)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm" onClick={() => console.log('View', connector.id)}>
                            View Logs
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Sync History</h3>
              <div className="space-y-2">
                {syncHistory.map((sync) => (
                  <div key={sync.id} className="p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(sync.status)}`}>
                            {sync.status}
                          </span>
                          <span className="font-semibold text-sm">{sync.connector}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sync.timestamp}
                          </span>
                          <span>{sync.records.toLocaleString()} records</span>
                          <span>{sync.duration}s</span>
                          <span>{sync.dataSize}MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Data Sync Goal"
              current={2400}
              goal={5000}
              unit="GB"
              icon={<Database className="w-5 h-5" />}
            />

            <ProgressCard
              title="Connector Health"
              current={87}
              goal={95}
              unit="%"
              icon={<CheckCircle className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sync Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Data" value="2.4TB" change={42.1} />
                <MiniKPI label="Avg Sync Time" value="45s" change={-15.3} />
                <MiniKPI label="Success Rate" value="98.7%" change={5.3} />
                <MiniKPI label="Active Sources" value="24" change={28.4} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Sync All')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Import')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Export')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
