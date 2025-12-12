"use client"

import { useState } from 'react'
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
  Webhook,
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
  Pause
} from 'lucide-react'

/**
 * Webhooks V2 - Groundbreaking Webhook Management
 * Showcases webhook endpoints, event delivery, and monitoring
 */
export default function WebhooksV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'failed' | 'paused'>('all')

  const stats = [
    { label: 'Active Webhooks', value: '24', change: 15.3, icon: <Webhook className="w-5 h-5" /> },
    { label: 'Events Delivered', value: '124K', change: 42.1, icon: <Send className="w-5 h-5" /> },
    { label: 'Success Rate', value: '98.4%', change: 8.7, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Latency', value: '245ms', change: -12.5, icon: <Clock className="w-5 h-5" /> }
  ]

  const webhooks = [
    {
      id: '1',
      name: 'Production Webhook',
      url: 'https://api.example.com/webhooks/events',
      status: 'active',
      events: ['user.created', 'user.updated', 'payment.succeeded'],
      deliveries: 84700,
      successRate: 99.2,
      lastDelivery: '2 minutes ago',
      created: '2024-01-15',
      secret: 'whsec_a8f9d2e1b4c7d3f6e9a2b5c8d1f4e7a0'
    },
    {
      id: '2',
      name: 'Analytics Webhook',
      url: 'https://analytics.example.com/events',
      status: 'active',
      events: ['analytics.tracked', 'conversion.completed'],
      deliveries: 34200,
      successRate: 97.8,
      lastDelivery: '5 minutes ago',
      created: '2024-02-01',
      secret: 'whsec_c3f6e9a2b5c8d1f4e7a0b3d6c9f2e5a8'
    },
    {
      id: '3',
      name: 'Notification Service',
      url: 'https://notify.example.com/webhook',
      status: 'active',
      events: ['notification.sent', 'email.delivered'],
      deliveries: 12400,
      successRate: 98.9,
      lastDelivery: '1 hour ago',
      created: '2024-01-20',
      secret: 'whsec_d6c9f2e5a8b1d4e7a0c3f6e9b2c5d8f1'
    },
    {
      id: '4',
      name: 'Legacy Integration',
      url: 'https://legacy.example.com/events',
      status: 'paused',
      events: ['order.created', 'order.updated'],
      deliveries: 847,
      successRate: 92.4,
      lastDelivery: '2 days ago',
      created: '2023-11-10',
      secret: 'whsec_e7a0c3f6e9b2c5d8f1a4d7b0c3e6f9a2'
    }
  ]

  const eventTypes = [
    {
      name: 'user.created',
      description: 'Triggered when a new user is created',
      subscribers: 8,
      deliveries: 24700,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'payment.succeeded',
      description: 'Triggered when a payment is successful',
      subscribers: 12,
      deliveries: 34200,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'analytics.tracked',
      description: 'Triggered when analytics event is tracked',
      subscribers: 6,
      deliveries: 67800,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'notification.sent',
      description: 'Triggered when a notification is sent',
      subscribers: 4,
      deliveries: 12400,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const deliveryLogs = [
    {
      id: 'evt_1',
      event: 'user.created',
      webhook: 'Production Webhook',
      status: 'success',
      attempts: 1,
      responseTime: 124,
      timestamp: '2 minutes ago',
      statusCode: 200
    },
    {
      id: 'evt_2',
      event: 'payment.succeeded',
      webhook: 'Production Webhook',
      status: 'success',
      attempts: 1,
      responseTime: 89,
      timestamp: '5 minutes ago',
      statusCode: 200
    },
    {
      id: 'evt_3',
      event: 'analytics.tracked',
      webhook: 'Analytics Webhook',
      status: 'failed',
      attempts: 3,
      responseTime: 5000,
      timestamp: '10 minutes ago',
      statusCode: 500
    },
    {
      id: 'evt_4',
      event: 'notification.sent',
      webhook: 'Notification Service',
      status: 'success',
      attempts: 2,
      responseTime: 234,
      timestamp: '15 minutes ago',
      statusCode: 200
    },
    {
      id: 'evt_5',
      event: 'user.updated',
      webhook: 'Production Webhook',
      status: 'pending',
      attempts: 1,
      responseTime: 0,
      timestamp: '1 minute ago',
      statusCode: 0
    }
  ]

  const topEvents = [
    { rank: 1, name: 'analytics.tracked', avatar: '📊', value: '67.8K', change: 42.3 },
    { rank: 2, name: 'payment.succeeded', avatar: '💰', value: '34.2K', change: 35.1 },
    { rank: 3, name: 'user.created', avatar: '👤', value: '24.7K', change: 28.5 },
    { rank: 4, name: 'notification.sent', avatar: '🔔', value: '12.4K', change: 22.7 },
    { rank: 5, name: 'order.created', avatar: '🛒', value: '8.9K', change: 18.2 }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Webhook delivered', description: 'user.created to Production Webhook', time: '2 minutes ago', status: 'success' as const },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Delivery failed', description: 'analytics.tracked after 3 retries', time: '10 minutes ago', status: 'error' as const },
    { icon: <Webhook className="w-5 h-5" />, title: 'Webhook created', description: 'New webhook for Notification Service', time: '2 hours ago', status: 'success' as const },
    { icon: <Pause className="w-5 h-5" />, title: 'Webhook paused', description: 'Legacy Integration temporarily disabled', time: '1 day ago', status: 'warning' as const }
  ]

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

  const maxDeliveries = Math.max(...webhooks.map(w => w.deliveries))
  const maxEventDeliveries = Math.max(...eventTypes.map(e => e.deliveries))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Webhook className="w-10 h-10 text-emerald-600" />
              Webhooks
            </h1>
            <p className="text-muted-foreground">Configure and monitor webhook event delivery</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => console.log('Create webhook')}>
            <Webhook className="w-5 h-5 mr-2" />
            Create Webhook
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Webhook />} title="Endpoints" description="Manage webhooks" onClick={() => console.log('Endpoints')} />
          <BentoQuickAction icon={<Zap />} title="Events" description="Event types" onClick={() => console.log('Events')} />
          <BentoQuickAction icon={<Activity />} title="Logs" description="Delivery logs" onClick={() => console.log('Logs')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Webhooks
          </PillButton>
          <PillButton variant={selectedStatus === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('active')}>
            <Play className="w-4 h-4 mr-2" />
            Active
          </PillButton>
          <PillButton variant={selectedStatus === 'failed' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('failed')}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed
          </PillButton>
          <PillButton variant={selectedStatus === 'paused' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('paused')}>
            <Pause className="w-4 h-4 mr-2" />
            Paused
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Webhook Endpoints</h3>
              <div className="space-y-3">
                {webhooks.map((webhook) => {
                  const deliveryPercent = (webhook.deliveries / maxDeliveries) * 100

                  return (
                    <div key={webhook.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{webhook.name}</h4>
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
                            <p className="font-semibold">{webhook.deliveries.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Success Rate</p>
                            <p className={`font-semibold ${webhook.successRate >= 98 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {webhook.successRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Delivery</p>
                            <p className="font-semibold">{webhook.lastDelivery}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p className="font-semibold">{webhook.created}</p>
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
                            <code className="font-mono text-muted-foreground">{webhook.secret.substring(0, 20)}...</code>
                          </div>
                          <div className="flex gap-2">
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Test', webhook.id)}>
                              <Send className="w-3 h-3 mr-1" />
                              Test
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', webhook.id)}>
                              Edit
                            </ModernButton>
                            {webhook.status === 'paused' ? (
                              <ModernButton variant="outline" size="sm" onClick={() => console.log('Resume', webhook.id)}>
                                <Play className="w-3 h-3 mr-1" />
                                Resume
                              </ModernButton>
                            ) : (
                              <ModernButton variant="outline" size="sm" onClick={() => console.log('Pause', webhook.id)}>
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </ModernButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Event Types</h3>
              <div className="space-y-4">
                {eventTypes.map((event) => {
                  const deliveryPercent = (event.deliveries / maxEventDeliveries) * 100

                  return (
                    <div key={event.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${event.color} flex items-center justify-center text-white`}>
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold font-mono">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{(event.deliveries / 1000).toFixed(1)}K</p>
                          <p className="text-xs text-muted-foreground">{event.subscribers} subscribers</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${event.color} transition-all duration-300`}
                          style={{ width: `${deliveryPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Delivery Logs</h3>
              <div className="space-y-2">
                {deliveryLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(log.status)}`}>
                            {getStatusIcon(log.status)}
                            {log.status}
                          </span>
                          <code className="text-xs font-mono">{log.event}</code>
                          <span className="text-xs text-muted-foreground">→</span>
                          <span className="text-xs text-muted-foreground">{log.webhook}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            {log.attempts} {log.attempts === 1 ? 'attempt' : 'attempts'}
                          </span>
                          {log.status !== 'pending' && (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {log.responseTime}ms
                              </span>
                              <span className={log.statusCode === 200 ? 'text-green-600' : 'text-red-600'}>
                                HTTP {log.statusCode}
                              </span>
                            </>
                          )}
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                      <ModernButton variant="ghost" size="sm" onClick={() => console.log('View', log.id)}>
                        View
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Events" items={topEvents} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Delivery Rate" value="98.4%" change={8.7} />
                <MiniKPI label="Avg Retries" value="1.2" change={-15.3} />
                <MiniKPI label="Failed Deliveries" value="1,247" change={-28.5} />
                <MiniKPI label="Queue Size" value="24" change={-42.1} />
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
