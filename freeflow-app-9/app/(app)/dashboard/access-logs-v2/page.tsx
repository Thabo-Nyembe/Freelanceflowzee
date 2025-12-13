'use client'

import { useState } from 'react'
import {
  Eye,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  User,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type AccessStatus = 'success' | 'failed' | 'blocked' | 'suspicious'
type AccessType = 'login' | 'api' | 'admin' | 'file-access' | 'database' | 'system'
type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'api-client'

interface AccessLog {
  id: string
  timestamp: string
  user: string
  email: string
  type: AccessType
  status: AccessStatus
  ipAddress: string
  location: string
  device: DeviceType
  browser: string
  resource: string
  method: string
  statusCode: number
  duration: number
  userAgent: string
}

export default function AccessLogsPage() {
  const [viewMode, setViewMode] = useState<'all' | AccessStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | AccessType>('all')

  const logs: AccessLog[] = [
    {
      id: 'LOG-2847',
      timestamp: '2024-01-15 15:30:45',
      user: 'John Doe',
      email: 'john.doe@example.com',
      type: 'login',
      status: 'success',
      ipAddress: '192.168.1.100',
      location: 'San Francisco, CA, USA',
      device: 'desktop',
      browser: 'Chrome 120.0',
      resource: '/dashboard',
      method: 'POST',
      statusCode: 200,
      duration: 234,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'
    },
    {
      id: 'LOG-2848',
      timestamp: '2024-01-15 15:28:12',
      user: 'Jane Smith',
      email: 'jane.smith@example.com',
      type: 'api',
      status: 'success',
      ipAddress: '203.0.113.45',
      location: 'London, UK',
      device: 'api-client',
      browser: 'API Client',
      resource: '/api/v1/users',
      method: 'GET',
      statusCode: 200,
      duration: 89,
      userAgent: 'axios/1.6.0'
    },
    {
      id: 'LOG-2849',
      timestamp: '2024-01-15 15:25:33',
      user: 'Admin User',
      email: 'admin@example.com',
      type: 'admin',
      status: 'success',
      ipAddress: '192.168.1.50',
      location: 'New York, NY, USA',
      device: 'desktop',
      browser: 'Firefox 121.0',
      resource: '/admin/settings',
      method: 'PUT',
      statusCode: 200,
      duration: 456,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) Firefox/121.0'
    },
    {
      id: 'LOG-2850',
      timestamp: '2024-01-15 15:20:18',
      user: 'Unknown',
      email: 'attacker@malicious.com',
      type: 'login',
      status: 'failed',
      ipAddress: '198.51.100.23',
      location: 'Unknown',
      device: 'desktop',
      browser: 'Chrome 119.0',
      resource: '/login',
      method: 'POST',
      statusCode: 401,
      duration: 123,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/119.0'
    },
    {
      id: 'LOG-2851',
      timestamp: '2024-01-15 15:18:45',
      user: 'Mike Johnson',
      email: 'mike.j@example.com',
      type: 'file-access',
      status: 'success',
      ipAddress: '192.168.1.120',
      location: 'Austin, TX, USA',
      device: 'mobile',
      browser: 'Safari 17.0',
      resource: '/files/document.pdf',
      method: 'GET',
      statusCode: 200,
      duration: 678,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1'
    },
    {
      id: 'LOG-2852',
      timestamp: '2024-01-15 15:15:22',
      user: 'Unknown',
      email: '',
      type: 'api',
      status: 'blocked',
      ipAddress: '203.0.113.99',
      location: 'Unknown',
      device: 'api-client',
      browser: 'Bot',
      resource: '/api/v1/admin',
      method: 'POST',
      statusCode: 403,
      duration: 12,
      userAgent: 'bot/1.0'
    },
    {
      id: 'LOG-2853',
      timestamp: '2024-01-15 15:12:56',
      user: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      type: 'database',
      status: 'success',
      ipAddress: '192.168.1.75',
      location: 'Seattle, WA, USA',
      device: 'desktop',
      browser: 'Chrome 120.0',
      resource: '/db/query',
      method: 'POST',
      statusCode: 200,
      duration: 1234,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0'
    },
    {
      id: 'LOG-2854',
      timestamp: '2024-01-15 15:10:33',
      user: 'Unknown',
      email: 'suspect@suspicious.net',
      type: 'login',
      status: 'suspicious',
      ipAddress: '198.51.100.50',
      location: 'Unknown',
      device: 'desktop',
      browser: 'Chrome 118.0',
      resource: '/login',
      method: 'POST',
      statusCode: 200,
      duration: 234,
      userAgent: 'Mozilla/5.0 (Windows NT 6.1) Chrome/118.0'
    }
  ]

  const filteredLogs = logs.filter(log => {
    if (viewMode !== 'all' && log.status !== viewMode) return false
    if (typeFilter !== 'all' && log.type !== typeFilter) return false
    return true
  })

  const totalLogs = logs.length
  const successfulAccess = logs.filter(l => l.status === 'success').length
  const failedAccess = logs.filter(l => l.status === 'failed').length
  const blockedAccess = logs.filter(l => l.status === 'blocked').length

  const getStatusColor = (status: AccessStatus) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'blocked': return 'text-orange-600 bg-orange-50'
      case 'suspicious': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: AccessType) => {
    switch (type) {
      case 'login': return 'text-blue-600 bg-blue-50'
      case 'api': return 'text-purple-600 bg-purple-50'
      case 'admin': return 'text-red-600 bg-red-50'
      case 'file-access': return 'text-green-600 bg-green-50'
      case 'database': return 'text-orange-600 bg-orange-50'
      case 'system': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: AccessStatus) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
      case 'blocked': return <Lock className="w-4 h-4 text-orange-600" />
      case 'suspicious': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default: return <Eye className="w-4 h-4 text-gray-600" />
    }
  }

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-3 h-3" />
      case 'mobile': return <Smartphone className="w-3 h-3" />
      case 'tablet': return <Smartphone className="w-3 h-3" />
      case 'api-client': return <Globe className="w-3 h-3" />
      default: return <Monitor className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-800 to-teal-900 bg-clip-text text-transparent mb-2">
            Access Logs
          </h1>
          <p className="text-slate-600">Monitor user access, authentication, and system entry points</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Access',
              value: totalLogs.toString(),
              icon: Eye,
              trend: { value: 12, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Successful',
              value: successfulAccess.toString(),
              icon: CheckCircle2,
              trend: { value: 8, isPositive: true },
              color: 'green'
            },
            {
              label: 'Failed',
              value: failedAccess.toString(),
              icon: XCircle,
              trend: { value: 15, isPositive: false },
              color: 'red'
            },
            {
              label: 'Blocked',
              value: blockedAccess.toString(),
              icon: Lock,
              trend: { value: 5, isPositive: true },
              color: 'orange'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'Search Logs',
              description: 'Advanced search',
              icon: Search,
              gradient: 'from-blue-500 to-cyan-600',
              onClick: () => console.log('Search')
            },
            {
              title: 'Export Logs',
              description: 'Download data',
              icon: Download,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Export')
            },
            {
              title: 'Security Alerts',
              description: 'View threats',
              icon: AlertTriangle,
              gradient: 'from-red-500 to-orange-600',
              onClick: () => console.log('Alerts')
            },
            {
              title: 'Analytics',
              description: 'Access patterns',
              icon: BarChart3,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'IP Whitelist',
              description: 'Manage IPs',
              icon: Shield,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Whitelist')
            },
            {
              title: 'User Sessions',
              description: 'Active users',
              icon: User,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Sessions')
            },
            {
              title: 'Settings',
              description: 'Configure logs',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Refresh',
              description: 'Update logs',
              icon: RefreshCw,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Refresh')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Access"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Success"
              isActive={viewMode === 'success'}
              onClick={() => setViewMode('success')}
            />
            <PillButton
              label="Failed"
              isActive={viewMode === 'failed'}
              onClick={() => setViewMode('failed')}
            />
            <PillButton
              label="Blocked"
              isActive={viewMode === 'blocked'}
              onClick={() => setViewMode('blocked')}
            />
            <PillButton
              label="Suspicious"
              isActive={viewMode === 'suspicious'}
              onClick={() => setViewMode('suspicious')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Login"
              isActive={typeFilter === 'login'}
              onClick={() => setTypeFilter('login')}
            />
            <PillButton
              label="API"
              isActive={typeFilter === 'api'}
              onClick={() => setTypeFilter('api')}
            />
            <PillButton
              label="Admin"
              isActive={typeFilter === 'admin'}
              onClick={() => setTypeFilter('admin')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Access Logs List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(log.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{log.user}</h3>
                        {log.email && (
                          <span className="text-xs text-slate-500">{log.email}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{log.resource}</p>
                      <p className="text-xs text-slate-500">Log ID: {log.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{log.timestamp}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">IP Address</p>
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-mono text-slate-900">{log.ipAddress}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Location</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{log.location}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Device</p>
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(log.device)}
                      <span className="text-sm text-slate-700 capitalize">{log.device}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Browser</p>
                    <p className="text-sm font-medium text-slate-900">{log.browser}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Method</p>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {log.method}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status Code</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.statusCode === 200 ? 'bg-green-50 text-green-700' :
                      log.statusCode >= 400 ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {log.statusCode}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">User Agent</p>
                  <p className="text-xs text-slate-600 font-mono truncate">{log.userAgent}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Block IP
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Flag
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Successful Access */}
            <MiniKPI
              label="Success Rate"
              value={`${((successfulAccess / totalLogs) * 100).toFixed(0)}%`}
              icon={CheckCircle2}
              trend={{ value: 8, isPositive: true }}
              className="bg-gradient-to-br from-green-500 to-emerald-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Access"
              activities={[
                {
                  id: '1',
                  title: 'John Doe logged in',
                  description: 'San Francisco, CA',
                  timestamp: '2 minutes ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'API access successful',
                  description: 'London, UK',
                  timestamp: '5 minutes ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Login attempt failed',
                  description: 'Unknown location',
                  timestamp: '12 minutes ago',
                  type: 'error'
                },
                {
                  id: '4',
                  title: 'Bot access blocked',
                  description: 'Suspicious activity',
                  timestamp: '18 minutes ago',
                  type: 'warning'
                }
              ]}
            />

            {/* Top Locations */}
            <RankingList
              title="Top Locations"
              items={[
                { label: 'San Francisco', value: '32%', rank: 1 },
                { label: 'New York', value: '24%', rank: 2 },
                { label: 'London', value: '18%', rank: 3 },
                { label: 'Austin', value: '15%', rank: 4 },
                { label: 'Seattle', value: '11%', rank: 5 }
              ]}
            />

            {/* Security Score */}
            <ProgressCard
              title="Security Score"
              progress={87}
              subtitle="Based on access patterns"
              color="blue"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
