"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Shield,
  Users,
  Server,
  BarChart3,
  Lock,
  CreditCard,
  Settings,
  Download,
  ArrowUpRight,
  CheckCircle,
  Database,
  Zap,
  Bell,
  Activity,
  HardDrive,
  Cpu
} from 'lucide-react'

/**
 * Admin V2 - Groundbreaking System Administration
 * Showcases admin dashboard with modern components
 */
export default function AdminV2() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'system' | 'analytics'>('overview')

  const stats = [
    { label: 'Total Users', value: '1,284', change: 12.0, icon: <Users className="w-5 h-5" /> },
    { label: 'System Health', value: '98%', change: 2.5, icon: <Server className="w-5 h-5" /> },
    { label: 'Revenue', value: '$47.4K', change: 8.0, icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Active Sessions', value: '342', change: 15.3, icon: <Activity className="w-5 h-5" /> }
  ]

  const systemMetrics = {
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 78
  }

  const recentActivity = [
    { icon: <Users className="w-5 h-5" />, title: 'New user registered', description: 'john.doe@example.com', time: '2 min ago', status: 'info' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'System backup completed', description: 'All data backed up successfully', time: '1 hour ago', status: 'success' as const },
    { icon: <CreditCard className="w-5 h-5" />, title: 'Payment processed', description: '$299 subscription renewal', time: '5 hours ago', status: 'success' as const },
    { icon: <Lock className="w-5 h-5" />, title: 'Security alert', description: 'Multiple failed login attempts', time: '1 day ago', status: 'warning' as const }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-slate-600" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">System administration and management</p>
          </div>
          <GradientButton from="slate" to="gray" onClick={() => console.log('Settings')}>
            <Settings className="w-5 h-5 mr-2" />
            System Settings
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <BentoQuickAction icon={<Users />} title="User Management" description="Manage users" onClick={() => console.log('Users')} />
          <BentoQuickAction icon={<Server />} title="System Health" description="Monitor status" onClick={() => console.log('Health')} />
          <BentoQuickAction icon={<Lock />} title="Security" description="Audit logs" onClick={() => console.log('Security')} />
          <BentoQuickAction icon={<CreditCard />} title="Billing" description="Revenue" onClick={() => console.log('Billing')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Platform stats" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Settings />} title="Configuration" description="Settings" onClick={() => console.log('Config')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedTab === 'overview' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('overview')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </PillButton>
          <PillButton variant={selectedTab === 'users' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('users')}>
            <Users className="w-4 h-4 mr-2" />
            Users
          </PillButton>
          <PillButton variant={selectedTab === 'system' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('system')}>
            <Server className="w-4 h-4 mr-2" />
            System
          </PillButton>
          <PillButton variant={selectedTab === 'analytics' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-6">System Monitoring</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">CPU Usage</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{systemMetrics.cpu}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                      style={{ width: `${systemMetrics.cpu}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Memory</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{systemMetrics.memory}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      style={{ width: `${systemMetrics.memory}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Disk Space</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{systemMetrics.disk}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                      style={{ width: `${systemMetrics.disk}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Network</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{systemMetrics.network}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-600 to-amber-600"
                      style={{ width: `${systemMetrics.network}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-medium text-green-900 dark:text-green-100">All Systems Operational</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Uptime: 99.9% | Last incident: 15 days ago</div>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" size="sm" className="w-full justify-start" onClick={() => console.log('Cache')}>
                  <HardDrive className="w-4 h-4 mr-2" />
                  Clear System Cache
                </ModernButton>
                <ModernButton variant="outline" size="sm" className="w-full justify-start" onClick={() => console.log('Backup')}>
                  <Database className="w-4 h-4 mr-2" />
                  Create Backup
                </ModernButton>
                <ModernButton variant="outline" size="sm" className="w-full justify-start" onClick={() => console.log('Notifications')}>
                  <Bell className="w-4 h-4 mr-2" />
                  Test Notifications
                </ModernButton>
                <ModernButton variant="outline" size="sm" className="w-full justify-start" onClick={() => console.log('Health')}>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Health Check
                </ModernButton>
              </div>
            </BentoCard>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Analytics</h3>
              <div className="space-y-3">
                <MiniKPI label="Daily Active" value="1.2K" change={12.5} />
                <MiniKPI label="Avg Load Time" value="4.2s" change={-8.3} />
                <MiniKPI label="Uptime" value="99.9%" change={0.1} />
                <MiniKPI label="API Latency" value="12ms" change={-15.2} />
              </div>
            </BentoCard>
          </div>
        </div>

        <ActivityFeed title="Recent Admin Activity" activities={recentActivity} />
      </div>
    </div>
  )
}
