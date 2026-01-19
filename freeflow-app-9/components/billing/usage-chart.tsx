'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts'
import {
  Activity,
  HardDrive,
  Cpu,
  Video,
  Users,
  Zap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UsageMetric {
  name: string
  key: string
  current: number
  limit: number
  unit: string
  icon: React.ReactNode
  color: string
  trend?: number
}

interface UsageHistoryPoint {
  date: string
  api_calls?: number
  storage_gb?: number
  ai_tokens?: number
  video_minutes?: number
  collaboration_minutes?: number
  team_members?: number
}

export function UsageChart() {
  const [metrics, setMetrics] = useState<UsageMetric[]>([])
  const [history, setHistory] = useState<UsageHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('api_calls')
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchUsageData()
  }, [timeRange])

  const fetchUsageData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/billing/usage?range=${timeRange}`)
      if (res.ok) {
        const data = await res.json()

        // Set current metrics
        setMetrics([
          {
            name: 'API Calls',
            key: 'api_calls',
            current: data.usage?.api_calls || 0,
            limit: data.limits?.api_calls || 10000,
            unit: 'calls',
            icon: <Activity className="h-4 w-4" />,
            color: '#3b82f6',
            trend: data.trends?.api_calls || 0
          },
          {
            name: 'Storage',
            key: 'storage_gb',
            current: data.usage?.storage_gb || 0,
            limit: data.limits?.storage_gb || 10,
            unit: 'GB',
            icon: <HardDrive className="h-4 w-4" />,
            color: '#10b981',
            trend: data.trends?.storage_gb || 0
          },
          {
            name: 'AI Tokens',
            key: 'ai_tokens',
            current: data.usage?.ai_tokens || 0,
            limit: data.limits?.ai_tokens || 100000,
            unit: 'tokens',
            icon: <Cpu className="h-4 w-4" />,
            color: '#8b5cf6',
            trend: data.trends?.ai_tokens || 0
          },
          {
            name: 'Video Minutes',
            key: 'video_minutes',
            current: data.usage?.video_minutes || 0,
            limit: data.limits?.video_minutes || 60,
            unit: 'min',
            icon: <Video className="h-4 w-4" />,
            color: '#f59e0b',
            trend: data.trends?.video_minutes || 0
          },
          {
            name: 'Collaboration',
            key: 'collaboration_minutes',
            current: data.usage?.collaboration_minutes || 0,
            limit: data.limits?.collaboration_minutes || 1000,
            unit: 'min',
            icon: <Users className="h-4 w-4" />,
            color: '#ec4899',
            trend: data.trends?.collaboration_minutes || 0
          },
          {
            name: 'Team Members',
            key: 'team_members',
            current: data.usage?.team_members || 1,
            limit: data.limits?.team_members || 5,
            unit: 'users',
            icon: <Users className="h-4 w-4" />,
            color: '#06b6d4',
            trend: 0
          }
        ])

        // Generate mock history data if not provided
        if (data.history?.length > 0) {
          setHistory(data.history)
        } else {
          setHistory(generateMockHistory())
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      toast.error('Failed to load usage data')
    } finally {
      setLoading(false)
    }
  }

  const generateMockHistory = (): UsageHistoryPoint[] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const data: UsageHistoryPoint[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        api_calls: Math.floor(Math.random() * 500) + 100,
        storage_gb: Math.random() * 2 + 3,
        ai_tokens: Math.floor(Math.random() * 5000) + 1000,
        video_minutes: Math.floor(Math.random() * 10) + 2,
        collaboration_minutes: Math.floor(Math.random() * 50) + 10
      })
    }
    return data
  }

  const handleExportUsage = async () => {
    try {
      const res = await fetch('/api/billing/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-usage', range: timeRange })
      })
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `usage-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Usage report exported')
      }
    } catch (error) {
      toast.error('Failed to export usage report')
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Critical' }
    if (percentage >= 75) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Warning' }
    return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Good' }
  }

  const selectedMetricData = metrics.find(m => m.key === selectedMetric)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">Monitor your resource consumption</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchUsageData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportUsage}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Usage Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const percentage = getUsagePercentage(metric.current, metric.limit)
          const status = getUsageStatus(percentage)

          return (
            <Card
              key={metric.key}
              className={cn(
                'cursor-pointer transition-colors',
                selectedMetric === metric.key && 'border-primary'
              )}
              onClick={() => setSelectedMetric(metric.key)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      {metric.icon}
                    </div>
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  </div>
                  {percentage >= 75 && (
                    <AlertTriangle className={cn('h-4 w-4', status.color)} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">
                      {metric.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {metric.limit.toLocaleString()} {metric.unit}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    style={{
                      ['--progress-background' as string]: metric.color
                    }}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary" className={status.bg}>
                      <span className={status.color}>{status.label}</span>
                    </Badge>
                    {metric.trend !== undefined && metric.trend !== 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className={cn(
                          'h-3 w-3',
                          metric.trend > 0 ? 'text-green-500' : 'text-red-500 rotate-180'
                        )} />
                        <span className={metric.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                          {Math.abs(metric.trend)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedMetricData?.name} Usage Over Time</CardTitle>
              <CardDescription>
                Daily usage for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedMetricData?.color || '#3b82f6'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={selectedMetricData?.color || '#3b82f6'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={selectedMetricData?.color || '#3b82f6'}
                      fillOpacity={1}
                      fill="url(#colorUsage)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>Track usage patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="api_calls" name="API Calls" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="ai_tokens" name="AI Tokens" stroke="#8b5cf6" />
                    <Line type="monotone" dataKey="video_minutes" name="Video" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Comparison</CardTitle>
              <CardDescription>Compare usage across different metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="api_calls" name="API Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="video_minutes" name="Video Minutes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Alerts */}
      {metrics.some(m => getUsagePercentage(m.current, m.limit) >= 75) && (
        <Card className="border-amber-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Usage Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics
                .filter(m => getUsagePercentage(m.current, m.limit) >= 75)
                .map(m => {
                  const percentage = getUsagePercentage(m.current, m.limit)
                  return (
                    <div key={m.key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {m.icon}
                        <span className="font-medium">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {m.current.toLocaleString()} / {m.limit.toLocaleString()} {m.unit}
                        </span>
                        <Badge
                          variant="secondary"
                          className={percentage >= 90 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}
                        >
                          {Math.round(percentage)}%
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UsageChart
