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
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Shield,
  FileText,
  Users,
  Lock,
  Eye,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Database,
  Key
} from 'lucide-react'

/**
 * Audit V2 - Groundbreaking Audit Trail & Compliance
 * Showcases audit logs, compliance tracking, and security monitoring
 */
export default function AuditV2() {
  const [selectedAction, setSelectedAction] = useState<'all' | 'create' | 'update' | 'delete' | 'access'>('all')

  const stats = [
    { label: 'Total Events', value: '847K', change: 28.4, icon: <FileText className="w-5 h-5" /> },
    { label: 'Compliance Score', value: '98%', change: 5.3, icon: <Shield className="w-5 h-5" /> },
    { label: 'Active Users', value: '8,947', change: 15.7, icon: <Users className="w-5 h-5" /> },
    { label: 'Retention', value: '7 years', change: 0, icon: <Database className="w-5 h-5" /> }
  ]

  const auditEvents = [
    {
      id: '1',
      timestamp: '2024-02-12 14:32:45',
      action: 'delete',
      resource: 'user_account',
      resourceId: 'user_847',
      actor: 'admin@example.com',
      actorId: 'admin_24',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      severity: 'high',
      status: 'success',
      changes: { status: { from: 'active', to: 'deleted' } },
      metadata: { reason: 'GDPR request' }
    },
    {
      id: '2',
      timestamp: '2024-02-12 14:31:20',
      action: 'update',
      resource: 'payment_settings',
      resourceId: 'settings_456',
      actor: 'john.doe@example.com',
      actorId: 'user_124',
      ipAddress: '203.45.67.89',
      userAgent: 'Chrome 121',
      severity: 'medium',
      status: 'success',
      changes: { payment_method: { from: 'credit_card', to: 'bank_transfer' } },
      metadata: { amount: 299 }
    },
    {
      id: '3',
      timestamp: '2024-02-12 14:30:15',
      action: 'access',
      resource: 'customer_data',
      resourceId: 'customer_892',
      actor: 'support@example.com',
      actorId: 'support_15',
      ipAddress: '192.168.1.150',
      userAgent: 'Safari 17',
      severity: 'low',
      status: 'success',
      changes: null,
      metadata: { reason: 'Support ticket #1247' }
    },
    {
      id: '4',
      timestamp: '2024-02-12 14:29:30',
      action: 'create',
      resource: 'admin_role',
      resourceId: 'role_247',
      actor: 'admin@example.com',
      actorId: 'admin_24',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 121',
      severity: 'high',
      status: 'success',
      changes: { permissions: { from: null, to: ['read', 'write', 'delete', 'admin'] } },
      metadata: { assigned_to: 'user_673' }
    },
    {
      id: '5',
      timestamp: '2024-02-12 14:28:45',
      action: 'update',
      resource: 'security_settings',
      resourceId: 'settings_123',
      actor: 'security@example.com',
      actorId: 'admin_18',
      ipAddress: '192.168.1.120',
      userAgent: 'Firefox 122',
      severity: 'high',
      status: 'success',
      changes: { mfa_required: { from: false, to: true } },
      metadata: { compliance: 'SOC2' }
    },
    {
      id: '6',
      timestamp: '2024-02-12 14:27:30',
      action: 'delete',
      resource: 'api_key',
      resourceId: 'key_789',
      actor: 'developer@example.com',
      actorId: 'user_567',
      ipAddress: '45.67.89.123',
      userAgent: 'Postman',
      severity: 'medium',
      status: 'success',
      changes: { status: { from: 'active', to: 'revoked' } },
      metadata: { reason: 'Security rotation' }
    }
  ]

  const complianceChecks = [
    {
      name: 'GDPR Compliance',
      status: 'passing',
      score: 98,
      lastCheck: '2024-02-12',
      issues: 2,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'SOC 2 Type II',
      status: 'passing',
      score: 96,
      lastCheck: '2024-02-10',
      issues: 4,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'HIPAA',
      status: 'passing',
      score: 94,
      lastCheck: '2024-02-08',
      issues: 6,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'PCI DSS',
      status: 'warning',
      score: 88,
      lastCheck: '2024-02-05',
      issues: 12,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      name: 'ISO 27001',
      status: 'passing',
      score: 97,
      lastCheck: '2024-02-11',
      issues: 3,
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const activityByType = [
    { type: 'create', count: 124700, percentage: 14.7, color: 'from-green-500 to-emerald-500' },
    { type: 'update', count: 456200, percentage: 53.8, color: 'from-blue-500 to-cyan-500' },
    { type: 'delete', count: 12400, percentage: 1.5, color: 'from-red-500 to-orange-500' },
    { type: 'access', count: 254000, percentage: 30.0, color: 'from-purple-500 to-pink-500' }
  ]

  const topActors = [
    { rank: 1, name: 'admin@example.com', avatar: '👤', value: '24.7K', change: 42.3 },
    { rank: 2, name: 'system@automated', avatar: '🤖', value: '18.2K', change: 35.1 },
    { rank: 3, name: 'support@example.com', avatar: '🎧', value: '12.4K', change: 28.5 },
    { rank: 4, name: 'developer@example.com', avatar: '👨‍💻', value: '9.8K', change: 22.7 },
    { rank: 5, name: 'security@example.com', avatar: '🔒', value: '8.5K', change: 18.2 }
  ]

  const recentAlerts = [
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Unusual activity detected', description: 'Multiple admin role assignments in 5 min', time: '10 minutes ago', status: 'warning' as const },
    { icon: <Lock className="w-5 h-5" />, title: 'Compliance check failed', description: 'PCI DSS score below threshold', time: '2 hours ago', status: 'error' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Audit export completed', description: 'Q1 2024 audit report generated', time: '1 day ago', status: 'success' as const },
    { icon: <Shield className="w-5 h-5" />, title: 'Security scan passed', description: 'No compliance violations found', time: '3 days ago', status: 'success' as const }
  ]

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-700'
      case 'update': return 'bg-blue-100 text-blue-700'
      case 'delete': return 'bg-red-100 text-red-700'
      case 'access': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing': return 'bg-green-100 text-green-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'failing': return 'bg-red-100 text-red-700'
      case 'success': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxCount = Math.max(...activityByType.map(a => a.count))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-indigo-600" />
              Audit & Compliance
            </h1>
            <p className="text-muted-foreground">Track changes, access, and compliance status</p>
          </div>
          <GradientButton from="indigo" to="purple" onClick={() => console.log('Export')}>
            <Download className="w-5 h-5 mr-2" />
            Export Audit Trail
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<FileText />} title="Audit Trail" description="All events" onClick={() => console.log('Audit')} />
          <BentoQuickAction icon={<Shield />} title="Compliance" description="Checks" onClick={() => console.log('Compliance')} />
          <BentoQuickAction icon={<Eye />} title="Access Logs" description="Who viewed what" onClick={() => console.log('Access')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PillButton variant={selectedAction === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('all')}>
              All Actions
            </PillButton>
            <PillButton variant={selectedAction === 'create' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('create')}>
              Create
            </PillButton>
            <PillButton variant={selectedAction === 'update' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('update')}>
              Update
            </PillButton>
            <PillButton variant={selectedAction === 'delete' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('delete')}>
              Delete
            </PillButton>
            <PillButton variant={selectedAction === 'access' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('access')}>
              <Eye className="w-4 h-4 mr-2" />
              Access
            </PillButton>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search audit events..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Audit Events</h3>
              <div className="space-y-3">
                {auditEvents.map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-md ${getActionColor(event.action)}`}>
                              {event.action.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </span>
                            <span className="text-sm font-semibold">{event.resource}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {event.timestamp}
                          </div>
                        </div>
                        <ModernButton variant="ghost" size="sm" onClick={() => console.log('View', event.id)}>
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </ModernButton>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Actor</p>
                          <p className="font-semibold">{event.actor}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Resource ID</p>
                          <p className="font-semibold font-mono">{event.resourceId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">IP Address</p>
                          <p className="font-semibold font-mono">{event.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className={`font-semibold ${getStatusColor(event.status)}`}>
                            {event.status}
                          </p>
                        </div>
                      </div>

                      {event.changes && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold mb-1">Changes:</p>
                          <div className="text-xs font-mono bg-muted p-2 rounded">
                            {JSON.stringify(event.changes, null, 2)}
                          </div>
                        </div>
                      )}

                      {event.metadata && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <span key={key} className="px-2 py-1 rounded-md bg-muted">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Activity by Type</h3>
              <div className="space-y-4">
                {activityByType.map((activity) => {
                  const countPercent = (activity.count / maxCount) * 100

                  return (
                    <div key={activity.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold capitalize">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">{activity.percentage.toFixed(1)}% of total</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{(activity.count / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">events</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${activity.color} transition-all duration-300`}
                          style={{ width: `${countPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Compliance Checks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceChecks.map((check) => (
                  <div key={check.name} className="p-4 rounded-lg border border-border bg-background">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{check.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{check.score}</span>
                        <div className="text-right text-xs">
                          <p className="text-muted-foreground">Last checked</p>
                          <p className="font-semibold">{check.lastCheck}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${check.color}`}
                          style={{ width: `${check.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {check.issues} {check.issues === 1 ? 'issue' : 'issues'} found
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Most Active Users" items={topActors} />

            <ActivityFeed title="Recent Alerts" activities={recentAlerts} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Audit Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Events/Hour" value="4.2K" change={28.4} />
                <MiniKPI label="Failed Actions" value="0.04%" change={-42.3} />
                <MiniKPI label="Data Retention" value="7 years" change={0} />
                <MiniKPI label="Export Frequency" value="Daily" change={0} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Report')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Compliance')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Run Compliance Check
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Filters')}>
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
