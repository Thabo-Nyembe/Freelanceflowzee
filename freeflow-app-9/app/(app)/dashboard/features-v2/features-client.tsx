'use client'

import { useState } from 'react'
import { useFeatures, type Feature, type FeatureStatus, type RolloutType } from '@/lib/hooks/use-features'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed, ProgressCard } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import {
  Flag,
  ToggleLeft,
  ToggleRight,
  Users,
  TrendingUp,
  Settings,
  Target,
  Eye,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react'

export default function FeaturesClient({ initialFeatures }: { initialFeatures: Feature[] }) {
  const [selectedEnvironment, setSelectedEnvironment] = useState<'production' | 'staging' | 'development' | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | 'all'>('all')
  const { features, loading, error } = useFeatures({ status: statusFilter, environment: selectedEnvironment })

  const displayFeatures = features.length > 0 ? features : initialFeatures

  const stats = [
    {
      label: 'Active Features',
      value: displayFeatures.filter(f => f.status === 'enabled').length.toString(),
      change: 22.4,
      icon: <Flag className="w-5 h-5" />
    },
    {
      label: 'Rollout Coverage',
      value: displayFeatures.length > 0
        ? `${((displayFeatures.filter(f => f.rollout_percentage > 0).length / displayFeatures.length) * 100).toFixed(0)}%`
        : '0%',
      change: 35.2,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'A/B Tests Running',
      value: displayFeatures.filter(f => f.is_ab_test).length.toString(),
      change: 18.7,
      icon: <Target className="w-5 h-5" />
    },
    {
      label: 'Success Rate',
      value: displayFeatures.length > 0 && displayFeatures.some(f => f.total_requests > 0)
        ? `${(displayFeatures.reduce((sum, f) => sum + f.success_rate, 0) / displayFeatures.filter(f => f.total_requests > 0).length).toFixed(0)}%`
        : '0%',
      change: 8.3,
      icon: <CheckCircle className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-700'
      case 'rollout': return 'bg-blue-100 text-blue-700'
      case 'testing': return 'bg-yellow-100 text-yellow-700'
      case 'disabled': return 'bg-gray-100 text-gray-700'
      case 'archived': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: FeatureStatus) => {
    switch (status) {
      case 'enabled': return <ToggleRight className="w-3 h-3" />
      case 'rollout': return <TrendingUp className="w-3 h-3" />
      case 'testing': return <Target className="w-3 h-3" />
      case 'disabled': return <ToggleLeft className="w-3 h-3" />
      default: return <Flag className="w-3 h-3" />
    }
  }

  const getColorForFeature = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-amber-500',
      'from-teal-500 to-cyan-500'
    ]
    return colors[index % colors.length]
  }

  const recentActivity = displayFeatures.slice(0, 4).map((f) => ({
    icon: getStatusIcon(f.status),
    title: f.status === 'enabled' ? 'Feature enabled' : f.status === 'rollout' ? 'Rollout started' : 'Status changed',
    description: f.feature_name,
    time: new Date(f.updated_at).toLocaleDateString(),
    status: (f.status === 'enabled' ? 'success' : f.status === 'disabled' ? 'error' : 'info') as const
  }))

  const maxActiveUsers = Math.max(...displayFeatures.map(f => f.active_users), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Flag className="w-10 h-10 text-cyan-600" />
              Feature Flags
            </h1>
            <p className="text-muted-foreground">Manage feature rollouts and A/B experiments</p>
          </div>
          <GradientButton from="cyan" to="teal" onClick={() => console.log('New feature')}>
            <Flag className="w-5 h-5 mr-2" />
            Create Feature
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Flag />} title="Features" description="All flags" onClick={() => setStatusFilter('all')} />
          <BentoQuickAction icon={<Target />} title="A/B Tests" description="Experiments" onClick={() => console.log('Tests')} />
          <BentoQuickAction icon={<Users />} title="Segments" description="User groups" onClick={() => console.log('Segments')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <PillButton variant={selectedEnvironment === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('all')}>
            All Environments
          </PillButton>
          <PillButton variant={selectedEnvironment === 'production' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('production')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Production
          </PillButton>
          <PillButton variant={selectedEnvironment === 'staging' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('staging')}>
            Staging
          </PillButton>
          <PillButton variant={selectedEnvironment === 'development' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('development')}>
            Development
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayFeatures.map((feature, index) => {
              const activePercent = feature.target_users > 0 ? (feature.active_users / maxActiveUsers) * 100 : 0

              return (
                <BentoCard key={feature.id} className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{feature.feature_name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(feature.status)}`}>
                            {getStatusIcon(feature.status)}
                            {feature.status}
                          </span>
                        </div>
                        <code className="text-xs font-mono text-muted-foreground">{feature.feature_key}</code>
                        {feature.description && (
                          <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                        )}
                      </div>
                      {feature.status !== 'disabled' && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-600">{feature.rollout_percentage}%</p>
                          <p className="text-xs text-muted-foreground">Rollout</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Target Users</p>
                        <p className="font-semibold">{feature.target_users.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active Users</p>
                        <p className="font-semibold">{feature.active_users.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-semibold">{feature.success_rate.toFixed(1)}%</p>
                      </div>
                    </div>

                    {feature.status !== 'disabled' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Coverage</span>
                          <span className="font-semibold">{feature.rollout_percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getColorForFeature(index)}`}
                            style={{ width: `${feature.rollout_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('View', feature.id)}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </ModernButton>
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', feature.id)}>
                        Edit
                      </ModernButton>
                      {feature.is_ab_test && (
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('A/B', feature.id)}>
                          <Target className="w-3 h-3 mr-1" />
                          A/B Test
                        </ModernButton>
                      )}
                    </div>
                  </div>
                </BentoCard>
              )
            })}

            {displayFeatures.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Features</h3>
                <p className="text-muted-foreground">Create your first feature flag</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Feature Rollout Goal"
              value={displayFeatures.filter(f => f.status === 'enabled').length}
              target={displayFeatures.length}
              label="Features"
              color="from-cyan-500 to-teal-500"
            />

            <ProgressCard
              title="Active A/B Tests"
              value={displayFeatures.filter(f => f.is_ab_test).length}
              target={20}
              label="Tests"
              color="from-purple-500 to-pink-500"
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Metrics</h3>
              <div className="space-y-3">
                <MiniKPI
                  label="Adoption Rate"
                  value={displayFeatures.length > 0
                    ? `${((displayFeatures.filter(f => f.is_enabled).length / displayFeatures.length) * 100).toFixed(0)}%`
                    : '0%'}
                  change={35.2}
                />
                <MiniKPI label="A/B Tests" value={displayFeatures.filter(f => f.is_ab_test).length.toString()} change={18.7} />
                <MiniKPI label="Total Requests" value={displayFeatures.reduce((sum, f) => sum + f.total_requests, 0).toLocaleString()} change={42.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
