"use client"

import { useState } from 'react'
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
  Settings
} from 'lucide-react'

/**
 * Security V2 - Groundbreaking Security & Access Control
 * Showcases security features and threat monitoring with modern components
 */
export default function SecurityV2() {
  const [selectedView, setSelectedView] = useState<'overview' | 'threats' | 'access'>('overview')

  const stats = [
    { label: 'Security Score', value: '98/100', change: 5.2, icon: <Shield className="w-5 h-5" /> },
    { label: 'Threats Blocked', value: '247', change: -12.5, icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Active Sessions', value: '847', change: 8.3, icon: <Activity className="w-5 h-5" /> },
    { label: '2FA Enabled', value: '94%', change: 15.7, icon: <Key className="w-5 h-5" /> }
  ]

  const securityFeatures = [
    {
      id: '1',
      title: 'Two-Factor Authentication',
      description: 'Enhanced login security',
      icon: <Key className="w-8 h-8" />,
      status: 'enabled',
      coverage: 94,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '2',
      title: 'Biometric Login',
      description: 'Fingerprint & face ID',
      icon: <Fingerprint className="w-8 h-8" />,
      status: 'enabled',
      coverage: 67,
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
      status: 'partial',
      coverage: 42,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const securityEvents = [
    {
      id: '1',
      type: 'Failed Login',
      severity: 'medium',
      description: 'Multiple failed login attempts detected',
      ip: '192.168.1.247',
      time: '5 minutes ago',
      blocked: true
    },
    {
      id: '2',
      type: 'New Device',
      severity: 'info',
      description: 'Login from new device',
      ip: '10.0.0.124',
      time: '1 hour ago',
      blocked: false
    },
    {
      id: '3',
      type: 'Suspicious Activity',
      severity: 'high',
      description: 'Unusual API access pattern',
      ip: '172.16.254.89',
      time: '3 hours ago',
      blocked: true
    },
    {
      id: '4',
      type: 'Password Change',
      severity: 'info',
      description: 'User password updated',
      ip: '192.168.1.100',
      time: '1 day ago',
      blocked: false
    }
  ]

  const activeSessions = [
    {
      id: '1',
      device: 'Chrome on MacBook Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.100',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone 14',
      location: 'San Francisco, CA',
      ip: '192.168.1.101',
      lastActive: '1 hour ago',
      current: false
    },
    {
      id: '3',
      device: 'Firefox on Windows',
      location: 'New York, NY',
      ip: '10.0.0.247',
      lastActive: '2 days ago',
      current: false
    }
  ]

  const recentActivity = [
    { icon: <Shield className="w-5 h-5" />, title: 'Threat blocked', description: 'Suspicious login attempt', time: '5 minutes ago', status: 'warning' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Security scan completed', description: 'All systems secure', time: '1 hour ago', status: 'success' as const },
    { icon: <Key className="w-5 h-5" />, title: '2FA enabled', description: 'New user activated 2FA', time: '3 hours ago', status: 'success' as const },
    { icon: <UserX className="w-5 h-5" />, title: 'Session terminated', description: 'Suspicious device logged out', time: '1 day ago', status: 'info' as const }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700'
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
          <GradientButton from="red" to="rose" onClick={() => console.log('Security audit')}>
            <Eye className="w-5 h-5 mr-2" />
            Run Security Audit
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

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
            Threats
          </PillButton>
          <PillButton variant={selectedView === 'access' ? 'primary' : 'ghost'} onClick={() => setSelectedView('access')}>
            <Activity className="w-4 h-4 mr-2" />
            Access Logs
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Security Events</h3>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{event.type}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                          {event.blocked && (
                            <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700">
                              Blocked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {event.ip}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                        </div>
                      </div>
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Details', event.id)}>
                        Details
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{session.device}</h4>
                          {session.current && (
                            <span className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {session.location}
                          </span>
                          <span>{session.ip}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.lastActive}
                          </span>
                        </div>
                      </div>
                      {!session.current && (
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Revoke', session.id)}>
                          <UserX className="w-3 h-3 mr-1" />
                          Revoke
                        </ModernButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Score</h3>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <div>
                    <p className="text-4xl font-bold">98</p>
                    <p className="text-sm">/ 100</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Excellent security posture
              </p>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Threats Blocked" value="247" change={-12.5} />
                <MiniKPI label="Failed Logins" value="89" change={-25.3} />
                <MiniKPI label="2FA Adoption" value="94%" change={15.7} />
                <MiniKPI label="API Key Rotation" value="100%" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
