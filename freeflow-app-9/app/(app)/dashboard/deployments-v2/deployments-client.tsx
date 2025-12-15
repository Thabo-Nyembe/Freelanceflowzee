'use client'

import { useState } from 'react'
import { useDeployments, type Deployment, type DeploymentEnvironment, type DeploymentStatus } from '@/lib/hooks/use-deployments'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { Rocket, CheckCircle, XCircle, Clock, Server, GitBranch, Globe, Activity, RotateCcw, Play } from 'lucide-react'

export default function DeploymentsClient({ initialDeployments }: { initialDeployments: Deployment[] }) {
  const [environmentFilter, setEnvironmentFilter] = useState<DeploymentEnvironment | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | 'all'>('all')
  const { deployments, loading, error } = useDeployments({ environment: environmentFilter, status: statusFilter })

  const displayDeployments = deployments.length > 0 ? deployments : initialDeployments

  const stats = [
    {
      label: 'Total Deploys',
      value: displayDeployments.length.toLocaleString(),
      change: 23.4,
      icon: <Rocket className="w-5 h-5" />
    },
    {
      label: 'Success Rate',
      value: displayDeployments.length > 0
        ? `${((displayDeployments.filter(d => d.status === 'success').length / displayDeployments.length) * 100).toFixed(1)}%`
        : '0%',
      change: 2.3,
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      label: 'Avg Duration',
      value: displayDeployments.length > 0
        ? `${(displayDeployments.reduce((sum, d) => sum + d.duration_seconds, 0) / displayDeployments.length / 60).toFixed(1)}m`
        : '0m',
      change: -15.7,
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: 'Active Servers',
      value: displayDeployments.reduce((sum, d) => sum + d.server_count, 0).toString(),
      change: 8.9,
      icon: <Server className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'rolled_back': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEnvironmentColor = (env: DeploymentEnvironment) => {
    switch (env) {
      case 'production': return 'bg-purple-100 text-purple-700'
      case 'staging': return 'bg-blue-100 text-blue-700'
      case 'development': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Rocket className="w-10 h-10 text-purple-600" />
              Deployments
            </h1>
            <p className="text-muted-foreground">Manage application deployments and releases</p>
          </div>
          <GradientButton from="purple" to="indigo" onClick={() => console.log('New deployment')}>
            <Rocket className="w-5 h-5 mr-2" />
            New Deployment
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={environmentFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setEnvironmentFilter('all')}>All</PillButton>
          <PillButton variant={environmentFilter === 'production' ? 'primary' : 'ghost'} onClick={() => setEnvironmentFilter('production')}>
            <Globe className="w-4 h-4 mr-2" />Production
          </PillButton>
          <PillButton variant={environmentFilter === 'staging' ? 'primary' : 'ghost'} onClick={() => setEnvironmentFilter('staging')}>
            <Server className="w-4 h-4 mr-2" />Staging
          </PillButton>
          <PillButton variant={environmentFilter === 'development' ? 'primary' : 'ghost'} onClick={() => setEnvironmentFilter('development')}>
            <Activity className="w-4 h-4 mr-2" />Development
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayDeployments.map((deployment) => (
              <BentoCard key={deployment.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{deployment.deployment_name}</h3>
                    <p className="text-sm text-muted-foreground">{deployment.version}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(deployment.status)}`}>
                        {deployment.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEnvironmentColor(deployment.environment)}`}>
                        {deployment.environment}
                      </span>
                    </div>
                    {deployment.branch && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <GitBranch className="w-3 h-3" />
                        <span>{deployment.branch}</span>
                        {deployment.commit_hash && <span className="font-mono">• {deployment.commit_hash}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-semibold">{deployment.started_at ? new Date(deployment.started_at).toLocaleTimeString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{deployment.duration_seconds > 0 ? formatDuration(deployment.duration_seconds) : 'Running...'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Servers</p>
                    <p className="font-semibold">{deployment.server_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Traffic</p>
                    <p className="font-semibold">{deployment.traffic_percentage}%</p>
                  </div>
                </div>

                {deployment.traffic_percentage > 0 && deployment.traffic_percentage < 100 && (
                  <div className="mb-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${deployment.traffic_percentage}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t">
                  <ModernButton variant="outline" size="sm">View Logs</ModernButton>
                  {deployment.status === 'success' && deployment.environment === 'production' && (
                    <ModernButton variant="outline" size="sm">
                      <RotateCcw className="w-3 h-3 mr-1" />Rollback
                    </ModernButton>
                  )}
                  {deployment.status === 'failed' && (
                    <ModernButton variant="primary" size="sm">
                      <Play className="w-3 h-3 mr-1" />Retry
                    </ModernButton>
                  )}
                </div>
              </BentoCard>
            ))}

            {displayDeployments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Deployments</h3>
                <p className="text-muted-foreground">Deploy your first application</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <MiniKPI label="Total Deploys" value={displayDeployments.length.toString()} change={23.4} />
          </div>
        </div>
      </div>
    </div>
  )
}
