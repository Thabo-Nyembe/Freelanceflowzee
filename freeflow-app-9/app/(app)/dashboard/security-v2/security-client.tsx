'use client'

import { useState } from 'react'
import { useSecurity, SecuritySettings, SecurityEvent, UserSession, SecurityStats } from '@/lib/hooks/use-security'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  Eye,
  UserX,
  Activity,
  Clock,
  Fingerprint,
  Smartphone,
  Globe,
  Settings,
  RefreshCw,
  Trash2
} from 'lucide-react'

interface SecurityClientProps {
  initialSettings: SecuritySettings | null
  initialEvents: SecurityEvent[]
  initialSessions: UserSession[]
  initialStats: SecurityStats
}

export default function SecurityClient({
  initialSettings,
  initialEvents,
  initialSessions,
  initialStats
}: SecurityClientProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'threats' | 'access'>('overview')

  const {
    settings,
    events,
    sessions,
    stats,
    loading,
    error,
    updateSettings,
    enable2FA,
    disable2FA,
    enableBiometric,
    disableBiometric,
    resolveEvent,
    blockIPFromEvent,
    terminateSession,
    terminateAllOtherSessions
  } = useSecurity(initialSettings || undefined, initialEvents, initialSessions)

  const statItems = [
    { label: 'Security Score', value: `${stats.securityScore}/100`, change: 5.2, icon: <Shield className="w-5 h-5" /> },
    { label: 'Threats Blocked', value: stats.blockedAttempts.toString(), change: -12.5, icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Active Sessions', value: stats.activeSessions.toString(), change: 8.3, icon: <Activity className="w-5 h-5" /> },
    { label: '2FA Enabled', value: stats.twoFactorEnabled ? 'Yes' : 'No', change: stats.twoFactorEnabled ? 15.7 : 0, icon: <Key className="w-5 h-5" /> }
  ]

  const securityFeatures = [
    {
      id: '1',
      title: 'Two-Factor Authentication',
      description: 'Enhanced login security',
      icon: <Key className="w-8 h-8" />,
      status: settings?.two_factor_enabled ? 'enabled' : 'disabled',
      coverage: settings?.two_factor_enabled ? 100 : 0,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '2',
      title: 'Biometric Login',
      description: 'Fingerprint & face ID',
      icon: <Fingerprint className="w-8 h-8" />,
      status: settings?.biometric_enabled ? 'enabled' : 'disabled',
      coverage: settings?.biometric_enabled ? 100 : 0,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      title: 'Session Management',
      description: 'Active device tracking',
      icon: <Smartphone className="w-8 h-8" />,
      status: 'enabled',
      coverage: 100,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '4',
      title: 'IP Whitelist',
      description: 'Restrict access by location',
      icon: <Globe className="w-8 h-8" />,
      status: settings?.ip_whitelist_enabled ? 'enabled' : 'partial',
      coverage: settings?.ip_whitelist_enabled ? 100 : 42,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const recentActivity = events.slice(0, 4).map(e => ({
    icon: e.severity === 'critical' || e.severity === 'high' ? <AlertTriangle className="w-5 h-5" /> : <Shield className="w-5 h-5" />,
    title: e.event_type.replace('_', ' '),
    description: e.description || 'Security event',
    time: new Date(e.created_at).toLocaleString(),
    status: (e.is_blocked ? 'warning' : e.is_resolved ? 'success' : 'info') as 'warning' | 'success' | 'info'
  }))

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      case 'info': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-700'
      case 'partial': return 'bg-yellow-100 text-yellow-700'
      case 'disabled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleToggle2FA = async () => {
    if (settings?.two_factor_enabled) {
      await disable2FA()
    } else {
      await enable2FA('app')
    }
  }

  const handleToggleBiometric = async () => {
    if (settings?.biometric_enabled) {
      await disableBiometric()
    } else {
      await enableBiometric('fingerprint')
    }
  }

  const handleResolveEvent = async (id: string) => {
    await resolveEvent(id, 'Resolved by user')
  }

  const handleBlockIP = async (id: string) => {
    await blockIPFromEvent(id)
  }

  const handleTerminateSession = async (id: string) => {
    if (confirm('Are you sure you want to terminate this session?')) {
      await terminateSession(id)
    }
  }

  const handleTerminateAllSessions = async () => {
    if (confirm('Are you sure you want to terminate all other sessions?')) {
      await terminateAllOtherSessions()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50/30 to-pink-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-red-600" />
              Security Center
            </h1>
            <p className="text-muted-foreground">Monitor and manage security across your platform</p>
          </div>
          <GradientButton from="red" to="rose" onClick={() => console.log('Security audit')} disabled={loading}>
            <Eye className="w-5 h-5 mr-2" />
            Run Security Audit
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Shield />} title="Security Scan" description="Full audit" onClick={() => console.log('Scan')} />
          <BentoQuickAction icon={<Key />} title="Manage Keys" description="API keys" onClick={() => console.log('Keys')} />
          <BentoQuickAction icon={<Lock />} title="Permissions" description="Access control" onClick={() => console.log('Permissions')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedView === 'overview' ? 'primary' : 'ghost'} onClick={() => setSelectedView('overview')}>
            <Shield className="w-4 h-4 mr-2" />
            Overview
          </PillButton>
          <PillButton variant={selectedView === 'threats' ? 'primary' : 'ghost'} onClick={() => setSelectedView('threats')}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Threats ({stats.unresolvedEvents})
          </PillButton>
          <PillButton variant={selectedView === 'access' ? 'primary' : 'ghost'} onClick={() => setSelectedView('access')}>
            <Activity className="w-4 h-4 mr-2" />
            Sessions ({stats.activeSessions})
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Security Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityFeatures.map((feature) => (
                  <div key={feature.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{feature.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(feature.status)}`}>
                            {feature.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Coverage</span>
                            <span className="font-semibold">{feature.coverage}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${feature.color}`}
                              style={{ width: `${feature.coverage}%` }}
                            />
                          </div>
                        </div>
                        {feature.id === '1' && (
                          <ModernButton
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleToggle2FA}
                            disabled={loading}
                          >
                            {settings?.two_factor_enabled ? 'Disable' : 'Enable'} 2FA
                          </ModernButton>
                        )}
                        {feature.id === '2' && (
                          <ModernButton
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleToggleBiometric}
                            disabled={loading}
                          >
                            {settings?.biometric_enabled ? 'Disable' : 'Enable'} Biometric
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Security Events</h3>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No security events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="p-4 rounded-lg border border-border bg-background">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{event.event_type.replace('_', ' ')}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </span>
                            {event.is_blocked && (
                              <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700">
                                Blocked
                              </span>
                            )}
                            {event.is_resolved && (
                              <span className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                                Resolved
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.description || 'No description'}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {event.ip_address && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {event.ip_address}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!event.is_resolved && (
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveEvent(event.id)}
                              disabled={loading}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolve
                            </ModernButton>
                          )}
                          {event.ip_address && !event.is_blocked && (
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleBlockIP(event.id)}
                              disabled={loading}
                            >
                              Block IP
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Active Sessions</h3>
                {sessions.filter(s => !s.is_current).length > 0 && (
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={handleTerminateAllSessions}
                    disabled={loading}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Terminate All Others
                  </ModernButton>
                )}
              </div>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No active sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-lg border border-border bg-background">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">
                              {session.browser || 'Unknown'} on {session.os || session.device_type || 'Unknown Device'}
                            </h4>
                            {session.is_current && (
                              <span className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {session.location && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {session.location}
                              </span>
                            )}
                            {session.ip_address && <span>{session.ip_address}</span>}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.last_active_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {!session.is_current && (
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleTerminateSession(session.id)}
                            disabled={loading}
                          >
                            <UserX className="w-3 h-3 mr-1" />
                            Revoke
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Score</h3>
              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                  stats.securityScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  stats.securityScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-rose-500'
                } text-white`}>
                  <div>
                    <p className="text-4xl font-bold">{stats.securityScore}</p>
                    <p className="text-sm">/ 100</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {stats.securityScore >= 80 ? 'Excellent security posture' :
                 stats.securityScore >= 60 ? 'Good security, room for improvement' :
                 'Security needs attention'}
              </p>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Threats Blocked" value={stats.blockedAttempts.toString()} change={-12.5} />
                <MiniKPI label="Unresolved Events" value={stats.unresolvedEvents.toString()} change={stats.unresolvedEvents > 0 ? 5 : -25.3} />
                <MiniKPI label="Active Sessions" value={stats.activeSessions.toString()} change={8.3} />
                <MiniKPI label="Critical Events" value={stats.criticalEvents.toString()} change={stats.criticalEvents > 0 ? 10 : -100} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Auth</span>
                  <button
                    onClick={handleToggle2FA}
                    disabled={loading}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings?.two_factor_enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings?.two_factor_enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Biometric Login</span>
                  <button
                    onClick={handleToggleBiometric}
                    disabled={loading}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings?.biometric_enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings?.biometric_enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IP Whitelist</span>
                  <button
                    onClick={() => updateSettings({ ip_whitelist_enabled: !settings?.ip_whitelist_enabled })}
                    disabled={loading}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings?.ip_whitelist_enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings?.ip_whitelist_enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
