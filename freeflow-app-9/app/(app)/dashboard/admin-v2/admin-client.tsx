'use client'

import { useState, useMemo } from 'react'
import {
  Settings,
  Users,
  Database,
  Shield,
  Activity,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  FileText,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Zap,
  Layers,
  Box,
  Key,
  UserCog,
  ShieldCheck,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminSettings, type AdminSetting } from '@/lib/hooks/use-admin-settings'

// Types
interface SystemResource {
  id: string
  name: string
  type: 'database' | 'api' | 'storage' | 'cache' | 'queue'
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  endpoint: string
  latency: number
  uptime: number
  lastChecked: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer'
  status: 'active' | 'suspended' | 'pending'
  lastLogin: string
  mfaEnabled: boolean
  permissions: string[]
}

interface AuditLog {
  id: string
  action: string
  actor: string
  resource: string
  details: string
  ipAddress: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

// Mock Data
const mockResources: SystemResource[] = [
  { id: '1', name: 'Primary Database', type: 'database', status: 'healthy', endpoint: 'postgres://db.freeflow.io:5432', latency: 12, uptime: 99.99, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '2', name: 'Redis Cache', type: 'cache', status: 'healthy', endpoint: 'redis://cache.freeflow.io:6379', latency: 2, uptime: 99.95, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '3', name: 'API Gateway', type: 'api', status: 'healthy', endpoint: 'https://api.freeflow.io', latency: 45, uptime: 99.98, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '4', name: 'File Storage', type: 'storage', status: 'warning', endpoint: 's3://freeflow-assets', latency: 85, uptime: 99.85, lastChecked: '2024-12-23T10:28:00Z' },
  { id: '5', name: 'Message Queue', type: 'queue', status: 'healthy', endpoint: 'amqp://mq.freeflow.io:5672', latency: 8, uptime: 99.92, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '6', name: 'Analytics DB', type: 'database', status: 'healthy', endpoint: 'clickhouse://analytics.freeflow.io:8123', latency: 25, uptime: 99.90, lastChecked: '2024-12-23T10:30:00Z' },
]

const mockAdminUsers: AdminUser[] = [
  { id: '1', name: 'John Smith', email: 'john@freeflow.io', role: 'super_admin', status: 'active', lastLogin: '2024-12-23T09:15:00Z', mfaEnabled: true, permissions: ['all'] },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@freeflow.io', role: 'admin', status: 'active', lastLogin: '2024-12-23T08:45:00Z', mfaEnabled: true, permissions: ['users', 'settings', 'reports'] },
  { id: '3', name: 'Mike Chen', email: 'mike@freeflow.io', role: 'moderator', status: 'active', lastLogin: '2024-12-22T16:30:00Z', mfaEnabled: false, permissions: ['users.read', 'content.moderate'] },
  { id: '4', name: 'Emily Davis', email: 'emily@freeflow.io', role: 'viewer', status: 'pending', lastLogin: '', mfaEnabled: false, permissions: ['dashboard.view', 'reports.view'] },
  { id: '5', name: 'Alex Thompson', email: 'alex@freeflow.io', role: 'admin', status: 'suspended', lastLogin: '2024-12-20T11:00:00Z', mfaEnabled: true, permissions: ['users', 'settings'] },
]

const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'user.login', actor: 'john@freeflow.io', resource: 'auth', details: 'Successful login via SSO', ipAddress: '192.168.1.100', timestamp: '2024-12-23T10:25:00Z', severity: 'info' },
  { id: '2', action: 'settings.update', actor: 'sarah@freeflow.io', resource: 'billing.stripe_key', details: 'Updated Stripe API key', ipAddress: '192.168.1.105', timestamp: '2024-12-23T10:20:00Z', severity: 'warning' },
  { id: '3', action: 'user.create', actor: 'john@freeflow.io', resource: 'users', details: 'Created new admin user: emily@freeflow.io', ipAddress: '192.168.1.100', timestamp: '2024-12-23T10:15:00Z', severity: 'info' },
  { id: '4', action: 'permission.revoke', actor: 'system', resource: 'users.alex', details: 'Auto-suspended due to failed MFA attempts', ipAddress: 'system', timestamp: '2024-12-23T10:10:00Z', severity: 'critical' },
  { id: '5', action: 'backup.complete', actor: 'system', resource: 'database', details: 'Daily backup completed successfully', ipAddress: 'system', timestamp: '2024-12-23T06:00:00Z', severity: 'info' },
  { id: '6', action: 'api.rate_limit', actor: 'api-key-xyz123', resource: 'api/v2/users', details: 'Rate limit exceeded (1000/min)', ipAddress: '203.45.67.89', timestamp: '2024-12-23T05:45:00Z', severity: 'warning' },
  { id: '7', action: 'deploy.success', actor: 'ci/cd', resource: 'production', details: 'Deployed v2.4.1 to production', ipAddress: 'github-actions', timestamp: '2024-12-23T04:00:00Z', severity: 'info' },
]

