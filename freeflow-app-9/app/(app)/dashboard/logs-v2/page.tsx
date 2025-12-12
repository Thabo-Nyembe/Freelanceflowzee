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
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Search,
  Download,
  Filter,
  Clock,
  Server,
  Code,
  Database,
  Zap
} from 'lucide-react'

/**
 * Logs V2 - Groundbreaking System Logs & Monitoring
 * Showcases log aggregation, filtering, and real-time monitoring
 */
export default function LogsV2() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'error' | 'warn' | 'info' | 'debug'>('all')
  const [selectedSource, setSelectedSource] = useState<'all' | 'api' | 'database' | 'auth' | 'worker'>('all')

  const stats = [
    { label: 'Total Logs', value: '2.4M', change: 42.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Error Rate', value: '0.02%', change: -35.2, icon: <XCircle className="w-5 h-5" /> },
    { label: 'Avg Response', value: '124ms', change: -18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Sources', value: '24', change: 12.5, icon: <Server className="w-5 h-5" /> }
  ]

  const logs = [
    {
      id: '1',
      timestamp: '2024-02-12 14:32:45.123',
      level: 'error',
      source: 'api',
      message: 'Database connection timeout after 30 seconds',
      details: 'PostgreSQL server at db.example.com:5432 unreachable',
      requestId: 'req_a8f9d2e1b4c7',
      userId: 'user_847',
      statusCode: 500
    },
    {
      id: '2',
      timestamp: '2024-02-12 14:32:44.892',
      level: 'warn',
      source: 'auth',
      message: 'Multiple failed login attempts detected',
      details: 'IP: 203.45.67.89 - 5 failed attempts in 60 seconds',
      requestId: 'req_b1c2d3e4f5a6',
      userId: 'user_124',
      statusCode: 401
    },
    {
      id: '3',
      timestamp: '2024-02-12 14:32:43.567',
      level: 'info',
      source: 'api',
      message: 'User profile updated successfully',
      details: 'Updated fields: email, phone_number',
      requestId: 'req_c4d5e6f7a8b9',
      userId: 'user_456',
      statusCode: 200
    },
    {
      id: '4',
      timestamp: '2024-02-12 14:32:42.234',
      level: 'debug',
      source: 'worker',
      message: 'Background job started: email_notification',
      details: 'Job ID: job_847abc - Queue: default',
      requestId: 'req_d7e8f9a0b1c2',
      userId: null,
      statusCode: null
    },
    {
      id: '5',
      timestamp: '2024-02-12 14:32:41.901',
      level: 'error',
      source: 'database',
      message: 'Query execution timeout',
      details: 'Query took 45.2s to execute (timeout: 30s)',
      requestId: 'req_e1f2a3b4c5d6',
      userId: 'user_247',
      statusCode: 500
    },
    {
      id: '6',
      timestamp: '2024-02-12 14:32:40.678',
      level: 'info',
      source: 'api',
      message: 'API request completed',
      details: 'GET /api/v1/users - 200 OK - 45ms',
      requestId: 'req_f3a4b5c6d7e8',
      userId: 'user_892',
      statusCode: 200
    },
    {
      id: '7',
      timestamp: '2024-02-12 14:32:39.345',
      level: 'warn',
      source: 'api',
      message: 'Rate limit approaching threshold',
      details: 'User has made 950/1000 requests this hour',
      requestId: 'req_a5b6c7d8e9f0',
      userId: 'user_673',
      statusCode: 429
    },
    {
      id: '8',
      timestamp: '2024-02-12 14:32:38.012',
      level: 'debug',
      source: 'auth',
      message: 'JWT token validated',
      details: 'Token expiry: 2024-02-13 14:32:00',
      requestId: 'req_b7c8d9e0f1a2',
      userId: 'user_124',
      statusCode: null
    }
  ]

  const logLevels = [
    { level: 'error', count: 487, percentage: 0.02, color: 'from-red-500 to-orange-500', icon: <XCircle className="w-5 h-5" /> },
    { level: 'warn', count: 2847, percentage: 0.12, color: 'from-yellow-500 to-amber-500', icon: <AlertTriangle className="w-5 h-5" /> },
    { level: 'info', count: 847000, percentage: 35.29, color: 'from-blue-500 to-cyan-500', icon: <Info className="w-5 h-5" /> },
    { level: 'debug', count: 1549666, percentage: 64.57, color: 'from-green-500 to-emerald-500', icon: <Code className="w-5 h-5" /> }
  ]

  const logSources = [
    { name: 'API Server', source: 'api', logs: 1247000, errors: 284 },
    { name: 'Database', source: 'database', logs: 847000, errors: 142 },
    { name: 'Authentication', source: 'auth', logs: 234000, errors: 47 },
    { name: 'Background Workers', source: 'worker', logs: 72000, errors: 14 }
  ]

  const recentAlerts = [
    { icon: <XCircle className="w-5 h-5" />, title: 'High error rate', description: 'Database connection errors spiked', time: '5 minutes ago', status: 'error' as const },
    { icon: <AlertTriangle className="w-5 h-5" />, title: 'Rate limit warning', description: 'Multiple users approaching limits', time: '15 minutes ago', status: 'warning' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'System recovered', description: 'API server back to normal', time: '1 hour ago', status: 'success' as const },
    { icon: <Info className="w-5 h-5" />, title: 'Deployment completed', description: 'New version deployed successfully', time: '2 hours ago', status: 'info' as const }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-700'
      case 'warn': return 'bg-yellow-100 text-yellow-700'
      case 'info': return 'bg-blue-100 text-blue-700'
      case 'debug': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4" />
      case 'warn': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <Info className="w-4 h-4" />
      case 'debug': return <Code className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const maxCount = Math.max(...logLevels.map(l => l.count))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-zinc-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-gray-600" />
              System Logs
            </h1>
            <p className="text-muted-foreground">Real-time log aggregation and monitoring</p>
          </div>
          <GradientButton from="gray" to="slate" onClick={() => console.log('Export')}>
            <Download className="w-5 h-5 mr-2" />
            Export Logs
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<FileText />} title="All Logs" description="View all" onClick={() => console.log('All')} />
          <BentoQuickAction icon={<XCircle />} title="Errors" description="Error logs" onClick={() => console.log('Errors')} />
          <BentoQuickAction icon={<Search />} title="Search" description="Query logs" onClick={() => console.log('Search')} />
          <BentoQuickAction icon={<Filter />} title="Filters" description="Custom filters" onClick={() => console.log('Filters')} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Level:</span>
              <PillButton variant={selectedLevel === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('all')}>
                All
              </PillButton>
              <PillButton variant={selectedLevel === 'error' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('error')}>
                <XCircle className="w-4 h-4 mr-2" />
                Error
              </PillButton>
              <PillButton variant={selectedLevel === 'warn' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('warn')}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Warn
              </PillButton>
              <PillButton variant={selectedLevel === 'info' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('info')}>
                Info
              </PillButton>
              <PillButton variant={selectedLevel === 'debug' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('debug')}>
                Debug
              </PillButton>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Recent Logs</h3>
              <div className="space-y-2 font-mono text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md flex items-center gap-1 ${getLevelColor(log.level)}`}>
                            {getLevelIcon(log.level)}
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-muted-foreground">{log.timestamp}</span>
                          <span className="px-2 py-1 rounded-md bg-muted">{log.source}</span>
                        </div>
                        <ModernButton variant="ghost" size="sm" onClick={() => console.log('View', log.id)}>
                          View
                        </ModernButton>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      <p className="text-muted-foreground">{log.details}</p>
                      <div className="flex items-center gap-4 text-muted-foreground pt-2 border-t">
                        <span>Request: {log.requestId}</span>
                        {log.userId && <span>User: {log.userId}</span>}
                        {log.statusCode && <span className={log.statusCode >= 400 ? 'text-red-600' : 'text-green-600'}>
                          HTTP {log.statusCode}
                        </span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Log Levels Distribution</h3>
              <div className="space-y-4">
                {logLevels.map((level) => {
                  const countPercent = (level.count / maxCount) * 100

                  return (
                    <div key={level.level} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${level.color} flex items-center justify-center text-white`}>
                            {level.icon}
                          </div>
                          <div>
                            <p className="font-semibold capitalize">{level.level}</p>
                            <p className="text-xs text-muted-foreground">{level.percentage.toFixed(2)}% of total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{level.count.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">entries</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${level.color} transition-all duration-300`}
                          style={{ width: `${countPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Log Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logSources.map((source) => (
                  <div key={source.source} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-muted-foreground" />
                        <h4 className="font-semibold">{source.name}</h4>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-md bg-muted">{source.source}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Logs</p>
                        <p className="font-semibold">{(source.logs / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Errors</p>
                        <p className="font-semibold text-red-600">{source.errors}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Alerts" activities={recentAlerts} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Log Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Logs/Second" value="2.4K" change={42.3} />
                <MiniKPI label="Error Rate" value="0.02%" change={-35.2} />
                <MiniKPI label="Storage Used" value="847GB" change={28.5} />
                <MiniKPI label="Retention" value="30 days" change={0} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Live')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Live Tail
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Query')}>
                  <Search className="w-4 h-4 mr-2" />
                  Advanced Query
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Alert')}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Create Alert
                </ModernButton>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Source Filters</h3>
              <div className="space-y-2">
                <PillButton variant={selectedSource === 'all' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('all')}>
                  All Sources
                </PillButton>
                <PillButton variant={selectedSource === 'api' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('api')}>
                  API Server
                </PillButton>
                <PillButton variant={selectedSource === 'database' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('database')}>
                  <Database className="w-4 h-4 mr-2" />
                  Database
                </PillButton>
                <PillButton variant={selectedSource === 'auth' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('auth')}>
                  Authentication
                </PillButton>
                <PillButton variant={selectedSource === 'worker' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('worker')}>
                  Workers
                </PillButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
