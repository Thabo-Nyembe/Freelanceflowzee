'use client'

import { useState } from 'react'
import { useSystemLogs, type SystemLog, type LogLevel, type LogSource } from '@/lib/hooks/use-system-logs'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
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

export default function LogsClient({ initialLogs }: { initialLogs: SystemLog[] }) {
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all')
  const [selectedSource, setSelectedSource] = useState<LogSource | 'all'>('all')
  const { logs, loading, error } = useSystemLogs({ level: selectedLevel, source: selectedSource })

  const displayLogs = logs.length > 0 ? logs : initialLogs

  const stats = [
    { label: 'Total Logs', value: displayLogs.length.toLocaleString(), change: 42.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Error Rate', value: displayLogs.length > 0 ? `${((displayLogs.filter(l => l.log_level === 'error').length / displayLogs.length) * 100).toFixed(2)}%` : '0%', change: -35.2, icon: <XCircle className="w-5 h-5" /> },
    { label: 'Avg Response', value: displayLogs.length > 0 ? `${Math.round(displayLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / displayLogs.length)}ms` : '0ms', change: -18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Sources', value: [...new Set(displayLogs.map(l => l.log_source))].length.toString(), change: 12.5, icon: <Server className="w-5 h-5" /> }
  ]

  const logLevels = [
    { level: 'error' as LogLevel, count: displayLogs.filter(l => l.log_level === 'error').length, color: 'from-red-500 to-orange-500', icon: <XCircle className="w-5 h-5" /> },
    { level: 'warn' as LogLevel, count: displayLogs.filter(l => l.log_level === 'warn').length, color: 'from-yellow-500 to-amber-500', icon: <AlertTriangle className="w-5 h-5" /> },
    { level: 'info' as LogLevel, count: displayLogs.filter(l => l.log_level === 'info').length, color: 'from-blue-500 to-cyan-500', icon: <Info className="w-5 h-5" /> },
    { level: 'debug' as LogLevel, count: displayLogs.filter(l => l.log_level === 'debug').length, color: 'from-green-500 to-emerald-500', icon: <Code className="w-5 h-5" /> }
  ]

  const recentAlerts = displayLogs
    .filter(l => l.log_level === 'error' || l.severity === 'critical')
    .slice(0, 4)
    .map(l => ({
      icon: <XCircle className="w-5 h-5" />,
      title: l.log_level === 'error' ? 'Error logged' : 'Critical event',
      description: l.message.substring(0, 50) + '...',
      time: new Date(l.logged_at).toLocaleString(),
      status: 'error' as const
    }))

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-700'
      case 'warn': return 'bg-yellow-100 text-yellow-700'
      case 'info': return 'bg-blue-100 text-blue-700'
      case 'debug': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4" />
      case 'warn': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <Info className="w-4 h-4" />
      case 'debug': return <Code className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const maxCount = Math.max(...logLevels.map(l => l.count), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
          <BentoQuickAction icon={<FileText />} title="All Logs" description="View all" onClick={() => setSelectedLevel('all')} />
          <BentoQuickAction icon={<XCircle />} title="Errors" description="Error logs" onClick={() => setSelectedLevel('error')} />
          <BentoQuickAction icon={<Search />} title="Search" description="Query logs" onClick={() => console.log('Search')} />
          <BentoQuickAction icon={<Filter />} title="Filters" description="Custom filters" onClick={() => console.log('Filters')} />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Level:</span>
            <PillButton variant={selectedLevel === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('all')}>All</PillButton>
            <PillButton variant={selectedLevel === 'error' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('error')}>
              <XCircle className="w-4 h-4 mr-2" />Error
            </PillButton>
            <PillButton variant={selectedLevel === 'warn' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('warn')}>
              <AlertTriangle className="w-4 h-4 mr-2" />Warn
            </PillButton>
            <PillButton variant={selectedLevel === 'info' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('info')}>Info</PillButton>
            <PillButton variant={selectedLevel === 'debug' ? 'primary' : 'ghost'} onClick={() => setSelectedLevel('debug')}>Debug</PillButton>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Logs</h3>
              <div className="space-y-2 font-mono text-xs">
                {displayLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-md flex items-center gap-1 ${getLevelColor(log.log_level)}`}>
                            {getLevelIcon(log.log_level)}
                            {log.log_level.toUpperCase()}
                          </span>
                          <span className="text-muted-foreground">{new Date(log.logged_at).toLocaleString()}</span>
                          <span className="px-2 py-1 rounded-md bg-muted">{log.log_source}</span>
                        </div>
                        <ModernButton variant="ghost" size="sm" onClick={() => console.log('View', log.id)}>View</ModernButton>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.details && <p className="text-muted-foreground">{log.details}</p>}
                      <div className="flex items-center gap-4 text-muted-foreground pt-2 border-t flex-wrap">
                        {log.request_id && <span>Request: {log.request_id}</span>}
                        {log.actor_email && <span>User: {log.actor_email}</span>}
                        {log.http_status_code && (
                          <span className={log.http_status_code >= 400 ? 'text-red-600' : 'text-green-600'}>
                            HTTP {log.http_status_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {displayLogs.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Logs</h3>
                    <p className="text-muted-foreground">System logs will appear here</p>
                  </div>
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Log Levels Distribution</h3>
              <div className="space-y-4">
                {logLevels.map((level) => {
                  const countPercent = maxCount > 0 ? (level.count / maxCount) * 100 : 0
                  const totalPercent = displayLogs.length > 0 ? (level.count / displayLogs.length) * 100 : 0

                  return (
                    <div key={level.level} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${level.color} flex items-center justify-center text-white`}>
                            {level.icon}
                          </div>
                          <div>
                            <p className="font-semibold capitalize">{level.level}</p>
                            <p className="text-xs text-muted-foreground">{totalPercent.toFixed(2)}% of total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{level.count.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">entries</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${level.color}`} style={{ width: `${countPercent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Alerts" activities={recentAlerts.length > 0 ? recentAlerts : [
              { icon: <CheckCircle className="w-5 h-5" />, title: 'No alerts', description: 'System operating normally', time: 'Now', status: 'success' as const }
            ]} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Log Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Logs/Second" value={displayLogs.length > 0 ? `${(displayLogs.length / 60).toFixed(1)}` : '0'} change={42.3} />
                <MiniKPI label="Error Rate" value={displayLogs.length > 0 ? `${((displayLogs.filter(l => l.log_level === 'error').length / displayLogs.length) * 100).toFixed(2)}%` : '0%'} change={-35.2} />
                <MiniKPI label="Avg Response" value={displayLogs.length > 0 ? `${Math.round(displayLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / displayLogs.length)}ms` : '0ms'} change={-18.7} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Source Filters</h3>
              <div className="space-y-2">
                <PillButton variant={selectedSource === 'all' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('all')}>All Sources</PillButton>
                <PillButton variant={selectedSource === 'api' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('api')}>API Server</PillButton>
                <PillButton variant={selectedSource === 'database' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('database')}>
                  <Database className="w-4 h-4 mr-2" />Database
                </PillButton>
                <PillButton variant={selectedSource === 'auth' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('auth')}>Authentication</PillButton>
                <PillButton variant={selectedSource === 'worker' ? 'primary' : 'ghost'} className="w-full" onClick={() => setSelectedSource('worker')}>Workers</PillButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