const mockMetrics: SystemMetric[] = [
  { name: 'CPU Usage', value: 42, unit: '%', trend: 'stable', status: 'good' },
  { name: 'Memory Usage', value: 68, unit: '%', trend: 'up', status: 'warning' },
  { name: 'Disk Usage', value: 55, unit: '%', trend: 'up', status: 'good' },
  { name: 'Network I/O', value: 125, unit: 'MB/s', trend: 'stable', status: 'good' },
  { name: 'Active Connections', value: 1247, unit: '', trend: 'up', status: 'good' },
  { name: 'Request Rate', value: 3420, unit: 'req/min', trend: 'up', status: 'good' },
]

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  moderator: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

const statusColors = {
  healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  offline: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
}

export default function AdminClient({ initialSettings }: { initialSettings: AdminSetting[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [showNewSettingDialog, setShowNewSettingDialog] = useState(false)
  const [showEditSettingDialog, setShowEditSettingDialog] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState<AdminSetting | null>(null)
  const [settingCategoryFilter, setSettingCategoryFilter] = useState('all')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [logSeverityFilter, setLogSeverityFilter] = useState('all')

  const { settings } = useAdminSettings({})
  const displaySettings = settings.length > 0 ? settings : initialSettings

  // Calculate stats
  const overallHealth = mockResources.filter(r => r.status === 'healthy').length / mockResources.length * 100
  const activeUsers = mockAdminUsers.filter(u => u.status === 'active').length
  const criticalLogs = mockAuditLogs.filter(l => l.severity === 'critical').length

  const filteredSettings = useMemo(() => {
    return displaySettings.filter(s => {
      const matchesSearch = searchQuery === '' ||
        s.setting_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.setting_key.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = settingCategoryFilter === 'all' || s.setting_category === settingCategoryFilter
      return matchesSearch && matchesCategory
    })
  }, [displaySettings, searchQuery, settingCategoryFilter])

  const filteredUsers = useMemo(() => {
    return mockAdminUsers.filter(u => {
      const matchesSearch = searchQuery === '' ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
      return matchesSearch && matchesRole
    })
  }, [searchQuery, userRoleFilter])

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(l => {
      const matchesSearch = searchQuery === '' ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.actor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity = logSeverityFilter === 'all' || l.severity === logSeverityFilter
      return matchesSearch && matchesSeverity
    })
  }, [searchQuery, logSeverityFilter])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-5 h-5" />
      case 'cache': return <MemoryStick className="w-5 h-5" />
      case 'api': return <Globe className="w-5 h-5" />
      case 'storage': return <HardDrive className="w-5 h-5" />
      case 'queue': return <Layers className="w-5 h-5" />
      default: return <Box className="w-5 h-5" />
    }
  }

  const categories = [...new Set(displaySettings.map(s => s.setting_category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Retool-level administration and system management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
              <Terminal className="w-4 h-4" />
              Console
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2">
          {['System Monitoring', 'User Management', 'RBAC', 'Audit Logs', 'Resource Management', 'Settings CRUD'].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{overallHealth.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{mockResources.filter(r => r.status === 'healthy').length}/{mockResources.length} services</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Admins</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{activeUsers}</p>
                <div className="flex items-center gap-1 mt-2 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{mockAdminUsers.length} total users</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <UserCog className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Settings</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{displaySettings.length}</p>
                <div className="flex items-center gap-1 mt-2 text-purple-600">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">{displaySettings.filter(s => s.is_encrypted).length} encrypted</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Alerts</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{criticalLogs}</p>
                <div className="flex items-center gap-1 mt-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Critical events</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-4 py-2">
              <Server className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-4 py-2">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-4 py-2">
              <FileText className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockMetrics.map((metric) => (
                <div key={metric.name} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">{metric.name}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-2xl font-bold ${metric.status === 'good' ? 'text-gray-900 dark:text-white' : metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {metric.value}
                    </span>
                    <span className="text-xs text-gray-500 mb-1">{metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' && <ChevronRight className="w-3 h-3 text-green-500 rotate-[-90deg]" />}
                    {metric.trend === 'down' && <ChevronRight className="w-3 h-3 text-red-500 rotate-90" />}
                    {metric.trend === 'stable' && <span className="w-3 h-0.5 bg-gray-400 rounded" />}
                    <span className="text-xs text-gray-500">{metric.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                    <button className="text-sm text-slate-600 hover:text-slate-700 font-medium">View All</button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockAuditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            log.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                            log.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {log.severity === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                             log.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                             <Activity className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                            <p className="text-xs text-gray-400 mt-1">{log.actor} • {formatDate(log.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Service Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${overallHealth === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {overallHealth === 100 ? 'All Systems Operational' : 'Partial Outage'}
                    </span>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockResources.map((resource) => (
                      <div key={resource.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              resource.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30' :
                              resource.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {getResourceIcon(resource.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.latency}ms latency</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[resource.status]}`}>
                              {resource.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{resource.uptime}% uptime</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Users</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Roles</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => setShowNewUserDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.mfaEnabled ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <ShieldCheck className="w-4 h-4" />
                              <span className="text-xs">Enabled</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Shield className="w-4 h-4" />
                              <span className="text-xs">Disabled</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <Key className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockResources.map((resource) => (
                <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      resource.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30' :
                      resource.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[resource.status]}`}>
                      {resource.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{resource.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 font-mono truncate">{resource.endpoint}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Latency</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{resource.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-lg font-semibold text-green-600">{resource.uptime}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500">Last checked: {formatDate(resource.lastChecked)}</p>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search settings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <select
                      value={settingCategoryFilter}
                      onChange={(e) => setSettingCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowNewSettingDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Setting
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredSettings.map((setting) => (
                  <div key={setting.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${setting.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {setting.status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {setting.scope}
                          </span>
                          {setting.is_encrypted && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              <Lock className="w-3 h-3" />
                              Encrypted
                            </span>
                          )}
                          {setting.is_required && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              Required
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{setting.setting_name}</h4>
                        <p className="text-sm text-gray-500 mt-1 font-mono">{setting.setting_key}</p>
                        {setting.description && (
                          <p className="text-sm text-gray-500 mt-2">{setting.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{setting.setting_category} • {setting.value_type} • v{setting.version}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSetting(setting)
                            setShowEditSettingDialog(true)
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <select
                      value={logSeverityFilter}
                      onChange={(e) => setLogSeverityFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Severity</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              log.severity === 'critical' ? 'bg-red-500' :
                              log.severity === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.actor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.resource}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* New User Dialog */}
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Admin User</DialogTitle>
              <DialogDescription>Create a new admin user with specific permissions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" placeholder="John Doe" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" placeholder="john@company.com" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="viewer">Viewer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="require-mfa" className="rounded" />
                <label htmlFor="require-mfa" className="text-sm text-gray-700 dark:text-gray-300">Require MFA</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowNewUserDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={() => setShowNewUserDialog(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Create User
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Setting Dialog */}
        <Dialog open={showNewSettingDialog} onOpenChange={setShowNewSettingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Setting</DialogTitle>
              <DialogDescription>Create a new system configuration setting.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Setting Name</label>
                <input type="text" placeholder="API Rate Limit" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Setting Key</label>
                <input type="text" placeholder="api.rate_limit" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option>API</option>
                  <option>Security</option>
                  <option>Billing</option>
                  <option>Notifications</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value Type</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option>string</option>
                  <option>number</option>
                  <option>boolean</option>
                  <option>json</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
                <input type="text" placeholder="Enter value" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="encrypted" className="rounded" />
                  <label htmlFor="encrypted" className="text-sm text-gray-700 dark:text-gray-300">Encrypted</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="required" className="rounded" />
                  <label htmlFor="required" className="text-sm text-gray-700 dark:text-gray-300">Required</label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowNewSettingDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={() => setShowNewSettingDialog(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Create Setting
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
