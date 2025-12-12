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
  Flag,
  ToggleLeft,
  ToggleRight,
  Users,
  TrendingUp,
  Settings,
  Code,
  Eye,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'

/**
 * Features V2 - Groundbreaking Feature Flag Management
 * Showcases feature flags, rollout strategies, and A/B testing
 */
export default function FeaturesV2() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<'production' | 'staging' | 'development'>('production')

  const stats = [
    { label: 'Active Features', value: '127', change: 22.4, icon: <Flag className="w-5 h-5" /> },
    { label: 'Rollout Coverage', value: '84%', change: 35.2, icon: <Users className="w-5 h-5" /> },
    { label: 'A/B Tests Running', value: '14', change: 18.7, icon: <Target className="w-5 h-5" /> },
    { label: 'Success Rate', value: '96%', change: 8.3, icon: <CheckCircle className="w-5 h-5" /> }
  ]

  const features = [
    {
      id: '1',
      name: 'New Dashboard UI',
      key: 'dashboard_v2',
      status: 'enabled',
      environment: ['production', 'staging', 'development'],
      rollout: 100,
      targetUsers: 124700,
      activeUsers: 124700,
      created: '2024-01-15',
      type: 'gradual',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'AI Content Assistant',
      key: 'ai_assistant',
      status: 'rollout',
      environment: ['production', 'staging'],
      rollout: 45,
      targetUsers: 84700,
      activeUsers: 38115,
      created: '2024-02-01',
      type: 'percentage',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Advanced Analytics',
      key: 'analytics_pro',
      status: 'testing',
      environment: ['staging', 'development'],
      rollout: 100,
      targetUsers: 2400,
      activeUsers: 2400,
      created: '2024-02-10',
      type: 'targeted',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'Mobile Push Notifications',
      key: 'push_notifications',
      status: 'enabled',
      environment: ['production', 'staging'],
      rollout: 100,
      targetUsers: 67200,
      activeUsers: 67200,
      created: '2024-01-20',
      type: 'full',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Dark Mode Theme',
      key: 'dark_mode',
      status: 'disabled',
      environment: ['development'],
      rollout: 0,
      targetUsers: 0,
      activeUsers: 0,
      created: '2024-02-15',
      type: 'off',
      color: 'from-gray-500 to-slate-500'
    }
  ]

  const abTests = [
    {
      id: '1',
      name: 'Button Color Test',
      feature: 'checkout_flow',
      variants: ['Blue CTA', 'Green CTA'],
      traffic: [50, 50],
      conversion: [12.4, 14.7],
      winner: 'Green CTA',
      status: 'completed',
      sampleSize: 8900
    },
    {
      id: '2',
      name: 'Pricing Page Layout',
      feature: 'pricing_v2',
      variants: ['Grid Layout', 'List Layout'],
      traffic: [50, 50],
      conversion: [8.2, 7.9],
      winner: 'pending',
      status: 'running',
      sampleSize: 4200
    },
    {
      id: '3',
      name: 'Onboarding Flow',
      feature: 'user_onboarding',
      variants: ['3-Step', '5-Step'],
      traffic: [50, 50],
      conversion: [42.3, 38.9],
      winner: '3-Step',
      status: 'completed',
      sampleSize: 12400
    }
  ]

  const rolloutStrategies = [
    {
      name: 'Gradual Rollout',
      features: 12,
      description: 'Slowly increase % over time',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Targeted Release',
      features: 8,
      description: 'Specific user segments',
      icon: <Target className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'A/B Testing',
      features: 14,
      description: 'Compare variant performance',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Full Release',
      features: 93,
      description: '100% of users',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Feature enabled', description: 'New Dashboard UI rolled out to 100%', time: '2 hours ago', status: 'success' as const },
    { icon: <Flag className="w-5 h-5" />, title: 'Rollout started', description: 'AI Assistant at 45% coverage', time: '1 day ago', status: 'info' as const },
    { icon: <Target className="w-5 h-5" />, title: 'A/B test completed', description: 'Button Color Test - Green CTA won', time: '2 days ago', status: 'success' as const },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Rollback triggered', description: 'Dark Mode disabled due to errors', time: '1 week ago', status: 'warning' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-700'
      case 'rollout': return 'bg-blue-100 text-blue-700'
      case 'testing': return 'bg-yellow-100 text-yellow-700'
      case 'disabled': return 'bg-gray-100 text-gray-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'running': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled': return <ToggleRight className="w-3 h-3" />
      case 'rollout': return <TrendingUp className="w-3 h-3" />
      case 'testing': return <Target className="w-3 h-3" />
      case 'disabled': return <ToggleLeft className="w-3 h-3" />
      default: return <Flag className="w-3 h-3" />
    }
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-green-100 text-green-700'
      case 'staging': return 'bg-yellow-100 text-yellow-700'
      case 'development': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxActiveUsers = Math.max(...features.map(f => f.activeUsers))

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
          <BentoQuickAction icon={<Flag />} title="Features" description="All flags" onClick={() => console.log('Features')} />
          <BentoQuickAction icon={<Target />} title="A/B Tests" description="Experiments" onClick={() => console.log('Tests')} />
          <BentoQuickAction icon={<Users />} title="Segments" description="User groups" onClick={() => console.log('Segments')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
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
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Feature Flags</h3>
              <div className="space-y-3">
                {features.map((feature) => {
                  const activePercent = feature.targetUsers > 0 ? (feature.activeUsers / maxActiveUsers) * 100 : 0

                  return (
                    <div key={feature.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{feature.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(feature.status)}`}>
                                {getStatusIcon(feature.status)}
                                {feature.status}
                              </span>
                            </div>
                            <code className="text-xs font-mono text-muted-foreground">{feature.key}</code>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {feature.environment.map((env) => (
                                <span key={env} className={`text-xs px-2 py-1 rounded-md ${getEnvironmentColor(env)}`}>
                                  {env}
                                </span>
                              ))}
                            </div>
                          </div>
                          {feature.status !== 'disabled' && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-cyan-600">{feature.rollout}%</p>
                              <p className="text-xs text-muted-foreground">Rollout</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Target Users</p>
                            <p className="font-semibold">{feature.targetUsers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Active Users</p>
                            <p className="font-semibold">{feature.activeUsers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p className="font-semibold">{feature.created}</p>
                          </div>
                        </div>

                        {feature.status !== 'disabled' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Coverage</span>
                              <span className="font-semibold">{feature.rollout}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${feature.color}`}
                                style={{ width: `${feature.rollout}%` }}
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
                          {feature.status === 'disabled' ? (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Enable', feature.id)}>
                              <ToggleRight className="w-3 h-3 mr-1" />
                              Enable
                            </ModernButton>
                          ) : (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Disable', feature.id)}>
                              <ToggleLeft className="w-3 h-3 mr-1" />
                              Disable
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">A/B Tests</h3>
              <div className="space-y-3">
                {abTests.map((test) => (
                  <div key={test.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{test.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(test.status)}`}>
                              {test.status}
                            </span>
                          </div>
                          <code className="text-xs font-mono text-muted-foreground">{test.feature}</code>
                        </div>
                        {test.winner !== 'pending' && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">{test.winner}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Winner</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {test.variants.map((variant, index) => (
                          <div key={variant}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-medium">{variant}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">{test.traffic[index]}% traffic</span>
                                <span className={`font-semibold ${variant === test.winner ? 'text-green-600' : ''}`}>
                                  {test.conversion[index]}% conversion
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${variant === test.winner ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gray-400'}`}
                                style={{ width: `${test.conversion[index] * 5}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground pt-2 border-t">
                        Sample size: {test.sampleSize.toLocaleString()} users
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Rollout Strategies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rolloutStrategies.map((strategy) => (
                  <div key={strategy.name} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${strategy.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {strategy.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{strategy.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{strategy.description}</p>
                        <p className="text-sm font-semibold">{strategy.features} features</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Feature Rollout Goal"
              current={84}
              goal={95}
              unit="%"
              icon={<Flag className="w-5 h-5" />}
            />

            <ProgressCard
              title="Active A/B Tests"
              current={14}
              goal={20}
              unit=""
              icon={<Target className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Adoption Rate" value="84%" change={35.2} />
                <MiniKPI label="Avg Rollout Time" value="3.2 days" change={-12.5} />
                <MiniKPI label="Rollback Rate" value="2.4%" change={-8.7} />
                <MiniKPI label="Test Confidence" value="96%" change={5.3} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('New test')}>
                  <Target className="w-4 h-4 mr-2" />
                  Create A/B Test
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Segments')}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Segments
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
