'use client'

import { useState } from 'react'
import { useWebhooks, useWebhookEventTypes, Webhook, WebhookEventType } from '@/lib/hooks/use-webhooks'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  RankingList,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Webhook as WebhookIcon,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Shield,
  Settings,
  Code,
  Globe,
  Activity,
  TrendingUp,
  Play,
  Pause,
  Plus,
  Trash2
} from 'lucide-react'

interface WebhooksClientProps {
  initialWebhooks: Webhook[]
  initialEventTypes: WebhookEventType[]
  initialStats: {
    total: number
    active: number
    paused: number
    failed: number
    totalDeliveries: number
    successfulDeliveries: number
    avgSuccessRate: number
    avgResponseTime: number
  }
}

export default function WebhooksClient({
  initialWebhooks,
  initialEventTypes,
  initialStats
}: WebhooksClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'failed' | 'paused'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    webhooks,
    loading,
    stats,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleStatus,
    testWebhook
  } = useWebhooks(initialWebhooks, initialStats)

  const { eventTypes } = useWebhookEventTypes(initialEventTypes)

  const filteredWebhooks = webhooks.filter(w => {
    if (selectedStatus === 'all') return true
    return w.status === selectedStatus
  })

  const statItems = [
    { label: 'Active Webhooks', value: stats.active.toString(), change: 15.3, icon: <WebhookIcon className="w-5 h-5" /> },
    { label: 'Events Delivered', value: stats.totalDeliveries > 1000 ? `${(stats.totalDeliveries / 1000).toFixed(1)}K` : stats.totalDeliveries.toString(), change: 42.1, icon: <Send className="w-5 h-5" /> },
    { label: 'Success Rate', value: `${stats.avgSuccessRate.toFixed(1)}%`, change: 8.7, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Latency', value: `${stats.avgResponseTime.toFixed(0)}ms`, change: -12.5, icon: <Clock className="w-5 h-5" /> }
  ]

  const topEvents = eventTypes.slice(0, 5).map((et, idx) => ({
    rank: idx + 1,
    name: et.name,
    avatar: ['📊', '💰', '👤', '🔔', '🛒'][idx] || '📌',
    value: et.total_deliveries > 1000 ? `${(et.total_deliveries / 1000).toFixed(1)}K` : et.total_deliveries.toString(),
    change: 20 + Math.random() * 30
  }))

  const recentActivity = webhooks.slice(0, 4).map(w => ({
    icon: w.status === 'active' ? <CheckCircle className="w-5 h-5" /> : w.status === 'failed' ? <AlertCircle className="w-5 h-5" /> : <Pause className="w-5 h-5" />,
    title: w.status === 'active' ? 'Webhook active' : w.status === 'failed' ? 'Webhook failed' : 'Webhook paused',
    description: w.name,
    time: w.last_delivery_at ? new Date(w.last_delivery_at).toLocaleString() : 'No deliveries',
    status: (w.status === 'active' ? 'success' : w.status === 'failed' ? 'error' : 'warning') as 'success' | 'error' | 'warning'
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'success': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const maxDeliveries = Math.max(...webhooks.map(w => w.total_deliveries), 1)
  const maxEventDeliveries = Math.max(...eventTypes.map(e => e.total_deliveries), 1)

  const handleCreateWebhook = async () => {
    const result = await createWebhook({
      name: 'New Webhook',
      url: 'https://example.com/webhook',
      events: ['user.created'],
      status: 'active'
    })
    if (result.success) {
      setShowCreateModal(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: Webhook['status']) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    await toggleStatus(id, newStatus)
  }

  const handleTestWebhook = async (id: string) => {
    await testWebhook(id)
  }

  const handleDeleteWebhook = async (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      await deleteWebhook(id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <WebhookIcon className="w-10 h-10 text-emerald-600" />
              Webhooks
            </h1>
            <p className="text-muted-foreground">Configure and monitor webhook event delivery</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={handleCreateWebhook} disabled={loading}>
            <Plus className="w-5 h-5 mr-2" />
            Create Webhook
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<WebhookIcon />} title="Endpoints" description="Manage webhooks" onClick={() => console.log('Endpoints')} />
          <BentoQuickAction icon={<Zap />} title="Events" description="Event types" onClick={() => console.log('Events')} />
          <BentoQuickAction icon={<Activity />} title="Logs" description="Delivery logs" onClick={() => console.log('Logs')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Webhooks ({stats.total})
          </PillButton>
          <PillButton variant={selectedStatus === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('active')}>
            <Play className="w-4 h-4 mr-2" />
            Active ({stats.active})
          </PillButton>
          <PillButton variant={selectedStatus === 'failed' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('failed')}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed ({stats.failed})
          </PillButton>
          <PillButton variant={selectedStatus === 'paused' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('paused')}>
            <Pause className="w-4 h-4 mr-2" />
            Paused ({stats.paused})
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Webhook Endpoints</h3>
              {filteredWebhooks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <WebhookIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No webhooks found</p>
                  <p className="text-sm">Create your first webhook to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWebhooks.map((webhook) => {
                    const deliveryPercent = (webhook.total_deliveries / maxDeliveries) * 100

                    return (
                      <div key={webhook.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{webhook.name}</h4>
                                <span className="text-xs text-muted-foreground">{webhook.webhook_code}</span>
                                <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(webhook.status)}`}>
                                  {getStatusIcon(webhook.status)}
                                  {webhook.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-3 h-3 text-muted-foreground" />
                                <code className="text-xs font-mono text-muted-foreground">{webhook.url}</code>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {webhook.events.map((event) => (
                                  <span key={event} className="text-xs px-2 py-1 rounded-md bg-muted">
                                    {event}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Deliveries</p>
                              <p className="font-semibold">{webhook.total_deliveries.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Success Rate</p>
                              <p className={`font-semibold ${webhook.success_rate >= 98 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {webhook.success_rate.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Delivery</p>
                              <p className="font-semibold">{webhook.last_delivery_at ? new Date(webhook.last_delivery_at).toLocaleDateString() : 'Never'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="font-semibold">{new Date(webhook.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-600"
                              style={{ width: `${deliveryPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs">
                              <Shield className="w-3 h-3 text-muted-foreground" />
                              <code className="font-mono text-muted-foreground">
                                {webhook.secret ? `${webhook.secret.substring(0, 20)}...` : 'No secret'}
                              </code>
                            </div>
                            <div className="flex gap-2">
                              <ModernButton variant="outline" size="sm" onClick={() => handleTestWebhook(webhook.id)} disabled={loading}>
                                <Send className="w-3 h-3 mr-1" />
                                Test
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', webhook.id)}>
                                Edit
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => handleToggleStatus(webhook.id, webhook.status)} disabled={loading}>
                                {webhook.status === 'paused' ? (
                                  <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Resume
                                  </>
                                ) : (
                                  <>
                                    <Pause className="w-3 h-3 mr-1" />
                                    Pause
                                  </>
                                )}
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => handleDeleteWebhook(webhook.id)} disabled={loading}>
                                <Trash2 className="w-3 h-3" />
                              </ModernButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Event Types</h3>
              {eventTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No event types configured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventTypes.map((event) => {
                    const deliveryPercent = (event.total_deliveries / maxEventDeliveries) * 100
                    const colors = ['from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-red-500']

                    return (
                      <div key={event.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colors[Math.floor(Math.random() * colors.length)]} flex items-center justify-center text-white`}>
                              <Zap className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold font-mono">{event.name}</p>
                              <p className="text-xs text-muted-foreground">{event.description || 'No description'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{event.total_deliveries > 1000 ? `${(event.total_deliveries / 1000).toFixed(1)}K` : event.total_deliveries}</p>
                            <p className="text-xs text-muted-foreground">{event.subscribers_count} subscribers</p>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                            style={{ width: `${deliveryPercent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            {topEvents.length > 0 && <RankingList title="🏆 Top Events" items={topEvents} />}

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Delivery Rate" value={`${stats.avgSuccessRate.toFixed(1)}%`} change={8.7} />
                <MiniKPI label="Avg Response" value={`${stats.avgResponseTime.toFixed(0)}ms`} change={-15.3} />
                <MiniKPI label="Failed Deliveries" value={(stats.totalDeliveries - stats.successfulDeliveries).toString()} change={-28.5} />
                <MiniKPI label="Total Webhooks" value={stats.total.toString()} change={12.1} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Test')}>
                  <Send className="w-4 h-4 mr-2" />
                  Test Webhook
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Docs')}>
                  <Code className="w-4 h-4 mr-2" />
                  View Documentation
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Verify')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Signatures
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
