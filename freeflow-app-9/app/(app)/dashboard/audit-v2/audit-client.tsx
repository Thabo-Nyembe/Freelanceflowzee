'use client'

import { useState } from 'react'
import { useAuditEvents, useComplianceChecks, type AuditEvent, type AuditAction, type ComplianceCheck } from '@/lib/hooks/use-audit-events'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed, RankingList } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
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
  Database
} from 'lucide-react'

interface AuditClientProps {
  initialEvents: AuditEvent[]
  initialComplianceChecks: ComplianceCheck[]
}

export default function AuditClient({ initialEvents, initialComplianceChecks }: AuditClientProps) {
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all')
  const { auditEvents, loading, error } = useAuditEvents({ action: selectedAction })
  const { complianceChecks } = useComplianceChecks()

  const displayEvents = auditEvents.length > 0 ? auditEvents : initialEvents
  const displayChecks = complianceChecks.length > 0 ? complianceChecks : initialComplianceChecks

  const avgComplianceScore = displayChecks.length > 0
    ? displayChecks.reduce((sum, c) => sum + c.score, 0) / displayChecks.length
    : 0

  const stats = [
    { label: 'Total Events', value: displayEvents.length.toLocaleString(), change: 28.4, icon: <FileText className="w-5 h-5" /> },
    { label: 'Compliance Score', value: `${avgComplianceScore.toFixed(0)}%`, change: 5.3, icon: <Shield className="w-5 h-5" /> },
    { label: 'Unique Actors', value: [...new Set(displayEvents.map(e => e.actor_email))].length.toString(), change: 15.7, icon: <Users className="w-5 h-5" /> },
    { label: 'Retention', value: '7 years', change: 0, icon: <Database className="w-5 h-5" /> }
  ]

  const activityByType = [
    { type: 'create', count: displayEvents.filter(e => e.action === 'create').length, color: 'from-green-500 to-emerald-500' },
    { type: 'update', count: displayEvents.filter(e => e.action === 'update').length, color: 'from-blue-500 to-cyan-500' },
    { type: 'delete', count: displayEvents.filter(e => e.action === 'delete').length, color: 'from-red-500 to-orange-500' },
    { type: 'access', count: displayEvents.filter(e => e.action === 'access').length, color: 'from-purple-500 to-pink-500' }
  ]

  const topActors = [...new Map(displayEvents.map(e => [e.actor_email, e])).values()]
    .slice(0, 5)
    .map((e, index) => ({
      rank: index + 1,
      name: e.actor_email,
      avatar: '👤',
      value: `${displayEvents.filter(ev => ev.actor_email === e.actor_email).length}`,
      change: 0
    }))

  const recentAlerts = displayEvents
    .filter(e => e.severity === 'high' || e.severity === 'critical')
    .slice(0, 4)
    .map(e => ({
      icon: <AlertCircle className="w-5 h-5" />,
      title: `${e.action} on ${e.resource}`,
      description: e.actor_email,
      time: new Date(e.event_timestamp).toLocaleString(),
      status: (e.status === 'success' ? 'success' : 'warning') as const
    }))

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
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
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

  const maxCount = Math.max(...activityByType.map(a => a.count), 1)

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
          <BentoQuickAction icon={<FileText />} title="Audit Trail" description="All events" onClick={() => setSelectedAction('all')} />
          <BentoQuickAction icon={<Shield />} title="Compliance" description="Checks" onClick={() => console.log('Compliance')} />
          <BentoQuickAction icon={<Eye />} title="Access Logs" description="Who viewed what" onClick={() => setSelectedAction('access')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <PillButton variant={selectedAction === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('all')}>All Actions</PillButton>
            <PillButton variant={selectedAction === 'create' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('create')}>Create</PillButton>
            <PillButton variant={selectedAction === 'update' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('update')}>Update</PillButton>
            <PillButton variant={selectedAction === 'delete' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('delete')}>Delete</PillButton>
            <PillButton variant={selectedAction === 'access' ? 'primary' : 'ghost'} onClick={() => setSelectedAction('access')}>
              <Eye className="w-4 h-4 mr-2" />Access
            </PillButton>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search audit events..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Audit Events</h3>
              <div className="space-y-3">
                {displayEvents.slice(0, 15).map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                            {new Date(event.event_timestamp).toLocaleString()}
                          </div>
                        </div>
                        <ModernButton variant="ghost" size="sm" onClick={() => console.log('View', event.id)}>
                          <Eye className="w-3 h-3 mr-1" />View
                        </ModernButton>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Actor</p>
                          <p className="font-semibold">{event.actor_email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Resource ID</p>
                          <p className="font-semibold font-mono">{event.resource_id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">IP Address</p>
                          <p className="font-semibold font-mono">{event.actor_ip_address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <span className={`px-2 py-1 rounded-md text-xs ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {displayEvents.length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Audit Events</h3>
                    <p className="text-muted-foreground">Audit events will appear here</p>
                  </div>
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Activity by Type</h3>
              <div className="space-y-4">
                {activityByType.map((activity) => {
                  const countPercent = maxCount > 0 ? (activity.count / maxCount) * 100 : 0
                  const totalPercent = displayEvents.length > 0 ? (activity.count / displayEvents.length) * 100 : 0

                  return (
                    <div key={activity.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold capitalize">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">{totalPercent.toFixed(1)}% of total</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{activity.count.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">events</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${activity.color}`} style={{ width: `${countPercent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Compliance Checks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayChecks.map((check) => (
                  <div key={check.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{check.check_name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{check.score.toFixed(0)}</span>
                        <div className="text-right text-xs">
                          <p className="text-muted-foreground">Framework</p>
                          <p className="font-semibold">{check.framework}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${check.status === 'passing' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : check.status === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                          style={{ width: `${check.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {check.issues_found} {check.issues_found === 1 ? 'issue' : 'issues'} found
                      </p>
                    </div>
                  </div>
                ))}

                {displayChecks.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground">No compliance checks configured</p>
                  </div>
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="Most Active Users" items={topActors} />
            <ActivityFeed title="Recent Alerts" activities={recentAlerts.length > 0 ? recentAlerts : [
              { icon: <CheckCircle className="w-5 h-5" />, title: 'No alerts', description: 'All systems normal', time: 'Now', status: 'success' as const }
            ]} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Audit Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Events/Hour" value={displayEvents.length > 0 ? `${(displayEvents.length / 24).toFixed(0)}` : '0'} change={28.4} />
                <MiniKPI label="Success Rate" value={displayEvents.length > 0 ? `${((displayEvents.filter(e => e.status === 'success').length / displayEvents.length) * 100).toFixed(1)}%` : '0%'} change={5.2} />
                <MiniKPI label="High Severity" value={displayEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length.toString()} change={-15.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
